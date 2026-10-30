import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  OnModuleInit,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AuditEventWriter } from "../audit";
import { OrganisationsRepository } from "../organisations/organisations.repository";
import { StorageService } from "../storage";
import {
  InspectionTemplateCollection,
  InspectionTemplateSummary,
  InspectionDetail,
  InspectionCollection,
  AssignableInspectorCollection,
  CreateInspectionInput,
  AssignInspectorInput,
  SaveMeasurementsInput,
  UploadEvidenceInput,
  RecordAssessmentInput,
  CreateNonConformityInput,
  ResolveNonConformityInput,
  RequestPhysicalInspectionInput,
  InspectionEvidenceSummary,
  NonConformitySummary,
  InspectionTemplateField,
  QualityResultSummary,
  InspectionCertificateSummary,
  RecordQualityDecisionInput,
  MAX_INSPECTION_EVIDENCE_BYTES,
} from "./contracts";
import { generateCertificatePdfBuffer, CertificateSnapshot } from "./certificate-generator";
import { QualityRepository } from "./quality.repository";

@Injectable()
export class QualityService implements OnModuleInit {
  constructor(
    private readonly qualityRepository: QualityRepository,
    private readonly organisationsRepository: OrganisationsRepository,
    private readonly auditWriter: AuditEventWriter,
    private readonly storageService: StorageService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.qualityRepository.ensureDefaultTemplate();
  }

  async getTemplates(): Promise<InspectionTemplateCollection> {
    const items = await this.qualityRepository.findActiveTemplates();
    return { items };
  }

