'use client';

import { useState, useEffect } from 'react';
import TopNavbar from "@/components/dashboard/TopNavbar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import AssetsList from "@/components/dashboard/AssetsList";
import TimeframeToggle from "@/components/dashboard/TimeframeToggle";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import AllocationChart from "@/components/dashboard/AllocationChart";
import AssetEditionModal from "@/components/dashboard/AssetEditionModal";
import TabNavigation from "@/components/dashboard/TabNavigation";
import { getInvestments } from "@/services/investmentService";
import PortfolioSummaryCard from "@/components/dashboard/PortfolioSummaryCard";
import { calculatePortfolioSummary } from "@/services/ChartService";
import config from '@/config';
import Footer from '@/components/Footer';
export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function Dashboard() {
  const { appName, appDescription } = config;
  // Default to 1 month timeframe
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('all');
  const [activeTab, setActiveTab] = useState('performance');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investmentData, setInvestmentData] = useState([]);
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
        const summary = calculatePortfolioSummary(investments, timeframe);
        setPortfolioSummary(summary);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddInvestmentClick = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveAsset = async (formData, saveAndAdd) => {
    console.log('Saving investment:', formData);
    
    // Refresh data after saving
    if (!saveAndAdd) {
      const investments = await getInvestments();
      setInvestmentData(investments);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    try {
      // TODO: Implement delete investment
      console.log('Deleting asset:', assetId);
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
        <main className="flex-1 lg:mr-[420px] p-3 md:p-6">
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col items-center sr-only">
              <h1>{appName} | Investorso</h1>
              <p>{appDescription}</p>
            </div>

            {/* Tabs and Add Transaction button in same row */}
            <div className="flex justify-between items-center !mt-0">
              <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
              <button 
                className="btn btn-primary flex items-center gap-2 btn-sm md:btn-md md:hidden"
                onClick={handleAddInvestmentClick}
                title="Add Asset"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>

            {/* Timeframe Toggle */}
            <div className="flex justify-start">
              <TimeframeToggle selected={timeframe} onSelect={setTimeframe} />
            </div>

            {/* Portfolio Summary Card */}
            <PortfolioSummaryCard 
              portfolioSummary={portfolioSummary}
              loading={loading}
              error={error}
            />

            {/* Render the appropriate component based on the active tab */}
            {activeTab === 'performance' && (
              <PerformanceChart 
                timeframe={timeframe} 
                data={investmentData} 
                portfolioSummary={portfolioSummary}
                loading={loading}
                error={error}
              />
            )}
            {activeTab === 'allocation' && (
              <AllocationChart 
                data={investmentData} 
                loading={loading}
                error={error}
              />
            )}

            {/* Footer */}  
            <Footer />
          </div>
        </main>

        {/* Desktop sidebar */}
        <RightSidebar onAddInvestment={handleAddInvestmentClick}>
          <AssetsList 
            loading={loading} 
            error={error} 
            investmentData={investmentData} 
            onEditAsset={handleSaveAsset} 
            onDeleteAsset={handleDeleteAsset}
          />
        </RightSidebar>

        {/* Mobile sidebar */}
        <MobileSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
          <AssetsList 
            loading={loading} 
            error={error} 
            investmentData={investmentData} 
            onEditAsset={handleSaveAsset}  
            onDeleteAsset={handleDeleteAsset}
          />
        </MobileSidebar>

        {/* Add Investment Modal */}
        <AssetEditionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveAsset}
        />

      </div>

    </div>
  );
}
