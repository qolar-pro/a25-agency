import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Calendar, Tag, User, Building, FileText } from 'lucide-react';
import { Language, WorkforceRequest, CandidateApplication } from '../types';
import { TRANSLATIONS } from '../data';

interface LogsSectionProps {
  language: Language;
  requests: WorkforceRequest[];
  applications: CandidateApplication[];
}

export default function LogsSection({ language, requests, applications }: LogsSectionProps) {
  const t = TRANSLATIONS[language];

  // Merge client requests and candidate applications for a cohesive real-time audit ledger
  const allSubmissions = [
    ...requests.map(r => ({ ...r, type: 'CLIENT' as const })),
    ...applications.map(a => ({ ...a, type: 'CANDIDATE' as const }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <section id="logs" className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-b border-zinc-200 relative overflow-hidden">
      
      {/* Decorative clean background detail */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="border-b border-zinc-200 pb-8 mb-12 flex flex-col sm:flex-row sm:items-end justify-between text-left">
          <div className="space-y-2">
            <span className="text-xs font-mono text-blue-600 tracking-[0.4em] uppercase block font-bold">
              {language === 'EN' ? 'LIVE SUBMISSION AUDIT' : 'АКТИВЕН ИНТЕРФЕЈС НА ПОДНЕСОЦИ'}: [04]
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-zinc-900 uppercase">
              {language === 'EN' ? 'Active Registrations' : 'Ажурна Листа на Барања'}
            </h2>
          </div>
          <div className="text-left sm:text-right mt-4 sm:mt-0 font-mono text-xs text-zinc-500 uppercase tracking-widest font-medium">
            {language === 'EN' ? 'Secure Local Session Sync' : 'Сигурна Локална Сесија'}
          </div>
        </div>

        {allSubmissions.length === 0 ? (
          /* Empty State */
          <div className="border border-zinc-200 bg-white p-12 text-center rounded-2xl space-y-4 shadow-sm max-w-xl mx-auto">
            <Database className="w-12 h-12 text-zinc-300 mx-auto animate-pulse" />
            <p className="text-xs text-zinc-500 tracking-wider uppercase font-mono leading-relaxed">
              {t.noSubmissions}
            </p>
            <p className="text-[11px] text-zinc-400 font-mono">
              {language === 'EN' 
                ? 'Try filling and submitting the contact form above to instantly populate this list in real-time!'
                : 'Пополнете ја формата на почетокот од страницата за веднаш да се прикаже тука вашиот внес во реално време!'}
            </p>
          </div>
        ) : (
          /* Dynamic Logs Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence initial={false}>
              {allSubmissions.map((sub) => {
                const isClient = sub.type === 'CLIENT';
                
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`p-6 border rounded-2xl bg-white shadow-sm hover:shadow transition-all relative overflow-hidden ${
                      isClient 
                        ? 'border-l-4 border-l-blue-600 border-zinc-200' 
                        : 'border-l-4 border-l-emerald-600 border-zinc-200'
                    }`}
                  >
                    
                    {/* Badge header */}
                    <div className="flex items-center justify-between text-[10px] font-mono border-b border-zinc-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        {isClient ? <Building className="w-4.5 h-4.5 text-blue-600" /> : <User className="w-4.5 h-4.5 text-emerald-600" />}
                        <span className={`font-bold uppercase tracking-wider ${isClient ? 'text-blue-700' : 'text-emerald-700'}`}>
                          {isClient ? t.logTypeCompany : t.logTypeCandidate}
                        </span>
                      </div>
                      <span className="text-zinc-400 font-bold uppercase tracking-widest">{sub.id}</span>
                    </div>

                    {/* Body contents */}
                    {isClient ? (
                      <div className="space-y-4 text-left">
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-zinc-900 tracking-tight uppercase">
                            {(sub as WorkforceRequest).companyName}
                          </h4>
                          <span className="text-xs text-zinc-500 block font-medium">
                            {language === 'EN' ? 'Contact Rep' : 'Контакт лице'}: {(sub as WorkforceRequest).contactPerson}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="block text-[8px] text-zinc-450 uppercase font-bold tracking-wider mb-1">CAPACITY DEMANDED</span>
                            <span className="text-blue-700 font-bold">{(sub as WorkforceRequest).workerCount} OPERATIVES</span>
                          </div>
                          
                          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="block text-[8px] text-zinc-450 uppercase font-bold tracking-wider mb-1">SECTOR MATRIX</span>
                            <span className="text-zinc-800 font-bold uppercase">{(sub as WorkforceRequest).sector}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 font-mono text-[10px] text-zinc-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{(sub as WorkforceRequest).durationMonths} MONTHS CONTRACT</span>
                          </div>
                          <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] rounded">
                            ACTIVE // PENDING
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-left">
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-zinc-900 tracking-tight uppercase">
                            {(sub as CandidateApplication).fullName}
                          </h4>
                          <span className="text-xs text-zinc-500 block font-medium">
                            {language === 'EN' ? 'Origin' : 'Потекло'}: {(sub as CandidateApplication).country}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="block text-[8px] text-zinc-450 uppercase font-bold tracking-wider mb-1">PRACTICAL EXPERIENCE</span>
                            <span className="text-emerald-700 font-bold">{(sub as CandidateApplication).experienceYears} YEARS</span>
                          </div>
                          
                          <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                            <span className="block text-[8px] text-zinc-450 uppercase font-bold tracking-wider mb-1">PASSPORT REGISTER</span>
                            <span className={`font-bold uppercase ${(sub as CandidateApplication).hasPassport ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {(sub as CandidateApplication).hasPassport ? 'BIOMETRIC [✓]' : 'MISSING [!]'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 font-mono text-[10px] text-zinc-500">
                          <div className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="uppercase">Sector: {(sub as CandidateApplication).sector}</span>
                          </div>
                          <span className="inline-flex items-center bg-emerald-50 border border-emerald-100 text-emerald-800 px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] rounded">
                            QUEUED // STANDARD
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
