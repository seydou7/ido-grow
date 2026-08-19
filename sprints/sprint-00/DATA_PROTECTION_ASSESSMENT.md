# I Do Grow — Sprint 00 Data Protection Assessment

## 1. Purpose and Status

- **Status:** PRELIMINARY — Sprint 00 foundation assessment.
- **Current phase:** Sprint 00 — Discovery and Foundation remains ACTIVE.
- **Implementation status:** Application implementation and dependency installation have NOT STARTED.
- **Authority:** Subordinate to primary client sources, later explicit client clarifications, and approved project decisions.

This document is an implementation-oriented assessment of expected MVP personal-data processing, risks, safeguards, open questions, and readiness work. It is **not legal advice**, a privacy policy, a contract, a completed DPIA/AIPD, or a declaration of GDPR compliance. It does not authorise Sprint 01 or application implementation.

The MVP is expected to process information about identifiable natural persons in European operations, including France and the Netherlands. The system must therefore be designed for the GDPR context. Exact territorial application, national-law requirements, competent supervisory authority, lawful bases, legal roles, and regulatory conclusions remain **LEGAL REVIEW REQUIRED**.

## 2. Scope

This assessment covers expected MVP processing involving:

- Suppliers and their representatives, including individual farmers/producers where applicable;
- Buyers and their representatives;
- I Do Grow Traders and other authorised staff;
- Quality Inspectors;
- Logistics Partner personnel and transaction contacts, including drivers only if individually identified for the transaction;
- Compliance Managers and Administrators;
- other authorised external business contacts; and
- future Platform Agent interactions.

It covers accounts, organisation membership, onboarding, Listings and Lots, Buyer requests, matching, Quotes, Trades, Contracts, quality, logistics, administrative Settlement, DPP/traceability, communications, audit/security, files/media, WhatsApp-assisted intake, and future AI assistance.

**Personal versus business data:** legal-person company names, registration/VAT details, product specifications, quantities, prices, and organisation-level transactions are not automatically personal data. They may become personal data where they identify or relate to an individual farmer, sole trader, representative, employee, inspector, driver, signatory, approver, account user, or a farm/site associated with a natural person. B2B context does not remove protection from identifiable people. Pseudonymised information remains personal data where re-linkage is possible. No source supports demographic profiling or routine special-category-data collection.

## 3. Expected Data Subjects

Likely categories are:

- Supplier representatives and organisation members;
- individual farmers, producers, or sole traders where applicable;
- Buyer representatives and organisation members;
- I Do Grow Traders, Compliance Managers, Administrators, and other authorised staff;
- Quality Inspectors and inspection-company personnel;
- Logistics Partner personnel and transaction contacts, including drivers only if individually identified for the transaction, pickup/delivery contacts, and delivery confirmers;
- signatories, approvers, invoicing contacts, and support contacts;
- authorised external users; and
- people incidentally named, recorded, or shown in uploaded documents, photographs, messages, or voice content.

The sources do not establish children, patients, demographic segments, or other protected groups as intended MVP data subjects. Small farmers/producers are not automatically “vulnerable persons” for DPIA screening; the actual relationship and power imbalance require factual and professional assessment.

## 4. Preliminary Personal Data Inventory

| Data category | Example fields | Data subjects | Purpose | Source | Likely recipients | Sensitivity | MVP necessity | Retention status | Open questions |
|---|---|---|---|---|---|---|---|---|---|
| Identity/contact | Name, business email, phone, role/job title, preferred language | All account users and business contacts | Identity linkage, communication, workflow participation | Person, organisation, Trader-assisted intake | Authorised users and staff within approved scope | Medium | Necessary by role and purpose | TBD | Which fields are mandatory by actor and channel? |
| Organisation/onboarding | Affiliation, membership, site/farm relationship, individual-linked registration data, verification records | Supplier/Buyer representatives; individual suppliers | Organisation access, supplier readiness and verification | Person, organisation records, documents, reviewer | Authorised onboarding/compliance staff | Medium–High | Purpose-dependent | TBD / LEGAL REVIEW REQUIRED | Required documents/checks; sole-trader handling; reviewer; legal necessity |
| Communication | Platform/support messages; selected WhatsApp content; voice or transcripts if used | Users, contacts, incidentally mentioned third parties | Intake, clarification, support, transaction coordination | Data subject, represented party, messaging channel | Transaction/support staff; later assessed providers | High due to free text/audio | Only necessary content | TBD | What is copied, retained, transcribed, or handed over? |
| Transactional/actions | Represented party, action, approval, Quote/Contract involvement, shipment contact, delivery confirmation | Representatives, Traders, approvers, signatories | Negotiate, evidence, fulfil, and audit transactions | Users, system events, signed records | Authorised transaction parties and staff | Medium–High | Required for relevant workflow/evidence | TBD / legal-commercial dependency | Capacity, authority, sharing, legal effect |
| Financial-related | Invoicing contact, payment-status evidence, payment instructions; possibly bank details | Finance contacts, individual/sole-trader suppliers | Administrative Settlement and fraud/error control | Parties, external payment evidence | Strictly authorised finance/operations users | High | Do not assume bank-data storage until required | TBD / LEGAL REVIEW REQUIRED | Exact payment flow, evidence, fields, instruction-change control |
| Quality/inspection | Inspector identity, assignment, signature/approval, evidence attribution, time and justified location | Inspectors; farm/operator contacts | Inspection integrity, grading, provenance | Inspector, Supplier, evidence/device metadata | Assigned reviewers and approved transaction parties | Medium–High | Only necessary evidence fields | TBD | Precision, visibility, certificate fields, remedies |
| Technical/security | Account ID, authentication/session metadata, IP/device/security events, request ID | Users and administrators | Authentication, access control, fraud/security, incident investigation | System and future identity provider | Restricted security/operations roles | Medium–High | Risk-based minimum | TBD | Credential/session design, MFA, telemetry scope |
| Audit | Actor, acting organisation, represented party/capacity, action, time, source/channel, approval context, outcome | Users, staff, approvers | Critical-action accountability and integrity | Backend business events | Restricted authorised audit/compliance roles | Medium–High | Required, but payloads minimised | TBD | Actor-link retention, audit access, correction/erasure treatment |
| AI interaction | Prompts/messages, selected context, extracted data, output, feedback/approval, model/prompt/tool metadata | Users and people named in supplied content | Planned bounded extraction, drafting, explanation, assistance | User, records/files, controlled tools | Initiating/reviewing users and later assessed provider | High/Unknown | Planned MVP assistance; not current Sprint 00 processing or implementation | TBD by capability/provider | Provider role, locations, retention, training/use, derived-copy lifecycle |
| Files/media | Photos, documents, certificates, signatures, shipment files, optional voice/audio, embedded metadata | Uploaders and incidentally shown/named people | Verification, quality, Contract, Shipment, DPP evidence | User upload or approved integration | Purpose- and field-authorised recipients | High | Purpose-specific only | TBD | Identity documents, EXIF, raw audio, third-party data, public sharing |
| DPP/traceability | Producer/operator reference, origin/site, event actor, Inspector, time/location, evidence attribution | Producers, Inspectors, logistics contacts | Lot provenance and traceability | Source records and verified events | Layered recipients; exact visibility blocked | High if published or precise | Separate enduring traceability from identity | TBD / LEGAL REVIEW REQUIRED | Exact content, public/party/internal views, completeness, correction |

