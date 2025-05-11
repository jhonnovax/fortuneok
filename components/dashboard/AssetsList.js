'use client';

import { useState } from 'react';
import DeleteAssetModal from './DeleteAssetModal';
import { formatCurrency } from '@/services/formatService';
import ErrorLoadingData from './ErrorLoadingData';
import LoadingSpinner from './LoadingSpinner';

export default function AssetsList({ loading, error, investmentData, onEditAsset, onDeleteAsset }) {

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, assetId: null });

  if (loading) {
    return <LoadingSpinner loadingText="Loading assets..." />;
  }

  if (error) {
    return <ErrorLoadingData error={error} />;
  }

  if (investmentData.length === 0) {
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
        {investmentData.map((asset) => (
          <div key={asset.id} className="hover:bg-base-200/50 transition-colors">
            <div className="px-2 py-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{asset.description}</h3>
                      <p className="text-sm opacity-70">{asset.shares}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right flex flex-col items-end">
                        <p className="font-bold">{formatCurrency(asset.purchaseInformation?.purchasePrice || 0)}</p>
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
                            <a onClick={() => onEditAsset(asset)}>
                              Edit Investment
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
        onConfirm={() => onDeleteAsset(deleteModal.assetId)}
        assetSymbol={investmentData.find(a => a.id === deleteModal.assetId)?.symbol}
      />
  
    </div>
  );
} 