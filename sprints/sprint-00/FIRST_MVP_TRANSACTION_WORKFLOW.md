# I Do Grow — First MVP Transaction Workflow

## 1. Purpose and Approval Status

This document defines the scenario-generic, OPEN-gated First MVP Transaction Workflow for **Sprint 00 — Discovery and Foundation**. It is a committed-ready workflow foundation, not a record of a real transaction, an implementation specification, a contract, or approval of any unresolved commercial, legal, quality, logistics, payment, privacy, or authority rule.

The Project Owner has approved a **scenario-generic, OPEN-gated workflow** as sufficient for Sprint 00 foundation purposes. The approval establishes the workflow shape and its safe boundaries only. It does not identify or approve a real Supplier, Buyer, Lot, route, volume, timing, commercial term, legal effect, role holder, or other client answer.

This workflow remains subordinate to primary client sources, later explicit client clarifications, DEC-001, and the committed Sprint 00 foundations. Application implementation remains **NOT STARTED**.

## 2. Scenario Placeholders

The future proof transaction must replace these placeholders only with traceable, approved information:

| Placeholder | Current foundation value | Clarification |
| --- | --- | --- |
| Supplier and Supplier organisation | `OPEN` | A1.1, A1.2 |
| Buyer and Buyer organisation | `OPEN` | A1.1 |
| I Do Grow transaction owner and capacity | `OPEN` | A1.1, A2.1, A2.2 |
| Product category/type/form | Natural Fibre / Hemp / Retted Straw is the minimum active foundation; proof classification remains subject to confirmation | A1.3 |
| Packaging | Large Rectangular Bale is source-supported packaging; proof packaging remains subject to confirmation | A1.3 |
| Physical Lot identity and any Batch meaning | `OPEN` | A1.1, A6.1, A6.2 |
| Origin, destination, route, volume and dates | `OPEN` | A1.1 |
| Buyer requirements | `OPEN` | A3, A5, A8–A10 |
| Prices, currencies, fees and commercial terms | `OPEN` | A3.1, A8.2, A9.1 |
| Quality dimensions, methods, thresholds, grades and evidence | `OPEN` unless later approved | A5.1–A5.3 |
| Contract template, parties, governing rules and signatories | `OPEN` | A2, A3, A7.1, A8.1 |
| Carrier, Shipment terms and release authority | `OPEN` | A7.1, A8.2, A8.3 |
| Payment parties, instructions and evidence | `OPEN`; status tracking only | A9.1, A9.2 |
| DPP contents, completeness, visibility and publication | `OPEN` | A10.1–A10.3 |

No placeholder may be converted into a default, fixture presented as fact, or binding rule without the applicable authority and evidence.

## 3. Numbered End-to-End Workflow

### Step 1 — Supplier onboarding

1. A Supplier starts onboarding directly or receives authorised assistance from an I Do Grow Trader.
2. The platform captures organisation/profile information, provenance, submitted documents, missing items and review state.
3. Trader-assisted or WhatsApp-originated information remains attributed to its source and does not prove platform authority or binding confirmation.
4. Supplier readiness requires human review by the approved owner.

**OPEN gate:** Mandatory documents, verification checks, readiness owner, WhatsApp-confirmable facts and handover rules remain unresolved under A1.2, A7.1–A7.4 and A11.1–A11.2.

### Step 2 — Product and Lot capture

1. The Supplier or an authorised Trader creates a Product/Listing draft using the approved taxonomy foundation.
2. The Listing records market-facing offer information; the Lot records the traceable physical quantity and its provenance.
3. Declared information, documents and preliminary quality information retain source and verification state.

**OPEN gate:** Proof classification, units, Lot/Batch meaning, quantity identity and transformation behavior remain unresolved under A1.3 and A6.1–A6.2. Listing and Lot must never be collapsed into one entity.

### Step 3 — Listing draft and review

1. The draft is checked for completeness, provenance, authorised fields, and obvious conflicts.
2. A Trader may request correction or missing evidence while acting in an explicit capacity.
3. Any AI extraction or completeness recommendation is labelled preliminary and is reviewed by a human.

