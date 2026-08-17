// A25 archive schema. Applied automatically on first connection (see db.ts).
//
// Every statement is IF NOT EXISTS / OR REPLACE, so this runs on every boot and
// is safe to re-run forever — there is no separate migration step to forget.
//
// Statements are kept as an array and executed one at a time rather than as one
// multi-statement blob, because that is the intersection of what PGlite and
// Neon's HTTP driver both accept. Keeping to it preserves the local → production
// swap promised in db.ts.
//
// DELIBERATELY NOT STORED: OTP codes (lib/priorityInterestStore.ts issues them
// and they stay in Redis with their 15-minute expiry) and Telegram message-ID
// indexes. Those are live-session mechanics and secrets; the archive holds the
// lead record only.

const STATEMENTS: string[] = [
  // ---------------------------------------------------------------- submissions
  // The contact / application form. This is the table that did not exist before
  // — these leads previously had no home outside a Resend email.
  `create table if not exists submissions (
     id            text primary key,
     source        text not null,
     kind          text not null,
     full_name     text,
     company_name  text,
     email         text,
     phone         text,
     sector        text,
     country       text,
     experience    text,
     has_passport  text,
     notes         text,
     language      text,
     created_at    timestamptz not null,
     archived_at   timestamptz not null default now(),
     raw           jsonb
   )`,
  `create index if not exists submissions_email_idx on submissions (lower(email))`,
  `create index if not exists submissions_created_idx on submissions (created_at desc)`,

  // ------------------------------------------------------------ chat + messages
  `create table if not exists chat_conversations (
     conversation_id text primary key,
     visitor_name    text,
     visitor_email   text,
     language        text,
     created_at      timestamptz not null,
     archived_at     timestamptz not null default now(),
     raw             jsonb
   )`,
  `create index if not exists chat_conv_email_idx on chat_conversations (lower(visitor_email))`,

  // id is "<conversationId>:<index>" so re-importing the same conversation
  // updates rows in place instead of duplicating the transcript.
  `create table if not exists chat_messages (
     id              text primary key,
     conversation_id text not null,
     seq             integer not null,
     role            text not null,
     body            text not null,
     created_at      timestamptz not null
   )`,
  `create index if not exists chat_msg_conv_idx on chat_messages (conversation_id, seq)`,

  // --------------------------------------------------------------------- orders
  `create table if not exists orders (
     token       text primary key,
     email       text,
     status      text,
     language    text,
     created_at  timestamptz not null,
     updated_at  timestamptz,
     archived_at timestamptz not null default now(),
     history     jsonb,
     raw         jsonb
   )`,
  `create index if not exists orders_email_idx on orders (lower(email))`,

  // ------------------------------------------------------------- priority leads
  `create table if not exists priority_leads (
     application_id  text primary key,
     email           text,
     first_name      text,
     surname         text,
     country         text,
     profession      text,
     passport_status text,
     whatsapp_number text,
     language        text,
     verified        boolean,
     created_at      timestamptz not null,
     verified_at     timestamptz,
     archived_at     timestamptz not null default now(),
     raw             jsonb
   )`,
  `create index if not exists priority_email_idx on priority_leads (lower(email))`,

  // ------------------------------------------------------------ client language
  `create table if not exists client_languages (
     email      text primary key,
     language   text not null,
     updated_at timestamptz not null default now()
   )`,

  // ------------------------------------------------------------------ audit log
  // Records what each backfill run actually did, so a re-run is verifiable and
  // "did we already import that?" is answerable without guessing.
  `create table if not exists archive_runs (
     id         serial primary key,
     kind       text not null,
     detail     text,
     inserted   integer not null default 0,
     updated    integer not null default 0,
     skipped    integer not null default 0,
     ran_at     timestamptz not null default now()
   )`,

  // ----------------------------------------------------------- unified timeline
  // What /admin reads for its "everything" view. A view rather than a physical
  // table so it can never drift out of sync with the tables it summarises.
  `create or replace view all_contacts as
     select 'submission' as type,
            id            as ref,
            email,
            full_name     as name,
            phone,
            country,
            sector        as topic,
            language,
            created_at
       from submissions
     union all
     select 'chat', conversation_id, visitor_email, visitor_name,
            null, null, null, language, created_at
       from chat_conversations
     union all
     select 'order', token, email, null,
            null, null, status, language, created_at
       from orders
     union all
     select 'priority', application_id, email,
            trim(coalesce(first_name,'') || ' ' || coalesce(surname,'')),
            whatsapp_number, country, profession, language, created_at
       from priority_leads`
];

export async function ensureSchema(db: {
  query: (text: string, params?: any[]) => Promise<any>;
}): Promise<void> {
  for (const statement of STATEMENTS) {
    await db.query(statement);
  }
}
