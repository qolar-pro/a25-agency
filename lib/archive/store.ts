// Write side of the A25 archive. Every function here is an idempotent upsert
// keyed on a stable primary key, so both the live write-through path and the
// backfill scripts can run repeatedly without ever creating a duplicate.
//
// Callers on the live path should wrap these in safeWrite() (see db.ts) so a
// database problem can never block or lose a visitor's submission.

import { query } from "./db.js";

// Redis stores timestamps as epoch-milliseconds; Postgres wants a Date. One
// helper so the conversion is identical everywhere, including for the legacy
// records that predate some fields entirely.
const at = (ms: number | undefined | null): Date =>
  typeof ms === "number" && Number.isFinite(ms) ? new Date(ms) : new Date();

const orNull = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

export interface SubmissionInput {
  id: string;
  source: "form" | "resend-backfill";
  kind: string;
  fullName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  sector?: string;
  country?: string;
  experience?: string;
  hasPassport?: string;
  notes?: string;
  language?: string;
  createdAt?: number;
  raw?: unknown;
}

export async function archiveSubmission(input: SubmissionInput): Promise<void> {
  await query(
    `insert into submissions
       (id, source, kind, full_name, company_name, email, phone, sector,
        country, experience, has_passport, notes, language, created_at, raw)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     on conflict (id) do update set
       kind = excluded.kind,
       full_name = excluded.full_name,
       company_name = excluded.company_name,
       email = excluded.email,
       phone = excluded.phone,
       sector = excluded.sector,
       country = excluded.country,
       experience = excluded.experience,
       has_passport = excluded.has_passport,
       notes = excluded.notes,
       language = excluded.language,
       raw = excluded.raw`,
    [
      input.id,
      input.source,
      input.kind,
      orNull(input.fullName),
      orNull(input.companyName),
      orNull(input.email),
      orNull(input.phone),
      orNull(input.sector),
      orNull(input.country),
      orNull(input.experience),
      orNull(input.hasPassport),
      orNull(input.notes),
      orNull(input.language),
      at(input.createdAt),
      JSON.stringify(input.raw ?? null)
    ]
  );
}

// Accepts the ConversationRecord shape from lib/chatStore.ts. Tolerant of the
// legacy on-disk shape: older records in production store telegramMessageIds as
// bare numbers rather than {chatId, messageId} objects, and have no `language`
// field at all — neither is needed here, but it means this must not assume the
// current interface is what it will actually receive.
export async function archiveConversation(record: {
  conversationId: string;
  visitorName?: string;
  visitorEmail?: string;
  language?: string;
  createdAt?: number;
  messages?: Array<{ role: string; text: string; timestamp: number }>;
}): Promise<void> {
  await query(
    `insert into chat_conversations
       (conversation_id, visitor_name, visitor_email, language, created_at, raw)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (conversation_id) do update set
       visitor_name = excluded.visitor_name,
       visitor_email = excluded.visitor_email,
       language = coalesce(excluded.language, chat_conversations.language),
       raw = excluded.raw`,
    [
      record.conversationId,
      orNull(record.visitorName),
      orNull(record.visitorEmail),
      orNull(record.language),
      at(record.createdAt),
      JSON.stringify(record)
    ]
  );

  // Messages are keyed by position, so re-archiving a conversation that has
  // grown since last time inserts only the new turns.
  const messages = record.messages ?? [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    await query(
      `insert into chat_messages (id, conversation_id, seq, role, body, created_at)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set
         role = excluded.role,
         body = excluded.body`,
      [`${record.conversationId}:${i}`, record.conversationId, i, m.role, m.text ?? "", at(m.timestamp)]
    );
  }
}

export async function archiveOrder(record: {
  token: string;
  email?: string;
  status?: string;
  language?: string;
  createdAt?: number;
  history?: Array<{ status: string; timestamp: number }>;
}): Promise<void> {
  const history = record.history ?? [];
  const last = history.length ? history[history.length - 1].timestamp : record.createdAt;
  await query(
    `insert into orders
       (token, email, status, language, created_at, updated_at, history, raw)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     on conflict (token) do update set
       email = excluded.email,
       status = excluded.status,
       language = coalesce(excluded.language, orders.language),
       updated_at = excluded.updated_at,
       history = excluded.history,
       raw = excluded.raw`,
    [
      record.token,
      orNull(record.email),
      orNull(record.status),
      orNull(record.language),
      at(record.createdAt),
      at(last),
      JSON.stringify(history),
      JSON.stringify(record)
    ]
  );
}

// Note the explicit field list: the PriorityLead record in Redis also carries
// otpCode / otpExpiresAt / otpAttempts, and those are deliberately dropped here
// rather than copied — see the schema header.
export async function archivePriorityLead(lead: {
  applicationId: string;
  email?: string;
  firstName?: string;
  surname?: string;
  country?: string;
  profession?: string;
  passportStatus?: string;
  whatsappNumber?: string;
  language?: string;
  verified?: boolean;
  createdAt?: number;
  verifiedAt?: number;
}): Promise<void> {
  const { otpCode, otpExpiresAt, otpAttempts, ...safe } = lead as Record<string, unknown>;
  await query(
    `insert into priority_leads
       (application_id, email, first_name, surname, country, profession,
        passport_status, whatsapp_number, language, verified, created_at, verified_at, raw)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     on conflict (application_id) do update set
       email = excluded.email,
       first_name = excluded.first_name,
       surname = excluded.surname,
       country = excluded.country,
       profession = excluded.profession,
       passport_status = excluded.passport_status,
       whatsapp_number = excluded.whatsapp_number,
       language = coalesce(excluded.language, priority_leads.language),
       verified = excluded.verified,
       verified_at = excluded.verified_at,
       raw = excluded.raw`,
    [
      lead.applicationId,
      orNull(lead.email),
      orNull(lead.firstName),
      orNull(lead.surname),
      orNull(lead.country),
      orNull(lead.profession),
      orNull(lead.passportStatus),
      orNull(lead.whatsappNumber),
      orNull(lead.language),
      lead.verified ?? false,
      at(lead.createdAt),
      lead.verifiedAt ? new Date(lead.verifiedAt) : null,
      JSON.stringify(safe)
    ]
  );
}

export async function archiveClientLanguage(email: string, language: string): Promise<void> {
  if (!email || !language) return;
  await query(
    `insert into client_languages (email, language, updated_at)
     values ($1,$2,now())
     on conflict (email) do update set
       language = excluded.language,
       updated_at = now()`,
    [email.trim().toLowerCase(), language]
  );
}

export async function recordRun(
  kind: string,
  detail: string,
  counts: { inserted?: number; updated?: number; skipped?: number }
): Promise<void> {
  await query(
    `insert into archive_runs (kind, detail, inserted, updated, skipped)
     values ($1,$2,$3,$4,$5)`,
    [kind, detail, counts.inserted ?? 0, counts.updated ?? 0, counts.skipped ?? 0]
  );
}
