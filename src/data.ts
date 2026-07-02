import { Language, Sector, RoadmapStep } from './types';

// Helper to expand partial language translations into full Record<Language, T>
function extendToAllLanguages<T>(partial: { EN: T; MK?: T; AL?: T }): Record<Language, T> {
  const allLanguages: Language[] = [
    'EN', 'MK', 'AL', 'DE', 'ES', 'EL', 'PL', 'SV'
  ];
  return allLanguages.reduce((acc, lang) => {
    acc[lang] = (partial as any)[lang] || partial.EN;
    return acc;
  }, {} as Record<Language, T>);
}

const baseTranslations: Record<'EN' | 'MK' | 'AL', Record<string, string>> = {
  EN: {
    navSectors: 'SECTORS [01]',
    navRoadmap: 'ROADMAP [02]',
    navDualPath: 'CHANNELS [03]',
    navInquiries: 'LOGS [04]',
    agencySub: 'VANGUARD BALKAN / WORKFORCE PLACEMENT',
    heroLine1: 'THE PRECISE',
    heroLine2: 'CROSS-BORDER',
    heroLine3: 'WORKFORCE FORCE',
    heroTagline: 'Engineering high-velocity labor supply pipelines from the Southern Balkan corridors direct to North Macedonian enterprise. Legal, bulletproof, and optimized for scale.',
    requestWorkforce: 'REQUEST WORKFORCE SUPPLY [→]',
    applyPlacement: 'APPLY FOR PLACEMENT [↗]',
    forCorporates: 'FOR CLIENTS / MACEDONIAN ENTERPRISE',
    forCandidates: 'FOR CANDIDATES / BALKAN WORKERS',
    clientFocusTitle: 'DEPLOY ON-DEMAND CAPACITY',
    clientFocusDesc: 'Tackle core structural labor shortages with a vetted workforce trained in intensive logistics, industrial processing, and high-standard construction.',
    candidateFocusTitle: 'LEGAL BORDERLESS CAREER TRANSIT',
    candidateFocusDesc: 'Step into registered, safe employment with reliable corporate contracts in North Macedonia. Guaranteed housing, direct legal transit, and insurance.',
    duration: 'Duration',
    months: 'months',
    workers: 'workers',
    estimatedSavings: 'Estimated Overhead Savings',
    onboardingTimeline: 'Deployment Speed',
    days: 'Days',
    submit: 'Submit Request',
    successTitle: 'TRANSMITTED SECURELY',
    successDesc: 'Your request has bypassed standard filters and is now queued with our managing partners. Expected contact window is 2 hours.',
    close: 'CLOSE [ESC]',
    sectorHeader: 'CAPABILITY MATRIX',
    roadmapHeader: 'CROSS-BORDER WORKFLOW PROTOCOL',
    roadmapSubtitle: 'The legal transit pipeline is certified by regional bilateral treaties. Safe, secure, and compliant from recruitment to site deployment.',
    sectorDetailsText: 'EXPLORE CAPABILITY',
    calculatorTitle: 'ESTIMATE SAVINGS PROTOCOL',
    calculatorSubtitle: 'Configure operational scale to project overhead optimization and real-time deployment velocity.',
    activeApplications: 'ACTIVE SUBMISSIONS',
    noSubmissions: 'No logged requests in this local session. Submit a request using the CTAs above to populate.',
    logTypeCompany: 'Client Request',
    logTypeCandidate: 'Candidate App',
    applyPlaceholderName: 'Candidate Full Name',
    companyPlaceholderName: 'Enterprise Legal Entity',
    emailLabel: 'Direct Secure Email',
    phoneLabel: 'Secure Contact Phone (WhatsApp/Viber)',
    notesLabel: 'Operational Notes / Custom Demands',
    sectorTitle: 'Sector Category',
    hasPassportLabel: 'Biometric Passport Holder',
    experienceYearsLabel: 'Experience in relative sector (Years)',
    urgencyLabel: 'Response Priority',
    immediate: 'CRITICAL (0-15 Days)',
    medium: 'STANDARD (15-45 Days)',
    planning: 'STRATEGIC PLACEMENT (>45 Days)',
    yes: 'Yes, fully biometric',
    no: 'Passport in process / No',
    successAppDesc: 'Your professional credentials have been compiled into our regional talent registry. Case reference issued.',
    benefitHousing: 'Guaranteed fully compliant modern housing blocks',
    benefitTravel: 'Paid direct roundtrip transit and border passes',
    benefitContracts: '100% legal bilateral contracts with healthcare'
  },
  MK: {
    navSectors: 'СЕКТОРИ [01]',
    navRoadmap: 'ПАТЕКА [02]',
    navDualPath: 'КАНАЛИ [03]',
    navInquiries: 'ЛОГОВИ [04]',
    agencySub: 'ВАНГАРД БАЛКАН / РЕГРУТИРАЊЕ НА РАБОТНА СИЛА',
    heroLine1: 'ПРЕЦИЗНА',
    heroLine2: 'ЧОВЕЧКА СИЛА',
    heroLine3: 'ПРЕКУ ГРАНИЦИТЕ',
    heroTagline: 'Инженеринг на брзи и сигурни канали за испорака на работна сила од јужните балкански коридори директно до претпријатијата во Македонија. Легално, сигурно и оптимизирано за раст.',
    requestWorkforce: 'ПОБАРАЈ РАБОТНА СИЛА [→]',
    applyPlacement: 'АПЛИЦИРАЈ ЗА РАБОТА [↗]',
    forCorporates: 'ЗА КЛИЕНТИ / МАКЕДОНСКИ КОМПАНИИ',
    forCandidates: 'ЗА КАНДИДАТИ / БАЛКАНСКИ РАБОТНИЦИ',
    clientFocusTitle: 'АНГАЖИРАЈТЕ КАПАЦИТЕТ НА БАРАЊЕ',
    clientFocusDesc: 'Решете ги структурните недостатоци на работна сила со проверени кадри обучени за интензивна логистика, индустриско производство и градежништво со висок стандард.',
    candidateFocusTitle: 'ЛЕГАЛЕН И БЕЗБЕДЕН ТРАНЗИТИТ',
    candidateFocusDesc: 'Влезете во регистриран, безбеден работен однос со сигурни корпоративни договори во Македонија. Гарантирано сместување, законски премин и осигурување.',
    duration: 'Времетраење',
    months: 'месеци',
    workers: 'работници',
    estimatedSavings: 'Проценета заштеда на трошоци',
    onboardingTimeline: 'Брзина на распоредување',
    days: 'Дена',
    submit: 'Поднеси барање',
    successTitle: 'КАНАЛОТ Е СИГУРНО ИСПРАТЕН',
    successDesc: 'Вашето барање ги помина стандардните филтри и е во ред со нашите управни партнери. Време на одговор: до 2 часа.',
    close: 'ЗАТВОРИ [ESC]',
    sectorHeader: 'МАТРИЦА НАСПОСОБНОСТИ',
    roadmapHeader: 'ПРОТОКОЛ ЗА ПРЕКУГРАНИЧЕН ТРАНЗИТ',
    roadmapSubtitle: 'Патеката за легален транзит е сертифицирана со регионални билатерални договори. Безбедно, заштитено и усогласено од регрутирање до распоредување на терен.',
    sectorDetailsText: 'ИСТРАЖИ ГИ МОЖНОСТИТЕ',
    calculatorTitle: 'ПРОТОКОЛ ЗА ПРОЦЕНКА НА ЗАШТЕДА',
    calculatorSubtitle: 'Конфигурирајте го оперативниот обем за да ја проектирате оптимизацијата на трошоците и брзината на распоредување.',
    activeApplications: 'АКТИВНИ БАРАЊА',
    noSubmissions: 'Нема зачувани активности во оваа локална сесија. Поднесете барање за да генерирате податоци.',
    logTypeCompany: 'Барање на Клиент',
    logTypeCandidate: 'Апликација за работа',
    applyPlaceholderName: 'Целосно име на кандидат',
    companyPlaceholderName: 'Правен ентитет на претпријатието',
    emailLabel: 'Директна сигурна е-пошта',
    phoneLabel: 'Контакт телефон (WhatsApp/Viber)',
    notesLabel: 'Оперативни белешки / Специфични барања',
    sectorTitle: 'Сектор / Категорија',
    hasPassportLabel: 'Поседување биометриски пасош',
    experienceYearsLabel: 'Искуство во соодветниот сектор (Години)',
    urgencyLabel: 'Приоритет за одговор',
    immediate: 'КРИТИЧНО (0-15 Дена)',
    medium: 'СТАНДАРДНО (15-45 Дена)',
    planning: 'СТРАТЕШКО ПЛАНИРАЊЕ (>45 Дена)',
    yes: 'Да, целосно биометриски',
    no: 'Пасошот е во процедура / Не',
    successAppDesc: 'Вашите професионални квалификации се внесени во нашиот регионален регистар. Издадена е референца за предметот.',
    benefitHousing: 'Гарантирано сместување во соодветни модерни блокови',
    benefitTravel: 'Платен директен повратен транзит и гранични пропусници',
    benefitContracts: '100% легални билатерални договори со здравствено осигурување'
  },
  AL: {
    navSectors: 'SEKTORËT [01]',
    navRoadmap: 'UDHËRRËFYESI [02]',
    navDualPath: 'KANALET [03]',
    navInquiries: 'LOGET [04]',
    agencySub: 'VANGUARD BALKAN / REKRUTIMI I KRAHUT TË PUNËS',
    heroLine1: 'FORCA E PRECIZË',
    heroLine2: 'E PUNËS',
    heroLine3: 'NDËRKUFITARE',
    heroTagline: 'Inxhinieria e kanaleve të shpejta të furnizimit me krah pune nga korridoret e Ballkanit Jugor direkt në ndërmarrjet e Maqedonisë së Veriut. Ligjore, e blinduar dhe e optimizuar për rritje.',
    requestWorkforce: 'KËRKO FURNIZIM ME PUNËTORË [→]',
    applyPlacement: 'APLIKO PËR VEND PUNE [↗]',
    forCorporates: 'PËR KLIENTËT / NDËRMARRJET MAQEDONASE',
    forCandidates: 'PËR KANDIDATËT / PUNËTORËT BALLKANIKË',
    clientFocusTitle: 'VENDOS KAPACITETIN SIPAS KËRKESËS',
    clientFocusDesc: 'Zgjidhni mungesat strukturore të fuqisë punëtore me krah pune të verifikuar e të trajnuar në logjistikë, procese industriale dhe ndërtim të standardeve të larta.',
    candidateFocusTitle: 'TRANZIT LIGJOR DHE I SIGURT KUFITAR',
    candidateFocusDesc: 'Hyni në punësim të regjistruar dhe të sigurt me kontrata të besueshme korporative në Maqedoninë e Veriut. Akomodim i garantuar, tranzit ligjor dhe sigurim shëndetësor.',
    duration: 'Kohëzgjatja',
    months: 'muaj',
    workers: 'punëtorë',
    estimatedSavings: 'Kursimet e Vlerësuara',
    onboardingTimeline: 'Shpejtësia e Vendosjes',
    days: 'Ditë',
    submit: 'Dërgo Kërkesën',
    successTitle: 'TRANSMETUAR ME SIGURI',
    successDesc: 'Kërkesa juaj ka kaluar filtrat standardë dhe tani është në pritje mjaftueshëm me partnerët tanë drejtues. Koha e pritshme e kontaktit: brenda 2 orëve.',
    close: 'MBYLL [ESC]',
    sectorHeader: 'MATRICA E KAPACITETIT',
    roadmapHeader: 'PROTOKOLLI I TRANZITIT NDËRKUFITAR',
    roadmapSubtitle: 'Udhërrëfyesi i tranzitit ligjor është i certifikuar nga traktatet dypalëshe rajonale. I sigurt, i mbrojtur dhe në përputhshmëri të plotë nga rekrutimi deri te vendosja.',
    sectorDetailsText: 'EKSPLORO MUNDËSITË',
    benefitHousing: 'Bllok modern banimi i garantuar plotësisht në përputhje me kodet',
    benefitTravel: 'Pagesa e tranzitit të drejtëpërdrejtë vajtje-ardhje dhe lejeve kufitare',
    benefitContracts: '100% kontrata ligjore dypalëshe me kujdes shëndetësor'
  }
};

