# I Do Grow — Hemp Product Taxonomy

**Status legend and source notation**

- **SOURCE_CONFIRMED:** Stated directly in a primary client source or faithfully carried from it without resolving an ambiguity.
- **SAFE_FOUNDATION:** A conservative structural recommendation derived from source constraints. It is a subtype of **RECOMMENDED** and does not approve a business rule.
- **RECOMMENDED:** Proposed for product/domain approval; not yet a client fact or approved operational rule.
- **OPEN:** Unresolved, ambiguous, deferred, or dependent on client/domain confirmation.

Primary references are `I Do Grow Product and Development Manual.docx` (the **Manual**) and `I Do Grow description.pdf` (the **Description**). Project memory and Sprint 00 documents are synthesis and planning evidence subordinate to those sources. Legacy catalogue terms are secondary discovery evidence only.

## 1. Purpose

**SOURCE_CONFIRMED:** Hemp is the first MVP fibre and European hemp is the first operational use case. The initial focus is retted hemp straw presented in large rectangular bales, in the Netherlands and France. The Manual identifies decorticated hemp fibre, hurd, and other co-products as later products (Manual §§3.1–3.3; Description pp. 1, 4).

This document is intended to standardize how I Do Grow names and distinguishes reusable product classifications so that later work can support Supplier intake, Listings, physical Lots, Buyer search and Buy Orders, structured quality templates, matching, DPP records, and a future conceptual data-model update.

**SOURCE_CONFIRMED:** The broader natural-fibre scope also names sisal, coir, jute, kenaf, and raffia. **SAFE_FOUNDATION:** The same classification pattern should later accept those material families without structural redesign; this document does not build their taxonomies (Manual §3; Manual §9.2; MVP Success Criteria).

**OPEN:** This is a Sprint 00 foundation, not final commercial acceptance criteria. It does not establish mandatory quality measurements, grades, thresholds, certification rules, inspection methods, Lot/Batch semantics, reservation rules, or binding transaction behavior.

## 2. Taxonomy Principles

1. **SOURCE_CONFIRMED — Product definitions are separate from Listings.** A reusable catalogue definition must not be redefined by a Supplier's offer (Manual §8.3).
2. **SAFE_FOUNDATION — Stable canonical identity.** Each approved taxonomy concept should have a stable, language-neutral identifier independent of display text. Example identifier strings appearing in client examples are evidence of the need, not an approved identifier format.
3. **SOURCE_CONFIRMED — Multilingual display separation.** English, Dutch, and French are initial languages; canonical data must be stored independently from translated labels, and original translated input must be retained (Manual §21).
4. **SAFE_FOUNDATION — Labels, aliases, and search synonyms are not identifiers.** They may help Suppliers and Buyers find a concept, but must map back to one canonical concept.
5. **SOURCE_CONFIRMED — Product form is separate from quality grade.** Product Form belongs to the catalogue; Quality Grade derives from structured evidence and requires authorised human approval in the first release (Manual §§8.3, 8.7, 9.1; §2.3).
6. **SAFE_FOUNDATION — Product classification is separate from physical and commercial instances.** Taxonomy describes what the product is; Listing describes an offer; Lot describes a traceable physical quantity; Quality describes evidence and classification.
7. **SOURCE_CONFIRMED — Critical quality data is structured.** It must not be stored only as generic text (Manual §9.1).
8. **SAFE_FOUNDATION — Critical classification cannot be free-text only.** Free text may preserve the Supplier's original wording, but an approved canonical concept is required for comparison and matching.
9. **SOURCE_CONFIRMED — Provenance and original values are preserved.** Critical information, translations, measurements, evidence, versions, and corrections retain their source and history (Manual §§16.3–16.4, 17; §20).
10. **SAFE_FOUNDATION — Extensibility comes through new definitions and relationships.** Adding a fibre, form, application, packaging type, unit, or quality definition should not require a material-specific redesign.
11. **OPEN — Governance.** Who approves and maintains taxonomy concepts, translations, aliases, and changes is not assigned by this document.

## 3. Taxonomy Hierarchy

**SOURCE_CONFIRMED:** The strongest explicit client model is:

```text
Product Category
└── Product Type
    └── Product Form
```

The Manual's catalogue example is:

```text
Product Category: Natural Fibre
└── Product Type: Hemp
    └── Product Form: Retted Straw

Linked classification facets:
- Packaging Type: Large Rectangular Bale
- Application: Insulation
```

(Manual §8.3; supported by §§3.1–3.2 and example records in §§9.1 and 14.2.)

**SAFE_FOUNDATION:** Retain the source hierarchy rather than adding redundant `Material family → Fibre` levels. In this model, `Natural Fibre` already expresses the family/category and `Hemp` the fibre/product type. Packaging, Application, Quality Attribute, Unit, Certification Type, and any future Processing State are related controlled concepts, not mandatory descendants in one tree.

**OPEN source tension:** Manual §3.1 colloquially lists “large rectangular hemp bales” among first supported products, while the explicit catalogue model in §8.3 and the Listing Agent example in §14.2 classify `Large Rectangular Bale` as packaging. The recommended foundation treats it as **Packaging Type**, subject to confirmation under clarification A1.3.

