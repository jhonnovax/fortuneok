'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../services/formatService';
import { processInvestmentsForPerformance } from '../services/performanceChartService';

export default function PerformanceChart({ 
  data = [],
  timeframe = 'all',
  portfolioSummary = { total: 0, profit: 0, profitPercentage: 0, period: 'all' },
  loading = false,
  error = null
}) {
  const [theme, setTheme] = useState('light');
  const [hoveredData, setHoveredData] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    // Check if dark theme is active
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'dark' : 'light');

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          setTheme(newTheme === 'dark' ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Process investments to create performance data
    const chartData = processInvestmentsForPerformance(data, timeframe);
    setPerformanceData(chartData);
  }, [data, timeframe]);

  // IMPORTANT: Replace the colors completely
  const colors = {
    // Use primary color directly without any theme-specific logic
    primary: 'hsl(var(--p))',
    secondary: 'hsl(var(--s))'
  };

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="loading loading-spinner loading-md"></span>
              <span className="text-gray-500">Loading portfolio data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="w-full flex items-center justify-center">
            <div className="text-error text-center">
              <p>{error}</p>
              <button className="btn btn-sm btn-outline mt-2" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="space-y-6">
          
          {/* Performance Chart */}
          {performanceData.length === 0 ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <p className="text-center text-base-content/60">
                No performance data available. Add investments to see your portfolio performance.
              </p>
            </div>
          ) : (
            <div className="w-full h-[300px] relative">
              {/* Legend in top right with values below labels */}
              <div className="absolute top-0 right-0 flex items-center gap-8 text-sm">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6b8e23]"></div>
                    <span className="text-gray-600 dark:text-gray-300">Portfolio value</span>
                  </div>
                  <span className="font-semibold text-gray-600 dark:text-gray-300 mt-1">
                    {formatCurrency(hoveredData ? hoveredData.value : portfolioSummary.total)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-gray-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Net deposits</span>
                  </div>
                  <span className="font-semibold text-gray-600 dark:text-gray-300 mt-1">
                    {formatCurrency(hoveredData ? 
                      hoveredData.deposits : 
                      (portfolioSummary.total - portfolioSummary.profit))}
                  </span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceData}
                  margin={{ top: 30, right: 30, left: 40, bottom: 0 }}
                  onMouseMove={(data) => {
                    if (data && data.activePayload && data.activePayload.length) {
                      setHoveredData({
                        date: data.activePayload[0].payload.date,
                        value: data.activePayload[0].payload.value,
                        deposits: data.activePayload[0].payload.deposits
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredData(null);
                  }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b8e23" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6b8e23" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke="rgba(255, 255, 255, 0.1)"
                    horizontal={true}
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                    dx={-5}
                    width={60}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ 
                      stroke: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      strokeDasharray: '3 3',
                      strokeWidth: 1
                    }}
                    contentStyle={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      padding: 0,
                      boxShadow: 'none',
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="flex flex-col items-center">
                            <div className="text-base font-medium text-gray-600 dark:text-gray-300">{label}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    formatter={(value, name) => {
                      return [formatCurrency(value), name === 'value' ? 'Portfolio Value' : 'Net Deposits'];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6b8e23"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#6b8e23" }}
                  />
                  {/* Add the deposits line */}
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="none"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 