import { getCache, setCache } from '@/libs/redis';
import yahooFinance from 'yahoo-finance2';

// Cache duration in seconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60;

const fetchSymbolDataFromAPI = async (symbols) => {
  const stockPromises = symbols.map((symbol) => yahooFinance.quote(symbol));
	const apiResponses = await Promise.all(stockPromises);
	let symbolDetails = {};

	for (const quote of apiResponses) {		
		if (quote) {
			symbolDetails[quote.symbol] = {
        currency: quote.currency || 'USD',
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
				await setCache(`symbol_data:${symbol}`, newData[symbol], CACHE_DURATION);
				result[symbol] = newData[symbol]; // Merge the new data
			}
		}
	}

	return result;
}