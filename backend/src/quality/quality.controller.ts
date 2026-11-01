import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Headers,
  UseFilters,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
type ResponseHeaders = { set(headers: Record<string, string>): void };
import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import {
  InspectionMethod,
  InspectionTemplateCollection,
  InspectionTemplateSummary,
  InspectionCollection,
  InspectionDetail,
  AssignableInspectorCollection,
  CreateInspectionInput,
  AssignInspectorInput,
  SaveMeasurementsInput,
  EvidenceType,
  InspectionEvidenceSummary,
  NonConformitySummary,
  RecordAssessmentInput,
  CreateNonConformityInput,
  ResolveNonConformityInput,
  RequestPhysicalInspectionInput,
  QualityResultSummary,
  InspectionCertificateSummary,
  QualityDecision,
} from "./contracts";
import { QualityService } from "./quality.service";

export class CreateInspectionDto implements CreateInspectionInput {
  tradeId!: string;
  templateId?: string;
  inspectionMethod!: InspectionMethod;
  externalLotReference?: string;
  scheduledAt?: string;
}

export class AssignInspectorDto implements AssignInspectorInput {
  inspectorUserId!: string;
  scheduledAt?: string;
}

export class SaveMeasurementsDto implements SaveMeasurementsInput {
  measurements!: Record<string, unknown>;
  latitude?: number;
  longitude?: number;
  measurementMethod?: string;
  equipmentUsed?: string;
  inspectorNotes?: string;
}

export class RecordAssessmentDto implements RecordAssessmentInput {
  assessmentSummary!: string;
  observedIssues?: string;
  recommendedFollowUp?: string;
}

export class CreateNonConformityDto implements CreateNonConformityInput {
  category!: string;
  description!: string;
}

export class ResolveNonConformityDto implements ResolveNonConformityInput {
  resolutionNotes!: string;
}

export class RequestPhysicalInspectionDto implements RequestPhysicalInspectionInput {
  reason!: string;
}


class RecordQualityDecisionDto {
  decision!: QualityDecision;
  classificationLabel!: string;
  decisionNotes?: string;
}

@Controller("quality")
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class QualityController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly qualityService: QualityService,
  ) {}

  @Get("inspection-templates")
  async getInspectionTemplates(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<InspectionTemplateCollection> {
    await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.qualityService.getTemplates();
  }

  @Get("inspection-templates/:id")
  async getInspectionTemplateById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<InspectionTemplateSummary> {
    await this.authentication.resolveIdentity(readSessionToken(cookieHeader));
    return this.qualityService.getTemplateById(id);
  }

  @Get("inspectors")
  async getAssignableInspectors(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<AssignableInspectorCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.getAssignableInspectors(identity.userId);
  }

  @Post("inspections")
  async createInspection(
    @Headers("cookie") cookieHeader: string | undefined,
    @Body() body: CreateInspectionDto,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.createInspection(identity.userId, body);
  }

  @Post("inspections/:id/assign")
  async assignInspector(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() body: AssignInspectorDto,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.assignInspector(identity.userId, id, body);
  }

  @Get("my-inspections")
  async getMyInspections(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<InspectionCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.getMyInspections(identity.userId);
  }

  @Get("inspections")
  async getAllInspections(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<InspectionCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.getAllInspections(identity.userId);
  }

  @Get("inspections/:id")
  async getInspectionById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.getInspectionById(identity.userId, id);
  }

  @Post("inspections/:id/start")
  async startInspection(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.startInspection(identity.userId, id);
  }

  @Patch("inspections/:id/measurements")
  async saveMeasurements(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() body: SaveMeasurementsDto,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.saveMeasurements(identity.userId, id, body);
  }

  @Post("inspections/:id/complete")
  async completeInspectionData(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.completeInspectionData(identity.userId, id);
  }

  @Post("inspections/:id/evidence")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadEvidence(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body("evidenceType") evidenceType: string,
    @Body("caption") caption: string | undefined,
    @Body("capturedAt") capturedAt: string | undefined,
    @UploadedFile() file: { originalname: string; buffer: Buffer; mimetype: string } | undefined,
  ): Promise<InspectionEvidenceSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    if (!file) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-file",
        title: "File Required",
        status: 400,
        detail: "A valid file upload is required for inspection evidence.",
      });
    }

    if (!evidenceType) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quality/missing-evidence-type",
        title: "Evidence Type Required",
        status: 400,
        detail: "Evidence type (PHOTO, DOCUMENT, LAB_REPORT) is required.",
      });
    }

    return this.qualityService.uploadEvidence(identity.userId, id, file, {
      evidenceType: evidenceType as EvidenceType,
      caption,
      capturedAt,
    });
  }

  @Get("inspections/:id/evidence/:evidenceId/file")
  async getEvidenceFile(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Param("evidenceId") evidenceId: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
  ): Promise<StreamableFile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const file = await this.qualityService.getEvidenceFile(
      identity.userId,
      id,
      evidenceId,
    );

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Content-Length": file.fileSize.toString(),
    });

    return new StreamableFile(file.stream);
  }

  @Post("inspections/:id/assessment")
  async recordAssessment(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() body: RecordAssessmentDto,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.recordAssessment(identity.userId, id, body);
  }

  @Post("inspections/:id/non-conformities")
  async createNonConformity(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() body: CreateNonConformityDto,
  ): Promise<NonConformitySummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.createNonConformity(identity.userId, id, body);
  }

  @Post("inspections/:id/non-conformities/:nonConformityId/resolve")
  async resolveNonConformity(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Param("nonConformityId") nonConformityId: string,
    @Body() body: ResolveNonConformityDto,
  ): Promise<NonConformitySummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.resolveNonConformity(
      identity.userId,
      id,
      nonConformityId,
      body,
    );
  }

  @Post("inspections/:id/physical-inspection")
  async requestPhysicalInspection(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() body: RequestPhysicalInspectionDto,
  ): Promise<InspectionDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.requestPhysicalInspection(identity.userId, id, body);
  }

  @Post("inspections/:id/decision")
  async recordQualityDecision(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() body: RecordQualityDecisionDto,
  ): Promise<QualityResultSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.recordQualityDecision(identity.userId, id, body);
  }

  @Get("inspections/:id/certificate")
  async getCertificateMetadata(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<InspectionCertificateSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.qualityService.getCertificateMetadata(identity.userId, id);
  }

  @Get("inspections/:id/certificate/file")
  async getCertificateFile(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
  ): Promise<StreamableFile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const file = await this.qualityService.getCertificateFile(
      identity.userId,
      id,
    );

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Content-Length": file.fileSize.toString(),
    });

    return new StreamableFile(file.stream);
  }
}