**OPEN:** The sources use `retted` and `decorticated` within product/process terminology but do not decide whether Processing State is a separate controlled facet. For the first proof case, retain `Retted Straw` as the complete source-defined Product Form.

### Taxonomy attributes

**SAFE_FOUNDATION:** Stable reusable classification includes Product Category, Product Type, Product Form, linked Applications, linked Packaging Types, names/labels/aliases, source provenance, and lifecycle status. Quality-definition and certification vocabularies may be linked without making observed quality or certificate instances part of the Product master.

### Listing attributes

**SOURCE_CONFIRMED:** A Listing carries the commercial offer and known evidence: selected product classification, available quantity and unit, location, availability period, preferred selling price, photos, documents, and known quality measurements (Manual §5.2).

### Lot attributes

**SOURCE_CONFIRMED:** A Lot is the traceable physical quantity followed through inspection, grade, trade, shipment, and DPP. It carries instance-specific provenance and evidence rather than redefining the catalogue product (Manual §§8.4, 17; `DATA_MODEL.md`).

### Quality attributes

**SOURCE_CONFIRMED:** Quality comprises structured measurements, observations, methods, units, evidence, inspection results, non-conformities, and a human-approved grade where applicable (Manual §§5.6, 8.7, 9.1).

## 4. Hemp Canonical Product Classification

The primary sources name only a narrow set. They do not supply technical material-science definitions, accepted synonyms, or approved French/Dutch specialist translations.

**SAFE_FOUNDATION:** Every backticked machine-style canonical name in the table is a proposed stable identifier for discussion, not a client-supplied or approved identifier format. The human concepts and their identifier proposals therefore carry separate statuses.

| Canonical concept | English display label | French display label | Category / parent | Source-bounded definition | Source support | Typical Listing relevance | Likely associated quality dimensions | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `natural_fibre` | Natural Fibre | **OPEN** | Product Category / root for this scope | Client-named first category containing hemp and the other initial natural fibres. | Manual §§3, 8.3; Description p. 1 | Enables high-level catalogue grouping and future fibre expansion. | None directly; quality belongs to Product Type/Form definitions and Lot evidence. | **SOURCE_CONFIRMED** concept; identifier string **SAFE_FOUNDATION** |
| `hemp` | Hemp | **OPEN** (`Chanvre` is legacy evidence only) | Product Type / Natural Fibre | Client-named fibre and first European operational use case. No botanical or regulatory definition is supplied. | Manual §§3, 8.3; Description pp. 1, 4 | Primary product-type choice for the MVP. | Hemp-form-specific templates; no generic threshold is defined. | **SOURCE_CONFIRMED** concept; identifier string **SAFE_FOUNDATION** |
| `retted_straw` | Retted Straw | **OPEN** | Product Form / Hemp | The only hemp item explicitly modelled as Product Form. The sources name but do not technically define retting or the physical specification. | Manual §§3.1, 8.3, 9.1, 14.2; Description p. 4 | Active form for the smallest proof taxonomy. | Moisture, dimensions/weight when baled, retting quality, appearance/consistency, contamination/condition, storage, evidence. | **SOURCE_CONFIRMED** |
| `large_rectangular_bale` | Large Rectangular Bale | **OPEN** | Packaging Type linked to Retted Straw | Physical presentation named for the initial hemp case. It is packaging in the explicit catalogue example, not a grade. | Manual §§3.1, 8.3, 14.2 | Selected packaging for a Listing/Lot; supports quantity, transport, and comparison context. | Bale dimensions, estimated bale weight, integrity; exact ownership of these observations remains **OPEN**. | **SOURCE_CONFIRMED** term; Packaging normalization **SAFE_FOUNDATION** pending A1.3 |
| `decorticated_hemp_fibre` | Decorticated Hemp Fibre | **OPEN** | Later hemp product; exact Form/Processing modelling **OPEN** | Explicitly named later product and later quality-agent focus; no technical specification supplied. | Manual §3.1; Description p. 4 | Not active in the minimum proof taxonomy. | Not defined for MVP; do not inherit straw attributes automatically. | **SOURCE_CONFIRMED — LATER**; modelling **OPEN** |
| `hemp_hurd` | Hemp Hurd | **OPEN** | Later hemp co-product; exact hierarchy **OPEN** | Explicitly named later product/output of the decortication example; no technical specification supplied. | Manual §§3.1, 17.3 | Not active in the minimum proof taxonomy. | Not defined. | **SOURCE_CONFIRMED — LATER**; modelling **OPEN** |
| — | Other Hemp Co-products | **OPEN** | Unbounded later scope | Source phrase indicating future products, not a precise canonical classification. | Manual §3.1 | Must not be selectable as a specific product without clarification. | Not defined. | **OPEN** |

**OPEN:** No other hemp subtype is supported by the client sources. `Long fibre`, `Tow/Étoupe`, generic `Textile`, `Technical`, and Grade A/B/C appear only in the non-authoritative legacy prototype and are not approved taxonomy items.

## 5. Processing State

