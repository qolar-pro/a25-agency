// A25 submission processing — framework-agnostic email dispatch (Resend).
// Shared by the local dev server (server.ts) and the Vercel serverless
// function (api/submit.ts). Accepts any Express/Vercel-style (req, res) pair.

import { safeWrite } from "./archive/db.js";
import { archiveSubmission } from "./archive/store.js";

// Exquisite 25-Language Confirmation Dictionary Helper
function getConfirmationEmail(
  language: string,
  isEmployer: boolean,
  fullName: string,
  sector: string,
  extraParam: string, // companyName for employer, country for candidate
  phone: string
): { subject: string; text: string; html: string } {
  const lang = (language || "EN").toUpperCase();

  const templates: Record<
    string,
    {
      employer: { subject: string; text: string; html: string };
      candidate: { subject: string; text: string; html: string };
    }
  > = {
    EN: {
      employer: {
        subject: "Staffing Inquiry Received - A25 ",
        text: `Dear ${fullName},\n\nThank you for choosing A25. We have successfully registered your company's (${extraParam || "Direct Client"}) staffing requisition for the ${sector} sector.\n\nOur team is already reviewing details. A representative will contact you directly on ${phone} within 24 hours.\n\nBest regards,\nA25 Sourcing Desk`,
        html: `<h3>Dear ${fullName},</h3><p>Thank you for choosing <strong>A25</strong>. We have registered your requisition for the <strong>${sector}</strong> sector on behalf of <strong>${extraParam || "Direct Client"}</strong>.</p><p>Our representative will contact you directly at <strong>${phone}</strong> within 24 hours.</p>`
      },
      candidate: {
        subject: "Trade Talent Registration Confirmed - A25",
        text: `Dear ${fullName},\n\nYour trade candidacy profile for ${sector} has been successfully registered in the A25 Bilateral Registry from ${extraParam}.\n\nWe will contact you directly on WhatsApp/Viber (${phone}) as soon as matching enterprise projects open.\n\nBest regards,\nA25 Careers Desk`,
        html: `<h3>Dear ${fullName},</h3><p>Your trade profile for <strong>${sector}</strong> has been registered in the <strong>A25 Bilateral Registry</strong> from <strong>${extraParam}</strong>.</p><p>We will contact you via WhatsApp/Viber at <strong>${phone}</strong> as soon as matching opportunities open.</p>`
      }
    },
    MK: {
      employer: {
        subject: "Успешно примено барање за кадар - А25 Кадар",
        text: `Почитуван(а) ${fullName},\n\nВи благодариме што го избравте А25 Кадар. Успешно го примивме вашето барање за кадар за секторот ${sector} од име на фирмата ${extraParam || "Директен Клиент"}.\n\nНашиот стручен тим веќе ги разгледува вашите услови и ќе ве контактира директно по телефон (${phone}) или е-пошта во рок од 24 часа.\n\nСо почит,\nА25 Кадар`,
        html: `<h3>Почитуван(а) ${fullName},</h3><p>Ви благодариме што го избравте <strong>А25 Кадар</strong>. Успешно го регистриравме вашето барање за кадар во секторот <strong>${sector}</strong> за фирмата <strong>${extraParam || "Директен Клиент"}</strong>.</p><p>Нашиот стручен претставник ќе ве контактира на телефонскиот број <strong>${phone}</strong> во рок од 24 часа.</p>`
      },
      candidate: {
        subject: "Потврда за регистрација на кандидат - А25 Кадар",
        text: `Почитуван(а) ${fullName},\n\nВашиот професионален профил за работна позиција (${sector}) е успешно регистриран во базата на А25 Кадар од ${extraParam}.\n\nКоординатор за кариера ќе ве контактира директно на WhatsApp/Viber (${phone}) штом се појави соодветен ангажман за вашите вештини.\n\nСо почит,\nА25 Кадар`,
        html: `<h3>Почитуван(а) ${fullName},</h3><p>Вашиот занаетчиски и професионален профил за секторот <strong>${sector}</strong> е успешно зачуван во базата на <strong>А25 Кадар</strong> од Земја на потекло: <strong>${extraParam}</strong>.</p><p>Ќе ве контактираме на WhatsApp/Viber на бројот <strong>${phone}</strong> со соодветни понуди.</p>`
      }
    },
    AL: {
      employer: {
        subject: "Kërkesa për personel u pranua - A25",
        text: `I nderuar ${fullName},\n\nJu faleminderit që zgjodhët A25. Kemi pranuar me sukses kërkesën tuaj për personel në sektorin ${sector} për kompaninë ${extraParam || "Klient Direkte"}.\n\nEkipi ynë do t'ju kontaktojë direkt në numrin e telefonit (${phone}) ose Viber/WhatsApp brenda 24 orëve.\n\nPërshendetje,\nA25 Sourcing Desk`,
        html: `<h3>I nderuar ${fullName},</h3><p>Ju faleminderit që zgjodhët <strong>A25</strong>. Regjistruam kërkesën tuaj për sektorin <strong>${sector}</strong> për kompaninë <strong>${extraParam || "Klient Direkte"}</strong>.</p><p>Ekipi ynë do t'ju kontaktojë në numrin <strong>${phone}</strong> (WhatsApp/Viber) brenda 24 orëve.</p>`
      },
      candidate: {
        subject: "Konfirmimi i regjistrimit të kandidatit - A25",
        text: `I nderuar ${fullName},\n\nProfili juaj si kandidat për pozicionin (${sector}) u regjistrua me sukses në Regjistrin A25 nga shteti ${extraParam}.\n\nNjë koordinator do t'ju kontaktojë direkt në Viber/WhatsApp (${phone}) sa më shpejt që të ketë një ofertë që përputhet me aftësitë tuaja.\n\nPërshendetje,\nA25 Careers Desk`,
        html: `<h3>I nderuar ${fullName},</h3><p>Profili juaj për sektorin <strong>${sector}</strong> u regjistrua me sukses në <strong>A25</strong> nga shteti <strong>${extraParam}</strong>.</p><p>Do t'u kontaktojmë në WhatsApp/Viber në numrin <strong>${phone}</strong>.</p>`
      }
    },
    DE: {
      employer: {
        subject: "Personalanfrage eingegangen - A25",
        text: `Sehr geehrte(r) ${fullName},\n\nvielen Dank für Ihr Vertrauen in A25. Ihre Personalanfrage für den Bereich ${sector} (Firma: ${extraParam || "Direktkunde"}) wurde erfolgreich erfasst.\n\nUnser Team wird sich innerhalb der nächsten 24 Stunden per Telefon (${phone}) oder E-Mail mit Ihnen abstimmen.\n\nMit freundlichen Grüßen,\nA25 Sourcing Desk`,
        html: `<h3>Sehr geehrte(r) ${fullName},</h3><p>vielen Dank, dass Sie sich für <strong>A25</strong> entschieden haben. Ihre Anfrage für den Bereich <strong>${sector}</strong> (Firma: <strong>${extraParam || "Direktkunde"}</strong>) wurde registriert.</p><p>Unser Team kontaktiert Sie direkt unter <strong>${phone}</strong> innerhalb von 24 Stunden.</p>`
      },
      candidate: {
        subject: "Kandidatenregistrierung bestätigt - A25",
        text: `Sehr geehrte(r) ${fullName},\n\nIhr Profil für den Bereich ${sector} aus ${extraParam} wurde erfolgreich in das A25-System aufgenommen.\n\nWir kontaktieren Sie über WhatsApp/Viber (${phone}), sobald ein passendes Stellenangebot vorliegt.\n\nMit freundlichen Grüßen,\nA25 Careers Desk`,
        html: `<h3>Sehr geehrte(r) ${fullName},</h3><p>Ihr Profil für den Bereich <strong>${sector}</strong> aus <strong>${extraParam}</strong> wurde erfolgreich registriert bei <strong>A25</strong>.</p><p>Wir unterstützen Sie und kontaktieren Sie unter <strong>${phone}</strong>.</p>`
      }
    },
    IT: {
      employer: {
        subject: "Richiesta di Personale Ricevuta - A25",
        text: `Gentile ${fullName},\n\nGrazie per aver scelto A25. La sua richiesta per il settore ${sector} (Azienda: ${extraParam || "Cliente Diretto"}) è stata registrata con successo.\n\nIl nostro team la contatterà al numero ${phone} o via email entro 24 ore.\n\nCordiali saluti,\nA25 Sourcing Desk`,
        html: `<h3>Gentile ${fullName},</h3><p>Grazie per aver scelto <strong>A25</strong>. La sua richiesta per il settore <strong>${sector}</strong> (Azienda: <strong>${extraParam || "Cliente Diretto"}</strong>) è stata ricevuta.</p><p>La contatteremo al numero <strong>${phone}</strong> entro 24 ore.</p>`
      },
      candidate: {
        subject: "Conferma Registrazione Profilo - A25",
        text: `Gentile ${fullName},\n\nIl suo profilo canditato per il settore ${sector} da ${extraParam} è stato registrato nel baco dati A25.\n\nUn coordinatore la contatterà via WhatsApp/Viber (${phone}) appena possibile.\n\nCordiali saluti,\nA25 Careers Desk`,
        html: `<h3>Gentile ${fullName},</h3><p>Il suo profilo per il settore <strong>${sector}</strong> da <strong>${extraParam}</strong> è stato registrato con successo nel database di <strong>A25</strong>.</p><p>La contatteremo al numero <strong>${phone}</strong>.</p>`
      }
    },
    TR: {
      employer: {
        subject: "Personel Talebi Başarıyla Alındı - A25",
        text: `Sayın ${fullName},\n\nA25'i tercih ettiğiniz için teşekkür ederiz. ${extraParam || "Doğrudan Müşteri"} şirketinizin ${sector} sektörü personel talebi başarıyla alınmıştır.\n\nEkibimiz sizinle en kısa sürede WhatsApp/Viber (${phone}) veya e-posta yoluyla 24 saat içinde iletişime geçecektir.\n\nSaygılarımızla,\nA25 Sourcing Desk`,
        html: `<h3>Sayın ${fullName},</h3><p><strong>A25</strong>'i tercih ettiğiniz için teşekkür ederiz. <strong>${extraParam || "Doğrudan Müşteri"}</strong> şirketinizin <strong>${sector}</strong> talebi alınmıştır.</p><p>Ekibimiz sizinle <strong>${phone}</strong> üzerinden 24 saat içinde iletişime geçecektir.</p>`
      },
      candidate: {
        subject: "Aday Profil Kaydı Onaylandı - A25",
        text: `Sayın ${fullName},\n\n${sector} alanındaki aday profiliniz (${extraParam}), A25 veri tabanına başarıyla eklenmiştir.\n\nUygun bir iş fırsatında bir koordinatörümüz sizinle WhatsApp/Viber (${phone}) üzerinden iletişime geçecektir.\n\nSaygılarımızla,\nA25 Careers Desk`,
        html: `<h3>Sayın ${fullName},</h3><p><strong>${sector}</strong> alanındaki aday profiliniz (Menşei: <strong>${extraParam}</strong>) başarıyla <strong>A25</strong> veri tabanına kaydedilmiştir.</p><p>Sizinle WhatsApp/Viber üzerinden <strong>${phone}</strong> numarasından iletişime geçeceğiz.</p>`
      }
    },
    SR: {
      employer: {
        subject: "Zahtev za radnu snagu primljen - A25",
        text: `Poštovani ${fullName},\n\nHvala Vam što ste izabrali A25. Vaš zahtev za kadrove u sektoru ${sector} za firmu ${extraParam || "Direktni Klijent"} je uspešno primljen.\n\nNaš tim će Vas kontaktirati na telefon (${phone}) ili e-pošte u roku od 24 sata.\n\nSrdačan pozdrav,\nA25 Sourcing Desk`,
        html: `<h3>Poštovani ${fullName},</h3><p>Hvala Vam što ste izabrali <strong>A25</strong>. Uspešno smo primili Vaš zahtev za sektor <strong>${sector}</strong> za firmu <strong>${extraParam || "Direktni Klijent"}</strong>.</p><p>Kontaktiraćemo Vas na broj <strong>${phone}</strong> u roku od 24 sata.</p>`
      },
      candidate: {
        subject: "Registracija kandidata potvrđena - A25",
        text: `Poštovani ${fullName},\n\nVaš profesionalni profil za sektor ${sector} iz ${extraParam} je uspešno registrovan u bazi A25.\n\nKoordinator će Vas kontaktirati na WhatsApp/Viber (${phone}) čim se pojavi odgovarajući angažman.\n\nSrdačan pozdrav,\nA25 Careers Desk`,
        html: `<h3>Poštovani ${fullName},</h3><p>Vaš profesionalni profil za sektor <strong>${sector}</strong> iz <strong>${extraParam}</strong> je uspešno registrovan u bazi <strong>A25</strong>.</p><p>Kontaktiraćemo Vas na broj <strong>${phone}</strong>.</p>`
      }
    },
    BG: {
      employer: {
        subject: "Запитването за кадър е получено - А25",
        text: `Уважаеми ${fullName},\n\nБлагодарим Ви, че избрахте А25. Запитването за персонал за сектор ${sector} от компания ${extraParam || "Директен Клиент"} беше получено успешно.\n\nНашият екип ще се свърже с Вас на телефон (${phone}) до 24 часа.\n\nС уважение,\nА25 Sourcing Desk`,
        html: `<h3>Уважаеми ${fullName},</h3><p>Благодарим Ви, че избрахте <strong>А25</strong>. Вашето запитване за сектор <strong>${sector}</strong> от фирма <strong>${extraParam || "Директен Клиент"}</strong> беше успешно получено.</p><p>Ще се свържем с Вас на телефон <strong>${phone}</strong> до 24 часа.</p>`
      },
      candidate: {
        subject: "Потвърждение за регистрация - А25",
        text: `Уважаеми ${fullName},\n\nВашият кандидатски профил за сектор ${sector} от страна ${extraParam} беше регистриран успешно в базата на А25.\n\nКоординатор ще се свърже с Вас на WhatsApp/Viber (${phone}), когато се появи работа.\n\nС уважение,\nА25 Careers Desk`,
        html: `<h3>Уважаеми ${fullName},</h3><p>Вашият кандидатски профил за сектор <strong>${sector}</strong> от страна <strong>${extraParam}</strong> беше регистриран успешно в <strong>А25</strong>.</p><p>Ще се свържем с Вас на телефон/WhatsApp <strong>${phone}</strong>.</p>`
      }
    },
    HR: {
      employer: {
        subject: "Zahtjev za radnu snagu zaprimljen - A25",
        text: `Poštovani ${fullName},\n\nHvala Vam što ste odabrali A25. Vaš zahtjev za kadrove u sektoru ${sector} za tvrtku ${extraParam || "Direktni Klijent"} je zaprimljen uspješno.\n\nNaš ured će Vas kontaktirati na telefon (${phone}) ili email u roku od 24 sata.\n\nSrdačan pozdrav,\nA25 Sourcing Desk`,
        html: `<h3>Poštovani ${fullName},</h3><p>Hvala Vam što ste odabrali <strong>A25</strong>. Zaprimili smo Vaš zahtjev za sektor <strong>${sector}</strong> za tvrtku <strong>${extraParam || "Tvrtka"}</strong>.</p><p>Kontaktirat ćemo Vas na telefon <strong>${phone}</strong> u roku od 24 sata.</p>`
      },
      candidate: {
        subject: "Potvrda registracije kandidata - A25",
        text: `Poštovani ${fullName},\n\nVaš profil za sektor ${sector} iz ${extraParam} je registriran u bazi A25.\n\nKoordinator će Vas kontaktirati na Viber/WhatsApp (${phone}) čim se otvori odgovarajuća pozicija.\n\nSrdačan pozdrav,\nA25 Careers Desk`,
        html: `<h3>Poštovani ${fullName},</h3><p>Vaš profesionalni profil za sektor <strong>${sector}</strong> iz <strong>${extraParam}</strong> je registriran u bazi <strong>A25</strong>.</p><p>Kontaktirat ćemo Vas na Viber/WhatsApp na <strong>${phone}</strong>.</p>`
      }
    },
    RO: {
      employer: {
        subject: "Solicitare de Personal Înregistrată - A25",
        text: `Stimate ${fullName},\n\nVă mulțumim că ați ales A25. Solicitarea dumneavoastră de personal în sectorul ${sector} de la compania ${extraParam || "Client Direct"} a fost înregistrată cu succes.\n\nEchipa noastră vă va contacta la numărul ${phone} sau prin email în termen de 24 de ore.\n\nCu stimă,\nA25 Sourcing Desk`,
        html: `<h3>Stimate ${fullName},</h3><p>Vă mulțumim că ați ales <strong>A25</strong>. Solicitarea de personal în sectorul <strong>${sector}</strong> de la compania <strong>${extraParam || "Client Direct"}</strong> a fost înregistrată.</p><p>Vă vom contacta la numărul <strong>${phone}</strong> în 24 de ore.</p>`
      },
      candidate: {
        subject: "Confirmare Înregistrare Candidat - A25",
        text: `Stimate ${fullName},\n\nProfilul dumneavoastră de candidat pentru sectorul ${sector} din ${extraParam} a fost înregistrat în baza de date A25.\n\nUn coordonator vă va contacta la ${phone} (WhatsApp/Viber) imediat ce apare o oportunitate potrivită.\n\nCu stimă,\nA25 Careers Desk`,
        html: `<h3>Stimate ${fullName},</h3><p>Profilul dumneavoastră pentru sectorul <strong>${sector}</strong> din <strong>${extraParam}</strong> este acum înregistrat în baza de date <strong>A25</strong>.</p><p>Vă vom contacta la numărul <strong>${phone}</strong>.</p>`
      }
    },
    PL: {
      employer: {
        subject: "Zgłoszenie Zapotrzebowania na Kadry - A25",
        text: `Szanowny Kliencie ${fullName},\n\nDziękujemy za wybór A25. Zgłoszenie zapotrzebowania w sektorze ${sector} (Firma: ${extraParam || "Klient"}) zostało pomyślnie zarejestrowane.\n\nNasz zespół skontaktuje się z Państwem telefonicznie (${phone}) w ciągu 24 godzin.\n\nZ poważaniem,\nA25 Sourcing Desk`,
        html: `<h3>Szanowny Kliencie ${fullName},</h3><p>Dziękujemy za wybór <strong>A25</strong>. Państwa zgłoszenie w sektorze <strong>${sector}</strong> zostało zarejestrowane.</p><p>Nasz zespół skontaktuje się z Państwem pod numerem <strong>${phone}</strong> w ciągu 24 godzin.</p>`
      },
      candidate: {
        subject: "Potwierdzenie Rejestracji Kandydata - A25",
        text: `Szanowny Kandydacie ${fullName},\n\nProfil zawodowy w sektorze ${sector} z kraju ${extraParam} został pomyślnie zarejestrowany w bazie A25.\n\nKoordynator skontaktuje się z Tobą pod numerem ${phone} (Viber/WhatsApp).\n\nZ poważaniem,\nA25 Careers Desk`,
        html: `<h3>Szanowny Kandydacie ${fullName},</h3><p>Twój profil w sektorze <strong>${sector}</strong> z kraju <strong>${extraParam}</strong> został zarejestrowany w bazie danych <strong>A25</strong>.</p><p>Skontaktujemy się z Tobą pod numerem <strong>${phone}</strong>.</p>`
      }
    },
    ES: {
      employer: {
        subject: "Solicitud de Personal Recibida - A25",
        text: `Estimado(a) ${fullName},\n\nGracias por confiar en A25. Hemos registrado con éxito su solicitud en el sector ${sector} (Empresa: ${extraParam || "Cliente Directo"}).\n\nUn asesor se pondrá en contacto al teléfono (${phone}) en un plazo de 24 horas.\n\nAtentamente,\nA25 Sourcing Desk`,
        html: `<h3>Estimado(a) ${fullName},</h3><p>Gracias por confiar en <strong>A25</strong>. Hemos registrado con éxito su solicitud en el sector <strong>${sector}</strong> (Empresa: <strong>${extraParam || "Cliente"}</strong>).</p><p>Nos pondremos en contacto al teléfono <strong>${phone}</strong> dentro de las próximas 24 horas.</p>`
      },
      candidate: {
        subject: "Registro de Candidato Confirmado - A25",
        text: `Estimado(a) ${fullName},\n\nSu perfil en el sector ${sector} de ${extraParam} ha sido registrado exitosamente en A25.\n\nLe contactaremos al teléfono ${phone} (WhatsApp/Viber) cuando surja una vacante.\n\nAtentamente,\nA25 Careers Desk`,
        html: `<h3>Estimado(a) ${fullName},</h3><p>Su perfil en el sector <strong>${sector}</strong> de <strong>${extraParam}</strong> ha sido registrado exitosamente en la base de datos de <strong>A25</strong>.</p><p>Estaremos en contacto vía WhatsApp/Viber al <strong>${phone}</strong>.</p>`
      }
    },
    FR: {
      employer: {
        subject: "Demande de Personnel Enregistrée - A25",
        text: `Cher(e) ${fullName},\n\nMerci d'avoir choisi A25. Votre demande de recrutement dans le secteur ${sector} de l'entreprise ${extraParam || "Direct"} a été enregistrée.\n\nNotre équipe vous contactera au numéro de téléphone (${phone}) sous 24 heures.\n\nCordialement,\nA25 Sourcing Desk`,
        html: `<h3>Cher(e) ${fullName},</h3><p>Merci d'avoir choisi <strong>A25</strong>. Votre demande de recrutement pour le secteur <strong>${sector}</strong> a bien été enregistrée.</p><p>Notre équipe vous contactera au <strong>${phone}</strong> sous 24 heures.</p>`
      },
      candidate: {
        subject: "Confirmation de votre Inscription - A25",
        text: `Cher(e) ${fullName},\n\nVotre profil candidat pour le secteur ${sector} de ${extraParam} a été enregistré avec succès dans le fichier A25.\n\nUn coordinateur prendra contact avec vous au WhatsApp (${phone}) dès qu'une opportunité correspondante se présentera.\n\nCordialement,\nA25 Careers Desk`,
        html: `<h3>Cher(e) ${fullName},</h3><p>Votre profil de candidat dans le secteur <strong>${sector}</strong> (Origine: <strong>${extraParam}</strong>) a été enregistré dans le fichier de <strong>A25</strong>.</p><p>We will contact you directly at <strong>${phone}</strong>.</p>`
      }
    },
    RU: {
      employer: {
        subject: "Заявка на подбор кадров принята - А25",
        text: `Уважаемый(а) ${fullName},\n\nБлагодарим Вас за выбор А25. Ваша заявка в секторе ${sector} успешно принята.\n\nНаш представитель свяжется с Вами по телефону (${phone}) в течение 24 часов.\n\nС уважением,\nA25 Sourcing Desk`,
        html: `<h3>Уважаемый(а) ${fullName},</h3><p>Благодарим за выбор <strong>А25</strong>. Ваш запрос в секторе <strong>${sector}</strong> регистрирован.</p><p>Мы свяжемся с Вами по телефону <strong>${phone}</strong> в течение 24 часов.</p>`
      },
      candidate: {
        subject: "Регистрация в базе кандидатов подтверждена - А25",
        text: `Уважаемый(а) ${fullName},\n\nВаш профессиональный профиль по специальности ${sector} из ${extraParam} зарегистрирован в реестре А25.\n\nКоординатор свяжется с Вами по телефону ${phone} (WhatsApp/Viber) при появлении вакансий.\n\nС уважением,\nA25 Careers Desk`,
        html: `<h3>Уважаемый(а) ${fullName},</h3><p>Ваша анкета по специальности <strong>${sector}</strong> успешно зарегистрирована в реестре <strong>А25</strong>.</p><p>Мы свяжемся с Вами по телефону <strong>${phone}</strong>.</p>`
      }
    }
  };

  const selected = templates[lang] || templates.EN;
  const match = isEmployer ? selected.employer : selected.candidate;

  return {
    subject: match.subject,
    text: match.text,
    html: match.html
  };
}

