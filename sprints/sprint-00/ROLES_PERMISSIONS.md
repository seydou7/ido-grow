# I Do Grow — Roles & Permissions

**Status legend**

- **SOURCE_CONFIRMED:** Stated by a primary client source or carried from it without resolving an ambiguity.
- **SAFE_FOUNDATION:** A conservative authorization boundary needed to protect source requirements; recommended for human approval, not an invented business rule.
- **OPEN:** Unresolved, ambiguous, or dependent on client, business, domain, legal, privacy, or security approval.
- **ALLOW:** Permitted only within every applicable organisation, resource, field, state, and approval boundary.
- **OWN_ORG:** Permitted only for the actor's authorised organisation and its resources.
- **ASSIGNED:** Permitted only for an explicit task, Inspection, Shipment, transaction, or other approved assignment.
- **INTERNAL:** Limited to an authorised I Do Grow purpose and scope; it never means unrestricted platform access.
- **APPROVAL_REQUIRED:** The action needs the applicable approved reviewer/final authority; the exact owner may still be **OPEN**.
- **DENY_DEFAULT:** No permission exists unless a separate, explicit authorization rule applies.

Primary authority comes from `docs/client/I Do Grow Product and Development Manual.docx` and `docs/client/I Do Grow description.pdf`. Project memory, DEC-001, and Sprint 00 documents are subordinate synthesis. This document does not answer the questions in `CLIENT_CLARIFICATIONS.md`.

## 1. Purpose and Status

This is the initial role, capability, visibility, approval, and represented-party foundation for **Sprint 00 — Discovery and Foundation**. It is a governance and access-control model, not application implementation, an authentication design, a legal mandate, a contract, or proof that any named person holds authority.

The model:

- defines seven source-supported human business roles;
- separates human roles from System responsibilities and future Platform Agents;
- establishes least-privilege, organisation-aware, resource-aware, assignment-aware, and field-aware authorization principles;
- preserves unresolved approval, mandate, legal-effect, visibility, and segregation-of-duties questions as **OPEN**; and
- identifies the minimum safe foundation for a future authorised implementation.

The authentication provider, credential/session mechanics, authorization library, physical tenant model, and all other DEC-001 technology choices marked TBD remain TBD. No provider or library is selected.

## 2. Role Catalogue

The seven human roles below are **SOURCE_CONFIRMED**. A role describes a responsibility set; it does not by itself prove organisation membership, assignment, mandate, legal capacity, or approval authority.

### Supplier

- **Purpose:** Offer and support the supply of products and traceable Lots.
- **Organisation context:** Farmer, cooperative, raw-material producer, fermentation plant, cultivated-production facility, or another authorised Supplier organisation.
- **Primary responsibilities:** Maintain authorised organisation information; create/manage Listings and availability; upload documents/evidence; respond to requests; view relevant offers and Shipment/payment status; participate in transaction acceptance/rejection workflows.
- **Typical data scope:** `OWN_ORG`, own Listings/Lots/declarations, and explicitly shared or transaction-relevant records.
- **Restricted actions:** No access to another Supplier's private data, internal I Do Grow margins/risk reasoning, final quality approval, or silent changes to verified Inspector results.
- **OPEN authority:** Legal effect of acceptance/rejection, reservation control, binding commitments, verified-data correction, and commercial remedies.

### Buyer

- **Purpose:** Search for products, express demand, compare supply, and participate in purchasing workflows.
- **Organisation context:** Processor, factory, wholesaler, retailer, brand, or another authorised Buyer organisation.
- **Primary responsibilities:** Search the Marketplace; create Buy Orders/RFQs; review Matches; review/counter/reject/accept Quotes; track Contracts and Shipments; access authorised documents and DPP information.
- **Typical data scope:** `OWN_ORG`, authorised Marketplace projections, and transaction/counterparty projections.
- **Restricted actions:** No access to another Buyer's private requirements, internal margins/risk deliberations, Supplier bank data, or quality evidence outside approved sharing.
- **OPEN authority:** Legal effect of `Accept Quote`, purchase authority, Contract signature, delivery acceptance, dispute authority, and reservation effect.

### I Do Grow Trader

- **Purpose:** Assist Suppliers and Buyers, manage relationships, match supply and demand, coordinate negotiation, prepare transactions, and oversee trading operations.
- **Organisation context:** Internal I Do Grow role. The capacity used in each action must still be explicit.
- **Primary responsibilities:** Assisted onboarding; create Listings or Buy Orders on behalf of parties; review Listings and Matches; negotiate and prepare Quotes/transactions; coordinate logistics; monitor trading; review Platform Agent recommendations.
- **Typical data scope:** `INTERNAL` and purpose-scoped operational information, plus explicitly represented-party and transaction-scoped records.
- **Restricted actions:** No implied authority to bind a Supplier, Buyer, or I Do Grow; no unrestricted bank, security, private-document, or all-field access; no final quality, Contract, reservation, Shipment-release, or Settlement authority merely because the user is a Trader.
- **OPEN authority:** Mandate basis and lifecycle, I Do Grow capacity, Quote issuance/acceptance, reservation, Contract signature, claims/credits, payment/Settlement, DPP publication, and other binding decisions.

### Quality Inspector

- **Purpose:** Perform and record authorised Lot-linked quality work.
- **Organisation context:** An internal or external Inspector working through an authorised Quality organisation or explicit Inspection assignment.
- **Primary responsibilities:** Manage assigned Inspection tasks; record Measurements and Observations; upload findings and evidence; record Non-Conformities; submit Inspection results; approve/reject a Grade and create an inspection certificate/report where authorised.
- **Typical data scope:** `ASSIGNED` Inspection, Lot, pinned Template/instructions, necessary contacts/context, and authorised evidence.
- **Restricted actions:** No automatic access to internal margins, payment data, unrelated transactions, other Lots/Inspections, Supplier/Buyer private records, security data, or commercial remedies.
- **OPEN authority:** Exact final-grade approver, independence/second approval, method and Grade rules, certificate issuer/signatory/validity, correction authority, and commercial effect.

### Logistics Partner

- **Purpose:** Quote and carry out authorised transaction-specific freight work.
- **Organisation context:** External Logistics organisation or assigned carrier/service provider.
- **Primary responsibilities:** Receive Shipment requirements; submit its own Freight Quote; acknowledge authorised booking; update pickup/tracking/delivery events; upload shipping documents/evidence; report customs issues, delay, shortage, or damage.
- **Typical data scope:** `ASSIGNED` Shipment/transaction and the minimum fields needed for the service.
- **Restricted actions:** No competing carrier Quotes, internal margins, unrelated Trade data, unnecessary payment data, or quality detail beyond approved handling/release needs.
- **OPEN authority:** Who makes a binding booking, authorises Shipment release, accepts delivery, and resolves exceptions.

