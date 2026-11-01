-- CreateTable
CREATE TABLE "Match" (
    "id" UUID NOT NULL,
    "buyOrderId" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "createdById" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PROPOSED',
    "compatibilityScore" DOUBLE PRECISION,
    "materialMatched" BOOLEAN NOT NULL DEFAULT false,
    "formMatched" BOOLEAN NOT NULL DEFAULT false,
    "quantityRatio" DOUBLE PRECISION,
    "originMatched" BOOLEAN,
    "priceDeltaPerUnit" DOUBLE PRECISION,
    "basePricePerUnit" DOUBLE PRECISION,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'EUR',
    "estimatedFreight" DOUBLE PRECISION,
    "estimatedHandling" DOUBLE PRECISION,
    "estimatedInsurance" DOUBLE PRECISION,
    "estimatedTariff" DOUBLE PRECISION,
    "platformMargin" DOUBLE PRECISION,
    "estimatedLandedCost" DOUBLE PRECISION,
    "traderNotes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_buyOrderId_idx" ON "Match"("buyOrderId");

-- CreateIndex
CREATE INDEX "Match_listingId_idx" ON "Match"("listingId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_createdAt_idx" ON "Match"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_buyOrderId_listingId_key" ON "Match"("buyOrderId", "listingId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "BuyOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
