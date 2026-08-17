import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../lib/archive/adminAuth.js";

// Sign out. A dedicated POST route rather than the DELETE handler that used to
// live on the login route: the dashboard's "Sign out" control was a <Link>
// inside a <form>, and a link does not submit its form — it just navigates. The
// result was a sign-out that appeared to work (you landed on the login page)
// while the session cookie stayed valid for its full 12 hours, so going back to
// /admin walked straight in. That is exactly the case that matters on a shared
// or borrowed device.
//
// POST, not GET, so it cannot be triggered by a stray <img> or prefetch.
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/admin/login?signedout=1`, { status: 303 });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
