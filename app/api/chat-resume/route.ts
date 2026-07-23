import { processChatResume } from '@/lib/chatResume';
import { runSharedHandler } from '@/lib/routeAdapter';

// POST /api/chat-resume — resume-by-email lookup for the chat widget's
// "Have you chatted with us before?" step. Shared logic lives in
// lib/chatResume.ts (the single source of truth).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return runSharedHandler(request, processChatResume);
}
