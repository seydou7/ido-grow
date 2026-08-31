import { PrismaClient } from "@prisma/client";

import { PasswordHasher } from "./password-hasher";
import { isDemoRuntime, isLocalRuntime } from "./runtime-config";

const DEMO_SUPPLIER_ORG_ID = "10000000-0000-4000-8000-000000000001";
const DEMO_SUPPLIER_SITE_ID = "10000000-0000-4000-8000-000000000002";
const DEMO_SUPPLIER_ORG_NAME = "Demo Supplier Organisation";
const DEMO_SUPPLIER_SITE_NAME = "Demo Production Site";

const DEMO_BUYER_ORG_ID = "20000000-0000-4000-8000-000000000001";
const DEMO_BUYER_ORG_NAME = "Demo Buyer Organisation";

const DEMO_TRADER_ORG_ID = "30000000-0000-4000-8000-000000000001";
const DEMO_TRADER_ORG_NAME = "I Do Grow Trading Desk";

export async function createDemoUsers(): Promise<void> {
  if (!isDemoRuntime() && !isLocalRuntime()) {
    throw new Error("Demo user provisioning is restricted to demo or local runtimes.");
  }

  const supplierEmail =
    process.env.IDO_GROW_DEMO_SUPPLIER_EMAIL || "supplier@demo.idogrow.com";
  const buyerEmail =
    process.env.IDO_GROW_DEMO_BUYER_EMAIL || "buyer@demo.idogrow.com";
  const traderEmail =
    process.env.IDO_GROW_DEMO_TRADER_EMAIL || "trader@demo.idogrow.com";

  const supplierPassword =
    process.env.IDO_GROW_DEMO_SUPPLIER_PASSWORD ||
    process.env.IDO_GROW_DEMO_PASSWORD;
  const buyerPassword =
    process.env.IDO_GROW_DEMO_BUYER_PASSWORD ||
    process.env.IDO_GROW_DEMO_PASSWORD;
  const traderPassword =
    process.env.IDO_GROW_DEMO_TRADER_PASSWORD ||
    process.env.IDO_GROW_DEMO_PASSWORD;

  if (!supplierPassword || !buyerPassword || !traderPassword) {
    throw new Error(
      "Demo user passwords must be provided via environment variables (IDO_GROW_DEMO_SUPPLIER_PASSWORD, IDO_GROW_DEMO_BUYER_PASSWORD, IDO_GROW_DEMO_TRADER_PASSWORD or IDO_GROW_DEMO_PASSWORD).",
    );
  }

  const passwordHasher = new PasswordHasher();
  const supplierHash = await passwordHasher.hash(supplierPassword);
  const buyerHash = await passwordHasher.hash(buyerPassword);
  const traderHash = await passwordHasher.hash(traderPassword);

  const prisma = new PrismaClient();

  try {
    await prisma.$transaction(async (transaction) => {
      // 1. Supplier User & Organisation
      const supplierUser = await transaction.user.upsert({
        where: { email: supplierEmail },
        update: { passwordHash: supplierHash, isActive: true },
        create: { email: supplierEmail, passwordHash: supplierHash },
      });

      const supplierOrg = await transaction.organisation.upsert({
        where: { id: DEMO_SUPPLIER_ORG_ID },
        update: {
          name: DEMO_SUPPLIER_ORG_NAME,
          organisationType: "SUPPLIER",
        },
        create: {
          id: DEMO_SUPPLIER_ORG_ID,
          name: DEMO_SUPPLIER_ORG_NAME,
          organisationType: "SUPPLIER",
          country: "France",
          verificationStatus: "VERIFIED",
        },
      });

      await transaction.site.upsert({
        where: { id: DEMO_SUPPLIER_SITE_ID },
        update: {
          organisationId: supplierOrg.id,
          name: DEMO_SUPPLIER_SITE_NAME,
        },
        create: {
          id: DEMO_SUPPLIER_SITE_ID,
          organisationId: supplierOrg.id,
          name: DEMO_SUPPLIER_SITE_NAME,
          country: "France",
          facilityType: "PROCESSING_PLANT",
        },
      });

      await transaction.membership.upsert({
        where: {
          userId_organisationId: {
            userId: supplierUser.id,
            organisationId: supplierOrg.id,
          },
        },
        update: {},
        create: { userId: supplierUser.id, organisationId: supplierOrg.id },
      });

      // 2. Buyer User & Organisation
      const buyerUser = await transaction.user.upsert({
        where: { email: buyerEmail },
        update: { passwordHash: buyerHash, isActive: true },
        create: { email: buyerEmail, passwordHash: buyerHash },
      });

      const buyerOrg = await transaction.organisation.upsert({
        where: { id: DEMO_BUYER_ORG_ID },
        update: {
          name: DEMO_BUYER_ORG_NAME,
          organisationType: "BUYER",
        },
        create: {
          id: DEMO_BUYER_ORG_ID,
          name: DEMO_BUYER_ORG_NAME,
          organisationType: "BUYER",
          country: "Netherlands",
          verificationStatus: "VERIFIED",
        },
      });

      await transaction.membership.upsert({
        where: {
          userId_organisationId: {
            userId: buyerUser.id,
            organisationId: buyerOrg.id,
          },
        },
        update: {},
        create: { userId: buyerUser.id, organisationId: buyerOrg.id },
      });

      // 3. Trader User & Organisation
      const traderUser = await transaction.user.upsert({
        where: { email: traderEmail },
        update: { passwordHash: traderHash, isActive: true },
        create: { email: traderEmail, passwordHash: traderHash },
      });

      const traderOrg = await transaction.organisation.upsert({
        where: { id: DEMO_TRADER_ORG_ID },
        update: {
          name: DEMO_TRADER_ORG_NAME,
          organisationType: "TRADER",
        },
        create: {
          id: DEMO_TRADER_ORG_ID,
          name: DEMO_TRADER_ORG_NAME,
          organisationType: "TRADER",
          country: "France",
          verificationStatus: "VERIFIED",
        },
      });

      await transaction.membership.upsert({
        where: {
          userId_organisationId: {
            userId: traderUser.id,
            organisationId: traderOrg.id,
          },
        },
        update: {},
        create: { userId: traderUser.id, organisationId: traderOrg.id },
      });
    });

    console.log("Demo user provisioning completed successfully.");
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createDemoUsers().catch((error) => {
    console.error("Demo user provisioning failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
