# Legacy Project Overview

## Audit scope

- **Legacy path:** `/Applications/MAMP/htdocs/Lab/fiber-connect`
- **Audit mode:** Read-only code and repository inspection
- **Legacy revision observed:** `fcb7be249953058c867fce88b7e15904c7d63330` on branch `main`
- **Audit limitation:** The legacy working tree was already substantially dirty before this audit: 47 tracked files were modified and `package-lock.json` plus `src/components/add-modal.tsx` were untracked. Findings describe the files as observed, not necessarily the committed revision.
- **Runtime/visual validation:** Not performed. No dependencies were installed and no application process, build, test, database, or external integration was started.

## Observed product shape

**FACT:** The repository contains a bilingual English/French public marketing site and four demo portal experiences: Supplier, Buyer, Trader, and Administrator.

**FACT:** There are 43 TanStack file-route definitions: one authenticated layout and approximately 42 user-facing pages/screens. This comprises 8 public/authentication pages and 34 portal screens.

**FACT:** Most portal screens read centralized in-memory arrays from `src/lib/mock/data.ts`. Authentication is a client-side demo role selector. User actions commonly display success notifications without changing persistent state.

**ASSESSMENT:** This is a high-fidelity interactive prototype, not a confirmed operational trading application.

# Existing Stack

## Framework and language

- **FACT:** TypeScript 5.8 and React 19.
- **FACT:** TanStack Start with TanStack Router file-based routing and TanStack Query.
- **FACT:** Vite 8 supplies development/build commands.
- **FACT:** Nitro is included for server rendering/deployment packaging.
- **FACT:** This is not a Next.js application and does not contain NestJS.

## Styling and UI

- **FACT:** Tailwind CSS 4 with CSS custom properties in `src/styles.css`.
- **FACT:** shadcn/ui-style components configured with the New York style and Radix UI primitives.
- **FACT:** Lucide React icons, class-variance-authority, clsx, tailwind-merge, tw-animate-css, Sonner, Recharts, Framer Motion, Embla Carousel, React Day Picker, and other UI utilities.
- **FACT:** React Hook Form and Zod are dependencies, although many observed forms use local state or uncontrolled inputs instead of confirmed schema-backed submissions.
- **FACT:** Inter is loaded from Google Fonts at runtime.

## Backend approach

- **FACT:** TanStack Start provides an SSR server entry. `src/server.ts` and `src/start.ts` wrap error handling.
- **FACT:** No application API routes, server functions, backend domain services, or persistence mutations were found.
- **FACT:** No NestJS backend or controlled REST API boundary exists.
- **ASSESSMENT:** The server layer currently renders the frontend; it is not an operational business backend.

## Database, storage, and data layer

- **FACT:** No database client, ORM, SQL schema, migration, database configuration, or object-storage integration was found.
- **FACT:** Data is hard-coded in `src/lib/mock/data.ts`, with types in `src/lib/mock/types.ts`.
- **FACT:** No direct database access from UI was observed because no database access exists.
- **FACT:** Photos and site imagery are bundled frontend assets under `src/assets/`.

## Authentication and authorization

- **FACT:** Zustand with persistence stores a selected demo user in browser storage under `idg-session`.
- **FACT:** Four fixed users/roles exist in source: trader, admin, supplier, and buyer.
- **FACT:** Login accepts a selected role and does not validate the entered email or password against a backend.
- **FACT:** The authenticated layout redirects client-side when the Zustand user is absent.
- **FACT:** The application shell exposes a demo role switcher.
- **FACT:** No server-enforced authorization, organisation isolation, session cookie, MFA, password flow, or immutable audit trail was found.

## External services

- **FACT:** Lovable build/error-reporting integration is present.
- **FACT:** Google Fonts is requested externally.
- **FACT:** Administrator screens display fields for WhatsApp Business API and OpenAI, including a hard-coded model label, but no functioning service clients or requests were found. The displayed “Connected” status is not backed by a confirmed check.
- **FACT:** Contact, password reset, quote requests, approvals, profile changes, and similar actions generally resolve to local UI state or toast messages.
- **UNVERIFIED:** No deployed credentials or working external service connections can be confirmed from code.

## Package manager

