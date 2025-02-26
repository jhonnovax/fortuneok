'use client';

import { useState } from 'react';

export default function TimeframeToggle({ selected, onSelect }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const timeframes = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
  ];

  const yearOptions = [
    { value: '1Y', label: '1 Year' },
    { value: '5Y', label: '5 Years' },
    { value: '10Y', label: '10 Years' },
  ];

  return (
    <div className="flex items-center gap-1 bg-base-200 rounded-lg p-1">
      {/* Regular timeframe buttons */}
      {timeframes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${selected === value 
              ? 'bg-primary text-primary-content' 
              : 'text-base-content hover:bg-base-300'
            }`}
        >
          {value}
        </button>
      ))}

      {/* Year options dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1
            ${yearOptions.some(opt => opt.value === selected)
              ? 'bg-primary text-primary-content' 
              : 'text-base-content hover:bg-base-300'
            }`}
        >
          {yearOptions.find(opt => opt.value === selected)?.value || '1Y'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-4 h-4"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-1 bg-base-100 rounded-lg shadow-lg py-1 w-32 z-10">
              {yearOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    onSelect(value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-base-200 transition-colors
                    ${selected === value ? 'text-primary font-medium' : 'text-base-content'}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* All Time option */}
      <button
        onClick={() => onSelect('all')}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
          ${selected === 'all'
            ? 'bg-primary text-primary-content' 
            : 'text-base-content hover:bg-base-300'
          }`}
      >
        All
      </button>
    </div>
  );
} 