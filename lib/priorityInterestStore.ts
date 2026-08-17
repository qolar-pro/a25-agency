// A25 "Priority Line" lead persistence (Phase 8b) — Upstash Redis when
// configured, an in-process Map otherwise. Deliberately mirrors
// lib/chatStore.ts / lib/orderStore.ts: same backend switch, same dev-only
// in-memory fallback, same key-builder style, so there's one storage
// convention across the codebase rather than three.
//
// What this stores: interest in the *fake-door demand test* for Priority Line
// (see Phase 8 in a25-claude-code-prompt.md). Nobody is charged; these records
// exist so Boris can see whether real people will complete the flow.
//
// TWO DELIBERATE DEVIATIONS from the chat/order stores:
//   1. NO TTL. Chat and order records self-expire because they're transient
//      conversations; these are Boris's lead list for the whole test period and
//      must not quietly delete themselves.
//   2. The applicationId is short and human-readable ("VIP-7F3K9X2"), not the
//      long unguessable token style used for /track/<token>. It gets read back
//      to a person and quoted in email — it is an identifier, never a secret,
//      so nothing sensitive may be reachable by knowing one.
//
// The in-memory fallback is dev-only (same caveat as the other two stores): it
// resets on restart and cannot work across serverless invocations, so real
// deployments must attach Upstash.

import type { Language } from "./languageDetect.js";
import { safeWrite } from "./archive/db.js";
import { archivePriorityLead } from "./archive/store.js";

// One 3-option field, never two booleans — "has passport" + "is biometric"
// as separate toggles can express the contradictory "no passport but
// biometric" state (see Phase 8e).
export type PassportStatus = "none" | "passport" | "biometric";

export interface PriorityLead {
  applicationId: string;
  email: string;
  firstName: string;
  surname: string;
  country: string;
  // One of the 7 app/components/industriesData.ts INDUSTRIES keys, or "other".
  profession: string;
  passportStatus: PassportStatus;
  // Optional now, captured now: if/when the real scheduled-WhatsApp-call
  // feature ships, the number is already on file for leads from this test.
  whatsappNumber?: string;
  language?: Language;
  otpCode: string;
  otpExpiresAt: number;
  otpAttempts: number;
  verified: boolean;
  createdAt: number;
  verifiedAt?: number;
}

// Fields a caller supplies when creating/refreshing a lead. Everything else on
// the record (id, OTP, counters, timestamps) is derived here.
export interface PriorityLeadInput {
  email: string;
  firstName: string;
  surname: string;
  country: string;
  profession: string;
  passportStatus: PassportStatus;
  whatsappNumber?: string;
  language?: Language;
}

export const OTP_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_OTP_ATTEMPTS = 5;

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = !!(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback store (local dev only — see note above).
//
// Hung off globalThis rather than plain module-level consts: this flow spans TWO
// route handlers (/api/priority-interest and .../verify), and Next bundles each
// route separately, so each one would otherwise get its own module instance with
// its own empty Maps — step 2 could never see the lead step 1 wrote, and the
// flow was untestable locally. One process, one Map. Changes nothing about the
// Upstash path, and nothing about the fact that this fallback still cannot work
// across separate serverless invocations in production (attach Upstash there).
const memoryStore = ((globalThis as any).__a25PriorityMemoryStore ??= {
  leads: new Map<string, PriorityLead>(),
  emailIndex: new Map<string, string>()
}) as { leads: Map<string, PriorityLead>; emailIndex: Map<string, string> };

const memoryLeads = memoryStore.leads;
const memoryEmailIndex = memoryStore.emailIndex;

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

const leadKey = (applicationId: string) => `priority:lead:${applicationId}`;
const emailIndexKey = (email: string) => `priority:email:${normalizeEmail(email)}`;

// Crockford-style alphabet: no I/L/O/U/0/1 so a code read aloud or retyped
// from an email can't be garbled into a different valid-looking id.
const ID_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

// "VIP-" + 7 random characters. Human-readable on purpose (see header note).
export function generateApplicationId(): string {
  const bytes = new Uint8Array(7);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ID_ALPHABET[b % ID_ALPHABET.length];
  return `VIP-${out}`;
}

// 6-digit numeric OTP, crypto-random (not Math.random) — cheap to do properly.
export function generateOtpCode(): string {
  const bytes = new Uint8Array(4);
  globalThis.crypto.getRandomValues(bytes);
  const n = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  return String(n % 1_000_000).padStart(6, "0");
}

export async function saveLead(record: PriorityLead): Promise<void> {
  // Write-through to the permanent archive — see lib/chatStore.ts. The archive
  // deliberately drops otpCode/otpExpiresAt/otpAttempts; those stay here in
  // Redis where they expire. Only the lead itself is archived.
  void safeWrite("priority lead", () => archivePriorityLead(record));

  // No TTL, on purpose — see the header note.
  if (useUpstash) {
    const redis = await getRedis();
    await redis.set(leadKey(record.applicationId), record);
  } else {
    memoryLeads.set(record.applicationId, record);
  }
}

async function setEmailIndex(email: string, applicationId: string): Promise<void> {
  if (useUpstash) {
    const redis = await getRedis();
    await redis.set(emailIndexKey(email), applicationId);
  } else {
    memoryEmailIndex.set(normalizeEmail(email), applicationId);
  }
}

export async function getLeadById(applicationId: string): Promise<PriorityLead | null> {
  if (!applicationId) return null;
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(leadKey(applicationId));
    return (value as PriorityLead) ?? null;
  }
  return memoryLeads.get(applicationId) ?? null;
}

