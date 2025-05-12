import { create } from 'zustand';
import { parseDataFromAPI } from '@/services/investmentService';
import { filterInvestments, sortInvestmentList } from '@/services/investmentService';
import { useCurrencyRatesStore } from './currencyRatesStore';

export const useInvestmentStore = create((set, get) => ({
  investments: [],
  selectedInvestmentIds: [],
  filters: { cutoffTimeFrame: 'all' },
  sortBy: { field: 'total', type: 'desc' },

  getFilteredAndSortedInvestments: () => {
    const { investments, selectedInvestmentIds, filters, sortBy } = get();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const currencyRates = useCurrencyRatesStore(state => state.currencyRates);
    let filteredAndSortedInvestments = investments.map((investment) => parseDataFromAPI(investment, selectedInvestmentIds, currencyRates));

    filteredAndSortedInvestments = filterInvestments(filteredAndSortedInvestments, filters);
    filteredAndSortedInvestments = sortInvestmentList(filteredAndSortedInvestments, sortBy);

    return filteredAndSortedInvestments;
  },

  getInvestments: async () => {
    const response = await fetch(`/api/investment`);
    const investments = await response.json();
    const selectedInvestmentIds = investments.map((investment) => investment.id);

    set({ investments, selectedInvestmentIds });
  },

  addInvestment: async (investment) => {
    const response = await fetch(`/api/investment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment),
    });
    const insertedInvestment = await response.json();
    const selectedInvestmentIds = [...get().selectedInvestmentIds, insertedInvestment.id];

    set({
      investments: [...get().investments, insertedInvestment],
      selectedInvestmentIds
    });
  },

  updateInvestment: async (investmentId, investment) => {
    const response = await fetch(`/api/investment/${investmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment),
    });
    const updatedInvestment = await response.json();
    const updatedInvestments = get().investments.map((i) => i.id === updatedInvestment.id ? updatedInvestment : i);

    set({
      investments: updatedInvestments
    });
  },

  deleteInvestment: async (investmentId) => {
    const response = await fetch(`/api/investment/${investmentId}`, {
      method: 'DELETE'
    });
    const deletedInvestment = await response.json();
    const updatedInvestments = get().investments.filter((i) => i.id !== deletedInvestment.id);

    set({
      investments: updatedInvestments,
      selectedInvestmentIds: updatedInvestments.map((i) => i.id)
    });
  },

  toggleInvestment: (selectedInvestmentIds) => set(() => ({
    selectedInvestmentIds: selectedInvestmentIds
  })),

  filterByTimeFrame: (cutoffTimeFrame) => {
    set({
      filters: {
        ...get().filters,
        cutoffTimeFrame
      },
    });
  },

  sortInvestments: (sortBy) => {
    set({
      sortBy
    });
  }

}));