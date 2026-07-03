import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Users,
  CheckCircle2,
  Building2,
  UserCheck,
  Compass,
  Send,
  Globe,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Lock,
  ArrowRight,
  Briefcase,
  Layers,
  FileSpreadsheet,
  Mail,
  User,
  MapPin,
  Award,
  FileText,
  HardHat,
  UtensilsCrossed,
  Sprout,
  Warehouse
} from 'lucide-react';
import { Language } from './types';
import { LANGUAGE_DETAILS, getTranslations } from './translations';
import ParticleBackground from './components/ParticleBackground';
import HeroBackgroundImages from './components/HeroBackgroundImages';
import ChatWidget from './components/ChatWidget';

interface LedgerItem {
  id: string;
  type: 'CLIENT' | 'CANDIDATE';
  name: string;
  subLabel: string; // Company name or origin territory
  mainDetail: string; // "14 workers needed" or "4 Years Exp"
  timestamp: string;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('EN');

  // Custom estimated state for the quick slider
  const [workersCount, setWorkersCount] = useState<number>(10);

  // Form expansion states (starts collapsed/closed)
  const [empFormOpen, setEmpFormOpen] = useState(false);
  const [candFormOpen, setCandFormOpen] = useState(false);

  // Helper to translate our collapse helper texts inside App.tsx safely:
  const getHelperText = (isOpen: boolean) => {
    switch (language) {
      case 'MK':
        return isOpen ? 'Кликнете за затворање на формата' : 'Кликнете за отварање и пишување';
      case 'AL':
        return isOpen ? 'Kliko për ta mbyllur formularin' : 'Kliko për ta hapur dhe shkruajtur';
      case 'DE':
        return isOpen ? 'Klicken Sie zum Einklappen' : 'Klicken Sie zum Öffnen und Schreiben';
      case 'IT':
        return isOpen ? 'Clicca per ridurre' : 'Clicca per aprire e scrivere';
      case 'FR':
        return isOpen ? 'Cliquez pour réduire' : 'Cliquez pour ouvrir et écrire';
      case 'ES':
        return isOpen ? 'Haga clic para colapsar' : 'Haga clic para abrir y escribir';
      case 'TR':
        return isOpen ? 'Formu kapatmak için tıklayın' : 'Açmak ve yazmak için tıklayın';
      case 'SR':
        return isOpen ? 'Kliknite da zatvorite formu' : 'Kliknite da otvorite i pišete';
      case 'BG':
        return isOpen ? 'Кликнете за затваряне на формата' : 'Кликнете за отваряне и писане';
      case 'EL':
        return isOpen ? 'Κάντε κλικ για σύμπτυξη' : 'Κάντε κλικ για άνοιγμα και εγγραφή';
      default:
        return isOpen ? 'Click to collapse form' : 'Click to expand and begin writing';
    }
  };

  // 1. Employer (Looking to Hire) Form State
  const [empFullName, setEmpFullName] = useState('');
  const [empCompanyName, setEmpCompanyName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empSector, setEmpSector] = useState('Construction');
  const [empNotes, setEmpNotes] = useState('');
  const [empIsSubmitting, setEmpIsSubmitting] = useState(false);
  const [empSuccess, setEmpSuccess] = useState(false);
  const [empInfoMessage, setEmpInfoMessage] = useState('');

  // 2. Candidate (Looking for Work) Form State
  const [candFullName, setCandFullName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candSector, setCandSector] = useState('Construction');
  const [candCountry, setCandCountry] = useState('Kosovo');
  const [candExperience, setCandExperience] = useState('3');
  const [candHasPassport, setCandHasPassport] = useState('yes');
  const [candNotes, setCandNotes] = useState('');
  const [candIsSubmitting, setCandIsSubmitting] = useState(false);
  const [candSuccess, setCandSuccess] = useState(false);
  const [candInfoMessage, setCandInfoMessage] = useState('');

  // Dynamic live inquiries transaction ledger (persists to localStorage)
  const [ledger, setLedger] = useState<LedgerItem[]>([]);

  const t = getTranslations(language);