**OPEN gate:** Required listing fields, quality evidence, field visibility, correction rights and assisted-entry authority remain unresolved under A1.2–A1.3, A5.1, A7.1–A7.2 and A11.2.

### Step 4 — Listing publication

1. An authorised human reviews the exact Listing version and linked Lot summary.
2. Publication exposes only the approved Marketplace projection; restricted Supplier, quality, financial and internal information remains hidden.
3. Publication does not reserve a Lot, mark quantity sold, or create a binding offer unless a later approved rule says so.

**OPEN gate:** Final publication authority, legal effect, visibility projection, suspension/correction path, reservation and sold effects remain unresolved under A3.1, A4.1–A4.2 and A7.1–A7.2.

### Step 5 — Buyer demand / Buy Order

1. A Buyer or an authorised Trader acting for that Buyer creates a Buy Order/RFQ.
2. It captures applicable product, quantity, destination, dates, quality, packaging, logistics, commercial, payment and DPP requirements.
3. Required and preferred criteria remain distinguishable; absent client rules are not defaulted.

**OPEN gate:** Buyer authority, required fields, approved quality definitions, commercial requirements and represented-party mandate remain unresolved under A3.2, A5.1, A7.1–A7.2, A8.1–A8.2 and A9.1.

### Step 6 — Match generation

1. Deterministic services compare authorised Listing/Lot projections with the Buy Order using only approved definitions and compatible units.
2. The result distinguishes satisfied, not satisfied, missing/unknown and incomparable/conflicting information as a foundation concept.
3. AI may explain the evidence and uncertainty but may not invent facts, weights, conversions, quality conclusions or terms.

**NON-BINDING:** A Match is a recommendation only. It does not reserve inventory, change availability, issue a Quote, create a Trade, or bind any party.

**OPEN gate:** Final comparison rules, weighting, equivalence, evidence sufficiency and multi-Lot behavior remain unresolved under A4.2, A5.1, A6.1–A6.2 and Priority B.

### Step 7 — Trader Match review

1. A Trader reviews the Buyer requirements, candidate Listing/Lot, evidence state, delivery feasibility, landed-cost inputs, uncertainty and explanation.
2. The Trader's actor identity, acting organisation, represented party/capacity and reviewed versions are explicit.
3. The Trader may approve a candidate for Quote preparation, reject it, request information or request rematching within authorised scope.

**NON-BINDING:** Human Match review still does not reserve stock or create commercial commitment.

**OPEN gate:** Match reviewer, represented-party mandate, visibility, reservation effect and approval boundaries remain unresolved under A2.1–A2.2, A4.1–A4.2 and A7.1–A7.2.

### Step 8 — Quote preparation and negotiation

1. An authorised person prepares a versioned Quote linked to the Buyer demand and candidate Listing/Lot.
2. The Quote distinguishes confirmed and estimated cost components, quality conditions, logistics assumptions, validity and change history.
3. Counter, withdrawal, rejection and the user action labelled `Accept Quote` remain auditable actions against an exact version.
4. Internal margins remain restricted from external parties; the exact external fee/commission projection remains OPEN.

**OPEN gate:** Quote issuance and acceptance authority, legal effect, landed-cost responsibility, price variance and I Do Grow capacity remain unresolved under A2.1–A3.2, A7.1–A7.2 and A8.2. No UI or workflow may silently interpret `Accept Quote` as `Accept and Buy`.

### Step 9 — Quality gate / Inspection branch

1. The applicable transaction rule selects an Inspection checkpoint: before Quote, after a conditional Quote action, before Contract, before Shipment, at destination, or multiple checkpoints.
2. An assigned Inspector records Lot-linked Measurements, Observations, evidence and Non-Conformities using a pinned Template/version where applicable.
3. Supplier-declared, measured, observed, document-backed, AI-preliminary, human-verified and final-grade information remain distinct.
4. Submission, human verification and final Grade approval are separate permission-controlled actions.
5. Incomplete, conflicting or non-conforming evidence returns to an approved correction, reinspection or commercial-review branch; no consequence is automatic.

