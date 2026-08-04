import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import ParticleBackground from './components/ParticleBackground';
import HeroBackgroundImages from './components/HeroBackgroundImages';

const SITE_URL = 'https://www.a25.mk';

// Site-wide metadata defaults. Per-route pages (e.g. app/page.tsx) override
// the title/description with their own. This replaces the single static
// <title> the old index.html served to every section.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'A25 — Bilateral Workforce Sourcing (North Macedonia ↔ EU & Balkans)',
    template: '%s | A25',
  },
  description:
    'A25 is a bilateral worker-sourcing agency connecting North Macedonian employers with vetted seasonal and permanent labor across 7 industries — construction, agriculture, hospitality, manufacturing, logistics and more.',
  applicationName: 'A25',
  keywords: [
    'A25',
    'workforce sourcing',
    'labor recruitment',
    'North Macedonia',
    'seasonal workers',
    'bilateral recruitment',
    'construction workers',
    'hospitality staffing',
    'agriculture labor',
  ],
  authors: [{ name: 'A25 Agency' }],
  icons: {
    icon: '/a25icon.jpeg',
    apple: '/a25icon.jpeg',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'A25',
    title: 'A25 — Bilateral Workforce Sourcing',
    description:
      'Bilateral recruitment pathways connecting North Macedonian employers with vetted trade candidates across 7 industries.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A25 — Bilateral Workforce Sourcing',
    description:
      'Bilateral recruitment pathways connecting North Macedonian employers with vetted trade candidates across 7 industries.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen text-zinc-900 selection:bg-blue-650 selection:text-white font-sans antialiased text-left">
          {/* Living atmosphere: aurora wash + edge photography + interactive particle network + grain */}
          <div className="aurora" aria-hidden="true" />
          <div className="aurora-spot" aria-hidden="true" />
          <HeroBackgroundImages />
          <ParticleBackground />
          <div className="grain" aria-hidden="true" />

          <div className="relative z-10">{children}</div>
        </div>

        {/* Vercel Web Analytics — mounted here, in the real App Router layout.
            (Phase 8g: the stale `vercel/install-vercel-web-analytics-ae9awx`
            branch patched the retired src/App.tsx instead, which hasn't rendered
            anything since the Phase 2 migration — do not merge it.) This is what
            collects the priority_line_* events fired from the Priority Line
            section/modal. No env var or key needed. */}
        <Analytics />
      </body>
    </html>
  );
}
