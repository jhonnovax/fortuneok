'use client';

import React from 'react';

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-4 md:gap-8 text-xs sm:text-sm md:text-base">
      <button 
        className={`pb-4 px-1 relative flex items-center gap-2 ${
          activeTab === 'performance' 
            ? 'text-success font-medium' 
            : 'text-base-content hover:text-base-content/80'
        }`}
        onClick={() => onTabChange('performance')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
        Performance
        {activeTab === 'performance' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-success"></div>
        )}
      </button>
      <button 
        className={`pb-4 px-1 relative flex items-center gap-2 ${
          activeTab === 'allocation' 
            ? 'text-success font-medium' 
            : 'text-base-content hover:text-base-content/80'
        }`}
        onClick={() => onTabChange('allocation')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
        Allocation
        {activeTab === 'allocation' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-success"></div>
        )}
      </button>
    </div>
  );
} 