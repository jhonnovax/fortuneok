/**
 * Symbol Service
 * Handles API calls related to investment symbols
 */

// Debounce function to limit API calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Search for investment symbols
 * @param {string} query - The search query
 * @param {string} type - The type of symbol to search for (stocks, bonds, cryptocurrencies, etfs, funds, options, futures, or all)
 * @param {function} callback - Callback function to handle results
 * @returns {Promise<Array>} - Array of matching symbols
 */
export const searchSymbols = async (query, type = 'all') => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Try the main endpoint first (with Redis caching)
    try {
      const response = await fetch(
        `/api/symbols/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
      
      // If the main endpoint fails, try the fallback endpoint
      console.warn('Main symbol search endpoint failed, trying fallback...');
    } catch (error) {
      console.error('Error with main symbol search endpoint:', error);
    }
    
    // Fallback to direct endpoint (without Redis)
    const fallbackResponse = await fetch(
      `/api/symbols/search/direct?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!fallbackResponse.ok) {
      const error = await fallbackResponse.json();
      throw new Error(error.error || 'Failed to search symbols');
    }

    return await fallbackResponse.json();
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
};

/**
 * Debounced version of searchSymbols to limit API calls
 * @param {string} query - The search query
 * @param {string} type - The type of symbol to search for
 * @param {function} callback - Callback function to handle results
 */
export const debouncedSearchSymbols = (query, type, callback) => {
  const debouncedSearch = debounce(async () => {
    const results = await searchSymbols(query, type);
    callback(results);
  }, 300);

  debouncedSearch();
}; 