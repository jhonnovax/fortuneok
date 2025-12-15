'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ASSET_CATEGORIES } from '@/services/assetService';

export default function CategorySelect({ 
  value, 
  onChange, 
  disabled, 
  error,
  placeholder = "Select category"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [dropdownCoords, setDropdownCoords] = useState({});
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const groupRefs = useRef({});

  // Helper to extract text from label (remove emoji)
  const extractLabelText = (label) => {
    // Remove emoji and leading/trailing spaces
    return label.replace(/^[\p{Emoji}\s]+/u, '').trim() || label;
  };

  // Group categories by group property
  const groupedCategories = useMemo(() => {
    return ASSET_CATEGORIES.reduce((groups, category) => {
      const groupKey = category.group;
      if (!groups[groupKey]) {
        // Find the group header category (where value === group) or use first item
        const groupHeader = ASSET_CATEGORIES.find(cat => cat.group === groupKey && cat.value === groupKey) || category;
        const labelText = extractLabelText(groupHeader.label);
        groups[groupKey] = {
          groupKey,
          groupLabel: labelText,
          icon: groupHeader.icon,
          items: []
        };
      }
      groups[groupKey].items.push(category);
      return groups;
    }, {});
  }, []);

  // Flatten groups into a selectable list for keyboard navigation
  // Only includes children if their parent group is expanded
  const flatList = useMemo(() => {
    return Object.values(groupedCategories).flatMap(group => {
      const list = [];
      const isGroupExpanded = expandedGroups.has(group.groupKey);
      // Check if group header itself is selectable (exists as a category)
      const groupCategory = group.items.find(item => item.value === group.groupKey);
      if (groupCategory) {
        list.push({ ...groupCategory, isGroupHeader: true, groupKey: group.groupKey });
      }
      // Add children only if the group is expanded (excluding the group header if it was added)
      if (isGroupExpanded) {
        group.items.forEach(item => {
          if (item.value !== group.groupKey) {
            list.push({ ...item, isGroupHeader: false, groupKey: group.groupKey });
          }
        });
      }
      return list;
    });
  }, [groupedCategories, expandedGroups]);

  const selectedCategory = ASSET_CATEGORIES.find(cat => cat.value === value);

  // Initialize expanded groups - expand groups that have the selected value
  useEffect(() => {
    if (value) {
      const selectedGroup = Object.values(groupedCategories).find(group => 
        group.items.some(item => item.value === value)
      );
      if (selectedGroup) {
        setExpandedGroups(new Set([selectedGroup.groupKey]));
      }
    }
  }, [value, groupedCategories]);

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const margin = 8; // Margin from viewport edges
      const maxDropdownHeight = 384; // max-h-96 = 384px
      
      // Position below by default, but above if not enough space below
      const shouldPositionAbove = spaceBelow < maxDropdownHeight && spaceAbove > spaceBelow;
      
      // Calculate available height based on position
      const availableHeight = shouldPositionAbove 
        ? spaceAbove - margin 
        : spaceBelow - margin;
      
      // Use the smaller of maxDropdownHeight or available height, with a minimum height
      const minHeight = 100; // Minimum height to ensure usability
      const calculatedMaxHeight = Math.max(minHeight, Math.min(maxDropdownHeight, availableHeight));
      
      // Calculate left position, ensuring dropdown doesn't go off-screen
      let left = rect.left;
      const dropdownWidth = rect.width;
      if (left + dropdownWidth > viewportWidth - margin) {
        left = viewportWidth - dropdownWidth - margin;
      }
      if (left < margin) {
        left = margin;
      }
      
      setDropdownCoords({
        top: shouldPositionAbove 
          ? `${rect.top - calculatedMaxHeight}px` 
          : `${rect.bottom}px`,
        left: `${left}px`,
        width: `${Math.min(dropdownWidth, viewportWidth - margin * 2)}px`, // Ensure it fits in viewport
        minWidth: '200px',
        maxHeight: `${calculatedMaxHeight}px`
      });
    }
  }, []);

  // Handle opening dropdown
  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    updateDropdownPosition();
    setHighlightedIndex(-1);
  }, [disabled, updateDropdownPosition]);

  // Handle closing dropdown
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Handle selection
  const handleSelect = useCallback((category) => {
    onChange(category.value);
    handleClose();
    // Return focus to button
    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
  }, [onChange, handleClose]);

  // Toggle group expansion
  const toggleGroup = useCallback((groupKey, e) => {
    e.stopPropagation();
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      const wasExpanded = newSet.has(groupKey);
      if (wasExpanded) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (isOpen && highlightedIndex >= 0) {
          e.preventDefault();
          e.stopPropagation(); // Stop event from reaching modal
          handleSelect(flatList[highlightedIndex]);
        } else if (!isOpen) {
          e.preventDefault();
          e.stopPropagation(); // Stop event from reaching modal
          handleOpen();
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation(); // Prevent modal from handling the event
        if (!isOpen) {
          handleOpen();
        } else {
          setHighlightedIndex(prev => {
            // Only navigate through visible items (children only if parent is expanded)
            const nextIndex = prev < flatList.length - 1 ? prev + 1 : 0;
            return nextIndex;
          });
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation(); // Prevent modal from handling the event
        if (isOpen) {
          setHighlightedIndex(prev => {
            // Only navigate through visible items (children only if parent is expanded)
            const prevIndex = prev > 0 ? prev - 1 : flatList.length - 1;
            return prevIndex;
          });
        }
        break;
      
      case 'ArrowRight':
        if (isOpen && highlightedIndex >= 0) {
          e.preventDefault();
          e.stopPropagation(); // Stop event from reaching modal
          const highlightedItem = flatList[highlightedIndex];
          if (highlightedItem?.isGroupHeader && highlightedItem.groupKey) {
            setExpandedGroups(prev => new Set([...prev, highlightedItem.groupKey]));
          }
        }
        break;
      
      case 'ArrowLeft':
        if (isOpen && highlightedIndex >= 0) {
          e.preventDefault();
          e.stopPropagation(); // Stop event from reaching modal
          const highlightedItem = flatList[highlightedIndex];
          if (highlightedItem?.isGroupHeader && highlightedItem.groupKey) {
            setExpandedGroups(prev => {
              const newSet = new Set(prev);
              newSet.delete(highlightedItem.groupKey);
              return newSet;
            });
            // The useEffect will handle index validation when flatList updates
          }
        }
        break;
      
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation(); // Stop event from reaching modal
          handleClose();
          buttonRef.current?.focus();
        }
        break;
      
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation(); // Stop event from reaching modal
          setHighlightedIndex(0);
        }
        break;
      
      case 'End':
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation(); // Stop event from reaching modal
          setHighlightedIndex(flatList.length - 1);
        }
        break;
    }
  }, [disabled, isOpen, highlightedIndex, flatList, handleOpen, handleClose, handleSelect]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => updateDropdownPosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updateDropdownPosition]);

  // Validate highlighted index when flatList changes (e.g., when groups are expanded/collapsed)
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      if (highlightedIndex >= flatList.length) {
        // Index is out of bounds, reset to last valid index or -1
        setHighlightedIndex(flatList.length > 0 ? flatList.length - 1 : -1);
      }
    }
  }, [isOpen, highlightedIndex, flatList]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedItem = flatList[highlightedIndex];
      if (highlightedItem) {
        // Find the actual DOM element by data attribute within the dropdown
        const element = dropdownRef.current.querySelector(`[data-value="${highlightedItem.value}"]`);
        if (element) {
          // Use requestAnimationFrame to ensure DOM is updated
          requestAnimationFrame(() => {
            element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          });
        }
      }
    }
  }, [isOpen, highlightedIndex, flatList]);

  // Get display text for button
  const getDisplayText = () => {
    if (!selectedCategory) return placeholder;
    const text = extractLabelText(selectedCategory.label);
    return `${selectedCategory.icon} ${text}`;
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={`input input-bordered w-full ${error ? 'select-error' : ''} ${disabled ? 'select-disabled' : ''}`}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
        aria-describedby={error ? 'category-error' : undefined}
      >
        <span className={`block truncate text-left ${!selectedCategory ? 'text-base-content/50' : ''}`}>
          {getDisplayText()}
        </span>
      </button>
      {/* Single caret icon */}
      <svg 
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>

      {isOpen && (
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-base-100 border border-base-content/10 rounded-lg shadow-lg mt-1 overflow-y-auto"
            style={{
              ...dropdownCoords,
              maxHeight: dropdownCoords.maxHeight || '384px'
            }}
            role="listbox"
            aria-label="Category selection"
          >
            <ul ref={listRef} className="py-2">
              {Object.values(groupedCategories).map((group) => {
                const groupCategory = group.items.find(item => item.value === group.groupKey);
                const children = group.items.filter(item => item.value !== group.groupKey);
                const hasSelectableHeader = !!groupCategory;
                const isExpanded = expandedGroups.has(group.groupKey);
                const hasChildren = children.length > 0;
                
                return (
                  <li key={group.groupKey} className="mb-1 last:mb-0">
                    {/* Group Header */}
                    <div className="flex items-center">
                      {hasSelectableHeader ? (
                        <button
                          type="button"
                          data-value={group.groupKey}
                          className={`flex-1 text-left px-3 py-2 text-xs font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2 focus:outline-none ${
                            value === group.groupKey 
                              ? 'bg-primary/40 font-medium cursor-default' 
                              : 'hover:bg-base-200 focus:bg-base-200 cursor-pointer'
                          } ${
                            highlightedIndex >= 0 && flatList[highlightedIndex]?.value === group.groupKey && value !== group.groupKey ? 'bg-base-200' : ''
                          }`}
                          onClick={() => {
                            // Only allow selection if not already selected
                            if (value !== group.groupKey) {
                              handleSelect(groupCategory);
                            }
                          }}
                          onMouseEnter={() => {
                            // Don't highlight if this is the selected item
                            if (value !== group.groupKey) {
                              const index = flatList.findIndex(item => item.value === group.groupKey);
                              setHighlightedIndex(index);
                            }
                          }}
                          role="option"
                          aria-selected={value === group.groupKey}
                        >
                          <span>{group.icon}</span>
                          <span>{group.groupLabel}</span>
                        </button>
                      ) : (
                        <div className="flex-1 px-3 py-2 text-xs font-semibold text-base-content/70 uppercase tracking-wide flex items-center gap-2 cursor-default">
                          <span>{group.icon}</span>
                          <span>{group.groupLabel}</span>
                        </div>
                      )}
                      
                      {/* Expand/Collapse Button */}
                      {hasChildren && (
                        <button
                          type="button"
                          className={`px-2 py-2 hover:bg-base-200 focus:bg-base-200 focus:outline-none transition-transform cursor-pointer ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                          onClick={(e) => toggleGroup(group.groupKey, e)}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `Collapse ${group.groupLabel}` : `Expand ${group.groupLabel}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Group Children - Collapsible */}
                    {hasChildren && (
                      <div
                        ref={(el) => {
                          if (el) groupRefs.current[group.groupKey] = el;
                        }}
                        className="overflow-hidden transition-all duration-200 ease-in-out"
                        style={{
                          maxHeight: isExpanded 
                            ? (groupRefs.current[group.groupKey]?.scrollHeight || 0) + 'px'
                            : '0px',
                          opacity: isExpanded ? 1 : 0
                        }}
                      >
                        <ul className="pl-0 border-l-2 border-base-content/10 ml-4 my-1">
                          {children.map((item) => {
                            const index = flatList.findIndex(flatItem => flatItem.value === item.value);
                            const isHighlighted = index === highlightedIndex;
                            // Extract label text without emoji
                            const labelText = extractLabelText(item.label);
                            
                            const isSelected = value === item.value;
                            
                            return (
                              <li key={item.value}>
                                <button
                                  type="button"
                                  data-value={item.value}
                                  className={`w-full text-left px-3 py-2 focus:outline-none transition-colors ${
                                    isSelected
                                      ? 'bg-primary/40 font-medium cursor-default'
                                      : 'hover:bg-base-200 focus:bg-base-200 cursor-pointer'
                                  } ${
                                    isHighlighted && !isSelected ? 'bg-base-200' : ''
                                  }`}
                                  onClick={() => {
                                    // Only allow selection if not already selected
                                    if (!isSelected) {
                                      handleSelect(item);
                                    }
                                  }}
                                  onMouseEnter={() => {
                                    // Don't highlight if this is the selected item
                                    if (!isSelected) {
                                      setHighlightedIndex(index);
                                    }
                                  }}
                                  role="option"
                                  aria-selected={isSelected}
                                >
                                  <span className="flex items-center gap-2">
                                    <span>{labelText}</span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )
      )}
    </div>
  );
}