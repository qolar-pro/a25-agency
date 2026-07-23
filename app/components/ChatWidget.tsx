'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useSite } from './SiteProvider';

interface ChatMessage {
  role: 'visitor' | 'owner';
  text: string;
  timestamp: number;
}

const CONVERSATION_ID_KEY = 'a25_chat_conversation_id';

function getOrCreateConversationId(): string {
  // SSR-safe: on the server there is no localStorage. The real id is created
  // in the browser at hydration; this component only ever needs it once the
  // user interacts (send/poll), which happens client-side.
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(CONVERSATION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    localStorage.setItem(CONVERSATION_ID_KEY, id);
  }
  return id;
}

/**
 * Floating live chat widget. First message asks for Name/Email/Message and
 * relays it to the site owner's phone via Telegram (/api/chat). Once a
 * conversation exists, it becomes a persistent thread: the owner's replies
 * (sent via Telegram's native "Reply" action, relayed through
 * /api/telegram-webhook) show up here via polling, and the visitor can keep
 * sending follow-up messages without re-entering their details.
 */
// Widget flow steps. `resume` = the "have you chatted before?" email-lookup
// gate shown before the fresh name/email form; `form` = the new-conversation
// name/email/message form; `thread` = an active/resumed conversation.
type ChatStep = 'resume' | 'form' | 'thread';

