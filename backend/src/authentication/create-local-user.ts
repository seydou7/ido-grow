import { PrismaClient } from "@prisma/client";

import {
  assertUsableLocalSyntheticUserPassword,
  validateLocalSyntheticUserTarget,
} from "./local-synthetic-user";
import { PasswordHasher } from "./password-hasher";
import { isLocalRuntime } from "./runtime-config";

const SYNTHETIC_SUPPLIER_ORG_ID = "10000000-0000-4000-8000-000000000001";
const SYNTHETIC_SUPPLIER_SITE_ID = "10000000-0000-4000-8000-000000000002";
const SYNTHETIC_SUPPLIER_ORG_NAME = "Synthetic Test Supplier Organisation";
const SYNTHETIC_SUPPLIER_SITE_NAME = "Synthetic Test Production Site";

const SYNTHETIC_BUYER_ORG_ID = "20000000-0000-4000-8000-000000000001";
const SYNTHETIC_BUYER_ORG_NAME = "Synthetic Test Buyer Organisation";
const DEFAULT_BUYER_EMAIL = "buyer@example.test";

const SYNTHETIC_TRADER_ORG_ID = "30000000-0000-4000-8000-000000000001";
const SYNTHETIC_TRADER_ORG_NAME = "Synthetic I Do Grow Trading Desk";
const DEFAULT_TRADER_EMAIL = "trader@example.test";

async function createLocalUser(): Promise<void> {
  if (!isLocalRuntime()) {
    throw new Error("Synthetic user creation is restricted to the local runtime.");
  }

  const configuredSupplierEmail = process.env.IDO_GROW_TEST_USER_EMAIL;
  const configuredBuyerEmail =
    process.env.IDO_GROW_BUYER_TEST_USER_EMAIL || DEFAULT_BUYER_EMAIL;
  const configuredTraderEmail =
    process.env.IDO_GROW_TRADER_TEST_USER_EMAIL || DEFAULT_TRADER_EMAIL;
  const password = process.env.IDO_GROW_TEST_USER_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!configuredSupplierEmail || !password) {
    throw new Error("Local synthetic-user configuration is incomplete.");
  }

  const supplierEmail = validateLocalSyntheticUserTarget(
    databaseUrl,
    configuredSupplierEmail,
  );
  const buyerEmail = validateLocalSyntheticUserTarget(
    databaseUrl,
    configuredBuyerEmail,
  );
  const traderEmail = validateLocalSyntheticUserTarget(
    databaseUrl,
    configuredTraderEmail,
  );
  assertUsableLocalSyntheticUserPassword(password);

  const passwordHasher = new PasswordHasher();
  const passwordHash = await passwordHasher.hash(password);
  const prisma = new PrismaClient();

  try {
    await prisma.$transaction(async (transaction) => {
      // 1. Supplier User & Organisation
      const supplierUser = await transaction.user.upsert({
        where: { email: supplierEmail },
        update: { passwordHash, isActive: true },
        create: { email: supplierEmail, passwordHash },
      });
      const supplierOrg = await transaction.organisation.upsert({
        where: { id: SYNTHETIC_SUPPLIER_ORG_ID },
        update: {
          name: SYNTHETIC_SUPPLIER_ORG_NAME,
          organisationType: "SUPPLIER",
        },
        create: {
          id: SYNTHETIC_SUPPLIER_ORG_ID,
          name: SYNTHETIC_SUPPLIER_ORG_NAME,
          organisationType: "SUPPLIER",
          country: "France",
          verificationStatus: "VERIFIED",
        },
      });
      await transaction.site.upsert({
        where: { id: SYNTHETIC_SUPPLIER_SITE_ID },
        update: {
          organisationId: supplierOrg.id,
          name: SYNTHETIC_SUPPLIER_SITE_NAME,
        },
        create: {
          id: SYNTHETIC_SUPPLIER_SITE_ID,
          organisationId: supplierOrg.id,
          name: SYNTHETIC_SUPPLIER_SITE_NAME,
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
        update: { passwordHash, isActive: true },
        create: { email: buyerEmail, passwordHash },
      });
      const buyerOrg = await transaction.organisation.upsert({
        where: { id: SYNTHETIC_BUYER_ORG_ID },
        update: {
          name: SYNTHETIC_BUYER_ORG_NAME,
          organisationType: "BUYER",
        },
        create: {
          id: SYNTHETIC_BUYER_ORG_ID,
          name: SYNTHETIC_BUYER_ORG_NAME,
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
        update: { passwordHash, isActive: true },
        create: { email: traderEmail, passwordHash },
      });
      const traderOrg = await transaction.organisation.upsert({
        where: { id: SYNTHETIC_TRADER_ORG_ID },
        update: {
          name: SYNTHETIC_TRADER_ORG_NAME,
          organisationType: "TRADER",
        },
        create: {
          id: SYNTHETIC_TRADER_ORG_ID,
          name: SYNTHETIC_TRADER_ORG_NAME,
          organisationType: "TRADER",
          country: "Netherlands",
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
  } finally {
    await prisma.$disconnect();
  }

  process.stdout.write(
    "Synthetic local users (Supplier, Buyer, Trader) and organisation-membership contexts are ready.\n",
  );
}

void createLocalUser().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`Unable to create synthetic local user: ${message}\n`);
  process.exitCode = 1;
});
