# Backlog

## Sprint 00 — Discovery and Foundation — COMPLETE

- **COMPLETE:** Establish the authoritative source-of-truth register and extracted project memory.
- **COMPLETE:** Approve DEC-001 as the initial technical architecture baseline.
- **COMPLETE:** Define the preliminary European hemp taxonomy for retted straw, bale packaging, and initial applications.
- **COMPLETE:** Define the Lot/Inspection-centric quality model foundation while preserving OPEN gates on unapproved rules.
- **COMPLETE:** Establish the tenant-aware, server-enforced Roles & Permissions foundation.
- **COMPLETE:** Establish provider-neutral, resource-oriented API conventions consistent with DEC-001.
- **COMPLETE:** Perform the preliminary data-protection assessment without claiming compliance.
- **COMPLETE:** Create the consolidated client clarification pack.
- **COMPLETE:** Create and commit the 15-step scenario-generic, OPEN-gated First MVP Transaction Workflow.
- **COMPLETE:** Create low-fidelity MVP wireframes covering the 22 `REQUIRED_MVP` screen families.
- **COMPLETE:** Synchronize the conceptual `DATA_MODEL.md` with all Sprint 00 foundations without creating physical schema.
- **COMPLETE:** Audit the existing Fiber Connect product or implementation before development; see `sprints/sprint-00/LEGACY_AUDIT.md`.
- **COMPLETE:** Complete the source-based legacy UX audit; see `sprints/sprint-00/LEGACY_UX_AUDIT.md`.
- **COMPLETE:** Close the visual review for Sprint 00 foundation purposes through Project Owner-approved Option B. The legacy route-by-route approval was superseded for planning purposes and remains historical evidence; final production visual design and validation are deferred.
- **COMPLETE:** Configure the Project Agent System and validate Party Mode through the successful functional smoke test.

The final `sprint-close` assessment returned PASS. Sprint 00 is closed and complete.

## Sprint 01 — Platform Foundation — COMPLETE

- **COMPLETE — Application & Monorepo Foundation:** Monorepo structure, NestJS backend, Next.js 16 frontend, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, ESLint and TypeScript baselines.
- **COMPLETE — Isolated PostgreSQL & Prisma Data Access:** Docker PostgreSQL 16 container (`ido-grow-postgres-16` on `55432`) and Prisma schema/migration layer under DEC-004.
- **COMPLETE — Application-Managed Authentication:** DEC-004 session management, password hashing, secure login/session/logout API, synthetic local-user tooling and frontend authentication panel.
- **COMPLETE — Legacy-Branded Login Visual Integration:** Project Owner-validated branded authentication experience adhering to legacy I Do Grow visual language.
- **COMPLETE — Organisation, Site & Self-Membership Foundation:** Persisted Organisation, Site, and User-Organisation Membership models with authenticated read-only self-membership API.
- **COMPLETE — Immutable Audit Event Writer Foundation:** Append-only AuditEvent persistence for `authentication.login.succeeded`, `authentication.login.failed` and `authentication.logout.succeeded`.
- **COMPLETE — Frontend Internationalization Runtime:** DEC-005 typed runtime supporting English (default/fallback), Dutch, and French non-business platform copy, validated SameSite locale cookie, and accessible language selector.

The final `sprint-close` assessment returned PASS. Sprint 01 is closed and complete.

## Sprint 02 — Organisations & Supplier Onboarding — CLOSED

Sprint 02 completed the capability backlog for Organisation lifecycle and Supplier onboarding on top of the platform foundation.

Guardrails: build only from approved foundations; keep behavior marked **OPEN** blocked until approved; preserve all legal/privacy, authority, and verification gates.

