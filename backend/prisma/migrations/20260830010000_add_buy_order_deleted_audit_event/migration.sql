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
        'buyer.buy_order.cancelled',
        'buyer.buy_order.deleted'
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
);
