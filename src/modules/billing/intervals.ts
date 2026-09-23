import { z } from "zod";

export const billingIntervalValues = [1, 12] as const;
export type BillingIntervalMonths = (typeof billingIntervalValues)[number];

export type BillingPlanSnapshot = {
  monthlyPriceCents: number | null;
  annualBillingEnabled: boolean;
  annualDiscountBasisPoints: number;
};

export function calculateBillingSnapshot(
  plan: BillingPlanSnapshot,
  requestedInterval: unknown,
) {
  const billingIntervalMonths = z
    .union([z.literal(1), z.literal(12)])
    .parse(Number(requestedInterval));
  const monthlyPriceCents = z
    .number()
    .int()
    .nonnegative()
    .parse(plan.monthlyPriceCents);
  const annualDiscountBasisPoints = z
    .number()
    .int()
    .min(0)
    .max(5000)
    .parse(plan.annualDiscountBasisPoints);

  if (billingIntervalMonths === 12 && !plan.annualBillingEnabled)
    throw new Error("Für dieses Paket ist keine Jahreszahlung verfügbar.");

  const discountBasisPointsSnapshot =
    billingIntervalMonths === 12 ? annualDiscountBasisPoints : 0;
  const undiscountedCents = monthlyPriceCents * billingIntervalMonths;
  const billingAmountCentsSnapshot = Math.round(
    (undiscountedCents * (10_000 - discountBasisPointsSnapshot)) / 10_000,
  );

  return {
    billingIntervalMonths,
    billingAmountCentsSnapshot,
    discountBasisPointsSnapshot,
    savingsCents: undiscountedCents - billingAmountCentsSnapshot,
  };
}
