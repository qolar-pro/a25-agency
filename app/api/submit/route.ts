import { processSubmission } from '@/lib/submission';
import { runSharedHandler } from '@/lib/routeAdapter';
import { guard } from '@/lib/publicRateLimit';

// POST /api/submit — form sourcing submission. Shared logic lives in
// lib/submission.ts (unchanged); this route is just the Next.js entry point.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Abuse throttle. Fails open, so a Redis problem can never stop a real
  // candidate applying — see lib/publicRateLimit.ts.
  const throttled = await guard(request, 'submit');
  if (throttled) return throttled;

  return runSharedHandler(request, processSubmission);
}
