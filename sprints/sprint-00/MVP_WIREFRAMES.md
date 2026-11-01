# I Do Grow — MVP Wireframes

## 1. Purpose and Status

These are low-fidelity, implementation-neutral wireframes for **Sprint 00 — Discovery and Foundation**. They establish the minimum screen set, information hierarchy, handoffs, approval visibility, role navigation, responsive priorities, and OPEN dependencies needed to plan the first real MVP transaction.

They are not final visual design, application code, route definitions, a complete design system, or implementation authorisation. Unresolved commercial, legal, quality, permission, privacy, and operational rules remain **OPEN** and are referenced to `CLIENT_CLARIFICATIONS.md` rather than answered here.

The validated legacy direction may inform deep green, warm cream, restrained gold, natural-fibre imagery, cards, status treatments, and an operational portal shell. Legacy workflows, fixtures, unsupported claims, grades, provider settings, toast-only actions, and code are not target authority.

## 2. UX Principles

1. Supplier work is mobile-first, resumable, plain-language, and resilient on constrained connections.
2. Buyer work is professional, comparable, responsive, and may be denser on desktop.
3. The Trader Cockpit is a work queue: actions, blockers, and approvals precede analytics.
4. Navigation is simple, role-specific, and generated from effective authority in the active organisation/capacity.
5. Status, source, version, evidence state, and responsible party are visible in consequential workflows.
6. Human approval is visibly distinct from preparation, submission, AI recommendation, and automated validation.
7. No ambiguous CTA hides legal or commercial effect. Where effect is unresolved, the UI says **OPEN — client clarification required**.
8. A Match is explainable and non-binding; Match approval does not reserve inventory.
9. Listing and Lot remain distinct. Quality authority is primarily Lot/Inspection-centric.
10. AI is assistive and preliminary. It never appears as verified, approved, or independently authoritative.
11. Accessibility begins with semantic hierarchy, keyboard access, visible focus, labelled controls, text status, suitable contrast, and usable touch targets.
12. Low-bandwidth flows favour text-first content, explicit upload progress/retry, saved drafts, and server-confirmed outcomes.
13. Data shown is the minimum server-authorised projection for the active tenant, assignment, transaction, role, and field scope.

## 3. Minimum Screen Inventory

The minimum primary set is **22 REQUIRED_MVP screen families**. A screen family may have server-authorised role projections; this is not a client-side role switch and does not combine permissions.

| # | Screen | Classification | Consolidation rationale |
| ---: | --- | --- | --- |
| 1 | Authentication Entry | REQUIRED_MVP | Shared provider-neutral entry; recovery is a state. |
| 2 | Supplier Home | REQUIRED_MVP | Mobile operational starting point. |
| 3 | Supplier Onboarding / Profile | REQUIRED_MVP | Resumable readiness and evidence flow. |
| 4 | Add Product / Listing | REQUIRED_MVP | Critical guided supply intake. |
| 5 | Supplier My Listings | REQUIRED_MVP | Listing status and correction entry point. |
| 6 | Listing / Lot Detail | REQUIRED_MVP | Role-projected detail while keeping Listing and Lot distinct. |
| 7 | Buyer Marketplace | REQUIRED_MVP | Search and authorised supply projection. |
| 8 | Buyer Listing Detail | REQUIRED_MVP | Buyer-specific evidence and RFQ entry. |
| 9 | Create Buy Order / RFQ | REQUIRED_MVP | Structured demand capture. |
| 10 | Buyer Matches | REQUIRED_MVP | Explainable, non-binding comparison. |
| 11 | Quote Detail | REQUIRED_MVP | Buyer-facing versioned proposal and OPEN response semantics. |
| 12 | Trader Cockpit | REQUIRED_MVP | Attention-first operational hub. |
| 13 | Trader Listing Review | REQUIRED_MVP | Publication review and correction handoff. |
| 14 | Trader Buy Order Review | REQUIRED_MVP | Demand completeness before candidate review. |
| 15 | Trader Match Review | REQUIRED_MVP | Human review without reservation effect. |
| 16 | Trader Quote Workspace | REQUIRED_MVP | Versioned commercial preparation and review. |
| 17 | Trade / Transaction Workspace | REQUIRED_MVP | Shared lifecycle home; Supplier/Buyer details are restricted projections. |
| 18 | Inspector Work Queue | REQUIRED_MVP | Assignment-scoped work entry. |
| 19 | Inspection Detail / Capture | REQUIRED_MVP | Mobile/tablet quality evidence flow. |
| 20 | Shipment Workspace | REQUIRED_MVP | Assignment-scoped execution with role projections. |
| 21 | Basic DPP View | REQUIRED_MVP | Lot-linked authorised passport projection. |
| 22 | Organisations & Access | REQUIRED_MVP | Minimum administration; sensitive actions remain BLOCKED by A7.4. |

### Supporting, not standalone primary screens

| Screen or state | Classification | Treatment |
| --- | --- | --- |
| Notification / approval inbox | SUPPORTING | Global pattern and filtered Cockpit queues. |
| Supplier transaction detail | SUPPORTING | Supplier projection of the Transaction Workspace. |
| Buyer transaction detail | SUPPORTING | Buyer projection of the Transaction Workspace. |
| Settlement status | SUPPORTING | Transaction tab/panel, not a separate primary screen. |
| Compliance / DPP completeness queue | SUPPORTING | Authorised projection in DPP and Transaction work; not Administrator authority. |
| Authentication recovery | SUPPORTING | Authentication Entry state. |
| Documents, evidence, activity, audit | SUPPORTING | Contextual panels; audit remains separately restricted. |
| Trader-assisted / WhatsApp contact | SUPPORTING | Entry and provenance pattern; implementation remains TBD. |

### Deliberately deferred

Advanced analytics, separate Contract and Settlement centres, public marketing redesign, native apps, automated trading, advanced finance, warehouse management, live freight markets, advanced AI control centres, public consumer DPP, non-hemp catalogues, and a full design system are **DEFERRED**.

### Authentication Entry — REQUIRED_MVP wireframe

```text
+----------------------------------+
| I DO GROW              EN FR NL  |
+----------------------------------+
| Sign in                          |
| Email / approved identity [____] |
| Credential              [____]   |
| [ Sign in ]                      |
|                                  |
| Forgot access?  Get support      |
| Provider/mechanics: TBD          |
+----------------------------------+
```

