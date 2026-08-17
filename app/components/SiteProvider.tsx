'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '@/src/types';
import { LANGUAGE_DETAILS, getTranslations, TranslationKeys } from '@/src/translations';
import { gsap } from 'gsap';
import { journey } from './motion/journey';

/**
 * Shared, cross-section site state, lifted out of the old single-file App.tsx
 * so the page could be split into real route sections without losing the two
 * couplings that genuinely span sections:
 *   1. `language` (+ derived `t`) — read by every section.
 *   2. `empFormOpen` / `candFormOpen` — the hero CTAs open the forms that live
 *      down in the contact section, so that open/closed state can't live inside
 *      either section alone.
 *
 * Everything section-local (form field state, the industries carousel index,
 * the inquiries ledger, etc.) stays inside its own section component — only
 * these genuinely-shared bits live here.
 */
interface SiteContextValue {
  language: Language;
  selectLanguage: (lang: Language) => void;
  t: TranslationKeys;
  empFormOpen: boolean;
  setEmpFormOpen: (open: boolean) => void;
  candFormOpen: boolean;
  setCandFormOpen: (open: boolean) => void;
  scrollToForm: (type: 'employer' | 'candidate') => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within <SiteProvider>');
  return ctx;
}

export default function SiteProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');
  const [empFormOpen, setEmpFormOpen] = useState(false);
  const [candFormOpen, setCandFormOpen] = useState(false);

  const t = getTranslations(language);

  // User-initiated language change: update state and persist the choice.
  // (The auto-detection effect below uses the raw setter so an auto-detected
  // language is not persisted as an explicit user preference.)
  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('a25_selected_lang', lang);
    } catch {
      /* ignore storage errors */
    }
  };

  // Automatically detect the right language from client (saved preference,
  // browser locale, timezone) — client-only, mirrors the original App.tsx.
  useEffect(() => {
    const stored = localStorage.getItem('a25_selected_lang');
    if (stored && stored in LANGUAGE_DETAILS) {
      setLanguage(stored as Language);
      return;
    }

    let detected: Language = 'EN';
    try {
      const browserLang = (navigator.language || '').slice(0, 2).toUpperCase();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

      if (tz.includes('Skopje')) {
        detected = 'MK';
      } else if (tz.includes('Tirana') || tz.includes('Pristina')) {
        detected = 'AL';
      } else if (tz.includes('Berlin') || tz.includes('Vienna') || tz.includes('Zurich')) {
        detected = 'DE';
      } else if (tz.includes('Athens')) {
        detected = 'EL';
      } else if (tz.includes('Madrid') || tz.includes('Canary')) {
        detected = 'ES';
      } else if (tz.includes('Warsaw')) {
        detected = 'PL';
      } else if (tz.includes('Stockholm')) {
        detected = 'SV';
      } else if (browserLang in LANGUAGE_DETAILS) {
        detected = browserLang as Language;
      }
    } catch (err) {
      console.warn('Client localization auto-detection error:', err);
    }
    setLanguage(detected);
  }, []);

  // The old CSS `.reveal` + IntersectionObserver system was removed here: every
  // section it covered is now on the shared GSAP system
  // (app/components/motion/Reveal.tsx) via [data-reveal] / [data-reveal-group].
  // Running both over the same nodes is how elements end up with competing
  // animations and get stranded invisible, so there is deliberately only one.

  // Hero CTAs: jump straight to the relevant form and open it automatically.
  const scrollToForm = (type: 'employer' | 'candidate') => {
    // The forms section enters via a scroll-triggered reveal, so before this
    // click it is sitting at autoAlpha:0. Scrolling there normally fires the
    // trigger on the way and it animates in — but forcing it visible up front
    // removes any chance of landing on a blank block, which reads as the
    // click having done nothing. gsap.set wins over the pending `from` tween's
    // start values, and the tween itself is `once`, so this can't fight it.
    if (typeof window !== 'undefined') {
      const groups = document.querySelectorAll<HTMLElement>('[data-reveal-group]');
      groups.forEach((g) => gsap.set(Array.from(g.children), { autoAlpha: 1, y: 0 }));
      gsap.set('[data-reveal]', { autoAlpha: 1, y: 0 });
    }

    if (type === 'employer') setEmpFormOpen(true);
    else setCandFormOpen(true);

    const id = type === 'employer' ? 'employer-form-trigger' : 'candidate-form-trigger';

    // Defer the measurement/scroll by two frames so it runs after React has
    // committed the state update above and the browser has painted the
    // reveal-class change — measuring immediately can read stale (pre-update)
    // layout, which is what previously made this need a second click.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (!el) return;
        // Routed through journey.scrollTo rather than window.scrollTo: Lenis
        // now owns the scroll position and animates toward its own target, so
        // a direct window.scrollTo gets dragged straight back. journey falls
        // back to native scrolling when Lenis isn't running (reduced motion).
        journey.scrollTo(el, { offset: -96 });
      });
    });
  };

  return (
    <SiteContext.Provider
      value={{
        language,
        selectLanguage,
        t,
        empFormOpen,
        setEmpFormOpen,
        candFormOpen,
        setCandFormOpen,
        scrollToForm,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}
