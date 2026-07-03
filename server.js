// Chiavi — parked cars put to work, two legal ways. Zero-dependency, bilingual (EN/IT).
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const db = require('./lib/db');
const pricing = require('./lib/pricing');
const { daysBetween, shareQuote, licensedQuote } = pricing;
const { esc, eur, fmtDate, layout, carCard, availStrip, VIBES } = require('./lib/html');
const { pickLang, t } = require('./lib/i18n');

const PORT = process.env.PORT || 4880;

// ---------------------------------------------------------------- pages

function pageHome(query, lang) {
  const T = t(lang);
  const mode = query.get('mode') || '';
  const cars = db.listCars({ city: query.get('city') || '', date: query.get('date') || '', mode });
  const searching = query.get('city') || query.get('date') || mode;
  const opt = (val, label) => `<label class="pill ${mode === val ? 'on' : ''}"><input type="radio" name="mode" value="${val}" ${mode === val ? 'checked' : ''}>${label}</label>`;
  const hero = `
  <section class="hero">
    <h1>${T.hero_title}</h1>
    <p class="sub">${T.hero_sub}</p>
    <form class="search" action="/" method="get">
      <input name="city" placeholder="${T.search_where}" value="${esc(query.get('city') || '')}">
      <input name="date" type="date" value="${esc(query.get('date') || '')}" min="2026-07-04" max="2026-12-31">
      <button>${T.search_btn}</button>
      <div class="pills">${opt('', T.filter_all)}${opt('share', '🤝 ' + T.filter_share)}${opt('licensed', '📋 ' + T.filter_licensed)}</div>
    </form>
    <p class="mut">${T.pilot_note}</p>
  </section>`;
  const grid = cars.length
    ? `<section class="grid">${cars.map(c => carCard(c, lang, pricing)).join('')}</section>`
    : `<section class="empty"><p>${T.no_match}</p></section>`;
  return `${hero}<h2 class="row-title">${searching ? T.found(cars.length) : T.open_cars}</h2>${grid}
    <section class="two-ways">
      <h2>${T.two_ways_title}</h2>
      <div class="ways">
        <div class="panel"><h3>${T.way1_t}</h3><p>${T.way1_p}</p></div>
        <div class="panel"><h3>${T.way2_t}</h3><p>${T.way2_p}</p></div>
      </div>
    </section>
    <section class="strip-info">
      <div><h3>${T.strip1_t}</h3><p>${T.strip1_p}</p></div>
      <div><h3>${T.strip2_t}</h3><p>${T.strip2_p}</p></div>
      <div><h3>${T.strip3_t}</h3><p>${T.strip3_p}</p></div>
    </section>`;
}

