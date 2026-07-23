'use client';

import { Shield, Building2, UserCheck, CheckCircle2, Check, Clock, Globe2, Layers, Calendar } from 'lucide-react';
import { useSite } from './SiteProvider';

// SCROLL AREA 1 (upper half): the hero greeting + CTAs and the symmetrical
// Clients / Workforce informational columns. JSX is verbatim from App.tsx;
// only the shared `t` and `scrollToForm` now come from context.
export default function HeroSection() {
  const { t, scrollToForm } = useSite();

  return (
    <>
      {/* Symmetrical Hero Greeting segment */}
      <div className="text-center max-w-3xl lg:max-w-4xl mx-auto space-y-4 pt-4 animate-fade-up">
        <span className="inline-flex items-center gap-1.5 bg-blue-50/80 backdrop-blur-sm border border-blue-200 text-blue-700 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full animate-glow-pulse">
          <Shield className="w-3 h-3 text-blue-600 animate-float" />
          {t.heroBadge}
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] uppercase text-gradient-animated">
          {t.tagline}
        </h1>
        <p className="text-zinc-600 text-sm sm:text-base lg:text-lg max-w-2xl lg:max-w-3xl mx-auto font-normal leading-relaxed whitespace-pre-line">
          {t.heroDesc}
        </p>

        {/* Hero CTAs: jump to & auto-open the matching form below */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => scrollToForm('employer')}
            className="btn-shine w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase font-black tracking-widest rounded-2xl transition-all shadow-md shadow-blue-500/15 active:scale-98"
          >
            <Building2 className="w-4 h-4" />
            <span>{t.lookingToHire}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToForm('candidate')}
            className="btn-shine w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-mono text-xs uppercase font-black tracking-widest rounded-2xl transition-all shadow-md shadow-amber-500/15 active:scale-98"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t.lookingForWork}</span>
          </button>
        </div>

        {/* Process-facts stats row — Phase 7f. Facts true today only (process
            length, sourcing region, industry count, founding year). NOT volume
            /traction numbers: A25 hasn't launched, so no candidates-available
            or workers-placed claims (see CLAUDE.md "Hero stats"). */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto">
          {[
            { icon: Clock, value: t.statProcessValue, label: t.statProcessLabel },
            { icon: Globe2, value: t.statSourceValue, label: t.statSourceLabel },
            { icon: Layers, value: t.statIndustriesValue, label: t.statIndustriesLabel },
            { icon: Calendar, value: t.statLaunchValue, label: t.statLaunchLabel },
          ].map(({ icon: Icon, value, label }, idx) => (
            <div
              key={idx}
              className="card-glass border border-zinc-200/70 rounded-xl px-3 py-4 flex flex-col items-center text-center gap-1.5 hover:border-blue-300/70 transition-colors"
            >
              <Icon className="w-4 h-4 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 leading-none">
                {value}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Symmetrical Client vs Workforce Informational Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pt-4 reveal">
        {/* Corporate Clients Info Block */}
        <div className="card-glass border border-zinc-200/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-300/70 hover:shadow-[0_24px_60px_rgba(31,81,255,0.10)] hover-lift group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-blue-600 tracking-widest uppercase font-bold">
                [01 // CLIENTS]
              </span>
              <div className="p-2 bg-blue-50 rounded text-blue-700 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_22px_rgba(31,81,255,0.35)] group-hover:bg-blue-100">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-zinc-950">
              {t.forEmployersTitle}
            </h2>
            <p className="text-zinc-650 text-xs sm:text-sm leading-relaxed">
              {t.forEmployersDesc}
            </p>

            <div className="border-t border-zinc-100 pt-4 space-y-3 font-medium text-xs text-zinc-700">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{t.employersBullet1}</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{t.employersBullet2}</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{t.employersBullet3}</span>
              </div>
              {t.employersBullet4 && (
                <div className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{t.employersBullet4}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-[10px] font-mono font-bold uppercase">
            <span>{t.badgeSourced}</span>
            <span className="text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">{t.badgeActive}</span>
          </div>
        </div>

        {/* Workforce & Candidate Pool Info Block */}
        <div className="card-glass border border-zinc-200/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-300/70 hover:shadow-[0_24px_60px_rgba(31,81,255,0.10)] hover-lift group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-blue-600 tracking-widest uppercase font-bold">
                [02 // WORKFORCE]
              </span>
              <div className="p-2 bg-zinc-100 rounded text-zinc-800 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_22px_rgba(245,158,11,0.30)] group-hover:bg-amber-50 group-hover:text-amber-600">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-zinc-950">
              {t.forCandidatesTitle}
            </h2>
            <p className="text-zinc-650 text-xs sm:text-sm leading-relaxed">
              {t.forCandidatesDesc}
            </p>

            <div className="border-t border-zinc-100 pt-4 space-y-3 font-medium text-xs text-zinc-700">
              <div className="flex gap-2.5 items-start">
                <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                <span>{t.candidatesBullet1}</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                <span>{t.candidatesBullet2}</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                <span>{t.candidatesBullet3}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-[10px] font-mono font-bold uppercase">
            <span>{t.badgeRecruited}</span>
            <span className="text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">{t.badgeVetted}</span>
          </div>
        </div>
      </div>
    </>
  );
}