  // Seed sample ledger data on load
  useEffect(() => {
    // Automatically detect the right language from client (browser locale, timezone, or saved preference)
    const stored = localStorage.getItem('a25_selected_lang');
    if (stored && stored in LANGUAGE_DETAILS) {
      setLanguage(stored as Language);
    } else {
      let detected: Language = 'EN';
      try {
        const browserLang = (navigator.language || '').slice(0, 2).toUpperCase();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

        if (tz.includes("Skopje")) {
          detected = "MK";
        } else if (tz.includes("Tirana") || tz.includes("Pristina")) {
          detected = "AL";
        } else if (tz.includes("Berlin") || tz.includes("Vienna") || tz.includes("Zurich")) {
          detected = "DE";
        } else if (tz.includes("Athens")) {
          detected = "EL";
        } else if (tz.includes("Madrid") || tz.includes("Canary")) {
          detected = "ES";
        } else if (tz.includes("Warsaw")) {
          detected = "PL";
        } else if (tz.includes("Stockholm")) {
          detected = "SV";
        } else if (browserLang in LANGUAGE_DETAILS) {
          detected = browserLang as Language;
        }
      } catch (err) {
        console.warn("Client localization auto-detection error:", err);
      }
      setLanguage(detected);
    }

    const cachedLedger = localStorage.getItem('vanguard_ledger_short');
    if (cachedLedger) {
      setLedger(JSON.parse(cachedLedger));
    } else {
      const sampleList: LedgerItem[] = [
        {
          id: "REG-8392",
          type: 'CLIENT',
          name: "Aleksandar Micevski",
          subLabel: "Pelagonija Konstrukt AD",
          mainDetail: "15 Formwork Joiners Required",
          timestamp: "10 mins ago"
        },
        {
          id: "REG-2015",
          type: 'CANDIDATE',
          name: "Faton Berisha",
          subLabel: "Kosovo (Pristina Office)",
          mainDetail: "6 Years • Welder / CNC Metal",
          timestamp: "1 hour ago"
        }
      ];
      setLedger(sampleList);
      localStorage.setItem('vanguard_ledger_short', JSON.stringify(sampleList));
    }
  }, []);

  // Reveal-on-scroll: fade/slide elements marked with .reveal as they enter view.
  // Uses a scroll/resize check (reliable for programmatic + user scrolling) with
  // a safety pass so content can never get stuck hidden.
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
    // Safety net: if anything is still hidden shortly after load, reveal it.
    const safety = window.setTimeout(() => {
      nodes.forEach((n) => n.classList.add('is-visible'));
    }, 2500);

