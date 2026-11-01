import { Injectable } from "@nestjs/common";
import { AiProvider } from "./ai-provider.interface";
import type {
  AiEvidenceItem,
  AiGenerationResult,
  AiMissingInformationItem,
  AiPromptPayload,
  AiProposedAction,
  StructuredAiOutputEnvelope,
} from "./contracts";

@Injectable()
export class DeterministicFakeAiProvider extends AiProvider {
  readonly providerName = "deterministic-fake";
  readonly modelName = "ido-grow-agent-foundation-v1";

  async generateStructured<T>(
    payload: AiPromptPayload,
    schemaValidator: (output: unknown) => { valid: boolean; data?: T; errors?: string[] },
  ): Promise<AiGenerationResult<T>> {
    const rawContext = payload.untrustedBusinessContext || {};
    const testScenario = (rawContext.testScenario as string) || (payload.query?.includes("__scenario:") ? payload.query.split("__scenario:")[1].trim() : undefined);

    // 1. Controllable evaluation scenarios
    if (testScenario === "malformed_output") {
      const malformed = {
        brokenEnvelope: true,
        missingFields: true,
      };
      const validation = schemaValidator(malformed);
      if (!validation.valid) {
        throw new Error(
          `AI output validation failed: ${validation.errors?.join(", ") ?? "Schema mismatch"}`,
        );
      }
      return {
        provider: this.providerName,
        model: this.modelName,
        output: malformed as unknown as T,
      };
    }

    if (testScenario === "unsupported_evidence") {
      const unsupportedOutput: StructuredAiOutputEnvelope = {
        summary: "Context evaluation with unverified fabricated evidence.",
        confidence: 0.92,
        evidence: [
          {
            sourceType: "trade",
            sourceId: "00000000-0000-0000-0000-000000000000", // Non-existent ID
            fieldPath: "trade.tradeNumber",
            safeValue: "FABRICATED-9999",
          },
        ],
        missingInformation: [],
        proposedActions: [],
      };
      const val = schemaValidator(unsupportedOutput);
      return {
        provider: this.providerName,
        model: this.modelName,
        output: (val.data ?? unsupportedOutput) as unknown as T,
      };
    }

    if (testScenario === "prompt_injection_attempt") {
      // Prompt injection text in context must NOT alter instructions or grant forbidden tools
      const injectionContainedOutput: StructuredAiOutputEnvelope = {
        summary: "Notice: external input contained instruction override attempt. Override rejected by code boundary. Standard operational review rendered.",
        confidence: 0.88,
        evidence: [],
        missingInformation: [
          {
            field: "instructions",
            reason: "External injection command ignored.",
            status: "SOURCE_BACKED",
          },
        ],
        proposedActions: [],
      };
      const val = schemaValidator(injectionContainedOutput);
      return {
        provider: this.providerName,
        model: this.modelName,
        output: (val.data ?? injectionContainedOutput) as unknown as T,
      };
    }

    // 2. Real Operational Trader Context Synthesis
    const trade = (rawContext.trade as Record<string, any>) || {};
    const contract = (rawContext.contract as Record<string, any>) || null;
    const inspection = (rawContext.inspection as Record<string, any>) || null;
    const shipment = (rawContext.shipment as Record<string, any>) || null;
    const settlement = (rawContext.settlement as Record<string, any>) || null;
    const dpp = (rawContext.dpp as Record<string, any>) || null;

    const evidence: AiEvidenceItem[] = [];
    const missingInfo: AiMissingInformationItem[] = [];
    const proposedActions: AiProposedAction[] = [];

    // Synthesize trade facts
    let tradeSummary = "No active trade baseline found.";
    if (trade.id) {
      tradeSummary = `Trade ${trade.tradeNumber || trade.id} (${trade.materialType || "Natural Fibre"}, ${trade.quantity || 0} ${trade.quantityUnit || "TONNES"}).`;
      evidence.push({
        sourceType: "trade",
        sourceId: String(trade.id),
        fieldPath: "trade.tradeNumber",
        safeValue: String(trade.tradeNumber || trade.id),
      });
      if (trade.acceptedTotalAmount !== undefined) {
        evidence.push({
          sourceType: "trade",
          sourceId: String(trade.id),
          fieldPath: "trade.acceptedTotalAmount",
          safeValue: `${trade.currency || "EUR"} ${Number(trade.acceptedTotalAmount).toLocaleString()}`,
        });
      }
    } else {
      missingInfo.push({
        field: "trade",
        reason: "Trade baseline reference not provided in context.",
        status: "MISSING",
      });
    }

    // Contract facts
    let contractStatus = "Contract: Not yet drafted.";
    if (contract) {
      contractStatus = `Contract ${contract.contractNumber || contract.id} confirmed (Incoterm ${contract.incoterm || "Not specified"}).`;
      evidence.push({
        sourceType: "contract",
        sourceId: String(contract.id),
        fieldPath: "contract.status",
        safeValue: String(contract.status || "DRAFT"),
      });
    } else {
      missingInfo.push({
        field: "contract",
        reason: "Formal contract document not yet recorded for this trade.",
        status: "MISSING",
      });
    }

    // Quality facts
    let qualityStatus = "Quality: Pending inspection assignment.";
    if (inspection) {
      qualityStatus = `Inspection ${inspection.inspectionReference || inspection.id}: Status ${inspection.status}.`;
      evidence.push({
        sourceType: "inspection",
        sourceId: String(inspection.id),
        fieldPath: "inspection.status",
        safeValue: String(inspection.status),
      });
      if (inspection.qualityResult) {
        qualityStatus += ` Final decision: ${inspection.qualityResult.decision} (${inspection.qualityResult.classificationLabel}).`;
        evidence.push({
          sourceType: "quality_result",
          sourceId: String(inspection.qualityResult.id || inspection.id),
          fieldPath: "qualityResult.decision",
          safeValue: String(inspection.qualityResult.decision),
        });
      }
    } else {
      missingInfo.push({
        field: "quality",
        reason: "No inspection record attached to active trade.",
        status: "MISSING",
      });
    }

    // Shipment facts
    let shipmentStatus = "Logistics: No active shipment dispatch.";
    if (shipment) {
      shipmentStatus = `Shipment ${shipment.shipmentNumber || shipment.id} (${shipment.status}).`;
      evidence.push({
        sourceType: "shipment",
        sourceId: String(shipment.id),
        fieldPath: "shipment.status",
        safeValue: String(shipment.status),
      });
    } else {
      missingInfo.push({
        field: "shipment",
        reason: "Shipment execution not initiated.",
        status: "MISSING",
      });
    }

    // Settlement facts
    let settlementStatus = "Settlement: Administrative record pending.";
    if (settlement) {
      settlementStatus = `Settlement status ${settlement.paymentStatus} (Due: ${settlement.paymentDueDate ? new Date(settlement.paymentDueDate).toISOString().substring(0, 10) : "TBD"}, Balance: ${settlement.currency || "EUR"} ${Number(settlement.remainingBalance || 0).toLocaleString()}).`;
      evidence.push({
        sourceType: "settlement",
        sourceId: String(settlement.id),
        fieldPath: "settlement.paymentStatus",
        safeValue: String(settlement.paymentStatus),
      });
    } else {
      missingInfo.push({
        field: "settlement",
        reason: "Administrative settlement tracking not recorded.",
        status: "MISSING",
      });
    }

    // DPP facts
    let dppStatus = "DPP: Not yet issued for this lot.";
    if (dpp) {
      dppStatus = `DPP ${dpp.passportNumber || dpp.id} Active (v${dpp.currentVersionNumber || 1}).`;
      evidence.push({
        sourceType: "dpp",
        sourceId: String(dpp.id),
        fieldPath: "dpp.passportNumber",
        safeValue: String(dpp.passportNumber || dpp.id),
      });
    } else {
      missingInfo.push({
        field: "dpp",
        reason: "Digital Product Passport not yet projected for this commodity lot.",
        status: "MISSING",
      });
    }

    // Compute factual summary
    const overallSummary = [
      tradeSummary,
      contractStatus,
      qualityStatus,
      shipmentStatus,
      settlementStatus,
      dppStatus,
    ].join(" ");

    // Propose controlled operational review note (Requires Human Approval)
    if (trade.id) {
      proposedActions.push({
        toolKey: "trader.record_operational_note",
        proposalType: "RECORD_OPERATIONAL_NOTE",
        payload: {
          tradeId: String(trade.id),
          note: `Operational snapshot synthesized for Trade ${trade.tradeNumber || trade.id}. Context verified across Contract, Quality, Logistics, and DPP.`,
          flagReviewRequired: missingInfo.length > 2,
        },
        riskLevel: "REQUIRES_APPROVAL",
        rationale: "Log a structured verification note in the Trade ledger for counterparty auditability.",
      });
    }

    const confidenceScore = Math.max(0.6, Math.min(0.98, 1.0 - missingInfo.length * 0.08));

    const envelope: StructuredAiOutputEnvelope = {
      summary: overallSummary,
      confidence: Number(confidenceScore.toFixed(2)),
      evidence,
      missingInformation: missingInfo,
      proposedActions,
    };

    const validated = schemaValidator(envelope);
    if (!validated.valid) {
      throw new Error(`Output validation error: ${validated.errors?.join("; ")}`);
    }

    return {
      provider: this.providerName,
      model: this.modelName,
      output: (validated.data ?? envelope) as unknown as T,
      rawResponse: JSON.stringify(envelope),
    };
  }
}
