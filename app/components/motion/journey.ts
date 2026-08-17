/**
 * The spine.
 *
 * A single mutable object, deliberately NOT React state — frame-hot values
 * change at up to 120fps and putting them in state would re-render the tree
 * every frame. DOM-side code writes to it; animation frames read from it.
 * This object is the only bridge between the scroll layer and anything that
 * animates off it.
 *
 * `scrollTo` matters beyond convenience here: once Lenis owns the scroll,
 * calling window.scrollTo directly fights it (Lenis keeps animating toward its
 * own target and drags the viewport back). Everything that moves the page —
 * the hero CTAs, in-page anchors — has to go through this.
 */

export type Journey = {
  /** 0–1 through the whole document. */
  progress: number;
  /** Normalised, eased scroll velocity, roughly -1 → 1. */
  velocity: number;
  /** Raw scroll offset in px. */
  scroll: number;
  /** Pointer in normalised viewport coords, -1 → 1 on each axis. */
  pointer: { x: number; y: number };
  /** Set by the provider once Lenis exists; a safe no-op fallback until then. */
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number }) => void;
};

export const journey: Journey = {
  progress: 0,
  velocity: 0,
  scroll: 0,
  pointer: { x: 0, y: 0 },
  // Falls back to native scrolling so anything calling this before the provider
  // mounts (or with Lenis disabled under reduced motion) still works.
  scrollTo: (target, opts) => {
    if (typeof window === 'undefined') return;
    const offset = opts?.offset ?? 0;
    if (typeof target === 'number') {
      window.scrollTo(0, target + offset);
      return;
    }
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!(el instanceof HTMLElement)) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset });
  },
};

export const clamp = (min: number, max: number, v: number) => Math.min(max, Math.max(min, v));

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
