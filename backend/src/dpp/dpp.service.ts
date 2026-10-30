import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes, randomUUID } from "node:crypto";

import { AuditEventWriter } from "../audit/audit-event.writer";
import { PrismaService } from "../database/prisma.service";
import type {
  AuthenticatedUser,
  CreateLotDto,
  DigitalProductPassportResponse,
  DPPCustodyMilestone,
  DPPCustodyRecordResponse,
  DPPEventResponse,
  DPPEventType,
  DPPSnapshot,
  DPPVerificationStatus,
  DPPVersionResponse,
  PassportViewResponse,
  TraceableLotResponse,
} from "./dpp.contracts";
import { generateDppPdf } from "./dpp-pdf-generator";
import { generateDppQrCode, type DppQrResult } from "./qr-generator";

export function generateLotNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = randomBytes(4).toString("hex").toUpperCase();
  return `LOT-${dateStr}-${randomSuffix}`;
}

export function generatePassportNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = randomBytes(4).toString("hex").toUpperCase();
  return `DPP-${dateStr}-${randomSuffix}`;
}

function toIso(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  if (typeof date === "string") return date;
  if (date instanceof Date) return date.toISOString();
  return String(date);
}

function toIsoOrNull(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === "string") return date;
  if (date instanceof Date) return date.toISOString();
  return String(date);
}

