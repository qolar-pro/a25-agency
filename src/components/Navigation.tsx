import React, { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface NavigationProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onRequestOpen: () => void;
  onApplyOpen: () => void;
  activeRequestsCount: number;
}

export default function Navigation({ 
  language, 
  setLanguage, 
  onRequestOpen, 
  onApplyOpen,
  activeRequestsCount
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];
  const langs: Language[] = ['EN', 'MK', 'AL'];

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/a25icon.jpeg" alt="A25 logo" className="h-11 w-auto rounded-md" />
            <div className="flex flex-col">
              <span className="font-display text-sm font-bold text-zinc-900 tracking-wider">VANGUARD BALKAN</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wide uppercase font-light">
                {language === 'EN' ? 'Bilateral Sourcing Agency' : language === 'MK' ? 'Агенција за човечки ресурси' : 'Agjenci e Burimeve Njerëzore'}
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToId('sectors')} 
              className="text-xs font-mono font-medium text-zinc-600 hover:text-blue-600 transition-colors"
            >
              {language === 'EN' ? 'SECTORS' : language === 'MK' ? 'СЕКТОРИ' : 'SEKTORËT'}
            </button>
            <button 
              onClick={() => scrollToId('roadmap')} 
              className="text-xs font-mono font-medium text-zinc-600 hover:text-blue-600 transition-colors"
            >
              {language === 'EN' ? 'PROCESS' : language === 'MK' ? 'ПРИСТАПТ' : 'UDHËRRËFYESI'}
            </button>
            <button 
              onClick={() => scrollToId('calculator-section')} 
              className="text-xs font-mono font-medium text-zinc-600 hover:text-blue-600 transition-colors"
            >
              {language === 'EN' ? 'SAVINGS CALC' : language === 'MK' ? 'ЗАШТЕДА' : 'LLOGARITËSI'}
            </button>
            <button 
              onClick={() => scrollToId('logs')} 
              className="text-xs font-mono font-medium text-zinc-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              {language === 'EN' ? 'LIVE REGISTRATIONS' : language === 'MK' ? 'АКТИВНИ БАРАЊА' : 'LOGET'}
              {activeRequestsCount > 0 && (
                <span className="inline-flex items-center justify-center bg-blue-600 text-[10px] font-bold text-white px-2 h-4.5 rounded-full font-mono">
                  {activeRequestsCount}
                </span>
              )}
            </button>
          </div>

          {/* Lang Selector & Side Links */}
          <div className="hidden lg:flex items-center bg-zinc-100 border border-zinc-250 px-1 py-1 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-zinc-400 mx-2" />
            {langs.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 text-[10px] font-mono tracking-widest transition-all rounded ${
                  language === lang 
                    ? 'bg-white text-zinc-900 border border-zinc-200 font-bold shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Prompt Direct Contact Header Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => scrollToId('contact-form-section')}
              className="px-5 py-2 w-full bg-blue-600 hover:bg-blue-700 text-xs font-mono text-white font-medium tracking-wide transition-all rounded shadow-sm hover:shadow"
            >
              {language === 'EN' ? 'CONTACT FORM' : language === 'MK' ? 'КОНТАКТ ФОРМА' : 'FORMULARI IK'}
            </button>
          </div>

          {/* Mobile switcher */}
          <div className="flex md:hidden items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-white border border-zinc-200 text-zinc-700 font-mono text-xs px-2 py-1 rounded"
            >
              {langs.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white py-4 px-4 space-y-3 font-mono shadow-inner">
          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => scrollToId('sectors')} 
              className="text-left text-xs text-zinc-600 hover:text-zinc-900 py-1"
            >
              {language === 'EN' ? 'SECTORS' : language === 'MK' ? 'СЕКТОРИ' : 'SEKTORËT'}
            </button>
            <button 
              onClick={() => scrollToId('roadmap')} 
              className="text-left text-xs text-zinc-600 hover:text-zinc-900 py-1"
            >
              {language === 'EN' ? 'PROCESS' : language === 'MK' ? 'ПРИСТАПТ' : 'UDHËRRËFYESI'}
            </button>
            <button 
              onClick={() => scrollToId('calculator-section')} 
              className="text-left text-xs text-zinc-600 hover:text-zinc-900 py-1"
            >
              {language === 'EN' ? 'SAVINGS CALC' : language === 'MK' ? 'ЗАШТЕДА' : 'LLOGARITËSI'}
            </button>
            <button 
              onClick={() => scrollToId('logs')} 
              className="text-left text-xs text-zinc-600 hover:text-zinc-900 py-1 flex items-center justify-between"
            >
              <span>{language === 'EN' ? 'LIVE REGS' : language === 'MK' ? 'АКТИВНИ БАРАЊА' : 'LOGET'}</span>
              {activeRequestsCount > 0 && (
                <span className="bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold">
                  {activeRequestsCount}
                </span>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-200">
            <button 
              onClick={() => { setMobileMenuOpen(false); scrollToId('contact-form-section'); }}
              className="w-full py-2 bg-blue-600 text-center text-xs text-white font-medium rounded shadow-sm"
            >
              {language === 'EN' ? 'CONTACT FORM' : language === 'MK' ? 'КОНТАКТ ФОРМА' : 'FORMULARI IK'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
