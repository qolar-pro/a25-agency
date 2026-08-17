import { processChatMessage } from '@/lib/chatWidget';
import { runSharedHandler } from '@/lib/routeAdapter';
import { guard } from '@/lib/publicRateLimit';

// POST /api/chat — chat widget message → Telegram + Redis persistence.
// Shared logic lives in lib/chatWidget.ts (unchanged).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Abuse throttle. Fails open, so a Redis problem can never stop a real
  // candidate applying — see lib/publicRateLimit.ts.
  const throttled = await guard(request, 'chat');
  if (throttled) return throttled;

  return runSharedHandler(request, processChatMessage);
}
