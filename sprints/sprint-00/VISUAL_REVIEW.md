# Visual Review Guide

This checklist supports the final human visual review of the 42 audited Fiber Connect routes.

- The source-based findings in `LEGACY_AUDIT.md` and `LEGACY_UX_AUDIT.md` remain unchanged.
- This document adds human visual assessment only; it does not replace or revise the source audit.
- Good visual quality does not imply that legacy code is technically reusable.
- Technical reusability does not imply that a workflow has good UX.
- Do not infer operational behavior from a visible button, status, chart, or success message.
- Review desktop, tablet, and mobile where possible, with special attention to mobile-first Supplier workflows.
- Record evidence in **Human notes** before selecting a final visual recommendation.

Allowed final visual recommendations:

- `KEEP_VISUAL_DIRECTION`
- `IMPROVE`
- `REDESIGN`
- `REMOVE`
- `UNDECIDED`

Every route begins with **Visual review status: PENDING** and **Final visual recommendation: UNDECIDED**.

# Public

## Home

- **Route:** `/`
- **Screen name:** Home
- **Role:** Public visitor
- **Current source-based classification:** IMPROVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check hero focus, section order, scan path, and balance between business story and portal entry.
- **Navigation clarity:** [ ] Confirm primary navigation, language control, portal/demo entry, and current-location cues.
- **Information density:** [ ] Check whether value proposition, role cards, process, and claims can be understood without overload.
- **CTA/action clarity:** [ ] Identify the primary CTA and verify that secondary CTAs do not compete with it.
- **Table/card/form quality:** [ ] Review role cards, service/process cards, imagery, and section consistency.
- **Responsive/mobile concerns:** [ ] Test hero cropping, card stacking, navigation collapse, text length, and CTA reachability.
- **Branding consistency:** [ ] Assess emerald/gold palette, typography, image style, tone, and I Do Grow identity.
- **Accessibility concerns:** [ ] Check heading order, contrast, image alternatives, focus order, link purpose, and reduced motion.
- **Reusable components/patterns:** [ ] Record useful hero, role-card, section-header, CTA, and public-shell patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## About

- **Route:** `/about`
- **Screen name:** About
- **Role:** Public visitor
- **Current source-based classification:** IMPROVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check mission/story/value hierarchy and whether sections create a coherent narrative.
- **Navigation clarity:** [ ] Confirm return paths to products, services, contact, and sign-in.
- **Information density:** [ ] Identify repetitive, promotional, or unsupported content that weakens comprehension.
- **CTA/action clarity:** [ ] Verify the intended next action after reading the page.
- **Table/card/form quality:** [ ] Review value cards, timelines, statistics, or team/story blocks where present.
- **Responsive/mobile concerns:** [ ] Check long-copy readability, image placement, spacing, and section stacking.
- **Branding consistency:** [ ] Compare voice, imagery, colors, and typography with Home and other public pages.
- **Accessibility concerns:** [ ] Check semantic headings, reading order, contrast, decorative imagery, and link labels.
- **Reusable components/patterns:** [ ] Record narrative sections, value cards, image/text splits, and public CTAs worth preserving.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Fibres

- **Route:** `/fibres`
- **Screen name:** Fibres
- **Role:** Public visitor
- **Current source-based classification:** IMPROVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check catalogue introduction, fibre grouping, comparison order, and application visibility.
- **Navigation clarity:** [ ] Confirm users can move between fibres and proceed to sample/quote/contact actions.
- **Information density:** [ ] Assess whether fibre characteristics and applications are comparable and digestible.
- **CTA/action clarity:** [ ] Check sample/quote CTA prominence and whether its outcome is clear.
- **Table/card/form quality:** [ ] Review fibre cards, imagery, metadata, tags, and comparison patterns.
- **Responsive/mobile concerns:** [ ] Check image crops, card height, horizontal comparison, long labels, and touch targets.
- **Branding consistency:** [ ] Assess image coherence and consistency with the natural-fibre brand direction.
- **Accessibility concerns:** [ ] Check image alternatives, color-independent distinctions, heading structure, and focus behavior.
- **Reusable components/patterns:** [ ] Record fibre/product cards, application tags, image treatments, and catalogue sections.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Network

- **Route:** `/network`
- **Screen name:** Network
- **Role:** Public visitor
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check whether network/geography content has a clear evidence-based structure.
- **Navigation clarity:** [ ] Verify links to suppliers, buyers, services, and contact are understandable.
- **Information density:** [ ] Identify unsupported claims, ambiguous locations, or decorative content presented as data.
- **CTA/action clarity:** [ ] Confirm whether the page asks users to join, source, supply, or contact.
- **Table/card/form quality:** [ ] Review maps, country cards, partner blocks, logistics steps, and legends if present.
- **Responsive/mobile concerns:** [ ] Check map/card behavior, labels, overflow, and content order on narrow screens.
- **Branding consistency:** [ ] Compare global/network imagery and tone with the stated initial hemp/geography focus.
- **Accessibility concerns:** [ ] Check map alternatives, text equivalents, contrast, and nonvisual comprehension.
- **Reusable components/patterns:** [ ] Record only reusable map/card/layout patterns; do not validate claims visually.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Services

- **Route:** `/services`
- **Screen name:** Services
- **Role:** Public visitor
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check service grouping and separation of marketplace, operated trading, logistics, quality, and traceability.
- **Navigation clarity:** [ ] Confirm routes to contact, marketplace, and sign-in.
- **Information density:** [ ] Assess pricing/commission cards, claims, feature lists, and comparison complexity.
- **CTA/action clarity:** [ ] Verify which service CTA is primary and whether its commercial meaning is clear.
- **Table/card/form quality:** [ ] Review pricing/service cards and featured-state emphasis.
- **Responsive/mobile concerns:** [ ] Check card comparison, feature-list length, CTA placement, and horizontal overflow.
- **Branding consistency:** [ ] Check consistency with Home while avoiding unsupported premium/financial implications.
- **Accessibility concerns:** [ ] Check featured-card contrast, semantic lists, CTA labels, and reading order.
- **Reusable components/patterns:** [ ] Record service-comparison cards and feature-list patterns after copy validation.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Contact

