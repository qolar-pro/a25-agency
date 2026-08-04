// A25 "Priority Line" demand-test handlers (Phase 8c) — framework-agnostic
// (req, res) pair, same convention as lib/chatWidget.ts's processChatMessage,
// so the App Router routes (app/api/priority-interest/*) stay thin wrappers via
// lib/routeAdapter.ts and all real logic lives here.
//
// WHAT THIS IS: a fake-door demand test. The pitch (€9.99, queue priority, a
// live WhatsApp call with Boris) is shown honestly, but nothing is charged and
// nothing is scheduled — no Stripe, no calendar, no SMS (Phase 8h). The only
// thing these two endpoints do is capture a real, email-verified lead so Boris
// can see whether anyone actually wants it.
//
// Two endpoints:
//   processPriorityInterest — step 1. Create or refresh the lead, email a
//                             6-digit code. Deliberately does NOT notify Boris:
//                             an unverified submission is not yet a real person.
//   processPriorityVerify   — step 2. Check the code. Only on success does the
//                             confirmation email go out and Boris get pinged,
//                             so every Telegram alert he sees is a verified lead.
//
// Fail-open on delivery, per the convention in lib/chatWidget.ts and
// lib/email.ts: the lead is persisted before any email/Telegram attempt, and a
// downstream outage never turns into an error the visitor sees. The one thing
// that must not fail silently is the visitor's own data, and that is written
// first.

import {
  createOrRefreshLead,
  getLeadByEmail,
  markLeadVerified,
  registerFailedOtpAttempt,
  MAX_OTP_ATTEMPTS,
  type PassportStatus,
  type PriorityLead
} from "./priorityInterestStore.js";
import { priorityOtpEmail, priorityVerifiedEmail } from "./priorityEmailTemplates.js";
import { sendEmailViaResend } from "./email.js";
import { getOwnerChatIds, sendTelegramMessage } from "./telegram.js";
import { detectFromHeader, rememberLanguage, type Language } from "./languageDetect.js";

const PASSPORT_VALUES: PassportStatus[] = ["none", "passport", "biometric"];

// Deliberately loose — enough to reject an obvious typo, not a full RFC 5322
// validator. The OTP round-trip is the real proof the address exists.
const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

const readAcceptLanguage = (req: any): string | undefined =>
  req.headers?.["accept-language"] ?? req.headers?.["Accept-Language"];

// Trim every string field once, so downstream code (and Redis keys) never see
// stray whitespace from a mobile keyboard.
const str = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

// ---------------------------------------------------------------------------
// Step 1 — POST /api/priority-interest
// ---------------------------------------------------------------------------

export async function processPriorityInterest(req: any, res: any) {
  const body = req.body ?? {};

  const email = str(body.email).toLowerCase();
  const firstName = str(body.firstName);
  const surname = str(body.surname);
  const country = str(body.country);
  const profession = str(body.profession);
  const passportStatus = str(body.passportStatus) as PassportStatus;
  const whatsappNumber = str(body.whatsappNumber);

  if (!email || !firstName || !surname || !country || !profession || !passportStatus) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (email, firstName, surname, country, profession, passportStatus)."
    });
  }

  if (!looksLikeEmail(email)) {
    return res.status(400).json({ success: false, message: "That email address doesn't look valid." });
  }

  if (!PASSPORT_VALUES.includes(passportStatus)) {
    return res.status(400).json({
      success: false,
      message: `passportStatus must be one of: ${PASSPORT_VALUES.join(", ")}.`
    });
  }

  // Same language-detection path live chat uses: the Accept-Language header is
  // already on every request server-side, so no client JS is involved. Written
  // back to the one shared client-lang index (lib/languageDetect.ts) rather
  // than re-solved per feature.
  const language: Language = detectFromHeader(readAcceptLanguage(req));

  rememberLanguage(email, language).catch(err => {
    console.log(`[A25 PRIORITY] rememberLanguage failed for ${email}: ${err.message}`);
  });

  const { lead, outcome } = await createOrRefreshLead({
    email,
    firstName,
    surname,
    country,
    profession,
    passportStatus,
    ...(whatsappNumber ? { whatsappNumber } : {}),
    language
  });

  // Already completed the flow: no second lead, no new code, no second
  // Telegram alert for the same person. Hand back the existing applicationId so
  // the UI can jump straight to the thank-you screen instead of dead-ending on
  // an OTP form for a code that was never sent. The id is an identifier, never
  // a secret (see lib/priorityInterestStore.ts) — nothing is reachable by it.
  if (outcome === "already-verified") {
    console.log(`[A25 PRIORITY] ${email} already verified — returning existing ${lead.applicationId}.`);
    return res.json({ success: true, alreadyVerified: true, applicationId: lead.applicationId });
  }

  // Email is the only OTP channel in this phase (Phase 8h: no SMS provider).
  const otpEmail = priorityOtpEmail({
    firstName: lead.firstName,
    code: lead.otpCode,
    language
  });
  const delivery = await sendEmailViaResend({ to: lead.email, ...otpEmail });

  if (!delivery.sent) {
    // Fail-open: the lead is already stored and the visitor can retry step 1 to
    // regenerate a code. In local dev (no RESEND_API_KEY) sendEmailViaResend
    // prints the whole email — including the code — to the server console,
    // which is how the flow is testable without Resend configured.
    console.log(`[A25 PRIORITY] OTP email not sent to ${lead.email}: ${delivery.error}`);
  }

  return res.json({
    success: true,
    outcome,
    // Surfaced so the UI can hint "check the server console" in local dev,
    // matching the `simulated` flag the chat widget already returns.
    simulated: !delivery.sent
  });
}

