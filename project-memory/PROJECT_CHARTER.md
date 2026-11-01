# Project Charter

## Business vision

I Do Grow is intended to become an international B2B trading platform and active commodity trader for natural, biobased, and, in the longer term, fermentation- and cultivated-based raw materials and products. It aims to make fragmented supply markets accessible, comparable, traceable, and suitable for professional international trade, spanning “farm to factory” and eventually “factory to shelf.”

The platform is intended to connect supply, demand, quality, price, logistics, contracts, traceability, compliance, settlement records, Digital Product Passports, and human-controlled AI assistance around one transaction lifecycle. I Do Grow’s own traders use the same platform as external participants and may trade, aggregate, purchase, and resell products.

## Primary actors

- **Supplier:** A farmer, cooperative, raw-material producer, fermentation plant, or cultivated-production facility offering products or lots.
- **Buyer:** A processor, factory, wholesaler, retailer, or brand seeking or purchasing products.
- **I Do Grow Trader:** An internal operator who assists participants, manages relationships, matches supply and demand, negotiates and prepares transactions, and approves high-risk automated recommendations.
- **Quality Inspector:** A person or organisation that performs and records inspections, measurements, evidence, grades, and certificates.
- **Logistics Partner:** A provider that quotes, carries, and reports on shipments.
- **Compliance Manager:** An operator responsible for documentation, certification, regulatory-data, audit, and DPP completeness review.
- **Administrator:** An operator responsible for users, permissions, taxonomies, workflow rules, activity review, and system-wide settings.
- **Platform Agent:** A bounded AI assistant that proposes or performs permitted low-risk work through controlled tools and escalates or requests human approval where required.

Financial, insurance, laboratory, and other external partners are part of the broader ecosystem but are not defined as primary MVP user experiences.

## MVP objective

Prove that I Do Grow can facilitate at least one real, end-to-end transaction in the platform involving a real supplier and product lot, structured quality information, a real buyer request, a human-approved match, a quotation, a contract, a shipment, recorded payment status, and a basic Digital Product Passport.

The initial operational use case is European hemp, focused first on retted hemp straw and large rectangular bales in the Netherlands and France, for applications including insulation, nonwoven materials, biocomposites, and construction materials. Decorticated hemp fibre, hurd, and other co-products are described as later products.

## Core end-to-end transaction lifecycle

1. A supplier registers directly or is assisted or invited by an I Do Grow Trader.
2. Supplier identity, business details, sites, documents, and completeness/risk status are captured and reviewed.
3. The supplier or trader creates a structured listing and identifies its available lot(s), with product, quantity, location, availability, price, photos, documents, and known quality data.
4. A trader or quality manager reviews and approves the listing for publication.
5. A buyer searches listings, requests a quotation, or creates a buy order with applicable product, quality, delivery, price, certification, packaging, DPP, transport, and payment requirements.
6. Supply and demand are compared using compatibility, quality, volume, location, timing, costs, risk, documentation, and buyer preferences. The first release proposes matches; it does not create a binding transaction automatically.
7. A quote is prepared with a transparent cost breakdown, reviewed, negotiated, versioned, and accepted or rejected.
8. Required quality inspection is completed; evidence and measurements are recorded, with any AI assessment remaining preliminary until human approval.
9. An accepted quote produces structured trade/contract records and a human-reviewed contract.
10. Shipment requirements are created, freight is quoted and selected, pickup and delivery are tracked, and exceptions are recorded.
11. Invoices, payment instructions, status, balances, commissions, claims, and final settlement are administratively tracked; the MVP is not a regulated payment institution.
12. Lot provenance, quality, transaction, and shipment events update a basic DPP and auditable transaction history.

## MVP scope

MVP capabilities are those explicitly listed in the manual’s “MVP Scope” and “MVP Success Criteria”: supplier onboarding and mobile/WhatsApp-assisted listing intake; buyer search, buy orders, quotations, and quote acceptance; trader management, approval, matching, quotes, and transaction overview; inspection records and human-approved quality grades; basic shipment and freight records; a basic lot-linked DPP; and reviewable AI assistance for onboarding, extraction, preliminary quality, match explanation, and trader support.

All high-risk or binding actions initially require human control. The MVP prioritises making I Do Grow’s own traders effective and proving a real transaction.

## Explicitly out of scope for the first MVP

Unless required by a real transaction, the client excludes fully autonomous trading; blockchain; internal banking or direct escrow; automated credit decisions or customs declarations; live global freight pricing for every lane; advanced derivatives trading; a carbon-credit marketplace; a consumer marketplace; native iOS and Android applications; a complex warehouse-management system; and fully automated legal decisions.

## Long-term vision (not MVP commitments)

- Expand beyond European hemp to other fibres, countries, semi-finished and finished goods.
- Extend from farm-to-factory trading to factory-to-shelf transactions.
- Support precision fermentation, biomass fermentation, and cultivated-production materials.
- Open proven internal trading infrastructure increasingly to external market participants.
- Increase agent autonomy only after sufficient transactional data and operational confidence.
- Add carrier, laboratory, payment, escrow, finance, insurance, and external supplier integrations.
- Build richer event-based DPP, lot transformation, risk, sustainability, and global matching capabilities.

## Unresolved scope points

- The sources do not identify the single real transaction or customer that will serve as the MVP proof case.
- “Mobile website or app” appears in the business description, while native iOS and Android apps are excluded from the first MVP; the manual explicitly requires mobile web/mobile-first capability.
- The manual lists broad MVP capabilities while its phased roadmap schedules some of them in later numbered phases. Release sequencing and the minimum transaction-specific slice remain to be approved.
- Exact binding authority, approval thresholds, commercial terms, and exception handling are not specified.
