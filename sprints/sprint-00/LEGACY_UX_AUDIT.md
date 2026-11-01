# Executive Summary

## Scope and evidence

- **OBSERVED FACT:** The legacy repository is `/Applications/MAMP/htdocs/Lab/fiber-connect` at observed revision `fcb7be249953058c867fce88b7e15904c7d63330` on `main`.
- **OBSERVED FACT:** Its working tree was already substantially dirty before this audit. The baseline Git-state fingerprint is `0e1fb6b5b261daf4f4ffb3cda3c690e483183c05db1d6b6bfe06482387c8014b`.
- **OBSERVED FACT:** The source defines 43 TanStack file routes: one authenticated layout and 42 user-facing pages/screens.
- **OBSERVED FACT:** Most portal data comes from static arrays in `src/lib/mock/data.ts`; authentication and role switching are simulated in browser-persisted Zustand state; many actions only display toasts.
- **AUDIT LIMITATION:** The application was not started. No dependency, build, test, or external service was invoked. All visual conclusions are **SOURCE-BASED**, and every existing screen is marked `VISUAL_REVIEW_REQUIRED` for rendered review.

## Classification summary

The counts below use the final **Recommendation** for the 42 existing user-facing route screens. The separate CREATE_NEW count covers required missing screen/workflow groups, not existing routes.

| Classification | Count |
|---|---:|
| KEEP | 0 |
| IMPROVE | 7 |
| REDESIGN | 34 |
| REMOVE | 1 |
| CREATE_NEW | 30 |

**RECOMMENDATION:** Retain the strongest concepts—role portals, trader cockpit, marketplace, searchable relationship directories, analytics patterns, bilingual content, and the natural-fibre visual language—but do not treat any legacy screen as ready to carry forward unchanged. The target Next.js/NestJS/PostgreSQL architecture, real permissions, shared transaction model, mobile-first supplier intake, quality, matching, contracts, DPP, and controlled AI all require new technical implementation.

# Legacy Screen Inventory

Status terminology:

- **MOCK:** Screen reads fixtures or fixed identities and has no persistent backend operation.
- **PARTIAL:** Some local filtering/calculation/state works, but the business workflow is not persistent or complete.
- **PURELY VISUAL:** Controls/copy exist without confirmed business behavior.
- **REAL (UI-only):** A local UI behavior such as filtering, navigation, language switching, or calculation genuinely executes; this does not mean the underlying business process is operational.

## Public

| Route | Screen | Role | Purpose | Main actions | Key information | Status |
|---|---|---|---|---|---|---|
| `/` | Home | Public visitor | Present I Do Grow and route visitors to services/portals | Navigate, select language/role demo, request demo | Value proposition, role cards, process, quality/traceability claims | PARTIAL: navigation/language real; claims and portal data unverified |
| `/about` | About | Public visitor | Explain mission, model, and values | Navigate/contact | Mission, story, operating principles | PURELY VISUAL content |
| `/fibres` | Fibres | Public visitor | Present supported fibre families | Browse fibres, request sample/quote | Fibre imagery, characteristics, applications | PURELY VISUAL; product claims unverified |
| `/network` | Network | Public visitor | Present supply network/geographies | Navigate/contact | Countries, producers, logistics/network narrative | PURELY VISUAL; claims unverified |
| `/services` | Services | Public visitor | Present marketplace/trading/service offers | Navigate/contact | Service packages, commissions/pricing claims, logistics/ESG | PURELY VISUAL; commercial claims unverified |
| `/contact` | Contact | Public visitor | Collect a business enquiry | Complete form, submit | Contact details and enquiry fields | MOCK: submit produces toast only |

## Supplier

