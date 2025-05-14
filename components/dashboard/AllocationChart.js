'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useState, useEffect } from 'react';
import { formatCurrency } from '../../services/intlService';
import ErrorLoadingData from './ErrorLoadingData';
import LoadingSpinner from './LoadingSpinner';
import { INVESTMENT_CATEGORIES } from '@/services/investmentService';

const COLORS = [
  '#006e00', // Primary green
  '#4338ca', // Indigo
  '#0891b2', // Cyan
  '#c026d3', // Fuchsia
  '#ea580c', // Orange
  '#0369a1', // Blue
  '#15803d', // Green
  '#b91c1c', // Red
  '#7e22ce', // Purple
  '#ca8a04', // Yellow
];

const RADIAN = Math.PI / 180;

// Render the percentage inside the slice
const renderPercentageLabel = ({ cx, cy, midAngle, outerRadius, percent }) => {
  const radius = 0.5 * outerRadius;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  if (percent < 0.05) return null;
  
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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

export default function AllocationChart({ loading, data, error }) {
  const [categoryData, setCategoryData] = useState([]);
  const [categoryDataWithPercentage, setCategoryDataWithPercentage] = useState([]);
  const [assetData, setAssetData] = useState([]);

  useEffect(() => {
    // Process investments to create category allocation data
    const categoryAllocationData = processInvestmentsForCategoryAllocation(data);
    setCategoryData(categoryAllocationData);
    
    // Calculate total for percentages
    const categoryTotal = categoryAllocationData.reduce((sum, item) => sum + item.value, 0);
    
    // Add percentage to each category item
    const categoryWithPercentage = categoryAllocationData.map(item => ({
      ...item,
      percentage: ((item.value / categoryTotal) * 100).toFixed(1)
    }));
    
    setCategoryDataWithPercentage(categoryWithPercentage);

    // Process investments to create asset allocation data
    const assetAllocationData = processInvestmentsForAssetAllocation(data);
    setAssetData(assetAllocationData);
  }, [data]);

  // Process investments to create category allocation data
  const processInvestmentsForCategoryAllocation = (investments) => {
    if (!investments || investments.length === 0) {
      return [];
    }

    // Create a map to store values by category
    const categoryMap = {};

    // Process each investment
    data.forEach(investment => {
      const category = investment.category;
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: getCategoryDisplayName(category),
          value: 0
        };
      }

      // Calculate total value from transactions
      const investmentValue = investment.currentValuation?.amount || 0;

      categoryMap[category].value += investmentValue;
    });

    // Convert to array and filter out categories with zero or negative value
    return Object.values(categoryMap)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  // Process investments to create asset allocation data
  const processInvestmentsForAssetAllocation = (investments) => {
    if (!investments || investments.length === 0) {
      return [];
    }

    // Create a map to store values by asset
    const assetMap = {};

    // Process each investment
    investments.forEach(investment => {
      const assetName = investment.symbol || investment.description;
      const assetKey = `${investment.id}`;
      
      if (!assetMap[assetKey]) {
        assetMap[assetKey] = {
          name: assetName,
          value: 0,
          category: investment.category
        };
      }

      // Calculate total value from transactions
      const investmentValue = investment.currentValuation?.amount || 0;

      assetMap[assetKey].value += investmentValue;
    });

    // Convert to array and filter out assets with zero or negative value
    const result = Object.values(assetMap)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
    
    // Limit to top 10 assets for better visualization
    return result.slice(0, 10);
  };

  // Helper function to get display name for category
  const getCategoryDisplayName = (category) => {
    const categoryInfo = INVESTMENT_CATEGORIES.find(cat => cat.value === category);
    const categoryDisplayName = categoryInfo  
      ? categoryInfo.label.slice(2, categoryInfo.label.length) // Remove the first two characteres (emoticons)
      : category;
    
    return categoryDisplayName || category;
  };

  // Add fill property to data for tooltip color
  const categoryDataWithFill = categoryData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));
  
  const assetDataWithFill = assetData.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));
  
  if (loading) {
    return <LoadingSpinner loadingText="Loading allocation data..." />;
  }

  if (error) {
    return <ErrorLoadingData error={error} />;
  }

  if (categoryDataWithPercentage.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="space-y-6"> 
            <div className="w-full h-[300px] flex items-center justify-center">
              <p className="text-center text-base-content/60">
                No allocation data available. Add investments to see your portfolio allocation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex flex-col 2xl:flex-row gap-8">
          {/* Category Allocation */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-center">Category Allocation</h3>
            <div className="h-[300px]">
              {categoryData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDataWithFill}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPercentageLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      nameKey="name"
                      dataKey="value"
                    >
                      {categoryDataWithFill.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          {/* Asset Type Allocation */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Positions Allocation
            </h3>
            <div className="h-[300px]">
              {assetData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetDataWithFill}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPercentageLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      nameKey="name"
                      dataKey="value"
                    >
                      {assetDataWithFill.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 