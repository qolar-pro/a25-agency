// Keyword-targeted FAQ content (English-first — technical-SEO pass).
//
// SINGLE SOURCE OF TRUTH shared by the visible <FaqSection> and the FAQPage
// JSON-LD in schema.tsx. Google requires FAQ structured data to match the
// visible on-page content, so both MUST read from this same array — never
// hand-write the schema separately or the rich result can be suppressed.
//
// Answers are grounded in facts the site already states (licensed agency,
// 30–90 day permit/visa routing, managed accommodation, the five industries,
// sourcing from Nepal/Asia into North Macedonia). No invented volume/traction
// numbers — see CLAUDE.md "Hero stats".
//
// English-only for now by design (the server-rendered HTML Googlebot sees is
// always EN — SiteProvider initial state is 'EN'). Translations can follow.

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'What is A25?',
    a: 'A25 is a licensed North Macedonia workforce and recruitment agency. We help Macedonian companies solve labor shortages by sourcing, vetting, and legally placing qualified workers from Nepal and other parts of Asia across construction, hospitality, agriculture, manufacturing, and logistics.',
  },
  {
    q: 'How does A25 help North Macedonian companies hire workers from Nepal?',
    a: 'We manage the whole process end to end — sourcing and vetting candidates in Nepal, legal documentation, work permits, visas, and managed accommodation — so Macedonian employers receive job-ready workers with minimal administrative burden.',
  },
  {
    q: 'How long does it take to bring workers from Nepal to North Macedonia?',
    a: 'Work-permit and visa routing typically takes about 30 to 90 days, depending on the sector, headcount, and documentation. A25 handles each step and keeps the employer updated throughout.',
  },
  {
    q: 'Which industries does A25 recruit workers for?',
    a: 'We focus on the sectors with the highest labor demand in North Macedonia: heavy industry and construction, tourism and hospitality, agriculture and harvesting, manufacturing and warehousing, and general labor.',
  },
  {
    q: 'Does A25 handle work permits, visas, and accommodation?',
    a: 'Yes. Every placement includes complete legal and administrative support — contracts compliant with North Macedonian regulations, work permits, visa processing, and managed accommodation for the workers.',
  },
  {
    q: 'How can a company request workers from A25?',
    a: 'Send a staffing request through the form on a25.mk, or contact the team directly at contact@a25.mk. You will get a direct reply from the A25 desk, usually within a couple of hours.',
  },
];
