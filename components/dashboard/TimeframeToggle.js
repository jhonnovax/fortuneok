'use client';

import { useState } from 'react';

export default function TimeframeToggle({ selected, onSelect }) {
  const [isMonthsDropdownOpen, setIsMonthsDropdownOpen] = useState(false);
  const [isYearsDropdownOpen, setIsYearsDropdownOpen] = useState(false);

  // Short timeframe options (displayed as buttons)
  const shortTimeframes = [
    { value: '1D', label: 'Day' },
    { value: '1W', label: 'Week' },
  ];

  // Month options for dropdown
  const monthOptions = [
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
  ];

  // Year options for dropdown
  const yearOptions = [
    { value: '1Y', label: '1 Year' },
    { value: '5Y', label: '5 Years' },
    { value: '10Y', label: '10 Years' },
  ];

  // Get the current selected option's label
  const getSelectedLabel = () => {
    if (selected === 'all') return 'All time';
    
    const option = [...shortTimeframes, ...monthOptions, ...yearOptions].find(opt => opt.value === selected);
    return option ? option.label : '1 month'; // Default to 1 month if not found
  };

  // Check if the selected option is a month option
  const isMonthSelected = monthOptions.some(opt => opt.value === selected);
  
  // Check if the selected option is a year option
  const isYearSelected = yearOptions.some(opt => opt.value === selected);

  return (
    <div className="flex items-center gap-1 bg-base-200 rounded-lg p-1 text-xs sm:text-sm md:text-base">
      {/* Regular timeframe buttons */}
      {shortTimeframes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors
            ${selected === value 
              ? 'bg-primary text-primary-content' 
              : 'text-base-content hover:bg-base-300'
            }`}
        >
          {label}
        </button>
      ))}

      {/* Months Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsMonthsDropdownOpen(!isMonthsDropdownOpen);
            setIsYearsDropdownOpen(false);
          }}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1
            ${isMonthSelected
              ? 'bg-primary text-primary-content' 
              : 'text-base-content hover:bg-base-300'
            }`}
        >
          {isMonthSelected 
            ? getSelectedLabel() 
            : 'Months'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-4 h-4"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Months Dropdown menu */}
        {isMonthsDropdownOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsMonthsDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-1 bg-base-100 rounded-lg shadow-lg py-1 w-36 z-10">
              {monthOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    onSelect(value);
                    setIsMonthsDropdownOpen(false);
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

      {/* Years Dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setIsYearsDropdownOpen(!isYearsDropdownOpen);
            setIsMonthsDropdownOpen(false);
          }}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1
            ${isYearSelected
              ? 'bg-primary text-primary-content' 
              : 'text-base-content hover:bg-base-300'
            }`}
        >
          {isYearSelected 
            ? getSelectedLabel() 
            : 'Years'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-4 h-4"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Years Dropdown menu */}
        {isYearsDropdownOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsYearsDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-1 bg-base-100 rounded-lg shadow-lg py-1 w-36 z-10">
              {yearOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => {
                    onSelect(value);
                    setIsYearsDropdownOpen(false);
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
        className={`px-3 py-1.5 font-medium rounded-md transition-colors
          ${selected === 'all'
            ? 'bg-primary text-primary-content' 
            : 'text-base-content hover:bg-base-300'
          }`}
      >
        All <span className="hidden md:inline">time</span>
      </button>
    </div>
  );
} 