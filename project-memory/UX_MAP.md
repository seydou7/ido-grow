# UX Map

This map records client-required experiences and workflows. It is not a completed design, wireframe set, route map, or implementation specification.

## Shared experience requirements

- Role-based access and organisation-level data isolation.
- Core workflows functional on desktop, tablet, and mobile.
- Supplier workflows designed mobile-first and usable on low-bandwidth connections.
- Buyer and trader experiences may be desktop-first but must remain responsive.
- English, Dutch, and French initially, with original input retained when AI translation is used.
- Configurable notifications/channel preferences; critical notices must not rely on one channel.
- Human approval and auditability for high-risk, binding, or agent-proposed actions.

## Supplier experience — requirement

**Documented main navigation:** Home; My Products; Add Product; Offers; Shipments; Payments; Messages.

**Main workflows:**

1. Register directly, accept a trader invitation, or receive trader-assisted onboarding.
2. Provide company/contact, production-site, document, certification, and preferred-channel information.
3. Create/manage listings through mobile web, web portal, WhatsApp, or a trader; API and batch import are also named listing channels.
4. Use a guided “Add Product” conversation: product, quantity, location, availability, photos, known measurements, expected price, submit for review.
5. Respond to missing-information requests and track listing status.
6. View offers and accept/reject transactions subject to undefined binding/approval rules.
7. Track shipment/payment status and messages.

**WhatsApp alternative interface:** register interest; submit product data, photos, documents, voice content, and location; answer follow-ups; receive offer/shipment updates; accept a non-binding indication; transfer to a trader on low confidence, conflict, dispute, binding price discussion, quality issue, user request, or configured value threshold.

## Buyer experience — requirement

**Documented main navigation:** Marketplace; My Buy Orders; Matches; Quotes; Contracts; Shipments; Documents; DPP Library.

**Main workflows:**

1. Search the marketplace and inspect comparable listings.
2. Filter by product, form, country, distance, quality grade, volume, price, landed cost, certification, availability, and application.
3. Create a buy order, RFQ, recurring supply request, or selected-supplier private request.
4. Review explainable single-source/multi-supplier matches and compare offers.
5. Review, counter, accept, or reject quotes.
6. Track contracts/shipments and access documents/DPP information.

## I Do Grow Trader experience — requirement

**Documented primary surface:** Trader cockpit/dashboard. No complete navigation menu is specified.

**Cockpit content:** new supplier leads; incomplete listings; open buy orders; proposed matches; quotes awaiting approval; expiring offers; delayed shipments; overdue payments; quality issues; agent recommendations; human-approval tasks.

**Quick actions:** call supplier; open WhatsApp; request information; create listing; create quote; approve match; assign inspection; request freight quote.

**Main workflows:** act for suppliers/buyers; manage relationships; approve suppliers/listings; match demand; negotiate; prepare/oversee transactions; review agent proposals; select logistics providers; monitor platform-wide trading.

## Quality Inspector experience — requirement

The client specifies workflow and permissions but no navigation or screen names.

1. View/manage assigned inspection tasks.
2. Use applicable templates and instructions.
3. Enter structured measurements, units, equipment, timestamps, identity, and geolocation where applicable.
4. Upload findings and photo evidence.
5. Record grading, pass/fail, and non-conformities.
6. Approve/reject a quality grade and create an inspection certificate.

Navigation, task-list layout, offline behavior, and laboratory handoff are unresolved.

## Administrator experience — requirement

The client specifies permissions but no navigation, screens, or detailed workflows.

Required capabilities: manage users; manage roles/permissions; configure product taxonomies; configure workflow rules; review platform activity; manage system-wide settings.

The sources require additional controls for administrative-user creation and immutable critical-action audit history. Administrative boundaries, approval flows, and separation from Compliance Manager duties remain unresolved.

## Cross-role transaction journey — requirement

Supplier onboarding → listing/lot creation → review/publication → buyer search or buy order → proposed match → quote/negotiation → inspection and human-approved grade → accepted terms/trade/contract → freight and shipment → delivery → settlement-status recording → DPP/audit update.

## Future experiences, not first-MVP commitments

- Logistics Partner portal beyond transaction-required freight work.
- Compliance Manager experience beyond transaction-required document review.
- Laboratory, finance, insurance, processor transformation, wholesale/retail, and consumer-facing experiences.
- Native iOS/Android apps and consumer marketplace.

## UX ambiguities

- “Mobile website or app” is stated in the PDF, but native apps are excluded from the first MVP.
- No navigation is provided for Quality Inspector or Administrator, and no complete navigation for Trader.
- Buyer negotiation and supplier acceptance are named, but exact permissions/binding confirmation steps are undefined.
- Supplier payment views are required, but MVP settlement is administrative tracking rather than payment execution.
- Accessibility standards, offline requirements, supported devices/browsers, and detailed low-bandwidth behavior are unspecified.
