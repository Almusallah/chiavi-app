// Pilot inventory: Milano, Bologna, Roma, Cagliari — mixed share/licensed.
// seed({force:true}) resets the DB (CLI); seed() only fills an empty DB.
'use strict';

const fs = require('node:fs');

const CARS = [
  { ownerName: 'Martina Colombo', ownerEmail: 'martina@example.it', title: 'Panda cittadina, sta in cortile a non far niente', makeModel: 'Fiat Panda 1.0 Hybrid', year: 2021, city: 'Milano', fuel: 'ibrida', mode: 'share', seats: 4,
    description: 'I commute by metro Monday to Friday, so the Panda sits in the courtyard. Take it for errands or a weekend — you cover the fuel and we\'re even. Isola district, easy handover.',
    descriptionIt: 'Vado in metro dal lunedì al venerdì, quindi la Panda resta in cortile. Prendila per commissioni o un weekend — copri il carburante e siamo pari. Zona Isola, consegna facile.',
    rcaOk: 1, startDate: '2026-07-06', endDate: '2026-09-28', minDays: 1, vibe: 'city' },
  { ownerName: 'Luca Ferri', ownerEmail: 'lucaf@example.it', title: '500 elettrica — quartiere Navigli', makeModel: 'Fiat 500e', year: 2023, city: 'Milano', fuel: 'elettrica', mode: 'share', seats: 4,
    description: 'Second car we barely use. Electric, so your "fuel" reimbursement is tiny. Charge card included, return it above 40%.',
    descriptionIt: 'Seconda auto che usiamo pochissimo. Elettrica, quindi il rimborso "carburante" è minuscolo. Tessera di ricarica inclusa, riportala sopra il 40%.',
    rcaOk: 1, startDate: '2026-07-06', endDate: '2026-08-31', minDays: 1, vibe: 'ev' },
  { ownerName: 'NoleggioBo di Andrea Ricci', ownerEmail: 'andrea@example.it', title: 'Clio full optional, con licenza — stazione centrale', makeModel: 'Renault Clio TCe', year: 2022, city: 'Bologna', fuel: 'benzina', mode: 'licensed', seats: 5, dailyPriceEur: 39,
    description: 'One-car licensed rental (SCIA via Chiavi, vehicle registered "uso di terzi"). Invoice provided, unlimited km within Italy, pickup 5 minutes from Bologna Centrale.',
    descriptionIt: 'Micro-noleggio con licenza (SCIA fatta con Chiavi, veicolo immatricolato "uso di terzi"). Fattura, km illimitati in Italia, ritiro a 5 minuti da Bologna Centrale.',
    rcaOk: 1, sciaNumber: 'SCIA-BO-2026-0142', usoTerzi: 1, startDate: '2026-07-04', endDate: '2026-10-31', minDays: 1, vibe: 'fun' },
  { ownerName: 'Paola Bianchi', ownerEmail: 'paola@example.it', title: 'Yaris ibrida, parcheggiata sotto casa a Trastevere', makeModel: 'Toyota Yaris Hybrid', year: 2020, city: 'Roma', fuel: 'ibrida', mode: 'share', seats: 5,
    description: 'I work from home; the Yaris moves twice a week. Perfect for a day out of Rome — Castelli, coast, Tuscia. You reimburse the fuel per km, full stop.',
    descriptionIt: 'Lavoro da casa; la Yaris si muove due volte a settimana. Perfetta per una gita fuori Roma — Castelli, litorale, Tuscia. Rimborsi il carburante al km, punto.',
    rcaOk: 1, startDate: '2026-07-04', endDate: '2026-09-30', minDays: 1, vibe: 'family' },
  { ownerName: 'RomaDrive di Sergio Leoni', ownerEmail: 'sergio@example.it', title: 'Ducato camperizzato con licenza — vacanze vere', makeModel: 'Fiat Ducato Camper', year: 2019, city: 'Roma', fuel: 'diesel', mode: 'licensed', seats: 4, dailyPriceEur: 95,
    description: 'Licensed camper rental (the 2023 circular hit unlicensed camper sharing hardest — this one is fully registered). Sleeps 4, solar panel, August free weeks going fast.',
    descriptionIt: 'Noleggio camper con licenza (la circolare 2023 ha colpito soprattutto i camper non autorizzati — questo è in regola). 4 posti letto, pannello solare, le settimane libere di agosto volano.',
    rcaOk: 1, sciaNumber: 'SCIA-RM-2025-0891', usoTerzi: 1, startDate: '2026-07-04', endDate: '2026-09-15', minDays: 3, vibe: 'van' },
  { ownerName: 'Elena Deriu', ownerEmail: 'elena.d@example.it', title: 'Duster per le spiagge — Cagliari sud', makeModel: 'Dacia Duster GPL', year: 2022, city: 'Cagliari', fuel: 'gpl', mode: 'share', seats: 5,
    description: 'We\'re the Stanza family from San Teodoro — same idea, four wheels. The Duster does beach duty on weekends only; weekdays it\'s yours at LPG cost per km (basically nothing).',
    descriptionIt: 'Siamo la famiglia di Stanza a San Teodoro — stessa idea, quattro ruote. Il Duster fa servizio spiagge solo nel weekend; nei giorni feriali è tuo al costo GPL al km (praticamente niente).',
    rcaOk: 1, startDate: '2026-07-06', endDate: '2026-09-11', minDays: 1, vibe: 'fun' },
  { ownerName: 'CagliariGo di Marta Piras', ownerEmail: 'marta.p@example.it', title: 'Panda aeroporto Elmas, con licenza', makeModel: 'Fiat Panda 1.2', year: 2021, city: 'Cagliari', fuel: 'benzina', mode: 'licensed', seats: 4, dailyPriceEur: 34,
    description: 'Licensed one-car rental at Elmas airport. Summer rates at the big chains hit €90/day — this is €34 with the same legal cover and an invoice.',
    descriptionIt: 'Micro-noleggio con licenza all\'aeroporto di Elmas. D\'estate le grandi catene arrivano a €90/giorno — questa è a €34 con la stessa copertura legale e la fattura.',
    rcaOk: 1, sciaNumber: 'SCIA-CA-2026-0077', usoTerzi: 1, startDate: '2026-07-04', endDate: '2026-10-31', minDays: 2, vibe: 'city' },
  { ownerName: 'Giorgio Valli', ownerEmail: 'giorgio@example.it', title: 'Golf diesel da autostrada — Bologna Santo Stefano', makeModel: 'VW Golf 2.0 TDI', year: 2019, city: 'Bologna', fuel: 'diesel', mode: 'share', seats: 5,
    description: 'Long-legged diesel, ideal to visit clients or family up and down the A1. I use it Saturdays only. Diesel per km, tolls at cost, done.',
    descriptionIt: 'Diesel da lunghe percorrenze, ideale per clienti o parenti su e giù per la A1. La uso solo il sabato. Gasolio al km, pedaggi al costo, fine.',
    rcaOk: 1, startDate: '2026-07-04', endDate: '2026-12-19', minDays: 1, vibe: 'city' },
];

