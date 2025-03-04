'use client';

import { useState, useEffect } from 'react';
import TimeframeToggle from './components/TimeframeToggle';
import PerformanceChart from './components/PerformanceChart';
import AllocationChart from './components/AllocationChart';
import AddInvestmentModal from './components/AddInvestmentModal';
import TabNavigation from './components/TabNavigation';
import AddInvestmentButton from './components/AddInvestmentButton';
import { getInvestments } from './services/investmentService';

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default function Dashboard() {
  // Default to 1 month timeframe
  const [timeframe, setTimeframe] = useState('all');
  const [activeTab, setActiveTab] = useState('performance');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
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
        
        if (activeTab === 'performance') {
          // Process investments to create performance data
          const chartData = processInvestmentsForPerformance(investments, timeframe);
          setPerformanceData(chartData);
          
          // Calculate portfolio summary
          const summary = calculatePortfolioSummary(investments, timeframe);
          setPortfolioSummary(summary);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, activeTab]);

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

  // Process investments to create performance data
  const processInvestmentsForPerformance = (investments, timeframe) => {
    if (!investments || investments.length === 0) {
      return [];
    }

    // Get all transactions from all investments
    const allTransactions = investments.flatMap(investment => 
      investment.transactions.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date),
        investmentCategory: investment.category
      }))
    );

    // Sort transactions by date
    allTransactions.sort((a, b) => a.date - b.date);

    // Determine date range based on timeframe
    const now = new Date();
    let startDate = new Date(allTransactions[0]?.date || now);
    
    if (timeframe === '1M') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === '3M') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
    } else if (timeframe === '6M') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6);
    } else if (timeframe === '1Y') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    } else if (timeframe === '5Y') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 5);
    } else if (timeframe === '10Y') {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 10);
    } else if (timeframe === '1D') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
    } else if (timeframe === '1W') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    }
    // 'all' timeframe uses the earliest transaction date

    // Group transactions by month
    const monthlyData = {};
    let runningDeposits = 0;
    let runningValue = 0;

    allTransactions.forEach(transaction => {
      if (transaction.date < startDate) {
        // For transactions before our timeframe, just update the running totals
        if (['buy', 'deposit'].includes(transaction.operation)) {
          runningDeposits += transaction.pricePerUnit * (transaction.shares || 1);
          runningValue += transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['sell', 'withdrawal'].includes(transaction.operation)) {
          runningDeposits -= transaction.pricePerUnit * (transaction.shares || 1);
          runningValue -= transaction.pricePerUnit * (transaction.shares || 1);
        } else if (['dividend', 'interest'].includes(transaction.operation)) {
          runningValue += transaction.pricePerUnit;
        }
        return;
      }

      const monthYear = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          date: `${transaction.date.toLocaleString('default', { month: 'short' })} ${transaction.date.getFullYear()}`,
          deposits: runningDeposits,
          value: runningValue,
          timestamp: new Date(transaction.date.getFullYear(), transaction.date.getMonth(), 1).getTime()
        };
      }

      // Update running totals based on transaction type
      if (['buy', 'deposit'].includes(transaction.operation)) {
        runningDeposits += transaction.pricePerUnit * (transaction.shares || 1);
        runningValue += transaction.pricePerUnit * (transaction.shares || 1);
      } else if (['sell', 'withdrawal'].includes(transaction.operation)) {
        runningDeposits -= transaction.pricePerUnit * (transaction.shares || 1);
        runningValue -= transaction.pricePerUnit * (transaction.shares || 1);
      } else if (['dividend', 'interest'].includes(transaction.operation)) {
        runningValue += transaction.pricePerUnit;
      }

      // Update the monthly data
      monthlyData[monthYear].deposits = runningDeposits;
      monthlyData[monthYear].value = runningValue;
    });

    // Convert to array and sort by date
    const result = Object.values(monthlyData).sort((a, b) => a.timestamp - b.timestamp);
    
    // Add current month if not present
    const currentMonthYear = `${now.getFullYear()}-${now.getMonth() + 1}`;
    if (!monthlyData[currentMonthYear] && result.length > 0) {
      result.push({
        date: `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`,
        deposits: result[result.length - 1].deposits,
        value: result[result.length - 1].value,
        timestamp: now.getTime()
      });
    }

    return result;
  };

  const handleSaveInvestment = async (formData, saveAndAdd) => {
    console.log('Saving investment:', formData);
    
    // Refresh data after saving
    if (!saveAndAdd) {
      const investments = await getInvestments();
      
      if (activeTab === 'performance') {
        const chartData = processInvestmentsForPerformance(investments, timeframe);
        setPerformanceData(chartData);
        
        const summary = calculatePortfolioSummary(investments, timeframe);
        setPortfolioSummary(summary);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddInvestmentClick = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <h1 className="sr-only">Portfolio Overview</h1>
        <TimeframeToggle selected={timeframe} onSelect={setTimeframe} />
      </div>

      {/* Tabs and Add Transaction button in same row */}
      <div className="flex justify-between items-center">
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        <AddInvestmentButton onClick={handleAddInvestmentClick} />
      </div>

      {/* Render the appropriate component based on the active tab */}
      {activeTab === 'performance' && (
        <PerformanceChart 
          timeframe={timeframe} 
          data={performanceData} 
          portfolioSummary={portfolioSummary}
          loading={loading}
          error={error}
        />
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
