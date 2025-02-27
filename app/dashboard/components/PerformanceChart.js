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

const data = [
  { date: 'Jan', value: 4000, deposits: 3000 },
  { date: 'Feb', value: 3000, deposits: 3000 },
  { date: 'Mar', value: 5000, deposits: 3500 },
  { date: 'Apr', value: 2780, deposits: 3500 },
  { date: 'May', value: 1890, deposits: 3500 },
  { date: 'Jun', value: 2390, deposits: 4000 },
  { date: 'Jul', value: 3490, deposits: 4000 },
  { date: 'Aug', value: 4000, deposits: 4000 },
  { date: 'Sep', value: 3000, deposits: 4500 },
  { date: 'Oct', value: 5000, deposits: 4500 },
  { date: 'Nov', value: 2780, deposits: 4500 },
  { date: 'Dec', value: 3890, deposits: 5000 },
];

export default function PerformanceChart() {
  const [theme, setTheme] = useState('light');
  
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
  
  // Theme-specific colors
  const colors = {
    primary: theme === 'dark' ? '#009b00' : '#006e00',
    deposits: theme === 'dark' ? '#ffd700' : '#b8860b', // Brighter yellow for dark theme, darker for light
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.primary} stopOpacity={0.4}/>
              <stop offset="50%" stopColor={colors.primary} stopOpacity={0.2}/>
              <stop offset="100%" stopColor={colors.primary} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke="hsl(var(--bc) / 0.1)"
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--bc) / 0.5)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--bc) / 0.5)', fontSize: 12 }}
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
            }}
            labelStyle={{ 
              color: 'hsl(var(--bc))', 
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
            formatter={(value, name) => [
              formatValue(value),
              name === 'value' ? 'Portfolio Value' : 'Net Deposits'
            ]}
            itemStyle={{ padding: '2px 0' }}
          />
          {/* Net Deposits Line */}
          <Area
            type="monotone"
            dataKey="deposits"
            stroke={colors.deposits}
            strokeWidth={2}
            fill="none"
            strokeDasharray="6 6"
            dot={false}
            activeDot={{
              r: 4,
              stroke: colors.deposits,
              strokeWidth: 2,
              fill: 'hsl(var(--b1))'
            }}
          />
          {/* Portfolio Value Area */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.primary}
            strokeWidth={2}
            fill="url(#colorValue)"
            dot={false}
            activeDot={{
              r: 4,
              stroke: colors.primary,
              strokeWidth: 2,
              fill: 'hsl(var(--b1))'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 