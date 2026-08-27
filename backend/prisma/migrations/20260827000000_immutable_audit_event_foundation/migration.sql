-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "outcome" VARCHAR(32) NOT NULL,
    "actorType" VARCHAR(32) NOT NULL,
    "actorUserId" UUID,
    "targetType" VARCHAR(100) NOT NULL,
    "targetId" VARCHAR(128),
    "correlationId" UUID NOT NULL,
    "occurredAt" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuditEvent_event_type_check" CHECK (
        "eventType" IN (
            'authentication.login.succeeded',
            'authentication.login.failed',
            'authentication.logout.succeeded'
        )
    ),
    CONSTRAINT "AuditEvent_shape_check" CHECK (
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
    )
);

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_occurredAt_idx" ON "AuditEvent"("actorUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_occurredAt_idx" ON "AuditEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditEvent_correlationId_idx" ON "AuditEvent"("correlationId");

-- CreateIndex
CREATE INDEX "AuditEvent_targetType_targetId_idx" ON "AuditEvent"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "AuditEvent"
ADD CONSTRAINT "AuditEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
