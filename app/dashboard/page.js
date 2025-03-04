'use client';

import { useState, useEffect } from 'react';
import TimeframeToggle from './components/TimeframeToggle';
import PerformanceChart from './components/PerformanceChart';
import AllocationChart from './components/AllocationChart';
import AddInvestmentModal from './components/AddInvestmentModal';
import { getInvestments } from './services/investmentService';

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function Dashboard() {
  // Default to 1 month timeframe
  const [timeframe, setTimeframe] = useState('1M');
  const [activeTab, setActiveTab] = useState('performance');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isValueVisible, setIsValueVisible] = useState(true);
  const [portfolioSummary, setPortfolioSummary] = useState({
    total: 0,
    profit: 0,
    profitPercentage: 0,
    period: 'all'
  });
  const [loading, setLoading] = useState(true);

  // Fetch portfolio summary data
  useEffect(() => {
    const fetchPortfolioSummary = async () => {
      try {
        setLoading(true);
        const investments = await getInvestments();
        
        // Calculate portfolio summary
        const summary = calculatePortfolioSummary(investments, timeframe);
        setPortfolioSummary(summary);
      } catch (err) {
        console.error('Failed to fetch portfolio summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioSummary();
  }, [timeframe]);

  // Calculate portfolio summary from investments
  const calculatePortfolioSummary = (investments, timeframe) => {
    if (!investments || investments.length === 0) {
      return {
        total: 0,
        profit: 0,
        profitPercentage: 0,
        period: timeframe
      };
    }

    // Get all transactions from all investments
    const allTransactions = investments.flatMap(investment => 
      investment.transactions.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date)
      }))
    );

    // Sort transactions by date
    allTransactions.sort((a, b) => a.date - b.date);

    // Determine date range based on timeframe
    const now = new Date();
    let startDate = new Date(allTransactions[0]?.date || now);
    let periodLabel = 'all time';
    
    if (timeframe === '1D') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      periodLabel = 'past day';
    } else if (timeframe === '1W') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      periodLabel = 'past week';
    } else if (timeframe === '1M') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      periodLabel = 'past month';
    } else if (timeframe === '3M') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      periodLabel = 'past 3 months';
    } else if (timeframe === '6M') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6);
      periodLabel = 'past 6 months';
    } else if (timeframe === '1Y') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      periodLabel = 'past year';
    } else if (timeframe === '5Y') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 5);
      periodLabel = 'past 5 years';
    } else if (timeframe === '10Y') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 10);
      periodLabel = 'past 10 years';
    }

    // Calculate total value and deposits
    let totalValue = 0;
    let totalDeposits = 0;
    let startingValue = 0;

    // First pass: calculate starting value at the beginning of the period
    allTransactions.forEach(transaction => {
      if (transaction.date < startDate) {
        if (['buy', 'deposit'].includes(transaction.operation)) {
          startingValue += transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['sell', 'withdrawal'].includes(transaction.operation)) {
          startingValue -= transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['dividend', 'interest'].includes(transaction.operation)) {
          startingValue += transaction.pricePerUnit;
        }
      }
    });

    // Second pass: calculate current value and deposits during the period
    allTransactions.forEach(transaction => {
      // Update total value for all transactions
      if (['buy', 'deposit'].includes(transaction.operation)) {
        totalValue += transaction.pricePerUnit * (transaction.shares || 1);
      } else if (['sell', 'withdrawal'].includes(transaction.operation)) {
        totalValue -= transaction.pricePerUnit * (transaction.shares || 1);
      } else if (['dividend', 'interest'].includes(transaction.operation)) {
        totalValue += transaction.pricePerUnit;
      }

      // Update deposits only for transactions in the selected period
      if (transaction.date >= startDate) {
        if (['buy', 'deposit'].includes(transaction.operation)) {
          totalDeposits += transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['sell', 'withdrawal'].includes(transaction.operation)) {
          totalDeposits -= transaction.pricePerUnit * (transaction.shares || 1);
        }
      }
    });

    // Calculate profit
    const profit = totalValue - startingValue - totalDeposits;
    
    // Calculate profit percentage
    let profitPercentage = 0;
    if (startingValue > 0) {
      profitPercentage = (profit / startingValue) * 100;
    } else if (totalDeposits > 0) {
      profitPercentage = (profit / totalDeposits) * 100;
    }

    return {
      total: totalValue,
      profit: profit,
      profitPercentage: profitPercentage.toFixed(2),
      period: periodLabel
    };
  };

  const handleSaveInvestment = async (formData, saveAndAdd) => {
    console.log('Saving investment:', formData);
    
    // Refresh portfolio data after saving
    if (!saveAndAdd) {
      const investments = await getInvestments();
      const summary = calculatePortfolioSummary(investments, timeframe);
      setPortfolioSummary(summary);
    }
  };

  // Helper function to mask value
  const maskValue = () => '$ • • • • • • ';

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <h1 className="sr-only">Portfolio Overview</h1>
        <TimeframeToggle selected={timeframe} onSelect={setTimeframe} />
      </div>

      {/* Tabs and Add Transaction button in same row */}
      <div className="flex justify-between items-center">
        <div className="flex gap-8">
          <button 
            className={`pb-4 px-1 relative flex items-center gap-2 ${
              activeTab === 'performance' 
                ? 'text-green-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            Performance
            {activeTab === 'performance' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
            )}
          </button>
          <button 
            className={`pb-4 px-1 relative flex items-center gap-2 ${
              activeTab === 'allocation' 
                ? 'text-green-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('allocation')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
            Allocation
            {activeTab === 'allocation' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
            )}
          </button>
        </div>

        {/* Add Transaction Button with icon */}
        <button 
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Investment
        </button>
      </div>

      {activeTab === 'performance' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <div className="space-y-2">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <span className="loading loading-spinner loading-md"></span>
                    <span className="text-gray-500">Loading portfolio data...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold">
                        {isValueVisible 
                          ? `$${portfolioSummary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : maskValue(portfolioSummary.total)
                        }
                      </span>
                      <button 
                        className="btn btn-circle btn-ghost btn-sm"
                        onClick={() => setIsValueVisible(!isValueVisible)}
                      >
                        {isValueVisible ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-lg">
                      <span className={`font-medium ${portfolioSummary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {isValueVisible ? (
                          `${portfolioSummary.profit >= 0 ? '+' : ''}$${Math.abs(portfolioSummary.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ) : '$ • • •'}
                      </span>
                      {isValueVisible &&
                        <>
                          <span className={`font-medium ${portfolioSummary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({portfolioSummary.profit >= 0 ? '+' : ''}{portfolioSummary.profitPercentage}%)
                          </span>
                          <span className="text-gray-500">{portfolioSummary.period}</span>
                        </>
                      }
                    </div>
                  </>
                )}
              </div>
              
              {/* Performance Chart */}
              <PerformanceChart timeframe={timeframe} />
            </div>
          </div>
        </div>
      )}
      {activeTab === 'allocation' && <AllocationChart />}
        

      {/* Add Investment Modal */}
      <AddInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveInvestment}
      />
    </div>
  );
}
