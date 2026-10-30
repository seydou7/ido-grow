import { ForbiddenException, BadRequestException, ConflictException } from "@nestjs/common";
import { Readable } from "node:stream";
import { QualityService } from "./quality.service";
import { QualityRepository } from "./quality.repository";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { AuditEventWriter, AuditEventDatabaseClient } from "../audit";
import { StorageService } from "../storage";
import { HEMP_STRAW_STANDARD_FIELDS, InspectionDetail, InspectionCertificateSummary } from "./contracts";

describe("QualityService", () => {
  let service: QualityService;
  let qualityRepo: jest.Mocked<QualityRepository>;
  let organisationsRepo: jest.Mocked<OrganisationsRepository>;
  let auditWriter: jest.Mocked<AuditEventWriter>;
  let storageService: jest.Mocked<StorageService>;

  const traderUserId = "trader-user-uuid";
  const inspectorUserId = "inspector-user-uuid";
  const secondInspectorUserId = "second-inspector-uuid";
  const otherInspectorUserId = "other-inspector-uuid";
  const buyerUserId = "buyer-user-uuid";
  const supplierUserId = "supplier-user-uuid";

  const traderOrgId = "trader-org-uuid";
  const buyerOrgId = "buyer-org-uuid";
  const supplierOrgId = "supplier-org-uuid";

  const mockTrade = {
    id: "trade-uuid-1",
    tradeNumber: "TRD-20260918-001",
    listingId: "listing-uuid-1",
    buyerOrganisationId: buyerOrgId,
    supplierOrganisationId: supplierOrgId,
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 50,
    quantityUnit: "TONNES",
    buyerOrganisation: { id: buyerOrgId, name: "Buyer Co" },
    supplierOrganisation: { id: supplierOrgId, name: "Supplier Co" },
  };

  const mockTemplate = {
    id: "template-uuid-1",
    templateKey: "HEMP_STRAW_STANDARD",
    name: "European Hemp Straw Quality Inspection",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    supportedMethods: [
      "INDEPENDENT_PHYSICAL_INSPECTION",
      "LOCAL_AGENT_VERIFIED",
      "SUPPLIER_SELF_REPORTED",
      "REMOTE",
      "LABORATORY_TESTED",
      "AI_ASSISTED",
    ],
    version: 1,
    status: "ACTIVE",
    fields: HEMP_STRAW_STANDARD_FIELDS,
    photoInstructions: "Provide clear photos of bales.",
    createdAt: "2026-09-18T10:00:00Z",
    updatedAt: "2026-09-18T10:00:00Z",
  };

  const mockInspection: InspectionDetail = {
    id: "inspection-uuid-1",
    inspectionReference: "INS-20260918-ABCD",
    templateId: mockTemplate.id,
    templateKey: mockTemplate.templateKey,
    templateName: mockTemplate.name,
    templateVersion: mockTemplate.version,
    templateFields: mockTemplate.fields,
    tradeId: mockTrade.id,
    tradeNumber: mockTrade.tradeNumber,
    listingId: mockTrade.listingId,
    externalLotReference: "LOT-HEMP-2026-01",
    materialType: mockTrade.materialType,
    productForm: mockTrade.productForm,
    quantity: mockTrade.quantity,
    quantityUnit: mockTrade.quantityUnit,
    buyerOrganisation: mockTrade.buyerOrganisation,
    supplierOrganisation: mockTrade.supplierOrganisation,
    assignedInspector: {
      id: inspectorUserId,
      email: "inspector@demo.idogrow.com",
      role: "QUALITY_INSPECTOR",
    },
    inspectionMethod: "INDEPENDENT_PHYSICAL_INSPECTION",
    status: "ASSIGNED",
    scheduledAt: "2026-09-20T10:00:00Z",
    startedAt: null,
    completedAt: null,
    latitude: null,
    longitude: null,
    measurementMethod: null,
    equipmentUsed: null,
    inspectorNotes: null,
    measurements: {},
    assessmentStatus: "NOT_ASSESSED",
    assessmentSummary: null,
    observedIssues: null,
    recommendedFollowUp: null,
    assessedAt: null,
    assessedByUserId: null,
    physicalInspectionRequired: false,
    physicalInspectionReason: null,
    evidence: [],
    nonConformities: [],
    qualityResult: null,
    certificate: null,
    createdAt: "2026-09-18T11:00:00Z",
    updatedAt: "2026-09-18T11:00:00Z",
  };

  beforeEach(() => {
    qualityRepo = {
      ensureDefaultTemplate: jest.fn().mockResolvedValue(undefined),
      findActiveTemplates: jest.fn().mockResolvedValue([mockTemplate]),
      findTemplateById: jest.fn().mockResolvedValue(mockTemplate),
      findTemplateByKeyAndVersion: jest.fn().mockResolvedValue(mockTemplate),
      createInspection: jest.fn().mockResolvedValue(mockInspection),
      updateInspection: jest.fn().mockImplementation((id, data) => {
        return Promise.resolve({
          ...mockInspection,
          ...data,
          status: data.status || mockInspection.status,
          measurements: data.measurements || mockInspection.measurements,
        });
      }),
      findInspectionById: jest.fn().mockResolvedValue(mockInspection),
      findInspectionsForInspector: jest.fn().mockResolvedValue([]),
      findAllInspections: jest.fn().mockResolvedValue([]),
      findInspectionsByTradeId: jest.fn().mockResolvedValue([]),
      findAssignableInspectors: jest.fn().mockResolvedValue([
        {
          userId: inspectorUserId,
          email: "inspector@demo.idogrow.com",
          role: "QUALITY_INSPECTOR",
          isActive: true,
        },
      ]),
      findUserById: jest.fn().mockImplementation((id: string) => {
        if (id === inspectorUserId) {
          return Promise.resolve({
            id: inspectorUserId,
            email: "inspector@demo.idogrow.com",
            role: "QUALITY_INSPECTOR",
            isActive: true,
          });
        }
        if (id === secondInspectorUserId) {
          return Promise.resolve({
            id: secondInspectorUserId,
            email: "second@demo.idogrow.com",
            role: "QUALITY_INSPECTOR",
            isActive: true,
          });
        }
        if (id === otherInspectorUserId) {
          return Promise.resolve({
            id: otherInspectorUserId,
            email: "other@demo.idogrow.com",
            role: "QUALITY_INSPECTOR",
            isActive: true,
          });
        }
        if (id === "regular-user-id") {
          return Promise.resolve({
            id: "regular-user-id",
            email: "user@demo.idogrow.com",
            role: "STANDARD",
            isActive: true,
          });
        }
        if (id === "inactive-inspector-id") {
          return Promise.resolve({
            id: "inactive-inspector-id",
            email: "inactive@demo.idogrow.com",
            role: "QUALITY_INSPECTOR",
            isActive: false,
          });
        }
        if (id === "revoked-inspector-id") {
          return Promise.resolve({
            id: "revoked-inspector-id",
            email: "revoked@demo.idogrow.com",
            role: "STANDARD",
            isActive: true,
          });
        }
        return Promise.resolve(null);
      }),
      findTradeById: jest.fn().mockResolvedValue(mockTrade),
      createEvidence: jest.fn().mockImplementation((data, onAtomicActions) => {
        const summary = {
          id: "evidence-uuid-1",
          inspectionId: data.inspectionId,
          evidenceType: data.evidenceType,
          originalFilename: data.originalFilename,
          storageKey: data.storageKey,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          caption: data.caption || null,
          capturedAt: data.capturedAt ? data.capturedAt.toISOString() : null,
          uploadedByUserId: data.uploadedByUserId,
          createdAt: new Date().toISOString(),
        };
        if (onAtomicActions) {
          return onAtomicActions({} as unknown as AuditEventDatabaseClient, summary).then(() => summary);
        }
        return Promise.resolve(summary);
      }),
      findEvidenceById: jest.fn().mockImplementation((id: string) => {
        return Promise.resolve({
          id,
          inspectionId: mockInspection.id,
          evidenceType: "PHOTO",
          originalFilename: "bale-photo.jpg",
          storageKey: "storage-key-1.jpg",
          mimeType: "image/jpeg",
          fileSize: 1024,
          caption: "Whole bale overview",
          capturedAt: null,
          uploadedByUserId: inspectorUserId,
          createdAt: "2026-09-18T12:00:00Z",
        });
      }),
      findEvidenceByInspectionId: jest.fn().mockResolvedValue([]),
      updateAssessment: jest.fn().mockImplementation((id, data) => {
        return Promise.resolve({
          ...mockInspection,
          assessmentStatus: data.assessmentStatus,
          assessmentSummary: data.assessmentSummary,
          observedIssues: data.observedIssues || null,
          recommendedFollowUp: data.recommendedFollowUp || null,
          assessedAt: data.assessedAt.toISOString(),
          assessedByUserId: data.assessedByUserId,
        });
      }),
      updatePhysicalInspection: jest.fn().mockImplementation((id, data) => {
        return Promise.resolve({
          ...mockInspection,
          physicalInspectionRequired: data.physicalInspectionRequired,
          physicalInspectionReason: data.physicalInspectionReason,
        });
      }),
      createNonConformity: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: "nc-uuid-1",
          inspectionId: data.inspectionId,
          reportedByUserId: data.reportedByUserId,
          category: data.category,
          description: data.description,
          status: data.status,
          resolutionNotes: null,
          resolvedAt: null,
          resolvedByUserId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }),
      findNonConformityById: jest.fn().mockImplementation((id: string) => {
        return Promise.resolve({
          id,
          inspectionId: mockInspection.id,
          reportedByUserId: inspectorUserId,
          category: "MOISTURE_EXCESS",
          description: "Moisture levels elevated",
          status: "OPEN",
          resolutionNotes: null,
          resolvedAt: null,
          resolvedByUserId: null,
          createdAt: "2026-09-18T12:00:00Z",
          updatedAt: "2026-09-18T12:00:00Z",
        });
      }),
      updateNonConformity: jest.fn().mockImplementation((id, data) => {
        return Promise.resolve({
          id,
          inspectionId: mockInspection.id,
          reportedByUserId: inspectorUserId,
          category: "MOISTURE_EXCESS",
          description: "Moisture levels elevated",
          status: data.status,
          resolutionNotes: data.resolutionNotes,
          resolvedAt: data.resolvedAt.toISOString(),
          resolvedByUserId: data.resolvedByUserId,
          createdAt: "2026-09-18T12:00:00Z",
          updatedAt: new Date().toISOString(),
        });
      }),
      findNonConformitiesByInspectionId: jest.fn().mockResolvedValue([]),
      createQualityResult: jest.fn().mockImplementation((data, certificateData, onAtomicActions) => {
        let certSummary: InspectionCertificateSummary | undefined;
        if (certificateData) {
          certSummary = {
            id: "cert-uuid-1",
            certificateNumber: certificateData.certificateNumber,
            inspectionId: data.inspectionId,
            qualityResultId: "qr-uuid-1",
            tradeId: data.tradeId || null,
            storageKey: certificateData.storageKey,
            snapshotData: certificateData.snapshotData,
            issuedByUserId: certificateData.issuedByUserId,
            issuedAt: certificateData.issuedAt.toISOString(),
            createdAt: new Date().toISOString(),
          };
        }
        const qrSummary = {
          id: "qr-uuid-1",
          inspectionId: data.inspectionId,
          tradeId: data.tradeId || null,
          decision: data.decision,
          classificationLabel: data.classificationLabel,
          decisionNotes: data.decisionNotes || null,
          decidedByUserId: data.decidedByUserId,
          decidedAt: data.decidedAt.toISOString(),
          createdAt: new Date().toISOString(),
          certificateId: certSummary?.id || null,
          certificateNumber: certSummary?.certificateNumber || null,
        };
        if (onAtomicActions) {
          return onAtomicActions({} as unknown as AuditEventDatabaseClient, { qualityResult: qrSummary, certificate: certSummary }).then(() => ({
            qualityResult: qrSummary,
            certificate: certSummary,
          }));
        }
        return Promise.resolve({ qualityResult: qrSummary, certificate: certSummary });
      }),
      findQualityResultByInspectionId: jest.fn(),
      createCertificate: jest.fn(),
      findCertificateByInspectionId: jest.fn(),
      findCertificateById: jest.fn(),
    } as unknown as jest.Mocked<QualityRepository>;

    organisationsRepo = {
      findMembershipsForUser: jest.fn().mockImplementation((id: string) => {
        if (id === traderUserId) {
          return Promise.resolve([
            {
              id: "m-1",
              userId: traderUserId,
              organisationId: traderOrgId,
              organisation: { organisationType: "TRADER" },
            },
          ]);
        }
        if (id === buyerUserId) {
          return Promise.resolve([
            {
              id: "m-2",
              userId: buyerUserId,
              organisationId: buyerOrgId,
              organisation: { organisationType: "BUYER" },
            },
          ]);
        }
        if (id === supplierUserId) {
          return Promise.resolve([
            {
              id: "m-3",
              userId: supplierUserId,
              organisationId: supplierOrgId,
              organisation: { organisationType: "SUPPLIER" },
            },
          ]);
        }
        return Promise.resolve([]);
      }),
    } as unknown as jest.Mocked<OrganisationsRepository>;

    auditWriter = {
      append: jest.fn().mockResolvedValue({ id: "audit-uuid" }),
    } as unknown as jest.Mocked<AuditEventWriter>;

    storageService = {
      store: jest.fn().mockImplementation((filename, buffer, mimeType) => {
        return Promise.resolve({
          storageKey: "storage-key-1.jpg",
          originalFilename: filename,
          mimeType,
          fileSize: buffer.length,
        });
      }),
      retrieve: jest.fn().mockResolvedValue({
        stream: Readable.from(["file-content"]),
        mimeType: "image/jpeg",
        fileSize: 1024,
        filename: "bale-photo.jpg",
      }),
      delete: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<StorageService>;

    service = new QualityService(
      qualityRepo,
      organisationsRepo,
      auditWriter,
      storageService,
    );
  });

  describe("Phase 0 — Integrity & Authorization Corrections", () => {
    it("allows Trader to view full inspection detail", async () => {
      const res = await service.getInspectionById(traderUserId, mockInspection.id);
      expect(res.id).toBe(mockInspection.id);
    });

    it("allows assigned Quality Inspector to view full inspection detail", async () => {
      const res = await service.getInspectionById(inspectorUserId, mockInspection.id);
      expect(res.id).toBe(mockInspection.id);
    });

    it("DENIES Buyer organisation member from reading full inspection detail", async () => {
      await expect(
        service.getInspectionById(buyerUserId, mockInspection.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it("DENIES Supplier organisation member from reading full inspection detail", async () => {
      await expect(
        service.getInspectionById(supplierUserId, mockInspection.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it("DENIES other Quality Inspector from reading inspection not assigned to them", async () => {
      await expect(
        service.getInspectionById(otherInspectorUserId, mockInspection.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it("allows assignment on DRAFT inspection", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "DRAFT",
        assignedInspector: null,
      });

      const res = await service.assignInspector(traderUserId, mockInspection.id, {
        inspectorUserId,
      });
      expect(res.status).toBe("ASSIGNED");
    });

    it("allows reassignment on already ASSIGNED inspection", async () => {
      const res = await service.assignInspector(traderUserId, mockInspection.id, {
        inspectorUserId: secondInspectorUserId,
      });
      expect(res.status).toBe("ASSIGNED");
    });

    it("REJECTS reassignment when inspection is IN_PROGRESS", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "IN_PROGRESS",
      });

      await expect(
        service.assignInspector(traderUserId, mockInspection.id, {
          inspectorUserId: secondInspectorUserId,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS reassignment when inspection is COMPLETED", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
      });

      await expect(
        service.assignInspector(traderUserId, mockInspection.id, {
          inspectorUserId: secondInspectorUserId,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("action-time: denies start if inspector role was revoked after assignment", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        assignedInspector: {
          id: "revoked-inspector-id",
          email: "revoked@demo.idogrow.com",
          role: "QUALITY_INSPECTOR",
        },
      });

      await expect(
        service.startInspection("revoked-inspector-id", mockInspection.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it("action-time: denies saveMeasurements if inspector was deactivated after assignment", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "IN_PROGRESS",
        assignedInspector: {
          id: "inactive-inspector-id",
          email: "inactive@demo.idogrow.com",
          role: "QUALITY_INSPECTOR",
        },
      });

      await expect(
        service.saveMeasurements("inactive-inspector-id", mockInspection.id, {
          measurements: { moisturePercentage: 12 },
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("Block 02 — Evidence Capture", () => {
    const validImageFile = {
      originalname: "bale-sample.jpg",
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]),
      mimetype: "image/jpeg",
    };

    const validPdfFile = {
      originalname: "lab-report.pdf",
      buffer: Buffer.from("%PDF-1.4 test content"),
      mimetype: "application/pdf",
    };

    it("uploads valid PHOTO evidence and logs audit event", async () => {
      const res = await service.uploadEvidence(
        inspectorUserId,
        mockInspection.id,
        validImageFile,
        { evidenceType: "PHOTO", caption: "Bale front view" },
      );

      expect(res.evidenceType).toBe("PHOTO");
      expect(res.originalFilename).toBe("bale-sample.jpg");
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.evidence.uploaded",
          outcome: "succeeded",
        }),
        expect.anything(),
      );
    });

    it("uploads valid LAB_REPORT supporting document", async () => {
      const res = await service.uploadEvidence(
        inspectorUserId,
        mockInspection.id,
        validPdfFile,
        { evidenceType: "LAB_REPORT", caption: "Moisture analysis" },
      );

      expect(res.evidenceType).toBe("LAB_REPORT");
    });

    it("REJECTS PHOTO evidence if non-image MIME type is provided", async () => {
      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          validPdfFile,
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("DENIES other inspector from uploading evidence", async () => {
      await expect(
        service.uploadEvidence(
          otherInspectorUserId,
          mockInspection.id,
          validImageFile,
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("DENIES Buyer from uploading evidence", async () => {
      await expect(
        service.uploadEvidence(
          buyerUserId,
          mockInspection.id,
          validImageFile,
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("DENIES evidence upload to COMPLETED inspection", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
      });

      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          validImageFile,
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("retrieves evidence file stream for authorized inspector", async () => {
      const retrieved = await service.getEvidenceFile(
        inspectorUserId,
        mockInspection.id,
        "evidence-uuid-1",
      );
      expect(retrieved.filename).toBe("bale-photo.jpg");
      expect(retrieved.mimeType).toBe("image/jpeg");
    });
  });

  describe("Block 02 — Preliminary Human Assessment", () => {
    it("records preliminary HUMAN assessment on IN_PROGRESS inspection and logs audit", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "IN_PROGRESS",
      });

      const res = await service.recordAssessment(
        inspectorUserId,
        mockInspection.id,
        {
          assessmentSummary: "Uniform straw compaction with acceptable moisture.",
          observedIssues: "Minor dust at bottom layer.",
          recommendedFollowUp: "Check core temperature before storage.",
        },
      );

      expect(res.assessmentStatus).toBe("ASSESSMENT_RECORDED");
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.assessment.recorded",
          outcome: "succeeded",
        }),
      );
    });

    it("REJECTS assessment recording on DRAFT inspection", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "DRAFT",
      });

      await expect(
        service.recordAssessment(inspectorUserId, mockInspection.id, {
          assessmentSummary: "Premature assessment.",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS assessment recording with empty summary", async () => {
      (qualityRepo.findInspectionById as jest.Mock).mockResolvedValueOnce({
        ...mockInspection,
        status: "IN_PROGRESS",
      });

      await expect(
        service.recordAssessment(inspectorUserId, mockInspection.id, {
          assessmentSummary: "   ",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Block 02 — Non-Conformity Foundation", () => {
    it("creates a non-conformity in OPEN status and logs audit event", async () => {
      const nc = await service.createNonConformity(
        inspectorUserId,
        mockInspection.id,
        {
          category: "MOISTURE_EXCESS",
          description: "Moisture measured at 19% in 3 bales.",
        },
      );

      expect(nc.status).toBe("OPEN");
      expect(nc.category).toBe("MOISTURE_EXCESS");
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.non_conformity.created",
          outcome: "succeeded",
        }),
      );
    });

    it("resolves an open non-conformity and logs audit event", async () => {
      const resolved = await service.resolveNonConformity(
        inspectorUserId,
        mockInspection.id,
        "nc-uuid-1",
        {
          resolutionNotes: "Moisture condition was rechecked and corrective action documented.",
        },
      );

      expect(resolved.status).toBe("RESOLVED");
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.non_conformity.resolved",
          outcome: "succeeded",
        }),
      );
    });

    it("REJECTS non-conformity creation with empty fields", async () => {
      await expect(
        service.createNonConformity(inspectorUserId, mockInspection.id, {
          category: "",
          description: "test",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Block 02 — Physical Inspection Escalation", () => {
    it("requests physical inspection escalation and logs audit event", async () => {
      const res = await service.requestPhysicalInspection(
        inspectorUserId,
        mockInspection.id,
        {
          reason: "Suspected deep mould inside high-density bales requiring physical probe.",
        },
      );

      expect(res.physicalInspectionRequired).toBe(true);
      expect(res.physicalInspectionReason).toContain("Suspected deep mould");
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.physical_inspection.requested",
          outcome: "succeeded",
        }),
      );
    });

    it("REJECTS physical inspection escalation without reason", async () => {
      await expect(
        service.requestPhysicalInspection(inspectorUserId, mockInspection.id, {
          reason: "   ",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("Phase 0 & Block 03 — Integrity Hardening & Quality Results", () => {
    it("REJECTS non-conformity resolution if already RESOLVED (idempotency)", async () => {
      qualityRepo.findNonConformityById.mockResolvedValueOnce({
        id: "nc-uuid-1",
        inspectionId: mockInspection.id,
        status: "RESOLVED",
        category: "MOISTURE_OBSERVATION",
        description: "Moisture reading requires quality review.",
        reportedByUserId: inspectorUserId,
        resolvedAt: new Date().toISOString(),
        resolutionNotes: "Already fixed.",
        resolvedByUserId: inspectorUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await expect(
        service.resolveNonConformity(inspectorUserId, mockInspection.id, "nc-uuid-1", {
          resolutionNotes: "Resolving again should be blocked",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS evidence upload exceeding MAX_INSPECTION_EVIDENCE_BYTES (10MB)", async () => {
      const hugeBuffer = Buffer.alloc(10 * 1024 * 1024 + 10);
      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "huge.jpg", buffer: hugeBuffer, mimetype: "image/jpeg" },
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS PHOTO evidence with non-image MIME type", async () => {
      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "doc.pdf", buffer: Buffer.from("%PDF-1.4"), mimetype: "application/pdf" },
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS DOCUMENT evidence with non-PDF MIME type", async () => {
      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "photo.jpg", buffer: Buffer.from([0xff, 0xd8, 0xff]), mimetype: "image/jpeg" },
          { evidenceType: "DOCUMENT" },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS LAB_REPORT evidence with non-PDF MIME type", async () => {
      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "lab.png", buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]), mimetype: "image/png" },
          { evidenceType: "LAB_REPORT" },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS evidence upload with invalid capturedAt date string", async () => {
      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "photo.jpg", buffer: Buffer.from([0xff, 0xd8, 0xff]), mimetype: "image/jpeg" },
          { evidenceType: "PHOTO", capturedAt: "invalid-date-format" },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("compensates storage (deletes stored file) if DB createEvidence fails", async () => {
      qualityRepo.createEvidence.mockRejectedValueOnce(new Error("DB failure"));
      const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "test.jpg", buffer: validJpg, mimetype: "image/jpeg" },
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow("DB failure");

      expect(storageService.delete).toHaveBeenCalledWith("storage-key-1.jpg");
    });

    it("rolls back DB and deletes stored file if evidence audit append fails", async () => {
      // Mock createEvidence simulating transaction rollback when onAtomicActions (audit) throws
      (qualityRepo.createEvidence as jest.Mock).mockImplementationOnce(async (data, onAtomicActions) => {
        const summary = {
          id: "evidence-uuid-1",
          inspectionId: data.inspectionId,
          evidenceType: data.evidenceType,
          originalFilename: data.originalFilename,
          storageKey: data.storageKey,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          caption: null,
          capturedAt: null,
          uploadedByUserId: data.uploadedByUserId,
          createdAt: new Date().toISOString(),
        };
        // onAtomicActions will fail
        await onAtomicActions({} as unknown as AuditEventDatabaseClient, summary);
        return summary;
      });
      (auditWriter.append as jest.Mock).mockRejectedValueOnce(new Error("Audit failure"));

      const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "test.jpg", buffer: validJpg, mimetype: "image/jpeg" },
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow("Audit failure");

      expect(storageService.delete).toHaveBeenCalledWith("storage-key-1.jpg");
    });

    it("does not swallow DB failure if storage cleanup delete itself fails", async () => {
      qualityRepo.createEvidence.mockRejectedValueOnce(new Error("DB failure"));
      (storageService.delete as jest.Mock).mockRejectedValueOnce(new Error("Storage disk error"));
      const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

      await expect(
        service.uploadEvidence(
          inspectorUserId,
          mockInspection.id,
          { originalname: "test.jpg", buffer: validJpg, mimetype: "image/jpeg" },
          { evidenceType: "PHOTO" },
        ),
      ).rejects.toThrow("DB failure");
    });

    it("evidence upload full success: exactly one stored file, one evidence, one audit event", async () => {
      const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
      const res = await service.uploadEvidence(
        inspectorUserId,
        mockInspection.id,
        { originalname: "bales.jpg", buffer: validJpg, mimetype: "image/jpeg" },
        { evidenceType: "PHOTO", caption: "Fresh retting" },
      );

      expect(res.id).toBe("evidence-uuid-1");
      expect(storageService.store).toHaveBeenCalledTimes(1);
      expect(qualityRepo.createEvidence).toHaveBeenCalledTimes(1);
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.evidence.uploaded",
          outcome: "succeeded",
        }),
        expect.anything(),
      );
    });

    it("REJECTS recordQualityDecision if inspection is not COMPLETED", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "IN_PROGRESS",
      });

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Retting",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS recordQualityDecision if preliminary assessment is not recorded", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "NOT_ASSESSED",
      });

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Retting",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("REJECTS recordQualityDecision if actor is Trader instead of assigned inspector", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
      });

      await expect(
        service.recordQualityDecision(traderUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Retting",
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("enforces immutability: cannot record decision if result already exists", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce({
        id: "qr-uuid-existing",
        inspectionId: mockInspection.id,
        tradeId: mockInspection.tradeId,
        decision: "APPROVED",
        classificationLabel: "Standard",
        decisionNotes: null,
        decidedByUserId: inspectorUserId,
        decidedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "REJECTED",
          classificationLabel: "New Attempt",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("concurrency safety: handles race condition inside transaction returning immutable error", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);
      (qualityRepo.createQualityResult as jest.Mock).mockRejectedValueOnce(
        new BadRequestException({
          type: "https://errors.idogrow.com/quality/result-already-exists",
          title: "Quality Decision Immutable",
          status: 400,
          detail: "A final quality decision has already been recorded for this inspection and is immutable.",
        }),
      );

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Commercial Retting",
        }),
      ).rejects.toThrow(BadRequestException);

      // Stored PDF should be cleaned up on concurrent conflict
      expect(storageService.delete).toHaveBeenCalled();
    });

    it("APPROVED flow: storage failure -> no QualityResult, no Certificate, no audit", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);
      (storageService.store as jest.Mock).mockRejectedValueOnce(new Error("Disk full"));

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Commercial Retting",
        }),
      ).rejects.toThrow("Disk full");

      expect(qualityRepo.createQualityResult).not.toHaveBeenCalled();
      expect(auditWriter.append).not.toHaveBeenCalled();
    });

    it("APPROVED flow: DB/audit transaction failure -> rolls back and deletes stored PDF", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);
      (qualityRepo.createQualityResult as jest.Mock).mockRejectedValueOnce(new Error("Prisma transaction failed"));

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Commercial Retting",
        }),
      ).rejects.toThrow("Prisma transaction failed");

      expect(storageService.delete).toHaveBeenCalled();
    });

    it("APPROVED flow: certificate audit failure inside transaction rolls back and deletes stored PDF", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);
      (qualityRepo.createQualityResult as jest.Mock).mockImplementationOnce(
        async (data, certData, onAtomicActions) => {
          // simulate tx failure inside onAtomicActions
          await onAtomicActions({} as unknown as AuditEventDatabaseClient, {
            qualityResult: { id: "qr-1" },
            certificate: { id: "cert-1", certificateNumber: "QIC-1" },
          });
          throw new Error("Audit log append failed");
        },
      );
      (auditWriter.append as jest.Mock).mockRejectedValueOnce(new Error("Audit log append failed"));

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Commercial Retting",
        }),
      ).rejects.toThrow("Audit log append failed");

      expect(storageService.delete).toHaveBeenCalled();
    });

    it("APPROVED flow: full success committed atomically (1 QR, 1 cert, 2 audits, 1 stored PDF)", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);

      const res = await service.recordQualityDecision(inspectorUserId, mockInspection.id, {
        decision: "APPROVED",
        classificationLabel: "Standard Commercial Retting",
        decisionNotes: "Meets technical criteria.",
      });

      expect(res.decision).toBe("APPROVED");
      expect(res.certificateNumber).toMatch(/^QIC-\d{8}-[A-F0-9]{8}$/);
      expect(storageService.store).toHaveBeenCalledTimes(1);
      expect(qualityRepo.createQualityResult).toHaveBeenCalledTimes(1);
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.result.approved",
          outcome: "succeeded",
        }),
        expect.anything(),
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.certificate.issued",
          outcome: "succeeded",
        }),
        expect.anything(),
      );
    });

    it("REJECTED flow: atomic QualityResult + rejection audit in one transaction, no certificate", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);

      const res = await service.recordQualityDecision(inspectorUserId, mockInspection.id, {
        decision: "REJECTED",
        classificationLabel: "Substandard Batch",
        decisionNotes: "High retting variation and weed contamination.",
      });

      expect(res.decision).toBe("REJECTED");
      expect(res.certificateId).toBeNull();
      expect(res.certificateNumber).toBeNull();
      expect(storageService.store).not.toHaveBeenCalled();
      expect(qualityRepo.createQualityResult).toHaveBeenCalledWith(
        expect.objectContaining({
          decision: "REJECTED",
          classificationLabel: "Substandard Batch",
        }),
        undefined,
        expect.any(Function),
      );
      expect(auditWriter.append).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "quality.result.rejected",
          outcome: "succeeded",
        }),
        expect.anything(),
      );
    });

    it("REJECTED flow: audit failure rolls back QualityResult", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);
      (qualityRepo.createQualityResult as jest.Mock).mockImplementationOnce(
        async (data, certData, onAtomicActions) => {
          await onAtomicActions({} as unknown as AuditEventDatabaseClient, {
            qualityResult: { id: "qr-1", classificationLabel: data.classificationLabel },
          });
          return { qualityResult: { id: "qr-1" } };
        },
      );
      (auditWriter.append as jest.Mock).mockRejectedValueOnce(new Error("Audit failure"));

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "REJECTED",
          classificationLabel: "Substandard Batch",
        }),
      ).rejects.toThrow("Audit failure");
    });
    it("APPROVED flow: retries on certificate collision and deletes orphan PDF before succeeding", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);

      // First attempt fails with ConflictException (certificate reference collision)
      // Second attempt succeeds
      (qualityRepo.createQualityResult as jest.Mock)
        .mockRejectedValueOnce(
          new ConflictException({
            type: "https://errors.idogrow.com/quality/certificate-reference-collision",
            title: "Certificate Reference Collision",
            status: 409,
            detail: "A certificate with this reference number already exists. Collision detected.",
          }),
        )
        .mockResolvedValueOnce({
          qualityResult: {
            id: "qr-retry-success",
            inspectionId: mockInspection.id,
            decision: "APPROVED",
            classificationLabel: "Standard Commercial Retting",
            decidedByUserId: inspectorUserId,
            decidedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            certificateId: "cert-retry",
            certificateNumber: "QIC-20260918-B2C3D4E5",
          },
          certificate: {
            id: "cert-retry",
            certificateNumber: "QIC-20260918-B2C3D4E5",
            inspectionId: mockInspection.id,
            storageKey: "QIC-20260918-B2C3D4E5.pdf",
            issuedAt: new Date().toISOString(),
          },
        });

      const res = await service.recordQualityDecision(inspectorUserId, mockInspection.id, {
        decision: "APPROVED",
        classificationLabel: "Standard Commercial Retting",
      });

      expect(res.decision).toBe("APPROVED");
      expect(res.certificateNumber).toBe("QIC-20260918-B2C3D4E5");
      // Storage called twice: once for collided cert, once for final cert
      expect(storageService.store).toHaveBeenCalledTimes(2);
      // Orphan PDF from collided attempt deleted via compensation
      expect(storageService.delete).toHaveBeenCalledTimes(1);
    });

    it("APPROVED flow: does not retry if error is result-already-exists", async () => {
      qualityRepo.findInspectionById.mockResolvedValueOnce({
        ...mockInspection,
        status: "COMPLETED",
        assessmentStatus: "ASSESSMENT_RECORDED",
        evidence: [],
      });
      qualityRepo.findQualityResultByInspectionId.mockResolvedValueOnce(null);

      (qualityRepo.createQualityResult as jest.Mock).mockRejectedValueOnce(
        new BadRequestException({
          type: "https://errors.idogrow.com/quality/result-already-exists",
          title: "Quality Decision Immutable",
          status: 400,
          detail: "A final quality decision has already been recorded for this inspection and is immutable.",
        }),
      );

      await expect(
        service.recordQualityDecision(inspectorUserId, mockInspection.id, {
          decision: "APPROVED",
          classificationLabel: "Standard Commercial Retting",
        }),
      ).rejects.toThrow(BadRequestException);

      // Exactly 1 attempt, no retry loop for result-already-exists
      expect(qualityRepo.createQualityResult).toHaveBeenCalledTimes(1);
      // Stored file compensated
      expect(storageService.delete).toHaveBeenCalledTimes(1);
    });
  });
});
