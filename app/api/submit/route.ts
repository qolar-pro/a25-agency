import { processSubmission } from '@/lib/submission';
import { runSharedHandler } from '@/lib/routeAdapter';

// POST /api/submit — form sourcing submission. Shared logic lives in
// lib/submission.ts (unchanged); this route is just the Next.js entry point.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return runSharedHandler(request, processSubmission);
}
