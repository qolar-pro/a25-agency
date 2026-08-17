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
  // Phase 8f — "Priority Line" demand test (homepage section + 3-step modal).
  // These are REQUIRED, not optional: they're written out per language in
  // primary.ts (EN/MK/AL/DE), groupA.ts (ES/EL), groupB.ts (PL) and
  // groupC.ts (SV), so a missing translation is a type error rather than an
  // English string silently leaking into another language at runtime. New keys
  // deliberately do NOT go through the EXTRA_DATA/getFallback shim in
  // src/translations.ts — that mechanism is legacy (it already carries one
  // never-read entry) and shouldn't be grown.
  //
  // Copy rule for this set: nothing may read as a completed purchase. The
  // feature is not live, nothing is charged — the pitch is honest and so is
  // the ending (see Phase 8's ground-truth note in a25-claude-code-prompt.md).
  priorityEyebrow: string;
  priorityTitle: string;
  priorityPitch: string;
  priorityBullet1: string;
  priorityBullet2: string;
  priorityBullet3: string;
  // VIP benefit grid — replaced the old three-bullet row when the section was
  // rebuilt around the fuller Priority Line copy. priorityBullet1-3 above are
  // now unreferenced in app code; they are kept (translated, in all 8 files)
  // rather than deleted because the old three-bullet framing is still the
  // honest short summary of the offer and is worth having on hand for the
  // confirmation emails. Delete them together, across all 8, if that changes.
  priorityFeaturesIntro: string;
  priorityFeature1Title: string;
  priorityFeature1Desc: string;
  priorityFeature2Title: string;
  priorityFeature2Desc: string;
  priorityFeature3Title: string;
  priorityFeature3Desc: string;
  priorityFeature4Title: string;
  priorityFeature4Desc: string;
  priorityFeature5Title: string;
  priorityFeature5Desc: string;
  priorityValueLine: string;
  // Collapsible terms. These are the honest limits of a paid service — they
  // must stay present and translated, never quietly dropped for layout.
  priorityLegalTitle: string;
  priorityLegal1: string;
  priorityLegal2: string;
  priorityPrice: string;
  priorityPriceNote: string;
  priorityCta: string;
  priorityCtaNote: string;
  priorityFormTitle: string;
  priorityFormIntro: string;
  priorityLabelFirstName: string;
  priorityLabelSurname: string;
  priorityLabelEmail: string;
  priorityLabelCountry: string;
  priorityLabelProfession: string;
  priorityProfessionPlaceholder: string;
  priorityProfessionOther: string;
  priorityLabelPassport: string;
  priorityPassportNone: string;
  priorityPassportPassport: string;
  priorityPassportBiometric: string;
  priorityLabelWhatsapp: string;
  priorityOptional: string;
  priorityFormSubmit: string;
  priorityFormSubmitting: string;
  priorityFormError: string;
  priorityOtpTitle: string;
  // Carries a literal "{email}" token the modal substitutes at render time —
  // the translation set is flat strings, so interpolation happens in the UI.
  priorityOtpDesc: string;
  priorityOtpLabel: string;
  priorityOtpVerify: string;
  priorityOtpVerifying: string;
  priorityOtpBack: string;
  priorityOtpErrorExpired: string;
  priorityOtpErrorWrong: string;
  priorityOtpErrorTooMany: string;
  priorityDoneTitle: string;
  priorityDoneBody: string;
  priorityDoneIdLabel: string;
  priorityBtnClose: string;
  priorityBtnContinue: string;
}

/**
 * Type for the LEGACY, never-imported language sets that still sit in
 * groupA/groupB/groupC.ts (IT, FR, PT, RO, SR, BG, HR, RU, SL, NL, HU, TR, AR,
 * HI, ZH, JA, KO). Only 8 languages are supported and wired up in
 * src/translations.ts — EN/MK/AL/DE/ES/EL/PL/SV — and per CLAUDE.md that set of
 * 8 is the source of truth; these leftovers must NOT be extended to match every
 * new feature's copy.
 *
 * They're typed as a partial set so that adding a required key to
 * `TranslationKeys` (as Phase 8f does) is a type error only where it matters —
 * in the 8 real languages — instead of demanding 17 translations nobody reads.
 * Nothing imports these exports; deleting them is a separate cleanup.
 */
export type PartialTranslationKeys = Partial<TranslationKeys>;

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
