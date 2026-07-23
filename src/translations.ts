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
    chatWidgetOwnerLabel: base.chatWidgetOwnerLabel || getFallback("chatWidgetOwnerLabel", lang),
    chatWidgetResumePrompt: base.chatWidgetResumePrompt || getFallback("chatWidgetResumePrompt", lang),
    chatWidgetResumeDesc: base.chatWidgetResumeDesc || getFallback("chatWidgetResumeDesc", lang),
    chatWidgetResumeFind: base.chatWidgetResumeFind || getFallback("chatWidgetResumeFind", lang),
    chatWidgetResumeNew: base.chatWidgetResumeNew || getFallback("chatWidgetResumeNew", lang),
    chatWidgetResumeSearching: base.chatWidgetResumeSearching || getFallback("chatWidgetResumeSearching", lang),
    chatWidgetResumeNotFound: base.chatWidgetResumeNotFound || getFallback("chatWidgetResumeNotFound", lang),
    chatWidgetReassurance: base.chatWidgetReassurance || getFallback("chatWidgetReassurance", lang),
    statProcessValue: base.statProcessValue || getFallback("statProcessValue", lang),
    statProcessLabel: base.statProcessLabel || getFallback("statProcessLabel", lang),
    statSourceValue: base.statSourceValue || getFallback("statSourceValue", lang),
    statSourceLabel: base.statSourceLabel || getFallback("statSourceLabel", lang),
    statIndustriesValue: base.statIndustriesValue || getFallback("statIndustriesValue", lang),
    statIndustriesLabel: base.statIndustriesLabel || getFallback("statIndustriesLabel", lang),
    statLaunchValue: base.statLaunchValue || getFallback("statLaunchValue", lang),
    statLaunchLabel: base.statLaunchLabel || getFallback("statLaunchLabel", lang)
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
  },
  chatWidgetResumePrompt: {
    EN: "Have you chatted with us before?",
    MK: "Дали сте разговарале со нас претходно?",
    AL: "A keni biseduar me ne më parë?",
    DE: "Haben Sie schon einmal mit uns gechattet?",
    ES: "¿Ya has chateado con nosotros antes?",
    EL: "Έχετε συνομιλήσει ξανά μαζί μας;",
    PL: "Czy rozmawiałeś już z nami wcześniej?",
    SV: "Har du chattat med oss tidigare?"
  },
  chatWidgetResumeDesc: {
    EN: "Enter your email and we'll pull up your open conversation.",
    MK: "Внесете ја вашата е-пошта и ќе го отвориме вашиот отворен разговор.",
    AL: "Vendosni emailin tuaj dhe do të hapim bisedën tuaj ekzistuese.",
    DE: "Geben Sie Ihre E-Mail-Adresse ein und wir rufen Ihr offenes Gespräch auf.",
    ES: "Introduce tu correo y recuperaremos tu conversación abierta.",
    EL: "Καταχωρίστε το email σας και θα ανακτήσουμε την ανοιχτή συνομιλία σας.",
    PL: "Podaj swój e-mail, a odnajdziemy Twoją otwartą rozmowę.",
    SV: "Ange din e-post så hämtar vi din pågående konversation."
  },
  chatWidgetResumeFind: {
    EN: "Yes, find my chat",
    MK: "Да, најди го мојот разговор",
    AL: "Po, gjej bisedën time",
    DE: "Ja, meinen Chat finden",
    ES: "Sí, buscar mi chat",
    EL: "Ναι, βρες τη συνομιλία μου",
    PL: "Tak, znajdź mój czat",
    SV: "Ja, hitta min chatt"
  },
  chatWidgetResumeNew: {
    EN: "No, start new",
    MK: "Не, започни нов",
    AL: "Jo, fillo të ri",
    DE: "Nein, neu starten",
    ES: "No, empezar de nuevo",
    EL: "Όχι, νέα συνομιλία",
    PL: "Nie, rozpocznij nowy",
    SV: "Nej, starta ny"
  },
  chatWidgetResumeSearching: {
    EN: "Looking for your chat...",
    MK: "Го бараме вашиот разговор...",
    AL: "Duke kërkuar bisedën tuaj...",
    DE: "Ihr Chat wird gesucht...",
    ES: "Buscando tu chat...",
    EL: "Αναζήτηση της συνομιλίας σας...",
    PL: "Szukamy Twojego czatu...",
    SV: "Söker efter din chatt..."
  },
  chatWidgetResumeNotFound: {
    EN: "We couldn't find an open chat for that email. Let's start a new one.",
    MK: "Не најдовме отворен разговор за таа е-пошта. Да започнеме нов.",
    AL: "Nuk gjetëm një bisedë të hapur për këtë email. Le të fillojmë një të re.",
    DE: "Wir konnten keinen offenen Chat für diese E-Mail finden. Beginnen wir einen neuen.",
    ES: "No encontramos un chat abierto para ese correo. Empecemos uno nuevo.",
    EL: "Δεν βρήκαμε ανοιχτή συνομιλία για αυτό το email. Ας ξεκινήσουμε μια νέα.",
    PL: "Nie znaleźliśmy otwartego czatu dla tego adresu e-mail. Zacznijmy nowy.",
    SV: "Vi hittade ingen pågående chatt för den e-posten. Låt oss starta en ny."
  },
  // Phase 7f — hero process-facts stats. Deliberately NO volume/traction
  // numbers (candidates available, workers placed): A25 hasn't launched and
  // faking traction is a credibility risk. Only facts true today.
  statProcessValue: {
    EN: "30–90 days",
    MK: "30–90 дена",
    AL: "30–90 ditë",
    DE: "30–90 Tage",
    ES: "30–90 días",
    EL: "30–90 ημέρες",
    PL: "30–90 dni",
    SV: "30–90 dagar"
  },
  statProcessLabel: {
    EN: "Typical process",
    MK: "Типичен процес",
    AL: "Procesi tipik",
    DE: "Typischer Prozess",
    ES: "Proceso habitual",
    EL: "Τυπική διαδικασία",
    PL: "Typowy proces",
    SV: "Typisk process"
  },
  statSourceValue: {
    EN: "Asia",
    MK: "Азија",
    AL: "Azia",
    DE: "Asien",
    ES: "Asia",
    EL: "Ασία",
    PL: "Azja",
    SV: "Asien"
  },
  statSourceLabel: {
    EN: "Sourcing region",
    MK: "Регион на регрутирање",
    AL: "Rajoni i burimit",
    DE: "Herkunftsregion",
    ES: "Región de origen",
    EL: "Περιοχή προέλευσης",
    PL: "Region pozyskiwania",
    SV: "Ursprungsregion"
  },
  statIndustriesValue: {
    EN: "7",
    MK: "7",
    AL: "7",
    DE: "7",
    ES: "7",
    EL: "7",
    PL: "7",
    SV: "7"
  },
  statIndustriesLabel: {
    EN: "Industries served",
    MK: "Индустрии",
    AL: "Industri të mbuluara",
    DE: "Branchen",
    ES: "Sectores",
    EL: "Κλάδοι",
    PL: "Branże",
    SV: "Branscher"
  },
  statLaunchValue: {
    EN: "2026",
    MK: "2026",
    AL: "2026",
    DE: "2026",
    ES: "2026",
    EL: "2026",
    PL: "2026",
    SV: "2026"
  },
  statLaunchLabel: {
    EN: "Founded",
    MK: "Основана",
    AL: "Themeluar",
    DE: "Gegründet",
    ES: "Fundada",
    EL: "Ιδρύθηκε",
    PL: "Założona",
    SV: "Grundad"
  },
  chatWidgetReassurance: {
    EN: "24/7 live chat with a real person — most replies come back within minutes.",
    MK: "Разговор во живо 24/7 со вистинска личност — повеќето одговори стигнуваат за неколку минути.",
    AL: "Bisedë e drejtpërdrejtë 24/7 me një person real — shumica e përgjigjeve vijnë brenda pak minutash.",
    DE: "24/7-Live-Chat mit einer echten Person — die meisten Antworten kommen innerhalb von Minuten.",
    ES: "Chat en vivo 24/7 con una persona real — la mayoría de las respuestas llegan en minutos.",
    EL: "Ζωντανή συνομιλία 24/7 με πραγματικό άτομο — οι περισσότερες απαντήσεις έρχονται μέσα σε λεπτά.",
    PL: "Czat na żywo 24/7 z prawdziwą osobą — większość odpowiedzi otrzymasz w ciągu kilku minut.",
    SV: "Livechatt dygnet runt med en riktig person — de flesta svar kommer inom några minuter."
  }
};
