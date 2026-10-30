import { Module } from "@nestjs/common";
import { AuditModule } from "../audit";
import { AuthenticationModule } from "../authentication";
import { DatabaseModule } from "../database";
import { OrganisationsModule } from "../organisations";
import { AgentRegistryService } from "./agent-registry.service";
import { AiApprovalService } from "./ai-approval.service";
import { AiContextRetrieverService } from "./ai-context-retriever.service";
import { AiEvaluationService } from "./ai-evaluation.service";
import { AiOrchestratorService } from "./ai-orchestrator.service";
import { AiProvider } from "./ai-provider.interface";
import { AiController } from "./ai.controller";
import { DeterministicFakeAiProvider } from "./deterministic-fake-ai.provider";
import { ToolRegistryService } from "./tool-registry.service";

@Module({
  imports: [
    DatabaseModule,
    AuthenticationModule,
    AuditModule,
    OrganisationsModule,
  ],
  controllers: [AiController],
  providers: [
    {
      provide: AiProvider,
      useClass: DeterministicFakeAiProvider,
    },
    AgentRegistryService,
    ToolRegistryService,
    AiContextRetrieverService,
    AiOrchestratorService,
    AiApprovalService,
    AiEvaluationService,
  ],
  exports: [
    AiProvider,
    AgentRegistryService,
    ToolRegistryService,
    AiContextRetrieverService,
    AiOrchestratorService,
    AiApprovalService,
    AiEvaluationService,
  ],
})
export class AiModule {}