// car ids follow insertion order (1..8)
const BOOKINGS = [
  { car: 1, in: '2026-07-08', out: '2026-07-10', km: 120, name: 'Davide N.', email: 'davide@example.com' },
  { car: 1, in: '2026-07-18', out: '2026-07-20', km: 260, name: 'Chiara T.', email: 'chiara@example.com' },
  { car: 2, in: '2026-07-11', out: '2026-07-13', km: 90, name: 'Ahmed K.', email: 'ahmed@example.com' },
  { car: 3, in: '2026-07-10', out: '2026-07-14', name: 'Famiglia Rinaldi', email: 'rinaldi@example.com' },
  { car: 4, in: '2026-07-12', out: '2026-07-13', km: 150, name: 'Sara V.', email: 'sara@example.com' },
  { car: 5, in: '2026-08-01', out: '2026-08-09', name: 'Famiglia Moretti', email: 'moretti@example.com' },
  { car: 6, in: '2026-07-07', out: '2026-07-09', km: 180, name: 'Jonas B.', email: 'jonas@example.de' },
  { car: 7, in: '2026-07-15', out: '2026-07-19', name: 'Helen W.', email: 'helen@example.co.uk' },
  { car: 8, in: '2026-07-06', out: '2026-07-08', km: 420, name: 'Marco P.', email: 'marcop@example.com' },
];

const REVIEWS = [
  [1, 'Davide N.', 5, 'Ho pagato il carburante e tre euro al giorno di servizio. Fine. Il contachilometri in foto mette tutti tranquilli.'],
  [3, 'Famiglia Rinaldi', 5, 'Vera fattura, vera licenza, metà del prezzo dei banchi in stazione. Andrea è un professionista.'],
  [4, 'Sara V.', 5, 'A day in the Castelli for the cost of the petrol. Paola left the child seat in — saved our trip.'],
  [5, 'Famiglia Moretti', 4, 'Camper in regola e ben tenuto. Il conguaglio km alla riconsegna è stato di due minuti.'],
  [7, 'Helen W.', 5, 'Landed at Elmas, walked five minutes, drove off for a third of what the counters quoted. Invoice in my inbox before the hotel.'],
];

function seed({ force = false } = {}) {
  const db = require('./db');
  if (force) {
    for (const suffix of ['', '-wal', '-shm']) {
      if (fs.existsSync(db.DB_PATH + suffix)) fs.rmSync(db.DB_PATH + suffix);
    }
  }
  const d = db.open();
  const existing = d.prepare(`SELECT COUNT(*) AS n FROM cars`).get().n;
  if (existing > 0 && !force) return { seeded: false, cars: existing };

  const { shareQuote, licensedQuote, daysBetween } = require('./pricing');
  const created = [];
  for (const c of CARS) created.push(db.createCar(c));
  for (const b of BOOKINGS) {
    const car = db.getCar(b.car);
    if (!car) continue;
    const days = daysBetween(b.in, b.out);
    let ownerAmount, fees, km = 0;
    if (car.mode === 'share') {
      const q = shareQuote({ fuel: car.fuel, days, kmTotal: b.km });
      ownerAmount = q.ownerReceives; fees = q.serviceFee; km = b.km;
    } else {
      const q = licensedQuote({ dailyPriceEur: car.daily_price_eur, days });
      ownerAmount = q.ownerReceives; fees = q.platformRevenue;
    }
    db.createBooking({ carId: b.car, checkIn: b.in, checkOut: b.out, kmTotal: km, guestName: b.name, guestEmail: b.email, ownerAmountEur: ownerAmount, feesEur: fees });
  }
  const insReview = d.prepare(`INSERT INTO reviews (car_id, author, rating, body) VALUES (?, ?, ?, ?)`);
  for (const [carId, author, rating, body] of REVIEWS) insReview.run(carId, author, rating, body);
  return { seeded: true, cars: created.length };
}

module.exports = { seed };
