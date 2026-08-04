'use client';

import { Zap, ArrowRight } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useSite } from './SiteProvider';
import { openPriorityLineModal } from './PriorityLineModal';

// Absolute top regulatory micro banner (verbatim from App.tsx), plus a
// Priority Line teaser. This is the highest-visibility real estate on the
// site — above the header, on every page, before any scrolling — so it's
// the fix for "most visitors never scroll far enough to see Priority Line":
// clicking the teaser opens the modal directly rather than scrolling to
// ContactSection's card, since the point is immediate action, not a detour.
export default function TopBanner() {
  const { t } = useSite();

  const openFromBanner = () => {
    track('priority_line_cta_click', { source: 'top_banner' });
    openPriorityLineModal();
  };

  return (
    <div className="bar-animated bg-blue-700 py-2.5 border-b border-blue-800 text-center font-mono text-[11px] tracking-[0.15em] font-bold text-zinc-200 uppercase px-4 flex items-center justify-center gap-x-4 gap-y-1 flex-wrap">
      <span>⚡ {t.badge}</span>
      <button
        type="button"
        onClick={openFromBanner}
        className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 normal-case tracking-normal transition-colors"
      >
        <Zap className="w-3 h-3" />
        {t.priorityCta}
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
