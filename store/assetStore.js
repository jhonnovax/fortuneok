import { create } from 'zustand';
import { parseDataFromAPI } from '@/services/assetService';
import { sortAssetList } from '@/services/assetService';
import { logError } from '@/libs/errorLogger';

export const useAssetStore = create((set, get) => ({
  assets: [],
  selectedAssetIds: [],
  sortBy: { field: 'total', type: 'desc' },

  getFilteredAndSortedAssets: (currencyRates = {}) => {
    const { assets, selectedAssetIds, sortBy } = get();
    let filteredAndSortedAssets = assets.map((asset) => parseDataFromAPI(asset, selectedAssetIds, currencyRates));

    filteredAndSortedAssets = sortAssetList(filteredAndSortedAssets, sortBy);

    return filteredAndSortedAssets;
  },

  getAssets: async () => {
    try {
      const response = await fetch(`/api/asset`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Failed to fetch assets: ${response.statusText}`);
        error.statusCode = response.status;
        error.responseData = errorData;
        
        await logError({
          action: 'fetch',
          errorType: 'error',
          errorMessage: error.message,
          errorStack: error.stack,
          statusCode: response.status,
          requestUrl: '/api/asset',
          requestMethod: 'GET',
          responseData: errorData,
        });
        
        throw error;
      }
      
      const assets = await response.json();
      const selectedAssetIds = assets.map((asset) => asset.id);

      set({ assets, selectedAssetIds });
    } catch (error) {
      // If error wasn't already logged (network errors, etc.)
      if (!error.statusCode) {
        await logError({
          action: 'fetch',
          errorType: 'error',
          errorMessage: error.message || 'Failed to fetch assets',
          errorStack: error.stack,
          requestUrl: '/api/asset',
          requestMethod: 'GET',
          additionalData: { error: error.toString() },
        });
      }
      throw error;
    }
  },

  addAsset: async (asset) => {
    try {
      const response = await fetch(`/api/asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Failed to add asset: ${response.statusText}`);
        error.statusCode = response.status;
        error.responseData = errorData;
        
        await logError({
          action: 'add',
          errorType: 'error',
          errorMessage: error.message,
          errorStack: error.stack,
          statusCode: response.status,
          requestUrl: '/api/asset',
          requestMethod: 'POST',
          requestBody: asset,
          responseData: errorData,
        });
        
        throw error;
      }
      
      const insertedAsset = await response.json();
      const selectedAssetIds = [...get().selectedAssetIds, insertedAsset.id];

      set({
        assets: [...get().assets, insertedAsset],
        selectedAssetIds
      });
    } catch (error) {
      // If error wasn't already logged (network errors, etc.)
      if (!error.statusCode) {
        await logError({
          action: 'add',
          errorType: 'error',
          errorMessage: error.message || 'Failed to add asset',
          errorStack: error.stack,
          requestUrl: '/api/asset',
          requestMethod: 'POST',
          requestBody: asset,
          additionalData: { error: error.toString() },
        });
      }
      throw error;
    }
  },

  updateAsset: async (assetId, asset) => {
    try {
      const response = await fetch(`/api/asset/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Failed to update asset: ${response.statusText}`);
        error.statusCode = response.status;
        error.responseData = errorData;
        
        await logError({
          action: 'update',
          errorType: 'error',
          errorMessage: error.message,
          errorStack: error.stack,
          statusCode: response.status,
          requestUrl: `/api/asset/${assetId}`,
          requestMethod: 'PATCH',
          requestBody: asset,
          responseData: errorData,
          additionalData: { assetId },
        });
        
        throw error;
      }
      
      const updatedAsset = await response.json();
      const updatedAssets = get().assets.map((i) => i.id === updatedAsset.id ? updatedAsset : i);

      set({
        assets: updatedAssets
      });
    } catch (error) {
      // If error wasn't already logged (network errors, etc.)
      if (!error.statusCode) {
        await logError({
          action: 'update',
          errorType: 'error',
          errorMessage: error.message || 'Failed to update asset',
          errorStack: error.stack,
          requestUrl: `/api/asset/${assetId}`,
          requestMethod: 'PATCH',
          requestBody: asset,
          additionalData: { assetId, error: error.toString() },
        });
      }
      throw error;
    }
  },

  deleteAsset: async (assetId) => {
    try {
      const response = await fetch(`/api/asset/${assetId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Failed to delete asset: ${response.statusText}`);
        error.statusCode = response.status;
        error.responseData = errorData;
        
        await logError({
          action: 'delete',
          errorType: 'error',
          errorMessage: error.message,
          errorStack: error.stack,
          statusCode: response.status,
          requestUrl: `/api/asset/${assetId}`,
          requestMethod: 'DELETE',
          responseData: errorData,
          additionalData: { assetId },
        });
        
        throw error;
      }
      
      const deletedAsset = await response.json();
      const updatedAssets = get().assets.filter((i) => i.id !== deletedAsset.id);

      set({
        assets: updatedAssets,
        selectedAssetIds: updatedAssets.map((i) => i.id)
      });
    } catch (error) {
      // If error wasn't already logged (network errors, etc.)
      if (!error.statusCode) {
        await logError({
          action: 'delete',
          errorType: 'error',
          errorMessage: error.message || 'Failed to delete asset',
          errorStack: error.stack,
          requestUrl: `/api/asset/${assetId}`,
          requestMethod: 'DELETE',
          additionalData: { assetId, error: error.toString() },
        });
      }
      throw error;
    }
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