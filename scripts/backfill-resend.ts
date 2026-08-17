// Recover historical FORM SUBMISSIONS from Resend.
//
// Until lib/submission.ts started archiving (this same change), a form
// submission was never stored anywhere — the notification email to Boris was
// the only copy. Resend keeps those sent emails, and lib/submission.ts composes
// them with a fixed set of labelled fields, so the original lead data can be
// parsed back out of them.
//
// SAFETY: read-only against Resend (GET only). Snapshots every fetched email to
// archive-snapshots/ before importing. Idempotent — each row is keyed on the
// Resend email id, so re-running updates in place instead of duplicating.
//
// Usage:  npx tsx scripts/backfill-resend.ts
//         npx tsx scripts/backfill-resend.ts --snapshot-only

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { archiveSubmission, recordRun } from "../lib/archive/store.js";

const KEY = process.env.RESEND_API_KEY;
const SNAPSHOT_ONLY = process.argv.includes("--snapshot-only");

if (!KEY) {
  console.error(
    "Missing RESEND_API_KEY.\n" +
      "It lives in Vercel's project env. Get it with:\n" +
      "  vercel login && vercel link && vercel env pull .env.local --yes"
  );
  process.exit(1);
}

async function resend(pathname: string): Promise<any> {
  const res = await fetch(`https://api.resend.com${pathname}`, {
    headers: { Authorization: `Bearer ${KEY}` }
  });
  if (!res.ok) throw new Error(`Resend ${res.status} on ${pathname}: ${await res.text()}`);
  return res.json();
}

// The two subject prefixes lib/submission.ts sends to the owner address. The
// visitor-facing confirmation emails are a different set and are skipped —
// they carry no data the owner notification doesn't already have.
const EMPLOYER_TAG = "БАРАЊЕ ЗА КАДАР";
const CANDIDATE_TAG = "ДОСИЕ НА КАНДИДАТ";

const stripHtml = (html: string): string =>
  html
    .replace(/<\s*(br|tr|\/tr|\/div|\/p|\/h[1-6])\s*\/?>/gi, "\n")
    .replace(/<\/td>\s*<td[^>]*>/gi, ": ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ");

// Pull "Label: value" out of the body. Labels are Macedonian and fixed in
// lib/submission.ts, so matching them is stable — but each is tried against
// both the plaintext and the flattened HTML, since which of the two Resend
// returns varies by how the email was sent.
function field(body: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = body.match(new RegExp(`${escaped}\\s*:?\\s*([^\\n]+)`, "i"));
  const value = m?.[1]?.trim();
  if (!value) return undefined;
  // Some labels carry a parenthetical the match doesn't consume — e.g.
  // "Директен телефон (WhatsApp/Viber): +389…" matched on "Директен телефон"
  // leaves "(WhatsApp/Viber): +389…". Strip a leading parenthetical + colon so
  // the stored value is the number itself.
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/^\([^)]*\)\s*:?\s*/, "")
    .trim();
  // lib/submission.ts's own "not provided" placeholders — treat as empty.
  if (/^(Не е наведен[ао]?|Нема|Не е наведена|Директно \/ Не е наведено)$/i.test(cleaned)) {
    return undefined;
  }
  return cleaned;
}

async function main() {
  console.log("Listing sent emails from Resend (read-only)…\n");

  // Paginate the full history. The list endpoint returns metadata only, so each
  // message body is fetched individually below.
  const summaries: any[] = [];
  let after: string | undefined;
  for (;;) {
    const qs = new URLSearchParams({ limit: "100" });
    if (after) qs.set("after", after);
    const page = await resend(`/emails?${qs}`);
    const batch: any[] = page.data ?? [];
    summaries.push(...batch);
    if (batch.length < 100) break;
    after = batch[batch.length - 1]?.id;
    if (!after) break;
  }

  const relevant = summaries.filter(
    (e) =>
      typeof e.subject === "string" &&
      (e.subject.includes(EMPLOYER_TAG) || e.subject.includes(CANDIDATE_TAG))
  );

  console.log(
    `${summaries.length} emails in Resend; ${relevant.length} are form-submission notifications.\n`
  );

  const full: any[] = [];
  for (const summary of relevant) {
    full.push(await resend(`/emails/${summary.id}`));
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dir = path.join(process.cwd(), "archive-snapshots");
  mkdirSync(dir, { recursive: true });
  const snapshotPath = path.join(dir, `resend-${stamp}.json`);
  writeFileSync(
    snapshotPath,
    JSON.stringify({ takenAt: new Date().toISOString(), count: full.length, emails: full }, null, 2)
  );
  console.log(`Snapshot written: ${snapshotPath}\n`);

  if (SNAPSHOT_ONLY) {
    console.log("--snapshot-only given; nothing imported.");
    return;
  }

  let imported = 0;
  let failedDelivery = 0;

  for (const email of full) {
    const body = `${email.text ?? ""}\n${email.html ? stripHtml(email.html) : ""}`;
    const isEmployer = String(email.subject).includes(EMPLOYER_TAG);

    // Worth surfacing: if the owner mailbox was bouncing (the apex-MX problem
    // in CLAUDE.md), these are leads Boris never actually saw.
    if (email.last_event && !["delivered", "sent", "opened", "clicked"].includes(email.last_event)) {
      failedDelivery++;
    }

    await archiveSubmission({
      id: `resend:${email.id}`,
      source: "resend-backfill",
      kind: isEmployer ? "EMPLOYER" : "CANDIDATE",
      fullName: isEmployer ? field(body, "Контакт лице") : field(body, "Име на кандидат"),
      companyName: isEmployer
        ? field(body, "Име на компанијата") ?? field(body, "Име на фирма")
        : undefined,
      email: field(body, "Директна е-пошта"),
      phone: field(body, "Директен телефон") ?? field(body, "Контакт телефон"),
      sector: isEmployer
        ? field(body, "Потребен индустриски сектор") ?? field(body, "Потребен сектор")
        : field(body, "Индустриски вештини и занает"),
      country: isEmployer ? undefined : field(body, "Земја на потекло"),
      experience: isEmployer ? undefined : field(body, "Години искуство"),
      hasPassport: isEmployer ? undefined : field(body, "Биометриски пасош за транспорт"),
      notes: field(body, "Специфични барања и белешки"),
      createdAt: email.created_at ? new Date(email.created_at).getTime() : undefined,
      raw: { resendId: email.id, subject: email.subject, last_event: email.last_event }
    });
    imported++;
  }

  await recordRun("resend-backfill", path.basename(snapshotPath), { inserted: imported });

  console.log(`Imported ${imported} historical form submissions into the archive.`);
  if (failedDelivery > 0) {
    console.log(
      `\n⚠  ${failedDelivery} of these never reached the inbox (bounced/failed).\n` +
        `   Those are leads that were submitted but Boris likely never saw.\n` +
        `   They are now in the archive — check /admin.`
    );
  }
  console.log("\nResend was not modified. Re-running this is safe.");
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("\nBackfill failed:", err);
    process.exit(1);
  }
);
