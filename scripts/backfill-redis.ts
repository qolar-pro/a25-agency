// Recover everything currently in production Redis into the permanent archive.
//
// SAFETY PROPERTIES (this script touches real customer data):
//   1. READ-ONLY against Redis. The command whitelist below is enforced at the
//      transport level — SCAN/GET/TTL/DBSIZE only. There is no code path that
//      can write, expire or delete a key, by construction rather than by care.
//   2. SNAPSHOT FIRST. Every raw value is written to archive-snapshots/ before
//      a single row is inserted. If the import is wrong, the source data is
//      still on disk, untouched and re-importable.
//   3. IDEMPOTENT. Every write goes through the upserts in lib/archive/store.ts,
//      keyed on the record's own stable id. Running this twice changes nothing.
//
// Usage:  npx tsx scripts/backfill-redis.ts
//         npx tsx scripts/backfill-redis.ts --snapshot-only

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import {
  archiveClientLanguage,
  archiveConversation,
  archiveOrder,
  archivePriorityLead,
  recordRun
} from "../lib/archive/store.js";

const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const SNAPSHOT_ONLY = process.argv.includes("--snapshot-only");

if (!URL_ || !TOKEN) {
  console.error(
    "Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.\n" +
      "Put them in .env.local, or run: vercel env pull .env.local --yes"
  );
  process.exit(1);
}

const READ_ONLY = new Set(["SCAN", "GET", "TTL", "DBSIZE"]);

async function redis(args: (string | number)[]): Promise<any> {
  const verb = String(args[0]).toUpperCase();
  if (!READ_ONLY.has(verb)) {
    throw new Error(`Refusing non-read-only Redis command: ${verb}`);
  }
  const res = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  const json = await res.json();
  if (json.error) throw new Error(`Redis error on ${verb}: ${json.error}`);
  return json.result;
}

// Upstash's REST GET returns already-parsed JSON for values written by the
// @upstash/redis client, but a raw string for anything written another way.
// Normalise both.
const parse = (v: unknown): any => {
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
};

async function main() {
  console.log("Scanning production Redis (read-only)…\n");

  let cursor = "0";
  const keys: string[] = [];
  do {
    const [next, batch] = await redis(["SCAN", cursor, "COUNT", "500"]);
    cursor = String(next);
    keys.push(...(batch as string[]));
  } while (cursor !== "0");

  const snapshot: Record<string, unknown> = {};
  for (const key of keys) {
    snapshot[key] = parse(await redis(["GET", key]));
  }

  // --- Step 1: snapshot to disk before touching the archive -----------------
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(process.cwd(), "archive-snapshots");
  mkdirSync(dir, { recursive: true });
  const snapshotPath = path.join(dir, `redis-${stamp}.json`);
  writeFileSync(
    snapshotPath,
    JSON.stringify({ takenAt: new Date().toISOString(), keyCount: keys.length, keys: snapshot }, null, 2)
  );
  console.log(`Snapshot written: ${snapshotPath}  (${keys.length} keys)\n`);

  if (SNAPSHOT_ONLY) {
    console.log("--snapshot-only given; nothing imported.");
    return;
  }

  // --- Step 2: import -------------------------------------------------------
  // Languages first, so conversations and orders that predate the `language`
  // field can be enriched from the shared client-lang index rather than
  // silently defaulting to English.
  const langByEmail = new Map<string, string>();
  let langs = 0;
  for (const [key, value] of Object.entries(snapshot)) {
    if (!key.startsWith("client-lang:")) continue;
    const email = key.slice("client-lang:".length);
    const lang = typeof value === "string" ? value : String(value ?? "");
    if (!email || !lang) continue;
    langByEmail.set(email.toLowerCase(), lang);
    await archiveClientLanguage(email, lang);
    langs++;
  }

  const langFor = (email?: string): string | undefined =>
    email ? langByEmail.get(email.trim().toLowerCase()) : undefined;

  let chats = 0;
  let messages = 0;
  for (const [key, value] of Object.entries(snapshot)) {
    if (!key.startsWith("chat:conv:")) continue;
    const rec = value as any;
    if (!rec?.conversationId) continue;
    await archiveConversation({ ...rec, language: rec.language ?? langFor(rec.visitorEmail) });
    chats++;
    messages += rec.messages?.length ?? 0;
  }

  let orders = 0;
  for (const [key, value] of Object.entries(snapshot)) {
    // order:email:* is an index, not a record — skip it.
    if (!key.startsWith("order:") || key.startsWith("order:email:")) continue;
    const rec = value as any;
    if (!rec?.token) continue;
    await archiveOrder({ ...rec, language: rec.language ?? langFor(rec.email) });
    orders++;
  }

  let leads = 0;
  for (const [key, value] of Object.entries(snapshot)) {
    if (!key.startsWith("priority:lead:")) continue;
    const rec = value as any;
    if (!rec?.applicationId) continue;
    await archivePriorityLead({ ...rec, language: rec.language ?? langFor(rec.email) });
    leads++;
  }

  await recordRun("redis-backfill", path.basename(snapshotPath), {
    inserted: chats + orders + leads + langs
  });

  console.log("Imported into the archive:");
  console.log(`  ${String(chats).padStart(4)}  chat conversations (${messages} messages)`);
  console.log(`  ${String(orders).padStart(4)}  orders`);
  console.log(`  ${String(leads).padStart(4)}  priority leads`);
  console.log(`  ${String(langs).padStart(4)}  client languages`);
  console.log("\nRedis was not modified. Re-running this is safe.");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("\nBackfill failed:", err);
    process.exit(1);
  }
);
