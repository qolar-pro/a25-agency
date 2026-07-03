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

export interface ChatMessage {
  role: "visitor" | "owner";
  text: string;
  timestamp: number;
}

export interface ConversationRecord {
  conversationId: string;
  visitorName: string;
  visitorEmail: string;
  createdAt: number;
  messages: ChatMessage[];
  telegramMessageIds: number[];
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = !!(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback store (local dev only — see note above).
const memoryConversations = new Map<string, ConversationRecord>();
const memoryReplyIndex = new Map<number, string>();

let redisClient: any = null;
async function getRedis() {
  if (!redisClient) {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redisClient;
}

const conversationKey = (id: string) => `chat:conv:${id}`;
const replyIndexKey = (telegramMessageId: number) => `chat:tgmsg:${telegramMessageId}`;

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
  visitorEmail: string
): Promise<ConversationRecord> {
  const record: ConversationRecord = {
    conversationId,
    visitorName,
    visitorEmail,
    createdAt: Date.now(),
    messages: [],
    telegramMessageIds: []
  };
  await saveConversation(record);
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
  telegramMessageId: number,
  conversationId: string
): Promise<void> {
  if (useUpstash) {
    const redis = await getRedis();
    await redis.set(replyIndexKey(telegramMessageId), conversationId);
  } else {
    memoryReplyIndex.set(telegramMessageId, conversationId);
  }

  const record = await getConversation(conversationId);
  if (record) {
    record.telegramMessageIds.push(telegramMessageId);
    await saveConversation(record);
  }
}

export async function getConversationIdByTelegramMessageId(
  telegramMessageId: number
): Promise<string | null> {
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(replyIndexKey(telegramMessageId));
    return (value as string) ?? null;
  }
  return memoryReplyIndex.get(telegramMessageId) ?? null;
}

async function saveConversation(record: ConversationRecord): Promise<void> {
  if (useUpstash) {
    const redis = await getRedis();
    await redis.set(conversationKey(record.conversationId), record);
  } else {
    memoryConversations.set(record.conversationId, record);
  }
}
