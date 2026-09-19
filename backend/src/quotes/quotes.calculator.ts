import { BadRequestException } from "@nestjs/common";
import type { CommercialBreakdown } from "./contracts";

export function validateAndCalculateQuoteTotal(breakdown: CommercialBreakdown): {
  validatedBreakdown: CommercialBreakdown;
  totalAmount: number;
} {
  if (!breakdown || typeof breakdown !== "object") {
    throw new BadRequestException({
      type: "https://errors.idogrow.com/quotes/invalid-breakdown",
      title: "Invalid Commercial Breakdown",
      status: 400,
      detail: "Commercial breakdown is required.",
    });
  }

  const fields: (keyof CommercialBreakdown)[] = [
    "productValue",
    "idoGrowMarginCommission",
    "inspectionCost",
    "packagingCost",
    "inlandTransportCost",
    "internationalFreightCost",
    "customsCost",
    "insuranceCost",
    "storageCost",
    "taxAmount",
    "otherServiceFees",
  ];

  const validated: Partial<CommercialBreakdown> = {};

  for (const field of fields) {
    const rawVal = breakdown[field];
    const num = Number(rawVal ?? 0);

    if (typeof num !== "number" || Number.isNaN(num)) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/invalid-cost-item",
        title: "Invalid Cost Line Item",
        status: 400,
        detail: `Field '${field}' must be a valid numeric value.`,
      });
    }

    if (num < 0) {
      throw new BadRequestException({
        type: "https://errors.idogrow.com/quotes/negative-cost",
        title: "Negative Cost Rejected",
        status: 400,
        detail: `Field '${field}' cannot be negative (received ${num}).`,
      });
    }

    validated[field] = Math.round(num * 100) / 100;
  }

  // Product value must be strictly positive
  if (!validated.productValue || validated.productValue <= 0) {
    throw new BadRequestException({
      type: "https://errors.idogrow.com/quotes/product-value-required",
      title: "Product Value Required",
      status: 400,
      detail: "Product value must be greater than zero.",
    });
  }

  const validBreakdown = validated as CommercialBreakdown;

  const total =
    validBreakdown.productValue +
    validBreakdown.idoGrowMarginCommission +
    validBreakdown.inspectionCost +
    validBreakdown.packagingCost +
    validBreakdown.inlandTransportCost +
    validBreakdown.internationalFreightCost +
    validBreakdown.customsCost +
    validBreakdown.insuranceCost +
    validBreakdown.storageCost +
    validBreakdown.taxAmount +
    validBreakdown.otherServiceFees;

  const roundedTotal = Math.round(total * 100) / 100;

  return {
    validatedBreakdown: validBreakdown,
    totalAmount: roundedTotal,
  };
}
