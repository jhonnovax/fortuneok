import { create } from 'zustand';
import { parseDataFromAPI } from '@/services/assetService';
import { sortAssetList } from '@/services/assetService';
import { useCurrencyRatesStore } from './currencyRatesStore';

export const useAssetStore = create((set, get) => ({
  assets: [],
  selectedAssetIds: [],
  sortBy: { field: 'total', type: 'desc' },

  getFilteredAndSortedAssets: () => {
    const { assets, selectedAssetIds, sortBy } = get();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const currencyRates = useCurrencyRatesStore(state => state.currencyRates);
    let filteredAndSortedAssets = assets.map((asset) => parseDataFromAPI(asset, selectedAssetIds, currencyRates));

    filteredAndSortedAssets = sortAssetList(filteredAndSortedAssets, sortBy);

    return filteredAndSortedAssets;
  },

  getAssets: async () => {
    const response = await fetch(`/api/asset`);
    const assets = await response.json();
    const selectedAssetIds = assets.map((asset) => asset.id);

    set({ assets, selectedAssetIds });
  },

  addAsset: async (asset) => {
    const response = await fetch(`/api/asset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    const insertedAsset = await response.json();
    const selectedAssetIds = [...get().selectedAssetIds, insertedAsset.id];

    set({
      assets: [...get().assets, insertedAsset],
      selectedAssetIds
    });
  },

  updateAsset: async (assetId, asset) => {
    const response = await fetch(`/api/asset/${assetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    const updatedAsset = await response.json();
    const updatedAssets = get().assets.map((i) => i.id === updatedAsset.id ? updatedAsset : i);

    set({
      assets: updatedAssets
    });
  },

  deleteAsset: async (assetId) => {
    const response = await fetch(`/api/asset/${assetId}`, {
      method: 'DELETE'
    });
    const deletedAsset = await response.json();
    const updatedAssets = get().assets.filter((i) => i.id !== deletedAsset.id);

    set({
      assets: updatedAssets,
      selectedAssetIds: updatedAssets.map((i) => i.id)
    });
  },

  toggleAsset: (selectedAssetIds) => set(() => ({
    selectedAssetIds: selectedAssetIds
  })),

  sortAssets: (sortBy) => {
    set({
      sortBy
    });
  }

}));