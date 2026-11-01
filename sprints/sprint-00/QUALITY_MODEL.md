# I Do Grow — Structured Quality Model

**Status legend**

- **SOURCE_CONFIRMED:** Stated by a primary client source or faithfully carried from it without resolving an ambiguity.
- **SAFE_FOUNDATION:** Conservative structure needed to preserve source requirements without approving a missing business rule; a subtype of **RECOMMENDED**.
- **RECOMMENDED:** Proposed for human product/domain approval; not yet an approved operational rule.
- **OPEN:** Unresolved, ambiguous, deferred, or dependent on client/domain approval.

Primary references are `I Do Grow Product and Development Manual.docx` (the **Manual**) and `I Do Grow description.pdf` (the **Description**). Project memory and Sprint 00 documents are subordinate synthesis. Legacy product and quality UI is secondary discovery evidence only.

## 1. Purpose and Status

This is a **Sprint 00 — Discovery and Foundation** domain specification. It defines a conceptual structure and lifecycle for Supplier-declared quality information, measurements, observations, documents, inspections, preliminary AI assistance, human verification, final grades, non-conformities, Buyer requirements, matching comparison, DPP evidence, and quality history.

**SOURCE_CONFIRMED:** The MVP proof must include a real Lot and structured quality information. Quality must be represented as structured measurements rather than one generic text field, and final quality classification initially requires human approval (Manual §§2.3, 5.6, 9.1, 27, 33).

**OPEN:** This specification does not approve missing hemp thresholds, grade names, pass/fail rules, methods, sampling plans, equipment, mandatory certificates, inspection checkpoints, approval authorities, visibility rules, or commercial consequences. Those rules remain subject to client, product, quality-domain, and where applicable legal/privacy approval.

This document is conceptual only. It does not change DEC-001, update `DATA_MODEL.md`, define a physical schema or endpoint, create a Platform Agent, authorize Sprint 01, or begin application implementation.

## 2. Quality Principles

1. **SOURCE_CONFIRMED — Lot-centric quality:** Quality evidence belongs primarily to the traceable physical Lot and its Inspection, not merely to a Listing (Manual §§8.4, 8.7, 17).
2. **SAFE_FOUNDATION — Definitions differ from results:** Reusable definitions state what may be assessed; results state what was actually declared, measured, or observed for a Lot.
3. **SOURCE_CONFIRMED — Structured evidence:** Critical quality cannot be stored only as unqualified text (Manual §9.1).
4. **SAFE_FOUNDATION — Evidence states remain distinct:** Declared, measured, observed, document-backed, AI-preliminary, human-verified, and final-grade information must not be collapsed.
5. **SAFE_FOUNDATION — Explicit context:** Measurements retain applicable unit, method reference, source, and evidence. Original values are preserved.
6. **SAFE_FOUNDATION — Observations are not measurements:** Qualitative observations must not masquerade as numeric test results.
7. **SAFE_FOUNDATION — Documents are not direct measurements:** A certificate, report, or photograph may support a result but does not automatically establish the result, validity, or compliance.
8. **SOURCE_CONFIRMED — AI is preliminary:** AI may assist, but it must not invent measurements or certificates, present image-only conclusions as laboratory results, overwrite verified evidence, or approve final grades (Manual §§14.3, 16.4).
9. **SOURCE_CONFIRMED — Human-controlled final classification:** Final grade/classification initially requires an authorised human (Manual §2.3).
10. **SOURCE_CONFIRMED — Provenance and history:** Sources, versions, approvals, corrections, and audit history must be retained (Manual §§16.3, 17, 20).
11. **SAFE_FOUNDATION — Comparable structure:** Buyer requirements and Lot evidence reference common Quality Definitions and compatible units so deterministic comparison is possible.
12. **OPEN — Operational rules:** Requiredness, thresholds, timing, visibility, and consequences remain unresolved until approved.

## 3. Quality Evidence Types

The following are related but different concepts. A single fact may have supporting evidence and later verification, but its states must remain separately traceable.

### Declared Value

**SOURCE_CONFIRMED:** Information supplied by a Supplier or a Trader acting on the Supplier's behalf, including known measurements and contextual facts during Listing intake (Manual §§2.1, 5.2, 14.2). A declaration records the actual actor, represented party, source/channel, time, original wording/value/unit, and supporting evidence where present. A declared value is not verified merely because it is structured.

### Measured Value

**SOURCE_CONFIRMED:** The Manual supports numeric or categorical measurement/test results and the associated context categories in §5.6. **SAFE_FOUNDATION:** A measured result retains the value and, where applicable or supplied, its unit, method, equipment, performer, time, location, sample, and evidence. “Measured” describes how the result was obtained; it does not by itself mean independently verified, compliant, or accepted.

### Observation

**SOURCE_CONFIRMED:** Qualitative evidence recorded by a Supplier, Trader, Inspector, or authorised reviewer, such as colour, visual structure, consistency, contamination signs, mould indicators, bale integrity, or storage conditions where applicable. **SAFE_FOUNDATION:** The observation retains observer, time, context, vocabulary/version if controlled, and photo/document references; it is not converted into a measurement without an approved method.

### Document Evidence

**SOURCE_CONFIRMED:** A certificate, laboratory report, inspection report, photograph, video, or other file may support quality and provenance. **SAFE_FOUNDATION:** The document remains a separate evidence instance with source, issuer/uploader, scope, linked Lot/Inspection/result, verification state, and version. Presence does not automatically mean validity, applicability, or compliance.

### AI Preliminary Assessment

**SOURCE_CONFIRMED:** AI may extract information, assess visible evidence preliminarily, identify missing information and anomalies, suggest application suitability, recommend physical inspection, or suggest a preliminary grade (Manual §14.3; Description p. 4). It is explicitly non-binding and remains separate from source evidence and human decisions.

