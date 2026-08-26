import { PrismaClient } from "@prisma/client";

import {
  assertUsableLocalSyntheticUserPassword,
  validateLocalSyntheticUserTarget,
} from "./local-synthetic-user";
import { PasswordHasher } from "./password-hasher";
import { isLocalRuntime } from "./runtime-config";

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
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, isActive: true },
      create: { email, passwordHash },
    });
  } finally {
    await prisma.$disconnect();
  }

  process.stdout.write("Synthetic local authentication user is ready.\n");
}

void createLocalUser().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`Unable to create synthetic local user: ${message}\n`);
  process.exitCode = 1;
});
