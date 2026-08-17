'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSite } from './SiteProvider';
import { INDUSTRIES } from './industriesData';
import IndustryModal from './IndustryModal';
import SectionLabel, { parseSectionLabel } from './ui/SectionLabel';

// Industries carousel — 7 real sector cards (Phase 3), centered auto-cycling
// postcard carousel. Carousel state (index, paused, auto-cycle) and the
// Read-More modal open/index state are local to this section; only `language`
// and `t` come from context. Copy is sourced per-language from INDUSTRIES.
export default function IndustriesCarousel() {
  const { language, t } = useSite();

  const [industryIndex, setIndustryIndex] = useState(0);
  const [industriesPaused, setIndustriesPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const openIndustryModal = (i: number) => {
    setModalIndex(i);
    setModalOpen(true);
    setIndustriesPaused(true);
  };

  // Auto-cycle the industries carousel forever, pausing on hover or while the
  // modal is open.
  useEffect(() => {
    if (industriesPaused || modalOpen) return;
    const id = setInterval(() => {
      setIndustryIndex((i) => (i + 1) % INDUSTRIES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [industriesPaused, modalOpen]);

  return (
    <div className="space-y-6">
      <div data-reveal className="text-center max-w-2xl mx-auto">
        <SectionLabel
          {...parseSectionLabel(t.sectorsSectionLabel || '[03 // SECTORS]')}
          className="justify-center"
        />
        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-950 mt-1">
          {t.sectorsSectionTitle || 'Industries We Work With'}
        </h3>
      </div>

      <div
        className="relative w-full overflow-x-hidden"
        style={{ touchAction: 'pan-y' }}
        onMouseEnter={() => setIndustriesPaused(true)}
        onMouseLeave={() => setIndustriesPaused(false)}
      >
        <div className="relative h-[280px] sm:h-[300px]">
          {INDUSTRIES.map((ind, i) => {
            const n = INDUSTRIES.length;
            let diff = i - industryIndex;
            if (diff > n / 2) diff -= n;
            if (diff < -n / 2) diff += n;

            const isCenter = diff === 0;
            const isSide = Math.abs(diff) === 1;

            // Deck geometry. The side cards sit lower, smaller and slightly
            // rotated so the active card reads as lifted off a stack rather
            // than as one of three equal cards in a row.
            const x = diff * 235;
            const scale = isCenter ? 1 : isSide ? 0.87 : 0.72;
            // Cards behind are fully opaque — previously they sat at 0.92 over
            // a translucent .card-glass surface, so the card underneath showed
            // straight through and the stack looked like a printing error.
            const opacity = isSide || isCenter ? 1 : 0;
            const zIndex = isCenter ? 30 : isSide ? 20 : 10;
            const rotate = isCenter ? 0 : diff > 0 ? 3.5 : -3.5;
            const y = isCenter ? 0 : 14;

            return (
              <motion.div
                key={ind.key}
                animate={{ x, y, scale, opacity, rotate }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ zIndex }}
                className={`absolute inset-0 m-auto w-[280px] sm:w-[340px] md:w-[380px] aspect-[3/2] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2.5 ${
                  isCenter
                    ? // Front: clean solid white, lifted with a deep shadow.
                      'bg-white border border-zinc-200/80 shadow-[0_28px_60px_-12px_rgba(9,9,25,0.30)] ring-1 ring-black/5'
                    : // Behind: solid brand amber, no transparency at all.
                      'bg-amber-500 border border-amber-600/40 shadow-[0_16px_36px_-14px_rgba(9,9,25,0.35)] pointer-events-none'
                }`}
              >
                <div
                  className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${
                    isCenter ? `${ind.iconBg} ${ind.iconColor}` : 'bg-white/25 text-white'
                  }`}
                >
                  <ind.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4
                  className={`font-bold text-sm sm:text-base uppercase tracking-tight ${
                    isCenter ? 'text-zinc-900' : 'text-white'
                  }`}
                >
                  {ind.label[language]}
                </h4>
                <p
                  className={`text-[11px] sm:text-xs leading-relaxed max-w-[240px] ${
                    isCenter ? 'text-zinc-500' : 'text-white/85'
                  }`}
                >
                  {ind.subtitle[language]}
                </p>
                <button
                  type="button"
                  onClick={() => openIndustryModal(i)}
                  tabIndex={isCenter ? 0 : -1}
                  aria-hidden={!isCenter}
                  className={`mt-1 inline-flex items-center gap-1 text-[11px] font-display font-semibold uppercase tracking-[0.14em] px-3.5 py-1.5 rounded-full transition-colors ${
                    isCenter
                      ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100'
                      : 'text-amber-700 bg-white/90'
                  }`}
                >
                  {t.readMore || 'Read More'}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Manual prev/next controls */}
        <button
          type="button"
          onClick={() => setIndustryIndex((i) => (i - 1 + INDUSTRIES.length) % INDUSTRIES.length)}
          aria-label="Previous industry"
          className="absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center justify-center transition-all z-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIndustryIndex((i) => (i + 1) % INDUSTRIES.length)}
          aria-label="Next industry"
          className="absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center justify-center transition-all z-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {INDUSTRIES.map((ind, i) => (
            <button
              key={ind.key}
              type="button"
              onClick={() => setIndustryIndex(i)}
              aria-label={`Go to ${ind.label[language]}`}
              className={`h-1.5 rounded-full transition-all ${i === industryIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'}`}
            />
          ))}
        </div>
      </div>

      <IndustryModal
        open={modalOpen}
        index={modalIndex}
        onClose={() => setModalOpen(false)}
        onNavigate={setModalIndex}
      />
    </div>
  );
}
