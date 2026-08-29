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

## Sprint 02 — Organisations & Supplier Onboarding — READY

Sprint 02 activates the capability backlog for Organisation lifecycle, verification, and Supplier onboarding on top of the established platform foundation.

Guardrails: build only from approved foundations; keep behavior marked **OPEN** blocked until approved; preserve all legal/privacy, authority, and verification gates.

### Sprint 02 Scope: Organisations & Supplier Onboarding
- **Supplier Organisation Profile & Lifecycle:** Organisation types (Supplier, Buyer, Trader, Partner), company identity (commercial name, registration/tax IDs, legal address), contact points.
- **Supplier Farm & Site Registration:** Multiple production sites, physical addresses, GPS coordinates, land area/capacity, facilities.
- **Supplier Verification & Compliance Onboarding:** Verification statuses (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`), compliance document uploads (certifications, organic licenses, company registry), document review workflow.
- **Organisation Membership & Invitation Management:** Multi-user organisation access, roles within organisation (`ADMIN`, `OPERATOR`, `MEMBER`), invitations and user association.
- **Supplier Onboarding Flow (Self-Serve & Trader-Assisted):** Guided step-by-step onboarding experience, completeness scoring, trader review and activation interface.

---

## Future Sprints Roadmap (Locked)

- **Sprint 03 — Product Catalogue & Listings:** Reusable hemp taxonomy, mobile-first listing creation, photos, lot linking, listing lifecycle (`DRAFT`, `PUBLISHED`, `RESERVED`, `SOLD`).
- **Sprint 04 — Buyer Marketplace & Buy Orders:** Marketplace search, filters, listing detail/comparison, buy orders, request for quotation.
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