- **Route:** `/contact`
- **Screen name:** Contact
- **Role:** Public visitor
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check relationship between contact information, trust content, and enquiry form.
- **Navigation clarity:** [ ] Confirm escape/return paths and post-submit expectations.
- **Information density:** [ ] Check whether requested fields are proportionate to an initial enquiry.
- **CTA/action clarity:** [ ] Verify submit label, required fields, privacy expectation, response promise, and confirmation state.
- **Table/card/form quality:** [ ] Review labels, required markers, validation space, textarea, error placement, and success feedback.
- **Responsive/mobile concerns:** [ ] Test input types, keyboard flow, field width, sticky/visible CTA, and error recovery.
- **Branding consistency:** [ ] Assess tone, trust cues, contact details, and form styling.
- **Accessibility concerns:** [ ] Check labels, instructions, errors, focus, autocomplete, contrast, and keyboard submission.
- **Reusable components/patterns:** [ ] Record form-field, validation, contact-card, and confirmation patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

# Supplier

## Supplier Dashboard

- **Route:** `/supplier`
- **Screen name:** Supplier Dashboard
- **Role:** Supplier
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check whether next actions and missing-information tasks appear before secondary KPIs.
- **Navigation clarity:** [ ] Compare visible navigation with required Home, My Products, Add Product, Offers, Shipments, Payments, Messages.
- **Information density:** [ ] Assess whether cards/tables are understandable for low-digital-literacy users.
- **CTA/action clarity:** [ ] Verify Add Product, respond, review offer, and contact/help actions are obvious.
- **Table/card/form quality:** [ ] Review KPI cards, listing/order summaries, status presentation, and empty states.
- **Responsive/mobile concerns:** [ ] Test sidebar behavior, card stacking, thumb reach, table replacement, and low-bandwidth loading.
- **Branding consistency:** [ ] Check supplier-facing warmth, trust, language simplicity, and visual continuity.
- **Accessibility concerns:** [ ] Check plain language, status semantics, focus order, icon labels, and contrast.
- **Reusable components/patterns:** [ ] Record useful task cards, status summaries, help entry, and dashboard shell patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## My Listings

- **Route:** `/supplier/listings`
- **Screen name:** My Listings
- **Role:** Supplier
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check prominence of Add Product, incomplete/review items, and listing status.
- **Navigation clarity:** [ ] Verify relationship between My Products, Add Product, listing detail, and correction flow.
- **Information density:** [ ] Assess table complexity, terminology, columns, filters, and status comprehension.
- **CTA/action clarity:** [ ] Check add, edit, complete, resubmit, view reason, and availability actions—even if absent.
- **Table/card/form quality:** [ ] Compare table versus mobile card suitability; review search/filter controls and creation modal.
- **Responsive/mobile concerns:** [ ] Test overflow, card alternative, filter controls, status visibility, and one-handed creation entry.
- **Branding consistency:** [ ] Check consistent product/status styling with marketplace and trader review.
- **Accessibility concerns:** [ ] Check table headers, responsive reading order, filter labels, status color independence, and modal focus.
- **Reusable components/patterns:** [ ] Record listing table/card, filter bar, status badge, and add-dialog patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Incoming Orders

- **Route:** `/supplier/orders`
- **Screen name:** Incoming Orders
- **Role:** Supplier
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Determine whether the screen visually represents orders, offers, or accepted trades.
- **Navigation clarity:** [ ] Check path from offer notification to decision, contract, shipment, and payment.
- **Information density:** [ ] Review buyer, product, quantity, value, destination, and status prioritization.
- **CTA/action clarity:** [ ] Identify missing accept/reject/review-terms/help actions and binding-state clarity.
- **Table/card/form quality:** [ ] Review search, status filters, row affordance, and detail access.
- **Responsive/mobile concerns:** [ ] Test dense rows, critical term visibility, CTA placement, and confirmation dialogs.
- **Branding consistency:** [ ] Check commercial-state styling across Supplier and Buyer experiences.
- **Accessibility concerns:** [ ] Check binding-action warnings, status announcements, table semantics, and keyboard operation.
- **Reusable components/patterns:** [ ] Record transaction-list and status patterns only after terminology review.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Supplier Shipments

- **Route:** `/supplier/shipments`
- **Screen name:** Shipments
- **Role:** Supplier
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check current shipment, next milestone, delays, and required supplier action prominence.
- **Navigation clarity:** [ ] Verify route to related listing/trade/documents and issue reporting.
- **Information density:** [ ] Assess tracking, route, carrier, ETA, timeline, and exception clarity.
- **CTA/action clarity:** [ ] Identify pickup confirmation, document upload, delay/damage response, and help actions.
- **Table/card/form quality:** [ ] Review timeline, shipment cards, status badges, and empty/error states.
- **Responsive/mobile concerns:** [ ] Test timeline readability, route display, long tracking IDs, and document actions.
- **Branding consistency:** [ ] Compare shipment states across Supplier, Buyer, and Trader screens.
- **Accessibility concerns:** [ ] Check timeline text alternatives, non-color status, focus, and date comprehension.
- **Reusable components/patterns:** [ ] Record shipment card and timeline patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Supplier Payments

- **Route:** `/supplier/payments`
- **Screen name:** Payments
- **Role:** Supplier
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check amount due/paid, due date, status, and related transaction prominence.
- **Navigation clarity:** [ ] Verify links to invoices, trade, claims, and support where applicable.
- **Information density:** [ ] Assess whether payment direction and administrative status are understandable.
- **CTA/action clarity:** [ ] Identify required view-instruction, confirm-detail, dispute, or download actions.
- **Table/card/form quality:** [ ] Review monetary alignment, currency, dates, status badges, and summaries.
- **Responsive/mobile concerns:** [ ] Test amount/status visibility and table-to-card behavior.
- **Branding consistency:** [ ] Check trustworthy financial styling without implying regulated payment execution.
- **Accessibility concerns:** [ ] Check numeric reading, currency labels, status announcements, and table semantics.
- **Reusable components/patterns:** [ ] Record finance summary, amount row, and status patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Supplier Company Profile

