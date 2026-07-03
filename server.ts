import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { processSubmission } from "./lib/submission";
import { processChatMessage } from "./lib/chatWidget";
import { processGetChatMessages } from "./lib/chatMessages";
import { processTelegramWebhook } from "./lib/chatReplyWebhook";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing middleware
app.use(express.json());

// API: Direct Form Sourcing Submission Route
// Shared handler lives in lib/submission.ts so the Vercel function
// (api/submit.ts) and this dev server stay in sync.
app.post("/api/submit", (req, res) => processSubmission(req, res));

// API: Chat Widget Notification Route
// Shared handler lives in lib/chatWidget.ts so the Vercel function
// (api/chat.ts) and this dev server stay in sync.
app.post("/api/chat", (req, res) => processChatMessage(req, res));

// API: Chat Message Polling Route (widget polls this while its panel is open)
app.get("/api/chat-messages", (req, res) => processGetChatMessages(req, res));

// API: Telegram Webhook Route (owner replies land here once setWebhook is registered)
app.post("/api/telegram-webhook", (req, res) => processTelegramWebhook(req, res));

// Vite and static build server pipeline middleware configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite development server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production built assets directly
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[A25 SERVER] Online & listening on port ${PORT}`);
    console.log(`[A25 SERVER] Mode: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
