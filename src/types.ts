export type Currency = number; // Always in Naira (₦)

export interface TaxResult {
  gross: Currency;
  taxAmount: Currency;
  net: Currency;
  effectiveRate: number; // percentage e.g. 7.5
}

export interface PAYEResult {
  grossIncome: Currency;
  consolidatedReliefAllowance: Currency;
  taxableIncome: Currency;
  taxAmount: Currency;
  monthlyTax: Currency;
  netAnnualIncome: Currency;
  effectiveRate: number;
  breakdown: PAYEBand[];
}

export interface PAYEBand {
  band: string;
  taxableAmount: Currency;
  rate: number;
  tax: Currency;
}

export interface PensionResult {
  grossEmolument: Currency;
  employeeContribution: Currency;
  employerContribution: Currency;
  totalContribution: Currency;
}

export interface CITResult {
  turnover: Currency;
  companySize: "small" | "medium" | "large";
  taxableProfit: Currency;
  taxAmount: Currency;
  effectiveRate: number;
  isExempt: boolean;
}

export interface WHTRate {
  transactionType: string;
  rate: number;
  description: string;
}
