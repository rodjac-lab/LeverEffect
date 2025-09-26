import { useMemo, useState } from 'react';
import type { SimulationParams } from './types';
import {
  simulate,
  breakevenCurve,
  sensitivity,
  formatCurrency,
} from './sim/core';
import Waterfall from './charts/Waterfall';
import Cohorts from './charts/Cohorts';
import Tornado from './charts/Tornado';
import BreakEven from './charts/BreakEven';
import Scenarios from './charts/Scenarios';

const defaultParams: SimulationParams = {
  priceA: 999,
  newPriceA: 949,
  qtyA: 100_000,
  marginATotal: 20_000_000,
  elasticity: -1.3,
  marginBUnit: 120,
  attachRates: [30, 15, 8, 5],
  discountRatePct: 10,
};

const discountScenarios = [3, 7, 12];

function App(): JSX.Element {
  const [params, setParams] = useState<SimulationParams & { deltaAOverride?: number | undefined }>(
    defaultParams,
  );
  const [deltaOverrideInput, setDeltaOverrideInput] = useState<string>('');

  const result = useMemo(() => simulate(params), [params]);

  const breakEvenData = useMemo(
    () => breakevenCurve(params, Array.from({ length: 21 }, (_, index) => index)),
    [params],
  );

  const tornadoData = useMemo(() => sensitivity(params), [params]);

  const cohortData = useMemo(() => {
    const baseVolume = Math.max(0, result.deltaAUnits);
    const shares = [0.45, 0.35, 0.2];
    return shares.map((share, idx) => ({
      name: `Cohorte ${idx + 1}`,
      values: params.attachRates.map((attach) =>
        baseVolume * share * (attach / 100) * params.marginBUnit,
      ) as [number, number, number, number],
    }));
  }, [params.attachRates, params.marginBUnit, result.deltaAUnits]);

  const scenarioData = useMemo(
    () =>
      discountScenarios.map((discount) => {
        const newPriceA = params.priceA * (1 - discount / 100);
        const scenarioResult = simulate({ ...params, newPriceA });
        return { discount, result: scenarioResult };
      }),
    [params],
  );

  const integerFormatter = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  });

  const handleNumberChange = (key: keyof SimulationParams, value: number) => {
    if (Number.isNaN(value)) return;
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleAttachChange = (index: number, value: number) => {
    if (Number.isNaN(value)) return;
    setParams((prev) => {
      const nextRates = [...prev.attachRates] as SimulationParams['attachRates'];
      nextRates[index] = value;
      return { ...prev, attachRates: nextRates };
    });
  };

  const handleDeltaOverride = (value: string) => {
    setDeltaOverrideInput(value);
    const trimmed = value.trim();
    if (trimmed === '') {
      setParams((prev) => ({ ...prev, deltaAOverride: undefined }));
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      setParams((prev) => ({ ...prev, deltaAOverride: parsed }));
    }
  };

  const waterfallValues = useMemo(
    () => [result.dMarginA, ...result.dMarginB, result.cum],
    [result],
  );

  const waterfallLabels = ['Δ marge A', 'B N', 'B N+1', 'B N+2', 'B N+3', 'Total'];

  return (
    <div className="app-container">
      <header>
        <h1>Effet de levier A → B</h1>
        <p className="small-note">
          Ajustez les hypothèses pour comprendre l’impact d’une remise sur A et la contribution des ventes B.
        </p>
      </header>
      <div className="app-layout">
        <section className="panel">
          <h2>Hypothèses</h2>
          <div className="inputs-grid">
            <label>
              Prix A (€)
              <input
                type="number"
                value={params.priceA}
                onChange={(event) => handleNumberChange('priceA', Number(event.target.value))}
              />
            </label>
            <label>
              Prix A remisé (€)
              <input
                type="number"
                value={params.newPriceA}
                onChange={(event) => handleNumberChange('newPriceA', Number(event.target.value))}
              />
            </label>
            <label>
              Volume A (N)
              <input
                type="number"
                value={params.qtyA}
                onChange={(event) => handleNumberChange('qtyA', Number(event.target.value))}
              />
            </label>
            <label>
              Marge totale A (N)
              <input
                type="number"
                value={params.marginATotal}
                onChange={(event) => handleNumberChange('marginATotal', Number(event.target.value))}
              />
            </label>
            <label>
              Elasticité prix
              <input
                type="number"
                step="0.1"
                value={params.elasticity}
                onChange={(event) => handleNumberChange('elasticity', Number(event.target.value))}
              />
            </label>
            <label>
              Δ Volume A (override)
              <input
                type="number"
                value={deltaOverrideInput}
                placeholder="auto"
                onChange={(event) => handleDeltaOverride(event.target.value)}
              />
            </label>
            <label>
              Marge unitaire B (€)
              <input
                type="number"
                value={params.marginBUnit}
                onChange={(event) => handleNumberChange('marginBUnit', Number(event.target.value))}
              />
            </label>
            <fieldset>
              <legend>Taux d’attache (%)</legend>
              {params.attachRates.map((rate, index) => (
                <label key={index}>
                  {index === 0 ? 'Année N' : `Année N+${index}`}
                  <input
                    type="number"
                    value={rate}
                    onChange={(event) => handleAttachChange(index, Number(event.target.value))}
                  />
                </label>
              ))}
            </fieldset>
            <label>
              Taux d’actualisation (%)
              <input
                type="number"
                step="0.5"
                value={params.discountRatePct}
                onChange={(event) => handleNumberChange('discountRatePct', Number(event.target.value))}
              />
            </label>
          </div>
        </section>
        <section className="panel">
          <h2>Indicateurs clés</h2>
          <div className="kpis">
            <div className="kpi-card">
              <span className="kpi-label">Δ ventes A</span>
              <span className="kpi-value">{integerFormatter.format(result.deltaAUnits)} unités</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Δ marge A (N)</span>
              <span className="kpi-value">{formatCurrency(result.dMarginA)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Break-even attache</span>
              <span className="kpi-value">{result.breakevenPct.toFixed(1)} %</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">VAN (Δ marge actualisée)</span>
              <span className="kpi-value">{formatCurrency(result.npv)}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Cumul nominal</span>
              <span className="kpi-value">{formatCurrency(result.cum)}</span>
            </div>
          </div>
        </section>
      </div>
      <section className="charts-grid">
        <div className="chart-card">
          <h3>Waterfall impact marge</h3>
          <Waterfall labels={waterfallLabels} values={waterfallValues} />
        </div>
        <div className="chart-card">
          <h3>Cohortes B (marges)</h3>
          <Cohorts cohorts={cohortData} />
        </div>
        <div className="chart-card">
          <h3>Sensibilité VAN</h3>
          <Tornado data={tornadoData} />
        </div>
        <div className="chart-card">
          <h3>Courbe break-even</h3>
          <BreakEven points={breakEvenData} />
        </div>
        <div className="chart-card">
          <h3>Scénarios de remise</h3>
          <Scenarios
            scenarios={scenarioData.map(({ discount, result: scenarioResult }) => ({
              label: `-${discount} %`,
              values: [
                scenarioResult.dMarginA,
                ...scenarioResult.dMarginB,
                scenarioResult.cum,
              ],
            }))}
            labels={waterfallLabels}
          />
        </div>
      </section>
    </div>
  );
}

export default App;