Accidental personal data may appear in documents, photos, free text, messages, filenames, EXIF/location metadata, voice content, and provider logs. These channels require minimisation, warning, inspection, access control, and lifecycle handling even when the structured field model does not request that data.

## 5. Data That Should NOT Be Collected by Default

Unless a documented purpose and legal assessment establish necessity, do not request or retain by default:

- identity documents or complete copies;
- personal home addresses instead of necessary business/site information;
- sensitive personal characteristics, special-category data, criminal-offence data, or demographic profiles;
- private bank statements, full transaction histories, or unrelated financial information;
- unrestricted free-form personal profiling;
- unrelated personal or third-party communications;
- complete WhatsApp histories when selected content or a structured record is sufficient;
- precise geolocation when a coarser site reference is sufficient;
- raw voice/audio after an approved verified transcript or structured record is sufficient;
- unnecessary metadata from photos/documents;
- secrets, credentials, tokens, or private payloads in logs; or
- production personal data in development, tests, demos, or AI evaluation.

These are data-minimisation defaults, not permanent prohibitions. Purpose-dependent collection may later be justified, but requires explicit necessity, visibility, retention, security, and legal review.

## 6. Processing Purpose Map

| Processing area | Purpose | Required personal data | Actors | Business necessity | Lawful-basis question |
|---|---|---|---|---|---|
| Account and organisation management | Authenticate users; manage organisation membership, access, recovery, and sessions | Minimum contact, account, membership, role and security metadata | User; authorised organisation/internal admin | Required for controlled access | Contract/pre-contract, legitimate interests, or another basis may be relevant — **LEGAL REVIEW REQUIRED** |
| Onboarding/verification | Establish Supplier readiness and verify required identity/business evidence | Contact, affiliation, source evidence, reviewer attribution; documents only as required | Supplier/individual producer; Trader; authorised reviewer | Required before a first binding transaction, with exact checks unresolved | Depends on role, checks, and applicable law — **LEGAL REVIEW REQUIRED** |
| Marketplace/Listings | Structure, review, publish, search, and compare supply | Creator/owner attribution and personal farm/site data only where necessary | Supplier; assisting Trader; reviewer; authorised Buyer | Core MVP supply workflow | Public personal visibility is not automatically justified — **LEGAL REVIEW REQUIRED** |
| Buyer requests | Capture RFQ/Buy Order requirements and authority | Buyer representative, organisation, action/source history | Buyer; assisting Trader; authorised staff | Core demand workflow | **LEGAL REVIEW REQUIRED** |
| Trading workflow | Match, prepare, negotiate, version, approve, and evidence Quotes/Trades | Authorised contacts, represented-party context, actions, approvals, communication evidence | Supplier/Buyer contacts; Trader; approvers | Core transaction workflow | Contract steps and legitimate interests may be relevant; representatives may not be contract parties — **LEGAL REVIEW REQUIRED** |
| Quality inspection | Assign inspection and preserve accountable measurements/evidence/grade | Inspector identity, assignment, necessary time/location, approval | Inspector; Supplier; authorised quality/Trader reviewer | Structured quality and human-approved grade are MVP requirements | **LEGAL REVIEW REQUIRED** |
| Contracts | Produce and retain human-reviewed agreements | Party contacts, signatory authority, signatures, version/approval history | Authorised parties and reviewers | Required MVP transaction evidence | Exact parties/capacity/authority/law unresolved — **LEGAL REVIEW REQUIRED** |
| Logistics | Quote, select, book, track, deliver, and resolve exceptions | Transaction-scoped contacts, custody/delivery events, evidence | Logistics Partner; Supplier; Buyer; Trader | Required shipment proof | **LEGAL REVIEW REQUIRED** |
| Payment-status administration | Record invoices, external payment status, balances, claims, and credits | Minimum invoicing contacts and evidence; bank data only if necessary | Authorised finance/operations and transaction parties under approved visibility | MVP is administrative, not payment custody | Tax/accounting/contract/legal bases are not established — **LEGAL REVIEW REQUIRED** |
| DPP/traceability | Preserve Lot-linked origin, quality, transaction, shipment, and provenance events | Prefer organisation/role/event reference over public names | Supplier; Buyer; Trader; Inspector; compliance reviewers | Basic DPP is MVP-required | Exact fields, visibility, and enduring identity need — **LEGAL REVIEW REQUIRED** |
| Audit/security | Protect accounts and transactions; evidence who acted and why | Structured actor/action/security metadata; minimal payload | Restricted security/audit/compliance roles | Critical-action auditability is required | Legitimate interests/legal obligation may be relevant — **LEGAL REVIEW REQUIRED** |
| Support | Resolve product/workflow issues and disputes | Contact, case, and issue-specific transaction data | User; authorised support/Trader | Operational support | Context-specific — **LEGAL REVIEW REQUIRED** |
| AI assistance | Planned extraction, preliminary observation, explanation, drafting, and bounded support | Minimum authorised task context and derived output | Initiating user; reviewer; controlled Platform Agent/provider later | Client-supported planned MVP assistance; not current Sprint 00 processing or implementation | Separate purpose/basis/provider review per capability — **LEGAL REVIEW REQUIRED** |
| WhatsApp-assisted intake | Accessible Supplier intake, follow-up, non-binding updates, and handover | Minimum selected messages/files, contact linkage, verified extracted fields | Supplier; authorised Trader; later assessed messaging/AI services | Source-backed alternative interface | Channel/provider/content-import assessment — **LEGAL REVIEW REQUIRED** |

