import type { LucideIcon } from 'lucide-react';
import {
  HardHat,
  UtensilsCrossed,
  Sprout,
  Warehouse,
  Users,
  Factory,
  Truck,
  Hotel,
} from 'lucide-react';
import type { Language } from '@/src/types';

/**
 * Phase 3 — the 7 real industry panels behind the industries carousel and the
 * "Read More" modal.
 *
 * This lives in its own module (not the flat `TranslationKeys` set) because each
 * industry carries several localized fields — label / subtitle / description /
 * guarantees — the same rich per-language shape the retired `src/data.ts`
 * `SECTORS` array used. Copy is hand-written per language, not machine-flat
 * English restated; guarantees are 3 short bullet lines each.
 *
 * Colors: icon tint pairs use ONLY brand `blue-*` and `zinc-*` tokens (see the
 * brand-kit rule in CLAUDE.md and Phase 1c). No new hues, no raw hex.
 *
 * Images: `construction`, `hospitality` and `manufacturing` reuse the three
 * Unsplash URLs already vetted in the old `SECTORS` array; the other four are
 * fresh royalty-free Unsplash photos. All are placeholders — flag for Boris to
 * replace with real A25 photography later.
 */

export interface Industry {
  key: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  image: string;
  label: Record<Language, string>;
  subtitle: Record<Language, string>;
  description: Record<Language, string>;
  guarantees: Record<Language, [string, string, string]>;
}

