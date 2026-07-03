import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processChatMessage } from "../lib/chatWidget.js";

// Vercel serverless function: POST /api/chat
// Vercel parses the JSON body into req.body automatically; the shared
// processChatMessage handler works with any Express/Vercel-style (req, res).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }
  return processChatMessage(req as any, res as any);
}
