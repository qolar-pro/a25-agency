import heroLeft from '../assets/hero-left.jpg';
import heroRight from '../assets/hero-right.jpg';

/**
 * Decorative workforce photography pinned to the left/right viewport edges
 * for the entire site (fixed, like the aurora layer), fading to transparent
 * well before the centered content column so the middle stays clean.
 */
export default function HeroBackgroundImages() {
  return (
    <div aria-hidden="true">
      <div className="site-bg-img site-bg-img-left" style={{ backgroundImage: `url(${heroLeft})` }} />
      <div className="site-bg-img site-bg-img-right" style={{ backgroundImage: `url(${heroRight})` }} />
    </div>
  );
}
