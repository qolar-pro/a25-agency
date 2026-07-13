import { processTelegramWebhook } from '@/lib/chatReplyWebhook';
import { runSharedHandler } from '@/lib/routeAdapter';

// POST /api/telegram-webhook — receives Telegram updates (owner replies).
// Registered with Telegram via setWebhook once deployed. Shared logic lives
// in lib/chatReplyWebhook.ts (unchanged).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return runSharedHandler(request, processTelegramWebhook);
}
