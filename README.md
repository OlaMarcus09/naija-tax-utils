# naija-tax-utils

> Nigerian tax calculation utilities for developers. TypeScript-first. Zero dependencies.

[![npm version](https://badge.fury.io/js/naija-tax-utils.svg)](https://www.npmjs.com/package/naija-tax-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Handles the Nigerian tax calculations developers actually need — VAT, PAYE, Withholding Tax, Company Income Tax, Pension (PenCom), and NHF — all based on current FIRS guidelines and Finance Acts.

---

## Install

```bash
npm install naija-tax-utils
# or
yarn add naija-tax-utils
```

---

## Usage

### VAT (Value Added Tax — 7.5%)

```ts
import { calculateVAT, extractVAT, isVATRegistrationRequired } from "naija-tax-utils";

// Add VAT to an amount
calculateVAT(10_000);
// { gross: 10750, taxAmount: 750, net: 10000, effectiveRate: 7.5 }

// Extract VAT from a VAT-inclusive amount
extractVAT(10_750);
// { gross: 10750, taxAmount: 750, net: 10000, effectiveRate: 7.5 }

// Check if VAT registration is required (threshold: ₦25m turnover)
isVATRegistrationRequired(30_000_000); // true
isVATRegistrationRequired(10_000_000); // false
```

---

### PAYE (Personal Income Tax)

```ts
import { calculatePAYE, calculateMonthlyPAYE } from "naija-tax-utils";

// Annual gross income
const result = calculatePAYE(3_600_000);
console.log(result.taxAmount);       // Annual PAYE
console.log(result.monthlyTax);      // Monthly deduction
console.log(result.effectiveRate);   // e.g. 14.2%
console.log(result.breakdown);       // Per-band breakdown

// From monthly salary
const monthly = calculateMonthlyPAYE(300_000);
```

---

### WHT (Withholding Tax)

```ts
import { calculateWHT, getWHTRates } from "naija-tax-utils";

calculateWHT(500_000, "consultancy");
// { gross: 500000, taxAmount: 50000, net: 450000, effectiveRate: 10 }

calculateWHT(2_000_000, "construction");
// { gross: 2000000, taxAmount: 50000, net: 1950000, effectiveRate: 2.5 }

// Available types: dividends | interest | rent | royalties | commission |
//                  consultancy | construction | contracts | directorFees | supplyOfGoods
getWHTRates(); // returns all rates with descriptions
```

---

### CIT (Company Income Tax)

```ts
import { calculateCIT, getCITRate } from "naija-tax-utils";

// Large company (turnover > ₦100m) — 30%
calculateCIT(150_000_000, 30_000_000);
// { companySize: 'large', taxAmount: 9000000, effectiveRate: 30, isExempt: false }

// Small company (turnover < ₦25m) — exempt
calculateCIT(10_000_000, 2_000_000);
// { companySize: 'small', taxAmount: 0, effectiveRate: 0, isExempt: true }
```

---

### Pension (PenCom Contributory Pension Scheme)

```ts
import { calculatePension } from "naija-tax-utils";

// Employee: 8% | Employer: 10% of (basic + housing + transport)
calculatePension(150_000, 50_000, 30_000);
// {
//   grossEmolument: 230000,
//   employeeContribution: 18400,
//   employerContribution: 23000,
//   totalContribution: 41400
// }
```

---

### NHF (National Housing Fund)

```ts
import { calculateNHF } from "naija-tax-utils";

calculateNHF(100_000);
// { basicSalary: 100000, contribution: 2500, isRequired: true, annualContribution: 30000 }
```

---

## Tax Reference

| Tax | Rate | Basis |
|-----|------|-------|
| VAT | 7.5% | Transaction value |
| PAYE | 7% – 24% | Graduated bands on taxable income |
| WHT (Consultancy) | 10% | Contract value |
| WHT (Construction) | 2.5% | Contract value |
| CIT (Large) | 30% | Taxable profit |
| CIT (Medium) | 20% | Taxable profit |
| CIT (Small) | 0% | Exempt |
| Pension (Employee) | 8% | Monthly emolument |
| Pension (Employer) | 10% | Monthly emolument |
| NHF | 2.5% | Basic salary |

> Rates are based on FIRS guidelines and Finance Acts up to 2023. Always verify with your tax professional for compliance.

---

## Contributing

PRs welcome. If a rate has changed or a new Finance Act affects any computation, please open an issue with a reference to the official FIRS/FMFBNP source.

---

## License

MIT © [Marcus Aregbe](https://github.com/OlaMarcus09)