### Sprint 02 Scope: Organisations & Supplier Onboarding
- **COMPLETE (PROJECT OWNER VALIDATED) — Supplier Organisation Profile & Production Sites (Vertical Block 01):** Commercial and legal entity profile, business activity, contact info, production sites (land area, GPS, facilities), completeness calculation, and authenticated full-width app shell.
- **COMPLETE (PROJECT OWNER VALIDATED) — Supplier Compliance Documents & Verification Foundation (Vertical Block 02):** Additive ComplianceDocument persistence, provider-neutral file storage with local development adapter, upload boundary limits (10MB, 1 file), magic-byte binary signature validation (PDF/JPEG/PNG/WEBP), compliance document upload/download, verification status tracking (`PENDING_REVIEW`), append-only audit events, and compliance management UI. Supplier document removal remains OPEN / unsupported. Trader/Admin approval workflow remains OPEN.
- **COMPLETE (PROJECT OWNER VALIDATED) — Organisation Members & Multi-User Foundation (Vertical Block 03):** Multi-user organisation member listing API, server-enforced tenant isolation, and Supplier Portal Team & Members view displaying member email and association date. Roles (ADMIN/OPERATOR/MEMBER), invitation workflows, member removal/deactivation, membership status lifecycle, and active organisation switching semantics remain OPEN / UNSUPPORTED.
- **COMPLETE (PROJECT OWNER VALIDATED) — Guided Supplier Onboarding & Readiness Overview (Vertical Block 04):** Dedicated Onboarding Overview navigation section and guided step-by-step checklist across profile, production sites, compliance documents, and team, reusing existing Profile Readiness scoring and providing deep-link navigation. Trader-assisted onboarding authority, Trader review/approval/activation interfaces, and marketplace gating remain OPEN / UNSUPPORTED.

The formal closure assessment returned PASS. Sprint 02 is closed and complete.

---

## Sprint 03 — Product Catalogue & Listings — CLOSED

Sprint 03 delivered the Product Catalogue and Supplier Listing capabilities on top of the validated organisation and onboarding foundation.

### Sprint 03 Scope: Product Catalogue & Listings
- **COMPLETE (PROJECT OWNER VALIDATED) — Supplier Catalogue & Listing Foundation (Vertical Block 01):** Tenant-owned Listing persistence model, Supplier listing creation, editing, retrieval, detail view, canonical natural fibre taxonomy (HEMP, SISAL, COIR, JUTE, KENAF, RAFFIA), canonical product form taxonomy (STRAW_RAW, STRAW_RETTED, FIBRE_TECHNICAL, FIBRE_SHORT, HURD_SHIVES, DUST_PELLETS), quantity with approved units (TONNES, KILOGRAMS, BALES), optional price with EUR baseline and neutral missing-price semantics ("Price not specified"), optional origin country, optional harvest year, optional production site association, Draft / Published status lifecycle, Supplier Portal Product Listings view with material filtering, and immutable audit events (`organisation.listing.created`, `organisation.listing.updated`). Taxonomy final audit returned VERIFIED. Deferred: available vs total quantity, reservation/allocation, MOQ, negotiable pricing, availability date, Lot/Batch, structured quality parameters, listing certifications/photos/documents, Trader review/approval gating, Buyer marketplace browsing, sold/reserved status, DPP association, hard deletion, future advanced taxonomy inheritance.

The formal closure assessment returned PASS. Sprint 03 is closed and complete.

## Sprint 04 — Buyer Marketplace & Buy Orders — CLOSED

Sprint 04 delivered the Buyer Marketplace discovery capabilities and structured Buy Order demand workflows.

### Sprint 04 Scope: Buyer Marketplace & Buy Orders
- **COMPLETE (PROJECT OWNER VALIDATED) — Buyer Marketplace & Listing Discovery (Vertical Block 01):** Dedicated marketplace domain boundary (`/api/v1/marketplace/listings` & detail), server-enforced `status = 'PUBLISHED'` query filter (DRAFT listings completely inaccessible), role-based marketplace access enforcement (Buyer & Trader allowed; Supplier denied cross-supplier marketplace access with 403 Forbidden), PostgreSQL full-text search across title/description/material/country, faceted filters (materialType, productForm, originCountry, harvestYear, quantity range, price presence/range, units), safe intermediated Supplier transparency without personal contact leakage, synthetic local Buyer/Trader test fixtures, responsive Marketplace catalogue & Listing detail UI, and Project Owner browser validation PASS.
- **COMPLETE (PROJECT OWNER VALIDATED) — Buy Orders & Demand Management (Vertical Block 02):** Additive `BuyOrder` persistence model and migration, additive audit migration `20260830010000_add_buy_order_deleted_audit_event`, structured demand specifications (natural fibre material, product form, volume/quantity, delivery destination/country/date, target price in EUR, quality/packaging/certification requirements, transport & payment terms), status lifecycle (`DRAFT`, `OPEN`, `CANCELLED`), edit and permanent deletion restrictions (DRAFT only), server-enforced role access (Buyer manages and deletes own demands; Trader creates on behalf of Buyer, manages/submits/deletes own drafts, and accesses cross-organisation OPEN demand; private Buyer drafts isolated from Trader; Supplier denied 403 Forbidden), append-only audit logging (`buyer.buy_order.created`, `buyer.buy_order.updated`, `buyer.buy_order.submitted`, `buyer.buy_order.cancelled`, `buyer.buy_order.deleted`), DELETE endpoint returning HTTP 204 No Content, Buyer "My Buy Orders" dashboard, 6-section Create/Edit Modal, Buy Order Detail view with non-binding notice, and Trader demand overview.

