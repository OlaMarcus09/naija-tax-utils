import { PensionResult } from "./types";

/** PenCom contribution rates (Pension Reform Act 2014) */
export const PENSION_RATES = {
  employee: 0.08, // 8% of monthly emolument
  employer: 0.1,  // 10% of monthly emolument (minimum)
};

/**
 * Calculates monthly pension contributions under the Contributory Pension Scheme (CPS).
 *
 * "Monthly emolument" = basic salary + housing allowance + transport allowance
 * Contributions are based on this figure, NOT total gross.
 *
 * @param basicSalary - Monthly basic salary in Naira
 * @param housingAllowance - Monthly housing allowance in Naira (default 0)
 * @param transportAllowance - Monthly transport allowance in Naira (default 0)
 * @param employerRate - Employer contribution rate (default 10% — can be higher)
 * @returns PensionResult with employee, employer, and total contributions
 *
 * @example
 * calculatePension(150_000, 50_000, 30_000)
 * // Emolument: ₦230,000 → Employee: ₦18,400 | Employer: ₦23,000
 */
export function calculatePension(
  basicSalary: number,
  housingAllowance: number = 0,
  transportAllowance: number = 0,
  employerRate: number = PENSION_RATES.employer
): PensionResult {
  if (basicSalary < 0) throw new Error("Basic salary cannot be negative");
  if (employerRate < PENSION_RATES.employer) {
    throw new Error("Employer rate cannot be less than the statutory minimum of 10%");
  }

  const grossEmolument = basicSalary + housingAllowance + transportAllowance;
  const employeeContribution = grossEmolument * PENSION_RATES.employee;
  const employerContribution = grossEmolument * employerRate;

  return {
    grossEmolument,
    employeeContribution,
    employerContribution,
    totalContribution: employeeContribution + employerContribution,
  };
}
