// A25 chat widget processing — framework-agnostic Telegram notification +
// conversation persistence. Shared by the local dev server (server.ts) and
// the Vercel serverless function (api/chat.ts). Accepts any Express/Vercel
// -style (req, res) pair.
//
// Fail-open by design, mirroring lib/submission.ts's Resend dispatch: a
// visitor never sees a failure here, even if Telegram delivery breaks —
// failures are logged server-side only. The visitor's own message is always
// saved to the conversation regardless of Telegram delivery outcome, so
// their thread never silently drops what they typed.

import {
  getConversation,
  createConversation,
  appendMessage,
  recordTelegramMessageMapping
} from "./chatStore.js";
import { chatReceivedEmail } from "./chatEmailTemplates.js";
import { sendEmailViaResend } from "./email.js";
import { detectFromHeader, rememberLanguage } from "./languageDetect.js";
import { getOwnerChatIds, sendTelegramMessage } from "./telegram.js";

export async function processChatMessage(req: any, res: any) {
  const { conversationId, name, email, message } = req.body ?? {};

  if (!conversationId || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (conversationId and message are required)."
    });
  }

  let conversation = await getConversation(conversationId);

  if (!conversation) {
    // First message in this conversation — name/email are required so the
    // owner knows who they're talking to and the reply-notification email
    // has somewhere to go.
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (name and email are required for a new conversation)."
      });
    }

    const detectedLanguage = detectFromHeader(
      req.headers?.["accept-language"] ?? req.headers?.["Accept-Language"]
    );
    conversation = await createConversation(conversationId, name, email, detectedLanguage);

    // Write to the shared client-lang index so later features (order tracking's
    // completion email, the /track page) read one source of truth rather than
    // re-detecting. Fail-open — a Redis hiccup here must not block the chat.
    rememberLanguage(email, detectedLanguage).catch(err => {
      console.log(`[A25 CHAT WIDGET] rememberLanguage failed for ${email}: ${err.message}`);
    });

    // Fail-open: fire confirmation email but never let a delivery failure
    // block the visitor's message from being saved and forwarded to Telegram.
    const received = chatReceivedEmail({ visitorName: name, language: detectedLanguage });
    sendEmailViaResend({ to: email, ...received }).then(result => {
      if (!result.sent) {
        console.log(`[A25 CHAT WIDGET] Chat-received email not sent to ${email}: ${result.error}`);
      }
    }).catch(err => {
      console.log(`[A25 CHAT WIDGET] Chat-received email dispatch error: ${err.message}`);
    });
  }

  // Save the visitor's message immediately, before attempting Telegram
  // delivery, so it's never lost even if the Telegram call fails below.
  await appendMessage(conversationId, {
    role: "visitor",
    text: message,
    timestamp: Date.now()
  });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  // Owner chat list (comma-separated TELEGRAM_CHAT_ID) — parsed by the shared
  // helper in lib/telegram.ts, same list the owner-command gate in
  // lib/chatReplyWebhook.ts checks against.
  const CHAT_IDS = getOwnerChatIds();

  const text = `From: ${conversation.visitorName} (${conversation.visitorEmail})\nID: ${conversationId}\n\n${message}`;

  const finish = async (result: { simulated: boolean; message?: string; error?: string }) => {
    const finalConversation = await getConversation(conversationId);
    return res.json({
      success: true,
      simulated: result.simulated,
      message: result.message,
      error: result.error,
      conversationId,
      messages: finalConversation?.messages ?? []
    });
  };

  if (!BOT_TOKEN || CHAT_IDS.length === 0) {
    console.log("[A25 CHAT WIDGET] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing — simulating locally:");
    console.log(text);
    return finish({
      simulated: true,
      message: "Message received (dev mode — Telegram not configured)."
    });
  }

  // Fan out to every configured chat independently — one owner's chat being
  // unreachable (blocked the bot, etc.) must not stop delivery to the others.
  // The loop stays here (rather than in lib/telegram.ts) because this caller is
  // the only one that needs each chat's message_id back, to build the
  // reply-mapping index that routes owner replies to the right conversation.
  const sends = await Promise.all(
    CHAT_IDS.map(async chatId => {
      const result = await sendTelegramMessage(chatId, text);

      if (result.ok) {
        console.log(`[A25 CHAT WIDGET] Message delivered to Telegram chat ${chatId}.`);
        if (result.messageId) {
          await recordTelegramMessageMapping(chatId, result.messageId, conversationId);
        }
      }

      return result;
    })
  );

  const anySucceeded = sends.some(s => s.ok);
  if (anySucceeded) {
    return finish({ simulated: false });
  }

  return finish({
    simulated: true,
    message: "Message received but delivery is delayed. We will still follow up.",
    error: sends[0]?.error || "Telegram API error"
  });
}
