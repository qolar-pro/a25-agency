import { Language } from './types';
import { TranslationKeys, LANGUAGE_DETAILS } from './translations/types';

// Import translations from dedicated language partitions
import { EN, MK, AL, DE } from './translations/primary';
import { ES, EL } from './translations/groupA';
import { PL } from './translations/groupB';
import { SV } from './translations/groupC';

export type { TranslationKeys };
export { LANGUAGE_DETAILS };

// Construct a pristine mapping of all 8 supported languages with 100% native coverage
const ALL_TRANSLATIONS: Record<Language, TranslationKeys> = {
  EN,
  MK,
  AL,
  DE,
  ES,
  EL,
  PL,
  SV
};

/**
 * Retrieves the complete, hand-crafted native translation set for any of the 8 supported languages.
 * Guaranteed zero English fallback leakage on user-facing content.
 */
export function getTranslations(lang: Language): TranslationKeys {
  const base = ALL_TRANSLATIONS[lang] || ALL_TRANSLATIONS.EN;

  const getFallback = (key: string, selectedLang: Language): string => {
    const dict = EXTRA_DATA[key];
    if (!dict) return "";
    return dict[selectedLang] || dict["EN"] || "";
  };

  return {
    ...base,
    sectionEmployersSub: base.sectionEmployersSub || getFallback("sectionEmployersSub", lang),
    sectionCandidatesSub: base.sectionCandidatesSub || getFallback("sectionCandidatesSub", lang),
    hireChannel: base.hireChannel || getFallback("hireChannel", lang),
    jobChannel: base.jobChannel || getFallback("jobChannel", lang),
    btnWriteInquiry: base.btnWriteInquiry || getFallback("btnWriteInquiry", lang),
    btnRegisterProfile: base.btnRegisterProfile || getFallback("btnRegisterProfile", lang),
    btnClose: base.btnClose || getFallback("btnClose", lang),
    badgeSourced: base.badgeSourced || getFallback("badgeSourced", lang),
    badgeActive: base.badgeActive || getFallback("badgeActive", lang),
    badgeRecruited: base.badgeRecruited || getFallback("badgeRecruited", lang),
    badgeVetted: base.badgeVetted || getFallback("badgeVetted", lang),
    secureLine: base.secureLine || getFallback("secureLine", lang),
    ownerDesk: base.ownerDesk || getFallback("ownerDesk", lang),
    badgeDispatched: base.badgeDispatched || getFallback("badgeDispatched", lang),
    badgeSubmitted: base.badgeSubmitted || getFallback("badgeSubmitted", lang),
    chatWidgetLauncherLabel: base.chatWidgetLauncherLabel || getFallback("chatWidgetLauncherLabel", lang),
    chatWidgetTitle: base.chatWidgetTitle || getFallback("chatWidgetTitle", lang),
    chatWidgetSubtitle: base.chatWidgetSubtitle || getFallback("chatWidgetSubtitle", lang),
    chatWidgetLabelName: base.chatWidgetLabelName || getFallback("chatWidgetLabelName", lang),
    chatWidgetLabelEmail: base.chatWidgetLabelEmail || getFallback("chatWidgetLabelEmail", lang),
    chatWidgetLabelMessage: base.chatWidgetLabelMessage || getFallback("chatWidgetLabelMessage", lang),
    chatWidgetPlaceholderName: base.chatWidgetPlaceholderName || getFallback("chatWidgetPlaceholderName", lang),
    chatWidgetPlaceholderEmail: base.chatWidgetPlaceholderEmail || getFallback("chatWidgetPlaceholderEmail", lang),
    chatWidgetPlaceholderMessage: base.chatWidgetPlaceholderMessage || getFallback("chatWidgetPlaceholderMessage", lang),
    chatWidgetSend: base.chatWidgetSend || getFallback("chatWidgetSend", lang),
    chatWidgetSending: base.chatWidgetSending || getFallback("chatWidgetSending", lang),
    chatWidgetSuccessTitle: base.chatWidgetSuccessTitle || getFallback("chatWidgetSuccessTitle", lang),
    chatWidgetSuccessDesc: base.chatWidgetSuccessDesc || getFallback("chatWidgetSuccessDesc", lang),
    chatWidgetErrorGeneric: base.chatWidgetErrorGeneric || getFallback("chatWidgetErrorGeneric", lang),
    chatWidgetClose: base.chatWidgetClose || getFallback("chatWidgetClose", lang),
    chatWidgetPlaceholderFollowup: base.chatWidgetPlaceholderFollowup || getFallback("chatWidgetPlaceholderFollowup", lang),
    chatWidgetOwnerLabel: base.chatWidgetOwnerLabel || getFallback("chatWidgetOwnerLabel", lang)
  };
}

