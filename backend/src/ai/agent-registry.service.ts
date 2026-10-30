import { Injectable, NotFoundException } from "@nestjs/common";
import type { AgentDefinition } from "./contracts";

@Injectable()
export class AgentRegistryService {
  private readonly agents = new Map<string, AgentDefinition>();

  constructor() {
    this.registerFoundationAgents();
  }

  private registerFoundationAgents(): void {
    const traderContextAssistant: AgentDefinition = {
      key: "TRADER_CONTEXT_ASSISTANT",
      displayName: "Trader Context Assistant",
      purpose:
        "Produce a structured operational summary of an authorised transaction across Trade, Contract, Quality, Logistics, Settlement, and DPP records.",
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
      confidencePolicy: {
        minConfidenceForProposal: 0.7,
      },
      escalationPolicy: {
        requireHumanApproval: true,
      },
    };

    this.agents.set(traderContextAssistant.key, traderContextAssistant);
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
