// A25 Telegram webhook — receives updates for the bot and, when the owner
// replies (using Telegram's native "Reply" action on a forwarded visitor
// message), appends that reply to the matching conversation and emails the
// visitor a notification.
//
// Telegram requires a fast 200 OK ack or it will retry/back off, so every
// path here responds quickly regardless of outcome — a plain message (not a
// reply), an unmatched reply, or an email-send failure are all silently
// no-op'd rather than surfaced as webhook errors.

import { getConversationIdByTelegramMessageId, appendMessage, getConversation, deleteConversation } from "./chatStore.js";
import { sendEmailViaResend } from "./email.js";
import { chatAnsweredEmail } from "./chatEmailTemplates.js";
import { createOrder, updateOrderStatus, type OrderStatus } from "./orderStore.js";
import { getKnownLanguage, normalizeLanguage, type Language } from "./languageDetect.js";
import { orderCompletedEmail } from "./orderEmailTemplates.js";
import { getOwnerChatIds, sendTelegramMessage } from "./telegram.js";

// Base URL for the client-facing /track/<token> link included in Boris's
// Telegram confirmation. a25.mk is the production domain; overridable via
// SITE_URL if the host ever changes.
const SITE_URL = (process.env.SITE_URL || "https://a25.mk").replace(/\/$/, "");

const UPDATABLE_STATUSES: OrderStatus[] = ["pending", "accepted", "processing", "done"];

// Handle the two /order sub-commands (owner-only; caller has already verified
// the sender is Boris's chat). Returns true if the message was an /order
// command (handled), false if it wasn't and the caller should keep processing.
async function handleOrderCommand(
  messageText: string,
  senderChatId: string | number,
  // Injected sender — lib/telegram.ts's sendTelegramMessage in practice. Typed
  // loosely on the return value because this function only ever fires-and-
  // -forgets confirmations; it never inspects the send result.
  sendReply: (chatId: string | number, text: string) => Promise<unknown>
): Promise<boolean> {
  const trimmed = messageText.trim();
  if (!trimmed.startsWith("/order")) return false;

  // Tokens after "/order": either
  //   <email> started [LANG]         → create
  //   update <email> <status>        → status update
  const rest = trimmed.slice("/order".length).trim();
  const parts = rest.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    await sendReply(
      senderChatId,
      "Usage:\n/order <email> started [LANG]\n/order update <email> <status>\n(status: pending | accepted | processing | done)"
    );
    return true;
  }

  // --- /order update <email> <status> ---
  if (parts[0].toLowerCase() === "update") {
    const email = parts[1];
    const statusRaw = (parts[2] || "").toLowerCase();

    if (!email || !statusRaw) {
      await sendReply(senderChatId, "Usage: /order update <email> <status>\n(status: pending | accepted | processing | done)");
      return true;
    }
    if (!UPDATABLE_STATUSES.includes(statusRaw as OrderStatus)) {
      await sendReply(senderChatId, `Unknown status "${statusRaw}". Use one of: pending, accepted, processing, done.`);
      return true;
    }

    const status = statusRaw as OrderStatus;
    const updated = await updateOrderStatus(email, status);
    if (!updated) {
      await sendReply(senderChatId, `No order found for ${email}. Start one first with: /order ${email} started`);
      return true;
    }

    if (status === "done") {
      // Completion email. Language priority (no request/IP available from a
      // Telegram command): manual tag captured at createOrder → stored
      // client-lang for this email → English default.
      const manual = updated.language ?? null;
      const known = manual ?? (await getKnownLanguage(email));
      const language: Language = known ?? "EN";

      const trackUrl = `${SITE_URL}/track/${updated.token}`;
      const email_ = orderCompletedEmail({ language, trackUrl });
      const result = await sendEmailViaResend({ to: email, ...email_ });

      if (result.sent) {
        await sendReply(senderChatId, `Order for ${email} marked done. Completion email sent (${language}). Record + index expire in 3 days.`);
      } else {
        // Fail-open: the status change is already persisted; only the email
        // notification failed. Tell Boris rather than silently dropping it.
        await sendReply(senderChatId, `Order for ${email} marked done, but the completion email did not send: ${result.error}. Record + index expire in 3 days.`);
      }
    } else {
      await sendReply(senderChatId, `Order for ${email} updated to "${status}".`);
    }
    return true;
  }

  // --- /order <email> started [LANG] ---
  const email = parts[0];
  const action = (parts[1] || "").toLowerCase();
  const langTag = parts[2]; // optional manual language override

  if (action !== "started") {
    await sendReply(
      senderChatId,
      `Unrecognized /order command. Use:\n/order <email> started [LANG]\n/order update <email> <status>`
    );
    return true;
  }

  // Only accept a manual language tag if it's one of the 8 supported codes;
  // normalizeLanguage coerces anything else to EN, so guard explicitly to
  // avoid silently storing "EN" for a typo'd tag as if it were intentional.
  const SUPPORTED = ["EN", "MK", "AL", "DE", "ES", "EL", "PL", "SV"];
  const language: Language | undefined =
    langTag && SUPPORTED.includes(langTag.toUpperCase())
      ? normalizeLanguage(langTag)
      : undefined;

  const order = await createOrder(email, language);
  const trackUrl = `${SITE_URL}/track/${order.token}`;
  const langNote = language ? ` (lang: ${language})` : "";
  await sendReply(senderChatId, `Order started for ${email}${langNote}.\nTrack link:\n${trackUrl}`);
  return true;
}