| Term or distinction | Treatment | Status |
| --- | --- | --- |
| Retting / `retted` | Appears within source-defined Product Form `Retted Straw`. Do not assume a separate state value yet. | **SOURCE_CONFIRMED** term; separate facet **OPEN** |
| Decortication / `decorticated` | Appears in a later product and a later Lot-transformation example. | **SOURCE_CONFIRMED — LATER**; separate facet **OPEN** |
| Raw | The sources describe raw materials generally but do not enumerate `raw` as a hemp processing-state value. | **OPEN / unsupported as an approved hemp value** |
| Processed | The sources discuss future processed/semi-finished goods and processing steps but not a controlled hemp state named `processed`. | **OPEN / unsupported as an approved hemp value** |
| Cleaned | Not provided as a hemp classification in the primary sources. | **OPEN / unsupported** |

**SAFE_FOUNDATION:** Preserve a conceptual place for processing history/state because DPP events must record processing and transformations. Do not activate a processing-state vocabulary until the domain owner confirms whether it is independent from Product Form and how it changes product identity.

## 6. Product Form vs Grade

**SOURCE_CONFIRMED:** Product Form and Quality Grade are different concepts.

- Product Form answers which source-defined tradable form is referenced, for example `Retted Straw`.
- Quality evidence records measurements, observations, methods, documents, and provenance for a physical Lot.
- Quality Grade is a classification derived from that evidence and requires authorised human approval in the initial release.

**OPEN:** The primary sources provide no approved hemp grade names, grade scale, threshold, tolerance, or pass/fail rule. Grade A/B/C is legacy mock content and must not be imported.

**SAFE_FOUNDATION:** A Listing may display the current human-approved grade of a referenced Lot when permissions and evidence allow, but that display does not turn the grade into Product Form or alter the canonical product identity.

## 7. Intended Applications

| Application | Source treatment | Taxonomy treatment | Status |
| --- | --- | --- | --- |
| Insulation | Initial target application and catalogue example. | Controlled Application linked to Hemp/Retted Straw as applicable; exact compatibility for the proof Lot remains to be confirmed. | **SOURCE_CONFIRMED** |
| Nonwoven Materials | Initial target application; named in first hemp quality-agent focus. | Controlled Application; not Product identity. | **SOURCE_CONFIRMED** |
| Biocomposites | Initial target application. | Controlled Application; no subtypes or specifications inferred. | **SOURCE_CONFIRMED** |
| Construction Materials | Initial target application. | Controlled Application; relationship to Insulation is not hierarchically resolved. | **SOURCE_CONFIRMED** |

**OPEN:** Which application(s) apply to the real proof product is part of A1.3. Textile, automotive reinforcement, paper, bedding, and other wider hemp uses are not client-confirmed initial applications and must not be added from industry knowledge or legacy fixtures.

## 8. Required Core Product Fields

These are product-master concepts, not database columns.

| Field concept | Purpose | Required / optional recommendation | Controlled vocabulary? | Multilingual? | Source status | Open question |
| --- | --- | --- | --- | --- | --- | --- |
| Canonical concept identity | Stable internal reference independent of labels. | Required | Yes | Identifier no; labels yes | **SAFE_FOUNDATION** | Identifier format and governance. |
| Product Category | Places the product under Natural Fibre. | Required | Yes | Display label/aliases | **SOURCE_CONFIRMED** | Confirm proof classification under A1.3. |
| Product Type | Identifies Hemp. | Required | Yes | Display label/aliases | **SOURCE_CONFIRMED** | Approved EN/FR/NL labels and synonyms. |
| Product Form | Identifies Retted Straw for the current case. | Required | Yes | Display label/aliases | **SOURCE_CONFIRMED** | Technical definition and accepted synonyms. |
| Definition / scope note | Prevents ambiguous use of the canonical concept. | Recommended before activation | Governed text | Yes | **SAFE_FOUNDATION** | Client/domain definition is not yet supplied. |
| Permitted/related Packaging Types | Makes packaging selectable without conflating it with form. | Recommended | Yes | Display label/aliases | **SOURCE_CONFIRMED** concept; relationship **SAFE_FOUNDATION** | Confirm Large Rectangular Bale under A1.3; exact cardinality. |
| Intended Applications | Supports search, requirements, and compatibility. | Optional/multi-valued until proof choice confirmed | Yes | Display label/aliases | **SOURCE_CONFIRMED** | Which apply to proof transaction. |
| Processing State association | Allows future separation of process state from form. | Optional / inactive for first seed | Yes if approved later | Display label/aliases | **OPEN** | Separate state or embedded form term? |
| Quality-definition associations | Links applicable attribute/measurement definitions without storing results on Product. | Recommended foundation; required assignments remain open | Yes | Labels/instructions may be multilingual | **SOURCE_CONFIRMED** concept; assignments **OPEN** | A5.1–A5.3. |
| Allowed quantity/measurement units | Prevents implicit units while remaining product-aware. | Recommended; exact set open | Yes | Display symbols/names | **SOURCE_CONFIRMED** concept | A1.3 and A5.1. |
| Certification Type associations | Enables requirements without treating certificates as Product data. | Optional/open | Yes | Display labels | **SOURCE_CONFIRMED** concept | Mandatory types and applicability. |
| Source provenance | Records why the concept/label exists. | Required for governed taxonomy | Yes/structured | No | **SOURCE_CONFIRMED** principle | Governance workflow. |
| Lifecycle/scope status | Distinguishes current, later, deprecated, or pending concepts. | Required recommendation | Yes | Display label | **SAFE_FOUNDATION** | Approval and change authority. |

