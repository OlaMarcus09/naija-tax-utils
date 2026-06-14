type Currency = number;
interface TaxResult {
    gross: Currency;
    taxAmount: Currency;
    net: Currency;
    effectiveRate: number;
}
interface PAYEResult {
    grossIncome: Currency;
    consolidatedReliefAllowance: Currency;
    taxableIncome: Currency;
    taxAmount: Currency;
    monthlyTax: Currency;
    netAnnualIncome: Currency;
    effectiveRate: number;
    breakdown: PAYEBand[];
}
interface PAYEBand {
    band: string;
    taxableAmount: Currency;
    rate: number;
    tax: Currency;
}
interface PensionResult {
    grossEmolument: Currency;
    employeeContribution: Currency;
    employerContribution: Currency;
    totalContribution: Currency;
}
interface CITResult {
    turnover: Currency;
    companySize: "small" | "medium" | "large";
    taxableProfit: Currency;
    taxAmount: Currency;
    effectiveRate: number;
    isExempt: boolean;
}
interface WHTRate {
    transactionType: string;
    rate: number;
    description: string;
}

/** Current Nigerian VAT rate as per Finance Act 2020 */
declare const VAT_RATE = 0.075;
/**
 * Calculates VAT on a given amount (exclusive — VAT added on top)
 * @param amount - Pre-tax amount in Naira
 * @returns TaxResult with gross, tax, net, and effective rate
 *
 * @example
 * calculateVAT(10000)
 * // { gross: 10750, taxAmount: 750, net: 10000, effectiveRate: 7.5 }
 */
declare function calculateVAT(amount: number): TaxResult;
/**
 * Extracts VAT from a VAT-inclusive amount
 * @param grossAmount - VAT-inclusive amount in Naira
 * @returns TaxResult showing how much of the gross is VAT
 *
 * @example
 * extractVAT(10750)
 * // { gross: 10750, taxAmount: 750, net: 10000, effectiveRate: 7.5 }
 */
declare function extractVAT(grossAmount: number): TaxResult;
/**
 * Checks if a business is required to register for VAT.
 * Threshold: ₦25,000,000 annual turnover (Finance Act 2023)
 * @param annualTurnover - Annual revenue in Naira
 */
declare function isVATRegistrationRequired(annualTurnover: number): boolean;

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
declare function calculatePAYE(annualGrossIncome: number, options?: {
    annualRentPaid?: number;
    pensionContribution?: number;
    nhfContribution?: number;
}): PAYEResult;
/**
 * Convenience: compute from monthly salary
 */
declare function calculateMonthlyPAYE(monthlyGross: number, options?: {
    monthlyRentPaid?: number;
    monthlyPensionContribution?: number;
    monthlyNhfContribution?: number;
}): PAYEResult;
/**
 * Check if an employee is exempt from PAYE under NTA 2025
 * (Annual income ≤ ₦800,000)
 */
declare function isPAYEExempt(annualGrossIncome: number): boolean;

/**
 * Nigerian Withholding Tax (WHT) rates as published by FIRS.
 * Rates vary by transaction type and taxpayer category.
 */
declare const WHT_RATES: Record<string, WHTRate>;
/**
 * Calculates Withholding Tax for a given transaction type and amount.
 * @param amount - Transaction amount in Naira
 * @param transactionType - Key from WHT_RATES (e.g. 'dividends', 'rent')
 * @returns TaxResult with WHT deducted
 *
 * @example
 * calculateWHT(500_000, 'consultancy')
 * // { gross: 500000, taxAmount: 50000, net: 450000, effectiveRate: 10 }
 */
declare function calculateWHT(amount: number, transactionType: string): TaxResult;
/**
 * Returns all available WHT transaction types and their rates
 */
declare function getWHTRates(): WHTRate[];

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
declare function calculateCIT(annualTurnover: number, taxableProfit: number, totalFixedAssets?: number): CITResult;
/**
 * Returns the applicable CIT rate and company classification.
 * @param annualTurnover - Annual turnover in Naira
 * @param totalFixedAssets - Total fixed assets in Naira (default 0)
 */
declare function getCITRate(annualTurnover: number, totalFixedAssets?: number): {
    rate: number;
    companySize: string;
};

/** PenCom contribution rates (Pension Reform Act 2014) */
declare const PENSION_RATES: {
    employee: number;
    employer: number;
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
declare function calculatePension(basicSalary: number, housingAllowance?: number, transportAllowance?: number, employerRate?: number): PensionResult;

/**
 * National Housing Fund (NHF) — Federal Mortgage Bank of Nigeria Act
 * Employees earning ₦3,000/month or more must contribute 2.5% of basic salary.
 */
declare const NHF_RATE = 0.025;
declare const NHF_INCOME_THRESHOLD = 3000;
interface NHFResult {
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
declare function calculateNHF(monthlyBasicSalary: number): NHFResult;

export { CITResult, Currency, NHFResult, NHF_INCOME_THRESHOLD, NHF_RATE, PAYEBand, PAYEResult, PENSION_RATES, PensionResult, TaxResult, VAT_RATE, WHTRate, WHT_RATES, calculateCIT, calculateMonthlyPAYE, calculateNHF, calculatePAYE, calculatePension, calculateVAT, calculateWHT, extractVAT, getCITRate, getWHTRates, isPAYEExempt, isVATRegistrationRequired };