### Human Verification

**SAFE_FOUNDATION:** An authorised human confirms, corrects, rejects, or limits an exact declared result, measured result, observation, or evidence version after review. Verification records the reviewer, authority, scope, evidence reviewed, outcome, reason/comments, time, and version. Verification is not automatically Buyer acceptance or commercial compliance.

### Final Grade

**SOURCE_CONFIRMED:** A final quality classification, where an approved grade system exists, requires authorised human approval in the first release. **SAFE_FOUNDATION:** The grade is a separate derived decision bound to exact evidence, result, template, and rule versions. **OPEN:** No grade vocabulary or rule is approved.

## 4. Quality Definition vs Quality Result

### Quality Definition

**SOURCE_CONFIRMED:** Product Types can define quality attributes, measurement definitions, allowed units, validation/grading rules, and inspection instructions (Manual §§8.3, 9.2). A Quality Definition is the reusable, governed meaning of what may be measured or assessed.

Source-supported Retted Straw examples include moisture, bale dimensions, estimated bale weight, retting quality, colour, consistency, contamination, mould indicators, soil or stone contamination, storage conditions, harvest date, bale integrity, fibre-to-hurd indication, visual homogeneity, and visual structure. These are candidate definitions, not mandatory fields.

### Quality Result

**SOURCE_CONFIRMED / SAFE_FOUNDATION:** A Quality Result is the actual declared, measured, or observed value for one Lot, normally within an Inspection or attributable intake context. It references the applicable Quality Definition/version and retains provenance, evidence, and verification state.

The distinction is necessary because another fibre can reuse the same model while defining different applicable attributes, units, methods, and rules. It prevents one Supplier's result from mutating the product catalogue and prevents hemp-specific structure from becoming a physical system design.

## 5. Quality Attribute Structure

The following is conceptual metadata for a reusable Quality Definition, not a database-column list.

| Metadata | Status | Purpose / boundary |
| --- | --- | --- |
| Canonical identity and version | **SAFE_FOUNDATION** | Stable reference independent of display wording; identifier format remains OPEN. |
| Display label and description | **SAFE_FOUNDATION** | Human-readable meaning; multilingual governance remains OPEN. |
| Applicable Product Type/Form | **SOURCE_CONFIRMED** concept | Prevents automatic reuse across incompatible forms. Exact assignments remain OPEN. |
| Result type | **SAFE_FOUNDATION** | Numeric, categorical, observation, date, or another approved type. |
| Allowed unit family | **SAFE_FOUNDATION** | Restricts comparison to compatible units. Exact units remain OPEN. |
| Measurement Method reference | **SOURCE_CONFIRMED** concept | Links an approved method/version where one is applicable; no method is selected here. |
| Source/provenance of definition | **SOURCE_CONFIRMED** principle | Records authority and change basis. |
| Required/optional status | **SOURCE_CONFIRMED** capability; **OPEN** values | Set by an approved template or transaction rule, not by this document. |
| Threshold/grade relationship | **SOURCE_CONFIRMED** capability; **OPEN** rules | References approved rules without embedding invented thresholds. |
| Active/inactive/deprecated state | **SAFE_FOUNDATION** | Supports governed evolution while preserving historical use. |

**RECOMMENDED:** Definitions and activated versions should not be edited retroactively. A changed meaning creates a new version so earlier results retain their original interpretation.

## 6. Result Types

The smallest useful conceptual set is:

- **Numeric — SAFE_FOUNDATION:** Decimals for measured quantities. Percentage is numeric with an explicit percent unit, not a separate storage truth.
- **Integer — RECOMMENDED profile:** Needed only where a whole-number count is valid; it may be a numeric constraint rather than an independent core type.
- **Boolean — SAFE_FOUNDATION:** For a genuine yes/no fact defined by an approved rule. It must not replace unknown or not assessed.
- **Categorical — SOURCE_CONFIRMED capability:** For controlled observations or grades once their vocabulary is approved.
- **Text observation — SOURCE_CONFIRMED capability:** For qualitative evidence and notes; it must not substitute for a required measurement.
- **Date — SOURCE_CONFIRMED:** Needed for provenance facts such as harvest date where applicable.
- **Document reference — SOURCE_CONFIRMED evidence relationship:** A reference to supporting evidence, not a scalar quality result.

**RECOMMENDED:** The MVP needs numeric, categorical, text observation, date, and evidence references. Boolean and integer are retained only where an approved definition genuinely needs them. Separate explicit states should distinguish missing, not provided, not assessed, not applicable, inconclusive, and withheld; `null`, zero, and failure must not be treated as interchangeable.

## 7. Measurement Structure

For a measured result, the conceptual structure may capture:

| Concept | Classification | Rule |
| --- | --- | --- |
| Result value | **SOURCE_CONFIRMED** | Required when an actual measurement is recorded; use decimal-safe representation. |
| Original lexical value | **SAFE_FOUNDATION** | Preserve exactly what was supplied before normalization/correction. |
| Unit | **SOURCE_CONFIRMED** | Explicit whenever the definition is measurable. |
| Normalized value and unit | **RECOMMENDED** | Present only when an approved deterministic compatible conversion exists. |
| Conversion rule/source/version | **SAFE_FOUNDATION** | Required whenever normalization occurs; exact catalogue is OPEN. |
| Measurement Method reference/version | **SOURCE_CONFIRMED** concept | Applicable where a method is used; actual methods remain OPEN. |
| Equipment | **SOURCE_CONFIRMED** capability | Record when supplied or required by an approved method; requiredness is OPEN. |
| Performed by / organisation / represented capacity | **SOURCE_CONFIRMED / SAFE_FOUNDATION** | Preserve accountable actor and context. |
| Location | **SOURCE_CONFIRMED** capability | Record only at approved necessary precision; requiredness and visibility are OPEN. |
| Performed date/time and recorded date/time | **SOURCE_CONFIRMED / SAFE_FOUNDATION** | Distinguish occurrence from system recording where relevant. |
| Sample identifier | **SOURCE_CONFIRMED** capability | Applicable only when sampling is used; sampling rules remain OPEN. |
| Uncertainty/tolerance | **RECOMMENDED** | Record only if supplied under an approved method; never invent. |
| Source channel | **SOURCE_CONFIRMED** principle | Supplier portal, Trader assistance, Inspection, report, or another approved source. |
| Evidence references | **SOURCE_CONFIRMED** | Link supporting photo/report/document without conflating it with the result. |
| Verification status and decisions | **SAFE_FOUNDATION** | Keep declaration/measurement, verification, and grade decisions separate. |

