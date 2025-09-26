import { describe, expect, it } from 'vitest';
import { breakevenCurve, npv, sensitivity, simulate } from '../core';

const baseParams = {
  priceA: 100,
  newPriceA: 90,
  qtyA: 1000,
  marginATotal: 30000,
  elasticity: -1.2,
  marginBUnit: 50,
  attachRates: [20, 10, 6, 4] as [number, number, number, number],
  discountRatePct: 8,
};

describe('simulate', () => {
  it('computes expected margin deltas and npv', () => {
    const result = simulate(baseParams);
    expect(result.dMarginB[0]).toBeCloseTo(result.deltaAUnits * 0.2 * 50 / 100);
    expect(result.yearly[0]).toBeCloseTo(result.dMarginA + result.dMarginB[0]);
    expect(result.npv).toBeCloseTo(npv(result.yearly, baseParams.discountRatePct));
  });
});

describe('breakevenCurve', () => {
  it('returns attach percentages for discounts', () => {
    const curve = breakevenCurve(baseParams, [0, 5]);
    expect(curve).toHaveLength(2);
    expect(curve[0].discountPct).toBe(0);
    expect(curve[1].discountPct).toBe(5);
  });
});

describe('sensitivity', () => {
  it('computes tornado data', () => {
    const data = sensitivity(baseParams, 0.1);
    expect(data).toHaveLength(4);
    data.forEach((point) => {
      expect(point).toHaveProperty('plus');
      expect(point).toHaveProperty('minus');
    });
  });
});
