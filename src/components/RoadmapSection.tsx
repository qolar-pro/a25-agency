import React, { useState } from 'react';
import { UserCheck, FileSignature, CheckCircle2, Milestone } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS, ROADMAP } from '../data';

interface RoadmapSectionProps {
  language: Language;
}

export default function RoadmapSection({ language }: RoadmapSectionProps) {
  const t = TRANSLATIONS[language];
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const icons = [
    <UserCheck className="w-5 h-5 text-blue-600" />,
    <FileSignature className="w-5 h-5 text-indigo-600" />,
    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
  ];

  return (
    <section id="roadmap" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-b border-zinc-200 overflow-hidden">
      
      {/* Editorial Decorative Grids */}
      <div className="absolute inset-x-0 h-[100px] top-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:100%_12px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-50/55 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Editorial Header */}
        <div className="border-b border-zinc-200 pb-8 mb-16 text-left">
          <span className="text-xs font-mono text-blue-600 tracking-[0.4em] uppercase block mb-2 font-bold">
            {language === 'EN' ? 'STEPS TO PLACEMENT' : 'ПРОЦЕДУРА ЗА РЕГРУТАЦИЈА'}: [02]
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-zinc-900 uppercase mb-4">
            {t.roadmapHeader}
          </h2>
          <p className="text-xs sm:text-sm font-mono text-zinc-500 max-w-xl leading-relaxed uppercase tracking-wider text-left">
            {t.roadmapSubtitle}
          </p>
        </div>

        {/* Horizontal/Vertical Steps System */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {ROADMAP.map((step, index) => {
            const isHovered = hoveredStep === step.number;
            return (
              <div
                key={step.number}
                onMouseEnter={() => setHoveredStep(step.number)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`group relative p-8 sm:p-10 border transition-all duration-300 flex flex-col justify-between h-[360px] overflow-hidden rounded-2xl ${
                  isHovered 
                    ? 'bg-white border-blue-500 shadow-md' 
                    : 'bg-white border-zinc-200'
                }`}
              >
                {/* Massive Background Number */}
                <div className="absolute top-[-10px] right-2 p-4 text-[100px] leading-none font-black italic text-zinc-100 select-none group-hover:text-blue-50 transition-colors duration-300">
                  {step.number}
                </div>

                {/* Left Side Aesthetic Bracket */}
                {isHovered && (
                  <div className="absolute top-0 left-0 h-full w-[4px] bg-blue-600 rounded-l" />
                )}

                {/* Step Top Section */}
                <div className="space-y-4 relative z-10 text-left">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-xs text-zinc-700 font-bold bg-zinc-50">
                      {step.number}
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 tracking-[0.2em] font-bold uppercase block">
                      {step.subtitle[language]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight uppercase pt-2 font-display">
                    {step.title[language]}
                  </h3>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                    {step.description[language]}
                  </p>
                </div>

                {/* Step Bottom Verification Lock */}
                <div className="relative z-10 pt-4 border-t border-zinc-100 font-mono space-y-2 mt-auto text-left">
                  <div className="flex items-center gap-2">
                    {icons[index]}
                    <span className="text-[9px] text-zinc-400 tracking-wider uppercase font-bold">
                      {language === 'EN' ? 'VALIDITY CHECK' : 'КОНТРОЛА'}:
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-800 font-medium">
                    → {step.complianceCheck[language]}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

        {/* Global Treaty Warning note */}
        <div className="mt-12 bg-white border border-zinc-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-xs text-left shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Milestone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-900 uppercase block">
                {language === 'EN' ? 'GOVERNMENT ACCORD APPROVED' : 'ОДОБРЕНО ОД СЛУЖБИТЕ'}
              </span>
              <span className="text-[11px] text-zinc-500 uppercase">
                {language === 'EN' 
                  ? 'Official bilateral worker flows integrated directly with consular registries.' 
                  : 'Законски признати програми за миграција и вработување во Македонија.'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 uppercase tracking-widest sm:text-right font-bold">
            YEAR 2026 // BI-ANNUAL AGREEMENTS
          </div>
        </div>

      </div>
    </section>
  );
}
