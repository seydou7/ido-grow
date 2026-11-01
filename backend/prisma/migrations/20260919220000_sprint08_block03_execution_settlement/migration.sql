-- Sprint 08 Block 03: Shipment Execution + Tracking + Documents + Delivery + Disputes + Logistics Reconciliation + Administrative Settlement
-- Additive migration — no historical migration editing

-- 1. Add execution & tracking columns to Shipment
ALTER TABLE "Shipment"
    ADD COLUMN "scheduledPickupAt" TIMESTAMPTZ(6),
    ADD COLUMN "actualPickupAt" TIMESTAMPTZ(6),
    ADD COLUMN "deliveredAt" TIMESTAMPTZ(6),
    ADD COLUMN "deliveredLocation" VARCHAR(255),
    ADD COLUMN "deliveryNotes" TEXT,
    ADD COLUMN "previousStatus" VARCHAR(50),
    ADD COLUMN "delayReason" TEXT,
    ADD COLUMN "delayReportedAt" TIMESTAMPTZ(6),
    ADD COLUMN "revisedExpectedDeliveryDate" TIMESTAMPTZ(6),
    ADD COLUMN "disputeReason" TEXT,
    ADD COLUMN "disputeReportedAt" TIMESTAMPTZ(6),
    ADD COLUMN "disputeResolvedAt" TIMESTAMPTZ(6),
    ADD COLUMN "disputeResolutionNotes" TEXT,
    ADD COLUMN "closedAt" TIMESTAMPTZ(6),
    ADD COLUMN "closedByUserId" UUID;

ALTER TABLE "Shipment"
    ADD CONSTRAINT "Shipment_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. ShipmentTrackingEvent table
CREATE TABLE "ShipmentTrackingEvent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "previousStatus" VARCHAR(50) NOT NULL,
    "resultingStatus" VARCHAR(50) NOT NULL,
    "actorUserId" UUID NOT NULL,
    "actorRole" VARCHAR(50) NOT NULL,
    "location" VARCHAR(255),
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "occurredAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentTrackingEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShipmentTrackingEvent_shipmentId_idx" ON "ShipmentTrackingEvent"("shipmentId");
CREATE INDEX "ShipmentTrackingEvent_actorUserId_idx" ON "ShipmentTrackingEvent"("actorUserId");
CREATE INDEX "ShipmentTrackingEvent_resultingStatus_idx" ON "ShipmentTrackingEvent"("resultingStatus");
CREATE INDEX "ShipmentTrackingEvent_occurredAt_idx" ON "ShipmentTrackingEvent"("occurredAt");

ALTER TABLE "ShipmentTrackingEvent"
    ADD CONSTRAINT "ShipmentTrackingEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShipmentTrackingEvent"
    ADD CONSTRAINT "ShipmentTrackingEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. ShipmentDocument table
CREATE TABLE "ShipmentDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "uploadedByUserId" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "documentReference" VARCHAR(100),
    "storageKey" VARCHAR(255) NOT NULL,
    "originalFilename" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShipmentDocument_storageKey_key" ON "ShipmentDocument"("storageKey");
CREATE INDEX "ShipmentDocument_shipmentId_idx" ON "ShipmentDocument"("shipmentId");
CREATE INDEX "ShipmentDocument_uploadedByUserId_idx" ON "ShipmentDocument"("uploadedByUserId");
CREATE INDEX "ShipmentDocument_uploadedAt_idx" ON "ShipmentDocument"("uploadedAt");

ALTER TABLE "ShipmentDocument"
    ADD CONSTRAINT "ShipmentDocument_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShipmentDocument"
    ADD CONSTRAINT "ShipmentDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. ShipmentDiscrepancy table
CREATE TABLE "ShipmentDiscrepancy" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "reportedByUserId" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "expectedQuantity" DOUBLE PRECISION,
    "deliveredQuantity" DOUBLE PRECISION,
    "quantityUnit" VARCHAR(50),
    "differenceQuantity" DOUBLE PRECISION,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentDiscrepancy_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShipmentDiscrepancy_shipmentId_idx" ON "ShipmentDiscrepancy"("shipmentId");
CREATE INDEX "ShipmentDiscrepancy_reportedByUserId_idx" ON "ShipmentDiscrepancy"("reportedByUserId");
CREATE INDEX "ShipmentDiscrepancy_type_idx" ON "ShipmentDiscrepancy"("type");
CREATE INDEX "ShipmentDiscrepancy_recordedAt_idx" ON "ShipmentDiscrepancy"("recordedAt");

ALTER TABLE "ShipmentDiscrepancy"
    ADD CONSTRAINT "ShipmentDiscrepancy_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShipmentDiscrepancy"
    ADD CONSTRAINT "ShipmentDiscrepancy_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. ShipmentCostReconciliation table
