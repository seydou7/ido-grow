-- CreateTable
CREATE TABLE "ComplianceDocument" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organisationId" UUID NOT NULL,
    "documentType" VARCHAR(50) NOT NULL,
    "originalFilename" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ComplianceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceDocument_storageKey_key" ON "ComplianceDocument"("storageKey");

-- CreateIndex
CREATE INDEX "ComplianceDocument_organisationId_idx" ON "ComplianceDocument"("organisationId");

-- CreateIndex
CREATE INDEX "ComplianceDocument_documentType_idx" ON "ComplianceDocument"("documentType");

-- CreateIndex
CREATE INDEX "ComplianceDocument_status_idx" ON "ComplianceDocument"("status");

-- AddForeignKey
ALTER TABLE "ComplianceDocument" ADD CONSTRAINT "ComplianceDocument_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
        'organisation.compliance_document.uploaded'
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
);


