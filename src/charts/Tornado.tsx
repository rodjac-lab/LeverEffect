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

interface TornadoDatum {
  name: string;
  plus: number;
  minus: number;
}

interface TornadoProps {
  data: TornadoDatum[];
}

const palette = {
  plus: '#22c55e',
  minus: '#ef4444',
  grid: '#2a3245',
  text: '#e2e8f0',
};

export default function Tornado({ data }: TornadoProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    const labels = data.map((item) => item.name);
    const plusData = data.map((item) => item.plus);
    const minusData = data.map((item) => -Math.abs(item.minus));

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = minusData;
      chartRef.current.data.datasets[1].data = plusData;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(context, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '-10 %',
            data: minusData,
            backgroundColor: palette.minus,
            borderRadius: 8,
          },
          {
            label: '+10 %',
            data: plusData,
            backgroundColor: palette.plus,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: palette.text },
          },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: ${formatCurrency(item.parsed.x ?? 0)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: palette.text,
              callback: (value) => formatCurrency(Number(value)),
            },
            grid: { color: palette.grid },
          },
          y: {
            ticks: { color: palette.text },
            grid: { color: palette.grid },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
}