## 9. Listing-Specific Fields

| Listing concept | Treatment | Status / dependency |
| --- | --- | --- |
| Product classification reference | Reference the approved Category/Type/Form rather than reproduce free text as authority. Preserve original Supplier wording separately. | **SOURCE_CONFIRMED / SAFE_FOUNDATION** |
| Supplier / represented party | Listing is created by Supplier or Trader on its behalf. | **SOURCE_CONFIRMED**; authority details remain **OPEN** |
| Available quantity and unit | Commercially offered amount. Unit is explicit. | **SOURCE_CONFIRMED** |
| Preferred selling price, currency, and price unit | Commercial offer data; components remain distinct. | Price **SOURCE_CONFIRMED**; exact allowed currencies/unit-price rules **OPEN** |
| Availability period | From/to window or equivalent source-backed availability. | **SOURCE_CONFIRMED** |
| Current offer location | Where the offered material is currently available; must not silently replace origin or shipping origin. | **SOURCE_CONFIRMED**; exact structured fields **OPEN** |
| Selected packaging | Large Rectangular Bale for the initial example; selection may be Listing- or Lot-specific. | Concept **SOURCE_CONFIRMED**; ownership **OPEN** |
| Minimum order quantity | Named as a matching criterion. | **SOURCE_CONFIRMED** concept; exact Listing semantics **OPEN** |
| Photos and documents | Evidence/supporting materials linked with provenance. | **SOURCE_CONFIRMED** |
| Known quality information | References structured reported/observed measurements or evidence; not an unqualified grade. | **SOURCE_CONFIRMED** |
| Commercial notes | May preserve relevant Supplier/Trader context without replacing structured fields. | **RECOMMENDED**; requiredness and visibility **OPEN** |

**SAFE_FOUNDATION:** Origin, harvest/production date, inspection evidence, and authoritative physical quantity belong primarily to the traceable Lot/provenance record, even when projected into a Listing for display. The future model should avoid conflicting duplicate authority.

## 10. Lot-Specific Fields

| Lot concept | Purpose | Status / dependency |
| --- | --- | --- |
| Lot identifier | Traceable physical-instance reference. | **SOURCE_CONFIRMED** |
| Product classification reference | Identifies what the Lot contains without redefining the catalogue. | **SAFE_FOUNDATION** |
| Supplier/producer and production site | Records the source party/site. | **SOURCE_CONFIRMED** |
| Country/region of origin | Physical provenance, distinct from current location. | **SOURCE_CONFIRMED** |
| Production/harvest date | Source-backed provenance/context when applicable. | **SOURCE_CONFIRMED** concept; exact requirement **OPEN** |
| Processing information/events | Records known processing history without inventing a state. | **SOURCE_CONFIRMED** DPP concept; MVP requiredness **OPEN** |
| Physical quantity and explicit unit | Actual traceable amount, with measured/estimated status and source. | **SOURCE_CONFIRMED** principles |
| Current Lot location | Physical current location, separate from origin and destination. | **SOURCE_CONFIRMED / SAFE_FOUNDATION** |
| Packaging instance/type reference | Links actual presentation and related evidence. | Packaging concept **SOURCE_CONFIRMED**; exact relationship **OPEN** |
| Provenance/source assertions | Retains who supplied or verified each value and when. | **SOURCE_CONFIRMED** |
| Evidence and documents | Photos, inspection evidence, test/lab results where applicable, and certificates. | **SOURCE_CONFIRMED** categories; mandatory set **OPEN** |
| Quality/inspection references | Connects results and approved grade to the physical Lot. | **SOURCE_CONFIRMED** |
| DPP relationship and events | Supports the basic Lot-linked passport and auditable journey. | **SOURCE_CONFIRMED** |

**OPEN:** Lot and Batch are not defined distinctly. Identity creation/end, split/combine/substitution/transformation, evidence inheritance, quantity allocation, and reinspection remain under A6.1–A6.2. This taxonomy does not choose Lot or Batch as the universal identity.

## 11. Quality Attribute Families

The Manual says hemp-straw fields “may include” the items below. They are source-confirmed candidates, not mandatory requirements. No threshold is defined.

