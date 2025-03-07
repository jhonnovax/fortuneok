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

export default function PerformanceChart({ 
  timeframe = 'all',
  data = [],
  portfolioSummary = { total: 0, profit: 0, profitPercentage: 0, period: 'all' },
  loading = false,
  error = null
}) {
  const [theme, setTheme] = useState('light');
  const [isValueVisible, setIsValueVisible] = useState(true);
  
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

  const formatValue = (value) => `$${value.toLocaleString()}`;
  
  // Helper function to mask value
  const maskValue = () => '$ • • • • • • ';
  
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
          {/* Portfolio Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold">
                {isValueVisible 
                  ? `$${portfolioSummary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : maskValue()
                }
              </span>
              <button 
                className="btn btn-circle btn-ghost btn-sm text-primary"
                onClick={() => setIsValueVisible(!isValueVisible)}
              >
                {isValueVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-lg">
              <span className={`font-medium ${portfolioSummary.profit >= 0 ? 'text-success' : 'text-error'}`}>
                {isValueVisible ? (
                  `${portfolioSummary.profit >= 0 ? '+' : ''}$${Math.abs(portfolioSummary.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                ) : '$ • • •'}
              </span>
              {isValueVisible &&
                <>
                  <span className={`font-medium ${portfolioSummary.profit >= 0 ? 'text-success' : 'text-error'}`}>
                    ({portfolioSummary.profit >= 0 ? '+' : ''}{portfolioSummary.profitPercentage}%)
                  </span>
                  <span className="text-base-content/60">{portfolioSummary.period}</span>
                </>
              }
            </div>
          </div>
          
          {/* Performance Chart */}
          {data.length === 0 ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <p className="text-center text-base-content/60">
                No performance data available. Add investments to see your portfolio performance.
              </p>
            </div>
          ) : (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity={0.6}/>
                      <stop offset="50%" stopColor="hsl(var(--p))" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="hsl(var(--p))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false}
                    stroke="hsl(var(--bc) / 0.2)"
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--bc))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--bc))', fontSize: 12 }}
                    tickFormatter={formatValue}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--b1))',
                      border: '1px solid hsl(var(--bc) / 0.2)',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      color: 'hsl(var(--bc))'
                    }}
                    labelStyle={{ 
                      color: 'hsl(var(--bc))', 
                      marginBottom: '0.5rem',
                      fontWeight: 'bold',
                    }}
                    formatter={(value, name) => [
                      formatValue(value),
                      name === 'value' ? 'Portfolio Value' : 'Total Deposits'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--p))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--p))" }}
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