export async function processTelegramWebhook(req: any, res: any) {
  // Prove the request actually came from Telegram before trusting anything in
  // it.
  //
  // Everything below authenticates off req.body.message.chat.id — a value the
  // caller supplies. This endpoint is publicly reachable, so without this check
  // anyone can POST a forged body claiming to be an owner chat and then:
  //   • append a message as "owner" to a real visitor's conversation, which
  //     also emails that applicant from the A25 domain (the reply path is not
  //     owner-gated, and it keys off Telegram message ids — small sequential
  //     integers, so guessing one is trivial);
  //   • run /close to delete conversations;
  //   • run /order to create or complete orders and fire client emails.
  //
  // Telegram's own mechanism for this is setWebhook's `secret_token`, which it
  // then sends back on every call as X-Telegram-Bot-Api-Secret-Token.
  //
  // TWO-STEP ROLLOUT, deliberately: enforcement only switches on once
  // TELEGRAM_WEBHOOK_SECRET is set. Rejecting unsigned requests before the
  // webhook has been re-registered with the same secret would silently break
  // every owner reply in production. Set the env var and re-register in either
  // order — mismatched values fail closed, unset fails open with a warning.
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided = req.headers?.["x-telegram-bot-api-secret-token"];
    if (provided !== expectedSecret) {
      console.error("[A25 CHAT WEBHOOK] Rejected request with missing/invalid secret token.");
      // 200, not 401: a 401 tells a prober the endpoint exists and is guarded.
      // Telegram ignores the body either way.
      return res.status(200).json({ ok: true });
    }
  } else {
    console.warn(
      "[A25 CHAT WEBHOOK] TELEGRAM_WEBHOOK_SECRET is not set — this endpoint " +
        "is accepting UNAUTHENTICATED requests and owner commands can be forged. " +
        "See ARCHIVE.md."
    );
  }

  const messageText: string | undefined = req.body?.message?.text;
  const senderChatId = req.body?.message?.chat?.id;

  // Owner commands (e.g. /close) are only honored from one of the owners'
  // chats — TELEGRAM_CHAT_ID, comma-separated when more than one owner (e.g.
  // Boris + the developer) shares the bot (parsed by the shared helper in
  // lib/telegram.ts). Anyone else messaging the bot is ignored for commands.
  const OWNER_CHAT_IDS = getOwnerChatIds();
  const isOwner = senderChatId != null && OWNER_CHAT_IDS.includes(String(senderChatId));

  // /close <conversationId> — owner-only. Deletes the conversation record plus
  // its email/reply index entries, then confirms back in Telegram.
  if (isOwner && typeof messageText === "string" && messageText.trim().startsWith("/close")) {
    const conversationId = messageText.trim().slice("/close".length).trim();

    if (!conversationId) {
      await sendTelegramMessage(senderChatId, "Usage: /close <conversationId>");
      return res.status(200).json({ ok: true });
    }

    const deleted = await deleteConversation(conversationId);
    if (deleted) {
      await sendTelegramMessage(senderChatId, `Conversation ${conversationId} closed and deleted.`);
    } else {
      await sendTelegramMessage(senderChatId, `No conversation found for ${conversationId}. Nothing deleted.`);
    }
    return res.status(200).json({ ok: true });
  }

  // /order ... — owner-only order tracking commands (Phase 7). Same owner
  // gate as /close above. handleOrderCommand returns true once it recognizes
  // and handles an /order message, so we ack and stop here.
  if (isOwner && typeof messageText === "string" && messageText.trim().startsWith("/order")) {
    await handleOrderCommand(messageText, senderChatId, sendTelegramMessage);
    return res.status(200).json({ ok: true });
  }

  const replyToId = req.body?.message?.reply_to_message?.message_id;
  const replyText = messageText;

  if (!replyToId || !replyText) {
    // Not a reply to a forwarded visitor message (e.g. the owner sent a
    // plain message, or this is some other update type) — nothing to do.
    return res.status(200).json({ ok: true });
  }

  const conversationId = await getConversationIdByTelegramMessageId(senderChatId, replyToId);
  if (!conversationId) {
    console.log(`[A25 CHAT WEBHOOK] No conversation found for Telegram message ${replyToId}.`);
    return res.status(200).json({ ok: true });
  }

  const conversation = await appendMessage(conversationId, {
    role: "owner",
    text: replyText,
    timestamp: Date.now()
  });

  if (!conversation) {
    console.error(`[A25 CHAT WEBHOOK] Conversation ${conversationId} vanished before reply could be saved.`);
    return res.status(200).json({ ok: true });
  }

  const answered = chatAnsweredEmail({
    visitorName: conversation.visitorName,
    replyText,
    language: conversation.language
  });
  const emailResult = await sendEmailViaResend({
    to: conversation.visitorEmail,
    ...answered
  });

  if (!emailResult.sent) {
    console.log(`[A25 CHAT WEBHOOK] Reply saved for ${conversationId}, but notification email was not sent: ${emailResult.error}`);
  }

  return res.status(200).json({ ok: true });
}
