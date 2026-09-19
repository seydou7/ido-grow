# Decision Log

Record important architectural and product decisions here. Previous decisions must remain unchanged; later decisions may explicitly supersede them.

## DEC-001 — Initial Technical Architecture

- **Status:** Approved
- **Decision type:** Approved project decision
- **Scope:** Initial application architecture; no application implementation is authorized by this decision.
- **Source relationship:** The client Product and Development Manual presents its suggested stack as “a recommendation, not a strict requirement.” This decision formally selects an initial project architecture that aligns closely with that recommendation while remaining subordinate to primary client sources and later explicit client clarifications.

### Decision

#### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui as the primary component-system baseline
- React Hook Form for form-heavy workflows
- TanStack Query for server-state management
- Internationalization support
- Responsive web application
- Mobile-first supplier workflows

#### Backend

- NestJS with TypeScript
- Modular monolith with clear domain boundaries
- Versioned REST API as the primary frontend/backend communication mechanism

#### Primary database

- PostgreSQL
- PostGIS may be added later when geographic calculations require it.
- pgvector may be added later when justified by AI retrieval use cases.

#### Frontend/backend boundary

- The frontend must not access PostgreSQL directly.
- Business logic belongs primarily in the backend.
- The frontend communicates with backend services through controlled APIs.
- Critical authorization and validation must not rely solely on the frontend.

#### AI architecture principle

- Platform AI agents must not directly mutate critical database records.
- Agent actions must pass through controlled backend tools or services.
- Human approval must be supported for high-risk or binding actions.
- Agent actions must remain auditable.

#### Asynchronous processing

- Do not introduce queues or Redis before a concrete requirement exists.
- Preserve the ability to add asynchronous job processing later for AI tasks, document processing, notifications, integrations, and other long-running operations.

#### Object storage

- Object/file storage is required for photos, documents, certificates, contracts, and shipment files.
- The storage vendor remains TBD.

#### Python

- Python is not the primary backend language.
- A Python service may be introduced later only when justified for machine learning, image analysis, optimization, specialized document processing, or AI workloads.

#### Architecture style

- Start with a modular monolith.
- Do not introduce microservices unless a concrete scaling, ownership, or deployment requirement justifies them later.

### Explicitly not decided

- Cloud provider
- Hosting provider
- Authentication provider
- Object-storage vendor
- Queue technology
- LLM provider
- Payment provider
- WhatsApp implementation details
- Observability vendor
- CI/CD vendor
- Exact ORM
- Exact API documentation tooling

### Rationale

- Keep the main application stack TypeScript end-to-end.
- Reduce cognitive and operational complexity.
- Support a relatively small initial engineering team.
- Keep transactional business logic centralized.
- Preserve clear domain boundaries for future extraction if needed.
- Align closely with the client’s recommended technical direction.
- Maintain flexibility for future AI, logistics, DPP, and external integrations.

### Alternatives considered

1. **Next.js full-stack application directly connected to the database** — Not selected because the approved architecture requires a controlled frontend/backend boundary, centralized transactional business logic, and backend-enforced authorization and validation.
2. **Next.js + FastAPI** — Not selected as the initial architecture because it would split the main application across TypeScript and Python, increasing cognitive and operational overhead. Python remains available later for justified specialized workloads.
3. **Microservices from the first release** — Not selected because the initial team is expected to be relatively small, requirements will evolve, and transactions span domains. A modular monolith keeps deployment and cross-domain work simpler while preserving extraction boundaries.
4. **NoSQL-first architecture** — Not selected because the platform centers on relational, auditable, transactional trading data and financial records; PostgreSQL is the better initial system of record while retaining JSON and extension options.

### Consequences and constraints

- Application initialization must follow this stack unless a later approved decision supersedes DEC-001.
- Domain boundaries must be maintained inside the modular monolith.
- Vendor and tooling choices listed as TBD require later evaluation or approval and must not be inferred from examples in client or planning documents.
- This decision does not resolve unrelated product, UX, business-rule, hosting, security-provider, or integration ambiguities.

## DEC-002 — Provisional Infrastructure and Hosting Direction

- **Status:** Provisional — approved direction; deployment deferred
- **Decision type:** Supplemental project decision
- **Scope:** Infrastructure and hosting provider preference only. DEC-001 remains unchanged.

### Decision

- OVHcloud is the preferred infrastructure and hosting provider for now.
- Deployment implementation is explicitly **DEFERRED**.
- No exact OVHcloud product, service, region, topology, runtime, or deployment design is selected by this decision.

### Explicitly not decided