The formal closure assessment returned PASS. Sprint 04 is closed and complete.

---

## Sprint 05 — Trader Cockpit & Manual Matching — ACTIVE

Sprint 05 is in ACTIVE status following Project Owner explicit authorization.

### Sprint 05 Scope: Trader Cockpit & Manual Matching
- **IMPLEMENTED (AWAITING PO VALIDATION) — Trader Manual Matching Workspace (Vertical Block 01):**
  - Additive `Match` Prisma model and additive migrations `20260831081928_trader_cockpit_matches` and `20260901160000_sprint05_match_single_approved` with foreign keys and indexes.
  - Deterministic Compatibility Indicators (`matching-calculator.ts`) evaluating Material (MATCH/MISMATCH), Form (MATCH/MISMATCH/NOT_SPECIFIED), Volume coverage (SUFFICIENT/INSUFFICIENT), Origin (ACCEPTABLE/NOT_ACCEPTABLE/NOT_SPECIFIED), and Certifications without AI, weighted scores, or landed-cost scores.
  - Server-enforced single approved match invariant (DEC-007): multiple candidates can be compared, but only ONE Match may be APPROVED per Buy Order at a time.
  - Strict server-side role access (`assertTraderAccess`) reserving matching workspace and actions to Traders (HTTP 403 Forbidden for Buyer / Supplier).
  - Status lifecycle (`DRAFT`, `APPROVED`, `CANCELLED`) and immutable audit events (`buyer.buy_order.match.created`, `buyer.buy_order.match.approved`, `buyer.buy_order.match.cancelled`).
  - Dedicated Trader Matching Workspace UI with Buyer Demand summary header, Candidate Supply discovery cards, Side-by-Side comparison matrix (2–4 listings), selected candidate panel with Trader notes, and approval/revocation modals.
  - Integration with Trader Demand Overview (`Match Supply →`) and Buy Order Detail view (`Match Supply →`).

- **IMPLEMENTED (AWAITING PO VALIDATION) — Trader Cockpit & Operational Queue (Vertical Block 02):**
  - Canonical backend read model contract (`GET /api/v1/trader/cockpit`; duplicate matching alias removed) querying live PostgreSQL entities via Prisma.
  - 5 source-safe operational metrics: (1) Supplier onboarding attention, (2) Incomplete/draft listings, (3) Published active listings, (4) Open Buyer Demands, (5) Approved Matches. Zero fake mock data.
  - Consolidated deterministic operational queue spanning `buyer_demand`, `supplier_onboarding`, `listing_review`, and `approved_match` with FIFO tie-breaker. Zero new persistence tables.
  - Compact Open Buyer Demands table with real `BuyOrder` records, dynamic match status (`No Match`, `Draft Match`, `Approved Match`), and direct "Find Match" navigation to the Block 01 Matching Workspace.
  - Compact Approved Matches view displaying buyer, supplier, listing, volume, approval date, and passive "Ready for Quotation" badge (Sprint 06 handover).
  - Server-enforced role security: Trader 200, Buyer 403, Supplier 403, Unauthenticated 401.
  - AuthenticatedAppShell navigation integration with `Trader Cockpit` as primary section for Trader portal.


---

