"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  NHF_INCOME_THRESHOLD: () => NHF_INCOME_THRESHOLD,
  NHF_RATE: () => NHF_RATE,
  PENSION_RATES: () => PENSION_RATES,
  VAT_RATE: () => VAT_RATE,
  WHT_RATES: () => WHT_RATES,
  calculateCIT: () => calculateCIT,
  calculateMonthlyPAYE: () => calculateMonthlyPAYE,
  calculateNHF: () => calculateNHF,
  calculatePAYE: () => calculatePAYE,
  calculatePension: () => calculatePension,
  calculateVAT: () => calculateVAT,
  calculateWHT: () => calculateWHT,
  extractVAT: () => extractVAT,
  getCITRate: () => getCITRate,
  getWHTRates: () => getWHTRates,
  isPAYEExempt: () => isPAYEExempt,
  isVATRegistrationRequired: () => isVATRegistrationRequired
});
module.exports = __toCommonJS(src_exports);

// src/vat.ts
var VAT_RATE = 0.075;
function calculateVAT(amount) {
  if (amount < 0)
    throw new Error("Amount cannot be negative");
  const taxAmount = amount * VAT_RATE;
  const gross = amount + taxAmount;
  return {
    gross,
    taxAmount,
    net: amount,
    effectiveRate: VAT_RATE * 100
  };
}
function extractVAT(grossAmount) {
  if (grossAmount < 0)
    throw new Error("Amount cannot be negative");
  const net = grossAmount / (1 + VAT_RATE);
  const taxAmount = grossAmount - net;
  return {
    gross: grossAmount,
    taxAmount,
    net,
    effectiveRate: VAT_RATE * 100
  };
}
function isVATRegistrationRequired(annualTurnover) {
  return annualTurnover >= 25e6;
}

// src/paye.ts
var PAYE_BANDS_NTA2025 = [
  { limit: 8e5, rate: 0, label: "\u20A60 \u2013 \u20A6800,000 (exempt)" },
  { limit: 22e5, rate: 0.15, label: "\u20A6800,001 \u2013 \u20A63,000,000" },
  { limit: 9e6, rate: 0.18, label: "\u20A63,000,001 \u2013 \u20A612,000,000" },
  { limit: 13e6, rate: 0.21, label: "\u20A612,000,001 \u2013 \u20A625,000,000" },
  { limit: 25e6, rate: 0.23, label: "\u20A625,000,001 \u2013 \u20A650,000,000" },
  { limit: Infinity, rate: 0.25, label: "Above \u20A650,000,000" }
];
function calculatePAYE(annualGrossIncome, options = {}) {
  if (annualGrossIncome < 0)
    throw new Error("Income cannot be negative");
  const { annualRentPaid = 0, pensionContribution = 0, nhfContribution = 0 } = options;
  const rentRelief = annualRentPaid > 0 ? Math.min(annualRentPaid * 0.2, 5e5) : 0;
  const totalDeductions = rentRelief + pensionContribution + nhfContribution;
  const taxableIncome = Math.max(0, annualGrossIncome - totalDeductions);
  let remaining = taxableIncome;
  let totalTax = 0;
  const breakdown = [];
  let cursor = 0;
  for (const { limit, rate, label } of PAYE_BANDS_NTA2025) {
    if (remaining <= 0)
      break;
    const bandSize = limit === Infinity ? remaining : Math.max(0, limit - cursor);
    const taxableAmount = Math.min(remaining, bandSize);
    const tax = taxableAmount * rate;
    if (taxableAmount > 0) {
      breakdown.push({
        band: label,
        taxableAmount,
        rate: rate * 100,
        tax
      });
    }
    totalTax += tax;
    remaining -= taxableAmount;
    cursor = limit === Infinity ? cursor : limit;
  }
  return {
    grossIncome: annualGrossIncome,
    consolidatedReliefAllowance: totalDeductions,
    // renamed conceptually — now covers all deductions
    taxableIncome,
    taxAmount: totalTax,
    monthlyTax: totalTax / 12,
    netAnnualIncome: annualGrossIncome - totalTax,
    effectiveRate: annualGrossIncome > 0 ? totalTax / annualGrossIncome * 100 : 0,
    breakdown
  };
}
function calculateMonthlyPAYE(monthlyGross, options) {
  var _a, _b, _c;
  const annual = calculatePAYE(monthlyGross * 12, {
    annualRentPaid: ((_a = options == null ? void 0 : options.monthlyRentPaid) != null ? _a : 0) * 12,
    pensionContribution: ((_b = options == null ? void 0 : options.monthlyPensionContribution) != null ? _b : 0) * 12,
    nhfContribution: ((_c = options == null ? void 0 : options.monthlyNhfContribution) != null ? _c : 0) * 12
  });
  return { ...annual, grossIncome: monthlyGross };
}
function isPAYEExempt(annualGrossIncome) {
  return annualGrossIncome <= 8e5;
}