export const INDUSTRIES: Industry[] = [
  // 1 — Agriculture & Harvest ------------------------------------------------
  {
    key: 'agriculture',
    icon: Sprout,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    image:
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop',
    label: {
      EN: 'Agriculture & Harvest',
      MK: 'Земјоделство и жетва',
      AL: 'Bujqësi & Vjelje',
      DE: 'Landwirtschaft & Ernte',
      ES: 'Agricultura y Cosecha',
      EL: 'Γεωργία & Συγκομιδή',
      PL: 'Rolnictwo i Zbiory',
      SV: 'Jordbruk & Skörd',
    },
    subtitle: {
      EN: 'Seasonal field & orchard crews',
      MK: 'Сезонски екипи за поле и овоштарник',
      AL: 'Ekipe sezonale për arë e pemishte',
      DE: 'Saisonale Feld- und Erntehelfer',
      ES: 'Cuadrillas de campo y huerta de temporada',
      EL: 'Εποχικά συνεργεία αγρού & οπωρώνα',
      PL: 'Sezonowe ekipy polowe i sadownicze',
      SV: 'Säsongslag för fält och odling',
    },
    description: {
      EN: 'Field hands, fruit and vegetable pickers, greenhouse and vineyard workers ready for the full harvest window — used to early starts, physical days and outdoor work.',
      MK: 'Работници на поле, берачи на овошје и зеленчук, работници во стакленици и лозја, подготвени за целата берба — навикнати на рано станување, физичка работа и работа на отворено.',
      AL: 'Punëtorë fushe, vjelës frutash e perimesh, punëtorë serrash dhe vreshtash, gati për gjithë sezonin e vjeljes — mësuar me fillime të hershme, ditë fizike dhe punë në natyrë.',
      DE: 'Feldarbeiter, Obst- und Gemüsepflücker, Gewächshaus- und Weinbergkräfte für die gesamte Erntesaison — gewohnt an frühe Schichten, körperliche Arbeit und Einsatz im Freien.',
      ES: 'Peones de campo, recolectores de fruta y verdura, trabajadores de invernadero y viñedo listos para toda la campaña — acostumbrados a empezar temprano, jornadas físicas y trabajo al aire libre.',
      EL: 'Εργάτες αγρού, συλλέκτες φρούτων και λαχανικών, εργαζόμενοι σε θερμοκήπια και αμπελώνες, έτοιμοι για όλη την περίοδο συγκομιδής — συνηθισμένοι στο πρωινό ξεκίνημα, στη σωματική δουλειά και στην εργασία σε εξωτερικό χώρο.',
      PL: 'Pracownicy polowi, zbieracze owoców i warzyw, pracownicy szklarni i winnic gotowi na cały sezon zbiorów — przyzwyczajeni do wczesnych startów, pracy fizycznej i pracy na świeżym powietrzu.',
      SV: 'Fältarbetare, frukt- och grönsaksplockare, växthus- och vingårdsarbetare redo för hela skördesäsongen — vana vid tidiga morgnar, fysiska dagar och arbete utomhus.',
    },
    guarantees: {
      EN: [
        'Fit for physical outdoor work in any weather',
        'Available for the whole season, not just peak weeks',
        'Housing, transport and legal permits arranged before arrival',
      ],
      MK: [
        'Спремни за физичка работа на отворено во секакво време',
        'Достапни за цела сезона, не само во најнапорните недели',
        'Сместување, превоз и работни дозволи средени пред пристигнување',
      ],
      AL: [
        'Të përshtatshëm për punë fizike jashtë në çdo mot',
        'Të disponueshëm për gjithë sezonin, jo vetëm në javët e pikut',
        'Strehim, transport dhe leje pune të rregulluara para mbërritjes',
      ],
      DE: [
        'Belastbar für körperliche Arbeit im Freien bei jedem Wetter',
        'Verfügbar für die ganze Saison, nicht nur die Spitzenwochen',
        'Unterkunft, Transport und Arbeitserlaubnis vor Ankunft geregelt',
      ],
      ES: [
        'Preparados para el trabajo físico al aire libre con cualquier clima',
        'Disponibles toda la temporada, no solo en las semanas punta',
        'Alojamiento, transporte y permisos de trabajo gestionados antes de llegar',
      ],
      EL: [
        'Κατάλληλοι για σωματική εργασία σε εξωτερικό χώρο με κάθε καιρό',
        'Διαθέσιμοι για όλη τη σεζόν, όχι μόνο τις εβδομάδες αιχμής',
        'Στέγαση, μεταφορά και άδειες εργασίας τακτοποιημένες πριν την άφιξη',
      ],
      PL: [
        'Gotowi do pracy fizycznej na zewnątrz przy każdej pogodzie',
        'Dostępni przez cały sezon, nie tylko w szczytowe tygodnie',
        'Zakwaterowanie, transport i pozwolenia na pracę załatwione przed przyjazdem',
      ],
      SV: [
        'Klarar fysiskt utomhusarbete i alla väder',
        'Tillgängliga hela säsongen, inte bara under toppveckorna',
        'Boende, transport och arbetstillstånd ordnade före ankomst',
      ],
    },
  },

  // 2 — General Workers ------------------------------------------------------
  {
    key: 'general',
    icon: Users,
    iconBg: 'bg-zinc-100',
    iconColor: 'text-zinc-700',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
    label: {
      EN: 'General Workers',
      MK: 'Општи работници',
      AL: 'Punëtorë të Përgjithshëm',
      DE: 'Allgemeine Arbeitskräfte',
      ES: 'Trabajadores Generales',
      EL: 'Γενικοί Εργάτες',
      PL: 'Pracownicy Ogólni',
      SV: 'Allmän Arbetskraft',
    },
    subtitle: {
      EN: 'Flexible hands for any site',
      MK: 'Флексибилна работна сила за секаде',
      AL: 'Krahë fleksibël për çdo vend pune',
      DE: 'Flexible Kräfte für jeden Einsatzort',
      ES: 'Personal flexible para cualquier obra',
      EL: 'Ευέλικτα χέρια για κάθε χώρο',
      PL: 'Elastyczna siła robocza na każdy plac',
      SV: 'Flexibla händer för alla platser',
    },
    description: {
      EN: 'Reliable general labor for loading, cleaning, assembly, moving and any hands-on task — quick to train, willing to learn, and ready to step in wherever the extra pair of hands is needed.',
      MK: 'Сигурни општи работници за товарање, чистење, монтажа, преместување и секаква рачна работа — брзо се обучуваат, сакаат да учат и спремни да помогнат таму каде што е потребна дополнителна работна сила.',
      AL: 'Punëtorë të përgjithshëm të besueshëm për ngarkim, pastrim, montim, zhvendosje dhe çdo punë me dorë — mësohen shpejt, të gatshëm të mësojnë dhe gati të hyjnë kudo ku duhet një palë duar shtesë.',
      DE: 'Zuverlässige Hilfskräfte für Verladen, Reinigung, Montage, Umzüge und jede handwerkliche Aufgabe — schnell eingearbeitet, lernwillig und einsatzbereit, wo immer zusätzliche Hände gebraucht werden.',
      ES: 'Mano de obra general fiable para carga, limpieza, montaje, mudanzas y cualquier tarea manual — rápidos de formar, con ganas de aprender y listos para echar una mano donde haga falta.',
      EL: 'Αξιόπιστο γενικό εργατικό δυναμικό για φόρτωση, καθαρισμό, συναρμολόγηση, μετακινήσεις και κάθε χειρωνακτική εργασία — μαθαίνουν γρήγορα, θέλουν να εξελιχθούν και είναι έτοιμοι να καλύψουν όπου χρειάζεται ένα επιπλέον ζευγάρι χέρια.',
      PL: 'Solidni pracownicy ogólni do załadunku, sprzątania, montażu, przeprowadzek i każdej pracy fizycznej — szybko się wdrażają, chętni do nauki i gotowi pomóc tam, gdzie potrzeba dodatkowych rąk.',
      SV: 'Pålitlig allmän arbetskraft för lastning, städning, montering, flytt och alla praktiska uppgifter — snabba att lära upp, villiga att lära sig och redo att rycka in där extra händer behövs.',
    },
    guarantees: {
      EN: [
        'Adaptable across tasks and departments',
        'Strong work ethic, punctual and dependable',
        'Fully documented, insured and legally placed',
      ],
      MK: [
        'Приспособливи на различни задачи и оддели',
        'Силна работна етика, точни и доверливи',
        'Целосно документирани, осигурани и легално вработени',
      ],
      AL: [
        'Të përshtatshëm për detyra e departamente të ndryshme',
        'Etikë të fortë pune, të përpiktë dhe të besueshëm',
        'Plotësisht të dokumentuar, të siguruar dhe të punësuar ligjërisht',
      ],
      DE: [
        'Flexibel über Aufgaben und Abteilungen hinweg',
        'Ausgeprägte Arbeitsmoral, pünktlich und verlässlich',
        'Vollständig dokumentiert, versichert und legal vermittelt',
      ],
      ES: [
        'Adaptables entre tareas y departamentos',
        'Fuerte ética de trabajo, puntuales y de fiar',
        'Totalmente documentados, asegurados y contratados legalmente',
      ],
      EL: [
        'Προσαρμόσιμοι σε διαφορετικά καθήκοντα και τμήματα',
        'Ισχυρή εργασιακή ηθική, συνεπείς και αξιόπιστοι',
        'Πλήρως νομιμοποιημένοι, ασφαλισμένοι και νόμιμα τοποθετημένοι',
      ],
      PL: [
        'Elastyczni wobec różnych zadań i działów',
        'Silna etyka pracy, punktualni i godni zaufania',
        'W pełni udokumentowani, ubezpieczeni i legalnie zatrudnieni',
      ],
      SV: [
        'Anpassningsbara mellan uppgifter och avdelningar',
        'Stark arbetsmoral, punktliga och pålitliga',
        'Fullt dokumenterade, försäkrade och lagligt placerade',
      ],
    },
  },

  // 3 — Heavy Industry & Construction ----------------------------------------
  {
    key: 'construction',
    icon: HardHat,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop',
    label: {
      EN: 'Heavy Industry & Construction',
      MK: 'Тешка индустрија и градежништво',
      AL: 'Industri e Rëndë & Ndërtim',
      DE: 'Schwerindustrie & Bauwesen',
      ES: 'Industria Pesada y Construcción',
      EL: 'Βαριά Βιομηχανία & Κατασκευές',
      PL: 'Przemysł Ciężki i Budownictwo',
      SV: 'Tungindustri & Bygg',
    },
    subtitle: {
      EN: 'Skilled trades & site labor',
      MK: 'Квалификувани занаетчии и градежен кадар',
      AL: 'Zanate të kualifikuara & punë kantieri',
      DE: 'Facharbeiter & Baustellenkräfte',
      ES: 'Oficios cualificados y mano de obra de obra',
      EL: 'Ειδικευμένα συνεργεία & εργάτες έργου',
      PL: 'Wykwalifikowani fachowcy i robotnicy budowlani',
      SV: 'Yrkesarbetare & platsarbetare',
    },
    description: {
      EN: 'Formwork carpenters, steel fixers, bricklayers, plasterers and site laborers experienced on large builds and heavy-industry sites, working to North Macedonian standards.',
      MK: 'Кофражери, армирачи, ѕидари, малтерџии и градежни работници со искуство на големи градилишта и објекти од тешката индустрија, кои работат според македонските стандарди.',
      AL: 'Karpentierë kallëpi, hekurkthyes, muratorë, suvatues dhe punëtorë kantieri me përvojë në ndërtime të mëdha dhe objekte të industrisë së rëndë, që punojnë sipas standardeve të Maqedonisë së Veriut.',
      DE: 'Schalungszimmerer, Eisenflechter, Maurer, Verputzer und Baustellenhelfer mit Erfahrung auf Großbaustellen und in der Schwerindustrie — nach nordmazedonischen Standards.',
      ES: 'Carpinteros de encofrado, ferrallistas, albañiles, enyesadores y peones de obra con experiencia en grandes construcciones e industria pesada, según los estándares de Macedonia del Norte.',
      EL: 'Ξυλότυποι, σιδεράδες οπλισμού, κτίστες, σοβατζήδες και εργάτες έργου με εμπειρία σε μεγάλα έργα και βιομηχανικές εγκαταστάσεις, σύμφωνα με τα πρότυπα της Βόρειας Μακεδονίας.',
      PL: 'Cieśle szalunkowi, zbrojarze, murarze, tynkarze i robotnicy budowlani z doświadczeniem na dużych budowach i w przemyśle ciężkim, pracujący zgodnie ze standardami Macedonii Północnej.',
      SV: 'Formsnickare, armerare, murare, putsare och platsarbetare med erfarenhet av stora byggen och tungindustri, enligt nordmakedonska standarder.',
    },
    guarantees: {
      EN: [
        'Trade experience verified before placement',
        'Trained in on-site safety and PPE use',
        'Bilateral-treaty compliant, zero agency liability',
      ],
      MK: [
        'Занаетчиското искуство е проверено пред вработување',
        'Обучени за безбедност на градилиште и заштитна опрема',
        'Усогласени со билатералните договори, без одговорност за агенцијата',
      ],
      AL: [
        'Përvoja në zanat verifikohet para vendosjes',
        'Të trajnuar për sigurinë në kantier dhe pajisjet mbrojtëse',
        'Në përputhje me traktatet dypalëshe, pa përgjegjësi për agjencinë',
      ],
      DE: [
        'Facherfahrung vor der Vermittlung überprüft',
        'Geschult in Arbeitssicherheit und PSA-Nutzung',
        'Konform mit bilateralen Abkommen, keine Haftung der Agentur',
      ],
      ES: [
        'Experiencia en el oficio verificada antes de la colocación',
        'Formados en seguridad en obra y uso de EPI',
        'Conformes con los tratados bilaterales, sin responsabilidad para la agencia',
      ],
      EL: [
        'Η εμπειρία στην ειδικότητα επαληθεύεται πριν την τοποθέτηση',
        'Εκπαιδευμένοι στην ασφάλεια εργοταξίου και στα ΜΑΠ',
        'Σύμφωνοι με τις διμερείς συνθήκες, μηδενική ευθύνη για το γραφείο',
      ],
      PL: [
        'Doświadczenie w zawodzie weryfikowane przed skierowaniem',
        'Przeszkoleni w zakresie BHP na budowie i stosowania ŚOI',
        'Zgodni z umowami dwustronnymi, zero odpowiedzialności agencji',
      ],
      SV: [
        'Yrkeserfarenhet verifierad före placering',
        'Utbildade i arbetsplatssäkerhet och användning av skyddsutrustning',
        'Följer bilaterala avtal, inget ansvar för byrån',
      ],
    },
  },

  // 4 — Manufacturing & Production -------------------------------------------
  {
    key: 'manufacturing',
    icon: Factory,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-700',
    image:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop',
    label: {
      EN: 'Manufacturing & Production',
      MK: 'Производство и преработка',
      AL: 'Prodhim & Përpunim',
      DE: 'Fertigung & Produktion',
      ES: 'Fabricación y Producción',
      EL: 'Μεταποίηση & Παραγωγή',
      PL: 'Produkcja i Wytwarzanie',
      SV: 'Tillverkning & Produktion',
    },
    subtitle: {
      EN: 'Assembly & production line staff',
      MK: 'Персонал за монтажа и производствени линии',
      AL: 'Staf montimi & linje prodhimi',
      DE: 'Montage- und Fertigungspersonal',
      ES: 'Personal de montaje y línea de producción',
      EL: 'Προσωπικό συναρμολόγησης & γραμμής παραγωγής',
      PL: 'Personel montażu i linii produkcyjnej',
      SV: 'Monterings- och produktionslinjepersonal',
    },
    description: {
      EN: 'Assembly workers, machine operators, CNC and packaging staff for production lines — comfortable with shift work, quality checks and a steady, precise pace.',
      MK: 'Работници на монтажа, оператори на машини, ЦНЦ и персонал за пакување за производствени линии — навикнати на сменска работа, контрола на квалитет и постојано, прецизно темпо.',
      AL: 'Punëtorë montimi, operatorë makinerish, staf CNC dhe paketimi për linjat e prodhimit — të përshtatur me punën me turne, kontrollin e cilësisë dhe një ritëm të qëndrueshëm e të saktë.',
      DE: 'Montagekräfte, Maschinenbediener, CNC- und Verpackungspersonal für Fertigungslinien — vertraut mit Schichtarbeit, Qualitätskontrollen und einem gleichmäßigen, präzisen Takt.',
      ES: 'Operarios de montaje, operadores de máquina, personal de CNC y de embalaje para líneas de producción — habituados al trabajo por turnos, a los controles de calidad y a un ritmo constante y preciso.',
      EL: 'Εργάτες συναρμολόγησης, χειριστές μηχανών, προσωπικό CNC και συσκευασίας για γραμμές παραγωγής — εξοικειωμένοι με τη βάρδια, τους ελέγχους ποιότητας και έναν σταθερό, ακριβή ρυθμό.',
      PL: 'Pracownicy montażu, operatorzy maszyn, personel CNC i pakowania na linie produkcyjne — obyci z pracą zmianową, kontrolą jakości oraz stałym, precyzyjnym tempem.',
      SV: 'Monteringsarbetare, maskinoperatörer, CNC- och packpersonal för produktionslinjer — vana vid skiftarbete, kvalitetskontroller och ett jämnt, exakt tempo.',
    },
    guarantees: {
      EN: [
        'Comfortable on rotating and night shifts',
        'Consistent quality and low error rates',
        'Fast onboarding onto your existing line',
      ],
      MK: [
        'Спремни за ротирачки и ноќни смени',
        'Постојан квалитет и мал број грешки',
        'Брзо вклучување во вашата постојна линија',
      ],
      AL: [
        'Të gatshëm për turne rrotulluese dhe të natës',
        'Cilësi e qëndrueshme dhe pak gabime',
        'Integrim i shpejtë në linjën tuaj ekzistuese',
      ],
      DE: [
        'Bereit für Wechsel- und Nachtschichten',
        'Gleichbleibende Qualität und niedrige Fehlerquoten',
        'Schnelle Einarbeitung in Ihre bestehende Linie',
      ],
      ES: [
        'Disponibles para turnos rotativos y nocturnos',
        'Calidad constante y baja tasa de errores',
        'Incorporación rápida a su línea ya existente',
      ],
      EL: [
        'Διαθέσιμοι για κυλιόμενες και νυχτερινές βάρδιες',
        'Σταθερή ποιότητα και χαμηλά ποσοστά σφαλμάτων',
        'Γρήγορη ένταξη στην υπάρχουσα γραμμή σας',
      ],
      PL: [
        'Gotowi na zmiany rotacyjne i nocne',
        'Stała jakość i niski poziom błędów',
        'Szybkie wdrożenie na istniejącą linię',
      ],
      SV: [
        'Redo för roterande skift och nattskift',
        'Jämn kvalitet och låg felfrekvens',
        'Snabb introduktion på din befintliga linje',
      ],
    },
  },

  // 5 — Warehousing & Logistics ----------------------------------------------
  {
    key: 'logistics',
    icon: Truck,
    iconBg: 'bg-zinc-100',
    iconColor: 'text-zinc-700',
    image:
      'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1200&auto=format&fit=crop',
    label: {
      EN: 'Warehousing & Logistics',
      MK: 'Складирање и логистика',
      AL: 'Magazinim & Logjistikë',
      DE: 'Lager & Logistik',
      ES: 'Almacenamiento y Logística',
      EL: 'Αποθήκευση & Εφοδιαστική',
      PL: 'Magazynowanie i Logistyka',
      SV: 'Lager & Logistik',
    },
    subtitle: {
      EN: 'Warehouse & distribution crews',
      MK: 'Екипи за магацин и дистрибуција',
      AL: 'Ekipe magazine & shpërndarjeje',
      DE: 'Lager- und Distributionsteams',
      ES: 'Equipos de almacén y distribución',
      EL: 'Ομάδες αποθήκης & διανομής',
      PL: 'Ekipy magazynowe i dystrybucyjne',
      SV: 'Lager- och distributionslag',
    },
    description: {
      EN: 'Warehouse handlers, forklift and reach-truck operators, order pickers and dispatch staff who keep goods moving accurately and on schedule.',
      MK: 'Магационери, оператори на виљушкари и ричтракери, комплетирачи на нарачки и персонал за отпрема кои се грижат стоката да се движи точно и навреме.',
      AL: 'Punëtorë magazine, operatorë pirunësh dhe reach-truck, mbledhës porosish dhe staf ekspedimi që mbajnë mallrat në lëvizje saktë dhe në kohë.',
      DE: 'Lagerhelfer, Stapler- und Schubmaststaplerfahrer, Kommissionierer und Versandpersonal, die Waren präzise und termingerecht in Bewegung halten.',
      ES: 'Mozos de almacén, carretilleros y operarios de retráctil, preparadores de pedidos y personal de expedición que mantienen la mercancía en movimiento con precisión y a tiempo.',
      EL: 'Εργάτες αποθήκης, χειριστές περονοφόρων και reach-truck, συλλέκτες παραγγελιών και προσωπικό αποστολών που κρατούν τα εμπορεύματα σε κίνηση με ακρίβεια και συνέπεια.',
      PL: 'Magazynierzy, operatorzy wózków widłowych i wózków typu reach, kompletujący zamówienia oraz pracownicy wysyłki, którzy utrzymują przepływ towarów dokładnie i na czas.',
      SV: 'Lagerarbetare, truck- och skjutstativtruckförare, orderplockare och utleveranspersonal som håller varorna i rörelse exakt och i tid.',
    },
    guarantees: {
      EN: [
        'Certified forklift and reach-truck operators available',
        'Accurate picking, packing and stock handling',
        'Ready to scale up for peak-season volume',
      ],
      MK: [
        'Достапни сертифицирани оператори на виљушкари и ричтракери',
        'Точно комплетирање, пакување и ракување со залихи',
        'Спремни за зголемување во сезоната на најголем обем',
      ],
      AL: [
        'Operatorë të certifikuar pirunësh dhe reach-truck në dispozicion',
        'Mbledhje, paketim dhe menaxhim i saktë i stokut',
        'Gati për t’u shtuar për vëllimin e sezonit të pikut',
      ],
      DE: [
        'Zertifizierte Stapler- und Schubmaststaplerfahrer verfügbar',
        'Präzises Kommissionieren, Verpacken und Bestandshandling',
        'Bereit zur Aufstockung für Spitzenzeiten',
      ],
      ES: [
        'Carretilleros y operarios de retráctil certificados disponibles',
        'Preparación de pedidos, embalaje y gestión de stock precisos',
        'Listos para ampliar equipo en temporada alta',
      ],
      EL: [
        'Διαθέσιμοι πιστοποιημένοι χειριστές περονοφόρων και reach-truck',
        'Ακριβής συλλογή, συσκευασία και διαχείριση αποθέματος',
        'Έτοιμοι για ενίσχυση σε περιόδους αιχμής',
      ],
      PL: [
        'Dostępni certyfikowani operatorzy wózków widłowych i reach',
        'Dokładne kompletowanie, pakowanie i obsługa zapasów',
        'Gotowi do zwiększenia obsady w szczycie sezonu',
      ],
      SV: [
        'Certifierade truck- och skjutstativtruckförare tillgängliga',
        'Exakt plockning, packning och lagerhantering',
        'Redo att skala upp inför högsäsong',
      ],
    },
  },

  // 6 — Hospitality & Resorts ------------------------------------------------
  {
    key: 'hospitality',
    icon: Hotel,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    image:
      'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?q=80&w=1200&auto=format&fit=crop',
    label: {
      EN: 'Hospitality & Resorts',
      MK: 'Угостителство и одморалишта',
      AL: 'Mikpritje & Resorte',
      DE: 'Gastgewerbe & Resorts',
      ES: 'Hostelería y Resorts',
      EL: 'Φιλοξενία & Θέρετρα',
      PL: 'Hotelarstwo i Resorty',
      SV: 'Hotell & Resorter',
    },
    subtitle: {
      EN: 'Hotel & guest-service teams',
      MK: 'Тимови за хотели и услуги за гости',
      AL: 'Ekipe hoteli & shërbimi ndaj mysafirëve',
      DE: 'Hotel- und Gästeservice-Teams',
      ES: 'Equipos de hotel y atención al huésped',
      EL: 'Ομάδες ξενοδοχείου & εξυπηρέτησης πελατών',
      PL: 'Zespoły hotelowe i obsługi gości',
      SV: 'Hotell- och gästserviceteam',
    },
    description: {
      EN: 'Housekeeping, front-desk, room-service and resort support staff for seasonal and year-round placement — presentable, guest-focused and often multilingual.',
      MK: 'Персонал за домаќинство, рецепција, послужување во соба и поддршка во одморалишта за сезонско и целогодишно вработување — уредни, посветени на гостите и често повеќејазични.',
      AL: 'Staf pastrimi, recepsioni, shërbimi në dhomë dhe mbështetjeje resorti për vendosje sezonale dhe gjatë gjithë vitit — të kujdesshëm në paraqitje, të fokusuar te mysafiri dhe shpesh shumëgjuhësh.',
      DE: 'Housekeeping-, Rezeptions-, Room-Service- und Resort-Servicekräfte für saisonale und ganzjährige Einsätze — gepflegt, gästeorientiert und oft mehrsprachig.',
      ES: 'Personal de limpieza, recepción, servicio de habitaciones y apoyo de resort para temporada o todo el año — de buena presencia, orientados al huésped y a menudo multilingües.',
      EL: 'Προσωπικό καθαριότητας, ρεσεψιόν, υπηρεσίας δωματίου και υποστήριξης θερέτρου για εποχική ή ολοετή τοποθέτηση — ευπαρουσίαστοι, με έμφαση στον πελάτη και συχνά πολύγλωσσοι.',
      PL: 'Personel sprzątający, recepcyjny, obsługi pokoi i wsparcia resortu do pracy sezonowej i całorocznej — zadbani, nastawieni na gościa i często wielojęzyczni.',
      SV: 'Städ-, receptions-, roomservice- och resortpersonal för säsongs- och helårsplacering — representativa, gästfokuserade och ofta flerspråkiga.',
    },
    guarantees: {
      EN: [
        'Guest-facing manners and presentation trained',
        'Often speak English or German for international guests',
        'Health-cleared and ready for seasonal rotation',
      ],
      MK: [
        'Обучени за однос кон гостите и уреден изглед',
        'Често зборуваат англиски или германски за странски гости',
        'Со санитарни сертификати и спремни за сезонска ротација',
      ],
      AL: [
        'Të trajnuar për sjelljen dhe paraqitjen ndaj mysafirëve',
        'Shpesh flasin anglisht ose gjermanisht për mysafirët ndërkombëtarë',
        'Me çertifikata shëndetësore dhe gati për rotacion sezonal',
      ],
      DE: [
        'Geschult in Umgangsformen und gepflegtem Auftreten',
        'Sprechen oft Englisch oder Deutsch für internationale Gäste',
        'Gesundheitlich freigegeben und bereit für saisonale Rotation',
      ],
      ES: [
        'Formados en trato y presentación de cara al huésped',
        'A menudo hablan inglés o alemán para clientes internacionales',
        'Con certificado sanitario y listos para la rotación de temporada',
      ],
      EL: [
        'Εκπαιδευμένοι στους τρόπους και στην εμφάνιση προς τον πελάτη',
        'Μιλούν συχνά αγγλικά ή γερμανικά για διεθνείς επισκέπτες',
        'Με πιστοποιητικά υγείας και έτοιμοι για εποχική εναλλαγή',
      ],
      PL: [
        'Przeszkoleni w kulturze obsługi i prezencji wobec gości',
        'Często mówią po angielsku lub niemiecku dla gości zagranicznych',
        'Z badaniami sanitarnymi i gotowi do rotacji sezonowej',
      ],
      SV: [
        'Utbildade i gästbemötande och representativt uppträdande',
        'Talar ofta engelska eller tyska för internationella gäster',
        'Hälsokontrollerade och redo för säsongsrotation',
      ],
    },
  },

  // 7 — Food Service & Restaurants -------------------------------------------
  {
    key: 'foodservice',
    icon: UtensilsCrossed,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    label: {
      EN: 'Food Service & Restaurants',
      MK: 'Ресторани и угостителски услуги',
      AL: 'Shërbim Ushqimi & Restorante',
      DE: 'Gastronomie & Restaurants',
      ES: 'Restauración y Restaurantes',
      EL: 'Εστίαση & Εστιατόρια',
      PL: 'Gastronomia i Restauracje',
      SV: 'Restaurang & Servering',
    },
    subtitle: {
      EN: 'Kitchen & dining-room crews',
      MK: 'Екипи за кујна и сала',
      AL: 'Ekipe kuzhine & salloni',
      DE: 'Küchen- und Servicepersonal',
      ES: 'Equipos de cocina y sala',
      EL: 'Πληρώματα κουζίνας & σάλας',
      PL: 'Ekipy kuchni i sali',
      SV: 'Kök- och serveringspersonal',
    },
    description: {
      EN: 'Line cooks, kitchen porters, waiters, baristas and dishwashers for busy restaurants and canteens — used to fast service, long shifts and working as one team under pressure.',
      MK: 'Готвачи, помошници во кујна, келнери, баристи и мијачи на садови за прометни ресторани и мензи — навикнати на брза услуга, долги смени и тимска работа под притисок.',
      AL: 'Kuzhinierë linje, ndihmës kuzhine, kamarierë, barista dhe larës enësh për restorante e mensa të ngarkuara — mësuar me shërbim të shpejtë, turne të gjata dhe punë si një ekip nën presion.',
      DE: 'Beikoch-, Küchenhilfe-, Service-, Barista- und Spülkräfte für stark frequentierte Restaurants und Kantinen — gewohnt an schnellen Service, lange Schichten und Teamarbeit unter Druck.',
      ES: 'Cocineros de línea, ayudantes de cocina, camareros, baristas y lavaplatos para restaurantes y comedores con mucho movimiento — habituados al servicio rápido, los turnos largos y a trabajar en equipo bajo presión.',
      EL: 'Μάγειρες γραμμής, λαντζέρηδες, σερβιτόροι, μπαρίστες και λαντζιέρηδες πιάτων για πολυσύχναστα εστιατόρια και κυλικεία — συνηθισμένοι στο γρήγορο σέρβις, στις μεγάλες βάρδιες και στην ομαδική δουλειά υπό πίεση.',
      PL: 'Kucharze liniowi, pomoce kuchenne, kelnerzy, bariści i pracownicy zmywaka do ruchliwych restauracji i stołówek — obyci z szybką obsługą, długimi zmianami i pracą zespołową pod presją.',
      SV: 'Linjekockar, köksbiträden, servitörer, baristor och diskare för hektiska restauranger och matsalar — vana vid snabb service, långa pass och att jobba som ett team under press.',
    },
    guarantees: {
      EN: [
        'Kitchen-hygiene (HACCP-style) certified',
        'Steady under pressure during peak service',
        'Available for long, split and weekend shifts',
      ],
      MK: [
        'Со сертификати за хигиена во кујна (HACCP)',
        'Стабилни под притисок во најпрометните часови',
        'Достапни за долги, поделени и викенд смени',
      ],
      AL: [
        'Të certifikuar për higjienën e kuzhinës (HACCP)',
        'Të qëndrueshëm nën presion në orët e pikut',
        'Të disponueshëm për turne të gjata, të ndara dhe në fundjavë',
      ],
      DE: [
        'Zertifiziert in Küchenhygiene (HACCP-Standard)',
        'Belastbar im Stoßbetrieb zur Hauptservicezeit',
        'Verfügbar für lange, geteilte und Wochenendschichten',
      ],
      ES: [
        'Con certificado de higiene en cocina (tipo APPCC/HACCP)',
        'Firmes bajo presión en los momentos de más trabajo',
        'Disponibles para turnos largos, partidos y de fin de semana',
      ],
      EL: [
        'Πιστοποιημένοι στην υγιεινή κουζίνας (πρότυπο HACCP)',
        'Σταθεροί υπό πίεση στις ώρες αιχμής',
        'Διαθέσιμοι για μεγάλες, σπαστές βάρδιες και σαββατοκύριακα',
      ],
      PL: [
        'Z certyfikatem higieny kuchni (standard HACCP)',
        'Opanowani pod presją w godzinach szczytu',
        'Dostępni na długie, dzielone i weekendowe zmiany',
      ],
      SV: [
        'Certifierade i kökshygien (HACCP-standard)',
        'Stabila under press vid rusningstid',
        'Tillgängliga för långa, delade och helgpass',
      ],
    },
  },
];
