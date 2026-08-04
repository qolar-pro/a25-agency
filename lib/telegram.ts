// A25 Telegram primitives — the two low-level pieces every Telegram caller
// needs, extracted (Phase 8a) from the near-identical copies that had grown in
// lib/chatWidget.ts and lib/chatReplyWebhook.ts before a third caller
// (lib/priorityInterest.ts) was added.
//
// Deliberately ONLY the two primitives: parsing the owner chat list, and
// sending one message to one chat. The fan-out loop stays with each caller —
// chatWidget needs the per-chat message_id back for its reply-mapping index,
// the webhook's confirmations don't, and the priority-lead alert only cares
// whether at least one owner got it. Sharing the loop as well would mean one
// abstraction serving three different needs badly.
//
// Fail-open, matching the convention in lib/email.ts and lib/chatWidget.ts:
// sendTelegramMessage never throws. A visitor's own action must never be lost
// because a downstream Telegram delivery failed — callers log and carry on.

// Owner chat IDs from TELEGRAM_CHAT_ID, comma-separated so more than one owner
// (e.g. Boris + the developer) can each get their own copy and reply/command
// independently. Empty entries are filtered so a trailing comma is harmless.
export function getOwnerChatIds(): string[] {
  return (process.env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map(id => id.trim())
    .filter(Boolean);
}

export interface TelegramSendResult {
  ok: boolean;
  messageId?: number;
  error?: string;
}

// Send one plain-text message to one chat.
//
// Plain text only — no parse_mode. Markdown/HTML mode would choke on
// unescaped visitor input like "*", "_" or "<" and fail the whole send.
//
// Returns { ok: false, error } instead of throwing on every failure path:
// missing bot token (dev), network/timeout, or a Telegram API error.
export async function sendTelegramMessage(
  chatId: string | number,
  text: string
): Promise<TelegramSendResult> {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    console.log(`[A25 TELEGRAM] TELEGRAM_BOT_TOKEN missing — would have sent to ${chatId}:`);
    console.log(text);
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data: any = await response.json();

    if (response.ok && data.ok) {
      return { ok: true, messageId: data.result?.message_id };
    }

    console.error(`[A25 TELEGRAM] API error for chat ${chatId}:`, data);
    return { ok: false, error: data.description || "Telegram API error" };
  } catch (err: any) {
    console.error(`[A25 TELEGRAM] Dispatch failed for chat ${chatId}:`, err.message);
    return { ok: false, error: err.message };
  }
}
