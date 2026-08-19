# I Do Grow — Initial API Conventions

- **Status:** Sprint 00 foundation proposal; requires human approval before implementation.
- **Authority:** Subordinate to primary client sources, later explicit client clarifications, and DEC-001.
- **Implementation status:** Conventions only. No endpoint, application code, schema, dependency, or Platform Agent is implemented by this document.

## 1. Purpose and Scope

These conventions define a consistent initial contract for the versioned REST boundary between the approved Next.js frontend and NestJS modular-monolith backend. They govern public contract shape, naming, methods, validation, authorization boundaries, concurrency, auditability, files, controlled Platform Agent access, documentation, and future endpoint testing.

They do not:

- define endpoints or approve a delivery backlog;
- replace the domain model with an API or database schema;
- select any technology or vendor that DEC-001 leaves TBD;
- approve a business state, transition, role, threshold, visibility rule, or binding authority;
- resolve any question in `CLIENT_CLARIFICATIONS.md`;
- authorize application implementation, dependencies, Sprint 01, or Platform Agent creation.

Controllers should translate HTTP requests and responses. NestJS application and domain services should enforce use cases, authorization, validation, approvals, invariants, and transaction boundaries. Persistence entities, ORM details, and provider payloads must not become public API contracts. Backend modules should own their data access and expose deliberate application interfaces rather than sharing repositories without control.

## 2. API Base Path and Versioning

- The initial base path is `/api/v1`.
- Major API versions are expressed in the URL and are independent of frontend release numbers.
- Backward-compatible changes within `v1` may include new optional response fields, new resources, and new optional query parameters whose absence preserves existing behavior.
- Removing or renaming a field, changing its type or meaning, making an optional input incompatibly mandatory, or changing endpoint semantics is breaking and requires a later major API version.
- Deprecation must be documented, observable, and announced with a migration window before removal. The duration and support policy remain TBD.
- This convention does not define or predict any `v2` behavior.

## 3. Resource Naming

- Use plural, lowercase nouns for resource collections.
- Use kebab-case for multiword path segments.
- Use stable, opaque, server-generated resource identifiers. A client must not infer type, order, tenant, or creation time from an identifier.
- Use nesting only where the parent provides meaningful ownership or lifecycle scope. Keep major resources independently addressable and avoid deep nesting.
- Prefer top-level resources with authorised filters or links for cross-domain relationships; a conceptual relationship does not automatically mean aggregate ownership.
- Avoid verbs in normal CRUD resource paths.

Illustrative resource collections include:

- `/api/v1/suppliers`
- `/api/v1/listings`
- `/api/v1/lots`
- `/api/v1/buy-orders`
- `/api/v1/matches`
- `/api/v1/quotes`
- `/api/v1/trades`
- `/api/v1/contracts`
- `/api/v1/shipments`

These names reflect source-backed concepts, not approved resource cardinalities, workflows, or transitions.

## 4. HTTP Method Conventions

- `GET` retrieves a resource or collection and must be safe and idempotent.
- `POST` creates a resource or invokes an explicit approved business command. Retried operations that could duplicate an effect require idempotency protection.
- `PATCH` partially updates documented, allowlisted mutable fields. Omitted fields remain unchanged; `null` clears a field only where the contract explicitly permits it. Arbitrary status changes through `PATCH` are not allowed.
- `PUT` is allowed only where a true complete-replacement contract exists and has idempotent semantics. It is otherwise omitted.
- `DELETE` is allowed only where deletion is approved and compatible with retention, provenance, and audit obligations. Cancellation, rejection, expiry, suspension, or another lifecycle outcome is not represented by hard deletion merely for CRUD symmetry.

HTTP method idempotency does not replace domain concurrency checks. For retry-prone creates or commands, an `Idempotency-Key` must be scoped to authenticated identity, authorised organisation context, operation, and a canonical request fingerprint. Repeating the same key and payload returns the recorded outcome; reusing the key with different input returns a conflict. A request ID is not an idempotency key. Exact qualifying operations and retention periods remain TBD.

## 5. Business Actions

Non-CRUD workflow commands use this consistent route style:

```text
POST /api/v1/{resources}/{resourceId}/actions/{command}
```