| Route | Screen | Role | Purpose | Main actions | Key information | Status |
|---|---|---|---|---|---|---|
| `/supplier` | Supplier Dashboard | Supplier | Summarize supplier activity | Open listing modal, navigate, contact WhatsApp | Fixture KPIs, listings, orders, payments | MOCK/PARTIAL: local modal and navigation only |
| `/supplier/listings` | My Listings | Supplier | View/filter offered fibre lots | Search, filter, open creation modal | Fixture listing ID, fibre/category, grade, quantity, price, date, status | MOCK/PARTIAL: filters real; save not persistent |
| `/supplier/orders` | Incoming Orders | Supplier | View buyer orders | Search/filter/read | Fixture buyer, fibre, quantity, value, destination, status | MOCK |
| `/supplier/shipments` | Shipments | Supplier | Follow deliveries | View progress | Fixture order tracking, route, carrier, ETA, timeline | MOCK |
| `/supplier/payments` | Payments | Supplier | View payment state | Read rows | Fixture order/payment direction, amount, status, date | MOCK |
| `/supplier/profile` | My Company | Supplier | View/edit company profile | Submit profile form | Fixture company/contact/location/fibres/revenue | MOCK: submit produces toast only |

## Buyer

| Route | Screen | Role | Purpose | Main actions | Key information | Status |
|---|---|---|---|---|---|---|
| `/buyer` | Buyer Dashboard | Buyer | Summarize procurement activity | Open request modal, navigate | Fixture KPIs, requests, orders, quotes | MOCK/PARTIAL |
| `/buyer/marketplace` | Marketplace | Buyer | Browse approved supply | Search, filter by fibre, request quote | Fixture lot, origin, grade, certification, quantity, price, MOQ, availability | PARTIAL: filters real; RFQ is toast-only |
| `/buyer/requests` | Sourcing Requests | Buyer | View/create simplified demand | Search, open creation modal | Fixture fibre, quantity, grade, destination, delivery, status | MOCK/PARTIAL: no persistence |
| `/buyer/quotes` | Received Quotes | Buyer | Review commercial proposals | Accept/reject | Fixture cost breakdown, lead time, status | MOCK: decisions are toast-only |
| `/buyer/orders` | My Orders | Buyer | View converted orders | Search/filter/read | Fixture order, fibre, origin, quantity, value, status | MOCK |
| `/buyer/shipments` | Shipment Tracking | Buyer | Track deliveries | View progress | Fixture carrier, tracking, route, ETA, timeline | MOCK |
| `/buyer/invoices` | Invoices | Buyer | View payment/invoice-like records | Read | Fixture order/payment amount, status, date | MOCK; no invoice entity confirmed |
| `/buyer/profile` | My Company | Buyer | View/edit buyer profile | Submit profile form | Fixture company/contact/location/spend | MOCK: submit produces toast only |

## Trader

| Route | Screen | Role | Purpose | Main actions | Key information | Status |
|---|---|---|---|---|---|---|
| `/trader` | Trader Dashboard | I Do Grow Trader | Operational cockpit | Open quote modal, navigate to work queues | Fixture KPIs, activity, pending listings, requests, shipments | MOCK/PARTIAL |
| `/trader/suppliers` | Suppliers | Trader | Search/manage supplier relationships | Search/filter, open supplier, add modal | Fixture organisation/contact/country/status/fibres/volume | MOCK/PARTIAL |
| `/trader/suppliers/$id` | Supplier Detail | Trader | Consolidate a supplier relationship | Navigate/read | Fixture profile, listings, orders, payments | MOCK |
| `/trader/buyers` | Buyers | Trader | Search/manage buyer relationships | Search/filter, add modal | Fixture organisation/contact/country/status/spend/orders | MOCK/PARTIAL |
| `/trader/inventory` | Listing Review | Trader | Review submitted listings | Request info, reject, approve | Fixture listing/supplier/quality/price/status | MOCK: actions are toast-only |
| `/trader/whatsapp` | WhatsApp Parser | Trader | Convert pasted supplier text to listing fields | Paste, parse, edit, “save” | Regex-extracted supplier/origin/fibre/grade/quantity/price/date and mock history | PARTIAL prototype; no WhatsApp or persistence |
| `/trader/sourcing` | Sourcing Requests | Trader | Review buyer demand | Search/filter, navigate to quotes | Fixture request/buyer/product/delivery/status | MOCK/PARTIAL |
| `/trader/quotes` | Quotes & Offers | Trader | View/create simplified quotes | Open modal, read/filter | Fixture buyer/supplier/product/costs/margins/status | MOCK/PARTIAL; no versioning/persistence |
| `/trader/orders` | Orders | Trader | Monitor transactions represented as orders | Search/filter/open detail | Fixture parties, route, value, tracking, status | MOCK/PARTIAL |
| `/trader/orders/$id` | Order Detail | Trader | Consolidated transaction overview | Change displayed status, read docs/history | Fixture commercial, logistics, finance, document labels, history | MOCK: status action is toast-only |
| `/trader/logistics` | Logistics | Trader | Surface shipment operations | Trigger visual actions | Fixture orders and checklist actions | MOCK/PURELY VISUAL actions |
| `/trader/finance` | Finance | Trader | Summarize margins and payment flows | Read | Fixture quotes, orders, payments, margins | MOCK |
| `/trader/settings` | Settings | Trader | Edit profile/password | Save, change password | Fixed demo identity/form fields | MOCK: actions are toast-only |

