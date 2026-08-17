// Archive health check — row counts, how completely the Resend backfill parsed,
// and any lead whose notification email never reached the inbox.
//
// The last one matters: a bounced notification means the lead reached the site
// but not Boris. Those are the ones worth chasing first.
//
// Usage:  npx tsx scripts/archive-stats.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { query } from "../lib/archive/db.js";

async function main() {
  const counts = await query(
    `select
       (select count(*) from submissions)        as submissions,
       (select count(*) from chat_conversations) as chats,
       (select count(*) from chat_messages)      as messages,
       (select count(*) from orders)             as orders,
       (select count(*) from priority_leads)     as priority_leads,
       (select count(*) from client_languages)   as languages`
  );
  console.log("\nARCHIVE CONTENTS");
  console.table(counts.rows[0]);

  // How much of each field the Resend parser actually recovered. A low number
  // in one column means that label didn't match and the parser needs a tweak —
  // the raw emails are still in archive-snapshots/, so it can be re-run.
  const coverage = await query(
    `select count(*) as total,
            count(full_name)   as with_name,
            count(email)       as with_email,
            count(phone)       as with_phone,
            count(sector)      as with_sector,
            count(country)     as with_country
       from submissions where source = 'resend-backfill'`
  );
  console.log("\nRESEND BACKFILL — FIELD COVERAGE");
  console.table(coverage.rows[0]);

  const byKind = await query(
    `select kind, count(*) as n from submissions group by kind order by n desc`
  );
  console.log("\nSUBMISSIONS BY TYPE");
  console.table(byKind.rows);

  const sample = await query(
    `select kind, full_name, email, phone, sector, country
       from submissions order by created_at desc limit 5`
  );
  console.log("\nMOST RECENT 5");
  console.table(sample.rows);

  const bounced = await query(
    `select full_name, email, phone, created_at, raw->>'last_event' as delivery
       from submissions
      where raw->>'last_event' is not null
        and raw->>'last_event' not in ('delivered','sent','opened','clicked')
      order by created_at desc`
  );
  if (bounced.rows.length > 0) {
    console.log("\n⚠  LEADS WHOSE NOTIFICATION NEVER REACHED THE INBOX");
    console.table(bounced.rows);
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
