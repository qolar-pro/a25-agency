import { FAQ_ITEMS } from './faqData';
import { JsonLd, faqSchema } from './schema';
import SectionLabel from '../ui/SectionLabel';

// Server-rendered, English-first FAQ (technical-SEO pass).
//
// Two jobs: (1) adds real, keyword-rich body content Google can index for
// "North Macedonia workforce agency", "hire workers from Nepal", etc.; (2)
// backs the FAQPage JSON-LD with matching visible text (required for the FAQ
// rich result). Native <details> keeps every answer in the SSR DOM — crawlable
// with zero client JS. Content is shared from faqData.ts with the schema.
//
// English-only for now (matches the EN server render Googlebot indexes and the
// user's English-first scope). If a visitor switches the UI to another
// language this stays English — flagged for translation in a later pass.
export default function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="pt-10 lg:pt-14 border-t border-zinc-200"
    >
      <JsonLd data={faqSchema()} />

      <div className="max-w-3xl mx-auto space-y-8">
        <div data-reveal className="text-center space-y-2">
          {/* 05, not 04 — the Priority Line section above already owns 04,
              and the two were colliding. */}
          <SectionLabel num="05" text="FAQ" className="justify-center" />
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-zinc-950"
          >
            North Macedonia Workforce Agency — FAQ
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            How A25 helps Macedonian companies hire vetted workers from Nepal and
            across Asia — permits, visas and accommodation included.
          </p>
        </div>

        <div data-reveal-group className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              className="group card-glass border border-zinc-200/70 rounded-xl px-5 py-4 open:border-blue-300/70 transition-colors"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-semibold text-sm sm:text-[15px] text-zinc-900">
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="text-blue-600 shrink-0 text-xl leading-none transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="text-center pt-2">
          <a
            href="#contact-desk"
            className="btn-shine inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase font-black tracking-widest rounded-2xl transition-all shadow-md shadow-blue-500/15 active:scale-98"
          >
            Request workers from A25
          </a>
        </div>
      </div>
    </section>
  );
}