- Region and environment topology
- Exact OVHcloud product or service
- Container or runtime choice
- Networking, ingress, domains, DNS, TLS, CDN, or WAF
- Secrets implementation
- CI/CD and deployment process
- Observability
- PostgreSQL provider, ORM, authentication provider, object-storage vendor, queue technology, LLM provider, payment provider, WhatsApp implementation, and API-documentation tooling

### Consequences and constraints

- Application-environment and deployment work remains deferred until the required implementation details are separately approved.
- No infrastructure or deployment file is authorized by this decision.
- Future infrastructure work must preserve DEC-001 and must not infer any still-TBD provider, product, topology, or process from the OVHcloud preference.

## DEC-003 — Authentication Provider and Authorization Boundary

- **Status:** Approved
- **Decision type:** Supplemental project decision
- **Scope:** Authentication provider and authentication-versus-authorization boundary only. DEC-001 and DEC-002 remain unchanged.

### Decision

- Auth0 Public Cloud with an EU tenant is the approved authentication provider for I Do Grow.
- Auth0 may handle identity, authentication, sessions, MFA capability, and account recovery.
- The I Do Grow NestJS backend remains authoritative for organisation and tenant context, memberships, roles and capabilities, assignments, represented-party capacity, approvals, field visibility, resource authorization, deny-by-default business authorization, and audit context.
- Auth0 roles, organisation data, claims, or scopes must not directly grant I Do Grow business authority.

### Explicitly still open

- Login methods
- Exact MFA factors, enforcement, and step-up rules
- Registration, invitation, and verification policies
- Session and token lifetimes, refresh, revocation, and related policies
- Auth0 plan
- Branding and custom domain
- Email and SMS configuration
- Environment and secrets implementation
- Privacy due diligence, DPA, subprocessors, transfers, retention, deletion, export, and DPIA review
- All unrelated DEC-001 and DEC-002 TBDs

### Consequences and constraints

- The authentication-provider TBD is resolved by this decision.
- Authentication implementation may proceed only within the approved boundary and must not define or delegate business authorization rules.
- Privacy due diligence remains required before real-data or production use.
- This decision does not authorize deployment work or resolve any other provider, infrastructure, product, policy, or business-rule choice.

## DEC-004 — Application-Managed Authentication and Prisma

- **Status:** Approved — supersedes DEC-003
- **Decision type:** Supplemental project decision
- **Scope:** Authentication ownership and PostgreSQL ORM/data-access selection. DEC-001 and DEC-002 remain unchanged; DEC-003 remains preserved as historical decision evidence.

### Decision

- I Do Grow authentication is application-managed and controlled by the I Do Grow application.
- No external authentication provider or service is used for the current product direction.
- Prisma is the approved ORM and data-access layer for PostgreSQL.
- The NestJS backend remains authoritative for authentication and for all organisation, tenant, membership, role, capability, assignment, represented-party, approval, field-visibility, resource and business authorization decisions.
- DEC-003 — Authentication Provider and Authorization Boundary is superseded by this decision. Its historical text is not deleted or rewritten.
- Deployment remains deferred under DEC-002. This decision selects neither a cloud PostgreSQL provider nor production infrastructure.

### Explicitly still open or future work

- Production MFA and step-up policy
- Account recovery policy and workflow
- Email-delivery provider and production communications
- Registration, invitation and verification product rules
- Final production password, session, lockout, monitoring and incident-response policies
- Production secrets and deployment implementation
- Privacy due diligence, retention, deletion, export and DPIA review
- All unresolved organisation and business authorization rules

### Consequences and constraints

- Auth0-specific runtime code and dependencies must not remain active.
- Provider-neutral authentication contracts may remain where they accurately represent internal application identity and sessions.
- The initial implementation may establish a conservative local authentication baseline without claiming that its parameters are final production policy.
- PostgreSQL remains the required database; SQLite is not an authorised substitute.

## DEC-005 — Frontend Internationalization Runtime Conventions

- **Status:** Approved
- **Decision type:** Supplemental project decision
- **Scope:** Sprint 01 frontend internationalization runtime conventions for non-business platform copy only. DEC-001 through DEC-004 remain unchanged.

### Decision

- Use a small internal typed internationalization runtime over the existing locale configuration and typed catalogs; do not add an external internationalization library for the Sprint 01 baseline.
- Support exactly English (`en`), Dutch (`nl`) and French (`fr`). English is the default locale and missing-copy fallback.
- Resolve the locale deterministically from the validated first-party `ido_grow_locale` preference cookie; use English when the cookie is missing or invalid.
- Store only the non-sensitive locale preference in a `SameSite=Lax`, `Path=/` cookie with a one-year preference-style duration. This duration is an implementation convention, not a legal or privacy retention policy.
- Do not use browser or `Accept-Language` auto-detection and do not introduce locale-specific routes in Sprint 01.
- Provide an explicit accessible language selector that updates the preference and refreshes the current route without changing its URL. The server-rendered locale, client runtime and HTML `lang` value must remain consistent.
- Translate only approved non-business platform and authentication-shell copy. Business, legal, status and domain terminology marked OPEN remains excluded.