### Compliance Manager

- **Purpose:** Review documentation, certification information, regulatory data, audit evidence, and DPP completeness within authorised scope.
- **Organisation context:** Internal I Do Grow role unless a later approved operating model establishes an external compliance organisation.
- **Primary responsibilities:** Verify Supplier documentation; review certifications; manage DPP completeness; approve regulatory data within assigned authority; review relevant audit history.
- **Typical data scope:** Purpose-, transaction-, and field-scoped `INTERNAL` or restricted compliance records.
- **Restricted actions:** No automatic final Grade, certificate issuance, DPP publication, legal/regulatory conclusion, commercial remedy, Contract signature, or verified-evidence rewrite.
- **OPEN authority:** Regulatory-data scope, DPP publication/sharing, compliance decision boundaries, and relationship to the source term “quality manager.”

### Administrator

- **Purpose:** Operate platform administration, access configuration, and system governance.
- **Organisation context:** Internal I Do Grow administrative role.
- **Primary responsibilities:** Manage users, organisations, memberships and role assignments where authorised; configure taxonomies/workflow rules/system settings; review platform activity; support security/system administration.
- **Typical data scope:** Administrative and system metadata necessary for the authorised task, with restricted business-record access.
- **Restricted actions:** Administrator is not automatically a commercial, quality, Contract, payment, DPP, regulatory, or verified-evidence approver.
- **OPEN authority:** Sensitive-role assignment owner, second approval, emergency/support access, periodic access review, and exact configuration-change approvals.

### System and future Platform Agents

The **System** is a non-human enforcement and audit actor. A **Platform Agent** is a future bounded machine actor. Neither is a human business role, an organisation member, or an independent source of legal or commercial authority.

## 3. Identity, Organisation and Role Separation

**SAFE_FOUNDATION:**

- Identity is not a Role.
- A User is not an Organisation.
- Organisation membership is not automatic permission for every action.
- A person may potentially hold more than one authorised role or membership.
- Every sensitive action uses an explicit active organisation and capacity.
- Permissions are resolved and enforced server-side from verified identity, active membership, role/capability, resource relationship, field, state, represented-party context, and approval state.
- A frontend label, route, hidden control, submitted organisation ID, owner ID, or role claim never grants authority.
- Multi-role privileges must not be silently merged across organisations or capacities.
- Tenant isolation is mandatory for reads, writes, lists, search, counts, exports, files, caches, nested resources, controlled tools, and audit access.

The authentication provider and identity/session mechanics remain **TBD**. Exact organisation-context transport and membership/cardinality rules remain **OPEN**.

## 4. Organisation Scope

### Supplier organisation

Access is primarily `OWN_ORG`, supplemented only by approved Marketplace visibility, transaction relationships, assignment, or explicit sharing. One Supplier must not see another Supplier's private records.

### Buyer organisation

Access is primarily `OWN_ORG`, approved Marketplace projections, and relevant transaction/counterparty records. Buyer-private requirements must not become visible outside approved RFQ/transaction sharing.

### I Do Grow internal organisation

Internal roles receive only the purpose and field scope needed for their responsibilities. “Internal” and the Trader's source-supported ability to view platform-wide trading information do not create blanket all-record or all-field access.

### Quality organisation or external Inspector

Access is `ASSIGNED` to an Inspection/Lot and necessary evidence/context. External Inspector organisation membership does not grant access to unrelated Inspections.

### Logistics organisation

Access is `ASSIGNED` to a Shipment/transaction and the minimum operational fields. Assignment does not reveal competing Quotes or unrelated commercial records.

Cross-organisation access requires an approved basis: ownership, Marketplace visibility, transaction relationship, assignment, explicit sharing, or specific least-privilege internal purpose. This model does not select row-level security, schema-per-tenant, separate databases, or another physical tenant design.

## 5. Supplier Permissions

### Source-supported and safe-foundation capabilities

- Manage own organisation/profile only where the membership includes that capability.
- Create, update, and submit own Listing information and availability.
- Provide Lot data, declarations, photographs, documents, and known quality evidence.
- Correct own unverified data while preserving provenance and history.
- View own Listings and authorised publication/review states.
- View relevant offers, Quotes, Contracts, Shipments, payment status, messages, and DPP projections.
- Communicate with the Trader and respond to information/evidence requests.
- Provide inspection access/evidence and request traceable correction or dispute review.

### Deny by default

- Approve its own final Inspection Grade.
- Publish internal quality/risk assessments.
- Access another Supplier's private data.
- View internal I Do Grow margins or internal approval comments.
- Silently edit or delete verified Inspector results.
- Change payment instructions or verified evidence without the approved high-risk process.

Supplier authority to publish, reserve/release, accept binding terms, approve remedies, or change verified information remains **OPEN**.

## 6. Buyer Permissions

### Source-supported and safe-foundation capabilities

- Manage own organisation/profile where authorised.
- Search and compare authorised Marketplace information.
- Create and manage own Buy Orders, RFQs, and applicable requirements.
- Review relevant Matches without treating them as binding.
- Review, counter, reject, or select `Accept Quote` subject to the approved legal effect and authority.
- View relevant Quote versions, Contracts, Shipments, documents, and authorised DPP information.
- Confirm delivery or raise a dispute only where the approved transaction rule grants that capability.

### Deny by default

- Access another Buyer's private requirements or transactions.
- View Supplier bank information, internal I Do Grow margins/risk reasoning, or unrelated detailed quality evidence.
- Change Supplier/Inspector evidence or apply a commercial quality remedy.
- Treat a Match or frontend action as proof of reservation or commitment.

The sources name Quote acceptance and purchasing workflows but do not determine the legal effect of `Accept Quote`, the final approver, Contract signatory, reservation effect, delivery authority, or dispute consequence. All remain **OPEN**.

## 7. I Do Grow Trader Permissions

The Trader's capacity must be selected and recorded for every sensitive or represented-party action. One action uses one explicit capacity.

### Trader acting for Supplier

May perform assisted onboarding; draft/correct unverified Supplier information; create or update Listing/Lot drafts; request missing evidence; and coordinate Supplier communications within an approved mandate. This does not prove authority to publish, reserve inventory, accept a binding offer, sign a Contract, or approve a commercial remedy.

### Trader acting for Buyer

May draft Buy Orders/RFQs, structure requirements, create records on behalf of the Buyer, coordinate negotiation, and present Quotes/Matches within an approved mandate. This does not prove authority to commit the Buyer or sign for it.

### Trader acting as I Do Grow

May review Listings/Matches, prepare Quotes, coordinate negotiation and transactions, select a logistics provider as source-supported, administer authorised Settlement records, monitor operational risk/tasks, and review Platform Agent recommendations. Whether I Do Grow acts as principal, buyer/reseller, Supplier agent, Buyer agent, broker, facilitator, cooperative, or another capacity is **OPEN** by transaction.

