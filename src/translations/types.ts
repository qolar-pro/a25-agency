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
  sectorsSectionLabel?: string;
  sectorsSectionTitle?: string;
  moreComingSoon?: string;
  readMore?: string;
  industryDescConstruction?: string;
  industryDescHospitality?: string;
  industryDescAgriculture?: string;
  industryDescManufacturing?: string;
  industryDescGeneric?: string;
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
  chatWidgetLauncherLabel?: string;
  chatWidgetTitle?: string;
  chatWidgetSubtitle?: string;
  chatWidgetLabelName?: string;
  chatWidgetLabelEmail?: string;
  chatWidgetLabelMessage?: string;
  chatWidgetPlaceholderName?: string;
  chatWidgetPlaceholderEmail?: string;
  chatWidgetPlaceholderMessage?: string;
  chatWidgetSend?: string;
  chatWidgetSending?: string;
  chatWidgetSuccessTitle?: string;
  chatWidgetSuccessDesc?: string;
  chatWidgetErrorGeneric?: string;
  chatWidgetClose?: string;
  chatWidgetPlaceholderFollowup?: string;
  chatWidgetOwnerLabel?: string;
  chatWidgetResumePrompt?: string;
  chatWidgetResumeDesc?: string;
  chatWidgetResumeFind?: string;
  chatWidgetResumeNew?: string;
  chatWidgetResumeSearching?: string;
  chatWidgetResumeNotFound?: string;
  chatWidgetReassurance?: string;
  // Phase 7f — hero process-facts stats row. Process facts only (true today),
  // never volume/traction numbers — A25 hasn't launched (see CLAUDE.md
  // "Hero stats — do not add invented numbers").
  statProcessValue?: string;
  statProcessLabel?: string;
  statSourceValue?: string;
  statSourceLabel?: string;
  statIndustriesValue?: string;
  statIndustriesLabel?: string;
  statLaunchValue?: string;
  statLaunchLabel?: string;
}

export const LANGUAGE_DETAILS: Record<Language, { label: string; flag: string; native: string }> = {
  EN: { label: "English", flag: "🇬🇧", native: "English" },
  MK: { label: "Macedonian", flag: "🇲🇰", native: "Македонски" },
  AL: { label: "Albanian", flag: "🇦🇱", native: "Shqip" },
  DE: { label: "German", flag: "🇩🇪", native: "Deutsch" },
  ES: { label: "Spanish", flag: "🇪🇸", native: "Español" },
  EL: { label: "Greek", flag: "🇬🇷", native: "Ελληνικά" },
  PL: { label: "Polish", flag: "🇵🇱", native: "Polski" },
  SV: { label: "Swedish", flag: "🇸🇪", native: "Svenska" }
};
