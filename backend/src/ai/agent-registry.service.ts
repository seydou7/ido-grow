import { Injectable, NotFoundException } from "@nestjs/common";
import type { AgentDefinition } from "./contracts";

@Injectable()
export class AgentRegistryService {
  private readonly agents = new Map<string, AgentDefinition>();

  constructor() {
    this.registerFoundationAgents();
  }

  private registerFoundationAgents(): void {
    const definitions: AgentDefinition[] = [
      {
        key: "TRADER_CONTEXT_ASSISTANT",
        displayName: "Trader Context Assistant (Vue 360°)",
        purpose:
          "Synthèse consolidée 360° d'une transaction autorisée : statuts croisés, priorités, blocages opérationnels.",
        promptVersion: "trader-context-assistant:v1",
        enabled: true,
        allowedTools: [
          "trade.get_context",
          "contract.get_summary",
          "quality.get_summary",
          "shipment.get_summary",
          "settlement.get_status_summary",
          "dpp.get_summary",
          "trader.record_operational_note",
        ],
        restrictedActions: ["trader.record_operational_note"],
        requiredContext: ["trade"],
        confidencePolicy: { minConfidenceForProposal: 0.7 },
        escalationPolicy: { requireHumanApproval: true },
      },
      {
        key: "TRADER_DASHBOARD_BRIEFING",
        displayName: "Trader Dashboard Briefing",
        purpose:
          "Synthétiser les dossiers prioritaires du jour et identifier l'action la plus urgente à traiter.",
        promptVersion: "trader-dashboard-briefing:v1",
        enabled: true,
        allowedTools: ["dashboard.get_priorities", "trader.record_operational_note"],
        restrictedActions: ["trader.record_operational_note"],
        requiredContext: ["dashboard"],
        confidencePolicy: { minConfidenceForProposal: 0.75 },
        escalationPolicy: { requireHumanApproval: true },
      },
      {
        key: "TRADER_LOT_EXPLANATION",
        displayName: "Trader Matching Lot Explainer",
        purpose:
          "Expliquer l'adéquation technique, volumétrique, logistique et tarifaire d'un lot candidat pour une demande acheteur.",
        promptVersion: "trader-lot-explanation:v1",
        enabled: true,
        allowedTools: ["matching.evaluate_compatibility"],
        restrictedActions: [],
        requiredContext: ["demand", "candidate_lot"],
        confidencePolicy: { minConfidenceForProposal: 0.8 },
        escalationPolicy: { requireHumanApproval: false },
      },
      {
        key: "TRADER_COMPARISON_SYNTHESIS",
        displayName: "Trader Candidate Comparison Synthesizer",
        purpose:
          "Comparer 2 à 4 offres candidates (économique, qualité, délai, compromis) et formuler une recommandation objective.",
        promptVersion: "trader-comparison-synthesis:v1",
        enabled: true,
        allowedTools: ["matching.compare_candidates"],
        restrictedActions: [],
        requiredContext: ["demand", "candidates_list"],
        confidencePolicy: { minConfidenceForProposal: 0.8 },
        escalationPolicy: { requireHumanApproval: false },
      },
      {
        key: "TRADER_QUOTE_MARGIN",
        displayName: "Trader Quote Margin Assistant",
        purpose:
          "Analyser la décomposition des 11 coûts d'un devis et suggérer une fourchette de marge optimale (10-12%) avec justification.",
        promptVersion: "trader-quote-margin:v1",
        enabled: true,
        allowedTools: ["quote.analyze_costs", "quote.propose_margin"],
        restrictedActions: ["quote.propose_margin"],
        requiredContext: ["quote_breakdown"],
        confidencePolicy: { minConfidenceForProposal: 0.85 },
        escalationPolicy: { requireHumanApproval: true },
      },
      {
        key: "TRADER_QUALITY_INSPECTION",
        displayName: "Trader Quality Inspection Analyst",
        purpose:
          "Analyser les mesures physiques (humidité, impuretés), les preuves et la conformité technique du lot sans se substituer à l'inspecteur.",
        promptVersion: "trader-quality-inspection:v1",
        enabled: true,
        allowedTools: ["quality.get_measurements", "quality.get_evidence"],
        restrictedActions: [],
        requiredContext: ["inspection"],
        confidencePolicy: { minConfidenceForProposal: 0.8 },
        escalationPolicy: { requireHumanApproval: true },
      },
      {
        key: "TRADER_LOGISTICS_DIAGNOSTIC",
        displayName: "Trader Logistics Diagnostic Assistant",
        purpose:
          "Diagnostiquer les causes de blocage ou de retard d'une expédition et recommander l'action corrective.",
        promptVersion: "trader-logistics-diagnostic:v1",
        enabled: true,
        allowedTools: ["shipment.get_milestones", "shipment.get_quotations"],
        restrictedActions: [],
        requiredContext: ["shipment"],
        confidencePolicy: { minConfidenceForProposal: 0.75 },
        escalationPolicy: { requireHumanApproval: true },
      },
      {
        key: "TRADER_DOCUMENTS_AUDIT",
        displayName: "Trader Documents & DPP Auditor",
        purpose:
          "Auditer les 5 documents obligatoires de clôture d'une transaction et calculer le taux d'exhaustivité du DPP.",
        promptVersion: "trader-documents-audit:v1",
        enabled: true,
        allowedTools: ["documents.check_readiness", "dpp.get_status"],
        restrictedActions: [],
        requiredContext: ["trade_documents"],
        confidencePolicy: { minConfidenceForProposal: 0.8 },
        escalationPolicy: { requireHumanApproval: true },
      },
    ];

    for (const def of definitions) {
      this.agents.set(def.key, def);
    }
  }

  getAgent(key: string): AgentDefinition {
    const normalizedKey = key.trim().toUpperCase();
    const agent = this.agents.get(normalizedKey);
    if (!agent) {
      throw new NotFoundException({
        type: "https://errors.idogrow.com/ai/agent-not-found",
        title: "Agent Not Found",
        status: 404,
        detail: `No registered AI agent found for key '${key}'.`,
      });
    }
    return agent;
  }

  listAgents(): readonly AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  isToolAllowed(agentKey: string, toolKey: string): boolean {
    const agent = this.getAgent(agentKey);
    return agent.allowedTools.includes(toolKey);
  }
}
