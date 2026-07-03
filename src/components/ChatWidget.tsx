import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Language } from '../types';
import { getTranslations } from '../translations';

interface ChatWidgetProps {
  language: Language;
}

interface ChatMessage {
  role: 'visitor' | 'owner';
  text: string;
  timestamp: number;
}

const CONVERSATION_ID_KEY = 'a25_chat_conversation_id';

function getOrCreateConversationId(): string {
  let id = localStorage.getItem(CONVERSATION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
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
export default function ChatWidget({ language }: ChatWidgetProps) {
  const t = getTranslations(language);

  const [conversationId] = useState(getOrCreateConversationId);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [composerText, setComposerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const threadEndRef = useRef<HTMLDivElement>(null);

  // Poll for new messages (including owner replies) while the panel is
  // open. Fires once immediately on open to catch up on anything that
  // arrived while the widget was closed, then every ~3.5s after that.
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, conversationId]);

  // Keep the thread scrolled to the latest message.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasConversation = messages.length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!composerText) return;
    if (!hasConversation && (!name || !email)) return;

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

            {hasConversation ? (
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
            ) : (
              <div className="p-4 sm:p-5">
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
