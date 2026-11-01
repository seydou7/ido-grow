import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Res,
  StreamableFile,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  ContractCollection,
  ContractDetail,
  CreateContractInput,
  UpdateContractDraftInput,
} from "./contracts.contracts";
import { ContractsService } from "./contracts.service";

interface ResponseHeaders {
  set(headers: Record<string, string>): void;
}

@Controller()
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class ContractsController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly contractsService: ContractsService,
  ) {}

  @Post("trades/:tradeId/contract")
  async createContractForTrade(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("tradeId") tradeId: string,
  ): Promise<ContractDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.contractsService.createContract(identity.userId, tradeId);
  }

  @Post("contracts")
  async createContract(
    @Headers("cookie") cookieHeader: string | undefined,
    @Body() body: CreateContractInput,
  ): Promise<ContractDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.contractsService.createContract(identity.userId, body.tradeId);
  }

  @Get("contracts")
  async getContracts(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ContractCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.contractsService.getContracts(identity.userId);
  }

  @Get("contracts/by-trade/:tradeId")
  async getContractByTradeId(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("tradeId") tradeId: string,
  ): Promise<ContractDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.contractsService.getContractByTradeId(identity.userId, tradeId);
  }

  @Get("contracts/:id")
  async getContractById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<ContractDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.contractsService.getContractById(identity.userId, id);
  }

  @Patch("contracts/:id")
  async updateContractDraft(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Body() body: UpdateContractDraftInput,
  ): Promise<ContractDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.contractsService.updateContractDraft(identity.userId, id, body);
  }

  @Post("contracts/:id/confirm")
  async confirmContract(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
  ): Promise<ContractDetail> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );
    return this.contractsService.confirmContract(identity.userId, id);
  }

  @Get("contracts/:id/document")
  async getContractDocument(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") id: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
  ): Promise<StreamableFile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const doc = await this.contractsService.getContractDocument(
      identity.userId,
      id,
    );

    res.set({
      "Content-Type": doc.file.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.filename)}"`,
      "Content-Length": doc.file.fileSize.toString(),
    });

    return new StreamableFile(doc.file.stream);
  }
}
