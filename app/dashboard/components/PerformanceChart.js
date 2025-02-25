'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

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

export default function PerformanceChart({ timeframe }) {
  // Generate sample daily data for the last 30 days
  const generateDailyData = () => {
    const dates = [];
    const portfolioValues = [];
    const netDeposits = [];
    
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      
      // Sample data - replace with real data
      portfolioValues.push(16979.71 - (Math.random() * 100));
      netDeposits.push(16899.26 - (Math.random() * 50));
    }
    
    return { dates, portfolioValues, netDeposits };
  };

  const { dates, portfolioValues, netDeposits } = generateDailyData();

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Portfolio value',
        data: portfolioValues,
        borderColor: 'rgb(75, 162, 75)',
        backgroundColor: 'rgba(75, 162, 75, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(75, 162, 75)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      },
      {
        label: 'Net deposits',
        data: netDeposits,
        borderColor: 'rgb(180, 180, 180)',
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(180, 180, 180)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
        fill: false,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          boxWidth: 8,
          boxHeight: 8,
          font: {
            size: (context) => {
              const width = context.chart.width;
              return width < 400 ? 10 : 12;
            }
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        padding: 12,
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: 'rgb(240, 240, 240)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: (context) => {
            const width = context.chart.width;
            return width < 400 ? 4 : width < 600 ? 6 : 8;
          },
          font: {
            size: (context) => {
              const width = context.chart.width;
              return width < 400 ? 10 : 12;
            }
          }
        }
      },
      y: {
        grid: {
          borderDash: [5, 5],
        },
        ticks: {
          callback: function(value) {
            return `$${value.toLocaleString()}`;
          },
          font: {
            size: (context) => {
              const width = context.chart.width;
              return width < 400 ? 10 : 12;
            }
          }
        }
      }
    }
  };

  return (
    <div className="h-[300px] sm:h-[400px]">
      <Line data={data} options={options} />
    </div>
  );
} 