## Administrator

| Route | Screen | Role | Purpose | Main actions | Key information | Status |
|---|---|---|---|---|---|---|
| `/admin` | Analytics | Administrator | Show platform metrics | Read charts/KPIs | Fixture suppliers, buyers, orders, status distributions | MOCK |
| `/admin/users` | Users | Administrator | Search/manage people | Search, add user, trigger reset | Combined fixture suppliers/buyers and role form | MOCK/PARTIAL; reset is toast-only |
| `/admin/catalog` | Product Catalog | Administrator | Configure fibres/categories/grades | Add/delete visual items | Hard-coded fibre types, grades, certifications | MOCK/PARTIAL local UI |
| `/admin/freight` | Freight Rates | Administrator | Maintain freight reference values | Add visual rate | Fixture lanes/volume bands/cost | MOCK |
| `/admin/customs` | Customs Duties | Administrator | Maintain duty reference values | Add visual duty | Fixture origin/destination/fibre/rate | MOCK |
| `/admin/landed-cost` | Landed-Cost Calculator | Administrator | Estimate a simplified delivered cost | Enter values, calculate locally | Product, freight, handling, insurance, margins; hard-coded mock freight rate | PARTIAL local calculator; not source-complete |
| `/admin/platform` | Platform Settings | Administrator | Display margin and integration settings | Save/test/update visual controls | Hard-coded fees; WhatsApp/OpenAI placeholders and model label | MOCK/PURELY VISUAL; misleading connection state |

## Shared / Authentication

| Route | Screen | Role | Purpose | Main actions | Key information | Status |
|---|---|---|---|---|---|---|
| `/login` | Login | Shared | Enter a role portal | Enter unused credentials, select demo role, log in | Four fixed demo identities/roles | MOCK; no real authentication |
| `/forgot-password` | Forgot Password | Shared | Request password reset | Enter email, submit | Confirmation copy | MOCK: no email/backend request |

## Other shared states

**OBSERVED FACT:** The root layout defines bilingual 404 and error states, language-aware metadata, Google Fonts, and Sonner notifications. These are shared UI states, not standalone file-route pages and are excluded from the 42-screen count.

**OBSERVED FACT:** No dedicated Quality Inspector, Compliance Manager, or Logistics Partner portal route was found.

# Public Experience

## Observed facts

- Public pages use a shared site shell, bilingual inline copy, photographic sections, and consistent calls to action.
- Navigation and language switching are real local UI behaviors.
- Contact submission and many calls to action are not connected to backend workflows.
- Services and homepage contain commercial, finance, ESG, traceability, quality, and performance claims that are not established as client-approved facts by the code.

## Recommendations

