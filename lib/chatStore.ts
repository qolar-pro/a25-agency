// A25 chat conversation persistence — Upstash Redis when configured, an
// in-process Map otherwise. Callers never need to know which backend is
// active; every export is async regardless of backend.
//
// The in-memory fallback is dev-only: it works fine for a single long-lived
// `tsx server.ts` process, but resets on every restart and (critically)
// cannot work on Vercel's serverless functions in production, since each
// invocation may run in a fresh container with no shared memory. Real
// deployments must attach Upstash (UPSTASH_REDIS_REST_URL/TOKEN) for the
// two-way reply flow to work at all.

import { safeWrite } from "./archive/db.js";
import { archiveConversation } from "./archive/store.js";

export interface ChatMessage {
  role: "visitor" | "owner";
  text: string;
  timestamp: number;
}

export interface ConversationRecord {
  conversationId: string;
  visitorName: string;
  visitorEmail: string;
  language?: string; // ISO-style code from Accept-Language header, e.g. "EN", "MK", "DE"
  createdAt: number;
  messages: ChatMessage[];
  // Telegram message IDs are only unique within a single chat, so once
  // notifications can fan out to more than one owner chat (see
  // TELEGRAM_CHAT_ID in chatWidget.ts) each entry must carry its chatId too —
  // otherwise two different chats' unrelated messages could collide on the
  // same numeric ID and misroute a reply to the wrong conversation.
  telegramMessageIds: Array<{ chatId: string; messageId: number }>;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = !!(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback store (local dev only — see note above).
const memoryConversations = new Map<string, ConversationRecord>();
const memoryReplyIndex = new Map<string, string>();
const memoryEmailIndex = new Map<string, string>();

// Conversations self-expire after 3 days of inactivity. The TTL is refreshed
// on every saveConversation (i.e. every new message), so an actively-used
// thread never expires mid-conversation — only genuinely stale ones do.
const CONVERSATION_TTL_SECONDS = 3 * 24 * 60 * 60;

// Normalize emails for indexing so lookups aren't defeated by casing/whitespace.
const normalizeEmail = (email: string) => email.trim().toLowerCase();

let redisClient: any = null;
async function getRedis() {
  if (!redisClient) {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redisClient;
}

const conversationKey = (id: string) => `chat:conv:${id}`;
// Scoped by chatId — message IDs are only unique within a single Telegram
// chat, and TELEGRAM_CHAT_ID can now list more than one owner chat.
const replyIndexKey = (chatId: string | number, telegramMessageId: number) =>
  `chat:tgmsg:${chatId}:${telegramMessageId}`;
const emailIndexKey = (email: string) => `chat:email:${normalizeEmail(email)}`;

export async function getConversation(conversationId: string): Promise<ConversationRecord | null> {
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(conversationKey(conversationId));
    return (value as ConversationRecord) ?? null;
  }
  return memoryConversations.get(conversationId) ?? null;
}

export async function createConversation(
  conversationId: string,
  visitorName: string,
  visitorEmail: string,
  language?: string
): Promise<ConversationRecord> {
  const record: ConversationRecord = {
    conversationId,
    visitorName,
    visitorEmail,
    ...(language ? { language } : {}),
    createdAt: Date.now(),
    messages: [],
    telegramMessageIds: []
  };
  await saveConversation(record);

  // Secondary email → conversationId index so a returning visitor can resume
  // their open thread by email (see getConversationIdByEmail). Most-recent-wins:
  // a repeat inquiry from the same email overwrites the pointer, matching the
  // "one active chat per visitor" assumption. The index shares the same 3-day
  // TTL as the conversation so it self-cleans alongside it.
  if (visitorEmail) {
    if (useUpstash) {
      const redis = await getRedis();
      await redis.set(emailIndexKey(visitorEmail), conversationId, { ex: CONVERSATION_TTL_SECONDS });
    } else {
      memoryEmailIndex.set(normalizeEmail(visitorEmail), conversationId);
    }
  }

  return record;
}

export async function appendMessage(
  conversationId: string,
  message: ChatMessage
): Promise<ConversationRecord | null> {
  const record = await getConversation(conversationId);
  if (!record) return null;
  record.messages.push(message);
  await saveConversation(record);
  return record;
}

export async function recordTelegramMessageMapping(
  chatId: string | number,
  telegramMessageId: number,
  conversationId: string
): Promise<void> {
  if (useUpstash) {
    const redis = await getRedis();
    await redis.set(replyIndexKey(chatId, telegramMessageId), conversationId);
  } else {
    memoryReplyIndex.set(`${chatId}:${telegramMessageId}`, conversationId);
  }

  const record = await getConversation(conversationId);
  if (record) {
    record.telegramMessageIds.push({ chatId: String(chatId), messageId: telegramMessageId });
    await saveConversation(record);
  }
}

export async function getConversationIdByTelegramMessageId(
  chatId: string | number,
  telegramMessageId: number
): Promise<string | null> {
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(replyIndexKey(chatId, telegramMessageId));
    return (value as string) ?? null;
  }
  return memoryReplyIndex.get(`${chatId}:${telegramMessageId}`) ?? null;
}

// Resume-by-email lookup, mirroring getConversationIdByTelegramMessageId.
// Returns the conversationId last associated with this email, or null.
export async function getConversationIdByEmail(email: string): Promise<string | null> {
  if (!email) return null;
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(emailIndexKey(email));
    return (value as string) ?? null;
  }
  return memoryEmailIndex.get(normalizeEmail(email)) ?? null;
}

// Delete a conversation and every index entry that points at it — used by the
// Telegram /close command (see lib/chatReplyWebhook.ts). Fully removes the
// record, its email index pointer, and every Telegram-message reply index it
// accumulated, so a closed conversation leaves nothing dangling in Redis.
export async function deleteConversation(conversationId: string): Promise<boolean> {
  const record = await getConversation(conversationId);
  if (!record) return false;

  if (useUpstash) {
    const redis = await getRedis();
    await redis.del(conversationKey(conversationId));
    if (record.visitorEmail) {
      await redis.del(emailIndexKey(record.visitorEmail));
    }
    for (const { chatId, messageId } of record.telegramMessageIds) {
      await redis.del(replyIndexKey(chatId, messageId));
    }
  } else {
    memoryConversations.delete(conversationId);
    if (record.visitorEmail) {
      memoryEmailIndex.delete(normalizeEmail(record.visitorEmail));
    }
    for (const { chatId, messageId } of record.telegramMessageIds) {
      memoryReplyIndex.delete(`${chatId}:${messageId}`);
    }
  }
  return true;
}

async function saveConversation(record: ConversationRecord): Promise<void> {
  // Write-through to the permanent archive (lib/archive/*). Hooked here rather
  // than at each call site so every path — create, appendMessage, Telegram
  // mapping — is covered by one line. Fail-open: Redis remains the source of
  // truth for the live conversation, and an archive problem must never break a
  // visitor's chat. Note the archive has no TTL, so the transcript outlives the
  // 3-day expiry applied to the Redis copy below.
  void safeWrite("chat conversation", () => archiveConversation(record));

  if (useUpstash) {
    const redis = await getRedis();
    // 3-day TTL, refreshed on every save so active chats never expire
    // mid-conversation — only truly inactive ones age out.
    await redis.set(conversationKey(record.conversationId), record, { ex: CONVERSATION_TTL_SECONDS });
  } else {
    memoryConversations.set(record.conversationId, record);
  }
}
