import { processPriorityInterest } from '@/lib/priorityInterest';
import { runSharedHandler } from '@/lib/routeAdapter';

// POST /api/priority-interest — Priority Line demand test, step 1: store the
// lead (unverified) and email a 6-digit code. No owner notification here — that
// only happens once the code is verified (see ./verify/route.ts).
// Shared logic lives in lib/priorityInterest.ts.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return runSharedHandler(request, processPriorityInterest);
}
