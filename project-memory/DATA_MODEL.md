# Conceptual Data Model

This model synchronizes the approved Sprint 00 foundations at a conceptual level. It describes business concepts, responsibilities, relationships, provenance and unresolved boundaries. It is **not** a physical schema, ORM model, migration, API contract, storage design or implementation authorization.

The Project Owner has approved the Sprint 00 foundations as the basis for design and implementation. Business, commercial, legal, quality, authority and visibility rules explicitly marked **OPEN** remain unapproved and blocked until the appropriate clarification.

## Identity, organisations and contextual authority

- **User:** A human identity. A User is not an Organisation, Role, Membership, mandate or proof of authority.
- **Organisation:** A Supplier, Buyer, I Do Grow, quality/inspection, logistics or other approved organisation context.
- **Membership:** Connects a User to an Organisation and records its governed lifecycle. Membership does not automatically grant every capability.
- **Role / Capability Assignment:** Grants a bounded responsibility or capability within an approved organisation, resource, field, state and time context. Human business roles remain distinct from System responsibilities and future Platform Agents.
- **Resource Assignment:** Connects an authorised User or Organisation to a specific Inspection, Shipment, transaction, review or other bounded task.
- **Represented-party Mandate / Acting Capacity:** Records the authenticated actor, acting organisation, represented party, capacity, authority basis/evidence, scope, validity, confirmation and revocation context for assisted actions.
- **Approval:** Records the exact resource/version reviewed, initiator/preparer, approver and capacity, evidence, decision, reason, time and resulting state. Approval of one action does not imply authority for another.
- **Field Visibility / Sharing Context:** Describes the authorised projection for public, marketplace, own-organisation, counterparty/transaction, assignment, internal I Do Grow, compliance/security or explicitly shared use.

Authorization is conceptually server-enforced, tenant-aware, resource-aware, assignment-aware, field-aware and deny-by-default. Frontend labels and submitted identifiers do not grant authority.

**OPEN:** Membership verification, sensitive-role governance, role combinations, mandate rules, final approvers, separation of duties, emergency access and exact field visibility remain unresolved under `CLIENT_CLARIFICATIONS.md`, especially A2 and A7.

## Product taxonomy and catalogue

- **Product Category:** The highest approved reusable catalogue grouping in the current foundation; `Natural Fibre` is source-confirmed.
- **Product Type:** A reusable type within a category; `Hemp` is source-confirmed for the initial use case.
- **Product Form:** A reusable form within a type; `Retted Straw` is the minimum active MVP form.
- **Packaging:** A distinct controlled concept linked to applicable Product Forms and commercial/physical instances. `Large Rectangular Bale` is source-supported packaging, not Product Form or Grade.
- **Application:** A distinct intended-use concept linked to applicable catalogue concepts. The four source-confirmed initial applications remain separate from product identity.
- **Certification Type:** A reusable definition only; it is not a certificate instance and does not make certification mandatory.
- **Unit / Measurement Definition:** Reusable definitions that may be linked to product, quality and transaction contexts without approving an operational unit catalogue.

Product definitions remain separate from Supplier Listings, physical Lots, observed quality, Grade assignments, certificate instances and DPP records. Labels, translations and aliases map to canonical concepts while retaining provenance and original input.

**OPEN:** Proof-transaction classification, accepted synonyms, governance, exact units, processing-state modelling, mandatory certifications and future product forms remain unresolved under A1.3 and A5.

## Supply, Listing and physical quantity

- **Listing:** A market-facing offer created by a Supplier or an authorised Trader. It may contain approved product classification, available quantity/unit, location, availability, commercial information, photos, documents and authorised summaries of known quality.
- **Lot:** A traceable physical quantity linked to a Listing and followed through Inspection, Match, Trade, Shipment and DPP events.
- **Reservation / Allocation concept:** A possible future relationship between an approved actor, exact physical quantity, transaction context and validity period. It is retained only as an unresolved concept.

A Listing may reference one or more Lots conceptually, but a Listing is not a Lot. Listing quality is an authorised projection from Lot/Inspection evidence and cannot become a competing source of truth.

**OPEN:** Lot versus Batch meaning; Listing/Lot cardinality; quantity ownership; reservation, release, expiry and sold semantics; split/combine/substitute/transform rules; parent/child provenance; evidence inheritance; and reinspection triggers remain unresolved under A4 and A6.

## Buyer demand and non-binding matching