- Keep the public-site concept separate from the transaction-application MVP decision until product ownership confirms scope.
- Validate all claims, prices, percentages, statistics, partner references, geography, and image rights.
- Preserve useful narrative/visual patterns only after rendered brand and accessibility review.
- Replace dead or toast-only calls to action with clearly defined outcomes when implementation is authorized.

# Supplier Experience

## Observed facts

- The legacy supplier navigation is Dashboard, My Listings, Incoming Orders, Shipments, Payments, and Company Profile.
- The client-required navigation is Home, My Products, Add Product, Offers, Shipments, Payments, and Messages.
- The listing form is a short desktop-style modal with fibre, grade, quantity, and price only.
- Listings, orders, shipments, and payments are fixture tables/cards with no persistence.
- There is no confirmed onboarding, business verification, document upload, photo/video/voice intake, guided conversation, low-bandwidth flow, listing completeness, offer decision, or messaging experience.

## Recommendations

- Redesign the supplier journey around mobile-first onboarding and guided product submission.
- Separate Products/Listings, Offers, Shipments, Payments, and Messages according to the client workflow.
- Make missing information, review status, approval/rejection reasons, and next actions explicit.
- Validate whether “Incoming Orders” should remain a supplier-facing concept or be represented as offers/accepted trades.

# Buyer Experience

## Observed facts

- The marketplace concept and simplified sourcing requests align broadly with buyer needs.
- The marketplace exposes only text/fibre filtering and cards; it lacks most required filters and a confirmed detail/comparison view.
- “Sourcing Request” is the closest legacy concept to Buy Order, but it lacks the full client-required requirements set.
- Matches, Contracts, Documents, and DPP Library are absent.
- Quote actions are not persistent and quote versions/negotiation are absent.

## Recommendations

- Preserve the marketplace and demand-entry concepts while restructuring around Listing Detail, Buy Orders, Matches, Quotes, Contracts, Shipments, Documents, and DPP.
- Provide explicit transitions and statuses from buy order through approved match and accepted quote.
- Separate indicative marketplace information from binding commercial terms.
- Add comparison, landed-cost provenance, quality evidence, certifications, supplier reliability, and delivery certainty when backed by real data.

# Trader Experience

## Observed facts

- The dashboard is the strongest conceptual match to the required trader cockpit.
- Supplier and buyer directories support relationship-management concepts.
- Listing review, sourcing, quotes, orders, logistics, and finance are represented but isolated and fixture-driven.
- No real approval queue, matching workspace, quality issue queue, shipment issue queue, payment issue queue, agent recommendation review, or auditable action state exists.
- The “Order” detail combines commercial, logistics, finance, documents, and history, approximating a transaction overview but using a simplified single entity.

## Recommendations

- Organize trader work around attention/approval queues and the end-to-end transaction lifecycle rather than disconnected tables.
- Retain the consolidated transaction-overview concept while separating its underlying entities according to `DATA_MODEL.md`.
- Retain relationship directory concepts with organisation verification, completeness, activity, and permissions.
- Replace the regex/parser demo with controlled assisted intake, evidence, missing-field prompts, confidence, handover, approval, and audit states.

# Administrator Experience

## Observed facts

- Analytics, users, catalogue, freight, customs, landed cost, and platform settings are represented.
- Users combine supplier and buyer fixture contacts rather than users, organisations, memberships, roles, and permissions.
- Catalogue uses coarse fibre/grade constants rather than configurable product taxonomy and structured quality definitions.
- Platform settings imply vendor selections and connection state that are not approved or operational.

## Recommendations

- Redesign administration around Users, Organisations, Roles/Permissions, Taxonomy/Quality Definitions, Workflow Rules, System Configuration, and Activity/Audit.
- Keep analytics presentation patterns only after metrics are formally defined.
- Remove provider-specific placeholder settings from the target navigation until separate decisions select providers.
- Treat freight/customs and landed cost as controlled source/provenance data, not free-standing ungoverned constants.

