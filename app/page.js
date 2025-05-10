'use client';

import { useState, useEffect } from 'react';
import TopNavbar from "@/components/dashboard/TopNavbar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import AssetsList from "@/components/dashboard/AssetsList";
import AllocationChart from "@/components/dashboard/AllocationChart";
import AssetEditionModal from "@/components/dashboard/AssetEditionModal";
import { getInvestments } from "@/services/investmentService";
import PortfolioSummaryCard from "@/components/dashboard/PortfolioSummaryCard";
import { calculatePortfolioSummary } from "@/services/ChartService";
import config from '@/config';
import Footer from '@/components/Footer';
import { createInvestment, updateInvestment, deleteInvestment } from '@/services/investmentService';
export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function Dashboard() {
  const { appName, appDescription } = config;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [submitAssetError, setSubmitAssetError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investmentData, setInvestmentData] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState({
    total: 0,
    profit: 0,
    profitPercentage: 0,
    period: 'all'
  });

  // Fetch data when timeframe changes or after adding a new investment
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const investments = await getInvestments();
        setInvestmentData(investments)

        // Calculate portfolio summary
        const summary = calculatePortfolioSummary(investments, 'all');
        setPortfolioSummary(summary);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      let updatedInvestment;
      setIsSavingAsset(true);
      setSubmitAssetError(null);
      if (id) {
        // Update existing investment
        updatedInvestment = await updateInvestment(id, assetData);
      } else {
        // Create new investment
        updatedInvestment = await createInvestment(assetData);
      }
      
      // Refresh data after saving
      const updatedInvestments = investmentData.map(investment => 
        investment.id === updatedInvestment.id ? updatedInvestment : investment
      );

      setInvestmentData(updatedInvestments);
    } catch (err) {
      console.error('Failed to save asset:', err);
      setSubmitAssetError(err.message);
    } finally {
      setIsSavingAsset(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      
      {/* Navbar */}
      <TopNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main content */}
      <div className="flex pt-16 min-h-screen">
        <main className="flex-1 lg:mr-[420px] p-4 md:p-6">
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col items-center sr-only">
              <h1>{appName} | FortuneOK</h1>
              <p>{appDescription}</p>
            </div>

            {/* Tabs and Add Transaction button in same row */}
            <div className="flex justify-between items-center !mt-0">
              <button 
                className="btn btn-primary flex items-center gap-2 btn-sm md:btn-md md:hidden ml-auto"
                onClick={handleNewAsset}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add Asset</span>
              </button>
            </div>

            {/* Portfolio Summary Card */}
            <PortfolioSummaryCard 
              portfolioSummary={portfolioSummary}
              loading={loading}
              error={error}
            />

            {/* Render the appropriate component based on the active tab */}
            <AllocationChart 
              data={investmentData} 
              loading={loading}
              error={error}
            />

            {/* Footer */}  
            <Footer />
          </div>
        </main>

        {/* Desktop sidebar */}
        <RightSidebar onAddInvestment={handleNewAsset}>
          <AssetsList 
            loading={loading} 
            error={error} 
            investmentData={investmentData} 
            onEditAsset={handleEditAsset} 
            onDeleteAsset={handleDeleteAsset}
          />
        </RightSidebar>

        {/* Mobile sidebar */}
        <MobileSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
          <AssetsList 
            loading={loading} 
            error={error} 
            investmentData={investmentData} 
            onEditAsset={handleEditAsset}  
            onDeleteAsset={handleDeleteAsset}
          />
        </MobileSidebar>

        {/* Add Investment Modal */}
        <AssetEditionModal
          isOpen={isAddModalOpen}
          isSavingAsset={isSavingAsset}
          submitError={submitAssetError}
          asset={selectedAsset}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveAsset}
        />

      </div>

    </div>
  );
}
