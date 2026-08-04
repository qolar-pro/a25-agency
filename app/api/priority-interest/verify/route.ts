import { processPriorityVerify } from '@/lib/priorityInterest';
import { runSharedHandler } from '@/lib/routeAdapter';

// POST /api/priority-interest/verify — Priority Line demand test, step 2: check
// the emailed code. On success it marks the lead verified, emails the
// applicationId and alerts the owner on Telegram; on failure it answers with a
// machine-readable `reason` (expired / wrong-code / too-many-attempts) the modal
// renders inline. Shared logic lives in lib/priorityInterest.ts.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return runSharedHandler(request, processPriorityVerify);
}
