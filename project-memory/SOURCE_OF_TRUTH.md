# Source of Truth

## Primary client sources

All documents under `docs/client/*` are classified as **PRIMARY CLIENT SOURCES** unless explicitly reclassified through a later client clarification.

The following original client documents are registered as **PRIMARY** sources:

1. `docs/client/I Do Grow Product and Development Manual.docx` — detailed product vision, principles, roles, workflows, conceptual data, UX, AI, MVP, exclusions, phases, backlog, and recommendations.
2. `docs/client/I Do Grow description.pdf` — concise client business vision and description of the intended ecosystem, accessibility, quality, DPP, matching, and long-term direction.

Both documents must be retained unchanged as source evidence. Neither filename nor ordering above implies that one primary document overrides the other. Where they differ or appear inconsistent, the conflict must be recorded for client clarification.

## Internal planning documents

All documents under `docs/planning/*` are classified as **INTERNAL PLANNING DOCUMENTS**. They support planning and delivery but are not primary client sources or approved project decisions.

Internal planning documents must never override original client documents, later explicit client clarifications, or approved project decisions.

## Authority order

1. Original client documents
2. Explicit client clarifications received later
3. Approved project decisions
4. Internal planning documents

Internal planning must never silently override, narrow, expand, or reinterpret a client requirement. Any approved departure must be explicit, traceable to its authority, and recorded as a new decision without modifying prior decisions.

## Interpretation rules

- **Explicit client requirement:** A capability or constraint stated with mandatory/direct product language or as an unqualified item in the stated MVP scope or success criteria.
- **Client recommendation:** An approach described as recommended, suggested, possible, exemplary, or configurable. It is not an approved project decision.
- **MVP scope:** Items explicitly listed in the manual’s MVP scope, MVP success criteria, or necessary steps in its real-transaction proof objective.
- **Future or long-term vision:** Items labelled later, future, long-term, eventual, or placed in scale/expansion phases.
- **Out of scope:** Items explicitly excluded from the first MVP, subject to the source’s exception “unless a real transaction requires it.”
- **Unresolved or ambiguous:** Missing business rules, undefined thresholds, alternatives, or source statements whose scopes cannot be reconciled without clarification.

Language such as “may,” “possible,” “example,” and “recommended” must not be promoted silently into a binding requirement. Technical recommendations remain recommendations pending formal architectural approval.

## Known ambiguities and tensions

- The PDF permits supplier access through a “mobile website or app”; the manual requires mobile-first responsive workflows but excludes native iOS and Android apps from the first MVP.
- The PDF describes automatic and, as much as possible, real-time sourcing; the manual says no binding transaction should be created automatically in the first release and requires human approval for high-risk actions. Early advisory/non-binding automation is a plausible interpretation, not an approved resolution.
- The manual’s MVP list includes quality, logistics, DPP, and AI capabilities, while the roadmap places these across Phases 2–4. The MVP release boundary versus delivery sequence is not explicit.
- The manual names the Netherlands and France as first operational countries but does not say whether both are mandatory participants in the first proof transaction.
- The PDF describes I Do Grow as a trader and trading cooperative; the manual refers to an I Do Grow entity and active commodity trader. Legal entity structure and cooperative rules are undefined.

## Source-backed constraints

- Do not invent certifications, measurements, suppliers, buyers, commercial terms, or legal conclusions.
- Preserve original values, provenance, versions, and audit history for critical transaction information.
- Treat AI outputs as proposals within controlled permissions; high-risk and binding actions initially require human approval.
- Maintain a shared transactional model across marketplace, internal trading, quality, logistics, compliance, DPP, and agents.
