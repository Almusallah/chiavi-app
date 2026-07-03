# Business model

*Versione italiana: [BUSINESS_MODEL.it.md](BUSINESS_MODEL.it.md)*

## One line

Chiavi puts Italy's 39 million parked cars to work through the only two doors the law
leaves open: **expense-reimbursement sharing** (zero owner profit, software-enforced —
the frame of pending law PDL C.4059) and **licensed peer rental**, where Chiavi turns a
private owner into a one-car licensed operator (SCIA + "uso di terzi" re-registration,
done as a service) and runs the marketplace at a 15% take.

## Why the legal constraint IS the business

Turo-style paid P2P is illegal in Italy today (art. 84 CdS; Interior Ministry circular,
June 2023) — which froze every grey-zone player. That leaves a vacuum with demand on both
sides: airport rental counters hit €90+/day in summer; owners hold cars used 4% of the
time. The only scalable position is **compliance-first**: nobody else files the SCIA for
the owner, and no incumbent (Airbnb-style OTA or grey P2P platform) can copy it without
rebuilding their supply model. The 2023 circular is our market-clearing event; PDL C.4059,
if passed, opens the second lane wide — with Chiavi already live as its reference
implementation.

## The two lanes

| | 🤝 Shared at cost | 📋 Licensed rental |
|---|---|---|
| Legal basis | PDL C.4059 frame (uso proprio ≤30 days, reimbursement only), most conservative reading today | art. 84 CdS — SCIA + "uso di terzi", fully legal now |
| Owner earns | €0 by construction (fuel/km + tolls at cost) | Market price, invoiced |
| Platform revenue | €3/day borrower service fee | 15% take (12% renter + 3% owner) + €290 one-time onboarding |
| Role in strategy | Community wedge, supply funnel, insurance attach | **The business** — recurring GMV + onboarding fees |

Lane 1 is deliberately non-monetary for owners: its pitch is "your neighbour stops losing
money on a parked car", it builds the user base and the trust layer, and every share-mode
owner is a qualified lead for the licensed funnel ("you lent it 20 days this year — with a
licence that's €800/month").

## Unit economics (licensed lane)

- Avg daily rate €42 (vs €70–90 airport chains) · 80 rental days/car/year →
  **€3,360 GMV/car/yr** → **€504/yr platform take** + **€290 onboarding** (one-time;
  direct filing costs ≤ €150, done in-house at scale).
- Owner nets ~€3,100/yr minus the uso-terzi insurance uplift (~€400–700) → **€2,300–2,700
  net income per car** — a real number no legal alternative offers a private owner today.
- CAC: owner-side near zero at pilot scale (waiting lists from the share lane, driving
  schools, condo groups); renter-side €18 target (SEO "noleggio auto economico + città",
  airport-price outrage content).

## Market sizing (bottom-up)

- Italy: ~39M passenger cars; conservatively 2% are second/under-used cars whose owners
  would consider monetising with paperwork handled → **~780k candidate vehicles**.
- Realistic licensed penetration Y5: 0.5% of candidates → ~4k cars → **€13M GMV,
  €2M/yr platform revenue** from the marketplace alone, plus onboarding.
- Reference markets: Turo runs >350k active vehicles in the US/UK/FR; Getaround peaked
  at ~50k in Europe. Italy is the largest EU car market with **zero** legal P2P supply —
  a whitespace created by regulation, not by absence of demand.
- Adjacent expansions: campers (the segment the 2023 circular hit hardest — highest
  prices, most motivated owners), vans, classic cars for events.

## Three-year base case (matches the live model at /investors)

Assumptions: 150 licensed cars Y1, 80 rental days/car/yr, €42 avg daily, 15% take,
€290 onboarding per new car, 3.5× YoY fleet growth. Share lane treated as upside (flat
fees + funnel), not modelled.

| | Licensed cars | Rental days | GMV | Net revenue |
|---|---|---|---|---|
| **Y1 — Milano, Bologna, Roma, Cagliari** | 150 | 12,000 | €504k | €119k |
| **Y2 — top-10 cities + airports** | 525 | 42,000 | €1.76M | €373k |
| **Y3 — national + campers** | 1,838 | 147,000 | €6.2M | €1.31M |

## Funding & exit

- **Seed ask: €900k**, 18 months: compliance-ops team (SCIA pipeline), insurance
  partnership, 2 engineers, counsel opinions, city-by-city launch playbook.
- **M&A logic**: Ayvens/Leasys (fleet giants buying utilisation tech), UnipolSai/Generali
  (insurance distribution + telematics), Telepass (mobility super-app), **Turo/Getaround**
  (entering Italy means buying the only compliant supply), ACI itself (member services).
  The acquisition asset is the **licensed-owner network + SCIA pipeline** — supply that
  cannot be scraped or fast-followed.

## Kill criteria (what must be true)

1. SCIA filing works for private individuals in pilot comuni in ≤4 weeks, ≤€300 all-in.
2. ≥30% of share-lane owners convert to licensed within 12 months.
3. Uso-terzi insurance uplift stays under €700/yr via partnership.
4. Counsel blesses Lane 1 as implemented (or comodato fallback holds).
Failing 1 or 3 kills the licensed lane's economics; failing both lanes kills the company.
We test all four with the seed money, publicly.
