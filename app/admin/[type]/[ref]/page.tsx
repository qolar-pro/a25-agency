import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySession } from "../../../../lib/archive/adminAuth.js";
import {
  getConversation,
  getOrder,
  getPriorityLead,
  getSubmission
} from "../../../../lib/archive/queries.js";

export const metadata: Metadata = {
  title: "A25 Archive — Record",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

const fmt = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (v instanceof Date) return v.toLocaleString("en-GB");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

// Field-by-field table used by the three non-chat record types.
function Fields({ record, omit }: { record: Record<string, any>; omit: string[] }) {
  const entries = Object.entries(record).filter(
    ([k, v]) => !omit.includes(k) && v !== null && v !== ""
  );
  return (
    <dl className="divide-y divide-zinc-100">
      {entries.map(([k, v]) => (
        <div key={k} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
          <dt className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            {k.replace(/_/g, " ")}
          </dt>
          <dd className="sm:col-span-2 break-words text-sm text-zinc-900">
            {/* Dates are objects too, but must render as text, not as JSON. */}
            {typeof v === "object" && !(v instanceof Date) ? (
              <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-3 font-mono text-xs">
                {JSON.stringify(v, null, 2)}
              </pre>
            ) : (
              fmt(v)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function RecordDetail({
  params
}: {
  params: Promise<{ type: string; ref: string }>;
}) {
  const jar = await cookies();
  if (!verifySession(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");

  const { type, ref: rawRef } = await params;
  const ref = decodeURIComponent(rawRef);

  let record: any = null;
  let title = "";

  if (type === "submission") {
    record = await getSubmission(ref);
    title = record ? `${record.full_name ?? "Form submission"}` : "";
  } else if (type === "chat") {
    record = await getConversation(ref);
    title = record ? `Chat with ${record.visitor_name ?? "visitor"}` : "";
  } else if (type === "order") {
    record = await getOrder(ref);
    title = record ? `Order ${record.status ?? ""}` : "";
  } else if (type === "priority") {
    record = await getPriorityLead(ref);
    title = record ? `${record.first_name ?? ""} ${record.surname ?? ""}`.trim() : "";
  }

  if (!record) notFound();

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="font-mono text-xs text-blue-600 hover:underline">
          ← Back to archive
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold text-zinc-900">{title || ref}</h1>
        <p className="mt-1 font-mono text-xs text-zinc-500">
          {type} · {ref}
        </p>

        {/* Chat gets a transcript view; raw fields alone would be unreadable. */}
        {type === "chat" ? (
          <>
            <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-500">Transcript</h2>
              <div className="mt-4 space-y-3">
                {record.messages.length === 0 ? (
                  <p className="text-sm text-zinc-500">No messages recorded.</p>
                ) : (
                  record.messages.map((m: any) => (
                    <div
                      key={m.seq}
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        m.role === "visitor"
                          ? "bg-zinc-100 text-zinc-900"
                          : "ml-auto bg-blue-600 text-white"
                      }`}
                    >
                      <div className="font-mono text-[10px] uppercase tracking-wider opacity-70">
                        {m.role === "visitor" ? record.visitor_name || "Visitor" : "A25"} ·{" "}
                        {new Date(m.created_at).toLocaleString("en-GB")}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
            <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-500">Details</h2>
              <Fields record={record} omit={["messages", "raw"]} />
            </section>
          </>
        ) : (
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
            <Fields record={record} omit={["raw"]} />
          </section>
        )}
      </div>
    </main>
  );
}
