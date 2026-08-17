'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DUR, STAGGER, RISE } from './tokens';

/**
 * Reveals are declarative. Nothing is hand-rolled per section — this scans the
 * document for a few attributes and wires them all the same way:
 *
 *   [data-reveal]        rise + fade, once
 *   [data-reveal-group]  children stagger in
 *   [data-highlight]     words scrub from pale to full as you read past them
 *
 * Note this deliberately does NOT take over the existing `.reveal` class. That
 * one is already driven by an IntersectionObserver in SiteProvider and is doing
 * the same job correctly; running two systems over the same nodes is how you
 * get an element with competing tweens that ends up stuck invisible. `.reveal`
 * stays as-is, and these attributes are for anything that wants the GSAP
 * treatment on top.
 *
 * matchMedia handles reduced-motion and gsap.context handles cleanup, so
 * neither has to be remembered at the call site.
 */
export default function Reveal() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        // --- plain reveals ---------------------------------------------------
        // A group owns its children. Without this filter, an element inside a
        // group that also carries [data-reveal] gets two competing `from`
        // tweens and can be left hidden forever — invisible content, not just
        // missing motion.
        gsap.utils
          .toArray<HTMLElement>('[data-reveal]')
          .filter((el) => !el.parentElement?.closest('[data-reveal-group]'))
          .forEach((el) => {
            gsap.from(el, {
              y: RISE,
              autoAlpha: 0,
              duration: DUR.md,
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            });
          });

        // --- staggered groups ------------------------------------------------
        gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
          const kids = Array.from(group.children) as HTMLElement[];
          if (!kids.length) return;
          gsap.from(kids, {
            y: RISE,
            autoAlpha: 0,
            duration: DUR.md,
            stagger: STAGGER.normal,
            scrollTrigger: { trigger: group, start: 'top 88%', once: true },
          });
        });

        // --- word-by-word read-through ---------------------------------------
        // Replaces the hand-rolled scroll listener that used to drive this.
        // ScrollTrigger's scrub ties word brightness directly to scroll
        // position and interpolates between frames, so it stays smooth at any
        // scroll speed instead of stepping between sampled positions.
        gsap.utils.toArray<HTMLElement>('[data-highlight]').forEach((block) => {
          const words = gsap.utils.toArray<HTMLElement>('.scroll-hl-word', block);
          if (!words.length) return;
          gsap.fromTo(
            words,
            { opacity: 0.28 },
            {
              opacity: 1,
              ease: 'none',
              // Large relative to the scrub window, which is what makes the lit
              // edge sweep through the words one at a time rather than fading
              // the whole paragraph up together.
              stagger: 0.8,
              scrollTrigger: {
                trigger: block,
                start: 'top 85%',
                end: 'bottom 60%',
                scrub: 0.5,
              },
            },
          );
        });
      });

      // Trigger positions are measured against the layout as it is right now.
      // Webfonts and images land later and move everything, so re-measure once
      // they have — otherwise a trigger can sit below its element and never
      // fire, leaving that content hidden rather than merely unanimated.
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      document.fonts?.ready.then(refresh).catch(() => {});
      const settle = window.setTimeout(refresh, 1200);

      return () => {
        window.removeEventListener('load', refresh);
        window.clearTimeout(settle);
        ctx.revert();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
