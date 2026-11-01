-- AlterTable Quote
ALTER TABLE "Quote" ADD COLUMN "sentAt" TIMESTAMPTZ(6);
ALTER TABLE "Quote" ADD COLUMN "sentByUserId" UUID;
ALTER TABLE "Quote" ADD COLUMN "sentVersionNumber" INTEGER;
ALTER TABLE "Quote" ADD COLUMN "acceptedAt" TIMESTAMPTZ(6);
ALTER TABLE "Quote" ADD COLUMN "acceptedByUserId" UUID;
ALTER TABLE "Quote" ADD COLUMN "acceptedVersionNumber" INTEGER;
ALTER TABLE "Quote" ADD COLUMN "rejectedAt" TIMESTAMPTZ(6);
ALTER TABLE "Quote" ADD COLUMN "rejectedByUserId" UUID;
ALTER TABLE "Quote" ADD COLUMN "rejectionReason" TEXT;

-- CreateTable QuoteCounterOffer
CREATE TABLE "QuoteCounterOffer" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "sourceVersionNumber" INTEGER NOT NULL,
    "buyerOrganisationId" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "proposedProductValue" DOUBLE PRECISION,
    "proposedTotalAmount" DOUBLE PRECISION,
    "proposedIncoterm" VARCHAR(10),
    "proposedPaymentTerms" VARCHAR(100),
    "buyerNote" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteCounterOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteCounterOffer_quoteId_idx" ON "QuoteCounterOffer"("quoteId");
CREATE INDEX "QuoteCounterOffer_buyerOrganisationId_idx" ON "QuoteCounterOffer"("buyerOrganisationId");
CREATE INDEX "QuoteCounterOffer_createdAt_idx" ON "QuoteCounterOffer"("createdAt");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_rejectedByUserId_fkey" FOREIGN KEY ("rejectedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuoteCounterOffer" ADD CONSTRAINT "QuoteCounterOffer_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteCounterOffer" ADD CONSTRAINT "QuoteCounterOffer_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuoteCounterOffer" ADD CONSTRAINT "QuoteCounterOffer_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