- **Route:** `/supplier/profile`
- **Screen name:** My Company
- **Role:** Supplier
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check company, contacts, production sites, verification, documents, and completeness grouping.
- **Navigation clarity:** [ ] Verify relationship to onboarding and document/certification management.
- **Information density:** [ ] Assess long-form profile readability and separation of editable versus verified data.
- **CTA/action clarity:** [ ] Check save, request verification, change bank detail, upload document, and cancel behaviors.
- **Table/card/form quality:** [ ] Review sectioned forms, labels, validation, verified states, and read-only fields.
- **Responsive/mobile concerns:** [ ] Test multi-section forms, progress/drafts, document capture, and long-field handling.
- **Branding consistency:** [ ] Check trust and verification visuals.
- **Accessibility concerns:** [ ] Check grouping, labels, errors, help text, focus, and critical-change warnings.
- **Reusable components/patterns:** [ ] Record profile sections, verification badges, completeness indicators, and document cards.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

# Buyer

## Buyer Dashboard

- **Route:** `/buyer`
- **Screen name:** Buyer Dashboard
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check open buy orders, proposed matches, expiring quotes, shipments, and required actions.
- **Navigation clarity:** [ ] Compare navigation with Marketplace, My Buy Orders, Matches, Quotes, Contracts, Shipments, Documents, DPP Library.
- **Information density:** [ ] Assess KPI usefulness versus task/exception visibility.
- **CTA/action clarity:** [ ] Verify Search Marketplace and Create Buy Order prominence.
- **Table/card/form quality:** [ ] Review KPI cards, recent quote/order lists, empty states, and request modal.
- **Responsive/mobile concerns:** [ ] Test card stacking, table summaries, and action reachability.
- **Branding consistency:** [ ] Check professional buyer tone and consistency with marketplace.
- **Accessibility concerns:** [ ] Check chart/card labels, status semantics, focus order, and contrast.
- **Reusable components/patterns:** [ ] Record dashboard and attention-card patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Marketplace

- **Route:** `/buyer/marketplace`
- **Screen name:** Marketplace
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check search/filter prominence, result count, listing scanability, and path to detail/compare.
- **Navigation clarity:** [ ] Verify transitions to listing detail, comparison, buy order, matches, and RFQ.
- **Information density:** [ ] Assess product, origin, grade, certifications, quantity, price, MOQ, availability, and missing landed cost.
- **CTA/action clarity:** [ ] Check whether quote request is clearly non-binding and distinguishable from purchase.
- **Table/card/form quality:** [ ] Review listing cards, filters, badges, empty results, and comparison affordance.
- **Responsive/mobile concerns:** [ ] Test filters on mobile, card length, persistent search, and touch targets.
- **Branding consistency:** [ ] Check marketplace consistency with public fibre content and supplier listing status.
- **Accessibility concerns:** [ ] Check filter labels, card headings, badge semantics, focus order, and result updates.
- **Reusable components/patterns:** [ ] Record marketplace filter bar and listing-card patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Sourcing Requests

- **Route:** `/buyer/requests`
- **Screen name:** Sourcing Requests
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check list versus create-buy-order emphasis and request-status progression.
- **Navigation clarity:** [ ] Verify terminology and transition to matches/quotes.
- **Information density:** [ ] Assess visibility of product, quality, quantity, delivery, certification, packaging, DPP, transport, and payment requirements.
- **CTA/action clarity:** [ ] Check create, edit, duplicate, close, and view matches actions—even if absent.
- **Table/card/form quality:** [ ] Review request table, filters, creation modal, field grouping, and validation space.
- **Responsive/mobile concerns:** [ ] Test complex form progression and requirement summaries on small screens.
- **Branding consistency:** [ ] Check demand-status styling across Buyer and Trader screens.
- **Accessibility concerns:** [ ] Check form labels, complex requirement grouping, errors, and table semantics.
- **Reusable components/patterns:** [ ] Record requirement-summary and request-list patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Received Quotes

- **Route:** `/buyer/quotes`
- **Screen name:** Received Quotes
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check quote status, total landed cost, validity, versions, and decision deadline prominence.
- **Navigation clarity:** [ ] Verify context from buy order/match and path to contract after acceptance.
- **Information density:** [ ] Assess cost breakdown, quality, delivery, supplier, risk, and comparison readability.
- **CTA/action clarity:** [ ] Check accept, counter, reject, download, and ask-question actions with binding warnings.
- **Table/card/form quality:** [ ] Review quote cards/tables, cost rows, version indicators, and status badges.
- **Responsive/mobile concerns:** [ ] Test wide cost comparisons, sticky decision actions, and confirmation dialogs.
- **Branding consistency:** [ ] Check commercial-document styling and trust cues.
- **Accessibility concerns:** [ ] Check numeric tables, deadline announcements, focus, and confirmation semantics.
- **Reusable components/patterns:** [ ] Record cost-breakdown, quote-summary, and decision-bar patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Buyer Orders

- **Route:** `/buyer/orders`
- **Screen name:** My Orders
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Determine whether list items should represent Trades, Contracts, or Orders.
- **Navigation clarity:** [ ] Check path to contract, shipment, documents, invoice/payment, and DPP.
- **Information density:** [ ] Assess parties, product, amount, route, dates, and state prioritization.
- **CTA/action clarity:** [ ] Identify view details, report issue, confirm delivery, and access documents.
- **Table/card/form quality:** [ ] Review search/filter, row affordance, status, and empty states.
- **Responsive/mobile concerns:** [ ] Test wide rows and critical-state visibility.
- **Branding consistency:** [ ] Check transaction status across Buyer and Trader contexts.
- **Accessibility concerns:** [ ] Check table semantics, dates, amounts, status alternatives, and keyboard access.
- **Reusable components/patterns:** [ ] Record transaction-list patterns after terminology decision.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Buyer Shipment Tracking