- **IMPLEMENTED (AWAITING PO VALIDATION) — Trader Supplier & Buyer Management (Vertical Block 03):**
  - Removed duplicate cockpit alias `GET /api/v1/matching/cockpit`, preserving only canonical `GET /api/v1/trader/cockpit`.
  - Trader Supplier Management read endpoints (`GET /api/v1/trader/suppliers`, `GET /api/v1/trader/suppliers/:organisationId`) with real listing and site counts, verification filtering, and case-insensitive search.
  - Supplier operational detail view with tabs for Product Listings, Production Sites, Compliance Documents, and Legal Profile.
  - Server-authorised on-behalf Listing creation for Suppliers (`ListingsService`), validating target organisation is a Supplier, preserving Supplier ownership, and recording Trader audit actor.
  - Trader Buyer Management read endpoints (`GET /api/v1/trader/buyers`, `GET /api/v1/trader/buyers/:organisationId`) with BuyOrder counts, approved match counts, verification filtering, and search.
  - Buyer operational detail view with demands, match statuses, approved match summaries, and direct Matching Workspace links.
  - Reused existing Sprint 04 on-behalf BuyOrder creation modal from Buyer Management detail.
  - Integrated Cockpit Operational Queue actions to deep-link to Supplier detail and Matching Workspace.
  - Server-side security enforcement: Trader 200, Buyer 403, Supplier 403, Unauthenticated 401.
  - Zero new persistence tables; pure read models.

## Sprint 06 — Quotes & Trade Lifecycle — IMPLEMENTED (CONSOLIDATED PO VALIDATION PENDING)

- **IMPLEMENTED (AWAITING PO VALIDATION) — Phase 0: Negotiation History Fix & Timeline Reconstruction:**
  - Negotiation timeline reconstructed strictly from persisted append-only AuditEvent records (`targetType = "quote"`) via minimal read abstraction `findEventsByTarget`.
  - Preserved multiple `quote.sent` events across repeated dispatches (v1 sent, v2 sent), eliminating the single-record overwrite flaw.
  - Review milestones (`submitted_internal_review`, `returned_to_draft`) surfaced from immutable audit events.
  - Eliminated false inference of `counter_revised` on normal DRAFT version bumps.
  - Strengthened invariant: Buyer ACCEPT, REJECT, and COUNTER bind strictly to `sentVersionNumber`.
  - Expiration validation checks the exact sent version's `validUntil`.

- **IMPLEMENTED (AWAITING PO VALIDATION) — Block 03: Accepted Quote → Trade / Transaction Record:**
  - Source terminology: Authoritative `Trade Record` (entity `Trade`, reference format `tradeNumber: TRD-YYYYMMDD-XXXX`).
  - Additive database migration `20260917150000_sprint06_trade_record` adding `Trade` model with unique `quoteId` and `tradeNumber`.
  - Strict Accepted Quote Gate: requires `Quote.status = ACCEPTED` and exact accepted `QuoteVersion` to exist. Unaccepted quotes blocked.
  - Idempotent 1-to-1 Quote-to-Trade creation.
  - Automatic atomic transactional creation on Buyer quote acceptance via Prisma `$transaction`.
  - Commercial Baseline: Trade preserves an immutable commercial baseline through the exact accepted QuoteVersion reference, plus key persisted Trade summary fields (tradeNumber, acceptedQuoteVersionNumber, currency, acceptedTotalAmount, counterparties, incoterm, payment terms). The 11-line breakdown is resolved directly from the immutable accepted QuoteVersion without field duplication. Exact version resolution with no versions[0] or zero-fill fallbacks. Read-only commercial baseline.
  - Quote Status Boundary: Quote remains `ACCEPTED` without contract conversion. `CONVERTED_TO_CONTRACT` explicitly not activated (reserved for Sprint 08).
  - Trader Transactions Ledger (`TraderTradesView`): accessible via Trader Portal & Cockpit, displaying executed trades, commercial snapshot modal, KPI metrics, and traceability links.
  - Buyer Visibility: Read-only "Trade Created: TRD-XXXX" badge and baseline reference in Buyer Quote view.
  - Audit: Emits append-only `trade.created` audit event.
  - Technical Verification: 26 backend test suites (213 tests) pass; 62 frontend tests pass; typecheck, lint, and build pass in backend and frontend.

