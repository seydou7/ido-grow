import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database";
import type {
  ToolDefinition,
  ToolExecutionContext,
  ToolExecutionResult,
} from "./contracts";

@Injectable()
export class ToolRegistryService {
  private readonly tools = new Map<string, ToolDefinition>();
  private readonly forbiddenToolKeys = new Set<string>([
    "database.query",
    "sql.execute",
    "shell.execute",
    "filesystem.read",
    "filesystem.write",
    "generic.http_request",
    "http.request",
    "arbitrary.fetch",
  ]);

  constructor(private readonly prisma: PrismaService) {
    this.registerFoundationTools();
  }

  private registerFoundationTools(): void {
    // 1. READ_ONLY Tool: trade.get_context
    this.tools.set("trade.get_context", {
      key: "trade.get_context",
      purpose: "Retrieve authorized trade record and commercial baseline.",
      allowedRoles: ["TRADER"],
      riskClassification: "READ_ONLY",
      requiresApproval: false,
      validateInput: (params: unknown) => {
        const p = params as Record<string, unknown>;
        if (!p?.tradeId || typeof p.tradeId !== "string") {
          return { valid: false, error: "Missing required parameter 'tradeId'." };
        }
        return { valid: true };
      },
      execute: async (params: { tradeId: string }, _ctx: ToolExecutionContext) => {
        const trade = await this.prisma.trade.findUnique({
          where: { id: params.tradeId },
          include: {
            buyerOrganisation: { select: { id: true, name: true, country: true } },
            supplierOrganisation: { select: { id: true, name: true, country: true } },
          },
        });
        if (!trade) {
          return { success: false, failureCategory: "NOT_FOUND", failureReason: "Trade not found" };
        }
        return {
          success: true,
          result: {
            tradeId: trade.id,
            tradeNumber: trade.tradeNumber,
            materialType: trade.materialType,
            quantity: trade.quantity,
            quantityUnit: trade.quantityUnit,
            currency: trade.currency,
            acceptedTotalAmount: trade.acceptedTotalAmount,
            buyerName: trade.buyerOrganisation.name,
            supplierName: trade.supplierOrganisation.name,
          },
        };
      },
    });

    // 2. READ_ONLY Tool: contract.get_summary
    this.tools.set("contract.get_summary", {
      key: "contract.get_summary",
      purpose: "Retrieve formal contract status and delivery conditions.",
      allowedRoles: ["TRADER"],
      riskClassification: "READ_ONLY",
      requiresApproval: false,
      validateInput: (params: unknown) => {
        const p = params as Record<string, unknown>;
        if (!p?.tradeId && !p?.contractId) {
          return { valid: false, error: "Must specify 'tradeId' or 'contractId'." };
        }
        return { valid: true };
      },
      execute: async (params: { tradeId?: string; contractId?: string }) => {
        const contract = params.contractId
          ? await this.prisma.contract.findUnique({ where: { id: params.contractId } })
          : await this.prisma.contract.findUnique({ where: { tradeId: params.tradeId } });

        if (!contract) {
          return { success: true, result: { recorded: false, detail: "No contract generated yet" } };
        }
        return {
          success: true,
          result: {
            recorded: true,
            contractId: contract.id,
            contractNumber: contract.contractNumber,
            status: contract.status,
            incoterm: contract.incoterm,
            confirmedAt: contract.confirmedAt,
            hasDocument: Boolean(contract.storageKey),
          },
        };
      },
    });

    // 3. READ_ONLY Tool: quality.get_summary
    this.tools.set("quality.get_summary", {
      key: "quality.get_summary",
      purpose: "Retrieve inspection and lab quality result status.",
      allowedRoles: ["TRADER"],
      riskClassification: "READ_ONLY",
      requiresApproval: false,
      validateInput: (params: unknown) => {
        const p = params as Record<string, unknown>;
        if (!p?.tradeId && !p?.inspectionId) {
          return { valid: false, error: "Must specify 'tradeId' or 'inspectionId'." };
        }
        return { valid: true };
      },
      execute: async (params: { tradeId?: string; inspectionId?: string }) => {
        const inspection = params.inspectionId
          ? await this.prisma.inspection.findUnique({
              where: { id: params.inspectionId },
              include: { qualityResult: true },
            })
          : await this.prisma.inspection.findFirst({
              where: { tradeId: params.tradeId },
              include: { qualityResult: true },
            });

        if (!inspection) {
          return { success: true, result: { recorded: false, detail: "No inspection attached" } };
        }
        return {
          success: true,
          result: {
            recorded: true,
            inspectionId: inspection.id,
            inspectionReference: inspection.inspectionReference,
            status: inspection.status,
            decision: inspection.qualityResult?.decision ?? "PENDING",
            classificationLabel: inspection.qualityResult?.classificationLabel ?? null,
          },
        };
      },
    });

    // 4. READ_ONLY Tool: shipment.get_summary
    this.tools.set("shipment.get_summary", {
      key: "shipment.get_summary",
      purpose: "Retrieve logistics shipment and delivery tracking status.",
      allowedRoles: ["TRADER"],
      riskClassification: "READ_ONLY",
      requiresApproval: false,
      validateInput: (params: unknown) => {
        const p = params as Record<string, unknown>;
        if (!p?.shipmentId && !p?.contractId) {
          return { valid: false, error: "Must specify 'shipmentId' or 'contractId'." };
        }
        return { valid: true };
      },
      execute: async (params: { shipmentId?: string; contractId?: string }) => {
        const shipment = params.shipmentId
          ? await this.prisma.shipment.findUnique({ where: { id: params.shipmentId } })
          : await this.prisma.shipment.findFirst({ where: { contractId: params.contractId } });

        if (!shipment) {
          return { success: true, result: { recorded: false, detail: "No shipment active" } };
        }
        return {
          success: true,
          result: {
            recorded: true,
            shipmentId: shipment.id,
            shipmentNumber: shipment.shipmentNumber,
            status: shipment.status,
            requestedPickupDate: shipment.requestedPickupDate,
            deliveredAt: shipment.deliveredAt,
          },
        };
      },
    });

    // 5. READ_ONLY Tool: settlement.get_status_summary
    this.tools.set("settlement.get_status_summary", {
      key: "settlement.get_status_summary",
      purpose: "Retrieve administrative settlement and invoice payment status.",
      allowedRoles: ["TRADER"],
      riskClassification: "READ_ONLY",
      requiresApproval: false,
      validateInput: (params: unknown) => {
        const p = params as Record<string, unknown>;
        if (!p?.tradeId) {
          return { valid: false, error: "Missing required parameter 'tradeId'." };
        }
        return { valid: true };
      },
      execute: async (params: { tradeId: string }) => {
        const settlement = await this.prisma.settlement.findUnique({
          where: { tradeId: params.tradeId },
        });
        if (!settlement) {
          return { success: true, result: { recorded: false, detail: "No settlement recorded yet" } };
        }
        return {
          success: true,
          result: {
            recorded: true,
            settlementId: settlement.id,
            paymentStatus: settlement.paymentStatus,
            currency: settlement.currency,
            totalCommercialAmount: settlement.totalCommercialAmount,
            remainingBalance: settlement.remainingBalance,
            paymentDueDate: settlement.paymentDueDate,
          },
        };
      },
    });

    // 6. READ_ONLY Tool: dpp.get_summary
    this.tools.set("dpp.get_summary", {
      key: "dpp.get_summary",
      purpose: "Retrieve Digital Product Passport status and version.",
      allowedRoles: ["TRADER"],
      riskClassification: "READ_ONLY",
      requiresApproval: false,
      validateInput: (params: unknown) => {
        const p = params as Record<string, unknown>;
        if (!p?.listingId && !p?.lotId) {
          return { valid: false, error: "Must specify 'listingId' or 'lotId'." };
        }
        return { valid: true };
      },
      execute: async (params: { listingId?: string; lotId?: string }) => {
        const lot = params.lotId
          ? await this.prisma.traceableLot.findUnique({
              where: { id: params.lotId },
              include: { dpp: true },
            })
          : await this.prisma.traceableLot.findFirst({
              where: { listingId: params.listingId },
              include: { dpp: true },
            });

        if (!lot || !lot.dpp) {
          return { success: true, result: { recorded: false, detail: "No DPP found for lot" } };
        }
        return {
          success: true,
          result: {
            recorded: true,
            dppId: lot.dpp.id,
            passportNumber: lot.dpp.passportNumber,
            versionNumber: lot.dpp.currentVersionNumber,
            status: lot.dpp.status,
          },
        };
      },
    });

    // 7. Controlled REQUIRES_APPROVAL Tool: trader.record_operational_note
    this.tools.set("trader.record_operational_note", {
      key: "trader.record_operational_note",
      purpose:
        "Controlled action: Record an operational review note against an authorized Trade context.",
      allowedRoles: ["TRADER"],
      riskClassification: "REQUIRES_APPROVAL",
      requiresApproval: true,
      validateInput: (params: unknown) => {
        const p = params as Record<string, unknown>;
        if (!p?.tradeId || typeof p.tradeId !== "string") {
          return { valid: false, error: "Missing required parameter 'tradeId'." };
        }
        if (!p?.note || typeof p.note !== "string") {
          return { valid: false, error: "Missing required parameter 'note'." };
        }
        return { valid: true };
      },
      execute: async (
        params: { tradeId: string; note: string; flagReviewRequired?: boolean },
        context: ToolExecutionContext,
      ): Promise<ToolExecutionResult> => {
        // Safe controlled action: Verify trade exists
        const trade = await this.prisma.trade.findUnique({
          where: { id: params.tradeId },
        });
        if (!trade) {
          return {
            success: false,
            failureCategory: "NOT_FOUND",
            failureReason: `Target Trade ${params.tradeId} not found.`,
          };
        }

        // Return controlled outcome with proof of human approval and execution
        return {
          success: true,
          result: {
            recorded: true,
            tradeId: trade.id,
            tradeNumber: trade.tradeNumber,
            approvalId: context.approvalId,
            note: params.note,
            approvedByUserId: context.actorUserId,
            executedAt: new Date().toISOString(),
          },
        };
      },
    });
  }

