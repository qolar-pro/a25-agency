// A25 order tracking persistence — Upstash Redis when configured, an
// in-process Map otherwise. Deliberately mirrors lib/chatStore.ts's shape:
// same backend switch, same in-memory dev fallback, same key-builder style,
// same 3-day TTL approach used for chat expiry — so there's one storage
// convention across the codebase, not two.
//
// Boris drives orders entirely from Telegram (see lib/chatReplyWebhook.ts):
//   /order <email> started [LANG]      → createOrder
//   /order update <email> <status>     → updateOrderStatus
// The client gets an unguessable /track/<token> link. On the transition to
// `done`, the caller emails the client and TTLs both the order record and its
// email index to 3 days so the whole thing self-deletes.
//
// The in-memory fallback is dev-only (same caveat as chatStore.ts): it resets
// on restart and cannot work across serverless invocations — real deployments
// must attach Upstash for the Telegram → track-page flow to work at all.

import type { Language } from "./languageDetect.js";

// Status lifecycle. `started` is the initial state at createOrder; the four
// updatable statuses match the /order update contract (pending / accepted /
// processing / done).
export type OrderStatus = "started" | "pending" | "accepted" | "processing" | "done";

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: number;
}

export interface OrderRecord {
  token: string;
  email: string;
  status: OrderStatus;
  history: OrderStatusEvent[];
  // Optional manual language override captured on createOrder (the trailing
  // [LANG] tag on `/order <email> started [LANG]`). Highest-priority source
  // when picking the completion-email language — see lib/chatReplyWebhook.ts.
  language?: Language;
  createdAt: number;
  doneAt?: number;
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = !!(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback store (local dev only — see note above).
const memoryOrders = new Map<string, OrderRecord>();
const memoryEmailIndex = new Map<string, string>();

// On completion, both the order and its email index self-expire after 3 days
// (same window and pattern as chat expiry in lib/chatStore.ts). Only applied
// at the `done` transition — an in-flight order never expires.
const DONE_TTL_SECONDS = 3 * 24 * 60 * 60;

// Normalize emails for indexing so lookups aren't defeated by casing/whitespace
// (matches lib/chatStore.ts's normalizeEmail).
const normalizeEmail = (email: string) => email.trim().toLowerCase();

let redisClient: any = null;
async function getRedis() {
  if (!redisClient) {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redisClient;
}

const orderKey = (token: string) => `order:${token}`;
const emailIndexKey = (email: string) => `order:email:${normalizeEmail(email)}`;

// Random, unguessable track token. 24 bytes of crypto randomness, URL-safe.
function generateToken(): string {
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}

async function saveOrder(record: OrderRecord, ttlSeconds?: number): Promise<void> {
  if (useUpstash) {
    const redis = await getRedis();
    if (ttlSeconds) {
      await redis.set(orderKey(record.token), record, { ex: ttlSeconds });
    } else {
      await redis.set(orderKey(record.token), record);
    }
  } else {
    memoryOrders.set(record.token, record);
  }
}

async function setEmailIndex(email: string, token: string, ttlSeconds?: number): Promise<void> {
  if (useUpstash) {
    const redis = await getRedis();
    if (ttlSeconds) {
      await redis.set(emailIndexKey(email), token, { ex: ttlSeconds });
    } else {
      await redis.set(emailIndexKey(email), token);
    }
  } else {
    memoryEmailIndex.set(normalizeEmail(email), token);
  }
}

// Create a new order in the `started` state and index it by email so the
// Telegram update command can find its token later. Most-recent-wins on the
// email index: a second order for the same email overwrites the pointer
// (the older record becomes unreachable-by-email but is not deleted) — the
// documented "one order in flight per client" assumption.
export async function createOrder(email: string, language?: Language): Promise<OrderRecord> {
  const now = Date.now();
  const token = generateToken();
  const record: OrderRecord = {
    token,
    email,
    status: "started",
    history: [{ status: "started", timestamp: now }],
    ...(language ? { language } : {}),
    createdAt: now,
  };
  await saveOrder(record);
  await setEmailIndex(email, token);
  return record;
}

// Look up an order's token via the email index. Returns null if no order is
// indexed for that email.
export async function getOrderTokenByEmail(email: string): Promise<string | null> {
  if (!email) return null;
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(emailIndexKey(email));
    return (value as string) ?? null;
  }
  return memoryEmailIndex.get(normalizeEmail(email)) ?? null;
}

export async function getOrderByToken(token: string): Promise<OrderRecord | null> {
  if (!token) return null;
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(orderKey(token));
    return (value as OrderRecord) ?? null;
  }
  return memoryOrders.get(token) ?? null;
}

// Advance an order's status. Resolves the token via the email index, appends a
// history event, and — on the transition to `done` — stamps doneAt and applies
// the 3-day self-delete TTL to both the record and its email index. Returns the
// updated record, or null if no order exists for that email.
export async function updateOrderStatus(
  email: string,
  status: OrderStatus
): Promise<OrderRecord | null> {
  const token = await getOrderTokenByEmail(email);
  if (!token) return null;

  const record = await getOrderByToken(token);
  if (!record) return null;

  const now = Date.now();
  record.status = status;
  record.history.push({ status, timestamp: now });

  const isDone = status === "done";
  if (isDone) {
    record.doneAt = now;
    await saveOrder(record, DONE_TTL_SECONDS);
    // Refresh the email index with the same TTL so it self-cleans alongside
    // the record rather than dangling for a token that's about to vanish.
    await setEmailIndex(email, token, DONE_TTL_SECONDS);
  } else {
    await saveOrder(record);
  }

  return record;
}
