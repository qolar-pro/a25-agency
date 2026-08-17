'use client';

import { Shield, Building2, UserCheck, CheckCircle2, Check, Clock, Globe2, Layers, Calendar } from 'lucide-react';
import { useSite } from './SiteProvider';
import GradientHeadline from './ui/GradientHeadline';
import ScrollHighlightText from './ui/ScrollHighlightText';
import CountUpValue from './ui/CountUpValue';
import SectionLabel from './ui/SectionLabel';

// SCROLL AREA 1 (upper half): the hero greeting + CTAs and the symmetrical
// Clients / Workforce informational columns. JSX is verbatim from App.tsx;
// only the shared `t` and `scrollToForm` now come from context.
export default function HeroSection() {
  const { t, scrollToForm } = useSite();

  return (
    <>
      {/* Symmetrical Hero Greeting segment */}
      <div className="text-center max-w-3xl lg:max-w-4xl mx-auto space-y-4 pt-4 animate-fade-up">
        {/* Credential pill. Deliberately understated: the previous version
            stacked a pulsing glow, all-caps mono and a floating icon on a
            saturated blue chip, which read as generated UI rather than as a
            licence claim. Now it's a quiet frosted chip in the body typeface —
            sentence case, normal tracking — so it reads like a credential line
            a real agency would put above its headline. */}
        <span className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-zinc-200/90 text-zinc-600 text-[11px] sm:text-xs font-medium px-3.5 py-1.5 rounded-full shadow-3xs">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          {t.heroBadge}
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] uppercase">
          <GradientHeadline text={t.tagline} />
        </h1>
        {/* Scroll-linked highlight: words brighten as the reader travels
            through them, pulling the eye down the paragraph. */}
        <ScrollHighlightText
          text={t.heroDesc}
          className="text-sm sm:text-base lg:text-lg max-w-2xl lg:max-w-3xl mx-auto font-normal leading-relaxed"
        />

        {/* Hero CTAs: jump to & auto-open the matching form below.
            Reworked away from the flat mono/all-caps/black-tracking look —
            now Space Grotesk at a normal weight and tracking, over a real
            gradient surface with a top sheen and a grounded shadow
            (.cta-premium). Same size, position and behaviour as before. */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => scrollToForm('employer')}
            className="btn-shine cta-premium w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-500 hover:to-blue-800 text-white font-display text-sm font-semibold tracking-[0.02em] rounded-2xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 border border-blue-700/50 active:scale-98"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>{t.lookingToHire}</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToForm('candidate')}
            className="btn-shine cta-premium w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-605 text-white font-display text-sm font-semibold tracking-[0.02em] rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 border border-amber-600/50 active:scale-98"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>{t.lookingForWork}</span>
          </button>
        </div>

        {/* Process-facts stats row — Phase 7f. Facts true today only (process
            length, sourcing region, industry count, founding year). NOT volume
            /traction numbers: A25 hasn't launched, so no candidates-available
            or workers-placed claims (see CLAUDE.md "Hero stats"). */}
        <div
          data-reveal-group
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-2xl mx-auto"
        >
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
              {/* Counts up on scroll-in, then pops on landing. Non-numeric
                  values (e.g. "Asia") skip the count but still pop, so the
                  four cards resolve together rather than one going flat. */}
              <CountUpValue
                value={value}
                className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 leading-none tabular-nums"
              />
              <span className="text-[10px] font-display font-semibold uppercase tracking-[0.16em] text-zinc-500 leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Symmetrical Client vs Workforce Informational Columns */}
      {/* `.reveal` dropped here in favour of the GSAP group: the CSS class
          faded the whole grid in as one block, so the two cards arrived
          together. As a group they stagger, which is the point of the system. */}
      <div data-reveal-group className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pt-4">
        {/* Corporate Clients Info Block */}
        <div className="card-glass border border-zinc-200/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-300/70 hover:shadow-[0_24px_60px_rgba(31,81,255,0.10)] hover-lift group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionLabel num="01" text="Clients" />
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

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-[10px] font-display font-semibold uppercase tracking-[0.14em]">
            <span>{t.badgeSourced}</span>
            <span className="text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">{t.badgeActive}</span>
          </div>
        </div>

        {/* Workforce & Candidate Pool Info Block */}
        <div className="card-glass border border-zinc-200/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-300/70 hover:shadow-[0_24px_60px_rgba(31,81,255,0.10)] hover-lift group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionLabel num="02" text="Workforce" />
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

          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-zinc-500 text-[10px] font-display font-semibold uppercase tracking-[0.14em]">
            <span>{t.badgeRecruited}</span>
            <span className="text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">{t.badgeVetted}</span>
          </div>
        </div>
      </div>
    </>
  );
}
