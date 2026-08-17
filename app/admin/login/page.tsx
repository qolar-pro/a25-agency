import type { Metadata } from "next";

// The dashboard must never be indexed — it lists real people.
export const metadata: Metadata = {
  title: "A25 Archive — Sign in",
  robots: { index: false, follow: false }
};

export default async function AdminLogin({
  searchParams
}: {
  searchParams: Promise<{ error?: string; left?: string }>;
}) {
  const { error, left } = await searchParams;
  const configured = !!process.env.ADMIN_PASSWORD;

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-600">A25</div>
          <h1 className="mt-2 font-display text-2xl font-bold text-zinc-900">Lead Archive</h1>
        </div>

        {!configured ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Not configured</p>
            <p className="mt-1 leading-relaxed">
              Set <code className="font-mono text-xs">ADMIN_PASSWORD</code> in{" "}
              <code className="font-mono text-xs">.env.local</code> and restart the dev server.
              Until then every sign-in is refused.
            </p>
          </div>
        ) : (
          <form
            action="/api/admin/login"
            method="POST"
            className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-zinc-500">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            {error === "locked" ? (
              <p className="mt-3 text-sm text-red-600">
                Too many failed attempts. Sign-in is locked for 15 minutes.
              </p>
            ) : error ? (
              <p className="mt-3 text-sm text-red-600">
                Incorrect password.
                {left !== undefined && Number(left) >= 0
                  ? ` ${left} attempt${Number(left) === 1 ? "" : "s"} left before lockout.`
                  : ""}
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
