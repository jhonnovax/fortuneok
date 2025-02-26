'use client';

import { useState } from 'react';
import DeleteAssetModal from './DeleteAssetModal';

export default function AssetsList() {
  const [assets, setAssets] = useState([
    { id: 1, type: 'ETF', symbol: 'VOO', name: 'Vanguard S&P 500', shares: '71.44774', value: '$546.10', change: '-$3.11', changePercent: '-0.57%', checked: false },
    { id: 2, type: 'ETF', symbol: 'VUG', name: 'Vanguard Growth', shares: '24.22141', value: '$407.23', change: '-$4.56', changePercent: '-1.11%', checked: false },
    { id: 3, type: 'Stock', symbol: 'AAPL', name: 'Apple Inc.', shares: '15.5', value: '$2,945.50', change: '+$12.30', changePercent: '+0.42%', checked: false },
    { id: 4, type: 'Stock', symbol: 'MSFT', name: 'Microsoft', shares: '8.2', value: '$3,116.80', change: '+$15.40', changePercent: '+0.50%', checked: false },
    { id: 5, type: 'Crypto', symbol: 'BTC', name: 'Bitcoin', shares: '0.12', value: '$4,800.00', change: '-$120.00', changePercent: '-2.50%', checked: false },
    { id: 6, type: 'Crypto', symbol: 'ETH', name: 'Ethereum', shares: '2.5', value: '$5,125.00', change: '-$75.00', changePercent: '-1.46%', checked: false },
    { id: 7, type: 'Fund', symbol: 'FXAIX', name: 'Fidelity 500', shares: '42.3', value: '$6,345.00', change: '-$31.25', changePercent: '-0.49%', checked: false },
    { id: 8, type: 'Real Estate', symbol: 'HOME1', name: 'Rental Property', shares: '1', value: '$250,000.00', change: '$0.00', changePercent: '0.00%', checked: false },
    { id: 9, type: 'Cash', symbol: 'USD', name: 'US Dollar', shares: '-', value: '$15,325.00', change: '$0.00', changePercent: '0.00%', checked: false },
    { id: 10, type: 'Stock', symbol: 'TSLA', name: 'Tesla Inc.', shares: '12.5', value: '$2,437.50', change: '+$45.75', changePercent: '+1.91%', checked: false },
    { id: 11, type: 'ETF', symbol: 'VXUS', name: 'Vanguard Total International', shares: '95.33', value: '$5,243.15', change: '-$12.45', changePercent: '-0.24%', checked: false },
    { id: 12, type: 'Crypto', symbol: 'SOL', name: 'Solana', shares: '45.8', value: '$4,672.54', change: '+$234.12', changePercent: '+5.27%', checked: false },
    { id: 13, type: 'Real Estate', symbol: 'HOME2', name: 'Commercial Property', shares: '1', value: '$475,000.00', change: '+$5,000.00', changePercent: '+1.06%', checked: false },
    { id: 14, type: 'Fund', symbol: 'PRGFX', name: 'T. Rowe Price Growth', shares: '156.22', value: '$8,592.10', change: '+$43.21', changePercent: '+0.51%', checked: false },
    { id: 15, type: 'Stock', symbol: 'NVDA', name: 'NVIDIA Corporation', shares: '18.3', value: '$9,168.45', change: '+$312.45', changePercent: '+3.53%', checked: false },
  ]);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    assetId: null
  });

  const toggleAll = (checked) => {
    setAssets(assets.map(asset => ({ ...asset, checked })));
  };

  const toggleAsset = (id) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, checked: !asset.checked } : asset
    ));
  };

  const handleDeleteAsset = () => {
    if (deleteModal.assetId) {
      setAssets(assets.filter(asset => asset.id !== deleteModal.assetId));
    }
  };

  const allChecked = assets.every(asset => asset.checked);
  const selectedCount = assets.filter(asset => asset.checked).length;

  return (
    <div className="space-y-4">
      {/* Sticky Select All Toggle */}
      <div className="sticky top-0 bg-base-100 py-2 -mt-4 -mx-4 px-6 border-b border-base-content/10 z-10">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            checked={allChecked}
            ref={input => {
              if (input) {
                input.indeterminate = selectedCount > 0 && !allChecked;
              }
            }}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <span className="text-sm font-medium">
            {allChecked 
              ? 'Select All' 
              : selectedCount === 0 
                ? 'None Selected'
                : `${selectedCount} selected`}
          </span>
        </label>
      </div>

      {/* Assets List */}
      <div className="space-y-2 pt-2">
        {assets.map((asset) => (
          <div key={asset.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={asset.checked}
                  onChange={() => toggleAsset(asset.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{asset.symbol}</h3>
                      <p className="text-sm opacity-70">{asset.shares}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{asset.value}</p>
                        <p className={`text-sm ${
                          asset.change.startsWith('+') ? 'text-success' : 
                          asset.change.startsWith('-') ? 'text-error' : ''
                        }`}>
                          {asset.change} ({asset.changePercent})
                        </p>
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
                          <li><a>View Details</a></li>
                          <li><a>Edit Asset</a></li>
                          <li><a>Transaction History</a></li>
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
    </div>
  );
} 