Consent, contract/steps before contract, legal obligation, and legitimate interests are plausible legal-basis categories for evaluation in some contexts. This assessment selects none. Consent must not be treated as a universal fallback. Final purpose-by-purpose determination is **LEGAL REVIEW REQUIRED**.

## 7. Controller / Processor Role Questions

Legal data-protection roles are functional and processing-specific; they are not the same as product user roles or NestJS controllers [E3]. The complete allocation cannot be determined until the legal entity, commercial capacity, party instructions, and essential means are known.

Questions to determine:

- When does I Do Grow determine purposes and essential means as controller?
- Does I Do Grow act independently, jointly, or on instructions for particular Supplier-, Buyer-, inspection-, logistics-, or messaging-related processing?
- How does principal trader/reseller, agent, broker, facilitator, or reviewer capacity change the analysis?
- Are Suppliers, Buyers, Inspectors, or Logistics Partners independent controllers, joint controllers, processors, or recipients for each processing activity?

Future provider categories requiring activity-specific role assessment include authentication, cloud/hosting, object storage, email/SMS/WhatsApp, analytics, error monitoring/observability, LLM, payment, logistics, and support. A provider cannot be labelled a processor merely because it supplies technology. Where processing occurs solely on documented instructions, an applicable processor agreement and subprocessor controls will be required [E1, E3].

All provider selections remain TBD. Controller, joint-controller, processor, recipient, and agreement determinations are **LEGAL REVIEW REQUIRED**.

## 8. Data Protection by Design and Default

GDPR principles include purpose limitation, data minimisation, accuracy, storage limitation, integrity/confidentiality, and accountability; protection must be integrated by design and default [E1, E4]. Foundation requirements are:

- define purpose, source, category, recipients, visibility, sensitivity, lawful-basis status, and lifecycle reference before adding a personal-data field;
- collect and expose only what is necessary for the active purpose;
- deny access by default and apply least privilege;
- enforce identity, organisation, represented-party, transaction, assignment, function, action, and field authorization server-side;
- use explicit authorised projections; never send sensitive fields to the frontend merely to hide them;
- keep public/marketplace, transaction-shared, private-party, and restricted-internal views distinct;
- preserve source, provenance, correction, version, and approval history without duplicating unnecessary payloads;
- provide policy-driven retention, restriction, deletion/anonymisation, and recipient/provider propagation capabilities;
- keep production personal data out of routine development, tests, demos, and evaluation; use synthetic or approved irreversibly anonymised fixtures;
- keep files private by default with purpose-labelled metadata, quarantine/scanning state, and authorised access; and
- keep future AI/integrations provider-neutral, minimum-context, tenant-scoped, reviewable, and auditable.

These requirements align with DEC-001: Next.js communicates through the versioned REST boundary; the NestJS modular monolith enforces critical authorization, validation, and controlled actions; PostgreSQL is the transactional record; Platform Agents have no direct critical-record access. They also align with the proposed `API_CONVENTIONS.md`. They do not prescribe an ORM, physical tenancy design, provider, microservice, queue, Redis, Python service, or database schema.

## 9. Role and Field Visibility Risks

The exact roles, records, fields, approval ownership, and visibility matrix remain **BLOCKED** by `CLIENT_CLARIFICATIONS.md` A7.1–A7.3 and DPP questions A10.1–A10.3.

Minimum constraints that do not resolve the final matrix:

- a Supplier must not see another Supplier’s private data;
- Buyers must not automatically receive internal margin, internal risk reasoning, bank information, unrelated quality evidence, or another Buyer’s data;
- Logistics Partner access must be transaction/shipment-scoped;
- Inspector access must be assignment- and field-scoped;
- internal I Do Grow access is not automatically platform-wide and must be least-privilege and audited;
- Trader-assisted activity must preserve actual actor, acting organisation, represented party/capacity, source channel, and approval context; and
- future AI tools receive only the authorised context required for the task.

Cross-organisation and field-level leakage is a preliminary **High** risk. Exact visibility remains a client and privacy/legal blocker; this assessment does not invent the matrix.

## 10. Multi-Tenancy

Required privacy properties are:

- organisation context and ownership must be enforced at backend service and data-access boundaries;
- reads, writes, list/search/count, export, file access, cache, integration, audit, and controlled-agent operations must be tenant-aware;
- cross-organisation access must arise only from an approved marketplace rule, transaction relationship, assignment, ownership, or explicit sharing;
- internal I Do Grow access must have an explicit purpose and permission;
- represented-party actions must bind authenticated actor, acting organisation, represented party/capacity, channel, and approval;
- tenant offboarding must remove ordinary access without accidentally deleting shared transaction evidence or leaving orphaned cross-tenant access; and
- denial responses must avoid leaking existence of inaccessible private records.

No physical approach such as PostgreSQL row-level security, schema-per-tenant, or application-only scoping is selected. The implementation mechanism and final visibility policy remain TBD.

## 11. Audit Logging and Privacy

Critical auditability is required, but identifiable audit and security logs are themselves personal data. Structured audit may capture, where justified:

- actor identifier and actor type;
- acting organisation and represented party/capacity;
- timestamp, action, resource, and outcome;
- source/channel and request/correlation reference;
- reason and approval context; and
- relevant version/change references and agent/tool linkage.

Controls:

- separate business audit, operational logs, security telemetry, and AI/provider logs by purpose, access, and retention;
- capture structured metadata and references rather than unrestricted request/response or before/after payloads;
- redact before persistence, not only at display;
- never log passwords, secrets, tokens, cookies, authorization headers, unnecessary bank data, private document bodies, raw WhatsApp/voice content, confidential margins, or unnecessary AI prompts;
- strictly restrict and monitor audit/export access;
- preserve tamper resistance and append-only correction links for critical evidence; and
- define separate lifecycle rules, with pseudonymisation/anonymisation where appropriate.

Append-only does not mean indefinite retention, and immutability does not automatically override data-subject rights. Exact retention, actor-link treatment, legal holds, and reconciliation of evidence with rights are TBD and **LEGAL REVIEW REQUIRED**.

