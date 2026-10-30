import { BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaQualityRepository } from "./prisma-quality.repository";
import { PrismaService } from "../database";

describe("PrismaQualityRepository — P2002 Error Mapping", () => {
  let repository: PrismaQualityRepository;
  let mockPrisma: {
    $transaction: jest.Mock;
    qualityResult: {
      findUnique: jest.Mock;
    };
    inspection: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn(),
      qualityResult: {
        findUnique: jest.fn(),
      },
      inspection: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };
    repository = new PrismaQualityRepository(mockPrisma as unknown as PrismaService);
  });

  it("maps P2002 on certificateNumber to ConflictException (certificate-reference-collision)", async () => {
    const p2002CertCollision = {
      code: "P2002",
      meta: { target: ["certificateNumber"] },
      message: "Unique constraint failed on the fields: (`certificateNumber`)",
    };

    mockPrisma.$transaction.mockRejectedValueOnce(p2002CertCollision);

    await expect(
      repository.createQualityResult(
        {
          inspectionId: "insp-1",
          decision: "APPROVED",
          classificationLabel: "Standard",
          decidedByUserId: "user-1",
          decidedAt: new Date(),
        },
        {
          certificateNumber: "QIC-20260918-12345678",
          storageKey: "certs/test.pdf",
          snapshotData: {},
          issuedByUserId: "user-1",
          issuedAt: new Date(),
        },
      ),
    ).rejects.toThrow(ConflictException);

    try {
      mockPrisma.$transaction.mockRejectedValueOnce(p2002CertCollision);
      await repository.createQualityResult(
        {
          inspectionId: "insp-1",
          decision: "APPROVED",
          classificationLabel: "Standard",
          decidedByUserId: "user-1",
          decidedAt: new Date(),
        },
        {
          certificateNumber: "QIC-20260918-12345678",
          storageKey: "certs/test.pdf",
          snapshotData: {},
          issuedByUserId: "user-1",
          issuedAt: new Date(),
        },
      );
    } catch (err: unknown) {
      const response = (err as { getResponse?: () => unknown })?.getResponse?.();
      expect(response).toEqual(
        expect.objectContaining({
          type: "https://errors.idogrow.com/quality/certificate-reference-collision",
          title: "Certificate Reference Collision",
          status: 409,
        }),
      );
    }
  });

  it("maps P2002 on inspectionId to BadRequestException (result-already-exists)", async () => {
    const p2002InspectionDuplicate = {
      code: "P2002",
      meta: { target: ["inspectionId"] },
      message: "Unique constraint failed on the fields: (`inspectionId`)",
    };

    mockPrisma.$transaction.mockRejectedValueOnce(p2002InspectionDuplicate);

    await expect(
      repository.createQualityResult(
        {
          inspectionId: "insp-1",
          decision: "APPROVED",
          classificationLabel: "Standard",
          decidedByUserId: "user-1",
          decidedAt: new Date(),
        },
      ),
    ).rejects.toThrow(BadRequestException);

    try {
      mockPrisma.$transaction.mockRejectedValueOnce(p2002InspectionDuplicate);
      await repository.createQualityResult({
        inspectionId: "insp-1",
        decision: "APPROVED",
        classificationLabel: "Standard",
        decidedByUserId: "user-1",
        decidedAt: new Date(),
      });
    } catch (err: unknown) {
      const response = (err as { getResponse?: () => unknown })?.getResponse?.();
      expect(response).toEqual(
        expect.objectContaining({
          type: "https://errors.idogrow.com/quality/result-already-exists",
          title: "Quality Decision Immutable",
          status: 400,
        }),
      );
    }
  });

  describe("Inspection & Certificate restitution queries", () => {
    const mockDbRecord = {
      id: "insp-1",
      inspectionReference: "INS-20261018-O5GE",
      templateId: "tpl-1",
      template: {
        templateKey: "TPL_HEMP",
        name: "European Hemp Straw Quality Inspection Template",
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        fields: [],
      },
      templateVersion: 1,
      tradeId: "trade-1",
      trade: {
        tradeNumber: "TRD-20260919-5B13",
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        quantity: 50,
        quantityUnit: "TONNES",
      },
      listingId: null,
      externalLotReference: null,
      buyerOrganisation: { id: "buyer-1", name: "Buyer Org" },
      supplierOrganisation: { id: "supp-1", name: "Supplier Org" },
      assignedInspectorUser: { id: "insp-user-1", email: "inspector@example.test", role: "QUALITY_INSPECTOR" },
      inspectionMethod: "INDEPENDENT_PHYSICAL_INSPECTION",
      status: "COMPLETED",
      scheduledAt: null,
      startedAt: new Date("2026-10-18T10:22:07.452Z"),
      completedAt: new Date("2026-10-18T10:26:49.179Z"),
      latitude: null,
      longitude: null,
      measurementMethod: null,
      equipmentUsed: null,
      inspectorNotes: null,
      measurements: { moisturePercentage: "12.5" },
      assessmentStatus: "ASSESSMENT_RECORDED",
      assessmentSummary: "Satisfactory assessment",
      observedIssues: null,
      recommendedFollowUp: null,
      assessedAt: new Date("2026-10-18T10:51:44.809Z"),
      assessedByUserId: "insp-user-1",
      physicalInspectionRequired: false,
      physicalInspectionReason: null,
      evidence: [],
      nonConformities: [],
      qualityResult: {
        id: "qr-1",
        inspectionId: "insp-1",
        tradeId: "trade-1",
        decision: "APPROVED",
        classificationLabel: "Standard Commercial Hemp Straw — QA Test",
        decisionNotes: "QA test approved",
        decidedByUserId: "insp-user-1",
        decidedAt: new Date("2026-10-18T10:56:09.248Z"),
        createdAt: new Date("2026-10-18T10:56:09.255Z"),
        certificate: {
          id: "cert-1",
          certificateNumber: "QIC-20261018-E48C62F9",
        },
      },
      certificate: {
        id: "cert-1",
        certificateNumber: "QIC-20261018-E48C62F9",
        inspectionId: "insp-1",
        qualityResultId: "qr-1",
        tradeId: "trade-1",
        storageKey: "cert.pdf",
        snapshotData: { decision: "APPROVED" },
        issuedByUserId: "insp-user-1",
        issuedAt: new Date("2026-10-18T10:56:09.248Z"),
        createdAt: new Date("2026-10-18T10:56:09.259Z"),
      },
      createdAt: new Date("2026-10-18T10:15:27.595Z"),
      updatedAt: new Date("2026-10-18T10:56:09.255Z"),
    };

    it("findInspectionById includes qualityResult and certificate relations and maps them completely", async () => {
      mockPrisma.inspection.findUnique.mockResolvedValueOnce(mockDbRecord);

      const result = await repository.findInspectionById("insp-1");

      expect(mockPrisma.inspection.findUnique).toHaveBeenCalledWith({
        where: { id: "insp-1" },
        include: expect.objectContaining({
          qualityResult: {
            include: {
              certificate: {
                select: { id: true, certificateNumber: true },
              },
            },
          },
          certificate: true,
        }),
      });

      expect(result).not.toBeNull();
      expect(result?.qualityResult).toEqual(
        expect.objectContaining({
          id: "qr-1",
          decision: "APPROVED",
          classificationLabel: "Standard Commercial Hemp Straw — QA Test",
          certificateId: "cert-1",
          certificateNumber: "QIC-20261018-E48C62F9",
        }),
      );
      expect(result?.certificate).toEqual(
        expect.objectContaining({
          id: "cert-1",
          certificateNumber: "QIC-20261018-E48C62F9",
          storageKey: "cert.pdf",
        }),
      );
    });

    it("findInspectionsForInspector includes qualityResult and certificate and maps qualityDecision and certificateNumber", async () => {
      mockPrisma.inspection.findMany.mockResolvedValueOnce([
        {
          id: "insp-1",
          inspectionReference: "INS-20261018-O5GE",
          tradeId: "trade-1",
          trade: {
            tradeNumber: "TRD-1",
            materialType: "HEMP",
            productForm: "STRAW_RETTED",
            quantity: 50,
            quantityUnit: "TONNES",
          },
          supplierOrganisation: { name: "Supplier Org" },
          buyerOrganisation: { name: "Buyer Org" },
          assignedInspectorUser: { email: "inspector@example.test" },
          inspectionMethod: "INDEPENDENT_PHYSICAL_INSPECTION",
          status: "COMPLETED",
          assessmentStatus: "ASSESSMENT_RECORDED",
          physicalInspectionRequired: false,
          evidence: [],
          nonConformities: [],
          qualityResult: { decision: "APPROVED" },
          certificate: { certificateNumber: "QIC-20261018-E48C62F9" },
          scheduledAt: null,
          startedAt: new Date("2026-10-18T10:22:07.452Z"),
          completedAt: new Date("2026-10-18T10:26:49.179Z"),
          createdAt: new Date("2026-10-18T10:15:27.595Z"),
        },
      ]);

      const list = await repository.findInspectionsForInspector("insp-user-1");

      expect(mockPrisma.inspection.findMany).toHaveBeenCalledWith({
        where: { assignedInspectorUserId: "insp-user-1" },
        include: expect.objectContaining({
          qualityResult: { select: { decision: true } },
          certificate: { select: { certificateNumber: true } },
        }),
        orderBy: { createdAt: "desc" },
      });

      expect(list).toHaveLength(1);
      expect(list[0].qualityDecision).toBe("APPROVED");
      expect(list[0].certificateNumber).toBe("QIC-20261018-E48C62F9");
    });
  });
});
