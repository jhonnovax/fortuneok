'use client';

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function InputSuggestionList({ 
  autoFocus,
  className,
  customInputValueRenderer,
  customSuggestionItemRenderer,
  disabled,
  error,
  placeholder,
  suggestionList,
  value,
  onFocus,
  onBlur,
  onChange
}) {

  const inputRef = useRef(null);
  const suggestionListRef = useRef(null);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState({});
  
  // Filter suggestions based on input text
  function filterSuggestions(searchTerm) {
    if (!searchTerm.trim()) {
      return suggestionList;
    }
    
    const lowercaseQuery = searchTerm.toLowerCase();
    return suggestionList.filter(suggestion => 
      suggestion.value.toLowerCase().includes(lowercaseQuery) || 
      suggestion.label.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  // Handle input change
  function handleInputChange(e) {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    onChange('');
    
    const filteredSuggestions = filterSuggestions(searchTerm);
    setFilteredSuggestions(filteredSuggestions);
    setShowDropdown(true);
  }

  // Handle clear button
  function handleClear() {
    setSearchTerm('');
    onChange('');

    const filteredSuggestions = filterSuggestions('');
    setFilteredSuggestions(filteredSuggestions);

    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }
  
  // Handle currency selection
  const handleSelect = useCallback((suggestion) => {
    setSearchTerm(''); // Clear search term after selection
    onChange(suggestion.value);
    setShowDropdown(false);
  }, [onChange]);
  
  // Handle input focus
  function handleFocus(event) {
    const filteredSuggestions = value
      ? filterSuggestions('') // If value is set, return all the suggestions list
      : filterSuggestions(searchTerm); // If value is not set, return the suggestions list filtered by the search term
    setFilteredSuggestions(filteredSuggestions);
    setShowDropdown(true);
    onFocus?.(event);
  }

  // Handle input blur
  function handleBlur(event) {
    const selectedSuggestion = suggestionList.find(item => item.value === searchTerm);
    if (!selectedSuggestion) setSearchTerm('');
    setShowDropdown(false);
    onBlur?.(event);
  }

  // Close dropdown
  function closeDropdown() {
    setShowDropdown(false);
    inputRef.current?.blur();
  }

  // Update dropdown coords
  function updateDropdownCoords() {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate space below and above the input
    const spaceBelow = viewportHeight - rect.bottom;

    // Choose where to open dropdown (below or above)
    const maxHeight = spaceBelow - 10; // small padding

    setDropdownCoords({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      maxHeight: maxHeight > 210 ? 210 : maxHeight,
      zIndex: 9999
    });
  }

  // Update dropdown coords on show dropdown
  useLayoutEffect(() => {
    if (!showDropdown) return;
    // Wait for viewport to stabilize (keyboard fully open in mobile ios/android)
    let timeout;
    clearTimeout(timeout);
    timeout = setTimeout(updateDropdownCoords, 250);
  }, [showDropdown]);

  // Close dropdown on resize or scroll
  useEffect(() => {
    function handleScroll(event) {
      if (!showDropdown) return;
      const isScrollingSuggestions = event.target.classList.contains('popover-suggestions');
      if (isScrollingSuggestions) return;
      closeDropdown();
    }

    function handleResize() {
      if (!showDropdown) return;
      closeDropdown();
    }
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showDropdown]);

  // Handle key down events
  useEffect(() => {
    function handleKeyDown(event) {
      if (!showDropdown) return;
  
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeDropdown();
        return;
      }
  
      if (filteredSuggestions.length === 0) return;

      function scrollToItem(index) {
        const container = suggestionListRef.current;
        if (!container) return;
        const item = container.querySelectorAll('li')[index];
        if (item) item.scrollIntoView({ block: 'nearest' });
      }
  
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedSuggestionIndex(prev => {
          const nextIndex = prev < filteredSuggestions.length - 1 ? prev + 1 : 0;
          scrollToItem(nextIndex);
          return nextIndex;
        });
      }
  
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedSuggestionIndex(prev => {
          const nextIndex = prev > 0 ? prev - 1 : filteredSuggestions.length - 1;
          scrollToItem(nextIndex);
          return nextIndex;
        });
      }
  
      if (event.key === 'Enter') {
        event.preventDefault();
        if (highlightedSuggestionIndex >= 0 && highlightedSuggestionIndex < filteredSuggestions.length) {
          handleSelect(filteredSuggestions[highlightedSuggestionIndex]);
        }
      }
    }
  
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, filteredSuggestions, highlightedSuggestionIndex, handleSelect]);

  // Reset highlighted suggestion if suggestions list changes
  useEffect(() => {
    if (!showDropdown) setHighlightedSuggestionIndex(-1);
  }, [showDropdown, filteredSuggestions]);

  // Render the component
  return (
    <div className={`w-full relative ${className || ''}`}>

      <div className="w-full">
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          autoComplete="off"
          type="text"
          className={`input input-bordered w-full pr-8 ${error ? 'input-error' : ''}`}
          disabled={disabled}
          placeholder={placeholder}
          value={customInputValueRenderer && value ? customInputValueRenderer(value) : searchTerm}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
        {/* Clear button */}
        {!disabled && (value || searchTerm) && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 top-0 flex items-center px-2"
            onClick={handleClear}
            title="Clear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Dropdown */}
      {showDropdown && (
        createPortal(
          <div className="popover-suggestions bg-base-100 border rounded-md border-base-content/10 shadow absolute mt-1 overflow-y-auto" style={dropdownCoords}>
            <ul ref={suggestionListRef} className="overflow-x-hidden">
              {/* No results message */}
              {!filteredSuggestions.length && (
                <li>
                  <p className="flex items-center gap-2 p-3 text-base-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                      <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    No results found
                  </p>
                </li>
              )}
              {/* Suggestions */}
              {filteredSuggestions.map((suggestion, suggestionIndex) => (
                <li key={suggestion.value} className="border-b border-base-content/10 last:border-b-0">
                  <button 
                    type="button" 
                    className={`w-full hover:bg-base-200 hover:cursor-pointer ${suggestionIndex === highlightedSuggestionIndex ? 'bg-base-200' : ''}`} 
                    onMouseDown={() => handleSelect(suggestion)}
                  >
                    {customSuggestionItemRenderer ? customSuggestionItemRenderer(suggestion) : suggestion.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        , document.body)
      )}
      
    </div>
  );
} 