No field above becomes universally mandatory merely because it appears in this conceptual model.

## 8. Units

- **SOURCE_CONFIRMED:** Quantities and measurements carry explicit values and units; conversions must be validated; original values must be retained (Manual §§10.1, 22).
- **SAFE_FOUNDATION:** No measurable result may rely on an implicit unit.
- **SAFE_FOUNDATION:** Preserve original value/unit separately from any normalized value/unit.
- **SAFE_FOUNDATION:** Compare or normalize only compatible unit families.
- **SOURCE_CONFIRMED / SAFE_FOUNDATION:** Conversions and commercial calculations are deterministic; an LLM must not independently perform authoritative numerical conversion (Manual §§14.4, 16.4).
- **SAFE_FOUNDATION:** API transport uses decimal strings and avoids binary floating-point semantics, consistent with `API_CONVENTIONS.md` §8.
- **OPEN:** Allowed units per definition, canonical normalized units, precision, significant digits, rounding, conversion sources, and tolerances.

No unit library, decimal library, or physical storage design is selected.

## 9. Measurement Methods

A conceptual Method reference may contain, where applicable:

- method name and stable identity;
- method version;
- issuing organisation or source;
- procedure/document reference;
- equipment requirements;
- sampling context;
- accreditation requirement if applicable; and
- active, deprecated, or superseded status.

**SOURCE_CONFIRMED:** The client model requires method-aware measurements and Contract inspection methods (Manual §§5.6, 5.7, 9.1). **SAFE_FOUNDATION:** Results should pin the exact method version used so later changes do not rewrite history.

**OPEN:** The client sources specify no approved hemp laboratory standard, sampling plan, equipment rule, accreditation rule, or method catalogue. Example strings in the Manual are illustrative and do not become approved methods.

## 10. Inspection Model

**SOURCE_CONFIRMED:** An Inspection is a distinct business process applied to a Lot using an Inspection Template and performed by an assigned Inspector or organisation (Manual §§4.4, 5.6, 8.7).

The conceptual Inspection may include:

- inspection identity and version/concurrency reference;
- Lot reference;
- purpose/type and evidence mode;
- assigned Inspector and organisation;
- scheduled and performed dates;
- location at the approved precision;
- pinned Quality Template/version;
- Measurements, Observations, documents/photos, and optional Sample/Laboratory Result references;
- Non-Conformities;
- preliminary conclusion;
- submitted evidence set/version;
- final review/approval decision, approver, authority, date, and reason;
- workflow status and distinct review outcome; and
- provenance and audit references.

**OPEN:** Exact mandatory fields, inspection types, independence criteria, location precision, signature requirements, authority, and progression effects.

## 11. Inspection Lifecycle

The following is a **RECOMMENDED safe-foundation workflow vocabulary**, not an approved commercial state machine:

```text
draft → assigned → in_progress → submitted → under_review → completed
   ↘ cancelled              ↘ returned for correction/reinspection (OPEN transition)
```

- `draft`: Inspection exists but is not ready for execution.
- `assigned`: Responsible Inspector/organisation is identified.
- `scheduled`: **RECOMMENDED as scheduling information**, not necessarily a separate state; use it only if operational workflow requires it.
- `in_progress`: Evidence capture has begun.
- `submitted`: The Inspector has submitted an exact evidence/result version.
- `under_review`: An authorised reviewer is evaluating that submission.
- `completed`: Review has concluded and the Inspection record is closed for that version.
- `cancelled`: Work stopped without implying a quality conclusion.

**RECOMMENDED:** `approved`, `rejected`, and `inconclusive` should be review/conclusion outcomes rather than overloaded Inspection workflow states. If later adopted as statuses, their scope must be explicit. An approved Inspection is not automatically a passing Lot, an approved Grade, a published Listing, an accepted Trade, or a commercial remedy.

Inspection workflow status, individual result, Human Verification, Final Grade, Listing status, Match, Quote, Trade, Contract, and Shipment state remain separate. Exact transitions, actors, return/reinspection behavior, and commercial consequences are **OPEN**.

## 12. Quality Template

**SOURCE_CONFIRMED:** The platform must support Inspection Templates, and Product Types define applicable quality attributes, units, rules, and instructions (Manual §§5.6, 9.2, 27).

A reusable, versioned Quality Template may specify:

- applicable Product Type/Form;
- required Quality Definitions once approved;
- optional Quality Definitions;
- expected evidence;
- permitted Method references;
- inspection and photo instructions;
- approved Grade rule/version once one exists;
- activation/effective period; and
- deprecation/supersession information.

**SAFE_FOUNDATION:** Each Inspection pins the exact Template version used. Activated historical versions remain immutable so an old result can be interpreted under the instructions and definitions actually applied.

**OPEN:** Hemp requiredness, thresholds, grade rules, permitted methods, evidence minimums, template owner, approver, activation, and retirement governance.