Illustrative command names such as `submit`, `approve`, `reject`, and `publish` are **NON-BINDING EXAMPLES**. No example in this document approves a transition or endpoint.

A command may be defined only after its domain transition is approved. Its contract must state prerequisites, authorised actor, approval requirement, concurrency condition, idempotency behavior, audit outcome, and resulting representation. The backend must re-check all of them at execution time.

The Quote legal effect, reservation and `sold` triggers, quality thresholds and progression gates, Contract authority, Settlement ownership/closure, delivery and claims authority, and DPP visibility remain unresolved in `CLIENT_CLARIFICATIONS.md`. They must not be encoded as commands until clarified and approved.

## 6. Request and Response Shape

- Use UTF-8 JSON with `application/json` for request and success bodies.
- Use lower camelCase for JSON field names. Stable enum wire values should use lowercase `snake_case`; an existing value must not be repurposed to mean something else.
- Represent resource IDs as opaque strings.
- Treat server-generated identifiers, audit identity, approval context, timestamps, calculated totals, concurrency tokens, and authoritative statuses as immutable client input.
- Use uppercase ISO 4217 codes for currencies and ISO 3166-1 alpha-2 codes for countries where applicable.
- Use approved master-data unit codes. This document does not approve a unit catalogue.
- In requests, omission means not supplied or, for `PATCH`, unchanged. `null` means explicit absence or clearing only where the field is documented nullable.
- In responses, omission and `null` must not be interchangeable. Each field contract must document whether it can be absent, withheld by visibility rules, or explicitly null.
- Reject unknown request fields except inside an explicitly designed extension or metadata container.
- Return explicit output DTOs/projections; never serialize persistence or provider objects directly.

Commercial decimal values are strings so JSON and JavaScript do not introduce binary floating-point error. Source values and approved normalized values must remain distinguishable.

## 7. Date and Time

- Use ISO 8601 representations.
- Persist and transport instants in UTC, serialized as RFC 3339 timestamps such as `2026-08-19T12:34:56.789Z`.
- Represent date-only values as `YYYY-MM-DD`; do not silently convert them into midnight timestamps.
- When a business date or deadline depends on local time, include its explicit IANA timezone and retain the relevant source timezone or offset.
- Clients may localize display, but must send authoritative values in the documented representation.

## 8. Money, Quantity and Measurement

- Never use binary floating-point semantics for money, quantities, measurements, rates, balances, or landed-cost calculations.
- Money uses an explicit decimal amount and currency:

```json
{
  "amount": "1234.50",
  "currency": "EUR"
}
```

- A quantity or measurement uses an explicit decimal value and approved unit code:

```json
{
  "value": "1250.000",
  "unit": "kg"
}
```

- Preserve source amount/value, currency/unit, and provenance separately from any normalized representation. When conversion occurs, retain its source, date, rate or rule, and applicable precision/rounding context.
- Authoritative landed-cost, balance, conversion, and other commercial calculations occur server-side.
- Exact precision, scale, rounding, conversion rules, normalized units, and hemp thresholds remain TBD and require their relevant approved business definitions.
- No money, decimal, or measurement library is selected here.

## 9. Pagination, Filtering, Sorting and Search

Cursor pagination is the initial MVP convention because mutable marketplace and transaction collections can drift under offset pagination.

- `limit` controls page size; the default is `25` and the maximum is `100` unless an endpoint documents a smaller safe bound.
- `cursor` is opaque, validated server-side, and bound to authorised organisation context plus the active filter and sort.
- `sort` accepts only allowlisted fields, uses `-` for descending order, and must include a deterministic stable-ID tie-breaker.
- Filters use explicit, typed, allowlisted query parameters.
- `q` is an endpoint-defined text-search parameter. Search semantics must be documented per endpoint.
- Invalid, expired, or context-mismatched cursors return a validation error without revealing cursor contents.
- Exact total counts are omitted by default. Small, bounded reference-data endpoints may explicitly omit pagination.

Collection metadata uses:

```json
{
  "items": [],
  "page": {
    "nextCursor": null,
    "hasMore": false
  }
}
```

No external search engine is introduced. PostgreSQL-backed capabilities may be evaluated during implementation; a later search technology requires concrete justification and approval where applicable.