- **Route:** `/buyer/shipments`
- **Screen name:** Shipment Tracking
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check active shipment, ETA, delays, customs, delivery, and required action hierarchy.
- **Navigation clarity:** [ ] Verify related contract, documents, claim, and DPP links.
- **Information density:** [ ] Assess carrier, tracking, route, event timeline, exceptions, and quantities.
- **CTA/action clarity:** [ ] Identify confirm delivery, report damage/difference, upload evidence, and support actions.
- **Table/card/form quality:** [ ] Review shipment cards/timeline and exception states.
- **Responsive/mobile concerns:** [ ] Test timeline, route, long identifiers, maps if present, and CTA placement.
- **Branding consistency:** [ ] Compare with Supplier/Trader logistics visuals.
- **Accessibility concerns:** [ ] Check timeline alternatives, event announcements, status contrast, and date clarity.
- **Reusable components/patterns:** [ ] Record shipment timeline and issue-state patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Buyer Invoices

- **Route:** `/buyer/invoices`
- **Screen name:** Invoices
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check invoice/payment status, due date, amount, and related transaction.
- **Navigation clarity:** [ ] Verify links to quote, contract, payment instructions, credit notes, and claims.
- **Information density:** [ ] Assess currency, tax, balance, deposit, and status clarity.
- **CTA/action clarity:** [ ] Identify download, view instructions, raise issue, and confirm payment actions.
- **Table/card/form quality:** [ ] Review financial rows, totals, status badges, and document affordances.
- **Responsive/mobile concerns:** [ ] Test amount/status visibility and table collapse.
- **Branding consistency:** [ ] Ensure administrative tracking does not visually imply internal banking.
- **Accessibility concerns:** [ ] Check numeric/currency labels, table semantics, and status announcements.
- **Reusable components/patterns:** [ ] Record invoice-list and finance-summary patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Buyer Company Profile

- **Route:** `/buyer/profile`
- **Screen name:** My Company
- **Role:** Buyer
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check organisation/contact/sites/preferences/certifications/document grouping.
- **Navigation clarity:** [ ] Verify relationship to onboarding, users, and company documents.
- **Information density:** [ ] Separate editable preferences from verified organisation data.
- **CTA/action clarity:** [ ] Check save/cancel, verification, document, and critical-detail change actions.
- **Table/card/form quality:** [ ] Review form sections, labels, validation, and read-only states.
- **Responsive/mobile concerns:** [ ] Test long forms, saved progress, and field behavior.
- **Branding consistency:** [ ] Check trust/verification styling.
- **Accessibility concerns:** [ ] Check grouping, labels, errors, focus, and critical-action warnings.
- **Reusable components/patterns:** [ ] Record organisation-profile and verification patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

# Trader

## Trader Dashboard

- **Route:** `/trader`
- **Screen name:** Trader Dashboard
- **Role:** I Do Grow Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check urgent approvals/issues before secondary KPIs and activity.
- **Navigation clarity:** [ ] Verify quick access to suppliers, buyers, listings, buy orders, matches, quotes, quality, logistics, settlement, and approvals.
- **Information density:** [ ] Assess whether the cockpit supports rapid prioritization without overload.
- **CTA/action clarity:** [ ] Check call/open WhatsApp/request info/create listing/create quote/approve match/assign inspection/request freight actions.
- **Table/card/form quality:** [ ] Review KPI cards, attention panels, activity feed, task lists, and quick-action modal.
- **Responsive/mobile concerns:** [ ] Validate responsive use, while preserving desktop productivity.
- **Branding consistency:** [ ] Check operational/professional tone and status semantics.
- **Accessibility concerns:** [ ] Check dashboard reading order, chart labels, urgency beyond color, and keyboard shortcuts/focus.
- **Reusable components/patterns:** [ ] Record cockpit, attention-card, activity, KPI, and quick-action patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Suppliers

- **Route:** `/trader/suppliers`
- **Screen name:** Suppliers
- **Role:** Trader
- **Current source-based classification:** IMPROVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check directory summary, verification/completeness, risk, products, and relationship status.
- **Navigation clarity:** [ ] Verify entry to supplier detail, onboarding, listings, documents, and communications.
- **Information density:** [ ] Assess search/filter columns and scanability.
- **CTA/action clarity:** [ ] Check add/invite/contact/request info/view supplier actions.
- **Table/card/form quality:** [ ] Review directory table, filters, statuses, and add modal.
- **Responsive/mobile concerns:** [ ] Test wide table and detail navigation.
- **Branding consistency:** [ ] Check organisation and verification visuals.
- **Accessibility concerns:** [ ] Check table semantics, filters, status alternatives, and dialog focus.
- **Reusable components/patterns:** [ ] Record directory, search/filter, status, and relationship-summary patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Supplier Detail

- **Route:** `/trader/suppliers/$id`
- **Screen name:** Supplier Detail
- **Role:** Trader
- **Current source-based classification:** IMPROVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check identity, verification, completeness, contacts, sites, products, documents, listings, trades, and payments.
- **Navigation clarity:** [ ] Verify cross-links and back/breadcrumb behavior.
- **Information density:** [ ] Assess tabs/sections and avoid mixing unrelated financial/product details.
- **CTA/action clarity:** [ ] Check contact, request info, create listing, suspend/review, and document actions.
- **Table/card/form quality:** [ ] Review summary cards, tables, badges, tabs, and history.
- **Responsive/mobile concerns:** [ ] Test tabs, wide tables, action menu, and long organisation data.
- **Branding consistency:** [ ] Check relationship-management visual language.
- **Accessibility concerns:** [ ] Check heading hierarchy, tab semantics, action permissions, and status meaning.
- **Reusable components/patterns:** [ ] Record organisation-detail shell and contextual tabs.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Buyers

