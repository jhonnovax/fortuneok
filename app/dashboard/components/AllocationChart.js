'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AllocationChart() {
  const data = {
    labels: ['Stocks', 'ETFs', 'Crypto', 'Real Estate', 'Cash', 'Funds'],
    datasets: [
      {
        data: [35, 25, 15, 12, 8, 5],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          padding: 15,
          font: {
            size: (context) => {
              const width = context.chart.width;
              return width < 400 ? 10 : 12;
            }
          }
        }
      },
      tooltip: {
        bodyFont: {
          size: (context) => {
            const width = context.chart.width;
            return width < 400 ? 10 : 12;
          }
        }
      }
    },
    layout: {
      padding: {
        right: (context) => {
          const width = context.chart.width;
          return width < 500 ? 0 : 20;
        }
      }
    }
  };

  return (
    <div className="h-[300px] sm:h-[400px]">
      <Pie data={data} options={options} />
    </div>
  );
} 