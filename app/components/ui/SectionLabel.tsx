/**
 * Premium replacement for the old `[01 // CLIENTS]` mono eyebrow.
 *
 * Deliberately has no 'use client' directive: it holds no state and no
 * handlers, so leaving it server-compatible lets the server-rendered
 * FaqSection use it without opening a client boundary, while client sections
 * can still import it normally.
 *
 * The bracketed form read as machine output rather than as brand typography.
 * This renders the same information — an ordinal and a section name — as a
 * typeset label: Space Grotesk numeral, a short tapering rule, then the name
 * in wide-tracked small caps.
 *
 * Existing translations still store the label in the bracket syntax
 * (`sectorsSectionLabel`, `priorityEyebrow`), and those strings are localised
 * across all 8 languages. Rather than re-cut every one of them, `parseSectionLabel`
 * unpacks the legacy format so the translated section *name* is preserved and
 * only the presentation changes.
 */

export interface ParsedSectionLabel {
  num: string | null;
  text: string;
}

/**
 * `"[03 // SECTORS]"` → `{ num: "03", text: "SECTORS" }`.
 * Anything that doesn't match the bracket form is passed through untouched as
 * `text`, so a translator writing a plain string never breaks the component.
 */
export function parseSectionLabel(raw: string): ParsedSectionLabel {
  const match = raw.match(/^\s*\[\s*([^\s/\]]+)\s*\/\/\s*(.+?)\s*\]\s*$/);
  if (match) return { num: match[1], text: match[2] };
  return { num: null, text: raw.replace(/^\[|\]$/g, '').trim() };
}

type Tone = 'light' | 'dark' | 'amber';

const TONES: Record<Tone, { num: string; rule: string; text: string }> = {
  // On the pale page background.
  light: {
    num: 'text-blue-600',
    rule: 'bg-gradient-to-r from-blue-500/60 to-blue-500/0',
    text: 'text-zinc-500',
  },
  // On the dark blue Priority Line panel.
  dark: {
    num: 'text-white/90',
    rule: 'bg-gradient-to-r from-white/45 to-white/0',
    text: 'text-zinc-300',
  },
  // Accent variant for the Priority Line eyebrow specifically.
  amber: {
    num: 'text-amber-500',
    rule: 'bg-gradient-to-r from-amber-500/60 to-amber-500/0',
    text: 'text-amber-100/80',
  },
};

export default function SectionLabel({
  num,
  text,
  tone = 'light',
  className = '',
}: {
  num?: string | null;
  text: string;
  tone?: Tone;
  className?: string;
}) {
  const c = TONES[tone];

  return (
    <span className={`inline-flex items-center gap-2.5 align-middle ${className}`}>
      {num && (
        <>
          <span className={`font-display text-[11px] font-bold leading-none tabular-nums ${c.num}`}>
            {num}
          </span>
          <span aria-hidden="true" className={`h-px w-6 shrink-0 ${c.rule}`} />
        </>
      )}
      <span
        className={`font-display text-[10px] sm:text-[11px] font-semibold uppercase leading-none tracking-[0.22em] ${c.text}`}
      >
        {text}
      </span>
    </span>
  );
}
