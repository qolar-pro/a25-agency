import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { processSubmission } from "./lib/submission";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// API: Direct Form Sourcing Submission Route
// Shared handler lives in lib/submission.ts so the Vercel function
// (api/submit.ts) and this dev server stay in sync.
app.post("/api/submit", (req, res) => processSubmission(req, res));

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