| Attribute family | Source-supported candidates | Applicable form | Evidence kind | Status |
| --- | --- | --- | --- | --- |
| Moisture | Moisture percentage / moisture measurement | Retted Straw | Measurement with explicit value, unit, method, source, and measured/estimated status | **SOURCE_CONFIRMED candidate**; method/unit/threshold **OPEN** |
| Bale physical characteristics | Bale dimensions; estimated bale weight | Retted Straw when baled | Measurements/estimate; packaging context | **SOURCE_CONFIRMED candidates**; ownership and requiredness **OPEN** |
| Retting / processing assessment | Retting quality | Retted Straw | Observation or classification with method/evidence | **SOURCE_CONFIRMED candidate**; vocabulary/rule **OPEN** |
| Appearance and consistency | Colour; consistency; visual homogeneity; visual structure (Description) | Retted Straw | Observation/photo evidence | **SOURCE_CONFIRMED candidates**; controlled scales **OPEN** |
| Contamination and condition | Contamination; soil or stone contamination; mould indicators | Retted Straw | Observation or measurement only where an approved method defines it | **SOURCE_CONFIRMED candidates**; method/unit/threshold **OPEN** |
| Packaging integrity | Bale integrity | Retted Straw in bales | Observation/photo evidence | **SOURCE_CONFIRMED candidate**; acceptance rule **OPEN** |
| Storage context | Storage conditions | Lot of Retted Straw | Observation/declaration/evidence; provenance context | **SOURCE_CONFIRMED candidate**; requiredness **OPEN** |
| Material indication | Fibre-to-hurd indication | Retted Straw | Observation/estimate/measurement only after method definition | **SOURCE_CONFIRMED candidate**; meaning/method/unit **OPEN** |
| Temporal provenance | Harvest date | Lot of Retted Straw | Factual date/source evidence, not a grade | **SOURCE_CONFIRMED candidate**; exact requirement **OPEN** |
| Inspection evidence | Inspection mode, template/instructions, photos, geolocation, timestamp, inspector identity, equipment, sample/lab result where applicable, non-conformity, verification/approval | Lot/inspection | Structured observation, measurement, document, provenance and approval | **SOURCE_CONFIRMED categories**; mandatory set **OPEN** |

**OPEN / excluded as fact:** Strength is not named as an initial hemp quality dimension. Composition is possible DPP content but not a confirmed mandatory hemp measurement. No Grade A/B/C scale, pass/fail rule, sampling plan, equipment requirement, tolerance, or certificate requirement is approved.

## 12. Units and Measurement Principles

- **SOURCE_CONFIRMED:** General supported quantity units include tonnes, kilograms, bales, pallets, cubic metres, containers, truckloads, and pieces (Manual §22). This does not make every unit valid for every hemp field.
- **SOURCE_CONFIRMED:** Every quantity contains value, unit, conversion source, and estimated/measured status.
- **SAFE_FOUNDATION:** Every quality measurement should include an explicit unit where a unit applies; no implicit unit assumption is allowed.
- **SAFE_FOUNDATION:** Preserve the original supplied value and unit. A normalized value may be stored separately when an approved conversion exists; it must not overwrite the original.
- **SAFE_FOUNDATION:** Prefer SI-compatible normalization where practical, without losing trade/packaging units such as bale.
- **SOURCE_CONFIRMED:** Measurement method and evidence are distinct from attribute definition and observed value (Manual §§5.6, 9.1).
- **OPEN:** Allowed units by attribute, conversion rules/sources, decimal precision, rounding, and implementation libraries are not selected here.

## 13. Origin and Geography

The following concepts must not be collapsed into one generic `location` value:

| Geography concept | Meaning within source boundary | Status |
| --- | --- | --- |
| Country/region of origin | Where the material/product originates; relevant to search, DPP, duties, and requirements. | **SOURCE_CONFIRMED** |
| Production site | Supplier farm or production facility associated with production. | **SOURCE_CONFIRMED** |
| Current Lot location | Where the physical quantity is currently held. | **SOURCE_CONFIRMED / SAFE_FOUNDATION distinction** |
| Listing location | Location presented for the available offer; should reference authoritative Lot/location data where possible. | **SOURCE_CONFIRMED** concept; exact relationship **OPEN** |
| Shipping origin / pickup | Where a shipment begins. | **SOURCE_CONFIRMED** |
| Buyer delivery destination | Requested/contracted destination. | **SOURCE_CONFIRMED** |

**SOURCE_CONFIRMED:** France and the Netherlands are the first operational countries. **OPEN:** The sources do not require both to participate in the first proof transaction; A1.1 must identify the actual origin and destination.

## 14. Certifications and Documents

**SOURCE_CONFIRMED:** The sources distinguish reusable `CertificationType`, organisation certifications, Buyer certification requirements, Listing documents, inspection certificates, DPP certification/test evidence, and shipping/contract documents (Manual §§5.1–5.3, 8.2–8.3, 17).

**SAFE_FOUNDATION:** A certification/document model later needs to distinguish:

- certification or document type;
- issued certificate/document instance;
- issuer;
- identifier and validity/effective dates where applicable;
- holder/scope and links to Supplier, Product definition, Lot, Inspection, Trade, Shipment, or DPP;
- source, verification state, verifier, and version/history.

**OPEN:** No named certificate is mandatory for the proof hemp product. Issuer eligibility, scope, validity, expiry, verification, sharing, and mandatory document rules remain under A1.2, A5.1, A8.1/A8.3, and A10.1. Legacy GOTS, Organic, EU Eco, ISO, Fair Trade, and OEKO-TEX strings are mock content and are not approved requirements.

## 15. Multilingual Terminology

- **SOURCE_CONFIRMED:** Initial languages are English, Dutch, and French.
- **SOURCE_CONFIRMED:** Canonical product and transaction data remain independent of translated labels; original user input is retained when translated.
- **SAFE_FOUNDATION:** Each canonical concept should support one approved display label per language plus governed aliases/search synonyms. Identifiers remain untranslated.
- **SAFE_FOUNDATION:** Supplier input retains original wording and language alongside any normalized concept match and human correction.
- **SAFE_FOUNDATION:** Buyer search may match approved labels/aliases in the selected language while filtering/comparing canonical concepts.
- **OPEN:** The primary sources do not provide approved French or Dutch specialist labels. Even plausible translations must not be presented as client-approved.
- **OPEN:** `Chanvre`, `Chènevotte`, `Étoupe`, and other French strings appear in the legacy prototype only. They may inform validation but do not become authoritative automatically.
- **OPEN:** A1.3 should capture approved English/French/Dutch labels and aliases for the proof product when confirming its canonical classification. Longer-term translation approval/change governance remains unresolved.

