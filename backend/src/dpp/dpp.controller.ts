import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  StreamableFile,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import { PrismaService } from "../database/prisma.service";
import type {
  AuthenticatedUser,
  CreateLotDto,
  DigitalProductPassportResponse,
  DPPCustodyRecordResponse,
  DPPEventResponse,
  DPPVersionResponse,
  PassportViewResponse,
  TraceableLotResponse,
} from "./dpp.contracts";
import { DppService } from "./dpp.service";
import type { DppQrResult } from "./qr-generator";

type ResponseHeaders = { set(headers: Record<string, string>): void };

@Controller()
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class DppController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly prisma: PrismaService,
    private readonly dppService: DppService,
  ) {}

  private async resolveActor(
    cookieHeader: string | undefined,
  ): Promise<AuthenticatedUser> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const user = await this.prisma.user.findUnique({
      where: { id: identity.userId },
      include: {
        memberships: {
          take: 1,
        },
      },
    });

    if (!user) {
      throw new ForbiddenException("Authenticated user record not found.");
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      organisationId: user.memberships[0]?.organisationId ?? null,
    };
  }

  // ── LOT ENDPOINTS ─────────────────────────────────────────────

  @Post("lots")
  async createLot(
    @Headers("cookie") cookieHeader: string | undefined,
    @Body() body: CreateLotDto,
  ): Promise<TraceableLotResponse> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.createLot(body, actor);
  }

  @Get("lots")
  async findLots(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<TraceableLotResponse[]> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.findLots(actor);
  }

  @Get("lots/:lotId")
  async getLotById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("lotId") lotId: string,
  ): Promise<TraceableLotResponse> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.getLotById(lotId, actor);
  }

  // ── DPP ENDPOINTS ─────────────────────────────────────────────

  @Post("lots/:lotId/dpp")
  async createPassportForLot(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("lotId") lotId: string,
  ): Promise<DigitalProductPassportResponse> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.createPassportForLot(lotId, actor);
  }

  @Get("dpp")
  async findPassports(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DigitalProductPassportResponse[]> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.findPassports(actor);
  }

  @Get("dpp/:dppId")
  async getPassportById(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
  ): Promise<DigitalProductPassportResponse> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.getPassportById(dppId, actor);
  }

  @Get("dpp/:dppId/events")
  async getPassportEvents(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
  ): Promise<DPPEventResponse[]> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.getPassportEvents(dppId, actor);
  }

  @Get("dpp/:dppId/versions")
  async getPassportVersions(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
  ): Promise<DPPVersionResponse[]> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.getPassportVersions(dppId, actor);
  }

  @Get("dpp/:dppId/versions/:versionNumber")
  async getPassportVersionByNumber(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
    @Param("versionNumber", ParseIntPipe) versionNumber: number,
  ): Promise<DPPVersionResponse> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.getPassportVersionByNumber(dppId, versionNumber, actor);
  }

  @Get("dpp/:dppId/custody")
  async getPassportCustodyRecords(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
  ): Promise<DPPCustodyRecordResponse[]> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.getPassportCustodyRecords(dppId, actor);
  }

  @Post("dpp/:dppId/sync")
  async syncPassport(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
  ): Promise<DigitalProductPassportResponse> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.syncPassport(dppId, actor);
  }

  // ── BLOCK 02 PASSPORT PAGE, DOWNLOADABLE PDF & QR ─────────────

  @Get("dpp/:dppId/passport")
  async getPassportView(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
    @Query("version") version?: string,
  ): Promise<PassportViewResponse> {
    const actor = await this.resolveActor(cookieHeader);
    const parsedVersion = version ? parseInt(version, 10) : undefined;
    return this.dppService.getPassportView(dppId, actor, parsedVersion);
  }

  @Get("dpp/:dppId/passport.pdf")
  async downloadPassportPdf(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
    @Query("version") version?: string,
  ): Promise<StreamableFile> {
    const actor = await this.resolveActor(cookieHeader);
    const parsedVersion = version ? parseInt(version, 10) : undefined;
    const { buffer, filename } = await this.dppService.generatePassportPdf(
      dppId,
      actor,
      parsedVersion,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    return new StreamableFile(buffer);
  }

  @Get("dpp/:dppId/qr")
  async getPassportQr(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("dppId") dppId: string,
  ): Promise<DppQrResult> {
    const actor = await this.resolveActor(cookieHeader);
    return this.dppService.getPassportQr(dppId, actor);
  }
}