  async getTemplateById(id: string): Promise<InspectionTemplateSummary> {
    const template = await this.qualityRepository.findTemplateById(id);
    if (!template) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/template-not-found",
        title: "Template Not Found",
        status: 404,
        detail: `Inspection template with ID '${id}' was not found.`,
      });
    }
    return template;
  }

  async getAssignableInspectors(userId: string): Promise<AssignableInspectorCollection> {
    const isTrader = await this.checkTraderMembership(userId);
    const user = await this.qualityRepository.findUserById(userId);
    const isInspector = user?.role === "QUALITY_INSPECTOR";

    if (!isTrader && !isInspector) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/trader-access-required",
        title: "Trader Access Required",
        status: 403,
        detail: "Only authenticated Trader operators can manage inspector assignments.",
      });
    }

    const items = await this.qualityRepository.findAssignableInspectors();
    return { items };
  }

  async createInspection(
    userId: string,
    input: CreateInspectionInput,
  ): Promise<InspectionDetail> {
    await this.assertTraderAccess(userId);

    const trade = await this.qualityRepository.findTradeById(input.tradeId);
    if (!trade) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/trade-not-found",
        title: "Trade Not Found",
        status: 404,
        detail: `Trade with ID '${input.tradeId}' was not found.`,
      });
    }

    let template: InspectionTemplateSummary | null = null;
    if (input.templateId) {
      template = await this.qualityRepository.findTemplateById(input.templateId);
    } else {
      template = await this.qualityRepository.findTemplateByKeyAndVersion(
        "HEMP_STRAW_STANDARD",
        1,
      );
    }

    if (!template) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/template-not-found",
        title: "Template Not Found",
        status: 404,
        detail: "No active inspection template could be resolved for this material.",
      });
    }

    const supportedMethods = [
      "REMOTE",
      "AI_ASSISTED",
      "SUPPLIER_SELF_REPORTED",
      "LOCAL_AGENT_VERIFIED",
      "INDEPENDENT_PHYSICAL_INSPECTION",
      "LABORATORY_TESTED",
    ];

    if (!supportedMethods.includes(input.inspectionMethod)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-method",
        title: "Invalid Inspection Method",
        status: 400,
        detail: `Inspection method '${input.inspectionMethod}' is not supported.`,
      });
    }

    const inspectionReference = this.generateInspectionReference();

    const inspection = await this.qualityRepository.createInspection({
      inspectionReference,
      templateId: template.id,
      templateVersion: template.version,
      tradeId: trade.id,
      listingId: trade.listingId,
      externalLotReference: input.externalLotReference?.trim() || null,
      buyerOrganisationId: trade.buyerOrganisationId,
      supplierOrganisationId: trade.supplierOrganisationId,
      assignedInspectorUserId: null,
      inspectionMethod: input.inspectionMethod,
      status: "DRAFT",
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      createdByUserId: userId,
    });

    await this.auditWriter.append({
      eventType: "quality.inspection.created",
      outcome: "succeeded",
      occurredAt: new Date(),
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspection.id },
      metadata: {
        inspectionReference: inspection.inspectionReference,
        tradeId: trade.id,
        tradeNumber: trade.tradeNumber,
        templateKey: template.templateKey,
        templateVersion: String(template.version),
        inspectionMethod: inspection.inspectionMethod,
        status: inspection.status,
      },
    });

    return inspection;
  }

  async assignInspector(
    userId: string,
    inspectionId: string,
    input: AssignInspectorInput,
  ): Promise<InspectionDetail> {
    await this.assertTraderAccess(userId);

    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    if (inspection.status === "COMPLETED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-lifecycle-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: "Cannot reassign an inspection that is already completed.",
      });
    }

    if (inspection.status === "IN_PROGRESS") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-lifecycle-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: "Cannot reassign an inspection that is already in progress.",
      });
    }

    if (inspection.status !== "DRAFT" && inspection.status !== "ASSIGNED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-lifecycle-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: `Cannot assign inspector from status '${inspection.status}'.`,
      });
    }

    const assignedUser = await this.qualityRepository.findUserById(
      input.inspectorUserId,
    );

    if (!assignedUser) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspector-not-found",
        title: "Inspector Not Found",
        status: 404,
        detail: `User with ID '${input.inspectorUserId}' was not found.`,
      });
    }

    if (!assignedUser.isActive) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/inspector-inactive",
        title: "Inspector Inactive",
        status: 400,
        detail: "Assigned user is inactive and cannot accept inspection assignments.",
      });
    }

    if (assignedUser.role !== "QUALITY_INSPECTOR") {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/invalid-inspector-role",
        title: "Invalid Inspector Role",
        status: 403,
        detail: `Assigned user '${assignedUser.email}' does not possess the Quality Inspector role.`,
      });
    }

    const updated = await this.qualityRepository.updateInspection(inspectionId, {
      assignedInspectorUserId: input.inspectorUserId,
      status: "ASSIGNED",
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
    });

    await this.auditWriter.append({
      eventType: "quality.inspection.assigned",
      outcome: "succeeded",
      occurredAt: new Date(),
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: updated.inspectionReference,
        tradeId: updated.tradeId || "",
        inspectorUserId: input.inspectorUserId,
        status: updated.status,
      },
    });

    return updated;
  }

  async getMyInspections(userId: string): Promise<InspectionCollection> {
    const user = await this.qualityRepository.findUserById(userId);
    const isTrader = await this.checkTraderMembership(userId);

    if (user?.role !== "QUALITY_INSPECTOR" && !isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/inspector-access-required",
        title: "Quality Inspector Access Required",
        status: 403,
        detail: "Only users with the Quality Inspector role can access the inspector work queue.",
      });
    }

    const items = await this.qualityRepository.findInspectionsForInspector(userId);
    return { items };
  }

  async getAllInspections(userId: string): Promise<InspectionCollection> {
    await this.assertTraderAccess(userId);
    const items = await this.qualityRepository.findAllInspections();
    return { items };
  }

  async getInspectionById(
    userId: string,
    inspectionId: string,
  ): Promise<InspectionDetail> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    // Strict access: Trader or assigned inspector ONLY.
    // External counterparties (Buyer, Supplier) and other inspectors are denied.
    const isTrader = await this.checkTraderMembership(userId);
    const isAssignedInspector = inspection.assignedInspector?.id === userId;

    if (!isTrader && !isAssignedInspector) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/inspection-access-denied",
        title: "Access Denied",
        status: 403,
        detail: "You do not have authorization to view this inspection.",
      });
    }

    return inspection;
  }

  async startInspection(
    userId: string,
    inspectionId: string,
  ): Promise<InspectionDetail> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    await this.assertAssignedActiveInspector(userId, inspection);

    if (inspection.status === "COMPLETED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-lifecycle-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: "Inspection has already been completed.",
      });
    }

    const updated = await this.qualityRepository.updateInspection(inspectionId, {
      status: "IN_PROGRESS",
      startedAt: inspection.startedAt ? undefined : new Date(),
    });

    await this.auditWriter.append({
      eventType: "quality.inspection.started",
      outcome: "succeeded",
      occurredAt: new Date(),
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: updated.inspectionReference,
        tradeId: updated.tradeId || "",
        status: "IN_PROGRESS",
      },
    });

    return updated;
  }

  async saveMeasurements(
    userId: string,
    inspectionId: string,
    input: SaveMeasurementsInput,
  ): Promise<InspectionDetail> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    await this.assertAssignedActiveInspector(userId, inspection);

    if (inspection.status === "COMPLETED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-lifecycle-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: "Inspection data entry is already completed and cannot be modified.",
      });
    }

    // Validate measurements against template fields
    this.validateMeasurementValues(input.measurements, inspection.templateFields);

    const mergedMeasurements = {
      ...inspection.measurements,
      ...input.measurements,
    };

    const updated = await this.qualityRepository.updateInspection(inspectionId, {
      status: "IN_PROGRESS",
      startedAt: inspection.startedAt ? undefined : new Date(),
      measurements: mergedMeasurements,
      latitude: input.latitude,
      longitude: input.longitude,
      measurementMethod: input.measurementMethod,
      equipmentUsed: input.equipmentUsed,
      inspectorNotes: input.inspectorNotes,
    });

    await this.auditWriter.append({
      eventType: "quality.measurements.updated",
      outcome: "succeeded",
      occurredAt: new Date(),
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: updated.inspectionReference,
        tradeId: updated.tradeId || "",
        status: updated.status,
        updatedFieldsCount: String(Object.keys(input.measurements).length),
      },
    });

    return updated;
  }

  async completeInspectionData(
    userId: string,
    inspectionId: string,
  ): Promise<InspectionDetail> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    await this.assertAssignedActiveInspector(userId, inspection);

    if (inspection.status === "COMPLETED") {
      return inspection;
    }

    if (inspection.status !== "IN_PROGRESS") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-lifecycle-transition",
        title: "Invalid Status Transition",
        status: 400,
        detail: "Inspection must be IN_PROGRESS before data completion.",
      });
    }

    // Verify all required template fields are present
    const missingFields: string[] = [];
    for (const field of inspection.templateFields) {
      if (field.required) {
        const val = inspection.measurements[field.name];
        if (
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "")
        ) {
          missingFields.push(field.label);
        }
      }
    }

    if (missingFields.length > 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-required-measurements",
        title: "Missing Required Measurements",
        status: 400,
        detail: `Cannot complete inspection data. The following required measurements are missing: ${missingFields.join(", ")}.`,
      });
    }

    const now = new Date();
    const updated = await this.qualityRepository.updateInspection(inspectionId, {
      status: "COMPLETED",
      completedAt: now,
    });

    await this.auditWriter.append({
      eventType: "quality.inspection.completed",
      outcome: "succeeded",
      occurredAt: now,
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: updated.inspectionReference,
        tradeId: updated.tradeId || "",
        status: "COMPLETED",
        completedAt: now.toISOString(),
      },
    });

    return updated;
  }

  async uploadEvidence(
    userId: string,
    inspectionId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
    input: UploadEvidenceInput,
  ): Promise<InspectionEvidenceSummary> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isAssigned = inspection.assignedInspector?.id === userId;
    if (!isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/evidence-upload-denied",
        title: "Evidence Upload Denied",
        status: 403,
        detail: "Only the assigned Quality Inspector can upload inspection evidence.",
      });
    }
    await this.assertAssignedActiveInspector(userId, inspection);

    if (inspection.status === "COMPLETED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/inspection-completed",
        title: "Inspection Completed",
        status: 400,
        detail: "Cannot upload evidence to an inspection that is already completed.",
      });
    }

    if (file.buffer.length > MAX_INSPECTION_EVIDENCE_BYTES) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/file-too-large",
        title: "File Too Large",
        status: 400,
        detail: `File size exceeds 10MB limit (got ${(file.buffer.length / 1024 / 1024).toFixed(2)}MB).`,
      });
    }

    const validEvidenceTypes = ["PHOTO", "DOCUMENT", "LAB_REPORT"];
    if (!validEvidenceTypes.includes(input.evidenceType)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-evidence-type",
        title: "Invalid Evidence Type",
        status: 400,
        detail: `Evidence type '${input.evidenceType}' is not supported. Must be PHOTO, DOCUMENT, or LAB_REPORT.`,
      });
    }

    // Strict evidence-type & MIME agreement
    if (input.evidenceType === "PHOTO") {
      const allowedImageMimes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedImageMimes.includes(file.mimetype)) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/quality/invalid-photo-mime",
          title: "Invalid Photo MIME Type",
          status: 400,
          detail: `PHOTO evidence must be an image file (JPEG, PNG, WEBP). Received '${file.mimetype}'.`,
        });
      }
    } else if (input.evidenceType === "DOCUMENT") {
      const allowedDocMimes = ["application/pdf"];
      if (!allowedDocMimes.includes(file.mimetype)) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/quality/invalid-document-mime",
          title: "Invalid Document MIME Type",
          status: 400,
          detail: `DOCUMENT evidence must be a PDF file. Received '${file.mimetype}'.`,
        });
      }
    } else if (input.evidenceType === "LAB_REPORT") {
      if (file.mimetype !== "application/pdf") {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/quality/invalid-lab-report-mime",
          title: "Invalid Lab Report MIME Type",
          status: 400,
          detail: `LAB_REPORT evidence must be a PDF file. Received '${file.mimetype}'.`,
        });
      }
    }

    let parsedCapturedAt: Date | null = null;
    if (input.capturedAt) {
      const timestamp = Date.parse(input.capturedAt);
      if (isNaN(timestamp)) {
        throw new BadRequestException({
          type: "https://errors.idogrow.com/quality/invalid-captured-at-date",
          title: "Invalid Captured Date",
          status: 400,
          detail: `capturedAt value '${input.capturedAt}' is not a valid ISO date.`,
        });
      }
      parsedCapturedAt = new Date(timestamp);
    }

    // Store file via established storage service with rollback compensation
    const stored = await this.storageService.store(
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    let evidence: InspectionEvidenceSummary;
    try {
      evidence = await this.qualityRepository.createEvidence(
        {
          inspectionId,
          evidenceType: input.evidenceType,
          originalFilename: stored.originalFilename,
          storageKey: stored.storageKey,
          mimeType: stored.mimeType,
          fileSize: stored.fileSize,
          caption: input.caption?.trim() || null,
          capturedAt: parsedCapturedAt,
          uploadedByUserId: userId,
        },
        async (txDb, ev) => {
          await this.auditWriter.append(
            {
              eventType: "quality.evidence.uploaded",
              outcome: "succeeded",
              occurredAt: new Date(),
              correlationId: randomUUID(),
              actor: { type: "user", userId },
              target: { type: "inspection", id: inspectionId },
              metadata: {
                inspectionReference: inspection.inspectionReference,
                evidenceId: ev.id,
                evidenceType: ev.evidenceType,
                storageKey: ev.storageKey,
                originalFilename: ev.originalFilename,
                mimeType: ev.mimeType,
                fileSize: String(ev.fileSize),
              },
            },
            txDb,
          );
        },
      );
    } catch (err) {
      try {
        await this.storageService.delete(stored.storageKey);
      } catch (cleanupErr) {
        console.error(
          `Failed to clean up stored evidence file '${stored.storageKey}':`,
          cleanupErr,
        );
      }
      throw err;
    }

    return evidence;
  }

  async getEvidenceFile(
    userId: string,
    inspectionId: string,
    evidenceId: string,
  ) {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isTrader = await this.checkTraderMembership(userId);
    const isAssigned = inspection.assignedInspector?.id === userId;

    if (!isTrader && !isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/evidence-access-denied",
        title: "Access Denied",
        status: 403,
        detail: "You do not have authorization to view this evidence.",
      });
    }

    const evidence = await this.qualityRepository.findEvidenceById(evidenceId);
    if (!evidence || evidence.inspectionId !== inspectionId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/evidence-not-found",
        title: "Evidence Not Found",
        status: 404,
        detail: `Evidence item with ID '${evidenceId}' was not found.`,
      });
    }

    const retrieved = await this.storageService.retrieve(
      evidence.storageKey,
      evidence.originalFilename,
      evidence.mimeType,
    );

    if (!retrieved) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/file-not-found",
        title: "File Not Found",
        status: 404,
        detail: "Underlying stored file could not be retrieved.",
      });
    }

    return retrieved;
  }

  async recordAssessment(
    userId: string,
    inspectionId: string,
    input: RecordAssessmentInput,
  ): Promise<InspectionDetail> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isAssigned = inspection.assignedInspector?.id === userId;
    if (!isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/assessment-denied",
        title: "Assessment Denied",
        status: 403,
        detail: "Only the assigned Quality Inspector can record a preliminary assessment.",
      });
    }
    await this.assertAssignedActiveInspector(userId, inspection);

    if (inspection.status === "DRAFT") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-lifecycle-transition",
        title: "Invalid Lifecycle State",
        status: 400,
        detail: "Cannot record assessment while inspection is in DRAFT status.",
      });
    }

    if (!input.assessmentSummary || input.assessmentSummary.trim() === "") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-assessment-summary",
        title: "Missing Assessment Summary",
        status: 400,
        detail: "A preliminary assessment summary is required.",
      });
    }

    const now = new Date();
    const updated = await this.qualityRepository.updateAssessment(inspectionId, {
      assessmentStatus: "ASSESSMENT_RECORDED",
      assessmentSummary: input.assessmentSummary.trim(),
      observedIssues: input.observedIssues?.trim() || null,
      recommendedFollowUp: input.recommendedFollowUp?.trim() || null,
      assessedAt: now,
      assessedByUserId: userId,
    });

    await this.auditWriter.append({
      eventType: "quality.assessment.recorded",
      outcome: "succeeded",
      occurredAt: now,
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: updated.inspectionReference,
        assessmentStatus: updated.assessmentStatus,
        assessedAt: now.toISOString(),
      },
    });

    return updated;
  }

  async createNonConformity(
    userId: string,
    inspectionId: string,
    input: CreateNonConformityInput,
  ): Promise<NonConformitySummary> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isTrader = await this.checkTraderMembership(userId);
    const isAssigned = inspection.assignedInspector?.id === userId;

    if (!isTrader && !isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/non-conformity-denied",
        title: "Action Denied",
        status: 403,
        detail: "Only the assigned Quality Inspector or Trader can log a non-conformity.",
      });
    }

    if (!isTrader) {
      await this.assertAssignedActiveInspector(userId, inspection);
    }

    if (!input.category || input.category.trim() === "") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-category",
        title: "Missing Category",
        status: 400,
        detail: "A non-conformity category is required.",
      });
    }

    if (!input.description || input.description.trim() === "") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-description",
        title: "Missing Description",
        status: 400,
        detail: "A non-conformity description is required.",
      });
    }

    const record = await this.qualityRepository.createNonConformity({
      inspectionId,
      reportedByUserId: userId,
      category: input.category.trim(),
      description: input.description.trim(),
      status: "OPEN",
    });

    await this.auditWriter.append({
      eventType: "quality.non_conformity.created",
      outcome: "succeeded",
      occurredAt: new Date(),
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: inspection.inspectionReference,
        nonConformityId: record.id,
        category: record.category,
      },
    });

    return record;
  }

  async resolveNonConformity(
    userId: string,
    inspectionId: string,
    nonConformityId: string,
    input: ResolveNonConformityInput,
  ): Promise<NonConformitySummary> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isTrader = await this.checkTraderMembership(userId);
    const isAssigned = inspection.assignedInspector?.id === userId;

    if (!isTrader && !isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/action-denied",
        title: "Action Denied",
        status: 403,
        detail: "Only the assigned Quality Inspector or Trader can resolve a non-conformity.",
      });
    }

    if (!isTrader) {
      await this.assertAssignedActiveInspector(userId, inspection);
    }

    const nc = await this.qualityRepository.findNonConformityById(nonConformityId);
    if (!nc || nc.inspectionId !== inspectionId) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/non-conformity-not-found",
        title: "Non-Conformity Not Found",
        status: 404,
        detail: `Non-conformity with ID '${nonConformityId}' was not found.`,
      });
    }

    if (nc.status === "RESOLVED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/non-conformity-already-resolved",
        title: "Non-Conformity Already Resolved",
        status: 400,
        detail: "This non-conformity has already been resolved and cannot be resolved again.",
      });
    }

    if (!input.resolutionNotes || input.resolutionNotes.trim() === "") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-resolution-notes",
        title: "Missing Resolution Notes",
        status: 400,
        detail: "Resolution notes are required to resolve a non-conformity.",
      });
    }

    const now = new Date();
    const updated = await this.qualityRepository.updateNonConformity(
      nonConformityId,
      {
        status: "RESOLVED",
        resolutionNotes: input.resolutionNotes.trim(),
        resolvedAt: now,
        resolvedByUserId: userId,
      },
    );

    await this.auditWriter.append({
      eventType: "quality.non_conformity.resolved",
      outcome: "succeeded",
      occurredAt: now,
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: inspection.inspectionReference,
        nonConformityId: updated.id,
        resolvedAt: now.toISOString(),
      },
    });

    return updated;
  }

  async requestPhysicalInspection(
    userId: string,
    inspectionId: string,
    input: RequestPhysicalInspectionInput,
  ): Promise<InspectionDetail> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isTrader = await this.checkTraderMembership(userId);
    const isAssigned = inspection.assignedInspector?.id === userId;

    if (!isTrader && !isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/action-denied",
        title: "Action Denied",
        status: 403,
        detail: "Only the assigned Quality Inspector or Trader can request physical inspection escalation.",
      });
    }

    if (!isTrader) {
      await this.assertAssignedActiveInspector(userId, inspection);
    }

    if (!input.reason || input.reason.trim() === "") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-reason",
        title: "Missing Reason",
        status: 400,
        detail: "A reason is required to request physical inspection escalation.",
      });
    }

    const updated = await this.qualityRepository.updatePhysicalInspection(
      inspectionId,
      {
        physicalInspectionRequired: true,
        physicalInspectionReason: input.reason.trim(),
      },
    );

    await this.auditWriter.append({
      eventType: "quality.physical_inspection.requested",
      outcome: "succeeded",
      occurredAt: new Date(),
      correlationId: randomUUID(),
      actor: { type: "user", userId },
      target: { type: "inspection", id: inspectionId },
      metadata: {
        inspectionReference: updated.inspectionReference,
        reason: input.reason.trim(),
      },
    });

    return updated;
  }

  private async assertAssignedActiveInspector(
    userId: string,
    inspection: InspectionDetail,
  ): Promise<void> {
    if (inspection.assignedInspector?.id !== userId) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/not-assigned-inspector",
        title: "Not Assigned Inspector",
        status: 403,
        detail: "Only the assigned Quality Inspector can perform this action.",
      });
    }

    const user = await this.qualityRepository.findUserById(userId);
    if (!user || !user.isActive || user.role !== "QUALITY_INSPECTOR") {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/inspector-not-authorized",
        title: "Inspector Not Authorized",
        status: 403,
        detail: "User is not an active Quality Inspector.",
      });
    }
  }

  private validateMeasurementValues(
    measurements: Record<string, unknown>,
    templateFields: readonly InspectionTemplateField[],
  ): void {
    if (!measurements || typeof measurements !== "object") return;

    for (const [key, value] of Object.entries(measurements)) {
      if (value === null || value === undefined || value === "") continue;

      const field = templateFields.find((f) => f.name === key);
      if (!field) continue;

      if (field.type === "NUMERIC") {
        const num = Number(value);
        if (isNaN(num)) {
          throw new BadRequestException({
            type: "https://errors.idogrow.com/quality/invalid-measurement",
            title: "Invalid Numeric Value",
            status: 400,
            detail: `Field '${field.label}' must be a valid number.`,
          });
        }
        if (field.min !== undefined && num < field.min) {
          throw new BadRequestException({
            type: "https://errors.idogrow.com/quality/invalid-measurement",
            title: "Value Below Minimum",
            status: 400,
            detail: `Field '${field.label}' cannot be less than ${field.min}.`,
          });
        }
        if (field.max !== undefined && num > field.max) {
          throw new BadRequestException({
            type: "https://errors.idogrow.com/quality/invalid-measurement",
            title: "Value Above Maximum",
            status: 400,
            detail: `Field '${field.label}' cannot exceed ${field.max}.`,
          });
        }
      } else if (field.type === "BOOLEAN") {
        if (typeof value !== "boolean" && value !== "true" && value !== "false") {
          throw new BadRequestException({
            type: "https://errors.idogrow.com/quality/invalid-measurement",
            title: "Invalid Boolean Value",
            status: 400,
            detail: `Field '${field.label}' must be a boolean (true/false).`,
          });
        }
      }
    }
  }

  private async assertTraderAccess(userId: string): Promise<void> {
    const isTrader = await this.checkTraderMembership(userId);
    if (!isTrader) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/trader-access-required",
        title: "Trader Access Required",
        status: 403,
        detail: "Only authenticated Trader organisations can manage quality inspections.",
      });
    }
  }

  private async checkTraderMembership(userId: string): Promise<boolean> {
    const memberships =
      await this.organisationsRepository.findMembershipsForUser(userId);
    return (
      memberships?.some(
        (m) => m.organisation.organisationType.toUpperCase() === "TRADER",
      ) ?? false
    );
  }

  private generateInspectionReference(): string {
    const d = new Date();
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INS-${dateStr}-${rand}`;
  }

  async recordQualityDecision(
    userId: string,
    inspectionId: string,
    input: RecordQualityDecisionInput,
  ): Promise<QualityResultSummary> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isAssigned = inspection.assignedInspector?.id === userId;
    if (!isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/decision-denied",
        title: "Quality Decision Denied",
        status: 403,
        detail: "Only the assigned Quality Inspector can record the final quality decision.",
      });
    }

    await this.assertAssignedActiveInspector(userId, inspection);

    if (inspection.status !== "COMPLETED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/inspection-not-completed",
        title: "Inspection Not Completed",
        status: 400,
        detail: "Final quality decision requires the inspection to be COMPLETED.",
      });
    }

    if (inspection.assessmentStatus !== "ASSESSMENT_RECORDED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/assessment-required",
        title: "Preliminary Assessment Required",
        status: 400,
        detail: "A preliminary human assessment must be recorded before final quality decision.",
      });
    }

    const existingResult = await this.qualityRepository.findQualityResultByInspectionId(inspectionId);
    if (existingResult) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/result-already-exists",
        title: "Quality Decision Immutable",
        status: 400,
        detail: "A final quality decision has already been recorded for this inspection and is immutable.",
      });
    }

    if (input.decision !== "APPROVED" && input.decision !== "REJECTED") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/invalid-decision",
        title: "Invalid Decision",
        status: 400,
        detail: "Decision must be either 'APPROVED' or 'REJECTED'.",
      });
    }

    if (!input.classificationLabel || input.classificationLabel.trim() === "") {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-classification-label",
        title: "Missing Classification Label",
        status: 400,
        detail: "A classification label is required.",
      });
    }

    const now = new Date();
    const classificationLabel = input.classificationLabel.trim();
    const decisionNotes = input.decisionNotes?.trim() || null;

    if (input.decision === "APPROVED") {
      const MAX_CERT_ATTEMPTS = 3;
      let lastErr: unknown;

      for (let attempt = 1; attempt <= MAX_CERT_ATTEMPTS; attempt++) {
        const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
        const shortSuffix = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
        const certificateNumber = `QIC-${yyyymmdd}-${shortSuffix}`;

        const snapshot: CertificateSnapshot = {
          certificateNumber,
          inspectionReference: inspection.inspectionReference,
          tradeNumber: inspection.tradeNumber,
          supplierName: inspection.supplierOrganisation?.name || null,
          buyerName: inspection.buyerOrganisation?.name || null,
          materialType: inspection.materialType,
          productForm: inspection.productForm,
          quantity: inspection.quantity,
          quantityUnit: inspection.quantityUnit,
          inspectionMethod: inspection.inspectionMethod,
          inspectorEmail: inspection.assignedInspector?.email || null,
          completedAt: inspection.completedAt,
          templateName: inspection.templateName,
          templateVersion: inspection.templateVersion,
          measurements: inspection.measurements,
          evidenceCount: inspection.evidence.length,
          preliminaryAssessmentSummary: inspection.assessmentSummary,
          observedIssues: inspection.observedIssues,
          recommendedFollowUp: inspection.recommendedFollowUp,
          classificationLabel,
          decision: "APPROVED",
          decisionNotes,
          issuedAt: now.toISOString(),
        };

        const pdfBuffer = generateCertificatePdfBuffer(snapshot);
        const filename = `${certificateNumber}.pdf`;
        const stored = await this.storageService.store(
          filename,
          pdfBuffer,
          "application/pdf",
        );

        let created: {
          qualityResult: QualityResultSummary;
          certificate?: InspectionCertificateSummary;
        };

        try {
          created = await this.qualityRepository.createQualityResult(
            {
              inspectionId,
              tradeId: inspection.tradeId,
              decision: "APPROVED",
              classificationLabel,
              decisionNotes,
              decidedByUserId: userId,
              decidedAt: now,
            },
            {
              certificateNumber,
              storageKey: stored.storageKey,
              snapshotData: snapshot as unknown as Record<string, unknown>,
              issuedByUserId: userId,
              issuedAt: now,
            },
            async (txDb, ctx) => {
              await this.auditWriter.append(
                {
                  eventType: "quality.result.approved",
                  outcome: "succeeded",
                  occurredAt: now,
                  correlationId: randomUUID(),
                  actor: { type: "user", userId },
                  target: { type: "inspection", id: inspectionId },
                  metadata: {
                    inspectionReference: inspection.inspectionReference,
                    tradeId: inspection.tradeId || "",
                    qualityResultId: ctx.qualityResult.id,
                    classificationLabel: ctx.qualityResult.classificationLabel,
                    decision: "APPROVED",
                  },
                },
                txDb,
              );

              if (ctx.certificate) {
                await this.auditWriter.append(
                  {
                    eventType: "quality.certificate.issued",
                    outcome: "succeeded",
                    occurredAt: now,
                    correlationId: randomUUID(),
                    actor: { type: "user", userId },
                    target: { type: "inspection", id: inspectionId },
                    metadata: {
                      inspectionReference: inspection.inspectionReference,
                      tradeId: inspection.tradeId || "",
                      qualityResultId: ctx.qualityResult.id,
                      certificateId: ctx.certificate.id,
                      certificateNumber: ctx.certificate.certificateNumber,
                      storageKey: ctx.certificate.storageKey || "",
                    },
                  },
                  txDb,
                );
              }
            },
          );
        } catch (err) {
          try {
            await this.storageService.delete(stored.storageKey);
          } catch (cleanupErr) {
            console.error(
              `Failed to clean up stored certificate file '${stored.storageKey}':`,
              cleanupErr,
            );
          }

          const isCertCollision =
            err instanceof ConflictException ||
            (typeof err === "object" &&
              err !== null &&
              "response" in err &&
              typeof (err as { response?: unknown }).response === "object" &&
              typeof (err as { response?: { type?: string } }).response?.type === "string" &&
              ((err as { response?: { type?: string } }).response?.type?.includes("certificate-reference-collision") ?? false));

          if (isCertCollision && attempt < MAX_CERT_ATTEMPTS) {
            lastErr = err;
            continue;
          }
          throw err;
        }

        return {
          ...created.qualityResult,
          certificateId: created.certificate?.id || null,
          certificateNumber: created.certificate?.certificateNumber || null,
        };
      }

      throw lastErr;
    } else {
      const created = await this.qualityRepository.createQualityResult(
        {
          inspectionId,
          tradeId: inspection.tradeId,
          decision: "REJECTED",
          classificationLabel,
          decisionNotes,
          decidedByUserId: userId,
          decidedAt: now,
        },
        undefined,
        async (txDb, ctx) => {
          await this.auditWriter.append(
            {
              eventType: "quality.result.rejected",
              outcome: "succeeded",
              occurredAt: now,
              correlationId: randomUUID(),
              actor: { type: "user", userId },
              target: { type: "inspection", id: inspectionId },
              metadata: {
                inspectionReference: inspection.inspectionReference,
                tradeId: inspection.tradeId || "",
                qualityResultId: ctx.qualityResult.id,
                classificationLabel: ctx.qualityResult.classificationLabel,
                decision: "REJECTED",
                decisionNotes: ctx.qualityResult.decisionNotes || "",
              },
            },
            txDb,
          );
        },
      );

      return created.qualityResult;
    }
  }

  async getCertificateMetadata(
    userId: string,
    inspectionId: string,
  ): Promise<InspectionCertificateSummary> {
    const inspection = await this.qualityRepository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/inspection-not-found",
        title: "Inspection Not Found",
        status: 404,
        detail: `Inspection task with ID '${inspectionId}' was not found.`,
      });
    }

    const isTrader = await this.checkTraderMembership(userId);
    const isAssigned = inspection.assignedInspector?.id === userId;

    if (!isTrader && !isAssigned) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/quality/certificate-access-denied",
        title: "Access Denied",
        status: 403,
        detail: "You do not have authorization to view this certificate.",
      });
    }

    const cert = await this.qualityRepository.findCertificateByInspectionId(inspectionId);
    if (!cert) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/certificate-not-found",
        title: "Certificate Not Found",
        status: 404,
        detail: "No certificate has been issued for this inspection.",
      });
    }

    return cert;
  }

  async getCertificateFile(
    userId: string,
    inspectionId: string,
  ) {
    const cert = await this.getCertificateMetadata(userId, inspectionId);
    if (!cert.storageKey) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/certificate-file-missing",
        title: "Certificate File Missing",
        status: 404,
        detail: "Certificate document storage reference is not available.",
      });
    }

    const retrieved = await this.storageService.retrieve(
      cert.storageKey,
      `${cert.certificateNumber}.pdf`,
      "application/pdf",
    );

    if (!retrieved) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/quality/file-not-found",
        title: "File Not Found",
        status: 404,
        detail: "Underlying certificate PDF file could not be retrieved.",
      });
    }

    return retrieved;
  }
}
