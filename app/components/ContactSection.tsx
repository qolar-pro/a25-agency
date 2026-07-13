'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  Mail,
  Building2,
  UserCheck,
  ChevronUp,
  ChevronDown,
  User,
  Send,
  Briefcase,
  FileText,
  MapPin,
  Award,
  Shield,
} from 'lucide-react';
import { useSite } from './SiteProvider';

interface LedgerItem {
  id: string;
  type: 'CLIENT' | 'CANDIDATE';
  name: string;
  subLabel: string; // Company name or origin territory
  mainDetail: string; // "14 workers needed" or "4 Years Exp"
  timestamp: string;
}

// SCROLL AREA 2: the executive contact hub + the two collapsible sourcing
// forms (employer / candidate). All form field state, the submit handlers and
// the inquiries ledger are local to this section; only `t` and the shared
// form-open state come from context. JSX verbatim from App.tsx.
export default function ContactSection() {
  const { t, language, empFormOpen, setEmpFormOpen, candFormOpen, setCandFormOpen } = useSite();

  // Custom estimated state for the quick slider
  const [workersCount] = useState<number>(10);

  // Helper to translate our collapse helper texts inside the forms safely.
  const getHelperText = (isOpen: boolean) => {
    switch (language) {
      case 'MK':
        return isOpen ? 'Кликнете за затворање на формата' : 'Кликнете за отварање и пишување';
      case 'AL':
        return isOpen ? 'Kliko për ta mbyllur formularin' : 'Kliko për ta hapur dhe shkruajtur';
      case 'DE':
        return isOpen ? 'Klicken Sie zum Einklappen' : 'Klicken Sie zum Öffnen und Schreiben';
      case 'ES':
        return isOpen ? 'Haga clic para colapsar' : 'Haga clic para abrir y escribir';
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

  // Seed sample ledger data on load (split out of the original combined
  // mount effect — the language-detection half now lives in SiteProvider).
  useEffect(() => {
    const cachedLedger = localStorage.getItem('vanguard_ledger_short');
    if (cachedLedger) {
      setLedger(JSON.parse(cachedLedger));
    } else {
      const sampleList: LedgerItem[] = [
        {
          id: 'REG-8392',
          type: 'CLIENT',
          name: 'Aleksandar Micevski',
          subLabel: 'Pelagonija Konstrukt AD',
          mainDetail: '15 Formwork Joiners Required',
          timestamp: '10 mins ago',
        },
        {
          id: 'REG-2015',
          type: 'CANDIDATE',
          name: 'Faton Berisha',
          subLabel: 'Kosovo (Pristina Office)',
          mainDetail: '6 Years • Welder / CNC Metal',
          timestamp: '1 hour ago',
        },
      ];
      setLedger(sampleList);
      localStorage.setItem('vanguard_ledger_short', JSON.stringify(sampleList));
    }
  }, []);

  // In the original App.tsx the language switcher reset both success panels
  // inline. With language lifted into context, reset them here whenever the
  // language changes (a no-op on the initial mount / auto-detect since both
  // start false).
  useEffect(() => {
    setEmpSuccess(false);
    setCandSuccess(false);
  }, [language]);

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
          language: language,
        }),
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
          subLabel: empCompanyName || 'Direct Inquiry',
          mainDetail: `Sourcing: ${empSector}`,
          timestamp: 'Just now',
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
        setEmpInfoMessage(data.message || 'Failure transmitting request.');
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
        subLabel: empCompanyName || 'Direct Inquiry',
        mainDetail: `Sourcing (Local Desk): ${empSector}`,
        timestamp: 'Just now',
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
          language: language,
        }),
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
          timestamp: 'Just now',
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
        setCandInfoMessage(data.message || 'Failure registering candidate file.');
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
        timestamp: 'Just now',
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
  const computedLeadTime = Math.max(15, Math.min(24, Math.round(24 - workersCount / 10)));
  const computedComplianceTier = workersCount >= 15 ? t.calcHigh : t.calcStandard;
  void computedLeadTime;
  void computedComplianceTier;

  return (
    <section id="contact-desk" className="pt-6 border-t border-zinc-200 space-y-8">
      {/* Executive Direct Contact Hub Banner */}
      <div className="panel-glow reveal relative overflow-hidden bg-gradient-to-br from-blue-650 via-blue-700 to-blue-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-600/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-amber-500/20">
            {t.secureLine}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight">
            Boris Vchkov{' '}
            <span className="text-zinc-500 font-mono font-normal text-xs lowercase block sm:inline sm:ml-2">
              {t.ownerDesk}
            </span>
          </h3>
          <p className="text-zinc-300 text-xs leading-relaxed font-sans">{t.execDeskDesc}</p>
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
        <div
          className={`card-glass border transition-all duration-500 ease-out rounded-3xl overflow-hidden flex flex-col ${
            empFormOpen
              ? 'border-blue-500/35 shadow-[0_20px_50px_rgba(31,81,255,0.06)] ring-1 ring-blue-500/10'
              : 'border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]'
          }`}
        >
          {/* Collapsible Dropdown Header Trigger */}
          <button
            type="button"
            id="employer-form-trigger"
            onClick={() => setEmpFormOpen(!empFormOpen)}
            className={`w-full text-left p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 cursor-pointer focus:outline-none ${
              empFormOpen
                ? 'bg-gradient-to-r from-blue-50/10 via-white to-white/90 border-blue-500/15'
                : 'bg-zinc-50/40 hover:bg-zinc-100/50 border-zinc-150'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-all duration-300 ${
                  empFormOpen
                    ? 'bg-blue-600 text-white scale-105 shadow-blue-500/10'
                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {t.sectionEmployersSub}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[8px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      empSuccess
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}
                  >
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
              <span
                className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-md border tracking-wider transition-all duration-300 ${
                  empFormOpen || empIsSubmitting || empSuccess
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200/50'
                    : 'bg-blue-600 border-blue-700 text-white shadow-xs hover:bg-blue-700 active:scale-95'
                }`}
              >
                {empFormOpen || empIsSubmitting || empSuccess ? t.btnClose : t.btnWriteInquiry}
              </span>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  empFormOpen ? 'bg-blue-50 text-blue-600' : 'bg-zinc-200/50 hover:bg-zinc-200 text-zinc-600'
                }`}
              >
                {empFormOpen || empIsSubmitting || empSuccess ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {/* Form Body - Collapsible with Framer Motion */}
          <motion.div
            initial={false}
            animate={{
              height: empFormOpen || empIsSubmitting || empSuccess ? 'auto' : 0,
              opacity: empFormOpen || empIsSubmitting || empSuccess ? 1 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 sm:p-8 space-y-6 border-t border-zinc-100 bg-white">
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">{t.lookingToHireDesc}</p>

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

                    <p className="text-zinc-650 text-xs leading-relaxed font-sans mt-2">{t.successText}</p>

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
        <div
          className={`card-glass border transition-all duration-500 ease-out rounded-3xl overflow-hidden flex flex-col ${
            candFormOpen
              ? 'border-amber-500/35 shadow-[0_20px_50px_rgba(245,158,11,0.06)] ring-1 ring-amber-500/10'
              : 'border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:border-zinc-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)]'
          }`}
        >
          {/* Collapsible Dropdown Header Trigger */}
          <button
            type="button"
            id="candidate-form-trigger"
            onClick={() => setCandFormOpen(!candFormOpen)}
            className={`w-full text-left p-5 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-300 cursor-pointer focus:outline-none ${
              candFormOpen
                ? 'bg-gradient-to-r from-amber-50/10 via-white to-white/90 border-amber-500/15'
                : 'bg-zinc-50/40 hover:bg-zinc-100/50 border-zinc-155'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-all duration-300 ${
                  candFormOpen
                    ? 'bg-amber-500 text-white scale-105 shadow-amber-500/10'
                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}
              >
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {t.sectionCandidatesSub}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[8px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      candSuccess
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-amber-50 text-amber-605 border border-amber-100'
                    }`}
                  >
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
              <span
                className={`font-mono text-[9px] font-bold px-3 py-1.5 rounded-md border tracking-wider transition-all duration-300 ${
                  candFormOpen || candIsSubmitting || candSuccess
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200/50'
                    : 'bg-amber-500 border-amber-600 text-white shadow-xs hover:bg-amber-600 active:scale-95'
                }`}
              >
                {candFormOpen || candIsSubmitting || candSuccess ? t.btnClose : t.btnRegisterProfile}
              </span>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  candFormOpen ? 'bg-amber-50 text-amber-600' : 'bg-zinc-200/50 hover:bg-zinc-200 text-zinc-600'
                }`}
              >
                {candFormOpen || candIsSubmitting || candSuccess ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </button>

          {/* Form Body - Collapsible with Framer Motion */}
          <motion.div
            initial={false}
            animate={{
              height: candFormOpen || candIsSubmitting || candSuccess ? 'auto' : 0,
              opacity: candFormOpen || candIsSubmitting || candSuccess ? 1 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 sm:p-8 space-y-6 border-t border-zinc-100 bg-white">
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">{t.lookingForWorkDesc}</p>

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

                    <p className="text-zinc-650 text-xs leading-relaxed font-sans mt-2">{t.successText}</p>

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
  );
}
