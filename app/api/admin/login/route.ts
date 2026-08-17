import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, issueSession } from "../../../../lib/archive/adminAuth.js";
import {
  checkRateLimit,
  clearFailures,
  clientIp,
  registerFailure
} from "../../../../lib/archive/rateLimit.js";
import { alertLockout, alertSuccessfulLogin } from "../../../../lib/archive/adminAlerts.js";

// Deliberately a form POST rather than JSON + fetch: it works with the browser's
// native password manager, and it keeps the password out of any client-side JS.
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const ip = clientIp(request);

  // Rate limit BEFORE checking the password, so a locked-out attacker gets no
  // signal at all about whether their guess was right.
  const verdict = await checkRateLimit(ip);
  if (!verdict.allowed) {
    await alertLockout(ip, !!verdict.global);
    return NextResponse.redirect(`${origin}/admin/login?error=locked`, { status: 303 });
  }

  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  if (!checkPassword(password)) {
    await registerFailure(ip);
    // A fixed delay on failure, so repeated guesses can't be pipelined quickly.
    await new Promise((r) => setTimeout(r, 600));
    const left = Math.max(0, verdict.remaining - 1);
    return NextResponse.redirect(`${origin}/admin/login?error=1&left=${left}`, { status: 303 });
  }

  // Successful sign-in clears this IP's counter, so ordinary use — including a
  // few typos before getting it right — never accumulates toward a lockout.
  await clearFailures(ip);
  // Not awaited: the alert is for visibility, and Telegram being slow or down
  // must not delay Boris getting into his own dashboard.
  void alertSuccessfulLogin(ip, request.headers.get("user-agent") ?? "");

  const session = issueSession();
  const response = NextResponse.redirect(`${origin}/admin`, { status: 303 });
  response.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge
  });
  return response;
}

// Sign-out lives at /api/admin/logout — a browser form cannot issue a DELETE,
// which is why the old handler here was unreachable from the UI.