No demo-role selector appears. Authentication does not prove organisation membership, assignment, capacity, or approval authority.

## 4. Navigation Model

Navigation shows only capabilities available in the active server-authorised context. Deep links are independently authorised. Changing organisation or capacity revalidates routes, cached data, drafts, and pending approvals.

### Supplier navigation

`Home · My Products · Add Product · Transactions · Shipments · Payments · Messages`

Products leads to Listings and Lots; Shipment and Payment links may open authorised Transaction projections rather than separate MVP screens.

### Buyer navigation

`Marketplace · My Buy Orders · Matches · Quotes · Transactions · DPP`

Contracts, Shipments, Documents, and DPP remain accessible within Transactions even when not separate primary screens.

### Trader navigation

`Cockpit · Supply · Demand · Matches · Quotes · Trades`

Quality, Logistics, Settlement, approvals, and recommendations are Cockpit queues and Trade tabs in the minimum set.

### Quality Inspector navigation

`Assigned Inspections`

No unrelated Lot, Trade, payment, margin, or private DPP navigation is exposed.

### Logistics Partner navigation

`Assigned Shipments`

Access is assignment- and transaction-scoped.

### Administrator / Compliance navigation

- Administrator: `Organisations & Access · Restricted Activity`
- Compliance Manager: `Assigned Reviews · DPP Completeness`

These remain distinct roles. Administrator is not a business approver; Compliance completeness does not grant publication or final quality authority.

## 5. Supplier Home Wireframe

**Screen 2 — REQUIRED_MVP. Mobile priority: critical.**

```text
+----------------------------+
| I DO GROW       Supplier  ☰ |
| Active org: [Organisation]  |
+----------------------------+
| Needs your attention        |
| [Listing: missing info]     |
| [Transaction: review terms] |
| [Shipment: document needed] |
|                             |
| [ + Add Product ]           |
| [ Contact assigned Trader ] |
|                             |
| My products / Listings      |
| [Product · qty · status >]  |
|                             |
| Current transactions        |
| [Stage · next action     >] |
+----------------------------+
```

Desktop adaptation uses the same hierarchy in a wider two-column shell: Needs Attention and primary actions first; Listings and Transactions second; modest analytics last. Contact/WhatsApp entry shows channel and handover status without implying that a message is binding confirmation.

## 6. Supplier Onboarding Wireframe

**Screen 3 — REQUIRED_MVP. Mandatory documents and readiness rules remain OPEN under A1.2.**

```text
+----------------------------+
| Onboarding       Step 2 / ? |
| [====------] Saved 10:42    |
+----------------------------+
| Organisation & profile     |
| [known field]        [Edit] |
| Production/site info [Add]  |
| Documents            [2]    |
| Missing items     [OPEN]    |
|                             |
| Review status: Incomplete   |
| [ Save and continue later ] |
| [ Upload / take photo ]     |
| [ Ask Trader for help ]     |
| [ Continue ]                |
+----------------------------+
```

The flow is resumable and separates editable declarations from verified information. No document is labelled mandatory unless the proof-transaction answer approves it. Uploads show progress, retry, private/default visibility, and processing state; no storage vendor is exposed.

## 7. Add Product / Listing Flow

**Screen 4 — REQUIRED_MVP. Mobile priority: critical.**

```text
+----------------------------+
| Add Product       Step 3/8  |
| Saved draft · Resume later  |
+----------------------------+
| 1 Product classification ✓  |
| 2 Quantity              ✓   |
| 3 Origin / current location |
|   Origin         [OPEN ___] |
|   Current place  [_______]  |
| 4 Availability               |
| 5 Photos / documents         |
| 6 Preliminary quality        |
| 7 Commercial information     |
| 8 Review and submit           |
|                              |
| Source: Supplier declared    |
| Verification: Not verified   |
| [ Back ] [ Save ] [ Next ]   |
| [ Trader-assisted entry ]    |
+----------------------------+
```

The active seed may present `Natural Fibre → Hemp → Retted Straw` and proposed `Large Rectangular Bale` only with its source/status context; A1.3 remains the proof-classification gate. Exact fields marked OPEN in `HEMP_TAXONOMY.md` or `QUALITY_MODEL.md` are not made mandatory.

Review shows original input, normalized selection where approved, missing information, declared versus verified state, evidence, and the actual actor. Trader assistance adds:

`Prepared by: [Trader] · Acting for: [Supplier organisation] · Confirmation: OPEN`

The final action is **Submit for review**, not publish, reserve, or sell.

## 8. Supplier My Listings

**Screen 5 — REQUIRED_MVP.**

```text
+----------------------------+
| My Listings   [ + Add ]     |
| [Search] [Status filter]    |
+----------------------------+
| RETTED STRAW                |
| Listing L-… · Lot LOT-…     |
| Qty [value + explicit unit] |
| Availability [period]       |
| Quality: Supplier declared  |
| Evidence: Missing / present |
| Status: Pending review      |
| [ Continue ] [ View ]       |
+----------------------------+
| RETTED STRAW                |
| …                           |
+----------------------------+
```

Desktop may use an accessible table with the same fields. Reservation, partial reservation, sold, reversal, and expiry behavior are not finalised; source status vocabulary must not imply an approved trigger or commercial effect.

## 9. Listing / Lot Detail

**Screen 6 — REQUIRED_MVP, with server-authorised Supplier/Trader projections.**

```text
+------------------------------------------------+
| Listing L-…        Market-facing offer          |
| Product · offered qty · availability · price    |
| Publication/review status · authorised actions  |
+------------------------------------------------+
| Physical Lots                                  |
| LOT-…  Traceable qty · origin · current place   |
| Quality authority: Lot / Inspection             |
| [Declared] [Measured] [Human verified] [OPEN]   |
| Evidence date · missing/conflicting warning     |
| [View authorised evidence and provenance]       |
+------------------------------------------------+
| Documents         | Transaction activity        |
| authorised only   | Match/Quote/Trade references|
+------------------------------------------------+
```

