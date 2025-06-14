'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useMemo } from 'react';
import { formatCurrency, formatPercentage } from '../services/intlService';
import ErrorLoadingData from './ErrorLoadingData';
import { getChartColors } from '../services/chartService';
import { BREAKPOINTS } from '@/services/breakpointService';
import { useTailwindBreakpoint } from '@/hooks/useTailwindBreakpoint';
import { useSystemTheme } from '@/hooks/useSystemTheme';

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100 p-2 border border-base-300 shadow-md rounded-md">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: payload[0].payload.fill || payload[0].color }}
          />
          <span className="font-medium">{payload[0].payload.name}</span>
        </div>
        <p className="text-sm mt-1">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function AllocationChart({ isLoading, activeTab, assetData, error }) {

  const { breakpointInPixels } = useTailwindBreakpoint();
  const theme = useSystemTheme();

  const chartColors = getChartColors(theme);
  const isDesktopOrUpper = breakpointInPixels >= BREAKPOINTS.LG;
  
  // Add fill property to data for tooltip color  
  const assetDataWithFill = useMemo(() => {
    return assetData.map((item, index) => ({
      name: item.description,
      value: item.valuationInPreferredCurrency,
      fill: chartColors[index % chartColors.length]
    }));
  }, [assetData, chartColors]);

  // Render pie custom label
  function renderPieCustomLabel({ cx, cy, midAngle, outerRadius, percent, index, name }){
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25; // Add padding
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    let y = cy + radius * Math.sin(-midAngle * RADIAN);

    // ADD vertical offset to avoid collision from tight stacking
    const verticalPadding = percent < 0.03 ? 1 : 0; // Adjust this as needed
    y += verticalPadding * (index % 3 - 1); // alternates -1, 0, 1 for some breathing room

    const totalNumberOfAssets = assetData.length;
    const fontSize = (isDesktopOrUpper && totalNumberOfAssets > 10) ? 9 : 12;

    return (
      <text
        x={x}
        y={y}
        fill={chartColors[index % chartColors.length]}
        fontSize={fontSize}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        {`${formatPercentage(percent * 100, 2)} ${isDesktopOrUpper ? name : ''}`}
      </text>
    );
  }

  // Chart UI based on the state of the component
  let chartUI = null;

  if (isLoading) {
    chartUI = (
      <div className="flex w-full flex-col gap-4">
         <div className="flex items-center justify-center mx-auto gap-4">
          <div className="skeleton h-48 w-48 shrink-0 rounded-full"></div>
          <div className="flex w-full flex-col gap-4 hidden md:flex">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-4 w-32"></div>
            <div className="skeleton h-4 w-32"></div>
          </div>
        </div>
      </div>
    );
  } else if (error) {
    chartUI = (
      <ErrorLoadingData error={error} />
    );
  } else if (assetData.length === 0) {
    chartUI = (
      <p className="text-center text-base-content/60">
        No allocation data available. Add assets to see your portfolio allocation.
      </p>
    );
  } else {
    chartUI = (
      <>
        {/* Heading */}
        <h3 className="text-lg font-semibold text-center flex items-center justify-center gap-2 sr-only">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
          {activeTab === 'categories' ? 'Categories' : 'Positions'}
        </h3>

        {/* Chart */}
        {assetData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart width={400} height={400}>
              <Pie
                data={assetDataWithFill}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={renderPieCustomLabel}
                outerRadius={isDesktopOrUpper ? 140 : 95}
                nameKey="name"
                dataKey="value"
                animationEasing="ease-in-out"
                animationDuration={150}
                stroke={theme === 'light' ? '#fff' : '#2a303c'}
              >
                {assetDataWithFill.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4 h-[300px] lg:h-[400px] flex items-center justify-center">

        {chartUI}

      </div>
    </div>
  );
  
} 