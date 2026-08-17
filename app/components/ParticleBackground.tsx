'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: 'blue' | 'amber' | 'slate';
}

/**
 * An interactive "connection network" — drifting nodes linked by lines that
 * brighten near the cursor. Thematically fits A25: connecting people across
 * borders. Purely decorative; fixed behind all content, pointer-events: none.
 *
 * PERFORMANCE — this layer is the single heaviest thing on the page, so it is
 * written defensively. The original version compared every particle against
 * every other one (O(n²) — ~6,000 pairs per frame at 110 particles) and issued
 * a separate beginPath/stroke for each link, which is another ~6,000 draw calls
 * per frame. That saturated the main thread; during a scroll it starved every
 * main-thread animation on the page, which is what made the gradient headline
 * and the word highlight visibly freeze until scrolling stopped.
 *
 * Four changes fix it, in rough order of impact:
 *   1. A uniform spatial grid replaces the all-pairs loop. Cells are LINK wide,
 *      so a particle can only link to something in its own cell or the four
 *      forward neighbours — the cost becomes ~linear in particle count.
 *   2. Links are batched into a few alpha buckets and drawn as ONE path each,
 *      taking per-frame draw calls from thousands to single digits.
 *   3. Squared distances throughout — Math.hypot is dramatically slower than a
 *      multiply, and nothing here needs the true distance, only comparisons.
 *   4. Rendering stops entirely when the tab is hidden.
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // `alpha: false` is NOT usable here — this canvas must stay transparent to
    // show the aurora behind it. `desynchronized` lets the browser skip a
    // compositing sync point for a decorative layer nothing depends on.
    const ctx = canvas.getContext('2d', { desynchronized: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Capped at 1.5 rather than 2: this is a soft, blurry decorative layer, so
    // the extra fill cost of a true 2x buffer buys nothing visible on a
    // high-DPI display but measurably raises per-frame GPU work.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const tint = (hue: Particle['hue'], a: number) => {
      switch (hue) {
        case 'blue':
          return `rgba(31, 81, 255, ${a})`;
        case 'amber':
          return `rgba(217, 119, 6, ${a})`;
        default:
          return `rgba(100, 116, 139, ${a})`;
      }
    };

    const LINK = 128;
    const LINK_SQ = LINK * LINK;
    const MOUSE_LINK = 168;
    const MOUSE_LINK_SQ = MOUSE_LINK * MOUSE_LINK;

    // Link opacity is quantised into this many buckets so every link at a
    // similar distance can share one path and one stroke call.
    const BUCKETS = 4;
    const bucketPaths: Path2D[] = [];

    // Grid state, rebuilt per frame. Cells hold particle indices.
    let cols = 0;
    let rows = 0;
    let grid: number[][] = [];

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density lowered (was area/17000, cap 110). With the grid in place the
      // cost is linear, but fewer nodes still means less fill and a calmer look.
      const count = Math.min(70, Math.max(24, Math.floor((w * h) / 26000)));
      particles = Array.from({ length: count }, () => {
        const roll = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.7 + 0.7,
          hue: roll < 0.14 ? 'amber' : roll < 0.5 ? 'blue' : 'slate',
        };
      });

      cols = Math.max(1, Math.ceil(w / LINK));
      rows = Math.max(1, Math.ceil(h / LINK));
      grid = Array.from({ length: cols * rows }, () => []);
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // --- integrate motion, then bucket into the grid ---------------------
      for (let i = 0; i < grid.length; i++) grid[i].length = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // wrap softly at edges
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        // gentle damping toward base speed
        p.vx *= 0.999;
        p.vy *= 0.999;

        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / LINK)));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / LINK)));
        grid[cy * cols + cx].push(i);
      }

      // --- node-to-node links, via the grid --------------------------------
      for (let b = 0; b < BUCKETS; b++) bucketPaths[b] = new Path2D();

      // Only these four neighbours are scanned (plus the cell itself). Going
      // right/down only means each pair is visited exactly once, so no link is
      // drawn twice and no extra dedupe bookkeeping is needed.
      const NEIGHBOURS = [
        [1, 0],
        [-1, 1],
        [0, 1],
        [1, 1],
      ];

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const cell = grid[cy * cols + cx];
          if (cell.length === 0) continue;

          // pairs inside this cell
          for (let a = 0; a < cell.length; a++) {
            for (let b2 = a + 1; b2 < cell.length; b2++) {
              linkPair(particles[cell[a]], particles[cell[b2]]);
            }
          }

          // pairs against forward neighbour cells
          for (let n = 0; n < NEIGHBOURS.length; n++) {
            const nx = cx + NEIGHBOURS[n][0];
            const ny = cy + NEIGHBOURS[n][1];
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
            const other = grid[ny * cols + nx];
            for (let a = 0; a < cell.length; a++) {
              for (let b2 = 0; b2 < other.length; b2++) {
                linkPair(particles[cell[a]], particles[other[b2]]);
              }
            }
          }
        }
      }

      ctx.lineWidth = 0.6;
      for (let b = 0; b < BUCKETS; b++) {
        // Bucket 0 is the faintest; spread alpha evenly up to the original 0.13.
        const a = ((b + 1) / BUCKETS) * 0.13;
        ctx.strokeStyle = `rgba(100, 116, 139, ${a})`;
        ctx.stroke(bucketPaths[b]);
      }

      // --- cursor links + attraction, and the nodes themselves -------------
      const mousePath = new Path2D();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdSq = mdx * mdx + mdy * mdy;
        const near = mdSq < MOUSE_LINK_SQ;

        if (near) {
          mousePath.moveTo(p.x, p.y);
          mousePath.lineTo(mouse.x, mouse.y);
          p.vx -= mdx * 0.000018;
          p.vy -= mdy * 0.000018;
        }

        // clamp velocity
        p.vx = Math.max(-0.7, Math.min(0.7, p.vx));
        p.vy = Math.max(-0.7, Math.min(0.7, p.vy));

        ctx.fillStyle = tint(p.hue, near ? 0.85 : 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // One stroke for every cursor link. The per-link distance fade is dropped
      // here deliberately — with the cursor as a shared endpoint the fan reads
      // as one shape, and a flat alpha is indistinguishable in motion.
      ctx.strokeStyle = 'rgba(31, 81, 255, 0.18)';
      ctx.lineWidth = 0.9;
      ctx.stroke(mousePath);

      if (!reduceMotion) raf = requestAnimationFrame(render);
    };

    function linkPair(p: Particle, q: Particle) {
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dSq = dx * dx + dy * dy;
      if (dSq >= LINK_SQ) return;
      // Bucket on squared distance — the mapping is non-linear but monotonic,
      // and this is a decorative fade, not a measurement.
      const t = 1 - dSq / LINK_SQ;
      const b = Math.min(BUCKETS - 1, Math.floor(t * BUCKETS));
      bucketPaths[b].moveTo(p.x, p.y);
      bucketPaths[b].lineTo(q.x, q.y);
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    let resizeTimer: number;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    };

    // Nothing to animate behind a hidden tab; stop burning frames there.
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduceMotion) raf = requestAnimationFrame(render);
    };

    build();
    render(); // draws at least one frame (and animates unless reduced motion)
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
