import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import ParticleBackground from './components/ParticleBackground';
import HeroBackgroundImages from './components/HeroBackgroundImages';
import MotionProvider from './components/motion/MotionProvider';
import Reveal from './components/motion/Reveal';
import { JsonLd, organizationSchema, webSiteSchema } from './components/seo/schema';

const SITE_URL = 'https://www.a25.mk';

// Site-wide metadata defaults. Per-route pages (e.g. app/page.tsx) override
// the title/description with their own. This replaces the single static
// <title> the old index.html served to every section.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'A25 — North Macedonia Workforce Agency | Hire Workers from Nepal & Asia',
    template: '%s | A25',
  },
  description:
    'A25 is a licensed North Macedonia workforce and recruitment agency. We help Macedonian companies hire vetted workers from Nepal and Asia — work permits, visas and accommodation handled — across construction, hospitality, agriculture, manufacturing and logistics.',
  applicationName: 'A25',
  keywords: [
    'North Macedonia workforce agency',
    'Macedonia workforce',
    'Macedonian working agency',
    'Macedonian recruitment agency',
    'hire workers from Nepal',
    'Nepal workforce',
    'workers from Nepal to Macedonia',
    'Nepal jobs abroad',
    'Macedonian jobs',
    'labor recruitment North Macedonia',
    'work permit North Macedonia',
    'construction workers',
    'hospitality staffing',
    'agriculture labor',
    'A25',
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
    locale: 'en_US',
    title: 'A25 — North Macedonia Workforce Agency | Hire Workers from Nepal',
    description:
      'Licensed North Macedonia workforce agency. A25 helps Macedonian companies hire vetted workers from Nepal and Asia — permits, visas and housing handled.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A25 — North Macedonia Workforce Agency | Hire Workers from Nepal',
    description:
      'Licensed North Macedonia workforce agency helping Macedonian companies hire vetted workers from Nepal and Asia.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Motion system, ported from the portfolio/lawfirm projects and tuned
            calmer for a B2B site. MotionProvider owns the single rAF loop
            (Lenis smooth scroll driven by GSAP's ticker); Reveal wires the
            declarative [data-reveal] / [data-highlight] animations. Both
            render nothing and both self-disable under reduced motion. */}
        <MotionProvider />
        <Reveal />

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
        {/* Site-wide structured data: the A25 EmploymentAgency entity + WebSite,
            server-rendered so crawlers get it in the initial HTML. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={webSiteSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
