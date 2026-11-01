import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import { LogisticsService } from "./logistics.service";
import type {
  CloseShipmentInput,
  ConfirmDeliveryInput,
  CreateFreightRequestInput,
  CreateSettlementClaimInput,
  CreateSettlementInput,
  CreateShipmentInput,
  CustomsStatusInput,
  FreightQuotationSummary,
  LogisticsPartnerRequestSummary,
  LogisticsRequestSummary,
  MarkDisputedInput,
  MarkInTransitInput,
  MarkPickedUpInput,
  ReconcileCostsInput,
  RecordDiscrepancyInput,
  ReportDelayInput,
  ResolveDisputeInput,
  ResolveSettlementClaimInput,
  SchedulePickupInput,
  SelectCarrierInput,
  SettlementClaimSummary,
  SettlementDetail,
  SettlementDocumentSummary,
  ShipmentCollection,
  ShipmentCostReconciliationSummary,
  ShipmentDetail,
  ShipmentDiscrepancySummary,
  ShipmentDocumentSummary,
  ShipmentSummary,
  ShipmentTrackingEventSummary,
  SubmitFreightQuotationInput,
  UpdateSettlementInput,
  UpdateShipmentRequirementsInput,
} from "./logistics.contracts";

interface ResponseHeaders {
  set(headers: Record<string, string>): void;
}

