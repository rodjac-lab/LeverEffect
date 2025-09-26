export interface SimulationParams {
  priceA: number;
  newPriceA: number;
  qtyA: number;
  marginATotal: number;
  elasticity: number;
  deltaAOverride?: number;
  marginBUnit: number;
  attachRates: [number, number, number, number];
  discountRatePct: number;
}

export interface SimulationResult {
  deltaAUnits: number;
  dMarginA: number;
  dMarginB: [number, number, number, number];
  yearly: [number, number, number, number];
  cum: number;
  npv: number;
  breakevenPct: number;
}
