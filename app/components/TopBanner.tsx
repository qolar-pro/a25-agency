'use client';

import { useSite } from './SiteProvider';

// Absolute top regulatory micro banner (verbatim from App.tsx).
export default function TopBanner() {
  const { t } = useSite();
  return (
    <div className="bar-animated bg-blue-700 py-2.5 border-b border-blue-800 text-center font-mono text-[11px] tracking-[0.15em] font-bold text-zinc-200 uppercase px-4">
      ⚡ {t.badge}
    </div>
  );
}