Listing commercial information never becomes the physical Lot record. Authoritative quality remains on the Lot/Inspection; the Listing shows only an authorised, dated projection. Exact availability ownership, Lot/Batch semantics, and reservation behavior remain OPEN.

## 10. Buyer Marketplace

**Screen 7 — REQUIRED_MVP.**

```text
+------------------------------------------------+
| Marketplace        [Search products________]    |
| Filters: Form · Origin · Availability · Qty     |
| Quality evidence · Application · More (OPEN)    |
+------------------------------------------------+
| RETTED STRAW                                  > |
| Product form · authorised origin · available qty|
| Quality: Human verified / Declared / Missing    |
| Evidence date · availability · commercial summary|
| [ View details ] [ Create RFQ ]                 |
+------------------------------------------------+
| No internal margin, risk, bank, contact, or      |
| restricted Supplier / Inspection information.   |
+------------------------------------------------+
```

Grade filtering is source-supported but remains unconfigured until a grade vocabulary is approved. Advanced match weighting and internal commercial data are absent.

## 11. Listing Detail for Buyer

**Screen 8 — REQUIRED_MVP.**

```text
+------------------------------------------------+
| Retted Straw · Listing L-…                      |
| Product form · origin · availability · quantity |
| Commercial information: authorised projection   |
+------------------------------------------------+
| Lot-linked quality summary                      |
| Evidence state · date · source/verification      |
| Grade: only if approved and human verified       |
| Certificates/documents: authorised references   |
| [View evidence summary]                          |
+------------------------------------------------+
| DPP preview: authorised fields only              |
| [ Create Buy Order / RFQ ]                       |
| No “Buy Now”                                     |
+------------------------------------------------+
```

Supplier personal contacts, precise farm coordinates, private files, internal completeness/risk, internal margins, and detailed restricted Inspection evidence are excluded by default.

## 12. Create Buy Order / RFQ

**Screen 9 — REQUIRED_MVP.**

```text
+------------------------------------------+
| Create Buy Order / RFQ       Step 1 / ?  |
+------------------------------------------+
| Product requirement       [___________]   |
| Quantity + unit           [___________]   |
| Destination               [___________]   |
| Requested dates           [___________]   |
| Quality requirements      [Optional >]    |
| Packaging / logistics     [Optional >]    |
| Commercial preferences    [Optional >]    |
| Certifications / DPP      [Optional/OPEN] |
|                                          |
| [ Save draft ] [ Review ]                 |
+------------------------------------------+
```

Quality requirements reference approved definitions and explicit units. No threshold, method, grade, certificate, payment term, packaging rule, or other OPEN item becomes a default mandatory requirement. Review distinguishes requirements from preferences and shows who prepared the request and for which Buyer.

## 13. Buyer Matches

**Screen 10 — REQUIRED_MVP. Match is visibly non-binding.**

```text
+------------------------------------------------+
| Candidate Matches for Buy Order BO-…            |
| NON-BINDING · No inventory is reserved          |
+------------------------------------------------+
| Candidate A        | Candidate B                |
| Listing / Lot      | Listing / Lot              |
| Compatibility      | Compatibility              |
| Quality evidence   | Missing / conflicting      |
| Landed cost        | Estimated / confirmed      |
| Delivery feasible? | Uncertain                  |
| Why this match >   | Why this match >           |
| Human review: …    | Human review: …            |
+------------------------------------------------+
| [ Request Quote / continue ]                     |
+------------------------------------------------+
```

Comparison may show satisfied, not satisfied, missing/unknown, and incomparable/conflicting concepts, subject to final vocabulary approval. It does not display advanced weights, guarantee compliance, or infer reservation, sale, Contract formation, or Buyer acceptance.

## 14. Quote Detail

**Screen 11 — REQUIRED_MVP.**

```text
+------------------------------------------------+
| Quote Q-… · Version 3 · Status [source state]    |
| Parties and acting capacity                      |
| Validity [date / OPEN meaning]                    |
+------------------------------------------------+
| Product / Lot / quantity                         |
| Cost breakdown                                   |
| Product             [confirmed / estimated]      |
| Freight             [confirmed / estimated]      |
| Other approved lines [source · currency · date]  |
| Total landed cost                                |
+------------------------------------------------+
| Quality conditions · logistics assumptions       |
| Missing evidence / unresolved conditions          |
| Change history · previous versions                |
+------------------------------------------------+
| [ Counter ] [ Reject ]                            |
| [ OPEN — client clarification required ]          |
+------------------------------------------------+
```

The final response control does not say **Accept and Buy**. Quote issuance/acceptance authority and legal effect remain OPEN under A3. Buyer-visible charges and confidential internal margin use distinct projections; their exact boundary remains OPEN.

## 15. Trader Cockpit

**Screen 12 — REQUIRED_MVP. Operational desktop cockpit, responsive.**

```text
+------------------------------------------------------------+
| I DO GROW | Org / Trader / active capacity | Search | User |
+------------+-----------------------------------------------+
| Cockpit    | NEEDS ATTENTION                               |
| Supply     | [Listings review] [Matches review] [Quotes]   |
| Demand     | [Quality issues] [Delayed shipments]          |
| Matches    | [Settlement evidence] [AI review required]    |
| Quotes     +-----------------------------------------------+
| Trades     | OPERATIONAL QUEUES                            |
|            | Open Buy Orders · Proposed Matches            |
|            | Active Trades · At-risk transactions          |
|            +-----------------------------------------------+
|            | SAFE QUICK ACTIONS                            |
|            | Request info · Prepare draft · Assign inspection|
|            | Request freight quote                         |
|            +-----------------------------------------------+
|            | Secondary: modest operational metrics         |
+------------+-----------------------------------------------+
```

Cards expose only minimum task information; opening a row reauthorises its projection. Platform-wide operational visibility does not mean all-record/all-field access. AI recommendations are visually separate and never appear completed.

## 16. Trader Listing Review

**Screen 13 — REQUIRED_MVP.**

