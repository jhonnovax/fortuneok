'use client';

import React from 'react';

export default function TabAssetGroups({ className, activeTab, onTabChange }) {
  
  return (
    <div role="tablist" className={`tabs tabs-lifted tabs-lg ${className}`}>

      <button 
        role="tab"
        className={`tab gap-2 ${
          activeTab === 'categories' 
            ? 'text-green-700 dark:text-green-400 font-medium tab-active' 
            : 'text-base-content hover:text-base-content/80'
        }`}
        onClick={() => onTabChange('categories')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
        Categories
      </button>

      <button 
        role="tab"
        className={`tab p-6 gap-2 ${
          activeTab === 'positions' 
            ? 'text-green-700 dark:text-green-400 font-medium tab-active' 
            : 'text-base-content hover:text-base-content/80'
        }`}
        onClick={() => onTabChange('positions')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
        Positions
      </button>

    </div>
  );

} 