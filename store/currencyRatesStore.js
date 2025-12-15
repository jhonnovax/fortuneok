import { create } from 'zustand';
import { logError } from '@/libs/errorLogger';

export const useCurrencyRatesStore = create((set) => ({
  currencyRates: {},

  getCurrencyRates: async (baseCurrency) => {
    try {
      const response = await fetch(`/api/currency-rates?baseCurrency=${baseCurrency}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Failed to fetch currency rates: ${response.statusText}`);
        error.statusCode = response.status;
        error.responseData = errorData;
        
        await logError({
          action: 'fetch',
          errorType: 'error',
          errorMessage: error.message,
          errorStack: error.stack,
          statusCode: response.status,
          requestUrl: `/api/currency-rates?baseCurrency=${baseCurrency}`,
          requestMethod: 'GET',
          responseData: errorData,
          additionalData: { baseCurrency },
        });
        
        throw error;
      }
      
      const currencyRates = await response.json();
      set({ currencyRates });
    } catch (error) {
      // If error wasn't already logged (network errors, etc.)
      if (!error.statusCode) {
        await logError({
          action: 'fetch',
          errorType: 'error',
          errorMessage: error.message || 'Failed to fetch currency rates',
          errorStack: error.stack,
          requestUrl: `/api/currency-rates?baseCurrency=${baseCurrency}`,
          requestMethod: 'GET',
          additionalData: { baseCurrency, error: error.toString() },
        });
      }
      throw error;
    }
  }

}));