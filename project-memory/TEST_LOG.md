# Test Log

## 2026-09-18 — Sprint 07 Real Quality Audit Event Contract Verification & Correction
- **Database AuditEvent Constraints & Migration:**
  - Inspected PostgreSQL constraints: identified `AuditEvent_event_type_check` and `AuditEvent_shape_check` which restricted events to historical pre-Sprint 07 sets.
  - Created additive migration `20260918180000_sprint07_quality_audit_events`:
    - Safely updated `AuditEvent_event_type_check` and `AuditEvent_shape_check` to include all 13 real Quality audit events emitted by application code.
    - Preserved 100% of previously valid event types; historical migrations unmodified.
    - Successfully deployed with `npx prisma migrate deploy`; `npx prisma migrate status` reports all 17 migrations applied, database schema up to date with 0 drift and 0 DB reset.
- **Real Quality Audit Smoke Test:**
  - Directly tested and confirmed PostgreSQL persistence for all 13 real Quality audit event types:
    - `quality.inspection.created`
    - `quality.inspection.assigned`
    - `quality.inspection.started`
    - `quality.measurements.updated`
    - `quality.inspection.completed`
    - `quality.evidence.uploaded`
    - `quality.assessment.recorded`
    - `quality.non_conformity.created`
    - `quality.non_conformity.resolved`
    - `quality.physical_inspection.requested`
    - `quality.result.approved`
    - `quality.result.rejected`
    - `quality.certificate.issued`
- **Real-Event Atomicity Retest:**
  - Tested real transactional atomicity using actual domain event types (NOT `organisation.profile.updated`):
    - Evidence: `InspectionEvidence` + `quality.evidence.uploaded` (rollback on failure verified; atomic commit on success verified).
    - APPROVED: `QualityResult` + `InspectionCertificate` + `quality.result.approved` + `quality.certificate.issued` committed atomically.
    - REJECTED: `QualityResult` + `quality.result.rejected` committed atomically with zero certificate created.
    - Invariant check: zero approved quality results without certificates.
- **Decision Log:**
  - DEC-008 removed from `DECISION_LOG.md`. No replacement decision added.
- **Full QA Execution:**
  - Backend quality/audit tests: 4 test suites, 61 tests passed.
  - Backend full test suite: 29 test suites, 275 tests passed.
  - Frontend test suite: 78 tests passed.
  - Typecheck: Backend 0 errors, Frontend 0 errors.
  - Lint: Backend 0 errors / 0 warnings; Frontend 0 errors / 29 warnings (retained pre-existing React Hook warnings, 0 newly introduced).
  - Build: Backend `nest build` passed; Frontend `next build --webpack` passed.
  - Diff: `git diff --check` passed with 0 errors.

## 2026-09-18 — Sprint 07 Final Technical Consolidation & Schema Deployment
- **Database & Container:**
  - Docker Desktop: Active and verified (`docker info` / `docker version`).
  - Container: `ido-grow-postgres-16` running and healthy on `127.0.0.1:55432`.
  - Migrations: All 16 migrations applied (`npx prisma migrate deploy`); `npx prisma migrate status` reports Database schema is up to date with 0 historical drift and 0 DB reset.
  - Real Schema Smoke Test: Verified Prisma access to `InspectionTemplate`, `Inspection`, `InspectionEvidence`, `NonConformity`, `QualityResult`, `InspectionCertificate`.
  - Real Schema Atomicity Regression: Tested transaction atomicity for Evidence (rollback on failure, commit on success), APPROVED decision (QualityResult + Certificate + 2 audits atomic), REJECTED decision (QualityResult + audit atomic), concurrent duplicate decision blocked (P2002), and no approved result without certificate.