## 16. Extensibility Beyond Hemp

**SOURCE_CONFIRMED:** Sisal, coir, jute, kenaf, and raffia are other initial natural-fibre categories/products in the broader vision; the model must support another fibre without structural redevelopment (Manual §3; MVP Success Criteria).

**SAFE_FOUNDATION:** Extension should reuse the same concepts:

```text
Product Category: Natural Fibre
└── Product Type: [Hemp | Sisal | Coir | Jute | Kenaf | Raffia | approved future type]
    └── Product Form: [approved forms for that type]

Linked, not embedded:
Applications · Packaging Types · Quality Definitions · Units · Certification Types · Labels/Aliases
```

**OPEN:** This document does not define forms, grades, quality attributes, origins, applications, translations, or certification requirements for non-hemp fibres. Legacy content for those fibres is not authority.

## 17. Legacy Mapping

| Legacy term/pattern | Target taxonomy concept | Treatment | Reason/status |
| --- | --- | --- | --- |
| `Chanvre` fibre value | Hemp Product Type; possible French label/alias | **NORMALIZE / OPEN** | Secondary bilingual evidence only; client validation required. |
| `Fibre longue` / Long fibre | Possible later hemp form | **OPEN / DISCARD for MVP** | Not a source-confirmed current hemp form; not assumed equivalent to decorticated fibre. |
| `Étoupe` / Tow | Possible later co-product/form | **OPEN / DISCARD for MVP** | Primary sources do not name it. |
| `Chènevotte` / Hurd | Source-confirmed later Hurd concept | **NORMALIZE / OPEN** | Hurd is later source scope; French label remains unapproved. |
| `Paille` / Straw used as a “grade” | Retted Straw Product Form only if retted identity is confirmed | **NORMALIZE / OPEN** | Legacy conflates product form with grade and omits retted qualification. |
| `Textile` and `Technique/Technical` used as hemp “grades” | Possible application/market descriptors | **DISCARD as grade / OPEN** | Not source-confirmed initial application labels or grade vocabulary. |
| Grade A/B/C | Quality Grade values | **DISCARD as authority** | Explicitly mock and unsupported by primary sources. |
| `humidity` numeric field | Moisture quality measurement | **NORMALIZE / OPEN** | Requires explicit unit, method, source, and evidence; fixture value is not authoritative. |
| Flat certification strings | Certification Type plus certificate/document instance | **NORMALIZE / OPEN** | Fixture names do not establish applicability or validity. |
| Generic `category` | Product Form or another governed facet | **NORMALIZE / OPEN** | Meaning varies and must be mapped, not copied. |
| Quantity fixed to `TM` | Listing/Lot quantity plus explicit unit | **NORMALIZE** | Client model separates value and unit and preserves originals. |
| Combined origin text | Origin, site, current location, or shipping origin as applicable | **NORMALIZE / OPEN** | Geography roles must remain distinct. |
| Listing used as inventory/Lot | Listing plus traceable Lot reference | **DISCARD shortcut / REDESIGN** | Product, commercial offer, and physical provenance are distinct. |
| Inline French/English UI strings | Governed localized labels/aliases | **DISCARD governance pattern** | Canonical concepts and translations must be separated. |

## 18. Open Taxonomy Questions

### BLOCKING for structured quality model

- **OPEN — A1.3 plus recommended workshop follow-up:** A1.3 explicitly asks for the proof product's category, type, form, packaging, trading/measurement units, applications, and accepted synonyms. The same workshop answer should additionally capture validated EN/FR/NL display labels and aliases; multilingual validation is not currently an explicit A1.3 question.
- **OPEN — A5.1:** Define required/optional hemp measurements and observations, units, methods, equipment, evidence, certificates, grade names, thresholds, and pass/fail rules.
- **OPEN — A5.2–A5.3:** Define quality checkpoints, minimum evidence, performers, final approver, and outcomes for incomplete/non-conforming evidence.
- **OPEN:** Confirm the technical meaning and scope of `Retted Straw` and whether retting/decortication are separate Processing State values.
- **OPEN:** Confirm whether bale dimensions/weight are primarily packaging-instance facts, Lot facts, inspection results, or provenance-bearing projections across them.

### IMPORTANT before Listing implementation

- **OPEN — A1.3:** Confirm selected packaging, units, applications, synonyms, and multilingual labels for the real proof Listing.
- **OPEN — A6.1–A6.2:** Define Lot versus Batch and first-MVP split/combine/transformation behavior.
- **OPEN:** Decide taxonomy master-data ownership, approval, versioning, deprecation, and translation governance.
- **OPEN:** Define authoritative ownership/projection rules for origin, current location, packaging, quantity, and known quality across Listing and Lot.
- **OPEN:** Decide exact allowed units/conversions and requiredness of MOQ, packaging, applications, photos, and documents for publication.