function pageCar(id, lang) {
  const T = t(lang);
  const car = db.getCar(id);
  if (!car) return null;
  const grad = VIBES[car.vibe] || VIBES.city;
  const licensed = car.mode === 'licensed';
  const description = (lang === 'it' && car.description_it) ? car.description_it : car.description;

  const priceLine = licensed
    ? `${eur(car.daily_price_eur)}${T.per_day}`
    : `${eur(pricing.fuelRate(car.fuel))}${T.per_km} · +€${pricing.SHARE_FEE_PER_DAY}${T.per_day}`;

  const kmField = licensed ? '' : `<label>${T.km_est} <input name="km" type="number" min="1" max="5000" value="100" required></label>`;

  const reviews = car.reviews.length ? `<section class="reviews"><h2>★</h2>` +
    car.reviews.map(r => `<blockquote>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} <strong>${esc(r.author)}</strong><p>${esc(r.body)}</p></blockquote>`).join('') + `</section>` : '';

  return `
  <section class="stay-hero" style="background:${grad}">
    <div><h1>${esc(car.title)}</h1>
    <p>${esc(car.make_model)} ${car.year} · ${esc(car.city)} · ${T.fuels[car.fuel] || car.fuel} · ${car.seats} ${T.seats} · ${T.owner}: <strong>${esc(car.owner_name)}</strong></p></div>
  </section>
  <section class="stay-cols">
    <div>
      <p class="desc">${esc(description)}</p>
      <div class="flash ${licensed ? 'lic-note' : 'shr-note'}">${licensed ? '📋 ' + T.licensed_explain : '🤝 ' + T.share_explain}</div>
      <div class="badges">
        ${licensed ? `<span class="badge lic">📋 ${T.licensed_badge}</span>` : `<span class="badge shr">🤝 ${T.share_badge}</span>`}
        ${licensed && car.scia_number ? `<span class="badge">SCIA ${esc(car.scia_number)}</span>` : ''}
        ${licensed && car.uso_terzi ? `<span class="badge ok">✓ uso di terzi</span>` : ''}
        ${!licensed ? `<span class="badge zero">${T.reimb_only}</span>` : ''}
        ${car.rca_ok ? `<span class="badge ok">✓ RCA</span>` : ''}
        <span class="badge">${T.min_days(car.min_days)}</span>
      </div>
      <h2>${T.pick_days}</h2>
      <div class="panel room-panel">
        <h3>${priceLine}</h3>
        ${availStrip(car.start_date, car.end_date, car.bookings, lang)}
        <form class="book-form" method="get" action="/book">
          <input type="hidden" name="car" value="${car.id}">
          <label>${T.checkin} <input name="checkin" type="date" required min="${car.start_date}" max="${car.end_date}"></label>
          <label>${T.checkout} <input name="checkout" type="date" required min="${car.start_date}" max="${car.end_date}"></label>
          ${kmField}
          <button>${T.quote_btn}</button>
        </form>
      </div>
    </div>
    <aside class="ledger">
      <h3>${lang === 'it' ? 'Perché il prezzo è questo' : 'Why this price'}</h3>
      <p class="mut">${licensed ? T.lic_note : T.share_note}</p>
    </aside>
  </section>
  ${reviews}`;
}

function validateRange(carId, checkIn, checkOut, lang) {
  const T = t(lang);
  const car = db.getCar(Number(carId));
  if (!car || !checkIn || !checkOut) return { error: T.err_unknown };
  if (!(checkIn < checkOut)) return { error: T.err_dates };
  if (checkIn < car.start_date || checkOut > car.end_date) return { error: T.err_outside(fmtDate(car.start_date, lang), fmtDate(car.end_date, lang)) };
  const days = daysBetween(checkIn, checkOut);
  if (days < car.min_days) return { error: T.err_min_days(car.min_days) };
  return { car, days };
}

function quoteFor(car, days, km, lang) {
  const T = t(lang);
  if (car.mode === 'share') {
    if (!km || km < 1) return { error: T.err_km };
    try { return { quote: shareQuote({ fuel: car.fuel, days, kmTotal: km }) }; }
    catch (e) { return { error: e.message }; }
  }
  return { quote: licensedQuote({ dailyPriceEur: car.daily_price_eur, days }) };
}

function quoteTable(car, q, T) {
  if (q.mode === 'share') {
    return `<table class="fees">
      <tr><td>${T.q_reimb(q.kmTotal)}</td><td>${eur(q.ownerReceives)}</td></tr>
      <tr><td>${T.q_service}</td><td>${eur(q.serviceFee)}</td></tr>
      <tr class="tot"><td>${T.you_pay}</td><td>${eur(q.borrowerPays)}</td></tr>
      <tr><td class="mut">${T.q_owner_gets}</td><td class="mut">${eur(q.ownerReceives)}</td></tr>
    </table><p class="mut">${T.share_note}</p>`;
  }
  return `<table class="fees">
    <tr><td>${T.q_rental(q.days)}</td><td>${eur(q.amountEur)}</td></tr>
    <tr><td>${T.q_renter_fee}</td><td>${eur(q.renterFee)}</td></tr>
    <tr class="tot"><td>${T.you_pay}</td><td>${eur(q.borrowerPays)}</td></tr>
    <tr><td class="mut">${T.q_owner_gets_lic}</td><td class="mut">${eur(q.ownerReceives)}</td></tr>
  </table><p class="mut">${T.lic_note}</p>`;
}