- **FACT:** Tracked `bun.lock` and `bunfig.toml` indicate Bun was configured.
- **FACT:** An untracked `package-lock.json` and installed `node_modules` indicate npm has also been used locally.
- **UNVERIFIED:** `package.json` does not declare a `packageManager`; the currently authoritative package manager is therefore not confirmed.

## Deployment-related configuration

- **FACT:** `vite.config.ts` uses `@lovable.dev/vite-tanstack-config`.
- **FACT:** Nitro selects a Vercel preset when the `VERCEL` environment variable exists and otherwise defaults to a Cloudflare module preset.
- **FACT:** No repository Dockerfile, explicit infrastructure-as-code, CI workflow, environment template, or dedicated deployment manifest was found in the inspected file set.
- **UNVERIFIED:** Actual hosting and deployment state were not inspected externally.

# Existing Architecture

## Observed structure

```text
Public and role-specific React pages
            ↓
TanStack Router + shared AppShell/SiteShell
            ↓
Local React/Zustand state + static mock arrays
            ↓
No persistent business backend or database
```

## Application organization

- `src/routes/`: Public pages, authentication pages, authenticated layout, and role-specific screens.
- `src/components/app-shell.tsx`: Role-dependent portal navigation, header, demo role switcher, and page header.
- `src/components/site/site-shell.tsx`: Public site header/footer and navigation.
- `src/components/ui/`: Broad shadcn/Radix component library.
- `src/components/kpi-card.tsx`, `status-badge.tsx`, `order-timeline.tsx`, `add-modal.tsx`: Shared portal patterns.
- `src/lib/mock/`: All observed domain types and fixture data.
- `src/lib/session.ts`: Demo role/session state.
- `src/lib/i18n.ts`: Inline French/English selector persisted in browser storage.
- `src/styles.css`: Theme tokens, light/dark palettes, typography, shadows, and Tailwind setup.
- `src/assets/`: Fibre, agricultural, logistics, and portal imagery.
- `src/server.ts`, `src/start.ts`: SSR error handling only.

## Route and dashboard structure

- **Public/auth (8):** Home, About, Fibres, Network, Services, Contact, Login, Forgot Password.
- **Supplier (6):** Dashboard, Listings, Incoming Orders, Shipments, Payments, Company Profile.
- **Buyer (8):** Dashboard, Marketplace, Sourcing Requests, Quotes, Orders, Shipments, Invoices, Company Profile.
- **Trader (13):** Dashboard, Suppliers, Supplier Detail, Buyers, Listing Review, WhatsApp Parser, Sourcing Requests, Quotes, Orders, Order Detail, Logistics, Finance, Settings.
- **Administrator (7):** Analytics, Users, Product Catalog, Freight Rates, Customs Duties, Landed-Cost Calculator, Platform Settings.

## Alignment with DEC-001

- **FACT:** React, TypeScript, Tailwind, shadcn-style components, TanStack Query, responsive patterns, and internationalization concepts overlap with DEC-001.
- **FACT:** The framework is TanStack Start rather than approved Next.js.
- **FACT:** The required NestJS modular monolith, versioned REST API, and PostgreSQL system of record are absent.
- **FACT:** No forbidden direct UI-to-database connection exists, but only because no persistent database layer exists.
- **RECOMMENDATION:** Treat this repository as UX/product discovery evidence. Do not treat its application architecture as the target architecture or assume code migration.

# Existing Screens and Workflows

## Supplier

- **FACT:** Dashboard summarizes fixture listings, orders, and payments and provides a new-listing modal.
- **FACT:** Listings can be searched and filtered; creation fields exist, but saving does not persist a listing.
- **FACT:** Incoming orders, shipment progress, payment rows, and company-profile fields are displayed from fixtures.
- **FACT:** Profile submission and WhatsApp contact actions are visual/demo behaviors.
- **GAP:** No guided mobile-first intake, photo/document upload, onboarding verification, listing completeness workflow, messaging center, offer decision workflow, or real status persistence.

## Buyer

- **FACT:** Dashboard summarizes fixture requests, orders, and quotes and exposes a sourcing-request modal.
- **FACT:** Marketplace displays approved fixture listings with text and fibre filters and a toast-only quote request action.
- **FACT:** Sourcing requests, quotes, orders, shipment tracking, invoices, and company profile have dedicated screens.
- **FACT:** Quote accept/reject controls do not persist changes.
- **GAP:** No full documented marketplace filters/comparison, buy-order requirements model, recurring/private requests, DPP library, contracts, documents center, negotiation/version history, or explainable matching.

