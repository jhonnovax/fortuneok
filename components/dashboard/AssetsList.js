'use client';

import { useState, useEffect } from 'react';
import DeleteAssetModal from './DeleteAssetModal';
import EditAssetModal from './EditAssetModal';
import TransactionHistoryModal from './TransactionHistoryModal';
import AddTransactionModal from './AddTransactionModal';
import { getInvestments, deleteInvestment } from '../../services/investmentService';
import { calculateNonStockPerformance } from '../../services/ChartService';

export default function AssetsList() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    assetId: null
  });
  
  const [editModal, setEditModal] = useState({
    isOpen: false,
    assetId: null
  });
  
  const [transactionHistoryModal, setTransactionHistoryModal] = useState({
    isOpen: false,
    assetId: null,
    assetName: '',
    assetType: ''
  });
  
  const [addTransactionModal, setAddTransactionModal] = useState({
    isOpen: false,
    assetId: null,
    assetName: '',
    assetType: ''
  });

  // Fetch investments when component mounts
  useEffect(() => {
    fetchInvestments();
  }, []);
  
  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const investments = await getInvestments();
      
      const formattedAssets = investments.map(investment => {
        const isNonStock = investment.category !== 'Stock' && investment.annualInterestRate;
        const value = isNonStock 
          ? calculateNonStockPerformance(investment, 'all')
          : calculateTotalValue(investment.transactions);

        return {
          id: investment.id,
          type: investment.category,
          symbol: investment.symbol || 'N/A',
          name: investment.description,
          shares: calculateTotalShares(investment.transactions),
          value,
          annualRate: investment.annualInterestRate,
          change: isNonStock ? (investment.annualInterestRate + '%') : '0.00',
          changePercent: isNonStock ? (investment.annualInterestRate + '%') : '0.00%',
          checked: false,
          rawData: investment
        };
      });
      
      setAssets(formattedAssets);
    } catch (err) {
      console.error('Failed to fetch investments:', err);
      setError('Failed to load investments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate total shares from transactions
  const calculateTotalShares = (transactions) => {
    if (!transactions || transactions.length === 0) return '0';
    
    let totalShares = 0;
    
    transactions.forEach(transaction => {
      if (transaction.operation === 'buy' && transaction.shares) {
        totalShares += Number(transaction.shares);
      } else if (transaction.operation === 'sell' && transaction.shares) {
        totalShares -= Number(transaction.shares);
      }
    });
    
    return totalShares.toFixed(5);
  };

  // Helper function to calculate total value from transactions
  const calculateTotalValue = (transactions) => {
    if (!transactions || transactions.length === 0) return '$0.00';
    
    let totalValue = 0;
    
    transactions.forEach(transaction => {
      if (transaction.operation === 'buy' && transaction.shares) {
        totalValue += Number(transaction.shares) * Number(transaction.pricePerUnit);
      } else if (transaction.operation === 'sell' && transaction.shares) {
        totalValue -= Number(transaction.shares) * Number(transaction.pricePerUnit);
      }
    });
    
    return `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDeleteAsset = async () => {
    if (deleteModal.assetId) {
      try {
        await deleteInvestment(deleteModal.assetId);
        setAssets(assets.filter(asset => asset.id !== deleteModal.assetId));
        setDeleteModal({ isOpen: false, assetId: null });
      } catch (err) {
        console.error('Failed to delete investment:', err);
        // You might want to show an error message to the user here
      }
    }
  };
  
  const handleEditAsset = (updatedAsset) => {
    // Update the asset in the local state
    setAssets(assets.map(asset => 
      asset.id === editModal.assetId 
        ? { 
            ...asset, 
            type: updatedAsset.category,
            name: updatedAsset.description,
            symbol: updatedAsset.symbol || 'N/A'
          } 
        : asset
    ));
    
    // Close the modal
    setEditModal({ isOpen: false, assetId: null });
    
    // Refresh the investments to get the latest data
    fetchInvestments();
  };
  
  const handleAddTransaction = () => {
    // Refresh the investments to get the latest data
    fetchInvestments();
    
    // Close the modal
    setAddTransactionModal({ isOpen: false, assetId: null, assetName: '', assetType: '' });
  };

  const renderChangeIndicator = (changePercent) => {
    const cleanPercentage = changePercent.replace(/^[+-]/, '');
    const value = parseFloat(changePercent);
    const isPositive = value > 0;
    const isNegative = value < 0;
    
    return (
      <div className={`rounded-lg px-3 py-1 text-sm font-medium inline-flex items-center gap-1
        ${isPositive ? 'bg-success/20 text-success' : ''}
        ${isNegative ? 'bg-error/20 text-error' : ''}
        ${!isPositive && !isNegative ? 'bg-base-200 text-base-content' : ''}
      `}>
        {isPositive && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
          </svg>
        )}
        {isNegative && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
          </svg>
        )}
        {cleanPercentage}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No investments found. Add your first investment to get started.</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Assets List */}
      <div className="divide-y divide-base-content/10">
        {assets.map((asset) => (
          <div key={asset.id} className="hover:bg-base-200/50 transition-colors">
            <div className="px-2 py-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{asset.name}</h3>
                      <p className="text-sm opacity-70">{asset.shares}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right flex flex-col items-end">
                        <p className="font-bold">{asset.value}</p>
                        {renderChangeIndicator(asset.changePercent)}
                      </div>
                      {/* Popover */}
                      <div className="dropdown dropdown-end">
                        <label 
                          tabIndex={0} 
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            className="w-5 h-5"
                          >
                            <path d="M12 8.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM12 20.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                          </svg>
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
                          <li>
                            <a 
                              onClick={() => setEditModal({ 
                                isOpen: true, 
                                assetId: asset.id 
                              })}
                            >
                              Edit Investment
                            </a>
                          </li>
                          <li>
                            <a 
                              onClick={() => setAddTransactionModal({ 
                                isOpen: true, 
                                assetId: asset.id,
                                assetName: asset.name,
                                assetType: asset.type
                              })}
                            >
                              Add Transaction
                            </a>
                          </li>
                          <li>
                            <a 
                              onClick={() => setTransactionHistoryModal({ 
                                isOpen: true, 
                                assetId: asset.id,
                                assetName: asset.name,
                                assetType: asset.type
                              })}
                            >
                              Transaction History
                            </a>
                          </li>
                          <li>
                            <a 
                              className="text-error"
                              onClick={() => setDeleteModal({ isOpen: true, assetId: asset.id })}
                            >
                              Remove Asset
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteAssetModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, assetId: null })}
        onConfirm={handleDeleteAsset}
        assetSymbol={assets.find(a => a.id === deleteModal.assetId)?.symbol}
      />
      
      {/* Edit Asset Modal */}
      <EditAssetModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, assetId: null })}
        onSave={handleEditAsset}
        investmentId={editModal.assetId}
      />
      
      {/* Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={transactionHistoryModal.isOpen}
        onClose={() => setTransactionHistoryModal({ isOpen: false, assetId: null, assetName: '', assetType: '' })}
        investmentId={transactionHistoryModal.assetId}
        investmentName={transactionHistoryModal.assetName}
        investmentType={transactionHistoryModal.assetType}
      />
      
      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={addTransactionModal.isOpen}
        onClose={() => setAddTransactionModal({ isOpen: false, assetId: null, assetName: '', assetType: '' })}
        onSave={handleAddTransaction}
        investmentId={addTransactionModal.assetId}
        investmentName={addTransactionModal.assetName}
        investmentType={addTransactionModal.assetType}
      />
    </div>
  );
} 