- **Route:** `/trader/buyers`
- **Screen name:** Buyers
- **Role:** Trader
- **Current source-based classification:** IMPROVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check buyer status, demand, active transactions, spend, and relationship priority.
- **Navigation clarity:** [ ] Verify buyer detail, buy orders, quotes, transactions, and contact paths.
- **Information density:** [ ] Assess directory columns and filter usefulness.
- **CTA/action clarity:** [ ] Check add/invite/contact/create buy order/view actions.
- **Table/card/form quality:** [ ] Review table, filters, statuses, and add modal.
- **Responsive/mobile concerns:** [ ] Test table collapse and action access.
- **Branding consistency:** [ ] Compare supplier/buyer directory patterns.
- **Accessibility concerns:** [ ] Check table semantics, filters, status alternatives, and dialog focus.
- **Reusable components/patterns:** [ ] Record shared relationship-directory patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Listing Review

- **Route:** `/trader/inventory`
- **Screen name:** Listing Review
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check missing information, evidence, quality status, supplier risk, and decision context.
- **Navigation clarity:** [ ] Verify return to queue and links to supplier/lot/documents/inspection.
- **Information density:** [ ] Assess whether critical approval evidence is visible without overwhelming the reviewer.
- **CTA/action clarity:** [ ] Check request info, approve, reject, reason, escalate, and assign inspection with consequences.
- **Table/card/form quality:** [ ] Review queue rows, detail expansion, evidence, decision controls, and status badges.
- **Responsive/mobile concerns:** [ ] Test queue/detail/action use on tablet and narrow screens.
- **Branding consistency:** [ ] Check approval-state visuals across trader workflows.
- **Accessibility concerns:** [ ] Check destructive/binding confirmations, non-color states, focus, and error/reason association.
- **Reusable components/patterns:** [ ] Record approval queue, evidence panel, and decision bar patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## WhatsApp Parser

- **Route:** `/trader/whatsapp`
- **Screen name:** WhatsApp Parser
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check original message, extracted fields, missing fields, confidence/evidence, and human correction order.
- **Navigation clarity:** [ ] Verify handoff to supplier, draft listing, conversation, and approval context.
- **Information density:** [ ] Assess side-by-side source/extraction readability.
- **CTA/action clarity:** [ ] Check parse, correct, request info, save draft, escalate, cancel, and approval distinction.
- **Table/card/form quality:** [ ] Review raw-message area, extracted-field form, highlight semantics, and history cards.
- **Responsive/mobile concerns:** [ ] Test split-pane collapse, long messages, form entry, and action persistence.
- **Branding consistency:** [ ] Check preliminary/AI-assisted labeling and confidence language.
- **Accessibility concerns:** [ ] Check field associations, changed/extracted indicators beyond color, focus, and live parsing feedback.
- **Reusable components/patterns:** [ ] Record source-versus-structured review and human-correction patterns; not the regex implementation.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Trader Sourcing Requests

- **Route:** `/trader/sourcing`
- **Screen name:** Sourcing Requests
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check open demand, missing requirements, urgency, match readiness, and buyer context.
- **Navigation clarity:** [ ] Verify transition to buy order detail, matching, and quote preparation.
- **Information density:** [ ] Assess product/quality/quantity/delivery/certification/payment requirement summaries.
- **CTA/action clarity:** [ ] Check request clarification, run matching, assign, close, and create quote actions.
- **Table/card/form quality:** [ ] Review queue table, filters, statuses, and detail affordance.
- **Responsive/mobile concerns:** [ ] Test wide requirement summaries and queue actions.
- **Branding consistency:** [ ] Check demand-state styling across Buyer and Trader.
- **Accessibility concerns:** [ ] Check table, urgency, statuses, filters, and keyboard flow.
- **Reusable components/patterns:** [ ] Record work-queue and requirement-summary patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Trader Quotes

- **Route:** `/trader/quotes`
- **Screen name:** Quotes & Offers
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check draft/review/sent/countered/expiring states, buyer/supplier context, and margins.
- **Navigation clarity:** [ ] Verify origin from match and transition to trade/contract.
- **Information density:** [ ] Assess cost breakdown, versions, validity, quality, delivery, and internal/external visibility.
- **CTA/action clarity:** [ ] Check prepare, review, send, revise, withdraw, duplicate, and approval actions.
- **Table/card/form quality:** [ ] Review quote table, creation form, cost lines, version selector, and status.
- **Responsive/mobile concerns:** [ ] Test cost tables, long forms, sticky totals/actions, and confirmation.
- **Branding consistency:** [ ] Check commercial-document and internal-margin styling.
- **Accessibility concerns:** [ ] Check numeric tables, form errors, visibility boundaries, and binding warnings.
- **Reusable components/patterns:** [ ] Record quote builder, cost breakdown, status, and review patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Trader Orders

- **Route:** `/trader/orders`
- **Screen name:** Orders
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check transaction stage, issues, parties, value, and next action.
- **Navigation clarity:** [ ] Verify entry to unified transaction detail and related contract/shipment/settlement.
- **Information density:** [ ] Assess row columns, filters, status, tracking, and exception visibility.
- **CTA/action clarity:** [ ] Check open, assign, resolve issue, and communicate actions.
- **Table/card/form quality:** [ ] Review table/filter/status and row interaction.
- **Responsive/mobile concerns:** [ ] Test dense table and critical-state visibility.
- **Branding consistency:** [ ] Check transaction state across Trader and Buyer.
- **Accessibility concerns:** [ ] Check table semantics, status alternatives, filter labels, and keyboard row access.
- **Reusable components/patterns:** [ ] Record transaction-list and exception-indicator patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Trader Order Detail

- **Route:** `/trader/orders/$id`
- **Screen name:** Order Detail
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check unified overview hierarchy across terms, quality, contract, shipment, finance, documents, and history.
- **Navigation clarity:** [ ] Verify breadcrumbs and contextual links to every underlying record.
- **Information density:** [ ] Assess section grouping, progressive disclosure, summary versus detail, and issue visibility.
- **CTA/action clarity:** [ ] Check status changes, approvals, issue resolution, document, contact, and next-stage actions.
- **Table/card/form quality:** [ ] Review summary cards, timeline, cost breakdown, document list, history, and action controls.
- **Responsive/mobile concerns:** [ ] Test multi-section navigation, sticky actions, tables, and timeline.
- **Branding consistency:** [ ] Assess suitability as the core transaction-overview visual direction.
- **Accessibility concerns:** [ ] Check headings, landmarks, status changes, timelines, numeric tables, and confirmations.
- **Reusable components/patterns:** [ ] Record transaction shell, contextual summary, timeline, documents, and history patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Trader Logistics

