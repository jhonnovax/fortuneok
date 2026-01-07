import { getCache, setCache } from '@/libs/redis';

// Cache symbol details duration (4 hours)
const CACHE_SYMBOL_DETAILS_DURATION = 4 * 60 * 60;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 500; // 500ms delay between batch requests
const BATCH_SIZE = 10; // Process 10 symbols at a time

// Known cryptocurrencies list
const knownCryptos = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX',
  'DOT', 'LINK', 'LTC', 'MATIC', 'XLM', 'UNI', 'SHIB',
  'TRX', 'XMR', 'AAVE', 'ICP', 'ATOM'
];

// Function to normalize symbols (add USD suffix for crypto)
function normalizeCryptoSymbol(symbol) {
  const symbolNormalized = symbol.toUpperCase();

  if (knownCryptos.includes(symbolNormalized)) {
    return `${symbolNormalized}USD`;
  }

  return symbol;
}

// Function to denormalize symbols
function denormalizeCryptoSymbol(symbol) {
  const symbolNormalized = symbol.toUpperCase();

  for (const crypto of knownCryptos) {
    if (symbolNormalized === `${crypto}USD`) {
      return crypto;
    }
  }

  return symbol;
}

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to chunk array into smaller batches
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Fetch symbol data from Financial Modeling Prep API
 * Note: Free tier has NO working price endpoints - will always fallback to price = 1
 */
const fetchSymbolDataFromAPI = async (symbols) => {
  const normalizedSymbols = symbols.map(normalizeCryptoSymbol);
  let symbolDetails = {};

  // Process symbols in batches
  const batches = chunkArray(normalizedSymbols, BATCH_SIZE);

  for (const batch of batches) {
    try {
      // Try multiple FMP endpoints (all will likely fail on free tier)
      const symbolList = batch.join(',');

      // Try stable API first
      let url = `https://financialmodelingprep.com/stable/quote/${symbolList}?apikey=${process.env.FMP_API_KEY}`;
      let response = await fetch(url);
      let quotes = await response.json();

      // If stable API doesn't work, try v3 (will return legacy error)
      if (!Array.isArray(quotes) || quotes.length === 0 || quotes.error) {
        url = `https://financialmodelingprep.com/api/v3/quote/${symbolList}?apikey=${process.env.FMP_API_KEY}`;
        response = await fetch(url);
        quotes = await response.json();
      }

      // Process quotes if we get valid data (unlikely on free tier)
      if (Array.isArray(quotes) && quotes.length > 0 && !quotes[0]?.['Error Message']) {
        for (const quote of quotes) {
          if (quote && quote.symbol && quote.price) {
            const originalSymbol = symbols.find(
              s => normalizeCryptoSymbol(s) === quote.symbol
            ) || denormalizeCryptoSymbol(quote.symbol);

            symbolDetails[originalSymbol] = {
              description: quote.name || originalSymbol,
              currency: 'USD',
              price: parseFloat(quote.price) || 1,
              timestamp: new Date().toISOString()
            };
          }
        }
      }

      // Add delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await delay(RATE_LIMIT_DELAY);
      }
    } catch (error) {
      console.error('Error fetching batch from FMP:', error);
      // Continue with next batch even if this one fails
    }
  }

  return symbolDetails;
};

/**
 * Get stock prices for multiple symbols with Redis caching
 * Falls back to price = 1 when FMP API doesn't return data (which is always on free tier)
 * @param {Array<string>} symbols - Array of stock symbols
 * @returns {Promise<Object>} Object with symbol data keyed by symbol
 */
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
    const newData = await fetchSymbolDataFromAPI(symbolsToFetch);

    // Cache the new data and update the result
    for (const symbol of symbolsToFetch) {
      if (newData[symbol]) {
        // API returned data for this symbol (unlikely on free tier)
        await setCache(`symbol_data:${symbol}`, newData[symbol], CACHE_SYMBOL_DETAILS_DURATION);
        result[symbol] = newData[symbol];
      } else {
        // API didn't return data - use fallback price of 1
        // This is the expected behavior for FMP free tier
        const fallbackData = {
          description: symbol,
          currency: 'USD',
          price: 1,
          timestamp: new Date().toISOString()
        };
        await setCache(`symbol_data:${symbol}`, fallbackData, CACHE_SYMBOL_DETAILS_DURATION);
        result[symbol] = fallbackData;
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
 * Search for asset symbols using FMP API
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
