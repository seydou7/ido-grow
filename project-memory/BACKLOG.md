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

## Sprint 05 — Trader Cockpit & Manual Matching — READY

Sprint 05 is in READY status (NOT ACTIVE). Implementation is held pending completion of the Client Demo Deployment milestone (DEC-006).

---

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
