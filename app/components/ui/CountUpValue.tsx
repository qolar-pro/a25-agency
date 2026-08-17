'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animates the numbers inside a stat value, then pops once it lands.
 *
 * The stat strings are localised and not uniformly numeric — they include
 * "30–90 days", "7", "2026" and plain words like "Asia". So rather than taking
 * a number prop, this walks the string and animates every digit run it finds
 * in place, leaving all surrounding text (units, dashes, words) untouched.
 * A value with no digits still gets the landing pop, so the four cards in the
 * row stay in visual sync.
 *
 * Counting starts when the card first scrolls into view, and runs once.
 */

const DURATION = 1100;

// Ease-out cubic: fast off the mark, settling gently into the final number.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CountUpValue({
  value,
  className = '',
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;

      // Respect reduced motion: show the final value, skip the count and pop.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setProgress(1);
        setDone(true);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        setProgress(easeOut(t));
        if (t < 1) requestAnimationFrame(tick);
        else setDone(true);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Interpolate each digit run toward its target, preserving the original
  // digit count so "07" never renders narrower than "2026" mid-flight and
  // shifts the layout around it.
  const rendered = value.replace(/\d+/g, (digits) => {
    const target = parseInt(digits, 10);
    const current = Math.round(target * progress);
    return String(current).padStart(digits.length, '0');
  });

  return (
    <span
      ref={ref}
      // The pop fires once, on the frame the count completes.
      className={`inline-block ${done ? 'animate-pop' : ''} ${className}`}
      // Screen readers get the real value, never an in-flight partial number.
      aria-label={value}
    >
      <span aria-hidden="true">{rendered}</span>
    </span>
  );
}
