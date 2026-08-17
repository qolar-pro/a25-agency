import { gsap } from 'gsap';

/**
 * One file owns every curve and duration on the site.
 *
 * Adapted from the lawfirm/portfolio motion system. The reason those sites read
 * as one system rather than a pile of effects is that nothing defines its own
 * easing — everything pulls from here, and CSS transitions use the twin below
 * so they match GSAP exactly.
 *
 * A25 is calmer on purpose. The reference projects are showpieces where motion
 * is part of the pitch; this is a B2B recruitment site where motion should make
 * the page feel considered without ever becoming the thing you notice. So the
 * curve is kept but the amplitudes and durations are pulled in: shorter travel,
 * gentler stagger, no overshoot on entrances.
 */

/** Signature curve: fast attack, long settle. */
export const EASE = 'expo.out';

/** CSS twin of EASE, for transitions GSAP doesn't drive. */
export const EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';

export const DUR = {
  /** micro — hovers, small state flips */
  xs: 0.3,
  sm: 0.5,
  /** the workhorse */
  md: 0.8,
  lg: 1.1,
} as const;

export const STAGGER = {
  tight: 0.04,
  normal: 0.07,
  loose: 0.12,
} as const;

/**
 * Entrance travel, in px. Still well under the reference projects' 48, but not
 * so small that the motion is invisible — at 24 the reveal was technically
 * running and effectively unnoticeable, which is the worst of both worlds:
 * you pay for the animation and get no read from it.
 */
export const RISE = 34;

let applied = false;

/** Applies the vocabulary globally. Safe to call more than once. */
export function applyMotionDefaults() {
  if (applied) return;
  gsap.defaults({ ease: EASE, duration: DUR.md });
  applied = true;
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