function pageBook(query, lang) {
  const T = t(lang);
  const checkIn = query.get('checkin') || '', checkOut = query.get('checkout') || '';
  const v = validateRange(query.get('car'), checkIn, checkOut, lang);
  if (v.error) return { error: v.error };
  const km = Number(query.get('km')) || 0;
  const qr = quoteFor(v.car, v.days, km, lang);
  if (qr.error) return { error: qr.error };
  const q = qr.quote;
  return { html: `
  <section class="narrow">
    <h1>${T.book_title}</h1>
    <p><strong>${esc(v.car.title)}</strong> ${T.at} ${esc(v.car.city)} — <strong>${fmtDate(checkIn, lang)} → ${fmtDate(checkOut, lang)}</strong> (${T.days(v.days)})</p>
    <div class="split">
      <form class="panel" method="post" action="/book">
        <input type="hidden" name="car" value="${v.car.id}"><input type="hidden" name="checkin" value="${esc(checkIn)}"><input type="hidden" name="checkout" value="${esc(checkOut)}"><input type="hidden" name="km" value="${km}"><input type="hidden" name="lang" value="${lang}">
        <label>${T.your_name} <input name="name" required placeholder="Mario Rossi"></label>
        <label>${T.email} <input name="email" type="email" required placeholder="you@example.com"></label>
        <button>${T.confirm_pay(eur(q.borrowerPays))}</button>
        <p class="mut">${T.demo_checkout}</p>
      </form>
      <aside class="panel receipt">
        <h3>${T.split_title}</h3>
        ${quoteTable(v.car, q, T)}
      </aside>
    </div>
  </section>` };
}

function handleBookPost(form, lang) {
  const T = t(lang);
  const checkIn = form.get('checkin'), checkOut = form.get('checkout');
  const v = validateRange(form.get('car'), checkIn, checkOut, lang);
  if (v.error) return { error: v.error };
  const km = Number(form.get('km')) || 0;
  const qr = quoteFor(v.car, v.days, km, lang);
  if (qr.error) return { error: qr.error };
  const q = qr.quote;
  const ownerAmount = q.ownerReceives;
  const fees = q.mode === 'share' ? q.serviceFee : q.platformRevenue;
  try {
    db.createBooking({ carId: v.car.id, checkIn, checkOut, kmTotal: q.kmTotal || 0, guestName: form.get('name') || 'Guest', guestEmail: form.get('email') || '', ownerAmountEur: ownerAmount, feesEur: fees });
  } catch (e) {
    if (e.code === 'RANGE_TAKEN') return { error: T.err_taken };
    throw e;
  }
  return { ok: true, car: v.car, checkIn, checkOut, days: v.days, q };
}

function pageBooked({ car, checkIn, checkOut, days, q }, lang) {
  const T = t(lang);
  return `
  <section class="narrow center">
    <h1>${T.booked_title}</h1>
    <p><strong>${esc(car.title)}</strong> — ${T.booked_span(fmtDate(checkIn, lang), fmtDate(checkOut, lang), days)}</p>
    <p>${T.you_pay}: <strong>${eur(q.borrowerPays)}</strong>. ${q.mode === 'share' ? T.share_note : T.lic_note}</p>
    <p><a class="btn" href="/car/${car.id}">${T.back_car}</a></p>
  </section>`;
}