- **Buy Order / RFQ:** Structured Buyer demand containing applicable product, quantity, destination, dates, quality, packaging, logistics, commercial, payment and DPP requirements or preferences.
- **Match:** An explainable, versioned and explicitly **NON-BINDING** recommendation connecting a Buy Order to one or more authorised Listing/Lot candidates.
- **Compatibility Result:** A deterministic comparison outcome that preserves definitions, original values, units, conversion basis, evidence state, uncertainty and versions.
- **Landed-Cost Breakdown:** A structured set of confirmed or estimated cost components with source and calculation context.

AI may explain deterministic Match evidence but cannot invent requirements, weights, conversions, quality conclusions, parties or commercial terms. Human Match review does not reserve inventory or create a binding transaction.

**OPEN:** Match rules, weighting, equivalence, evidence sufficiency, multi-Lot fulfilment, cost ownership and progression effects remain unresolved.

## Quote, Trade and Contract

- **Quote:** A versioned commercial proposal linked to Buyer demand and candidate supply. It retains line items, confirmed/estimated cost components, assumptions, conditions, validity and change history.
- **Trade:** A structured transaction record that may link parties/capacities, the applicable Quote version, Listing/Lot quantities, Contract, quality, Shipment, Settlement and DPP context.
- **Contract:** A versioned agreement record that may contain approved parties, terms, quality/inspection conditions, logistics, payment, documents, signatures and governing context.

Drafting, versioning, review and audit do not establish legal effect. Internal margins and externally visible fees/commissions require distinct authorised projections.

**OPEN:** Quote issuance/acceptance effect; the trigger for Trade or Contract creation; legal parties and I Do Grow capacity; signatories; title/risk transfer; Contract template; cancellation, claims and other binding consequences remain unresolved under A2, A3, A7 and A8.

## Structured quality and evidence

- **Quality Definition:** A reusable, versioned definition of a measurement, observation or other quality concept, including applicable Product Type/Form and allowed result shape.
- **Quality Template:** A versioned set of applicable definitions, instructions, evidence expectations and optional references to approved methods or Grade rules. An Inspection pins the exact Template version.
- **Inspection:** A Lot-linked, purpose- and assignment-scoped quality process at an approved checkpoint.
- **Quality Result:** A typed, provenance-bearing declaration, Measurement or Observation linked to a Quality Definition and Inspection where applicable. Original value/unit and any approved normalized value remain distinct.
- **Evidence:** A separate document, photograph, report, certificate reference or other supporting record with source, scope, verification state and version.
- **AI Preliminary Assessment:** A non-authoritative proposal linked to evidence and review context; it is not a Measurement, Human Verification or final Grade.
- **Human Verification:** A version-bound human decision over exact Results and Evidence.
- **Grade Structure:** A reusable versioned definition/rule structure without invented Grade names, thresholds or pass/fail rules.
- **Lot Grade Assignment:** A distinct human-approved assignment to a Lot under an approved Grade rule/version, where one exists.
- **Non-Conformity:** A structured issue linked to an Inspection, Lot, evidence and its own review/correction history. It has no automatic commercial consequence.

Declared, measured, observed, document-backed, AI-preliminary, human-verified and final-grade information remain distinct. Quality authority remains primarily Lot/Inspection-centric. Corrections create linked successor versions rather than silently overwriting verified history.

**OPEN:** Mandatory quality dimensions, units, precision, methods, sampling, equipment, evidence, certificates, Grade vocabulary, thresholds, pass/fail rules, Inspection checkpoints, approvers, Non-Conformity outcomes and commercial remedies remain unresolved under A5–A8.

## Logistics and delivery

- **Shipment:** A transaction-scoped record linking authorised parties, physical Lot/quantity, route, requirements, selected carrier context, status and evidence.
- **Freight Quote:** A provider proposal retained separately from the commercial Quote where applicable.
- **Shipment Event:** A provenance-bearing pickup, custody, transit, customs, delay, shortage, damage or delivery event.
- **Delivery Evidence:** Documents or observations supporting delivery/receipt without automatically establishing legal acceptance.

External logistics access remains assignment- and transaction-scoped. Inspection completion does not automatically release a Shipment.

**OPEN:** Binding carrier booking, Shipment release, required documents, custody handoffs, delivery acceptance, exception handling, claims and quantity/commercial effects remain unresolved under A7 and A8.

## Settlement and payment-status records

- **Settlement:** Administrative status and reconciliation context for invoices, expected amounts, due dates, external payment instructions, payment evidence, balances, commissions, claims and credits.
- **Payment Evidence / Status:** A provenance-bearing record of externally executed payment activity and human verification; it is not payment execution.

The MVP does not execute payments, hold funds, provide internal banking or provide direct escrow.

**OPEN:** Who invoices/pays whom, currencies, terms, payment methods, evidence, instruction-change authority, late/partial/disputed handling, claims/credits and Settlement closure remain unresolved under A7 and A9.

