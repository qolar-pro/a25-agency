import { ImageResponse } from 'next/og';

// Branded 1200x630 share card, rendered at build time by next/og (Satori).
// Using the file convention here auto-populates og:image AND twitter:image in
// the document head — no need to hand-maintain image URLs in the metadata.
// Kept text-only (Latin) so it renders reliably with next/og's built-in font;
// colors are the brand tokens from src/index.css (navy #0E1648 -> near-black
// #080616, primary/CTA accent #2F2FE4).

export const runtime = 'nodejs';
export const alt = 'A25 — Bilateral Workforce Sourcing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#0E1648',
          backgroundImage:
            'radial-gradient(circle at 22% 18%, #162E93 0%, transparent 55%), linear-gradient(135deg, #0E1648 0%, #080616 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 8,
            color: '#9294F2',
            textTransform: 'uppercase',
          }}
        >
          a25.mk
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 200,
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1,
            marginTop: 4,
          }}
        >
          A25
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 52,
            fontWeight: 700,
            color: '#ffffff',
            marginTop: 20,
          }}
        >
          Bilateral Workforce Sourcing
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: '#B4B7F7',
            marginTop: 16,
            maxWidth: 940,
          }}
        >
          Connecting North Macedonian employers with vetted talent across 7 industries.
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 48,
            height: 10,
            width: 280,
            backgroundColor: '#2F2FE4',
            borderRadius: 5,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