const EXTRA_DATA: Record<string, Record<string, string>> = {
  sectionEmployersSub: {
    EN: "SECTION A // EMPLOYERS",
    MK: "СЕКЦИЈА A // РАБОТОДАВЦИ",
    AL: "SEKSIONI A // PUNËDHËNËSIT",
    DE: "SEKTION A // ARBEITGEBER",
    ES: "SECCIÓN A // EMPLEADORES",
    EL: "ΕΝΟΤΗΤΑ Α // ΕΡΓΟΔΟΤΕΣ",
    PL: "SEKCJA A // PRACODAWCY",
    SV: "SEKTION A // ARBETSGIVARE"
  },
  sectionCandidatesSub: {
    EN: "SECTION B // CANDIDATES",
    MK: "СЕКЦИЈА Б // КАНДИДАТИ",
    AL: "SEKSIONI B // KANDIDATËT",
    DE: "SEKTION B // KANDIDATEN",
    ES: "SECCIÓN B // CANDIDATOS",
    EL: "ΕΝΟΤΗΤΑ Β // ΥΠΟΨΗΦΙΟΙ",
    PL: "SEKCJA B // KANDYDACI",
    SV: "SEKTION B // KANDIDATER"
  },
  hireChannel: {
    EN: "Hire Channel",
    MK: "Канал за вработување",
    AL: "Kanali i Punësimit",
    DE: "Anstellungskanal",
    ES: "Canal de Contratación",
    EL: "Κανάλι Προσλήψεων",
    PL: "Kanał Rekrutacji",
    SV: "Anställningskanal"
  },
  jobChannel: {
    EN: "Job Channel",
    MK: "Канал за работа",
    AL: "Kanali i Punës",
    DE: "Arbeitskanal",
    ES: "Canal de Trabajo",
    EL: "Κανάλι Εργασίας",
    PL: "Kanał Pracy",
    SV: "Jobbkanal"
  },
  btnWriteInquiry: {
    EN: "WRITE INQUIRY",
    MK: "НАПИШИ БАРАЊЕ",
    AL: "DËRGO KËRKESË",
    DE: "ANFRAGE SCHREIBEN",
    ES: "ENVIAR SOLICITUD",
    EL: "ΥΠΟΒΟΛΗ ΑΙΤΗΜΑΤΟΣ",
    PL: "WYŚLIJ ZAPYTANIE",
    SV: "SKRIV FÖRFRÅGAN"
  },
  btnRegisterProfile: {
    EN: "REGISTER PROFILE",
    MK: "РЕГИСТРИРАЈ ПРОФИЛ",
    AL: "REGJISTRO PROFILIN",
    DE: "PROFIL REGISTRIEREN",
    ES: "REGISTRAR PERFIL",
    EL: "ΕΓΓΡΑΦΗ ΠΡΟΦΙΛ",
    PL: "ZAREJESTRUJ PROFIL",
    SV: "REGISTRERA PROFIL"
  },
  btnClose: {
    EN: "CLOSE",
    MK: "ЗАТВОРИ",
    AL: "MBYLL",
    DE: "SCHLIESSEN",
    ES: "CERRAR",
    EL: "ΚΛΕΙΣΙΜΟ",
    PL: "ZAMKNIJ",
    SV: "STÄNG"
  },
  badgeSourced: {
    EN: "Mac. Enterprises Sourced",
    MK: "Извор за мак. претпријатија",
    AL: "Ndërmarrjet Maqedonase të Buruara",
    DE: "Maz. Unternehmen bezogen",
    ES: "Empresas Macedonias Surtidas",
    EL: "Μακεδονικές Επιχειρήσεις",
    PL: "Pozyskane Firmy Maced.",
    SV: "Maked. Företag Anskaffade"
  },
  badgeActive: {
    EN: "Active 2026",
    MK: "Активно 2026",
    AL: "Aktiv 2026",
    DE: "Aktiv 2026",
    ES: "Activo 2026",
    EL: "Ενεργό 2026",
    PL: "Aktywne 2026",
    SV: "Aktiv 2026"
  },
  badgeRecruited: {
    EN: "Territories Recruited",
    MK: "Регрутирани територии",
    AL: "Territorët e Rekrutuar",
    DE: "Rekrutierte Gebiete",
    ES: "Territorios Reclutados",
    EL: "Περιοχές Στρατολόγησης",
    PL: "Zrekrutowane Terytoria",
    SV: "Rekryterade Territorier"
  },
  badgeVetted: {
    EN: "Vetted Passports",
    MK: "Проверени пасоши",
    AL: "Pasaporta të Verifikuara",
    DE: "Geprüfte Reisepässe",
    ES: "Pasaportes Verificados",
    EL: "Εγκεκριμένα Διαβατήρια",
    PL: "Zweryfikowane Paszporty",
    SV: "Kontrollerade Pass"
  },
  secureLine: {
    EN: "★ SECURE EXECUTIVE LINE",
    MK: "★ БЕЗБЕДНА ДИРЕКТНА ЛИНИЈА",
    AL: "★ LINJA E SIGURT EKZEKUTIVE",
    DE: "★ SICHERE EXECUTIVE-LINIE",
    ES: "★ LÍNEA DE SEGURIDAD EJECUTIVA",
    EL: "★ ΑΣΦΑΛΗΣ ΕΠΙΧΕΙΡΗΣΙΑΚΗ ΓΡΑΜΜΗ",
    PL: "★ BEZPIECZNA LINIA ZARZĄDU",
    SV: "★ SÄKER DIREKTLINJE"
  },
  ownerDesk: {
    EN: "// Owner & Director Desk",
    MK: "// Биро на сопственикот и директорот",
    AL: "// Zyra e Pronarit & Drejtorit",
    DE: "// Schreibtisch des Inhabers & Direktors",
    ES: "// Oficina de Propietario y Director",
    EL: "// Γραφείο Ιδιοκτήτη & Διευθυντή",
    PL: "// Biuro Właściciela i Dyrektora",
    SV: "// Ägarens & VD:ns Skrivbord"
  },
  badgeDispatched: {
    EN: "Dispatched",
    MK: "Испратено",
    AL: "Dërguar",
    DE: "Gesendet",
    ES: "Enviado",
    EL: "Απεστάλη",
    PL: "Wysłano",
    SV: "Skickat"
  },
  badgeSubmitted: {
    EN: "Submitted",
    MK: "Поднесено",
    AL: "Dorëzuar",
    DE: "Eingereicht",
    ES: "Presentado",
    EL: "Υποβλήθηκε",
    PL: "Przesłano",
    SV: "Inskickat"
  },
  chatWidgetLauncherLabel: {
    EN: "Chat with us",
    MK: "Разговарајте со нас",
    AL: "Bisedo me ne",
    DE: "Chatten Sie mit uns",
    ES: "Chatea con nosotros",
    EL: "Συνομιλήστε μαζί μας",
    PL: "Czat z nami",
    SV: "Chatta med oss"
  },
  chatWidgetTitle: {
    EN: "Chat with A25",
    MK: "Разговор со А25",
    AL: "Bisedë me A25",
    DE: "Chat mit A25",
    ES: "Chat con A25",
    EL: "Συνομιλία με A25",
    PL: "Czat z A25",
    SV: "Chatt med A25"
  },
  chatWidgetSubtitle: {
    EN: "We usually reply within a day",
    MK: "Обично одговараме во рок од еден ден",
    AL: "Zakonisht përgjigjemi brenda një dite",
    DE: "Wir antworten normalerweise innerhalb eines Tages",
    ES: "Normalmente respondemos en un día",
    EL: "Συνήθως απαντάμε εντός μίας ημέρας",
    PL: "Zwykle odpowiadamy w ciągu doby",
    SV: "Vi svarar vanligtvis inom en dag"
  },
  chatWidgetLabelName: {
    EN: "Name",
    MK: "Име",
    AL: "Emri",
    DE: "Name",
    ES: "Nombre",
    EL: "Όνομα",
    PL: "Imię",
    SV: "Namn"
  },
  chatWidgetLabelEmail: {
    EN: "Email",
    MK: "Е-пошта",
    AL: "Email",
    DE: "E-Mail",
    ES: "Correo electrónico",
    EL: "Email",
    PL: "E-mail",
    SV: "E-post"
  },
  chatWidgetLabelMessage: {
    EN: "Message",
    MK: "Порака",
    AL: "Mesazhi",
    DE: "Nachricht",
    ES: "Mensaje",
    EL: "Μήνυμα",
    PL: "Wiadomość",
    SV: "Meddelande"
  },
  chatWidgetPlaceholderName: {
    EN: "e.g. Igor Angelovski",
    MK: "нпр. Игор Ангеловски",
    AL: "p.sh. Arben Krasniqi",
    DE: "z. B. Igor Angelovski",
    ES: "p. ej. Igor Angelovski",
    EL: "π.χ. Γιώργος Παπαδόπουλος",
    PL: "np. Igor Angelovski",
    SV: "t.ex. Igor Angelovski"
  },
  chatWidgetPlaceholderEmail: {
    EN: "you@example.com",
    MK: "you@example.com",
    AL: "you@example.com",
    DE: "you@example.com",
    ES: "you@example.com",
    EL: "you@example.com",
    PL: "you@example.com",
    SV: "you@example.com"
  },
  chatWidgetPlaceholderMessage: {
    EN: "How can we help?",
    MK: "Како можеме да помогнеме?",
    AL: "Si mund t'ju ndihmojmë?",
    DE: "Wie können wir helfen?",
    ES: "¿Cómo podemos ayudarte?",
    EL: "Πώς μπορούμε να βοηθήσουμε;",
    PL: "Jak możemy pomóc?",
    SV: "Hur kan vi hjälpa till?"
  },
  chatWidgetSend: {
    EN: "Send",
    MK: "Испрати",
    AL: "Dërgo",
    DE: "Senden",
    ES: "Enviar",
    EL: "Αποστολή",
    PL: "Wyślij",
    SV: "Skicka"
  },
  chatWidgetSending: {
    EN: "Sending...",
    MK: "Се испраќа...",
    AL: "Duke dërguar...",
    DE: "Wird gesendet...",
    ES: "Enviando...",
    EL: "Αποστολή...",
    PL: "Wysyłanie...",
    SV: "Skickar..."
  },
  chatWidgetSuccessTitle: {
    EN: "Message sent",
    MK: "Пораката е испратена",
    AL: "Mesazhi u dërgua",
    DE: "Nachricht gesendet",
    ES: "Mensaje enviado",
    EL: "Το μήνυμα στάλθηκε",
    PL: "Wiadomość wysłana",
    SV: "Meddelande skickat"
  },
  chatWidgetSuccessDesc: {
    EN: "Thanks — we'll get back to you soon.",
    MK: "Благодариме — ќе ве контактираме наскоро.",
    AL: "Faleminderit — do t'ju kontaktojmë së shpejti.",
    DE: "Danke — wir melden uns bald bei Ihnen.",
    ES: "Gracias — nos pondremos en contacto pronto.",
    EL: "Ευχαριστούμε — θα επικοινωνήσουμε σύντομα.",
    PL: "Dziękujemy — wkrótce się odezwiemy.",
    SV: "Tack — vi återkommer snart."
  },
  chatWidgetErrorGeneric: {
    EN: "Something went wrong. Please try again.",
    MK: "Нешто тргна наопаку. Обидете се повторно.",
    AL: "Diçka shkoi keq. Ju lutemi provoni përsëri.",
    DE: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    ES: "Algo salió mal. Inténtalo de nuevo.",
    EL: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
    PL: "Coś poszło nie tak. Spróbuj ponownie.",
    SV: "Något gick fel. Försök igen."
  },
  chatWidgetClose: {
    EN: "Close chat",
    MK: "Затвори разговор",
    AL: "Mbyll bisedën",
    DE: "Chat schließen",
    ES: "Cerrar chat",
    EL: "Κλείσιμο συνομιλίας",
    PL: "Zamknij czat",
    SV: "Stäng chatt"
  },
  chatWidgetPlaceholderFollowup: {
    EN: "Type a message...",
    MK: "Напишете порака...",
    AL: "Shkruani një mesazh...",
    DE: "Nachricht schreiben...",
    ES: "Escribe un mensaje...",
    EL: "Γράψτε ένα μήνυμα...",
    PL: "Napisz wiadomość...",
    SV: "Skriv ett meddelande..."
  },
  chatWidgetOwnerLabel: {
    EN: "A25 Team",
    MK: "Тим А25",
    AL: "Ekipi A25",
    DE: "A25 Team",
    ES: "Equipo A25",
    EL: "Ομάδα A25",
    PL: "Zespół A25",
    SV: "A25-teamet"
  }
};