## Trader and Administrator

- **FACT:** Trader dashboard shows fixture KPIs, recent activity, pending listing review, and operational summaries.
- **FACT:** Supplier/buyer directories and supplier/order detail pages exist.
- **FACT:** Listing review offers request/reject/approve buttons, but these only display notifications.
- **FACT:** Sourcing, quote, order, logistics, and finance overview screens exist.
- **FACT:** Administrator screens cover analytics, users, catalogue, freight rates, customs duties, a landed-cost calculator, and platform settings.
- **FACT:** The landed-cost calculator uses local calculations and a hard-coded mock freight rate.
- **GAP:** There is no durable approval queue, permission enforcement, audit history, contract workflow, configured domain model, deterministic matching service, or operational administration.

## Marketplace, listings, requests, matching, and quotes

- **FACT:** Listing, sourcing request, quote, order, payment, freight-rate, and customs-duty fixture types exist.
- **FACT:** Marketplace availability is inferred from an “Approved” listing status.
- **FACT:** Trader copy says approved listings enter matching, but no matching engine, match entity, match screen, score, candidate set, or explanation implementation was found.
- **FACT:** Quotes contain a single cost snapshot with product, freight, insurance, duties, handling, trading margin, logistics margin, total landed cost, lead time, and CO₂.
- **GAP:** Quote versions, negotiation/counteroffers, reservations, multi-lot matching, transparent sourced cost items, validity, currencies, and deterministic calculation provenance are absent.

## Quality

- **FACT:** Listings include one generic grade, humidity, certifications, and category fields.
- **FACT:** An order-detail fixture timeline mentions a completed quality inspection, and logistics shows a quality-inspection action.
- **UNVERIFIED:** These labels do not confirm an inspection workflow.
- **GAP:** No Quality Inspector role or UX, inspection templates, structured measurements, evidence, non-conformities, laboratory results, human approval record, or quality certificate workflow was found.

## Logistics

- **FACT:** Orders carry origin, destination, carrier, tracking, ETA, and a linear status.
- **FACT:** Supplier, buyer, and trader shipment views reuse these order fixtures; admin freight and customs fixture tables exist.
- **GAP:** No shipment entity separate from order, shipment legs, freight quote comparison, carrier selection workflow, document upload, exceptions/claims, delivery evidence, or reconciled actual costs.

## Payments and finance

- **FACT:** Fixture payment rows represent buyer-to-I Do Grow and I Do Grow-to-supplier flows. Buyer invoices, supplier payments, and trader finance screens display summaries.
- **FACT:** No payment provider or actual payment execution was found.
- **GAP:** Structured invoices, schedules, deposits, balances, credit notes, claims, settlement records, currency provenance, and administrative payment controls are absent.

## DPP and traceability

- **FACT:** Public and dashboard copy refers to traceability and ESG.
- **UNVERIFIED:** No DPP entity, DPP page, provenance record, event model, lot transformation, chain of custody, or downloadable passport implementation was found.
- **GAP:** The MVP basic DPP must be created new.

## Messaging and AI

- **FACT:** A trader WhatsApp parser screen accepts pasted text and uses local regular expressions plus a timeout to extract a few fields.
- **FACT:** Saving the parsed listing only displays a toast and clears the form.
- **FACT:** Mock WhatsApp history exists; no actual WhatsApp conversation or webhook integration exists.
- **FACT:** An administrator screen displays placeholder WhatsApp and OpenAI configuration fields.
- **UNVERIFIED:** No real AI model call, agent orchestration, controlled tools, confidence/evidence, approval queue, or audit trail was found.

# Feature Gap Analysis

## Areas conceptually represented

- Role-specific Supplier, Buyer, Trader, and Administrator portals.
- Natural-fibre marketplace and listing review.
- Sourcing requests, quotes, orders, shipment tracking, and financial summaries.
- Landed-cost concept and basic freight/customs reference screens.
- Bilingual navigation/content and responsive UI patterns.
- Public business narrative and natural-fibre imagery.

