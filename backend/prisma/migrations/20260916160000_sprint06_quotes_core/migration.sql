-- CreateTable
CREATE TABLE "Quote" (
    "id" UUID NOT NULL,
    "quoteNumber" VARCHAR(50) NOT NULL,
    "matchId" UUID NOT NULL,
    "buyOrderId" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "buyerOrganisationId" UUID NOT NULL,
    "supplierOrganisationId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "currency" VARCHAR(10) NOT NULL,
    "currentVersionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteVersion" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "productValue" DOUBLE PRECISION NOT NULL,
    "idoGrowMarginCommission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inspectionCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "packagingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "inlandTransportCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "internationalFreightCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customsCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insuranceCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storageCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherServiceFees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "incoterm" VARCHAR(10),
    "paymentTerms" VARCHAR(100),
    "validUntil" TIMESTAMPTZ(6),
    "commercialNotes" TEXT,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_matchId_key" ON "Quote"("matchId");

-- CreateIndex
CREATE INDEX "Quote_matchId_idx" ON "Quote"("matchId");

-- CreateIndex
CREATE INDEX "Quote_buyOrderId_idx" ON "Quote"("buyOrderId");

-- CreateIndex
CREATE INDEX "Quote_listingId_idx" ON "Quote"("listingId");

-- CreateIndex
CREATE INDEX "Quote_buyerOrganisationId_idx" ON "Quote"("buyerOrganisationId");

-- CreateIndex
CREATE INDEX "Quote_supplierOrganisationId_idx" ON "Quote"("supplierOrganisationId");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- CreateIndex
CREATE INDEX "QuoteVersion_quoteId_idx" ON "QuoteVersion"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteVersion_createdAt_idx" ON "QuoteVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteVersion_quoteId_versionNumber_key" ON "QuoteVersion"("quoteId", "versionNumber");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "BuyOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVersion" ADD CONSTRAINT "QuoteVersion_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteVersion" ADD CONSTRAINT "QuoteVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
