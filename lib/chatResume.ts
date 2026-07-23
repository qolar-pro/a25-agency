// A25 chat resume-by-email lookup — framework-agnostic, shared by the Next.js
// Route Handler (app/api/chat-resume/route.ts) via lib/routeAdapter.ts. The
// chat widget's "Have you chatted with us before?" step posts an email here;
// if a still-live conversation exists for that email we hand back its
// conversationId + messages so the widget can drop the visitor straight into
// their open thread instead of the fresh name/email form.
//
// Mirrors the fail-open convention of the other chat handlers: a miss (no
// conversation, expired conversation, or a lookup blip) is a normal "start
// fresh" result, never surfaced to the visitor as an error.

import { getConversationIdByEmail, getConversation } from "./chatStore.js";

export async function processChatResume(req: any, res: any) {
  const { email } = req.body ?? {};

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      message: "Missing required field: email."
    });
  }

  const conversationId = await getConversationIdByEmail(email);
  if (!conversationId) {
    return res.json({ success: true, found: false });
  }

  const conversation = await getConversation(conversationId);
  if (!conversation) {
    // Index pointed at a conversation that has since expired/been closed —
    // treat as no open chat, the visitor just starts a new one.
    return res.json({ success: true, found: false });
  }

  return res.json({
    success: true,
    found: true,
    conversationId,
    visitorName: conversation.visitorName,
    visitorEmail: conversation.visitorEmail,
    messages: conversation.messages ?? []
  });
}
