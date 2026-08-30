import type {
  AuditEventCreateData,
  AuditEventDatabaseClient,
} from "./audit-event.writer";
import type { AuthenticationAuditEvent } from "./contracts";
import { PrismaAuditEventWriter } from "./prisma-audit-event.writer";

class RecordingAuditDatabase implements AuditEventDatabaseClient {
  records: AuditEventCreateData[] = [];
  failure: Error | null = null;

  readonly auditEvent = {
    create: async ({ data }: { data: AuditEventCreateData }) => {
      if (this.failure) throw this.failure;
      this.records.push(data);
      return data;
    },
  };
}

describe("PrismaAuditEventWriter", () => {
  const correlationId = "20000000-0000-4000-8000-000000000001";
  const userId = "20000000-0000-4000-8000-000000000002";
  const sessionId = "20000000-0000-4000-8000-000000000003";
  const occurredAt = new Date("2026-08-27T10:00:00.000Z");
  let database: RecordingAuditDatabase;
  let writer: PrismaAuditEventWriter;

  beforeEach(() => {
    database = new RecordingAuditDatabase();
    writer = new PrismaAuditEventWriter(database as never);
  });

  it("persists only allowlisted safe metadata for an invalid login", async () => {
    const event = {
      eventType: "authentication.login.failed",
      outcome: "failed",
      actor: { type: "unauthenticated" },
      target: { type: "authentication", id: null },
      correlationId,
      occurredAt,
      metadata: {
        failureCategory: "invalid_credentials",
        submittedEmail: "must-not-persist@example.test",
        password: "must-not-persist",
      },
    } as unknown as AuthenticationAuditEvent;

    await writer.append(event, database);

    expect(database.records).toEqual([
      {
        eventType: "authentication.login.failed",
        outcome: "failed",
        actorType: "unauthenticated",
        actorUserId: null,
        targetType: "authentication",
        targetId: null,
        correlationId,
        occurredAt,
        metadata: { failureCategory: "invalid_credentials" },
      },
    ]);
    expect(JSON.stringify(database.records)).not.toMatch(
      /must-not-persist|submittedEmail|password/i,
    );
  });

  it("records safe server-derived actor and target references", async () => {
    await writer.append(
      {
        eventType: "authentication.login.succeeded",
        outcome: "succeeded",
        actor: { type: "user", userId },
        target: { type: "session", id: sessionId },
        correlationId,
        occurredAt,
        metadata: {},
      },
      database,
    );

    expect(database.records[0]).toMatchObject({
      eventType: "authentication.login.succeeded",
      actorType: "user",
      actorUserId: userId,
      targetType: "session",
      targetId: sessionId,
      correlationId,
      metadata: {},
    });
  });

  it("rejects malformed identifiers before persistence", async () => {
    await expect(
      writer.append(
        {
          eventType: "authentication.logout.succeeded",
          outcome: "succeeded",
          actor: { type: "user", userId: "not-a-uuid" },
          target: { type: "session", id: sessionId },
          correlationId,
          occurredAt,
          metadata: {},
        },
        database,
      ),
    ).rejects.toThrow(/actor\.userId must be a UUID/);
    expect(database.records).toHaveLength(0);
  });

  it("records buy order lifecycle audit events with safe metadata", async () => {
    const buyOrderId = "30000000-0000-4000-8000-000000000004";
    const buyerOrgId = "40000000-0000-4000-8000-000000000005";

    await writer.append(
      {
        eventType: "buyer.buy_order.created",
        outcome: "succeeded",
        actor: { type: "user", userId },
        target: { type: "buy_order", id: buyOrderId },
        correlationId,
        occurredAt,
        metadata: {
          buyerOrganisationId: buyerOrgId,
          materialType: "HEMP",
          status: "DRAFT",
        },
      },
      database,
    );

    expect(database.records[0]).toMatchObject({
      eventType: "buyer.buy_order.created",
      actorType: "user",
      actorUserId: userId,
      targetType: "buy_order",
      targetId: buyOrderId,
      correlationId,
      metadata: {
        buyerOrganisationId: buyerOrgId,
        materialType: "HEMP",
        status: "DRAFT",
      },
    });
  });
});
