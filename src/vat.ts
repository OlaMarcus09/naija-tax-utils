import { TaxResult } from "./types";

/** Current Nigerian VAT rate as per Finance Act 2020 */
export const VAT_RATE = 0.075;

/**
 * Calculates VAT on a given amount (exclusive — VAT added on top)
 * @param amount - Pre-tax amount in Naira
 * @returns TaxResult with gross, tax, net, and effective rate
 *
 * @example
 * calculateVAT(10000)
 * // { gross: 10750, taxAmount: 750, net: 10000, effectiveRate: 7.5 }
 */
export function calculateVAT(amount: number): TaxResult {
  if (amount < 0) throw new Error("Amount cannot be negative");

  const taxAmount = amount * VAT_RATE;
  const gross = amount + taxAmount;

  return {
    gross,
    taxAmount,
    net: amount,
    effectiveRate: VAT_RATE * 100,
  };
}

/**
 * Extracts VAT from a VAT-inclusive amount
 * @param grossAmount - VAT-inclusive amount in Naira
 * @returns TaxResult showing how much of the gross is VAT
 *
 * @example
 * extractVAT(10750)
 * // { gross: 10750, taxAmount: 750, net: 10000, effectiveRate: 7.5 }
 */
export function extractVAT(grossAmount: number): TaxResult {
  if (grossAmount < 0) throw new Error("Amount cannot be negative");

  const net = grossAmount / (1 + VAT_RATE);
  const taxAmount = grossAmount - net;

  return {
    gross: grossAmount,
    taxAmount,
    net,
    effectiveRate: VAT_RATE * 100,
  };
}

/**
 * Checks if a business is required to register for VAT.
 * Threshold: ₦25,000,000 annual turnover (Finance Act 2023)
 * @param annualTurnover - Annual revenue in Naira
 */
export function isVATRegistrationRequired(annualTurnover: number): boolean {
  return annualTurnover >= 25_000_000;
}