export default function ChatWidget() {
  const { t } = useSite();

  const [conversationId, setConversationId] = useState(getOrCreateConversationId);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>('resume');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resumeEmail, setResumeEmail] = useState('');
  const [composerText, setComposerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeNotice, setResumeNotice] = useState('');

  const threadEndRef = useRef<HTMLDivElement>(null);

  // Poll for new messages (including owner replies) while the panel is open
  // AND a conversation is actually active. Fires once immediately to catch up
  // on anything that arrived while the widget was closed, then every ~3.5s.
  // Skipped on the resume/form steps — there's no conversation to poll yet.
  useEffect(() => {
    if (!isOpen || step !== 'thread') return;

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/chat-messages?conversationId=${conversationId}`);
        const data = await response.json();
        if (!cancelled && data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    poll();
    const interval = setInterval(poll, 3500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOpen, step, conversationId]);

  // When the panel first opens, if this browser already carries an active
  // conversation (localStorage id with existing messages), skip the resume
  // gate and drop straight into the thread — the visitor doesn't need to
  // re-identify themselves on their own device.
  useEffect(() => {
    if (!isOpen || step !== 'resume') return;
    if (!conversationId) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/chat-messages?conversationId=${conversationId}`);
        const data = await response.json();
        if (!cancelled && data.success && (data.messages?.length ?? 0) > 0) {
          setMessages(data.messages);
          setStep('thread');
        }
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only run this probe once per open, on the resume step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resume-or-new: look up an open conversation by email. On a hit, adopt that
  // conversationId (persisting it so polling/follow-ups target the resumed
  // thread) and jump into it. On a miss, fall through to the fresh form with a
  // gentle notice — never a hard error, matching the fail-open convention.
  const handleResumeLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!resumeEmail || isResuming) return;

    setIsResuming(true);
    setErrorMessage('');
    setResumeNotice('');

    try {
      const response = await fetch('/api/chat-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resumeEmail })
      });
      const data = await response.json();
      setIsResuming(false);

      if (response.ok && data.success && data.found) {
        setConversationId(data.conversationId);
        try {
          localStorage.setItem(CONVERSATION_ID_KEY, data.conversationId);
        } catch {
          /* ignore storage errors */
        }
        setName(data.visitorName || '');
        setEmail(data.visitorEmail || resumeEmail);
        setMessages(data.messages || []);
        setStep('thread');
      } else {
        // No open chat for that email — prefill it and move to the fresh form.
        setEmail(resumeEmail);
        setResumeNotice(t.chatWidgetResumeNotFound || 'No open chat found. Starting a new one.');
        setStep('form');
      }
    } catch (err) {
      console.error(err);
      setIsResuming(false);
      // Lookup blip shouldn't block the visitor — fall through to the form.
      setEmail(resumeEmail);
      setStep('form');
    }
  };

  const startNewChat = () => {
    setErrorMessage('');
    setResumeNotice('');
    setStep('form');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!composerText) return;
    const isThread = step === 'thread';
    if (!isThread && (!name || !email)) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, name, email, message: composerText })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.success) {
        setMessages(data.messages || []);
        setComposerText('');
        setStep('thread');
      } else {
        setErrorMessage(data.message || t.chatWidgetErrorGeneric || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setErrorMessage(t.chatWidgetErrorGeneric || 'Something went wrong.');
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="w-[92vw] max-w-sm bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-zinc-950 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-amber-500" />
                <div>
                  <h3 className="text-sm font-bold leading-tight">{t.chatWidgetTitle}</h3>
                  <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">{t.chatWidgetSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t.chatWidgetClose}
                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {step === 'thread' ? (
              <>
                {/* Message thread */}
                <div className="flex-1 max-h-80 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'visitor' ? 'items-end' : 'items-start'}`}>
                      {msg.role === 'owner' && (
                        <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold mb-0.5 px-1">
                          {t.chatWidgetOwnerLabel}
                        </span>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          msg.role === 'visitor'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-zinc-100 text-zinc-900 rounded-bl-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={threadEndRef} />
                </div>

                {/* Follow-up composer */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-100 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={composerText}
                    onChange={(e) => setComposerText(e.target.value)}
                    placeholder={t.chatWidgetPlaceholderFollowup}
                    className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !composerText}
                    aria-label={t.chatWidgetSend}
                    className="shrink-0 h-9 w-9 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                {errorMessage && (
                  <p className="text-[11px] text-red-600 font-mono px-3 pb-2">{errorMessage}</p>
                )}
              </>
            ) : step === 'resume' ? (
              /* Resume-or-new gate: look up an open conversation by email */
              <div className="p-4 sm:p-5">
                <form onSubmit={handleResumeLookup} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                      {t.chatWidgetResumePrompt}
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {t.chatWidgetResumeDesc}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      {t.chatWidgetLabelEmail}
                    </label>
                    <input
                      type="email"
                      required
                      value={resumeEmail}
                      onChange={(e) => setResumeEmail(e.target.value)}
                      placeholder={t.chatWidgetPlaceholderEmail}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResuming || !resumeEmail}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-xs uppercase font-bold tracking-wide rounded-lg transition"
                  >
                    {isResuming ? t.chatWidgetResumeSearching : t.chatWidgetResumeFind}
                  </button>
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="w-full py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-mono text-xs uppercase font-bold tracking-wide rounded-lg transition"
                  >
                    {t.chatWidgetResumeNew}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 sm:p-5">
                {resumeNotice && (
                  <p className="mb-3 text-[11px] text-zinc-500 leading-relaxed">{resumeNotice}</p>
                )}
                <form onSubmit={handleSubmit} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      {t.chatWidgetLabelName}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.chatWidgetPlaceholderName}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      {t.chatWidgetLabelEmail}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.chatWidgetPlaceholderEmail}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      {t.chatWidgetLabelMessage}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      placeholder={t.chatWidgetPlaceholderMessage}
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-2.5 text-sm resize-none focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    {isSubmitting ? t.chatWidgetSending : t.chatWidgetSend}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reassurance copy near the launcher — only while the panel is closed
          so it doesn't fight the open chat panel for space. */}
      <AnimatePresence>
        {!isOpen && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="hidden sm:block max-w-[15rem] text-right text-[11px] leading-snug text-zinc-500 bg-white/80 backdrop-blur px-2.5 py-1.5 rounded-lg shadow-sm border border-zinc-100"
          >
            {t.chatWidgetReassurance}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Launcher bubble */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={t.chatWidgetLauncherLabel}
        whileTap={{ scale: 0.92 }}
        className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center transition-colors"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}
