-- AlterTable InspectionTemplate
ALTER TABLE "InspectionTemplate" ADD COLUMN "photoInstructions" TEXT;

-- AlterTable Inspection
ALTER TABLE "Inspection" ADD COLUMN "assessmentStatus" VARCHAR(50) NOT NULL DEFAULT 'NOT_ASSESSED';
ALTER TABLE "Inspection" ADD COLUMN "assessmentSummary" TEXT;
ALTER TABLE "Inspection" ADD COLUMN "observedIssues" TEXT;
ALTER TABLE "Inspection" ADD COLUMN "recommendedFollowUp" TEXT;
ALTER TABLE "Inspection" ADD COLUMN "assessedAt" TIMESTAMPTZ(6);
ALTER TABLE "Inspection" ADD COLUMN "assessedByUserId" UUID;
ALTER TABLE "Inspection" ADD COLUMN "physicalInspectionRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Inspection" ADD COLUMN "physicalInspectionReason" TEXT;

-- AlterTable InspectionEvidence
ALTER TABLE "InspectionEvidence" ADD COLUMN "capturedAt" TIMESTAMPTZ(6);

-- CreateTable NonConformity
CREATE TABLE "NonConformity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inspectionId" UUID NOT NULL,
    "reportedByUserId" UUID NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolvedByUserId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NonConformity_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "NonConformity_inspectionId_idx" ON "NonConformity"("inspectionId");
CREATE INDEX "NonConformity_status_idx" ON "NonConformity"("status");
CREATE INDEX "NonConformity_createdAt_idx" ON "NonConformity"("createdAt");

-- AddForeignKeys
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_assessedByUserId_fkey" FOREIGN KEY ("assessedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NonConformity" ADD CONSTRAINT "NonConformity_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NonConformity" ADD CONSTRAINT "NonConformity_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "NonConformity" ADD CONSTRAINT "NonConformity_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