# Missing Quality Inspector Experience

## Observed facts

- No Quality Inspector role, navigation, task list, inspection detail, structured measurement form, photo evidence flow, grade approval, non-conformity view, or certificate screen exists.
- Generic grade, humidity, certification labels, and quality-related timeline text do not establish an inspection workflow.

## Recommendation

Create a distinct, permissioned inspector experience containing only the high-level required workflows identified by the client: assigned tasks, inspection detail/instructions, structured measurement entry, evidence capture/upload, grade decision, non-conformity recording, and certificate output. Navigation and detailed design remain unresolved.

# Cross-Cutting Workflows

## Observed facts

- Language preference, role navigation, status badges, tables, filters, dialogs, notifications, error states, and responsive CSS utilities are shared patterns.
- Notifications are transient toasts, not a notification center or durable notification records.
- Document labels appear in an order detail, but no document entity, repository, permissions, upload, review, or provenance workflow exists.
- History is hard-coded display content; no audit-event model exists.
- Human approvals are represented by buttons but not durable approval states.
- There is no contract lifecycle or DPP workflow.

## Recommendations

- Introduce cross-cutting navigation/access patterns for Notifications, Documents, contextual History/Audit, and Human Approval tasks.
- Keep audit history distinct from user-facing transaction activity, even if surfaced together contextually.
- Define empty/loading/error/permission/pending/rejected/expired/conflict states before wireframing final flows.
- Ensure every action makes its authority, binding effect, required approval, and resulting status clear.

# Screen-by-Screen Assessment Matrix

All UI assessments are `VISUAL_REVIEW_REQUIRED` because the rendered application was not inspected. “Code Reuse” assesses confidence in direct source reuse, not whether the concept can inform the new product. `UNVERIFIED` means this audit does not approve code migration.

| Route | Role | Purpose | Product | UX | UI | Code Reuse | Recommendation |
|---|---|---|---|---|---|---|---|
| `/` | Public | Marketing home | IMPROVE | IMPROVE | VISUAL_REVIEW_REQUIRED | UNVERIFIED | IMPROVE |
| `/about` | Public | Mission/about | IMPROVE | IMPROVE | VISUAL_REVIEW_REQUIRED | UNVERIFIED | IMPROVE |
| `/fibres` | Public | Fibre catalogue narrative | IMPROVE | IMPROVE | VISUAL_REVIEW_REQUIRED | UNVERIFIED | IMPROVE |
| `/network` | Public | Supply-network narrative | UNVERIFIED | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/services` | Public | Service/pricing narrative | IMPROVE | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/contact` | Public | Business enquiry | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/login` | Shared | Authentication | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | REMOVE | REDESIGN |
| `/forgot-password` | Shared | Account recovery | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | REMOVE | REDESIGN |
| `/supplier` | Supplier | Dashboard | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/supplier/listings` | Supplier | Listing management | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/supplier/orders` | Supplier | Incoming orders | UNVERIFIED | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/supplier/shipments` | Supplier | Shipment status | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/supplier/payments` | Supplier | Payment status | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/supplier/profile` | Supplier | Organisation profile | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer` | Buyer | Dashboard | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer/marketplace` | Buyer | Browse supply | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer/requests` | Buyer | Demand requests | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer/quotes` | Buyer | Quote review | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer/orders` | Buyer | Orders/trades | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer/shipments` | Buyer | Shipment tracking | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer/invoices` | Buyer | Invoice/payment display | IMPROVE | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/buyer/profile` | Buyer | Organisation profile | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader` | Trader | Operational cockpit | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/suppliers` | Trader | Supplier directory | KEEP | IMPROVE | VISUAL_REVIEW_REQUIRED | UNVERIFIED | IMPROVE |
| `/trader/suppliers/$id` | Trader | Supplier detail | KEEP | IMPROVE | VISUAL_REVIEW_REQUIRED | UNVERIFIED | IMPROVE |
| `/trader/buyers` | Trader | Buyer directory | KEEP | IMPROVE | VISUAL_REVIEW_REQUIRED | UNVERIFIED | IMPROVE |
| `/trader/inventory` | Trader | Listing review | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/whatsapp` | Trader | Assisted intake prototype | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | REMOVE | REDESIGN |
| `/trader/sourcing` | Trader | Buyer-demand queue | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/quotes` | Trader | Quote workspace | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/orders` | Trader | Transaction list | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/orders/$id` | Trader | Transaction overview | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/logistics` | Trader | Logistics operations | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/finance` | Trader | Finance/settlement overview | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/trader/settings` | Trader | Personal settings | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | REMOVE | REDESIGN |
| `/admin` | Administrator | Analytics | KEEP | IMPROVE | VISUAL_REVIEW_REQUIRED | UNVERIFIED | IMPROVE |
| `/admin/users` | Administrator | User management | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/admin/catalog` | Administrator | Product taxonomy | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/admin/freight` | Administrator | Freight reference data | IMPROVE | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/admin/customs` | Administrator | Customs reference data | IMPROVE | REDESIGN | VISUAL_REVIEW_REQUIRED | UNVERIFIED | REDESIGN |
| `/admin/landed-cost` | Administrator | Cost estimator | KEEP | REDESIGN | VISUAL_REVIEW_REQUIRED | REMOVE | REDESIGN |
| `/admin/platform` | Administrator | Vendor/config placeholders | REMOVE | REMOVE | VISUAL_REVIEW_REQUIRED | REMOVE | REMOVE |

