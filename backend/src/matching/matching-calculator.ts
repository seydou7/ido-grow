import type {
  CertificationCompatibilityStatus,
  CompatibilityStatus,
  DeterministicCompatibilityIndicators,
  OriginCompatibilityStatus,
  QuantityCoverageStatus,
} from "./contracts";

export interface DemandRequirement {
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  deliveryCountry: string | null;
  targetPriceAmount: number | null;
  currency: string;
  targetPriceUnit: string;
  acceptableOriginCountries: string | null;
  certificationRequirements?: string | null;
}

export interface SupplyOffer {
  materialType: string;
  productForm: string | null;
  quantity: number;
  quantityUnit: string;
  priceAmount: number | null;
  currency: string;
  priceUnit: string;
  originCountry: string | null;
  description?: string | null;
}

export function evaluateDeterministicCompatibility(
  demand: DemandRequirement,
  offer: SupplyOffer,
): DeterministicCompatibilityIndicators {
  // 1. Material compatibility
  const material: CompatibilityStatus =
    demand.materialType.toUpperCase() === offer.materialType.toUpperCase()
      ? "MATCH"
      : "MISMATCH";

  // 2. Product Form compatibility
  let productForm: CompatibilityStatus = "NOT_SPECIFIED";
  if (demand.productForm) {
    if (offer.productForm) {
      productForm =
        demand.productForm.toUpperCase() === offer.productForm.toUpperCase()
          ? "MATCH"
          : "MISMATCH";
    } else {
      productForm = "NOT_SPECIFIED";
    }
  } else {
    productForm = "NOT_SPECIFIED";
  }

  // 3. Quantity coverage
  let quantity: QuantityCoverageStatus = "UNKNOWN";
  const quantityRequested = demand.quantity > 0 ? demand.quantity : 1;
  const quantityAvailable = offer.quantity >= 0 ? offer.quantity : 0;
  const quantityRatio =
    Math.round((quantityAvailable / quantityRequested) * 100) / 100;

  if (demand.quantityUnit.toUpperCase() === offer.quantityUnit.toUpperCase()) {
    if (quantityAvailable >= quantityRequested) {
      quantity = "SUFFICIENT";
    } else {
      quantity = "INSUFFICIENT";
    }
  } else {
    // If different units or unknown conversion
    quantity = quantityAvailable >= quantityRequested ? "SUFFICIENT" : "INSUFFICIENT";
  }

  // 4. Origin compatibility
  let origin: OriginCompatibilityStatus = "NOT_SPECIFIED";
  if (demand.acceptableOriginCountries && demand.acceptableOriginCountries.trim().length > 0) {
    if (offer.originCountry && offer.originCountry.trim().length > 0) {
      const acceptableOrigins = demand.acceptableOriginCountries
        .split(/[,\s/]+/)
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);

      const offerOrigin = offer.originCountry.trim().toUpperCase();

      const matched = acceptableOrigins.some(
        (acc) =>
          acc === offerOrigin ||
          offerOrigin.includes(acc) ||
          acc.includes(offerOrigin),
      );

      origin = matched ? "ACCEPTABLE" : "NOT_ACCEPTABLE";
    } else {
      origin = "NOT_SPECIFIED";
    }
  } else {
    origin = "NOT_SPECIFIED";
  }

  // 5. Certification compatibility
  let certification: CertificationCompatibilityStatus = "NOT_REQUIRED";
  if (
    demand.certificationRequirements &&
    demand.certificationRequirements.trim().length > 0
  ) {
    // Deterministic check against listing description or text
    const req = demand.certificationRequirements.toLowerCase();
    const desc = (offer.description || "").toLowerCase();
    if (desc.includes(req) || req === "none" || req === "n/a") {
      certification = "MATCH";
    } else {
      certification = "MISSING";
    }
  } else {
    certification = "NOT_REQUIRED";
  }

  // 6. Price comparison
  let priceDifference: number | null = null;
  if (
    demand.targetPriceAmount !== null &&
    offer.priceAmount !== null &&
    demand.currency.toUpperCase() === offer.currency.toUpperCase() &&
    demand.targetPriceUnit.toUpperCase() === offer.priceUnit.toUpperCase()
  ) {
    priceDifference =
      Math.round((offer.priceAmount - demand.targetPriceAmount) * 100) / 100;
  }

  return {
    material,
    productForm,
    quantity,
    quantityAvailable,
    quantityRequested,
    quantityRatio,
    origin,
    certification,
    priceComparison: {
      targetPriceAmount: demand.targetPriceAmount,
      targetPriceUnit: demand.targetPriceUnit,
      listingPriceAmount: offer.priceAmount,
      listingPriceUnit: offer.priceUnit,
      currency: offer.currency || demand.currency || "EUR",
      priceDifference,
    },
  };
}
