import { getCache, setCache } from '@/libs/redis';

// Cache duration in seconds (1 hour)
const CACHE_CURRENCY_RATES_DURATION = 1 * 60 * 60;

async function fetchCurrencyRates(baseCurrency) {
  const baseCurrencyFormatted = baseCurrency.toLowerCase();
  const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrencyFormatted}.json`);
  const data = await response.json();

  if (response.ok) {
    return data[baseCurrencyFormatted];
  }

  return null;
}

export async function getConversionRates(baseCurrency = 'USD') {

  // Check if data is cached in Redis
  const cachedData = await getCache(`currencyRates:${baseCurrency}`);

  if (cachedData) {
    // If cached data is found, return it
    return cachedData;
  }

  // Fetch fresh data from the external API if no cached data is available
  const currencyRates = await fetchCurrencyRates(baseCurrency);

  // Cache the fetched data in Redis
  if (currencyRates) {
    await setCache(`currencyRates:${baseCurrency}`, currencyRates, CACHE_CURRENCY_RATES_DURATION);
  }

  return currencyRates;
}