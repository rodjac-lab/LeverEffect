import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../sim/core';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Scenario {
  label: string;
  values: number[];
}

interface ScenariosProps {
  scenarios: Scenario[];
  labels: string[];
}

const palette = {
  positive: '#22c55e',
  negative: '#ef4444',
  total: '#5b9cff',
  grid: '#2a3245',
  text: '#e2e8f0',
};

function buildWaterfall(values: number[]) {
  const offsets: number[] = [];
  let cumulative = 0;
  return values.map((value, index) => {
    if (index === values.length - 1) {
      offsets.push(0);
      return { value, offset: 0 };
    }
    const offset = value >= 0 ? cumulative : cumulative + value;
    offsets.push(offset);
    cumulative += value;
    return { value, offset };
  }).map((entry, index) => ({ value: entry.value, offset: offsets[index] }));
}

export default function Scenarios({ scenarios, labels }: ScenariosProps): JSX.Element {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const chartRefs = useRef<(Chart | null)[]>([]);

  useEffect(() => {
    canvasRefs.current.forEach((canvas, index) => {
      const scenario = scenarios[index];
      if (!canvas || !scenario) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      const prepared = buildWaterfall(scenario.values);
      const valuesData = prepared.map((entry) => entry.value);
      const offsets = prepared.map((entry) => entry.offset);
      const colors = valuesData.map((value, valueIndex) =>
        valueIndex === scenario.values.length - 1
          ? palette.total
          : value >= 0
          ? palette.positive
          : palette.negative,
      );

      const existing = chartRefs.current[index];
      if (existing) {
        existing.data.labels = labels;
        existing.data.datasets[0].data = offsets;
        existing.data.datasets[1].data = valuesData;
        (existing.data.datasets[1].backgroundColor as string[]) = colors;
        existing.update();
        return;
      }

      chartRefs.current[index] = new Chart(context, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Base',
              data: offsets,
              stack: 'stack',
              backgroundColor: 'rgba(0,0,0,0)',
              borderSkipped: false,
            },
            {
              label: 'Variation',
              data: valuesData,
              stack: 'stack',
              backgroundColor: colors,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (item) => `${item.dataset.label}: ${formatCurrency(item.parsed.y ?? 0)}`,
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              ticks: { color: palette.text },
              grid: { color: palette.grid },
            },
            y: {
              stacked: true,
              ticks: {
                color: palette.text,
                callback: (value) => formatCurrency(Number(value)),
              },
              grid: { color: palette.grid },
            },
          },
        },
      });
    });

    return () => {
      chartRefs.current.forEach((chart) => chart?.destroy());
      chartRefs.current = [];
    };
  }, [labels, scenarios]);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {scenarios.map((scenario, index) => (
        <div key={scenario.label}>
          <p className="small-note">{scenario.label}</p>
          <div className="canvas-wrapper" style={{ height: 200 }}>
            <canvas
              ref={(element) => {
                canvasRefs.current[index] = element;
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
