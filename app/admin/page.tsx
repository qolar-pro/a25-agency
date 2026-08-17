import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySession } from "../../lib/archive/adminAuth.js";
import { getCounts, getContacts, getRuns, EXPORT_TABLES } from "../../lib/archive/queries.js";
import { backendName } from "../../lib/archive/db.js";

export const metadata: Metadata = {
  title: "A25 Lead Archive",
  robots: { index: false, follow: false }
};

// Always render fresh — a cached lead list would show stale data and, worse,
// could be served to a request that isn't signed in.
export const dynamic = "force-dynamic";

const TYPE_STYLES: Record<string, string> = {
  submission: "bg-blue-100 text-blue-800",
  chat: "bg-violet-100 text-violet-800",
  order: "bg-amber-100 text-amber-800",
  priority: "bg-emerald-100 text-emerald-800"
};

const TYPE_LABELS: Record<string, string> = {
  submission: "Form",
  chat: "Chat",
  order: "Order",
  priority: "Priority"
};

function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function AdminDashboard({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const jar = await cookies();
  if (!verifySession(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");

  const { q = "", type = "all" } = await searchParams;
  const [counts, contacts, runs] = await Promise.all([
    getCounts(),
    getContacts({ search: q, type }),
    getRuns()
  ]);

  const tiles = [
    { label: "Form submissions", value: counts.submissions, type: "submission" },
    { label: "Chat conversations", value: counts.chats, type: "chat" },
    { label: "Orders", value: counts.orders, type: "order" },
    { label: "Priority leads", value: counts.priority, type: "priority" }
  ];

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ---------------------------------------------------------- header */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-blue-600">A25</div>
            <h1 className="mt-1 font-display text-3xl font-bold text-zinc-900">Lead Archive</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Every enquiry the site has ever received, in one place.
            </p>
          </div>
          {/* A real submit button, not a link: the previous version was a
              <Link> inside this form, which navigated to the login page without
              ever submitting it — so the session cookie survived the "sign out"
              and /admin was still reachable. */}
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-50"
            >
              Sign out
            </button>
          </form>
        </header>

        {/* ----------------------------------------------------------- tiles */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <Link
              key={t.type}
              href={`/admin?type=${t.type}`}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm"
            >
              <div className="font-mono text-3xl font-bold text-zinc-900">{t.value}</div>
              <div className="mt-1 text-sm text-zinc-600">{t.label}</div>
            </Link>
          ))}
        </div>
        <p className="mt-2 font-mono text-xs text-zinc-500">
          {counts.messages} chat messages · {counts.languages} known client languages ·{" "}
          {/* Which database you're actually looking at — local and production
              archives are separate, and confusing them would be costly. */}
          <span className={backendName().startsWith("Neon") ? "text-emerald-700" : "text-amber-700"}>
            {backendName()}
          </span>
        </p>

        {/* -------------------------------------------------- search + export */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <form method="GET" className="flex flex-1 flex-wrap items-center gap-2">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, phone, country, industry…"
              className="min-w-56 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <select
              name="type"
              defaultValue={type}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
            >
              <option value="all">All types</option>
              <option value="submission">Form submissions</option>
              <option value="chat">Chats</option>
              <option value="order">Orders</option>
              <option value="priority">Priority leads</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Search
            </button>
            {(q || type !== "all") && (
              <Link href="/admin" className="text-sm text-zinc-600 underline hover:text-zinc-900">
                Clear
              </Link>
            )}
          </form>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            Export CSV:
          </span>
          {EXPORT_TABLES.map((t) => (
            <a
              key={t}
              href={`/api/admin/export?table=${t}`}
              className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 font-mono text-xs text-zinc-700 transition hover:border-blue-400 hover:text-blue-700"
            >
              {t}
            </a>
          ))}
        </div>

        {/* ----------------------------------------------------------- table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Industry / status</th>
                <th className="px-4 py-3">Lang</th>
                <th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    Nothing matches that search.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr
                    key={`${c.type}:${c.ref}`}
                    className="border-b border-zinc-100 last:border-0 hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/${c.type}/${encodeURIComponent(c.ref)}`}
                        className={`inline-block rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${
                          TYPE_STYLES[c.type] ?? "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {TYPE_LABELS[c.type] ?? c.type}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{c.name || "—"}</td>
                    <td className="px-4 py-3 text-zinc-700">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="hover:text-blue-700 hover:underline">
                          {c.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-700">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-zinc-700">{c.country || "—"}</td>
                    <td className="px-4 py-3 text-zinc-700">{c.topic || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">{c.language || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-zinc-600">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------ import log */}
        {runs.length > 0 && (
          <section className="mt-8">
            <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              Recovery / import history
            </h2>
            <ul className="mt-2 space-y-1">
              {runs.map((r: any, i: number) => (
                <li key={i} className="font-mono text-xs text-zinc-600">
                  {formatDate(r.ran_at)} · {r.kind} · {r.inserted} records · {r.detail}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
