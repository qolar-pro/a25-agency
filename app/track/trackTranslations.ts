// Localized copy for the /track/<token> order-status page, across the same 8
// languages as the rest of the site (EN/MK/AL/DE/ES/EL/PL/SV). Kept in its own
// module — not the flat TranslationKeys set — because this page is server-
// rendered outside the client SiteProvider context and needs a plain
// language-keyed lookup, same approach as app/components/industriesData.ts.

import type { Language } from '@/lib/languageDetect';

export interface TrackCopy {
  pageTitle: string;
  metaDescription: string;
  heading: string;
  subheading: string;
  orderRef: string;
  notFoundTitle: string;
  notFoundBody: string;
  updatedAt: string;
  completedNote: string;
  // Step labels, keyed by the order status values.
  steps: {
    started: string;
    pending: string;
    accepted: string;
    processing: string;
    done: string;
  };
  // Short caption under each step, so the stepper reads as a journey.
  stepCaptions: {
    started: string;
    pending: string;
    accepted: string;
    processing: string;
    done: string;
  };
}

export const TRACK_COPY: Record<Language, TrackCopy> = {
  EN: {
    pageTitle: 'Track your order',
    metaDescription: 'Follow the status of your A25 order.',
    heading: 'Your order',
    subheading: 'Follow each step as your request moves through A25.',
    orderRef: 'Order reference',
    notFoundTitle: 'Order not found',
    notFoundBody: 'This tracking link is invalid or has expired. Completed orders are removed after a few days.',
    updatedAt: 'Updated',
    completedNote: 'This order is complete. A copy has been sent to your email.',
    steps: { started: 'Started', pending: 'Pending', accepted: 'Accepted', processing: 'Processing', done: 'Done' },
    stepCaptions: {
      started: 'Request opened',
      pending: 'In the queue',
      accepted: 'Accepted by A25',
      processing: 'Work underway',
      done: 'Fully complete',
    },
  },
  MK: {
    pageTitle: 'Следете ја вашата нарачка',
    metaDescription: 'Следете го статусот на вашата нарачка во А25.',
    heading: 'Вашата нарачка',
    subheading: 'Следете го секој чекор додека вашето барање поминува низ А25.',
    orderRef: 'Референца на нарачка',
    notFoundTitle: 'Нарачката не е пронајдена',
    notFoundBody: 'Овој линк за следење е неважечки или истечен. Завршените нарачки се отстрануваат по неколку дена.',
    updatedAt: 'Ажурирано',
    completedNote: 'Оваа нарачка е завршена. Копија е испратена на вашата е-пошта.',
    steps: { started: 'Започната', pending: 'На чекање', accepted: 'Прифатена', processing: 'Во обработка', done: 'Завршена' },
    stepCaptions: {
      started: 'Барањето е отворено',
      pending: 'Во редот',
      accepted: 'Прифатено од А25',
      processing: 'Во тек',
      done: 'Целосно завршено',
    },
  },
  AL: {
    pageTitle: 'Ndiqni porosinë tuaj',
    metaDescription: 'Ndiqni statusin e porosisë suaj në A25.',
    heading: 'Porosia juaj',
    subheading: 'Ndiqni çdo hap ndërsa kërkesa juaj kalon nëpër A25.',
    orderRef: 'Referenca e porosisë',
    notFoundTitle: 'Porosia nuk u gjet',
    notFoundBody: 'Ky link ndjekjeje është i pavlefshëm ose ka skaduar. Porositë e përfunduara hiqen pas disa ditësh.',
    updatedAt: 'Përditësuar',
    completedNote: 'Kjo porosi është përfunduar. Një kopje është dërguar në emailin tuaj.',
    steps: { started: 'Filluar', pending: 'Në pritje', accepted: 'Pranuar', processing: 'Në përpunim', done: 'Përfunduar' },
    stepCaptions: {
      started: 'Kërkesa u hap',
      pending: 'Në radhë',
      accepted: 'Pranuar nga A25',
      processing: 'Puna po vazhdon',
      done: 'Plotësisht e përfunduar',
    },
  },
  DE: {
    pageTitle: 'Verfolgen Sie Ihren Auftrag',
    metaDescription: 'Verfolgen Sie den Status Ihres A25-Auftrags.',
    heading: 'Ihr Auftrag',
    subheading: 'Verfolgen Sie jeden Schritt, während Ihre Anfrage A25 durchläuft.',
    orderRef: 'Auftragsreferenz',
    notFoundTitle: 'Auftrag nicht gefunden',
    notFoundBody: 'Dieser Tracking-Link ist ungültig oder abgelaufen. Abgeschlossene Aufträge werden nach einigen Tagen entfernt.',
    updatedAt: 'Aktualisiert',
    completedNote: 'Dieser Auftrag ist abgeschlossen. Eine Kopie wurde an Ihre E-Mail gesendet.',
    steps: { started: 'Gestartet', pending: 'Ausstehend', accepted: 'Angenommen', processing: 'In Bearbeitung', done: 'Abgeschlossen' },
    stepCaptions: {
      started: 'Anfrage eröffnet',
      pending: 'In der Warteschlange',
      accepted: 'Von A25 angenommen',
      processing: 'Arbeit läuft',
      done: 'Vollständig abgeschlossen',
    },
  },
  ES: {
    pageTitle: 'Siga su pedido',
    metaDescription: 'Siga el estado de su pedido en A25.',
    heading: 'Su pedido',
    subheading: 'Siga cada paso a medida que su solicitud avanza por A25.',
    orderRef: 'Referencia del pedido',
    notFoundTitle: 'Pedido no encontrado',
    notFoundBody: 'Este enlace de seguimiento no es válido o ha caducado. Los pedidos completados se eliminan tras unos días.',
    updatedAt: 'Actualizado',
    completedNote: 'Este pedido está completo. Se ha enviado una copia a su correo electrónico.',
    steps: { started: 'Iniciado', pending: 'Pendiente', accepted: 'Aceptado', processing: 'En proceso', done: 'Completado' },
    stepCaptions: {
      started: 'Solicitud abierta',
      pending: 'En la cola',
      accepted: 'Aceptado por A25',
      processing: 'Trabajo en curso',
      done: 'Totalmente completado',
    },
  },
  EL: {
    pageTitle: 'Παρακολουθήστε την παραγγελία σας',
    metaDescription: 'Παρακολουθήστε την κατάσταση της παραγγελίας σας στην A25.',
    heading: 'Η παραγγελία σας',
    subheading: 'Παρακολουθήστε κάθε βήμα καθώς το αίτημά σας προχωρά μέσα από την A25.',
    orderRef: 'Αριθμός παραγγελίας',
    notFoundTitle: 'Η παραγγελία δεν βρέθηκε',
    notFoundBody: 'Αυτός ο σύνδεσμος παρακολούθησης δεν είναι έγκυρος ή έχει λήξει. Οι ολοκληρωμένες παραγγελίες αφαιρούνται μετά από λίγες ημέρες.',
    updatedAt: 'Ενημερώθηκε',
    completedNote: 'Αυτή η παραγγελία ολοκληρώθηκε. Ένα αντίγραφο στάλθηκε στο email σας.',
    steps: { started: 'Ξεκίνησε', pending: 'Σε εκκρεμότητα', accepted: 'Αποδεκτή', processing: 'Σε επεξεργασία', done: 'Ολοκληρώθηκε' },
    stepCaptions: {
      started: 'Το αίτημα άνοιξε',
      pending: 'Στην ουρά',
      accepted: 'Έγινε αποδεκτή από την A25',
      processing: 'Σε εξέλιξη',
      done: 'Πλήρως ολοκληρωμένη',
    },
  },
  PL: {
    pageTitle: 'Śledź swoje zamówienie',
    metaDescription: 'Śledź status swojego zamówienia w A25.',
    heading: 'Twoje zamówienie',
    subheading: 'Śledź każdy etap, gdy Twoja prośba przechodzi przez A25.',
    orderRef: 'Numer zamówienia',
    notFoundTitle: 'Nie znaleziono zamówienia',
    notFoundBody: 'Ten link śledzenia jest nieprawidłowy lub wygasł. Zrealizowane zamówienia są usuwane po kilku dniach.',
    updatedAt: 'Zaktualizowano',
    completedNote: 'To zamówienie zostało zrealizowane. Kopia została wysłana na Twój e-mail.',
    steps: { started: 'Rozpoczęte', pending: 'Oczekujące', accepted: 'Zaakceptowane', processing: 'W trakcie', done: 'Zrealizowane' },
    stepCaptions: {
      started: 'Prośba otwarta',
      pending: 'W kolejce',
      accepted: 'Zaakceptowane przez A25',
      processing: 'Prace w toku',
      done: 'W pełni zrealizowane',
    },
  },
  SV: {
    pageTitle: 'Följ din beställning',
    metaDescription: 'Följ statusen för din A25-beställning.',
    heading: 'Din beställning',
    subheading: 'Följ varje steg medan din förfrågan går genom A25.',
    orderRef: 'Beställningsreferens',
    notFoundTitle: 'Beställningen hittades inte',
    notFoundBody: 'Den här spårningslänken är ogiltig eller har gått ut. Slutförda beställningar tas bort efter några dagar.',
    updatedAt: 'Uppdaterad',
    completedNote: 'Den här beställningen är klar. En kopia har skickats till din e-post.',
    steps: { started: 'Startad', pending: 'Väntande', accepted: 'Accepterad', processing: 'Bearbetas', done: 'Klar' },
    stepCaptions: {
      started: 'Förfrågan öppnad',
      pending: 'I kön',
      accepted: 'Accepterad av A25',
      processing: 'Arbete pågår',
      done: 'Helt slutförd',
    },
  },
};
