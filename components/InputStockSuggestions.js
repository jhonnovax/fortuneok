'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import InputSuggestionList from './InputSuggestionList';

// Base64 encoded small placeholder image to avoid external requests
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWhlbHAtY2lyY2xlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik05LjA5IDlhMyAzIDAgMCAxIDUuODMgMWMwIDItMyAzLTMgMyIvPjxwYXRoIGQ9Ik0xMiAxN2guMDEiLz48L3N2Zz4=';

export default function InputStockSuggestions({ 
  className,
  disabled,
  error,
  placeholder,
  type = 'all',
  value, 
  onSelect, 
}) {

  const timeoutRef = useRef(null);
  const preventSearchRef = useRef(false);

  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  
  // Input changes search term
  function handleChange(searchTerm) {
    // Don't search if prevented (after selection or input lost focus)
    if (preventSearchRef.current) {
      preventSearchRef.current = false;
      return;
    }
    
    // Don't search if empty
    if (!searchTerm.trim()) {
      setResults([]);
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

      fetch(`/api/symbols/search?query=${encodeURIComponent(searchTerm)}&type=${encodeURIComponent(type)}`)
        .then(res => res.json())
        .then(data => {
          // Only update if we're not prevented
          if (!preventSearchRef.current) {
            const symbolsSuggestionList = data.map(item => ({
              currency: item.currency,
              description: item.description,
              image: item.image,
              value: item.symbol,
              label: item.name
            }));
            setResults(symbolsSuggestionList);
          }
        })
        .catch(err => console.error('Error searching symbols:', err))
        .finally(() => setIsLoading(false));
    }, 300);
  }
  
  // Handle selection
  function handleSelect(selectedValue) {
    preventSearchRef.current = true;
    const selectedResult = results.find(item => item.value === selectedValue);
    setSelectedResult(selectedResult);
    onSelect(selectedValue);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }
  
  // Handle clear button
  function handleClear() {
    setResults([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }
  
  // Handle input blur
  function handleBlur() {
    preventSearchRef.current = true;
    setResults([]);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  // Handle input focus
  function handleFocus() {
    preventSearchRef.current = false;
  }
  
  // Handle image error
  function handleImageError(symbol) {
    setFailedImages(prev => ({
      ...prev,
      [symbol]: true
    }));
  }
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <InputSuggestionList
      isLoading={isLoading}
      className={className}
      disabled={disabled}
      error={error}
      placeholder={placeholder}
      suggestionList={results}
      value={value}
      onClear={handleClear}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onChange={handleChange}
      onSelect={handleSelect}
      customInputValueRenderer={(selectedValue) => {
        return selectedResult
          ? `${selectedResult.value} (${selectedResult.label})`
          : selectedValue;
      }}
      customSuggestionItemRenderer={(suggestion) => (
        <div className="w-full flex items-center gap-2 p-2 text-left">
          <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
            <Image 
              src={failedImages[suggestion.value] ? FALLBACK_IMAGE : suggestion.image} 
              alt={suggestion.value} 
              className="w-6 h-6 object-contain flex-shrink-0"
              onError={() => handleImageError(suggestion.value)}
              loading="lazy"
              width={24}
              height={24}
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium flex items-center">
              {suggestion.value}
              <span className="badge badge-sm badge-ghost ml-1">{suggestion.currency?.toUpperCase()}</span>
            </span>
            <span className="text-xs opacity-70 truncate w-full">{suggestion.label || suggestion.description || ''}</span>
          </div>
        </div>
      )}
    />
  );

} 