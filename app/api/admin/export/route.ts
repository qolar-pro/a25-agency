import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "../../../../lib/archive/adminAuth.js";
import { exportTable } from "../../../../lib/archive/queries.js";

export const dynamic = "force-dynamic";

// RFC 4180 quoting: wrap every field, double any embedded quote. Chat messages
// and free-text notes routinely contain commas, quotes and newlines, so this
// can't be the usual naive join.
function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const cell = (v: any): string => {
    if (v === null || v === undefined) return '""';
    // Dates are objects, but JSON.stringify would wrap them in their own quotes
    // and the escaping below would then double those into "" — hence the
    // explicit case before the object branch.
    const s =
      v instanceof Date
        ? v.toISOString()
        : typeof v === "object"
          ? JSON.stringify(v)
          : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [
    headers.map(cell).join(","),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))
  ].join("\r\n");
}

export async function GET(request: Request) {
  const jar = await cookies();
  if (!verifySession(jar.get(ADMIN_COOKIE)?.value)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const table = new URL(request.url).searchParams.get("table") ?? "everything";

  let rows: Record<string, any>[];
  try {
    rows = await exportTable(table);
  } catch {
    return new Response("Unknown export", { status: 400 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + toCsv(rows), {
    headers: {
      // BOM so Excel opens UTF-8 correctly — the data spans 8 languages
      // including Cyrillic and Greek, which Excel otherwise mangles.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="a25-${table}-${stamp}.csv"`,
      "Cache-Control": "no-store"
    }
  });
}