@Injectable()
export class DppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditWriter: AuditEventWriter,
  ) {}

  // ── LOT TRACEABILITY ──────────────────────────────────────────

  async createLot(
    dto: CreateLotDto,
    actor: AuthenticatedUser,
  ): Promise<TraceableLotResponse> {
    if (actor.role !== "TRADER") {
      throw new ForbiddenException("Only Traders can create traceable lots.");
    }

    if (!dto.listingId) {
      throw new BadRequestException("listingId is required.");
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: {
        site: true,
        organisation: true,
      },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found.");
    }

    // Production site validation
    let siteId: string | null = null;
    if (dto.productionSiteId) {
      const site = await this.prisma.site.findUnique({
        where: { id: dto.productionSiteId },
      });
      if (!site || site.organisationId !== listing.organisationId) {
        throw new BadRequestException(
          "productionSiteId does not belong to the listing supplier organisation.",
        );
      }
      siteId = site.id;
    } else if (listing.siteId) {
      siteId = listing.siteId;
    }

    const quantity = dto.quantity ?? listing.quantity;
    if (typeof quantity !== "number" || quantity <= 0) {
      throw new BadRequestException("quantity must be a positive number.");
    }

    const quantityUnit = dto.quantityUnit ?? listing.quantityUnit ?? "TONNES";
    const materialType = dto.materialType ?? listing.materialType;
    const productForm = dto.productForm ?? listing.productForm ?? null;
    const countryOfOrigin = dto.countryOfOrigin ?? listing.originCountry ?? null;
    const regionOfOrigin = dto.regionOfOrigin ?? null;
    const batchReference = dto.batchReference ?? null;
    const notes = dto.notes ?? null;
    let productionDate: Date | null = null;
    if (dto.productionDate) {
      const parsed = new Date(dto.productionDate);
      if (isNaN(parsed.getTime())) {
        throw new BadRequestException("Invalid productionDate format.");
      }
      productionDate = parsed;
    }

    const lotNumber = generateLotNumber();

    const createdLot = await this.prisma.$transaction(async (tx) => {
      const lot = await tx.traceableLot.create({
        data: {
          lotNumber,
          listingId: listing.id,
          supplierOrganisationId: listing.organisationId,
          productionSiteId: siteId,
          materialType,
          productForm,
          quantity,
          quantityUnit,
          countryOfOrigin,
          regionOfOrigin,
          productionDate,
          batchReference,
          notes,
          createdByUserId: actor.userId,
        },
        include: {
          listing: true,
          supplierOrganisation: true,
          productionSite: true,
          dpp: true,
        },
      });

      await this.auditWriter.append(
        {
          eventType: "dpp.lot.created",
          outcome: "succeeded",
          actor: { type: "user", userId: actor.userId },
          target: { type: "traceable_lot", id: lot.id },
          correlationId: randomUUID(),
          occurredAt: new Date(),
          metadata: {
            lotNumber: lot.lotNumber,
            listingId: lot.listingId,
            supplierOrganisationId: lot.supplierOrganisationId,
          },
        },
        tx,
      );

      return lot;
    });

    return this.mapLotToResponse(createdLot);
  }

  async findLots(actor: AuthenticatedUser): Promise<TraceableLotResponse[]> {
    let whereClause: Record<string, unknown> = {};

    if (actor.role === "TRADER") {
      whereClause = {};
    } else if (actor.role === "SUPPLIER") {
      if (!actor.organisationId) {
        throw new ForbiddenException("Supplier organisation required.");
      }
      whereClause = { supplierOrganisationId: actor.organisationId };
    } else if (actor.role === "BUYER") {
      if (!actor.organisationId) {
        throw new ForbiddenException("Buyer organisation required.");
      }
      // Buyer can view lots linked to listings that have trades involving the buyer
      const buyerTrades = await this.prisma.trade.findMany({
        where: { buyerOrganisationId: actor.organisationId },
        select: { listingId: true },
      });
      const listingIds = buyerTrades.map((t) => t.listingId);
      whereClause = { listingId: { in: listingIds } };
    } else {
      throw new ForbiddenException("Access denied to traceable lots.");
    }

    const lots = await this.prisma.traceableLot.findMany({
      where: whereClause,
      include: {
        listing: true,
        supplierOrganisation: true,
        productionSite: true,
        dpp: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return lots.map((l) => this.mapLotToResponse(l));
  }

  async getLotById(
    lotId: string,
    actor: AuthenticatedUser,
  ): Promise<TraceableLotResponse> {
    const lot = await this.prisma.traceableLot.findUnique({
      where: { id: lotId },
      include: {
        listing: true,
        supplierOrganisation: true,
        productionSite: true,
        dpp: true,
      },
    });

    if (!lot) {
      throw new NotFoundException("Lot not found.");
    }

    await this.assertLotAccess(lot, actor);
    return this.mapLotToResponse(lot);
  }

  // ── DIGITAL PRODUCT PASSPORT CORE ─────────────────────────────

  async createPassportForLot(
    lotId: string,
    actor: AuthenticatedUser,
  ): Promise<DigitalProductPassportResponse> {
    if (actor.role !== "TRADER") {
      throw new ForbiddenException("Only Traders can create digital product passports.");
    }

    const lot = await this.prisma.traceableLot.findUnique({
      where: { id: lotId },
      include: {
        listing: true,
        supplierOrganisation: true,
        productionSite: true,
        dpp: true,
      },
    });

    if (!lot) {
      throw new NotFoundException("Lot not found.");
    }

    if (lot.dpp) {
      throw new BadRequestException({
        code: "dpp/already-exists",
        message: "Digital Product Passport already exists for this lot.",
        dppId: lot.dpp.id,
      });
    }

    const passportNumber = generatePassportNumber();

    // Query authoritative platform records
    const authoritativeData = await this.fetchAuthoritativeDataForLot(lot.listingId, lot.supplierOrganisationId);

    // Build initial events projection
    const projectedEvents = this.projectEvents(lot, authoritativeData);

    // Build initial custody milestones
    const projectedCustody = this.projectCustody(lot, authoritativeData);

    // Build initial structured snapshot
    const initialSnapshot = this.buildSnapshot(passportNumber, lot, authoritativeData, projectedCustody);

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create DPP
      const dpp = await tx.digitalProductPassport.create({
        data: {
          passportNumber,
          lotId: lot.id,
          status: "ACTIVE",
          currentVersionNumber: 1,
          createdByUserId: actor.userId,
        },
      });

      // 2. Create DPP Version 1
      const version = await tx.dPPVersion.create({
        data: {
          dppId: dpp.id,
          versionNumber: 1,
          snapshot: initialSnapshot as unknown as object,
          changeReason: "Initial Digital Product Passport creation",
          createdByUserId: actor.userId,
        },
      });

      // 3. Update DPP currentVersionId
      await tx.digitalProductPassport.update({
        where: { id: dpp.id },
        data: { currentVersionId: version.id },
      });

      // 4. Create DPP Events
      for (const ev of projectedEvents) {
        await tx.dPPEvent.create({
          data: {
            dppId: dpp.id,
            lotId: lot.id,
            eventType: ev.eventType,
            occurredAt: ev.occurredAt,
            location: ev.location,
            responsibleOrganisationId: ev.responsibleOrganisationId,
            responsibleUserId: ev.responsibleUserId,
            sourceType: ev.sourceType,
            sourceId: ev.sourceId,
            verificationStatus: ev.verificationStatus,
            metadata: (ev.metadata ?? {}) as object,
          },
        });
      }

      // 5. Create DPP Custody Records
      for (const cr of projectedCustody) {
        await tx.dPPCustodyRecord.create({
          data: {
            dppId: dpp.id,
            lotId: lot.id,
            milestone: cr.milestone,
            fromOrganisationId: cr.fromOrganisationId,
            toOrganisationId: cr.toOrganisationId,
            sourceType: cr.sourceType,
            sourceId: cr.sourceId,
            occurredAt: cr.occurredAt,
            location: cr.location,
            notes: cr.notes,
          },
        });
      }

      // 6. Audit events
      await this.auditWriter.append(
        {
          eventType: "dpp.passport.created",
          outcome: "succeeded",
          actor: { type: "user", userId: actor.userId },
          target: { type: "dpp", id: dpp.id },
          correlationId: randomUUID(),
          occurredAt: new Date(),
          metadata: {
            passportNumber: dpp.passportNumber,
            lotId: lot.id,
            lotNumber: lot.lotNumber,
          },
        },
        tx,
      );

      await this.auditWriter.append(
        {
          eventType: "dpp.version.created",
          outcome: "succeeded",
          actor: { type: "user", userId: actor.userId },
          target: { type: "dpp_version", id: version.id },
          correlationId: randomUUID(),
          occurredAt: new Date(),
          metadata: {
            dppId: dpp.id,
            versionNumber: String(version.versionNumber),
          },
        },
        tx,
      );

      await this.auditWriter.append(
        {
          eventType: "dpp.custody.recorded",
          outcome: "succeeded",
          actor: { type: "user", userId: actor.userId },
          target: { type: "dpp_custody_record", id: dpp.id },
          correlationId: randomUUID(),
          occurredAt: new Date(),
          metadata: {
            dppId: dpp.id,
            recordsCount: String(projectedCustody.length),
          },
        },
        tx,
      );

      return dpp;
    });

    return this.getPassportById(result.id, actor);
  }

  async findPassports(
    actor: AuthenticatedUser,
  ): Promise<DigitalProductPassportResponse[]> {
    let whereClause: Record<string, unknown> = {};

    if (actor.role === "TRADER") {
      whereClause = {};
    } else if (actor.role === "SUPPLIER") {
      if (!actor.organisationId) {
        throw new ForbiddenException("Supplier organisation required.");
      }
      whereClause = {
        lot: { supplierOrganisationId: actor.organisationId },
      };
    } else if (actor.role === "BUYER") {
      if (!actor.organisationId) {
        throw new ForbiddenException("Buyer organisation required.");
      }
      const buyerTrades = await this.prisma.trade.findMany({
        where: { buyerOrganisationId: actor.organisationId },
        select: { listingId: true },
      });
      const listingIds = buyerTrades.map((t) => t.listingId);
      whereClause = {
        lot: { listingId: { in: listingIds } },
      };
    } else {
      throw new ForbiddenException("Access denied to digital product passports.");
    }

    const dpps = await this.prisma.digitalProductPassport.findMany({
      where: whereClause,
      include: {
        lot: {
          include: {
            listing: true,
            supplierOrganisation: true,
            productionSite: true,
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        _count: {
          select: {
            events: true,
            versions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return dpps.map((d) => this.mapDppToResponse(d));
  }

  async getPassportById(
    dppId: string,
    actor: AuthenticatedUser,
  ): Promise<DigitalProductPassportResponse> {
    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: {
        lot: {
          include: {
            listing: true,
            supplierOrganisation: true,
            productionSite: true,
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
        _count: {
          select: {
            events: true,
            versions: true,
          },
        },
      },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    await this.assertLotAccess(dpp.lot, actor);
    return this.mapDppToResponse(dpp);
  }

  async getPassportEvents(
    dppId: string,
    actor: AuthenticatedUser,
  ): Promise<DPPEventResponse[]> {
    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: { lot: true },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    await this.assertLotAccess(dpp.lot, actor);

    const events = await this.prisma.dPPEvent.findMany({
      where: { dppId },
      include: {
        responsibleOrganisation: true,
        responsibleUser: true,
      },
      orderBy: { occurredAt: "asc" },
    });

    return events.map((e) => ({
      id: e.id,
      dppId: e.dppId,
      lotId: e.lotId,
      eventType: e.eventType as DPPEventType,
      occurredAt: toIso(e.occurredAt),
      recordedAt: toIso(e.recordedAt),
      location: e.location,
      responsibleOrganisationId: e.responsibleOrganisationId,
      responsibleOrganisationName: e.responsibleOrganisation?.name ?? null,
      responsibleUserId: e.responsibleUserId,
      responsibleUserEmail: e.responsibleUser?.email ?? null,
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      verificationStatus: e.verificationStatus as DPPVerificationStatus,
      metadata: (e.metadata as Record<string, unknown>) ?? null,
    }));
  }

  async getPassportVersions(
    dppId: string,
    actor: AuthenticatedUser,
  ): Promise<DPPVersionResponse[]> {
    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: { lot: true },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    await this.assertLotAccess(dpp.lot, actor);

    const versions = await this.prisma.dPPVersion.findMany({
      where: { dppId },
      orderBy: { versionNumber: "asc" },
    });

    return versions.map((v) => ({
      id: v.id,
      dppId: v.dppId,
      versionNumber: v.versionNumber,
      snapshot: v.snapshot as unknown as DPPSnapshot,
      previousVersionId: v.previousVersionId,
      changeReason: v.changeReason,
      createdAt: toIso(v.createdAt),
      createdByUserId: v.createdByUserId,
    }));
  }

  async getPassportVersionByNumber(
    dppId: string,
    versionNumber: number,
    actor: AuthenticatedUser,
  ): Promise<DPPVersionResponse> {
    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: { lot: true },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    await this.assertLotAccess(dpp.lot, actor);

    const version = await this.prisma.dPPVersion.findUnique({
      where: {
        dppId_versionNumber: {
          dppId,
          versionNumber,
        },
      },
    });

    if (!version) {
      throw new NotFoundException(`DPP version ${versionNumber} not found.`);
    }

    return {
      id: version.id,
      dppId: version.dppId,
      versionNumber: version.versionNumber,
      snapshot: version.snapshot as unknown as DPPSnapshot,
      previousVersionId: version.previousVersionId,
      changeReason: version.changeReason,
      createdAt: toIso(version.createdAt),
      createdByUserId: version.createdByUserId,
    };
  }

  async getPassportCustodyRecords(
    dppId: string,
    actor: AuthenticatedUser,
  ): Promise<DPPCustodyRecordResponse[]> {
    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: { lot: true },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    await this.assertLotAccess(dpp.lot, actor);

    const records = await this.prisma.dPPCustodyRecord.findMany({
      where: { dppId },
      include: {
        fromOrganisation: true,
        toOrganisation: true,
      },
      orderBy: { occurredAt: "asc" },
    });

    return records.map((r) => ({
      id: r.id,
      dppId: r.dppId,
      lotId: r.lotId,
      milestone: r.milestone as DPPCustodyMilestone,
      fromOrganisationId: r.fromOrganisationId,
      fromOrganisationName: r.fromOrganisation?.name ?? null,
      toOrganisationId: r.toOrganisationId,
      toOrganisationName: r.toOrganisation?.name ?? null,
      sourceType: r.sourceType,
      sourceId: r.sourceId,
      occurredAt: toIso(r.occurredAt),
      recordedAt: toIso(r.recordedAt),
      location: r.location,
      notes: r.notes,
    }));
  }

  // ── HUMAN-READABLE PASSPORT & PDF/QR (BLOCK 02) ───────────────

  async getPassportView(
    dppId: string,
    actor: AuthenticatedUser,
    requestedVersionNumber?: number,
  ): Promise<PassportViewResponse> {
    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: {
        lot: {
          include: {
            listing: true,
            supplierOrganisation: true,
            productionSite: true,
          },
        },
        versions: {
          orderBy: { versionNumber: "asc" },
        },
        _count: {
          select: {
            events: true,
            versions: true,
          },
        },
      },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    await this.assertLotAccess(dpp.lot, actor);

    if (dpp.versions.length === 0) {
      throw new NotFoundException("No versions found for this Digital Product Passport.");
    }

    let targetVersion = dpp.versions[dpp.versions.length - 1];
    let isHistorical = false;

    if (requestedVersionNumber !== undefined && !isNaN(Number(requestedVersionNumber))) {
      const vNum = Number(requestedVersionNumber);
      const found = dpp.versions.find((v) => v.versionNumber === vNum);
      if (!found) {
        throw new NotFoundException(`DPP Version ${vNum} not found.`);
      }
      targetVersion = found;
      isHistorical = targetVersion.versionNumber < dpp.currentVersionNumber;
    }

    const eventWhere: Record<string, unknown> = { dppId };
    if (isHistorical) {
      eventWhere.recordedAt = { lte: targetVersion.createdAt };
    }

    const events = await this.prisma.dPPEvent.findMany({
      where: eventWhere,
      include: {
        responsibleOrganisation: true,
        responsibleUser: true,
      },
      orderBy: { occurredAt: "asc" },
    });

    const custodyRecords = await this.prisma.dPPCustodyRecord.findMany({
      where: isHistorical
        ? { dppId, recordedAt: { lte: targetVersion.createdAt } }
        : { dppId },
      include: {
        fromOrganisation: true,
        toOrganisation: true,
      },
      orderBy: { occurredAt: "asc" },
    });

    const qrResult = await generateDppQrCode(dpp.id, dpp.passportNumber);

    const availableVersions = dpp.versions.map((v) => ({
      versionNumber: v.versionNumber,
      createdAt: toIso(v.createdAt),
      changeReason: v.changeReason,
    }));

    const mappedEvents: DPPEventResponse[] = events.map((e) => ({
      id: e.id,
      dppId: e.dppId,
      lotId: e.lotId,
      eventType: e.eventType as DPPEventType,
      occurredAt: toIso(e.occurredAt),
      recordedAt: toIso(e.recordedAt),
      location: e.location,
      responsibleOrganisationId: e.responsibleOrganisationId,
      responsibleOrganisationName: e.responsibleOrganisation?.name ?? null,
      responsibleUserId: e.responsibleUserId,
      responsibleUserEmail: e.responsibleUser?.email ?? null,
      sourceType: e.sourceType,
      sourceId: e.sourceId,
      verificationStatus: e.verificationStatus as DPPVerificationStatus,
      metadata: e.metadata as Record<string, unknown> | null,
    }));

    const mappedCustody: DPPCustodyRecordResponse[] = custodyRecords.map((r) => ({
      id: r.id,
      dppId: r.dppId,
      lotId: r.lotId,
      milestone: r.milestone as DPPCustodyMilestone,
      fromOrganisationId: r.fromOrganisationId,
      fromOrganisationName: r.fromOrganisation?.name ?? null,
      toOrganisationId: r.toOrganisationId,
      toOrganisationName: r.toOrganisation?.name ?? null,
      sourceType: r.sourceType,
      sourceId: r.sourceId,
      occurredAt: toIso(r.occurredAt),
      recordedAt: toIso(r.recordedAt),
      location: r.location,
      notes: r.notes,
    }));

    return {
      dppId: dpp.id,
      passportNumber: dpp.passportNumber,
      versionNumber: targetVersion.versionNumber,
      isHistorical,
      totalVersions: dpp.versions.length,
      status: dpp.status,
      createdAt: toIso(dpp.createdAt),
      versionCreatedAt: toIso(targetVersion.createdAt),
      renderedAt: new Date().toISOString(),
      lotId: dpp.lot.id,
      lotNumber: dpp.lot.lotNumber,
      snapshot: targetVersion.snapshot as unknown as DPPSnapshot,
      provenanceEvents: mappedEvents,
      custodyMilestones: mappedCustody,
      qr: {
        targetUrl: qrResult.targetUrl,
        route: qrResult.route,
        qrSvg: qrResult.qrSvg,
        qrDataUrl: qrResult.qrDataUrl,
        requiresAuth: qrResult.requiresAuth,
      },
      availableVersions,
    };
  }

  async generatePassportPdf(
    dppId: string,
    actor: AuthenticatedUser,
    requestedVersionNumber?: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const passportView = await this.getPassportView(dppId, actor, requestedVersionNumber);

    const pdfEvents = passportView.provenanceEvents.map((evt) => ({
      eventType: evt.eventType,
      occurredAt: evt.occurredAt,
      responsibleParty: evt.responsibleOrganisationName || evt.responsibleUserEmail || null,
      location: evt.location,
      sourceReference: `${evt.sourceType}:${evt.sourceId}`,
      verificationStatus: evt.verificationStatus,
    }));

    const buffer = generateDppPdf({
      passportNumber: passportView.passportNumber,
      lotNumber: passportView.lotNumber,
      versionNumber: passportView.versionNumber,
      isHistorical: passportView.isHistorical,
      totalVersions: passportView.totalVersions,
      status: passportView.status,
      createdAt: passportView.createdAt,
      versionCreatedAt: passportView.versionCreatedAt,
      renderedAt: passportView.renderedAt,
      snapshot: passportView.snapshot,
      events: pdfEvents,
      qrTargetUrl: passportView.qr.targetUrl,
    });

    const filename = `passport-${passportView.passportNumber}-v${passportView.versionNumber}.pdf`;
    return { buffer, filename };
  }

  async getPassportQr(
    dppId: string,
    actor: AuthenticatedUser,
  ): Promise<DppQrResult> {
    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: { lot: true },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    await this.assertLotAccess(dpp.lot, actor);

    return generateDppQrCode(dpp.id, dpp.passportNumber);
  }

  // ── DPP SYNCHRONIZATION ───────────────────────────────────────

  async syncPassport(
    dppId: string,
    actor: AuthenticatedUser,
  ): Promise<DigitalProductPassportResponse> {
    if (actor.role !== "TRADER") {
      throw new ForbiddenException("Only Traders can synchronize digital product passports.");
    }

    const dpp = await this.prisma.digitalProductPassport.findUnique({
      where: { id: dppId },
      include: {
        lot: {
          include: {
            listing: true,
            supplierOrganisation: true,
            productionSite: true,
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!dpp) {
      throw new NotFoundException("Digital Product Passport not found.");
    }

    const lot = dpp.lot;
    const previousVersion = dpp.versions[0];

    // Fetch authoritative data
    const authoritativeData = await this.fetchAuthoritativeDataForLot(lot.listingId, lot.supplierOrganisationId);

    // Existing events and custody
    const existingEvents = await this.prisma.dPPEvent.findMany({
      where: { dppId },
    });
    const existingCustody = await this.prisma.dPPCustodyRecord.findMany({
      where: { dppId },
    });

    const existingEventKeys = new Set(
      existingEvents.map((e) => `${e.sourceType}:${e.sourceId}:${e.eventType}`),
    );
    const existingCustodyKeys = new Set(
      existingCustody.map((c) => `${c.sourceType}:${c.sourceId}:${c.milestone}`),
    );

    // Newly projected events & custody
    const allProjectedEvents = this.projectEvents(lot, authoritativeData);
    const allProjectedCustody = this.projectCustody(lot, authoritativeData);

    const newEvents = allProjectedEvents.filter(
      (e) => !existingEventKeys.has(`${e.sourceType}:${e.sourceId}:${e.eventType}`),
    );
    const newCustody = allProjectedCustody.filter(
      (c) => !existingCustodyKeys.has(`${c.sourceType}:${c.sourceId}:${c.milestone}`),
    );

    // Rebuild current snapshot
    const newSnapshot = this.buildSnapshot(dpp.passportNumber, lot, authoritativeData, allProjectedCustody);

    // Check if snapshot materially changed compared to previous version
    const hasMaterialChange = this.hasMaterialSnapshotChange(
      previousVersion?.snapshot as unknown as DPPSnapshot | undefined,
      newSnapshot,
    );

    await this.prisma.$transaction(async (tx) => {
      // 1. Insert new events idempotently
      for (const ev of newEvents) {
        await tx.dPPEvent.create({
          data: {
            dppId: dpp.id,
            lotId: lot.id,
            eventType: ev.eventType,
            occurredAt: ev.occurredAt,
            location: ev.location,
            responsibleOrganisationId: ev.responsibleOrganisationId,
            responsibleUserId: ev.responsibleUserId,
            sourceType: ev.sourceType,
            sourceId: ev.sourceId,
            verificationStatus: ev.verificationStatus,
            metadata: (ev.metadata ?? {}) as object,
          },
        });
      }

      // 2. Insert new custody records idempotently
      for (const cr of newCustody) {
        await tx.dPPCustodyRecord.create({
          data: {
            dppId: dpp.id,
            lotId: lot.id,
            milestone: cr.milestone,
            fromOrganisationId: cr.fromOrganisationId,
            toOrganisationId: cr.toOrganisationId,
            sourceType: cr.sourceType,
            sourceId: cr.sourceId,
            occurredAt: cr.occurredAt,
            location: cr.location,
            notes: cr.notes,
          },
        });
      }

      // 3. If material change, create new DPPVersion
      if (hasMaterialChange) {
        const nextVersionNumber = (previousVersion?.versionNumber ?? 0) + 1;
        const newVersion = await tx.dPPVersion.create({
          data: {
            dppId: dpp.id,
            versionNumber: nextVersionNumber,
            snapshot: newSnapshot as unknown as object,
            previousVersionId: previousVersion?.id ?? null,
            changeReason: `Authoritative synchronization: ${newEvents.length} new event(s), updated operational status`,
            createdByUserId: actor.userId,
          },
        });

        await tx.digitalProductPassport.update({
          where: { id: dpp.id },
          data: {
            currentVersionNumber: nextVersionNumber,
            currentVersionId: newVersion.id,
            updatedAt: new Date(),
          },
        });

        await this.auditWriter.append(
          {
            eventType: "dpp.version.created",
            outcome: "succeeded",
            actor: { type: "user", userId: actor.userId },
            target: { type: "dpp_version", id: newVersion.id },
            correlationId: randomUUID(),
            occurredAt: new Date(),
            metadata: {
              dppId: dpp.id,
              versionNumber: String(nextVersionNumber),
            },
          },
          tx,
        );
      }

      // 4. Audit sync
      await this.auditWriter.append(
        {
          eventType: "dpp.passport.synchronized",
          outcome: "succeeded",
          actor: { type: "user", userId: actor.userId },
          target: { type: "dpp", id: dpp.id },
          correlationId: randomUUID(),
          occurredAt: new Date(),
          metadata: {
            passportNumber: dpp.passportNumber,
            newEventsCount: String(newEvents.length),
            hasMaterialChange: String(hasMaterialChange),
          },
        },
        tx,
      );
    });

    return this.getPassportById(dpp.id, actor);
  }

  // ── PRIVATE HELPERS ───────────────────────────────────────────

  private async assertLotAccess(
    lot: { supplierOrganisationId: string; listingId: string },
    actor: AuthenticatedUser,
  ): Promise<void> {
    if (actor.role === "TRADER") return;

    if (actor.role === "SUPPLIER") {
      if (actor.organisationId !== lot.supplierOrganisationId) {
        throw new ForbiddenException("Access denied to another supplier's lot.");
      }
      return;
    }

    if (actor.role === "BUYER") {
      if (!actor.organisationId) {
        throw new ForbiddenException("Buyer organisation required.");
      }
      const trade = await this.prisma.trade.findFirst({
        where: {
          listingId: lot.listingId,
          buyerOrganisationId: actor.organisationId,
        },
      });
      if (!trade) {
        throw new ForbiddenException("Access denied. Buyer is not part of any transaction for this lot.");
      }
      return;
    }

    throw new ForbiddenException("Access denied to this lot.");
  }

  private async fetchAuthoritativeDataForLot(listingId: string, supplierOrganisationId: string) {
    const trades = await this.prisma.trade.findMany({
      where: { listingId },
      include: {
        buyerOrganisation: true,
        contract: {
          include: {
            shipments: {
              include: {
                trackingEvents: {
                  orderBy: { occurredAt: "asc" },
                },
                selectedFreightQuotation: {
                  include: {
                    providerUser: {
                      select: {
                        email: true,
                        memberships: {
                          select: { organisation: { select: { id: true, name: true } } },
                          take: 1,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const tradeIds = trades.map((t) => t.id);

    const inspections = await this.prisma.inspection.findMany({
      where: {
        OR: [{ listingId }, { tradeId: { in: tradeIds } }],
      },
      include: {
        qualityResult: true,
        certificate: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const complianceDocs = await this.prisma.complianceDocument.findMany({
      where: { organisationId: supplierOrganisationId },
      orderBy: { createdAt: "asc" },
    });

    return {
      trades,
      inspections,
      complianceDocs,
    };
  }

  private projectEvents(
    lot: {
      id: string;
      createdAt: Date;
      supplierOrganisationId: string;
      createdByUserId: string;
      countryOfOrigin: string | null;
      regionOfOrigin: string | null;
    },
    authData: Awaited<ReturnType<DppService["fetchAuthoritativeDataForLot"]>>,
  ) {
    const events: Array<{
      eventType: DPPEventType;
      occurredAt: Date;
      location: string | null;
      responsibleOrganisationId: string | null;
      responsibleUserId: string | null;
      sourceType: string;
      sourceId: string;
      verificationStatus: DPPVerificationStatus;
      metadata?: Record<string, unknown>;
    }> = [];

    // 1. LOT_CREATED
    events.push({
      eventType: "LOT_CREATED",
      occurredAt: lot.createdAt,
      location: lot.regionOfOrigin
        ? `${lot.regionOfOrigin}, ${lot.countryOfOrigin ?? ""}`.trim()
        : lot.countryOfOrigin ?? null,
      responsibleOrganisationId: lot.supplierOrganisationId,
      responsibleUserId: lot.createdByUserId,
      sourceType: "lot",
      sourceId: lot.id,
      verificationStatus: "RECORDED",
    });

    // 2. Inspections & Quality Results
    for (const insp of authData.inspections) {
      if (insp.status === "COMPLETED") {
        events.push({
          eventType: "INSPECTION_COMPLETED",
          occurredAt: insp.completedAt ?? insp.updatedAt,
          location: insp.latitude && insp.longitude ? `${insp.latitude}, ${insp.longitude}` : null,
          responsibleOrganisationId: null,
          responsibleUserId: insp.assignedInspectorUserId,
          sourceType: "inspection",
          sourceId: insp.id,
          verificationStatus: "RECORDED",
        });
      }

      if (insp.qualityResult) {
        if (insp.qualityResult.decision === "APPROVED") {
          events.push({
            eventType: "QUALITY_RESULT_APPROVED",
            occurredAt: insp.qualityResult.decidedAt,
            location: null,
            responsibleOrganisationId: null,
            responsibleUserId: insp.qualityResult.decidedByUserId,
            sourceType: "quality_result",
            sourceId: insp.qualityResult.id,
            verificationStatus: "VERIFIED",
            metadata: {
              classificationLabel: insp.qualityResult.classificationLabel,
              certificateNumber: insp.certificate?.certificateNumber ?? null,
            },
          });
        } else if (insp.qualityResult.decision === "REJECTED") {
          events.push({
            eventType: "QUALITY_RESULT_REJECTED",
            occurredAt: insp.qualityResult.decidedAt,
            location: null,
            responsibleOrganisationId: null,
            responsibleUserId: insp.qualityResult.decidedByUserId,
            sourceType: "quality_result",
            sourceId: insp.qualityResult.id,
            verificationStatus: "VERIFIED",
            metadata: {
              rejectionReason: insp.qualityResult.decisionNotes ?? null,
            },
          });
        }
      }
    }

    // 3. Trades, Contracts & Shipments
    for (const trade of authData.trades) {
      events.push({
        eventType: "TRADE_CREATED",
        occurredAt: trade.createdAt,
        location: null,
        responsibleOrganisationId: trade.buyerOrganisationId,
        responsibleUserId: trade.createdByUserId,
        sourceType: "trade",
        sourceId: trade.id,
        verificationStatus: "RECORDED",
      });

      if (trade.contract) {
        if (trade.contract.status === "CONFIRMED") {
          events.push({
            eventType: "CONTRACT_CONFIRMED",
            occurredAt: trade.contract.confirmedAt ?? trade.contract.updatedAt,
            location: null,
            responsibleOrganisationId: null,
            responsibleUserId: trade.contract.confirmedByUserId ?? trade.contract.createdByUserId,
            sourceType: "contract",
            sourceId: trade.contract.id,
            verificationStatus: "VERIFIED",
          });
        }

        for (const shipment of trade.contract.shipments) {
          events.push({
            eventType: "SHIPMENT_CREATED",
            occurredAt: shipment.createdAt,
            location: shipment.origin,
            responsibleOrganisationId: null,
            responsibleUserId: shipment.createdByUserId,
            sourceType: "shipment",
            sourceId: shipment.id,
            verificationStatus: "RECORDED",
          });

          for (const te of shipment.trackingEvents) {
            let evType: DPPEventType | null = null;
            let verifStatus: DPPVerificationStatus = "RECORDED";

            switch (te.resultingStatus) {
              case "PICKED_UP":
                evType = "SHIPMENT_PICKED_UP";
                break;
              case "IN_TRANSIT":
                evType = "SHIPMENT_IN_TRANSIT";
                break;
              case "CUSTOMS":
                evType = "SHIPMENT_CUSTOMS";
                break;
              case "DELAYED":
                evType = "SHIPMENT_DELAYED";
                break;
              case "DELIVERED":
                evType = "SHIPMENT_DELIVERED";
                verifStatus = "VERIFIED";
                break;
              case "DISPUTED":
                evType = "SHIPMENT_DISPUTED";
                break;
              case "CLOSED":
                evType = "SHIPMENT_CLOSED";
                verifStatus = "VERIFIED";
                break;
            }

            if (evType) {
              events.push({
                eventType: evType,
                occurredAt: te.occurredAt,
                location: te.location ?? shipment.destination ?? null,
                responsibleOrganisationId: null,
                responsibleUserId: te.actorUserId,
                sourceType: "shipment_tracking_event",
                sourceId: te.id,
                verificationStatus: verifStatus,
                metadata: te.notes ? { notes: te.notes } : undefined,
              });
            }
          }
        }
      }
    }

    return events.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }

  private projectCustody(
    lot: {
      id: string;
      createdAt: Date;
      supplierOrganisationId: string;
      countryOfOrigin: string | null;
      regionOfOrigin: string | null;
    },
    authData: Awaited<ReturnType<DppService["fetchAuthoritativeDataForLot"]>>,
  ) {
    const custody: Array<{
      milestone: DPPCustodyMilestone;
      fromOrganisationId: string | null;
      toOrganisationId: string | null;
      sourceType: string;
      sourceId: string;
      occurredAt: Date;
      location: string | null;
      notes: string | null;
    }> = [];

    // Milestone 1: SUPPLIER_ORIGIN
    custody.push({
      milestone: "SUPPLIER_ORIGIN",
      fromOrganisationId: null,
      toOrganisationId: lot.supplierOrganisationId,
      sourceType: "lot",
      sourceId: lot.id,
      occurredAt: lot.createdAt,
      location: lot.regionOfOrigin
        ? `${lot.regionOfOrigin}, ${lot.countryOfOrigin ?? ""}`.trim()
        : lot.countryOfOrigin ?? null,
      notes: "Origin harvest / lot created by producer",
    });

    // Milestone 2: TRADE_COMMERCIAL_TRANSFER
    for (const trade of authData.trades) {
      custody.push({
        milestone: "TRADE_COMMERCIAL_TRANSFER",
        fromOrganisationId: trade.supplierOrganisationId,
        toOrganisationId: trade.buyerOrganisationId,
        sourceType: "trade",
        sourceId: trade.id,
        occurredAt: trade.acceptedAt,
        location: null,
        notes: `Commercial transaction agreed under Trade ${trade.tradeNumber}`,
      });

      // Milestone 3: LOGISTICS_CARRIER_CUSTODY & Milestone 4: BUYER_DELIVERY_RECEIPT
      if (trade.contract) {
        for (const shipment of trade.contract.shipments) {
          const carrierOrgId = shipment.selectedFreightQuotation?.providerUser?.memberships?.[0]?.organisation?.id ?? null;
          if (shipment.actualPickupAt || shipment.status === "PICKED_UP" || shipment.status === "IN_TRANSIT" || shipment.status === "DELIVERED" || shipment.status === "CLOSED") {
            custody.push({
              milestone: "LOGISTICS_CARRIER_CUSTODY",
              fromOrganisationId: trade.supplierOrganisationId,
              toOrganisationId: carrierOrgId,
              sourceType: "shipment",
              sourceId: shipment.id,
              occurredAt: shipment.actualPickupAt ?? shipment.scheduledPickupAt ?? shipment.createdAt,
              location: shipment.origin,
              notes: `Cargo picked up by logistics carrier for shipment ${shipment.shipmentNumber}`,
            });
          }

          if (shipment.deliveredAt || shipment.status === "DELIVERED" || shipment.status === "CLOSED") {
            custody.push({
              milestone: "BUYER_DELIVERY_RECEIPT",
              fromOrganisationId: carrierOrgId ?? trade.supplierOrganisationId,
              toOrganisationId: trade.buyerOrganisationId,
              sourceType: "shipment",
              sourceId: shipment.id,
              occurredAt: shipment.deliveredAt ?? shipment.updatedAt,
              location: shipment.deliveredLocation ?? shipment.destination,
              notes: `Delivery confirmed at destination for shipment ${shipment.shipmentNumber}`,
            });
          }
        }
      }
    }

    return custody.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }

  private buildSnapshot(
    passportNumber: string,
    lot: {
      id: string;
      lotNumber: string;
      materialType: string;
      productForm: string | null;
      batchReference: string | null;
      quantity: number;
      quantityUnit: string;
      countryOfOrigin: string | null;
      regionOfOrigin: string | null;
      productionDate: Date | null;
      supplierOrganisation: { id: string; name: string };
      productionSite?: { name: string; address: string | null; city: string | null; country: string | null } | null;
    },
    authData: Awaited<ReturnType<DppService["fetchAuthoritativeDataForLot"]>>,
    custody: Array<{
      milestone: string;
      fromOrganisationId: string | null;
      toOrganisationId: string | null;
      occurredAt: Date;
      location: string | null;
    }>,
  ): DPPSnapshot {
    return {
      identity: {
        passportNumber,
        lotNumber: lot.lotNumber,
        materialType: lot.materialType,
        productForm: lot.productForm,
        batchReference: lot.batchReference,
        quantity: lot.quantity,
        quantityUnit: lot.quantityUnit,
      },
      origin: {
        supplierOrganisationId: lot.supplierOrganisation.id,
        supplierName: lot.supplierOrganisation.name,
        supplierCountry: lot.countryOfOrigin,
        productionSiteName: lot.productionSite?.name ?? null,
        productionSiteAddress: lot.productionSite?.address
          ? `${lot.productionSite.address}, ${lot.productionSite.city ?? ""}`.trim()
          : null,
        countryOfOrigin: lot.countryOfOrigin,
        regionOfOrigin: lot.regionOfOrigin,
        productionDate: toIsoOrNull(lot.productionDate),
      },
      quality: {
        inspections: authData.inspections.map((i) => ({
          inspectionReference: i.inspectionReference,
          status: i.status,
          decision: i.qualityResult?.decision ?? null,
          humanClassificationLabel: i.qualityResult?.classificationLabel ?? null,
          certificateReference: i.certificate?.certificateNumber ?? null,
          completedAt: toIsoOrNull(i.completedAt),
          summary: i.assessmentSummary ?? null,
        })),
      },
      certifications: authData.complianceDocs.map((d) => ({
        documentType: d.documentType,
        originalFilename: d.originalFilename,
        status: d.status,
      })),
      transaction: authData.trades.map((t) => ({
        tradeNumber: t.tradeNumber,
        buyerOrganisationName: t.buyerOrganisation.name,
        acceptedAt: toIso(t.acceptedAt),
        materialType: t.materialType,
        quantity: t.quantity,
        quantityUnit: t.quantityUnit,
      })),
      logistics: authData.trades.flatMap((t) =>
        t.contract?.shipments.map((s) => ({
          shipmentNumber: s.shipmentNumber,
          origin: s.origin,
          destination: s.destination,
          carrierName:
            s.selectedFreightQuotation?.providerUser?.memberships?.[0]?.organisation?.name ??
            s.selectedFreightQuotation?.providerUser?.email ??
            null,
          status: s.status,
          actualPickupAt: toIsoOrNull(s.actualPickupAt),
          deliveredAt: toIsoOrNull(s.deliveredAt),
        })) ?? [],
      ),
      custodyMilestones: custody.map((c) => ({
        milestone: c.milestone,
        fromParty: c.fromOrganisationId,
        toParty: c.toOrganisationId,
        occurredAt: toIso(c.occurredAt),
        location: c.location,
      })),
    };
  }

  private hasMaterialSnapshotChange(
    prev: DPPSnapshot | undefined,
    current: DPPSnapshot,
  ): boolean {
    if (!prev) return true;

    // Compare quality inspections
    if (JSON.stringify(prev.quality) !== JSON.stringify(current.quality)) return true;

    // Compare transaction milestone
    if (JSON.stringify(prev.transaction) !== JSON.stringify(current.transaction)) return true;

    // Compare logistics shipments and status
    if (JSON.stringify(prev.logistics) !== JSON.stringify(current.logistics)) return true;

    // Compare certifications
    if (JSON.stringify(prev.certifications) !== JSON.stringify(current.certifications)) return true;

    // Compare custody milestones
    if (JSON.stringify(prev.custodyMilestones) !== JSON.stringify(current.custodyMilestones)) return true;

    return false;
  }

  private mapLotToResponse(lot: {
    id: string;
    lotNumber: string;
    listingId: string;
    supplierOrganisationId: string;
    productionSiteId: string | null;
    materialType: string;
    productForm: string | null;
    quantity: number;
    quantityUnit: string;
    countryOfOrigin: string | null;
    regionOfOrigin: string | null;
    productionDate: Date | null;
    batchReference: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId: string;
    listing?: { title: string } | null;
    supplierOrganisation?: { name: string } | null;
    productionSite?: { name: string } | null;
    dpp?: { id: string; passportNumber: string } | null;
  }): TraceableLotResponse {
    return {
      id: lot.id,
      lotNumber: lot.lotNumber,
      listingId: lot.listingId,
      supplierOrganisationId: lot.supplierOrganisationId,
      productionSiteId: lot.productionSiteId,
      materialType: lot.materialType,
      productForm: lot.productForm,
      quantity: lot.quantity,
      quantityUnit: lot.quantityUnit,
      countryOfOrigin: lot.countryOfOrigin,
      regionOfOrigin: lot.regionOfOrigin,
      productionDate: toIsoOrNull(lot.productionDate),
      batchReference: lot.batchReference,
      notes: lot.notes,
      createdAt: toIso(lot.createdAt),
      updatedAt: toIso(lot.updatedAt),
      createdByUserId: lot.createdByUserId,
      hasDpp: Boolean(lot.dpp),
      dppId: lot.dpp?.id ?? null,
      dppNumber: lot.dpp?.passportNumber ?? null,
      listingTitle: lot.listing?.title ?? null,
      supplierName: lot.supplierOrganisation?.name ?? null,
      productionSiteName: lot.productionSite?.name ?? null,
    };
  }

  private mapDppToResponse(dpp: {
    id: string;
    passportNumber: string;
    lotId: string;
    status: string;
    currentVersionNumber: number;
    currentVersionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdByUserId: string;
    lot: Parameters<DppService["mapLotToResponse"]>[0];
    versions?: Array<{ snapshot: unknown }>;
    _count?: { events: number; versions: number };
  }): DigitalProductPassportResponse {
    const currentSnapshot = dpp.versions?.[0]?.snapshot as DPPSnapshot | undefined;

    return {
      id: dpp.id,
      passportNumber: dpp.passportNumber,
      lotId: dpp.lotId,
      status: dpp.status,
      currentVersionNumber: dpp.currentVersionNumber,
      currentVersionId: dpp.currentVersionId,
      createdAt: toIso(dpp.createdAt),
      updatedAt: toIso(dpp.updatedAt),
      createdByUserId: dpp.createdByUserId,
      lot: this.mapLotToResponse(dpp.lot),
      currentSnapshot: currentSnapshot ?? null,
      eventsCount: dpp._count?.events ?? 0,
      versionsCount: dpp._count?.versions ?? 0,
    };
  }
}
