import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processSubmission } from "../lib/submission.js";

// Vercel serverless function: POST /api/submit
// Vercel parses the JSON body into req.body automatically; the shared
// processSubmission handler works with any Express/Vercel-style (req, res).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }
  return processSubmission(req as any, res as any);
}