- **Route:** `/trader/logistics`
- **Screen name:** Logistics
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check freight requests, quotations, carrier selection, active shipments, delays, and damage issues.
- **Navigation clarity:** [ ] Verify links to trade, lots, documents, providers, and issue detail.
- **Information density:** [ ] Assess route/volume/dimensions/timing/cost/status information.
- **CTA/action clarity:** [ ] Check request quote, compare, select, schedule, update, reconcile, and escalate actions.
- **Table/card/form quality:** [ ] Review shipment/freight queues, checklists, status, and comparison patterns.
- **Responsive/mobile concerns:** [ ] Test route/cost comparison and issue handling.
- **Branding consistency:** [ ] Compare shipment visuals across roles.
- **Accessibility concerns:** [ ] Check tables, timeline/status alternatives, alerts, and confirmations.
- **Reusable components/patterns:** [ ] Record operations queue and shipment/freight comparison patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Trader Finance

- **Route:** `/trader/finance`
- **Screen name:** Finance
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check receivables, supplier payments, margins, overdue items, claims, and exposure.
- **Navigation clarity:** [ ] Verify links to quote/trade/invoice/settlement/claim.
- **Information density:** [ ] Assess internal versus external values and summary/detail balance.
- **CTA/action clarity:** [ ] Identify review, record status, reconcile, flag, and approval actions.
- **Table/card/form quality:** [ ] Review KPI cards, financial rows, cost/margin columns, and status.
- **Responsive/mobile concerns:** [ ] Test wide financial tables and critical amount/status visibility.
- **Branding consistency:** [ ] Ensure administrative tracking is not styled as banking/payment execution.
- **Accessibility concerns:** [ ] Check numeric/currency labels, tables, alerts, and color-independent statuses.
- **Reusable components/patterns:** [ ] Record financial KPI, settlement-list, and issue patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Trader Settings

- **Route:** `/trader/settings`
- **Screen name:** Settings
- **Role:** Trader
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check personal profile, security, notification, and language grouping.
- **Navigation clarity:** [ ] Verify separation from organisation and administrator settings.
- **Information density:** [ ] Assess form length and clarity of critical versus routine changes.
- **CTA/action clarity:** [ ] Check save/cancel, password/security, sessions, and notification actions.
- **Table/card/form quality:** [ ] Review labels, validation, read-only identity fields, and feedback.
- **Responsive/mobile concerns:** [ ] Test form spacing, keyboards, and action placement.
- **Branding consistency:** [ ] Compare settings patterns across roles.
- **Accessibility concerns:** [ ] Check labels, errors, focus, password requirements, and confirmation.
- **Reusable components/patterns:** [ ] Record settings-section and account-form patterns, not demo behavior.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

# Administrator

## Administrator Analytics

- **Route:** `/admin`
- **Screen name:** Analytics
- **Role:** Administrator
- **Current source-based classification:** IMPROVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check KPI prioritization, operational relevance, trends, and exceptions.
- **Navigation clarity:** [ ] Verify paths to underlying users, organisations, listings, trades, and shipments.
- **Information density:** [ ] Assess chart count, labels, time ranges, and drill-down needs.
- **CTA/action clarity:** [ ] Identify filters, export, drill-down, and issue actions.
- **Table/card/form quality:** [ ] Review KPI cards, charts, legends, empty/error/loading states.
- **Responsive/mobile concerns:** [ ] Test chart scaling, legends, and card stacking.
- **Branding consistency:** [ ] Check chart palette and semantic color consistency.
- **Accessibility concerns:** [ ] Require text/table alternatives, keyboard access, contrast, and non-color encoding.
- **Reusable components/patterns:** [ ] Record KPI/chart/dashboard layout patterns after metrics validation.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Administrator Users

- **Route:** `/admin/users`
- **Screen name:** Users
- **Role:** Administrator
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check separation of users, organisations, memberships, roles, verification, and account status.
- **Navigation clarity:** [ ] Verify links to organisation detail, role assignment, activity, and security actions.
- **Information density:** [ ] Assess directory columns and visibility of sensitive data.
- **CTA/action clarity:** [ ] Check invite, suspend, reset, assign role, revoke, and approval actions.
- **Table/card/form quality:** [ ] Review search/filter, table, add-user dialog, menus, and statuses.
- **Responsive/mobile concerns:** [ ] Test wide directory and action menus.
- **Branding consistency:** [ ] Check administrative/security visual language.
- **Accessibility concerns:** [ ] Check table, menus, destructive confirmations, focus, and status alternatives.
- **Reusable components/patterns:** [ ] Record admin directory and permission-action patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Product Catalog

- **Route:** `/admin/catalog`
- **Screen name:** Product Catalog
- **Role:** Administrator
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check Category → Product Type → Product Form → attributes/units/rules hierarchy.
- **Navigation clarity:** [ ] Verify movement between taxonomy, quality definitions, packaging, applications, and certifications.
- **Information density:** [ ] Assess nested configuration complexity and overview/detail balance.
- **CTA/action clarity:** [ ] Check add/edit/archive/delete, validation, and change-impact warnings.
- **Table/card/form quality:** [ ] Review taxonomy tree/cards, forms, tags, destructive controls, and audit context.
- **Responsive/mobile concerns:** [ ] Test nested structures and editing on smaller screens.
- **Branding consistency:** [ ] Check administrative consistency without losing product clarity.
- **Accessibility concerns:** [ ] Check tree semantics, drag/drop alternatives if any, forms, focus, and destructive confirmations.
- **Reusable components/patterns:** [ ] Record taxonomy navigation and definition-form patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Freight Rates

