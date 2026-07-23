// A25 chat email templates — localized subject lines and bodies for the two
// chat lifecycle notifications:
//
//   chatReceivedEmail  — sent to the visitor the moment a new conversation is
//                        created; "we got your message, someone will reply soon."
//   chatAnsweredEmail  — sent to the visitor when the owner replies in Telegram;
//                        replaces the previous English-only notification in
//                        lib/chatReplyWebhook.ts.
//
// Language is sourced from the stored conversation record (visitor's
// Accept-Language header, captured at createConversation time). Falls back to
// EN when not stored — this is intentional and documented: if a conversation
// predates the language-capture field, EN is the safe default rather than
// guessing incorrectly.
//
// Pattern mirrors lib/submission.ts's getConfirmationEmail — localized subjects
// per language, same 8-language set (EN/MK/AL/DE/ES/EL/PL/SV). No more,
// no fewer — treat missing translations as a bug.

const BRAND_BLUE = "#2F2FE4"; // --color-blue-600 from src/index.css

export function emailShell(content: string): string {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #18181b;">
      <div style="background-color: #09090b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; border-bottom: 2px solid ${BRAND_BLUE};">
        <h2 style="color: #ffffff; margin: 0; font-family: monospace; letter-spacing: 2px; font-weight: 800; font-size: 22px;">A25</h2>
        <p style="color: #a1a1aa; margin: 5px 0 0 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;">Bilateral Workforce Agency</p>
      </div>
      <div style="padding: 24px 0;">
        ${content}
      </div>
      <div style="border-top: 1px solid #e4e4e7; padding-top: 16px; text-align: center; font-size: 10px; color: #a1a1aa; font-family: monospace; text-transform: uppercase;">
        <p style="margin: 0;">A25 — a25.mk</p>
      </div>
    </div>
  `.trim();
}

// ---------------------------------------------------------------------------
// Chat-received email — fires when a new conversation is created
// ---------------------------------------------------------------------------

interface ChatReceivedParams {
  visitorName: string;
  language?: string;
}

export function chatReceivedEmail(params: ChatReceivedParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { visitorName, language } = params;
  const lang = (language || "EN").toUpperCase();

  const templates: Record<string, { subject: string; body: string }> = {
    EN: {
      subject: "We received your message — A25",
      body: `Hi ${visitorName},\n\nWe have received your message and someone from the A25 team will reply shortly. Most replies come back within minutes.\n\n— A25 Team`
    },
    MK: {
      subject: "Ја примивме вашата порака — А25",
      body: `Почитуван(а) ${visitorName},\n\nВашата порака е примена. Некој од тимот на А25 ќе ви одговори наскоро — обично во рок од неколку минути.\n\nСо почит,\nТимот на А25`
    },
    AL: {
      subject: "E morëm mesazhin tuaj — A25",
      body: `I nderuar ${visitorName},\n\nE kemi marrë mesazhin tuaj. Dikush nga ekipi i A25 do t'ju përgjigjet së shpejti — zakonisht brenda disa minutave.\n\nPërshendetje,\nEkipi i A25`
    },
    DE: {
      subject: "Wir haben Ihre Nachricht erhalten — A25",
      body: `Sehr geehrte(r) ${visitorName},\n\nVielen Dank für Ihre Nachricht. Jemand aus dem A25-Team wird in Kürze antworten — in der Regel innerhalb weniger Minuten.\n\nMit freundlichen Grüßen,\nDas A25-Team`
    },
    ES: {
      subject: "Hemos recibido su mensaje — A25",
      body: `Estimado(a) ${visitorName},\n\nHemos recibido su mensaje. Alguien del equipo A25 le responderá en breve, normalmente en cuestión de minutos.\n\nAtentamente,\nEl equipo de A25`
    },
    EL: {
      subject: "Λάβαμε το μήνυμά σας — A25",
      body: `Αγαπητέ/ή ${visitorName},\n\nΛάβαμε το μήνυμά σας. Κάποιος από την ομάδα της A25 θα σας απαντήσει σύντομα — συνήθως εντός λίγων λεπτών.\n\nΜε εκτίμηση,\nΗ ομάδα της A25`
    },
    PL: {
      subject: "Otrzymaliśmy Twoją wiadomość — A25",
      body: `Szanowny/a ${visitorName},\n\nOtrzymaliśmy Twoją wiadomość. Ktoś z zespołu A25 odpowie wkrótce — zazwyczaj w ciągu kilku minut.\n\nZ poważaniem,\nZespół A25`
    },
    SV: {
      subject: "Vi har mottagit ditt meddelande — A25",
      body: `Hej ${visitorName},\n\nVi har mottagit ditt meddelande. Någon från A25-teamet svarar snart — oftast inom några minuter.\n\nMed vänliga hälsningar,\nA25-teamet`
    }
  };

  const t = templates[lang] ?? templates.EN;

  const htmlBody = `
    <p style="font-size: 16px; margin: 0 0 16px 0; color: #09090b;">
      ${t.body.split("\n\n").map(p =>
        `<p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${p.replace(/\n/g, "<br>")}</p>`
      ).join("")}
    </p>
  `.trim();

  return {
    subject: t.subject,
    text: t.body,
    html: emailShell(htmlBody)
  };
}