## 12. Documents, Photos, Voice and WhatsApp

Principal risks include excessive or third-party personal data in uploads; identity documents and signatures; certificate contacts; people shown in images/video; EXIF/GPS metadata; public or long-lived links; hostile files; provider-side message/media retention; and AI extraction turning incidental content into structured records.

Requirements:

- give purpose-specific upload instructions and warn against unnecessary personal data;
- validate, quarantine, and scan files before trusted use or sharing;
- keep private content behind authorised, short-lived access rather than permanent public URLs;
- strip or separately control metadata unless provenance requires it;
- record purpose, uploader, organisation, source, linked record, and processing status;
- import only transaction-relevant WhatsApp content, not full histories by default;
- determine whether raw voice/audio is needed after approved transcription/verification;
- distinguish original evidence from extracted/translated/normalised data; and
- propagate correction, restriction, and deletion across messages, attachments, renditions, OCR/transcripts, extracted fields, caches, and provider copies where applicable.

WhatsApp implementation, copying, confirmation, draft creation, handover, media/voice retention, provider role, and transfer handling remain TBD under A11.1–A11.2. Voice is source-supported as an optional intake channel; permanent storage is not assumed.

## 13. AI / Platform Agent Privacy Assessment

Platform Agents are planned MVP assistance capabilities and are **not current Sprint 00 processing and are not being implemented in Sprint 00**.

Before any capability processes live personal data, define a per-capability data contract: purpose, permitted fields/sources, data subjects, recipients, output, prohibited data, risk/approval level, retention, and unresolved lawful basis.

Required future controls:

- assemble minimum necessary, tenant/transaction/represented-party-authorised context behind backend authorization;
- prefer selected fields/snippets over whole records, files, or conversations;
- mask/remove unnecessary identifiers and filter secrets, credentials, bank/ID/signature data where appropriate;
- keep canonical source records distinct from prompts, extracted fields, model output, evaluation data, and logs;
- preserve source, provenance, prompt/model/config version, retrieval references, uncertainty, approval, and correction lineage;
- never allow AI output to silently overwrite verified evidence;
- treat documents, retrieved content, prompts, and model output as untrusted;
- enforce allowlisted tools, structured schemas, backend validation, no direct database mutation, and proposal/version-bound human approval;
- make human review meaningful: the reviewer can inspect evidence, reject, edit, and escalate; changed input requires revalidation/reapproval;
- prevent cross-tenant retrieval and stale/permission-incompatible context;
- inventory and propagate correction/deletion to prompts, outputs, provider copies, caches, retrieval indexes/embeddings, and evaluation sets where applicable; and
- use synthetic or non-personal evaluation fixtures by default.

Do not assume user/customer data may be used for model training. Production data must not flow automatically into evaluation, fine-tuning, or training. Any exception requires separate purpose, authority, minimisation, access, retention, transparency, and rights analysis.

Provider-specific assessment must cover role, DPA/terms, subprocessors, processing/support location, transfers, retention/deletion, customer-data training/secondary use, human access, security, breach notice, export/rights assistance, and audit evidence [E5, E7]. The LLM provider and provider-specific privacy position remain TBD and **LEGAL REVIEW REQUIRED**.

## 14. DPP and Traceability Privacy

The DPP is lot-linked, versioned, and event-based. It can expose natural persons through named farmers/operators, precise farm locations, Inspector identities/signatures, contacts, custody actors, documents, or evidence. It can also expose confidential commercial terms.

Design direction:

1. public/shareable traceability projection;
2. transaction-party projection;
3. restricted compliance/evidence projection;
4. confidential commercial projection; and
5. personal-data linkage only where necessary.

These are separation requirements, not an approved field matrix. Personal data must not become public merely because it supports a DPP event. Corrections should append authorised versions/events and preserve provenance; public visibility may be narrowed or withdrawn without rewriting Lot history. Lot split/combine/transform may propagate source metadata, so inheritance must minimise personal data.

Exact DPP fields/events/documents, completeness owner, publication/sharing, correction governance, Lot/Batch semantics, and retention remain blocked by A6 and A10 and are **LEGAL REVIEW REQUIRED**.

## 15. International Data Transfers

Do not assume that future vendors process only inside the EEA. Before selection or use, map:

- hosting, storage, backup, processing, and support locations;
- subprocessors and onward transfers;
- remote support access;
- LLM inference, logging, review, and training use;
- WhatsApp/messaging;
- analytics and observability;
- email/notifications;
- payment and logistics integrations; and
- export/deletion and incident-support routes.

Where personal data may leave the EEA, GDPR Chapter V conditions and an appropriate transfer mechanism must be assessed [E1]. No transfer mechanism is selected here. Data-location, transfer, onward-transfer, and supplementary-measure analysis are **LEGAL REVIEW REQUIRED**.

## 16. Data Retention and Deletion

No exact period is authorised. Retention must be purpose-, category-, event-, legal-, claim-, and jurisdiction-specific. A status flag or soft delete alone is not erasure. Restricted archives must leave ordinary workflows and have narrower access. Expired/deleted data must not silently return to active use after backup restoration.

