import type { Metadata } from 'next';
import SiteProvider from './components/SiteProvider';
import TopBanner from './components/TopBanner';
import SiteHeader from './components/SiteHeader';
import HeroSection from './components/HeroSection';
import IndustriesCarousel from './components/IndustriesCarousel';
import ContactSection from './components/ContactSection';
import ChatWidget from './components/ChatWidget';
import PriorityLineModal from './components/PriorityLineModal';
import SiteFooter from './components/SiteFooter';
import FaqSection from './components/seo/FaqSection';

// Home-route metadata. The default English copy is what crawlers see in the
// server-rendered HTML (the client-side language switcher only changes the
// view after hydration).
export const metadata: Metadata = {
  title: {
    absolute: 'North Macedonia Workforce Agency — Hire Workers from Nepal | A25',
  },
  description:
    'Licensed North Macedonia workforce agency. A25 helps Macedonian companies hire vetted workers from Nepal and Asia — work permits, visas and accommodation handled — across construction, hospitality, agriculture, manufacturing and logistics.',
  keywords: [
    'North Macedonia workforce agency',
    'Macedonia workforce',
    'hire workers from Nepal',
    'Nepal workforce',
    'Macedonian jobs',
    'workers from Nepal to North Macedonia',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'North Macedonia Workforce Agency — Hire Workers from Nepal | A25',
    description:
      'A25 helps Macedonian companies hire vetted workers from Nepal and Asia — permits, visas and housing handled.',
    url: '/',
  },
};

export default function HomePage() {
  return (
    <SiteProvider>
      <TopBanner />
      <SiteHeader />

      {/* Main Container - 2-Scroll Clean Symmetrical Layout */}
      <main className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-16 lg:space-y-20">
        {/* ==================== SCROLL AREA 1: INFORMATION OVERVIEW ==================== */}
        <section className="space-y-10">
          <HeroSection />
          <IndustriesCarousel />
        </section>

        {/* ==================== SCROLL AREA 2: DIRECT CONTACT CHANNELS ==================== */}
        <ContactSection />

        {/* ==================== SCROLL AREA 3: SEO / FAQ (server-rendered) ==================== */}
        <FaqSection />
      </main>

      <ChatWidget />

      {/* Overlay, not a route: opened by the Priority Line inset inside
          ContactSection's Boris banner (via a window event — see
          PriorityLineModal.tsx), mounted here with the other page-level
          overlays/widgets. */}
      <PriorityLineModal />

      <SiteFooter />
    </SiteProvider>
  );
}
