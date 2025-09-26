import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(LineController, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface BreakEvenPoint {
  discountPct: number;
  attachRequired: number;
}

interface BreakEvenProps {
  points: BreakEvenPoint[];
}

const palette = {
  line: '#5b9cff',
  point: '#22c55e',
  grid: '#2a3245',
  text: '#e2e8f0',
};

export default function BreakEven({ points }: BreakEvenProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    const labels = points.map((point) => `-${point.discountPct} %`);
    const dataValues = points.map((point) => point.attachRequired);

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = dataValues;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(context, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Attache requis',
            data: dataValues,
            borderColor: palette.line,
            backgroundColor: palette.point,
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
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
              label: (item) => `${item.parsed.y?.toFixed(1)} %`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: palette.text },
            grid: { color: palette.grid },
          },
          y: {
            ticks: {
              color: palette.text,
              callback: (value) => `${Number(value).toFixed(0)} %`,
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
  }, [points]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} />
    </div>
  );
}
