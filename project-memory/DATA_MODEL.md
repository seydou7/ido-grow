# Conceptual Data Model

This captures client-described business concepts and relationships only. It is not a SQL schema, API contract, storage design, or approved architecture.

## Identity, organisations, and access

- **Organisation** represents a supplier, buyer, logistics provider, inspection company, laboratory, or I Do Grow entity.
- An Organisation has Sites, Members/Users, contacts, tax registrations, bank details, certifications, and verification/completeness status.
- A User participates through membership and assigned roles/permissions.
- Ownership, role, transaction relationship, explicit sharing, marketplace visibility, and internal I Do Grow access determine conceptual access.

## Product catalogue and quality definitions

- Product Category contains Product Types; a Product Type supports Product Forms.
- Product definitions are separate from supplier Listings.
- Product Types define required/optional Quality Attributes, Measurement Definitions, Units, validation/grading rules, inspection instructions, Applications, Packaging Types, and Certification Types.
- Initial concepts include natural fibre → hemp → retted straw → large rectangular bale, with named applications.

## Supply and inventory

- A Supplier Organisation creates/owns Listings; a Trader may act on its behalf.
- A Listing describes product, price, quantity/unit, location, availability, documents, photos, and known quality information.
- A Listing may contain multiple Lots or Batches and may have Reservations.
- A Lot remains traceable through Inspection, Quality Grade, Match, Trade, Shipment, and DPP.
- Lots may be split, combined, or transformed into output lots with preserved many-to-many provenance.

## Demand and matching

- A Buyer Organisation creates a Buy Order, potentially through a Trader.
- A Buy Order contains product lines and applicable quality, delivery, certification, packaging, DPP, transport, payment, origin, quantity, date, and price requirements/preferences.
- A Match Run compares Buy Orders with active Listings/Lots and creates Match Candidates.
- A Match Candidate contains an explainable Match Score and Landed-Cost Breakdown and may combine suppliers/lots.
- A recommendation is not binding in the first release; human/trader approval is required.

## Quality

- An Inspection applies an Inspection Template to a Lot and is assigned to an inspector/organisation.
- It records Results, structured Quality Measurements, Samples, evidence, methods, units, timestamps, equipment, location, Non-Conformities, and optional Laboratory Results.
- A Quality Grade derives from evidence/measurements; an AI grade remains preliminary until authorised human approval.

## Commercial transaction

- A Quote relates buyer demand to supply and has retrievable Quote Versions.
- Versions contain product and applicable margin/commission, inspection, packaging, freight, customs, insurance, storage, tax, and service cost lines.
- Negotiation may produce offers/counteroffers; an accepted quote converts to a Trade.
- A Trade links Buyer, Seller, applicable I Do Grow entity, trade lines/lots, agreed terms, and related Match/Quote.
- A Contract records product, quantity/tolerance, price, Incoterm, quality/inspection conditions, dates, payment terms, claims, documents, cancellation, law, parties, versions, and signatures.

## Logistics

- A Trade/Contract produces Shipment Requirements and one or more Shipments.
- A Shipment links origin/destination, Lots/Trade lines, Freight Quotes, Carrier, legs, vehicle/container information, pickup, delivery, documents, and Tracking Events.
- Delivery, delays, damage, quantity differences, disputes, and reconciled costs belong to its lifecycle.

## Finance and settlement records

- A Trade/Contract may have Invoices/lines, payment instructions/records, schedules, deposits, balances, commissions, credit notes, claims, taxes, currencies/rates, and a Settlement.
- Settlement records administrative state/final amounts; the initial platform is not a regulated payment institution.
- Monetary values retain amount, original currency, exchange-rate source/date, and tax status.

## DPP and provenance

- A DPP is versioned and linked to a Lot, Batch, component, or finished product.
- It contains provenance-aware fields and DPP Events forming a Product Journey/Chain of Custody.
- Events may link party, time, location, source records, documents, verification, input lots, and output lots.
- Initial content is lot identifier, origin, supplier, quality, transaction events, shipment events, and a basic downloadable page.
- Rich composition, processing, transformation, sustainability, reuse, recycling, and end-of-life data are later vision.

## Agents, approvals, notifications, and audit

- A Platform Agent has a purpose, tool allowlist, restrictions, context, output schema, prompt/version, confidence, evidence, escalation rules, and execution log.
- Agent Proposals may create drafts/recommendations; human Approval Records govern high-risk execution.
- Notifications relate users/organisations to events, channels, and preferences.
- Audit Events capture actor, action, entity, timestamp, before/after values, context, reason, and approval. Critical transaction history is immutable.

## Core relationship summary

Organisation → User/Membership/Role  
Supplier Organisation → Listing → Lot → Inspection/Quality Grade  
Buyer Organisation → Buy Order → Match Candidate ← Listing/Lot  
Accepted Quote → Trade → Contract → Shipment → Settlement records  
Lot → DPP → DPP Events/Product Journey  
User or Platform Agent action → Approval (when required) → Audit Event

## Required modelling principles

- One shared conceptual transaction model across marketplace, internal trading, quality, logistics, compliance, DPP, and agents.
- Product definitions separate from listings; quality stored as structured measurements, not generic text.
- Preserve lot traceability and original values, currencies, inputs, provenance, versions, and approvals.
- Support multiple product categories without redefining the conceptual structure for every material.
- Never let an AI proposal silently replace verified source information.

## Unresolved conceptual questions

- Exact distinction between Lot and Batch.
- Commercial/legal effect and expiry of a Reservation.
- Seller identity and I Do Grow’s principal/agent role by transaction.
- Cardinality among listings, lots, trade lines, shipments, contracts, invoices, and settlements.
- Product ownership/title-transfer points and Incoterm implications.
- Required versus optional onboarding, quality, DPP, compliance, and contract fields.
- Master-data ownership, retention periods, and post-verification amendment rights.
