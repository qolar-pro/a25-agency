import { processChatMessage } from '@/lib/chatWidget';
import { runSharedHandler } from '@/lib/routeAdapter';

// POST /api/chat — chat widget message → Telegram + Redis persistence.
// Shared logic lives in lib/chatWidget.ts (unchanged).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return runSharedHandler(request, processChatMessage);
}
