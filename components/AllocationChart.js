'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useState, useEffect } from 'react';
import { formatCurrency, formatPercentage } from '../services/intlService';
import ErrorLoadingData from './ErrorLoadingData';
import LoadingSpinner from './LoadingSpinner';
import { getAssetCategoryGroup } from '../services/assetService';
import { COLORS } from '../services/ChartService';

const renderPieCustomLabel = ({ percent }) => {
  return `${formatPercentage(percent * 100, 2)}`;
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

export default function AllocationChart({ isLoading, activeTab, data, error }) {
  const [categoryData, setCategoryData] = useState([]);
  const [categoryDataWithPercentage, setCategoryDataWithPercentage] = useState([]);
  const [assetData, setAssetData] = useState([]);

  useEffect(() => {
    // Process assets to create category allocation data
    const categoryAllocationData = processAssetsForCategoryAllocation(data);
    setCategoryData(categoryAllocationData);
    
    // Calculate total for percentages
    const categoryTotal = categoryAllocationData.reduce((sum, item) => sum + item.value, 0);
    
    // Add percentage to each category item
    const categoryWithPercentage = categoryAllocationData.map(item => ({
      ...item,
      percentage: ((item.value / categoryTotal) * 100).toFixed(1)
    }));
    
    setCategoryDataWithPercentage(categoryWithPercentage);

    // Process assets to create asset allocation data
    const assetAllocationData = processAssetsForAssetAllocation(data);
    setAssetData(assetAllocationData);
  }, [data]);

  // Process assets to create category allocation data
  const processAssetsForCategoryAllocation = (assets) => {
    if (!assets || assets.length === 0) {
      return [];
    }

    // Create a map to store values by category
    const categoryMap = {};

    // Process each asset
    data.forEach(asset => {
      const assetCategoryGroup = getAssetCategoryGroup(asset.category);
      
      if (!categoryMap[assetCategoryGroup]) {
        categoryMap[assetCategoryGroup] = {
          name: assetCategoryGroup,
          value: 0
        };
      }

      // Calculate total value from transactions
      const assetValue = asset.currentValuation?.amount || 0;

      categoryMap[assetCategoryGroup].value += assetValue;
    });

    // Convert to array and filter out categories with zero or negative value
    return Object.values(categoryMap)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  // Process assets to create asset allocation data
  const processAssetsForAssetAllocation = (assets) => {
    if (!assets || assets.length === 0) {
      return [];
    }

    // Create a map to store values by asset
    const assetMap = {};

    // Process each asset
    assets.forEach(asset => {
      const assetName = asset.symbol || asset.description;
      const assetKey = `${asset.id}`;
      
      if (!assetMap[assetKey]) {
        assetMap[assetKey] = {
          name: assetName,
          value: 0,
          category: asset.category
        };
      }

      // Calculate total value from transactions
      const assetValue = asset.currentValuation?.amount || 0;

      assetMap[assetKey].value += assetValue;
    });

    // Convert to array and filter out assets with zero or negative value
    const result = Object.values(assetMap)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
    
    // Limit to top 10 assets for better visualization
    return result.slice(0, 10);
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
  
  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="space-y-6"> 
            <LoadingSpinner loadingText="Loading charts..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="space-y-6"> 
            <ErrorLoadingData error={error} />
          </div>
        </div>
      </div>
    );
  }

  if (categoryDataWithPercentage.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="space-y-6"> 
            <div className="w-full h-[300px] flex items-center justify-center">
              <p className="text-center text-base-content/60">
                No allocation data available. Add assets to see your portfolio allocation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body p-4">
        <div className="flex flex-col 2xl:flex-row gap-8">

          {/* Category Allocation */}
          <div className={`flex-1 ${['all', 'categories'].includes(activeTab) ? '' : 'hidden'}`}>
            <h3 className={`text-lg font-semibold text-center flex items-center justify-center gap-2 ${activeTab === 'categories' ? 'hidden' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
              Categories
            </h3>
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
                      labelLine={true}
                      label={renderPieCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      nameKey="name"
                      dataKey="value"
                    >
                      {categoryDataWithFill.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Asset Allocation */}
          <div className={`flex-1 ${['all', 'positions'].includes(activeTab) ? '' : 'hidden'}`}>
            <h3 className={`text-lg font-semibold text-center flex items-center justify-center gap-2 ${activeTab === 'positions' ? 'hidden' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
              Positions
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
                      labelLine={true}
                      label={renderPieCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      nameKey="name"
                      dataKey="value"
                    >
                      {assetDataWithFill.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
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