- **Route:** `/admin/freight`
- **Screen name:** Freight Rates
- **Role:** Administrator
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check source, lane, mode, volume, currency, validity, and confirmed/estimated status.
- **Navigation clarity:** [ ] Verify relationship to logistics providers and landed cost.
- **Information density:** [ ] Assess wide reference-data rows and provenance visibility.
- **CTA/action clarity:** [ ] Check add/edit/expire/import/review actions.
- **Table/card/form quality:** [ ] Review rate table, filters, validity/status, and form.
- **Responsive/mobile concerns:** [ ] Test wide table and data-entry form.
- **Branding consistency:** [ ] Check reference-data status visuals.
- **Accessibility concerns:** [ ] Check table, units, currency, dates, filter labels, and confirmations.
- **Reusable components/patterns:** [ ] Record governed reference-data table/form patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Customs Duties

- **Route:** `/admin/customs`
- **Screen name:** Customs Duties
- **Role:** Administrator
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check source, origin/destination, product, rate, validity, and tax treatment.
- **Navigation clarity:** [ ] Verify relationship to landed cost and compliance review.
- **Information density:** [ ] Assess reference-data scanability and provenance.
- **CTA/action clarity:** [ ] Check add/edit/expire/import/review actions and legal-disclaimer context.
- **Table/card/form quality:** [ ] Review duty table, filters, validity/status, and form.
- **Responsive/mobile concerns:** [ ] Test wide table and data entry.
- **Branding consistency:** [ ] Check governed-data visual language.
- **Accessibility concerns:** [ ] Check table, percentages, dates, labels, and confirmation states.
- **Reusable components/patterns:** [ ] Record reference-data patterns shared with freight.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Landed-Cost Calculator

- **Route:** `/admin/landed-cost`
- **Screen name:** Landed-Cost Calculator
- **Role:** Administrator
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check input versus result separation and complete source-defined cost breakdown.
- **Navigation clarity:** [ ] Verify relationship to match, quote, freight, customs, and source records.
- **Information density:** [ ] Assess many cost lines, currency/source/validity/status, totals, and assumptions.
- **CTA/action clarity:** [ ] Check calculate/recalculate/save estimate/use in match/quote actions and non-binding labeling.
- **Table/card/form quality:** [ ] Review numeric fields, grouped costs, result summary, assumptions, and errors.
- **Responsive/mobile concerns:** [ ] Test long calculation form, sticky total, and breakdown readability.
- **Branding consistency:** [ ] Check financial clarity and estimated/confirmed semantics.
- **Accessibility concerns:** [ ] Check numeric input labels, units, errors, table semantics, and recalculation announcements.
- **Reusable components/patterns:** [ ] Record calculator input/output and cost-breakdown patterns, not mock constants.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Platform Settings

- **Route:** `/admin/platform`
- **Screen name:** Platform Settings
- **Role:** Administrator
- **Current source-based classification:** REMOVE
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Determine whether any generic system-settings structure is useful after removing provider-specific placeholders.
- **Navigation clarity:** [ ] Check separation of workflow configuration, commercial parameters, integrations, and secrets.
- **Information density:** [ ] Assess whether unrelated margins, WhatsApp, and AI settings are improperly combined.
- **CTA/action clarity:** [ ] Check save/test/update controls and whether they falsely imply connection or persistence.
- **Table/card/form quality:** [ ] Review secret fields, connection-state cards, parameter forms, and feedback.
- **Responsive/mobile concerns:** [ ] Test forms and secret handling only if the screen remains in review scope.
- **Branding consistency:** [ ] Check whether vendor labels conflict with TBD decisions.
- **Accessibility concerns:** [ ] Check secret field labeling, status truthfulness, focus, errors, and test feedback.
- **Reusable components/patterns:** [ ] Record only generic settings-card patterns; provider/vendor visuals are not approved.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

# Shared / Authentication

## Login

- **Route:** `/login`
- **Screen name:** Login
- **Role:** Shared / Authentication
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check brand, sign-in form, help, language, and security messaging hierarchy.
- **Navigation clarity:** [ ] Verify return to public site, forgot password, and support paths.
- **Information density:** [ ] Remove demo-role complexity from evaluation of the target sign-in experience.
- **CTA/action clarity:** [ ] Check sign in, recovery, and provider-dependent alternatives without selecting a provider.
- **Table/card/form quality:** [ ] Review labels, validation/error space, password affordance, and role-demo controls.
- **Responsive/mobile concerns:** [ ] Test keyboard, autofill, viewport, error display, and one-handed use.
- **Branding consistency:** [ ] Check trust, professionalism, and consistency with public/portal shells.
- **Accessibility concerns:** [ ] Check autocomplete, labels, error summary, focus, password visibility, and contrast.
- **Reusable components/patterns:** [ ] Record authentication-shell and form patterns; demo role selection must not carry forward.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

## Forgot Password

- **Route:** `/forgot-password`
- **Screen name:** Forgot Password
- **Role:** Shared / Authentication
- **Current source-based classification:** REDESIGN
- **Visual review status:** PENDING
- **Layout/hierarchy:** [ ] Check concise recovery instruction, form, confirmation, and return path.
- **Navigation clarity:** [ ] Verify return to login and access to support.
- **Information density:** [ ] Keep guidance minimal without exposing account existence.
- **CTA/action clarity:** [ ] Check send/retry/back actions and confirmation expectations.
- **Table/card/form quality:** [ ] Review email field, validation/error, confirmation state, and rate-limit feedback space.
- **Responsive/mobile concerns:** [ ] Test keyboard/autofill, narrow layout, and confirmation readability.
- **Branding consistency:** [ ] Compare authentication shell with Login.
- **Accessibility concerns:** [ ] Check labels, focus movement, live confirmation, errors, and link purpose.
- **Reusable components/patterns:** [ ] Record recovery and confirmation-state patterns.
- **Human notes:**
- **Final visual recommendation:** UNDECIDED

# Other

No additional standalone user-facing routes were identified. The authenticated layout and root-level 404/error states are shared infrastructure and are not part of the 42-route count.

## Shared non-route states to review separately

