// A25 "Priority Line" email templates (Phase 8d) — the two emails the
// demand-test flow sends:
//
//   priorityOtpEmail       — the 6-digit code that proves the address is real.
//                            Email is the ONLY OTP channel in this phase (no SMS
//                            provider — see Phase 8h); it reuses the existing
//                            Resend sender, so zero new external dependency.
//   priorityVerifiedEmail  — sent once the code checks out. Carries the
//                            applicationId for the visitor's records and repeats
//                            the honest "not live yet" ending, so the email can
//                            never read as a purchase receipt. Nothing is
//                            charged in this phase.
//
// Visual style is deliberately identical to lib/chatEmailTemplates.ts — same
// `emailShell` (imported, not re-implemented), same brand blue, so all A25
// transactional mail looks like it came from one place.
//
// All 8 supported languages (EN/MK/AL/DE/ES/EL/PL/SV), hand-written per
// language. Language comes from the lead record / Accept-Language detection;
// EN is the fallback only when nothing was detected.

import { emailShell } from "./chatEmailTemplates.js";

const BRAND_BLUE = "#2F2FE4"; // --color-blue-600 from src/index.css

// ---------------------------------------------------------------------------
// OTP code email
// ---------------------------------------------------------------------------

interface PriorityOtpParams {
  firstName: string;
  code: string;
  language?: string;
}

export function priorityOtpEmail(params: PriorityOtpParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { firstName, code, language } = params;
  const lang = (language || "EN").toUpperCase();

  const templates: Record<
    string,
    {
      subject: string;
      greeting: string;
      intro: string;
      codeLabel: string;
      expiry: string;
      ignore: string;
      signature: string;
    }
  > = {
    EN: {
      subject: `${code} is your A25 Priority Line code`,
      greeting: `Hi ${firstName},`,
      intro: "Enter this code on the A25 site to confirm your Priority Line interest:",
      codeLabel: "Your code",
      expiry: "The code is valid for 15 minutes.",
      ignore: "If you didn't ask for this, you can ignore this email — nothing has been registered and nothing has been charged.",
      signature: "— A25 Team"
    },
    MK: {
      subject: `${code} е вашиот код за А25 Приоритетна линија`,
      greeting: `Почитуван(а) ${firstName},`,
      intro: "Внесете го овој код на страницата на А25 за да го потврдите вашиот интерес за Приоритетната линија:",
      codeLabel: "Вашиот код",
      expiry: "Кодот важи 15 минути.",
      ignore: "Ако не сте го побарале ова, можете да ја игнорирате оваа порака — ништо не е регистрирано и ништо не е наплатено.",
      signature: "— Тимот на А25"
    },
    AL: {
      subject: `${code} është kodi juaj për A25 Priority Line`,
      greeting: `I nderuar ${firstName},`,
      intro: "Shkruani këtë kod në faqen e A25 për të konfirmuar interesin tuaj për Priority Line:",
      codeLabel: "Kodi juaj",
      expiry: "Kodi është i vlefshëm për 15 minuta.",
      ignore: "Nëse nuk e kërkuat këtë, thjesht shpërfillni këtë email — nuk është regjistruar asgjë dhe nuk është arkëtuar asgjë.",
      signature: "— Ekipi i A25"
    },
    DE: {
      subject: `${code} ist Ihr Code für die A25 Priority Line`,
      greeting: `Sehr geehrte(r) ${firstName},`,
      intro: "Geben Sie diesen Code auf der A25-Website ein, um Ihr Interesse an der Priority Line zu bestätigen:",
      codeLabel: "Ihr Code",
      expiry: "Der Code ist 15 Minuten gültig.",
      ignore: "Wenn Sie das nicht angefordert haben, ignorieren Sie diese E-Mail einfach — es wurde nichts registriert und nichts berechnet.",
      signature: "— Das A25-Team"
    },
    ES: {
      subject: `${code} es su código de A25 Priority Line`,
      greeting: `Estimado(a) ${firstName},`,
      intro: "Introduzca este código en el sitio de A25 para confirmar su interés en la Priority Line:",
      codeLabel: "Su código",
      expiry: "El código es válido durante 15 minutos.",
      ignore: "Si no ha solicitado esto, puede ignorar este correo: no se ha registrado nada y no se ha cobrado nada.",
      signature: "— El equipo de A25"
    },
    EL: {
      subject: `${code} είναι ο κωδικός σας για την A25 Priority Line`,
      greeting: `Αγαπητέ/ή ${firstName},`,
      intro: "Εισαγάγετε αυτόν τον κωδικό στον ιστότοπο της A25 για να επιβεβαιώσετε το ενδιαφέρον σας για την Priority Line:",
      codeLabel: "Ο κωδικός σας",
      expiry: "Ο κωδικός ισχύει για 15 λεπτά.",
      ignore: "Αν δεν το ζητήσατε εσείς, αγνοήστε αυτό το μήνυμα — δεν καταχωρήθηκε τίποτα και δεν χρεώθηκε τίποτα.",
      signature: "— Η ομάδα της A25"
    },
    PL: {
      subject: `${code} to Twój kod do A25 Priority Line`,
      greeting: `Szanowny/a ${firstName},`,
      intro: "Wpisz ten kod na stronie A25, aby potwierdzić swoje zainteresowanie Priority Line:",
      codeLabel: "Twój kod",
      expiry: "Kod jest ważny 15 minut.",
      ignore: "Jeśli nie prosiłeś/aś o ten kod, po prostu zignoruj tę wiadomość — nic nie zostało zarejestrowane i nic nie zostało pobrane.",
      signature: "— Zespół A25"
    },
    SV: {
      subject: `${code} är din kod till A25 Priority Line`,
      greeting: `Hej ${firstName},`,
      intro: "Ange den här koden på A25:s webbplats för att bekräfta ditt intresse för Priority Line:",
      codeLabel: "Din kod",
      expiry: "Koden är giltig i 15 minuter.",
      ignore: "Om du inte har begärt detta kan du bortse från mejlet — ingenting har registrerats och ingenting har debiterats.",
      signature: "— A25-teamet"
    }
  };

  const t = templates[lang] ?? templates.EN;

  const text = `${t.greeting}\n\n${t.intro}\n\n${code}\n\n${t.expiry}\n\n${t.ignore}\n\n${t.signature}`;

  const html = `
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${t.greeting}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #27272a;">${t.intro}</p>
    <div style="text-align: center; margin: 0 0 20px 0;">
      <p style="margin: 0 0 6px 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa;">${t.codeLabel}</p>
      <p style="display: inline-block; margin: 0; padding: 12px 24px; border: 2px solid ${BRAND_BLUE}; border-radius: 10px; font-family: monospace; font-size: 30px; font-weight: 700; letter-spacing: 8px; color: ${BRAND_BLUE};">${code}</p>
    </div>
    <p style="font-size: 13px; line-height: 1.6; margin: 0 0 12px 0; color: #52525b;">${t.expiry}</p>
    <p style="font-size: 12px; line-height: 1.6; margin: 0 0 16px 0; color: #71717a;">${t.ignore}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #27272a;">${t.signature}</p>
  `.trim();

  return { subject: t.subject, text, html: emailShell(html) };
}

