// Telegram notifications for /admin sign-in activity.
//
// The point is that an unauthorised login cannot happen silently. Rate limiting
// makes guessing impractical; this makes a *successful* entry visible — which is
// the case that matters if the password ever leaks through some other route.
//
// Reuses lib/telegram.ts and the owner chat list already configured for chat
// replies and Priority Line alerts. No new service, no new credentials.
//
// Fail-open, per the convention in lib/telegram.ts: a Telegram outage must never
// prevent Boris from signing in to his own dashboard.

import { getOwnerChatIds, sendTelegramMessage } from "../telegram.js";

// Reduce an IP to something recognisable without logging the full address into
// a chat history: enough to tell "same place as usual" from "somewhere new".
function maskIp(ip: string): string {
  if (ip === "unknown") return "unknown";
  if (ip.includes(":")) {
    // IPv6 — keep the routing prefix only.
    const parts = ip.split(":").filter(Boolean);
    return parts.slice(0, 2).join(":") + ":···";
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.×`;
  return ip;
}

async function notifyOwners(text: string): Promise<void> {
  const chatIds = getOwnerChatIds();
  // Sequential rather than parallel: this is at most a couple of chats, and a
  // burst of simultaneous sends is more likely to hit Telegram's rate limit.
  for (const chatId of chatIds) {
    await sendTelegramMessage(chatId, text);
  }
}

export async function alertSuccessfulLogin(ip: string, userAgent: string): Promise<void> {
  try {
    await notifyOwners(
      "🔓 A25 Lead Archive — signed in\n\n" +
        `From: ${maskIp(ip)}\n` +
        `Device: ${(userAgent || "unknown").slice(0, 80)}\n` +
        `Time: ${new Date().toUTCString()}\n\n` +
        "If this wasn't you, change ADMIN_PASSWORD in Vercel immediately."
    );
  } catch (err) {
    console.error("[A25 Admin] Login alert failed:", err);
  }
}

export async function alertLockout(ip: string, global: boolean): Promise<void> {
  try {
    await notifyOwners(
      "🚨 A25 Lead Archive — sign-in blocked\n\n" +
        (global
          ? "The GLOBAL attempt limit tripped — repeated failures from many addresses. " +
            "This looks like an automated attack rather than a forgotten password.\n\n"
          : `Too many failed attempts from ${maskIp(ip)}.\n\n`) +
        "Sign-in is locked for 15 minutes. No access was granted."
    );
  } catch (err) {
    console.error("[A25 Admin] Lockout alert failed:", err);
  }
}
