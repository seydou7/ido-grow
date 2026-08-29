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

type ResponseHeaders = {
  set(headers: Record<string, string>): void;
};

import { AuthenticationNoStoreInterceptor } from "../authentication/authentication-no-store.interceptor";
import { AuthenticationProblemFilter } from "../authentication/authentication-problem";
import { AuthenticationService } from "../authentication/authentication.service";
import { readSessionToken } from "../authentication/cookie";
import type {
  ComplianceDocumentCollection,
  ComplianceDocumentSummary,
  CreateOrganisationInput,
  CreateSiteInput,
  OrganisationMemberCollection,
  OrganisationProfile,
  SelfMembershipCollection,
  SiteCollection,
  SiteSummary,
  UpdateOrganisationProfileInput,
  UpdateSiteInput,
} from "./contracts";
import { OrganisationsService } from "./organisations.service";

type ExpressUploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Controller()
@UseFilters(AuthenticationProblemFilter)
@UseInterceptors(AuthenticationNoStoreInterceptor)
export class OrganisationsController {
  constructor(
    private readonly authentication: AuthenticationService,
    private readonly organisations: OrganisationsService,
  ) {}

  @Get("memberships")
  async findSelfMemberships(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<SelfMembershipCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.findSelfMemberships(identity.userId);
  }

  @Get("organisations/:id")
  async getOrganisationProfile(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
  ): Promise<OrganisationProfile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.getOrganisationProfile(identity.userId, organisationId);
  }

  @Get("organisations/:id/members")
  async listOrganisationMembers(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
  ): Promise<OrganisationMemberCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.listOrganisationMembers(identity.userId, organisationId);
  }

  @Post("organisations")
  async createOrganisation(
    @Headers("cookie") cookieHeader: string | undefined,
    @Body() input: CreateOrganisationInput,
  ): Promise<OrganisationProfile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.createOrganisation(identity.userId, input);
  }

  @Patch("organisations/:id")
  async updateOrganisationProfile(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Body() input: UpdateOrganisationProfileInput,
  ): Promise<OrganisationProfile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.updateOrganisationProfile(
      identity.userId,
      organisationId,
      input,
    );
  }

  @Get("organisations/:id/sites")
  async listSites(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
  ): Promise<SiteCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.listSites(identity.userId, organisationId);
  }

  @Get("organisations/:id/sites/:siteId")
  async getSite(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Param("siteId") siteId: string,
  ): Promise<SiteSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.getSite(identity.userId, organisationId, siteId);
  }

  @Post("organisations/:id/sites")
  async createSite(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Body() input: CreateSiteInput,
  ): Promise<SiteSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.createSite(identity.userId, organisationId, input);
  }

  @Patch("organisations/:id/sites/:siteId")
  async updateSite(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Param("siteId") siteId: string,
    @Body() input: UpdateSiteInput,
  ): Promise<SiteSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.updateSite(
      identity.userId,
      organisationId,
      siteId,
      input,
    );
  }

  @Get("organisations/:id/documents")
  async listComplianceDocuments(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
  ): Promise<ComplianceDocumentCollection> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    return this.organisations.listComplianceDocuments(identity.userId, organisationId);
  }

  @Post("organisations/:id/documents")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  async uploadComplianceDocument(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Body("documentType") documentType: string,
    @UploadedFile() file: ExpressUploadedFile | undefined,
  ): Promise<ComplianceDocumentSummary> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    if (!file) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/organisations/missing-file",
        title: "File Required",
        status: 400,
        detail: "A valid file upload is required.",
      });
    }

    if (!documentType || documentType.trim().length === 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/organisations/missing-document-type",
        title: "Document Type Required",
        status: 400,
        detail: "A valid documentType is required.",
      });
    }

    return this.organisations.uploadComplianceDocument(
      identity.userId,
      organisationId,
      documentType,
      file.originalname,
      file.buffer,
      file.mimetype,
    );
  }

  @Get("organisations/:id/documents/:docId/download")
  async downloadComplianceDocument(
    @Headers("cookie") cookieHeader: string | undefined,
    @Param("id") organisationId: string,
    @Param("docId") docId: string,
    @Res({ passthrough: true }) res: ResponseHeaders,
  ): Promise<StreamableFile> {
    const identity = await this.authentication.resolveIdentity(
      readSessionToken(cookieHeader),
    );

    const file = await this.organisations.getComplianceDocumentFile(
      identity.userId,
      organisationId,
      docId,
    );

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
      "Content-Length": file.fileSize.toString(),
    });

    return new StreamableFile(file.stream);
  }
}