### Trader acting as reviewer/approver

Source-supported review gates include Supplier readiness before a first binding transaction, Match approval, review of Platform Agent recommendations, and Listing publication by a Trader or the undefined source term “quality manager.” These gates do not grant other approval powers.

### Represented-party capture

Every assisted action conceptually records:

- authenticated actor identity;
- actual role and acting organisation;
- represented party and transaction capacity;
- mandate/authority basis, status, scope, and evidence where applicable;
- exact action and resource/version;
- confirmation/approval owner and outcome;
- timestamp;
- source/channel;
- reason where appropriate; and
- whether the action was non-binding, binding, or still **OPEN**.

Trader binding authority, mandate issuance/expiry/revocation, Quote issuance/acceptance, reservation, Contract signature, carrier booking, Shipment release, claims/credits, payment instructions, Settlement closure, and DPP publication remain **OPEN**.

## 8. Quality Inspector Permissions

Inspector access is `ASSIGNED` and Lot/Inspection-centric.

### May do within authorised assignment

- View the assigned Lot, Inspection, pinned Template/instructions, and necessary site/contact context.
- Record structured Measurements, Observations, method/equipment/sample context where applicable, and source/evidence.
- Upload photographs, findings, reports, and other authorised evidence.
- Record Non-Conformities.
- Submit an exact Inspection evidence/result version.
- Human-verify or approve/reject a final Grade only if the assignment and approved authority permit it.
- Prepare/create an inspection report or certificate where applicable and authorised.

### Must not automatically do or see

- Internal margins, Quote/Contract deliberations, payment/bank data, unrelated transactions, other Lots/Inspections, Supplier/Buyer private records, internal risk reasoning, security audit data, or private DPP fields.
- Treat submission as final Grade approval, Listing publication, Buyer acceptance, Shipment release, or a commercial remedy.
- Invent a Grade, threshold, method, certificate requirement, certificate validity, or commercial consequence.
- Silently overwrite verified evidence.

The source supports grade approval/rejection and certificate creation as role capabilities. The exact authorised person, independence, second approval, accepted methods/rules, issuer/signatory, validity, sharing, and effect remain **OPEN**.

## 9. Logistics Partner Permissions

Logistics access is transaction/Shipment-scoped and `ASSIGNED`.

### May do within authorised assignment

- Receive the minimum Shipment requirements.
- Submit and manage its own Freight Quote.
- Acknowledge an authorised booking or assignment.
- Record pickup, tracking, custody, customs, delay, damage, shortage, and delivery events as applicable.
- Upload relevant shipping documents and delivery evidence.

### Deny by default

- View competing carrier Quotes.
- View internal margins or unrelated Trade/Contract information.
- View unnecessary payment/bank data.
- View detailed quality evidence beyond approved handling or release requirements.
- Change commercial terms, reserve inventory, release Shipment, accept delivery for another party, or resolve claims without explicit authority.

“Confirm booking” means acknowledging an authorised instruction in this foundation; it does not decide who legally places the binding booking. Booking and Shipment-release authority remain **OPEN**.

## 10. Compliance Manager Permissions

### Source-supported responsibilities

- Verify Supplier documentation.
- Review certifications.
- Manage DPP completeness.
- Approve regulatory data within an approved workflow and field scope.
- Review authorised audit history.

### Boundaries

- Document verification is not automatically quality-result verification.
- Certification review is not certificate issuance, legal validation, or a decision that a certificate is mandatory.
- Regulatory-data approval does not create general regulatory or legal authority.
- DPP completeness management does not grant DPP publication/sharing, final Grade approval, verified-evidence rewriting, or a commercial remedy.
- Compliance access is purpose-, transaction-, and field-scoped, not automatically platform-wide.
- Compliance Manager and Administrator remain separate.

Exact regulatory-data scope, DPP publication owner, compliance decision boundaries, and any mapping from the source term “quality manager” remain **OPEN**.

## 11. Administrator Permissions

### Administrative scope

- Manage users, organisations, memberships, and role assignments where separately authorised.
- Configure taxonomies, workflow rules, and system-wide settings where authorised.
- Review platform activity, security/support information, and configuration history within purpose scope.
- Deactivate access and support access review under approved governance.

### Explicit business-authority boundary

**Administrator does not equal automatic business authority.** The role must not automatically:

- approve commercial terms or a Match;
- issue/accept a binding Quote;
- reserve/release inventory;
- approve quality or issue a certificate;
- sign a Contract;
- book/release a Shipment;
- change payment instructions, resolve claims, or close Settlement;
- publish a DPP; or
- change verified trade evidence.

Those actions require a separately assigned authorised business role/capacity and applicable approval. Administrative-role creation itself requires stronger controls; exact governance remains **OPEN**.

## 12. System Permissions / Responsibilities

The System is a non-human enforcement and audit actor. It should:

- resolve verified identity, organisation, membership, role/capacity, represented party, assignment, and resource context;
- enforce function-, object-, property-, action-, and field-level authorization;
- enforce approved transitions, validation, invariants, and prerequisites;
- produce authorised field projections and conceal sensitive resource existence where required;
- enforce concurrency, idempotency where applicable, and approval binding to an exact resource/proposal version;
- preserve provenance, correction/supersession links, and critical audit history; and
- reject client-supplied actor, owner, role, approver, authoritative status, or audit identity.

The System must not infer an undefined mandate, approver, legal effect, Grade rule, commercial consequence, or business authority. Automated state progression is not business authority.

## 13. Platform Agent Permissions

Future Platform Agents are machine actors operating only through controlled backend tools/services. This document does not create or implement them.

### Required controls

- Narrow allowlisted capabilities and tools.
- Minimum necessary tenant-, transaction-, and field-scoped context.
- Structured validated inputs and outputs.
- No direct database or persistence-repository mutation.
- No authority from model output alone.
- Effective authority is the intersection of the initiating actor, active organisation/represented party, agent allowlist, controlled tool, resource policy, and current approval.
- Human approval for high-risk or binding proposals, bound to the exact proposal and resource version.
- Provenance, confidence/evidence where applicable, execution records, correction history, and audit.
- Restricted visibility and no self-expansion of authority.

AI may draft, extract, classify preliminarily, explain, flag, and recommend. It must not independently publish a Listing, reserve/release inventory, issue or accept a binding offer, approve final quality, sign a Contract, change verified evidence, create/change payment instructions, release funds, or publish a DPP.

## 14. Permission Model Principles

The conceptual model uses:

- an RBAC baseline;
- verified organisation membership and explicit active organisation/capacity;
- resource ownership and transaction relationship;
- assignment scope;
- represented-party mandate context;
- explicit action and approval authority;
- resource-state and exact-version checks;
- field-level visibility/projections; and
- deny-by-default server enforcement.

