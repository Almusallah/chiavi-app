// Pricing engine — the legal core of Chiavi.
//
// Two modes, two legal bases:
//   'share'    — expense-reimbursement sharing (aligned with PDL C.4059:
//                temporary sharing ≤30 days is "uso proprio", NOT rental;
//                the owner may receive ONLY documented expense reimbursement
//                — fuel per km, tolls, parking — never a price. The platform
//                computes the reimbursement and the owner cannot exceed it.
//                Platform revenue = flat service fee paid by the borrower.)
//   'licensed' — authorised rental (art. 84 CdS): the owner holds a SCIA and
//                the vehicle is registered "uso di terzi — locazione senza
//                conducente". Market pricing is legal; platform takes
//                12% renter + 3% owner.
'use strict';

const MS_DAY = 24 * 3600 * 1000;
const MAX_SHARE_DAYS = 30;           // PDL C.4059 ceiling for "uso proprio" sharing
const SHARE_FEE_PER_DAY = 3;         // € — borrower-paid platform service fee
const RENTER_FEE_PCT = 0.12;
const OWNER_FEE_PCT = 0.03;

// Reimbursable fuel/energy cost per km by fuel type (€/km), conservative
// national averages; production recalculates from live fuel prices and the
// car's declared consumption.
const FUEL_EUR_KM = { benzina: 0.125, diesel: 0.105, gpl: 0.065, metano: 0.055, ibrida: 0.085, elettrica: 0.045 };

function daysBetween(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');
  const days = Math.round((end - start) / MS_DAY);
  if (!Number.isFinite(days) || days < 1) {
    throw new Error(`period must span at least one day (${startDate} → ${endDate})`);
  }
  return days;
}

function fuelRate(fuel) {
  const r = FUEL_EUR_KM[fuel];
  if (!r) throw new Error(`unknown fuel type: ${fuel}`);
  return r;
}

/**
 * 'share' mode quote: pure expense reimbursement, zero owner margin.
 * amount = fuel €/km × km; the borrower additionally pays the flat platform
 * fee. Tolls/parking are settled at cost in production (receipts).
 */
function shareQuote({ fuel, days, kmTotal }) {
  if (days < 1) throw new Error('at least one day');
  if (days > MAX_SHARE_DAYS) throw new Error(`sharing is capped at ${MAX_SHARE_DAYS} days (PDL C.4059 'uso proprio' ceiling)`);
  if (kmTotal < 1) throw new Error('km must be > 0');
  const reimbursement = round2(fuelRate(fuel) * kmTotal);
  const serviceFee = round2(SHARE_FEE_PER_DAY * days);
  return {
    mode: 'share', days, kmTotal,
    ownerReceives: reimbursement,       // exactly documented cost, never more
    serviceFee,
    borrowerPays: round2(reimbursement + serviceFee),
    platformRevenue: serviceFee,
    eurPerKm: fuelRate(fuel),
  };
}

/** 'licensed' mode quote: market daily price, standard marketplace take. */
function licensedQuote({ dailyPriceEur, days }) {
  if (days < 1) throw new Error('at least one day');
  if (dailyPriceEur <= 0) throw new Error('price must be > 0');
  const amount = round2(dailyPriceEur * days);
  const renterFee = round2(amount * RENTER_FEE_PCT);
  const ownerFee = round2(amount * OWNER_FEE_PCT);
  return {
    mode: 'licensed', days,
    amountEur: amount,
    renterFee, ownerFee,
    borrowerPays: round2(amount + renterFee),
    ownerReceives: round2(amount - ownerFee),
    platformRevenue: round2(renterFee + ownerFee),
  };
}

/** Owner ledger for 'share' cars: reimbursements are cost pass-throughs. */
function shareLedger(bookings) {
  const reimbursed = round2(bookings.reduce((s, b) => s + b.owner_amount_eur, 0));
  const km = bookings.reduce((s, b) => s + (b.km_total || 0), 0);
  return { reimbursedEur: reimbursed, kmShared: km, profitEur: 0 }; // profit is zero by construction
}

function round2(n) { return Math.round(n * 100) / 100; }

module.exports = { daysBetween, fuelRate, shareQuote, licensedQuote, shareLedger, FUEL_EUR_KM, MAX_SHARE_DAYS, SHARE_FEE_PER_DAY };