function pageHost(result, lang) {
  const T = t(lang);
  const banner = result ? (result.error
    ? `<div class="flash err">${esc(result.error)}</div>`
    : `<div class="flash ok">${T.live_msg} <a href="/car/${result.carId}">${T.view_listing}</a></div>`) : '';
  const fuelOpts = Object.keys(pricing.FUEL_EUR_KM).map(f => `<option value="${f}">${T.fuels[f] || f}</option>`).join('');
  return `
  <section class="narrow">
    <h1>${T.host_title}</h1>
    <p class="sub">${T.host_sub}</p>
    ${banner}
    <form class="panel host-form" method="post" action="/host">
      <input type="hidden" name="lang" value="${lang}">
      <h3>${T.you}</h3>
      <div class="two"><label>${T.name} <input name="ownerName" required></label><label>${T.email} <input name="ownerEmail" type="email" required></label></div>
      <h3>${T.how_share}</h3>
      <label class="check"><input type="radio" name="mode" value="share" checked> 🤝 ${T.type_share_label}</label>
      <label class="check"><input type="radio" name="mode" value="licensed"> 📋 ${T.type_licensed_label}</label>
      <h3>${T.the_car}</h3>
      <label>${T.listing_title} <input name="title" required placeholder="Panda cittadina, sta in cortile a non far niente"></label>
      <div class="two"><label>${T.make_model} <input name="makeModel" required placeholder="Fiat Panda 1.0 Hybrid"></label><label>${T.year_lbl} <input name="year" type="number" min="2000" max="2026" required placeholder="2021"></label></div>
      <div class="two"><label>${T.city_lbl} <input name="city" required placeholder="Milano"></label><label>${T.fuel_type} <select name="fuel">${fuelOpts}</select></label></div>
      <div class="two"><label>${T.seats_lbl} <input name="seats" type="number" min="2" max="9" value="5"></label><label>${T.daily_price_lbl} <input name="dailyPrice" type="number" min="0" placeholder="39"></label></div>
      <label>${T.tell} <textarea name="description" rows="3"></textarea></label>
      <h3>${T.period}</h3>
      <div class="two"><label>${T.from} <input name="start" type="date" required></label><label>${T.to} <input name="end" type="date" required></label></div>
      <label>${T.min_days_lbl} <input name="minDays" type="number" min="1" max="30" value="1"></label>
      <h3>${T.compliance} <span class="mut">${T.compliance_note}</span></h3>
      <label class="check"><input type="checkbox" name="rca" required> ${T.rca_check}</label>
      <label class="check"><input type="checkbox" name="usoTerzi"> ${T.uso_terzi_check}</label>
      <label>${T.scia_lbl} <input name="scia" placeholder="SCIA-BO-2026-0142"></label>
      <button>${T.publish_btn}</button>
    </form>
  </section>`;
}

function handleHostPost(form, lang) {
  const T = t(lang);
  try {
    const mode = form.get('mode') === 'licensed' ? 'licensed' : 'share';
    const payload = {
      ownerName: form.get('ownerName'), ownerEmail: form.get('ownerEmail'),
      title: form.get('title'), makeModel: form.get('makeModel'), year: Number(form.get('year')),
      city: form.get('city'), fuel: form.get('fuel'), mode,
      dailyPriceEur: Number(form.get('dailyPrice')) || 0, seats: Number(form.get('seats')) || 5,
      description: form.get('description'),
      rcaOk: form.get('rca') === 'on', sciaNumber: form.get('scia'), usoTerzi: form.get('usoTerzi') === 'on',
      startDate: form.get('start'), endDate: form.get('end'), minDays: Number(form.get('minDays')) || 1,
    };
    if (!payload.rcaOk) return { error: T.err_rca };
    if (mode === 'licensed' && payload.dailyPriceEur <= 0) return { error: T.err_lic_price };
    if (mode === 'licensed' && !payload.usoTerzi) return { error: T.err_lic_compliance };
    pricing.fuelRate(payload.fuel); // validates fuel type
    return db.createCar(payload);
  } catch (e) { return { error: e.message }; }
}