## DPP, provenance and sharing

- **DPP:** A versioned, Lot-linked projection of authorised provenance and traceability information.
- **DPP Event:** A reference to an authoritative origin, quality, transaction, custody, Shipment, delivery, correction or other approved source event.
- **DPP Projection / Sharing Context:** A purpose-specific public, counterparty, internal or restricted view that does not duplicate mutable authority.

The basic foundation may support Lot identity, origin, authorised Supplier information, quality events, transaction/custody events, Shipment/delivery events, documents and verification/provenance metadata where approved.

**OPEN:** Exact DPP fields, completeness, owner, correction, publication/sharing authority, lifecycle point, personal/confidential visibility, retention and Lot/Batch transformation effects remain unresolved under A6, A7 and A10.

## Documents, audit and future Platform Agents

- **Document / File:** A private-by-default evidence object with provenance, uploader/organisation, purpose, linked resource, verification/processing state and visibility context. Its storage vendor remains TBD.
- **Audit Event:** An append-only critical-action record containing actor type, identity, role/capacity, acting organisation, represented party, resource/version, action/outcome, time, source/channel, reason, approval and relevant before/after summary.
- **Platform Agent Proposal:** A structured, provenance-bearing draft or recommendation created through a controlled capability and linked to its initiating context, evidence, model/tool version, review and outcome.

Future Platform Agents use allowlisted backend tools/services, receive minimum authorised context and have no independent business authority or direct database mutation capability. Human approval binds to an exact proposal and resource version where required.

**OPEN:** Provider choices, retention, immutability mechanism, exact audit payloads, AI capability/provider rules and personal-data handling remain TBD or subject to legal/privacy review.

## Core relationship summary

```text
User ── Membership ── Organisation
  └── Role/Capability Assignment ── Resource Assignment
        └── represented-party Mandate/Acting Capacity

Product Category → Product Type → Product Form
Product Form ↔ Packaging / Application / Quality Definition

Supplier Organisation → Listing → Lot
Buyer Organisation → Buy Order → Match (NON-BINDING) ← Listing/Lot
Buy Order/Listing/Lot → Quote → Trade → Contract
Lot → Inspection → Quality Result / Evidence → Human Verification
Quality Definition/Template → Inspection
Grade Structure → Lot Grade Assignment
Inspection → Non-Conformity
Trade/Contract/Lot → Shipment → Shipment Event/Delivery Evidence
Trade/Contract → Settlement → external Payment Evidence/Status
Lot → DPP → DPP Event/Projection

User/System/Platform Agent Proposal
  → Approval where required
  → authorised action
  → Audit Event
```

Arrows show conceptual relationships, not cardinalities, ownership rules, legal triggers or automatic state transitions.

## Integrity, privacy and implementation boundaries

- Preserve stable identity, original values/units/currencies, source/channel, provenance, versions, corrections, approvals and audit history.
- Bind consequential approvals to exact reviewed versions; changed content requires revalidation and, where applicable, reapproval.
- Keep Product, Listing, Lot, Packaging, Application, Quality, Grade, Certification and DPP distinct.
- Keep System state, individual Results, approval decisions and commercial consequences distinct.
- Use authorised field projections rather than sending restricted fields to the frontend and hiding them.
- Keep files private by default and constrain external access by organisation, transaction, assignment, purpose and explicit sharing.
- Treat retention, erasure/restriction, lawful basis, controller/processor roles, transfers and DPIA/AIPD determination as **OPEN / LEGAL REVIEW REQUIRED**.

This model selects no table, column, key, index, constraint, ORM, migration, tenant implementation, storage vendor, transaction-isolation strategy or endpoint. Physical design belongs to later authorised implementation work under DEC-001.

## Unresolved conceptual questions

- Lot versus Batch meaning and all split/combine/substitute/transform/inheritance rules.
- Listing/Lot/quantity cardinalities and reservation, release, expiry and sold semantics.
- I Do Grow capacity, represented-party mandate and final authority for sensitive actions.
- Quote, Trade and Contract creation triggers and legal effects.
- Approved operational quality definitions, methods, thresholds, Grades, certificates, checkpoints and remedies.
- Contract, Shipment, delivery, claims and exception authority/effects.
- Settlement/payment responsibilities, execution boundaries and closure rules.
- DPP completeness, publication, sharing, correction, visibility and retention.
- Exact role/capability/field matrix, privacy roles, lawful bases, retention and provider choices.

These questions remain governed by `CLIENT_CLARIFICATIONS.md`; conceptual synchronization does not answer or approve them.
