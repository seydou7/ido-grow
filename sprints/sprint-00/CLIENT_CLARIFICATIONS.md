# I Do Grow — Sprint 00 Client Clarifications

## Purpose

These questions are needed to finalise the first MVP transaction workflow and the remaining Sprint 00 foundations before implementation begins. Please answer them for the selected proof transaction wherever possible.

- **BLOCKING:** The answer is required before the affected transaction behaviour can be implemented safely.
- **IMPORTANT:** The answer materially shapes Sprint 00 scope or acceptance criteria and should be confirmed before implementation of the affected capability.

## Priority A — Must resolve before implementation

### 1. First MVP Transaction

- **A1.1 — BLOCKING:** Please identify the real Supplier, real Buyer, and traceable hemp Lot for the proof transaction. Include the product/form, origin country, destination country, approximate volume, expected transaction dates, and the internal I Do Grow transaction owner.
- **A1.2 — BLOCKING:** For this Supplier and transaction, which onboarding documents and verification checks are mandatory before the first binding commitment, and who confirms that the Supplier is ready?
- **A1.3 — BLOCKING:** For the proof product, please confirm the canonical catalogue classification: category, product type, product form, packaging type, trading and measurement units, intended application(s), and accepted synonyms.

### 2. I Do Grow Commercial Role

- **A2.1 — BLOCKING:** For the selected transaction, in which capacity will I Do Grow act with each counterparty: principal buyer/reseller, Supplier agent, Buyer agent, broker/facilitator, cooperative, or another specified role?
- **A2.2 — IMPORTANT:** May I Do Grow's capacity vary by transaction? If so, who selects, approves, and records the capacity before commercial terms are issued?

### 3. Quote, Trade and Contract

- **A3.1 — BLOCKING:** What commercial or legal commitment, if any, occurs when a Listing is published, a Quote is sent, the Buyer selects **Accept Quote**, the Trade and Contract records are created, and the final Contract is signed? Please distinguish information, invitation to negotiate, non-binding indication, and binding commitment.
- **A3.2 — BLOCKING:** For the Supplier, Buyer, and I Do Grow, who may issue, counter, withdraw, or accept binding terms; which I Do Grow legal entity is a party; and who may sign the final Contract for it?

### 4. Inventory Reservation and Sold

- **A4.1 — BLOCKING:** Which event creates a reservation, what does it hold—a Listing, a Lot, or an exact Lot quantity—and what commercial effect does the hold have? When only part of the quantity is reserved, which quantity controls apply?
- **A4.2 — BLOCKING:** Who may create, change, release, or extend a reservation; when does it expire or release automatically; how are competing Buyers prioritised; can a Match ever reserve stock automatically; which event changes a Listing, Lot, or quantity to **sold**; and what reversal rule applies if inspection, Contract, shipment, or payment fails?

### 5. Hemp Quality Model

- **A5.1 — BLOCKING:** For the selected hemp product, which measurements and observations are mandatory or optional; which units, sampling and inspection/test methods, equipment, and evidence are accepted; which certificates are required; and what grade names, thresholds, and pass/fail rules apply?
- **A5.2 — BLOCKING:** At which checkpoints is quality evidence required—Listing publication, Quote, conditional Quote acceptance, Contract, Shipment release, destination, or another point—and what minimum evidence or status permits progression at each checkpoint?
- **A5.3 — BLOCKING:** Who performs each check, who approves the final grade, and who decides the permitted outcome when evidence is incomplete or the Lot is non-conforming—for example reinspection, downgrade, price or quantity change, replacement, re-quotation, rejection, claim, or cancellation?

### 6. Lot and Batch Semantics

- **A6.1 — BLOCKING:** What does **Lot** mean and what does **Batch** mean in I Do Grow; who creates each; what real-world event starts or ends each identity; and which one identifies the physical quantity used for reservation, inspection, Trade, Shipment, and DPP?
- **A6.2 — IMPORTANT:** When material is partially allocated, split, combined, substituted, transformed, or shipped in multiple loads, when is a new identifier required; how are quantities, quality evidence, certificates, and parent/child provenance carried forward; when is reinspection required; and which of these operations must the first MVP transaction support?

### 7. Roles and Permissions

- **A7.1 — BLOCKING:** For the proof transaction, please name the person assigned to each source-defined responsibility: Trader approval of the Supplier and Match, Trader or Quality Manager approval of Listing publication, Quality Inspector approval of the final grade, Trader selection of the logistics provider, and Compliance Manager responsibility for DPP completeness. Also name the authorised owner for Quote issuance, inventory reservation/release, Contract signature, carrier booking, Shipment release, delivery confirmation, claims/credits, payment verification, Settlement closure, and DPP sharing/publication, including any value threshold, second approval, or separation-of-duties rule.
- **A7.2 — BLOCKING:** Internal margins must remain hidden from external parties, Supplier bank information is limited to authorised staff, and inspection results may be shared only with Buyer permission. Within those boundaries, which records or fields may the Supplier, Buyer, I Do Grow Trader, Quality Inspector, Logistics Partner, Compliance Manager, and Administrator view or change—especially Supplier risk, Buyer commercial information, payment information, detailed quality evidence, DPP information, and internal commercial information?
- **A7.3 — BLOCKING:** For personal data used in the proof transaction, who acts as controller or processor, which retention periods apply, where may the data be processed and stored, and what deletion or correction obligations must the platform support?

