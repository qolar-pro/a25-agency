/**
 * Decorative workforce photography pinned to the left/right viewport edges
 * for the entire site (fixed, like the aurora layer), fading to transparent
 * well before the centered content column so the middle stays clean.
 *
 * The two source images now live in /public (served at the site root) rather
 * than being imported through the bundler — the only change from the original
 * Vite component, needed because Next serves static assets from /public.
 */
export default function HeroBackgroundImages() {
  return (
    <div aria-hidden="true">
      <div className="site-bg-img site-bg-img-left" style={{ backgroundImage: 'url(/hero-left.jpg)' }} />
      <div className="site-bg-img site-bg-img-right" style={{ backgroundImage: 'url(/hero-right.jpg)' }} />
    </div>
  );
}