```text
+------------------------------------------------+
| Listing review L-… · Supplier [authorised view] |
| Acting as: I Do Grow reviewer · version [v…]    |
+------------------------------------------------+
| LISTING              | LOT                      |
| Offer / availability | Identity / provenance    |
| Commercial summary   | Physical quantity        |
+------------------------------------------------+
| Quality evidence                                |
| Supplier declared · Measured · Observed          |
| Document-backed · AI preliminary                 |
| Human verified · Final grade if approved         |
| Missing / stale / conflicting                    |
+------------------------------------------------+
| Documents · completeness · review history        |
| [ Request correction ] [ Reject with reason ]    |
| [ Approve for publication ]                      |
| Effect beyond publication: OPEN                  |
+------------------------------------------------+
```

Publication review is not final-grade approval, reservation, or sale. `quality manager` is not silently mapped to Inspector or Compliance Manager.

## 17. Trader Match Review

This section contains the two distinct REQUIRED_MVP screens used at the demand-to-Match handoff.

### Screen 14 — Trader Buy Order Review

```text
+------------------------------------------------+
| Buy Order BO-… · Buyer [authorised projection]  |
| Prepared by / acting for / version / status     |
+------------------------------------------------+
| Product · quantity · destination · dates         |
| Quality · packaging · logistics requirements     |
| Commercial preferences · missing information     |
| Sharing / authority state                         |
| [ Request clarification ] [ Mark ready for Match ]|
+------------------------------------------------+
```

`Mark ready for Match` is a workflow preparation label, not approval of a transaction.

### Screen 15 — Trader Match Review

```text
+------------------------------------------------+
| Match M-… · NON-BINDING · No reservation        |
+------------------------------------------------+
| Buyer requirements | Candidate Listing / Lot     |
| Compatibility      | Evidence strength / gaps    |
| Landed cost snapshot: source / currency / status |
| Delivery feasibility · missing assumptions       |
| Explanation · human review history               |
+------------------------------------------------+
| [ Request information ] [ Reject ] [ Rematch ]   |
| [ Approve for Quote preparation — non-binding ]  |
+------------------------------------------------+
```

Approval does not reserve inventory, accept quality commercially, create a Trade, or bind a party.

## 18. Trader Quote Workspace

**Screen 16 — REQUIRED_MVP.**

```text
+------------------------------------------------------------+
| Quote workspace Q-… · Version 3                            |
| Signed in: Trader · Acting organisation: [I Do Grow]       |
| Capacity: [I Do Grow / for Supplier / for Buyer]           |
| Represented party / mandate: [recorded / missing / OPEN]   |
+------------------------------------------------------------+
| Product · Lot · quantity | Buyer / Supplier                |
| Cost lines               | Quality assumptions             |
| Product                  | Inspection checkpoint: OPEN     |
| Freight                  | Evidence / conditions           |
| Other approved lines     | Freight assumptions             |
| Internal margin [restricted projection]                    |
+------------------------------------------------------------+
| Approval state · history · previous version · blockers      |
| [ Save draft ] [ Submit for internal review ]               |
| Quote issuance authority/effect: OPEN                       |
+------------------------------------------------------------+
```

Each cost shows source, currency, basis, as-of/validity, and estimated or confirmed state. Calculations are deterministic; AI may explain but not authoritatively calculate them.

## 19. Trade / Transaction Workspace

**Screen 17 — REQUIRED_MVP and the Trader's main transaction workspace. Supplier and Buyer transaction details are server-authorised projections of this family.**

```text
+------------------------------------------------------------+
| Trade / Transaction T-… · Current stage [text]              |
| Actual actor · active org/capacity · parties                |
| Needs attention: [blockers] [approvals] [changed version]   |
+------------------------------------------------------------+
| Overview | Quote | Quality | Contract | Shipment            |
| Settlement | DPP | Documents | Activity                     |
+------------------------------------------------------------+
| Participants and represented capacity                       |
| Listing L-…  →  Lot LOT-…                                   |
| Current handoff owner · next permitted action               |
| Quality checkpoint: OPEN / branchable                       |
| Possible: pre-Quote · conditional · pre-Contract            |
|           pre-Shipment · destination · multiple             |
| Contract: draft / human review state; signature authority OPEN|
| Shipment: status / exceptions; release authority OPEN       |
| Settlement: administrative status/evidence only             |
| DPP: completeness / visibility / publication OPEN           |
+------------------------------------------------------------+
| Timeline: source · actor · capacity · event · version        |
| User activity projection ≠ restricted immutable audit       |
+------------------------------------------------------------+
```

Tabs do not collapse the underlying concepts. An Inspection result does not automatically publish/reject a Listing, change a Quote, release a Shipment, create a claim, or settle a Trade. Supplier and Buyer projections omit internal margin, internal reasoning, unrelated evidence, and restricted audit/security data.

## 20. Inspector Work Queue

**Screen 18 — REQUIRED_MVP. Assignment-scoped only.**

```text
+----------------------------------------------+
| Assigned Inspections · Inspector / active org|
| [Date] [Status] [Search assigned tasks]       |
+----------------------------------------------+
| Inspection I-…                               |
| Lot LOT-… · Retted Straw                     |
| Necessary location · scheduled/due info      |
| Template/version · workflow status           |
| Operational priority (not quality severity)  |
| [ Open inspection ]                          |
+----------------------------------------------+
```

No prices, margins, payments, unrelated Trades/Lots, internal risk reasoning, security audit data, or private DPP fields are shown.

## 21. Inspection Detail / Capture

**Screen 19 — REQUIRED_MVP. Mobile/tablet priority: critical.**

```text
+----------------------------------------------+
| Inspection I-… · Lot LOT-… · Status          |
| Assigned to [Inspector] · Template v…         |
| Checkpoint: OPEN · Saved locally/server state |
+----------------------------------------------+
| 1 Instructions / context              ✓      |
| 2 Measurements [definition · value · unit]   |
| 3 Observations  [controlled/free evidence]   |
| 4 Photos / documents [upload · retry]        |
| 5 Non-Conformities [record; consequence OPEN]|
| 6 Review exact evidence/result version       |
|                                               |
| Declared ≠ Measured ≠ Observed                |
| Document-backed ≠ AI Preliminary             |
| [ Save draft ] [ Submit findings ]            |
+----------------------------------------------+
| Human verification / final grade              |
| Separate permission-controlled panel          |
| Grade vocabulary / authority / rule: OPEN     |
+----------------------------------------------+
```

Method/version, equipment, sample, location precision, certificate/report action, and grade control appear only where applicable and authorised. No threshold, grade, method, sampling plan, equipment rule, mandatory certificate, or consequence is invented.