| Category | Reason for retention | Trigger for future period | Deletion/anonymisation expectation | Legal/business dependency | Status |
|---|---|---|---|---|---|
| Accounts/memberships | Access and accountable actions | Deactivation, membership or relationship end | Remove access; delete/anonymise profile data not otherwise needed; retain minimum actor linkage only if justified | Security, transaction/audit evidence | TBD |
| Onboarding/verification | Readiness decision and source evidence | Rejection, withdrawal, supersession, or relationship end | Purge redundant/raw copies; retain minimum supported decision evidence if required | Required checks and claims | TBD / LEGAL REVIEW REQUIRED |
| Transaction records | Commercial history and claims | Quote expiry/rejection; Trade/transaction and claim closure | Restricted archive where justified; minimise old contact data | Contract/commercial limitation rules | TBD / LEGAL REVIEW REQUIRED |
| Contracts | Terms, signatures, claims, legal evidence | Contract termination/expiry plus claim closure | Preserve necessary record; remove unnecessary copies/contact detail when permitted | Governing law and legal evidence | TBD / LEGAL REVIEW REQUIRED |
| Quality records | Grade provenance, Lot traceability, claims | Inspection/Lot/claim lifecycle or supersession | Preserve necessary evidence; reduce personal contact/signature/location from ordinary views | Quality/DPP/certificate obligations | TBD |
| Shipment records | Custody, delivery, customs, claims | Delivery plus dispute/claim closure | Retain necessary evidence; delete unnecessary live contacts/device/precise tracking | Customs, claims, custody | TBD / LEGAL REVIEW REQUIRED |
| Settlement records | Accounting, tax, payment status, claims | Settlement and claim closure | Minimise/redact bank/payment evidence; retain only supported records | Tax/accounting/claims | TBD / LEGAL REVIEW REQUIRED |
| Audit logs | Accountability and integrity | Related event/obligation/incident closure | Retain minimal actor/action/context references; pseudonymise/anonymise when justified | Evidence and rights balance | TBD / LEGAL REVIEW REQUIRED |
| Support/messages | Resolve case or intake | Case/conversation closure or last justified interaction | Delete/minimise; narrow archive only if separately justified | Dispute/support evidence | TBD |
| AI interactions | Task, audit, correction, approved evaluation | Task/proposal/evaluation closure | Delete transient copies earlier; no training reuse by default; propagate lifecycle | Provider and evidence needs | TBD / LEGAL REVIEW REQUIRED |
| Uploaded files/media | Verification or transaction evidence | Purpose completion, linked-record closure/expiry/replacement | Cascade to originals, previews, thumbnails, OCR/transcripts, quarantine/temp copies; retain minimal metadata only if justified | Evidence/provenance | TBD |
| DPP records | Long-lived Lot/product traceability | Lot/product lifecycle and correction/publication event | Separate enduring traceability from removable/restricted personal data | DPP/quality/commercial law | TBD / LEGAL REVIEW REQUIRED |

Lifecycle orchestration must cover primary records, duplicate contacts, files/renditions, OCR/transcripts, translations, AI input/output, search/retrieval stores, caches, exports, notifications, provider copies, and backup expiry/restore. Maintain a completion/result record without retaining erased content.

Legal holds are unresolved. If later required, they must be scoped, authorised, reasoned, reviewable, releasable, and audited—not indefinite or global by default. **LEGAL REVIEW REQUIRED** [E1, E11, E12].

## 17. Data Subject Rights

Design must support handling of:

- access;
- rectification;
- erasure where applicable;
- restriction;
- objection where applicable; and
- portability where its conditions apply.

These rights do not apply identically to every purpose or record [E1]. A future process must verify requesters proportionately; locate data across organisations, files, logs, messages, providers, and derived AI stores; protect other persons and confidential commercial information; document decisions; and propagate approved outcomes to recipients/processors where required.

For critical transaction, quality, audit, and DPP evidence, use authorised correction/version events or supplementary statements rather than silently rewriting history. Current views should resolve to the authorised latest state, while stale derived outputs are marked and re-evaluated. Whether an earlier personal value must be erased, restricted, disassociated, or retained is case-specific and **LEGAL REVIEW REQUIRED**.

## 18. Security Measures Required by Design

The following are foundation requirements, not implemented controls:

- encryption in transit;
- encryption at rest where appropriate;
- strong authentication and secure account recovery;
- MFA for internal/high-risk roles, with exact design TBD;
- server-side object-, function-, property-, tenant-, and action-level authorization;
- strict tenant isolation and explicit field projections;
- secure session handling after authentication design approval;
- secret/key management and redaction;
- environment separation;
- secure, access-restricted backups and tested restoration;
- input/output validation, resource limits, and secure configuration;
- malware/file scanning and quarantine;
- vulnerability, dependency, patch, and security-test management;
- security monitoring without excessive surveillance;
- rate limiting and abuse controls;
- sensitive-data-safe logs and errors;
- audit trails and access review;
- controlled integration/webhook authentication and replay protection; and
- incident-response and breach-register capability.

Risk-appropriate security and regular effectiveness assessment are required principles [E1, E8]. No cloud, authentication, storage, observability, scanning, CI/CD, or other provider is selected, and none of these controls is claimed to exist.

## 19. Personal Data Breach Preparedness

Before production, the organisation needs:

- designated incident ownership and privacy/legal escalation;
- detection, triage, containment, recovery, and evidence-preservation procedures;
- current processor/subprocessor notification contacts and contractual routes;
- ability to determine affected data categories, people, and record counts;
- rights-and-freedoms risk assessment;
- competent-authority and data-subject notification assessment;
- an incident log/register recording facts, effects, decisions, and remediation;
- communication templates and decision evidence; and
- post-incident review and control improvement.

GDPR Article 33 sets controller and processor breach-notification duties, including controller notification to the competent authority without undue delay and, where feasible, within 72 hours after awareness unless the breach is unlikely to risk rights and freedoms; Article 34 addresses communication to people where high risk is likely [E1]. Internal and provider escalation terms must support legal assessment, but this document does not invent extra deadlines. Competent-authority, notification, and cross-border coordination decisions are **LEGAL REVIEW REQUIRED**. AP guidance also supports prompt containment, assessment, notification evaluation, and breach registration [E10].

## 20. Preliminary DPIA / AIPD Screening

GDPR Article 35 requires a DPIA where planned processing is likely to create high risk, considering its nature, scope, context, purposes, and use of new technologies [E1]. EDPB-endorsed guidance and national authority lists must be applied to the final facts [E2, E6, E9].

