import { Readable } from "stream";
import { AuthenticationProblem } from "../authentication/authentication-problem";
import type { AuthenticationService } from "../authentication/authentication.service";
import type { ContractDetail } from "./contracts.contracts";
import { ContractsController } from "./contracts.controller";
import type { ContractsService } from "./contracts.service";

describe("ContractsController", () => {
  let controller: ContractsController;
  let authenticationServiceMock: jest.Mocked<AuthenticationService>;
  let contractsServiceMock: jest.Mocked<ContractsService>;

  const traderUserId = "00000000-0000-4000-8000-000000000001";
  const traderToken = "T".repeat(43);
  const validCookie = `ido_grow_session=${traderToken}`;
  const contractId = "ctr-123";
  const tradeId = "trade-456";

  const sampleContractDetail: ContractDetail = {
    id: contractId,
    contractNumber: "CTR-20261001-A1B2C3D4",
    tradeId,
    tradeNumber: "TRD-20260918-0001",
    quoteNumber: "QUO-20260917-0001",
    acceptedQuoteVersionId: "qv-1",
    acceptedQuoteVersionNumber: 1,
    buyerOrganisationId: "buyer-org-1",
    buyerOrganisationName: "Buyer Corp",
    supplierOrganisationId: "supplier-org-1",
    supplierOrganisationName: "Supplier Corp",
    materialType: "HEMP",
    productForm: "STRAW_RETTED",
    quantity: 50,
    quantityUnit: "TONNES",
    currency: "EUR",
    acceptedCommercialAmount: 25000,
    acceptedTolerance: "+/- 5%",
    incoterm: "FCA",
    qualityConditions: "Standard retted straw",
    inspectionMethod: "ON_SITE",
    pickupDate: "2026-10-10T10:00:00.000Z",
    deliveryDate: "2026-10-15T15:00:00.000Z",
    paymentTerms: "14_DAYS_NET",
    claimsProcess: "Standard",
    requiredDocuments: "CMR",
    cancellationConditions: "None",
    governingLaw: "Dutch law",
    status: "DRAFT",
    confirmedAt: null,
    confirmedByUserId: null,
    hasDocument: false,
    documentGeneratedAt: null,
    buyerSignatureStatus: "UNSIGNED",
    supplierSignatureStatus: "UNSIGNED",
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
  };

  beforeEach(() => {
    authenticationServiceMock = {
      resolveIdentity: jest.fn().mockResolvedValue({
        userId: traderUserId,
        email: "trader@idogrow.com",
      }),
    } as unknown as jest.Mocked<AuthenticationService>;

    contractsServiceMock = {
      createContract: jest.fn().mockResolvedValue(sampleContractDetail),
      getContracts: jest.fn().mockResolvedValue({ items: [sampleContractDetail], total: 1 }),
      getContractById: jest.fn().mockResolvedValue(sampleContractDetail),
      getContractByTradeId: jest.fn().mockResolvedValue(sampleContractDetail),
      updateContractDraft: jest.fn().mockResolvedValue(sampleContractDetail),
      confirmContract: jest.fn().mockResolvedValue({ ...sampleContractDetail, status: "CONFIRMED" }),
      getContractDocument: jest.fn().mockResolvedValue({
        file: {
          stream: Readable.from(Buffer.from("%PDF-1.4 test")),
          mimeType: "application/pdf",
          originalFilename: "CTR-20261001-A1B2C3D4.pdf",
          fileSize: 15,
          createdAt: new Date(),
        },
        filename: "CTR-20261001-A1B2C3D4.pdf",
      }),
    } as unknown as jest.Mocked<ContractsService>;

    controller = new ContractsController(
      authenticationServiceMock,
      contractsServiceMock,
    );
  });

  it("POST /trades/:tradeId/contract creates a contract", async () => {
    const result = await controller.createContractForTrade(validCookie, tradeId);
    expect(contractsServiceMock.createContract).toHaveBeenCalledWith(traderUserId, tradeId);
    expect(result.id).toBe(contractId);
  });

  it("POST /contracts creates a contract from body", async () => {
    const result = await controller.createContract(validCookie, { tradeId });
    expect(contractsServiceMock.createContract).toHaveBeenCalledWith(traderUserId, tradeId);
    expect(result.id).toBe(contractId);
  });

  it("GET /contracts retrieves contract collection", async () => {
    const result = await controller.getContracts(validCookie);
    expect(contractsServiceMock.getContracts).toHaveBeenCalledWith(traderUserId);
    expect(result.items.length).toBe(1);
  });

  it("GET /contracts/:id retrieves contract detail", async () => {
    const result = await controller.getContractById(validCookie, contractId);
    expect(contractsServiceMock.getContractById).toHaveBeenCalledWith(traderUserId, contractId);
    expect(result.id).toBe(contractId);
  });

  it("GET /contracts/by-trade/:tradeId retrieves contract by trade id", async () => {
    const result = await controller.getContractByTradeId(validCookie, tradeId);
    expect(contractsServiceMock.getContractByTradeId).toHaveBeenCalledWith(traderUserId, tradeId);
    expect(result.id).toBe(contractId);
  });

  it("PATCH /contracts/:id updates draft contract terms", async () => {
    const updateInput = { acceptedTolerance: "+/- 3%" };
    await controller.updateContractDraft(validCookie, contractId, updateInput);
    expect(contractsServiceMock.updateContractDraft).toHaveBeenCalledWith(
      traderUserId,
      contractId,
      updateInput,
    );
  });

  it("POST /contracts/:id/confirm confirms contract", async () => {
    const result = await controller.confirmContract(validCookie, contractId);
    expect(contractsServiceMock.confirmContract).toHaveBeenCalledWith(traderUserId, contractId);
    expect(result.status).toBe("CONFIRMED");
  });

  it("GET /contracts/:id/document streams the PDF file with proper headers", async () => {
    const setHeadersMock = jest.fn();
    const resMock = { set: setHeadersMock };

    const streamable = await controller.getContractDocument(validCookie, contractId, resMock);
    expect(contractsServiceMock.getContractDocument).toHaveBeenCalledWith(traderUserId, contractId);
    expect(setHeadersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        "Content-Type": "application/pdf",
        "Content-Disposition": expect.stringContaining("CTR-20261001-A1B2C3D4.pdf"),
      }),
    );
    expect(streamable).toBeDefined();
  });

  it("rejects unauthenticated requests with 401 AuthenticationProblem", async () => {
    authenticationServiceMock.resolveIdentity.mockRejectedValueOnce(
      new AuthenticationProblem(
        401,
        "missing_session_token",
        "Authentication Required",
        "Session token is missing",
      ),
    );

    await expect(controller.getContracts(undefined)).rejects.toThrow(
      AuthenticationProblem,
    );
  });
});