**OPEN gate:** Required dimensions, units, methods, sampling, thresholds, Grade vocabulary, certificates, checkpoints, approvers and remedies remain unresolved under A5.1–A5.3, A6, A7.1–A7.2 and A8.1. Quality remains primarily **Lot/Inspection-centric**.

### Step 10 — Trade / Contract

1. Only an approved commercial event may permit creation of a structured Trade and Contract record.
2. The Trade links the relevant parties/capacities, exact Quote version, Listing/Lot, quality conditions, Shipment plan, Settlement tracking and DPP context.
3. The Contract uses an approved template and requires the approved human review and signatures.

**OPEN gate:** The event that creates a Trade, binding effect, legal parties, signatories, jurisdiction, title/risk transfer, cancellation, claims and required documents remain unresolved under A2.1–A3.2, A7.1 and A8.1. This workflow does not decide whether Quote acceptance itself creates a Trade or Contract.

### Step 11 — Logistics / Shipment

1. An authorised actor creates Shipment requirements linked to the transaction and physical Lot/quantity.
2. Freight quotations may be recorded and reviewed; an authorised human selects or approves the applicable provider and booking.
3. The assigned Logistics Partner receives only the minimum Shipment context and records pickup, custody, transit, customs, delay, shortage, damage and delivery evidence as applicable.
4. Inspection completion does not automatically release a Shipment.

**OPEN gate:** Binding booking, release authority, required documents, custody handoffs, freight finality, exception rules and Lot quantity effects remain unresolved under A4, A7.1–A7.2 and A8.2–A8.3.

### Step 12 — Delivery

1. The assigned Logistics Partner records delivery events and evidence.
2. The approved receiving party may confirm receipt or raise a shortage, damage, quality or other exception.
3. Any acceptance, claim, rejection, replacement, reinspection or Contract consequence uses a separate authorised human decision.

**OPEN gate:** Delivery-confirmation authority, legal effect, destination quality gate, evidence, claims and remedies remain unresolved under A5.2–A5.3, A7.1 and A8.1–A8.3.

### Step 13 — Settlement / payment-status tracking

1. The MVP records invoices, expected amounts, due dates, external payment instructions, submitted evidence, status, balances, commissions, claims and credits where applicable.
2. Authorised humans verify evidence and update administrative status with provenance and audit.
3. Late, partial, disputed or corrected payments follow an approved exception path.

**EXCLUSION:** The MVP does not execute payments, hold funds, provide internal banking, or provide direct escrow.

**OPEN gate:** Invoicing relationships, payment parties, currencies, terms, evidence, instruction-change authority, claims/credits and Settlement closure remain unresolved under A7.1–A7.3 and A9.1–A9.2.

### Step 14 — Basic DPP

1. The Lot-linked DPP projects authorised provenance-bearing references to origin, Supplier information, quality events, transaction/custody events, Shipment/delivery events and supporting documents.
2. Each projection retains source, version and verification state; corrections create traceable successor events rather than silent overwrite.
3. Public, counterparty, internal and restricted projections remain separate.

**OPEN gate:** Completeness, exact fields, publication/sharing owner, lifecycle timing, visibility, correction and privacy rules remain unresolved under A7.2–A7.3 and A10.1–A10.3.

### Step 15 — Transaction closure

1. The transaction workspace presents the final authorised state of approvals, Contract, quality, Shipment/delivery, Settlement tracking, DPP completeness, documents, exceptions and audit history.
2. Closure may occur only through an approved human-controlled rule and authority.
3. Closure does not erase unresolved claims, historical versions, provenance or audit events.

**OPEN gate:** Closure criteria, owner, required evidence, reopen/correction behavior, unresolved-claim handling and relationship to Settlement/DPP status remain unresolved under A7.1, A8.3, A9.2 and A10.1–A10.3.

## 4. Actor Responsibilities

