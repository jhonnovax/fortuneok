'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

// Base64 encoded small placeholder image to avoid external requests
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWhlbHAtY2lyY2xlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik05LjA5IDlhMyAzIDAgMCAxIDUuODMgMWMwIDItMyAzLTMgMyIvPjxwYXRoIGQ9Ik0xMiAxN2guMDEiLz48L3N2Zz4=';

/**
 * SymbolCombobox component for searching and selecting asset symbols
 */
export default function SymbolCombobox({ 
  value, 
  onChange, 
  type = 'all',
  placeholder = 'Search for a symbol...',
  className = '',
  error = null,
  disabled = false
}) {
  // State
  const [inputValue, setInputValue] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  
  // Refs
  const comboboxRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const preventSearchRef = useRef(false);
  
  // Search function
  function search(query) {
    // Don't search if prevented (after selection or clicking outside)
    if (preventSearchRef.current) {
      preventSearchRef.current = false;
      return;
    }
    
    // Don't search if empty
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    
    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Set loading state
    setIsLoading(true);
    
    // Debounce search
    timeoutRef.current = setTimeout(() => {
      // Double-check that search is still needed
      if (preventSearchRef.current) {
        preventSearchRef.current = false;
        setIsLoading(false);
        return;
      }
      
      fetch(`/api/symbols/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`)
        .then(res => res.json())
        .then(data => {
          // Only update if we're not prevented
          if (!preventSearchRef.current) {
            setResults(data);
            setShowDropdown(true);
          }
        })
        .catch(err => console.error('Error searching symbols:', err))
        .finally(() => setIsLoading(false));
    }, 300);
  }
  
  // Handle input change
  function handleInputChange(e) {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (!newValue.trim()) {
      onChange({ symbol: '', description: '' });
      setResults([]);
      setShowDropdown(false);
    } else {
      search(newValue);
    }
  }
  
  // Handle selection
  const handleSelect = useCallback((item) => {
    // Prevent search from running after selection
    preventSearchRef.current = true;
    
    // Update state
    setInputValue(item.symbol);
    setShowDropdown(false);
    setResults([]);
    
    // Notify parent
    onChange({ symbol: item.symbol, description: item.name || item.description || '' });
    
    // Clear any pending search
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [onChange]);
  
  // Handle clear button
  function handleClear() {
    setInputValue('');
    setResults([]);
    setShowDropdown(false);
    onChange({ symbol: '', description: '' });
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    inputRef.current?.focus();
  }
  
  // Handle image error
  function handleImageError(symbol) {
    setFailedImages(prev => ({
      ...prev,
      [symbol]: true
    }));
  }
  
  // Initialize with value
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);
  
  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        // Cancel any pending API calls
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // Prevent search from running after clicking outside
        preventSearchRef.current = true;
        
        // Close dropdown and stop loading state
        setShowDropdown(false);
        setIsLoading(false);
        
        // If there's text in the input but it doesn't match a valid selection
        // (i.e., the user typed something but didn't select from dropdown)
        if (inputValue && inputValue !== value) {
          // Check if the input matches any result exactly
          const exactMatch = results.find(item => item.symbol === inputValue);
          
          if (exactMatch) {
            // If there's an exact match, use it
            handleSelect(exactMatch);
          } else {
            // Otherwise clear the input
            setInputValue('');
            onChange({ symbol: '', description: '' });
            setResults([]);
          }
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, value, results, onChange, handleSelect]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="form-control w-full relative" ref={comboboxRef}>
      <div className="w-full">
        <input
          ref={inputRef}
          type="text"
          className={`input input-bordered w-full ${error ? 'input-error' : ''} ${className} ${inputValue ? 'pr-16' : ''}`}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            // Only search on focus if not prevented and there's input
            if (inputValue.trim().length > 0 && !preventSearchRef.current) {
              search(inputValue);
            }
          }}
          disabled={disabled}
          autoComplete="off"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 top-0 flex items-center pr-3 pointer-events-none">
            <span className="loading loading-spinner loading-sm text-primary"></span>
          </div>
        )}
        
        {/* Clear button */}
        {inputValue && !disabled && (
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
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50">
          <div className="shadow bg-base-100 rounded-box overflow-hidden">
            <ul className="max-h-60 overflow-y-auto overflow-x-hidden">
              {results.map((item) => (
                <li key={item.symbol} className="border-b border-base-200 last:border-b-0">
                  <button 
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-base-200 text-left"
                  >
                    <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                      <Image 
                        src={failedImages[item.symbol] ? FALLBACK_IMAGE : item.image} 
                        alt={item.symbol} 
                        className="w-6 h-6 object-contain flex-shrink-0"
                        onError={() => handleImageError(item.symbol)}
                        loading="lazy"
                        width={24}
                        height={24}
                      />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium">{item.symbol}</span>
                      <span className="text-xs opacity-70 truncate w-full">{item.name || item.description || ''}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* No results message */}
      {showDropdown && inputValue.trim().length > 0 && results.length === 0 && !isLoading && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50">
          <div className="p-2 shadow bg-base-100 rounded-box">
            <p className="text-sm text-center py-2">No results found</p>
          </div>
        </div>
      )}

    </div>

  );
} 