'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Check, ArrowLeft, Zap } from 'lucide-react';
import { track } from '@vercel/analytics';
import { INDUSTRIES } from './industriesData';
import { useSite } from './SiteProvider';

/**
 * Phase 8e — the "Priority Line" modal. Three internal steps, all local state:
 *   1. form — the lead's details (see lib/priorityInterestStore.ts's record)
 *   2. otp  — the 6-digit code emailed to them, with inline failure reasons
 *   3. done — honest ending: nothing was charged, the feature isn't open yet,
 *             here's your application ID. No purchase language anywhere.
 *
 * Overlay mechanics are lifted from IndustryModal.tsx on purpose (fixed inset-0
 * backdrop, motion.div card, Esc/click-outside to close, body scroll lock) so
 * the two overlays on this site behave identically. This is NOT a route —
 * there's no /priority page; it opens on top of the existing single page.
 *
 * Open state is shared with whichever component has the CTA (currently the
 * Priority Line inset inside ContactSection's Boris banner) through a window
 * event rather than a context: `page.tsx` is a server component that mounts
 * the trigger (up in ContactSection) and this modal (down by the chat widget)
 * as unrelated siblings, and a whole provider — or a new field on SiteProvider
 * — would be a lot of plumbing for one boolean nothing else on the page reads.
 */

const OPEN_EVENT = 'a25:open-priority-line';

// Called by the Priority Line CTA (see ContactSection.tsx). Kept here, next to
// the listener, so the event name has exactly one definition.
export function openPriorityLineModal() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

type Step = 'form' | 'otp' | 'done';
type PassportStatus = 'none' | 'passport' | 'biometric';

// Mirrors lib/priorityInterest.ts's PriorityVerifyReason.
type VerifyReason = 'not-found' | 'expired' | 'wrong-code' | 'too-many-attempts';

const inputClass =
  'w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
const labelClass = 'block text-[10px] font-mono uppercase text-zinc-500 font-bold mb-1';

