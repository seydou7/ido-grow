# Architecture

## Status and authority

The initial technical architecture is approved by **DEC-001 — Initial Technical Architecture**. It is an approved project decision, not a mandatory technology requirement from the client documents. The client manual explicitly presents its suggested technology stack as a recommendation rather than a strict requirement.

This document describes the approved high-level structure only. Application code has not started.

## Approved high-level architecture

```text
User Interfaces
  - Supplier responsive/mobile-first experience
  - Buyer responsive experience
  - I Do Grow Trader responsive experience
  - Quality Inspector responsive experience
  - Administrator responsive experience
          ↓
Next.js Frontend
  - React + TypeScript
  - Tailwind CSS
  - shadcn/ui component-system baseline
  - React Hook Form
  - TanStack Query
  - Internationalization support
          ↓
Versioned REST API
          ↓
NestJS Modular Monolith
  - TypeScript
  - Clear business-domain boundaries
  - Backend authorization, validation, and business logic
          ↓
PostgreSQL
```

The frontend must not connect directly to PostgreSQL. It communicates with backend services through controlled, versioned REST APIs. Critical authorization, validation, and transactional business logic are backend responsibilities and must not rely solely on frontend behavior.

## Domain organization

The NestJS backend begins as one deployable modular monolith. Its internal boundaries should follow the product’s connected business domains, including identity/access, organisations, catalogue, listings/inventory, buy orders, matching, quotes/trading, quality, contracts, logistics, settlement records, DPP, notifications, and controlled agent operations.

These are logical domain boundaries, not approved microservices. A domain may be extracted only if a later concrete scaling, ownership, or deployment requirement justifies it.

## Data and files

- **PostgreSQL:** Approved primary transactional database.
- **PostGIS:** Future optional PostgreSQL extension; add only when geographic calculations justify it.
- **pgvector:** Future optional PostgreSQL extension; add only when a justified AI retrieval use case exists.
- **Object/file storage:** Required for photos, documents, certificates, contracts, and shipment files. Vendor and integration details are **TBD**.

## AI and controlled actions

```text
Platform event or approved user request
          ↓
AI/agent capability (provider TBD)
          ↓
Controlled NestJS tool/service
          ↓
Validation and human approval when required
          ↓
Audited backend action
          ↓
PostgreSQL and/or object storage
```

Agents must not directly mutate critical database records. High-risk and binding actions require support for human approval, and all agent actions must be auditable. Python is not the primary backend language; separate Python services remain a future option only for justified machine-learning, image-analysis, optimization, specialized document-processing, or AI workloads.

## Asynchronous processing

Queues and Redis are not part of the initial architecture. The modular monolith must permit later addition of background processing when required for:

- AI tasks;
- document processing;
- notifications;
- integrations; and
- other long-running operations.

Queue technology and deployment model are **TBD**.

## Future controlled integrations

All connections pass through controlled backend modules/services rather than direct frontend-to-provider or agent-to-database access.

```text
                           ┌─ Object storage (vendor TBD)
                           ├─ AI/LLM services (provider TBD)
Next.js → REST → NestJS ───┼─ WhatsApp (implementation TBD)
                           ├─ Logistics providers (integration TBD)
                           ├─ Notification channels (providers TBD)
                           └─ Background jobs (technology TBD)
```

Payment services and other external integrations may be added only through later approved or requirement-driven work; no provider is selected by DEC-001.

## Technologies and vendors still TBD

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

Examples or recommendations in client and internal planning documents do not select these technologies.

## Architectural constraints

- Main application stack is TypeScript end-to-end: Next.js/React frontend and NestJS backend.
- The initial architecture is a modular monolith, not microservices.
- PostgreSQL is the system of record for transactional data.
- REST APIs are versioned and form the primary frontend/backend boundary.
- Supplier workflows are mobile-first; all core workflows remain responsive.
- Domain boundaries must remain clear enough to support future extraction when justified.
- This architecture does not resolve outstanding product, UX, legal, commercial, or integration-detail ambiguities.
