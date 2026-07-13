'use client';

import { ArrowRight } from 'lucide-react';
import { Language } from '@/src/types';
import { LANGUAGE_DETAILS } from '@/src/translations';
import { useSite } from './SiteProvider';

// Modern crisp sticky header with the 8-language switcher (verbatim JSX from
// App.tsx). Language changes go through `selectLanguage` (persists the choice);
// resetting the form-success panels on a language change is handled by the
// contact section itself via an effect keyed on `language`.
export default function SiteHeader() {
  const { t, language, selectLanguage } = useSite();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs">
      <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src="/a25icon.jpeg"
            alt="A25 logo"
            className="h-9 lg:h-11 w-auto rounded border border-zinc-200 shadow-sm"
          />
          <div>
            <span className="font-semibold text-zinc-950 tracking-wide text-base font-mono block leading-none">
              {t.brand}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
              {t.slogan}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Elegant Language selector supporting all 8 languages */}
          <div className="flex items-center bg-zinc-100 border border-zinc-200 p-0.5 rounded-lg text-xs font-mono">
            <div className="hidden md:flex items-center gap-0.5">
              {(['EN', 'MK', 'AL', 'DE'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => selectLanguage(lang)}
                  className={`px-2 py-1 rounded transition-all font-bold ${
                    language === lang
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-300'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <select
              value={language}
              onChange={(e) => selectLanguage(e.target.value as Language)}
              className="bg-transparent text-zinc-800 font-bold px-2 py-1 outline-none text-xs cursor-pointer"
            >
              {Object.entries(LANGUAGE_DETAILS).map(([code, details]) => (
                <option key={code} value={code}>
                  {details.flag} {details.native} ({code})
                </option>
              ))}
            </select>
          </div>

          <a
            href="#contact-desk"
            className="btn-shine hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition-all"
          >
            <span>{t.directLine}</span>
            <ArrowRight className="w-3 h-3 text-zinc-300" />
          </a>
        </div>
      </div>
    </header>
  );
}