### Explicitly still open or future work

- Browser or `Accept-Language` detection
- Locale-specific URLs, localized SEO and related routing strategy
- Account-level preference synchronization
- Advanced pluralization and date, time, number or currency formatting conventions
- Translation-management workflow or service
- Additional locales and right-to-left support
- Business, legal, status and domain terminology

### Consequences and constraints

- The Sprint 01 runtime remains dependency-light and deterministic across server rendering and client hydration.
- Locale preference must not affect authentication sessions, backend authorization or application URLs.
- Future internationalization requirements may replace or extend the internal runtime through a later approved decision without changing the approved locale content silently.

## DEC-006 — Client Demo Deployment Exception Following Sprint 04

- **Status:** Approved
- **Decision type:** Project Owner operational deployment exception
- **Scope:** Authorizes provisioning and deployment of a client-accessible Demo / Pre-Production environment immediately following Sprint 04 closure and prior to Sprint 05 activation. DEC-001 through DEC-005 remain unchanged; DEC-002 provisional provider preference (OVHcloud) remains active; final production deployment architecture remains deferred.

### Decision

- A remotely accessible Client Demo / Pre-Production environment is authorized to be deployed immediately following Sprint 04 closure.
- This environment enables the client to review delivered capabilities across Sprints 01–04 (Authentication, Onboarding, Product Catalogue/Listings, Buyer Marketplace, and Buy Orders/Demand Management).
- Sprint 05 (Trader Cockpit & Manual Matching) remains in `READY` status (not `ACTIVE`) until the Client Demo environment has been deployed and smoke-validated with a verified client URL.
- OVHcloud remains the preferred hosting direction under DEC-002; the exact production topology, multi-region architecture, scaling, and high-availability design remain deferred.
- The locked roadmap sprint sequence and scope definitions are unchanged.
- Local synthetic/test credentials must not be reused in the public Client Demo environment. Fresh demo credentials must be safely provisioned using environment secrets, and no plaintext credentials may be committed.

### Explicitly still open or future work

- Final production deployment architecture, topology, networking, domains, CI/CD, and observability
- Production secrets management and key rotation policies
- Production domain and SSL provisioning
- Privacy due diligence, retention, and DPIA review prior to real-data production use

### Consequences and constraints

- Deployment work is authorized strictly for the Client Demo / Pre-Production boundary.
- Sprint 05 activation is blocked until the demo environment deployment and smoke validation are complete.
- No production readiness or regulatory compliance is claimed for the demo environment.

## DEC-007 — Single Approved Match Invariant & Deferred Multi-Supplier Matching for Sprint 05

- **Status:** Approved
- **Decision type:** Approved project decision
- **Scope:** Sprint 05 Trader Cockpit & Manual Matching Workspace. Defines the single active commercial match invariant and explicitly defers multi-supplier matching. DEC-001 through DEC-006 remain unchanged.

### Decision

- In Sprint 05 (Trader Cockpit & Manual Matching), a Trader may view and compare MULTIPLE candidate published Listings for an OPEN Buy Order.
- However, **ONLY ONE Listing may be APPROVED as the active commercial Match for a given Buy Order at a time**.
- Server-side transaction-safe invariant enforcement is mandatory: attempting to approve a candidate when another Match is already `APPROVED` for that Buy Order must be rejected, requiring the Trader to explicitly cancel/revoke the existing approved Match first.
- An approved Match represents the non-binding commercial baseline and operational handoff into Sprint 06 (Quotes & Trade Lifecycle).
- Multi-supplier fulfilment, split-order allocation, and multi-listing combination are explicitly **DEFERRED** to later automated matching roadmap scopes (Sprint 12+).
- Matching remains strictly **manual, deterministic, Trader-controlled, and non-binding**. No AI matching, no vector search, no weighted score algorithm, and no automated quote generation.

### Explicitly still open or future work

- Multi-supplier fulfilment and batch combinations (Sprint 12+)
- Automated quote generation and quotation negotiation lifecycle (Sprint 06)
- Binding inventory reservations and purchase commitments (Sprint 06)
- AI-driven match explanation and copilot capabilities (Sprint 12)

### Consequences and constraints

- The `Match` model enforces a maximum of one `APPROVED` match per `BuyOrder` via transaction-safe backend business rules.
- Cancelling an approved match transitions its status to `CANCELLED`, preserving historical audit records and enabling the Trader to subsequently approve an alternative candidate.
- Matching only operates on `BuyOrder.status = 'OPEN'` and `Listing.status = 'PUBLISHED'`.