// ---------------------------------------------------------------------------
// Chat-answered email — fires when the owner replies via Telegram
// ---------------------------------------------------------------------------

interface ChatAnsweredParams {
  visitorName: string;
  replyText: string;
  language?: string;
}

export function chatAnsweredEmail(params: ChatAnsweredParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { visitorName, replyText, language } = params;
  const lang = (language || "EN").toUpperCase();

  const templates: Record<string, {
    subject: string;
    greeting: string;
    intro: string;
    outro: string;
    signature: string;
  }> = {
    EN: {
      subject: "A25 replied to your message",
      greeting: `Hi ${visitorName},`,
      intro: "We replied to your message:",
      outro: "You can continue the conversation by visiting our site.",
      signature: "— A25 Team"
    },
    MK: {
      subject: "А25 одговори на вашата порака",
      greeting: `Почитуван(а) ${visitorName},`,
      intro: "Ви одговоривме на вашата порака:",
      outro: "Можете да продолжите разговорот на нашата страница.",
      signature: "— Тимот на А25"
    },
    AL: {
      subject: "A25 u përgjigj mesazhit tuaj",
      greeting: `I nderuar ${visitorName},`,
      intro: "Ne i kemi përgjigjur mesazhit tuaj:",
      outro: "Mund të vazhdoni bisedën duke vizituar faqen tonë.",
      signature: "— Ekipi i A25"
    },
    DE: {
      subject: "A25 hat auf Ihre Nachricht geantwortet",
      greeting: `Sehr geehrte(r) ${visitorName},`,
      intro: "Wir haben auf Ihre Nachricht geantwortet:",
      outro: "Sie können das Gespräch auf unserer Website fortsetzen.",
      signature: "— Das A25-Team"
    },
    ES: {
      subject: "A25 ha respondido a su mensaje",
      greeting: `Estimado(a) ${visitorName},`,
      intro: "Hemos respondido a su mensaje:",
      outro: "Puede continuar la conversación visitando nuestro sitio.",
      signature: "— El equipo de A25"
    },
    EL: {
      subject: "Η A25 απάντησε στο μήνυμά σας",
      greeting: `Αγαπητέ/ή ${visitorName},`,
      intro: "Απαντήσαμε στο μήνυμά σας:",
      outro: "Μπορείτε να συνεχίσετε τη συνομιλία επισκεπτόμενοι τον ιστότοπό μας.",
      signature: "— Η ομάδα της A25"
    },
    PL: {
      subject: "A25 odpowiedział(a) na Twoją wiadomość",
      greeting: `Szanowny/a ${visitorName},`,
      intro: "Odpowiedzieliśmy na Twoją wiadomość:",
      outro: "Możesz kontynuować rozmowę, odwiedzając naszą stronę.",
      signature: "— Zespół A25"
    },
    SV: {
      subject: "A25 svarade på ditt meddelande",
      greeting: `Hej ${visitorName},`,
      intro: "Vi svarade på ditt meddelande:",
      outro: "Du kan fortsätta konversationen genom att besöka vår webbplats.",
      signature: "— A25-teamet"
    }
  };

  const t = templates[lang] ?? templates.EN;

  const textBody = `${t.greeting}\n\n${t.intro}\n\n"${replyText}"\n\n${t.outro}\n\n${t.signature}`;

  const htmlContent = `
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${t.greeting}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${t.intro}</p>
    <blockquote style="border-left: 3px solid ${BRAND_BLUE}; margin: 0 0 16px 0; padding-left: 12px; color: #52525b; font-style: italic;">${replyText}</blockquote>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${t.outro}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #27272a;">${t.signature}</p>
  `.trim();

  return {
    subject: t.subject,
    text: textBody,
    html: emailShell(htmlContent)
  };
}