Role-only checks are insufficient because two users with the same role can belong to different organisations, have different assignments, act for different parties, see different fields, or possess different approval authority. RBAC alone would create tenant-breakout, object/function authorization, confused-deputy, and excessive-privilege risks.

The identity/access domain should resolve membership and baseline capabilities. Each business domain should own its resource/action rules and authorised projections. No authorization library or policy engine is selected.

## 15. Capability Catalogue

Capabilities should use precise actions rather than a generic `manage` permission.

### Organisation

- View own/assigned organisation.
- Create/update profile.
- Verify membership or organisation readiness.
- Invite/deactivate members.
- Assign/revoke roles.

### Supplier / Buyer

- View/update own participant profile.
- Submit onboarding information/evidence.
- Review readiness.
- Create/manage represented-party draft.

### Listings

- View authorised Listing projection.
- Create/update/submit Listing.
- Request correction.
- Review/publish/suspend Listing.

### Lots

- View authorised Lot projection.
- Create/update unverified Lot facts.
- Submit/correct declarations.
- Reserve/release quantity.

### Buy Orders

- View/create/update/submit Buy Order or RFQ.
- Review shared demand requirements.
- Create represented-party draft.

### Matches

- View relevant recommendation/explanation.
- Prepare/review/approve Match.
- Trigger deterministic recalculation.

### Quotes

- View/create/update/version Quote draft.
- Review/issue/counter/withdraw/accept/reject Quote.

### Quality / Inspections

- View assigned Inspection context.
- Record/submit Measurements, Observations, evidence, and Non-Conformity.
- Human-verify an exact result.
- Approve/reject final Grade.
- Prepare/issue/revoke inspection report or certificate.
- Correct/supersede verified evidence.

### Contracts

- View/generate draft/review/approve/sign Contract.
- Compare versions and preserve signature/approval evidence.

### Logistics / Shipments

- View Shipment requirements.
- Submit/select Freight Quote.
- Book/acknowledge carrier.
- Update events/evidence.
- Release Shipment/confirm delivery.

### Settlement

- View relevant invoices/payment status.
- Record/verify payment evidence.
- Change payment instruction.
- Raise/resolve claim or credit.
- Close Settlement.

### DPP

- View authorised projection.
- Contribute event/evidence.
- Manage completeness.
- Correct/supersede source-linked data.
- Share/publish DPP.

### Documents

- Upload/link/view/verify/share/export document.
- Restrict/revoke access.

### Administration

- Manage membership/role/configuration/taxonomy/workflow/system setting.
- Perform security/support administration.

### Audit

- View/export restricted audit history.
- Record correction/supersession reference.

### Platform Agent proposals

- Request/generate/view/review/approve/reject/execute an allowlisted proposal.

Exact implementation permission strings are deferred.

## 16. Capability Matrix

The matrix is a foundation summary. Every cell remains subject to organisation, resource, field, state, represented-party, and approval rules.

| Capability | Supplier | Buyer | Trader | Inspector | Logistics Partner | Compliance Manager | Administrator |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Own organisation/profile | `OWN_ORG` | `OWN_ORG` | `INTERNAL` | `OWN_ORG` / `ASSIGNED` | `OWN_ORG` / `ASSIGNED` | `INTERNAL` | `APPROVAL_REQUIRED` admin scope |
| Membership/role assignment | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `APPROVAL_REQUIRED`, owner **OPEN** |
| Listing create/update/submit | `OWN_ORG` | `DENY_DEFAULT` | represented-party context | `DENY_DEFAULT` | `DENY_DEFAULT` | review only if assigned | `DENY_DEFAULT` |
| Listing publication | `DENY_DEFAULT` | `DENY_DEFAULT` | `APPROVAL_REQUIRED`; source gate | `OPEN` only if “quality manager” mapping approved | `DENY_DEFAULT` | `OPEN` only if role mapping approved | `DENY_DEFAULT` |
| Marketplace/Listing view | own plus authorised public | authorised public/transaction | `INTERNAL` purpose scope | `ASSIGNED` subset | `ASSIGNED` subset | `INTERNAL` purpose scope | admin need only |
| Lot declaration/evidence | `OWN_ORG` | `DENY_DEFAULT` | represented-party context | `ASSIGNED` findings only | handling evidence only | review only | `DENY_DEFAULT` |
| Buy Order/RFQ | shared view only | `OWN_ORG` | represented-party context | `DENY_DEFAULT` | `DENY_DEFAULT` | review only if assigned | `DENY_DEFAULT` |
| Match view | explicitly shared | transaction-relevant | `INTERNAL` | `DENY_DEFAULT` | `DENY_DEFAULT` | review if assigned | `DENY_DEFAULT` |
| Match approval | `DENY_DEFAULT` | `DENY_DEFAULT` | `APPROVAL_REQUIRED`; source-supported | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` |
| Quote draft/create | source-supported / transaction | source-supported / transaction | source-supported / represented or internal | `DENY_DEFAULT` | `DENY_DEFAULT` | review if assigned | `DENY_DEFAULT` |
| Quote issue/counter/accept | `OPEN` / `APPROVAL_REQUIRED` | `OPEN` / `APPROVAL_REQUIRED` | `OPEN` / `APPROVAL_REQUIRED` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` |
| Reserve/release inventory | `OPEN` | `OPEN` | `OPEN` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` |
| Inspection findings/submission | declaration only | `DENY_DEFAULT` | `DENY_DEFAULT` unless separately assigned | `ASSIGNED` | `DENY_DEFAULT` | review only | `DENY_DEFAULT` |
| Human-verify result/final Grade | `DENY_DEFAULT` | `DENY_DEFAULT` | `OPEN` | `ASSIGNED` + `APPROVAL_REQUIRED`; authority **OPEN** | `DENY_DEFAULT` | approved document/regulatory scope only | `DENY_DEFAULT` |
| Inspection report/certificate | view authorised | view authorised | view/review authorised | `ASSIGNED`; issuance effect **OPEN** | handling subset only | review authorised | `DENY_DEFAULT` |
| Contract view/review | transaction | transaction | `INTERNAL` / represented | `DENY_DEFAULT` | minimum assigned subset | review if assigned | admin need only |
| Contract approval/signature | `OPEN` | `OPEN` | `OPEN` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` | `DENY_DEFAULT` |
| Freight Quote/provider selection | view own transaction | view own transaction | select provider source-supported | `DENY_DEFAULT` | submit own Quote | `DENY_DEFAULT` | `DENY_DEFAULT` |
| Shipment operational update | view relevant | view relevant | coordinate/monitor | `DENY_DEFAULT` | `ASSIGNED` | review if assigned | admin need only |
| Booking/release/delivery acceptance | `OPEN` | `OPEN` | `OPEN` | `DENY_DEFAULT` | acknowledge only; authority `OPEN` | `DENY_DEFAULT` | `DENY_DEFAULT` |
| Settlement status view | relevant own transaction | relevant own transaction | `INTERNAL` authorised | `DENY_DEFAULT` | minimum if needed | restricted authorised | admin need only |
| Payment instruction/verification/closure | `OPEN` | `OPEN` | `OPEN` | `DENY_DEFAULT` | `DENY_DEFAULT` | `OPEN` only if assigned | `DENY_DEFAULT` |
| DPP completeness | contribute/view authorised | view authorised | oversee if authorised | contribute assigned evidence | contribute custody events | `INTERNAL`; source-supported | configuration only |
| DPP share/publication | `OPEN` | `OPEN` | `OPEN` | `DENY_DEFAULT` | `DENY_DEFAULT` | `OPEN`; completeness is not publication | `DENY_DEFAULT` |
| Verified-evidence correction | request versioned correction | request/dispute | `APPROVAL_REQUIRED` | `APPROVAL_REQUIRED` | `DENY_DEFAULT` | `APPROVAL_REQUIRED` within scope | `DENY_DEFAULT` |
| Platform Agent proposal review | where underlying action permits | where underlying action permits | source-supported within scope | quality proposal within assignment | logistics proposal within assignment | compliance proposal within scope | system/admin proposal only |

