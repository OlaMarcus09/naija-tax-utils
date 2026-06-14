import { PAYEResult, PAYEBand } from "./types";

/**
 * PAYE tax bands under the Nigeria Tax Act (NTA) 2025.
 * Effective: January 1, 2026.
 *
 * Key changes from old regime:
 * - Exemption threshold raised to ₦800,000/year
 * - CRA abolished → replaced with Rent Relief
 * - New simplified 6-band structure (0%–25%)
 */
const PAYE_BANDS_NTA2025 = [
  { limit: 800_000,    rate: 0,    label: "₦0 – ₦800,000 (exempt)" },
  { limit: 2_200_000,  rate: 0.15, label: "₦800,001 – ₦3,000,000" },
  { limit: 9_000_000,  rate: 0.18, label: "₦3,000,001 – ₦12,000,000" },
  { limit: 13_000_000, rate: 0.21, label: "₦12,000,001 – ₦25,000,000" },
  { limit: 25_000_000, rate: 0.23, label: "₦25,000,001 – ₦50,000,000" },
  { limit: Infinity,   rate: 0.25, label: "Above ₦50,000,000" },
];

/**
 * Computes annual PAYE under the Nigeria Tax Act (NTA) 2025.
 *
 * Deductions applied before tax bands:
 * - Pension: 8% of emolument (if provided)
 * - Rent Relief: lower of 20% of annual rent OR ₦500,000 (if provided)
 * - NHF: 2.5% of basic salary (if provided)
 *
 * @param annualGrossIncome - Total annual gross income in Naira
 * @param options.annualRentPaid - Annual rent paid (for Rent Relief deduction)
 * @param options.pensionContribution - Annual pension contribution (8% of emolument)
 * @param options.nhfContribution - Annual NHF contribution
 * @returns PAYEResult with full breakdown
 *
 * @example
 * // Salary of ₦3.6m/year, no deductions
 * calculatePAYE(3_600_000)
 *
 * // With rent relief (paying ₦1.2m rent/year)
 * calculatePAYE(3_600_000, { annualRentPaid: 1_200_000 })
 */
export function calculatePAYE(
  annualGrossIncome: number,
  options: {
    annualRentPaid?: number;
    pensionContribution?: number;
    nhfContribution?: number;
  } = {}
): PAYEResult {
  if (annualGrossIncome < 0) throw new Error("Income cannot be negative");

  const { annualRentPaid = 0, pensionContribution = 0, nhfContribution = 0 } = options;

  // Rent Relief: lower of 20% of rent OR ₦500,000
  const rentRelief = annualRentPaid > 0
    ? Math.min(annualRentPaid * 0.2, 500_000)
    : 0;

  const totalDeductions = rentRelief + pensionContribution + nhfContribution;
  const taxableIncome = Math.max(0, annualGrossIncome - totalDeductions);

  // Apply NTA 2025 bands
  let remaining = taxableIncome;
  let totalTax = 0;
  const breakdown: PAYEBand[] = [];
  let cursor = 0;

  for (const { limit, rate, label } of PAYE_BANDS_NTA2025) {
    if (remaining <= 0) break;

    const bandSize = limit === Infinity ? remaining : Math.max(0, limit - cursor);
    const taxableAmount = Math.min(remaining, bandSize);
    const tax = taxableAmount * rate;

    if (taxableAmount > 0) {
      breakdown.push({
        band: label,
        taxableAmount,
        rate: rate * 100,
        tax,
      });
    }

    totalTax += tax;
    remaining -= taxableAmount;
    cursor = limit === Infinity ? cursor : limit;
  }

  return {
    grossIncome: annualGrossIncome,
    consolidatedReliefAllowance: totalDeductions, // renamed conceptually — now covers all deductions
    taxableIncome,
    taxAmount: totalTax,
    monthlyTax: totalTax / 12,
    netAnnualIncome: annualGrossIncome - totalTax,
    effectiveRate: annualGrossIncome > 0 ? (totalTax / annualGrossIncome) * 100 : 0,
    breakdown,
  };
}

/**
 * Convenience: compute from monthly salary
 */
export function calculateMonthlyPAYE(
  monthlyGross: number,
  options?: {
    monthlyRentPaid?: number;
    monthlyPensionContribution?: number;
    monthlyNhfContribution?: number;
  }
): PAYEResult {
  const annual = calculatePAYE(monthlyGross * 12, {
    annualRentPaid: (options?.monthlyRentPaid ?? 0) * 12,
    pensionContribution: (options?.monthlyPensionContribution ?? 0) * 12,
    nhfContribution: (options?.monthlyNhfContribution ?? 0) * 12,
  });
  return { ...annual, grossIncome: monthlyGross };
}

/**
 * Check if an employee is exempt from PAYE under NTA 2025
 * (Annual income ≤ ₦800,000)
 */
export function isPAYEExempt(annualGrossIncome: number): boolean {
  return annualGrossIncome <= 800_000;
}