## Existing-screen recommendation totals

- KEEP: 0
- IMPROVE: 7
- REDESIGN: 34
- REMOVE: 1
- Existing screens requiring visual review: 42

# Missing Screens / CREATE_NEW

These are high-level required screen/workflow groups only. They are not detailed designs or approved route structures.

## Supplier (6)

1. Supplier onboarding and verification
2. Mobile-first guided product submission
3. Listing detail, completeness, review status, and correction flow
4. Supplier document handling
5. Offers and accept/reject flow
6. Supplier messages/conversation handover

## Buyer (6)

7. Marketplace listing detail and comparison
8. Complete buy-order creation
9. Explainable matches and multi-supplier options
10. Contract list/detail and acceptance context
11. Buyer documents center
12. DPP Library and passport access

## Trader (5)

13. Unified approval queue
14. Matching workspace and match approval
15. Structured transaction overview across trade/contract/shipment/settlement
16. Quality, shipment, and payment issue queues
17. Future agent recommendations/review queue

## Quality Inspector (6)

18. Inspection task list
19. Inspection detail and instructions
20. Structured measurement entry
21. Photo/document evidence
22. Grade approval and non-conformity decision
23. Inspection certificate output/history

## Administrator (3)

24. Organisation management
25. Roles, permissions, and membership management
26. Workflow/system rule configuration separated from provider selection

## Cross-cutting (4)

27. Durable notification center/preferences
28. Contextual activity and immutable audit/history views
29. Human approval states and approval detail
30. Shared document lifecycle with provenance and permissions

**CREATE_NEW total:** 30 required screen/workflow groups.

# Navigation and Information Architecture Findings

## Observed facts

- Four distinct sidebar menus are selected entirely by a local demo role.
- Supplier and Buyer menus differ from the client-documented navigation.
- Trader navigation is broad but organized by legacy entities rather than explicit attention/approval states.
- Quality Inspector is absent.
- Administrator mixes business reference data, platform configuration, and unselected vendor placeholders.
- Search in the portal shell is a visible input, but no global-search behavior was confirmed.

## Recommendations

- Align navigation labels with client terminology: Listing, Lot, Buy Order, Match, Quote, Trade, Shipment, Settlement, and DPP.
- Organize Trader navigation around Cockpit, Relationships, Supply, Demand/Matching, Transactions, Quality, Logistics, Settlement, and Approvals.
- Avoid duplicating the same lifecycle under inconsistent terms such as request/order/transaction without defined transitions.
- Keep cross-cutting Documents, Notifications, and contextual History available from the relevant record rather than creating disconnected silos by default.

