-- CreateTable
CREATE TABLE "QualityResult" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "tradeId" UUID,
    "decision" VARCHAR(50) NOT NULL,
    "classificationLabel" VARCHAR(255) NOT NULL,
    "decisionNotes" TEXT,
    "decidedByUserId" UUID NOT NULL,
    "decidedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "QualityResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionCertificate" (
    "id" UUID NOT NULL,
    "certificateNumber" VARCHAR(100) NOT NULL,
    "inspectionId" UUID NOT NULL,
    "qualityResultId" UUID NOT NULL,
    "tradeId" UUID,
    "storageKey" VARCHAR(255),
    "snapshotData" JSONB NOT NULL,
    "issuedByUserId" UUID NOT NULL,
    "issuedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QualityResult_inspectionId_key" ON "QualityResult"("inspectionId");

-- CreateIndex
CREATE INDEX "QualityResult_tradeId_idx" ON "QualityResult"("tradeId");

-- CreateIndex
CREATE INDEX "QualityResult_decision_idx" ON "QualityResult"("decision");

-- CreateIndex
CREATE INDEX "QualityResult_decidedByUserId_idx" ON "QualityResult"("decidedByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionCertificate_certificateNumber_key" ON "InspectionCertificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionCertificate_inspectionId_key" ON "InspectionCertificate"("inspectionId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionCertificate_qualityResultId_key" ON "InspectionCertificate"("qualityResultId");

-- CreateIndex
CREATE INDEX "InspectionCertificate_tradeId_idx" ON "InspectionCertificate"("tradeId");

-- CreateIndex
CREATE INDEX "InspectionCertificate_issuedByUserId_idx" ON "InspectionCertificate"("issuedByUserId");

-- AddForeignKey
ALTER TABLE "QualityResult" ADD CONSTRAINT "QualityResult_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityResult" ADD CONSTRAINT "QualityResult_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionCertificate" ADD CONSTRAINT "InspectionCertificate_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionCertificate" ADD CONSTRAINT "InspectionCertificate_qualityResultId_fkey" FOREIGN KEY ("qualityResultId") REFERENCES "QualityResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionCertificate" ADD CONSTRAINT "InspectionCertificate_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