## Major gaps versus project memory and client requirements

1. **Operational backend:** No NestJS domain backend, REST API, PostgreSQL, object storage, or persistent transactions.
2. **Security and tenancy:** Demo-only authentication; no server authorization, organisation membership, permissions, tenant isolation, MFA, or audit controls.
3. **Shared transactional model:** Fixtures are simplified and do not implement the conceptual entities/relationships in `DATA_MODEL.md`.
4. **Supplier intake:** No complete onboarding, verification, mobile guided flow, uploads, voice, low-bandwidth support, or real WhatsApp intake.
5. **Matching:** No buy-order-to-listing matching, landed-cost provenance, scoring, multi-supplier combination, explanation, or human approval record.
6. **Quality:** No inspector experience or structured inspection/measurement/evidence workflow.
7. **Trading and contracts:** No quote versioning, negotiation, structured trade, contract generation, signatures, or contract documents.
8. **Logistics:** No freight quotation lifecycle, carrier selection, shipment records/legs, documents, exceptions, or reconciliation.
9. **Settlement:** No structured administrative settlement lifecycle.
10. **DPP:** No lot-linked passport, event model, provenance, or downloadable page.
11. **Controlled AI:** No controlled backend tools, approvals, traceability, safety model, or auditable agent execution.
12. **Required user experiences:** Quality Inspector is absent; documented Supplier/Buyer navigation differs; DPP, Contracts, Documents, Matches, Offers, and Messages experiences are absent or incomplete.

# Reusable Assets

## Facts observed

- Theme tokens for emerald, gold, semantic states, charts, sidebar, shadows, radii, and dark mode.
- Inter typography configuration.
- A broad shadcn/Radix component set and common portal patterns: shell, sidebar, cards, status badges, timeline, tables, filters, dialogs, charts, language switcher, loading/error/404 states.
- Lucide icon usage.
- Six natural-fibre images plus agricultural, warehouse, port, logistics, and portal imagery.
- English/French marketing copy for vision, services, fibres, network, and contact pages.
- Fixture product vocabulary and example records for suppliers, buyers, listings, requests, quotes, orders, payments, freight, and customs.

## Recommendations

- **Visual review required:** Evaluate brand palette, imagery, typography, public copy, portal density, mobile behavior, and accessibility before approving reuse.
- **Rights/provenance review required:** Confirm ownership/licensing of every image and all marketing copy before reuse.
- **Domain review required:** Treat fixture product data, grades, prices, companies, certifications, commercial percentages, claims, and statistics as mock content, not authoritative business data.
- **Migration remains undecided:** Component patterns may inform the new Next.js/shadcn implementation, but this audit does not approve copying or migrating legacy source code.

# Technical Debt and Risks

## Confirmed risks

- **Mock architecture:** Central business records are static frontend fixtures; UI success messages often imply changes that never occur.
- **Insecure authentication:** Fixed identities, role selection, browser-persisted session state, demo credentials, client-only redirects, and no server authorization.
- **Missing role boundaries:** Navigation changes by selected role, but a user can switch roles locally and no backend permission boundary exists.
- **Hard-coded commercial data:** Freight, margins, service fees, model name, contact promises, demo credentials, historical events, prices, statuses, and other commercial values appear directly in source.
- **Tight UI/data coupling:** Route components import fixture arrays and perform filtering/calculations directly.
- **Duplicated presentation logic:** Similar table/filter/form helpers and role-specific order/shipment/payment views recur across route files.
- **Misleading integration state:** WhatsApp/OpenAI settings and “Connected” UI are not backed by confirmed integrations.
- **Simplified domain model:** Listing is used as lot/inventory; order also carries shipment state; grade/certifications are coarse; quote is a single snapshot.
- **No persistence or auditability:** Actions cannot produce durable, attributable, versioned, or auditable state.
- **No automated verification:** No test files or test script were found; lint exists, but no build/lint/test command was executed during this read-only audit.
- **Package-manager ambiguity:** Bun is tracked while an npm lockfile exists untracked.
- **Deployment coupling:** Build configuration depends on a Lovable-specific package and defaults to Cloudflare unless Vercel is detected.
- **Working-tree uncertainty:** The legacy repository was already heavily modified, so committed and current behavior may differ materially.

