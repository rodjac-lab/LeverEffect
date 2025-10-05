export interface SimulationParams {
  // Produit A - Prix
  shelfPriceA: number; // Prix fond de rayon (baseline)
  avgSellingPriceA: number; // Prix de vente moyen (baseline)
  newShelfPriceA: number; // Nouveau prix fond de rayon
  newAvgSellingPriceA: number; // Nouveau prix de vente moyen

  // Produit A - Volume & Coûts
  qtyA: number;
  costA: number; // Coût unitaire de A
  elasticity: number;
  deltaAOverride?: number;

  // Produit B
  priceB: number; // Prix de vente de B
  costB: number; // Coût unitaire de B
  attachRates: [number, number, number, number];

  // Paramètres financiers
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
