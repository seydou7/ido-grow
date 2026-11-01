-- CreateTable Contract
CREATE TABLE "Contract" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contractNumber" VARCHAR(50) NOT NULL,
    "tradeId" UUID NOT NULL,
    "acceptedQuoteVersionId" UUID NOT NULL,
    "buyerOrganisationId" UUID NOT NULL,
    "supplierOrganisationId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "materialType" VARCHAR(100) NOT NULL,
    "productForm" VARCHAR(100),
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" VARCHAR(50) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "acceptedCommercialAmount" DOUBLE PRECISION NOT NULL,
    "acceptedTolerance" VARCHAR(100),
    "incoterm" VARCHAR(50),
    "qualityConditions" TEXT,
    "inspectionMethod" VARCHAR(100),
    "pickupDate" TIMESTAMPTZ(6),
    "deliveryDate" TIMESTAMPTZ(6),
    "paymentTerms" TEXT,
    "claimsProcess" TEXT,
    "requiredDocuments" TEXT,
    "cancellationConditions" TEXT,
    "governingLaw" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "confirmedAt" TIMESTAMPTZ(6),
    "confirmedByUserId" UUID,
    "storageKey" VARCHAR(255),
    "documentGeneratedAt" TIMESTAMPTZ(6),
    "buyerSignatureStatus" VARCHAR(50) NOT NULL DEFAULT 'UNSIGNED',
    "supplierSignatureStatus" VARCHAR(50) NOT NULL DEFAULT 'UNSIGNED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");
CREATE UNIQUE INDEX "Contract_tradeId_key" ON "Contract"("tradeId");
CREATE UNIQUE INDEX "Contract_storageKey_key" ON "Contract"("storageKey");
CREATE INDEX "Contract_tradeId_idx" ON "Contract"("tradeId");
CREATE INDEX "Contract_buyerOrganisationId_idx" ON "Contract"("buyerOrganisationId");
CREATE INDEX "Contract_supplierOrganisationId_idx" ON "Contract"("supplierOrganisationId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Contract_createdAt_idx" ON "Contract"("createdAt");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_acceptedQuoteVersionId_fkey" FOREIGN KEY ("acceptedQuoteVersionId") REFERENCES "QuoteVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update AuditEvent check constraints additively
ALTER TABLE "AuditEvent" DROP CONSTRAINT IF EXISTS "AuditEvent_event_type_check";
ALTER TABLE "AuditEvent" DROP CONSTRAINT IF EXISTS "AuditEvent_shape_check";

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
        'contract.document.generated'
    )
);

ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_shape_check" CHECK (
    (
        "eventType" = 'authentication.login.failed'
        AND "outcome" = 'failed'
        AND "actorType" = 'unauthenticated'
        AND "actorUserId" IS NULL
        AND "targetType" = 'authentication'
        AND "targetId" IS NULL
        AND "metadata" = '{"failureCategory":"invalid_credentials"}'::jsonb
    )
    OR
    (
        "eventType" IN (
            'authentication.login.succeeded',
            'authentication.logout.succeeded'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'session'
        AND "targetId" IS NOT NULL
        AND "metadata" = '{}'::jsonb
    )
    OR
    (
        "eventType" = 'organisation.profile.updated'
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'organisation'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" IN (
            'organisation.site.created',
            'organisation.site.updated'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'site'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" = 'organisation.compliance_document.uploaded'
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'compliance_document'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" IN (
            'organisation.listing.created',
            'organisation.listing.updated'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'listing'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" IN (
            'buyer.buy_order.created',
            'buyer.buy_order.updated',
            'buyer.buy_order.submitted',
            'buyer.buy_order.cancelled',
            'buyer.buy_order.deleted'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'buy_order'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" IN (
            'buyer.buy_order.match.created',
            'buyer.buy_order.match.approved',
            'buyer.buy_order.match.cancelled'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'match'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" IN (
            'quote.created',
            'quote.version.created',
            'quote.submitted_for_internal_review',
            'quote.returned_to_draft',
            'quote.sent',
            'quote.countered',
            'quote.accepted',
            'quote.rejected',
            'quote.counter.revised'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'quote'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" = 'trade.created'
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'trade'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" IN (
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
            'quality.certificate.issued'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'inspection'
        AND "targetId" IS NOT NULL
    )
    OR
    (
        "eventType" IN (
            'contract.created',
            'contract.updated',
            'contract.confirmed',
            'contract.document.generated'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'contract'
        AND "targetId" IS NOT NULL
    )
);