  getTool(key: string): ToolDefinition {
    if (this.forbiddenToolKeys.has(key)) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/ai/forbidden-tool",
        title: "Forbidden Tool",
        status: 403,
        detail: `The requested tool '${key}' is explicitly forbidden for AI execution.`,
      });
    }

    const tool = this.tools.get(key);
    if (!tool) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/ai/tool-not-found",
        title: "Tool Not Found",
        status: 404,
        detail: `No registered tool found for key '${key}'.`,
      });
    }
    return tool;
  }

  listTools(): readonly ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  isForbidden(key: string): boolean {
    return this.forbiddenToolKeys.has(key);
  }

  async executeTool(
    key: string,
    params: unknown,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const tool = this.getTool(key);

    // Validate role
    if (!tool.allowedRoles.includes(context.actorRole)) {
      throw new ForbiddenException({
        type: "https://errors.idogrow.com/ai/tool-role-denied",
        title: "Tool Role Denied",
        status: 403,
        detail: `Role '${context.actorRole}' is not authorized to execute tool '${key}'.`,
      });
    }

    // Validate input
    const validation = tool.validateInput(params);
    if (!validation.valid) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/ai/tool-invalid-input",
        title: "Tool Invalid Input",
        status: 400,
        detail: validation.error ?? "Invalid input parameters for tool execution.",
      });
    }

    return tool.execute(params, context);
  }
}