# Mobile UX Findings

## Source-based observations

- Tailwind responsive utilities are present, and the component library includes sheets/drawers and a mobile hook.
- Core supplier work is dominated by desktop-style side navigation, tables, grid cards, and modal forms.
- The supplier listing form is short but not the required guided conversational workflow.
- No low-bandwidth mode, offline behavior, camera/photo flow, video/voice intake, location capture, upload progress, draft recovery, or WhatsApp handover was found.
- Rendered breakpoint behavior, touch targets, keyboard behavior, table overflow, and accessibility are UNVERIFIED.

## Recommendations

- Treat all supplier flows as mobile-first tasks, not scaled-down desktop tables.
- Use progressive, resumable steps with explicit completeness and review status.
- Provide upload/capture feedback, draft preservation, error recovery, and assisted/trader handover.
- Test the complete supplier submission and correction loop on low-bandwidth mobile conditions during later validation.

# Design System / Reusable UI Findings

## Observed facts

- Tailwind tokens define emerald/gold brand colors, semantic states, charts, sidebar, shadows, radii, light/dark palettes, and Inter typography.
- A broad shadcn/Radix primitive set, Lucide icons, status badges, cards, tables, filters, dialogs, timelines, charts, loading/error/404 states, and language switcher exists.
- Public pages use a coherent natural-fibre/agriculture/logistics image library.
- UI copy is embedded inline in French/English pairs rather than managed as a scalable translation catalogue.

## Recommendations

- Retain tokens, imagery, and component patterns only after human visual, brand, rights, responsive, and accessibility review.
- Recreate approved patterns within the DEC-001 stack; this report does not approve direct source copying.
- Define semantic component states for pending review, missing information, approval required, rejected, expired, disputed, AI preliminary, and verified.
- Replace inline translation pairs with a maintainable internationalization content model during later implementation planning; the exact library remains within the already approved requirement for internationalization support, not a new decision here.

# Workflow Gaps

## End-to-end lifecycle

**OBSERVED FACT:** Legacy screens visually cover supply, demand requests, quotes, orders, shipments, and payment summaries, but they do not form a persistent Supplier → Trader → Buyer transaction lifecycle.

Missing or incomplete transitions include:

- supplier verification before binding trade;
- listing completeness, review, rejection correction, publication, reservation, and lot traceability;
- complete buy-order requirements and recurring/private demand;
- deterministic matching and human-approved recommendation;
- quote versions, counteroffers, validity, and audit trail;
- inspection assignment, structured results, human grade approval, and certificate;
- accepted quote to Trade and Contract;
- freight requirement, quote comparison, carrier selection, shipment events, exceptions, and reconciliation;
- invoice/payment/claim/settlement administrative lifecycle; and
- DPP event updates across lot, inspection, trade, and shipment.

## States and permissions

- Most actions lack loading, failure, conflict, validation, permission-denied, approval-pending, and durable success states.
- Role boundaries are visual only.
- Organisation context, record ownership, transaction relationship, and explicit sharing are absent.
- High-risk and binding actions have no controlled approval record.
- AI/parser output has no confidence, evidence, missing-information, provenance, or escalation state.

# Human Review Required

## Visual review status

All 42 existing user-facing route screens require rendered human review. The highest-priority flows are:

- public Home, Fibres, Services, and Contact;
- Login and role navigation;
- Supplier Dashboard, Listings, creation modal, Shipments, Payments, and Profile;
- Buyer Marketplace, Requests, Quotes, Orders, and Shipments;
- Trader Dashboard, Listing Review, WhatsApp Parser, Quotes, Order Detail, Logistics, and Finance;
- Administrator Analytics, Users, Catalog, Landed Cost, and Platform Settings.