| Actor | Foundation responsibility | Boundary |
| --- | --- | --- |
| Supplier | Provide authorised organisation, Listing, Lot, declaration, evidence and transaction information; respond to review | Own organisation/transaction scope; cannot approve own final quality or silently change verified evidence |
| Buyer | Create demand, review authorised supply/Matches/Quotes, provide transaction requirements, monitor delivery | Match remains non-binding; acceptance and dispute authority remain OPEN |
| I Do Grow Trader | Assist parties, review Listings/Matches, prepare Quotes and coordinate transactions | Must record acting organisation, represented party, capacity and mandate; no implied binding authority |
| Quality Inspector | Perform assigned Lot/Inspection work and submit evidence | Assignment-scoped; final Grade only where specifically authorised |
| Logistics Partner | Quote and execute assigned Shipment work; record events/evidence | Shipment/transaction-scoped; no unrelated commercial or payment access |
| Compliance Manager | Review assigned documents/regulatory data and DPP completeness | Completeness does not imply publication, legal conclusion or commercial approval |
| Administrator | Support organisations, membership, roles and system configuration where authorised | Not automatically a business, quality, Contract, payment or DPP approver |
| System | Enforce identity, organisation, authorization, validation, approved transitions, concurrency, provenance and audit | Must not infer undefined authority or business rules |
| Future Platform Agent | Draft, extract, compare, explain or recommend through controlled tools | Assistive only; no independent binding action, approval or direct database mutation |

## 5. Human Approval Gates

| Gate | Human-controlled foundation | Exact authority/status |
| --- | --- | --- |
| Supplier readiness | Review onboarding evidence before an approved binding checkpoint | `OPEN` — A1.2, A7.1 |
| Listing publication | Review exact Listing version and authorised Lot projection | Source-supported human gate; mapped role/person `OPEN` — A7.1 |
| Match review | Trader reviews recommendation before Quote preparation | Source-supported and non-binding; capacity/mandate `OPEN` — A2, A7.1 |
| Quote issuance/response | Review exact Quote version, terms and assumptions | Legal effect and authority `OPEN` — A2, A3, A7.1 |
| Inventory reservation/release | Separate approved action if later defined | Entire rule `OPEN` — A4, A7.1 |
| Quality verification/final Grade | Review exact Inspection/evidence/version | Exact approver/rules `OPEN` — A5, A7.1 |
| Contract approval/signature | Review approved Contract version and sign under valid authority | Parties/signatories/effect `OPEN` — A3, A7.1, A8.1 |
| Carrier booking/Shipment release | Approve booking and release against required evidence | Authority/gates `OPEN` — A7.1, A8.3 |
| Delivery/claim decision | Review delivery evidence and exception | Authority/effect `OPEN` — A7.1, A8.3 |
| Payment evidence/Settlement closure | Verify external evidence and administrative status | Authority/rules `OPEN` — A7.1, A9 |
| DPP completeness/publication | Review exact DPP projection/version | Completeness role source-supported; publication `OPEN` — A10 |
| Transaction closure | Confirm all approved closure conditions against exact versions | Criteria/owner `OPEN` — A7.1, A8–A10 |

High-risk approvals must show what is approved, who prepared it, actor capacity, represented party, evidence, consequences, exact version, prior changes and approval outcome. A changed version requires revalidation and, where applicable, reapproval.

## 6. Binding vs Non-Binding Actions

| Action | Foundation classification |
| --- | --- |
| Draft onboarding, Listing, Buy Order, Quote, Contract or DPP content | Non-binding preparation |
| AI extraction, quality suggestion, Match explanation or Trader recommendation | Assistive proposal only |
| Match generation | **NON-BINDING** |
| Trader Match approval | **NON-BINDING** approval for Quote preparation only |
| Listing publication | Marketplace publication gate; commercial/legal effect `OPEN` |
| Quote issue, counter, withdrawal, rejection or `Accept Quote` | Interaction supported; binding effect and authority `OPEN` |
| Reservation, release or sold-state change | `OPEN`; never implied by Match or Quote action |
| Final Grade | Human-controlled where an approved Grade system and authority exist; commercial effect `OPEN` |
| Trade creation | Trigger and legal effect `OPEN` |
| Contract signature | Potentially binding only under approved parties, form and authority; currently `OPEN` |
| Carrier booking, Shipment release or delivery acceptance | Operational/legal authority and effect `OPEN` |
| Payment-status update | Administrative record only; not payment execution |
| DPP sharing/publication | `OPEN`; completeness does not grant publication authority |
| Transaction closure | `OPEN`; no automatic legal or financial discharge is implied |

