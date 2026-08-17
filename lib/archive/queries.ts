// Read side of the archive — everything /admin displays.
//
// All filtering happens in SQL with bound parameters, never by string
// concatenation, so a search term can't alter the query it appears in.

import { query } from "./db.js";

export interface ContactRow {
  type: string;
  ref: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  country: string | null;
  topic: string | null;
  language: string | null;
  created_at: string;
}

export interface Counts {
  submissions: number;
  chats: number;
  messages: number;
  orders: number;
  priority: number;
  languages: number;
}

export async function getCounts(): Promise<Counts> {
  const { rows } = await query<Counts>(
    `select
       (select count(*) from submissions)        as submissions,
       (select count(*) from chat_conversations) as chats,
       (select count(*) from chat_messages)      as messages,
       (select count(*) from orders)             as orders,
       (select count(*) from priority_leads)     as priority,
       (select count(*) from client_languages)   as languages`
  );
  const r = rows[0] as any;
  // PGlite returns bigint counts as strings; normalise to numbers for the UI.
  return {
    submissions: Number(r?.submissions ?? 0),
    chats: Number(r?.chats ?? 0),
    messages: Number(r?.messages ?? 0),
    orders: Number(r?.orders ?? 0),
    priority: Number(r?.priority ?? 0),
    languages: Number(r?.languages ?? 0)
  };
}

export interface ContactFilter {
  search?: string;
  type?: string;
  limit?: number;
}

export async function getContacts(filter: ContactFilter = {}): Promise<ContactRow[]> {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.search) {
    params.push(`%${filter.search.toLowerCase()}%`);
    const p = `$${params.length}`;
    conditions.push(
      `(lower(coalesce(email,'')) like ${p}
        or lower(coalesce(name,'')) like ${p}
        or lower(coalesce(phone,'')) like ${p}
        or lower(coalesce(country,'')) like ${p}
        or lower(coalesce(topic,'')) like ${p})`
    );
  }
  if (filter.type && filter.type !== "all") {
    params.push(filter.type);
    conditions.push(`type = $${params.length}`);
  }

  params.push(Math.min(filter.limit ?? 500, 2000));

  const { rows } = await query<ContactRow>(
    `select type, ref, email, name, phone, country, topic, language, created_at
       from all_contacts
      ${conditions.length ? "where " + conditions.join(" and ") : ""}
      order by created_at desc
      limit $${params.length}`,
    params
  );
  return rows;
}

export async function getSubmission(id: string) {
  const { rows } = await query(`select * from submissions where id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getConversation(conversationId: string) {
  const { rows: conv } = await query(
    `select * from chat_conversations where conversation_id = $1`,
    [conversationId]
  );
  if (!conv[0]) return null;
  const { rows: messages } = await query(
    `select seq, role, body, created_at
       from chat_messages
      where conversation_id = $1
      order by seq asc`,
    [conversationId]
  );
  return { ...conv[0], messages };
}

export async function getOrder(token: string) {
  const { rows } = await query(`select * from orders where token = $1`, [token]);
  return rows[0] ?? null;
}

export async function getPriorityLead(applicationId: string) {
  const { rows } = await query(
    `select * from priority_leads where application_id = $1`,
    [applicationId]
  );
  return rows[0] ?? null;
}

// Backing data for the CSV export. Whitelisted table names only — the caller
// passes a user-supplied string, and a table name cannot be a bound parameter,
// so the only safe approach is an allowlist rather than escaping.
const EXPORTABLE: Record<string, string> = {
  everything: "select * from all_contacts order by created_at desc",
  submissions: "select * from submissions order by created_at desc",
  chats: "select * from chat_conversations order by created_at desc",
  messages: "select * from chat_messages order by conversation_id, seq",
  orders: "select * from orders order by created_at desc",
  priority: "select * from priority_leads order by created_at desc",
  languages: "select * from client_languages order by updated_at desc"
};

export const EXPORT_TABLES = Object.keys(EXPORTABLE);

export async function exportTable(name: string): Promise<Record<string, any>[]> {
  const sql = EXPORTABLE[name];
  if (!sql) throw new Error(`Unknown export: ${name}`);
  const { rows } = await query(sql);
  return rows as Record<string, any>[];
}

export async function getRuns() {
  const { rows } = await query(
    `select kind, detail, inserted, ran_at from archive_runs order by ran_at desc limit 10`
  );
  return rows;
}