## Risks not confirmed

- **Dead/unused code:** The large UI library likely includes components not used by current screens, but this was not confirmed through a build or static dependency analysis.
- **Runtime defects and responsive/accessibility failures:** UNVERIFIED because the application was not run or visually inspected.
- **Dependency vulnerabilities:** UNVERIFIED; no network audit or package command was run.
- **Production exposure of secrets:** No actual secrets were observed in the inspected code, but runtime/deployment environments were not audited.

# KEEP / IMPROVE / REDESIGN / REMOVE / CREATE_NEW Matrix

These classifications are discovery recommendations, not migration decisions.

| Area or screen | Classification | Observed fact | Recommendation basis |
|---|---|---|---|
| Natural-fibre imagery and visual theme | KEEP | Cohesive fibre/logistics imagery and token palette exist. | Keep only after human brand, accessibility, rights, and provenance review. |
| shadcn/Radix UI patterns | IMPROVE | Broad, consistent component primitives exist. | Recreate/adapt patterns within DEC-001; do not assume source-code migration. |
| Public Home/About/Fibres/Network/Services | REDESIGN | Rich bilingual marketing pages exist. | Validate copy and align with charter/MVP; separate current facts from aspirational claims. |
| Contact page | REDESIGN | Form is visual and toast-only. | Retain the contact concept but implement real handling, consent, validation, and routing later. |
| Login/Forgot Password | REDESIGN | Demo role login and simulated reset exist. | Replace with provider/backend-controlled authentication once the TBD provider is decided. |
| Portal shell and role navigation | REDESIGN | Four role-based sidebars exist. | Align with `UX_MAP.md`, responsive/mobile needs, and server-enforced permissions. |
| Supplier dashboard/profile | REDESIGN | Fixture summaries and editable-looking forms exist. | Add onboarding, verification, completeness, real persistence, and client-required navigation. |
| Supplier listings | REDESIGN | List/filter/create-modal concept exists. | Replace simplified listing fields with guided mobile intake, lots, uploads, structured quality, and status workflow. |
| Supplier orders/shipments/payments | REDESIGN | Read-only fixture views exist. | Separate trade, shipment, and settlement concepts and add real actions/status provenance. |
| Buyer dashboard/profile | REDESIGN | Fixture overview and profile form exist. | Align navigation and organisation onboarding with client requirements. |
| Buyer marketplace | REDESIGN | Approved fixture listings can be searched by text/fibre. | Add required filters, detail/comparison, landed cost, documents, availability, and real RFQ behavior. |
| Buyer sourcing requests/buy orders | REDESIGN | Simplified sourcing request screens exist. | Model complete buy-order requirements and recurring/private request variants. |
| Buyer quotes/orders/shipments/invoices | REDESIGN | Fixture views and toast accept/reject actions exist. | Add versioning, negotiation, contract linkage, shipment model, settlement status, and audit controls. |
| Trader dashboard | REDESIGN | Useful operational cockpit concept exists. | Align exact widgets/actions with `UX_MAP.md` and connect to real approval queues. |
| Supplier/buyer directories | IMPROVE | Searchable directories and supplier detail exist. | Concept fits trader relationship management; add organisations, verification, permissions, and authoritative data. |
| Listing-review screen | REDESIGN | Approve/reject/request controls are toast-only. | Keep workflow intent; implement controlled state transitions, reasons, permissions, and audit records. |
| Sourcing and quote screens | REDESIGN | Tables and creation modals exist. | Implement real buy orders, matching inputs, quote versions, negotiation, and cost provenance. |
| Order detail/timeline | REDESIGN | Aggregated commercial, shipment, document, and history presentation exists. | Split conceptual entities while retaining a unified transaction overview pattern. |
| Trader logistics and finance | REDESIGN | Operational summaries use fixture orders/payments. | Implement freight quote/shipment and administrative settlement lifecycles. |
| Admin analytics | IMPROVE | Charts and KPIs provide a useful dashboard pattern. | Retain presentation concepts only after metrics definitions and real data exist. |
| Admin users | REDESIGN | Combined fixture supplier/buyer user list exists. | Implement users, organisations, memberships, roles, permissions, verification, and controls. |
| Admin catalogue | REDESIGN | Fibre and generic grade configuration UI exists. | Replace with client taxonomy, product forms, structured quality attributes, units, validations, and auditability. |
| Freight/customs reference screens | REDESIGN | Fixture rate/duty tables exist. | Preserve reference-data concept; add sources, currencies, validity, ownership, and controlled updates. |
| Landed-cost calculator | REDESIGN | Local calculator uses a mock freight rate and simplified components. | Implement the source-defined deterministic breakdown with source, status, tax, currency, and validity metadata. |
| Platform integration settings | REMOVE | Hard-coded WhatsApp/OpenAI vendor-specific placeholders imply configured services. | Remove from target scope until provider decisions are approved; recreate controlled settings later if required. |
| WhatsApp regex parser | REDESIGN | Pasted text is parsed locally by regex; no messaging or persistence. | Retain intake concept, but redesign for real conversation, provenance, validation, handover, approval, and controlled backend tools. |
| Matching engine and match review | CREATE_NEW | No implemented match model or engine was found. | Required by MVP and project data model. |
| Quality Inspector and inspection workflow | CREATE_NEW | No inspector role/screen or structured inspection exists. | Required by client UX and MVP. |
| Contracts and documents center | CREATE_NEW | No contract entity/workflow or buyer documents area exists. | Required by end-to-end transaction lifecycle. |
| DPP library/passport/event model | CREATE_NEW | Traceability appears only in copy; no DPP implementation exists. | Required by MVP and conceptual data model. |
| Controlled AI agent platform | CREATE_NEW | No tool allowlists, approval queue, evidence, or audit execution exists. | Required for the client’s human-controlled AI model. |
| Backend/API/PostgreSQL/object storage | CREATE_NEW | No operational business backend or persistence exists. | Required by DEC-001 and the transaction lifecycle; implementation is outside this audit. |
| Compliance Manager and Logistics Partner experiences | CREATE_NEW | No dedicated roles or permissioned workflows exist. | Scope/timing must follow MVP needs and later clarification. |