## 22. Shipment Workspace

**Screen 20 — REQUIRED_MVP, with server-authorised Trader/Logistics/Supplier/Buyer projections.**

```text
+------------------------------------------------+
| Shipment S-… · Assigned context · Status [text] |
| Route: pickup → transit/customs → delivery      |
| Parties · Lot LOT-… · necessary contacts only  |
+------------------------------------------------+
| Timeline                                        |
| Pickup [event/evidence]                         |
| Transit [event/evidence]                        |
| Customs [where applicable]                      |
| Delivery [event/evidence]                       |
+------------------------------------------------+
| Documents · handling requirements · exceptions |
| Delay / damage / shortage [Record evidence]     |
| Carrier selection ≠ binding booking             |
| Shipment release / delivery authority: OPEN     |
+------------------------------------------------+
```

The Logistics Partner sees only the assigned Shipment, minimum handling/release quality projection, and necessary documents. Competing freight quotes, margins, bank/payment data, unrelated Contract data, and detailed quality evidence remain hidden.

## 23. Settlement Status

Settlement is **SUPPORTING** and embedded in Screen 17 rather than a standalone primary screen.

| Embedded panel | MVP presentation |
| --- | --- |
| Invoices | Authorised references and status only. |
| Expected amounts | Explicit amount/currency; source and basis. |
| Due dates | Date plus status; no invented payment term. |
| Payment evidence | Recorded/awaiting/disputed with restricted evidence access. |
| Deposits/balances | Only where approved for the proof transaction. |
| Claims/credits | Administrative state; authority and consequences OPEN. |
| Closure | Owner and closing rule OPEN under A9. |

Actions use **Record payment evidence/status**, never **Pay**, **Release funds**, or escrow language. The MVP does not imply that I Do Grow holds funds or acts as a regulated payment institution.

## 24. Basic DPP View

**Screen 21 — REQUIRED_MVP.**

```text
+------------------------------------------------+
| Digital Product Passport · Lot LOT-… · Version |
| Viewing authorised [server-derived] projection |
+------------------------------------------------+
| Lot identity · Product/Form                     |
| Origin / producer information where authorised |
| Quality events · verification state             |
| Human-approved grade, where applicable          |
| Certificate/report references, where authorised|
| Transaction / custody events                    |
| Shipment / delivery events                      |
| Provenance · corrections · version history      |
+------------------------------------------------+
| Visibility/publication: OPEN                    |
| [ Download same authorised projection ]         |
+------------------------------------------------+
```

The user cannot switch to a broader projection. Public/shareable, transaction-party, restricted compliance/evidence, and confidential commercial projections remain separate. Personal names, contacts, signatures, precise locations, private media, bank/payment evidence, margins, and internal reasoning are not public by default.

## 25. Administrator / Compliance Minimum

**Screen 22 — Organisations & Access is REQUIRED_MVP but governance-sensitive actions remain BLOCKED by A7.4. Compliance completeness uses SUPPORTING DPP/Transaction projections.**

```text
+------------------------------------------------+
| Organisations & Access · Administrator context |
| [Organisations] [Users] [Memberships] [Reviews]|
+------------------------------------------------+
| User / organisation membership                 |
| Membership verification: [OPEN / review state] |
| Requested/current role · scope · expiry         |
| Sensitive access review · restricted activity  |
+------------------------------------------------+
| Grant / change / revoke authority: BLOCKED A7.4|
| Second approval: OPEN                           |
| Multi-role conflict rule: OPEN                  |
| [ View request ] [ Record review when authorised]|
+------------------------------------------------+
```

This is not an analytics dashboard. Administrator does not receive business approval authority. Compliance Manager may review assigned documentation and DPP completeness but cannot automatically publish DPP, approve final quality, make legal conclusions, or inherit Administrator authority.

## 26. Global UX Patterns

The reusable foundation is intentionally smaller than a design system:

| Pattern | Rule |
| --- | --- |
| App shell | Active organisation, role/capacity, language, and represented party remain visible. |
| Sidebar/navigation | Capability-derived; deep links reauthorised. |
| Status badge | Text plus icon; scope and meaning stated. |
| Needs Attention card | Minimum safe summary, owner, blocker, due context, next permitted action. |
| Approval card | Object/action/version, preparer/capacity, evidence, consequence, confirmer, history. |
| Data table / mobile card | Same semantic content and accessible labels across breakpoints. |
| Search/filter bar | Allowlisted filters; no restricted result counts or existence leakage. |
| Timeline | Event, actor/capacity, source, time, version; user projection is not full audit. |
| Evidence panel | Declared, measured, observed, document, AI, human verification, final grade separated. |
| Audit/provenance panel | Restricted projection with correction/supersession links. |
| Empty/error/denied | Honest state, no toast-only success, safe recovery. |
| Confirmation dialog | Exact action, version, consequence or OPEN status, acting capacity. |
| AI recommendation | Preliminary label, evidence/confidence, gaps, human correct/reject controls. |

## 27. Status Presentation

Status always uses text, and colour/iconography is secondary. The UI must identify what the status applies to: Listing workflow, Inspection workflow, evidence verification, Grade decision, Quote version, Shipment, or Settlement.

| Display state | Meaning boundary |
| --- | --- |
| Draft | Saved work; not submitted or authoritative. |
| Pending review | Submitted version awaiting a named/OPEN review gate. |
| Approved | Must name the object/action; never a generic transaction-wide conclusion. |
| Rejected | Must state scope and safe reason/recovery where authorised. |
| Incomplete | Required information under the approved rule is absent. |
| Blocked | Cannot proceed because an explicit prerequisite or authority is unresolved. |
| Informational | No action or approval implied. |
| AI recommendation | Preliminary machine proposal only. |
| Human verified | Exact evidence/result version reviewed by an authorised human. |

Source-listed lifecycle words such as `reserved`, `sold`, `accepted`, or `converted to contract` are not treated as approved triggers or consequences until clarified.

## 28. Human Approval UX

Every approval surface shows:

- what exact action and resource/version is being approved;
- who prepared/submitted it and in which organisation/capacity;
- represented party and mandate/confirmation state;
- evidence, source, uncertainty, and changes from the previous version;
- consequence, or **OPEN — client clarification required**;
- reviewer/final authority and separation-of-duties state;
- specific approve/reject/request-change controls only when authorised; and
- confirmation for approved high-risk actions.

Preparation, submission, review, final approval, execution, and correction remain visibly distinct. An AI proposal never shares the styling or wording of completed human approval.

## 29. Acting-on-Behalf-of UX

Use a persistent banner and repeat it at consequential confirmation:

```text
Signed in as: [actual Trader]
Acting organisation: [organisation]
Capacity: [I Do Grow / for Supplier / for Buyer]
Represented party: [organisation, if applicable]
Mandate/authority: [recorded / missing / OPEN]
Prepared by: [Trader]
Requires confirmation from: [OPEN / approved authority]
Binding effect: [non-binding / binding / OPEN]
```

Represented-party work never uses account impersonation, shared credentials, or hidden actor replacement. Switching context is explicit, warns about unsaved work, and clears/revalidates protected content and approvals.

## 30. Mobile Strategy

Must be excellent on mobile:

- Supplier onboarding and profile completion;
- Add Product / Listing and evidence uploads;
- Listing status, missing-information response, and Trader communication;
- Supplier transaction and Shipment status projections;
- Inspection capture on mobile/tablet where relevant; and
- Shipment event/evidence capture where relevant.

Buyer and Trader experiences remain responsive but may use denser desktop tables, comparison columns, and persistent contextual navigation. On narrow screens they become ordered cards with sticky, non-overlapping actions.

Low-bandwidth foundations are text-first payloads, explicit saved state, progressive loading, resumable drafts, compressed previews, upload progress/retry, and honest server-confirmation. Exact offline capability, supported browsers/devices, and background synchronization remain OPEN.

## 31. Accessibility Baseline

- Keyboard-accessible navigation, forms, dialogs, tabs, tables, and actions.
- Semantic headings, landmarks, labels, instructions, and logical reading order.
- Visible focus and focus return after dialogs or route changes.
- Sufficient contrast; meaning is never colour-only.
- Errors linked to fields and summarised; dynamic changes announced.
- Touch targets suitable for mobile and no gesture-only control.
- Responsive zoom and reflow without hiding consequential information.
- Readable typography and room for English, Dutch, and French expansion.
- Text alternatives for evidence imagery and nonvisual alternatives for charts/timelines.

The exact WCAG target remains **OPEN** under A12.1. These foundations do not claim a conformance level.

## 32. Legacy Visual Reuse

### KEEP VISUAL DIRECTION

- deep green, warm cream, and restrained gold brand direction, subject to contrast review;
- natural-fibre/product imagery, subject to rights and factual-representation review;
- restrained cards and rounded corners;
- sidebar/portal shell concept;
- status and attention cards; and
- Trader dashboard shell and consolidated transaction-overview concept.

### REDESIGN INFORMATION ARCHITECTURE

All critical workflows, mobile Supplier forms, role projections, work queues, approval semantics, lifecycle states, evidence hierarchy, and error/empty/permission states require redesign.

### DO NOT COPY IMPLEMENTATION

Do not carry forward fixtures, demo-role switching, toast-only actions, unsupported grades/certificates, hard-coded commercial values, provider placeholders, regex parsing as operational AI, or shortcuts that collapse Product, Listing, Lot, Order, Trade, and DPP.

This task does not continue the 42-screen review or claim final visual approval.

## 33. Deferred Screens

- Public marketing, content-management, and consumer experiences.
- Separate dashboards for analytics, finance, Settlement, or DPP publication.
- Advanced Supplier/Buyer relationship directories.
- Standalone Contract, invoice, document-centre, notification-centre, and audit-centre screens unless later evidence requires them.
- Multi-supplier optimisation, load/warehouse planning, real-time freight markets, and customs automation.
- Native iOS/Android experiences.
- Automated trading, legal decisions, quality approvals, credit decisions, and payment release.
- Advanced Platform Agent control centres and autonomous actions.
- Advanced finance, escrow, banking, derivatives, carbon credits, and insurance workflows.
- Public consumer DPP and rich sustainability/end-of-life views.
- Non-hemp catalogues and later hemp products/forms.
- Full design system and pixel-perfect visual specifications.

## 34. Open UX Questions

Use `CLIENT_CLARIFICATIONS.md`; do not duplicate its 29 Priority A questions.

### BLOCKING before final UX approval

- A1: proof transaction, onboarding evidence, and approved product classification.
- A2–A4: I Do Grow capacity, Quote/Contract effect, authority, reservation, and sold behavior.
- A5–A6: quality rules/checkpoints/authority/consequences and Lot/Batch behavior.
- A7.1–A7.4: named authority, field visibility, privacy roles, sensitive-role governance, and role conflicts.
- A8–A10: Contract/logistics, Settlement, and DPP completeness/visibility/publication.
- A11 where WhatsApp is in the proof transaction.

### Can remain open during Sprint 01 foundation

- Exact offline behavior and supported-device/browser matrix.
- Exact WCAG target under A12.1 while safe accessibility foundations proceed.
- Notification preview policy and detailed audit projection, within A7/privacy review.
- Whether later usability evidence warrants splitting combined screen families.

### Deferred

Advanced matching weights, automation, analytics, provider integrations, later products/countries, and richer public DPP experiences.

## 35. Screen-to-Workflow Traceability

