import { processGetChatMessages } from '@/lib/chatMessages';
import { runSharedHandler } from '@/lib/routeAdapter';

// GET /api/chat-messages?conversationId=... — polled by the chat widget while
// its panel is open. Shared logic lives in lib/chatMessages.ts (unchanged).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return runSharedHandler(request, processGetChatMessages);
}
