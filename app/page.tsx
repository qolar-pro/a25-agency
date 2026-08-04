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

// Home-route metadata. The default English copy is what crawlers see in the
// server-rendered HTML (the client-side language switcher only changes the
// view after hydration).
export const metadata: Metadata = {
  title: 'A25 — Bilateral Workforce Sourcing for North Macedonian Employers',
  description:
    'Hire vetted seasonal and permanent workers, or register as a candidate. A25 runs bilateral recruitment pathways across 7 industries — construction, agriculture, hospitality, manufacturing, logistics and more.',
  alternates: { canonical: '/' },
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
