import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processTelegramWebhook } from "../lib/chatReplyWebhook";

// Vercel serverless function: POST /api/telegram-webhook
// Registered with Telegram via setWebhook once this is deployed with a real
// HTTPS URL (see .env.example for the one-time setup command). Vercel parses
// the JSON body into req.body automatically.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }
  return processTelegramWebhook(req as any, res as any);
}