## 10. Success Responses

- A single resource returns its representation directly with `200 OK`.
- A collection returns the consistent `{ "items": [...], "page": {...} }` shape with `200 OK`.
- A created resource returns `201 Created`, the created representation, and a `Location` header.
- A completed mutation returns `200 OK` with the authoritative updated representation when the client needs it, or `204 No Content` when no representation is useful.
- `202 Accepted` is reserved for asynchronous work that actually exists and returns an operation reference plus `Location` for status. It does not imply that a queue or background-processing technology is approved.
- Empty collections return `200 OK` with an empty `items` array; they are not errors.

A universal `data` envelope is deliberately avoided. Consistency comes from one direct-resource shape and one collection shape rather than endpoint-specific wrappers.

## 11. Error Model

Errors use a stable Problem Details-compatible JSON structure with `application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 422,
  "code": "VALIDATION_FAILED",
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/listings",
  "requestId": "opaque-request-id",
  "fieldErrors": [
    {
      "path": "quantity.value",
      "code": "INVALID_DECIMAL",
      "message": "Enter a valid decimal value."
    }
  ]
}
```

- Clients branch on the stable machine-readable `code`, never on the human-readable message.
- Field paths align with request field paths so React Hook Form can map them to controls. Form-level errors may omit the path.
- Safe, allowlisted `meta` may be added where the client needs recovery context.
- The backend returns the request/correlation identifier in a consistent response header and in error bodies.

Initial HTTP categories are:

- `400` malformed request;
- `401` authentication required;
- `403` forbidden where disclosure is safe;
- `404` missing or intentionally concealed inaccessible resource;
- `409` domain, current-state, or idempotency conflict;
- `412` stale `If-Match` precondition;
- `413` payload too large;
- `415` unsupported media type;
- `422` schema, field, or domain validation failure;
- `428` required precondition missing;
- `429` rate limited, with safe retry guidance where applicable;
- `500` internal error.

Exact domain error codes remain subordinate to approved workflows. Responses must not expose stack traces, SQL, file paths, secrets, internal policy details, provider payloads, or cross-organisation resource existence.

## 12. Validation

- The backend is the validation authority. Frontend validation exists for usability and early feedback only.
- Validate media type, parsing, schema, types, required fields, unknown fields, enumerations, length/size, and allowed structure at the boundary.
- Use allowlisted input DTOs to prevent mass assignment.
- Validate domain rules, current state, referenced resources, cross-entity relationships, units, currencies, and permissions inside controlled backend services.
- Re-load and revalidate authoritative referenced data when executing a command; do not trust client-supplied copies.
- Preserve source data before any approved normalization.
- Parameterize data access regardless of the future ORM choice.
- Filter every response through an explicit authorised output contract.

## 13. Authentication and Authorization Boundary

The authentication provider and credential/session design remain TBD.

- Resolve authenticated identity server-side from verified credentials.
- Derive or validate organisation context, membership, represented party/capacity, and permission server-side for every request.
- Treat any submitted organisation identifier as a requested selector, never proof of membership or authority.
- Never trust client-submitted actor, role, owner, approval, or audit identity.
- Frontend route guards, hidden controls, and disabled buttons improve UX but do not grant or enforce authority.
- Check object-level, property-level, and function-level authorization for every resource and action, including list children, exports, files, and controlled tools.
- High-risk or binding actions require the stronger authorization and human-approval rules ultimately approved for that workflow. This document does not define thresholds, signatories, MFA, or step-up mechanisms.

## 14. Multi-Tenancy and Data Visibility

- Deny access by default and enforce organisation scoping at backend service and data-access boundaries for reads, writes, lists, search, counts, exports, files, and actions.
- Do not perform unscoped queries and filter by tenant afterward.
- Cross-organisation visibility must arise from an approved marketplace rule, transaction relationship, explicit sharing, ownership, or specific internal permission.
- Internal I Do Grow access is not implicitly platform-wide; it must be scoped, least-privilege, and audited.
- Responses must contain only fields the caller may see. The frontend must not receive sensitive fields and merely hide them.
- Missing and inaccessible private resources should be externally indistinguishable where revealing existence would be unsafe; the internal audit may retain the true denial reason.
- Cache keys and invalidation must include the authenticated organisation context so frontend data cannot cross organisations.

