# Changelog

## Unreleased

- Initialized project governance and documentation structure.
- Established the source-of-truth register and extracted project memory from the two primary client documents.
- Approved DEC-001 as the current initial technical architecture, with its listed vendor and tooling choices remaining TBD.
- Completed the read-only legacy technical audit and source-based legacy UX audit.
- Prepared the route-by-route legacy visual review; broad brand-direction reuse and substantial workflow redesign were established through sufficient human inspection, while final screen-by-screen visual approval remains incomplete.
- Created low-fidelity MVP wireframes defining 22 `REQUIRED_MVP` screen families as the current target UX scope.
- Completed the visual-review closure assessment and, following Project Owner approval of Option B, closed the Sprint 00 visual review at foundation level; the 42 legacy routes and final production UI were not individually approved.
- Configured the Project Agent System and successfully completed its Party Mode functional smoke test.
- Defined the approved hemp taxonomy and structured Lot/Inspection-centric quality-model foundations while preserving all unapproved classifications, methods, thresholds, Grades, certificates and remedies as OPEN.
- Defined the approved Roles & Permissions foundation and provider-neutral API conventions; unresolved mandates, authority, field visibility and workflow-specific contracts remain OPEN.
- Completed the preliminary data-protection assessment without claiming compliance or selecting legal roles, lawful bases, retention, vendors or a final DPIA determination.
- Created and approved the 15-step scenario-generic, OPEN-gated First MVP Transaction Workflow; real transaction inputs and unresolved legal, commercial, quality, logistics, Settlement and DPP rules remain OPEN.
- Recorded Project Owner approval of the committed Sprint 00 foundations as the basis for design and implementation, without approving any rule explicitly marked OPEN.
- Synchronized the conceptual data model with the taxonomy, quality, access, workflow, API, privacy and wireframe foundations without creating a physical schema or implementation design.
- Closed Sprint 00 — Discovery and Foundation after the final `sprint-close` assessment returned PASS, with Malick PASS, Ndeye CONSISTENT and Cheikh READY.
- Transitioned to Sprint 01 — Platform Foundation as ACTIVE WITH GUARDRAILS; application implementation remains NOT STARTED pending its first authorised task.
- Preserved all existing transition guardrails: approved foundations only, OPEN behavior blocked, non-binding Matches, assistive/human-controlled AI, no payment execution or escrow, and continuing legal/privacy, authority, visibility and provider gates.
- Recorded DEC-002: OVHcloud is the provisional preferred infrastructure and hosting provider, while deployment and all exact OVHcloud product, region, topology, runtime, networking, domain, secrets, CI/CD, observability and process choices remain deferred and TBD.
- Approved DEC-003: Auth0 Public Cloud with an EU tenant is the authentication provider, while NestJS retains all organisation, tenant and business authorization; authentication-policy and privacy details remain OPEN and privacy due diligence is required before real-data or production use.
- Approved DEC-004: application-managed authentication replaces the external-provider direction and Prisma is selected for PostgreSQL data access. DEC-003 remains preserved but superseded; deployment and production MFA, recovery, email, security-policy and privacy work remain deferred or future work.
- Implemented and Project Owner-validated the application-managed authentication foundation: isolated local Docker PostgreSQL 16, Prisma User and Session persistence, secure login/session/logout APIs, synthetic local-user tooling and the frontend authentication experience. No production policy, deployment, business authorization or other OPEN rule was resolved.
- Implemented and independently validated the Organisation and Membership foundation: Organisation, Site and Membership persistence with an authenticated read-only self-membership API scoped from the server-side session. Verification, onboarding, roles, authority, mandates and field visibility remain OPEN or unimplemented.
- Replaced the temporary login presentation with the approved legacy I Do Grow visual language and recorded Project Owner manual visual and functional validation as PASS; the application-managed authentication behavior and architecture remain unchanged.
- Implemented and independently validated the Immutable Audit Event foundation with append-only application-interface persistence for successful login, sanitized failed-login and successful logout events, using server-derived actor and correlation context. Database-level cryptographic immutability is not claimed; retention, privacy handling, viewer authorization, the final event taxonomy and broader critical-action coverage remain OPEN.
- Approved DEC-005 and implemented the dependency-free typed frontend internationalization runtime for English, Dutch and French non-business platform copy, using English as default/fallback and a validated SameSite locale-preference cookie without browser detection or localized routes. Frontend, UX, architecture and QA reviews passed; mandatory Project Owner manual validation remains pending, and business, legal, status and domain terminology remains OPEN.
- Recorded Project Owner manual validation PASS for the frontend internationalization runtime (EN, NL, FR locale switching, cookie persistence, login/logout and responsive UI rendering).
- Executed formal Sprint 01 closure assessment using `.agents/skills/sprint-close/SKILL.md` (Awa PASS, Malick PASS, Ndeye CONSISTENT). Closed Sprint 01 — Platform Foundation.
- Transitioned to Sprint 02 — Organisations & Supplier Onboarding as ACTIVE under the locked roadmap.
- Implemented and Project Owner-validated Sprint 02 Vertical Block 01 (Supplier Organisation Profile & Production Sites Onboarding): source-approved organisation and site schema extensions, additive PostgreSQL migration, NestJS profile and site CRUD with tenant-scoped membership authorization and audit event logging, and full-width Next.js authenticated application shell with 256px sidebar, mobile drawer, completeness widget, and responsive 3-column site cards matching legacy visual identity.
