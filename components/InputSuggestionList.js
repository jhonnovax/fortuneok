'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export default function InputSuggestionList({ 
  autoFocus,
  className,
  disabled,
  error,
  suggestionList,
  customInputValueRenderer,
  customSuggestionItemRenderer,
  value,
  onChange
}) {

  const inputRef = useRef(null);
  const comboboxRef = useRef(null);
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
  
  // Handle currency selection
  function handleSelect(suggestion) {
    setSearchTerm(suggestion.value);
    onChange(suggestion.value);
    setShowDropdown(false);
  }
  
  // Handle input focus
  function handleFocus() {
    if (!value) {
      const filteredSuggestions = filterSuggestions(searchTerm);
      setFilteredSuggestions(filteredSuggestions);
    }
    setShowDropdown(true);
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
  
  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && comboboxRef.current.contains(event.target)) return;
      const selectedSuggestion = suggestionList.find(item => item.value === searchTerm);
      if (!selectedSuggestion) setSearchTerm('');
      closeDropdown();
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchTerm, suggestionList]);

  // Close dropdown on press esc key
  useEffect(() => {
    function handleKeyDown(event) {
      if (showDropdown && event.key === 'Escape') {
        event.stopPropagation();
        closeDropdown();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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

  // Render the component
  return (
    <div ref={comboboxRef} className={`w-full relative ${className || ''}`}>
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        autoComplete="off"
        type="search"
        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
        disabled={disabled}
        placeholder="Select currency"
        value={customInputValueRenderer && value ? customInputValueRenderer(value) : searchTerm}
        onFocus={handleFocus}
        onChange={handleInputChange}
      />
      
      {/* Dropdown */}
      {showDropdown && (
        createPortal(
          <div className="popover-suggestions bg-base-100 border rounded-md border-base-content/10 shadow absolute mt-1 overflow-y-auto" style={dropdownCoords}>
            <ul className="overflow-x-hidden">
              {(filteredSuggestions.length > 0 ? filteredSuggestions : suggestionList).map((suggestion) => (
                <li key={suggestion.value} className="border-b border-base-content/10 last:border-b-0">
                  <button className="w-full hover:bg-base-200 hover:cursor-pointer" type="button" onMouseDown={() => handleSelect(suggestion)}>
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