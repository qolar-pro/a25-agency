// Authentication for /admin.
//
// The archive holds names, emails, phone numbers, passport status and full chat
// transcripts for real people. That rules out the usual shortcuts — a secret
// URL, or a password compared with `===`. What's here instead:
//
//   • the password is compared with timingSafeEqual, so response timing can't
//     be used to recover it character by character;
//   • the session cookie is an HMAC over its own expiry, so it can't be forged
//     or extended by editing the cookie value;
//   • the cookie is httpOnly + sameSite=lax, so page scripts can't read it and
//     it isn't sent on cross-site requests.
//
// Both secrets come from the environment and have NO fallback default: if
// ADMIN_PASSWORD is unset the dashboard refuses every login rather than
// silently accepting a well-known default.

import crypto from "node:crypto";

export const ADMIN_COOKIE = "a25_admin";
const SESSION_HOURS = 12;

const password = () => process.env.ADMIN_PASSWORD || "";
// Falls back to the password itself so a missing ADMIN_SESSION_SECRET degrades
// to "still signed, just with one secret" rather than "signed with a constant".
const secret = () => process.env.ADMIN_SESSION_SECRET || password();

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

// Constant-time compare that also tolerates length mismatch (timingSafeEqual
// throws on differing lengths, which would itself leak length via the error).
function equal(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function checkPassword(candidate: string): boolean {
  const expected = password();
  if (!expected) return false;
  // Hash both sides first so the compare is always over equal-length buffers,
  // regardless of what was submitted.
  const h = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
  return equal(h(candidate ?? ""), h(expected));
}

export function issueSession(): { value: string; maxAge: number } {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expires);
  return { value: `${payload}.${sign(payload)}`, maxAge: SESSION_HOURS * 60 * 60 };
}

export function verifySession(cookieValue: string | undefined): boolean {
  if (!cookieValue || !password()) return false;
  const [payload, mac] = cookieValue.split(".");
  if (!payload || !mac) return false;
  if (!equal(mac, sign(payload))) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && expires > Date.now();
}
