// A25 lead archive — the permanent, queryable record of every person who has
// ever contacted A25.
//
// WHY THIS EXISTS: before this module, form submissions (lib/submission.ts)
// were never persisted anywhere — they existed only as Resend emails. Chat,
// orders and priority leads lived in Redis, which is the right home for live
// session state but is a cache, not a system of record. This is the system of
// record. Redis keeps doing exactly what it did; nothing was moved out of it.
//
// TWO BACKENDS, ONE SQL DIALECT:
//   • DATABASE_URL set   → Neon (serverless Postgres over HTTP). Production.
//   • DATABASE_URL unset → PGlite, an in-process Postgres with a local data
//     directory. Local development only.
//
// Every query in lib/archive/*, in the scripts and in the admin pages uses plain
// Postgres with $1-style positional parameters — the dialect both speak — so
// switching backends changes nothing above this file.
//
// PGlite embeds the database in the process that opens it, so the dev server and
// a CLI script cannot both hold it at once (see ARCHIVE.md). That limitation is
// local-only; on Neon every process talks to the same remote database.

import path from "node:path";

export interface QueryResult<T = any> {
  rows: T[];
}

// Read the environment LAZILY, never at module scope.
//
// ES modules evaluate a dependency's body before the importing module's, so a
// script that calls dotenv.config() and then imports this file would have had
// its config run *after* these values were captured — silently selecting PGlite
// with DATABASE_URL sitting right there in .env.local. That exact bug sent a
// production backfill to the local database. Resolving on first use instead
// means the backend is chosen when it is actually needed, by which point every
// caller has loaded its environment.
const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;
const dataDir = () => process.env.A25_ARCHIVE_DIR || path.join(process.cwd(), ".a25-archive");

type Runner = (text: string, params: any[]) => Promise<any[]>;

let runnerPromise: Promise<Runner> | null = null;

async function buildRunner(): Promise<Runner> {
  const url = databaseUrl();
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    // sql.query() is the positional-parameter form; the tagged-template form
    // can't take a query string built elsewhere.
    const run: Runner = async (text, params) => {
      const result: any = await sql.query(text, params);
      // Depending on driver options this is either a bare rows array or a
      // node-postgres-shaped result. Normalise both.
      return Array.isArray(result) ? result : (result?.rows ?? []);
    };
    await ensureSchemaOnce(run);
    return run;
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(dataDir());
  await db.waitReady;
  const run: Runner = async (text, params) => {
    const result = await db.query(text, params);
    return (result.rows ?? []) as any[];
  };
  await ensureSchemaOnce(run);
  return run;
}

// Create the schema if it isn't there yet.
//
// Checked with a single cheap lookup rather than firing the whole DDL every
// time: over Neon's HTTP driver each statement is its own round trip, so
// running ~20 of them on every cold start would be real added latency for no
// benefit once the tables exist.
async function ensureSchemaOnce(run: Runner): Promise<void> {
  const [existing] = await run(`select to_regclass('public.submissions') as t`, []);
  if (existing?.t) return;
  const { ensureSchema } = await import("./schema.js");
  await ensureSchema({ query: (text: string, params?: any[]) => run(text, params ?? []) });
}

async function getRunner(): Promise<Runner> {
  // Lazily created, and deliberately NOT at module scope: Next.js evaluates
  // top-level module code at build time, and opening a database during
  // `next build` would both slow the build and fail where the data directory
  // isn't writable or DATABASE_URL isn't yet set.
  if (!runnerPromise) runnerPromise = buildRunner();
  return runnerPromise;
}

// The single entry point every other archive module uses.
export async function query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
  const run = await getRunner();
  return { rows: (await run(text, params)) as T[] };
}

// Which backend is live — surfaced in /admin so it's never ambiguous whether
// you're looking at local or production data.
export function backendName(): string {
  return databaseUrl() ? "Neon Postgres" : "PGlite (local)";
}

// Used by the write-through callers so a database problem can never surface to
// a visitor. Mirrors the fail-open convention already established for Telegram
// and Resend delivery (see lib/chatWidget.ts, lib/email.ts): the visitor's own
// action must never be lost or blocked by a downstream system being down.
export async function safeWrite(label: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`[A25 Archive] ${label} failed (visitor unaffected):`, err);
  }
}
