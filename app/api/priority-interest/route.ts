import { processPriorityInterest } from '@/lib/priorityInterest';
import { runSharedHandler } from '@/lib/routeAdapter';
import { guard } from '@/lib/publicRateLimit';

// POST /api/priority-interest — Priority Line demand test, step 1: store the
// lead (unverified) and email a 6-digit code. No owner notification here — that
// only happens once the code is verified (see ./verify/route.ts).
// Shared logic lives in lib/priorityInterest.ts.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Abuse throttle. Fails open, so a Redis problem can never stop a real
  // candidate applying — see lib/publicRateLimit.ts.
  const throttled = await guard(request, 'priority');
  if (throttled) return throttled;

  return runSharedHandler(request, processPriorityInterest);
}