const HOW = {
  en: `
  <section class="narrow prose">
    <h1>How it works — and where the law actually stands</h1>
    <p>We'll be blunt, because the car version of this idea lives or dies on legal precision: <strong>Turo-style paid peer-to-peer car rental is not currently legal in Italy.</strong> Article 84 of the Codice della Strada reserves "locazione senza conducente" for operators with a SCIA authorisation and vehicles registered for third-party hire; a June 2023 Interior Ministry circular confirmed that paid "sharing" between privates without that authorisation is an offence (€430–1,731 fine, registration document seized). Chiavi is designed around that reality, not against it.</p>
    <h2>Lane 1 — 🤝 Shared at cost (the BlaBlaCar frame)</h2>
    <p>Parliament is processing a bill (PDL C.4059) that amends art. 82 CdS so that lending your car to a third party for up to 30 days for private purposes counts as "uso proprio" — explicitly <em>not</em> a business, <em>not</em> rental — provided the owner receives only <strong>reimbursement of documented expenses</strong>, which doesn't form taxable income. Chiavi's share mode implements exactly that frame today: the platform computes the fuel cost per km, tolls and parking pass through at cost, and the owner <em>cannot</em> receive anything above documented costs — the software refuses it. The owner's profit is zero by construction; our revenue is a flat borrower-paid service fee. This is the most conservative reading available, and it converts into the codified regime the day the bill passes.</p>
    <h2>Lane 2 — 📋 Licensed rental (art. 84, done for you)</h2>
    <p>For owners who want actual income, the fully legal path exists today: file a SCIA for "locazione senza conducente", register the vehicle "uso di terzi", invoice the rentals. It's paperwork nobody does alone — so Chiavi does it for them (onboarding service), then gives them the marketplace. A one-car licensed micro-rental undercuts airport chains by 50–60% and is untouchable by the 2023 circular, because it is precisely what art. 84 asks for.</p>
    <h2>Insurance</h2>
    <p>The owner's RCA follows the vehicle and covers any licensed driver, but sharing use must be disclosed; production adds a per-booking motor cover (partnership) so the owner's bonus-malus is never exposed. Odometer photos at pickup/return settle the km objectively.</p>
    <h2>Honesty box</h2>
    <p>Share mode's zero-profit rule limits supply motivation — its pitch is "your neighbour stops losing money on a parked car", not "earn income". The income story belongs to Lane 2, which is why the SCIA-as-a-service funnel is the business. Full legal memo in <code>docs/LEGAL.md</code>; counsel opinion is a pre-launch gate. Not legal advice.</p>
  </section>`,
  it: `
  <section class="narrow prose">
    <h1>Come funziona — e cosa dice davvero la legge</h1>
    <p>Parliamo chiaro, perché la versione automobilistica di questa idea vive o muore sulla precisione legale: <strong>il noleggio a pagamento tra privati stile Turo oggi in Italia non è legale.</strong> L'articolo 84 del Codice della Strada riserva la "locazione senza conducente" a chi ha una SCIA e un veicolo immatricolato per l'uso di terzi; una circolare del Ministero dell'Interno del giugno 2023 ha confermato che la "condivisione" a pagamento tra privati senza quell'autorizzazione è un illecito (sanzione €430–1.731 e ritiro della carta di circolazione). Chiavi è progettata attorno a questa realtà, non contro.</p>
    <h2>Corsia 1 — 🤝 Condivisa a costo (la cornice BlaBlaCar)</h2>
    <p>In Parlamento c'è una proposta (PDL C.4059) che modifica l'art. 82 CdS: prestare l'auto a terzi fino a 30 giorni per fini privati rientra nell'"uso proprio" — esplicitamente <em>non</em> impresa, <em>non</em> noleggio — purché il proprietario riceva solo il <strong>rimborso delle spese documentate</strong>, che non fa reddito. La modalità condivisa di Chiavi implementa esattamente quella cornice, da oggi: la piattaforma calcola il costo carburante al km, pedaggi e sosta passano al costo, e il proprietario <em>non può</em> ricevere più delle spese documentate — il software lo rifiuta. Il profitto del proprietario è zero per costruzione; il nostro ricavo è una commissione fissa pagata da chi guida. È la lettura più prudente disponibile, e diventa il regime codificato il giorno in cui la legge passa.</p>
    <h2>Corsia 2 — 📋 Noleggio con licenza (l'art. 84, fatto per te)</h2>
    <p>Per chi vuole un reddito vero, la strada pienamente legale esiste già oggi: SCIA per la "locazione senza conducente", veicolo reimmatricolato "uso di terzi", fattura sui noleggi. È burocrazia che nessuno fa da solo — quindi la facciamo noi (servizio di onboarding), e poi diamo il marketplace. Un micro-noleggio con licenza batte le catene aeroportuali del 50–60% ed è inattaccabile dalla circolare 2023, perché è esattamente ciò che l'art. 84 richiede.</p>
    <h2>Assicurazione</h2>
    <p>La RCA segue il veicolo e copre qualsiasi conducente patentato, ma l'uso condiviso va comunicato; in produzione si aggiunge una copertura per prenotazione (partnership) così il bonus-malus del proprietario non si tocca mai. Le foto del contachilometri alla consegna e al ritiro chiudono i km in modo oggettivo.</p>
    <h2>Cassetta dell'onestà</h2>
    <p>La regola del profitto-zero limita la motivazione dell'offerta in modalità condivisa — il suo argomento è «il tuo vicino smette di perdere soldi su un'auto ferma», non «guadagna». La storia del reddito appartiene alla Corsia 2, ed è per questo che il funnel SCIA-as-a-service è il business. Memo legale completo in <code>docs/LEGAL.md</code>; parere di un legale come requisito pre-lancio. Non è consulenza legale.</p>
  </section>`,
};

