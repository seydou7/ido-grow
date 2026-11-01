# I Do Grow — Shared Project Context Baseline

## 1. Project Identity & Purpose
- **Platform:** I Do Grow — B2B digital marketplace and trade execution platform for European natural fibres (industrial hemp, flax/linen, jute, sisal, coir, abaca, kenaf, ramie).
- **Core Value Proposition:** Bringing liquidity, transparency, digital traceability (DPP), and verified provenance to natural fibre commodities connecting European agricultural producers/suppliers, commercial commodity traders, and industrial buyers.

## 2. Authoritative Source Hierarchy
Always enforce this strict 5-level precedence:
1. **Primary Client Documents** (`docs/client/` — Specifications, RFP, Functional notes)
2. **Explicit Later Client Clarifications** (Documented formal Q&A answers)
3. **Approved Project Decisions** (`project-memory/DECISION_LOG.md` — DEC-001 through DEC-005)
4. **Internal Planning & Project Memory** (`project-memory/` — Architecture, Data Model, Backlog, UX Map)
5. **Specialist & Agent Recommendations** (Advisory proposals — NEVER promote to requirements without approval)

*Rule:* Never invent commodity-trading rules, quality thresholds, pass/fail standards, certification requirements, or business authority. Label all unresolved ambiguities as **OPEN** and unbacked proposals as **UNSUPPORTED**.

## 3. Locked Sprint Roadmap
- **Sprint 00:** Discovery & Foundation (CLOSED)
- **Sprint 01:** Platform Foundation (CLOSED)
- **Sprint 02:** Organisations & Supplier Onboarding (CLOSED)
- **Sprint 03:** Product Catalogue & Listings (ACTIVE)
- **Sprint 04:** Buyer Marketplace & Buy Orders
- **Sprint 05:** Trader Cockpit & Manual Matching
- **Sprint 06:** Quotes & Trade Lifecycle
- **Sprint 07:** Quality Workflow (Inspections, Structured Measurements)
- **Sprint 08:** Logistics & Contracts
- **Sprint 09:** Digital Product Passport (DPP)
- **Sprint 10:** AI Platform Foundation
- **Sprint 11:** Supplier & Listing Agents
- **Sprint 12:** Trader Copilot & Matching Agent
- **Sprint 13:** WhatsApp Intake
- **Sprint 14:** Automation & Optimisation

## 4. Technical Architecture Baseline (DEC-001, DEC-004, DEC-005)
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form. Reuses approved legacy I Do Grow visual identity.
- **Backend:** NestJS modular monolith, versioned REST API (`/api/v1/`), server-side tenant-isolated authorization, append-only immutable audit logging (`AuditEvent`).
- **Database:** PostgreSQL 16 running on port `55432` (`ido-grow-postgres-16`), accessed exclusively via Prisma ORM (`backend/prisma/schema.prisma`).
- **Authentication:** Application-managed session cookies (`ido_grow_session`). `GET /api/v1/auth/session` returns HTTP 200 with `{ status: "unauthenticated", user: null }` for unauthenticated probes. Protected business endpoints strictly enforce HTTP 401 (unauthenticated) and HTTP 403 (unauthorized/cross-tenant).
- **Internationalization:** Custom typed i18n runtime (`EN` default/fallback, `NL`, `FR`) with SameSite cookie persistence.
- **Hosting/Infrastructure:** OVHcloud preferred under DEC-002 (deployment topology and pipelines remain deferred/TBD).

## 5. Critical Engineering & Delivery Governance Rules
- **Database Safety:** Isolated PostgreSQL 16 on `127.0.0.1:55432` only. Never drop tables, truncate, or wipe data without explicit authorization. Additive migrations only.
- **Human Validation Gate:** Any visible UI or workflow change requires Project Owner real-browser validation PASS before feature commit.
- **No Self-Approval:** Builders must not self-approve acceptance criteria or Definition of Done. Independent QA verification is mandatory.
- **Project Agents vs Platform Agents:** Project Agents are development personas/specialists guiding project delivery. Platform Agents are future in-product AI capabilities (Sprints 10+) acting strictly under backend permissions with auditable actions and human approval.