CREATE TABLE "ShipmentCostReconciliation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "selectedFreightQuotationId" UUID NOT NULL,
    "quotedAmount" DOUBLE PRECISION NOT NULL,
    "quotedCurrency" VARCHAR(10) NOT NULL,
    "finalAmount" DOUBLE PRECISION NOT NULL,
    "finalCurrency" VARCHAR(10) NOT NULL,
    "differenceAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "reconciledByUserId" UUID NOT NULL,
    "reconciledAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentCostReconciliation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShipmentCostReconciliation_shipmentId_key" ON "ShipmentCostReconciliation"("shipmentId");
CREATE INDEX "ShipmentCostReconciliation_selectedFreightQuotationId_idx" ON "ShipmentCostReconciliation"("selectedFreightQuotationId");
CREATE INDEX "ShipmentCostReconciliation_reconciledByUserId_idx" ON "ShipmentCostReconciliation"("reconciledByUserId");

ALTER TABLE "ShipmentCostReconciliation"
    ADD CONSTRAINT "ShipmentCostReconciliation_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShipmentCostReconciliation"
    ADD CONSTRAINT "ShipmentCostReconciliation_selectedFreightQuotationId_fkey" FOREIGN KEY ("selectedFreightQuotationId") REFERENCES "FreightQuotation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShipmentCostReconciliation"
    ADD CONSTRAINT "ShipmentCostReconciliation_reconciledByUserId_fkey" FOREIGN KEY ("reconciledByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Settlement table
CREATE TABLE "Settlement" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tradeId" UUID NOT NULL,
    "shipmentId" UUID,
    "buyerOrganisationId" UUID NOT NULL,
    "supplierOrganisationId" UUID NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "totalCommercialAmount" DOUBLE PRECISION NOT NULL,
    "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingBalance" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalSettlementAmount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "paymentDueDate" TIMESTAMPTZ(6),
    "paymentInstructions" TEXT,
    "notes" TEXT,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Settlement_tradeId_key" ON "Settlement"("tradeId");
CREATE INDEX "Settlement_shipmentId_idx" ON "Settlement"("shipmentId");
CREATE INDEX "Settlement_buyerOrganisationId_idx" ON "Settlement"("buyerOrganisationId");
CREATE INDEX "Settlement_supplierOrganisationId_idx" ON "Settlement"("supplierOrganisationId");
CREATE INDEX "Settlement_paymentStatus_idx" ON "Settlement"("paymentStatus");
CREATE INDEX "Settlement_createdAt_idx" ON "Settlement"("createdAt");

ALTER TABLE "Settlement"
    ADD CONSTRAINT "Settlement_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Settlement"
    ADD CONSTRAINT "Settlement_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Settlement"
    ADD CONSTRAINT "Settlement_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Settlement"
    ADD CONSTRAINT "Settlement_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Settlement"
    ADD CONSTRAINT "Settlement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. SettlementDocument table
CREATE TABLE "SettlementDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "settlementId" UUID NOT NULL,
    "uploadedByUserId" UUID NOT NULL,
    "documentType" VARCHAR(50) NOT NULL,
    "documentReference" VARCHAR(100),
    "storageKey" VARCHAR(255) NOT NULL,
    "originalFilename" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettlementDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SettlementDocument_storageKey_key" ON "SettlementDocument"("storageKey");
CREATE INDEX "SettlementDocument_settlementId_idx" ON "SettlementDocument"("settlementId");
CREATE INDEX "SettlementDocument_documentType_idx" ON "SettlementDocument"("documentType");
CREATE INDEX "SettlementDocument_uploadedByUserId_idx" ON "SettlementDocument"("uploadedByUserId");
CREATE INDEX "SettlementDocument_uploadedAt_idx" ON "SettlementDocument"("uploadedAt");

ALTER TABLE "SettlementDocument"
    ADD CONSTRAINT "SettlementDocument_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SettlementDocument"
    ADD CONSTRAINT "SettlementDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8. SettlementClaim table
CREATE TABLE "SettlementClaim" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "settlementId" UUID NOT NULL,
    "discrepancyId" UUID,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" VARCHAR(10),
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolvedByUserId" UUID,
    "recordedByUserId" UUID NOT NULL,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SettlementClaim_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SettlementClaim_settlementId_idx" ON "SettlementClaim"("settlementId");
CREATE INDEX "SettlementClaim_discrepancyId_idx" ON "SettlementClaim"("discrepancyId");
CREATE INDEX "SettlementClaim_status_idx" ON "SettlementClaim"("status");
CREATE INDEX "SettlementClaim_recordedByUserId_idx" ON "SettlementClaim"("recordedByUserId");

ALTER TABLE "SettlementClaim"
    ADD CONSTRAINT "SettlementClaim_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "Settlement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SettlementClaim"
    ADD CONSTRAINT "SettlementClaim_discrepancyId_fkey" FOREIGN KEY ("discrepancyId") REFERENCES "ShipmentDiscrepancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SettlementClaim"
    ADD CONSTRAINT "SettlementClaim_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SettlementClaim"
    ADD CONSTRAINT "SettlementClaim_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. Expand AuditEvent check constraints for Block 03 events
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
        'settlement.claim.resolved'
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
            'settlement_claim'
        )
    )
);
