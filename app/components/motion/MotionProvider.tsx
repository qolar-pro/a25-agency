'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { journey, clamp, lerp } from './journey';
import { applyMotionDefaults, prefersReducedMotion } from './tokens';

/**
 * One rAF loop for the whole page.
 *
 * Lenis produces the scroll, but GSAP's ticker drives it — running both their
 * own loops is the thing most projects get wrong and it costs a frame of sync
 * every tick. lagSmoothing(0) stops GSAP from fudging deltas after a stall,
 * which would otherwise desync the two.
 *
 * Tuned calmer than the reference projects: a higher lerp means the viewport
 * catches up to the wheel faster, so the page feels smooth rather than floaty.
 * The very low values those sites use read as luxurious on a showpiece and as
 * laggy on a site where people are trying to find a phone number.
 */
export default function MotionProvider() {
  useEffect(() => {
    applyMotionDefaults();
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion()) {
      // No smooth scrolling, no velocity. journey.scrollTo keeps its native
      // fallback from journey.ts, so navigation still works.
      return;
    }

    const lenis = new Lenis({
      // 0.09 in the reference; 0.12 here tracks the input more tightly.
      lerp: 0.12,
      smoothWheel: true,
      // Native momentum on touch beats anything we can synthesise — don't fight it.
      touchMultiplier: 1.4,
    });

    // Everything that moves the page must route through Lenis from here on;
    // a raw window.scrollTo would be dragged back by Lenis's own animation.
    journey.scrollTo = (target, opts) =>
      lenis.scrollTo(target as string, { offset: opts?.offset ?? -96 });

    const onScroll = () => {
      journey.scroll = lenis.scroll;
      journey.progress = lenis.progress;
      const raw = clamp(-1, 1, lenis.velocity / 60);
      // Ease into the stored value so downstream readers don't jitter.
      journey.velocity = lerp(journey.velocity, raw, 0.2);
      ScrollTrigger.update();
    };
    lenis.on('scroll', onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onPointer = (e: PointerEvent) => {
      journey.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      journey.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // In-page anchors go through Lenis so they land smoothly.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      const href = a?.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -96 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('pointermove', onPointer);
      gsap.ticker.remove(raf);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      journey.velocity = 0;
      journey.scroll = 0;
      journey.progress = 0;
    };
  }, []);

  return null;
}