## 17. Approval Matrix

`SOURCE_CONFIRMED` means the source confirms a gate or role family, not necessarily the named final approver. Where authority is missing, the final approver remains **OPEN**.

| High-risk action | Initiator | Reviewer | Final approver | Status |
| --- | --- | --- | --- | --- |
| Supplier readiness | Supplier or Trader | Authorised documentation/compliance reviewer as applicable | Trader before first binding transaction; named person/criteria **OPEN** | Gate `SOURCE_CONFIRMED`; operating authority `OPEN` |
| Listing publication | Supplier or Trader submits | Trader or source term “quality manager” | Exact mapped role/person **OPEN** | Gate `SOURCE_CONFIRMED`; role mapping `OPEN` |
| Match approval | System/Trader recommendation | Trader | Authorised Trader; no binding/reservation effect | `SOURCE_CONFIRMED` non-binding gate |
| Quote issuance | Supplier, Buyer, Trader, or future controlled proposal may prepare | Internal/commercial review | **OPEN** | Creation `SOURCE_CONFIRMED`; issuance authority `OPEN` |
| Quote acceptance | Authorised party action | Applicable commercial/legal review | **OPEN** for each party and legal effect | Interaction `SOURCE_CONFIRMED`; effect `OPEN` |
| Inventory reservation/release | **OPEN** | **OPEN** | **OPEN** | `OPEN` |
| Final quality Grade | Assigned Inspector submits/reviews | Authorised quality reviewer | Exact eligible human **OPEN** | Human gate and Inspector capability `SOURCE_CONFIRMED`; assignment authority `OPEN` |
| Contract approval/signature | Authorised transaction party | Human Contract review | Named signatories **OPEN** | Human review/signature `SOURCE_CONFIRMED`; authority `OPEN` |
| Carrier booking | Trader/party/Logistics acknowledgement as approved | **OPEN** | **OPEN** | `OPEN` |
| Shipment release | Assigned operational actor | Quality/commercial/logistics review as approved | **OPEN** | `OPEN` |
| Delivery acceptance | Logistics evidence or receiving party | Transaction/claims review as applicable | **OPEN** | Operational confirmation source-supported; legal effect `OPEN` |
| Dispute/claim resolution | Transaction party | Authorised operations/commercial review | **OPEN** | `OPEN` |
| Payment/Settlement closure | Authorised finance/operations actor | Evidence and instruction review | **OPEN** | `OPEN` |
| DPP publication/sharing | Supplier/Trader/Compliance proposal as authorised | Compliance completeness/privacy review | **OPEN** | Completeness role source-supported; publication `OPEN` |
| Sensitive role assignment | Administrator/authorised owner request | Independent security/organisation review where approved | **OPEN** | Stronger control `SAFE_FOUNDATION`; owner `OPEN` |
| High-risk Platform Agent proposal | Authorised user or System event | Human authorised for underlying action | Same authority required by underlying action | Human gate `SOURCE_CONFIRMED`; exact approver `OPEN` |

No row authorises implementation or resolves the legal/commercial effect of the action.

## 18. Field-Level Visibility

### Visibility classes

1. **Public:** Only an explicitly approved Marketplace or DPP projection. No personal or confidential data is public by default.
2. **Counterparty-visible:** Transaction/explicit-sharing fields needed by the authorised counterparty.
3. **Organisation-private:** Own-organisation contacts, drafts, members, evidence, and records, still limited by role.
4. **Internal I Do Grow:** Assigned operational information such as internal review, completeness/risk, margin, or approval commentary; not automatically visible to every internal role.
5. **Restricted compliance/security:** Bank/payment evidence, identity/verification material, sensitive role administration, audit/security data, precise Inspector/location/signature data, and private documents.

### Sensitive field boundaries

| Field category | Minimum boundary |
| --- | --- |
| Internal margins | Never external. Exact distinction from externally itemised I Do Grow fees/commission remains `OPEN`. |
| Supplier risk/completeness | Internal/restricted unless an approved projection exists. |
| Buyer commercial requirements | Buyer-private except approved Marketplace/RFQ/transaction sharing. |
| Payment/bank evidence | Restricted authorised staff only; status may be shared without raw evidence. |
| Private contact details | Purpose- and transaction-scoped; minimise external exposure. |
| Quality evidence | Lot/Inspection authority; detailed Buyer sharing follows approved permission. |
| Inspector notes | Assignment/review scoped; not automatically counterparty-visible. |
| Internal approval comments | Internal/restricted; do not expose policy reasoning unnecessarily. |
| DPP data | Separate public, counterparty, restricted evidence/compliance, and confidential commercial projections. |
| Audit/security data | Restricted and monitored; audit access/export is itself a sensitive capability. |

Exact fields remain **OPEN** under A7.2 and A10. Frontend code must receive only an authorised server-produced projection; it must not receive sensitive fields and merely hide them.

## 19. Represented-Party Actions

Every represented-party action must state:

- who actually performed it;
- the active role and acting organisation;
- for whom it was performed;
- the capacity and authority/mandate basis;
- the exact action and resource/version;
- whether confirmation was required and obtained;
- the confirmation/approval owner;
- whether the action was non-binding, binding, or unresolved;
- source/channel, time, and reason where applicable; and
- correction, revocation, expiry, or supersession linkage.

