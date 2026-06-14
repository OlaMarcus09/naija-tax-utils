/**
 * National Housing Fund (NHF) — Federal Mortgage Bank of Nigeria Act
 * Employees earning ₦3,000/month or more must contribute 2.5% of basic salary.
 */
export const NHF_RATE = 0.025;
export const NHF_INCOME_THRESHOLD = 3_000; // monthly

export interface NHFResult {
  basicSalary: number;
  contribution: number;
  isRequired: boolean;
  annualContribution: number;
}

/**
 * Calculates monthly NHF contribution
 * @param monthlyBasicSalary - Monthly basic salary in Naira
 * @returns NHFResult with contribution amount and eligibility
 *
 * @example
 * calculateNHF(100_000)
 * // { basicSalary: 100000, contribution: 2500, isRequired: true, annualContribution: 30000 }
 */
export function calculateNHF(monthlyBasicSalary: number): NHFResult {
  if (monthlyBasicSalary < 0) throw new Error("Salary cannot be negative");

  const isRequired = monthlyBasicSalary >= NHF_INCOME_THRESHOLD;
  const contribution = isRequired ? monthlyBasicSalary * NHF_RATE : 0;

  return {
    basicSalary: monthlyBasicSalary,
    contribution,
    isRequired,
    annualContribution: contribution * 12,
  };
}