const INVESTOR_COPY = {
  en: {
    title: 'Chiavi — the numbers', sub: 'Live marketplace metrics (seeded pilot) + an interactive 3-year model. The sliders are the assumptions.',
    gmv: 'GMV', revenue: 'Net revenue', bookings: 'Bookings', take: 'Blended take', days: 'Rental days', cars: 'Cars listed',
    by_mode: 'By mode', mode: 'Mode', mode_share: '🤝 Shared at cost', mode_lic: '📋 Licensed', by_city: 'By city', city: 'City',
    why_now: 'Why now',
    why: ['The 2023 Interior Ministry circular froze the grey-zone players — compliant supply is the only supply that scales.',
      'PDL C.4059 would codify cost-only sharing; Chiavi is built as its reference implementation, live before the vote.',
      'Airport rental prices hit records (€90+/day in summer islands); a licensed one-car operator undercuts them 50–60%.',
      'SCIA-as-a-service is recurring, defensible revenue nobody else offers — the licensed funnel is the moat.'],
    model_title: 'Interactive 3-year model',
    s_cars: 'Licensed cars, Y1', s_days: 'Rental days sold per car / yr', s_price: 'Avg daily rate €', s_take: 'Take rate %', s_onb: 'Onboarding fee €', s_growth: 'YoY growth ×',
    year: 'Year', col_cars: 'Cars', col_days: 'Days', col_rev: 'Net revenue',
    note: 'Model covers the licensed lane only (share mode adds flat-fee revenue on top, treated as upside). Onboarding fee charged once per new car. Growth applies to fleet size.',
  },
  it: {
    title: 'Chiavi — i numeri', sub: 'Metriche live del marketplace (pilota) + modello interattivo a 3 anni. Gli slider sono le assunzioni.',
    gmv: 'GMV', revenue: 'Ricavi netti', bookings: 'Prenotazioni', take: 'Take combinato', days: 'Giorni noleggiati', cars: 'Auto in piattaforma',
    by_mode: 'Per modalità', mode: 'Modalità', mode_share: '🤝 Condivise a costo', mode_lic: '📋 Con licenza', by_city: 'Per città', city: 'Città',
    why_now: 'Perché ora',
    why: ['La circolare del Viminale 2023 ha congelato gli operatori in zona grigia — l\'offerta conforme è l\'unica che scala.',
      'La PDL C.4059 codificherebbe la condivisione a solo costo; Chiavi nasce come sua implementazione di riferimento, online prima del voto.',
      'I prezzi degli autonoleggi in aeroporto sono ai record (€90+/giorno d\'estate nelle isole); un micro-noleggio con licenza li batte del 50–60%.',
      'La SCIA-as-a-service è un ricavo ricorrente e difendibile che nessuno offre — il funnel delle licenze è il fossato.'],
    model_title: 'Modello interattivo a 3 anni',
    s_cars: 'Auto con licenza, A1', s_days: 'Giorni noleggiati per auto / anno', s_price: 'Tariffa media al giorno €', s_take: 'Take rate %', s_onb: 'Fee di onboarding €', s_growth: 'Crescita annua ×',
    year: 'Anno', col_cars: 'Auto', col_days: 'Giorni', col_rev: 'Ricavi netti',
    note: 'Il modello copre solo la corsia con licenza (la modalità condivisa aggiunge ricavi a commissione fissa, trattati come upside). Fee di onboarding una tantum per auto nuova. La crescita si applica alla flotta.',
  },
};

