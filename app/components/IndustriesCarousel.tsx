'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { HardHat, UtensilsCrossed, Sprout, Warehouse, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSite } from './SiteProvider';

// Industries carousel — placeholder sector cards, centered auto-cycling
// postcard carousel. All carousel state (index, paused, auto-cycle) is local
// to this section; only `t` comes from context. JSX verbatim from App.tsx.
export default function IndustriesCarousel() {
  const { t } = useSite();

  const industries = [
    { key: 'construction', label: t.optConstruction, desc: t.industryDescConstruction || 'Skilled trade & site labor sourcing.', icon: HardHat, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { key: 'hospitality', label: t.optHospitality, desc: t.industryDescHospitality || 'Hospitality & guest service staffing.', icon: UtensilsCrossed, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { key: 'agriculture', label: t.optAgriculture, desc: t.industryDescAgriculture || 'Seasonal & permanent field labor.', icon: Sprout, iconBg: 'bg-blue-100', iconColor: 'text-blue-700' },
    { key: 'manufacturing', label: t.optManufacturing, desc: t.industryDescManufacturing || 'Warehouse & production line staffing.', icon: Warehouse, iconBg: 'bg-zinc-100', iconColor: 'text-zinc-700' },
    { key: 'generic', label: t.optGeneric || 'Generic Workers', desc: t.industryDescGeneric || 'General labor for any role or site.', icon: Users, iconBg: 'bg-blue-200', iconColor: 'text-blue-800' },
  ];

  const [industryIndex, setIndustryIndex] = useState(0);
  const [industriesPaused, setIndustriesPaused] = useState(false);

  // Auto-cycle the industries carousel forever, pausing on hover.
  useEffect(() => {
    if (industriesPaused) return;
    const id = setInterval(() => {
      setIndustryIndex((i) => (i + 1) % industries.length);
    }, 4000);
    return () => clearInterval(id);
  }, [industriesPaused, industries.length]);

  return (
    <div className="reveal space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-mono text-blue-600 tracking-widest uppercase font-bold block">
          {t.sectorsSectionLabel || '[03 // SECTORS]'}
        </span>
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
        <div className="relative h-[250px] sm:h-[280px]">
          {industries.map((ind, i) => {
            const n = industries.length;
            let diff = i - industryIndex;
            if (diff > n / 2) diff -= n;
            if (diff < -n / 2) diff += n;

            const isCenter = diff === 0;
            const isSide = Math.abs(diff) === 1;
            const x = diff * 220;
            const scale = isCenter ? 1 : isSide ? 0.86 : 0.7;
            const opacity = isCenter ? 1 : isSide ? 0.92 : 0;
            const zIndex = isCenter ? 30 : isSide ? 20 : 10;

            return (
              <motion.div
                key={ind.key}
                animate={{ x, scale, opacity }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ zIndex }}
                className={`absolute inset-0 m-auto w-[280px] sm:w-[340px] md:w-[380px] aspect-[3/2] card-glass border border-zinc-200/70 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2.5 ${isCenter ? '' : 'pointer-events-none'}`}
              >
                <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${ind.iconBg} ${ind.iconColor}`}>
                  <ind.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="font-bold text-sm sm:text-base text-zinc-900 uppercase tracking-tight">{ind.label}</h4>
                <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed max-w-[240px]">{ind.desc}</p>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-full">
                  {t.moreComingSoon || 'More coming soon'}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Manual prev/next controls */}
        <button
          type="button"
          onClick={() => setIndustryIndex((i) => (i - 1 + industries.length) % industries.length)}
          aria-label="Previous industry"
          className="absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center justify-center transition-all z-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIndustryIndex((i) => (i + 1) % industries.length)}
          aria-label="Next industry"
          className="absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center justify-center transition-all z-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {industries.map((ind, i) => (
            <button
              key={ind.key}
              type="button"
              onClick={() => setIndustryIndex(i)}
              aria-label={`Go to ${ind.label}`}
              className={`h-1.5 rounded-full transition-all ${i === industryIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
