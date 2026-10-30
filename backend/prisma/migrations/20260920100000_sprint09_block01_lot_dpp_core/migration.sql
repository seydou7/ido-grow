-- Sprint 09 Block 01: Lot / Batch Traceability + DPP Core + Event Model
-- Additive migration — strictly later than 20260919220000_sprint08_block03_execution_settlement

-- 1. Create TraceableLot table
CREATE TABLE "TraceableLot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lotNumber" VARCHAR(50) NOT NULL,
    "listingId" UUID NOT NULL,
    "supplierOrganisationId" UUID NOT NULL,
    "productionSiteId" UUID,
    "materialType" VARCHAR(50) NOT NULL,
    "productForm" VARCHAR(50),
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" VARCHAR(30) NOT NULL DEFAULT 'TONNES',
    "countryOfOrigin" VARCHAR(100),
    "regionOfOrigin" VARCHAR(100),
    "productionDate" TIMESTAMPTZ(6),
    "batchReference" VARCHAR(100),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID NOT NULL,

    CONSTRAINT "TraceableLot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TraceableLot_lotNumber_key" ON "TraceableLot"("lotNumber");
CREATE INDEX "TraceableLot_listingId_idx" ON "TraceableLot"("listingId");
CREATE INDEX "TraceableLot_supplierOrganisationId_idx" ON "TraceableLot"("supplierOrganisationId");
CREATE INDEX "TraceableLot_productionSiteId_idx" ON "TraceableLot"("productionSiteId");
CREATE INDEX "TraceableLot_materialType_idx" ON "TraceableLot"("materialType");
CREATE INDEX "TraceableLot_createdAt_idx" ON "TraceableLot"("createdAt");