function pageInvestors(lang) {
  const C = INVESTOR_COPY[lang] || INVESTOR_COPY.en;
  const m = db.metrics();
  const modeName = { share: C.mode_share, licensed: C.mode_lic };
  const types = m.byMode.map(r => `<tr><td>${modeName[r.mode] || r.mode}</td><td>${r.bookings}</td><td>${eur(r.gmv)}</td><td>${eur(r.revenue)}</td></tr>`).join('');
  const cities = m.byCity.map(r => `<tr><td>${esc(r.city)}</td><td>${r.bookings}</td><td>${eur(r.gmv)}</td></tr>`).join('');
  return `
  <section class="narrow">
    <h1>${C.title}</h1>
    <p class="sub">${C.sub}</p>
    <div class="kpis">
      <div class="kpi"><p class="big">${eur(m.gmv)}</p><p class="mut">${C.gmv}</p></div>
      <div class="kpi"><p class="big">${eur(m.revenue)}</p><p class="mut">${C.revenue}</p></div>
      <div class="kpi"><p class="big">${m.bookings}</p><p class="mut">${C.bookings}</p></div>
      <div class="kpi"><p class="big">${Math.round(m.days)}</p><p class="mut">${C.days}</p></div>
      <div class="kpi"><p class="big">${m.takeRate.toFixed(1)}%</p><p class="mut">${C.take}</p></div>
      <div class="kpi"><p class="big">${m.cars}</p><p class="mut">${C.cars}</p></div>
    </div>
    <div class="split">
      <div class="panel"><h3>${C.by_mode}</h3><table class="fees"><tr><th>${C.mode}</th><th>${C.bookings}</th><th>${C.gmv}</th><th>${C.revenue}</th></tr>${types}</table>
        <h3>${C.by_city}</h3><table class="fees"><tr><th>${C.city}</th><th>${C.bookings}</th><th>${C.gmv}</th></tr>${cities}</table></div>
      <div class="panel"><h3>${C.why_now}</h3><ul class="tight">${C.why.map(w => `<li>${w}</li>`).join('')}</ul></div>
    </div>
    <h2>${C.model_title}</h2>
    <div class="panel model">
      <div class="sliders">
        <label>${C.s_cars} <output id="o-cars">150</output><input type="range" id="in-cars" min="25" max="1000" step="25" value="150"></label>
        <label>${C.s_days} <output id="o-days">80</output><input type="range" id="in-days" min="20" max="200" step="10" value="80"></label>
        <label>${C.s_price} <output id="o-price">42</output><input type="range" id="in-price" min="25" max="90" step="1" value="42"></label>
        <label>${C.s_take} <output id="o-take">15</output><input type="range" id="in-take" min="8" max="20" step="1" value="15"></label>
        <label>${C.s_onb} <output id="o-onb">290</output><input type="range" id="in-onb" min="0" max="600" step="10" value="290"></label>
        <label>${C.s_growth}<output id="o-growth">3.5</output><input type="range" id="in-growth" min="2" max="8" step="0.5" value="3.5"></label>
      </div>
      <table class="fees" id="model-table"></table>
      <div id="model-bars" class="bars"></div>
      <p class="mut">${C.note}</p>
    </div>
  </section>
  <script>
  var L={year:'${C.year}',cars:'${C.col_cars}',days:'${C.col_days}',gmv:'GMV',rev:'${C.col_rev}'};
  function fmt(n){return '€'+Math.round(n).toLocaleString('en-IE')}
  function recalc(){
    var cars=+document.getElementById('in-cars').value, dd=+document.getElementById('in-days').value,
      price=+document.getElementById('in-price').value, take=+document.getElementById('in-take').value/100,
      onb=+document.getElementById('in-onb').value, g=+document.getElementById('in-growth').value;
    ['cars','days','price','take','onb','growth'].forEach(function(k){
      var el=document.getElementById('in-'+k); document.getElementById('o-'+k).textContent=el.value;});
    var rows='<tr><th></th><th>'+L.cars+'</th><th>'+L.days+'</th><th>'+L.gmv+'</th><th>'+L.rev+'</th></tr>', bars='';
    var prev=0, maxRev=0, res=[];
    for(var y=1;y<=3;y++){
      var c=Math.round(cars*Math.pow(g,y-1)), newCars=c-prev; prev=c;
      var days=c*dd, gmv=days*price, rev=gmv*take+newCars*onb;
      res.push([y,c,days,gmv,rev]); if(rev>maxRev)maxRev=rev;
    }
    res.forEach(function(r){
      rows+='<tr><td>'+L.year+' '+r[0]+'</td><td>'+r[1].toLocaleString()+'</td><td>'+r[2].toLocaleString()+'</td><td>'+fmt(r[3])+'</td><td><strong>'+fmt(r[4])+'</strong></td></tr>';
      bars+='<div class="bar-row"><span>'+r[0]+'</span><div class="bar"><div style="width:'+Math.max(2,(r[4]/maxRev*100))+'%"></div></div><span>'+fmt(r[4])+'</span></div>';
    });
    document.getElementById('model-table').innerHTML=rows;
    document.getElementById('model-bars').innerHTML=bars;
  }
  document.querySelectorAll('.sliders input').forEach(function(i){i.addEventListener('input',recalc)});
  recalc();
  </script>`;
}

