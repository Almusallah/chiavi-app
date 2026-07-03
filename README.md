# chiavi.

**Your car sits still 23 hours a day.** Two legal ways to put Italy's parked cars to work
— because the obvious third way (Turo-style paid P2P) is currently **illegal in Italy**
(art. 84 CdS + Interior Ministry circular, June 2023), and that constraint is the product:

- **🤝 Shared at cost** — up to 30 days, the borrower reimburses only documented expenses
  (fuel per km at a platform-computed rate, tolls, parking). The owner earns €0 *by
  construction* — the exact frame of pending law PDL C.4059. Platform revenue: flat €3/day
  borrower service fee.
- **📋 Licensed rental** — Chiavi files the SCIA and handles the "uso di terzi"
  re-registration, turning a private owner into a legal one-car rental operator who sets
  market prices (≈50% below airport chains). 15% take + €290 onboarding. Fully legal today;
  nobody else does the paperwork — that's the moat.

Zero-dependency MVP (Node ≥23.4, `node:sqlite`), fully bilingual EN/IT, self-seeding DB.

## Run it

```bash
npm run seed    # reset + seed pilot inventory (Milano, Bologna, Roma, Cagliari)
npm start       # http://localhost:4880
npm test        # pricing-engine unit tests
```

## Tour (for a demo / pitch)

| URL | What to show |
|---|---|
| `/` | Search with mode filter; share cards show €/km + "owner earns €0", licensed cards show €/day + SCIA badge |
| `/car/1` | Share mode: availability day-strip, date+km quote, zero-profit explainer |
| `/car/3` | Licensed mode: SCIA number + "uso di terzi" badges, market pricing |
| `/book?car=1&checkin=2026-07-21&checkout=2026-07-23&km=200` | Transparent reimbursement quote (fuel + flat fee) |
| `/host` | Owner onboarding: choose lane, RCA gate, SCIA/uso-terzi gate for licensed listings |
| `/how-it-works` | The blunt legal story, both lanes, both languages |
| `/investors` | Live metrics by mode + interactive 3-year model (licensed-lane economics) |
| `/api/metrics` | JSON metrics |

## The mechanism that matters

`lib/pricing.js` — the legal engine:

- `shareQuote` — reimbursement = fuel €/km × km; owner cannot receive more; 30-day hard cap
- `licensedQuote` — market price × days; 12% + 3% take
- `shareLedger` — owner profit is zero by construction, and the ledger proves it
- transactional overlap check on bookings; odometer-photo settlement planned

## Docs

- [docs/LEGAL.md](docs/LEGAL.md) — the honest legal memo (art. 84, 2023 circular, PDL C.4059, sources)
- [docs/BUSINESS_MODEL.md](docs/BUSINESS_MODEL.md) — two lanes, unit economics, 3-year case (English)
- [docs/BUSINESS_MODEL.it.md](docs/BUSINESS_MODEL.it.md) — modello di business (italiano)

## Languages & deploy

Bilingual EN/IT throughout (`lib/i18n.js`): Accept-Language auto-detection, nav toggle,
`?lang=` override. Ships a [render.yaml](render.yaml) blueprint (free tier, Node 23.9,
`/healthz`); the DB self-seeds on an empty disk, so ephemeral filesystems are fine.

## Status

MVP demo: payments simulated, ID/licence verification stubbed, insurance partnership and
odometer settlement on the roadmap. "Chiavi" is a working name pending trademark clearance.
Counsel opinion on the share lane is a pre-launch gate — see the kill criteria in the
business model.
