-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" VARCHAR(50) DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "InspectionTemplate" (
    "id" UUID NOT NULL,
    "templateKey" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "materialType" VARCHAR(50) NOT NULL,
    "productForm" VARCHAR(50),
    "supportedMethods" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "fields" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" UUID NOT NULL,
    "inspectionReference" VARCHAR(50) NOT NULL,
    "templateId" UUID NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "tradeId" UUID,
    "listingId" UUID,
    "externalLotReference" VARCHAR(100),
    "buyerOrganisationId" UUID,
    "supplierOrganisationId" UUID NOT NULL,
    "assignedInspectorUserId" UUID,
    "inspectionMethod" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMPTZ(6),
    "startedAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "measurementMethod" VARCHAR(100),
    "equipmentUsed" VARCHAR(200),
    "inspectorNotes" TEXT,
    "measurements" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionEvidence" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "evidenceType" VARCHAR(50) NOT NULL,
    "originalFilename" VARCHAR(255) NOT NULL,
    "storageKey" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "caption" VARCHAR(255),
    "uploadedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InspectionTemplate_templateKey_version_key" ON "InspectionTemplate"("templateKey", "version");

-- CreateIndex
CREATE INDEX "InspectionTemplate_materialType_idx" ON "InspectionTemplate"("materialType");

-- CreateIndex
CREATE INDEX "InspectionTemplate_status_idx" ON "InspectionTemplate"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_inspectionReference_key" ON "Inspection"("inspectionReference");

-- CreateIndex
CREATE INDEX "Inspection_templateId_idx" ON "Inspection"("templateId");

-- CreateIndex
CREATE INDEX "Inspection_tradeId_idx" ON "Inspection"("tradeId");

-- CreateIndex
CREATE INDEX "Inspection_listingId_idx" ON "Inspection"("listingId");

-- CreateIndex
CREATE INDEX "Inspection_assignedInspectorUserId_idx" ON "Inspection"("assignedInspectorUserId");

-- CreateIndex
CREATE INDEX "Inspection_supplierOrganisationId_idx" ON "Inspection"("supplierOrganisationId");

-- CreateIndex
CREATE INDEX "Inspection_buyerOrganisationId_idx" ON "Inspection"("buyerOrganisationId");

-- CreateIndex
CREATE INDEX "Inspection_status_idx" ON "Inspection"("status");

-- CreateIndex
CREATE INDEX "Inspection_createdAt_idx" ON "Inspection"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionEvidence_storageKey_key" ON "InspectionEvidence"("storageKey");

-- CreateIndex
CREATE INDEX "InspectionEvidence_inspectionId_idx" ON "InspectionEvidence"("inspectionId");

-- CreateIndex
CREATE INDEX "InspectionEvidence_evidenceType_idx" ON "InspectionEvidence"("evidenceType");

-- CreateIndex
CREATE INDEX "InspectionEvidence_createdAt_idx" ON "InspectionEvidence"("createdAt");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_assignedInspectorUserId_fkey" FOREIGN KEY ("assignedInspectorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionEvidence" ADD CONSTRAINT "InspectionEvidence_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionEvidence" ADD CONSTRAINT "InspectionEvidence_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
