-- CreateTable: AgentRun
CREATE TABLE "AgentRun" (
    "id" UUID NOT NULL,
    "agentKey" VARCHAR(100) NOT NULL,
    "promptVersion" VARCHAR(50) NOT NULL,
    "initiatedByUserId" UUID NOT NULL,
    "initiatedByRole" VARCHAR(50) NOT NULL,
    "organisationContextId" UUID,
    "provider" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'RUNNING',
    "targetResourceType" VARCHAR(100),
    "targetResourceId" VARCHAR(128),
    "summary" TEXT,
    "confidence" DOUBLE PRECISION,
    "structuredOutput" JSONB,
    "failureCategory" VARCHAR(100),
    "failureReason" TEXT,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AgentProposal
CREATE TABLE "AgentProposal" (
    "id" UUID NOT NULL,
    "runId" UUID NOT NULL,
    "proposalType" VARCHAR(100) NOT NULL,
    "toolKey" VARCHAR(100) NOT NULL,
    "structuredPayload" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AgentProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ApprovalRequest
CREATE TABLE "ApprovalRequest" (
    "id" UUID NOT NULL,
    "proposalId" UUID NOT NULL,
    "runId" UUID NOT NULL,
    "requestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiredRole" VARCHAR(50) NOT NULL DEFAULT 'TRADER',
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "decidedByUserId" UUID,
    "decidedAt" TIMESTAMPTZ(6),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ToolExecutionLog
CREATE TABLE "ToolExecutionLog" (
    "id" UUID NOT NULL,
    "runId" UUID NOT NULL,
    "proposalId" UUID,
    "approvalId" UUID,
    "toolKey" VARCHAR(100) NOT NULL,
    "actorRole" VARCHAR(50) NOT NULL,
    "actorUserId" UUID,
    "safeInputSummary" JSONB NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ(6),
    "safeResultReference" JSONB,
    "failureCategory" VARCHAR(100),
    "failureReason" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "AgentRun_agentKey_idx" ON "AgentRun"("agentKey");
CREATE INDEX "AgentRun_status_idx" ON "AgentRun"("status");
CREATE INDEX "AgentRun_initiatedByUserId_idx" ON "AgentRun"("initiatedByUserId");
CREATE INDEX "AgentRun_targetResourceType_targetResourceId_idx" ON "AgentRun"("targetResourceType", "targetResourceId");
CREATE INDEX "AgentRun_createdAt_idx" ON "AgentRun"("createdAt");

CREATE INDEX "AgentProposal_runId_idx" ON "AgentProposal"("runId");
CREATE INDEX "AgentProposal_status_idx" ON "AgentProposal"("status");
CREATE INDEX "AgentProposal_toolKey_idx" ON "AgentProposal"("toolKey");
CREATE INDEX "AgentProposal_createdAt_idx" ON "AgentProposal"("createdAt");

CREATE INDEX "ApprovalRequest_proposalId_idx" ON "ApprovalRequest"("proposalId");
CREATE INDEX "ApprovalRequest_runId_idx" ON "ApprovalRequest"("runId");
CREATE INDEX "ApprovalRequest_status_idx" ON "ApprovalRequest"("status");
CREATE INDEX "ApprovalRequest_requiredRole_idx" ON "ApprovalRequest"("requiredRole");
CREATE INDEX "ApprovalRequest_createdAt_idx" ON "ApprovalRequest"("createdAt");

CREATE INDEX "ToolExecutionLog_runId_idx" ON "ToolExecutionLog"("runId");
CREATE INDEX "ToolExecutionLog_proposalId_idx" ON "ToolExecutionLog"("proposalId");
CREATE INDEX "ToolExecutionLog_toolKey_idx" ON "ToolExecutionLog"("toolKey");
CREATE INDEX "ToolExecutionLog_status_idx" ON "ToolExecutionLog"("status");
CREATE INDEX "ToolExecutionLog_createdAt_idx" ON "ToolExecutionLog"("createdAt");

-- AddForeignKeys
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_initiatedByUserId_fkey" FOREIGN KEY ("initiatedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_organisationContextId_fkey" FOREIGN KEY ("organisationContextId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AgentProposal" ADD CONSTRAINT "AgentProposal_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AgentProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ToolExecutionLog" ADD CONSTRAINT "ToolExecutionLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolExecutionLog" ADD CONSTRAINT "ToolExecutionLog_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "AgentProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update AuditEvent check constraints to include AI Platform Foundation audit events
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
        'dpp.custody.recorded',
        'ai.run.started',
        'ai.run.completed',
        'ai.run.failed',
        'ai.proposal.created',
        'ai.approval.requested',
        'ai.approval.approved',
        'ai.approval.rejected',
        'ai.tool.executed',
        'ai.tool.failed'
    )
);
