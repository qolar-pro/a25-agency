import React, { useState } from 'react';
import { Clock, ArrowUpRight, Flame, Check } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, SECTORS } from '../data';

interface SectorsSectionProps {
  language: Language;
  onOpenRequest: () => void;
}

export default function SectorsSection({ language, onOpenRequest }: SectorsSectionProps) {
  const t = TRANSLATIONS[language];
  const [activeSector, setActiveSector] = useState<string>(SECTORS[0].id);

  const selectedSectorData = SECTORS.find(s => s.id === activeSector) || SECTORS[0];

  const scrollToContact = () => {
    const el = document.getElementById('contact-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="sectors" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200 overflow-hidden">
      
      {/* Editorial Decorative Background Details */}
      <div className="absolute top-1/2 left-1/4 w-[250px] h-[250px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-8 mb-16">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-blue-600 tracking-[0.3em] uppercase block font-bold">
              {language === 'EN' ? 'CAPABILITY MATRIX' : language === 'MK' ? 'СФЕРИ НА ДЕЈНОСТ' : 'FUSHAT E VEPRIMIT'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-zinc-900 uppercase">
              {t.sectorHeader}
            </h2>
          </div>
          <p className="text-zinc-500 font-mono text-xs max-w-sm mt-4 md:mt-0 leading-relaxed text-left">
            {language === 'EN' 
              ? 'Our talent databases are segmented into strategic industries ready for priority transits.'
              : language === 'MK'
              ? 'Базата на кадар е поделена во усогласени индустриски сектори за брза испорака до претпријатијата.'
              : 'Bazat tona janë të segmentuara sipas fushave strategjike të ndërtuara për efikasitet.'}
          </p>
        </div>

        {/* Bento/Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Selector list */}
          <div className="lg:col-span-5 space-y-4">
            {SECTORS.map((sector) => {
              const isSelected = activeSector === sector.id;
              return (
                <div
                  key={sector.id}
                  onClick={() => setActiveSector(sector.id)}
                  className={`p-6 border cursor-pointer relative transition-all duration-200 rounded-xl text-left flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-zinc-50 border-blue-500 shadow-sm' 
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {/* Selected neon outline status line */}
                  {isSelected && (
                    <div className="absolute top-4 bottom-4 left-0 w-[4px] bg-blue-600 rounded-r" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-blue-600 font-bold uppercase tracking-wider">
                        {sector.demandRate}% {language === 'EN' ? 'DEMAND RATE' : 'ПОБАРУВАЊЕ'}
                      </span>
                    </div>
                    <h3 className="text-md sm:text-lg font-bold text-zinc-900 uppercase tracking-tight">
                      {sector.title[language]}
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans">
                      {sector.subtitle[language]}
                    </p>
                  </div>

                  <div className={`p-2 border rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'border-zinc-200 text-zinc-400 group-hover:text-zinc-650'
                  }`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Pane */}
          <div className="lg:col-span-7 bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden flex flex-col justify-between min-h-[460px] relative shadow-sm">
            
            {/* Image display */}
            <div className="h-56 relative overflow-hidden">
              <img 
                src={selectedSectorData.image} 
                alt={selectedSectorData.title[language]} 
                className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/10 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div className="bg-white/90 backdrop-blur-sm border border-zinc-200 px-3 py-1.5 rounded-lg font-mono text-[10px] text-zinc-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedSectorData.avgLeadTime[language]}</span>
                </div>
              </div>
            </div>

            {/* Description Matrix & Key Highlights check */}
            <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between space-y-6">
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider block font-bold uppercase">
                  {language === 'EN' ? 'SECTOR PROFILE' : 'ПРОФИЛ НА СЕКТОРОТ'}
                </span>
                <p className="text-zinc-700 text-sm sm:text-base font-sans leading-relaxed text-left">
                  {selectedSectorData.description[language]}
                </p>
              </div>

              {/* Compliance Highlights */}
              <div className="space-y-3 pt-4 border-t border-zinc-200">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider block uppercase font-bold text-left">
                  {language === 'EN' ? 'VETTED CANDIDATE SPECIFICATIONS' : 'ВЕРИФИКУВАНИ КВАЛИФИКАЦИИ'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedSectorData.highlights[language].map((highlight, index) => (
                    <div key={index} className="p-3 bg-white border border-zinc-200 rounded-xl text-left flex items-start gap-2">
                      <div className="p-0.5 bg-blue-50 border border-blue-100 text-blue-600 mt-0.5 rounded">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 leading-tight uppercase">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive deployment action */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-500 uppercase">{language === 'EN' ? 'ACTIVE LIMIT' : 'БИЛАТЕРАЛЕН СТАТУС'}:</span>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[9px] font-bold rounded">
                    {selectedSectorData.demandRate}% APPROVED RATIO
                  </span>
                </div>

                <button
                  onClick={scrollToContact}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white uppercase tracking-wider transition-all rounded shadow-sm hover:shadow"
                >
                  {language === 'EN' ? 'INITIATE RECRUITMENT' : 'ИСКАТЕ ВАКОВ КАДАР'}
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