Use represented-party context, not account impersonation, shared credentials, session masquerade, or actor replacement. A submitted organisation identifier, role label, email, message, or WhatsApp exchange is not proof of authority.

WhatsApp-originated information is provenance-bearing input. It must not silently become platform authorization or a binding confirmation. Exact mandate issuance, evidence, scope, validity, expiry, revocation, and confirmation workflow remain **OPEN**.

## 20. Authentication vs Authorization

Authentication answers: **“Who are you?”**

Authorization answers: **“What may you do here, in this organisation/capacity, to this resource and field, in this state, with which approval?”**

Authentication does not prove organisation membership, represented-party mandate, ownership, assignment, transaction relationship, or approval authority. Frontend navigation, route guards, hidden buttons, and disabled controls are UX only.

All sensitive authorization is re-evaluated and enforced in the backend at function, object, property, action, and field level. The authentication provider, MFA/step-up mechanics, session/token design, and authorization library remain TBD.

## 21. High-Risk Actions

High-risk categories include:

- role, permission, membership, and administrative-account changes;
- bank-detail or payment-instruction changes;
- commercial commitments and binding Quote actions;
- inventory reservation/release and sold-state effects;
- final quality approval and inspection certificate/report issuance;
- Contract approval/signature;
- carrier booking and Shipment release;
- delivery acceptance, claims, credits, and Settlement closure;
- DPP publication/sharing;
- verified-evidence changes;
- sensitive export and audit/security administration; and
- execution of a high-risk Platform Agent proposal.

Stronger controls conceptually include explicit authority, exact-version confirmation, reauthentication/step-up as applicable, independent review where approved, concurrency protection, notification where appropriate, reason capture, and immutable/correction-linked audit.

The Manual requires MFA for internal users and additional controls for critical actions, including administrative-role creation, bank/payment changes, binding Contracts, sensitive exports, and verified-quality changes. Provider, method, threshold, “high-value” definition, and exact second-approval rules remain **OPEN/TBD**.

## 22. Segregation of Duties

The model must distinguish capabilities to request, prepare, submit, review, approve, execute, and correct. One capability must not silently grant the next.

Potential separations include:

- requester/preparer versus final approver;
- Trader preparing a Quote versus commercial issuance/approval;
- Inspector capturing/submitting evidence versus verifying/final-grade approval;
- quality decision versus commercial remedy;
- Compliance completeness review versus DPP publication;
- Administrator assigning access versus business approval; and
- Platform Agent proposal versus human approval/execution.

The system should support maker/reviewer/final-approver separation and record the capacity actually used. It must not assume that one person may control the full lifecycle. It also must not invent a universal two-person rule or staffing constraint. Incompatible role combinations, thresholds, same-person exceptions, and second approvals remain **OPEN** for the client's operating model.

## 23. Data Protection Alignment

This foundation aligns with `DATA_PROTECTION_ASSESSMENT.md` through:

- deny-by-default and least privilege;
- field minimisation and explicit authorised projections;
- transaction/assignment-scoped external access;
- explicit purpose limits for internal access;
- no unnecessary cross-tenant exposure;
- represented-party context and accountable provenance;
- restricted audit/security access;
- separate public, counterparty, organisation-private, internal, and restricted views; and
- minimum-context, tenant-scoped future Platform Agent access.

No controller/processor role, lawful basis, retention period, residence/transfer rule, DPP public field, or privacy compliance conclusion is selected. Professional privacy/legal review remains required where identified in the assessment.

## 24. Audit Requirements

For sensitive actions, record where applicable:

- actor identifier and actor type;
- actual role/capacity and acting organisation;
- represented party and mandate/authority reference;
- permission/capability used;
- resource, assignment, and exact version;
- action, transition, and outcome;
- timestamp;
- source/channel and request/correlation reference;
- before/after values or a minimised change summary;
- approval chain, approver capacity, and reviewed version;
- reason;
- correction/supersession relationship; and
- Platform Agent identity/configuration, proposal, evidence, tool, approval, and execution linkage.

Backend context supplies authoritative actor, organisation, time, and approval identity. Critical audit creation should be atomic with the action where both form one transactional outcome. Corrections append linked history rather than rewrite prior evidence.

Audit access/export is restricted and monitored. Operational/security logs remain separate and redacted. Do not log unnecessary evidence bodies, bank data, secrets, private messages, signatures, precise locations, or confidential margins. Retention, immutability mechanism, and legal-hold/rights handling remain **OPEN / LEGAL REVIEW REQUIRED**.

## 25. Role Assignment Governance

**SAFE_FOUNDATION:**

- Role assignment, change, and revocation are themselves authorised actions.
- Organisation membership must be verified before an organisation-scoped role is usable.
- Sensitive/internal/admin roles require stronger controls.
- Grants, changes, denials, revocations, and deactivation are audited.
- Deactivated users lose ordinary access promptly.
- Assignments may need scope, effective date, expiry, and revocation reason.
- Access should be periodically reviewable.
- Emergency/support access, if later allowed, must be explicit, time-limited, reasoned, monitored, and audited.

The governance owner, sensitive-role list beyond administrative roles, invitation/membership verifier, second approval, review cadence, permitted role combinations, and emergency-access policy remain **OPEN**. Administrator capability to manage permissions does not make the Administrator the unreviewed final authority for its own privileges.

## 26. Multi-Role Users

One identity may potentially hold multiple authorised memberships and roles. Conceptually:

- require an explicit active organisation and capacity;
- resolve only the privileges applicable to that context;
- never silently union privileges across organisations or represented parties;
- record the actual role/capacity used for every sensitive action;
- make context switching explicit and revalidate routes, data, caches, drafts, approvals, and stale versions;
- protect against multi-tab/back-button stale-context leakage; and
- show the active context clearly in the UI, especially for represented-party and approval actions.

Allowed/prohibited combinations, primary-role rules, conflict resolution, context re-confirmation, and separation-of-duties constraints remain **OPEN**.

## 27. External vs Internal Roles

### External roles

- Supplier.
- Buyer.
- Quality Inspector, including an assigned external Inspector/inspection organisation.
- Logistics Partner.

### Internal I Do Grow roles

- I Do Grow Trader.
- Compliance Manager.
- Administrator.

“External” does not mean public access; it remains `OWN_ORG`, `ASSIGNED`, transaction-scoped, explicitly shared, or approved Marketplace access. “Internal” does not mean platform-wide authority or all-field visibility.

The sources support external inspection organisations. They do not approve a separate external Compliance Manager operating model. Employment or organisation label alone grants no permission.

## 28. Permission Failure Behaviour

Consistent with `API_CONVENTIONS.md`:

