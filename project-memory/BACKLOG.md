# Backlog

This backlog records source-backed capabilities and Sprint 00 discovery work. Capability entries are requirements rather than approved implementation design; Sprint 00 entries carry their current delivery status. Ordering within a section is not a delivery commitment.

## Sprint 00 — discovery and foundation

- **PENDING:** Finalise the hemp product taxonomy.
- **PENDING:** Define the structured quality data model.
- **PENDING:** Define roles and permissions.
- **PENDING:** Define the first transaction workflow.
- **COMPLETE:** Initial technical architecture approved in DEC-001; later choices explicitly left TBD remain pending.
- **PENDING:** Produce and audit wireframes for required experiences.
- **PENDING:** Define API conventions consistent with DEC-001.
- **PENDING:** Complete a data-protection assessment.
- **COMPLETE:** Audit the existing Fiber Connect product or implementation before development; see `sprints/sprint-00/LEGACY_AUDIT.md`.
- **COMPLETE:** Complete the source-based legacy UX audit; see `sprints/sprint-00/LEGACY_UX_AUDIT.md`.
- **PARTIAL:** Complete the legacy visual review. Route-by-route preparation exists, and sufficient human inspection established a broadly reusable visual brand direction and a need for substantial workflow redesign; detailed screen-by-screen review and final visual approval remain pending.
- **COMPLETE:** Configure the Project Agent System and validate Party Mode through the successful functional smoke test.

No Sprint 00 backlog item is currently recorded as **BLOCKED**. Unresolved inputs below remain open and may require client or human clarification before the affected work can be completed.

## MVP-required capabilities

### Platform, organisations, and access

- Establish application foundation, environments, authentication, file storage, and delivery pipeline only after technology decisions are formally approved.
- Support organisations, sites, users, memberships, supplier/buyer organisation types, roles, permissions, verification, and onboarding.
- Support multiple organisations with role-, ownership-, transaction-, sharing-, and marketplace-based access boundaries.
- Record immutable audit history for critical trading records and additional controls for critical actions.
- Support English, Dutch, and French initially; retain original input when translation is used.

### Product catalogue, listings, and supplier intake

- Support a reusable taxonomy with categories, types, forms, applications, packaging, units, quality attributes, measurement definitions, and certifications.
- Configure the initial hemp use case: retted hemp straw, large rectangular bale packaging, and named initial applications.
- Allow supplier and trader-assisted onboarding.
- Allow mobile-first listing creation with quantities/units, location, availability, price, photos, documents, and known quality measurements.
- Support the documented listing review, publication, availability, reservation, sale, expiry, rejection, and suspension states.
- Support WhatsApp-assisted intake: receive content, identify the user, retain conversation/original input, extract product information, request missing fields, create a draft, and hand over to a trader.

### Buyer demand and marketplace

- Provide marketplace search, listing details, comparison, and documented filters.
- Create buy orders with applicable product, quality, quantity, delivery, price, origin, certification, packaging, DPP, transport, and payment requirements.
- Support quotation requests, recurring supply requests, and private requests to selected suppliers.

### Matching and landed cost

- Filter compatible listings and support single-source and multi-supplier recommendations.
- Compare product, quality, quantity, location, delivery, price, freight, duties, risk, certification, packaging, minimum volumes, lead time, and buyer preferences.
- Calculate and retain a transparent landed-cost breakdown.
- Produce configurable, explainable results and require trader approval; do not create binding transactions automatically in the first release.
- Ensure deterministic services perform calculations while agents explain results.

### Quality

- Define inspection templates and an initial hemp inspection covering structured measurements, visual assessment, contamination, moisture, photo evidence, provenance, and non-conformities.
- Support remote, self-reported, locally verified, physical, and laboratory evidence where applicable.
- Allow a preliminary, clearly labelled AI-assisted assessment and require authorised human approval of the grade.
- Record inspection findings and certificates where applicable.

### Quotes, trades, and contracts

- Create, review, send, counter, accept, reject, expire, and version quotes with cost breakdown and retained history.
- Convert an accepted quote into a structured trade.
- Generate and retain a structured contract and, where used, a PDF based on approved templates.
- Require human review and signature for final contracts.