# Questions Requiring Visual or Human Review

1. Does the emerald/gold identity represent the intended I Do Grow brand, and are logo/icon treatments approved?
2. Are all bundled images owned or licensed for reuse, and do they accurately represent the named fibres and geographies?
3. Which public-site claims, statistics, service promises, pricing/commissions, financing claims, ESG statements, and partner references are approved client copy?
4. Which portal information architecture should inform future wireframes, given differences from `UX_MAP.md`?
5. Are dense desktop tables usable on mobile, especially for supplier workflows?
6. Do contrast, keyboard navigation, focus behavior, screen-reader labels, charts, and status colors meet the required accessibility standard? The standard itself remains unspecified.
7. Which dashboard KPIs are operationally meaningful and how are they defined?
8. Do traders want the existing combined transaction/order detail presentation, even if the underlying entities are separated?
9. Are the example fibre taxonomy, grades, certifications, companies, prices, freight rates, duties, margins, and histories entirely fictional or partially authoritative?
10. Should the public marketing site be part of the MVP application delivery, or audited as a separate workstream?
11. Which portions of the current dirty working tree represent the intended latest prototype versus unfinished experiments?

# Recommended Next Audit Steps

1. Conduct a human-led visual walkthrough of all four portal roles and public pages without changing the legacy repository.
2. Record screenshots and responsive observations for desktop, tablet, and mobile in a separate audit artifact.
3. Validate brand/image rights, client-approved copy, business claims, mock-company data, and commercial figures.
4. Map each current screen to the exact `UX_MAP.md` requirement and identify navigation decisions requiring approval.
5. Workshop the first real transaction with a trader/domain expert and identify the minimum screens/data needed for that scenario.
6. Validate the hemp taxonomy and structured quality/inspection fields with the domain and quality experts.
7. Define authentication, organisation, membership, and role/permission requirements before implementation.
8. Define acceptance criteria for matching, landed cost, quotes, contracts, shipments, settlement records, and basic DPP.
9. Decide whether any visual assets or interaction patterns should be recreated in the new architecture; do not decide source-code migration from this report alone.
10. Preserve the legacy repository in read-only mode and separately establish which dirty-tree changes are authoritative before any later comparison against its committed baseline.
