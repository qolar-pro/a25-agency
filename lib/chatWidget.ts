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
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Plain text only — no parse_mode. Markdown/HTML mode would choke on
  // unescaped visitor input like "*", "_", or "<" and fail the whole send.
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

  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("[A25 CHAT WIDGET] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing — simulating locally:");
    console.log(text);
    return finish({
      simulated: true,
      message: "Message received (dev mode — Telegram not configured)."
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data: any = await telegramResponse.json();

    if (telegramResponse.ok && data.ok) {
      console.log(`[A25 CHAT WIDGET] Message delivered to Telegram chat ${CHAT_ID}.`);
      // Record which Telegram message this was, so a "Reply" to it in
      // Telegram can be routed back to this exact conversation later.
      if (data.result?.message_id) {
        await recordTelegramMessageMapping(data.result.message_id, conversationId);
      }
      return finish({ simulated: false });
    }

    console.error("[A25 CHAT WIDGET] Telegram API error:", data);
    return finish({
      simulated: true,
      message: "Message received but delivery is delayed. We will still follow up.",
      error: data.description || "Telegram API error"
    });
  } catch (err: any) {
    console.error("[A25 CHAT WIDGET] Telegram dispatch failed:", err.message);
    return finish({
      simulated: true,
      message: "Message received but delivery is delayed. We will still follow up.",
      error: err.message
    });
  }
}
