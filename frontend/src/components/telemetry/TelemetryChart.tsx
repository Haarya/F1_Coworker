import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useRaceSession } from '../../context/RaceSessionContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TelemetryChart() {
  const { state } = useRaceSession();

  // Show data up to current playback timestamp
  const visibleData = state.telemetryStream.filter(d => d.sessionTime <= state.playbackTimestamp);

  const data = {
    labels: visibleData.map(d => d.sessionTime.toFixed(1)),
    datasets: [
      {
        label: 'Speed (km/h)',
        data: visibleData.map(d => d.speed),
        borderColor: '#3b82f6', // blue-500
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)'); // Top is semi-transparent blue
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)'); // Bottom is totally transparent
          return gradient;
        },
        yAxisID: 'y',
        fill: true,
        tension: 0.4, // smooth curve
        pointRadius: 0,
        borderWidth: 2,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // bg-bg-dark but darker
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: 350,
        grid: { color: 'rgba(255, 255, 255, 0.05)' }, // very subtle grid lines
        ticks: { color: '#64748b', font: { family: 'monospace' } }
      }
    },
    animation: {
      duration: 0 
    }
  };

  return (
    <div className="w-full h-full relative p-2">
      <Line data={data} options={options} />
      <div className="absolute top-2 left-4 flex gap-4 text-xs font-mono">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 opacity-80" />
          <span className="text-text-secondary">Speed</span>
        </div>
      </div>
    </div>
  );
}