- use `401` when authentication is required;
- use `403` only where revealing the resource/policy boundary is safe;
- use `404` to conceal inaccessible private-resource existence where necessary;
- avoid cross-tenant identifiers, role/owner details, internal policy, stack traces, secrets, or sensitive fields in errors;
- keep denial side-effect-free and record a safe internal audit/security event where appropriate; and
- return stable, allowlisted error codes/messages with only safe recovery guidance.

UX behavior:

- **Hide** a route/action/resource where the capability or existence is sensitive.
- **Disable** only when the user has the underlying capability but a safe, visible prerequisite/state/version prevents execution; explain the reason accessibly.
- **Show read-only** when view is authorised but mutation is not.
- Never use a disabled control to reveal a hidden resource or policy.
- Clear or withhold stale protected data after a context change or denial.
- Offer only safe recovery such as selecting the correct active context, returning, or requesting access/support.

Frontend handling never replaces backend authorization.

## 29. MVP Minimum Access Model

### Safe to implement as foundation after approval and Sprint 01 authorisation

- Verified identity and Organisation Membership separation.
- Seven human roles with provider-neutral capability concepts.
- Explicit active organisation/capacity.
- Deny-by-default backend authorization.
- Ownership, transaction, assignment, represented-party, action, resource-state, and field scope.
- Authorised server-side output projections.
- Trader represented-party context and real-actor audit.
- Separate prepare/submit/review/approve/execute capabilities.
- Approval records bound to exact action/resource versions.
- Critical audit and correction/supersession lineage.
- System and future Platform Agent restrictions.

### Requires client/business/domain/legal approval before use

- Named proof-transaction role holders and readiness/publication/Match/quality owners.
- I Do Grow capacity and Trader mandates.
- Quote issuance/acceptance and Contract authority/effect.
- Reservation/release and sold behavior.
- Final-grade eligibility, methods/rules, certificates, and remedies.
- Carrier booking, Shipment release, delivery, claims/credits, payment/Settlement authority.
- DPP publication/sharing and exact field visibility.
- Sensitive-role governance and segregation-of-duties rules.

### Deferred

- Enterprise IAM/federation and complex delegated administration.
- A generic policy engine unless a concrete need exists.
- Broad external portals beyond the proof transaction.
- Autonomous commercial or quality decisions.
- Platform Agent implementation.
- Break-glass sophistication beyond an approved real need.

## 30. Open Questions

Use `CLIENT_CLARIFICATIONS.md`; do not duplicate or answer it.

### BLOCKING before role implementation

- A7.1: named owners, approval thresholds, second approvals, and separation-of-duties rules.
- A7.2: exact role/record/field visibility and change rights.
- A7.3: legal privacy roles, retention, locations, correction, and deletion obligations.
- A2/A3: I Do Grow capacity, Trader mandate, binding authority, Quote/Trade/Contract effect.
- A4: reservation/release authority and effect.
- A5.3: Inspection/final-grade authority and non-conforming outcomes.
- Existing A7 workshop must also capture role/membership grant, change, revoke, review, multi-role conflicts, and emergency/support access.

### BLOCKING before first real transaction

- Named role holders and approved mandates for the proof transaction.
- A8: Contract, carrier booking, Shipment release, delivery, and exception authority.
- A9: payment evidence/instruction, claim/credit, and Settlement ownership.
- A10: DPP completeness, correction, publication/sharing, and visibility.
- Confirm whether an evidence recorder may also approve final Grade and whether certificate creation is a report or authorised attestation.

### IMPORTANT

- Map the source term “quality manager” to a governed role or assignment.
- Define the permitted scope of Trader “platform-wide trading information.”
- Distinguish externally itemised fees/commission from confidential internal margin.
- Define “Buyer permission” for Inspection-result sharing.
- Define mandate issuance, evidence, scope, expiry, revocation, and re-confirmation.

### Deferred

- Advanced role hierarchies, federation, automated access certification, complex policy administration, and future Platform Agent capability grants.

A genuinely under-explicit client-governance question was found: who may invite users, verify memberships, and grant/change/revoke/review sensitive roles, including allowed role combinations and second approval. This should be added to the existing A7 workshop rather than silently answered here. The other refinements fit existing A2–A11 questions.

## 31. Data Model Implications

Likely later conceptual implications are:

- User/Identity.
- Organisation and verified Membership.
- Role and Capability/Permission.
- Scoped role/capability assignment with state, expiry, and revocation.
- Resource/transaction/Inspection/Shipment Assignment.
- Represented-party Mandate/Authority with scope and confirmation.
- Approval bound to actor/capacity, action, resource, and version.
- Explicit-sharing/visibility context.
- Audit Event with actor type, capacity, represented party, approval, and Platform Agent linkage.
- Agent Proposal as a separate non-authoritative record.

Quality work also implies separate Inspection submission, Human Verification, final Grade, certificate/report, Non-Conformity, correction, and DPP completeness/publication decisions.

This document does not modify `DATA_MODEL.md`, decide cardinalities, define tables/columns/keys/ACLs, select a tenant strategy, or create a schema/migration.

## 32. UX Implications

- Generate navigation from effective capabilities in the explicit active context, while still authorising deep links server-side.
- Keep the active organisation, role/capacity, and represented party persistently visible for assisted or high-risk work, including on mobile.
- Distinguish `Prepare`, `Submit for review`, `Confirm for represented party`, and the exact approval action; avoid generic `Approve` labels.
- Scope approval queues by organisation, assignment, capacity, resource, and action. Distinguish preparation/review from final approval.
- Show represented party, mandate/confirmation state, source/channel, exact version, and binding/non-binding status before confirmation.
- Revalidate and clear context-sensitive caches/routes/drafts after switching; warn about unsaved work.
- Hide versus disable controls according to §28 and show safe permission-denied recovery.
- Use text plus icons, keyboard/focus support, announced context changes, and no colour- or tooltip-only authority state.
- Do not invent final navigation for Inspector, Logistics Partner, Compliance Manager, or Administrator where the sources do not define it.

No wireframes are created by this document.

## 33. Security Review

The authorization design must explicitly defend against:

- privilege escalation through role assignment, self-administration, or context switching;
- tenant breakout and insecure direct object/BOLA access on details, lists, search, counts, exports, files, and nested resources;
- broken function-level authorization on business commands and admin routes;
- property-level authorization/mass assignment of actor, organisation, owner, role, authoritative status, approval, or visibility;
- confused-deputy behavior in Trader-assisted, System, integration, and Platform Agent workflows;
- account impersonation, shared credentials, or represented-party ambiguity;
- excessive Administrator, Trader, Compliance, or support access;
- stale approval after resource/proposal changes;
- cross-tenant caches, files, logs, exports, and notifications;
- Platform Agent prompt/tool overreach or context leakage; and
- sensitive field/error/audit overexposure.

