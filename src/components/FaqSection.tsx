import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface FaqSectionProps {
  language: Language;
}

interface FaqItem {
  id: number;
  q: Record<string, string>;
  a: Record<string, string>;
}

export default function FaqSection({ language }: FaqSectionProps) {
  const [openId, setOpenId] = useState<number | null>(1);

  const faqs: FaqItem[] = [
    {
      id: 1,
      q: {
        EN: 'How fast is the cross-border transit process?',
        MK: 'Колку брзо се одвива процесот на прекуграничен транзит?',
        AL: 'Sa i shpejtë është procesi i tranzitit kufitar?'
      },
      a: {
        EN: 'The typical lead-time handles recruitment vetting, visa applications, biometric records, and site transit in 15 to 24 days average. Thanks to bilateral accords between regional cabinets, processing runs at fast priority speedways.',
        MK: 'Вообичаеното време за транзит трае од 15 до 24 дена просечно. Ова вклучува верифкација во центрите, визи, привремен престој и безбеден транспорт со возила на агенцијата.',
        AL: 'Koha mesatare e tranzitit zgjat 15 deri në 24 ditë. Kjo përfshin verifikimin, marrjen e vizave, regjistrimin biometrik dhe transportin deri te kapaciteti i punëdhënësit.'
      }
    },
    {
      id: 2,
      q: {
        EN: 'Is Vanguard Balkan responsible for housing?',
        MK: 'Дали Вангард Балкан е одговорен за сместување на работниците?',
        AL: 'A është përgjegjës Vanguard Balkan për akomodimin?'
      },
      a: {
        EN: 'Yes. Every placement program includes guaranteed, pre-arranged housing. We procure modern block housing apartments close to client facilities, handle utility agreements, and manage tenant orientation to ensure zero employer liability.',
        MK: 'Да. Секоја програма за работа вклучува загарантирано сместување. Обезбедуваме модерни станбени блокови во близина на работното место, ги менаџираме комуналиите и се грижиме за адаптацијата на вработените.',
        AL: 'Po. Secili program përfshin strehimin e garantuar të punëtorëve. Ne sigurojmë blloqe banimi moderne afër bizneseve, menaxhojmë faturat dhe kujdesemi për integrimin e tyre.'
      }
    },
    {
      id: 3,
      q: {
        EN: 'Are bilateral contracts certified by Macedonian Ministries?',
        MK: 'Дали билатералните договори се заверени од македонските министерства?',
        AL: 'A janë kontratat dypalëshe të certifikuara nga Ministritë e Maqedonisë?'
      },
      a: {
        EN: 'Absolutely. All candidate contracts match current legal regulations authorized by the Ministry of Labor and Social Policy and the Ministry of Internal Affairs. This provides fully legal healthcare registrations and official residency status.',
        MK: 'Апсолутно. Сите договори за работа се одобрени од Министерството за внатрешни работи и Министерството за труд и социјална политика на Македонија. Со ова се гарантира здравствено осигурување и законски привремен престој.',
        AL: 'Plotësisht. Çdo kontratë pune është në përputhje me kodet ligjore dhe e certifikuar nga Ministria e Punëve të Brendshme dhe e Politikës Sociale në Maqedoninë e Veriut.'
      }
    },
    {
      id: 4,
      q: {
        EN: 'What is the minimum worker placement size?',
        MK: 'Кој е минималниот обем за ангажирање работници?',
        AL: 'Cila është madhësia minimale e dërgimit të stafit?'
      },
      a: {
        EN: 'Our tactical supply corridors are optimized for enterprise volume scaling. To maintain security, compliance efficiency, and coordinated group bus transits, our minimum intake request starts at 5 operatives per program.',
        MK: 'Нашите канали се оптимизирани за задоволување на зголемени потреби за капацитети во индустријата. Минималниот обем за ангажирање работници е 5 лица по програма за одржување ефикасност при транспорт и регулација.',
        AL: 'Kanalet tona janë të optimizuara për furnizime me vëllim të madh. Për të mbajtur kosto të ulët dhe tranzit të sinkronizuar, kërkesa minimale fillon nga 5 punëtorë për program.'
      }
    }
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200 overflow-hidden text-left">
      <div className="max-w-4xl mx-auto">
        
        {/* Header segment */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-mono text-blue-600 tracking-[0.3em] uppercase block font-bold">
            {language === 'EN' ? 'ADVISORY MATRIX' : 'РАЗЈАСНУВАЊА И ПРАВИЛА'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-zinc-900 uppercase">
            {language === 'EN' ? 'Frequently Answered Questions' : 'Најчесто Поставувани Прашања'}
          </h2>
          <p className="text-zinc-550 font-mono text-xs max-w-lg mx-auto">
            {language === 'EN' 
              ? 'Providing full operational transparency for corporate legal heads and Balkan jobseekers.'
              : 'Оперативни правила и информации за претпријатија и кандидати за работа.'}
          </p>
        </div>

        {/* Collapsible details layout */}
        <div className="space-y-4 font-mono">
          {faqs.map((f) => {
            const isOpen = openId === f.id;
            return (
              <div 
                key={f.id} 
                className="border border-zinc-200 bg-zinc-50 hover:border-zinc-350 transition duration-150 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  className="w-full p-5 flex items-center justify-between text-left gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 font-bold">[0{f.id}]</span>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 uppercase tracking-tight">
                      {f.q[language]}
                    </h3>
                  </div>
                  <ChevronDown className={`w-4.5 h-4.5 text-zinc-400 transition-transform duration-250 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-zinc-600 leading-relaxed border-t border-zinc-200 font-sans">
                        {f.a[language]}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block font-bold">
            © 2026 VANGUARD BALKAN // COOPERATIVE MIGRATIONS MAPPED
          </span>
        </div>

      </div>
    </section>
  );
}