@Controller()
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class LogisticsController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly logisticsService: LogisticsService,
  ) {}

  // ── Shipment Core endpoints ──────────────────────────────

  @Post("contracts/:contractId/shipments")
  async createShipment(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("contractId") contractId: string,
    @Body() body: CreateShipmentInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.createShipment(identity.userId, contractId, body);
  }

  @Get("shipments")
  async getShipments(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ShipmentCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getShipments(identity.userId);
  }

  @Get("shipments/:shipmentId")
  async getShipmentById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getShipmentById(identity.userId, shipmentId);
  }

  @Patch("shipments/:shipmentId/requirements")
  async updateShipmentRequirements(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: UpdateShipmentRequirementsInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.updateShipmentRequirements(
      identity.userId,
      shipmentId,
      body,
    );
  }

  // ── Freight Request endpoints ────────────────────────────

  @Post("shipments/:shipmentId/freight-requests")
  async createFreightRequests(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: CreateFreightRequestInput,
  ): Promise<LogisticsRequestSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.createFreightRequests(
      identity.userId,
      shipmentId,
      body,
    );
  }

  @Get("shipments/:shipmentId/freight-requests")
  async getFreightRequests(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
  ): Promise<LogisticsRequestSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getFreightRequestsForShipment(identity.userId, shipmentId);
  }

  // ── Freight Quotation endpoints ──────────────────────────

  @Post("shipments/:shipmentId/freight-quotations")
  async submitTraderManualQuotation(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: SubmitFreightQuotationInput & { logisticsRequestId: string },
  ): Promise<FreightQuotationSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.submitTraderManualQuotation(
      identity.userId,
      shipmentId,
      body.logisticsRequestId,
      body,
    );
  }

  @Get("shipments/:shipmentId/freight-quotations")
  async getFreightQuotations(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
  ): Promise<FreightQuotationSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getFreightQuotationsForShipment(identity.userId, shipmentId);
  }

  // ── Carrier Selection ────────────────────────────────────

  @Post("shipments/:shipmentId/select-carrier")
  async selectCarrier(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: SelectCarrierInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.selectCarrier(identity.userId, shipmentId, body);
  }

  // ── Block 03 Execution & Tracking Actions ────────────────

  @Post("shipments/:shipmentId/schedule-pickup")
  async schedulePickup(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: SchedulePickupInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.schedulePickup(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/mark-picked-up")
  async markPickedUp(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: MarkPickedUpInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.markPickedUp(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/mark-in-transit")
  async markInTransit(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: MarkInTransitInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.markInTransit(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/customs")
  async customsStatus(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: CustomsStatusInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.customsStatus(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/report-delay")
  async reportDelay(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: ReportDelayInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.reportDelay(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/confirm-delivery")
  async confirmDelivery(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: ConfirmDeliveryInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.confirmDelivery(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/discrepancies")
  async recordDiscrepancy(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: RecordDiscrepancyInput,
  ): Promise<ShipmentDiscrepancySummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.recordDiscrepancy(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/mark-disputed")
  async markDisputed(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: MarkDisputedInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.markDisputed(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/resolve-dispute")
  async resolveDispute(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: ResolveDisputeInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.resolveDispute(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/reconcile-costs")
  async reconcileCosts(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: ReconcileCostsInput,
  ): Promise<ShipmentCostReconciliationSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.reconcileCosts(identity.userId, shipmentId, body);
  }

  @Post("shipments/:shipmentId/close")
  async closeShipment(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body() body: CloseShipmentInput,
  ): Promise<ShipmentDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.closeShipment(identity.userId, shipmentId, body);
  }

  @Get("shipments/:shipmentId/tracking-events")
  async getTrackingEvents(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
  ): Promise<ShipmentTrackingEventSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getTrackingEvents(identity.userId, shipmentId);
  }

  // ── Shipping Documents ───────────────────────────────────

  @Post("shipments/:shipmentId/documents")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadShippingDocument(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Body("label") label: string,
    @Body("documentReference") documentReference: string | undefined,
    @UploadedFile() file: { originalname: string; buffer: Buffer; mimetype: string } | undefined,
  ): Promise<ShipmentDocumentSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    if (!file) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/missing-file",
        title: "File Required",
        status: 400,
        detail: "A valid file upload is required for shipping documents.",
      });
    }

    if (!label || !label.trim()) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/logistics/missing-label",
        title: "Label Required",
        status: 400,
        detail: "A label is required for shipping documents.",
      });
    }

    return this.logisticsService.uploadShippingDocument(
      identity.userId,
      shipmentId,
      file,
      label.trim(),
      documentReference?.trim(),
    );
  }

  @Get("shipments/:shipmentId/documents")
  async getShippingDocuments(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
  ): Promise<ShipmentDocumentSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getShippingDocuments(identity.userId, shipmentId);
  }

  @Get("shipments/:shipmentId/documents/:documentId")
  async downloadShippingDocumentDirect(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Param("documentId") documentId: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
  ): Promise<StreamableFile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const doc = await this.logisticsService.downloadShippingDocument(
      identity.userId,
      shipmentId,
      documentId,
    );

    res.set({
      "Content-Type": doc.file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.filename)}"`,
      "Content-Length": doc.file.fileSize.toString(),
    });

    return new StreamableFile(doc.file.stream);
  }

  @Get("shipments/:shipmentId/documents/:documentId/download")
  async downloadShippingDocument(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("shipmentId") shipmentId: string,
    @Param("documentId") documentId: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
  ): Promise<StreamableFile> {
    return this.downloadShippingDocumentDirect(cookieHeader, shipmentId, documentId, res);
  }

  // ── Logistics Partner Portal endpoints ───────────────────

  @Get("logistics/my-requests")
  async getMyRequests(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<LogisticsPartnerRequestSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getMyRequests(identity.userId);
  }

  @Get("logistics/my-requests/:requestId")
  async getMyRequestById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("requestId") requestId: string,
  ): Promise<LogisticsPartnerRequestSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getMyRequestById(identity.userId, requestId);
  }

  @Post("logistics/my-requests/:requestId/quotation")
  async submitProviderQuotation(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("requestId") requestId: string,
    @Body() body: SubmitFreightQuotationInput,
  ): Promise<FreightQuotationSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.submitFreightQuotation(
      identity.userId,
      requestId,
      body,
      false,
    );
  }

  @Get("logistics/my-active-shipments")
  async getMyActiveShipments(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ShipmentSummary[]> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getMyActiveShipments(identity.userId);
  }

  // ── Administrative Settlement endpoints ──────────────────

  @Post("trades/:tradeId/settlement")
  async createSettlement(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("tradeId") tradeId: string,
    @Body() body: CreateSettlementInput,
  ): Promise<SettlementDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.createSettlement(identity.userId, tradeId, body);
  }

  @Get("trades/:tradeId/settlement")
  async getSettlementByTradeId(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("tradeId") tradeId: string,
  ): Promise<SettlementDetail | null> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getSettlementByTradeId(identity.userId, tradeId);
  }

  @Get("settlements/:settlementId")
  async getSettlementById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("settlementId") settlementId: string,
  ): Promise<SettlementDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.getSettlementById(identity.userId, settlementId);
  }

  @Patch("settlements/:settlementId")
  async updateSettlement(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("settlementId") settlementId: string,
    @Body() body: UpdateSettlementInput,
  ): Promise<SettlementDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.updateSettlement(identity.userId, settlementId, body);
  }

  @Post("settlements/:settlementId/documents")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadSettlementDocument(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("settlementId") settlementId: string,
    @Body("documentType") documentType: "INVOICE" | "CREDIT_NOTE" | "PAYMENT_INSTRUCTION" | "CLAIM",
    @Body("label") label: string,
    @Body("documentReference") documentReference: string | undefined,
    @UploadedFile() file: { originalname: string; buffer: Buffer; mimetype: string } | undefined,
  ): Promise<SettlementDocumentSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    if (!file) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/missing-file",
        title: "File Required",
        status: 400,
        detail: "A valid file upload is required for settlement documents.",
      });
    }

    if (!documentType || !["INVOICE", "CREDIT_NOTE", "PAYMENT_INSTRUCTION", "CLAIM"].includes(documentType)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/settlement/invalid-document-type",
        title: "Invalid Document Type",
        status: 400,
        detail: "Document type must be INVOICE, CREDIT_NOTE, PAYMENT_INSTRUCTION, or CLAIM.",
      });
    }

    return this.logisticsService.uploadSettlementDocument(
      identity.userId,
      settlementId,
      file,
      documentType,
      documentReference?.trim(),
    );
  }

  @Get("settlements/:settlementId/documents/:documentId/download")
  async downloadSettlementDocument(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("settlementId") settlementId: string,
    @Param("documentId") documentId: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
  ): Promise<StreamableFile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const doc = await this.logisticsService.downloadSettlementDocument(
      identity.userId,
      settlementId,
      documentId,
    );

    res.set({
      "Content-Type": doc.file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.filename)}"`,
      "Content-Length": doc.file.fileSize.toString(),
    });

    return new StreamableFile(doc.file.stream);
  }

  @Post("settlements/:settlementId/claims")
  async createSettlementClaim(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("settlementId") settlementId: string,
    @Body() body: CreateSettlementClaimInput,
  ): Promise<SettlementClaimSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.createSettlementClaim(identity.userId, settlementId, body);
  }

  @Post("settlements/:settlementId/claims/:claimId/resolve")
  async resolveSettlementClaim(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("settlementId") settlementId: string,
    @Param("claimId") claimId: string,
    @Body() body: ResolveSettlementClaimInput,
  ): Promise<SettlementClaimSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.logisticsService.resolveSettlementClaim(
      identity.userId,
      settlementId,
      claimId,
      body,
    );
  }
}
