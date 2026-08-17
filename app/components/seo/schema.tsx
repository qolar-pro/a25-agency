import { FAQ_ITEMS } from './faqData';

// JSON-LD structured data for A25 (technical-SEO pass).
//
// Emitted as <script type="application/ld+json"> — server-rendered so crawlers
// get it in the initial HTML. Three graphs:
//   - EmploymentAgency (the entity — establishes A25 as a real org for Google's
//     Knowledge Graph, with areaServed Nepal + North Macedonia and the service
//     areas we actually cover).
//   - WebSite (links back to the org as publisher).
//   - FAQPage (built from the shared FAQ_ITEMS so it always matches the visible
//     <FaqSection>; mismatched FAQ schema gets rich results suppressed).
//
// All values are static, developer-authored, and truthful — the
// dangerouslySetInnerHTML is safe here (no user input flows into it).

const SITE_URL = 'https://www.a25.mk';
const ORG_ID = `${SITE_URL}/#organization`;

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    '@id': ORG_ID,
    name: 'A25',
    url: SITE_URL,
    logo: `${SITE_URL}/a25icon.jpeg`,
    image: `${SITE_URL}/a25icon.jpeg`,
    description:
      'Licensed North Macedonia workforce and recruitment agency helping Macedonian companies hire vetted workers from Nepal and Asia — with full work-permit, visa, and accommodation handling.',
    areaServed: [
      { '@type': 'Country', name: 'North Macedonia' },
      { '@type': 'Country', name: 'Nepal' },
    ],
    knowsAbout: [
      'Construction staffing',
      'Hospitality staffing',
      'Agriculture labor',
      'Manufacturing workforce',
      'Logistics workforce',
      'Work permits',
      'Visa processing',
    ],
    founder: { '@type': 'Person', name: 'Boris Vchkov' },
    email: 'contact@a25.mk',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Skopje',
      addressCountry: 'MK',
    },
  };
}

export function webSiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'A25',
    url: SITE_URL,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  };
}

export function faqSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