## 7. Core Entity Relationships

```text
Supplier Organisation ── Membership/Authority ── User or Trader
        │
        └── Product classification
              └── Listing (market-facing offer)
                    └── Lot (traceable physical quantity)
                          ├── Inspection ── Quality Results/Evidence/Approval
                          └── DPP ── provenance-bearing event projection

Buyer Organisation ── Buy Order/RFQ
        │
        └── Match (NON-BINDING recommendation)
              └── Quote (versioned proposal; effect OPEN)
                    └── Trade/Contract (creation/effect OPEN)
                          ├── Shipment ── delivery/events/evidence
                          ├── Settlement ── administrative payment status
                          └── Approval/Audit history
```

Product, Listing, Lot, Packaging, Application, Quality, Grade, Certification and DPP remain distinct concepts. A Listing may refer to one or more Lots, but the exact cardinality and Lot/Batch semantics remain OPEN. DPP and Listing quality views project authoritative Lot/Inspection information; they do not become competing editable sources.

## 8. Exception and Return Paths

| Condition | Safe return/escalation path | Unresolved consequence |
| --- | --- | --- |
| Missing onboarding information | Return to Supplier/assisted draft with missing-item request | Readiness effect — A1.2 |
| Listing incomplete or conflicting | Request correction; retain provenance/version | Publication/suspension rule — A7.1 |
| No suitable Match | Request information, adjust authorised preferences, or rematch | Matching rules remain non-binding |
| Quote changed or stale | Create/counter a new version and require fresh review | Withdrawal/acceptance effect — A3 |
| Quality evidence missing/conflicting | Request evidence, correction or reinspection | Progression/remedy — A5 |
| Non-Conformity | Escalate to authorised quality/commercial review | Downgrade, re-quote, reject, claim or cancel — A5.3 |
| Reservation conflict | Do not infer allocation; block the affected action | Priority/release/sold behavior — A4 |
| Contract rejected or changed | Return to approved negotiation/review path | Legal consequence — A3, A8.1 |
| Freight unavailable or changed | Re-quote/review Shipment assumptions | Cost/booking authority — A8.2–A8.3 |
| Delay, shortage or damage | Record evidence and escalate to assigned reviewer | Claim, acceptance and payment effect — A8.3, A9.2 |
| Payment late, partial or disputed | Retain evidence/status and escalate | Credits, claims and closure — A9.2 |
| DPP incomplete or corrected | Return to completeness/correction review with versions | Publication/notification — A10 |
| Permission or stale-version failure | Deny safely; reload authoritative projection; resubmit only after revalidation | No authority gained through retry |

No exception automatically changes commercial terms, quality Grade, reservation, Contract, Shipment release, Settlement, DPP publication or transaction closure.

## 9. Manual vs Deterministic vs AI-Assisted Responsibilities

| Responsibility type | May perform | Must not perform |
| --- | --- | --- |
| Manual/human | Supply facts; review evidence; negotiate; make specifically authorised approvals; resolve exceptions | Act outside approved organisation, assignment, mandate, field or role scope |
| Deterministic System | Validate structure; enforce permissions and approved transitions; compare compatible approved data; calculate approved totals; protect versions/concurrency; create audit | Invent business rules, infer legal effect, select an undefined authority, treat missing evidence as passing |
| AI/Platform Agent assistance | Extract into drafts, identify missing information, explain deterministic Match results, propose preliminary quality observations, summarize and recommend | Create binding transactions, reserve stock, publish Listings, issue binding terms, approve final quality, sign Contracts, release Shipments/funds, rewrite verified evidence or publish DPP independently |

Every AI output is structured, provenance-bearing, confidence-aware where applicable, reviewable and subject to the same backend authorization as the initiating context. Model output alone never grants authority.