export async function processSubmission(req: any, res: any) {
  const { 
    type, 
    fullName, 
    companyName, 
    email, 
    phone, 
    sector, 
    country, 
    experience, 
    hasPassport, 
    notes,
    language
  } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing key identifier fields (Full Name and Contact Phone are required)." 
    });
  }

  // Persist the lead BEFORE attempting any delivery.
  //
  // This is the whole reason lib/archive exists. Until this line, a form
  // submission was never stored anywhere: it was composed into an email, handed
  // to Resend, and that email was the only copy in existence. If Resend was
  // down, if the sender domain was unverified, if the destination mailbox
  // bounced (a real risk here — see the apex-MX note in CLAUDE.md), or if
  // someone simply deleted the message, the lead was gone with no trace.
  //
  // Archived first and fail-open, so the lead is durable even when every
  // downstream delivery path fails.
  void safeWrite("form submission", () =>
    archiveSubmission({
      id: `form:${globalThis.crypto.randomUUID()}`,
      source: "form",
      kind: type === "EMPLOYER" ? "EMPLOYER" : "CANDIDATE",
      fullName,
      companyName,
      email,
      phone,
      sector,
      country,
      experience: experience != null ? String(experience) : undefined,
      hasPassport,
      notes,
      language,
      createdAt: Date.now(),
      raw: req.body
    })
  );

  // Construct Email Target
  const destinationEmail = process.env.EMAIL_TO || "contact@a25.mk";
  const isEmployer = type === "EMPLOYER";

  // Build subject and details
  let emailSubject = "";
  let textBody = "";
  let htmlBody = "";

  if (isEmployer) {
    emailSubject = `[А25 БАРАЊЕ ЗА КАДАР] Ново барање за регрутација од ${companyName || 'Директна Компанија'}`;
    textBody = `
=========================================
А25 ДИГИТАЛНА КАНЦЕЛАРИЈА - НОВО БАРАЊЕ ЗА КАДАР
=========================================
Идентификатор на барањето: REQ-${Math.floor(10000 + Math.random() * 90000)}
Тип: Вработувач (Фирма бара кадар)

Контакт лице: ${fullName}
Име на компанијата: ${companyName || "Не е наведено"}
Директен телефон (WhatsApp/Viber): ${phone}
Директна е-пошта: ${email || "Не е наведена"}
Потребен индустриски сектор: ${sector}

Специфични барања и белешки:
${notes || "Нема внесено дополнителни барања."}

-----------------------------------------
Ова е сигурна билатерална прекугранична трансакција на државно ниво.
Време на регрутирање: ${new Date().toISOString()}
    `;

    htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #18181b;">
        <!-- Header -->
        <div style="background-color: #09090b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; border-bottom: 2px solid #f59e0b;">
          <h2 style="color: #ffffff; margin: 0; font-family: monospace; letter-spacing: 2px; font-weight: 800; font-size: 22px;">А25 КАДАР</h2>
          <p style="color: #a1a1aa; margin: 5px 0 0 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;">КАНАЛ НА БИЛАТЕРАЛНА КАНЦЕЛАРИЈА ЗА РЕГРУТАЦИЈА</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px 0;">
          <span style="display: inline-block; background-color: #eff6ff; color: #1e40af; font-family: monospace; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">Ново барање за кадар од фирма</span>
          
          <h3 style="font-size: 18px; margin: 16px 0 10px 0; color: #09090b; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #f4f4f5; padding-bottom: 8px;">Детали за корпоративниот клиент</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; width: 170px; font-family: monospace; text-transform: uppercase; font-weight: bold;">Контакт лице:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #09090b;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Име на фирма:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #09090b;">${companyName || "Директно / Не е наведено"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Контакт телефон:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #2563eb; font-family: monospace;">${phone} (WhatsApp/Viber)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Директна е-пошта:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #09090b;">${email || "Нема"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Потребен сектор:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #18181b;">${sector}</td>
            </tr>
          </table>

          <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #09090b; text-transform: uppercase; font-weight: 700;">Барања и белешки на вработувачот:</h3>
          <div style="background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.6; color: #27272a; white-space: pre-wrap;">${notes || "Нема наведено посебни барања."}</div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e4e4e7; padding-top: 16px; text-align: center; font-size: 10px; color: #a1a1aa; font-family: monospace; text-transform: uppercase;">
          <p style="margin: 0;">Обезбеден билатерален коридор за меѓудржавен пренос на кадар</p>
          <p style="margin: 5px 0 0 0; color: #71717a;">Време на прием UTC: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;
  } else {
    // CANDIDATE
    emailSubject = `[А25 ДОСИЕ НА КАНДИДАТ] Нов прекуграничен профил на работник од ${country}`;
    textBody = `
=========================================
А25 ДИГИТАЛНА КАНЦЕЛАРИЈА - НОВ КАНДИДАТ ЗА РАБОТА
=========================================
Идентификатор на досие: CAD-${Math.floor(10000 + Math.random() * 90000)}
Тип: Кандидат (Барател на работа)

Име на кандидат: ${fullName}
Земја на потекло: ${country}
Директен телефон (WhatsApp/Viber): ${phone}
Директна е-пошта: ${email || "Не е наведена"}
Индустриски вештини и занает: ${sector}
Години искуство: ${experience} години
Биометриски пасош за транспорт: ${hasPassport === "yes" ? "ДА (Верификуван и подготвен)" : "НЕ"}

Белешки за работно искуство и лиценци:
${notes || "Нема додадено белешки."}

-----------------------------------------
Ова е сигурна билатерална прекугранична трансакција на државно ниво.
Време на регрутирање: ${new Date().toISOString()}
    `;

    htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #18181b;">
        <!-- Header -->
        <div style="background-color: #09090b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; border-bottom: 2px solid #f59e0b;">
          <h2 style="color: #ffffff; margin: 0; font-family: monospace; letter-spacing: 2px; font-weight: 800; font-size: 22px;">А25 КАДАР</h2>
          <p style="color: #a1a1aa; margin: 5px 0 0 0; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px;">КАНАЛ НА БИЛАТЕРАЛНА КАНЦЕЛАРИЈА ЗА РЕГРУТАЦИЈА</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 24px 0;">
          <span style="display: inline-block; background-color: #f0fdf4; color: #166534; font-family: monospace; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">Нова апликација од кандидат</span>
          
          <h3 style="font-size: 18px; margin: 16px 0 10px 0; color: #09090b; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #f4f4f5; padding-bottom: 8px;">Досие на соодветен кандидат</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
            <tr>
              <td style="padding: 8px 0; color: #71717a; width: 170px; font-family: monospace; text-transform: uppercase; font-weight: bold;">Име на кандидат:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #09090b;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Земја на потекло:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #09090b;">${country}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Контакт телефон:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #2563eb; font-family: monospace;">${phone} (WhatsApp/Viber)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Директна е-пошта:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #09090b;">${email || "Нема"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Индустриски сектор:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #18181b;">${sector}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Искуство во години:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #09090b;">${experience} години сертифициран кадар</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a; font-family: monospace; text-transform: uppercase; font-weight: bold;">Биометриски пасош:</td>
              <td style="padding: 8px 0; font-weight: bold; color: ${hasPassport === 'yes' ? '#166534' : '#991b1b'};">
                ${hasPassport === 'yes' ? '★ ДА (Важечки биометриски пасош)' : '✖ НЕ (Стандардна регистрација)'}
              </td>
            </tr>
          </table>

          <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #09090b; text-transform: uppercase; font-weight: 700;">Професионален занает и искуство:</h3>
          <div style="background-color: #fafafa; border: 1px solid #f4f4f5; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.6; color: #27272a; white-space: pre-wrap;">${notes || "Нема наведено дополнително искуство."}</div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #e4e4e7; padding-top: 16px; text-align: center; font-size: 10px; color: #a1a1aa; font-family: monospace; text-transform: uppercase;">
          <p style="margin: 0;">Обезбеден билатерален коридор за меѓудржавен пренос на кадар</p>
          <p style="margin: 5px 0 0 0; color: #71717a;">Време на прием UTC: ${new Date().toISOString()}</p>
        </div>
      </div>
    `;
  }

  // Check if Resend email dispatch secrets are present
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM || "A25 <contact@a25.mk>";

  // Prepare professional automatic confirmation templates for the client
  let confirmationSubject = "";
  let confirmationText = "";
  let confirmationHtml = "";

  if (email) {
    const confirmation = getConfirmationEmail(
      language,
      isEmployer,
      fullName,
      sector,
      isEmployer ? (companyName || "Direct Client") : (country || "International"),
      phone
    );
    confirmationSubject = confirmation.subject;
    confirmationText = confirmation.text;
    confirmationHtml = confirmation.html;
  }

  let isSent = false;
  let errorDetails = "";

  // 1. Send via Resend API
  if (RESEND_API_KEY) {
    let fromEmail = EMAIL_FROM;
    let attempts = 0;
    const maxAttempts = fromEmail.includes("onboarding@resend.dev") ? 1 : 2;

    while (attempts < maxAttempts && !isSent) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout limit

      try {
        console.log(`[A25 RESEND] Attempt ${attempts}: Initiating dispatch to ${destinationEmail} from ${fromEmail}...`);
        
        const apiResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [destinationEmail],
            subject: emailSubject,
            html: htmlBody,
            text: textBody
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData: any = await apiResponse.json();

        if (apiResponse.ok && responseData.id) {
          console.log(`[A25 RESEND] Successfully sent email to ${destinationEmail}. ID: ${responseData.id}`);
          isSent = true;

          // Try to dispatch client auto-confirmation email concurrently/after
          if (email) {
            const clientController = new AbortController();
            const clientTimeoutId = setTimeout(() => clientController.abort(), 5000);
            try {
              console.log(`[A25 RESEND] Dispatching professional auto-confirmation email to sender email: ${email}...`);
              const clientResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${RESEND_API_KEY}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  from: fromEmail,
                  to: [email],
                  subject: confirmationSubject,
                  html: confirmationHtml,
                  text: confirmationText
                }),
                signal: clientController.signal
              });

              clearTimeout(clientTimeoutId);
              const clientResData: any = await clientResponse.json();
              if (clientResponse.ok && clientResData.id) {
                console.log(`[A25 RESEND] Auto-confirmation successfully dispatched to ${email}. ID: ${clientResData.id}`);
              } else {
                console.log(`[A25 RESEND Notice] Submitter verification auto-confirmation skipped or blocked by Sandbox permissions. Status details: ${JSON.stringify(clientResData)}`);
              }
            } catch (clientErr: any) {
              clearTimeout(clientTimeoutId);
              console.log(`[A25 RESEND Info] Submitter verification auto-confirmation skipped (Sandbox restriction mode): ${clientErr.message}`);
            }
          }
        } else {
          const errorMsg = responseData.message || JSON.stringify(responseData);
          throw new Error(errorMsg);
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.log(`[A25 RESEND Info] Dispatch attempt ${attempts} completed with status: ${error.message}`);
        errorDetails = `Resend Status: ${error.message}`;

        // If we failed and have a second attempt, switch to onboarding@resend.dev
        if (attempts === 1 && maxAttempts === 2) {
          console.log(`[A25 RESEND Info] Custom sender domain unvalidated or rejected. Retrying automatically with free-tier default 'onboarding@resend.dev'...`);
          fromEmail = "A25 Workforce <onboarding@resend.dev>";
        }
      }
    }
  }

  // 2. Respond to client
  if (isSent) {
    return res.json({
      success: true,
      simulated: false,
      sentTo: destinationEmail,
      provider: "Resend"
    });
  } else {
    // Dispatch failed or Resend was not configured
    printTerminalSimulatedEmail(emailSubject, textBody);
    if (email) {
      printTerminalSimulatedEmail(`[SUBMITTER CONFIRMATION] ${confirmationSubject}`, confirmationText);
    }
    
    let infoMessage = "Form accepted on Digital Desk! ";
    if (RESEND_API_KEY) {
      infoMessage += `Live delivery failed: ${errorDetails}. Please ensure your Resend API Key is correct and that the sender domain matches your Resend authorized domain, or is 'onboarding@resend.dev' with your registered email.`;
    } else {
      infoMessage += "[DEVELOPER INFO: No RESEND_API_KEY found in your Secrets. Processed locally in dev mode.]";
    }

    return res.json({
      success: true,
      simulated: true,
      sentTo: destinationEmail,
      message: infoMessage,
      error: errorDetails || "Resend API key missing from environments"
    });
  }
}

// Helper function to draw an elegant terminal block
function printTerminalSimulatedEmail(subject: string, body: string) {
  console.log("\n");
  console.log("┌────────────────────────────────────────────────────────────────────────┐");
  console.log("│                      A25 SIMULATED EMAIL DISPATCH                      │");
  console.log("├────────────────────────────────────────────────────────────────────────┤");
  console.log(`│ SUBJECT: ${subject.padEnd(61).slice(0, 61)} │`);
  console.log("├────────────────────────────────────────────────────────────────────────┤");
  
  const lines = body.trim().split("\n");
  for (const line of lines) {
    console.log(`│ ${line.padEnd(70).slice(0, 70)} │`);
  }
  
  console.log("└────────────────────────────────────────────────────────────────────────┘");
  console.log("\n");
}