| Workflow step | Primary screen | Actor | Required MVP? | OPEN dependency |
| --- | --- | --- | --- | --- |
| Sign in | Authentication Entry | All users | Yes | Provider/mechanics TBD |
| Supplier readiness | Supplier Onboarding | Supplier/Trader | Yes | A1.2, A7 |
| Supply intake | Add Product / Listing | Supplier/Trader | Yes | A1.3, A5, A11 |
| Listing status/correction | My Listings; Listing/Lot Detail | Supplier/Trader | Yes | A4, A5, A6 |
| Publication review | Trader Listing Review | Trader / OPEN quality-manager mapping | Yes | A5, A7 |
| Buyer search | Marketplace; Buyer Listing Detail | Buyer | Yes | A7.2, A10 |
| Buyer demand | Create Buy Order / RFQ | Buyer/Trader | Yes | A3, A5, A7 |
| Demand readiness | Trader Buy Order Review | Trader | Yes | A7 |
| Candidate comparison | Buyer Matches | Buyer | Yes | Matching rules remain non-binding |
| Human Match review | Trader Match Review | Trader | Yes | A3, A4, A7 |
| Quote preparation | Trader Quote Workspace | Trader | Yes | A2, A3, A7, A8 |
| Quote response | Quote Detail | Buyer/party | Yes | A3 |
| Quality work | Inspector Queue; Inspection Capture | Inspector/reviewer | Yes | A5–A7 |
| Contract and overall handoff | Transaction Workspace | Parties/Trader | Yes | A3, A7, A8 |
| Shipment execution | Shipment Workspace | Logistics/Trader/parties | Yes | A8 |
| Settlement tracking | Transaction Workspace tab | Authorised parties | Supporting | A9 |
| DPP access/completeness | Basic DPP; Transaction Workspace | Compliance/parties | Yes | A10 |
| User/access support | Organisations & Access | Administrator | Yes | A7.4 |

Every major first-transaction step has a UI home without making every entity a standalone route.

## 36. Screen-to-Permission Traceability

| Screen family | Principal constraint |
| --- | --- |
| Authentication | Identity only; no role/organisation authority inferred. |
| Supplier screens | Own organisation/resource plus explicitly shared transaction projections. |
| Marketplace / Buyer Listing | Approved Marketplace projection; restricted Supplier/internal fields excluded. |
| Buyer demand, Matches, Quote | Own organisation/transaction; Match non-binding; authority/effect OPEN. |
| Trader screens | Purpose-scoped internal or represented-party context; no blanket authority. |
| Inspector screens | Assigned Inspection/Lot and necessary context only. |
| Shipment | Assigned Shipment/transaction; role-specific minimum projection. |
| Transaction Workspace | Server-produced projection by active relationship/capacity/field scope. |
| Basic DPP | Server-derived visibility projection; publication does not follow from completeness. |
| Organisations & Access | Administrative scope; business approval denied by default; A7.4 BLOCKING. |

All sensitive authorization is server-side, tenant-aware, least-privilege, and deny-by-default. Frontend hiding/disabled states do not grant or enforce authority.

## 37. Screen-to-Data Traceability

| Critical screen | Primary conceptual records consumed |
| --- | --- |
| Add Product / Listing | Product, Listing, Lot, Quality declaration, Document, Audit |
| Listing / Lot Detail | Product, Listing, Lot, Inspection, Quality, Document, DPP, Audit |
| Marketplace / Buyer Detail | Product, Listing, authorised Lot/Quality/DPP projections |
| Buy Order / RFQ | Buy Order, Product, Quality requirement, Approval, Audit |
| Matches | Buy Order, Match, Listing, Lot, Quality, landed-cost snapshot, Approval |
| Quote Detail / Workspace | Quote/version, Match, Lot, cost lines, Approval, Audit |
| Transaction Workspace | Trade, Quote, Contract, Lot, Quality, Shipment, Settlement, DPP, Approval, Audit |
| Inspector screens | Lot, Inspection, Template/version, Quality Result, Evidence, Non-Conformity, Approval |
| Shipment Workspace | Shipment, Lot, Trade/Contract projection, Documents, events, Audit |
| Basic DPP | DPP/version, Lot, Quality events, transaction/custody/Shipment events, provenance |
| Organisations & Access | Organisation, User, Membership, Role/capability assignment, Approval, Audit |

This is conceptual traceability only. It does not define a schema, endpoint, route, component, storage design, or cardinality.

## 38. Required MVP Wireframe Set

| # | Screen | Role | Purpose | Mobile priority | Blocking dependency |
| ---: | --- | --- | --- | --- | --- |
| 1 | Authentication Entry | Shared | Provider-neutral access | High | Auth mechanics TBD |
| 2 | Supplier Home | Supplier | Tasks and transaction entry | Critical | Field/authority projection |
| 3 | Supplier Onboarding | Supplier/Trader | Resumable readiness | Critical | A1.2, A7 |
| 4 | Add Product / Listing | Supplier/Trader | Guided supply intake | Critical | A1.3, A5, A11 |
| 5 | Supplier My Listings | Supplier | Status and correction | Critical | A4–A6 |
| 6 | Listing / Lot Detail | Supplier/Trader | Separate offer, physical Lot, evidence | High | A4–A7 |
| 7 | Buyer Marketplace | Buyer | Search authorised supply | Medium | A7.2 |
| 8 | Buyer Listing Detail | Buyer | Evaluate authorised offer | Medium | A5, A7.2, A10 |
| 9 | Create Buy Order / RFQ | Buyer/Trader | Structure demand | Medium | A3, A5, A7 |
| 10 | Buyer Matches | Buyer | Compare non-binding candidates | Medium | Matching inputs/visibility |
| 11 | Quote Detail | Buyer/party | Review versioned proposal | Medium | A3 |
| 12 | Trader Cockpit | Trader | Prioritise work and blockers | Responsive desktop | A7 projections |
| 13 | Trader Listing Review | Trader | Publication review | Responsive desktop | A5, A7 |
| 14 | Trader Buy Order Review | Trader | Validate demand readiness | Responsive desktop | A7 |
| 15 | Trader Match Review | Trader | Human non-binding review | Responsive desktop | A3, A4, A7 |
| 16 | Trader Quote Workspace | Trader | Prepare/review Quote | Responsive desktop | A2, A3, A7, A8 |
| 17 | Trade / Transaction Workspace | Trader/role projections | Operate full lifecycle | Responsive desktop | A2–A10 |
| 18 | Inspector Work Queue | Inspector | Open assigned tasks | High | A5, A7 |
| 19 | Inspection Detail / Capture | Inspector/reviewer | Record structured evidence | Critical | A5–A7 |
| 20 | Shipment Workspace | Logistics/role projections | Record Shipment events/evidence | High | A8 |
| 21 | Basic DPP View | Authorised viewers | View Lot passport projection | Medium | A10, privacy review |
| 22 | Organisations & Access | Administrator | Minimum membership/access support | Low/desktop | A7.4 BLOCKING |