- **IMPLEMENTED (AWAITING PO VALIDATION) — Quote Dispatch, Counter-Offer & Buyer Decision (Vertical Block 02):**
  - Residual frontend currency cleanup removing all `|| "EUR"` fallbacks in `quote-builder-modal.tsx` and `matching-workspace-view.tsx`. Missing currency displays neutral resolution message without fake symbols.
  - Additive migration `20260917120000_sprint06_quote_lifecycle` adding `sentAt`, `sentByUserId`, `sentVersionNumber`, `acceptedAt`, `acceptedByUserId`, `acceptedVersionNumber`, `rejectedAt`, `rejectedByUserId`, `rejectionReason`, and `QuoteCounterOffer` model. Historical migrations 00–05 unmodified.
  - Gated status lifecycle transitions: `INTERNAL_REVIEW -> SENT`, `SENT -> ACCEPTED | REJECTED | COUNTERED`, `COUNTERED -> revised DRAFT (vN+1) -> INTERNAL_REVIEW -> SENT`. Invalid direct transitions blocked.
  - Permanent immutability of SENT QuoteVersion. Counter-offers preserve original sent proposal. Revised quote creates sequential `vN+1` in `DRAFT`.
  - Dedicated Buyer Quotations inbox (`BuyerQuotesView`) scoped strictly to Buyer organisation with 11-line commercial breakdown, Accept modal, Reject modal, and Counter-Offer modal.
  - Trader Cockpit integration with real operational queue items (`quote_internal_review`, `quote_countered`, `quote_awaiting_buyer`, `quote_accepted`, `quote_rejected`).
  - Trader Buyer Management integration displaying Commercial Quotations table with direct modal opener.
  - Audit logging for `quote.sent`, `quote.countered`, `quote.accepted`, `quote.rejected`, `quote.counter.revised`.

- **IMPLEMENTED (AWAITING PO VALIDATION) — Quote Core, Commercial Breakdown & Version History (Vertical Block 01):**
  - Physical database schema update with `Quote` and `QuoteVersion` models and additive migration `20260916160000_sprint06_quotes_core`.
  - Transaction-safe, server-authoritative 11-line cost breakdown calculation and validation (`quotes.calculator.ts`), rejecting negatives, verifying positive product value, rounding to 2 decimal places in inherited quote currency.
  - Server-enforced sequential monotonic versioning (`v1`, `v2`, ...) guaranteeing full immutability of historical revisions.
  - Status lifecycle supporting `DRAFT` ↔ `INTERNAL_REVIEW`. Revisions permitted strictly in `DRAFT`.
  - Trader-only authorization boundary (`assertTraderAccess`).
  - Gated to `APPROVED` match records with duplicate quote prevention (HTTP 409 Conflict).
  - Four new audit event types with strict string sanitization (`quote.created`, `quote.version.created`, `quote.submitted_for_internal_review`, `quote.returned_to_draft`).
  - Frontend `QuoteBuilderModal` component with Impeccable design guidelines: matched context header, live dynamic 11-field summation, trade terms (incoterm, payment terms, validity, notes), version history audit trail, and status transition actions.
  - Replaced passive "Ready for Quotation" badge across `TraderCockpitView`, `MatchingWorkspaceView`, and `TraderBuyersView` with direct "Prepare Quote →" action.

### Sprint 07 — Quality Workflow (ACTIVE)

- **Block 01 — Inspection Core, Hemp Template & Inspection Tasks (IMPLEMENTED — PO VALIDATION PENDING):**
  - Canonical European Hemp Straw Quality Inspection Template v1 seeded with 14 source-supported fields: moisturePercentage (0–100%), baleDimensions (structured cm), estimatedBaleWeight (numeric kg), rettingQuality (neutral text), colour (neutral text), consistency (neutral text), contamination (neutral text), mouldIndicators (boolean), soilOrStoneContamination (boolean), storageConditions (neutral text), harvestDate (ISO date), baleIntegrity (neutral text), fibreToHurdIndication (neutral text), and visualHomogeneity (neutral text).
  - Additive migration `20260918120000_sprint07_inspection_core` introducing `InspectionTemplate`, `Inspection`, `InspectionEvidence` models and `role` attribute on `User`.
  - Quality Inspector user role (`User.role = "QUALITY_INSPECTOR"`) integrated into existing RBAC without creating an artificial organisation type.
  - Template v1 is persisted as a stable versioned definition. Future template revision workflow must create a new version rather than mutate an in-use definition.
  - Non-canonical `externalLotReference` tied to operational Trade and Listing context without premature Lot entity.
  - Deterministic status progression: `DRAFT -> ASSIGNED -> IN_PROGRESS -> COMPLETED` (`COMPLETED` strictly signifies inspection data entry completed, not quality approved).
  - Inspector Work Queue & detailed measurement capture UI with geolocation, equipment tracking, and partial progress save.
  - Trader Trade Detail and Trader Cockpit queue integration.
  - Immutable audit events: `quality.inspection.created`, `quality.inspection.assigned`, `quality.inspection.started`, `quality.measurements.updated`, `quality.inspection.completed`.
  - Full technical verification: 27 backend test suites (238 tests) pass; 68 frontend tests pass; TypeScript typecheck, ESLint, and production build pass in both backend and frontend.