- **Backend Test Suite:**
  - 29 test suites passed, 275 tests passed (100% pass rate).
  - `quality.service.spec.ts` (49 tests): Added tests for 8-char hex certificate reference format (`^QIC-\d{8}-[A-F0-9]{8}), collision retry loop with orphan PDF compensation, and non-retry on immutable decision.
  - `prisma-quality.repository.spec.ts` (2 tests): Verified P2002 error differentiation between `certificateNumber` collision (`ConflictException`, 409) and `inspectionId` duplicate (`BadRequestException`, 400).
  - `certificate-generator.spec.ts` (6 tests): Verified deterministic line wrapping (`wrapLine`, `formatField`), safe PDF character escaping, rendering of all 14 Hemp standard measurements without slicing, and multi-page PDF generation validated via Python `pypdf.PdfReader(..., strict=True)`.
- **Frontend Test Suite:**
  - 78 tests passed, 0 failed (100% pass rate).
- **Typecheck:**
  - Backend: `tsc --noEmit` passed with 0 errors.
  - Frontend: `tsc --noEmit` passed with 0 errors.
- **Lint:**
  - Backend: `eslint "{src,test}/**/*.ts"` passed with 0 errors, 0 warnings.
  - Frontend: `npm run lint` passed with 0 errors, 29 warnings (retained pre-existing React Hook exhaustive-deps / setState-in-effect warnings, 0 newly introduced).
- **Build:**
  - Backend: `nest build` passed with 0 errors.
  - Frontend: `next build --webpack` passed with 0 errors.
- **Git Diff Check:**
  - `git diff --check` returned 0 whitespace/conflict marker errors.

## 2026-09-18 — Sprint 07 Final Technical Consolidation Test Run
- Backend test suite: 27 test suites passed, 265 tests passed (100% pass rate).
  - quality.service.spec.ts: 47 tests covering complete atomicity:
    - Evidence atomicity: DB failure storage compensation, audit append failure DB rollback + file deletion, cleanup error non-masking, full success (1 file, 1 evidence, 1 audit).
    - Quality decision & certificate atomicity: status gates, role gates, immutability, race condition / concurrency protection, storage failure prevention, DB/audit transaction failure rollback + PDF deletion, certificate audit failure rollback + PDF deletion, full APPROVED atomic issuance (1 QR, 1 cert, 2 audits, 1 stored PDF), full REJECTED atomic decision (1 QR, 1 audit, 0 cert), rejection audit failure rollback.
- Frontend test suite: 78 tests passed (100% pass rate).
- Typecheck & Lint:
  - Backend: `nest build` passed with 0 errors; `tsc --noEmit` passed with 0 errors; `eslint` passed with 0 errors / 0 warnings.
  - Frontend: `next build` passed with 0 errors; `tsc --noEmit` passed with 0 errors; `eslint` passed with 0 errors (29 warnings).
- PDF Validation:
  - Dynamically calculated xref object offsets and startxref byte pointers.
  - Strictly parsed and validated with Python `pypdf.PdfReader(..., strict=True)`: 1 page, text extraction verified for certificate reference, inspection reference, and APPROVED, with 0 xref table errors.
- Migration status:
  - Local Docker daemon timed out (engine socket unresponsive); local PostgreSQL container `ido-grow-postgres-16` cannot be started without manual Docker Desktop start by Project Owner.

## 2026-09-18 — Sprint 07 Block 03 Test Run
- Backend test suite: 27 test suites passed, 257 tests passed (100% pass rate).
  - quality.service.spec.ts: 39 tests covering Phase 0 hardening (size limits, MIME agreement, date validation, storage compensation, NC idempotency) and Block 03 features (decision gates, human classification, immutable decision, certificate PDF generation, audit events).
- Frontend test suite: 78 tests passed (100% pass rate).
  - test/quality.test.mjs: Tests covering decision status prerequisites, decision validation, certificate generation rules, upload limit contract, and NC idempotency.
- Typecheck & Lint:
  - Backend: nest build passed with 0 errors; eslint passed with 0 errors / 0 warnings.
  - Frontend: next build passed with 0 errors; eslint passed with 0 errors / 0 warnings.
- Migration status: Migration 20260918160000_sprint07_block03_quality_result_certificate added additively. Historical migrations (00-06) unmodified. Local Docker daemon status reported.


## 2026-09-18 — Sprint 07 Phase 0 & Block 02 Test Run
- Backend test suite: 27 test suites passed, 244 tests passed (100% pass rate).
  - quality.service.spec.ts: 26 tests covering Phase 0 security checks (Trader access, assigned inspector access, counterparty 403 denial, deactivated/revoked inspector mutation denial, lifecycle reassignment guards) and Block 02 features (evidence upload, storage key mapping, MIME validation, preliminary human assessment, non-conformity creation/resolution, physical inspection escalation, audit events).
- Frontend test suite: 73 tests passed (100% pass rate).
  - test/quality.test.mjs: Tests covering Quality Inspector dedicated navigation, evidence upload validation, preliminary assessment states, non-conformity lifecycle, and physical inspection escalation.
- Typecheck & Lint:
  - Backend: nest build passed with 0 errors; eslint passed with 0 errors / 0 warnings.
  - Frontend: next build passed with 0 errors; eslint passed with 0 errors / 0 warnings.
- Migration status: Database offline locally; migration 20260918140000_sprint07_block02_evidence_nonconformity verified as strictly additive. Historical migrations (00-06) unmodified.


## Sprint 07 — Block 01 (Inspection Core, Hemp Template & Inspection Tasks)

### 1. Automated Verification Runs (2026-09-17)

- **TypeScript Typecheck (Backend & Frontend):** PASS
  - `npm --prefix backend run typecheck` -> 0 errors
  - `npm --prefix frontend run typecheck` -> 0 errors
- **Backend Lint & Frontend Lint (ESLint):** PASS
  - Backend: 0 errors
  - Frontend: 0 errors
- **Backend Test Suite (Jest, 27 suites, 238 tests):** PASS
  - `src/quality/quality.service.spec.ts` (20 tests: canonical template initialization, template version immutability, Trader-only task creation, valid template version verification, status lifecycle progression, Quality Inspector RBAC authorization, tenant/role isolation, 14 source-supported hemp field validation, moisture range technical percentage check 0–100, partial measurement save, full completeness validation prior to COMPLETED, non-canonical externalLotReference handling, audit event emission for all 5 events, 401/403/404 error branches)
  - `src/trades/trades.service.spec.ts` (10 tests: inspection integration into Trade record)
  - `src/quotes/quotes.service.spec.ts` (36 tests: atomic acceptance and trade record)
  - `src/matching/matching.service.spec.ts` & `trader-cockpit.spec.ts` (operational queue with quality inspection task)
  - All foundation suites (auth, listings, buy-orders, marketplace, audit, storage)
- **Frontend Test Suite (Node test runner, 68 tests):** PASS
  - `test/quality.test.mjs` (6 tests: 4 deterministic status configurations, 6 client-manual verification methods, 14 source-supported template fields, moisture percentage 0–100 validation, required fields completeness check before completion, non-canonical externalLotReference and Trade link context)
  - `test/quotes.test.mjs` (12 tests)
  - All matching, buy orders, listings, organisations, and auth test suites
- **Production Builds:** PASS
  - Backend: `nest build` -> 0 errors
  - Frontend: `next build --webpack` -> compiled successfully (Dynamic server-rendered on demand, 0 errors)


## Sprint 06 — Phase 0 & Block 03 (Negotiation History Fix & Accepted Quote → Trade / Transaction Record)

### 1. Automated Verification Runs (2026-09-17)

- **TypeScript Typecheck (Backend & Frontend):** PASS
  - `npm --prefix backend run typecheck` -> 0 errors
  - `npm --prefix frontend run typecheck` -> 0 errors
- **Backend Lint & Frontend Lint (ESLint):** PASS
  - Backend: 0 errors
  - Frontend: 0 errors
- **Backend Test Suite (Jest, 26 suites, 213 tests):** PASS
  - `src/trades/trades.service.spec.ts` (10 tests: exact accepted version resolution, explicit error when version absent with NO versions[0] fallback and NO zero-filled breakdown, Trader/Buyer access, tenant isolation, accepted quote snapshot, 401/403/404 handling)
  - `src/quotes/quotes.service.spec.ts` (36 tests: atomic acceptance, rollback on audit failure, rollback on trade creation failure, concurrent/duplicate idempotence, Phase 0 timeline from audit events, multiple sent events preserved, no false counter-revisions, binding sentVersionNumber, checking expiration on sent version, atomic Trade creation on acceptance)
  - `src/quotes/buyer-quotes.controller.spec.ts` (Buyer acceptance and trade creation)
  - `src/quotes/quotes.controller.spec.ts` (Trader quote endpoints)
  - `src/matching/matching.service.spec.ts` & `trader-cockpit.spec.ts` (Cockpit operational queue with trade integration)
  - All foundation suites (auth, listings, buy-orders, marketplace, audit, storage)
- **Frontend Test Suite (Node test runner, 62 tests):** PASS
  - `test/quotes.test.mjs`:
    - Phase 0: Negotiation timeline preserves multiple sent events from audit trail
    - Phase 0: Normal DRAFT v2 revision is NOT falsely labeled counter_revised
    - Phase 0: Buyer accept and counter bind explicitly to sentVersionNumber
    - Phase 0: Expiration gate checks the validity of the SENT QuoteVersion
    - Block 03: ACCEPTED Quote produces authoritative Trade Record baseline
    - Block 03: Trade Record commercial snapshot preserves 11-line breakdown and terms without contract transition
    - All Block 01 & Block 02 regression tests
  - All matching, buy orders, listings, organisations, and auth test suites
- **Production Builds:** PASS
  - Backend: `nest build` completed with 0 errors
  - Frontend: `next build --webpack` completed successfully in 1.7s
- **Database Schema & Migrations:** PASS
  - Prisma client generated successfully with `Trade` model
  - Additive migration `20260917150000_sprint06_trade_record` created with unique `tradeNumber` and unique `quoteId`
  - Historical Sprint 00–05 migrations strictly unmodified
- **Git Diff Hygiene:** PASS
  - `git diff --check` passed with 0 errors

### 2. Manual Testing Checklist (For Consolidated Project Owner Validation)

1. **Phase 0 — Negotiation Timeline Verification:**
   - Sign in as Trader, open an approved match, create quote v1, submit for review, send to Buyer.
   - Sign in as Buyer, counter quote v1.
   - Sign in as Trader, create revision v2, submit for review, send to Buyer.
   - Open Quote Detail -> **Negotiation Timeline** tab.
   - Verify timeline contains BOTH `Quote v1 Sent to Buyer` AND `Quote v2 Sent to Buyer`.
   - Verify intermediate internal review and return-to-draft milestones appear chronologically.
   - Verify normal draft revisions are NOT labeled "counter revised".
2. **Block 03 — Acceptance & Trade Record Generation:**
   - Sign in as Buyer, accept the dispatched quotation.
   - Verify Quote status becomes **ACCEPTED**.
   - Verify Buyer Quote detail displays **"Trade Created: TRD-YYYYMMDD-XXXX"** badge and accepted commercial baseline.
   - Sign in as Trader, navigate to **Trader Portal -> Transactions** (or Cockpit -> View Transaction).
   - Verify executed trade record appears in Transaction Ledger with trade reference, counterparties, material, volume, quote reference, and total amount.
   - Open Trade Record modal: verify read-only 11-line commercial breakdown, Incoterm, payment terms, and traceability links to Quote, Demand, Listing, and Match.
   - Verify NO contract conversion or payment execution buttons exist.

## Sprint 06 — Block 02 (Quote Dispatch, Counter-Offer & Buyer Decision)

### 1. Automated Verification Runs (2026-09-17)

- **TypeScript Typecheck (Backend & Frontend):** PASS
  - `npm run typecheck --workspace @ido-grow/backend` -> 0 errors
  - `npm run typecheck --workspace @ido-grow/frontend` -> 0 errors
- **Backend Lint & Frontend Lint (ESLint):** PASS
  - Backend: 0 errors
  - Frontend: 0 errors
- **Backend Test Suite (Jest, 25 suites, 201 tests):** PASS
  - `src/quotes/quotes.service.spec.ts` (send, counter, accept, reject, revise-counter, tenant isolation, expiration checks)
  - `src/quotes/buyer-quotes.controller.spec.ts` (buyer endpoints, role gating, 401/403/404 handling)
  - `src/quotes/quotes.controller.spec.ts` (trader send, revise-counter endpoints)
  - `src/matching/matching.service.spec.ts`
  - `src/matching/trader-cockpit.spec.ts` (cockpit operational queue with real quote categories)
  - `src/matching/trader-management.spec.ts` (buyer detail with quotes list)
  - All foundation suites (auth, listings, buy-orders, marketplace, audit, storage)
- **Frontend Test Suite (Node test runner, 56 tests):** PASS
  - `test/quotes.test.mjs`:
    - Regression test proving no `|| "EUR"` remains in quote or matching frontend code
    - Missing currency displays neutral resolution message with no fake symbol
    - Sprint 06 Block 02 transition matrix allows only approved lifecycle paths
    - Buyer counter-offer preserves original sent QuoteVersion and records proposed changes
    - Trader revised version after counter creates sequential immutable QuoteVersion in DRAFT
    - Currency formatting derives from authoritative currency code without hardcoding EUR
    - Commercial breakdown 11 distinct cost categories
    - Live breakdown calculation summation
  - All matching, buy orders, listings, organisations, and auth test suites
- **Production Builds:** PASS
  - Backend: `nest build` completed with zero errors
  - Frontend: `next build --webpack` completed successfully in 1.7s
- **Database Schema & Migrations:** PASS
  - Prisma client generated successfully
  - Additive migration `20260917120000_sprint06_quote_lifecycle` applied
  - Historical Sprint 00-05 migrations strictly unmodified
- **Git Diff Hygiene:** PASS
  - `git diff --check` passed with zero errors

### 2. Manual Testing Checklist (For Project Owner)

1. **Trader — Send Quote:**
   - Sign in as Trader using the local synthetic Trader account.
   - Navigate to **"Buyer Demand & Matching"** -> open an Approved Match -> click **"Prepare Quote ->"**.
   - Fill the 11-line commercial breakdown and submit for Internal Review (`DRAFT -> INTERNAL_REVIEW`).
   - Click **"Send to Buyer ->"**. Verify confirmation badge changes to **"SENT"** and quote becomes read-only for Trader while awaiting buyer decision.
2. **Buyer — View Quote in Portal:**
   - Sign in as the matching Buyer using the local synthetic Buyer account.
   - Click **"Quotations"** in the left navigation sidebar.
   - Verify the newly sent quote appears in the list with correct reference, material, currency, total, version `v1`, and status `SENT`.
   - Click **"View Proposal ->"**. Verify full 11-line breakdown, trade terms, and action buttons (`Accept Quote`, `Counter Offer`, `Reject Quote`).
3. **Buyer — Counter-Offer:**
   - Click **"Counter Offer"**.
   - Modify proposed product value, incoterm, and enter a mandatory commercial rationale note.
   - Submit counter-offer. Verify status changes to **"COUNTERED"** with Buyer Counter-offer banner.
4. **Trader — Review Counter & Revise:**
   - Switch back to Trader account.
   - In Trader Cockpit, verify the quote appears under **"Buyer Counter-offer"** operational queue.
   - Open the quote detail. Verify the Buyer proposed adjustments and note are clearly displayed alongside the immutable `v1` breakdown.
   - Click **"Prepare Revised Version ->"**. Verify a new `v2` is generated in `DRAFT` status.
   - Update breakdown if appropriate, submit for internal review, and send `v2` to Buyer.
5. **Buyer — Accept Quote:**
   - Switch back to Buyer account.
   - Open the `v2` proposal.
   - Click **"Accept Quote"**. Review confirmation modal and confirm acceptance.
   - Verify quote transitions to **"ACCEPTED"** and actions are closed.
6. **Buyer — Reject Quote:**
   - On a separate sent quote, click **"Reject Quote"**.
   - Enter optional rejection reason and confirm. Verify quote transitions to **"REJECTED"** and actions are closed.

## Sprint 05 — Block 01 (Trader Cockpit & Manual Matching Workspace)

### 1. Automated Verification Runs (2026-08-31)

- **TypeScript Typecheck (Backend & Frontend):** PASS
  - `npm run typecheck --workspace @ido-grow/backend` → 0 errors
  - `npm run typecheck --workspace @ido-grow/frontend` → 0 errors
- **Backend Test Suite (Jest, 18 suites, 126 tests):** PASS
  - `src/matching/matching-calculator.spec.ts` (deterministic scoring, volume coverage, landed cost)
  - `src/matching/matching.service.spec.ts` (trader access gating, workspace generation, shortlist saving, audit event logging)
  - `src/buy-orders/buy-orders.service.spec.ts`
  - `src/marketplace/marketplace.service.spec.ts`
  - `src/listings/listings.service.spec.ts`
  - `src/organisations/organisations.service.spec.ts`
  - `src/audit/prisma-audit-event.writer.spec.ts`
  - All other foundation suites (auth, storage, database, etc.)
- **Frontend Test Suite (Node test runner, 26 tests):** PASS
  - `test/matching.test.mjs` (matching contracts, deterministic compatibility breakdown, landed cost calculations, workspace structure)
  - `test/buy-orders.test.mjs`
  - `test/marketplace.test.mjs`
  - `test/listings.test.mjs`
  - `test/organisations.test.mjs`
  - `test/auth-foundation.test.mjs`
  - `test/auth-dom-submission.test.mjs`
  - `test/i18n-runtime.test.mjs`
- **Frontend Production Build (Next.js 16 Webpack):** PASS
  - Compiled in 1665ms with zero errors.

### 2. Manual Testing Checklist (For Project Owner)

1. Sign in as Trader: Use the active local synthetic Trader account.
2. Navigate to **"Buyer Demand & Matching"** from the left navigation sidebar.
3. On an active OPEN Buyer Demand (e.g. Hemp Technical Fibre), click **"Matching Cockpit ⚡ →"**.
4. In the **Candidate Supply** tab:
   - Verify compatibility score percentage badges (e.g. 95%, 60%).
   - Verify form match badges, volume availability ratios, and estimated landed cost breakdown previews.
   - Click **"+ Shortlist Match"** to toggle candidate to **"✓ Shortlisted"**.
5. Switch to **"Side-by-Side Comparison"** tab:
   - Select 1 to 3 candidate checkboxes to view the comparison matrix against the Buyer Demand.
6. Click **"Cost Breakdown ⚙"** on any candidate:
   - Adjust indicative Freight, Handling, Insurance, Tariff, and Platform Margin.
   - Observe real-time recalculation of unit landed cost and total demand value.
   - Add Trader Operational Notes and click **"Save Landed Cost & Shortlist"**.
7. Confirm that the non-binding confirmation banner displays and the shortlist count updates.

## Sprint 06 Block 01 — Automated Verification & Manual Testing Guide

### 1. Automated Verification Results

- **Backend Test Suite (Jest, 24 test suites, 179 tests):** PASS
  - `src/quotes/quotes.service.spec.ts` (15 tests: deterministic currency inheritance, currency conflict handling, dual v1 audit event emission, trader authorization, approved match requirement, duplicate prevention, 11-field breakdown validation, monotonic versioning, DRAFT/INTERNAL_REVIEW lifecycle, audit logging)
  - `src/quotes/quotes.controller.spec.ts` (7 tests: 401 unauthenticated, session token extraction, parameter delegation)
  - `src/quotes/quotes.calculator.spec.ts` (6 tests: 11-line summation, rounding, negative/non-numeric rejection, positive product value enforcement)
  - `src/matching/trader-management.spec.ts`
  - `src/matching/trader-cockpit.spec.ts`
  - `src/matching/trader-journey.spec.ts`
  - `src/matching/matching.service.spec.ts`
  - All existing domain and foundation suites
- **Backend Typecheck (`tsc --noEmit`):** PASS (0 errors)
- **Backend Lint (`eslint`):** PASS (0 errors)
- **Backend Build (`nest build`):** PASS (0 errors)
- **Frontend Test Suite (Node test runner, 51 tests):** PASS
  - `test/quotes.test.mjs` (7 tests: currency formatting/symbol derivation, blank default commercial terms, 11 breakdown categories, live total summation, immutable version history, DRAFT/INTERNAL_REVIEW status rules, form validation)
  - `test/matching.test.mjs` (24 tests)
  - `test/buy-orders.test.mjs`
  - `test/marketplace.test.mjs`
  - `test/listings.test.mjs`
  - `test/organisations.test.mjs`
  - `test/auth-foundation.test.mjs`
  - `test/auth-dom-submission.test.mjs`
  - `test/i18n-runtime.test.mjs`
- **Frontend Typecheck (`tsc --noEmit`):** PASS (0 errors)
- **Frontend Lint (`eslint`):** PASS (0 errors, 17 pre-existing warnings)
- **Frontend Production Build (`next build --webpack`):** PASS (Compiled in ~1.9s)
- **Git Check (`git diff --check`):** PASS (0 whitespace/syntax issues)

### 2. Manual Testing Checklist (For Project Owner)

1. Sign in as Trader: Use the active local synthetic Trader account.
2. Open **Trader Cockpit**:
   - In the **Approved Matches** table, verify the presence of the active button: **"Prepare Quote →"** next to "View Workspace".
   - Click **"Prepare Quote →"** on any approved match.
3. In the **Quote Builder Modal**:
   - Verify header shows matched context: Material, Product Form, Requested Quantity, Buyer Organisation, Supplier Organisation.
   - Fill out the 11-line Commercial Breakdown (Base Product Value, Margin, Inspection, Packaging, Inland Transport, Freight, Customs, Insurance, Storage, Taxes, Other Fees).
   - Observe the **Live Total Quote (<Currency>)** update dynamically in real-time as numbers are typed.
   - Set Incoterm (e.g., `FOB`), Payment Terms (e.g., `30_DAYS_NET`), Validity Date, and Commercial Notes.
   - Click **"Create Initial Draft (v1)"**. Confirm notification confirms Quote creation with reference number (e.g. `QT-YYYYMMDD-XXXX`).
4. Update the Proposal (Testing Sequential Versioning):
   - Modify a line item (e.g., increase Packaging Cost by 100 units in quote currency).
   - Click **"Save as Next Version"**.
   - Confirm notification confirms: "New Version v2 generated."
   - Switch to the **"Version History & Traceability"** tab:
     - Verify both `v2 (Current)` and `v1` are listed with timestamps, author email, total amount, and terms.
     - Confirm `v1` remains preserved without mutation.
5. Internal Review Lifecycle:
   - Click **"Submit for Internal Review →"**.
   - Verify status transitions to `INTERNAL_REVIEW`.
   - Verify all input fields are locked/disabled and a banner informs that the quote is locked for internal inspection.
   - Click **"← Return to Draft for Editing"**.
   - Verify status transitions back to `DRAFT` and fields become editable again.
6. Verify Across Views:
   - Open **Matching Workspace** for an approved match: verify "Prepare Quote →" button opens the quote modal.
   - Open **Trader Buyers** view for an approved match: verify "Prepare Quote →" button opens the quote modal.