## 13. Hemp MVP Quality Dimensions

The Manual says these fields **“may include”**; they are source-confirmed candidates, not mandatory requirements. The Description adds visible structure and general anomaly flagging. No industry knowledge has been added.

| Dimension | Source support | Result type | Likely unit family | Applicable form | Supplier-declared? | Inspection-measured/observed? | Buyer-filterable? | DPP relevant? | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Moisture | Manual §§2.1, 5.6; Description p. 4 | Numeric measurement | Percentage **OPEN exact code** | Retted Straw | Possible | Possible measurement | Possible; rule OPEN | Yes, if approved/verified | **SOURCE_CONFIRMED candidate**; method/threshold OPEN |
| Bale dimensions | Manual §5.6 | Numeric measurements | Length/dimension **OPEN** | Retted Straw in bales | Possible | Possible measurement | Possible; relevance OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Estimated bale weight | Manual §§5.6, 14.2 | Numeric estimate | Mass **OPEN** | Retted Straw in bales | Possible | Possible estimate/measurement | Possible | Possible | **SOURCE_CONFIRMED candidate**; measured-vs-estimated must remain explicit |
| Retting quality | Manual §5.6 | Categorical/observation | None unless method approved | Retted Straw | Possible | Possible observation/classification | Possible; vocabulary OPEN | Possible | **SOURCE_CONFIRMED candidate**; meaning/rules OPEN |
| Colour | Manual §5.6; Description p. 4 | Observation/categorical | None | Retted Straw | Possible | Possible observation | Possible; vocabulary OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Consistency | Manual §5.6 | Observation/categorical | None | Retted Straw | Possible | Possible observation | Possible; vocabulary OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Visual structure | Description p. 4 | Observation/categorical | None | Retted Straw | Possible via photo | Possible observation | Possible; vocabulary OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Visual homogeneity | Manual §5.6 | Observation/categorical | None | Retted Straw | Possible | Possible observation | Possible; vocabulary OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Contamination | Manual §5.6; Description p. 4 | Observation or measurement only under approved method | OPEN | Retted Straw | Possible | Possible | Possible; rule OPEN | Possible | **SOURCE_CONFIRMED candidate**; method/unit/threshold OPEN |
| Mould indicators | Manual §5.6 | Observation or approved test result | OPEN | Retted Straw | Possible | Possible | Possible; rule OPEN | Possible | **SOURCE_CONFIRMED candidate**; not a lab conclusion by default |
| Soil or stone contamination | Manual §5.6 | Observation or measurement only under approved method | OPEN | Retted Straw | Possible | Possible | Possible; rule OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Storage conditions | Manual §5.6 | Declaration/observation/context | None or controlled vocabulary OPEN | Retted Straw Lot | Possible | Possible observation | Possible; relevance OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Harvest date | Manual §§2.1, 5.6; Description p. 4 | Date/provenance fact | Date | Retted Straw Lot | Possible | Verification possible; not normally measured | Possible; rule OPEN | Yes, if approved | **SOURCE_CONFIRMED candidate** |
| Bale integrity | Manual §5.6 | Observation/categorical | None | Retted Straw in bales | Possible | Possible observation | Possible; rule OPEN | Possible | **SOURCE_CONFIRMED candidate** |
| Fibre-to-hurd indication | Manual §5.6 | Observation/estimate/measurement only after method approval | OPEN | Retted Straw | Possible | Possible | Possible; meaning OPEN | Possible | **SOURCE_CONFIRMED candidate**; definition/method/unit OPEN |

Photographs, Inspector identity, timestamp, geolocation, equipment, sample/laboratory result, certificate, and Non-Conformity are evidence or process categories rather than hemp quality dimensions. “Strength,” mandatory composition, Grade A/B/C, and legacy catalogue grades are not source-confirmed MVP quality dimensions.

## 14. Grade Model

The model must distinguish:

1. **Grade Definition / Rule Version — SAFE_FOUNDATION:** applicable Product Form; grade identity; name/code; definition; thresholds/conditions once approved; authority/source; effective period; status/version.
2. **Lot Grade Assignment / Decision — SOURCE_CONFIRMED concept / SAFE_FOUNDATION structure:** Lot and Inspection; exact evidence/result versions; exact rule version; assigned result; authorised human approver and authority; decision time; reason/comments; version and correction/supersession history.

**OPEN:** All hemp Grade names, codes, thresholds, hierarchy, equivalence, pass/fail relationship, effective rules, approvers, and commercial effect.

Grade A/B/C or similar labels must not become canonical unless approved by the client/domain authority. Product Form `Retted Straw` is not a Grade.

## 15. Preliminary AI Quality Assessment

Future Platform Agent assistance may:

- extract measurements and observations from authorised input;
- detect missing fields and conflicts;
- classify visible evidence preliminarily;
- flag anomalies;
- summarise reports;
- suggest possible application suitability, Inspection need, or preliminary Grade.

It must not:

- create a verified measurement from unsupported evidence;
- present image-only evidence as laboratory evidence;
- invent a measurement, certificate, party, threshold, or fact;
- overwrite original or verified evidence;
- approve a final Grade or certificate;
- make a binding Match or commercial decision.

**SOURCE_CONFIRMED / SAFE_FOUNDATION:** Retain the model/configuration version where relevant, source evidence, structured output, confidence, missing evidence, reviewer outcome, corrections, and execution/audit linkage. A label such as `verified` may appear only after an authorised human verification step; the AI cannot verify itself.

No Platform Agent is created or implemented by this specification.

## 16. Human Quality Approval

For an approved quality decision, record:

