import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Calendar, Briefcase, UserCheck, CheckCircle2, ChevronRight, User, Building, Phone, Mail } from 'lucide-react';
import { Language, WorkforceRequest, CandidateApplication } from '../types';
import { TRANSLATIONS } from '../data';

interface HeroProps {
  language: Language;
  onNewRequest: (req: WorkforceRequest) => void;
  onNewApplication: (app: CandidateApplication) => void;
  onRequestOpen: () => void; // for accessibility matching
  onOpenApply: () => void;   // for accessibility matching
}

export default function Hero({ language, onNewRequest, onNewApplication, onRequestOpen, onOpenApply }: HeroProps) {
  const t = TRANSLATIONS[language];
  
  // Tab within the integrated contact form: 'client' or 'candidate'
  const [formType, setFormType] = useState<'client' | 'candidate'>('client');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Client form fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [workerCount, setWorkerCount] = useState<number>(10);
  const [contractDuration, setContractDuration] = useState<number>(12);
  const [selectedSector, setSelectedSector] = useState('construction');
  const [urgency, setUrgency] = useState<'immediate' | 'medium' | 'planning'>('immediate');
  const [clientNotes, setClientNotes] = useState('');

  // Candidate form fields
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candCountry, setCandCountry] = useState('Kosovo');
  const [candExp, setCandExp] = useState<number>(3);
  const [candSector, setCandSector] = useState('construction');
  const [candPassport, setCandPassport] = useState<boolean>(true);
  const [candNotes, setCandNotes] = useState('');

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !contactEmail || !contactPhone) {
      alert(language === 'EN' ? 'Please fill in all required fields' : 'Ве молиме пополнете ги задолжителните полиња');
      return;
    }

    const newReq: WorkforceRequest = {
      id: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
      companyName,
      contactPerson,
      contactEmail,
      contactPhone,
      sector: selectedSector,
      workerCount,
      durationMonths: contractDuration,
      urgency,
      notes: clientNotes,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };

    onNewRequest(newReq);
    setIsSubmitted(true);
    resetClientForm();
  };

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candEmail || !candPhone) {
      alert(language === 'EN' ? 'Please fill in all required fields' : 'Ве молиме пополнете ги задолжителните полиња');
      return;
    }

    const newApp: CandidateApplication = {
      id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: candName,
      email: candEmail,
      phone: candPhone,
      country: candCountry,
      experienceYears: candExp,
      sector: candSector,
      hasPassport: candPassport,
      notes: candNotes,
      createdAt: new Date().toISOString(),
      status: 'SUBMITTED'
    };

    onNewApplication(newApp);
    setIsSubmitted(true);
    resetCandidateForm();
  };

  const resetClientForm = () => {
    setCompanyName('');
    setContactPerson('');
    setContactEmail('');
    setContactPhone('');
    setClientNotes('');
  };

  const resetCandidateForm = () => {
    setCandName('');
    setCandEmail('');
    setCandPhone('');
    setCandNotes('');
  };

  return (
    <section id="contact-form-section" className="relative min-h-[90vh] flex flex-col justify-center bg-zinc-50 border-b border-zinc-250 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Decorative clean ambient glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Direct Agency Description & Strategic Benefits */}
        <div className="lg:col-span-6 text-left space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-mono text-[10px] text-blue-800 font-bold tracking-wider uppercase">
              {language === 'EN' ? 'Bilateral Workforce Corridors' : language === 'MK' ? 'Билатерални Коридори' : 'Korridoret Dypalëshe'}
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-display font-black text-zinc-900 tracking-tight leading-none uppercase">
              {language === 'EN' ? 'Simplified Cross-Border Recruitments' : language === 'MK' ? 'Едноставно Вработување Кадар' : 'Rekrutimi i Thjeshtuar'}
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 font-sans max-w-xl leading-relaxed">
              {language === 'EN' 
                ? 'Helping corporate partners in North Macedonia bypass local shortages through certified, safe talent transfers from direct Balkan countries. Fast, standard-compliant, and fully handled.'
                : language === 'MK'
                ? 'Испорака на сигурна, квалитетна работна сила во партнерство со јужните балкански земји. Ние се грижиме за документи, визи, здравствено и организирано сместување за кадарот.'
                : 'Duke ndihmuar partnerët tanë korporativë me transferimin e shpejtë dhe të sigurt të punëtorëve në Maqedoninë e Veriut. Ne menaxhojmë vizat, akomodimin dhe kontratat ligjore.'}
            </p>
          </div>

          {/* Simple Bullet Lists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-lg font-mono text-xs text-zinc-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'EN' ? 'Vetted candidate registries' : language === 'MK' ? 'Проверени верификувани кандидати' : 'Kandidatë të verifikuar'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'EN' ? 'Pre-arranged modern housing' : language === 'MK' ? 'Обезбедено градско сместување' : 'Akomodim i garantuar'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'EN' ? '15-24 days transit support' : language === 'MK' ? 'Брз транзит за 15-24 дена' : 'Tranzit i shpejtë 15-24 ditë'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'EN' ? 'Bilateral government visas' : language === 'MK' ? 'Законски работни престој визи' : 'Viza dypalëshe të punës'}</span>
            </div>
          </div>

          {/* Minimal Metric Panel */}
          <div className="pt-6 sm:pt-8 border-t border-zinc-200 grid grid-cols-3 gap-6 max-w-md font-mono text-left">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase">{language === 'EN' ? 'Active Sectors' : 'Активни Сектори'}</div>
              <div className="text-xl font-bold text-zinc-900 mt-0.5">3 Major</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase">{language === 'EN' ? 'Process Time' : 'Потребно Време'}</div>
              <div className="text-xl font-bold text-zinc-900 mt-0.5">15-24 Days</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase">{language === 'EN' ? 'Bilateral' : 'Билатерално'}</div>
              <div className="text-xl font-bold text-emerald-600 mt-0.5">100% Legal</div>
            </div>
          </div>
        </div>

        {/* Right Column: Beautiful Interactive Dual Contact Choice Form */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-lg p-6 sm:p-8 relative">
            
            {/* Form Type Toggles */}
            <div className="flex border-b border-zinc-250 pb-4 mb-6">
              <button
                onClick={() => { setFormType('client'); setIsSubmitted(false); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all border-b-2 ${
                  formType === 'client' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>{language === 'EN' ? 'Macedonian Enterprise' : language === 'MK' ? 'За Компании' : 'Për Kompani'}</span>
              </button>
              <button
                onClick={() => { setFormType('candidate'); setIsSubmitted(false); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all border-b-2 ${
                  formType === 'candidate' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{language === 'EN' ? 'Job Applicants' : language === 'MK' ? 'За Кандидати' : 'Për Kandidatë'}</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 uppercase">
                      {language === 'EN' ? 'Transmitted & Saved!' : 'Сигурно Испишано и Зачувано!'}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono mt-2 max-w-sm mx-auto">
                      {language === 'EN' 
                        ? 'Your inquiry is stored in your local session and has been loaded to our real-time audit logs below.'
                        : 'Вашето барање со сигурност е внесено во историјата на оваа локална сесија и е веднаш прикажано долу во модулот.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs rounded shadow transition"
                  >
                    {language === 'EN' ? 'Submit Another Form' : 'Испрати Нова Форма'}
                  </button>
                </motion.div>
              ) : formType === 'client' ? (
                /* Corporate Sourcing Intake Form */
                <motion.form
                  key="client-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleClientSubmit}
                  className="space-y-4 text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Enterprise Name *' : 'Име на компанија *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Skopje Metallurgy AD"
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Contact Person *' : 'Лице за контакт *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Jovan Stojanovski"
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Business Email *' : 'Адреса за е-пошта *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="name@company.mk"
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Contact Number *' : 'Контакт телефон *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+389 7X XXX XXX"
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Staff Capacity' : 'Потребен кадар'}
                      </label>
                      <select
                        value={workerCount}
                        onChange={(e) => setWorkerCount(Number(e.target.value))}
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-blue-500"
                      >
                        <option value={5}>5 workers</option>
                        <option value={10}>10 workers</option>
                        <option value={25}>25 workers</option>
                        <option value={50}>50+ workers</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Industry Sector' : 'Сектор на работа'}
                      </label>
                      <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none focus:border-blue-500"
                      >
                        <option value="construction">Construction</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="hospitality">Hospitality/Tourism</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Contract Term' : 'Времетраење'}
                      </label>
                      <select
                        value={contractDuration}
                        onChange={(e) => setContractDuration(Number(e.target.value))}
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none"
                      >
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                        <option value={24}>24 Months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                      {language === 'EN' ? 'Urgency Priority' : 'Ургентност'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['immediate', 'medium', 'planning'] as const).map((urg) => (
                        <button
                          key={urg}
                          type="button"
                          onClick={() => setUrgency(urg)}
                          className={`py-2 text-[10px] font-mono uppercase border transition rounded ${
                            urgency === urg
                              ? 'bg-blue-600 border-blue-600 text-white font-bold'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100'
                          }`}
                        >
                          {urg === 'immediate' ? (language === 'EN' ? 'Immediate' : 'Итно') : urg === 'medium' ? (language === 'EN' ? 'Standard' : 'Стандардно') : (language === 'EN' ? 'Planning' : 'Планирано')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                      {language === 'EN' ? 'Operational Notes / Demands' : 'Забелешки / Барања'}
                    </label>
                    <textarea
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="e.g. Requires certified drywall masonry or high-voltage workers."
                      rows={2}
                      className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm uppercase tracking-wide transition rounded font-bold shadow-sm"
                  >
                    {language === 'EN' ? 'Submit Sourcing Demand' : 'Поднеси барање за кадар'}
                  </button>
                </motion.form>
              ) : (
                /* Candidate/Job Applicant Form */
                <motion.form
                  key="candidate-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleCandidateSubmit}
                  className="space-y-4 text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Full Name *' : 'Име и презиме *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={candName}
                        onChange={(e) => setCandName(e.target.value)}
                        placeholder="Ilir Hoxha"
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Origin Country *' : 'Држава на потекло *'}
                      </label>
                      <select
                        value={candCountry}
                        onChange={(e) => setCandCountry(e.target.value)}
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none"
                      >
                        <option value="Kosovo">Kosovo</option>
                        <option value="Albania">Albania</option>
                        <option value="Serbia">Serbia</option>
                        <option value="Bosnia">Bosnia / Region</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Email Address *' : 'Адреса за е-пошта *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={candEmail}
                        onChange={(e) => setCandEmail(e.target.value)}
                        placeholder="candidate@workmail.net"
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'WhatsApp/Viber Number *' : 'Контакт број (Viber/WhatsApp) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={candPhone}
                        onChange={(e) => setCandPhone(e.target.value)}
                        placeholder="+383 49 XXX XXX"
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Your Specialization' : 'Ваш Искуствен Сектор'}
                      </label>
                      <select
                        value={candSector}
                        onChange={(e) => setCandSector(e.target.value)}
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none"
                      >
                        <option value="construction">Masonry & Heavy Building</option>
                        <option value="manufacturing">Industrial Assembly</option>
                        <option value="hospitality">Hospitality / Gastro Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                        {language === 'EN' ? 'Experience Level' : 'Работно Искуство'}
                      </label>
                      <select
                        value={candExp}
                        onChange={(e) => setCandExp(Number(e.target.value))}
                        className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:outline-none"
                      >
                        <option value={1}>1 Year Experience</option>
                        <option value={3}>3 Years Experience</option>
                        <option value={5}>5+ Years Experience</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">
                      {language === 'EN' ? 'Do you hold a Biometric Passport?' : 'Имате ли Биометриски Пасош?'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCandPassport(true)}
                        className={`py-2 text-[10px] font-mono uppercase border transition rounded ${
                          candPassport
                            ? 'bg-blue-600 border-blue-600 text-white font-bold'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                        }`}
                      >
                        {language === 'EN' ? 'Yes, Approved' : 'Да, Поседувам'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCandPassport(false)}
                        className={`py-2 text-[10px] font-mono uppercase border transition rounded ${
                          !candPassport
                            ? 'bg-amber-600 border-amber-600 text-white font-bold'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                        }`}
                      >
                        {language === 'EN' ? 'No / In-Process' : 'Во процедура / Не'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                      {language === 'EN' ? 'Preferred conditions / Notes' : 'Преферирани услови'}
                    </label>
                    <textarea
                      value={candNotes}
                      onChange={(e) => setCandNotes(e.target.value)}
                      placeholder="Details about your concrete works, kitchen work history..."
                      rows={2}
                      className="w-full text-xs font-sans p-3 bg-zinc-50 border border-zinc-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm uppercase tracking-wide transition rounded font-bold shadow-sm"
                  >
                    {language === 'EN' ? 'Register in Talent Pool' : 'Аплицирај за вработување'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </section>
  );
}
