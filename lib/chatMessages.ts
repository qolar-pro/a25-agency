// A25 chat message polling — framework-agnostic. Shared by the local dev
// server (server.ts) and the Vercel serverless function (api/chat-messages.ts).
// The widget polls this while its panel is open to pick up owner replies.

import { getConversation } from "./chatStore";

export async function processGetChatMessages(req: any, res: any) {
  const conversationId = req.query?.conversationId;

  if (!conversationId || typeof conversationId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Missing required query parameter: conversationId."
    });
  }

  const conversation = await getConversation(conversationId);

  // No conversation yet (e.g. the first poll fires before the first message
  // has been sent) is a normal state, not an error.
  return res.json({
    success: true,
    messages: conversation?.messages ?? []
  });
}