- approver identity and organisation;
- role/authority and represented capacity;
- decision date/time;
- exact evidence, result, Inspection, Template, Method, and rule versions reviewed;
- verified result or final Grade decision;
- comments/reason;
- any AI recommendation and whether it was accepted, corrected, or overridden;
- approval version, correction/supersession link, and audit context.

**SOURCE_CONFIRMED:** Final classification requires human approval. **SAFE_FOUNDATION:** Approval must bind to the reviewed versions; changed evidence requires revalidation and, where applicable, reapproval.

**OPEN:** Exact approver, eligibility, independence, separation of duties, second approval, dispute path, and amendment rights under A5.3 and A7.1–A7.2.

## 17. Non-Conformity Model

A structured Non-Conformity may record:

- affected Lot, Inspection, result, or evidence version;
- issue type;
- severity/classification reference once approved;
- description and evidence;
- detected by and detection time;
- review/workflow status;
- reviewer;
- resolution/action reference;
- linked correction or reinspection; and
- provenance, history, and audit.

**SOURCE_CONFIRMED:** Non-conformity reporting is a required capability (Manual §5.6). **SAFE_FOUNDATION:** It remains separate from a Grade and from commercial states.

**OPEN:** Issue vocabulary, severity levels, response times, dispositions, closure criteria, reinspection rules, and all commercial remedies. A Non-Conformity must not automatically change price, quantity, reservation, Listing status, Grade, Contract, Shipment, claim, payment, Settlement, or DPP visibility.

## 18. Quality Requirement Model for Buyers

**SOURCE_CONFIRMED:** A Buy Order may include quality and certification requirements, and matching considers quality compatibility (Manual §§5.3–5.4, 8.5).

A Buyer Quality Requirement may conceptually include:

- reference to the same Quality Definition/version used by Lot evidence;
- condition/operator;
- target, minimum, maximum, range, category, or presence requirement as applicable;
- explicit unit for measurable operands;
- acceptable Method or certificate type/instance constraint if approved;
- mandatory versus preferred status;
- tolerance if explicitly provided and approved;
- Buyer source, author, version, and time; and
- applicability to a Buy Order line/Product Form.

**OPEN:** Exact operator set, values, methods, certificates, tolerance semantics, precedence, conflicts, and commercial consequences. This structure does not invent a hemp Buyer requirement.

## 19. Quality Compatibility for Matching

Quality comparison should be deterministic and explainable:

1. Compare the same or approved-equivalent Quality Definitions.
2. Check Product/Form applicability.
3. Normalize only compatible units through an approved deterministic conversion.
4. Preserve the original and comparison value, unit, conversion basis, precision context, evidence state, and versions.
5. Distinguish at least **satisfied**, **not satisfied**, **missing/unknown**, and **incomparable/conflicting** as conceptual outcomes; final vocabulary remains **RECOMMENDED**.
6. Distinguish declared, measured, preliminary, human-verified, and final-grade evidence.
7. Detect stale, superseded, conflicting, or insufficiently scoped evidence and surface uncertainty.
8. Never turn missing evidence into compliance or treat a certificate's presence as proof of every requirement.
9. Allow AI to explain the deterministic result, not silently calculate, convert, or certify it.

**SOURCE_CONFIRMED:** First-release Matches remain non-binding and human-controlled. **OPEN:** Evidence validity periods, final compatibility rules, weighting, acceptable evidence levels, and progression consequences.

## 20. Listing Quality Representation

**SOURCE_CONFIRMED:** A Listing may capture known quality measurements and receive a preliminary quality status before publication review (Manual §5.2).

**SAFE_FOUNDATION:** A Listing may expose authorised selected summaries, such as:

- latest applicable human-verified result;
- clearly labelled Supplier-declared or preliminary result;
- human-approved Grade where one exists;
- certificate/document presence and verification state without implying compliance;
- Inspection workflow state and evidence date; and
- missing/conflicting/stale evidence warning.

Authoritative evidence remains linked to the Lot/Inspection. A Listing projection must not become a competing source of truth or silently remain current after evidence is corrected. Buyer-visible summaries and detailed evidence are subject to approved roles, transaction relationships, consent/permission where applicable, and field projections.

## 21. Lot Quality History

**SOURCE_CONFIRMED / SAFE_FOUNDATION:** Maintain append-only or version-aware history for:

- declarations, Measurements, and Observations;
- Inspections and Template/Method versions;
- Human Verifications and Grade decisions;
- documents, reports, photographs, certificates, and verification states;
- Non-Conformities, corrections, revocations, and disputes;
- Lot split/combine/transformation links; and
- DPP and transaction references derived from quality evidence.

A correction creates a new version/event that identifies what it supersedes, why, by whom, when, and with which evidence. Current views may resolve an authorised latest state, but historical verified evidence is never silently rewritten.

**OPEN:** Retention, erasure/restriction, legal holds, notification, correction authority, and post-verification amendment rules. Append-only does not mean indefinite retention.

## 22. Quality and Lot Transformations

**SOURCE_CONFIRMED:** Lot transformations must preserve relationships among inputs, processes, and outputs (Manual §17.3). **OPEN:** Lot-versus-Batch meaning, physical identity, split/combine/substitute/transform rules, quantity allocation, evidence inheritance, and reinspection triggers.

**SAFE_FOUNDATION requirement:** When material is split, combined, substituted, or transformed, provenance links from output to source Lots and their evidence must not be lost. No result, Grade, certificate, or verification state is automatically inherited unless a later approved rule explicitly permits it. The system must be capable of showing what evidence applies directly, what is inherited under a rule, and what requires reinspection.

## 23. Quality and DPP

The basic DPP may receive authorised, provenance-bearing quality categories including:

