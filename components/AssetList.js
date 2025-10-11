'use client';

import { useState } from 'react';
import { formatDateToString, formatFullCurrency, formatNumber, formatPercentage, maskValue } from '@/services/intlService';
import ErrorLoadingData from './ErrorLoadingData';
import { getAssetCategoryGroupIcon, getAssetPercentage } from '@/services/assetService';
import { getChartColors } from '@/services/chartService';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import currencies from '@/public/currencies.json';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const CurrencyBadge = dynamic(() => import('./CurrencyBadge'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-base-200 h-6 w-12 rounded"></div>
});

const DeleteAssetModal = dynamic(() => import('./DeleteAssetModal'), {
  ssr: false,
});


export default function AssetsList({ isLoading, error, assetData, baseCurrency, selectedCategory, totalAssetsValue, showMoreActions, showViewDetails, showValues, onEditAsset, onDeleteAsset, onViewDetails }) {

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, assetId: null });
  const [openMoreActionsDropdown, setOpenMoreActionsDropdown] = useState(false);
  const theme = useSystemTheme();

  const chartColors = getChartColors(theme);
  let assetListUI = null;

  if (isLoading) {
    assetListUI = (
      <div className="flex w-full flex-col gap-4">
        {[...Array(3)].map((item, index) => (
          <div key={index} className="flex flex-col gap-4 p-4 lg:p-6">
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-29"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  else if (error) {
    assetListUI = <ErrorLoadingData error={error} />;
  }
  else if (assetData.length === 0) {
    assetListUI = (<p className="text-lg text-center text-gray-500">No assets found. Add your first asset to get started.</p>);
  }
  else {
    assetListUI = (
      <>
        {/* Assets List */}
        {assetData.map((asset, assetIndex) => (
          <div key={asset.id} className="transition-colors">
            <div className="p-4 lg:p-6 shadow-sm">
              {/* Asset Details */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm">
                        {selectedCategory === 'all' && getAssetCategoryGroupIcon(asset.category)} {asset.description}
                      </h3>

                      <div className="text-sm">
                        {currencies.find(currency => currency.code === baseCurrency)?.flag} 
                        {baseCurrency}

                        <span className="ml-1">
                          {showValues ? formatFullCurrency(asset.valuationInPreferredCurrency || 0) : maskValue(asset.valuationInPreferredCurrency || 0)}
                        </span>

                        {asset.currencies.length > 0 && (
                          <div className='block'>
                            {asset.currencies.map((currencyData, currencyIndex) => (
                              <CurrencyBadge 
                                key={currencyIndex}
                                currencyCode={currencyData.currency} 
                                percentage={formatPercentage(currencyData.valuationInPreferredCurrency / asset.valuationInPreferredCurrency * 100, 2)} 
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Asset Shares */}
                      {asset.shares && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="mr-1">{asset.symbol}</span>
                          <span className='text-xs'>x</span>
                          <span className='text-xs'> {formatNumber(asset.shares, 4)}</span>
                        </p>
                      )}

                      {/* Asset Date */}
                      {asset.date && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 24 24" fill="none">
                            <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Since {formatDateToString(asset.date)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-shrink-0 items-center">
                      { /* Show view details */}
                      {showViewDetails && (
                        <button className="btn btn-sm" onClick={() => onViewDetails(asset)}>
                          Assets
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-4 h-4">
                            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                          </svg>
                        </button>
                      )}

                      {/* Show more actions */}
                      {showMoreActions && (
                        <div className="dropdown dropdown-end">
                          <button 
                            className="btn btn-tertiary btn-sm btn-circle"
                            title="More actions"
                            onClick={() => setOpenMoreActionsDropdown(!openMoreActionsDropdown)}
                          >
                            <svg width="18" height="18" strokeLinejoin="round" viewBox="0 0 16 16">
                              <path fillRule="evenodd" clipRule="evenodd" d="M4 8C4 8.82843 3.32843 9.5 2.5 9.5C1.67157 9.5 1 8.82843 1 8C1 7.17157 1.67157 6.5 2.5 6.5C3.32843 6.5 4 7.17157 4 8ZM9.5 8C9.5 8.82843 8.82843 9.5 8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8ZM13.5 9.5C14.3284 9.5 15 8.82843 15 8C15 7.17157 14.3284 6.5 13.5 6.5C12.6716 6.5 12 7.17157 12 8C12 8.82843 12.6716 9.5 13.5 9.5Z" fill="currentColor" />
                            </svg>
                          </button>
                          <ul className={`dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-40 ${openMoreActionsDropdown ? 'block' : 'hidden'}`}>
                            <li>
                              <a onClick={() => onEditAsset(asset)}>
                                Edit Asset
                              </a>
                            </li>
                            <li>
                              <a 
                                className="text-error hover:bg-error/20 hover:text-error duration-200"
                                onClick={() => setDeleteModal({ isOpen: true, assetId: asset.id })}
                              >
                                Remove Asset
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 pt-2">  
                {/* Progress Bar */}
                <progress 
                  className="progress w-100 custom-progress"
                  value={getAssetPercentage(asset, totalAssetsValue)} 
                  max="100"
                  style={{ "--progress‐fill": chartColors[assetIndex % chartColors.length] }}
                >
                </progress>
                {/* Asset Percentage */}
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: chartColors[assetIndex % chartColors.length] }}>
                  {formatPercentage(getAssetPercentage(asset, totalAssetsValue), 2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="">

      {/* Asset List */}
      {assetListUI}

      {/* Delete Confirmation Modal */}
      <DeleteAssetModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, assetId: null })}
        onConfirm={() => onDeleteAsset(deleteModal.assetId)}
        assetSymbol={assetData.find(a => a.id === deleteModal.assetId)?.symbol}
      />
  
    </div>
  );

} 