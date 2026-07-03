# Modello di business

*English version: [BUSINESS_MODEL.md](BUSINESS_MODEL.md)*

## In una riga

Chiavi mette al lavoro i 39 milioni di auto ferme d'Italia attraverso le uniche due porte
che la legge lascia aperte: la **condivisione a rimborso spese** (zero profitto per il
proprietario, imposto dal software — la cornice della proposta di legge PDL C.4059) e il
**noleggio tra privati con licenza**, dove Chiavi trasforma un privato in un
micro-noleggiatore autorizzato (SCIA + reimmatricolazione "uso di terzi", fatte come
servizio) e gestisce il marketplace con un take del 15%.

## Perché il vincolo legale È il business

Il P2P a pagamento stile Turo oggi in Italia è illegale (art. 84 CdS; circolare del
Ministero dell'Interno, giugno 2023) — e questo ha congelato tutti gli operatori in zona
grigia. Resta un vuoto con domanda su entrambi i lati: i banchi degli autonoleggi in
aeroporto superano i €90/giorno d'estate; i proprietari tengono ferme auto usate il 4% del
tempo. L'unica posizione scalabile è **conformità-prima-di-tutto**: nessun altro fa la
SCIA al posto del proprietario, e nessun incumbent può copiarla senza rifare da zero il
proprio modello di offerta. La circolare 2023 è il nostro evento di pulizia del mercato;
la PDL C.4059, se approvata, spalanca la seconda corsia — con Chiavi già online come sua
implementazione di riferimento.

## Le due corsie

| | 🤝 Condivisa a costo | 📋 Noleggio con licenza |
|---|---|---|
| Base legale | Cornice PDL C.4059 (uso proprio ≤30 giorni, solo rimborso), lettura più prudente già oggi | art. 84 CdS — SCIA + "uso di terzi", pienamente legale ora |
| Il proprietario guadagna | €0 per costruzione (carburante/km + pedaggi al costo) | Prezzo di mercato, fatturato |
| Ricavo piattaforma | €3/giorno di commissione a chi guida | Take 15% (12% conducente + 3% proprietario) + €290 di onboarding una tantum |
| Ruolo nella strategia | Cuneo di comunità, vivaio di offerta, vendita assicurazione | **Il business** — GMV ricorrente + fee di onboarding |

La Corsia 1 è volutamente non remunerativa per i proprietari: il suo argomento è «il tuo
vicino smette di perdere soldi su un'auto ferma», costruisce base utenti e livello di
fiducia, e ogni proprietario in condivisione è un lead qualificato per il funnel delle
licenze («quest'anno l'hai prestata 20 giorni — con la licenza sono €800 al mese»).

## Economia unitaria (corsia con licenza)

- Tariffa media €42/giorno (contro €70–90 delle catene aeroportuali) · 80 giorni noleggiati
  per auto l'anno → **€3.360 di GMV/auto/anno** → **€504/anno di take** + **€290 di
  onboarding** (una tantum; costi diretti della pratica ≤ €150, internalizzata a scala).
- Il proprietario incassa ~€3.100/anno meno il sovrapprezzo assicurativo uso terzi
  (~€400–700) → **€2.300–2.700 netti per auto** — un numero vero che oggi nessuna
  alternativa legale offre a un privato.
- CAC: lato proprietari quasi zero a scala pilota (liste d'attesa dalla corsia condivisa,
  autoscuole, gruppi di condominio); lato conducenti obiettivo €18 (SEO «noleggio auto
  economico + città», contenuti sull'indignazione da prezzi aeroportuali).

## Dimensione del mercato (bottom-up)

- Italia: ~39M di autovetture; prudenzialmente il 2% sono seconde auto o sottoutilizzate i
  cui proprietari valuterebbero di monetizzare con la burocrazia fatta da altri →
  **~780k veicoli candidati**.
- Penetrazione realistica delle licenze al quinto anno: 0,5% dei candidati → ~4k auto →
  **€13M di GMV, €2M/anno di ricavi** dal solo marketplace, più l'onboarding.
- Mercati di riferimento: Turo supera i 350k veicoli attivi tra USA/UK/Francia; Getaround
  ha toccato ~50k in Europa. L'Italia è il più grande mercato auto UE con **zero** offerta
  P2P legale — uno spazio bianco creato dalla regolazione, non dall'assenza di domanda.
- Espansioni adiacenti: camper (il segmento più colpito dalla circolare 2023 — prezzi più
  alti, proprietari più motivati), furgoni, auto d'epoca per eventi.

## Caso base a tre anni (allineato al modello live su /investors)

Assunzioni: 150 auto con licenza in A1, 80 giorni noleggiati per auto l'anno, €42 di
tariffa media, take 15%, €290 di onboarding per auto nuova, crescita flotta 3,5× annua.
La corsia condivisa è trattata come upside (commissioni fisse + funnel), non modellata.

| | Auto con licenza | Giorni noleggiati | GMV | Ricavi netti |
|---|---|---|---|---|
| **A1 — Milano, Bologna, Roma, Cagliari** | 150 | 12.000 | €504k | €119k |
| **A2 — top-10 città + aeroporti** | 525 | 42.000 | €1,76M | €373k |
| **A3 — nazionale + camper** | 1.838 | 147.000 | €6,2M | €1,31M |

## Round ed exit

- **Richiesta seed: €900k**, 18 mesi: team di compliance-ops (pipeline SCIA), partnership
  assicurativa, 2 ingegneri, pareri legali, playbook di lancio città per città.
- **Logica M&A**: Ayvens/Leasys (i giganti delle flotte comprano tecnologia di utilizzo),
  UnipolSai/Generali (distribuzione assicurativa + telematica), Telepass (super-app della
  mobilità), **Turo/Getaround** (entrare in Italia significa comprare l'unica offerta
  conforme), la stessa ACI (servizi ai soci). L'asset dell'acquisizione è la **rete di
  proprietari con licenza + la pipeline SCIA** — offerta che non si può copiare né
  raggiungere in fretta.

## Criteri di stop (cosa deve essere vero)

1. La SCIA per un privato si chiude nei comuni pilota in ≤4 settimane e ≤€300 tutto compreso.
2. ≥30% dei proprietari in condivisione converte alla licenza entro 12 mesi.
3. Il sovrapprezzo assicurativo uso terzi resta sotto €700/anno via partnership.
4. Il legale approva la Corsia 1 così com'è implementata (o regge il fallback comodato).
Se saltano la 1 o la 3, salta l'economia della corsia con licenza; se saltano entrambe le
corsie, salta l'azienda. Testiamo tutti e quattro i criteri con il seed, pubblicamente.