**Final REQUIRED_MVP count: 22.** Full wireframes in this document are limited to these screens. Settlement, Supplier/Buyer transaction views, notifications, Compliance completeness, documents, and audit are supporting projections/patterns, not additional primary screens.

## 39. Specialist Perspectives

### Mariama

Mariama recommended a 22-screen ceiling built from consolidated, role-projected screen families. She prioritised mobile Supplier flows, explicit acting capacity, accessibility, low-bandwidth recovery, an attention-first Trader Cockpit, and separate Administrator/Compliance responsibilities. She proposed making administration and Compliance completeness primary; consolidation retains administration as required and DPP completeness as a supporting authorised projection.

### Cheikh

Cheikh confirmed that every proof-transaction step needs a UI home and that Match, Quote, Contract, quality, Shipment, Settlement, and DPP semantics must not be inferred through CTA text. He proposed 22 screens with separate Supplier/Buyer transaction details and combined Trader demand/Match review. Consolidation instead uses one role-projected Transaction family and keeps Buy Order/Match reviews distinct for traceability.

### Babacar

Babacar required an operational Trader Cockpit, explicit represented-party capacity, non-binding Match review, versioned Quote preparation, a consolidated Trade workspace, a dedicated assignment-scoped Shipment surface, and embedded administrative Settlement status. He stressed the unresolved boundary between transparent external fees and confidential internal margin.

### Sokhna

Sokhna required Lot/Inspection-centric quality, two minimum Inspector screens, explicit separation of declaration, measurement, observation, document evidence, AI preliminary assessment, human verification, and final grade, plus branchable inspection timing and provenance-aware DPP projections. No threshold, grade, method, mandatory certificate, or consequence may be invented.

### Abdoulaye

Abdoulaye required server-authorised tenant/role/field projections, deny-by-default navigation, assignment-scoped Inspector/Logistics views, safe permission and notification states, restricted audit separation, privacy-minimised DPP, and BLOCKED sensitive-role controls under A7.4. He found the 22-screen ceiling security-compatible.

### Mamadou if invoked

Mamadou was **not invoked**. No wireframe introduced a material architecture conflict: the foundation remains consistent with DEC-001's responsive frontend, controlled versioned REST/backend boundary, backend authorization, human approval, audit, and no direct Platform Agent mutation.

## 40. Agreements

All five specialists agreed that:

- the minimum set should remain at or below 22 primary screens;
- Supplier flows are mobile-first and Buyer/Trader flows remain responsive;
- the Trader Cockpit is work-queue-first, not analytics-first;
- Buyer demand proceeds through non-binding Match and versioned Quote;
- Listing and Lot remain separate and quality is Lot/Inspection-centric;
- human approval, provenance, version, and acting capacity must be visible;
- AI remains preliminary and visually distinct from approved information;
- Trader assistance does not create binding authority;
- Administrator and Compliance Manager authority remain separate;
- Shipment deserves a dedicated assignment-scoped execution surface;
- Settlement is embedded administrative tracking, not banking or escrow;
- no threshold, grade, laboratory method, mandatory certificate, authority, permission, legal effect, or client answer may be invented;
- existing client clarification questions cover the material gaps; and
- no architecture decision or Decision Log update is required by this analysis.

## 41. Disagreements

No blocking specialist disagreement remains. The consolidation preserves these design tensions:

1. **Role-specific screens versus MVP economy:** Cheikh favoured separate Supplier and Buyer transaction details; Mariama and Abdoulaye favoured role-projected families. The final model uses one Transaction family with server-authorised projections, avoiding permission union or a client-side “view as” control.
2. **Demand review consolidation:** Cheikh/Mariama considered combining Trader Buy Order and Match review. The final set keeps two screens because requirements readiness and candidate approval are distinct handoffs, while still meeting the 22-screen ceiling through transaction consolidation.
3. **Administration and Compliance:** Mariama proposed two primary screens. The final set keeps Organisations & Access required and embeds Compliance/DPP completeness as an authorised supporting projection so Compliance is not silently merged with Administrator.
4. **Quote transparency versus confidential margin:** Both requirements are source-backed; exact external fee/commission versus internal margin projection remains OPEN.
5. **Trader platform-wide visibility versus least privilege:** Broad operational queue visibility does not imply unrestricted all-field access; exact projections remain OPEN.
6. **Inspector grade capability versus final authority:** The role family is source-supported, but eligibility, independence, second approval, and consequence remain OPEN.

## 42. Formal Approval Required?

Safe UX foundations to carry into later Sprint 01 planning after human approval are:

- the bounded 22-screen inventory;
- mobile-first Supplier flows and responsive Buyer/Trader work;
- attention-first Trader Cockpit and consolidated Transaction workspace;
- non-binding Match and visible OPEN Quote response semantics;
- Listing/Lot and evidence/approval separation;
- assignment-scoped Inspector and Logistics experiences;
- acting-capacity, provenance, version, accessibility, low-bandwidth, and safe error patterns;
- authorised, privacy-minimised field and DPP projections; and
- legacy visual-direction-only reuse.

Client/business/domain/security/privacy and, where appropriate, legal approval remains required before finalising binding Quote/Contract actions, Trader mandates, reservation/sold behavior, quality rules/checkpoints/approvers/consequences, field visibility, sensitive-role governance, carrier booking/Shipment release/delivery, payment/Settlement authority, and DPP completeness/publication.

No `DECISION_LOG.md` entry is required from these wireframes. DEC-001 remains approved and unchanged.

## 43. Next Action

Before Sprint 00 can close, human reviewers must:

1. review and approve or amend the 22-screen boundary and consolidated screen families;
2. validate the wireframes with a real Supplier, Buyer, Trader, quality operator, logistics operator, and authorised privacy/security representative;
3. answer or assign owners/dates for the blocking proof-transaction questions in A1–A11, especially authority/visibility A7.1–A7.4;
4. confirm final CTA semantics, quality checkpoints, Contract/Shipment/Settlement gates, and DPP projection for the selected real transaction;
5. confirm the accessibility target under A12.1 and the proof users' actual devices/connectivity needs; and
6. complete the remaining detailed human visual approval using the approved brand direction without reopening the full 42-screen legacy review.

Sprint 00 remains active. Do not start Sprint 01 or application implementation from this document.
