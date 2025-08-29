'use client';

import { useState, useEffect, useMemo } from 'react';
import TopNavbar from "./TopNavbar";
import RightSidebar from "./RightSidebar";
import AssetList from "./AssetList";
import AllocationChart from "./AllocationChart";
import AssetEditionModal from "./AssetEditionModal";
import SummaryCard from "./SummaryCard";
import { useAssetStore } from '@/store/assetStore';
import { useCurrencyRatesStore } from '@/store/currencyRatesStore';
import config from '@/config';
import Footer from './Footer';
import { usePreferences } from '@/contexts/PreferencesContext';
import { getAssetCategoryDescription, parseAssetCategoryFromAssetList, getAssetCategoryGroup } from '@/services/assetService';

export default function Dashboard() {

  const { appName, appShortDescription, appDescription } = config;

  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [submitAssetError, setSubmitAssetError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { currency: baseCurrency } = usePreferences();

  const getCurrencyRates = useCurrencyRatesStore((state) => state.getCurrencyRates);
  const getAssets = useAssetStore((state) => state.getAssets);
  const getFilteredAndSortedAssets = useAssetStore((state) => state.getFilteredAndSortedAssets);
  const addAsset = useAssetStore((state) => state.addAsset);
  const updateAsset = useAssetStore((state) => state.updateAsset);
  const deleteAsset = useAssetStore((state) => state.deleteAsset);
  const assetData = getFilteredAndSortedAssets();
  
  const filteredAssets = useMemo(() => {
    let assets = assetData.map((asset) => {
      return {
        ...asset,
        currencies: [asset.currentValuation?.currency]
      };
    });

    // If a category is selected, and it's not 'all', filter the assets to only include the assets in that category
    if (selectedCategory && selectedCategory !== 'all') {
      const categoryGroup = getAssetCategoryGroup(selectedCategory);      
      assets = assets.filter((asset) => getAssetCategoryGroup(asset.category) === categoryGroup);
    }
    
    // If no category is selected, parse the asset data to get the categories
    if (!selectedCategory) {
      assets = parseAssetCategoryFromAssetList(assetData);
    }
    
    assets = assets.sort((a, b) => b.valuationInPreferredCurrency - a.valuationInPreferredCurrency);

    return assets;
  }, [assetData, selectedCategory]);

  const showAssetActionsButton = useMemo(() => {
    return selectedCategory;
  }, [selectedCategory]);

  const showAssetViewDetailsButton = useMemo(() => {
    return !selectedCategory;
  }, [selectedCategory]);

  const totalNumberOfAssets = useMemo(() => {
    return filteredAssets.length;
  }, [filteredAssets]);

  const totalAssetsValue = useMemo(() => {
    return filteredAssets.reduce((total, asset) => {
      return total + (asset.valuationInPreferredCurrency || 0);
    }, 0);
  }, [filteredAssets]);

  const assetListTitle = useMemo(() => {
    return `${totalNumberOfAssets} ${selectedCategory ? "Assets" : "Categories"}`;
  }, [totalNumberOfAssets, selectedCategory]);

  async function handleNewAsset() {
    setSelectedAsset(null);
    setIsAddModalOpen(true);
  }

  async function handleEditAsset(asset) {
    setSelectedAsset(asset);
    setIsAddModalOpen(true);
  }

  async function handleSaveAsset(asset) {
    try {
      const { id, ...assetData } = asset;

      setIsSavingAsset(true);
      setSubmitAssetError(null);

      if (id) {
        // Update existing asset
        await updateAsset(id, assetData);
      } else {
        // Create new asset
        await addAsset(assetData);
      }
    } catch (err) {
      console.error('Failed to save asset:', err);
      setSubmitAssetError(err.message);
    } finally {
      setIsSavingAsset(false);
      setIsAddModalOpen(false);
    }
  }

  async function handleDeleteAsset(assetId) {
    try {
      const response = await deleteAsset(assetId);
      console.log('Deleted asset:', response);
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  }

  async function handleViewDetails(asset) {
    setSelectedCategory(asset.category);
  }

  // AssetList component
  const AssetListComponent = () => (
    <>
      {/* Asset List Top Spacing */}
      <div className="mt-2 lg:mt-4 mb-0"></div>

      {/* View All Assets button */}
      {!isLoading && !selectedCategory && (
        <div className="mb-0">
          <button className="btn btn-sm btn-default" onClick={() => setSelectedCategory('all')}>
            📊 All Assets 
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Back button to go back to the asset groups */}
      {!isLoading && selectedCategory && (
        <div className="flex items-center gap-2">
          <div className="mb-0">
            <button className="btn btn-sm btn-default" onClick={() => setSelectedCategory(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Categories
            </button>
          </div>
          {selectedCategory === 'all' ? '📊 All Assets' : getAssetCategoryDescription(selectedCategory)}
        </div>
      )}

      <AssetList 
        isLoading={isLoading} 
        error={error} 
        assetData={filteredAssets} 
        totalAssetsValue={totalAssetsValue}
        showMoreActions={showAssetActionsButton}
        showViewDetails={showAssetViewDetailsButton}
        onEditAsset={handleEditAsset} 
        onDeleteAsset={handleDeleteAsset}
        onViewDetails={handleViewDetails}
      />
    </>
  );

  // Fetch currency rates
  useEffect(() => {
    getCurrencyRates(baseCurrency);
  }, [getCurrencyRates, baseCurrency]);

  // Fetch assets
  useEffect(() => {
    setIsLoading(true);
    getAssets()
      .catch((err) => {
        console.error('Failed to fetch assets:', err);
        setError('Failed to load data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [getAssets]);
  
  return (
    <div className="min-h-screen flex flex-col bg-base-200">

      {/* Header */}
      <TopNavbar />

      {/* Main content */}
      <div className="flex pt-16 min-h-screen">
        <main className="flex-1 lg:mr-[420px] p-6 md:p-8 space-y-6 md:space-y-8">

          <div className="flex flex-col items-center sr-only">
            <h1>{appShortDescription} | {appName}</h1>
            <p>{appDescription}</p>
          </div>

          {/* Portfolio Summary Card */}
          <SummaryCard 
            isLoading={isLoading}
            error={error}
            totalAssetsValue={totalAssetsValue}
          />

          {/* Render Allocation Chart */}
          <AllocationChart 
            isLoading={isLoading}
            title={assetListTitle}
            assetData={filteredAssets} 
            error={error}
          />

          {/* Mobile Assets List */}
          <div className="card bg-base-100 shadow-xl lg:hidden">
            <div className="card-body p-4">

              {!isLoading && (
                <div className="flex justify-between items-center !mt-0">
                  <h2 className="italic font-semibold">{assetListTitle}</h2>
                  <button 
                    className="btn btn-primary flex items-center gap-2 lg:hidden ml-auto"
                    onClick={handleNewAsset}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Add Asset</span>
                  </button>
                </div>
              )}

              <AssetListComponent />
            </div>
          </div>

          {/* Footer */}  
          <Footer />
          
        </main>

        {/* Desktop sidebar */}
        <RightSidebar isLoading={isLoading} title={assetListTitle} onAddAsset={handleNewAsset}>
          <AssetListComponent />
        </RightSidebar>

        {/* Add Asset Modal */}
        <AssetEditionModal
          isOpen={isAddModalOpen}
          isSubmitting={isSavingAsset}
          submitError={submitAssetError}
          asset={selectedAsset}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveAsset}
        />

      </div>

    </div>
  );

}