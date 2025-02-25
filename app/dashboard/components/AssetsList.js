'use client';

import { useState } from 'react';

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
  ]);

  const toggleAll = (checked) => {
    setAssets(assets.map(asset => ({ ...asset, checked })));
  };

  const toggleAsset = (id) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, checked: !asset.checked } : asset
    ));
  };

  const allChecked = assets.every(asset => asset.checked);
  const selectedCount = assets.filter(asset => asset.checked).length;

  return (
    <div className="space-y-4">
      {/* Select All Toggle */}
      <div className="flex items-center justify-between px-2">
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
      <div className="space-y-2">
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
                    <div className="text-right">
                      <p className="font-bold">{asset.value}</p>
                      <p className={`text-sm ${
                        asset.change.startsWith('+') ? 'text-success' : 
                        asset.change.startsWith('-') ? 'text-error' : ''
                      }`}>
                        {asset.change} ({asset.changePercent})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 