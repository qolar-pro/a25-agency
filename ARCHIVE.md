# A25 Lead Archive

One permanent, searchable record of every person who has ever contacted A25 —
form submissions, chat conversations, orders and Priority Line leads — with a
dashboard at `/admin`.

## Why it exists

Before this, lead data was scattered and partly ephemeral:

| Source | Where it lived | Problem |
|---|---|---|
| Contact / application form | **nowhere** | `lib/submission.ts` composed an email and sent it via Resend. That email was the only copy in existence. |
| Live chat | Redis, 3-day TTL | self-deletes; `/close` in Telegram hard-deletes |
| Orders | Redis, 3-day TTL after `done` | self-deletes |
| Priority Line leads | Redis, no TTL | kept, but unreachable — no index to list them |

Redis is the right home for live session state, but it is a cache, not a system
of record. This is the system of record.

## Design

**Additive only.** Nothing was moved out of Redis and nothing in the existing
flows changed behaviour. Chat resume, OTP verification and order tracking all
still read and write Redis exactly as before. The archive is a parallel copy.

**Write-through, fail-open.** Each store's internal save function also writes to
the archive, wrapped in `safeWrite()` so a database failure logs server-side and
is invisible to the visitor. This matches the convention already used for
Telegram and Resend delivery: a visitor's own action must never be lost or
blocked by a downstream system being down.

Hooks are at the store level, so every path — create, update, append — is
covered by one line each:

- `lib/submission.ts` → archives **before** attempting delivery
- `lib/chatStore.ts` `saveConversation()`
- `lib/orderStore.ts` `saveOrder()`
- `lib/priorityInterestStore.ts` `saveLead()`
- `lib/languageDetect.ts` `rememberLanguage()`

**Secrets are not copied.** OTP codes and Telegram message-ID indexes stay in
Redis. The archive holds lead data only.

## Storage

Local development uses **PGlite** — Postgres compiled to WASM, running in-process
with a file-backed data directory at `.a25-archive/` (gitignored). Every query
uses plain Postgres with `$1` positional parameters, which is the same dialect
Neon speaks.

**Production uses Neon** and the switch is automatic — `lib/archive/db.ts` picks
the backend from the environment:

- `DATABASE_URL` set → Neon (serverless Postgres over HTTP)
- `DATABASE_URL` unset → PGlite

Nothing in `store.ts`, `queries.ts`, the scripts or the admin pages differs
between them. The dashboard shows which backend is live next to the counts —
green for Neon, amber for local — so the two archives are never confused.

The schema is created on first connection, guarded by a single
`to_regclass('public.submissions')` lookup so the ~20 DDL statements aren't
re-sent on every cold start.

## Layout

```
lib/archive/
  db.ts          connection + safeWrite() — the only file to change for Neon
  schema.ts      tables, indexes, the all_contacts view; re-runs safely on boot
  store.ts       idempotent upserts (write side)
  queries.ts     dashboard reads + CSV export allowlist
  adminAuth.ts   password check + signed session cookie
app/admin/       dashboard, login, record detail
app/api/admin/   login + CSV export
scripts/         backfill-redis.ts, backfill-resend.ts, archive-delete.ts
```

### ⚠️ One process at a time (local only)

PGlite embeds Postgres *in the process that opens it*, so the dev server and a
script cannot both hold `.a25-archive/` open. If you run a backfill while
`npm run dev` is running, the dashboard will keep showing its own stale view and
appear to have lost data.

**Stop the dev server before running any script, then start it again.** The data
on disk is always correct — `npx tsx scripts/archive-stats.ts` (with the server
stopped) is the authoritative check.

This constraint disappears entirely on Neon, where every process talks to the
same remote database. It is purely a local-development artifact.

## Scripts

All are read-only against their source, snapshot before importing, and are
idempotent — re-running never duplicates.

```bash
# Recover everything currently in production Redis.
npx tsx scripts/backfill-redis.ts
npx tsx scripts/backfill-redis.ts --snapshot-only    # snapshot, don't import

# Recover historical form submissions by parsing Resend's sent-email log.
# Needs RESEND_API_KEY (lives in Vercel env — `vercel env pull .env.local`).
npx tsx scripts/backfill-resend.ts

# GDPR erasure.
npx tsx scripts/archive-delete.ts someone@example.com --dry-run
npx tsx scripts/archive-delete.ts someone@example.com
```

Snapshots land in `archive-snapshots/` (gitignored) — raw JSON of everything
read, written before any row is inserted, so a bad import is always recoverable.

## Environment

```
ADMIN_PASSWORD          required — /admin refuses every login if unset
ADMIN_SESSION_SECRET    signs the session cookie; rotating it signs everyone out
RESEND_API_KEY          only needed for the Resend backfill
UPSTASH_REDIS_REST_URL  only needed for the Redis backfill
UPSTASH_REDIS_REST_TOKEN
```

## Security

- Password compared with `timingSafeEqual` over hashes, never `===`.
- Session cookie is an HMAC over its own expiry — cannot be forged or extended.
- Cookie is `httpOnly` + `sameSite=lax`; `secure` in production.
- `/admin` and `/track/` are disallowed in `robots.txt`.
- All admin pages are `force-dynamic` and `noindex`.
- Search terms are bound parameters; CSV export uses a table allowlist.

### Rate limiting (`lib/archive/rateLimit.ts`)

Two counters, because a per-IP limit alone is defeated by spreading guesses
across cheap addresses:

- **5 failed attempts per IP per 15 minutes**, then that IP is locked out.
- **50 failed attempts globally per 15 minutes**, sized so normal use can never
  trip it but a distributed attempt exhausts long before the password space.

The check runs *before* the password comparison, so a locked-out attacker learns
nothing about whether a guess was correct. A successful sign-in clears that IP's
counter, so a few typos never accumulate.

Backed by the same Upstash Redis the rest of the app uses. **If Upstash rejects
writes** — a read-only token, or an outage — the limiter logs loudly and falls
back to a per-process in-memory counter. That is weaker across serverless
instances but is real protection; the earlier version silently counted nothing
and still reported "allowed", which is worse than no limiter because it looks
like one. Check the logs for `Upstash cannot record login failures` after any
token change.

### Telegram alerts (`lib/archive/adminAlerts.ts`)

Boris gets a message on every successful sign-in (masked IP, device, time) and
on every lockout. Rate limiting makes guessing impractical; the alerts make a
*successful* entry visible, which is what matters if the password ever leaks by
some other route. Uses the existing bot and owner-chat list — no new service.

**Local development sets `TELEGRAM_CHAT_ID=""` in `.env.local`** so testing never
pings Boris's real phone. Production supplies the real value from Vercel's env.

## Known limitations

- Chat conversations and completed orders that expired from Redis **before** the
  first backfill ran are not in the archive. Every visitor chat message was also
  relayed to Telegram, so Boris's Telegram history is an informal archive of
  those — recoverable by manual export if ever needed.
- The Resend backfill can only recover what Resend still retains, and parses
  Macedonian field labels out of the notification emails. Spot-check a few
  imported rows against the original emails before trusting it wholesale.
