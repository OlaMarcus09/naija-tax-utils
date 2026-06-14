import { CITResult } from "./types";

/**
 * Company Income Tax (CIT) under the Nigeria Tax Act (NTA) 2025.
 * Effective: January 1, 2026.
 *
 * Key change from Finance Act 2020:
 * - Small company exemption threshold raised from ₦25m → ₦100m turnover
 *   (also requires total fixed assets ≤ ₦250m)
 * - Medium: ₦100m – no new upper band defined; rate unchanged at 20%
 * - Large: > ₦100m turnover → 30%
 */
const CIT_THRESHOLDS_NTA2025 = {
  small: 100_000_000,   // ₦100m (up from ₦25m)
};

/**
 * Calculates Company Income Tax (CIT) under NTA 2025.
 *
 * @param annualTurnover - Total annual revenue in Naira (determines company size)
 * @param taxableProfit - Profit after allowable deductions
 * @param totalFixedAssets - Total fixed assets in Naira (required for small company exemption check)
 * @returns CITResult with size classification and tax payable
 *
 * @example
 * // Small company (fully exempt under NTA 2025)
 * calculateCIT(50_000_000, 5_000_000, 100_000_000)
 * // { companySize: 'small', taxAmount: 0, isExempt: true }
 *
 * @example
 * // Large company
 * calculateCIT(200_000_000, 40_000_000)
 * // { companySize: 'large', taxAmount: 12_000_000, effectiveRate: 30 }
 */
export function calculateCIT(
  annualTurnover: number,
  taxableProfit: number,
  totalFixedAssets: number = 0
): CITResult {
  if (annualTurnover < 0) throw new Error("Turnover cannot be negative");
  if (taxableProfit < 0) throw new Error("Taxable profit cannot be negative");

  const FIXED_ASSETS_THRESHOLD = 250_000_000; // ₦250m

  let companySize: "small" | "medium" | "large";
  let rate: number;
  let isExempt: boolean;

  const meetsFixedAssetTest =
    totalFixedAssets === 0 || totalFixedAssets <= FIXED_ASSETS_THRESHOLD;

  if (annualTurnover <= CIT_THRESHOLDS_NTA2025.small && meetsFixedAssetTest) {
    companySize = "small";
    rate = 0;
    isExempt = true;
  } else if (annualTurnover <= CIT_THRESHOLDS_NTA2025.small) {
    // Turnover ≤ ₦100m but fixed assets exceed ₦250m — not exempt
    companySize = "medium";
    rate = 0.2;
    isExempt = false;
  } else {
    companySize = "large";
    rate = 0.3;
    isExempt = false;
  }

  const taxAmount = taxableProfit * rate;

  return {
    turnover: annualTurnover,
    companySize,
    taxableProfit,
    taxAmount,
    effectiveRate: rate * 100,
    isExempt,
  };
}

/**
 * Returns the applicable CIT rate and company classification.
 * @param annualTurnover - Annual turnover in Naira
 * @param totalFixedAssets - Total fixed assets in Naira (default 0)
 */
export function getCITRate(
  annualTurnover: number,
  totalFixedAssets: number = 0
): { rate: number; companySize: string } {
  const result = calculateCIT(annualTurnover, 0, totalFixedAssets);
  return {
    rate: result.effectiveRate,
    companySize: result.isExempt ? "small (exempt)" : result.companySize,
  };
}
