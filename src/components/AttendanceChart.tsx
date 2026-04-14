"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SubjectStats {
  subject: string;
  attended: number;
  missed: number;
  conducted: number;
  percentage: number;
}

export default function AttendanceChart({ stats }: { stats: SubjectStats[] }) {
  if (!stats || stats.length === 0) return null;

  const labels = stats.map(s => s.subject);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Attendance %',
        data: stats.map(s => s.percentage),
        backgroundColor: stats.map(s => 
          s.percentage >= 80 ? 'rgba(52, 211, 153, 0.8)' : // Tertiary (Green)
          s.percentage >= 75 ? 'rgba(250, 204, 21, 0.8)' : // Warning (Yellow)
          'rgba(239, 68, 68, 0.8)' // Error (Red)
        ),
        borderColor: stats.map(s => 
          s.percentage >= 80 ? '#34d399' :
          s.percentage >= 75 ? '#facc15' :
          '#ef4444'
        ),
        borderWidth: 1,
        borderRadius: 4
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Subject wise Attendance Analytics',
        color: '#a1a1aa', // secondary color
        font: {
          family: 'var(--font-geist-sans), Arial, sans-serif',
          size: 14
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a1a1aa',
          callback: function(value: any) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#a1a1aa',
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
