// A25 unified language detection — the ONE shared "what language does this
// client speak?" lookup, deliberately not re-solved per-feature.
//
// Three features read/write this module (see CLAUDE.md "Order tracking &
// language detection"):
//   - Live chat (lib/chatWidget.ts) writes on createConversation, parsed from
//     the request's Accept-Language header.
//   - The /track/<token> page reads a known language first, falls back to
//     offline IP geolocation only if nothing is known yet, then writes back.
//   - The /order Telegram flow reads a known language before the completion
//     email; its priority is manual tag → known → English (no IP available
//     from a Telegram command).
//
// Storage mirrors lib/chatStore.ts exactly: Upstash Redis in prod, an
// in-process Map fallback for local dev. Every export is async regardless of
// backend so callers never need to know which is active.

import geoip from "geoip-lite";

// The 8 supported language codes. Kept as a local literal (rather than
// importing the app-side Language type) so this lib module stays free of any
// dependency on src/ UI code — it's backend infrastructure.
export type Language = "EN" | "MK" | "AL" | "DE" | "ES" | "EL" | "PL" | "SV";

const SUPPORTED: Language[] = ["EN", "MK", "AL", "DE", "ES", "EL", "PL", "SV"];

// ISO 639-1 primary language subtag → supported code. "sq" is Albanian's real
// ISO code (not "al", which is a country code). Matches the map already used
// in lib/chatWidget.ts so both parse Accept-Language identically.
const LANG_TO_SUPPORTED: Record<string, Language> = {
  en: "EN",
  mk: "MK",
  sq: "AL",
  de: "DE",
  es: "ES",
  el: "EL",
  pl: "PL",
  sv: "SV",
};

// ISO 3166-1 alpha-2 country → nearest supported language. Countries not
// listed fall through to EN. Covers the source region (Balkans) and the main
// EU/Balkan destination markets A25 recruits into.
const COUNTRY_TO_SUPPORTED: Record<string, Language> = {
  MK: "MK", // North Macedonia
  AL: "AL", // Albania
  XK: "AL", // Kosovo (majority Albanian-speaking)
  DE: "DE", // Germany
  AT: "DE", // Austria
  CH: "DE", // Switzerland
  ES: "ES", // Spain
  GR: "EL", // Greece
  CY: "EL", // Cyprus
  PL: "PL", // Poland
  SE: "SV", // Sweden
  GB: "EN",
  IE: "EN",
  US: "EN",
};

// Coerce an arbitrary string into a valid Language, defaulting EN. Used when
// reading back a stored value or accepting a manual override tag.
export function normalizeLanguage(value: string | null | undefined): Language {
  if (!value) return "EN";
  const upper = value.trim().toUpperCase();
  return (SUPPORTED as string[]).includes(upper) ? (upper as Language) : "EN";
}

// Parse a standard Accept-Language header (e.g. "de-AT,de;q=0.9,en;q=0.8")
// and map the highest-priority tag to one of the 8 supported languages.
// Returns "EN" when absent or unrecognisable.
export function detectFromHeader(acceptLanguageHeader: string | undefined | null): Language {
  if (!acceptLanguageHeader) return "EN";
  const primary = acceptLanguageHeader.split(/[,;]/)[0].trim().toLowerCase();
  const prefix = primary.split("-")[0]; // strip region: "de-at" → "de"
  return LANG_TO_SUPPORTED[prefix] ?? "EN";
}

// Offline IP → country → language lookup via geoip-lite. No external API
// call, so it behaves identically regardless of host. Returns "EN" for a
// missing IP, a private/unroutable IP, or a country with no mapping.
export async function detectFromIP(ip: string): Promise<Language> {
  if (!ip) return "EN";
  // A request may arrive as "ip1, ip2" (X-Forwarded-For chain) or "::ffff:x"
  // (IPv4-mapped IPv6). Take the first, strip the IPv6 mapping prefix.
  const first = ip.split(",")[0].trim().replace(/^::ffff:/i, "");
  try {
    const geo = geoip.lookup(first);
    if (geo?.country) {
      return COUNTRY_TO_SUPPORTED[geo.country] ?? "EN";
    }
  } catch {
    /* offline DB lookup should never throw, but fail-open to EN if it does */
  }
  return "EN";
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = !!(UPSTASH_URL && UPSTASH_TOKEN);

// In-memory fallback (local dev only — same caveat as lib/chatStore.ts: does
// not persist across restarts and cannot work across serverless invocations).
const memoryLangIndex = new Map<string, Language>();

let redisClient: any = null;
async function getRedis() {
  if (!redisClient) {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! });
  }
  return redisClient;
}

// Normalize emails for indexing so lookups aren't defeated by casing/whitespace
// (matches lib/chatStore.ts's normalizeEmail).
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const clientLangKey = (email: string) => `client-lang:${normalizeEmail(email)}`;

// The language previously remembered for this email, or null if none is known
// yet. Callers use null to decide whether to fall back to IP / manual tag.
export async function getKnownLanguage(email: string): Promise<Language | null> {
  if (!email) return null;
  if (useUpstash) {
    const redis = await getRedis();
    const value = await redis.get(clientLangKey(email));
    return value ? normalizeLanguage(value as string) : null;
  }
  return memoryLangIndex.get(normalizeEmail(email)) ?? null;
}

// Persist the language for this email so later features (track page, order
// completion email) can read it without re-detecting. No TTL: the preference
// is cheap to keep and useful across separate visits.
export async function rememberLanguage(email: string, lang: Language): Promise<void> {
  if (!email) return;
  const normalized = normalizeLanguage(lang);
  if (useUpstash) {
    const redis = await getRedis();
    await redis.set(clientLangKey(email), normalized);
  } else {
    memoryLangIndex.set(normalizeEmail(email), normalized);
  }
}
