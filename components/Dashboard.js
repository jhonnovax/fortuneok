'use client';

import { useState, useEffect, useMemo } from 'react';
import HeaderDashboard from "./HeaderDashboard";
import Sidebar from "./Sidebar";
import AssetList from "./AssetList";
import SummaryCard from "./SummaryCard";
import { useAssetStore } from '@/store/assetStore';
import { useCurrencyRatesStore } from '@/store/currencyRatesStore';
import config from '@/config';
import { usePreferences } from '@/contexts/PreferencesContext';
import { parseAssetCategoryFromAssetList, getAssetCategoryGroupName } from '@/services/assetService';
import AssetTopBarNavigation from './AssetTopBarNavigation';
import dynamic from 'next/dynamic';
import AllocationChartSkeleton from './AllocationChartSkeleton';
import Toast from './Toast';
import ConfettiEffect from './Confetti';

// Dynamic imports for heavy components
const AllocationChart = dynamic(() => import('./AllocationChart'), { 
  ssr: false, 
  loading: () => <AllocationChartSkeleton /> 
});

const AssetEditionModal = dynamic(() => import('./AssetEditionModal'), {
  ssr: false,
});

const AddAssetFloatingButton = dynamic(() => import('./AddAssetFloatingButton'), {
  ssr: false,
  loading: () => null
});

export default function Dashboard() {

  const { appName, appShortDescription, appDescription } = config;

  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isDeletingAsset, setIsDeletingAsset] = useState(false);
  const [submitAssetError, setSubmitAssetError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [showConfetti, setShowConfetti] = useState(false);
  const { preferredCurrency: baseCurrency } = usePreferences();

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
        currencies: [{
          currency: asset.currentValuation?.currency,
          valuationInPreferredCurrency: asset.valuationInPreferredCurrency
        }]
      };
    });

    // If a category is selected, and it's not 'all', filter the assets to only include the assets in that category
    if (selectedCategory && selectedCategory !== 'all') {
      const categoryGroupName = getAssetCategoryGroupName(selectedCategory);      
      assets = assets.filter((asset) => getAssetCategoryGroupName(asset.category) === categoryGroupName);
    }
    
    // If no category is selected, parse the asset data to get the categories
    if (!selectedCategory) {
      assets = parseAssetCategoryFromAssetList(assets);
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

  const totalAssetsValue = useMemo(() => {
    return filteredAssets.reduce((total, asset) => {
      return total + (asset.valuationInPreferredCurrency || 0);
    }, 0);
  }, [filteredAssets]);

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
        setToast({ 
          isVisible: true, 
          message: 'Asset updated successfully! 🎉', 
          type: 'success' 
        });
      } else {
        // Create new asset
        await addAsset(assetData);
        setToast({ 
          isVisible: true, 
          message: 'Asset added successfully! 🚀', 
          type: 'success' 
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save asset:', err);
      setSubmitAssetError(err.message);
      setToast({ 
        isVisible: true, 
        message: err.message || 'Failed to save asset', 
        type: 'error' 
      });
    } finally {
      setIsSavingAsset(false);
      setIsAddModalOpen(false);
    }
  }

  async function handleDeleteAsset(assetId) {
    try {
      setIsDeletingAsset(true);
      await deleteAsset(assetId);
      setToast({ 
        isVisible: true, 
        message: 'Asset deleted successfully! ✅', 
        type: 'success' 
      });
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setToast({ 
        isVisible: true, 
        message: err.message || 'Failed to delete asset', 
        type: 'error' 
      });
    } finally {
      setIsDeletingAsset(false);
    }
  }

  async function handleViewDetails(asset) {
    setSelectedCategory(asset.category);
  }

  // AssetList component
  const AssetListComponent = () => (
    <AssetList 
      isLoading={isLoading} 
      error={error} 
      baseCurrency={baseCurrency}
      assetData={filteredAssets} 
      selectedCategory={selectedCategory}
      totalAssetsValue={totalAssetsValue}
      showMoreActions={showAssetActionsButton}
      showViewDetails={showAssetViewDetailsButton}
      showValues={showValues}
      onEditAsset={handleEditAsset} 
      onDeleteAsset={handleDeleteAsset}
      onViewDetails={handleViewDetails}
      onAddAsset={handleNewAsset}
    />
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
      <HeaderDashboard onAddAsset={handleNewAsset} />

      {/* Desktop sidebar */}
      <Sidebar 
          isLoading={isLoading} 
          assetData={filteredAssets}  
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        >
        <AssetListComponent />
      </Sidebar>

      {/* Main content */}
      <div className="flex pt-16 min-h-screen">
        <main className="flex-1 lg:ml-[420px] xl:ml-[520px] p-4 md:p-6 space-y-4 md:space-y-6">

          <div className="flex flex-col items-center sr-only">
            <h1>{appShortDescription} | {appName}</h1>
            <p>{appDescription}</p>
          </div>

          {/* Portfolio Summary Card */}
          <SummaryCard 
            isLoading={isLoading}
            error={error}
            baseCurrency={baseCurrency}
            filteredAssetData={filteredAssets} 
            totalAssetsValue={totalAssetsValue}
            showValues={showValues}
            setShowValues={setShowValues}
          />

          {/* Render Allocation Chart */}
          <AllocationChart 
            isLoading={isLoading}
            error={error}
            filteredAssetData={filteredAssets} 
            showValues={showValues}
            onAddAsset={handleNewAsset}
          />

          {/* Mobile Assets List */}
          <div className="card bg-base-100 shadow-xl lg:hidden">
            <div className="card-body p-0">
              {!isLoading && (
                <AssetTopBarNavigation 
                  assetData={filteredAssets} 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              )}
              <AssetListComponent />
            </div>
          </div>

        </main>

        {/* Add Asset Modal */}
        <AssetEditionModal
          isOpen={isAddModalOpen}
          isSubmitting={isSavingAsset}
          submitError={submitAssetError}
          asset={selectedAsset}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveAsset}
        />

        {/* Floating Add Asset Button */}
        {!isLoading && <AddAssetFloatingButton onAddAsset={handleNewAsset} />}

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />

        {/* Confetti Effect */}
        <ConfettiEffect trigger={showConfetti} />

      </div>

    </div>
  );

}