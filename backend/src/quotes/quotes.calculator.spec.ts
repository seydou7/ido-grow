import { BadRequestException } from "@nestjs/common";
import { validateAndCalculateQuoteTotal } from "./quotes.calculator";
import type { CommercialBreakdown } from "./contracts";

describe("validateAndCalculateQuoteTotal", () => {
  const validBreakdown: CommercialBreakdown = {
    productValue: 12000,
    idoGrowMarginCommission: 600,
    inspectionCost: 150,
    packagingCost: 200,
    inlandTransportCost: 350,
    internationalFreightCost: 800,
    customsCost: 250,
    insuranceCost: 100,
    storageCost: 75,
    taxAmount: 1452.5,
    otherServiceFees: 50,
  };

  it("correctly sums all 11 breakdown fields into rounded total", () => {
    const result = validateAndCalculateQuoteTotal(validBreakdown);
    expect(result.totalAmount).toBe(16027.5);
    expect(result.validatedBreakdown.productValue).toBe(12000);
    expect(result.validatedBreakdown.otherServiceFees).toBe(50);
  });

  it("handles zero values for optional cost items", () => {
    const breakdown: CommercialBreakdown = {
      productValue: 5000,
      idoGrowMarginCommission: 250,
      inspectionCost: 0,
      packagingCost: 0,
      inlandTransportCost: 0,
      internationalFreightCost: 0,
      customsCost: 0,
      insuranceCost: 0,
      storageCost: 0,
      taxAmount: 0,
      otherServiceFees: 0,
    };
    const result = validateAndCalculateQuoteTotal(breakdown);
    expect(result.totalAmount).toBe(5250);
  });

  it("rejects non-positive product value", () => {
    expect(() =>
      validateAndCalculateQuoteTotal({ ...validBreakdown, productValue: 0 })
    ).toThrow(BadRequestException);

    expect(() =>
      validateAndCalculateQuoteTotal({ ...validBreakdown, productValue: -100 })
    ).toThrow(BadRequestException);
  });

  it("rejects negative cost items", () => {
    expect(() =>
      validateAndCalculateQuoteTotal({
        ...validBreakdown,
        inspectionCost: -25,
      })
    ).toThrow(BadRequestException);
  });

  it("rejects non-numeric values", () => {
    expect(() =>
      validateAndCalculateQuoteTotal({
        ...validBreakdown,
        customsCost: "abc" as unknown as number,
      })
    ).toThrow(BadRequestException);
  });

  it("rejects missing breakdown", () => {
    expect(() =>
      validateAndCalculateQuoteTotal(null as unknown as CommercialBreakdown)
    ).toThrow(BadRequestException);
  });
});
