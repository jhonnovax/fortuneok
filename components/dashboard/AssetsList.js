'use client';

import { useState } from 'react';
import DeleteAssetModal from './DeleteAssetModal';
import { formatCurrency } from '@/services/formatService';
export default function AssetsList({ loading, error, investmentData, onEditAsset, onDeleteAsset }) {

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, assetId: null });

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