// A25 order-completion email — sent to the client when Boris marks their order
// `done` via the Telegram /order update command (see lib/chatReplyWebhook.ts).
//
// Localized subject + body across the same 8-language set as the chat emails
// (EN/MK/AL/DE/ES/EL/PL/SV) — no more, no fewer. Reuses the shared brand shell
// from lib/chatEmailTemplates.ts so all A25 transactional email looks identical.
// Language for this email is resolved by the caller via the documented priority
// (manual tag → known client-lang → English); this template just renders it.

import type { Language } from "./languageDetect.js";
import { emailShell } from "./chatEmailTemplates.js";

interface OrderCompletedParams {
  language?: Language;
  trackUrl: string;
}

export function orderCompletedEmail(params: OrderCompletedParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { trackUrl } = params;
  const lang = (params.language || "EN").toUpperCase();

  const templates: Record<string, {
    subject: string;
    greeting: string;
    intro: string;
    outro: string;
    linkLabel: string;
    signature: string;
  }> = {
    EN: {
      subject: "Your A25 order is complete",
      greeting: "Hello,",
      intro: "Good news — your order with A25 is now complete. Every step of your request has been finalized.",
      outro: "You can review the full status and timeline of your order here:",
      linkLabel: "View your order",
      signature: "— A25 Team"
    },
    MK: {
      subject: "Вашата нарачка во А25 е завршена",
      greeting: "Здраво,",
      intro: "Добри вести — вашата нарачка во А25 е завршена. Секој чекор од вашето барање е финализиран.",
      outro: "Целосниот статус и историја на вашата нарачка можете да ги видите тука:",
      linkLabel: "Погледнете ја нарачката",
      signature: "— Тимот на А25"
    },
    AL: {
      subject: "Porosia juaj në A25 është përfunduar",
      greeting: "Përshëndetje,",
      intro: "Lajm i mirë — porosia juaj me A25 tani është përfunduar. Çdo hap i kërkesës suaj është finalizuar.",
      outro: "Mund ta shikoni statusin e plotë dhe kronologjinë e porosisë suaj këtu:",
      linkLabel: "Shiko porosinë tënde",
      signature: "— Ekipi i A25"
    },
    DE: {
      subject: "Ihr A25-Auftrag ist abgeschlossen",
      greeting: "Hallo,",
      intro: "Gute Nachrichten — Ihr Auftrag bei A25 ist nun abgeschlossen. Jeder Schritt Ihrer Anfrage wurde finalisiert.",
      outro: "Den vollständigen Status und Verlauf Ihres Auftrags finden Sie hier:",
      linkLabel: "Auftrag ansehen",
      signature: "— Das A25-Team"
    },
    ES: {
      subject: "Su pedido en A25 está completo",
      greeting: "Hola,",
      intro: "Buenas noticias — su pedido con A25 ya está completo. Cada paso de su solicitud ha sido finalizado.",
      outro: "Puede consultar el estado completo y el historial de su pedido aquí:",
      linkLabel: "Ver su pedido",
      signature: "— El equipo de A25"
    },
    EL: {
      subject: "Η παραγγελία σας στην A25 ολοκληρώθηκε",
      greeting: "Γεια σας,",
      intro: "Καλά νέα — η παραγγελία σας στην A25 ολοκληρώθηκε. Κάθε βήμα του αιτήματός σας οριστικοποιήθηκε.",
      outro: "Μπορείτε να δείτε την πλήρη κατάσταση και το ιστορικό της παραγγελίας σας εδώ:",
      linkLabel: "Δείτε την παραγγελία σας",
      signature: "— Η ομάδα της A25"
    },
    PL: {
      subject: "Twoje zamówienie w A25 zostało zrealizowane",
      greeting: "Dzień dobry,",
      intro: "Dobra wiadomość — Twoje zamówienie w A25 zostało zrealizowane. Każdy etap Twojej prośby został sfinalizowany.",
      outro: "Pełny status i historię swojego zamówienia możesz sprawdzić tutaj:",
      linkLabel: "Zobacz swoje zamówienie",
      signature: "— Zespół A25"
    },
    SV: {
      subject: "Din A25-beställning är klar",
      greeting: "Hej,",
      intro: "Goda nyheter — din beställning hos A25 är nu klar. Varje steg i din förfrågan har slutförts.",
      outro: "Du kan se den fullständiga statusen och historiken för din beställning här:",
      linkLabel: "Visa din beställning",
      signature: "— A25-teamet"
    }
  };

  const t = templates[lang] ?? templates.EN;

  const textBody = `${t.greeting}\n\n${t.intro}\n\n${t.outro}\n${trackUrl}\n\n${t.signature}`;

  const BRAND_BLUE = "#2F2FE4"; // --color-blue-600 from src/index.css
  const htmlContent = `
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${t.greeting}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${t.intro}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; color: #27272a;">${t.outro}</p>
    <p style="margin: 0 0 16px 0;">
      <a href="${trackUrl}" style="display: inline-block; background-color: ${BRAND_BLUE}; color: #ffffff; text-decoration: none; font-family: monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; padding: 12px 20px; border-radius: 8px;">${t.linkLabel}</a>
    </p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #27272a;">${t.signature}</p>
  `.trim();

  return {
    subject: t.subject,
    text: textBody,
    html: emailShell(htmlContent)
  };
}
