import { PrismaClient } from "@prisma/client";

import {
  assertUsableLocalSyntheticUserPassword,
  validateLocalSyntheticUserTarget,
} from "./local-synthetic-user";
import { PasswordHasher } from "./password-hasher";
import { isLocalRuntime } from "./runtime-config";

const SYNTHETIC_ORGANISATION_ID = "10000000-0000-4000-8000-000000000001";
const SYNTHETIC_SITE_ID = "10000000-0000-4000-8000-000000000002";
const SYNTHETIC_ORGANISATION_NAME = "Synthetic Test Organisation";
const SYNTHETIC_SITE_NAME = "Synthetic Test Site";

async function createLocalUser(): Promise<void> {
  if (!isLocalRuntime()) {
    throw new Error("Synthetic user creation is restricted to the local runtime.");
  }

  const configuredEmail = process.env.IDO_GROW_TEST_USER_EMAIL;
  const password = process.env.IDO_GROW_TEST_USER_PASSWORD;
  const databaseUrl = process.env.DATABASE_URL;

  if (!configuredEmail || !password) {
    throw new Error("Local synthetic-user configuration is incomplete.");
  }

  const email = validateLocalSyntheticUserTarget(databaseUrl, configuredEmail);
  assertUsableLocalSyntheticUserPassword(password);

  const passwordHash = await new PasswordHasher().hash(password);
  const prisma = new PrismaClient();

  try {
    await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.upsert({
        where: { email },
        update: { passwordHash, isActive: true },
        create: { email, passwordHash },
      });
      const organisation = await transaction.organisation.upsert({
        where: { id: SYNTHETIC_ORGANISATION_ID },
        update: { name: SYNTHETIC_ORGANISATION_NAME },
        create: {
          id: SYNTHETIC_ORGANISATION_ID,
          name: SYNTHETIC_ORGANISATION_NAME,
        },
      });

      await transaction.site.upsert({
        where: { id: SYNTHETIC_SITE_ID },
        update: {
          organisationId: organisation.id,
          name: SYNTHETIC_SITE_NAME,
        },
        create: {
          id: SYNTHETIC_SITE_ID,
          organisationId: organisation.id,
          name: SYNTHETIC_SITE_NAME,
        },
      });
      await transaction.membership.upsert({
        where: {
          userId_organisationId: {
            userId: user.id,
            organisationId: organisation.id,
          },
        },
        update: {},
        create: { userId: user.id, organisationId: organisation.id },
      });
    });
  } finally {
    await prisma.$disconnect();
  }

  process.stdout.write(
    "Synthetic local user and organisation-membership context are ready.\n",
  );
}

void createLocalUser().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`Unable to create synthetic local user: ${message}\n`);
  process.exitCode = 1;
});
