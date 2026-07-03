'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { daysBetween, fuelRate, shareQuote, licensedQuote, shareLedger, MAX_SHARE_DAYS } = require('../lib/pricing');

test('daysBetween counts days', () => {
  assert.equal(daysBetween('2026-07-08', '2026-07-10'), 2);
  assert.throws(() => daysBetween('2026-07-08', '2026-07-08'));
});

test('share quote is pure cost pass-through — owner profit is zero', () => {
  // hybrid 0.085 €/km × 200 km = €17 to the owner; €3/day × 2 days platform fee
  const q = shareQuote({ fuel: 'ibrida', days: 2, kmTotal: 200 });
  assert.equal(q.ownerReceives, 17);
  assert.equal(q.serviceFee, 6);
  assert.equal(q.borrowerPays, 23);
  assert.equal(q.platformRevenue, 6);
});

test('share mode enforces the 30-day PDL C.4059 ceiling', () => {
  assert.throws(() => shareQuote({ fuel: 'benzina', days: MAX_SHARE_DAYS + 1, kmTotal: 100 }), /30 days/);
  assert.ok(shareQuote({ fuel: 'benzina', days: MAX_SHARE_DAYS, kmTotal: 100 }));
});

test('unknown fuel type is rejected', () => {
  assert.throws(() => fuelRate('kerosene'));
});

test('licensed quote: 12% renter + 3% owner = 15% take', () => {
  const q = licensedQuote({ dailyPriceEur: 40, days: 3 });
  assert.equal(q.amountEur, 120);
  assert.equal(q.borrowerPays, 134.4);
  assert.equal(q.ownerReceives, 116.4);
  assert.equal(q.platformRevenue, 18);
  assert.ok(Math.abs(q.platformRevenue / q.amountEur - 0.15) < 1e-9);
});

test('share ledger reports zero profit by construction', () => {
  const l = shareLedger([{ owner_amount_eur: 17, km_total: 200 }, { owner_amount_eur: 8.5, km_total: 100 }]);
  assert.equal(l.reimbursedEur, 25.5);
  assert.equal(l.kmShared, 300);
  assert.equal(l.profitEur, 0);
});