// ---------------------------------------------------------------------------
// Step 2 — POST /api/priority-interest/verify
// ---------------------------------------------------------------------------

// Machine-readable failure reasons the modal maps to its own localized copy.
// Kept as a small closed set so the UI never has to string-match prose.
export type PriorityVerifyReason = "not-found" | "expired" | "wrong-code" | "too-many-attempts";

function ownerAlertText(lead: PriorityLead): string {
  const lines = [
    "PRIORITY LINE — verified interest",
    "",
    `Application: ${lead.applicationId}`,
    `Name: ${lead.firstName} ${lead.surname}`,
    `Email: ${lead.email}`,
    `Country: ${lead.country}`,
    `Profession: ${lead.profession}`,
    `Passport: ${lead.passportStatus}`,
    `WhatsApp: ${lead.whatsappNumber || "not provided"}`,
    `Language: ${lead.language || "unknown"}`,
    "",
    "Email verified — this is a real address. Nothing was charged (demand test)."
  ];
  return lines.join("\n");
}

export async function processPriorityVerify(req: any, res: any) {
  const body = req.body ?? {};

  const email = str(body.email).toLowerCase();
  // Accept a code pasted with spaces/dashes from an email client.
  const code = str(body.code).replace(/\D/g, "");

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (email and code are required)."
    });
  }

  const lead = await getLeadByEmail(email);

  // Logical verification failures answer 200 with a reason rather than an HTTP
  // error: they're expected outcomes of a form, and the modal renders the
  // reason inline. 400s are reserved for a malformed request.
  if (!lead) {
    return res.json({ success: false, reason: "not-found" satisfies PriorityVerifyReason });
  }

  // Idempotent: a double-submit (or a refresh) shouldn't punish the visitor or
  // re-alert Boris about someone he's already been told about.
  if (lead.verified) {
    return res.json({ success: true, applicationId: lead.applicationId });
  }

  if (lead.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return res.json({ success: false, reason: "too-many-attempts" satisfies PriorityVerifyReason });
  }

  if (Date.now() > lead.otpExpiresAt) {
    return res.json({ success: false, reason: "expired" satisfies PriorityVerifyReason });
  }

  if (code !== lead.otpCode) {
    const attempts = await registerFailedOtpAttempt(lead);
    const lockedOut = attempts >= MAX_OTP_ATTEMPTS;
    return res.json({
      success: false,
      reason: (lockedOut ? "too-many-attempts" : "wrong-code") satisfies PriorityVerifyReason,
      attemptsRemaining: Math.max(0, MAX_OTP_ATTEMPTS - attempts)
    });
  }

  await markLeadVerified(lead);

  const language = lead.language || detectFromHeader(readAcceptLanguage(req));

  // Confirmation email — fail-open, so a Resend outage can't cost the visitor
  // their (already persisted) verified status.
  const confirmation = priorityVerifiedEmail({
    firstName: lead.firstName,
    applicationId: lead.applicationId,
    language
  });
  sendEmailViaResend({ to: lead.email, ...confirmation })
    .then(result => {
      if (!result.sent) {
        console.log(`[A25 PRIORITY] Confirmation email not sent to ${lead.email}: ${result.error}`);
      }
    })
    .catch(err => {
      console.log(`[A25 PRIORITY] Confirmation email dispatch error: ${err.message}`);
    });

  // Owner alert — verified leads only, so every ping Boris gets is a real
  // person. Fan out to each owner chat independently (one blocked chat must not
  // stop the others); the loop lives here rather than in lib/telegram.ts
  // because this caller only cares whether at least one owner was reached.
  const chatIds = getOwnerChatIds();
  const alert = ownerAlertText(lead);

  if (chatIds.length === 0) {
    console.log("[A25 PRIORITY] TELEGRAM_CHAT_ID missing — owner alert simulated locally:");
    console.log(alert);
  } else {
    const sends = await Promise.all(chatIds.map(chatId => sendTelegramMessage(chatId, alert)));
    if (!sends.some(s => s.ok)) {
      console.log(`[A25 PRIORITY] Owner alert undelivered for ${lead.applicationId}: ${sends[0]?.error}`);
    }
  }

  return res.json({ success: true, applicationId: lead.applicationId });
}
