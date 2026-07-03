'use strict';

const { t } = require('./i18n');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function eur(n) {
  return '€' + Number(n).toLocaleString('en-IE', { maximumFractionDigits: n < 10 ? 2 : 0 });
}

function fmtDate(iso, lang = 'en') {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function addDays(iso, n) {
  return new Date(new Date(iso + 'T00:00:00Z').getTime() + n * 86400000).toISOString().slice(0, 10);
}

const VIBES = {
  city: 'linear-gradient(135deg,#166534,#4ade80)',
  fun: 'linear-gradient(135deg,#b45309,#fbbf24)',
  family: 'linear-gradient(135deg,#1d4ed8,#67e8f9)',
  ev: 'linear-gradient(135deg,#0f766e,#5eead4)',
  van: 'linear-gradient(135deg,#7c2d12,#fb923c)',
};

function langUrl(path, lang) {
  const [p, qs] = path.split('?');
  const params = new URLSearchParams(qs || '');
  params.set('lang', lang);
  return `${p}?${params}`;
}

function layout(title, body, { active = '', lang = 'en', path = '/' } = {}) {
  const T = t(lang);
  const nav = [
    ['/', T.nav_search, 'search'],
    ['/host', T.nav_host, 'host'],
    ['/how-it-works', T.nav_how, 'how'],
    ['/investors', T.nav_investors, 'investors'],
  ].map(([href, label, key]) =>
    `<a href="${href}" class="${key === active ? 'active' : ''}">${label}</a>`).join('');
  const otherLang = lang === 'it' ? 'en' : 'it';
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Chiavi</title>
<link rel="stylesheet" href="/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='80'>🔑</text></svg>">
</head>
<body>
<header class="site">
  <a class="brand" href="/">chiavi<span>.</span></a>
  <nav>${nav}<a class="lang" href="${esc(langUrl(path, otherLang))}">${T.lang_switch}</a></nav>
</header>
<main>${body}</main>
<footer class="site">
  <div>
    <strong>chiavi.</strong> — ${T.tagline}
    <p class="mut">${T.footer_note} <a href="/how-it-works">${T.footer_legal}</a>.</p>
  </div>
</footer>
</body>
</html>`;
}

function carCard(c, lang = 'en', pricing) {
  const T = t(lang);
  const grad = VIBES[c.vibe] || VIBES.city;
  const rating = c.rating ? `★ ${Number(c.rating).toFixed(1)} <span class="mut">(${c.review_count})</span>` : `<span class="mut">${T.new_label}</span>`;
  const licensed = c.mode === 'licensed';
  const price = licensed
    ? `${eur(c.daily_price_eur)}<span class="mut">${T.per_day}</span>`
    : `${eur(pricing.fuelRate(c.fuel))}<span class="mut">${T.per_km}</span>`;
  const modeBadge = licensed
    ? `<span class="badge lic">📋 ${T.licensed_badge}</span>`
    : `<span class="badge shr">🤝 ${T.share_badge}</span>`;
  return `<a class="card" href="/car/${c.id}">
    <div class="thumb" style="background:${grad}"><span class="loc">${esc(c.city)}</span></div>
    <div class="card-body">
      <h3>${esc(c.title)}</h3>
      <p class="mut">${esc(c.make_model)} ${c.year} · ${T.fuels[c.fuel] || c.fuel} · ${c.seats} ${T.seats}</p>
      <p class="meta"><span class="price">${price}</span> <span>${rating}</span></p>
      <p>${modeBadge}</p>
      ${licensed ? '' : `<p class="badge zero">${T.reimb_only}</p>`}
    </div>
  </a>`;
}

function availStrip(startDate, endDate, bookings, lang = 'en') {
  const cells = [];
  let d = startDate;
  while (d < endDate) {
    const booked = bookings.find(b => b.check_in <= d && d < b.check_out);
    cells.push(`<i class="${booked ? 'x' : ''}" title="${esc(fmtDate(d, lang))}"></i>`);
    d = addDays(d, 1);
  }
  return `<div class="strip">${cells.join('')}</div>
  <div class="strip-labels"><span>${fmtDate(startDate, lang)}</span><span>${fmtDate(addDays(endDate, -1), lang)}</span></div>`;
}

module.exports = { esc, eur, fmtDate, addDays, layout, carCard, availStrip, VIBES };
