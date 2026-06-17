// src/tax.test.ts
import { calculateVAT } from './index'; 

describe('Nigerian Tax Utilities', () => {
  it('should correctly calculate 7.5% VAT and return the full financial breakdown', () => {
    const vat = calculateVAT(100000);
    
    // You can test the specific property:
    expect(vat.taxAmount).toBe(7500);
    
    // Or even better, test that the entire object matches perfectly using .toEqual():
    expect(vat).toEqual({
      effectiveRate: 7.5,
      gross: 107500,
      net: 100000,
      taxAmount: 7500
    });
  });
});