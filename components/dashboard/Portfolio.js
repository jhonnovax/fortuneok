'use client';

import { useState, useEffect } from 'react';
import TopNavbar from "@/components/dashboard/TopNavbar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import AssetsList from "@/components/dashboard/AssetsList";
import AllocationChart from "@/components/dashboard/AllocationChart";
import AssetEditionModal from "@/components/dashboard/AssetEditionModal";
import PortfolioSummaryCard from "@/components/dashboard/PortfolioSummaryCard";
import { useInvestmentStore } from '@/store/investmentStore';
import { useCurrencyRatesStore } from '@/store/currencyRatesStore';
import config from '@/config';
import Footer from '@/components/Footer';
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
  const getInvestments = useInvestmentStore((state) => state.getInvestments);
  const getFilteredAndSortedInvestments = useInvestmentStore((state) => state.getFilteredAndSortedInvestments);
  const filterByTimeFrame = useInvestmentStore((state) => state.filterByTimeFrame);
  const sortInvestments = useInvestmentStore((state) => state.sortInvestments);
  const selectedInvestmentIds = useInvestmentStore((state) => state.selectedInvestmentIds);
  const toggleInvestment = useInvestmentStore((state) => state.toggleInvestment);
  const addInvestment = useInvestmentStore((state) => state.addInvestment);
  const updateInvestment = useInvestmentStore((state) => state.updateInvestment);
  const deleteInvestment = useInvestmentStore((state) => state.deleteInvestment);
  const investmentData = getFilteredAndSortedInvestments();

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
        // Update existing investment
        await updateInvestment(id, assetData);
      } else {
        // Create new investment
        await addInvestment(assetData);
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
      // TODO: Implement delete investment
      const response = await deleteInvestment(assetId);
      console.log('Deleted investment:', response);
    } catch (err) {
      console.error('Failed to delete investment:', err);
      // You might want to show an error message to the user here
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getInvestments()
      .catch((err) => {
        console.error('Failed to fetch investments:', err);
        setError('Failed to load data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [getInvestments]);

  useEffect(() => {
    if (breakpointValue >= 1024) {
      setActiveTab('all');
    } else {
      setActiveTab('positions');
    }
  }, [breakpointValue]);
  
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      
      {/* Navbar */}
      <TopNavbar />

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
              investmentData={investmentData}
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
              data={investmentData} 
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

                <AssetsList 
                  isLoading={isLoading} 
                  activeTab={activeTab}
                  error={error} 
                  investmentData={investmentData} 
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
        <RightSidebar onAddInvestment={handleNewAsset}>
          <TabAssetGroups 
            className="pt-4 mb-4 sticky top-0 bg-base-100 z-10" 
            activeTab={activeTabSidebar} 
            onTabChange={setActiveTabSidebar} 
          />
          <AssetsList 
            isLoading={isLoading} 
            error={error} 
            activeTab={activeTabSidebar}
            investmentData={investmentData} 
            onEditAsset={handleEditAsset} 
            onDeleteAsset={handleDeleteAsset}
          />
        </RightSidebar>

        {/* Add Investment Modal */}
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