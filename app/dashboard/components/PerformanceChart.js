'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { getInvestments } from '../services/investmentService';

export default function PerformanceChart({ timeframe = 'all' }) {
  const [theme, setTheme] = useState('light');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check if dark theme is active
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'dark' : 'light');

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          setTheme(newTheme === 'dark' ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch investment data and calculate performance
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        const investments = await getInvestments();
        
        // Process investments to create performance data
        const performanceData = processInvestmentsForPerformance(investments, timeframe);
        setData(performanceData);
      } catch (err) {
        console.error('Failed to fetch performance data:', err);
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [timeframe]);

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
    
    if (timeframe === '1m') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (timeframe === '3m') {
      startDate = new Date(now.setMonth(now.getMonth() - 3));
    } else if (timeframe === '6m') {
      startDate = new Date(now.setMonth(now.getMonth() - 6));
    } else if (timeframe === '1y') {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    } else if (timeframe === 'ytd') {
      startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
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

  const formatValue = (value) => `$${value.toLocaleString()}`;
  
  // Theme-specific colors
  const colors = {
    primary: theme === 'dark' ? '#009b00' : '#006e00',
    deposits: theme === 'dark' ? '#ffd700' : '#b8860b', // Brighter yellow for dark theme, darker for light
  };

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-error text-center">
          <p>{error}</p>
          <button className="btn btn-sm btn-outline mt-2" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-center text-gray-500">
          No performance data available. Add investments to see your portfolio performance.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.primary} stopOpacity={0.4}/>
              <stop offset="50%" stopColor={colors.primary} stopOpacity={0.2}/>
              <stop offset="100%" stopColor={colors.primary} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke="hsl(var(--bc) / 0.1)"
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--bc) / 0.5)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--bc) / 0.5)', fontSize: 12 }}
            tickFormatter={formatValue}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--b1))',
              border: '1px solid hsl(var(--bc) / 0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ 
              color: 'hsl(var(--bc))', 
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
            formatter={(value, name) => [
              formatValue(value),
              name === 'value' ? 'Portfolio Value' : 'Net Deposits'
            ]}
            itemStyle={{ padding: '2px 0' }}
          />
          {/* Net Deposits Line */}
          <Area
            type="monotone"
            dataKey="deposits"
            stroke={colors.deposits}
            strokeWidth={2}
            fill="none"
            strokeDasharray="6 6"
            dot={false}
            activeDot={{
              r: 4,
              stroke: colors.deposits,
              strokeWidth: 2,
              fill: 'hsl(var(--b1))'
            }}
          />
          {/* Portfolio Value Area */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.primary}
            strokeWidth={2}
            fill="url(#colorValue)"
            dot={false}
            activeDot={{
              r: 4,
              stroke: colors.primary,
              strokeWidth: 2,
              fill: 'hsl(var(--b1))'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 