### Can remain deferred

- **SOURCE_CONFIRMED — LATER / OPEN modelling:** Decorticated hemp fibre, hurd, and other co-products.
- **OPEN:** Non-hemp product forms and quality models for sisal, coir, jute, kenaf, and raffia.
- **OPEN:** Advanced application hierarchies, semantic equivalence, and industry-standard crosswalks.
- **OPEN:** Detailed processing-state vocabulary, transformation taxonomy, sustainability attributes, and richer DPP lifecycle classifications beyond the real proof case.

## 19. Recommended MVP Taxonomy

The smallest source-grounded seed for one real transaction is:

```text
SOURCE_CONFIRMED
Product Category: Natural Fibre
└── Product Type: Hemp
    └── Product Form: Retted Straw

SOURCE_CONFIRMED term / SAFE_FOUNDATION placement
Packaging Type: Large Rectangular Bale

SOURCE_CONFIRMED application vocabulary
- Insulation
- Nonwoven Materials
- Biocomposites
- Construction Materials

SAFE_FOUNDATION
- Stable language-neutral concept identity
- EN/FR/NL labels and aliases kept separate from identity
- Separate Application, Packaging Type, Unit, Quality Definition, and Certification Type concepts
- References from Listing, Lot, Buy Order requirements, inspection evidence, matching, and DPP
- Provenance and lifecycle status for governed definitions

OPEN
- Approved translations and synonyms
- Proof Listing's application(s), units, packaging confirmation, and mandatory fields
- Processing State decomposition
- Quality assignments, methods, grades, thresholds, and certificates
- Lot/Batch semantics
```

**SAFE_FOUNDATION:** Only Retted Straw should be active as the current MVP hemp Product Form. Later products may be documented as deferred source concepts but must not appear as approved proof-product choices.

## 20. Validation Against Product Workflows

| Product workflow check | How the foundation supports it | Result |
| --- | --- | --- |
| Supplier adds a hemp product | One plain-language selection can map to Natural Fibre → Hemp → Retted Straw; packaging and original wording remain separate. Guided intake can progressively request Listing/Lot fields. | **SAFE_FOUNDATION — supported**, exact mandatory fields **OPEN** |
| Trader completes/corrects a Listing | Canonical classification, missing commercial fields, original Supplier input, and evidence can be reviewed without changing Product master definitions. | **SAFE_FOUNDATION — supported** |
| Buyer searches for hemp | Canonical Product Type/Form plus approved localized labels/aliases supports consistent search. | **SAFE_FOUNDATION — supported**, translations **OPEN** |
| Buyer creates a Buy Order | Requirements can reference the same Product/Form, Application, Packaging, Unit, Quality Definition, and Certification Type vocabularies. | **SAFE_FOUNDATION — supported**, exact requirements **OPEN** |
| System compares compatible products | Shared canonical references avoid text-only matching; Application/Packaging/Quality remain distinct comparison facets. | **SAFE_FOUNDATION — supported**, compatibility rules **OPEN** |
| Inspector records quality evidence | Candidate attribute families are separate from Product identity and attach structured results/evidence to a Lot/inspection. | **SOURCE_CONFIRMED / SAFE_FOUNDATION — supported**, template/rules **OPEN** |
| DPP references the physical Lot | Product classification is referenced while origin, quality, custody, transaction, and shipment events remain Lot-linked and provenance-aware. | **SOURCE_CONFIRMED — supported**, completeness rules **OPEN** |

**SAFE_FOUNDATION usability note:** With only one active hemp form, the Supplier should not face three redundant taxonomy screens. A short, resumable, mobile-first prompt may map one understandable selection to the canonical hierarchy. Administrative and Buyer views may expose more formal facets as needed.

## 21. Data Model Implications

**SOURCE_CONFIRMED:** `DATA_MODEL.md` already distinguishes catalogue definitions from Listings and describes Product Category, Product Type, Product Form, quality definitions, Applications, Packaging Types, Units, and Certification Types.

**RECOMMENDED:** After human approval of this taxonomy, `DATA_MODEL.md` will need a later conceptual synchronization to:

- make Application, Packaging Type, Unit, and Certification Type explicitly reusable definitions rather than hierarchy levels;
- describe language-neutral taxonomy identity plus localized labels, aliases/search synonyms, provenance, lifecycle status, and versioning;
- distinguish Packaging Type from selected Listing/Lot packaging;
- distinguish Certification Type from issued certificate/document instances;
- state that Listings and Buy Order requirements reference the same catalogue definitions used for compatibility;
- state explicitly that Product Form and Quality Grade are independent;
- preserve original Supplier wording and normalization provenance.

**OPEN:** A separate Processing State concept and exact relationships/cardinalities must wait for A1.3, A5, and A6. No physical schema, table, column, migration, ORM, or storage design is approved or created here.

## 22. Client Clarifications Required

Use existing questions rather than duplicating them:

- **A1.3:** proof-product classification, form, packaging, units, applications, synonyms. Capture approved EN/FR/NL labels and aliases in the same answer.
- **A5.1–A5.3:** structured quality candidates, methods, evidence, grade vocabulary, thresholds, checkpoints, approvals, and remedies.
- **A6.1–A6.2:** Lot/Batch and split/combine/transformation semantics.
- **A10.1–A10.3:** DPP fields/events/evidence, completeness, visibility, and corrections.
- **A1.1/A8.3:** actual geography and physical/shipping context for the proof Lot.

