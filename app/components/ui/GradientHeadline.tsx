'use client';

import { Fragment, useEffect, useRef } from 'react';

/**
 * The hero headline, split into individually reactive letters.
 *
 * Two things are happening at once:
 *
 * 1. GRADIENT. Each letter carries its own copy of the animated brand gradient
 *    and offsets its background-position by a running index, keeping the
 *    left-to-right sweep continuous across the headline. The gradient can't
 *    live on the <h1> instead, because `background-clip: text` paints on the
 *    parent and clips to its glyphs — a transformed child then renders
 *    invisible. See the `.hero-letter` block in src/index.css.
 *
 * 2. POP. A pure `:hover` rule was too soft: only the one letter under the
 *    cursor moved, and it moved on the same easing whether you swept across or
 *    stopped. Instead the pointer position drives a falloff, so the letter you
 *    are on takes the full lift and its neighbours take a decaying share. The
 *    headline behaves like a surface being pushed rather than a row of
 *    independent buttons, which is what makes it read as premium.
 *
 * Transforms are written straight to the DOM in a pointermove handler — no
 * React state, so this costs nothing per frame in the reconciler.
 */

// How many letters either side of the cursor still respond.
const REACH = 3;
// Peak displacement, in em, so it scales with the responsive headline size.
const LIFT = 0.26;
const SCALE = 0.3;
const ROTATE = 7;

export default function GradientHeadline({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Touch devices have no hover, and a fine-pointer check keeps this off
    // phones where it would fire on every tap-drag.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const letters = Array.from(root.querySelectorAll<HTMLElement>('.hero-letter'));
    if (letters.length === 0) return;

    // Cached so the pointermove handler never reads layout (which would force a
    // synchronous reflow on every mouse event). Refreshed on resize instead.
    let centres: number[] = [];
    const measure = () => {
      centres = letters.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2;
      });
    };
    measure();

    let frame = 0;
    let pointerX = 0;
    let active = false;

    const apply = () => {
      frame = 0;
      for (let i = 0; i < letters.length; i++) {
        const el = letters[i];
        if (!active) {
          el.style.setProperty('--lift', '0em');
          el.style.setProperty('--sc', '1');
          el.style.setProperty('--rot', '0deg');
          continue;
        }

        // Distance from the cursor measured in letter-widths, not pixels, so
        // the falloff feels the same at every breakpoint.
        const dist = Math.abs(pointerX - centres[i]) / 26;
        if (dist > REACH) {
          el.style.setProperty('--lift', '0em');
          el.style.setProperty('--sc', '1');
          el.style.setProperty('--rot', '0deg');
          continue;
        }

        // Cosine falloff: 1 directly under the cursor, easing to 0 at REACH.
        // Smoother at the edges than a linear ramp, so letters entering the
        // field don't visibly snap on.
        const t = 0.5 + 0.5 * Math.cos((dist / REACH) * Math.PI);
        // Signed, so letters tilt away from the cursor on each side.
        const dir = pointerX > centres[i] ? -1 : 1;

        el.style.setProperty('--lift', `${-LIFT * t}em`);
        el.style.setProperty('--sc', `${1 + SCALE * t}`);
        el.style.setProperty('--rot', `${ROTATE * t * dir}deg`);
      }
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      active = true;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      active = false;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onResize = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(apply);
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', onResize);
    // Letter centres shift when the gradient/fonts finish loading or the
    // language changes the string length.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      if (frame) cancelAnimationFrame(frame);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [text]);

  // Split on runs of whitespace, dropping empties so a double space or a
  // trailing newline in a translation can't emit a stray zero-width word.
  const words = text.split(/\s+/).filter(Boolean);

  // Runs across the entire headline so the gradient phase keeps advancing
  // between words instead of resetting at every space.
  let letterIndex = 0;

  return (
    <span ref={ref} className={`hero-headline ${className}`}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="hero-word">
            {Array.from(word).map((char, ci) => {
              const i = letterIndex++;
              return (
                <span
                  key={ci}
                  className="hero-letter"
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {char}
                </span>
              );
            })}
          </span>
          {/* The inter-word space is a sibling of the word span, not a child.
              `.hero-word` is inline-block, so a space tucked inside it would be
              swallowed by that box and the headline could never wrap — the
              break opportunity only exists in the parent's inline flow. */}
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