export async function getLeadIdByEmail(email: string): Promise<string | null> {
  if (!email) return null;
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(emailIndexKey(email));
    return (value as string) ?? null;
  }
  return memoryEmailIndex.get(normalizeEmail(email)) ?? null;
}

export async function getLeadByEmail(email: string): Promise<PriorityLead | null> {
  const applicationId = await getLeadIdByEmail(email);
  if (!applicationId) return null;
  return getLeadById(applicationId);
}

// What createOrRefreshLead did, so the caller knows whether to send an OTP.
//   created           — brand-new lead, OTP issued
//   refreshed         — existing UNVERIFIED lead reused, fresh OTP issued and
//                       attempt counter reset (this doubles as the "resend
//                       code" affordance, so no separate resend endpoint)
//   already-verified  — this email already completed the flow; no new record,
//                       no new OTP, no duplicate lead for the same person
export type PriorityLeadOutcome = "created" | "refreshed" | "already-verified";

export async function createOrRefreshLead(
  input: PriorityLeadInput
): Promise<{ lead: PriorityLead; outcome: PriorityLeadOutcome }> {
  const now = Date.now();
  const existing = await getLeadByEmail(input.email);

  if (existing?.verified) {
    return { lead: existing, outcome: "already-verified" };
  }

  if (existing) {
    // Reuse the record AND its applicationId — a visitor who resubmits (or
    // asks for another code) is one lead, not two. Latest form values win,
    // since they may have corrected a typo on the way back through.
    const refreshed: PriorityLead = {
      ...existing,
      email: input.email,
      firstName: input.firstName,
      surname: input.surname,
      country: input.country,
      profession: input.profession,
      passportStatus: input.passportStatus,
      ...(input.whatsappNumber ? { whatsappNumber: input.whatsappNumber } : {}),
      ...(input.language ? { language: input.language } : {}),
      otpCode: generateOtpCode(),
      otpExpiresAt: now + OTP_TTL_MS,
      otpAttempts: 0
    };
    await saveLead(refreshed);
    // Re-point the index in case the stored email's casing/whitespace differed.
    await setEmailIndex(refreshed.email, refreshed.applicationId);
    return { lead: refreshed, outcome: "refreshed" };
  }

  const record: PriorityLead = {
    applicationId: generateApplicationId(),
    email: input.email,
    firstName: input.firstName,
    surname: input.surname,
    country: input.country,
    profession: input.profession,
    passportStatus: input.passportStatus,
    ...(input.whatsappNumber ? { whatsappNumber: input.whatsappNumber } : {}),
    ...(input.language ? { language: input.language } : {}),
    otpCode: generateOtpCode(),
    otpExpiresAt: now + OTP_TTL_MS,
    otpAttempts: 0,
    verified: false,
    createdAt: now
  };
  await saveLead(record);
  await setEmailIndex(record.email, record.applicationId);
  return { lead: record, outcome: "created" };
}

// Persist a failed verification attempt. Returns the updated attempt count so
// the caller can tell the user how they got locked out.
export async function registerFailedOtpAttempt(lead: PriorityLead): Promise<number> {
  lead.otpAttempts += 1;
  await saveLead(lead);
  return lead.otpAttempts;
}

export async function markLeadVerified(lead: PriorityLead): Promise<PriorityLead> {
  lead.verified = true;
  lead.verifiedAt = Date.now();
  await saveLead(lead);
  return lead;
}
