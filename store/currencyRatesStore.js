import { create } from 'zustand';

export const useCurrencyRatesStore = create((set) => ({
  currencyRates: {},

  getCurrencyRates: async (baseCurrency) => {
    const response = await fetch(`/api/currency-rates?baseCurrency=${baseCurrency}`);
    const currencyRates = await response.json();

    set({ currencyRates });
  }

}));