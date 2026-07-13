'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '@/src/types';
import { LANGUAGE_DETAILS, getTranslations, TranslationKeys } from '@/src/translations';

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

  // Reveal-on-scroll: fade/slide elements marked with .reveal as they enter
  // view. Uses a scroll/resize check with a safety pass so content can never
  // get stuck hidden. (Verbatim from the original App.tsx.)
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (nodes.length === 0) return;

    const reveal = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      nodes.forEach((n) => {
        if (n.classList.contains('is-visible')) return;
        const r = n.getBoundingClientRect();
        if (r.top < vh - 40 && r.bottom > 0) n.classList.add('is-visible');
      });
    };

    reveal();
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal);
    const safety = window.setTimeout(() => {
      nodes.forEach((n) => n.classList.add('is-visible'));
    }, 2500);

    return () => {
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
      window.clearTimeout(safety);
    };
  }, []);

  // Hero CTAs: jump straight to the relevant form and open it automatically.
  const scrollToForm = (type: 'employer' | 'candidate') => {
    // The forms section fades in via scroll-triggered reveal (starts at
    // opacity:0 / translated down). Jumping there immediately — before the
    // user has ever scrolled near it — would land on a still-invisible
    // block, which looks like the click did nothing. Force it visible first.
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));

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
        const headerOffset = 96;
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
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
