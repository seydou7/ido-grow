import { evaluateDeterministicCompatibility } from "./matching-calculator";

describe("Deterministic Compatibility Evaluation", () => {
  it("evaluates matching material and product form correctly", () => {
    const demand = {
      materialType: "HEMP",
      productForm: "FIBRE_TECHNICAL",
      quantity: 100,
      quantityUnit: "TONNES",
      deliveryCountry: "FR",
      targetPriceAmount: 1500,
      currency: "EUR",
      targetPriceUnit: "PER_TONNE",
      acceptableOriginCountries: "FR,BE,NL",
      certificationRequirements: "GOTS",
    };

    const offer = {
      materialType: "HEMP",
      productForm: "FIBRE_TECHNICAL",
      quantity: 150,
      quantityUnit: "TONNES",
      priceAmount: 1400,
      currency: "EUR",
      priceUnit: "PER_TONNE",
      originCountry: "FR",
      description: "Organic GOTS certified hemp fibre",
    };

    const result = evaluateDeterministicCompatibility(demand, offer);

    expect(result.material).toBe("MATCH");
    expect(result.productForm).toBe("MATCH");
    expect(result.quantity).toBe("SUFFICIENT");
    expect(result.quantityRatio).toBe(1.5);
    expect(result.origin).toBe("ACCEPTABLE");
    expect(result.certification).toBe("MATCH");
    expect(result.priceComparison.priceDifference).toBe(-100);
  });

  it("evaluates mismatching material and missing product form", () => {
    const demand = {
      materialType: "HEMP",
      productForm: "FIBRE_TECHNICAL",
      quantity: 100,
      quantityUnit: "TONNES",
      deliveryCountry: "FR",
      targetPriceAmount: 1500,
      currency: "EUR",
      targetPriceUnit: "PER_TONNE",
      acceptableOriginCountries: "FR",
      certificationRequirements: null,
    };

    const offer = {
      materialType: "SISAL",
      productForm: null,
      quantity: 50,
      quantityUnit: "TONNES",
      priceAmount: 1600,
      currency: "EUR",
      priceUnit: "PER_TONNE",
      originCountry: "BR",
      description: null,
    };

    const result = evaluateDeterministicCompatibility(demand, offer);

    expect(result.material).toBe("MISMATCH");
    expect(result.productForm).toBe("NOT_SPECIFIED");
    expect(result.quantity).toBe("INSUFFICIENT");
    expect(result.origin).toBe("NOT_ACCEPTABLE");
    expect(result.certification).toBe("NOT_REQUIRED");
    expect(result.priceComparison.priceDifference).toBe(100);
  });

  it("handles unconstrained demand (no form requirement, no origin constraints)", () => {
    const demand = {
      materialType: "FLAX",
      productForm: null,
      quantity: 50,
      quantityUnit: "TONNES",
      deliveryCountry: null,
      targetPriceAmount: null,
      currency: "EUR",
      targetPriceUnit: "PER_TONNE",
      acceptableOriginCountries: null,
      certificationRequirements: null,
    };

    const offer = {
      materialType: "FLAX",
      productForm: "STRAW_RAW",
      quantity: 50,
      quantityUnit: "TONNES",
      priceAmount: 450,
      currency: "EUR",
      priceUnit: "PER_TONNE",
      originCountry: "FR",
    };

    const result = evaluateDeterministicCompatibility(demand, offer);

    expect(result.material).toBe("MATCH");
    expect(result.productForm).toBe("NOT_SPECIFIED");
    expect(result.quantity).toBe("SUFFICIENT");
    expect(result.origin).toBe("NOT_SPECIFIED");
    expect(result.certification).toBe("NOT_REQUIRED");
    expect(result.priceComparison.priceDifference).toBeNull();
  });
});