// ---------------------------------------------------------------------------
// Verified confirmation email (carries the applicationId)
// ---------------------------------------------------------------------------

interface PriorityVerifiedParams {
  firstName: string;
  applicationId: string;
  language?: string;
}

export function priorityVerifiedEmail(params: PriorityVerifiedParams): {
  subject: string;
  text: string;
  html: string;
} {
  const { firstName, applicationId, language } = params;
  const lang = (language || "EN").toUpperCase();

  const templates: Record<
    string,
    {
      subject: string;
      greeting: string;
      confirmed: string;
      idLabel: string;
      idNote: string;
      comingSoon: string;
      signature: string;
    }
  > = {
    EN: {
      subject: "Your A25 Priority Line interest is confirmed",
      greeting: `Hi ${firstName},`,
      confirmed: "Your email is confirmed and your interest in the A25 Priority Line is on file.",
      idLabel: "Your application ID",
      idNote: "Keep this ID — quote it if you contact us about the Priority Line.",
      comingSoon: "The Priority Line isn't open yet — we're finishing some technical work on it. Nothing has been charged. We'll email you as soon as it goes live, and people on this list go first.",
      signature: "— A25 Team"
    },
    MK: {
      subject: "Вашиот интерес за А25 Приоритетна линија е потврден",
      greeting: `Почитуван(а) ${firstName},`,
      confirmed: "Вашата е-пошта е потврдена и вашиот интерес за А25 Приоритетната линија е запишан.",
      idLabel: "Вашиот број на пријава",
      idNote: "Задржете го овој број — наведете го ако ни се обратите во врска со Приоритетната линија.",
      comingSoon: "Приоритетната линија сè уште не е отворена — завршуваме дел од техничката работа. Ништо не е наплатено. Ќе ве известиме по е-пошта веднаш штом стане достапна, а луѓето од овој список одат први.",
      signature: "— Тимот на А25"
    },
    AL: {
      subject: "Interesi juaj për A25 Priority Line është konfirmuar",
      greeting: `I nderuar ${firstName},`,
      confirmed: "Email-i juaj është konfirmuar dhe interesi juaj për A25 Priority Line është regjistruar.",
      idLabel: "Numri i aplikimit tuaj",
      idNote: "Mbajeni këtë numër — përmendeni kur të kontaktoni me ne për Priority Line.",
      comingSoon: "Priority Line nuk është hapur ende — po përfundojmë disa punë teknike. Nuk është arkëtuar asgjë. Do t'ju shkruajmë me email sapo të aktivizohet, dhe personat në këtë listë kalojnë të parët.",
      signature: "— Ekipi i A25"
    },
    DE: {
      subject: "Ihr Interesse an der A25 Priority Line ist bestätigt",
      greeting: `Sehr geehrte(r) ${firstName},`,
      confirmed: "Ihre E-Mail-Adresse ist bestätigt und Ihr Interesse an der A25 Priority Line ist vermerkt.",
      idLabel: "Ihre Antragsnummer",
      idNote: "Bewahren Sie diese Nummer auf — nennen Sie sie, wenn Sie uns zur Priority Line schreiben.",
      comingSoon: "Die Priority Line ist noch nicht freigeschaltet — wir schließen gerade technische Arbeiten daran ab. Es wurde nichts berechnet. Wir melden uns per E-Mail, sobald sie startet; wer auf dieser Liste steht, kommt zuerst dran.",
      signature: "— Das A25-Team"
    },
    ES: {
      subject: "Su interés en la A25 Priority Line está confirmado",
      greeting: `Estimado(a) ${firstName},`,
      confirmed: "Su correo está confirmado y su interés en la A25 Priority Line queda registrado.",
      idLabel: "Su número de solicitud",
      idNote: "Guarde este número: indíquelo si nos escribe sobre la Priority Line.",
      comingSoon: "La Priority Line todavía no está abierta: estamos terminando algunos trabajos técnicos. No se ha cobrado nada. Le escribiremos en cuanto esté disponible, y quienes están en esta lista pasan primero.",
      signature: "— El equipo de A25"
    },
    EL: {
      subject: "Το ενδιαφέρον σας για την A25 Priority Line επιβεβαιώθηκε",
      greeting: `Αγαπητέ/ή ${firstName},`,
      confirmed: "Το email σας επιβεβαιώθηκε και το ενδιαφέρον σας για την A25 Priority Line καταχωρήθηκε.",
      idLabel: "Ο αριθμός αίτησής σας",
      idNote: "Κρατήστε αυτόν τον αριθμό — αναφέρετέ τον όταν επικοινωνήσετε μαζί μας για την Priority Line.",
      comingSoon: "Η Priority Line δεν έχει ανοίξει ακόμη — ολοκληρώνουμε κάποιες τεχνικές εργασίες. Δεν χρεώθηκε τίποτα. Θα σας ενημερώσουμε με email μόλις ενεργοποιηθεί, και όσοι βρίσκονται σε αυτή τη λίστα προηγούνται.",
      signature: "— Η ομάδα της A25"
    },
    PL: {
      subject: "Twoje zainteresowanie A25 Priority Line jest potwierdzone",
      greeting: `Szanowny/a ${firstName},`,
      confirmed: "Twój adres e-mail został potwierdzony, a zainteresowanie A25 Priority Line zapisane.",
      idLabel: "Twój numer zgłoszenia",
      idNote: "Zachowaj ten numer — podaj go, jeśli napiszesz do nas w sprawie Priority Line.",
      comingSoon: "Priority Line nie jest jeszcze otwarta — kończymy prace techniczne. Nic nie zostało pobrane. Napiszemy, gdy tylko wystartuje, a osoby z tej listy mają pierwszeństwo.",
      signature: "— Zespół A25"
    },
    SV: {
      subject: "Ditt intresse för A25 Priority Line är bekräftat",
      greeting: `Hej ${firstName},`,
      confirmed: "Din e-postadress är bekräftad och ditt intresse för A25 Priority Line är registrerat.",
      idLabel: "Ditt ansökningsnummer",
      idNote: "Spara numret — ange det om du kontaktar oss om Priority Line.",
      comingSoon: "Priority Line är inte öppen än — vi avslutar en del tekniskt arbete. Ingenting har debiterats. Vi mejlar dig så snart den går live, och de som står på den här listan går först.",
      signature: "— A25-teamet"
    }
  };

  const t = templates[lang] ?? templates.EN;

  const text = `${t.greeting}\n\n${t.confirmed}\n\n${t.idLabel}: ${applicationId}\n${t.idNote}\n\n${t.comingSoon}\n\n${t.signature}`;

  const html = `
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px 0; color: #27272a;">${t.greeting}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; color: #27272a;">${t.confirmed}</p>
    <div style="margin: 0 0 20px 0; padding: 16px; border: 1px solid #e4e4e7; border-left: 3px solid ${BRAND_BLUE}; border-radius: 8px; background-color: #fafafa;">
      <p style="margin: 0 0 6px 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa;">${t.idLabel}</p>
      <p style="margin: 0 0 8px 0; font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: ${BRAND_BLUE};">${applicationId}</p>
      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a;">${t.idNote}</p>
    </div>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; color: #27272a;">${t.comingSoon}</p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #27272a;">${t.signature}</p>
  `.trim();

  return { subject: t.subject, text, html: emailShell(html) };
}
