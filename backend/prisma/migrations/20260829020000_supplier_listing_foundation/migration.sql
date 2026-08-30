-- CreateTable
CREATE TABLE "Listing" (
    "id" UUID NOT NULL,
    "organisationId" UUID NOT NULL,
    "siteId" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "materialType" VARCHAR(50) NOT NULL,
    "productForm" VARCHAR(50),
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" VARCHAR(30) NOT NULL DEFAULT 'TONNES',
    "priceAmount" DOUBLE PRECISION,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'EUR',
    "priceUnit" VARCHAR(30) NOT NULL DEFAULT 'PER_TONNE',
    "originCountry" VARCHAR(100),
    "harvestYear" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_organisationId_idx" ON "Listing"("organisationId");

-- CreateIndex
CREATE INDEX "Listing_materialType_idx" ON "Listing"("materialType");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
        'organisation.listing.updated'
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
);
