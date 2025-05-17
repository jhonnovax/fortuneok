'use client';

import { useState, useEffect } from 'react';
import Header from "./Header";
import RightSidebar from "./RightSidebar";
import AssetList from "./AssetList";
import AllocationChart from "./AllocationChart";
import AssetEditionModal from "./AssetEditionModal";
import PortfolioSummaryCard from "./PortfolioSummaryCard";
import { useAssetStore } from '@/store/assetStore';
import { useCurrencyRatesStore } from '@/store/currencyRatesStore';
import config from '@/config';
import Footer from './Footer';
import TabAssetGroups from './TabAssetGroups';
import { useTailwindBreakpoint } from '@/hooks/useTailwindBreakpoint';

export default function Portfolio() {

  const { appName, appDescription } = config;

  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [submitAssetError, setSubmitAssetError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('positions');
  const [activeTabSidebar, setActiveTabSidebar] = useState('positions');

  const getCurrencyRates = useCurrencyRatesStore((state) => state.getCurrencyRates);
  const getAssets = useAssetStore((state) => state.getAssets);
  const getFilteredAndSortedAssets = useAssetStore((state) => state.getFilteredAndSortedAssets);
  const addAsset = useAssetStore((state) => state.addAsset);
  const updateAsset = useAssetStore((state) => state.updateAsset);
  const deleteAsset = useAssetStore((state) => state.deleteAsset);
  const assetData = getFilteredAndSortedAssets();

  const { breakpointValue} = useTailwindBreakpoint();

  const handleNewAsset = () => {
    setSelectedAsset(null);
    setIsAddModalOpen(true);
  };

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setIsAddModalOpen(true);
  };

  const handleSaveAsset = async (asset) => {
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
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      // TODO: Implement delete asset
      const response = await deleteAsset(assetId);
      console.log('Deleted asset:', response);
    } catch (err) {
      console.error('Failed to delete asset:', err);
      // You might want to show an error message to the user here
    }
  };

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

  useEffect(() => {
    if (breakpointValue >= 1024) {
      setActiveTab('all');
    } else {
      setActiveTab('positions');
    }
  }, [breakpointValue]);
  
  return (
    <div className="min-h-screen flex flex-col bg-base-200">

      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="flex pt-16 min-h-screen">
        <main className="flex-1 lg:mr-[420px] p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">

            <div className="flex flex-col items-center sr-only">
              <h1>{appName} | FortuneOK</h1>
              <p>{appDescription}</p>
            </div>

            {/* Portfolio Summary Card */}
            <PortfolioSummaryCard 
              isLoading={isLoading}
              assetData={assetData}
              error={error}
            />

            {/* Tabs Asset Groups */}
            <TabAssetGroups 
              className="lg:hidden" 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />

            {/* Render the appropriate component based on the active tab */}
            <AllocationChart 
              isLoading={isLoading}
              activeTab={activeTab}
              data={assetData} 
              error={error}
            />

            {/* Mobile Assets List */}
            <div className="card bg-base-100 shadow-xl lg:hidden">
              <div className="card-body p-4">

                {!isLoading && (
                  <div className="flex justify-between items-center !mt-0">
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

                <AssetList 
                  isLoading={isLoading} 
                  activeTab={activeTab}
                  error={error} 
                  assetData={assetData} 
                  onEditAsset={handleEditAsset}  
                  onDeleteAsset={handleDeleteAsset}
                />

              </div>
            </div>

            {/* Footer */}  
            <Footer />
          </div>
        </main>

        {/* Desktop sidebar */}
        <RightSidebar onAddAsset={handleNewAsset}>
          <TabAssetGroups 
            className="pt-4 mb-4 sticky top-0 bg-base-100 z-10" 
            activeTab={activeTabSidebar} 
            onTabChange={setActiveTabSidebar} 
          />
          <AssetList 
            isLoading={isLoading} 
            error={error} 
            activeTab={activeTabSidebar}
            assetData={assetData} 
            onEditAsset={handleEditAsset} 
            onDeleteAsset={handleDeleteAsset}
          />
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