## 10. OPEN Gates and Implementation Impact

| Gate | Clarification reference | Implementation impact while OPEN |
| --- | --- | --- |
| Real proof parties, Lot, lane, volume, dates and owner | A1.1 | Use placeholders only; no fabricated transaction fixture as fact |
| Supplier readiness and onboarding evidence | A1.2 | Build no mandatory document/check list or readiness transition |
| Proof classification, packaging and units | A1.3 | Preserve approved taxonomy foundation; do not hard-code unconfirmed proof choices |
| I Do Grow and Trader capacity/mandate | A2, A7.1 | Require conceptual acting context; block binding represented-party actions |
| Quote/Trade/Contract meaning and authority | A3, A7.1, A8.1 | Draft/version/review foundation only; no binding transition semantics |
| Reservation, release and sold behavior | A4 | Do not encode automatic inventory effects |
| Quality definitions, methods, Grade and gates | A5 | Foundation structures only; affected validation/transitions blocked |
| Lot/Batch and transformations | A6 | Preserve separate concepts/provenance; block unsupported allocation/inheritance |
| Role authority and field visibility | A7.1–A7.4 | Backend-enforced deny-default foundation only; sensitive actions/fields blocked |
| Contract and logistics rules | A8 | Record drafts/events only; binding booking/release/remedy behavior blocked |
| Payment and Settlement rules | A9 | Administrative status model only; no payment execution/escrow |
| DPP completeness, visibility and corrections | A10 | Private/versioned foundation projection only; publication blocked |
| WhatsApp confirmation and handover | A11 | Preserve source/draft boundary; do not treat messages as authority |
| Accessibility conformance target | A12.1 | Apply safe accessibility baseline; formal conformance claim blocked |
| Advanced optimisation/integrations | Priority B | Deferred; do not expand the first workflow |

## 11. Traceability to the 22 MVP Wireframes

| # | Required MVP screen | Workflow home |
| ---: | --- | --- |
| 1 | Authentication Entry | Identity entry before any actor-specific step |
| 2 | Supplier Home | Onboarding/listing/transaction needs attention |
| 3 | Supplier Onboarding | Step 1 |
| 4 | Add Product / Listing | Steps 2–3 |
| 5 | Supplier My Listings | Steps 3–4 and correction paths |
| 6 | Listing / Lot Detail | Steps 2–4; preserves Listing/Lot separation |
| 7 | Buyer Marketplace | Published supply discovery before Step 5 |
| 8 | Buyer Listing Detail | Authorised Listing/Lot projection before Step 5 |
| 9 | Create Buy Order / RFQ | Step 5 |
| 10 | Buyer Matches | Step 6; explicitly non-binding |
| 11 | Quote Detail | Step 8; final effect labelled OPEN |
| 12 | Trader Cockpit | Cross-workflow queues, blockers and approvals |
| 13 | Trader Listing Review | Steps 3–4 |
| 14 | Trader Buy Order Review | Step 5 readiness |
| 15 | Trader Match Review | Step 7 |
| 16 | Trader Quote Workspace | Step 8 |
| 17 | Trade / Transaction Workspace | Steps 8–15, approvals and audit |
| 18 | Inspector Work Queue | Assigned branch in Step 9 |
| 19 | Inspection Detail / Capture | Step 9 |
| 20 | Shipment Workspace | Steps 11–12 |
| 21 | Basic DPP View | Step 14 |
| 22 | Organisations & Access | Membership/role support; A7.4 blocks sensitive role operation |

Settlement status, notification/approval patterns, documents, audit and role-specific transaction views remain supporting projections rather than additional required screen families.

## 12. What Sprint 01 May Safely Build

Only after Sprint 01 is explicitly started and the applicable foundation specifications are approved, technical work may safely build:

