import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getOrderByToken, type OrderStatus, type OrderRecord } from '@/lib/orderStore';
import {
  getKnownLanguage,
  rememberLanguage,
  detectFromIP,
  type Language,
} from '@/lib/languageDetect';
import { TRACK_COPY } from '../trackTranslations';
import { Check, Circle } from 'lucide-react';

// Order tracking is inherently dynamic (live status per token) and reads the
// request IP for language fallback — never statically cache it.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// The full stepper order. `started` is implicit at creation; the client sees
// the journey through to `done`.
const STEP_ORDER: OrderStatus[] = ['started', 'pending', 'accepted', 'processing', 'done'];

// Pull the client IP from the standard proxy headers (Vercel/most hosts set
// x-forwarded-for; x-real-ip as a fallback). Empty string if neither present.
function getClientIP(h: Headers): string {
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return h.get('x-real-ip') ?? '';
}

// Resolve the language for this track-page render, applying the documented
// priority for THIS read point: known client-lang → IP detection → English.
// (Manual tag only applies at the Telegram/order layer, not here.) When we
// fall back to IP, persist the result so later reads short-circuit to "known".
async function resolveLanguage(email: string, h: Headers): Promise<Language> {
  const known = await getKnownLanguage(email);
  if (known) return known;

  const ip = getClientIP(h);
  const detected = await detectFromIP(ip);
  // Write back so the completion email and any repeat visit read one source of
  // truth rather than re-detecting. Fail-open — never block the page render.
  rememberLanguage(email, detected).catch(() => {});
  return detected;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const order = await getOrderByToken(token);
  // Metadata runs before the body; resolve language the same way so the tab
  // title is localized too. If there's no order, use EN generic copy.
  const h = await headers();
  const lang: Language = order ? await resolveLanguage(order.email, h) : 'EN';
  const copy = TRACK_COPY[lang];
  return {
    title: copy.pageTitle,
    description: copy.metaDescription,
    robots: { index: false, follow: false }, // per-client link, never indexed
  };
}

function formatTimestamp(ts: number, lang: Language): string {
  const locale: Record<Language, string> = {
    EN: 'en-GB', MK: 'mk-MK', AL: 'sq-AL', DE: 'de-DE',
    ES: 'es-ES', EL: 'el-GR', PL: 'pl-PL', SV: 'sv-SE',
  };
  try {
    return new Intl.DateTimeFormat(locale[lang], {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toISOString();
  }
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  const h = await headers();

  const lang: Language = order ? await resolveLanguage(order.email, h) : 'EN';
  const copy = TRACK_COPY[lang];

  if (!order) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="card-glass border border-zinc-200/70 rounded-2xl p-8 text-center space-y-3">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-zinc-950">
            {copy.notFoundTitle}
          </h1>
          <p className="text-zinc-600 text-sm leading-relaxed">{copy.notFoundBody}</p>
        </div>
      </main>
    );
  }

  // Index of the current status in the stepper. Every step at or before it is
  // "complete", the one after is "current".
  const currentIndex = STEP_ORDER.indexOf(order.status);

  // Latest timestamp per status, pulled from history for the per-step captions.
  const timestampFor = (status: OrderStatus): number | undefined => {
    const events = (order as OrderRecord).history.filter((e) => e.status === status);
    return events.length ? events[events.length - 1].timestamp : undefined;
  };

  const lastEvent = order.history[order.history.length - 1];

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="space-y-8">
        <header className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {copy.orderRef}: {order.token.slice(0, 8).toUpperCase()}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-zinc-950">
            {copy.heading}
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            {copy.subheading}
          </p>
        </header>

        <div className="card-glass border border-zinc-200/70 rounded-2xl p-6 sm:p-8">
          <ol className="space-y-0">
            {STEP_ORDER.map((status, i) => {
              const isComplete = i <= currentIndex;
              const isCurrent = i === currentIndex;
              const ts = timestampFor(status);
              const isLast = i === STEP_ORDER.length - 1;

              return (
                <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Connector line between step markers */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${
                        i < currentIndex ? 'bg-blue-600' : 'bg-zinc-200'
                      }`}
                    />
                  )}

                  {/* Step marker */}
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                      isComplete
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-zinc-300 text-zinc-400'
                    } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                  >
                    {isComplete ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </span>

                  {/* Step label + caption + timestamp */}
                  <div className="pt-0.5">
                    <p
                      className={`font-mono text-xs uppercase font-bold tracking-widest ${
                        isComplete ? 'text-zinc-950' : 'text-zinc-400'
                      }`}
                    >
                      {copy.steps[status]}
                    </p>
                    <p
                      className={`text-sm mt-0.5 ${
                        isComplete ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      {copy.stepCaptions[status]}
                    </p>
                    {ts && (
                      <p className="text-[11px] font-mono text-zinc-400 mt-1">
                        {formatTimestamp(ts, lang)}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {order.status === 'done' && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-center">
            <p className="text-sm text-blue-800 leading-relaxed">{copy.completedNote}</p>
          </div>
        )}

        <p className="text-center text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          {copy.updatedAt}: {formatTimestamp(lastEvent.timestamp, lang)}
        </p>
      </div>
    </main>
  );
}
