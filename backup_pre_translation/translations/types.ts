import { Language } from '../types';

export interface TranslationKeys {
  brand: string;
  slogan: string;
  tagline: string;
  badge: string;
  forEmployersTitle: string;
  forEmployersSub: string;
  forEmployersDesc: string;
  employersBullet1: string;
  employersBullet2: string;
  employersBullet3: string;
  employersBullet4?: string;
  forCandidatesTitle: string;
  forCandidatesSub: string;
  forCandidatesDesc: string;
  candidatesBullet1: string;
  candidatesBullet2: string;
  candidatesBullet3: string;
  toggleTitle: string;
  toggleSub: string;
  btnEmployer: string;
  btnCandidate: string;
  formTitleEmployer: string;
  formTitleCandidate: string;
  labelFullName: string;
  labelCompanyName: string;
  labelEmail: string;
  labelPhone: string;
  labelSector: string;
  labelCountry: string;
  labelExperience: string;
  labelPassport: string;
  labelNotes: string;
  placeholderNameEmp: string;
  placeholderCompanyEmp: string;
  placeholderEmailEmp: string;
  placeholderNotesEmp: string;
  placeholderNameCand: string;
  placeholderEmailCand: string;
  placeholderNotesCand: string;
  btnSend: string;
  sending: string;
  successTitle: string;
  successText: string;
  calcTitle: string;
  calcSub: string;
  calcFieldWorkers: string;
  calcFieldLead: string;
  calcFieldCompliance: string;
  calcHigh: string;
  calcStandard: string;
  ledgerTitle: string;
  ledgerSub: string;
  ledgerPlaceholder: string;
  ledgerBadgeClient: string;
  ledgerBadgeCand: string;
  ledgerOrigin: string;
  heroBadge: string;
  heroDesc: string;
  execDeskDesc: string;
  lookingToHire: string;
  lookingToHireDesc: string;
  btnWriteAnother: string;
  labelNameReq: string;
  labelCompanyReq: string;
  optConstruction: string;
  optHospitality: string;
  optAgriculture: string;
  optManufacturing: string;
  optGeneric?: string;
  lookingForWork: string;
  lookingForWorkDesc: string;
  labelNameCand: string;
  optKosovo: string;
  optAlbania: string;
  optSerbia: string;
  labelYearsOfExp: string;
  labelBiometricPass: string;
  optYes: string;
  optNo: string;
  directLine: string;
  simulatedMessage: string;
  sectionEmployersSub?: string;
  sectionCandidatesSub?: string;
  hireChannel?: string;
  jobChannel?: string;
  btnWriteInquiry?: string;
  btnRegisterProfile?: string;
  btnClose?: string;
  badgeSourced?: string;
  badgeActive?: string;
  badgeRecruited?: string;
  badgeVetted?: string;
  secureLine?: string;
  ownerDesk?: string;
  badgeDispatched?: string;
  badgeSubmitted?: string;
}

export const LANGUAGE_DETAILS: Record<Language, { label: string; flag: string; native: string }> = {
  EN: { label: "English", flag: "🇬🇧", native: "English" },
  MK: { label: "Macedonian", flag: "🇲🇰", native: "Македонски" },
  AL: { label: "Albanian", flag: "🇦🇱", native: "Shqip" },
  DE: { label: "German", flag: "🇩🇪", native: "Deutsch" },
  IT: { label: "Italian", flag: "🇮🇹", native: "Italiano" },
  TR: { label: "Turkish", flag: "🇹🇷", native: "Türkçe" },
  SR: { label: "Serbian", flag: "🇷🇸", native: "Српски" },
  BG: { label: "Bulgarian", flag: "🇧🇬", native: "Български" },
  HR: { label: "Croatian", flag: "🇭🇷", native: "Hrvatski" },
  ES: { label: "Spanish", flag: "🇪🇸", native: "Español" },
  FR: { label: "French", flag: "🇫🇷", native: "Français" },
  RU: { label: "Russian", flag: "🇷🇺", native: "Русский" },
  EL: { label: "Greek", flag: "🇬🇷", native: "Ελληνικά" },
  RO: { label: "Romanian", flag: "🇷🇴", native: "Română" },
  PL: { label: "Polish", flag: "🇵🇱", native: "Polski" },
  NL: { label: "Dutch", flag: "🇳🇱", native: "Nederlands" },
  SL: { label: "Slovenian", flag: "🇸🇮", native: "Slovenščina" },
  HU: { label: "Hungarian", flag: "🇭🇺", native: "Magyar" },
  AR: { label: "Arabic", flag: "🇸🇦", native: "العربية" },
  HI: { label: "Hindi", flag: "🇮🇳", native: "हिन्दी" },
  ZH: { label: "Chinese", flag: "🇨🇳", native: "中文" },
  PT: { label: "Portuguese", flag: "🇵🇹", native: "Português" },
  JA: { label: "Japanese", flag: "🇯🇵", native: "日本語" },
  KO: { label: "Korean", flag: "🇰🇷", native: "한국어" },
  SV: { label: "Swedish", flag: "🇸🇪", native: "Svenska" }
};
