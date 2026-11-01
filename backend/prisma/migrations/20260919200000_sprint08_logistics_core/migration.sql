-- Sprint 08 Block 02: Logistics Core
-- Additive migration — no historical migration editing

-- Shipment table
CREATE TABLE "Shipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentNumber" VARCHAR(50) NOT NULL,
    "contractId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "buyerOrganisationId" UUID NOT NULL,
    "supplierOrganisationId" UUID NOT NULL,
    "origin" VARCHAR(255),
    "destination" VARCHAR(255),
    "shipmentQuantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" VARCHAR(50) NOT NULL,
    "requestedPickupDate" TIMESTAMPTZ(6),
    "requestedDeliveryDate" TIMESTAMPTZ(6),
    "transportRequirements" TEXT,
    "packagingRequirements" TEXT,
    "specialHandlingRequirements" TEXT,
    "notes" TEXT,
    "selectedFreightQuotationId" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Shipment_shipmentNumber_key" ON "Shipment"("shipmentNumber");
CREATE INDEX "Shipment_contractId_idx" ON "Shipment"("contractId");
CREATE INDEX "Shipment_buyerOrganisationId_idx" ON "Shipment"("buyerOrganisationId");
CREATE INDEX "Shipment_supplierOrganisationId_idx" ON "Shipment"("supplierOrganisationId");
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");
CREATE INDEX "Shipment_createdAt_idx" ON "Shipment"("createdAt");

ALTER TABLE "Shipment"
    ADD CONSTRAINT "Shipment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Shipment"
    ADD CONSTRAINT "Shipment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Shipment"
    ADD CONSTRAINT "Shipment_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Shipment"
    ADD CONSTRAINT "Shipment_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- LogisticsRequest table
CREATE TABLE "LogisticsRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shipmentId" UUID NOT NULL,
    "targetProviderUserId" UUID NOT NULL,
    "requesterUserId" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LogisticsRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LogisticsRequest_shipmentId_targetProviderUserId_unique"
    ON "LogisticsRequest"("shipmentId", "targetProviderUserId")
    WHERE "status" != 'CANCELLED';
CREATE INDEX "LogisticsRequest_shipmentId_idx" ON "LogisticsRequest"("shipmentId");
CREATE INDEX "LogisticsRequest_targetProviderUserId_idx" ON "LogisticsRequest"("targetProviderUserId");
CREATE INDEX "LogisticsRequest_status_idx" ON "LogisticsRequest"("status");
CREATE INDEX "LogisticsRequest_createdAt_idx" ON "LogisticsRequest"("createdAt");

ALTER TABLE "LogisticsRequest"
    ADD CONSTRAINT "LogisticsRequest_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LogisticsRequest"
    ADD CONSTRAINT "LogisticsRequest_targetProviderUserId_fkey" FOREIGN KEY ("targetProviderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LogisticsRequest"
    ADD CONSTRAINT "LogisticsRequest_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FreightQuotation table
CREATE TABLE "FreightQuotation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "logisticsRequestId" UUID NOT NULL,
    "shipmentId" UUID NOT NULL,
    "providerUserId" UUID NOT NULL,
    "submittedByUserId" UUID NOT NULL,
    "submittedByRole" VARCHAR(50) NOT NULL,
    "enteredOnBehalfOfProvider" BOOLEAN NOT NULL DEFAULT false,
    "currency" VARCHAR(10) NOT NULL,
    "freightAmount" DOUBLE PRECISION NOT NULL,
    "validUntil" TIMESTAMPTZ(6),
    "proposedPickupDate" TIMESTAMPTZ(6),
    "estimatedDeliveryDate" TIMESTAMPTZ(6),
    "notes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "submittedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FreightQuotation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FreightQuotation_logisticsRequestId_idx" ON "FreightQuotation"("logisticsRequestId");
CREATE INDEX "FreightQuotation_shipmentId_idx" ON "FreightQuotation"("shipmentId");
CREATE INDEX "FreightQuotation_providerUserId_idx" ON "FreightQuotation"("providerUserId");
CREATE INDEX "FreightQuotation_status_idx" ON "FreightQuotation"("status");
CREATE INDEX "FreightQuotation_createdAt_idx" ON "FreightQuotation"("createdAt");

ALTER TABLE "FreightQuotation"
    ADD CONSTRAINT "FreightQuotation_logisticsRequestId_fkey" FOREIGN KEY ("logisticsRequestId") REFERENCES "LogisticsRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FreightQuotation"
    ADD CONSTRAINT "FreightQuotation_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FreightQuotation"
    ADD CONSTRAINT "FreightQuotation_providerUserId_fkey" FOREIGN KEY ("providerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FreightQuotation"
    ADD CONSTRAINT "FreightQuotation_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Shipment selected freight quotation FK (self-referencing after FreightQuotation table exists)
ALTER TABLE "Shipment"
    ADD CONSTRAINT "Shipment_selectedFreightQuotationId_fkey" FOREIGN KEY ("selectedFreightQuotationId") REFERENCES "FreightQuotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Expand AuditEvent check constraints for logistics events
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
        'logistics.carrier.reselected'
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
            'shipment', 'logistics_request', 'freight_quotation'
        )
    )
);