// ---------------------------------------------------------------- server

function send(res, status, html, type = 'text/html; charset=utf-8', extraHeaders = {}) {
  res.writeHead(status, { 'Content-Type': type, ...extraHeaders });
  res.end(html);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => resolve(new URLSearchParams(data)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const p = url.pathname;
    const lang = pickLang(url, req);
    const T = t(lang);
    const headers = url.searchParams.get('lang')
      ? { 'Set-Cookie': `lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax` } : {};
    const page = (title, body, opts = {}) =>
      send(res, opts.status || 200, layout(title, body, { lang, path: req.url, ...opts }), 'text/html; charset=utf-8', headers);

    if (p === '/style.css') return send(res, 200, fs.readFileSync(path.join(__dirname, 'public', 'style.css')), 'text/css');
    if (p === '/healthz') return send(res, 200, 'ok', 'text/plain');
    if (p === '/') return page(T.hero_title, pageHome(url.searchParams, lang), { active: 'search' });
    if (p === '/how-it-works') return page(T.nav_how, HOW[lang] || HOW.en, { active: 'how' });
    if (p === '/investors') return page(T.nav_investors, pageInvestors(lang), { active: 'investors' });
    if (p === '/api/metrics') return send(res, 200, JSON.stringify(db.metrics(), null, 2), 'application/json');

    let m;
    if ((m = p.match(/^\/car\/(\d+)$/))) {
      const body = pageCar(Number(m[1]), lang);
      return body ? page('Chiavi', body, { active: 'search' }) : page('404', '<section class="narrow"><h1>404</h1></section>', { status: 404 });
    }
    if (p === '/book' && req.method === 'GET') {
      const r = pageBook(url.searchParams, lang);
      if (r.error) return page(T.cant_book, `<section class="narrow"><h1>${T.cant_book}</h1><div class="flash err">${esc(r.error)}</div><p><a href="javascript:history.back()">←</a></p></section>`, { status: 400 });
      return page(T.book_title, r.html, { active: 'search' });
    }
    if (p === '/book' && req.method === 'POST') {
      const form = await readBody(req);
      const postLang = ['it', 'en'].includes(form.get('lang')) ? form.get('lang') : lang;
      const result = handleBookPost(form, postLang);
      if (result.error) return send(res, 400, layout(t(postLang).cant_book, `<section class="narrow"><h1>${t(postLang).cant_book}</h1><div class="flash err">${esc(result.error)}</div></section>`, { lang: postLang, path: '/' }));
      return send(res, 200, layout('OK', pageBooked(result, postLang), { lang: postLang, path: '/' }));
    }
    if (p === '/host' && req.method === 'GET') return page(T.host_title, pageHost(null, lang), { active: 'host' });
    if (p === '/host' && req.method === 'POST') {
      const form = await readBody(req);
      const postLang = ['it', 'en'].includes(form.get('lang')) ? form.get('lang') : lang;
      return send(res, 200, layout(t(postLang).host_title, pageHost(handleHostPost(form, postLang), postLang), { lang: postLang, path: '/host', active: 'host' }));
    }

    page('404', '<section class="narrow"><h1>404</h1><p><a href="/">←</a></p></section>', { status: 404 });
  } catch (e) {
    console.error(e);
    send(res, 500, layout('Error', `<section class="narrow"><h1>Something broke</h1><pre>${esc(e.message)}</pre></section>`));
  }
});

if (require.main === module) {
  const result = require('./lib/seed').seed();
  console.log(result.seeded ? `seeded ${result.cars} cars (fresh database)` : `database ready (${result.cars} cars)`);
  server.listen(PORT, () => console.log(`chiavi. listening on http://localhost:${PORT}`));
}

module.exports = { server };
