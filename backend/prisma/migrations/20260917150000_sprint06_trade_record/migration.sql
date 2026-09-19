-- CreateTable
CREATE TABLE "Trade" (
    "id" UUID NOT NULL,
    "tradeNumber" VARCHAR(50) NOT NULL,
    "quoteId" UUID NOT NULL,
    "acceptedQuoteVersionNumber" INTEGER NOT NULL,
    "matchId" UUID NOT NULL,
    "buyOrderId" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "buyerOrganisationId" UUID NOT NULL,
    "supplierOrganisationId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "materialType" VARCHAR(100) NOT NULL,
    "productForm" VARCHAR(100),
    "quantity" DOUBLE PRECISION NOT NULL,
    "quantityUnit" VARCHAR(50) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "acceptedTotalAmount" DOUBLE PRECISION NOT NULL,
    "incoterm" VARCHAR(10),
    "paymentTerms" VARCHAR(100),
    "acceptedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trade_tradeNumber_key" ON "Trade"("tradeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_quoteId_key" ON "Trade"("quoteId");

-- CreateIndex
CREATE INDEX "Trade_quoteId_idx" ON "Trade"("quoteId");

-- CreateIndex
CREATE INDEX "Trade_matchId_idx" ON "Trade"("matchId");

-- CreateIndex
CREATE INDEX "Trade_buyOrderId_idx" ON "Trade"("buyOrderId");

-- CreateIndex
CREATE INDEX "Trade_listingId_idx" ON "Trade"("listingId");

-- CreateIndex
CREATE INDEX "Trade_buyerOrganisationId_idx" ON "Trade"("buyerOrganisationId");

-- CreateIndex
CREATE INDEX "Trade_supplierOrganisationId_idx" ON "Trade"("supplierOrganisationId");

-- CreateIndex
CREATE INDEX "Trade_createdAt_idx" ON "Trade"("createdAt");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "BuyOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