## Questions

1. Is the emerald/gold visual identity approved, accessible, and consistent with intended brand positioning?
2. Are the photographic assets licensed and factually representative?
3. Which public claims and commercial figures are approved?
4. Which dashboard cards and KPIs reflect real operational priorities?
5. Are legacy labels understood by suppliers, buyers, and traders, or should client glossary terms replace them?
6. Do users value the consolidated order-detail pattern as the basis for a transaction overview?
7. How should mobile suppliers navigate without relying on dense tables/sidebar patterns?
8. Which dirty-tree version of each legacy screen is the intended prototype for visual comparison?

# Recommended Target UX Architecture

This is a non-binding high-level navigation recommendation derived from `UX_MAP.md` and the audit. It is not a wireframe, implementation plan, route decision, or new technical architecture decision.

## Public (scope to confirm)

- Home
- Vision / How It Works
- Products / Fibres
- Services
- Contact
- Sign In

## Supplier

- Home
- My Products / Listings
- Add Product
- Offers
- Shipments
- Payments
- Messages
- Company / Documents

## Buyer

- Marketplace
- My Buy Orders
- Matches
- Quotes
- Contracts
- Shipments
- Documents
- DPP Library
- Company

## I Do Grow Trader

- Cockpit
- Relationships: Suppliers / Buyers
- Supply: Listings / Lots / Review
- Demand & Matching: Buy Orders / Match Workspace
- Transactions: Quotes / Trades / Contracts
- Quality: Inspections / Issues
- Logistics: Freight / Shipments / Issues
- Settlement: Invoices / Payment Status / Claims
- Approvals & Recommendations

## Quality Inspector

- Tasks
- Inspection Detail
- Measurements & Evidence
- Grade Decisions
- Certificates

## Administrator

- Users
- Organisations
- Roles & Permissions
- Product Taxonomy & Quality Definitions
- Workflow Rules
- System Configuration
- Platform Activity / Audit Access

## Cross-cutting

- Notifications
- Contextual Documents
- Contextual History/Audit
- Approval State
- Language and organisation context

# Final Migration Assessment

## What can likely be retained conceptually

- Separate Supplier, Buyer, Trader, and Administrator experiences.
- Public natural-fibre narrative, subject to scope/content validation.
- Marketplace, relationship directories, listing review, sourcing, quotes, transaction overview, shipment tracking, payment status, and analytics concepts.
- Bilingual and responsive intent.

## What can likely be retained visually

- Potentially the emerald/gold palette, typography, natural-fibre imagery, card/table patterns, sidebar/cockpit density, status treatments, and charts.
- Every visual-retention item remains `VISUAL_REVIEW_REQUIRED` and subject to brand, rights, accessibility, mobile, and human approval.

## What might be reusable at component level

- Interaction patterns for cards, filters, tables, badges, dialogs, timelines, language switching, loading/error states, and dashboard composition.
- Direct code reuse remains `UNVERIFIED`; DEC-001 selects Next.js rather than the legacy TanStack Start application, and this audit does not decide migration.

## What must be rebuilt technically

- All persistence and backend-integrated workflows.
- Authentication, organisations, memberships, permissions, tenant isolation, and audit.
- The Next.js frontend boundary, NestJS modular monolith, versioned REST API, PostgreSQL model, and object-file handling required by DEC-001/current requirements.
- Supplier onboarding/intake, buy orders, matching, quote versioning, trade/contracts, quality inspections, shipments, settlement records, DPP, notifications, documents, approvals, and controlled AI actions.

## What should disappear entirely

- Demo role switching and fixed demo identities/credentials.
- Toast-only success behavior that implies a business action occurred.
- Provider-specific placeholder settings that imply WhatsApp/OpenAI selection or connectivity.
- Hard-coded model/vendor labels, commercial rates, unverified claims, and mock histories presented as operational truth.
- The local regex parser as an operational AI/messaging implementation; only its assisted-intake concept remains relevant.