- **404 state:** status PENDING; final visual recommendation UNDECIDED.
- **Application error state:** status PENDING; final visual recommendation UNDECIDED.
- **Loading state:** status PENDING; final visual recommendation UNDECIDED.
- **Toast/notification pattern:** status PENDING; final visual recommendation UNDECIDED.
- **Authenticated portal shell:** status PENDING; final visual recommendation UNDECIDED.
- **Public site shell:** status PENDING; final visual recommendation UNDECIDED.

# Best Visual Patterns to Preserve

Complete after route review. Visual preservation remains independent from code reuse.

| Candidate pattern | Routes observed | Human evidence | Preserve? | Conditions |
|---|---|---|---|---|
| Public hero and image/text sections | `/`, `/about`, `/fibres` |  | UNDECIDED | Brand, rights, responsiveness, accessibility |
| Natural-fibre imagery | Public routes |  | UNDECIDED | Licensing and factual representation |
| Role-specific portal shell | Supplier/Buyer/Trader/Admin |  | UNDECIDED | Target navigation and mobile review |
| KPI/attention cards | Dashboards |  | UNDECIDED | Valid metrics and clear priority |
| Search/filter/table patterns | Directory/list routes |  | UNDECIDED | Mobile and accessibility review |
| Status badges and timelines | Listings/orders/shipments |  | UNDECIDED | Semantic states and non-color alternatives |
| Transaction overview composition | `/trader/orders/$id` |  | UNDECIDED | Correct conceptual entities |

# Patterns to Redesign

| Pattern | Human finding | Severity | Affected routes | Direction to explore |
|---|---|---|---|---|
| Desktop tables for supplier tasks |  | UNDECIDED | Supplier routes | Mobile-first cards/guided tasks |
| Toast-only action feedback |  | UNDECIDED | Multiple portal/public routes | Durable state and honest outcomes |
| Demo role switching/authentication |  | UNDECIDED | `/login`, portal shell | Permissioned identity experience |
| Simplified listing/request/quote forms |  | UNDECIDED | Supplier/Buyer/Trader | Structured progressive workflows |
| Mixed platform/vendor settings |  | UNDECIDED | `/admin/platform` | Separate governed configuration |
| Inconsistent request/order/trade terminology |  | UNDECIDED | Buyer/Supplier/Trader | Client glossary and lifecycle states |

# Branding Findings

- **Overall status:** PENDING
- **Palette:** [ ] Record emerald/gold suitability, contrast, semantic collisions, and dark-mode findings.
- **Typography:** [ ] Record hierarchy, readability, multilingual behavior, and density.
- **Photography:** [ ] Record coherence, cropping, authenticity, rights/provenance questions, and geography/product accuracy.
- **Iconography:** [ ] Record consistency, clarity, labels, and overreliance on icons.
- **Voice and copy:** [ ] Record consistency and unverified commercial/quality/ESG claims.
- **Cross-experience consistency:** [ ] Compare public, Supplier, Buyer, Trader, and Administrator visual language.
- **Human notes:**
- **Summary visual recommendation:** UNDECIDED

# Mobile Findings

- **Overall status:** PENDING
- [ ] Review all six Supplier routes at representative mobile widths.
- [ ] Check sidebar/navigation collapse, orientation, and current-location visibility.
- [ ] Check tables, filter bars, cards, timelines, charts, dialogs, and forms for overflow.
- [ ] Check touch targets, thumb reach, sticky actions, keyboard behavior, and safe areas.
- [ ] Check image weight, perceived performance, low-bandwidth fallback, and loading feedback.
- [ ] Check progressive submission, draft recovery, upload/capture feedback, and handover expectations.
- **Human notes:**
- **Summary visual recommendation:** UNDECIDED

# Accessibility Findings

- **Overall status:** PENDING
- [ ] Keyboard-only navigation and visible focus.
- [ ] Heading hierarchy, landmarks, reading order, skip/navigation behavior.
- [ ] Color contrast and information not conveyed by color alone.
- [ ] Form labels, instructions, required fields, errors, autocomplete, and confirmations.
- [ ] Table headers, captions, responsive alternatives, sorting/filter announcements.
- [ ] Dialog focus trap/return, menus, tabs, tooltips, charts, and timelines.
- [ ] Image alternatives and decorative-image handling.
- [ ] Status, loading, toast, error, and dynamic-result announcements.
- [ ] Text resizing, zoom, motion preferences, and multilingual copy expansion.
- **Human notes:**
- **Summary visual recommendation:** UNDECIDED

# Candidate Design-System Components

These are candidates for human assessment, not approved components or code-migration decisions.

| Candidate | Routes/patterns to inspect | Visual status | Technical reuse | Human notes |
|---|---|---|---|---|
| Public header/footer | Public routes | PENDING | UNDECIDED |  |
| Portal shell/sidebar/header | Portal routes | PENDING | UNDECIDED |  |
| Page header and action area | Portal routes | PENDING | UNDECIDED |  |
| KPI/attention card | Dashboards | PENDING | UNDECIDED |  |
| Listing/product card | Marketplace/listings | PENDING | UNDECIDED |  |
| Search/filter toolbar | List routes | PENDING | UNDECIDED |  |
| Responsive data table/card | Directories and operations | PENDING | UNDECIDED |  |
| Status badge | Listings, quotes, orders, payments | PENDING | UNDECIDED |  |
| Timeline/event history | Shipments and transaction detail | PENDING | UNDECIDED |  |
| Cost breakdown | Quotes, finance, landed cost | PENDING | UNDECIDED |  |
| Form section/field/error summary | Contact, profiles, create flows | PENDING | UNDECIDED |  |
| Modal/drawer/confirmation | Add and decision actions | PENDING | UNDECIDED |  |
| Approval/evidence panel | Listing review and future approvals | PENDING | UNDECIDED |  |
| Empty/loading/error/permission state | Cross-cutting | PENDING | UNDECIDED |  |
| Language switcher | Public and portal | PENDING | UNDECIDED |  |
| Notification/toast and durable notice | Cross-cutting | PENDING | UNDECIDED |  |