The full roles, permissions, field-visibility, controller/processor, retention, and correction matrix remains unresolved under `CLIENT_CLARIFICATIONS.md`, especially A7.1–A7.3.

## 15. Concurrency and Integrity

- Use an opaque strong `ETag` for resources whose consequential writes require stale-write protection, and require `If-Match` for those writes.
- A missing required precondition returns `428`; a non-matching token returns `412` with the standard safe error model.
- Keep the concurrency token separate from domain versions such as Quote, Contract, or DPP versions. Replace it atomically on every relevant mutation; do not derive it only from a timestamp.
- Use `409` for a domain/current-state conflict that is not an HTTP precondition failure.
- Idempotency prevents duplicate execution; it does not replace concurrency checks. It must handle simultaneous duplicates as well as later retries.
- For one critical operation, authorization, current state/version validation, invariant enforcement, mutation, concurrency-token update, and critical audit creation must succeed or fail atomically in a PostgreSQL transaction where they affect the same transactional outcome.
- Enforce approved invariants through backend services and PostgreSQL constraints where expressible. Use row locks or stricter isolation only when a documented invariant requires them; there is no global locking prescription.
- Do not hold a database transaction open across external network calls.
- Human approvals and controlled Platform Agent execution must bind to the reviewed proposal and relevant resource version; changed or stale content requires revalidation and, where applicable, reapproval.
- Bulk operations require an explicit atomicity and concurrency contract; partial success must never be accidental.

These principles do not define reservation, availability, allocation priority, expiry, release, `sold`, or other unresolved inventory rules. Concurrency-token scope, qualifying operations, idempotency retention, physical constraints, and isolation strategy remain TBD.

## 16. Auditability

Critical actions should capture, where applicable:

- authenticated actor and actor type;
- acting organisation;
- represented party and capacity;
- action and outcome;
- timestamp;
- resource and relevant before/after concurrency versions;
- relevant before/after values or changed fields;
- reason;
- source/channel;
- request/correlation identifier;
- approval record and approver context;
- Platform Agent identity/version, initiating actor, proposal, capability/tool, and execution linkage.

The backend supplies authoritative actor, time, organisation, approval, and audit identity. Trader-assisted actions must state who acted, for which represented party, through which channel, and under which approval context.

Critical audit history is append-only. Corrections create new history rather than rewriting earlier evidence. Operational logs and business audit records are distinct; both require authorization, minimization, and sensitive-data handling. Exact retention, immutability mechanism, and personal-data obligations await the Sprint 00 data-protection work and client clarification.

## 17. File and Document Handling

The object-storage vendor remains TBD.

- Expose stable file/document identifiers and authorised metadata, not provider object keys or permanent public URLs for private content.
- Authorize an upload intent before bytes are accepted. Use server-generated identifiers and short-lived, single-purpose transfer instructions where direct transfer is later selected.
- Validate declared type, detected content/type, byte size, filename handling, count, checksum where required, intended purpose, organisation, and permitted linked resource.
- Treat filenames, extensions, MIME claims, archives, and document content as untrusted input.
- Require malware/security scanning and quarantine before a private file becomes trusted, usable, or shareable. The scanner, mechanism, limits, and processing technology remain TBD.
- Authorize every download. Use a controlled response or short-lived scoped access after that check.
- Track provenance, uploader, organisation, size, content hash where applicable, linked record, and safe processing status.
- File existence does not grant DPP, transaction, or public visibility.

The API contract may support vendor-neutral upload-intent, metadata, and processing-status resources, but this document does not define their endpoints or select object storage.

## 18. Platform Agent API/Tool Boundary

The controlled lifecycle is:

```text
AI recommendation
  → controlled proposal or draft
  → human approval where required
  → backend revalidation and execution
  → audit
```

