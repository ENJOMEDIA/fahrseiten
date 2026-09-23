import { describe, expect, it } from "vitest";

import { calculateBillingSnapshot } from "./intervals";

const plan = {
  monthlyPriceCents: 4999,
  annualBillingEnabled: true,
  annualDiscountBasisPoints: 1000,
};

describe("calculateBillingSnapshot", () => {
  it("keeps the monthly price without a discount", () => {
    expect(calculateBillingSnapshot(plan, 1)).toEqual({
      billingIntervalMonths: 1,
      billingAmountCentsSnapshot: 4999,
      discountBasisPointsSnapshot: 0,
      savingsCents: 0,
    });
  });

  it("stores the exact annual amount and discount as a snapshot", () => {
    expect(calculateBillingSnapshot(plan, 12)).toEqual({
      billingIntervalMonths: 12,
      billingAmountCentsSnapshot: 53_989,
      discountBasisPointsSnapshot: 1000,
      savingsCents: 5_999,
    });
  });

  it("rejects annual billing when the plan does not offer it", () => {
    expect(() =>
      calculateBillingSnapshot({ ...plan, annualBillingEnabled: false }, 12),
    ).toThrow("keine Jahreszahlung");
  });
});
