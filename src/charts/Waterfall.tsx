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

interface WaterfallProps {
  labels: string[];
  values: number[];
}

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
  }).map((entry, index) => ({
    value: entry.value,
    offset: offsets[index],
  }));
}

const palette = {
  positive: '#22c55e',
  negative: '#ef4444',
  total: '#5b9cff',
  grid: '#2a3245',
  text: '#e2e8f0',
};

export default function Waterfall({ labels, values }: WaterfallProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    const prepared = buildWaterfall(values);
    const dataValues = prepared.map((item) => item.value);
    const offsets = prepared.map((item) => item.offset);
    const colors = dataValues.map((value, index) =>
      index === values.length - 1 ? palette.total : value >= 0 ? palette.positive : palette.negative,
    );

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = offsets;
      chartRef.current.data.datasets[1].data = dataValues;
      (chartRef.current.data.datasets[1].backgroundColor as string[]) = colors;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(context, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Base',
            data: offsets,
            stack: 'total',
            backgroundColor: 'rgba(0,0,0,0)',
            borderSkipped: false,
          },
          {
            label: 'Variation',
            data: dataValues,
            stack: 'total',
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
              label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y ?? 0)}`,
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

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, values]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
}
