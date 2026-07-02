import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BadgeCheck, Network, CheckSquare } from 'lucide-react';
import { Language, CandidateApplication } from '../types';
import { TRANSLATIONS, SECTORS } from '../data';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSubmitted: (newApplication: CandidateApplication) => void;
}

export default function ApplyModal({ isOpen, onClose, language, onSubmitted }: ApplyModalProps) {
  const t = TRANSLATIONS[language];
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Kosovo');
  const [experienceYears, setExperienceYears] = useState(3);
  const [selectedSector, setSelectedSector] = useState(SECTORS[0].id);
  const [hasPassport, setHasPassport] = useState(true);
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      const newApplication: CandidateApplication = {
        id: `APP-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName,
        email,
        phone,
        country,
        experienceYears,
        sector: selectedSector,
        hasPassport,
        notes,
        createdAt: new Date().toISOString(),
        status: 'SUBMITTED'
      };
      
      onSubmitted(newApplication);
    }, 1200);
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setCountry('Kosovo');
    setExperienceYears(3);
    setSelectedSector(SECTORS[0].id);
    setHasPassport(true);
    setNotes('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0" 
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-10"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
              <div className="flex items-center gap-3 text-left">
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">CANDIDATE REGISTRATION</h3>
                  <h2 className="text-lg font-bold text-zinc-900 leading-tight uppercase font-display">{t.applyPlacement}</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 text-zinc-455 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div 
                  key="submitting"
                  className="py-12 flex flex-col items-center justify-center text-center space-y-4 font-mono"
                >
                  <Network className="w-10 h-10 text-emerald-600 animate-spin" />
                  <p className="text-xs text-emerald-800 font-bold tracking-widest">SUBMITTING PROFILE PROTOCOLS...</p>
                  <p className="text-zinc-550 text-sm max-w-xs font-sans">Queueing candidate profile directly into the local session registry...</p>
                </motion.div>
              ) : isSuccess ? (
                <motion.div 
                  key="success"
                  className="py-8 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600">
                    <CheckSquare className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-zinc-900">{t.successTitle}</h3>
                    <p className="text-zinc-550 text-sm max-w-md mx-auto">{t.successAppDesc}</p>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs rounded shadow uppercase font-bold"
                  >
                    {t.close}
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-4 text-left"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.applyPlaceholderName} *</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-emerald-550 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                        placeholder="e.g. Arben Krasniqi"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">Origin Territory *</label>
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded p-3 text-sm focus:outline-none"
                      >
                        <option value="Kosovo">Kosovo</option>
                        <option value="Albania">Albania</option>
                        <option value="Bosnia">Bosnia-Herzegovina</option>
                        <option value="Serbia">Serbia</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.emailLabel} *</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-emerald-550 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                        placeholder="candidate.name@outlook.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.phoneLabel} *</label>
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-emerald-550 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                        placeholder="e.g. +383 44 123 456"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.sectorTitle}</label>
                      <select 
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-850 rounded p-3 text-sm focus:outline-none"
                      >
                        {SECTORS.map(s => (
                          <option key={s.id} value={s.id}>{s.title[language]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.experienceYearsLabel}</label>
                      <input 
                        type="number" 
                        min="0"
                        max="30"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.hasPassportLabel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setHasPassport(true)}
                        className={`py-2.5 font-mono text-xs uppercase border transition rounded ${
                          hasPassport 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        {t.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasPassport(false)}
                        className={`py-2.5 font-mono text-xs uppercase border transition rounded ${
                          !hasPassport 
                            ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold shadow-sm' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        {t.no}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.notesLabel}</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-emerald-550 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                      placeholder="List any professional building, cooking, or warehouse certificates..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm uppercase tracking-wide transition rounded font-bold shadow-sm"
                  >
                    {t.submit}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
