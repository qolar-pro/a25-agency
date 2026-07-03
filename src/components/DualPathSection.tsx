import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ShieldCheck, Check, HelpCircle, Activity, Award, User, Clock, CheckSquare } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface DualPathSectionProps {
  language: Language;
  onOpenRequest: () => void;
  onOpenApply: () => void;
}

export default function DualPathSection({ language, onOpenRequest, onOpenApply }: DualPathSectionProps) {
  const t = TRANSLATIONS[language];
  const [activePath, setActivePath] = useState<'clients' | 'candidates'>('clients');

  // Interactive Calculator State
  const [calcSector, setCalcSector] = useState<'construction' | 'manufacturing' | 'hospitality'>('construction');
  const [calcWorkers, setCalcWorkers] = useState<number>(30);
  const [calcMonths, setCalcMonths] = useState<number>(12);

  // Quick Eligibility State for Balkan Candidates
  const [eligPassport, setEligPassport] = useState<boolean>(true);
  const [eligExperience, setEligExperience] = useState<number>(3);
  const [eligSector, setEligSector] = useState<'construction' | 'hospitality' | 'manufacturing'>('construction');

  // Estimate wages
  const calculatedSavings = useMemo(() => {
    const baseWages = {
      construction: 620, // EUR savings vs heavy non-regional labor agencies
      manufacturing: 480,
      hospitality: 510
    };
    return calcWorkers * calcMonths * baseWages[calcSector];
  }, [calcSector, calcWorkers, calcMonths]);

  // Speed timings
  const calculatedDays = useMemo(() => {
    const speeds = {
      construction: 21,
      manufacturing: 24,
      hospitality: 15
    };
    return speeds[calcSector];
  }, [calcSector]);

  // Eligibility details
  const eligibilityResult = useMemo(() => {
    if (!eligPassport) {
      return {
        status: 'WARNING',
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        title: language === 'EN' ? 'REDUCED TRANSIT PRIORITY' : language === 'MK' ? 'НАМАЛЕН ТРАНЗИТЕН ПРИОРИТЕТ' : 'PRIORITET I REDUKTUAR',
        description: language === 'EN' 
          ? 'Biometric passport is essential for rapid bi-lateral processing. Acquire passport to unlock instant deployment.' 
          : language === 'MK' 
          ? 'Биометрискиот пасош е услов за брз транзит без препреки. Обезбедете пасош пред аплицирање.' 
          : 'Pasaporta biometrike është thelbësore për procesim të shpejtë.'
      };
    }
    if (eligExperience < 1) {
      return {
        status: 'INFO',
        bg: 'bg-blue-50 border-blue-200 text-blue-800',
        title: language === 'EN' ? 'TRAINING PROTOCOL MANDATED' : language === 'MK' ? 'ЗАДОЛЖИТЕЛНА ПРАКТИЧНА ОБУКА' : 'TRAJNIM I DETYRUESHËM',
        description: language === 'EN'
          ? 'Approved for junior assistant contracts with client-funded onsite adaptation modules.'
          : language === 'MK'
          ? 'Одобрено за почетни договори со бесплатна пробна практична обука обезбедена кај вашиот работодавец.'
          : 'Aprovuar për kontrata fillestare me trajnim të paguar në terren.'
      };
    }
    return {
      status: 'OPTIMAL',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      title: language === 'EN' ? 'OPTIMAL ELIGIBLE STATUS' : language === 'MK' ? 'ИЗВОНРЕДЕН СТАТУС: ИСПОЛНУВА УСЛОВИ' : 'STATUS MAKSIMAL: I PRANUESHËM',
      description: language === 'EN'
        ? 'Instant transit capabilities unlocked. Profile matches current high-urgency employer quotas in North Macedonia.'
        : language === 'MK'
        ? 'Целосно исполнети квалификации. Вашиот профил се совпаѓа со активните отворени квоти кај нашите партнери.'
        : 'Kualifikim i plotë. Profili juaj përputhet me kuotat urgjente aktuale.'
    };
  }, [eligPassport, eligExperience, eligSector, language]);

  const scrollToContact = () => {
    const el = document.getElementById('contact-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="calculator-section" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200 overflow-hidden text-left">
      
      {/* Subtle light decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(31,81,255,0.03),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="border-b border-zinc-200 pb-8 mb-16">
          <span className="text-xs font-mono text-blue-600 tracking-[0.3em] uppercase block mb-2 font-bold">
            {language === 'EN' ? 'INTERACTIVE MATRIX' : 'ИНТЕРАКТИВЕН ПАНЕЛ'}: [03]
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-zinc-900 uppercase">
            {language === 'EN' ? 'Estimators & Compliance' : language === 'MK' ? 'Проценка & Калкулатор' : 'Statistikat & Konformiteti'}
          </h2>
        </div>

        {/* Path Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-zinc-100 border border-zinc-200 rounded-xl p-1.5 mb-12 max-w-2xl">
          <button
            onClick={() => setActivePath('clients')}
            className={`py-3.5 text-xs font-mono font-medium tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-3 cursor-pointer ${
              activePath === 'clients'
                ? 'bg-white border border-zinc-200 text-zinc-900 font-bold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            {language === 'EN' ? 'For Macedonian Companies' : 'За Клиенти (Претпријатија)'}
          </button>
          
          <button
            onClick={() => setActivePath('candidates')}
            className={`py-3.5 text-xs font-mono font-medium tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-3 cursor-pointer ${
              activePath === 'candidates'
                ? 'bg-white border border-zinc-200 text-zinc-900 font-bold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {language === 'EN' ? 'For Candidates & Workers' : 'За Кандидати (Работници)'}
          </button>
        </div>

        {/* Dynamic Panel */}
        <AnimatePresence mode="wait">
          {activePath === 'clients' ? (
            <motion.div
              key="clients-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Left Column: Easy presentation */}
              <div className="lg:col-span-6 space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-blue-600 block font-bold uppercase">
                    {language === 'EN' ? 'FINANCIAL SAVINGS PROJECT' : 'ЕКОНОМСКА ОПТИМИЗАЦИЈА'}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight font-display">
                    {language === 'EN' ? 'Optimize your operating margins.' : 'Оптимизирајте ги трошоците за кадар.'}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-xl leading-relaxed">
                    {language === 'EN'
                      ? 'Reduce high domestic recruitment overheads. By hiring legal, certified South Balkan workers with pre-vetted qualifications, you get high retention and immediate operational stability.'
                      : 'Добијте искусни работници од јужниот Балкан без долги чекања. Сите кандидати се претходно селектирани и подготвени за брз почеток.'}
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 border border-zinc-200 bg-zinc-50 rounded-2xl">
                    <Activity className="w-5 h-5 text-blue-600 mb-3" />
                    <h4 className="text-zinc-900 text-xs font-mono font-bold uppercase tracking-wider mb-2">Rapid 15-24 Day Onboarding</h4>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">No custom visa drag. We handle health tests, fast-tracked temporary residency permits and direct transport routes.</p>
                  </div>
                  <div className="p-5 border border-zinc-200 bg-zinc-50 rounded-2xl">
                    <Award className="w-5 h-5 text-blue-600 mb-3" />
                    <h4 className="text-zinc-900 text-xs font-mono font-bold uppercase tracking-wider mb-2">Managed Housing Program</h4>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">We secure city apartments near workspaces, arrange utilities, and handle tenant orientation to guarantee zero hassle.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={scrollToContact}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 font-mono text-xs text-white font-bold tracking-wide uppercase transition-all rounded shadow-sm hover:shadow"
                  >
                    {language === 'EN' ? 'Request Sourcing Call' : 'Побарајте кадар сега'}
                  </button>
                </div>
              </div>

              {/* Right Column: Premium Savings Calculator */}
              <div className="lg:col-span-6 bg-white border border-zinc-200 p-6 sm:p-8 space-y-6 rounded-2xl shadow-sm">
                <div>
                  <h4 className="text-xs font-mono text-blue-600 uppercase tracking-widest mb-1 font-bold">
                    {language === 'EN' ? 'MANAGEMENT SAVINGS ESTIMATOR' : 'ПРОЕКЦИЈА НА ЗАШТЕДА НА ТРОШОЦИ'}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono">
                    {language === 'EN' ? 'Adjust parameters below to model optimization.' : 'Прилагодете ги слајдерите за проценка во реално време.'}
                  </p>
                </div>

                {/* Calculator Options */}
                <div className="space-y-5 pt-4 border-t border-zinc-200">
                  
                  {/* Sector selection inside calc */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">
                      {language === 'EN' ? 'INDUSTRY BRANCH' : 'ИНДУСТРИСКИ СЕКТОР'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['construction', 'manufacturing', 'hospitality'].map((sectorId) => (
                        <button
                          key={sectorId}
                          type="button"
                          onClick={() => setCalcSector(sectorId as any)}
                          className={`py-2 text-[10px] font-mono uppercase tracking-wider text-center border cursor-pointer transition-all rounded ${
                            calcSector === sectorId
                              ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100'
                          }`}
                        >
                          {sectorId}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slider: Workers */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-600 font-medium">HEADCOUNT DEMAND</span>
                      <span className="text-zinc-900 font-bold">{calcWorkers} OPERATIVES</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      step="5"
                      value={calcWorkers}
                      onChange={(e) => setCalcWorkers(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-200 accent-blue-600 cursor-pointer rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>MIN: 5</span>
                      <span>MAX: 150</span>
                    </div>
                  </div>

                  {/* Slider: Months */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-600 font-medium">CONTRACT LENGTH</span>
                      <span className="text-zinc-900 font-bold">{calcMonths} {language === 'EN' ? 'Months' : 'месеци'}</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="24"
                      step="3"
                      value={calcMonths}
                      onChange={(e) => setCalcMonths(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-200 accent-blue-600 cursor-pointer rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>MIN: 3 MONTHS</span>
                      <span>MAX: 24 MONTHS</span>
                    </div>
                  </div>
                </div>

                {/* Output Screen */}
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl space-y-4 shadow-inner">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">
                        {language === 'EN' ? 'PROJECTED OVERHEAD SAVED' : 'ПРОЦЕНЕТА СУМА ЗА ЗАШТЕДА'}
                      </span>
                      <span className="text-3xl font-black text-emerald-600 tracking-tight font-sans">
                        €{calculatedSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">TRANSIT VELOCITY</span>
                      <span className="text-base font-black text-zinc-900">{calculatedDays} - {calculatedDays + 4} {t.days}</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-zinc-400 leading-normal border-t border-zinc-200 pt-3">
                    {language === 'EN' 
                    ? '*Compares average direct cost optimizations like recruiting Agency fees, legal documentation filings, housing contracts and travel insurance.'
                    : '*Пресметано со просечните заштеди за агенциски посредувања, правни документи и организиран превоз.'}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="candidates-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
              {/* Left Column: Easy candidate descriptions */}
              <div className="lg:col-span-6 space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-emerald-600 block font-bold uppercase">
                    {language === 'EN' ? 'WORKER GUARANTEES' : 'ГАРАНТИРАНИ ПРАВА ЗА РАБОТНИЦИТЕ'}
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-zinc-900 font-display">
                    {language === 'EN' ? 'Safe and legal jobs in North Macedonia.' : 'Сигурна и 100% легална сезонска или постојана работа.'}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
                    {language === 'EN'
                      ? 'Secure your future. Every position we offer includes an official work permit, full medical health coverage, bi-annual travel tickets, and comfortable modern housing options provided free by the client.'
                      : 'Обезбедете си стабилна иднина. Секој ангажман вклучува комплетни документи, сигурни договори, платено здравствено осигурување и уредно уредено градско сместување.'}
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                    <Check className="w-5 h-5 text-emerald-650 shrink-0" />
                    <div>
                      <strong className="text-zinc-900 block font-bold">{language === 'EN' ? '100% Free Accommodation' : 'Сосема бесплатно сместување'}</strong>
                      <span className="text-zinc-550 block text-[11px] mt-0.5">High-quality spaces with functional heating, cooking networks and direct coordinates.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-4 rounded-xl">
                    <Check className="w-5 h-5 text-emerald-650 shrink-0" />
                    <div>
                      <strong className="text-zinc-900 block font-bold">{language === 'EN' ? 'Consular Work Visas' : 'Официјални конзуларни визи'}</strong>
                      <span className="text-zinc-550 block text-[11px] mt-0.5">Fast-track processed straight with home country representatives.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={scrollToContact}
                    className="px-6 py-3.5 bg-blue-650 hover:bg-blue-700 font-mono text-xs text-white font-bold tracking-wide uppercase transition-all rounded shadow"
                  >
                    {language === 'EN' ? 'APPLY INSTANTLY NOW' : 'АПЛИЦИРАЈ ЗА РАБОТА'}
                  </button>
                </div>
              </div>

              {/* Right Column: Pre-screener tool */}
              <div className="lg:col-span-6 bg-white border border-zinc-200 p-6 sm:p-8 space-y-6 rounded-2xl shadow-sm">
                <div>
                  <h4 className="text-xs font-mono text-emerald-650 uppercase tracking-widest mb-1 font-bold">
                    {language === 'EN' ? 'AUTOMATIC STATUS EVALUATOR' : 'АВТОМАТСКА ЕВАЛУАЦИЈА НА АПЛИКАНТИ'}
                  </h4>
                  <p className="text-xs text-zinc-500 font-mono">
                    {language === 'EN' ? 'Check your deployment eligibility immediately.' : 'Одговорете на прашањата за да го проверите вашиот статус.'}
                  </p>
                </div>

                {/* Screener inputs */}
                <div className="space-y-4 pt-4 border-t border-zinc-200 font-mono text-xs text-left">
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{t.hasPassportLabel}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEligPassport(true)}
                        className={`py-2 text-[10px] uppercase border transition rounded ${
                          eligPassport ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                        }`}
                      >
                        {t.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEligPassport(false)}
                        className={`py-2 text-[10px] uppercase border transition rounded ${
                          !eligPassport ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                        }`}
                      >
                        {t.no}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-550 uppercase">EXPERIENCE IN ACTIVE BRANCH</span>
                      <span className="text-zinc-900 font-bold">{eligExperience} YEARS EXPERIENCE</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={eligExperience}
                      onChange={(e) => setEligExperience(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-200 accent-emerald-500 cursor-pointer rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">DESIRED PLACEMENT INDUSTRY</p>
                    <select
                      value={eligSector}
                      onChange={(e) => setEligSector(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-200 text-xs p-2.5 rounded text-zinc-700 focus:outline-none tracking-wide"
                    >
                      <option value="construction">Masonry & Building Works</option>
                      <option value="manufacturing">Industrial CNC & Logistics</option>
                      <option value="hospitality">Hospitality / Gastro Services</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Screen outputs */}
                <div className={`border p-4 rounded-xl transition duration-150 ${eligibilityResult.bg}`}>
                  <div className="flex items-center gap-2 mb-2 font-mono">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold tracking-wider uppercase">{eligibilityResult.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-mono">
                    {eligibilityResult.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
