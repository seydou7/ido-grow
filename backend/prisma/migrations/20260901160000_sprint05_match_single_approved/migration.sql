-- AlterTable
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "buyerOrganisationId" UUID;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "supplierOrganisationId" UUID;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "createdByUserId" UUID;
ALTER TABLE "Match" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMPTZ(6);
ALTER TABLE "Match" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- DropIndex if exists
DROP INDEX IF EXISTS "Match_buyOrderId_listingId_key";

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Match_buyerOrganisationId_fkey') THEN
        ALTER TABLE "Match" ADD CONSTRAINT "Match_buyerOrganisationId_fkey" FOREIGN KEY ("buyerOrganisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Match_supplierOrganisationId_fkey') THEN
        ALTER TABLE "Match" ADD CONSTRAINT "Match_supplierOrganisationId_fkey" FOREIGN KEY ("supplierOrganisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Match_createdByUserId_fkey') THEN
        ALTER TABLE "Match" ADD CONSTRAINT "Match_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
