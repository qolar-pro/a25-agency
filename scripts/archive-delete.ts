// Erase a person from the archive — the GDPR "right to erasure" path.
//
// The archive stores names, phone numbers, passport status and chat transcripts
// for people in the EU, and unlike the Redis records it has no TTL. That makes
// a deletion route a legal requirement, not a nice-to-have.
//
// Deletes across every table in one pass, matched on email (case-insensitive),
// including chat messages belonging to that person's conversations.
//
// Usage:
//   npx tsx scripts/archive-delete.ts someone@example.com --dry-run
//   npx tsx scripts/archive-delete.ts someone@example.com
//   npx tsx scripts/archive-delete.ts --id form:6f0c…   (delete one record)

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { query } from "../lib/archive/db.js";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const byId = args.includes("--id");
const target = args.find((a) => !a.startsWith("--"));

if (!target) {
  console.error(
    "Usage:\n" +
      "  npx tsx scripts/archive-delete.ts <email> [--dry-run]\n" +
      "  npx tsx scripts/archive-delete.ts --id <record-id> [--dry-run]"
  );
  process.exit(1);
}

async function main() {
  if (byId) {
    // Single-record delete, used for removing one bad row (a test submission,
    // a duplicate) without touching anything else that shares the email.
    const { rows } = await query(`select id, email, full_name from submissions where id = $1`, [
      target
    ]);
    if (rows.length === 0) {
      console.log(`No submission with id ${target}.`);
      return;
    }
    console.log(`Found: ${(rows[0] as any).full_name} <${(rows[0] as any).email}>`);
    if (dryRun) return console.log("--dry-run: nothing deleted.");
    await query(`delete from submissions where id = $1`, [target]);
    console.log("Deleted.");
    return;
  }

  const email = target!.trim().toLowerCase();

  // Count first, so the operator sees exactly what is about to go.
  const counts = await Promise.all([
    query(`select count(*) as n from submissions where lower(email) = $1`, [email]),
    query(`select count(*) as n from chat_conversations where lower(visitor_email) = $1`, [email]),
    query(`select count(*) as n from orders where lower(email) = $1`, [email]),
    query(`select count(*) as n from priority_leads where lower(email) = $1`, [email]),
    query(`select count(*) as n from client_languages where email = $1`, [email])
  ]);
  const [subs, chats, orders, leads, langs] = counts.map((c) => Number((c.rows[0] as any).n));

  console.log(`Records for ${email}:`);
  console.log(`  submissions ${subs}\n  chats ${chats}\n  orders ${orders}\n  priority ${leads}\n  language ${langs}`);

  if (subs + chats + orders + leads + langs === 0) return console.log("\nNothing to delete.");
  if (dryRun) return console.log("\n--dry-run: nothing deleted.");

  // Messages first — they reference the conversations being removed.
  await query(
    `delete from chat_messages where conversation_id in
       (select conversation_id from chat_conversations where lower(visitor_email) = $1)`,
    [email]
  );
  await query(`delete from chat_conversations where lower(visitor_email) = $1`, [email]);
  await query(`delete from submissions where lower(email) = $1`, [email]);
  await query(`delete from orders where lower(email) = $1`, [email]);
  await query(`delete from priority_leads where lower(email) = $1`, [email]);
  await query(`delete from client_languages where email = $1`, [email]);

  console.log("\nErased from the archive.");
  console.log(
    "NOTE: this clears the archive only. Any copy still in Redis will age out on\n" +
      "its own TTL, and the Resend email log is separate — clear that in Resend's\n" +
      "dashboard if the request covers it."
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("Delete failed:", err);
    process.exit(1);
  }
);