| Screening factor | Present in known MVP? | Uncertain? | Risk rationale | Evidence/source | Additional clarification needed |
|---|---|---|---|---|---|
| Systematic evaluation/profiling | Potentially | Yes | Supplier risk/completeness, reliability, quality, and Match inputs could evaluate an individual/sole trader and affect opportunity | Client workflow; A1/A5/A7; [E2, E6] | Inputs, natural-person linkage, consequence, reviewer authority |
| Automated decision support | Planned assistance; binding automation prohibited | Yes | Human gates exist in requirements, but meaningful review and actual ability to depart are not yet evidenced | Client human-control principle; DEC-001 | Exact decisions, override/rejection evidence, consequence |
| Vulnerable individuals | Not established | Yes | No protected group is identified; commercial dependency/power imbalance may require contextual assessment | Project sources | Actual proof participants and relationship |
| Large-scale processing | Unknown | Yes | No approved user count, data volume, duration, or geographic scale | A1; current state | Subjects, records, history, duration, reach |
| Systematic monitoring | Not established | Yes | Critical audit/security/activity tracking is planned, but monitoring purpose and scale are unknown | Audit requirement; [E1] | Employee/user monitoring scope, frequency, access |
| Combining datasets | Conceptually present | Yes as to personal effect | Identity, risk, Listings, quality, transaction, logistics, payment, messages, and DPP are connected | Shared transactional model | Which records identify people; feature use and sharing |
| Innovative/new technology | Planned/likely for AI assistance | Yes as to concrete implementation | AI extraction, image/quality assistance, explanations, and Platform Agents may add new risks | Client AI scope; [E5, E7] | Capability, model, provider, input/output, safeguards |
| Data affecting commercial opportunities | Potentially | Yes | Supplier approval/risk, quality, matching, suspension, or exclusion may materially affect a natural person | Client workflow; A1/A3/A5/A7 | Decision effect, appeal, meaningful human review |
| Location or financial information | Potentially | Yes | Farm/inspection/shipment location and bank/payment evidence can be highly personal | Client sources; A5/A8/A9 | Precision, necessity, subject linkage, visibility |
| Special-category/highly personal data | Not intended; accidental presence possible | Yes | Uploads/free text/voice may contain unexpected data; signatures, precise location and finance raise sensitivity | Data inventory | Filters, required documents, incidental-data process |
| Public disclosure/DPP | Potentially | Yes | Durable exposure of names, sites, signatures, or contacts may cause high impact | A10 | Exact public fields and access model |
| International provider processing | Unknown | Yes | Vendor locations, subprocessors, logging, and onward transfers are TBD | DEC-001 TBDs | Provider chain and data-flow map |

### Screening conclusion

**C. DPIA requirement cannot yet be determined.**

Several risk indicators may be present, but current evidence does not establish the final nature, scope, context, scale, consequences, provider chain, national-list match, or meaningful human review. French and Dutch mandatory-processing lists must be checked against the final facts. Conduct a formal, documented DPIA/AIPD screen with the organisation’s DPO/privacy counsel before any real-data pilot or production processing. If the final processing is likely to create high risk, complete the DPIA before processing. **LEGAL REVIEW REQUIRED.**

## 21. High-Risk Processing Areas

| Area | Rank | Rationale | Mitigation direction |
|---|---|---|---|
| Cross-tenant/field access | High | Personal and confidential data may cross organisations or roles | Deny-by-default server controls, explicit projections, relationship/assignment scope, tests |
| DPP publication | High | Durable public exposure of identity, location, signature, contacts, or terms | Layered projections; no personal data public by default; client/legal approval |
| Documents/uploads | High | Hidden personal/third-party data, IDs, signatures, malware, metadata | Purpose guidance, minimise, scan/quarantine, metadata and access controls |
| WhatsApp/voice intake | High | Excess history, third-party content, provider retention/transfers, raw audio | Selective import, purpose/retention rules, provider gate, transcript decision |
| Bank/payment evidence | High | Fraud, identity theft, instruction manipulation, over-retention | Avoid by default; strict access, verification, redaction, change controls |
| Supplier risk/completeness | High/Unknown | Potential profiling/exclusion of individual suppliers | Define inputs/consequence, meaningful human review, correction/appeal, formal screen |
| AI/provider processing | High/Unknown | Context leakage, secondary use/training, transfers, derived copies, false claims | Minimum context, no-training default, provider gate, lineage, human review |
| Represented-party ambiguity | High | Unauthorised action or disclosure | Capture/enforce actor, organisation, capacity, authority, approval |
| Audit/security logs | Medium–High | Persistent behavioural history and payload leakage | Structured minimal logs, separate stores/access/retention, redaction |
| Inspector geolocation/signatures | Medium–High | Tracking and identity misuse | Collect only approved precision/purpose; restricted visibility |
| Account/identity | Medium | Takeover, phishing, access escalation | Strong auth, MFA for high-risk roles, least privilege, monitoring |
| Pure legal-person catalogue/aggregate data | Low after verification | Linkage may still identify a natural person | Verify classification and minimise linkage |

## 22. Privacy Requirements for Sprint 01

If and only if Sprint 01 is later authorised, the following provider-neutral foundations are safe to carry into its task specifications regardless of unresolved business rules:

- strict tenant-aware, server-side authorization and explicit field projections;
- deny-by-default visibility and separation of public, transaction, private-party, and internal views;
- data classification, purpose, source, provenance, sensitivity, and lifecycle metadata;
- represented-party and approval context for assisted actions;
- minimal business audit separated from redacted operational/security telemetry;
- no sensitive client data, secrets, tokens, bank details, private document bodies, or raw prompts in logs;
- environment and credential separation;
- synthetic fixtures instead of production personal data;
- privacy-aware, provider-neutral file abstraction with private access, quarantine, and lifecycle hooks;
- correction/version/restriction/deletion propagation hooks for source and derived data;
- provider-neutral boundaries for location, retention, export/deletion, subprocessors, and transfers;
- secure backup/restore and incident/breach evidence foundations; and
- controlled Platform Agent boundary, minimum-context interface, provenance, approval linkage, and no customer-data-training assumption.

These are foundation requirements, not implementation work, provider selection, endpoint design, schema design, or Sprint 01 authorisation.

## 23. Blocking Client Questions

Use `sprints/sprint-00/CLIENT_CLARIFICATIONS.md` as the question pack; do not duplicate or answer it here. Privacy-relevant blockers include:

- A1.1–A1.2 — real proof-transaction participants and required onboarding evidence/checks;
- A2.1–A2.2 — I Do Grow commercial capacity and authority context;
- A3.1–A3.2 — authority, signatory identity, legal effect, and transparent acting capacity;
- A5.1–A5.3 — inspection evidence, actor identity/location, visibility, quality decision effects, and remedies;
- A6.1–A6.2 — Lot/Batch identity, provenance, and personal-data propagation through split/combine/transform;
- A7.1 — approval ownership and separation of duties;
- A7.2 — exact role/record/field visibility, including risk, payment, quality, DPP, and internal information;
- A7.3 — controller/processor roles, retention, storage/processing locations, and correction/deletion obligations;
- A8.1–A8.3 — Contract/logistics/custody/delivery/dispute evidence and authority;
- A9.1–A9.2 — invoicing/payment flows, required evidence, instruction control, and Settlement closure;
- A10.1–A10.3 — DPP content, publication/sharing, completeness, and correction governance; and
- A11.1–A11.2 — WhatsApp use, confirmation, copying, draft creation, and handover.

