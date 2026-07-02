import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Cpu, CheckSquare } from 'lucide-react';
import { Language, WorkforceRequest } from '../types';
import { TRANSLATIONS, SECTORS } from '../data';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSubmitted: (newRequest: WorkforceRequest) => void;
}

export default function RequestModal({ isOpen, onClose, language, onSubmitted }: RequestModalProps) {
  const t = TRANSLATIONS[language];
  
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedSector, setSelectedSector] = useState(SECTORS[0].id);
  const [workerCount, setWorkerCount] = useState(15);
  const [durationMonths, setDurationMonths] = useState(12);
  const [urgency, setUrgency] = useState<'immediate' | 'medium' | 'planning'>('medium');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !contactEmail || !contactPhone) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      const newRequest: WorkforceRequest = {
        id: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
        companyName,
        contactPerson,
        contactEmail,
        contactPhone,
        sector: selectedSector,
        workerCount,
        durationMonths,
        urgency,
        notes,
        createdAt: new Date().toISOString(),
        status: 'PENDING'
      };
      
      onSubmitted(newRequest);
    }, 1200);
  };

  const handleReset = () => {
    setCompanyName('');
    setContactPerson('');
    setContactEmail('');
    setContactPhone('');
    setSelectedSector(SECTORS[0].id);
    setWorkerCount(15);
    setDurationMonths(12);
    setUrgency('medium');
    setNotes('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
        {/* Backdrop overlay */}
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
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">CLIENT INTAKE</h3>
                  <h2 className="text-lg font-bold text-zinc-900 leading-tight uppercase font-display">{t.requestWorkforce}</h2>
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
                  <Cpu className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-xs text-blue-800 font-bold tracking-widest">TRANSMITTING SECURELY...</p>
                  <p className="text-zinc-550 text-sm max-w-xs font-sans">Connecting with registered cross-border processing offices...</p>
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
                    <p className="text-zinc-550 text-sm max-w-md mx-auto">{t.successDesc}</p>
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
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.companyPlaceholderName} *</label>
                      <input 
                        type="text" 
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. MakMetal Industries"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">Contact Representative *</label>
                      <input 
                        type="text" 
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Igor Angelovski"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.emailLabel} *</label>
                      <input 
                        type="email" 
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="representative@domain.mk"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.phoneLabel} *</label>
                      <input 
                        type="tel" 
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. +389 70 123 456"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.sectorTitle}</label>
                      <select 
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded p-3 text-sm focus:outline-none uppercase font-mono text-xs"
                      >
                        {SECTORS.map(s => (
                          <option key={s.id} value={s.id}>{s.title[language]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.urgencyLabel}</label>
                      <select 
                        value={urgency}
                        onChange={(e) => setUrgency(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 rounded p-3 text-sm focus:outline-none uppercase font-mono text-xs"
                      >
                        <option value="immediate">{t.immediate}</option>
                        <option value="medium">{t.medium}</option>
                        <option value="planning">{t.planning}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase font-bold">{t.notesLabel}</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Specify special certifications, language requirements, etc."
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