// src/wht.ts
var WHT_RATES = {
  dividends: {
    transactionType: "dividends",
    rate: 10,
    description: "Dividends paid to individuals and companies"
  },
  interest: {
    transactionType: "interest",
    rate: 10,
    description: "Interest paid on loans, bonds, bank deposits"
  },
  rent: {
    transactionType: "rent",
    rate: 10,
    description: "Rent paid on land and buildings"
  },
  royalties: {
    transactionType: "royalties",
    rate: 10,
    description: "Royalty payments"
  },
  commission: {
    transactionType: "commission",
    rate: 10,
    description: "Commission, consultancy, technical and management fees"
  },
  consultancy: {
    transactionType: "consultancy",
    rate: 10,
    description: "Professional/consultancy/technical fees"
  },
  construction: {
    transactionType: "construction",
    rate: 2.5,
    description: "Construction and related activities"
  },
  contracts: {
    transactionType: "contracts",
    rate: 5,
    description: "Contracts (non-construction)"
  },
  directorFees: {
    transactionType: "directorFees",
    rate: 10,
    description: "Director fees and allowances"
  },
  supplyOfGoods: {
    transactionType: "supplyOfGoods",
    rate: 5,
    description: "Supply of goods (contract value basis)"
  }
};
function calculateWHT(amount, transactionType) {
  if (amount < 0)
    throw new Error("Amount cannot be negative");
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
    effectiveRate: whtRate.rate
  };
}
function getWHTRates() {
  return Object.values(WHT_RATES);
}

// src/cit.ts
var CIT_THRESHOLDS_NTA2025 = {
  small: 1e8
  // ₦100m (up from ₦25m)
};
function calculateCIT(annualTurnover, taxableProfit, totalFixedAssets = 0) {
  if (annualTurnover < 0)
    throw new Error("Turnover cannot be negative");
  if (taxableProfit < 0)
    throw new Error("Taxable profit cannot be negative");
  const FIXED_ASSETS_THRESHOLD = 25e7;
  let companySize;
  let rate;
  let isExempt;
  const meetsFixedAssetTest = totalFixedAssets === 0 || totalFixedAssets <= FIXED_ASSETS_THRESHOLD;
  if (annualTurnover <= CIT_THRESHOLDS_NTA2025.small && meetsFixedAssetTest) {
    companySize = "small";
    rate = 0;
    isExempt = true;
  } else if (annualTurnover <= CIT_THRESHOLDS_NTA2025.small) {
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
    isExempt
  };
}
function getCITRate(annualTurnover, totalFixedAssets = 0) {
  const result = calculateCIT(annualTurnover, 0, totalFixedAssets);
  return {
    rate: result.effectiveRate,
    companySize: result.isExempt ? "small (exempt)" : result.companySize
  };
}

// src/pension.ts
var PENSION_RATES = {
  employee: 0.08,
  // 8% of monthly emolument
  employer: 0.1
  // 10% of monthly emolument (minimum)
};
function calculatePension(basicSalary, housingAllowance = 0, transportAllowance = 0, employerRate = PENSION_RATES.employer) {
  if (basicSalary < 0)
    throw new Error("Basic salary cannot be negative");
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
    totalContribution: employeeContribution + employerContribution
  };
}

// src/nhf.ts
var NHF_RATE = 0.025;
var NHF_INCOME_THRESHOLD = 3e3;
function calculateNHF(monthlyBasicSalary) {
  if (monthlyBasicSalary < 0)
    throw new Error("Salary cannot be negative");
  const isRequired = monthlyBasicSalary >= NHF_INCOME_THRESHOLD;
  const contribution = isRequired ? monthlyBasicSalary * NHF_RATE : 0;
  return {
    basicSalary: monthlyBasicSalary,
    contribution,
    isRequired,
    annualContribution: contribution * 12
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NHF_INCOME_THRESHOLD,
  NHF_RATE,
  PENSION_RATES,
  VAT_RATE,
  WHT_RATES,
  calculateCIT,
  calculateMonthlyPAYE,
  calculateNHF,
  calculatePAYE,
  calculatePension,
  calculateVAT,
  calculateWHT,
  extractVAT,
  getCITRate,
  getWHTRates,
  isPAYEExempt,
  isVATRegistrationRequired
});
