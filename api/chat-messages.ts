import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processGetChatMessages } from "../lib/chatMessages.js";

// Vercel serverless function: GET /api/chat-messages?conversationId=...
// Polled by the chat widget while its panel is open.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }
  return processGetChatMessages(req as any, res as any);
}
