'use client';

import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { INDUSTRIES } from './industriesData';
import { useSite } from './SiteProvider';

/**
 * Phase 3 — the "Read More" industry modal. Facebook-photo-viewer layout:
 * a fullscreen dark overlay with a two-pane card (left = copy, right = image),
 * chevrons that cycle through all 7 industries (wrapping), Esc / click-outside
 * to close, and horizontal swipe on touch devices.
 *
 * Horizontal swipe intentionally lives ONLY here — Phase 1d locked the
 * background industries carousel to vertical scroll (`touchAction: 'pan-y'`);
 * this modal is the one place a left/right swipe SHOULD move between panels.
 * `stopPropagation` on the card keeps clicks inside it from closing the modal.
 */

interface IndustryModalProps {
  open: boolean;
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

export default function IndustryModal({ open, index, onClose, onNavigate }: IndustryModalProps) {
  const { language, t } = useSite();

  const n = INDUSTRIES.length;
  const goPrev = useCallback(() => onNavigate((index - 1 + n) % n), [index, n, onNavigate]);
  const goNext = useCallback(() => onNavigate((index + 1) % n), [index, n, onNavigate]);

  // Keyboard: Esc closes, arrows navigate. Also lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, goPrev, goNext]);

  // Touch swipe — scoped to the modal card only (see file header note).
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only treat as a swipe when the gesture is clearly horizontal.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const ind = INDUSTRIES[index];

  return (
    <AnimatePresence>
      {open && ind && (
        <motion.div
          key="industry-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-blue-950/80 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={ind.label[language]}
        >
          {/* Close button (top-right of the whole overlay) */}
          <button
            type="button"
            onClick={onClose}
            aria-label={t.btnClose || 'Close'}
            className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev / next chevrons, fixed at the modal edges */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous industry"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white text-blue-900 shadow-lg flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next industry"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/90 hover:bg-white text-blue-900 shadow-lg flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* The card — click inside must not close; swipe navigates. */}
          <motion.div
            key={ind.key}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ touchAction: 'pan-y' }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row"
          >
            {/* LEFT pane — copy: name, description, guarantees */}
            <div className="order-2 md:order-1 md:w-1/2 flex flex-col p-6 sm:p-8 overflow-y-auto">
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${ind.iconBg} ${ind.iconColor}`}>
                  <ind.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-zinc-950 uppercase tracking-tight leading-tight">
                    {ind.label[language]}
                  </h3>
                  <p className="text-[11px] font-mono text-blue-600 uppercase tracking-wider">
                    {ind.subtitle[language]}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm text-zinc-600 leading-relaxed">
                {ind.description[language]}
              </p>

              <ul className="mt-6 space-y-3">
                {ind.guarantees[language].map((line, gi) => (
                  <li key={gi} className="flex items-start gap-2.5">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-sm text-zinc-700 leading-snug">{line}</span>
                  </li>
                ))}
              </ul>

              {/* Position + count indicator */}
              <div className="mt-auto pt-6 flex items-center gap-2">
                {INDUSTRIES.map((it, di) => (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => onNavigate(di)}
                    aria-label={it.label[language]}
                    className={`h-1.5 rounded-full transition-all ${di === index ? 'w-6 bg-blue-600' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'}`}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT pane — image with a white bottom fade + overlaid name/type */}
            <div className="order-1 md:order-2 md:w-1/2 relative h-52 sm:h-64 md:h-auto md:min-h-[480px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ind.image}
                alt={ind.label[language]}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="text-[10px] font-mono text-blue-700 uppercase tracking-widest font-bold">
                  {ind.subtitle[language]}
                </p>
                <h4 className="font-bold text-base sm:text-lg text-zinc-950 uppercase tracking-tight leading-tight">
                  {ind.label[language]}
                </h4>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
