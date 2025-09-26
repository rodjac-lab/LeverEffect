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

interface Cohort {
  name: string;
  values: [number, number, number, number];
}

interface CohortsProps {
  cohorts: Cohort[];
}

const palette = ['#5b9cff', '#22c55e', '#98a2b3'];
const gridColor = '#2a3245';
const textColor = '#e2e8f0';

export default function Cohorts({ cohorts }: CohortsProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    const labels = ['Année N', 'N+1', 'N+2', 'N+3'];
    const datasets = cohorts.map((cohort, index) => ({
      label: cohort.name,
      data: cohort.values,
      backgroundColor: palette[index % palette.length],
      borderRadius: 6,
      stack: 'cohorts',
    }));

    if (chartRef.current) {
      chartRef.current.data.datasets = datasets as unknown as Chart['data']['datasets'];
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(context, {
      type: 'bar',
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor },
          },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: ${formatCurrency(item.parsed.y ?? 0)}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: textColor },
            grid: { color: gridColor },
          },
          y: {
            stacked: true,
            ticks: {
              color: textColor,
              callback: (value) => formatCurrency(Number(value)),
            },
            grid: { color: gridColor },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [cohorts]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
}