export default function PriorityLineModal() {
  const { language, t } = useSite();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [profession, setProfession] = useState('');
  // ONE 3-option field, never two yes/no toggles: "no passport" + "biometric"
  // as separate booleans can express a state that can't exist.
  const [passportStatus, setPassportStatus] = useState<PassportStatus | ''>('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const [code, setCode] = useState('');
  const [applicationId, setApplicationId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetAll = useCallback(() => {
    setStep('form');
    setFirstName('');
    setSurname('');
    setEmail('');
    setCountry('');
    setProfession('');
    setPassportStatus('');
    setWhatsappNumber('');
    setCode('');
    setApplicationId('');
    setErrorMessage('');
    setIsSubmitting(false);
    setIsVerifying(false);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Opened by the homepage section's CTA (see openPriorityLineModal above).
  // Every open starts from a clean form — a half-finished attempt from earlier
  // in the session shouldn't reappear.
  useEffect(() => {
    const onOpen = () => {
      resetAll();
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [resetAll]);

  // Esc to close + background scroll lock, same as IndustryModal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  // Step 1 → 2. On an already-verified email the API hands back the existing
  // application ID instead of a code, so jump straight to the thank-you screen
  // rather than asking for a code that was never sent.
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!firstName || !surname || !email || !country || !profession || !passportStatus) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/priority-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          surname,
          email,
          country,
          profession,
          passportStatus,
          whatsappNumber
        })
      });
      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.success) {
        // Phase 8g measurement point #2: a real submitted form.
        track('priority_line_form_submitted', { profession, passportStatus });

        if (data.alreadyVerified && data.applicationId) {
          setApplicationId(data.applicationId);
          setStep('done');
          return;
        }
        setCode('');
        setStep('otp');
      } else {
        setErrorMessage(data.message || t.priorityFormError);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage(t.priorityFormError);
    }
  };

  const reasonToMessage = (reason?: VerifyReason): string => {
    switch (reason) {
      case 'expired':
        return t.priorityOtpErrorExpired;
      case 'too-many-attempts':
        return t.priorityOtpErrorTooMany;
      case 'wrong-code':
        return t.priorityOtpErrorWrong;
      // A missing record means the lead expired out from under a dev restart or
      // the email was edited — resubmitting step 1 is the fix, same advice as
      // the lock-out case, so don't dead-end them here either.
      case 'not-found':
        return t.priorityOtpErrorTooMany;
      default:
        return t.priorityFormError;
    }
  };

  // Step 2 → 3.
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (isVerifying || code.length < 6) return;

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/priority-interest/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      setIsVerifying(false);

      if (response.ok && data.success) {
        // Phase 8g measurement point #3: the only event that proves a real
        // person (verified email address) completed the flow.
        track('priority_line_otp_verified');
        setApplicationId(data.applicationId || '');
        setStep('done');
      } else {
        setErrorMessage(reasonToMessage(data.reason));
      }
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
      setErrorMessage(t.priorityFormError);
    }
  };

  // Back to step 1 — resubmitting is how a fresh code is issued (the API reuses
  // the same lead record and regenerates the OTP), so there's no separate
  // "resend" endpoint or button to keep in sync.
  const backToForm = () => {
    setErrorMessage('');
    setCode('');
    setStep('form');
  };

  const passportOptions: { value: PassportStatus; label: string }[] = [
    { value: 'none', label: t.priorityPassportNone },
    { value: 'passport', label: t.priorityPassportPassport },
    { value: 'biometric', label: t.priorityPassportBiometric }
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="priority-line-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-blue-950/80 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={t.priorityFormTitle}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 sm:px-7 py-4 bg-zinc-950 text-white">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <div>
                  <h3 className="text-sm font-bold leading-tight">{t.priorityFormTitle}</h3>
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">
                    {t.priorityEyebrow}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t.priorityBtnClose}
                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-7">
              {/* ---------------- STEP 1 — form ---------------- */}
              {step === 'form' && (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  <p className="text-xs text-zinc-500 leading-relaxed">{t.priorityFormIntro}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="priority-first-name">
                        {t.priorityLabelFirstName}
                      </label>
                      <input
                        id="priority-first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="priority-surname">
                        {t.priorityLabelSurname}
                      </label>
                      <input
                        id="priority-surname"
                        type="text"
                        required
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="priority-email">
                      {t.priorityLabelEmail}
                    </label>
                    <input
                      id="priority-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.chatWidgetPlaceholderEmail}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="priority-country">
                        {t.priorityLabelCountry}
                      </label>
                      <input
                        id="priority-country"
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="priority-profession">
                        {t.priorityLabelProfession}
                      </label>
                      {/* Options come straight from industriesData.ts's INDUSTRIES
                          (same 7 panels the carousel shows, already localized) —
                          no second copy of the industry names to keep in sync. */}
                      <select
                        id="priority-profession"
                        required
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className={inputClass}
                      >
                        <option value="" disabled>
                          {t.priorityProfessionPlaceholder}
                        </option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind.key} value={ind.key}>
                            {ind.label[language]}
                          </option>
                        ))}
                        <option value="other">{t.priorityProfessionOther}</option>
                      </select>
                    </div>
                  </div>

                  <fieldset>
                    <legend className={labelClass}>{t.priorityLabelPassport}</legend>
                    <div className="space-y-2">
                      {passportOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                            passportStatus === opt.value
                              ? 'border-blue-500 bg-blue-50 text-zinc-900'
                              : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name="priority-passport"
                            required
                            value={opt.value}
                            checked={passportStatus === opt.value}
                            onChange={() => setPassportStatus(opt.value)}
                            className="accent-blue-600"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label className={labelClass} htmlFor="priority-whatsapp">
                      {t.priorityLabelWhatsapp}{' '}
                      <span className="text-zinc-400 font-normal normal-case">
                        ({t.priorityOptional})
                      </span>
                    </label>
                    <input
                      id="priority-whatsapp"
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-[11px] text-red-600 font-mono">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-xs uppercase font-bold tracking-wide rounded-lg transition"
                  >
                    {isSubmitting ? t.priorityFormSubmitting : t.priorityFormSubmit}
                  </button>
                </form>
              )}

              {/* ---------------- STEP 2 — OTP ---------------- */}
              {step === 'otp' && (
                <form onSubmit={handleVerify} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900">{t.priorityOtpTitle}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {t.priorityOtpDesc.replace('{email}', email)}
                    </p>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="priority-code">
                      {t.priorityOtpLabel}
                    </label>
                    <input
                      id="priority-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-3 text-center font-mono text-2xl tracking-[0.4em] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {errorMessage && (
                    <p className="text-[11px] text-red-600 font-mono leading-relaxed">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying || code.length < 6}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-xs uppercase font-bold tracking-wide rounded-lg transition"
                  >
                    {isVerifying ? t.priorityOtpVerifying : t.priorityOtpVerify}
                  </button>
                  <button
                    type="button"
                    onClick={backToForm}
                    className="w-full py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-mono text-xs uppercase font-bold tracking-wide rounded-lg transition inline-flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {t.priorityOtpBack}
                  </button>
                </form>
              )}

              {/* ---------------- STEP 3 — honest ending ---------------- */}
              {step === 'done' && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                    <h4 className="text-base font-bold text-zinc-900">{t.priorityDoneTitle}</h4>
                  </div>

                  {/* No purchase language here on purpose — nothing was charged
                      and the feature isn't live (Phase 8's ground truth). */}
                  <p className="text-sm text-zinc-600 leading-relaxed">{t.priorityDoneBody}</p>

                  {applicationId && (
                    <div className="rounded-xl border border-zinc-200 border-l-[3px] border-l-blue-600 bg-zinc-50 p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                        {t.priorityDoneIdLabel}
                      </p>
                      <p className="mt-1 font-mono text-lg font-bold tracking-wider text-blue-600">
                        {applicationId}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs uppercase font-bold tracking-wide rounded-lg transition"
                    >
                      {t.priorityBtnContinue}
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="flex-1 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-mono text-xs uppercase font-bold tracking-wide rounded-lg transition"
                    >
                      {t.priorityBtnClose}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