- Lot identity and Product/Form reference;
- Inspection events;
- human-verified Measurements and Observations;
- human-approved Grade where defined;
- certificate/report references and verification state;
- appropriate Non-Conformity, correction, or dispute events;
- source, version, responsible party, time, and verification information.

**SOURCE_CONFIRMED:** DPP is versioned, Lot-linked, and event-based, and includes quality/test/certificate information as applicable (Manual §17; MVP scope). **SAFE_FOUNDATION:** DPP should reference or project authoritative quality events rather than duplicate mutable authority.

**OPEN:** Exact fields, completeness, personal/confidential/public projections, correction, publication, sharing, retention, and whether particular Non-Conformity details are appropriate to expose under A10.1–A10.3.

## 24. Quality and Commercial Workflow

The source-grounded conceptual checkpoints are:

```text
Supplier/Trader declaration and preliminary evidence
  → Listing completeness/publication review
  → Buyer quality requirements and non-binding matching
  → Quote quality assumptions/conditions and inspection cost where applicable
  → transaction-specific Inspection at an approved checkpoint
  → human verification and human-approved final Grade where defined
  → possible reinspection / correction / Non-Conformity branch
  → authorised Contract, Shipment, delivery, claims and DPP use
```

**SOURCE_CONFIRMED:** Preliminary quality information may exist before publication. The Manual orders its Quote/negotiation section before its Quality-inspection section and states that Contract creation follows Quote acceptance, but it does not establish Inspection timing relative to acceptance. The Description says quality should be assessed as accurately as possible in advance.

**OPEN / branchable:** Inspection may occur before Quote, after a conditional Quote, before Contract, before Shipment, at destination, or at multiple points according to approved transaction terms. This document does not choose one universal sequence.

No Inspection result automatically publishes/rejects a Listing, reserves/releases stock, changes a Quote, accepts/cancels a Contract, blocks/releases Shipment, creates a claim, changes Settlement, or assigns a remedy. All such consequences remain under A3–A5 and A8–A10.

## 25. Permissions and Visibility

The following are minimum principles, not a final role matrix:

### Supplier

May submit and correct its own declarations with traceability. Must not silently edit verified Inspector results. Exact access to detailed reports, disputes, and Buyer requirements is **OPEN**.

### Buyer

May see authorised comparable summaries and evidence relevant to its request/transaction. Must not automatically see internal quality-risk deliberations, another Buyer's data, or personal/sensitive evidence. Exact detailed result/certificate access is **OPEN**.

### Trader

May review evidence, missing/conflicting information, and workflow tasks according to assigned authority. Acting party/capacity and approval context must be recorded. Final grade or remedy authority is **OPEN**.

### Quality Inspector

Sees only assigned Lot, Template, instructions, and necessary context. May capture evidence and perform only authorised review/grade actions. Access outside the assignment is not implied.

### Admin/Compliance

May govern definitions/templates or review DPP/compliance evidence only under approved least-privilege responsibilities. Platform-wide access is not automatic; exact separation of Administrator and Compliance duties is **OPEN**.

### Logistics Partner

Receives only transaction/Shipment-scoped quality information needed for approved handling, release, or evidence tasks. Detailed quality and internal risk information is not automatically visible.

### Platform Agent

Receives the minimum authorised context required for an allowlisted task. It cannot enlarge authority, expose cross-tenant evidence, change verified data, or perform final/binding approvals.

All field-level visibility, change rights, publication, consent/permission, and separation-of-duties rules remain **OPEN** under A7 and A10.

## 26. Data Integrity and Audit Requirements

- Stable, immutable identifiers for definitions, template versions, Inspections, results, evidence, decisions, and history events.
- Actor, organisation, represented party/capacity, source/channel, and timestamps supplied or verified by controlled backend context.
- Original values/units and any deterministic normalized values retained separately.
- Definition, Method, Template, Grade-rule, evidence, result, and approval versions pinned.
- Corrections/revocations as linked new versions/events, not overwrite.
- Explicit states for missing, not assessed, not applicable, inconclusive, withheld, superseded, and conflicting data.
- Controlled status transitions with authorization and audit.
- Strong ETag/`If-Match` stale-write protection for consequential mutable resources, consistent with `API_CONVENTIONS.md` §15.
- Approval bound to exact reviewed versions; changed content requires revalidation.
- Atomic mutation, relevant current-version update, and critical audit where one transaction outcome is affected.
- Protection against concurrent creation of multiple current final approvals.
- Idempotency for retry-prone commands when later specified; exact operations and retention remain OPEN.
- Tenant-aware access and explicit authorised output projections for data and files.

Exact transaction isolation, locking, constraints, persistence design, retention, and immutability mechanism remain TBD. This section defines integrity outcomes, not a physical schema.

## 27. Privacy Implications

Quality records may contain Inspector identity, assignment, signature, time, precise location, photographs, people shown in images, uploaded reports, certificate contacts, device/file metadata, and incidental personal data.

Consistent with `DATA_PROTECTION_ASSESSMENT.md`:

- collect only the minimum personal data needed for the approved purpose;
- constrain location precision, signature, identity, and evidence visibility;
- keep files private by default and purpose/organisation/record scoped;
- use explicit field projections rather than frontend-only hiding;
- separate public/shareable DPP data from transaction and restricted evidence;
- avoid unrestricted payloads in audit/logging;
- preserve provenance while providing future correction, restriction, deletion/anonymisation, and recipient/provider propagation hooks; and
- keep retention periods **TBD / LEGAL REVIEW REQUIRED**.

This model selects no lawful basis, legal role, retention period, vendor, or public DPP content. The preliminary DPIA conclusion remains unchanged: the requirement cannot yet be determined.

## 28. MVP Minimum Quality Model

### Required foundation objects/concepts