Affected processing design remains **BLOCKED** until authorised client answers and relevant legal/privacy review exist.

## 24. Vendor Assessments Required Later

No vendor is selected. Before selection/use, assess each applicable category:

| Vendor category | Later review dimensions |
|---|---|
| Authentication | Role; DPA; subprocessors; locations/transfers; credential/session data; retention; security/MFA; breach; deletion/export; rights support |
| Cloud/hosting | Role; DPA; subprocessors; regions/support access; transfers; encryption/key responsibilities; backup; deletion/export; incident evidence |
| Object storage | Role; DPA; data location; private access; metadata; scanning; retention/deletion; backup; subprocessors/transfers |
| LLM/AI | Role; DPA; inputs/outputs/logs; subprocessors; locations/transfers; retention/deletion; human access; training/secondary use; security; rights propagation |
| WhatsApp/messaging | Role; terms/DPA; identity/message/media handling; subprocessors; locations/transfers; retention; export/deletion; confirmation and handover |
| Payment | Role; DPA; data and PCI/payment boundaries as applicable; subprocessors; transfers; retention; security; fraud; deletion/export; incident |
| Observability/error monitoring | Role; payload redaction; subprocessors; locations/transfers; retention; access; deletion/export; breach support |
| Email/notification | Role; DPA; recipient/content minimisation; subprocessors; locations/transfers; retention; security; suppression/deletion |
| Analytics, if introduced | Purpose/necessity; role; DPA; identifiers/events; cookies/ePrivacy implications; subprocessors; locations/transfers; retention; rights; deletion/export |

For every category, determine controller/processor relationship, DPA/contract terms, subprocessor list/change control, data location, transfers, retention, security, breach notification, deletion/export, rights assistance, and customer-data training/use where relevant.

## 25. Open Legal / Privacy Questions

### Must resolve before production

- I Do Grow legal entity/capacity and activity-specific controller/joint-controller/processor allocation.
- Processing inventory, purpose, final lawful basis, transparency, and records of processing.
- Role/field/visibility and represented-party matrix.
- Retention/deletion/anonymisation, legal-hold, backup, and historical-evidence rules.
- Data-subject-rights intake, verification, decision, and propagation process.
- Formal DPIA/AIPD screen and DPIA if triggered.
- Incident/breach ownership, procedures, processor routes, register, and competent-authority analysis.
- Provider and international-transfer assessments.
- DPP personal/confidential/public visibility and governance.

### Must resolve before related feature implementation

- required onboarding/identity/payment evidence;
- precise inspection location, signature, and evidence visibility;
- WhatsApp copying, confirmation, handover, media, voice/transcript, and retention rules;
- AI capability data contracts, meaningful review, provider, logs, training/use, evaluation, and rights propagation;
- public Listings and DPP projections;
- analytics/monitoring purpose and scope; and
- payment, logistics, and support integration data flows.

### Can remain deferred during foundation work

- exact vendor selections while provider-neutral boundaries are documented;
- advanced AI training/fine-tuning or retrieval, which is not authorised;
- analytics not required for the proof transaction;
- future countries/products and advanced DPP; and
- exact retention periods while lifecycle hooks and references remain provider-neutral and unpopulated.

### Requires legal/privacy professional review

- GDPR territorial and national-law analysis; competent/lead supervisory authority;
- lawful bases and transparency by processing purpose;
- controller/joint-controller/processor/recipient roles and agreements;
- national tax, commercial, claims, quality, employment, communications, signature, and DPP retention obligations;
- rights versus immutable evidence, audit, DPP provenance, and legal holds;
- DPIA/AIPD and national mandatory-list application;
- international-transfer mechanisms and supplementary measures;
- breach notification and data-subject communication decisions; and
- consent or legitimate-interest use where considered.

## 26. Preliminary Action Register

| ID | Action | Owner role | Timing | Blocking? | Dependency | Evidence required | Status |
|---|---|---|---|---|---|---|---|
| DP-01 | Confirm legal entity/capacity and processing-role map | Client/Business Owner + Legal Counsel/DPO | Before affected contracts/production | Yes | A2, A7.3 | Approved activity-role map | OPEN |
| DP-02 | Approve role/field/visibility and represented-party matrix | Product Owner + Security/Privacy Owner | Before related implementation | Yes | A7.1–A7.2, A10 | Approved matrix and scenarios | OPEN |
| DP-03 | Complete processing inventory, purposes, lawful bases, transparency and recipients | Legal Counsel/DPO + Product Owner | Before real personal data | Yes | Proof transaction and fields | Reviewed processing record | OPEN |
| DP-04 | Approve category retention/deletion/anonymisation and legal-hold schedule | Legal Counsel/DPO + Client/Business Owner | Before production | Yes | Applicable law, claims, DPP | Approved schedule/rationale | OPEN |
| DP-05 | Complete formal DPIA/AIPD screening and DPIA if triggered | Legal Counsel/DPO + Security/Privacy Owner | Before real-data pilot/processing | Yes | Scale, AI, scoring, roles, providers | Signed screening and DPIA if needed | OPEN |
| DP-06 | Define rights and historical-record correction/restriction process | Legal Counsel/DPO + Product Owner | Before production | Yes | DP-03/04; provenance rules | Approved procedure/test scenarios | OPEN |
| DP-07 | Establish incident/breach ownership, procedures, processor channels and register | Security/Privacy Owner + Legal Counsel/DPO | Before production | Yes | Legal roles and providers | Exercised response plan | OPEN |
| DP-08 | Assess each provider and transfer path | Security/Privacy Owner + Legal Counsel/DPO | Before provider selection/use | Yes | Vendor facts | DPA/terms, subprocessors, location/transfer/security evidence | OPEN |
| DP-09 | Approve DPP data classes, visibility, correction and completeness governance | Client/Business Owner + Legal Counsel/DPO + Product Owner | Before DPP implementation/publication | Yes | A10.1–A10.3 | Approved projection/governance rules | OPEN |
| DP-10 | Approve WhatsApp/voice collection, import, confirmation and retention | Product Owner + Legal Counsel/DPO | Before related implementation | Yes | A11; provider facts | Approved channel/data-flow rules | OPEN |
| DP-11 | Review every concrete AI capability before live data | Security/Privacy Owner + Legal Counsel/DPO + Product Owner | Before AI implementation | Yes | Capability/provider/data contract | Privacy assessment, tests, approvals | OPEN |
| DP-12 | Carry safe foundations into an authorised Sprint 01 task specification | Engineering + Security/Privacy Owner | After Sprint 01 authorisation | No current implementation | Approved Sprint 00 outputs | Reviewable specification | PENDING |