- Platform Agents must not directly access or manipulate PostgreSQL or persistence repositories.
- They use narrow, allowlisted NestJS application services or controlled tools, not arbitrary SQL, URLs, code, or tool names.
- Each controlled action enforces authenticated initiating context, agent identity, organisation/represented-party context, allowlisted capability, structured validated input/output, authorization, domain invariants, concurrency, idempotency where relevant, and human approval where required.
- Effective authority is the intersection of the initiating actor, agent, tool capability, and backend policy. An agent cannot choose or enlarge its own authority.
- Treat model output, retrieved documents, and provider responses as untrusted input.
- Approval must bind to the exact proposal payload, resource version, approver, scope, and applicable validity; changed or stale proposals require revalidation and reapproval where required.
- Record proposal, evidence/source and confidence where applicable, approval, execution, outcome, and audit linkage.
- Internal agent tools are not unrestricted public frontend endpoints.

This defines a boundary only. It does not create a Platform Agent, choose an LLM provider, or authorize Platform Agent implementation during Sprint 00.

## 19. Security Conventions

- Require TLS outside local development.
- Trust proxy and forwarded-header information only from configured infrastructure.
- Enforce strict input, page, search, upload, export, and processing limits appropriate to each risk surface.
- Use explicit response projections, output filtering, and data minimization.
- Never expose secrets, credentials, tokens, private provider details, internal exceptions, or raw third-party errors through the API.
- Return safe authorization failures and avoid private-resource enumeration.
- Require risk-based rate limiting by relevant network source, authenticated identity, organisation, and operation. Exact thresholds and infrastructure remain TBD; return `429` and safe `Retry-After` guidance where appropriate.
- Apply secure headers at the deployment layer. CORS must use explicit allowed origins and must not combine wildcard origins with credentials.
- If cookie-based authentication is later selected, appropriate CSRF defenses are mandatory. If header bearer credentials are selected, tokens must never appear in URLs. The credential model remains TBD.
- Generate or safely normalize request/correlation IDs; they are diagnostic and never convey authority.
- Separate operational logging from business audit. Redact authorization headers, cookies, secrets, bank data, unnecessary personal data, confidential margins, and private document contents.
- Authenticate inbound integrations/webhooks, validate provider payloads, prevent replay, and translate them through the owning module boundary when those integrations are later approved.
- Review future endpoints against current OWASP API risks, including broken object- and function-level authorization, broken authentication, property-level authorization/mass assignment, uncontrolled resource consumption, sensitive-flow abuse, SSRF, security misconfiguration, API inventory/version drift, and unsafe third-party API consumption.

No infrastructure, authentication, security, or observability vendor is selected here.

## 20. API Documentation

- The API contract must be machine-readable.
- Documentation must cover endpoint purpose, authorization context, path/query/header parameters, request and response schemas, error codes, idempotency, concurrency/preconditions, and safe examples.
- Examples must be labelled illustrative or non-binding when relevant business behavior is unresolved.
- Generate or validate documentation from the source contract where practical so implementation and documentation do not drift.
- An OpenAPI-compatible contract is a desirable interoperability standard, not a tooling selection.
- The exact specification version, generator, UI, validation workflow, and API-documentation tooling remain TBD under DEC-001.

## 21. Testing Expectations

Future endpoints require risk-proportionate tests, including where applicable:

- unit tests for application/domain business logic;
- integration tests across HTTP, application services, and PostgreSQL boundaries;
- machine-readable contract and documentation-consistency tests;
- authentication, authorization, and actor × organisation × resource × field × action matrix tests;
- two-tenant isolation tests for read, write, list, search, count, export, file, and identifier-enumeration paths;
- validation, unknown-field, mass-assignment, and output-overexposure tests;
- negative and error-path tests with stable status and error codes;
- tests only for approved state transitions and approval gates;
- idempotency replay, different-payload, simultaneous-duplicate, and retention behavior tests;
- stale-write, missing-precondition, true concurrent-race, atomic rollback, and invariant tests;
- audit creation, correction-history, authorization, and redaction tests;
- file authorization, type mismatch, oversize, archive, quarantine, malware, expiry, and cross-tenant access tests;
- rate/resource-limit, CORS, and conditional CSRF tests matching the eventual deployment and credential model;
- Platform Agent allowlist, structured-input, tenant-boundary, untrusted-content, stale-approval, direct-persistence-denial, and audit-chain tests.

This section does not select a test library or create tests.