### Logistics and settlement records

- Create shipment records with origin, destination, requirements, manual freight quotation entry, carrier selection, status/tracking, documents, delivery confirmation, exceptions, and cost reconciliation.
- Administratively track invoices, payment instructions, due dates, deposits, balances, payment status, commissions, claims, credit notes, and final settlement without acting as a regulated payment institution.

### Digital Product Passport

- Create a lot-linked basic DPP with identifier, origin, supplier, quality information, transaction events, shipment events, and downloadable passport page.
- Preserve field provenance, verified source information, versions, and related records.

### Human-controlled AI assistance

- Provide MVP assistance for supplier onboarding, listing extraction, preliminary quality, matching explanations, and trader support.
- Use allowlisted tools, validated structured outputs, confidence/evidence, logs, approvals, escalation, and human correction.
- Prevent agents from inventing product data, measurements, certifications, parties, or binding terms.

### Required MVP proof and validation

- Complete at least one real transaction containing every stated MVP success item.
- Validate mobile-phone offer submission and trader listing completion in under ten minutes.
- Validate buyer comparison of multiple offers and a transparent landed-cost estimate.
- Verify auditability and human review/correction of AI information.
- Verify the conceptual data model can support another fibre without structural redevelopment.

## Later-phase capabilities

- Decorticated hemp fibre, hurd, other co-products, additional natural fibres, countries, and applications.
- Semi-finished and finished product trading from factory to shelf.
- Precision-fermentation, biomass-fermentation, and cultivated-production products.
- Rich event-based DPP with lot transformations, custody, sustainability, recycling, and end-of-life data.
- Carrier, laboratory, external supplier API, payment, escrow, financing, and insurance integrations.
- More automated matching, consolidation/optimisation, real-time pricing inputs, and advanced risk models.
- Configurable quality agents and increased agent autonomy after operational evidence.
- Advanced analytics beyond what the real transaction requires.

## Explicit first-MVP exclusions

- Fully autonomous trading; blockchain; internal banking; direct escrow.
- Automated credit decisions or customs declarations.
- Live global freight pricing for every lane.
- Advanced derivatives or carbon-credit trading; consumer marketplace.
- Native iOS and Android apps; complex warehouse-management system.
- Fully automated legal decisions.

The client qualifies these exclusions with “unless a real transaction requires it”; no exception has yet been identified or approved.

## Client technical recommendations and decision status

- **COMPLETE — Approved by DEC-001:** Next.js/React/TypeScript frontend, Tailwind CSS, shadcn/ui baseline, React Hook Form, TanStack Query, internationalization support, NestJS/TypeScript modular monolith, versioned REST API boundary, and PostgreSQL as the primary transactional system of record.
- **COMPLETE — Approved constraint in DEC-001:** Object/file storage is required, but its vendor remains TBD. Queues and Redis are not part of the initial architecture and may be introduced later only for a concrete requirement.
- **PENDING — Explicitly not decided by DEC-001:** Cloud provider, hosting provider, authentication provider, object-storage vendor, queue technology, LLM provider, payment provider, WhatsApp implementation details, observability vendor, CI/CD vendor, exact ORM, and exact API-documentation tooling.
- **PENDING — Recommendations, not implementation commitments:** Suggested team structure, infrastructure-as-code choices, deployment details, search/vector additions, and example match-score weighting remain subject to their applicable requirements and approvals.

## Unresolved backlog inputs

- Identify the real supplier, lot, buyer, lane, commercial terms, and owner for the MVP proof transaction.
- Confirm the minimum slice across the broad MVP list and phased roadmap.
- Clarify whether both France and the Netherlands must appear in the first transaction.
- Define approval roles/thresholds for binding offers, large purchases, payment release, supplier suspension, and WhatsApp handover value.
- Define required onboarding documents, verification, quality thresholds, contract templates, jurisdiction, payment terms, claims, and DPP obligations for the selected transaction.
- Clarify lot versus batch semantics and reservation behavior.