- the DEC-001 application skeleton and module boundaries;
- provider-neutral identity, organisation and contextual authorization interfaces without selecting a TBD provider;
- server-enforced deny-by-default access and authorised output projections;
- draft/version/provenance/audit foundations that do not encode unresolved business transitions;
- Product, Listing and Lot separation with Retted Straw as the minimum active Product Form and confirmed packaging/application reference data;
- non-binding Buy Order/Match foundations and deterministic comparison interfaces using only approved definitions;
- Quote drafting/version history without unresolved binding effects;
- Lot/Inspection-centric quality capture structures without invented methods, thresholds or Grades;
- Shipment-event and administrative payment-status structures without binding release or payment execution;
- private, versioned DPP foundations without unresolved public/share rules; and
- the 22 approved low-fidelity screen families, with authority-sensitive actions gated or absent until approved.

This section is a future safe boundary, not authorization to start Sprint 01 now.

## 13. What Must Remain Blocked Until Clarification

- Real proof-transaction population and acceptance criteria under A1.1.
- Mandatory onboarding rules and Supplier readiness under A1.2.
- Unconfirmed product, unit, application and packaging choices under A1.3.
- Trader mandates, I Do Grow capacity and any represented-party binding action under A2 and A7.
- Binding Quote, Trade, Contract and signature effects under A3 and A8.1.
- Reservation, allocation, release and sold semantics under A4.
- Operational quality dimensions, methods, thresholds, Grades, certificates, checkpoints, authorities and remedies under A5.
- Lot/Batch identity, split/combine/substitute/transform rules and evidence inheritance under A6.
- Sensitive authority, field visibility, role assignment and privacy rules under A7.
- Binding carrier booking, Shipment release, delivery acceptance and exception remedies under A8.
- Payment instructions, execution, claims, credits and Settlement closure under A9; escrow remains excluded.
- DPP completeness, sharing, publication and correction rules under A10.
- WhatsApp-originated confirmation and binding use under A11.
- Any formal accessibility conformance claim under A12.1.

## 14. Approval Record

| Item | Record |
| --- | --- |
| Approved by | Project Owner |
| Approval | Scenario-generic, OPEN-gated First MVP Transaction Workflow is approved for Sprint 00 foundation purposes |
| Scope | Workflow shape, safe boundaries, explicit human gates, non-binding Match, assistive AI and traceability to committed foundations |
| Not approved | Real parties/Lot/lane/volume/dates, commercial or legal effects, operational authorities, quality rules, Contract/logistics/payment rules, DPP visibility, or any other unanswered client item |
| Architecture effect | None; DEC-001 remains approved and unchanged |
| Decision Log effect | No new entry required because this records an explicit Project Owner scope disposition without changing DEC-001 or resolving an OPEN business rule |
| Implementation effect | None; Sprint 01 and application implementation are not started by this approval |

## 15. Remaining Client Inputs

All 29 Priority A questions in `CLIENT_CLARIFICATIONS.md` remain unanswered unless separately evidenced later. This workflow does not answer, downgrade or reopen them.

The first real transaction still requires, at minimum:

- A1.1 identification of the real Supplier, Buyer, Lot, route, volume, timing and owner;
- A1.2–A1.3 onboarding and proof-product confirmation;
- A2–A4 capacity, legal-effect and inventory rules;
- A5–A6 operational quality and Lot/Batch rules;
- A7 authority, visibility, privacy and sensitive-role governance;
- A8 Contract, logistics, delivery and exception rules;
- A9 payment and Settlement responsibilities;
- A10 DPP content, completeness, publication and correction rules;
- A11 WhatsApp use and confirmation boundaries; and
- A12.1 the intended accessibility conformance target.

Priority B remains deferred unless the selected real transaction later establishes an approved need.

## 16. Next Sprint 00 Closure Action

1. Review this artifact against the approved scenario-generic disposition and the committed Sprint 00 foundations.
2. If accepted, commit this artifact without treating any OPEN gate as resolved.
3. Explicitly accept or amend the remaining safe foundation specifications where approval is still required.
4. In separately authorised documentation tasks, conceptually synchronize `DATA_MODEL.md` and correct stale project-memory/backlog statuses without creating a schema or answering client questions.
5. Re-run the repository `sprint-close` assessment.

Sprint 00 remains **ACTIVE**. Do not start Sprint 01 or application implementation from this document alone.
