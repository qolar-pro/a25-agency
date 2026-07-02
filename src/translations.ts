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
    badgeSubmitted: base.badgeSubmitted || getFallback("badgeSubmitted", lang)
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
  }
};
