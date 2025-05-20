'use client';

import { useState } from 'react';
import DeleteAssetModal from './DeleteAssetModal';
import { formatDateToString, formatFullCurrency, formatNumber, formatPercentage } from '@/services/intlService';
import ErrorLoadingData from './ErrorLoadingData';
import LoadingSpinner from './LoadingSpinner';
import { getAssetPercentage } from '@/services/assetService';
import { getChartColors } from '@/services/chartService';
import { useSystemTheme } from '@/hooks/useSystemTheme';

export default function AssetsList({ isLoading, error, assetData, totalAssetsValue, showMoreActions, onEditAsset, onDeleteAsset }) {

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, assetId: null });
  const theme = useSystemTheme();

  const chartColors = getChartColors(theme);

  if (isLoading) {
    return <LoadingSpinner className="py-8" loadingText="Loading assets..." />;
  }

  if (error) {
    return <ErrorLoadingData error={error} />;
  }

  if (assetData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No assets found. Add your first asset to get started.</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* Assets List */}
      {assetData.map((asset, assetIndex) => (
        <div key={asset.id} className="hover:bg-base-200/50 transition-colors">
          <div className="px-2 py-4 pr-1">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{asset.description}</h3>
                    {asset.date && (
                      <div className="flex items-center gap-1 text-xs opacity-80">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" viewBox="0 0 24 24" fill="none">
                        <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                        {formatDateToString(asset.date)}
                      </div>
                    )}
                    <p className="text-sm opacity-85">{formatFullCurrency(asset.valuationInPreferredCurrency || 0)}</p>
                    {asset.shares && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="mr-1">{asset.symbol}</span>
                        <span className="badge-sm badge-ghost">
                          <span className='text-xs font-bold'>x</span>{formatNumber(asset.shares, 4)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Asset Percentage */}
                    <span className="text-xs opacity-85 font-bold">
                      {formatPercentage(getAssetPercentage(asset, totalAssetsValue), 2)}
                    </span>

                    {/* Popover */}
                    {showMoreActions && (
                      <div className="dropdown dropdown-end">
                        <label 
                          tabIndex={0} 
                          className="btn btn-ghost btn-sm btn-circle"
                          title="More actions"
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
                          <a onClick={() => onEditAsset(asset)}>
                            Edit Asset
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <progress 
            className="progress w-100 custom-progress"
            value={getAssetPercentage(asset, totalAssetsValue)} 
            max="100"
            style={{ "--progress‐fill": chartColors[assetIndex % chartColors.length] }}
          >
          </progress>
        </div>
      ))}

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