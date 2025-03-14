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
import { getInvestments } from '../services/investmentService';
import { formatCurrency } from '../services/formatService';

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
const renderPercentageLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }) => {
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

// Render the external label with connecting line
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }) => {
  // Calculate the point on the pie edge
  const radius = outerRadius * 1.4; // Increase this value to push labels further out
  
  // Calculate end point for the label
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Calculate the point where line starts (on the pie)
  const startX = cx + (outerRadius * 0.95) * Math.cos(-midAngle * RADIAN);
  const startY = cy + (outerRadius * 0.95) * Math.sin(-midAngle * RADIAN);

  // Determine text anchor based on position
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <g>
      {/* Simple straight line */}
      <line
        x1={startX}
        y1={startY}
        x2={x}
        y2={y}
        stroke="hsl(var(--bc) / 0.5)"
        strokeWidth="1"
      />
      
      {/* Label text */}
      <text
        x={x}
        y={y}
        dy={-2}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-sm"
      >
        <tspan fontWeight="bold">{name}</tspan>
      </text>
      <text
        x={x}
        y={y}
        dy={16}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-sm"
      >
        ${formatCurrency(value)}
      </text>
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
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

export default function AllocationChart() {
  const [categoryData, setCategoryData] = useState([]);
  const [categoryDataWithPercentage, setCategoryDataWithPercentage] = useState([]);
  const [assetData, setAssetData] = useState([]);
  const [assetDataWithPercentage, setAssetDataWithPercentage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllocationData = async () => {
      try {
        setLoading(true);
        const investments = await getInvestments();
        
        // Process investments to create category allocation data
        const categoryAllocationData = processInvestmentsForCategoryAllocation(investments);
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
        const assetAllocationData = processInvestmentsForAssetAllocation(investments);
        setAssetData(assetAllocationData);
        
        // Calculate total for percentages
        const assetTotal = assetAllocationData.reduce((sum, item) => sum + item.value, 0);
        
        // Add percentage to each asset item
        const assetWithPercentage = assetAllocationData.map(item => ({
          ...item,
          percentage: ((item.value / assetTotal) * 100).toFixed(1)
        }));
        
        setAssetDataWithPercentage(assetWithPercentage);
      } catch (err) {
        console.error('Failed to fetch allocation data:', err);
        setError('Failed to load allocation data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllocationData();
  }, []);

  // Process investments to create category allocation data
  const processInvestmentsForCategoryAllocation = (investments) => {
    if (!investments || investments.length === 0) {
      return [];
    }

    // Create a map to store values by category
    const categoryMap = {};

    // Process each investment
    investments.forEach(investment => {
      const category = investment.category;
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: getCategoryDisplayName(category),
          value: 0
        };
      }

      // Calculate total value from transactions
      let investmentValue = 0;
      
      investment.transactions.forEach(transaction => {
        if (['buy', 'deposit'].includes(transaction.operation)) {
          investmentValue += transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['sell', 'withdrawal'].includes(transaction.operation)) {
          investmentValue -= transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['dividend', 'interest'].includes(transaction.operation)) {
          investmentValue += transaction.pricePerUnit;
        }
      });

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
      let investmentValue = 0;
      
      investment.transactions.forEach(transaction => {
        if (['buy', 'deposit'].includes(transaction.operation)) {
          investmentValue += transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['sell', 'withdrawal'].includes(transaction.operation)) {
          investmentValue -= transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['dividend', 'interest'].includes(transaction.operation)) {
          investmentValue += transaction.pricePerUnit;
        }
      });

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
    const displayNames = {
      'Stock': 'Stocks',
      'ETF': 'ETFs',
      'Bond': 'Bonds',
      'Real Estate': 'Real Estate',
      'Crypto': 'Crypto',
      'Cash': 'Cash',
      'Other': 'Other'
    };
    
    return displayNames[category] || category;
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
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-error text-center">
          <p>{error}</p>
          <button className="btn btn-sm btn-outline mt-2" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (categoryDataWithPercentage.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="text-center text-gray-500">
          No allocation data available. Add investments to see your portfolio allocation.
        </p>
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
            <h3 className="text-lg font-semibold mb-4 text-center">Asset Allocation</h3>
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