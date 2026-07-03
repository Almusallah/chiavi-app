# Legal model — Italy (the honest version)

> Working memo, not legal advice. A written opinion from Italian mobility/administrative
> counsel is a pre-launch gate. Sources linked at the bottom.

## The headline finding

**Paid peer-to-peer car rental (Turo-style) is not currently legal in Italy.**

- **Art. 84 Codice della Strada** reserves *locazione senza conducente* to operators who
  have filed a **SCIA** and whose vehicles are registered **"uso di terzi — da locare senza
  conducente"**. Using a vehicle not so registered for rental carries a fine of
  **€430–1,731 and seizure of the carta di circolazione**.
- A **Ministero dell'Interno circular of 9 June 2023** confirmed that paid "sharing"
  between privates — including platform-mediated camper and car sharing — constitutes
  unauthorised *locazione senza conducente*. Enforcement has hit camper sharing hardest.
- The incumbent P2P platform (Auting) operates in this contested space — it even holds a
  MASE (Environment Ministry) patronage from 2023, illustrating that the Italian state is
  split on the question. Ambiguity is not a business model; it is the thing the 2023
  circular punishes.

## The pending law that changes the game

**PDL C.4059** (Camera dei Deputati) amends **art. 82 co. 4 CdS** so that *uso proprio*
includes "temporary sharing, for a period not exceeding thirty days, of a private vehicle
in favour of third parties who use it for private purposes". Key features:

- Explicitly **not** a professional activity, **not** an enterprise, **not** a rental service;
- The owner may receive only **reimbursement of additional documented expenses**
  (fuel, tolls, parking); those amounts **do not form taxable income**;
- Earlier proposals in the same line: PDL C.859 (2019, De Lorenzis) for P2P car sharing
  and C.930 for carpooling.

This is BlaBlaCar's cost-sharing construction, written into the highway code. It is not
law yet — that is both the risk and the opportunity.

## Chiavi's two-lane design

### Lane 1 — 'share' (expense reimbursement only)
Implements the PDL C.4059 frame *today*, in its most conservative reading:
1. **Zero owner profit, by construction.** The platform computes the fuel cost per km
   (by fuel type; production uses live prices + the car's declared consumption); tolls
   and parking pass through at documented cost. The owner cannot set a price at all.
2. **30-day hard cap** per booking (the PDL's *uso proprio* ceiling), enforced in code.
3. **Platform revenue is a flat borrower-paid service fee** (€3/day) — the platform sells
   a service to the borrower; the owner receives nothing beyond costs.
4. RCA disclosure attestation required; per-booking insurance add-on planned; odometer
   photos settle km objectively.

Risk statement, honestly: under *current* law even cost-only sharing sits in a grey area —
the 2023 circular reasons from the presence of *any* corrispettivo. Our position: a pure,
software-enforced, documented cost reimbursement with zero owner margin is materially
distinguishable from the paid rentals the circular targets (its logic parallels carpooling,
which nobody considers taxi service), and it converts automatically into the codified
regime if/when PDL C.4059 passes. Counsel must bless this before launch; if counsel says
no, Lane 1 launches in "free loan + insurance" form (comodato + platform services) and the
company stands on Lane 2.

### Lane 2 — 'licensed' (art. 84, done as a service)
Fully legal **today**, no pending-law dependency:
1. Owner files a **SCIA** for *locazione senza conducente* (Chiavi prepares and files it —
   the onboarding service) and re-registers the vehicle **"uso di terzi"** at the
   Motorizzazione.
2. The owner becomes a legal one-car rental operator; market pricing, invoices, 15%
   marketplace take.
3. Compliance is displayed on the listing (SCIA number, uso di terzi badge) and verified
   at onboarding — inspectability is the moat: the 2023 circular is *good* for Chiavi
   because it clears the grey-zone competition.

## Insurance
RCA follows the vehicle and covers any licensed driver, but the use must be consistent
with the policy: Lane 1 requires disclosure to the insurer; Lane 2 requires the (more
expensive) *uso terzi/noleggio* class — priced into the model. Production adds per-booking
motor cover via partnership (negotiations: to be opened with UnipolSai/Generali) so the
owner's bonus-malus is insulated.

## Open items for counsel
1. Written opinion on Lane 1 (cost-only sharing under current law; comodato fallback).
2. SCIA practicability for individuals: ditta individuale requirement, comune-by-comune
   variance, timeline and cost per filing (target ≤ 3 weeks, ≤ €150 direct costs).
3. Fleet-size thresholds and Motorizzazione practice for single-vehicle "uso di terzi".
4. Platform liability (DSA/e-commerce safe harbour) and KYC duties on driver verification.

## Sources
- [Art. 84 CdS — Brocardi](https://www.brocardi.it/codice-della-strada/titolo-iii/capo-iii/sezione-ii/art84.html)
- [Circolare Ministero dell'Interno 2023 — Newscamp](https://www.newscamp.it/noleggio-tra-privati-il-ministero-dellinterno-fa-chiarezza/)
- [Sanctions & "uso di terzi" requirements — SicurAUTO](https://www.sicurauto.it/guide-utili/autonoleggio-posso-affittare-il-mio-veicolo-a-unaltra-persona/)
- [PDL C.4059 analysis — Rivista Giuridica ACI](https://rivistagiuridica.aci.it/documento/uso-condiviso-di-veicoli-privati-1.html)
- [PDL C.859 / C.930 (2019) — Rinnovabili.it](https://www.rinnovabili.it/mobilita/car-sharing-car-pooling-progetti-legge/)
