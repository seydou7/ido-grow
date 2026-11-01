import { PublicMarketplaceController } from "./public-marketplace.controller";
import { PublicMarketplaceService } from "./public-marketplace.service";

describe("PublicMarketplaceController", () => {
  let controller: PublicMarketplaceController;
  let service: PublicMarketplaceService;

  beforeEach(() => {
    service = {
      listPublicListings: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 0,
        facets: {
          materials: [],
          productForms: [],
          countries: [],
          priceRange: { min: null, max: null },
          quantityRange: { min: null, max: null },
          totalWithDpp: 0,
          totalWithCertifications: 0,
          totalQualityApproved: 0,
        },
      }),
      getPublicListing: jest.fn().mockResolvedValue({
        id: "lst-1",
        title: "Test Hemp",
      }),
    } as unknown as PublicMarketplaceService;

    controller = new PublicMarketplaceController(service);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should parse query parameters and forward to service", async () => {
    await controller.listPublicListings(
      "hemp", // search
      "HEMP", // materialType
      "STRAW_RETTED", // productForm
      "FR", // originCountry
      "2026", // harvestYear
      "10", // minQuantity
      "100", // maxQuantity
      "TONNES", // quantityUnit
      "true", // hasPrice
      "200", // minPrice
      "800", // maxPrice
      "EUR", // priceUnit
      "true", // hasCertifications
      "true", // hasQualityApproved
      "true", // hasDpp
      "PRICE_ASC", // sort
      "2", // page
      "24", // pageSize
    );

    expect(service.listPublicListings).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "hemp",
        materialType: "HEMP",
        productForm: "STRAW_RETTED",
        originCountry: "FR",
        harvestYear: 2026,
        minQuantity: 10,
        maxQuantity: 100,
        quantityUnit: "TONNES",
        hasPrice: true,
        minPrice: 200,
        maxPrice: 800,
        priceUnit: "EUR",
        hasCertifications: true,
        hasQualityApproved: true,
        hasDpp: true,
        sort: "PRICE_ASC",
        page: 2,
        pageSize: 24,
      }),
    );
  });

  it("should get public listing detail by id or slug", async () => {
    const detail = await controller.getPublicListing("lst-1");
    expect(service.getPublicListing).toHaveBeenCalledWith("lst-1");
    expect(detail).toEqual(expect.objectContaining({ id: "lst-1" }));
  });
});
