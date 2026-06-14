import { TaxResult, WHTRate } from "./types";

/**
 * Nigerian Withholding Tax (WHT) rates as published by FIRS.
 * Rates vary by transaction type and taxpayer category.
 */
export const WHT_RATES: Record<string, WHTRate> = {
  dividends: {
    transactionType: "dividends",
    rate: 10,
    description: "Dividends paid to individuals and companies",
  },
  interest: {
    transactionType: "interest",
    rate: 10,
    description: "Interest paid on loans, bonds, bank deposits",
  },
  rent: {
    transactionType: "rent",
    rate: 10,
    description: "Rent paid on land and buildings",
  },
  royalties: {
    transactionType: "royalties",
    rate: 10,
    description: "Royalty payments",
  },
  commission: {
    transactionType: "commission",
    rate: 10,
    description: "Commission, consultancy, technical and management fees",
  },
  consultancy: {
    transactionType: "consultancy",
    rate: 10,
    description: "Professional/consultancy/technical fees",
  },
  construction: {
    transactionType: "construction",
    rate: 2.5,
    description: "Construction and related activities",
  },
  contracts: {
    transactionType: "contracts",
    rate: 5,
    description: "Contracts (non-construction)",
  },
  directorFees: {
    transactionType: "directorFees",
    rate: 10,
    description: "Director fees and allowances",
  },
  supplyOfGoods: {
    transactionType: "supplyOfGoods",
    rate: 5,
    description: "Supply of goods (contract value basis)",
  },
};

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
export function calculateWHT(amount: number, transactionType: string): TaxResult {
  if (amount < 0) throw new Error("Amount cannot be negative");

  const whtRate = WHT_RATES[transactionType];
  if (!whtRate) {
    throw new Error(
      `Unknown transaction type: "${transactionType}". Valid types: ${Object.keys(WHT_RATES).join(", ")}`
    );
  }

  const taxAmount = amount * (whtRate.rate / 100);

  return {
    gross: amount,
    taxAmount,
    net: amount - taxAmount,
    effectiveRate: whtRate.rate,
  };
}

/**
 * Returns all available WHT transaction types and their rates
 */
export function getWHTRates(): WHTRate[] {
  return Object.values(WHT_RATES);
}