- **Block 02 — Evidence Capture, Photo Upload & Non-Conformity Foundation (IMPLEMENTED — PO VALIDATION PENDING):**
  - Reusing existing storage primitives for photo evidence, supporting documents, and optional laboratory reports.
  - InspectionEvidence relation linking inspections to stored objects with strict MIME validation, metadata, and append-only audit trail.
  - Template photo instructions support for operational field guidance without fabricated domain checklists.
  - Preliminary HUMAN quality assessment (NOT_ASSESSED / ASSESSMENT_RECORDED, summary, observed issues, recommended follow-up) without final grades or automated pass/fail.
  - Non-conformity foundation (OPEN / RESOLVED) with operational categories, description, resolution tracking, and audit events.
  - Physical inspection escalation flag and operational reason tracking for Trader review.
  - Trader Trade Detail and Trader Cockpit operational queue integration.

- **Block 03 — Human Quality Result, Review & Inspection Certificate (IMPLEMENTED — PO VALIDATION PENDING):**
  - Human quality result decision model (`QualityResult`) linking decisions (`APPROVED` | `REJECTED`) and human-entered classification labels to completed Inspections. Strictly human-controlled without AI inference.
  - Gated decision flow: requires `status = COMPLETED` and `assessmentStatus = ASSESSMENT_RECORDED`. Exclusively authorized to the assigned active Quality Inspector.
  - One immutable final quality decision per inspection with database-enforced unique constraint (`inspectionId UNIQUE`).
  - Formal Certificate of Quality Inspection (`InspectionCertificate`) generated exclusively for `APPROVED` quality results with readable reference (`QIC-YYYYMMDD-XXXX`).
  - Server-side professional PDF certificate generation and storage using existing `StorageService`. Immutable snapshot of inspection reference, trade, supplier, buyer, technical measurements, attached evidence, preliminary assessment, and final quality decision.
  - Append-only audit logging: `quality.result.approved`, `quality.result.rejected`, and `quality.certificate.issued`.
  - Trader Trade Detail and Trader Cockpit operational queue integration reflecting final quality decision and certificate link without mutating commercial Trade terms.

## Future Sprints Roadmap (Locked)

- **Sprint 05 — Trader Cockpit & Manual Matching:** Supply/demand comparison, deterministic compatibility scoring, trader recommendation dashboard, landed-cost breakdown.
- **Sprint 06 — Quotes & Trade Lifecycle:** Quote preparation, fee/commission transparency, negotiation, versioning, contract generation.
- **Sprint 07 — Quality Workflow:** Inspection records, measurement capture, human-approved grades, certificates, dispute/remedy handling.
- **Sprint 08 — Logistics & Contracts:** Freight requirements, shipping quotes, carrier dispatch, tracking, contract finalization.
- **Sprint 09 — Digital Product Passport (DPP):** Provenance tracking, lot transformation events, public/private visibility boundaries, batch passport generation.
- **Sprint 10 — AI Platform Foundation:** Controlled agent tools, guardrails, context injection, human-in-the-loop escalation.
- **Sprint 11 — Supplier & Listing Agents:** Onboarding assistance agent, listing extraction and draft generation.
- **Sprint 12 — Trader Copilot & Matching Agent:** Match explanation agent, trade assistance, risk scoring explanation.
- **Sprint 13 — WhatsApp Intake:** Conversational intake channel, media ingestion, message parsing, trader hand-off.
- **Sprint 14 — Automation & Optimisation:** Workflow optimizations, analytics, reporting, performance hardening.