## 22. Naming Examples

All examples below are **NON-BINDING**. They illustrate naming and contract style only; they do not approve endpoints, filters, fields, access, transitions, or workflow behavior.

```text
GET   /api/v1/suppliers/{supplierId}
GET   /api/v1/listings?cursor={opaque}&limit=25&sort=-updatedAt
POST  /api/v1/listings
GET   /api/v1/listings/{listingId}
PATCH /api/v1/listings/{listingId}          If-Match: "{opaque-etag}"
GET   /api/v1/lots/{lotId}
POST  /api/v1/buy-orders
GET   /api/v1/matches/{matchId}
GET   /api/v1/quotes/{quoteId}
GET   /api/v1/trades/{tradeId}
GET   /api/v1/contracts/{contractId}
GET   /api/v1/shipments/{shipmentId}
```

The command pattern is illustrated without approving a command:

```text
POST /api/v1/{resources}/{resourceId}/actions/{approved-command}
```

Possible words such as `submit`, `approve`, `reject`, or `publish` remain illustrative until the relevant transition and authority are approved. Examples such as Quote acceptance, reservation, `sold`, quality approval thresholds, Contract signature authority, Settlement closure, and DPP publication are deliberately excluded because their business rules remain open.

## 23. Explicitly Deferred Decisions

DEC-001 explicitly leaves these technology choices TBD:

1. Cloud provider.
2. Hosting provider.
3. Authentication provider.
4. Object-storage vendor.
5. Queue technology.
6. LLM provider.
7. Payment provider.
8. WhatsApp implementation details.
9. Observability vendor.
10. CI/CD vendor.
11. Exact ORM.
12. Exact API-documentation tooling.

These implementation and security details also remain deferred:

- credential/session/token transport, refresh, MFA, and step-up design;
- exact organisation-context transport and private-resource disclosure policy;
- identifier-generation format;
- deprecation/support period;
- endpoint-specific page limits and text-search semantics where the default is unsuitable;
- concurrency-token generation and aggregate scope;
- operations requiring `If-Match` or `Idempotency-Key`, idempotency retention, and recorded-response policy;
- transaction isolation and locking per approved invariant;
- PostgreSQL numeric precision/scale, rounding, conversion rules, and normalized units;
- rate-limit implementation and thresholds;
- accepted file types/sizes/counts, scanner, resumability, retention, and processing mechanism;
- secure-header/CORS environment configuration and observability/privacy handling;
- public versus private API exposure and external integration/webhook contracts;
- audit retention, immutability implementation, residency, correction, and erasure handling;
- exact testing libraries and contract-generation/validation workflow.

The following business rules remain unresolved in `CLIENT_CLARIFICATIONS.md` and are not decided here:

- I Do Grow capacity, binding authority, and Quote legal effect;
- reservation, availability, allocation, release, and `sold` rules;
- hemp quality measurements, thresholds, grading, timing, and progression gates;
- Lot/Batch semantics and split/combine behavior;
- full roles, permissions, field visibility, approval thresholds, and separation of duties;
- Contract authority, title/risk, claims, delivery, and Shipment-release rules;
- payment and Settlement ownership, evidence, changes, and closure;
- DPP completeness, correction, sharing, publication, and visibility;
- data-protection, retention, controller/processor, residency, and correction/deletion obligations;
- WhatsApp confirmation/handover rules and accessibility target.

## 24. Conventions Requiring Formal Approval

These conventions fit DEC-001 and do not require a new Decision Log entry because they preserve the approved versioned REST boundary, NestJS modular monolith, PostgreSQL system of record, backend-enforced controls, controlled Platform Agent services, auditability, and human approval for high-risk or binding actions.

The document should receive human project approval as an engineering foundation before implementation. A new or superseding formal decision would be required if later work materially changes DEC-001—for example, direct frontend database access, replacing REST as the primary boundary, starting with microservices, permitting direct Platform Agent persistence, or selecting a technology/vendor currently marked TBD.

A separate approved product, operating, security, data, or architecture specification may be required when unresolved business transitions, authority, tenancy/visibility policy, physical integrity rules, retention policy, or provider/tool choices are resolved. This document does not make those approvals.