Named Project Agents are not assigned as organisational legal owners.

## 27. Assessment Conclusion

Safe Sprint 00 foundation work can define data classification, tenant-aware server authorization, explicit field projections, minimal/private defaults, privacy-aware files, provenance/versioning, lifecycle hooks, redacted audit boundaries, environment separation, synthetic test data, incident evidence, and provider-neutral AI/integration gates.

Blocked matters include the legal/commercial capacity, exact processing roles, lawful bases, final fields and visibility, retention periods, legal holds, proof participants, onboarding/payment evidence, DPP publication, WhatsApp/voice handling, provider data flows, international transfers, and concrete AI scope. These require client clarification and professional legal/privacy review.

The DPIA determination is not complete: **C. DPIA requirement cannot yet be determined.** Formal screening must occur before a real-data pilot or production, and a DPIA/AIPD must be completed before processing if the final facts indicate likely high risk.

This assessment does not claim compliance, change DEC-001, select a vendor, resolve a business rule, create a Platform Agent, authorise Sprint 01, or begin implementation.

## 28. Sources

### Project Sources

- `AGENTS.md` — project authority, Sprint 00, decision, and Builder → Reviewer → QA rules.
- `docs/client/I Do Grow Product and Development Manual.docx` — **PRIMARY CLIENT SOURCE**; especially roles/workflows, onboarding, permissions, security, audit, WhatsApp, files/media, AI, DPP, and MVP scope.
- `docs/client/I Do Grow description.pdf` — **PRIMARY CLIENT SOURCE**; B2B European ecosystem, traceability/DPP, quality, accessibility, and long-term direction.
- `project-memory/PROJECT_CHARTER.md` — actors, MVP proof, scope and unresolved points.
- `project-memory/SOURCE_OF_TRUTH.md` — authority and interpretation rules.
- `project-memory/CURRENT_STATE.md` — Sprint 00 ACTIVE; application NOT STARTED.
- `project-memory/DECISION_LOG.md` — DEC-001 approved architecture and explicit TBD choices.
- `project-memory/ARCHITECTURE.md` — approved system boundaries and provider-neutral integrations.
- `project-memory/DATA_MODEL.md` — conceptual records, provenance, audit and unresolved retention/amendment rules.
- `project-memory/UX_MAP.md` — actor workflows, isolation requirements and permission ambiguities.
- `project-memory/BACKLOG.md` — source-backed MVP capabilities and Sprint 00 assessment status.
- `project-memory/GLOSSARY.md` — domain terms.
- `sprints/sprint-00/API_CONVENTIONS.md` — proposed Sprint 00 API/privacy/security foundation; requires human approval and is not implementation.
- `sprints/sprint-00/CLIENT_CLARIFICATIONS.md` — unresolved questions; not client answers.
- `sprints/sprint-00/LEGACY_AUDIT.md`, `LEGACY_UX_AUDIT.md`, and `VISUAL_REVIEW.md` — legacy evidence only; no target implementation authority.

### External Authoritative Sources

All external sources were accessed **2026-08-19**. No blog, vendor, or generic compliance site is used as regulatory authority.

- **[E1] Regulation (EU) 2016/679 of the European Parliament and of the Council (General Data Protection Regulation)** — European Parliament and Council of the European Union; EUR-Lex. https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
- **[E2] Endorsed WP29 Guidelines** (including WP248 rev.01, Guidelines on Data Protection Impact Assessment and high risk) — European Data Protection Board. https://www.edpb.europa.eu/endorsed-wp29-guidelines_en
- **[E3] Guidelines 07/2020 on the concepts of controller and processor in the GDPR** — European Data Protection Board, final version, 7 July 2021. https://www.edpb.europa.eu/documents/guideline/guidelines-072020-on-the-concepts-of-controller-and-processor-in-the-gdpr_en
- **[E4] Guidelines 4/2019 on Article 25 Data Protection by Design and by Default** — European Data Protection Board, final version, 20 October 2020. https://www.edpb.europa.eu/documents/guideline/guidelines-42019-on-article-25-data-protection-by-design-and-by-default_en
- **[E5] Opinion 28/2024 on certain data protection aspects related to the processing of personal data in the context of AI models** — European Data Protection Board, 18 December 2024. https://www.edpb.europa.eu/documents/opinion-of-the-board-art-64/opinion-282024-on-certain-data-protection-aspects-related-to_en
- **[E6] Ce qu'il faut savoir sur l’analyse d’impact relative à la protection des données (AIPD)** — Commission nationale de l’informatique et des libertés (CNIL), 18 October 2017. https://www.cnil.fr/fr/ce-quil-faut-savoir-sur-lanalyse-dimpact-relative-la-protection-des-donnees-aipd
- **[E7] IA : Tenir compte de la protection des données dans la conception du système** — CNIL, 8 April 2024. https://www.cnil.fr/fr/tenir-compte-de-la-protection-des-donnees-dans-la-conception-du-systeme
- **[E8] Garantir la sécurité des données** — CNIL. https://www.cnil.fr/fr/passer-laction/garantir-la-securite-des-donnees
- **[E9] Lijst verplichte DPIA / Besluit inzake lijst van verwerkingen van persoonsgegevens waarvoor een gegevensbeschermingseffectbeoordeling verplicht is** — Autoriteit Persoonsgegevens, 27 November 2019. https://www.autoriteitpersoonsgegevens.nl/uploads/imported/stcrt-2019-64418.pdf
- **[E10] Datalek? Dit moet u doen** — Autoriteit Persoonsgegevens, updated 27 March 2025. https://autoriteitpersoonsgegevens.nl/themas/beveiliging/datalekken/datalek-dit-moet-u-doen
- **[E11] Les durées de conservation des données** — CNIL. https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees
- **[E12] Retention of personal data** — Autoriteit Persoonsgegevens. https://autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/privacy-and-personal-data/retention-of-personal-data
