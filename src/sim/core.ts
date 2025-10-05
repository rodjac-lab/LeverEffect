import type { SimulationParams, SimulationResult } from '../types';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/**
 * Computes the net present value of a set of cashflows.
 * @param cashflows Cashflow per period (t=0..n)
 * @param discountRatePct Discount rate expressed as a percentage.
 */
export function npv(cashflows: number[], discountRatePct: number): number {
  const rate = discountRatePct / 100;
  return cashflows.reduce((acc, flow, index) => acc + flow / (1 + rate) ** index, 0);
}

/**
 * Simulates the leverage effect of a discount on product A over complementary product B.
 * @param params Simulation parameters
 */
export function simulate(params: SimulationParams): SimulationResult {
  const {
    shelfPriceA,
    avgSellingPriceA,
    newShelfPriceA,
    newAvgSellingPriceA,
    qtyA,
    costA,
    elasticity,
    deltaAOverride,
    priceB,
    costB,
    attachRates,
    discountRatePct,
  } = params;

  // Calcul marges unitaires A
  const baselineMarginPerUnit = avgSellingPriceA - costA;
  const newMarginPerUnit = newAvgSellingPriceA - costA;

  // Élasticité s'applique sur prix fond de rayon
  const deltaAUnits = deltaAOverride ??
    qtyA * elasticity * ((newShelfPriceA - shelfPriceA) / shelfPriceA);
  const newQtyA = qtyA + deltaAUnits;

  // Impact marge A utilise prix de vente moyen
  const dMarginA = newMarginPerUnit * newQtyA - baselineMarginPerUnit * qtyA;

  // Marge unitaire B calculée à partir prix et coût
  const marginBUnit = priceB - costB;
  const dMarginB = attachRates.map((attach) => deltaAUnits * (attach / 100) * marginBUnit) as [number, number, number, number];

  const yearly: [number, number, number, number] = [
    dMarginA + dMarginB[0],
    dMarginB[1],
    dMarginB[2],
    dMarginB[3],
  ];

  const cum = yearly.reduce((acc, value) => acc + value, 0);
  const npvValue = npv(yearly, discountRatePct);

  const breakevenPct = deltaAUnits > 0
    ? Math.max(0, (-dMarginA / (deltaAUnits * marginBUnit)) * 100)
    : 0;

  return {
    deltaAUnits,
    dMarginA,
    dMarginB,
    yearly,
    cum,
    npv: npvValue,
    breakevenPct,
  };
}

/**
 * Computes the break-even attach rate curve for a set of discount percentages.
 * @param params Baseline simulation parameters
 * @param discountPcts Discount percentage values to test
 */
export function breakevenCurve(
  params: SimulationParams,
  discountPcts: number[],
): { discountPct: number; attachRequired: number }[] {
  return discountPcts.map((discountPct) => {
    const newShelfPriceA = params.shelfPriceA * (1 - discountPct / 100);
    const newAvgSellingPriceA = params.avgSellingPriceA * (1 - discountPct / 100);
    const result = simulate({ ...params, newShelfPriceA, newAvgSellingPriceA });
    return {
      discountPct,
      attachRequired: result.breakevenPct,
    };
  });
}

/**
 * Generates tornado chart data by applying +/- step variations to sensitive parameters.
 * @param params Baseline simulation parameters
 * @param step Variation percentage (default 10%)
 */
export function sensitivity(
  params: SimulationParams,
  step = 0.1,
): { name: string; plus: number; minus: number }[] {
  const baseline = simulate(params);
  const scenarios = [
    {
      name: 'Elasticité',
      mutate: (factor: number) => ({ ...params, elasticity: params.elasticity * factor }),
    },
    {
      name: 'Marge B',
      mutate: (factor: number) => ({ ...params, priceB: params.priceB * factor }),
    },
    {
      name: 'Attache N',
      mutate: (factor: number) => ({
        ...params,
        attachRates: [
          params.attachRates[0] * factor,
          params.attachRates[1],
          params.attachRates[2],
          params.attachRates[3],
        ] as [number, number, number, number],
      }),
    },
    {
      name: 'Taux actualisation',
      mutate: (factor: number) => ({
        ...params,
        discountRatePct: Math.max(0, params.discountRatePct * factor),
      }),
    },
  ];

  return scenarios.map(({ name, mutate }) => {
    const minusParams = mutate(1 - step);
    const plusParams = mutate(1 + step);
    const minusNPV = simulate(minusParams).npv - baseline.npv;
    const plusNPV = simulate(plusParams).npv - baseline.npv;
    return { name, plus: plusNPV, minus: minusNPV };
  });
}

export const formatCurrency = (value: number): string => currencyFormatter.format(value);