### 8. Contract and Logistics Rules

- **A8.1 — BLOCKING:** For the proof transaction, which approved Contract template, governing law/jurisdiction, Incoterm, title-transfer point, risk-transfer point, quantity tolerance, quality/inspection conditions, cancellation rules, claims/dispute process, and required documents apply?
- **A8.2 — BLOCKING:** At Quote issuance and acceptance, which landed-cost lines must be confirmed and which may remain estimated; when must freight become fixed; and who bears or approves a material cost variance?
- **A8.3 — BLOCKING:** Who may make the binding carrier booking and authorise Shipment release; which documents and evidence are required before pickup; which custody handoffs must be recorded; who confirms delivery; and how must delays, shortages, damage, and disputes be handled?

### 9. Payment and Settlement

The MVP records external payment activity; it does not provide internal banking or direct escrow.

- **A9.1 — BLOCKING:** For the selected transaction and I Do Grow capacity, who invoices whom, who pays whom, for what products, fees, or commissions, and what deposits, milestones, due dates, currencies, payment methods, and payment terms apply?
- **A9.2 — BLOCKING:** Which evidence proves payment; who verifies it and may change payment instructions; what process applies to late, partial, or disputed payments and to claims or credits; and who closes Settlement?

### 10. DPP

- **A10.1 — BLOCKING:** The basic MVP DPP covers Lot identifier, origin, Supplier, quality information, transaction events, Shipment events, and a downloadable passport page. Within those categories, which exact fields, events, source documents, and verification states make the first transaction's DPP complete?
- **A10.2 — BLOCKING:** Which named Compliance Manager or assigned person is responsible for DPP completeness for the first transaction, who approves sharing or publication, at what lifecycle point, and what may the Supplier, Buyer, authorised internal users, and the public—if anyone—see?
- **A10.3 — IMPORTANT:** When verified quality or DPP information is corrected, who may request and approve the correction, what evidence and reason are required, and who must be notified while the original value, source, version, and audit history are preserved?

### 11. WhatsApp

- **A11.1 — IMPORTANT:** Must the selected proof transaction use WhatsApp-assisted intake, or may that MVP capability be validated separately from the end-to-end transaction?
- **A11.2 — BLOCKING:** Which Supplier facts may be confirmed through WhatsApp, which actions require confirmation inside the platform, and when may a Trader create or update a draft from Supplier messages? Human handover is already required for low confidence, a request for a person, binding-price discussion, quality issues, conflicting documents, or a dispute; what additional transaction-value threshold should trigger handover?

### 12. Accessibility

- **A12.1 — IMPORTANT:** Which accessibility standard and conformance level should the responsive web platform meet—for example, WCAG 2.2 AA?

## Priority B — Can remain open for early implementation

These topics are deferred beyond the first safe transaction slice unless the selected real transaction demonstrates a concrete need:

- Advanced or configurable matching weights and optimisation.
- Multi-supplier fulfilment, consolidation, and load optimisation.
- Live freight pricing and external carrier, laboratory, payment, finance, or insurance integrations.
- Increased AI autonomy beyond reviewable, human-controlled assistance.
- Native mobile applications.
- Complex warehouse-management capabilities.
- Advanced sustainability, transformation, recycling, and end-of-life DPP features beyond the basic MVP passport.
- Expansion to additional products, fibres, countries, and factory-to-shelf workflows.

## Recommended Client Workshop Order

The following order fits a focused 60–90 minute workshop:

1. **Purpose and expected outcomes — 5 minutes:** Confirm that the session will resolve or assign owners for Priority A questions.
2. **Proof transaction and I Do Grow's role — 10 minutes:** Sections 1 and 2.
3. **Commercial commitment and inventory — 12 minutes:** Sections 3 and 4.
4. **Quality, Lot, and Batch rules — 12 minutes:** Sections 5 and 6.
5. **Authorities and visibility — 12 minutes:** Section 7.
6. **Contract, logistics, and settlement — 15 minutes:** Sections 8 and 9.
7. **DPP, WhatsApp, and accessibility — 10 minutes:** Sections 10 to 12.
8. **Decision recap and follow-up owners — 9 minutes:** Read back answers, identify unanswered items, and assign dates and owners.

Total recommended duration: **85 minutes**.

## Decision Capture Template

Use one copy of this template for each answer:

| Field | Entry |
| --- | --- |
| Question ID | |
| Client answer | |
| Decision owner | |
| Date | |
| Source / meeting | |
| Approved? | Yes / No / Pending |
| Project files affected | |
| Follow-up required? | |
| Classification | Client clarification / approved business decision / unresolved |
| Existing source or decision affected / superseded? | |
