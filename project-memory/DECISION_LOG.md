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