ALTER TABLE "TraceableLot"
    ADD CONSTRAINT "TraceableLot_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TraceableLot"
    ADD CONSTRAINT "TraceableLot_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TraceableLot"
    ADD CONSTRAINT "TraceableLot_productionSiteId_fkey" FOREIGN KEY ("productionSiteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TraceableLot"
    ADD CONSTRAINT "TraceableLot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2. Create DigitalProductPassport table
CREATE TABLE "DigitalProductPassport" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "passportNumber" VARCHAR(50) NOT NULL,
    "lotId" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "currentVersionNumber" INTEGER NOT NULL DEFAULT 1,
    "currentVersionId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID NOT NULL,

    CONSTRAINT "DigitalProductPassport_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DigitalProductPassport_passportNumber_key" ON "DigitalProductPassport"("passportNumber");
CREATE UNIQUE INDEX "DigitalProductPassport_lotId_key" ON "DigitalProductPassport"("lotId");
CREATE INDEX "DigitalProductPassport_status_idx" ON "DigitalProductPassport"("status");
CREATE INDEX "DigitalProductPassport_createdAt_idx" ON "DigitalProductPassport"("createdAt");

ALTER TABLE "DigitalProductPassport"
    ADD CONSTRAINT "DigitalProductPassport_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "TraceableLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DigitalProductPassport"
    ADD CONSTRAINT "DigitalProductPassport_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Create DPPVersion table
CREATE TABLE "DPPVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dppId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "previousVersionId" UUID,
    "changeReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID NOT NULL,

    CONSTRAINT "DPPVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DPPVersion_dppId_versionNumber_key" ON "DPPVersion"("dppId", "versionNumber");
CREATE INDEX "DPPVersion_dppId_idx" ON "DPPVersion"("dppId");
CREATE INDEX "DPPVersion_versionNumber_idx" ON "DPPVersion"("versionNumber");
CREATE INDEX "DPPVersion_createdAt_idx" ON "DPPVersion"("createdAt");

ALTER TABLE "DPPVersion"
    ADD CONSTRAINT "DPPVersion_dppId_fkey" FOREIGN KEY ("dppId") REFERENCES "DigitalProductPassport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DPPVersion"
    ADD CONSTRAINT "DPPVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Create DPPEvent table
CREATE TABLE "DPPEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dppId" UUID NOT NULL,
    "lotId" UUID NOT NULL,
    "eventType" VARCHAR(50) NOT NULL,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(255),
    "responsibleOrganisationId" UUID,
    "responsibleUserId" UUID,
    "sourceType" VARCHAR(50) NOT NULL,
    "sourceId" VARCHAR(100) NOT NULL,
    "verificationStatus" VARCHAR(50) NOT NULL DEFAULT 'RECORDED',
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "DPPEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DPPEvent_dppId_sourceType_sourceId_eventType_key" ON "DPPEvent"("dppId", "sourceType", "sourceId", "eventType");
CREATE INDEX "DPPEvent_dppId_idx" ON "DPPEvent"("dppId");
CREATE INDEX "DPPEvent_lotId_idx" ON "DPPEvent"("lotId");
CREATE INDEX "DPPEvent_eventType_idx" ON "DPPEvent"("eventType");
CREATE INDEX "DPPEvent_occurredAt_idx" ON "DPPEvent"("occurredAt");
CREATE INDEX "DPPEvent_verificationStatus_idx" ON "DPPEvent"("verificationStatus");

ALTER TABLE "DPPEvent"
    ADD CONSTRAINT "DPPEvent_dppId_fkey" FOREIGN KEY ("dppId") REFERENCES "DigitalProductPassport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DPPEvent"
    ADD CONSTRAINT "DPPEvent_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "TraceableLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DPPEvent"
    ADD CONSTRAINT "DPPEvent_responsibleOrganisationId_fkey" FOREIGN KEY ("responsibleOrganisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DPPEvent"
    ADD CONSTRAINT "DPPEvent_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Create DPPCustodyRecord table
CREATE TABLE "DPPCustodyRecord" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dppId" UUID NOT NULL,
    "lotId" UUID NOT NULL,
    "milestone" VARCHAR(50) NOT NULL,
    "fromOrganisationId" UUID,
    "toOrganisationId" UUID,
    "sourceType" VARCHAR(50) NOT NULL,
    "sourceId" VARCHAR(100) NOT NULL,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" VARCHAR(255),
    "notes" TEXT,

    CONSTRAINT "DPPCustodyRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DPPCustodyRecord_dppId_sourceType_sourceId_milestone_key" ON "DPPCustodyRecord"("dppId", "sourceType", "sourceId", "milestone");
CREATE INDEX "DPPCustodyRecord_dppId_idx" ON "DPPCustodyRecord"("dppId");
CREATE INDEX "DPPCustodyRecord_lotId_idx" ON "DPPCustodyRecord"("lotId");
CREATE INDEX "DPPCustodyRecord_milestone_idx" ON "DPPCustodyRecord"("milestone");
CREATE INDEX "DPPCustodyRecord_occurredAt_idx" ON "DPPCustodyRecord"("occurredAt");

ALTER TABLE "DPPCustodyRecord"
    ADD CONSTRAINT "DPPCustodyRecord_dppId_fkey" FOREIGN KEY ("dppId") REFERENCES "DigitalProductPassport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DPPCustodyRecord"
    ADD CONSTRAINT "DPPCustodyRecord_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "TraceableLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DPPCustodyRecord"
    ADD CONSTRAINT "DPPCustodyRecord_fromOrganisationId_fkey" FOREIGN KEY ("fromOrganisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DPPCustodyRecord"
    ADD CONSTRAINT "DPPCustodyRecord_toOrganisationId_fkey" FOREIGN KEY ("toOrganisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Update AuditEvent check constraints to include DPP audit events
ALTER TABLE "AuditEvent" DROP CONSTRAINT IF EXISTS "AuditEvent_event_type_check";
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_event_type_check" CHECK (
    "eventType" IN (
        'authentication.login.succeeded',
        'authentication.login.failed',
        'authentication.logout.succeeded',
        'organisation.profile.updated',
        'organisation.site.created',
        'organisation.site.updated',
        'organisation.compliance_document.uploaded',
        'organisation.listing.created',
        'organisation.listing.updated',
        'buyer.buy_order.created',
        'buyer.buy_order.updated',
        'buyer.buy_order.submitted',
        'buyer.buy_order.cancelled',
        'buyer.buy_order.deleted',
        'buyer.buy_order.match.created',
        'buyer.buy_order.match.approved',
        'buyer.buy_order.match.cancelled',
        'quote.created',
        'quote.version.created',
        'quote.submitted_for_internal_review',
        'quote.returned_to_draft',
        'quote.sent',
        'quote.countered',
        'quote.accepted',
        'quote.rejected',
        'quote.counter.revised',
        'trade.created',
        'quality.inspection.created',
        'quality.inspection.assigned',
        'quality.inspection.started',
        'quality.measurements.updated',
        'quality.inspection.completed',
        'quality.evidence.uploaded',
        'quality.assessment.recorded',
        'quality.non_conformity.created',
        'quality.non_conformity.resolved',
        'quality.physical_inspection.requested',
        'quality.result.approved',
        'quality.result.rejected',
        'quality.certificate.issued',
        'contract.created',
        'contract.updated',
        'contract.confirmed',
        'contract.document.generated',
        'logistics.shipment.created',
        'logistics.shipment.requirements.updated',
        'logistics.freight_request.created',
        'logistics.freight_quote.submitted',
        'logistics.carrier.selected',
        'logistics.carrier.reselected',
        'logistics.pickup.scheduled',
        'logistics.shipment.picked_up',
        'logistics.shipment.in_transit',
        'logistics.shipment.customs',
        'logistics.shipment.delayed',
        'logistics.shipping_document.uploaded',
        'logistics.delivery.confirmed',
        'logistics.discrepancy.recorded',
        'logistics.shipment.disputed',
        'logistics.costs.reconciled',
        'logistics.shipment.closed',
        'settlement.created',
        'settlement.updated',
        'settlement.document.uploaded',
        'settlement.claim.created',
        'settlement.claim.resolved',
        'dpp.lot.created',
        'dpp.passport.created',
        'dpp.passport.synchronized',
        'dpp.version.created',
        'dpp.custody.recorded'
    )
);

ALTER TABLE "AuditEvent" DROP CONSTRAINT IF EXISTS "AuditEvent_shape_check";
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_shape_check" CHECK (
    (
        "actorType" IN ('user', 'system', 'unauthenticated')
    )
    AND (
        "outcome" IN ('succeeded', 'failed')
    )
    AND (
        "targetType" IN (
            'session', 'authentication', 'organisation', 'site',
            'compliance_document', 'listing', 'buy_order', 'match',
            'quote', 'trade', 'inspection', 'contract',
            'shipment', 'logistics_request', 'freight_quotation',
            'tracking_event', 'shipment_document', 'discrepancy',
            'cost_reconciliation', 'settlement', 'settlement_document',
            'settlement_claim', 'traceable_lot', 'dpp', 'dpp_version',
            'dpp_event', 'dpp_custody_record'
        )
    )
);