const allLanguages: Language[] = [
  'EN', 'MK', 'AL', 'DE', 'ES', 'EL', 'PL', 'SV'
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = allLanguages.reduce((acc, lang) => {
  acc[lang] = baseTranslations[lang as 'EN' | 'MK' | 'AL'] || baseTranslations.EN;
  return acc;
}, {} as Record<Language, Record<string, string>>);

export const SECTORS: Sector[] = [
  {
    id: 'construction',
    title: {
      EN: 'HEAVY CONSTRUCTION & MASONRY',
      MK: 'ГРАДЕЖНИШТВО И ИНФРАСТРУКТУРА',
      AL: 'NDËRTIM I RËNDË DHE MASHNERI'
    },
    subtitle: {
      EN: 'Bilateral treaty compliant workers',
      MK: 'Усогласено со билатералните договори',
      AL: 'Punëtorë në përputhje me traktatet'
    },
    description: {
      EN: 'Formwork carpenters, ironworkers, bricklayers, plasterers, and structural cement experts fully adapted to North Macedonian concrete standards.',
      MK: 'Кофражници, армирачи, ѕидари, фасадери и експерти за бетонски конструкции целосно адаптирани на градежните стандарди на Македонија.',
      AL: 'Tamponues, armatues, muratorë, suvatues dhe ekspertë strukturorë të betonit të përshtatur plotësisht me kodet e Maqedonisë së Veriut.'
    },
    highlights: {
      EN: ['Zero agency liability certified', 'Biometric status registered', 'OSHA equivalent compliance'],
      MK: ['Сертифицирана нулта одговорност', 'Биометриски статус регистриран', 'Усогласеност со заштита при работа'],
      AL: ['Çertifikuar me përgjegjësi zero', 'Status biometrik i regjistruar', 'Kompatibilitet me mbrojtjen në punë']
    },
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop',
    demandRate: 94,
    avgLeadTime: {
      EN: '24 Days Average',
      MK: 'Просек 24 дена',
      AL: 'Mesatarisht 24 ditë'
    }
  },
  {
    id: 'hospitality',
    title: {
      EN: 'ACCELERATED HOSPITALITY & TOURISM',
      MK: 'УГОСТИТЕЛСТВО И ХОТЕЛИЕРСТВО',
      AL: 'HOTELERI, TURIZËM DHE SHËRBIME'
    },
    subtitle: {
      EN: 'Multilingual frontline crew',
      MK: 'Повеќејазичен персонал на прва линија',
      AL: 'Staf i vijës së parë shumëgjuhesh'
    },
    description: {
      EN: 'Kitchen staff, line cooks, experienced waiters, hotel service technicians, and English/German speaking resort personnel for seasonal and long-term placement.',
      MK: 'Кујнски персонал, шефови на кујна, искусни келнери, техничари за соби и персонал за ресорти кои зборуваат англиски/германски јазик.',
      AL: 'Staf guzhine, ndihmës kuzhinierë, kamarierë me përvojë, teknikë të shërbimit hotelier dhe staf resorti që komunikojnë në anglisht/gjermanisht.'
    },
    highlights: {
      EN: ['Health-cleared certifications', 'Seasonal rotation speedways', 'Local culinary alignment'],
      MK: ['Санитарни сертификати обезбедени', 'Канали за брза сезонска ротација', 'Адаптација на локалната кујна'],
      AL: ['Çertifikata sanitare të garantuara', 'Kanale të shpejta të rotacionit', 'Përshtatje me kulinarinë lokale']
    },
    image: 'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=600&auto=format&fit=crop',
    demandRate: 88,
    avgLeadTime: {
      EN: '18 Days Average',
      MK: 'Просек 18 дена',
      AL: 'Mesatarisht 18 ditë'
    }
  },
  {
    id: 'manufacturing',
    title: {
      EN: 'INDUSTRIAL MANUFACTURING & LOGISTICS',
      MK: 'ИНДУСТРИСКО ПРОИЗВОДСТВО И ЛОГИСТИКА',
      AL: 'PRODHIM INDUSTRIAL DHE LOGJISTIKË'
    },
    subtitle: {
      EN: 'High-precision operational staff',
      MK: 'Персонал со висока прецизност',
      AL: 'Staf operativ me saktësi të lartë'
    },
    description: {
      EN: 'Warehouse handlers, forklift operators, production assembly workers, metal CNC operators, and packaging staff with speed-onboarding capabilities.',
      MK: 'Магационери, виљушкаристи, работници на производствени линии, оператори на ЦНЦ машини и персонал за пакување со брзо адаптирање.',
      AL: 'Punëtorë magazinash, operatorë pirunësh, vija montimi prodhuese, operatorë CNC për metal dhe staf paketimi me aftësi të shpejta integrimi.'
    },
    highlights: {
      EN: ['Validated skills tracking', 'Direct shift adaptation tests', 'Zero-absenteeism guarantees'],
      MK: ['Проверено следење на вештини', 'Тестови за брза смена', 'Гаранции за нула отсуства со работа'],
      AL: ['Gjurmim i verifikuar i aftësive', 'Testimi i përshtatshmërisë', 'Garanci për zero mungesa në punë']
    },
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop',
    demandRate: 91,
    avgLeadTime: {
      EN: '22 Days Average',
      MK: 'Просек 22 дена',
      AL: 'Mesatarisht 22 ditë'
    }
  }
];

export const ROADMAP: RoadmapStep[] = [
  {
    number: '01',
    title: {
      EN: 'VETTING & SELECTION SOURCE',
      MK: 'ИДЕНТИФИКАЦИЈА И СЕЛЕКЦИЈА',
      AL: 'IDENTIFIKIMI DHE PËRZGJEDHJA'
    },
    subtitle: {
      EN: 'Recruitment Protocol [01]',
      MK: 'Контролен протокол [01]',
      AL: 'Protokolli i rekrutimit [01]'
    },
    description: {
      EN: 'Physical skillset vetting across South Balkan recruiting depots. Verified criminal background clearances and skill matching.',
      MK: 'Физичка проверка на вештините во регрутациските центри во јужниот Балкан. Спроведени контроли за криминално минато и проверка на вештините.',
      AL: 'Verifikim fizik i aftësive në qendrat tona të rekrutimit në Ballkanin Jugor. Kontrolle të historisë kriminale dhe testim i aftësive operative.'
    },
    complianceCheck: {
      EN: 'Secure registry validation & database entry.',
      MK: 'Обезбедена валидација на матични регистри и внес во база.',
      AL: 'Validimi i sigurt i regjistrit rajonal dhe futja në databazë.'
    }
  },
  {
    number: '02',
    title: {
      EN: 'LEGAL DUPLEX TRANSIT',
      MK: 'ЗАКОНСКА ВИЗЕН ТРАНЗИТ ПАТЕКА',
      AL: 'TRANZIT LIGJOR DHE VIZA'
    },
    subtitle: {
      EN: 'Bilateral Processing [02]',
      MK: 'Билатерална обработка [02]',
      AL: 'Prototipi dypalësh [02]'
    },
    description: {
      EN: 'Automated document processing based on bilateral agreements with North Macedonia. Fast-tracked work permits, biometric registry, and official temporary stay visas.',
      MK: 'Автоматизирана обработка на документи врз основа на билатералните договори со Македонија. Забрзани работни дозволи и привремен престој.',
      AL: 'Përpunim i automatizuar i dokumenteve bazuar në marrëveshjet dypalëshe me Maqedoninë e Veriut. Leje pune të shpejtuara dhe viza qëndrimi.'
    },
    complianceCheck: {
      EN: 'Fast-track priority visa delivery within 12 days.',
      MK: 'Забрзана испорака на виза со приоритет во рок од 12 дена.',
      AL: 'Dërgim i lejes dhe vizës prioritare brenda 12 ditëve.'
    }
  },
  {
    number: '03',
    title: {
      EN: 'SITE DEPLOYMENT & LOGBOOKS',
      MK: 'РАСПОРЕДУВАЊЕ И НАДЗОР НА ТЕРЕН',
      AL: 'VENDOSJE NË TEREN DHE BILANCI'
    },
    subtitle: {
      EN: 'Onsite Integration [03]',
      MK: 'Интеграција на терен [03]',
      AL: 'Integrimi në Teren [03]'
    },
    description: {
      EN: 'Secure physical delivery to enterprise facilities in North Macedonia. Seamless transition into fully pre-arranged housing. Direct medical insurance setup.',
      MK: 'Безбеден физички транспорт до капацитетите на претпријатието во Македонија. Транзиција во претходно организирано сместување со здравствено.',
      AL: 'Transport fizik i sigurt direkt te ambientet e ndërmarrjes në Maqedoninë e Veriut. Kalim i qetë në akomodimin e parapërgatitur.'
    },
    complianceCheck: {
      EN: 'Full compliance registry submitted to local ministries.',
      MK: 'Регистар на целосна усогласеност поднесен до соодветните министерства.',
      AL: 'Regjistri i plotë i konformitetit dërguar në ministritë vendore.'
    }
  }
];