Minimum controls are contextual server-side authorization, tenant-aware data access, explicit projections, allowlisted input/output, version-bound approval, no direct agent persistence, safe 401/403/404 behavior, restricted audit/export, and negative two-tenant/action/field tests when implementation is later authorised.

Exact MFA, step-up, emergency access, security provider, physical tenant mechanism, rate limits, and monitoring tooling remain TBD/OPEN.

## 34. Specialist Perspectives

### Cheikh

Cheikh confirmed the seven role families and distinguished source-supported workflow participation from unresolved legal effect. He required represented-party context for Trader assistance, conditional matrix states rather than binary grants, and **OPEN** status for Quote, Contract, reservation, quality, Shipment, Settlement, DPP, and sensitive-role authority. He identified role-assignment/revocation governance as an under-explicit A7 workshop question.

### Mariama

Mariama required explicit active organisation/capacity, no silent privilege union, server-produced field projections, safe hide/disable/read-only behavior, scoped approval queues, and persistent acting-on-behalf indicators. She highlighted stale cache/multi-tab context, vague approval labels, mobile truncation, and inaccessible denial reasons as UX risks.

### Abdoulaye

Abdoulaye required contextual least privilege, deny-by-default enforcement, no post-query tenant filtering, real-actor represented-party audit, restricted admin/business boundaries, safe denial, and explicit protection from tenant breakout, BOLA/BFLA, mass assignment, confused deputy, stale approval, and Platform Agent over-permission.

### Mamadou

Mamadou confirmed compatibility with DEC-001: authorization remains in the controlled NestJS/backend boundary, while each domain owns its resource/action rules and projections. RBAC is a baseline, not a complete policy. System, human roles, and Platform Agents remain distinct. No provider, library, physical tenancy model, schema, or new architecture decision is introduced.

### Babacar

Babacar confirmed that Traders are assisted operators, Match reviewers, negotiators, transaction preparers, and logistics-provider selectors, but not blanket legal representatives. He required draft/issue/accept/sign distinctions and kept reservation, Contract, carrier, claims, payment, and Settlement authority **OPEN**. He surfaced the fee-versus-internal-margin and platform-wide-view tensions.

### Sokhna

Sokhna confirmed assignment-scoped, Lot/Inspection-centric Inspector access and strict separation of capture, submission, verification, final Grade, certificate/report, Non-Conformity, commercial remedy, and DPP publication. Source-supported Inspector capabilities do not establish the exact final approver, method, Grade, mandatory certificate, validity, or commercial effect.

Khady was not invoked. Existing project memory and the architecture/security reviews already supplied enough conceptual organisation, ownership, assignment, and tenant scope; this task did not require a physical data-model decision.

## 35. Agreements

All six specialists agreed that:

- the seven human roles are source-supported;
- System and future Platform Agents are non-human and have no independent business authority;
- RBAC is required but insufficient without organisation, resource, assignment, represented-party, field, state, and approval context;
- authorization and field projection are backend-enforced;
- external access is ownership-, transaction-, assignment-, Marketplace-, or explicit-sharing-scoped;
- internal status does not create blanket access;
- Administrator is not automatically a business approver;
- Trader assistance does not prove legal mandate or binding authority;
- Inspector grade/certificate capability does not prove unconditional final authority or a mandatory certificate;
- represented-party actions preserve real actor, capacity, mandate, confirmation, source, version, and audit;
- high-risk approvals bind to the exact reviewed resource/proposal version;
- Platform Agents have allowlisted, minimum-context, controlled-tool access and no direct database mutation;
- exact authorities, thresholds, field matrix, role governance, and segregation rules remain **OPEN**;
- DEC-001 remains approved and unchanged; and
- no implementation, provider selection, schema, project-memory update, or DEC entry belongs in this task.

## 36. Disagreements

No blocking specialist disagreement remains. The following source tensions and nuances are intentionally preserved rather than silently resolved:

1. **Trader platform-wide visibility versus least privilege:** The Manual permits Traders to view platform-wide trading information. Specialists agree this is broad functional visibility, not unrestricted access to every record or sensitive field. Exact projections remain **OPEN**.
2. **Inspector grade capability versus final authority:** The Manual gives Quality Inspectors grade approval/rejection capability. This establishes the role family, not the named final approver, assignment, independence, or checkpoint. Those remain **OPEN**.
3. **“Quality manager” role label:** Listing publication may be approved by a Trader or “quality manager,” but that label is not one of the seven canonical roles. It must not be silently mapped to Quality Inspector or Compliance Manager.
4. **Quote transparency versus internal margins:** The sources require transparent cost breakdowns while also stating that internal margins are never external. The external fee/commission projection and confidential margin boundary remain **OPEN**.
5. **Inspection-result Buyer permission:** The source says Inspection results may be shared only after Buyer permission, but grantor, recipient, timing, and workflow are not defined. The exact rule remains **OPEN**.
6. **Segregation of duties:** Specialists agree the model must support separation, but no universal two-person staffing rule can be claimed without client approval.

## 37. Formal Approval Required?

### Safe technical authorization foundations

The contextual RBAC baseline, explicit organisation/capacity, deny-by-default backend checks, resource/assignment/represented-party scope, field projections, version-bound approvals, System/Platform Agent boundaries, audit, safe denial, and administration/business separation are **SAFE_FOUNDATION** recommendations for human project approval.

### Business authority rules requiring client approval

The client must approve named proof-transaction role holders, Trader mandates and I Do Grow capacity, binding Quote/Contract semantics, reservation authority/effect, final Grade/certificate authority, carrier/Shipment/delivery authority, claims/payment/Settlement authority, DPP publication, exact field visibility, sensitive-role governance, thresholds, and segregation rules before the affected capability is used.

No `DECISION_LOG.md` update is required from this analysis. DEC-001 remains compatible and unchanged. A new decision would be needed only if later work changes DEC-001 or formally selects a significant architecture/technology/physical-tenancy choice that is currently TBD. Product/business approval should be recorded through the appropriate authorised mechanism without rewriting client sources.

## 38. Next Action

1. Human-review this foundation for source fidelity and safe authorization boundaries.
2. Use the existing client workshop to answer A7.1–A7.3 and linked A2–A5/A8–A11 questions for the selected proof transaction.
3. Add the under-explicit A7 governance prompt covering membership verification, sensitive-role grant/change/revoke/review, multi-role conflicts, second approval, mandate lifecycle, and emergency/support access.
4. Resolve the “quality manager,” Trader visibility, fee-versus-margin, Inspection-sharing permission, and quality/certificate authority nuances without assuming answers.
5. Validate the first transaction workflow and role/approval/visibility matrices against approved client answers.
6. Synchronise `DATA_MODEL.md` conceptually only in a separate authorised task after approval.

Sprint 00 remains active. Do not begin Sprint 01, authentication/application implementation, schema work, dependency installation, or Platform Agent creation from this document.
