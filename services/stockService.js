import { getCache, setCache } from '@/libs/redis';

// Cache duration in seconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60;

const fetchSymbolDataFromAPI = async (symbols) => {
  const symbolsString = symbols.join(',');
	const apiResponse = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbolsString}?apikey=${process.env.FMP_API_KEY}`);

  if (!apiResponse.ok) {
    return {};
  }

  const symbolData = await apiResponse.json();
  const symbolDetails = {};

	for (const item of symbolData) {
    if (item.symbol) {
      symbolDetails[item.symbol] = {
        currency: 'USD', // API returns stock prices in USD by default
        price: item.price,
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