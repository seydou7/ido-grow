-- CreateTable
CREATE TABLE "BuyOrder" (
    "id" UUID NOT NULL,
    "buyerOrganisationId" UUID NOT NULL,
    "createdByUserId" UUID,
    "materialType" VARCHAR(50) NOT NULL,
    "productForm" VARCHAR(50),
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" VARCHAR(30) NOT NULL DEFAULT 'TONNES',
    "deliveryCountry" VARCHAR(100),
    "deliveryDestination" VARCHAR(255),
    "requestedDeliveryDate" TIMESTAMPTZ(6),
    "targetPriceAmount" DOUBLE PRECISION,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'EUR',
    "targetPriceUnit" VARCHAR(30) NOT NULL DEFAULT 'PER_TONNE',
    "acceptableOriginCountries" VARCHAR(255),
    "qualityRequirements" TEXT,
    "packagingRequirements" TEXT,
    "certificationRequirements" TEXT,
    "transportPreferences" TEXT,
    "paymentTerms" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BuyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuyOrder_buyerOrganisationId_idx" ON "BuyOrder"("buyerOrganisationId");

-- CreateIndex
CREATE INDEX "BuyOrder_status_idx" ON "BuyOrder"("status");

-- CreateIndex
CREATE INDEX "BuyOrder_materialType_idx" ON "BuyOrder"("materialType");

-- CreateIndex
CREATE INDEX "BuyOrder_createdAt_idx" ON "BuyOrder"("createdAt");

-- AddForeignKey
ALTER TABLE "BuyOrder" ADD CONSTRAINT "BuyOrder_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyOrder" ADD CONSTRAINT "BuyOrder_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UpdateAuditEventConstraints
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
        'buyer.buy_order.cancelled'
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
            'buyer.buy_order.cancelled'
        )
        AND "outcome" = 'succeeded'
        AND "actorType" = 'user'
        AND "actorUserId" IS NOT NULL
        AND "targetType" = 'buy_order'
        AND "targetId" IS NOT NULL
    )
);
