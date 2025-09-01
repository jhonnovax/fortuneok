import { getCache, setCache } from '@/libs/redis';
import yahooFinance from 'yahoo-finance2';

// Cache symbol details duration (1 hour)
const CACHE_SYMBOL_DETAILS_DURATION = 1 * 60 * 60;

// Known cryptocurrencies list
const knownCryptos = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX',
  'DOT', 'LINK', 'LTC', 'MATIC', 'XLM', 'UNI', 'SHIB',
  'TRX', 'XMR', 'AAVE', 'ICP', 'ATOM'
];

// Function to normalize symbols (add the -USD suffix)
function normalizeCryptoSymbol(symbol) {
  const symbolNormalized = symbol.toUpperCase();

  if (knownCryptos.includes(symbolNormalized)) {
    return `${symbolNormalized}-USD`;
  }

  return symbol;
}

// Function to denormalize symbols (remove the -USD suffix)
function denormalizeCryptoSymbol(symbol) {
  const symbolNormalized = symbol.toUpperCase().replace('-USD', '');

  if (knownCryptos.includes(symbolNormalized)) {
    return symbolNormalized;
  }

  return symbol;
}

const fetchSymbolDataFromAPI = async (symbols) => {
  const normalizedSymbols = symbols.map(normalizeCryptoSymbol);
  const stockPromises = normalizedSymbols.map((symbol) => yahooFinance.quote(symbol));
	const apiResponses = await Promise.all(stockPromises);
	let symbolDetails = {};
  let denormalizedSymbol = '';

	for (const quote of apiResponses) {

		if (quote) {
      denormalizedSymbol = denormalizeCryptoSymbol(quote.symbol);
      symbolDetails[denormalizedSymbol] = {
        description: quote.longName || quote.shortName || '',
        currency: quote.currency || 'USD', // Fallback to USD if currency is not available
        price: quote.regularMarketPrice,
        timestamp: new Date().toISOString()
      };
    }
    
	}

	return symbolDetails;
};

export async function getStockPrices(symbols) {  
	if (!symbols.length) {
		return {};
	}
  
	// Create a result object to hold data for each symbol
	let result = {};
	const symbolsToFetch = [];
  
	// Check Redis cache for each symbol and store cached data in result
	for (const symbol of symbols) {
		const cachedData = await getCache(`symbol_data:${symbol}`);
		if (cachedData) {
			result[symbol] = cachedData; // Use cached data
		} else {
			symbolsToFetch.push(symbol); // If not cached, mark for fetch
		}
	}
  
	// If there are symbols to fetch, get their data and cache them
	if (symbolsToFetch.length > 0) {
		// Fetch missing data in parallel for efficiency
		const newData = await fetchSymbolDataFromAPI(symbolsToFetch);
	
		// Cache the new data and update the result
		for (const symbol of symbolsToFetch) {
			if (newData[symbol]) {
				await setCache(`symbol_data:${symbol}`, newData[symbol], CACHE_SYMBOL_DETAILS_DURATION);
				result[symbol] = newData[symbol]; // Merge the new data
			}
		}
	}

	return result;
}

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
 * Search for asset symbols
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