    return () => {
      window.removeEventListener('scroll', reveal);
      window.removeEventListener('resize', reveal);
      window.clearTimeout(safety);
    };
  }, []);

  // Employer Sourcing Form Submission
  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFullName || !empPhone) return;

    setEmpIsSubmitting(true);
    setEmpInfoMessage('');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'EMPLOYER',
          fullName: empFullName,
          companyName: empCompanyName,
          email: empEmail,
          phone: empPhone,
          sector: empSector,
          notes: empNotes,
          language: language
        })
      });

      const data = await response.json();
      setEmpIsSubmitting(false);

      if (response.ok && data.success) {
        setEmpSuccess(true);
        if (data.simulated) {
          setEmpInfoMessage(t.simulatedMessage);
        }

        // Add to digital ledger transactions queue
        const uniqueId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
        const newEntry: LedgerItem = {
          id: uniqueId,
          type: 'CLIENT',
          name: empFullName,
          subLabel: empCompanyName || "Direct Inquiry",
          mainDetail: `Sourcing: ${empSector}`,
          timestamp: "Just now"
        };
        const revisedLedger = [newEntry, ...ledger];
        setLedger(revisedLedger);
        localStorage.setItem('vanguard_ledger_short', JSON.stringify(revisedLedger));

        // Reset
        setEmpFullName('');
        setEmpCompanyName('');
        setEmpEmail('');
        setEmpPhone('');
        setEmpNotes('');
      } else {
        setEmpInfoMessage(data.message || "Failure transmitting request.");
      }
    } catch (err) {
      console.error(err);
      setEmpIsSubmitting(false);

      // Fallback local persistence
      const uniqueId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
      const newEntry: LedgerItem = {
        id: uniqueId,
        type: 'CLIENT',
        name: empFullName,
        subLabel: empCompanyName || "Direct Inquiry",
        mainDetail: `Sourcing (Local Desk): ${empSector}`,
        timestamp: "Just now"
      };
      const revisedLedger = [newEntry, ...ledger];
      setLedger(revisedLedger);
      localStorage.setItem('vanguard_ledger_short', JSON.stringify(revisedLedger));

      setEmpSuccess(true);
      setEmpFullName('');
      setEmpCompanyName('');
      setEmpEmail('');
      setEmpPhone('');
      setEmpNotes('');
    }
  };

  // Candidate Profile Form Submission
  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candFullName || !candPhone) return;

    setCandIsSubmitting(true);
    setCandInfoMessage('');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CANDIDATE',
          fullName: candFullName,
          email: candEmail,
          phone: candPhone,
          sector: candSector,
          country: candCountry,
          experience: candExperience,
          hasPassport: candHasPassport,
          notes: candNotes,
          language: language
        })
      });

      const data = await response.json();
      setCandIsSubmitting(false);

      if (response.ok && data.success) {
        setCandSuccess(true);
        if (data.simulated) {
          setCandInfoMessage(t.simulatedMessage);
        }

        // Add to digital ledger transactions queue
        const uniqueId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
        const newEntry: LedgerItem = {
          id: uniqueId,
          type: 'CANDIDATE',
          name: candFullName,
          subLabel: `${candCountry} (Intake)`,
          mainDetail: `${candExperience} Yrs Exp • ${candSector}`,
          timestamp: "Just now"
        };
        const revisedLedger = [newEntry, ...ledger];
        setLedger(revisedLedger);
        localStorage.setItem('vanguard_ledger_short', JSON.stringify(revisedLedger));

        // Reset
        setCandFullName('');
        setCandEmail('');
        setCandPhone('');
        setCandNotes('');
      } else {
        setCandInfoMessage(data.message || "Failure registering candidate file.");
      }
    } catch (err) {
      console.error(err);
      setCandIsSubmitting(false);

      // Fallback local persistence
      const uniqueId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
      const newEntry: LedgerItem = {
        id: uniqueId,
        type: 'CANDIDATE',
        name: candFullName,
        subLabel: `${candCountry} (Local Intake)`,
        mainDetail: `${candExperience} Yrs Exp • ${candSector}`,
        timestamp: "Just now"
      };
      const revisedLedger = [newEntry, ...ledger];
      setLedger(revisedLedger);
      localStorage.setItem('vanguard_ledger_short', JSON.stringify(revisedLedger));

      setCandSuccess(true);
      setCandFullName('');
      setCandEmail('');
      setCandPhone('');
      setCandNotes('');
    }
  };

  // Estimate speed & compliance calculations dynamically
  const computedLeadTime = Math.max(15, Math.min(24, Math.round(24 - (workersCount / 10))));
  const computedComplianceTier = workersCount >= 15 ? t.calcHigh : t.calcStandard;

  // Hero CTAs: jump straight to the relevant form and open it automatically
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
        // Manual offset calculation instead of scrollIntoView: more reliable
        // across browsers when there are fixed/sticky ancestors, and accounts
        // for the sticky header directly rather than relying on the target
        // scroll container resolving correctly on its own.
        const headerOffset = 96;
        const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  };

  // Industries carousel — placeholder sector cards (real logos/content to be
  // swapped in later). Reuses the existing sector translation labels so all
  // 25 languages stay covered without new translation keys.
  const industries = [
    { key: 'construction', label: t.optConstruction, desc: t.industryDescConstruction || 'Skilled trade & site labor sourcing.', icon: HardHat, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { key: 'hospitality', label: t.optHospitality, desc: t.industryDescHospitality || 'Hospitality & guest service staffing.', icon: UtensilsCrossed, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { key: 'agriculture', label: t.optAgriculture, desc: t.industryDescAgriculture || 'Seasonal & permanent field labor.', icon: Sprout, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { key: 'manufacturing', label: t.optManufacturing, desc: t.industryDescManufacturing || 'Warehouse & production line staffing.', icon: Warehouse, iconBg: 'bg-zinc-100', iconColor: 'text-zinc-700' },
    { key: 'generic', label: t.optGeneric || 'Generic Workers', desc: t.industryDescGeneric || 'General labor for any role or site.', icon: Users, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  ];
  const [industryIndex, setIndustryIndex] = useState(0);
  const [industriesPaused, setIndustriesPaused] = useState(false);

  // Auto-cycle the industries carousel forever, pausing on hover.
  useEffect(() => {
    if (industriesPaused) return;
    const id = setInterval(() => {
      setIndustryIndex((i) => (i + 1) % industries.length);
    }, 4000);
    return () => clearInterval(id);
  }, [industriesPaused, industries.length]);

  return (
    <div className="relative min-h-screen text-zinc-900 selection:bg-blue-650 selection:text-white font-sans antialiased text-left">

      {/* Living atmosphere: aurora wash + edge photography + interactive particle network + grain */}
      <div className="aurora" aria-hidden="true" />
      <div className="aurora-spot" aria-hidden="true" />
      <HeroBackgroundImages />
      <ParticleBackground />
      <div className="grain" aria-hidden="true" />

      <div className="relative z-10">

      {/* Absolute top regulatory micro banner */}
      <div className="bar-animated bg-[#000080] py-2.5 border-b border-[#00005c] text-center font-mono text-[11px] tracking-[0.15em] font-bold text-zinc-200 uppercase px-4">
        ⚡ {t.badge}
      </div>

      {/* Modern crisp sticky header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-xs">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between">

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
                    onClick={() => {
                      setLanguage(lang);
                      localStorage.setItem('a25_selected_lang', lang);
                      setEmpSuccess(false);
                      setCandSuccess(false);
                    }}
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
                onChange={(e) => {
                  const lang = e.target.value as Language;
                  setLanguage(lang);
                  localStorage.setItem('a25_selected_lang', lang);
                  setEmpSuccess(false);
                  setCandSuccess(false);
                }}
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
              className="btn-shine hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F51FF] hover:bg-[#000080] text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition-all"
            >
              <span>{t.directLine}</span>
              <ArrowRight className="w-3 h-3 text-zinc-300" />
            </a>
          </div>

        </div>
      </header>

      {/* Main Container - 2-Scroll Clean Symmetrical Layout */}
      <main className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-16 lg:space-y-20">

        {/* ==================== SCROLL AREA 1: INFORMATION OVERVIEW ==================== */}
        <section className="space-y-10">

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

          {/* Industries We Work With — centered auto-cycling postcard carousel */}
          <div className="reveal space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-mono text-blue-600 tracking-widest uppercase font-bold block">
                {t.sectorsSectionLabel || '[03 // SECTORS]'}
              </span>
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-zinc-950 mt-1">
                {t.sectorsSectionTitle || 'Industries We Work With'}
              </h3>
            </div>

            <div
              className="relative w-full"
              onMouseEnter={() => setIndustriesPaused(true)}
              onMouseLeave={() => setIndustriesPaused(false)}
            >
              <div className="relative h-[250px] sm:h-[280px]">
                {industries.map((ind, i) => {
                  const n = industries.length;
                  let diff = i - industryIndex;
                  if (diff > n / 2) diff -= n;
                  if (diff < -n / 2) diff += n;

                  const isCenter = diff === 0;
                  const isSide = Math.abs(diff) === 1;
                  const x = diff * 220;
                  const scale = isCenter ? 1 : isSide ? 0.86 : 0.7;
                  const opacity = isCenter ? 1 : isSide ? 0.92 : 0;
                  const zIndex = isCenter ? 30 : isSide ? 20 : 10;

                  return (
                    <motion.div
                      key={ind.key}
                      animate={{ x, scale, opacity }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      style={{ zIndex }}
                      className={`absolute inset-0 m-auto w-[280px] sm:w-[340px] md:w-[380px] aspect-[3/2] card-glass border border-zinc-200/70 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2.5 ${isCenter ? '' : 'pointer-events-none'}`}
                    >
                      <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center ${ind.iconBg} ${ind.iconColor}`}>
                        <ind.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-zinc-900 uppercase tracking-tight">{ind.label}</h4>
                      <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed max-w-[240px]">{ind.desc}</p>
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-full">
                        {t.moreComingSoon || 'More coming soon'}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Manual prev/next controls */}
              <button
                type="button"
                onClick={() => setIndustryIndex((i) => (i - 1 + industries.length) % industries.length)}
                aria-label="Previous industry"
                className="absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center justify-center transition-all z-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIndustryIndex((i) => (i + 1) % industries.length)}
                aria-label="Next industry"
                className="absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 text-zinc-600 flex items-center justify-center transition-all z-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-2 mt-5">
                {industries.map((ind, i) => (
                  <button
                    key={ind.key}
                    type="button"
                    onClick={() => setIndustryIndex(i)}
                    aria-label={`Go to ${ind.label}`}
                    className={`h-1.5 rounded-full transition-all ${i === industryIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* ==================== SCROLL AREA 2: DIRECT CONTACT CHANNELS ==================== */}
        <section id="contact-desk" className="pt-6 border-t border-zinc-200 space-y-8">

          {/* Executive Direct Contact Hub Banner */}
          <div className="panel-glow reveal relative overflow-hidden bg-gradient-to-br from-[#1035c0] via-[#000080] to-[#000052] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#1F51FF]/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-amber-500/20">
                {t.secureLine}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight">Boris Vchkov <span className="text-zinc-500 font-mono font-normal text-xs lowercase block sm:inline sm:ml-2">{t.ownerDesk}</span></h3>
              <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                {t.execDeskDesc}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 w-full md:w-auto">
              <a
                href="tel:+38971326293"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span>+389 71 326 293</span>
              </a>
              <a
                href="mailto:contact@a25.mk"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>contact@a25.mk</span>
              </a>
            </div>
          </div>

          {/* Symmetrical Two-Column Sourcing Portal Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-start reveal">

            {/* COLUMN A: LOOKING TO HIRE (Employer Form) */}
            <div className={`card-glass border transition-all duration-500 ease-out rounded-3xl overflow-hidden flex flex-col ${
              empFormOpen
                ? "border-blue-500/35 shadow-[0_20px_50px_rgba(31,81,255,0.06)] ring-1 ring-blue-500/10"
                : "border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]"
            }`}>

              {/* Collapsible Dropdown Header Trigger */}
              <button
                type="button"
                id="employer-form-trigger"
                onClick={() => setEmpFormOpen(!empFormOpen)}
                className={`w-full text-left p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 cursor-pointer focus:outline-none ${
                  empFormOpen
                    ? "bg-gradient-to-r from-blue-50/10 via-white to-white/90 border-blue-500/15"
                    : "bg-zinc-50/40 hover:bg-zinc-100/50 border-zinc-150"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-all duration-300 ${
                    empFormOpen
                      ? "bg-blue-600 text-white scale-105 shadow-blue-500/10"
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                        {t.sectionEmployersSub}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[8px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        empSuccess
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${empSuccess ? 'bg-emerald-500 animate-none' : 'bg-blue-500 animate-ping'}`} />
                        {empSuccess ? t.badgeDispatched : t.hireChannel}
                      </span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold uppercase text-zinc-950 tracking-tight mt-1.5 flex items-center gap-2">
                      {t.lookingToHire}
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5 font-medium">
                      {getHelperText(empFormOpen || empIsSubmitting || empSuccess)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-md border tracking-wider transition-all duration-300 ${
                    (empFormOpen || empIsSubmitting || empSuccess)
                      ? "bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200/50"
                      : "bg-blue-600 border-blue-700 text-white shadow-xs hover:bg-blue-700 active:scale-95"
                  }`}>
                    {(empFormOpen || empIsSubmitting || empSuccess) ? t.btnClose : t.btnWriteInquiry}
                  </span>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    empFormOpen ? 'bg-blue-50 text-blue-600' : 'bg-zinc-200/50 hover:bg-zinc-200 text-zinc-600'
                  }`}>
                    {(empFormOpen || empIsSubmitting || empSuccess) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Form Body - Collapsible with Framer Motion */}
              <motion.div
                initial={false}
                animate={{
                  height: (empFormOpen || empIsSubmitting || empSuccess) ? "auto" : 0,
                  opacity: (empFormOpen || empIsSubmitting || empSuccess) ? 1 : 0
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="p-6 sm:p-8 space-y-6 border-t border-zinc-100 bg-white">
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    {t.lookingToHireDesc}
                  </p>

                  <AnimatePresence mode="wait">
                    {empSuccess ? (
                      <motion.div
                        key="emp-success-box"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-5 bg-gradient-to-br from-emerald-50/70 via-emerald-50/20 to-white border border-emerald-200/90 rounded-2xl space-y-4 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 text-emerald-800">
                          <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                            ✓
                          </div>
                          <div>
                            <h4 className="font-mono text-xs font-black uppercase tracking-wider">{t.successTitle}</h4>
                            <p className="text-[10px] uppercase font-mono text-emerald-600 tracking-wider font-bold">A25 SECURED GATEWAY INTAKE</p>
                          </div>
                        </div>

                        <div className="h-[1px] bg-dashed border-t border-dashed border-emerald-200 my-2" />

                        {/* Interactive Digital Sourcing Receipt */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-white/95 rounded-xl border border-emerald-100 font-mono text-[9px] leading-tight shadow-3xs">
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">REPRESENTATIVE Name</span>
                            <span className="text-zinc-800 font-bold ">{empFullName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">COMPANY Registered</span>
                            <span className="text-zinc-800 font-bold">{empCompanyName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">MOBILE Contact</span>
                            <span className="text-zinc-800 font-bold">{empPhone}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">ROUTED SECTOR</span>
                            <span className="text-zinc-800 font-bold text-blue-600">{empSector}</span>
                          </div>
                        </div>

                        <p className="text-zinc-650 text-xs leading-relaxed font-sans mt-2">
                          {t.successText}
                        </p>

                        {empInfoMessage && (
                          <div className="text-[10px] bg-white/90 p-3 rounded-lg border border-emerald-100 font-mono text-zinc-500 leading-normal flex items-start gap-2 shadow-3xs">
                            <span className="shrink-0">⚠️</span>
                            <span>{empInfoMessage}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 font-mono text-[8px] text-zinc-405 uppercase tracking-wide border-t border-zinc-100">
                          <span>TICKET REF: A25-{Math.floor(10000 + Math.random() * 90000)}</span>
                          <span className="text-emerald-600 font-bold">// RECORD DISPATCHED</span>
                        </div>

                        <button
                          onClick={() => {
                            setEmpSuccess(false);
                            setEmpInfoMessage('');
                          }}
                          className="w-full py-2.5 bg-zinc-950 text-white uppercase font-mono text-[9px] font-bold rounded-lg hover:bg-zinc-850 active:scale-98 transition-all tracking-widest mt-2"
                        >
                          {t.btnWriteAnother}
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleEmployerSubmit} className="space-y-4.5 text-left">

                        {/* INPUT 1: FULL NAME */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                            {t.labelNameReq}
                          </label>
                          <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/5">
                            <div className="absolute left-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                              <User className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-105" />
                            </div>
                            <input
                              type="text"
                              required
                              value={empFullName}
                              onChange={(e) => setEmpFullName(e.target.value)}
                              placeholder={t.placeholderNameEmp}
                              className="w-full bg-transparent pl-11 pr-4 py-3 sm:py-3.5 text-xs text-zinc-900 placeholder-zinc-400/80 font-sans focus:outline-none focus:ring-0 rounded-2xl"
                            />
                          </div>
                        </div>

                        {/* INPUT 2 & 3 GRID: COMPANY & PHONE */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                              {t.labelCompanyReq}
                            </label>
                            <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/5">
                              <div className="absolute left-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                                <Building2 className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-105" />
                              </div>
                              <input
                                type="text"
                                required
                                value={empCompanyName}
                                onChange={(e) => setEmpCompanyName(e.target.value)}
                                placeholder="e.g. MakMetal DOOEL"
                                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400/80 font-sans focus:outline-none focus:ring-0 rounded-2xl"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                              {t.labelPhone} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/5">
                              <div className="absolute left-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                                <PhoneCall className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-105" />
                              </div>
                              <input
                                type="tel"
                                required
                                value={empPhone}
                                onChange={(e) => setEmpPhone(e.target.value)}
                                placeholder="+389 71 326 293"
                                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400/80 font-mono focus:outline-none focus:ring-0 rounded-2xl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* INPUT 4: EMAIL */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                            {t.labelEmail}
                          </label>
                          <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/5">
                            <div className="absolute left-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                              <Mail className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-105" />
                            </div>
                            <input
                              type="email"
                              value={empEmail}
                              onChange={(e) => setEmpEmail(e.target.value)}
                              placeholder="representative@company.mk"
                              className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400/80 font-sans focus:outline-none focus:ring-0 rounded-2xl"
                            />
                          </div>
                        </div>

                        {/* INPUT 5: SECTOR */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                            {t.labelSector}
                          </label>
                          <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/5">
                            <div className="absolute left-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <select
                              value={empSector}
                              onChange={(e) => setEmpSector(e.target.value)}
                              className="w-full bg-transparent pl-11 pr-10 py-3 text-xs text-zinc-900 font-sans focus:outline-none appearance-none cursor-pointer rounded-2xl"
                            >
                              <option value="Heavy Industry & Construction">{t.optConstruction}</option>
                              <option value="Tourism, Resorts & Hospitality">{t.optHospitality}</option>
                              <option value="Agriculture & Harvesting">{t.optAgriculture}</option>
                              <option value="Manufacturing & Warehousing">{t.optManufacturing}</option>
                              <option value="Generic Workers">{t.optGeneric || 'Generic Workers'}</option>
                            </select>
                            <div className="absolute right-4 text-zinc-450 pointer-events-none group-focus-within:text-blue-600">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* INPUT 6: NOTES */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                            {t.labelNotes}
                          </label>
                          <div className="relative group flex items-start bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-600/5">
                            <div className="absolute left-4 top-3.5 text-zinc-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                              <FileText className="w-4 h-4" />
                            </div>
                            <textarea
                              value={empNotes}
                              onChange={(e) => setEmpNotes(e.target.value)}
                              rows={3}
                              placeholder={t.placeholderNotesEmp}
                              className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400/80 font-sans focus:outline-none rounded-2xl resize-none"
                            />
                          </div>
                        </div>

                        {empInfoMessage && (
                          <p className="text-[10.5px] text-red-600 font-mono italic px-1 flex items-center gap-1.5">
                            <span>⚠️</span> <span>{empInfoMessage}</span>
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={empIsSubmitting}
                          className="btn-shine w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white font-mono text-xs uppercase tracking-widest font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/25 active:scale-99"
                        >
                          {empIsSubmitting ? (
                            <>
                              <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              <span>{t.sending}</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-blue-105" />
                              <span>{t.btnSend}</span>
                            </>
                          )}
                        </button>

                      </form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

               {/* COLUMN B: LOOKING FOR WORK (Candidate Profile Form) */}
            <div className={`card-glass border transition-all duration-500 ease-out rounded-3xl overflow-hidden flex flex-col ${
              candFormOpen
                ? "border-amber-500/35 shadow-[0_20px_50px_rgba(245,158,11,0.06)] ring-1 ring-amber-500/10"
                : "border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]"
            }`}>

              {/* Collapsible Dropdown Header Trigger */}
              <button
                type="button"
                id="candidate-form-trigger"
                onClick={() => setCandFormOpen(!candFormOpen)}
                className={`w-full text-left p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 cursor-pointer focus:outline-none ${
                  candFormOpen
                    ? "bg-gradient-to-r from-amber-50/10 via-white to-white/90 border-amber-500/15"
                    : "bg-zinc-50/40 hover:bg-zinc-100/50 border-zinc-155"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-all duration-300 ${
                    candFormOpen
                      ? "bg-amber-500 text-white scale-105 shadow-amber-500/10"
                      : "bg-amber-50 text-amber-600 border border-amber-100"
                  }`}>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                        {t.sectionCandidatesSub}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[8px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        candSuccess
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-amber-50 text-amber-605 border border-amber-100'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${candSuccess ? 'bg-emerald-500 animate-none' : 'bg-amber-500 animate-ping'}`} />
                        {candSuccess ? t.badgeSubmitted : t.jobChannel}
                      </span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold uppercase text-zinc-950 tracking-tight mt-1.5 flex items-center gap-2">
                      {t.lookingForWork}
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5 font-medium">
                      {getHelperText(candFormOpen || candIsSubmitting || candSuccess)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-md border tracking-wider transition-all duration-300 ${
                    (candFormOpen || candIsSubmitting || candSuccess)
                      ? "bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200/50"
                      : "bg-amber-500 border-amber-600 text-white shadow-xs hover:bg-amber-600 active:scale-95"
                  }`}>
                    {(candFormOpen || candIsSubmitting || candSuccess) ? t.btnClose : t.btnRegisterProfile}
                  </span>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    candFormOpen ? 'bg-amber-50 text-amber-600' : 'bg-zinc-200/50 hover:bg-zinc-200 text-zinc-600'
                  }`}>
                    {(candFormOpen || candIsSubmitting || candSuccess) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Form Body - Collapsible with Framer Motion */}
              <motion.div
                initial={false}
                animate={{
                  height: (candFormOpen || candIsSubmitting || candSuccess) ? "auto" : 0,
                  opacity: (candFormOpen || candIsSubmitting || candSuccess) ? 1 : 0
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="p-6 sm:p-8 space-y-6 border-t border-zinc-100 bg-white">
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    {t.lookingForWorkDesc}
                  </p>

                  <AnimatePresence mode="wait">
                    {candSuccess ? (
                      <motion.div
                        key="cand-success-box"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-5 bg-gradient-to-br from-emerald-50/70 via-emerald-50/20 to-white border border-emerald-200/90 rounded-2xl space-y-4 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 text-emerald-800">
                          <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                            ✓
                          </div>
                          <div>
                            <h4 className="font-mono text-xs font-black uppercase tracking-wider">{t.successTitle}</h4>
                            <p className="text-[10px] uppercase font-mono text-emerald-600 tracking-wider font-bold">A25 SECURED CENTRAL REC SYSTEM</p>
                          </div>
                        </div>

                        <div className="h-[1px] bg-dashed border-t border-dashed border-emerald-200 my-2" />

                        {/* Interactive Digital Candidate Receipt */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-white/95 rounded-xl border border-emerald-100 font-mono text-[9px] leading-tight shadow-3xs">
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">Candidate Name</span>
                            <span className="text-zinc-800 font-bold">{candFullName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">Origin Territory</span>
                            <span className="text-zinc-800 font-bold">{candCountry}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">Mobile Record</span>
                            <span className="text-zinc-800 font-bold">{candPhone}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block uppercase font-mono tracking-wider font-bold text-[8px]">Track Sector / EP</span>
                            <span className="text-zinc-800 font-bold text-amber-600">{candSector} ({candExperience} Yr)</span>
                          </div>
                        </div>

                        <p className="text-zinc-650 text-xs leading-relaxed font-sans mt-2">
                          {t.successText}
                        </p>

                        {candInfoMessage && (
                          <div className="text-[10px] bg-white/90 p-3 rounded-lg border border-emerald-100 font-mono text-zinc-500 leading-normal flex items-start gap-2 shadow-3xs">
                            <span className="shrink-0">⚠️</span>
                            <span>{candInfoMessage}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 font-mono text-[8px] text-zinc-405 uppercase tracking-wide border-t border-zinc-100">
                          <span>TICKET REF: A25-{Math.floor(10000 + Math.random() * 90000)}</span>
                          <span className="text-emerald-600 font-bold">// INTAKE ARCHIVED</span>
                        </div>

                        <button
                          onClick={() => {
                            setCandSuccess(false);
                            setCandInfoMessage('');
                          }}
                          className="w-full py-2.5 bg-zinc-950 text-white uppercase font-mono text-[9px] font-bold rounded-lg hover:bg-zinc-850 active:scale-98 transition-all tracking-widest mt-2"
                        >
                          {t.btnWriteAnother}
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleCandidateSubmit} className="space-y-4.5 text-left">

                        {/* INPUT 1: FULL NAME */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                            {t.labelNameCand}
                          </label>
                          <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                            <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                              <User className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-105" />
                            </div>
                            <input
                              type="text"
                              required
                              value={candFullName}
                              onChange={(e) => setCandFullName(e.target.value)}
                              placeholder={t.placeholderNameCand}
                              className="w-full bg-transparent pl-11 pr-4 py-3 sm:py-3.5 text-xs text-zinc-900 placeholder-zinc-400/80 font-sans focus:outline-none focus:ring-0 rounded-2xl"
                            />
                          </div>
                        </div>

                        {/* INPUT 2 & 3: PHONE & EMAIL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                              {t.labelPhone} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                              <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                                <PhoneCall className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-105" />
                              </div>
                              <input
                                type="tel"
                                required
                                value={candPhone}
                                onChange={(e) => setCandPhone(e.target.value)}
                                placeholder="+383 44 123 456"
                                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400/80 font-mono focus:outline-none focus:ring-0 rounded-2xl"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                              {t.labelEmail}
                            </label>
                            <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                              <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                                <Mail className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-105" />
                              </div>
                              <input
                                type="email"
                                value={candEmail}
                                onChange={(e) => setCandEmail(e.target.value)}
                                placeholder="faton@outlook.com"
                                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400/80 font-sans focus:outline-none focus:ring-0 rounded-2xl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* INPUT 4, 5, 6: COUNTRY, EXPERIENCE, PASSPORT */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                              {t.labelCountry}
                            </label>
                            <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                              <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <select
                                value={candCountry}
                                onChange={(e) => setCandCountry(e.target.value)}
                                className="w-full bg-transparent pl-11 pr-10 py-3 text-xs text-zinc-900 font-sans focus:outline-none appearance-none cursor-pointer rounded-2xl"
                              >
                                <option value="Kosovo">{t.optKosovo}</option>
                                <option value="Albania">{t.optAlbania}</option>
                                <option value="Serbia">{t.optSerbia}</option>
                              </select>
                              <div className="absolute right-4 text-zinc-450 pointer-events-none group-focus-within:text-amber-500">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                              {t.labelYearsOfExp}
                            </label>
                            <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                              <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                                <Award className="w-4 h-4" />
                              </div>
                              <input
                                type="number"
                                min="0"
                                max="45"
                                required
                                value={candExperience}
                                onChange={(e) => setCandExperience(e.target.value)}
                                className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 font-mono focus:outline-none focus:ring-0 rounded-2xl"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                              {t.labelBiometricPass}
                            </label>
                            <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                              <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                                <Shield className="w-4 h-4" />
                              </div>
                              <select
                                value={candHasPassport}
                                onChange={(e) => setCandHasPassport(e.target.value)}
                                className="w-full bg-transparent pl-11 pr-10 py-3 text-xs text-zinc-900 font-sans focus:outline-none appearance-none cursor-pointer rounded-2xl"
                              >
                                <option value="yes">{t.optYes}</option>
                                <option value="no">{t.optNo}</option>
                              </select>
                              <div className="absolute right-4 text-zinc-450 pointer-events-none group-focus-within:text-amber-500">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* INPUT 7: SECTOR */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                            {t.labelSector}
                          </label>
                          <div className="relative group flex items-center bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                            <div className="absolute left-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <select
                              value={candSector}
                              onChange={(e) => setCandSector(e.target.value)}
                              className="w-full bg-transparent pl-11 pr-10 py-3 text-xs text-zinc-900 font-sans focus:outline-none appearance-none cursor-pointer rounded-2xl"
                            >
                              <option value="Heavy Industry & Construction">{t.optConstruction}</option>
                              <option value="Tourism, Resorts & Hospitality">{t.optHospitality}</option>
                              <option value="Agriculture & Harvesting">{t.optAgriculture}</option>
                              <option value="Manufacturing & Warehousing">{t.optManufacturing}</option>
                              <option value="Generic Workers">{t.optGeneric || 'Generic Workers'}</option>
                            </select>
                            <div className="absolute right-4 text-zinc-450 pointer-events-none group-focus-within:text-amber-500">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* INPUT 8: NOTES */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest px-1">
                            {t.labelNotes}
                          </label>
                          <div className="relative group flex items-start bg-zinc-50/50 hover:bg-zinc-100/30 border border-zinc-200/80 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/5">
                            <div className="absolute left-4 top-3.5 text-zinc-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                              <FileText className="w-4 h-4" />
                            </div>
                            <textarea
                              value={candNotes}
                              onChange={(e) => setCandNotes(e.target.value)}
                              rows={3}
                              placeholder={t.placeholderNotesCand}
                              className="w-full bg-transparent pl-11 pr-4 py-3 text-xs text-zinc-900 placeholder-zinc-400/80 font-sans focus:outline-none rounded-2xl resize-none"
                            />
                          </div>
                        </div>

                        {candInfoMessage && (
                          <p className="text-[10.5px] text-red-650 font-mono italic px-1 flex items-center gap-1.5">
                            <span>⚠️</span> <span>{candInfoMessage}</span>
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={candIsSubmitting}
                          className="btn-shine w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 text-white font-mono text-xs uppercase tracking-widest font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/25 active:scale-99"
                        >
                          {candIsSubmitting ? (
                            <>
                              <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                              <span>{t.sending}</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5 text-amber-105" />
                              <span>{t.btnSend}</span>
                            </>
                          )}
                        </button>

                      </form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

      </main>

      <ChatWidget language={language} />

      {/* Pristine Minimal Footer designed specifically for visual honesty */}
      <footer className="bg-[#000080] border-t border-[#00005c] mt-20 py-12 px-6 sm:px-10 lg:px-16 xl:px-24 shadow-inner">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center justify-between text-center md:text-left font-mono text-xs text-zinc-300 font-bold uppercase tracking-wider">

          {/* Logo & Company details */}
          <div className="space-y-2 col-span-1">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <img src="/a25icon.jpeg" alt="A25 logo" className="h-8 w-auto rounded shadow-sm" />
              <span className="text-white font-display tracking-widest text-sm">A25 WORKFORCE</span>
            </div>
            <span className="block text-[11px] text-zinc-300 font-normal normal-case pt-1 leading-relaxed">
              Bilateral recruitment pathways connecting premium North Macedonian private sectors and trade candidates in Asia.
            </span>
          </div>

          {/* Contact Details */}
          <div className="space-y-1.5 text-center font-normal uppercase text-zinc-300 text-[11px] leading-relaxed">
            <span className="block font-bold text-xs text-white">DIRECT OFFICE DESK</span>
            <span className="block">CEO Boris Vchkov // Skopje, Macedonia</span>
            <span className="block normal-case font-mono font-bold text-zinc-100">Phone: +389 71 326 293</span>
            <span className="block normal-case font-mono font-bold text-zinc-100">Email: contact@a25.mk</span>
          </div>

          {/* Regional hubs */}
          <div className="flex flex-col md:items-end justify-center gap-1.5">
            <span className="text-white text-xs font-bold">BALKAN RECRUITMENT SITES</span>
            <div className="flex gap-2.5 md:justify-end text-zinc-300 text-[11px] font-bold uppercase">
              <span>SKOPJE</span>
              <span>•</span>
              <span>NORTH MACEDONIA</span>
            </div>
            <span className="block text-[11px] text-zinc-300 font-normal">© 2026 A25 Agency. All rights reserved.</span>
            <a
              href="https://blancographics.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[10px] text-zinc-400 hover:text-white transition-colors mt-1"
            >
              MADE BY APEX SOLUTIONS
            </a>
          </div>

        </div>
      </footer>

      </div>
    </div>
  );
}