- reusable Quality Definition/version;
- versioned Quality Template;
- Lot-linked Inspection;
- typed Quality Result for declaration, measurement, or observation;
- Evidence/Document reference;
- Human Verification/Approval decision;
- Grade Definition/Rule structure and Lot Grade Assignment structure, without values/rules;
- Non-Conformity;
- Buyer Quality Requirement;
- provenance, correction/version, and audit linkage.

### Required source-confirmed quality inputs

For one real transaction, structured quality information, an applicable Inspection/evidence record, photo evidence where required by the selected case, and a human-approved Grade are MVP capabilities. The hemp candidate pool is limited to §13. **OPEN:** The sources do not say which candidate dimensions are mandatory for the proof Lot.

### Still OPEN before real transaction

- required/optional dimensions, definitions, units, methods, sampling, equipment, evidence, certificates, Grade names/rules, thresholds, and pass/fail;
- exact Inspection checkpoints, performer, final approver, progression evidence, Non-Conformity outcomes, and remedies;
- proof Lot/Batch semantics, Buyer requirements, visibility, DPP fields, and correction/retention rules.

### Deferred beyond MVP

- later hemp forms and non-hemp templates;
- advanced laboratory/provider integrations;
- automated Grade or binding decisions;
- advanced quality analytics and historical models;
- automatic inheritance across complex transformations; and
- richer DPP sustainability and lifecycle quality scope beyond the proof case.

## 29. Open Questions

Use `CLIENT_CLARIFICATIONS.md`; do not duplicate or answer its questions.

### BLOCKING before quality implementation

- A1.3 — approved proof-product/form, packaging, units, applications, and terminology.
- A5.1 — dimensions, requiredness, units, methods, sampling, equipment, evidence, certificates, grades, thresholds, and pass/fail.
- A5.2 — checkpoints and minimum evidence/status for progression.
- A5.3 — performers, final approver, incomplete/non-conforming outcomes, reinspection, and remedies.
- A7.1–A7.2 — authority, separation of duties, field visibility, and change rights.

### BLOCKING before first real transaction

- A1.1 — real Supplier, Buyer, Lot, route, dates, and owner.
- A3/A4/A8/A9 — legal/commercial effects, reservation, Contract/Shipment, claims, and Settlement consequences affected by quality.
- A6.1–A6.2 — Lot/Batch and split/combine/substitution/transformation behavior.
- A10.1–A10.3 — DPP fields, completeness, visibility, publication, and corrections.
- A7.3 and professional review — personal-data roles, retention, correction/deletion, and processing/storage constraints.

### IMPORTANT but can remain open during technical foundation

- Quality Definition/Template/Method/Grade-rule ownership, activation, deprecation, and translation governance.
- Inspector offline requirement and exact low-bandwidth capture behavior.
- Exact accessibility target under A12.1.
- Evidence validity/staleness windows and notification policy.

### Deferred

- Advanced configurable quality models, additional fibres/forms, provider integrations, advanced AI autonomy, and complex transformation inheritance.

No genuinely new standalone client question was identified. Existing A5, A6, A7, A8, A10, A11, and A12 questions cover the material gaps; governance details can be captured in those workshops without inventing answers.

## 30. Data Model Implications

After human approval, `DATA_MODEL.md` will likely need conceptual synchronization to describe:

1. Quality Definition with version, applicability, result type, and unit family.
2. Method definition/version and Unit/conversion references.
3. Quality Template plus immutable Template versions/items.
4. Inspection with assigned actor/organisation and pinned Template version.
5. Quality Result with distinct declaration, measurement, and observation semantics plus immutable versions.
6. Evidence/Document relationships, keeping certificate instances separate.
7. Human Verification/Approval over exact result/evidence versions.
8. Grade Definition/Rule version separate from Lot Grade Assignment.
9. Non-Conformity with evidence, review, resolution, and reinspection links.
10. Buyer Quality Requirement referencing Quality Definition.
11. Quality compatibility evaluation basis/snapshot linked to a Match Candidate.
12. Correction/supersession history and DPP-event source links.
13. Optional Sample, Laboratory Result, and Equipment references only as approved methods require.

This task does not modify `DATA_MODEL.md`, settle physical cardinalities, resolve Lot/Batch, or define tables, columns, keys, constraints, ORM mappings, or migrations.

## 31. UX Implications

### Supplier product intake

- Progressive, resumable, mobile-first capture with low-bandwidth support.
- Plain-language prompts rather than exposing internal taxonomy complexity.
- Explicit labels for Supplier-declared, measured, and unknown/not provided.
- Preserve original value/unit, source, uploads, and Trader-assisted corrections.
- Upload progress/retry/draft recovery and human handover; exact offline behavior remains OPEN.

### Trader review

- Lot-centred evidence summary with declaration/verification/AI labels, missing/conflicting/stale evidence, versions, and history.
- Separate actions for correcting a declaration, requesting evidence, assigning Inspection, reviewing AI, and performing any later authorised approval.
- Do not visually merge an AI proposal with verified truth.

### Inspector workflow

- Task-scoped, stepwise flow: assignment/context → pinned instructions/template → Measurements → Observations → evidence → Non-Conformities → review/submit → separate authorised decision.
- Explicit units and applicable Method/equipment/sample context.
- Draft recovery, validation, conflict/stale-version handling, and accessible evidence capture.

### Buyer comparison

- Align common Quality Definitions and compatible units across Lots.
- Show evidence state, age, method/context where authorised, and uncertainty—not only a Grade.
- Make missing different from failed, declared different from verified, preliminary AI different from human approval, and certificate presence different from compliance.

### Quality evidence display

- Use consistent text plus icons, not colour alone, for Declared, Measured, Observed, Document, AI Preliminary, Human Verified, and Final Grade.
- Show source, actor/organisation, time, Method/Template version, and correction history only where authorised.
- Listing summaries link back to authoritative Lot/Inspection evidence.

