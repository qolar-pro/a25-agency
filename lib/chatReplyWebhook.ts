// A25 Telegram webhook — receives updates for the bot and, when the owner
// replies (using Telegram's native "Reply" action on a forwarded visitor
// message), appends that reply to the matching conversation and emails the
// visitor a notification.
//
// Telegram requires a fast 200 OK ack or it will retry/back off, so every
// path here responds quickly regardless of outcome — a plain message (not a
// reply), an unmatched reply, or an email-send failure are all silently
// no-op'd rather than surfaced as webhook errors.

import { getConversationIdByTelegramMessageId, appendMessage, getConversation } from "./chatStore";
import { sendEmailViaResend } from "./email";

export async function processTelegramWebhook(req: any, res: any) {
  const replyToId = req.body?.message?.reply_to_message?.message_id;
  const replyText = req.body?.message?.text;

  if (!replyToId || !replyText) {
    // Not a reply to a forwarded visitor message (e.g. the owner sent a
    // plain message, or this is some other update type) — nothing to do.
    return res.status(200).json({ ok: true });
  }

  const conversationId = await getConversationIdByTelegramMessageId(replyToId);
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

  const emailResult = await sendEmailViaResend({
    to: conversation.visitorEmail,
    subject: "A25 replied to your message",
    text: `Hi ${conversation.visitorName},\n\nWe replied to your message:\n\n"${replyText}"\n\nYou can continue the conversation on our site, or just reply to this email.\n\n— A25`,
    html: `<p>Hi ${conversation.visitorName},</p><p>We replied to your message:</p><blockquote style="border-left:3px solid #013a63;margin:0;padding-left:12px;color:#333;">${replyText}</blockquote><p>You can continue the conversation on our site, or just reply to this email.</p><p>— A25</p>`
  });

  if (!emailResult.sent) {
    console.log(`[A25 CHAT WEBHOOK] Reply saved for ${conversationId}, but notification email was not sent: ${emailResult.error}`);
  }

  return res.status(200).json({ ok: true });
}
