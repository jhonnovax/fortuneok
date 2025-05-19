'use client';

import { useState, useEffect, useRef } from 'react';
import currencies from '@/public/currencies.json';

export default function CurrencyCombobox({ 
  autoFocus = false,
  className = '',
  error = null,
  showClearButton = true,
  disabled = false,
  value,
  onChange, 
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const comboboxRef = useRef(null);
  const inputRef = useRef(null);
  
  // Filter currencies based on input
  function filterCurrencies(query) {
    if (!query.trim()) {
      return currencies;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return currencies.filter(currency => 
      currency.code.toLowerCase().includes(lowercaseQuery) || 
      currency.label.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Handle input change
  function handleInputChange(e) {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const filtered = filterCurrencies(newValue);
    setFilteredCurrencies(filtered);
    setShowDropdown(true);
    
    // If input is cleared, also clear the selected value
    if (!newValue.trim()) {
      onChange('');
    }
  }
  
  // Handle currency selection
  function handleSelect(currency) {
    setInputValue(`${currency.flag} ${currency.code} - ${currency.label}`);
    onChange(currency.code);
    setShowDropdown(false);
  }
  
  // Handle input focus
  function handleFocus() {
    const filtered = filterCurrencies(inputValue);
    setFilteredCurrencies(filtered);
    setShowDropdown(true);
  }
  
  // Handle clear button
  function handleClear() {
    setInputValue('');
    onChange('');
    setShowDropdown(false);
    inputRef.current?.focus?.();
  }

  // Initialize with value
  useEffect(() => {
    if (value) {
      const selectedCurrency = currencies.find(c => c.code === value);
      if (selectedCurrency) {
        setInputValue(`${selectedCurrency.flag} ${selectedCurrency.code} - ${selectedCurrency.label}`);
      } else {
        setInputValue(value);
      }
    } else {
      setInputValue('');
    }
  }, [value]);
  
  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setShowDropdown(false);
        
        // Check if the current input value corresponds to a valid selection
        const inputText = inputValue.trim();
        const matchedCurrency = currencies.find(c => 
          `${c.flag} ${c.code} - ${c.label}` === inputText || 
          c.code === inputText
        );
        
        // If not a valid selection, clear the input and notify parent
        if (!matchedCurrency) {
          setInputValue('');
          onChange('');
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, onChange]);
  
  return (
    <div className={`form-control w-full relative ${className}`} ref={comboboxRef}>
      <div className="w-full">
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          autoComplete="off"
          type="text"
          className={`input input-bordered w-full ${error ? 'input-error' : ''} ${inputValue ? 'pr-16' : ''}`}
          placeholder="Select currency..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
        />
        
        {/* Clear button */}
        {inputValue && !disabled && showClearButton && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 top-0 flex items-center pr-3"
            onClick={handleClear}
            aria-label="Clear input"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && <span className="text-error text-sm mt-1">{error}</span>}
      
      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50">
          <div className="shadow bg-base-100 rounded-box overflow-hidden">
            <ul className="max-h-60 overflow-y-auto overflow-x-hidden">
              {(filteredCurrencies.length > 0 ? filteredCurrencies : currencies).map((currency) => (
                <li key={currency.code} className="border-b border-base-200 last:border-b-0">
                  <button 
                    type="button"
                    onClick={() => handleSelect(currency)}
                    className="w-full flex items-center gap-1 p-3 hover:bg-base-200 text-left"
                  >
                    {/* Flag with border */}
                    <div className="w-8 h-6 flex-shrink-0 overflow-hidden rounded flex items-center justify-center">
                      <span className="text-xl">{currency.flag}</span>
                    </div>
                    
                    {/* Currency code in pill */}
                    <div className="text-sm pr-1 py-1 rounded">
                      {currency.code}
                    </div>
                    
                    {/* Currency name */}
                    <span className="text-base-content">{currency.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
    </div>
  );
} 