**RECOMMENDED:** No new standalone client question is required. Multilingual proof-product labels/aliases are a necessary detail of A1.3, while long-term taxonomy-governance ownership can remain an internal **OPEN** product/permission matter until that foundation is defined.

## 23. Specialist Perspectives

### Cheikh

Cheikh confirmed that the source hierarchy is Category → Product Type → Product Form and that only Retted Straw is explicitly modelled as a hemp Product Form. He highlighted the wording tension around large rectangular bales, the four initial Applications, the risk of importing legacy forms/grades, and the absence of authoritative specialist translations. He considered multilingual label approval important but not a new blocking question when captured under A1.3.

### Sokhna

Sokhna confirmed the separation of Product Form, Processing State, Packaging, evidence, and human-approved Grade. She bounded the hemp-straw quality candidate families, rejected strength and unsupported composition requirements, and required Lot-linked structured evidence, provenance, and no thresholds. She found A1.3, A5, A6, and A10 sufficient for the gaps.

### Khady

Khady confirmed the reusable conceptual entities and recommended relationship-based extensibility rather than material-specific structure. She emphasized language-neutral identity, reusable Packaging/Application/Unit/Certification definitions, certificate type versus instance, original-value preservation, and a later approved `DATA_MODEL.md` synchronization without physical schema work.

### Mariama

Mariama confirmed that the internal hierarchy should not become a burdensome mobile form. She recommended plain-language, resumable, progressive Supplier intake; canonical Buyer filtering behind localized labels/aliases; explicit separation of product, packaging, application, quality, Listing, and Lot; and unknown values displayed as unknown rather than inferred.

### Babacar if invoked

Babacar was not invoked. Commercial grade and naming effects are material to later matching and trading, but this taxonomy deliberately does not establish a grade vocabulary, equivalence rule, price implication, or binding commercial classification. Cheikh and Sokhna were sufficient to identify these items as **OPEN**; a trading review becomes necessary when real grade names or commercial equivalence are proposed.

## 24. Agreements

All selected specialists agreed that:

- Natural Fibre → Hemp → Retted Straw is the source-grounded active seed.
- Large Rectangular Bale should be treated as Packaging Type, with the source wording tension disclosed.
- Packaging, Application, Processing State, and Grade must not be forced into the Product hierarchy.
- Decorticated hemp fibre, hurd, and other co-products remain later/deferred.
- The four source-confirmed initial applications are Insulation, Nonwoven Materials, Biocomposites, and Construction Materials.
- Product, Listing, Lot, Quality, Packaging, Application, Certification, and DPP concepts remain distinct.
- No threshold, Grade A/B/C, mandatory certificate, specialist translation, or unsourced hemp subtype may be invented.
- Lot versus Batch remains unresolved.
- Existing clarification questions cover the material blockers.
- `DATA_MODEL.md` will later need conceptual synchronization after approval, but no schema work belongs in this task.

## 25. Disagreements

No substantive unresolved specialist disagreement remains.

One nuance was consolidated transparently:

- Cheikh initially identified multilingual label approval/governance as a possible genuinely missing **IMPORTANT** client question.
- Sokhna, Khady, and Mariama considered the proof terminology covered by A1.3 and longer-term governance safely deferrable.
- **Consolidated recommendation:** Do not add a duplicate standalone client question. Expand the A1.3 workshop answer to record approved EN/FR/NL labels and aliases. Keep long-term ownership/change governance **OPEN** for later product/permission definition.

The client source itself contains a wording tension: §3.1 calls large rectangular bales supported “products,” while §8.3 explicitly models Large Rectangular Bale as Packaging Type. The foundation recommends the explicit catalogue model without claiming the tension is a resolved client fact.

## 26. Formal Decision Required?

**RECOMMENDED:** Human product/domain approval is required before this taxonomy becomes the governed basis for implementation, quality-template assignment, search compatibility, or data-model synchronization.

**SOURCE_CONFIRMED / current decision status:** DEC-001 is architectural and remains unchanged. This analysis does not select a technology or change an approved architecture choice.

**RECOMMENDED:** No `DECISION_LOG.md` entry is required from analysis alone. If the taxonomy is formally adopted as a significant product/domain rule, the project should record approval through the appropriate product-decision mechanism without rewriting DEC-001 or the client sources.

## 27. Next Action

Proceed next with the Sprint 00 **Structured Quality Model** as a source-grounded draft, using only:

1. the active seed `Natural Fibre → Hemp → Retted Straw`;
2. `Large Rectangular Bale` as a proposed Packaging Type placement pending A1.3;
3. the quality candidate families in §11, with no thresholds or mandatory status inferred;
4. explicit evidence types, original values/units, method, provenance, and human approval state;
5. OPEN placeholders tied to A5.1–A5.3 for requiredness, units, methods, grades, thresholds, checkpoints, approvers, and remedies.

Before any implementation, obtain A1.3 confirmation for the real proof product and domain-quality answers to A5.1–A5.3. Continue Sprint 00; do not start Sprint 01 or create application code, a physical schema, migrations, or dependencies from this foundation.