No wireframe or final role/visibility matrix is created here.

## 32. Specialist Perspectives

### Sokhna

Sokhna confirmed the source-bounded hemp candidate dimensions and required strict separation among declarations, Measurements, Observations, evidence, AI proposals, Human Verification, and Final Grade. She recommended a Lot-linked, Template-versioned Inspection process and warned against treating example values/method strings, certificate capabilities, or workflow review as approved quality rules.

### Cheikh

Cheikh confirmed that structured quality is an MVP requirement while all hemp-specific mandatory attributes, units, methods, thresholds, grades, certificates, checkpoints, and remedies remain OPEN. He identified the early preliminary-quality versus later Inspection sequence as a source tension that supports branchable timing rather than one universal rule.

### Khady

Khady distinguished assertions/results, evidence objects, verification decisions, and derived Grade assignments. She required decimal-safe original/normalized values, exact Definition/Method/Template/rule version binding, append-only corrections, tenant-safe projections, and stale-write/concurrent-approval protection. She identified the later conceptual `DATA_MODEL.md` changes in §30 without proposing a physical schema.

### Babacar

Babacar confirmed that verification is not commercial acceptance and Inspection approval is not a transaction outcome. Matching may compare only compatible definitions/units and must distinguish missing, failed, conflicting, declared, and verified evidence. Quote, Contract, Shipment, claim, and Settlement consequences remain governed by unresolved transaction terms.

### Mariama

Mariama required mobile/resumable Supplier capture, a Lot-centred Trader evidence view, a task-scoped Inspector flow, and Buyer comparisons that expose evidence strength and uncertainty. She emphasized accessible status labels, explicit unknown states, and privacy-aware display of Inspector identity, location, photographs, signatures, and reports.

### Mamadou if invoked

Mamadou was not invoked. No material new system-boundary question emerged: DEC-001 and `API_CONVENTIONS.md` already establish the controlled REST/backend, authorization, audit, concurrency, and human-approval boundaries. This model remains conceptual and introduces no technology or architecture decision.

## 33. Agreements

All five selected specialists agreed that:

- quality authority is primarily Lot/Inspection-centric, with Listing summaries only;
- reusable Quality Definitions and Lot-specific Results must be separate;
- declared, measured, observed, documented, AI-preliminary, human-verified, and final-grade information must remain distinct;
- measurements retain explicit unit, Method/source/evidence, original value, provenance, and versions;
- Template, Method, evidence, result, approval, and Grade-rule versions must be pinned;
- corrections preserve history and never silently overwrite verified evidence;
- the §13 hemp dimensions are candidates, not mandatory fields;
- no threshold, Grade vocabulary, laboratory method, mandatory certificate, or commercial remedy is approved;
- inspection timing remains branchable;
- matching comparison is deterministic, explainable, and non-binding;
- Lot/Batch and transformation inheritance remain OPEN;
- existing client clarification questions cover the material gaps;
- DEC-001 remains unchanged, and no implementation or physical schema is authorised.

## 34. Disagreements

No substantive unresolved specialist disagreement remains.

Two nuances were consolidated:

1. **Inspection outcome vocabulary:** Sokhna and Khady observed that `approved`, `rejected`, and `inconclusive` are useful concepts, but using them as workflow statuses can conflate process review, evidence conclusion, Grade, and commercial acceptance. The consolidated recommendation keeps them as review outcomes separate from a minimal Inspection workflow; exact vocabulary remains OPEN.
2. **New governance clarification:** Template/Definition/Method/Grade-rule ownership is not explicit. Cheikh, Sokhna, Khady, Babacar, and Mariama considered it adequately capturable through existing A5/A7 workshops rather than a new standalone client question. It remains OPEN and is not silently assigned.

The primary-source timing tension is preserved rather than resolved: preliminary quality appears before Listing publication; the Manual orders Quote/negotiation before Quality inspection and makes Contract creation follow Quote acceptance without fixing Inspection timing relative to acceptance; and the Description prefers advance assessment.

## 35. Formal Approval Required?

**SAFE_FOUNDATION / RECOMMENDED for human approval:** The conceptual separation of definitions, Lot results, evidence, Human Verification, Grade assignments, provenance/versioning, deterministic compatible-unit comparison, non-binding matching, branchable Inspection timing, and privacy-aware visibility boundaries.

**Client/domain approval required before affected implementation or real transaction:** Actual hemp required/optional fields, technical definitions, units, methods, sampling, equipment, evidence minimums, certificates, Grade vocabulary and rules, thresholds, pass/fail, Inspection timing and gates, approvers, field visibility, corrections, Non-Conformity outcomes, commercial remedies, transformation inheritance, and DPP completeness/publication.

No `DECISION_LOG.md` update is required from this analysis alone. DEC-001 remains approved and unchanged. If the domain model and operational rules are formally adopted, approval should be recorded through the appropriate product/domain decision mechanism without rewriting the client sources or DEC-001.

## 36. Next Action

1. Have the client/business owner, real Trader, and authorised hemp quality expert answer A1.3 and A5.1–A5.3 for the selected proof Lot.
2. Confirm quality authority/visibility under A7, Lot/Batch behavior under A6, Contract/Shipment consequences under A8, and DPP governance under A10.
3. Human-review and approve this conceptual foundation, including evidence distinctions, Template/version approach, and proposed Inspection workflow/outcome separation.
4. After approval, synchronize `DATA_MODEL.md` conceptually in a separate authorised task; do not create a physical schema.
5. Use the approved quality rules when refining the first transaction workflow, roles/permissions, and future wireframes during Sprint 00.

Sprint 00 remains active. Do not begin Sprint 01 or application implementation from this document.
