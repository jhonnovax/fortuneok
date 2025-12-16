'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { formatDateToString, formatFullCurrency, formatNumber, formatPercentage, maskValue } from '@/services/intlService';
import ErrorLoadingData from './ErrorLoadingData';
import EmptyState from './EmptyState';
import { getAssetCategoryGroupIcon, getAssetPercentage } from '@/services/assetService';
import { getChartColors } from '@/services/chartService';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import currencies from '@/public/currencies.json';
import Flag from './Flag';
import dynamic from 'next/dynamic';

// Dynamic imports for heavy components
const CurrencyBadge = dynamic(() => import('./CurrencyBadge'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-base-200 h-6 w-12 rounded"></div>
});

const DeleteAssetModal = dynamic(() => import('./DeleteAssetModal'), {
  ssr: false,
});

const TRADING_CATEGORIES = [
  'stocks', 
  'bonds', 
  'cryptocurrencies', 
  'etf_funds', 
  'option', 
  'futures'
];


function AssetsList({ isLoading, error, assetData, baseCurrency, selectedCategory, totalAssetsValue, showMoreActions, showViewDetails, showValues, onEditAsset, onDeleteAsset, onViewDetails, onAddAsset }) {

  const moreActionsDropdownRef = useRef(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, assetId: null });
  const [openMoreActionsDropdown, setOpenMoreActionsDropdown] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const menuItemRefs = useRef({});
  const theme = useSystemTheme();

  const chartColors = getChartColors(theme);
  let assetListUI = null;

  function handleClickOutside(e) {
    // TODO: Fix this creating an isolated popover component
    /* if (moreActionsDropdownRef.current && !moreActionsDropdownRef.current.contains(e.target)) { */
    if (!e.target.closest('.dropdown')) {
      setOpenMoreActionsDropdown(null);
      setHighlightedIndex(-1);
    }
  }

  function handleKeyDown(e, assetId) {
    // Only handle keys when dropdown is open
    if (openMoreActionsDropdown !== assetId) {
      // Allow Tab to work normally when dropdown is closed
      if (e.key === 'Tab') return;
      return;
    }

    const menuItems = ['edit', 'delete'];
    const currentIndex = highlightedIndex;

    switch (e.key) {
      case 'Escape': {
        e.preventDefault();
        setOpenMoreActionsDropdown(null);
        setHighlightedIndex(-1);
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        setHighlightedIndex(nextIndex);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        setHighlightedIndex(prevIndex);
        break;
      }
      case 'Enter': {
        if (currentIndex >= 0 && currentIndex < menuItems.length) {
          e.preventDefault();
          const asset = assetData.find(a => a.id === assetId);
          if (asset) {
            if (menuItems[currentIndex] === 'edit') {
              handleEditAsset(asset);
            } else if (menuItems[currentIndex] === 'delete') {
              handleDeleteAsset({ isOpen: true, assetId: asset.id });
            }
          }
        }
        break;
      }
      default:
        break;
    }
  }

  // Reset highlighted index when dropdown opens/closes
  useEffect(() => {
    if (openMoreActionsDropdown) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [openMoreActionsDropdown]);

  function handleEditAsset(asset) {
    setOpenMoreActionsDropdown(null);
    onEditAsset(asset);
  }

  function handleDeleteAsset({ isOpen, assetId }) {
    setOpenMoreActionsDropdown(null);
    setDeleteModal({ isOpen, assetId });
  }

  useEffect(() => {    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (openMoreActionsDropdown && highlightedIndex >= 0) {
      const refKey = `${openMoreActionsDropdown}-${highlightedIndex}`;
      const menuItem = menuItemRefs.current[refKey];
      if (menuItem) {
        menuItem.focus();
      }
    }
  }, [highlightedIndex, openMoreActionsDropdown]);

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
    assetListUI = (
      <div className="p-4 lg:p-6">
        <EmptyState
          title="No Assets Yet"
          description="Start building your portfolio by adding your first asset. Track stocks, bonds, cryptocurrencies, and more to get a complete view of your wealth."
          onAction={onAddAsset}
          actionLabel="Add our first asset"
          variant="default"
        />
      </div>
    );
  }
  else {
    assetListUI = (
      <>
        {/* Assets List */}
        {assetData.map((asset, assetIndex) => (
          <div 
            key={asset.id} 
            style={{ 
              animationDelay: `${assetIndex * 50}ms`,
              animationFillMode: 'both'
            }}
          >
            <div className="p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg hover:scale-[1.01]">
              {/* Asset Details */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm">
                        {selectedCategory === 'all' && getAssetCategoryGroupIcon(asset.category)} {asset.description}
                      </h3>

                      {TRADING_CATEGORIES.includes(asset.category) && (
                        <p className="text-sm text-body">
                          {asset.brokerName}
                        </p>
                      )}

                      <div className="text-sm flex items-center gap-1">
                        <Flag countryCode={currencies.find(currency => currency.code === baseCurrency)?.flag} size="sm" /> 
                        {baseCurrency}

                        <span className="ml-0">
                          {showValues ? formatFullCurrency(asset.valuationInPreferredCurrency || 0) : maskValue(asset.valuationInPreferredCurrency || 0)}
                        </span>

                        {asset.currencies.length > 1 && (
                          <div className='flex flex-col gap-1'>
                            {asset.currencies.map((currencyData, currencyIndex) => (
                              <div key={currencyIndex} className="tooltip tooltip-neutral" data-tip={`${formatPercentage(currencyData.valuationInPreferredCurrency / asset.valuationInPreferredCurrency * 100, 2)} of ${asset.description} is in ${currencyData.currency}`}>
                                <CurrencyBadge 
                                  currencyCode={currencyData.currency} 
                                  percentage={formatPercentage(currencyData.valuationInPreferredCurrency / asset.valuationInPreferredCurrency * 100, 2)} 
                                />
                              </div>
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
                        <div 
                          ref={(ref) => moreActionsDropdownRef.current = openMoreActionsDropdown === asset.id ? ref : null} 
                          className="dropdown dropdown-end"
                          onKeyDown={(e) => handleKeyDown(e, asset.id)}
                        >
                          <button 
                            type="button"
                            className="btn btn-tertiary btn-sm btn-circle focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus:ring-2 focus:ring-black focus:ring-offset-2"
                            title="More actions"
                            onClick={() => setOpenMoreActionsDropdown(openMoreActionsDropdown === asset.id ? null : asset.id)}
                            aria-expanded={openMoreActionsDropdown === asset.id}
                            aria-haspopup="true"
                            tabIndex={0}
                          >
                            <svg width="18" height="18" strokeLinejoin="round" viewBox="0 0 16 16">
                              <path fillRule="evenodd" clipRule="evenodd" d="M4 8C4 8.82843 3.32843 9.5 2.5 9.5C1.67157 9.5 1 8.82843 1 8C1 7.17157 1.67157 6.5 2.5 6.5C3.32843 6.5 4 7.17157 4 8ZM9.5 8C9.5 8.82843 8.82843 9.5 8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8ZM13.5 9.5C14.3284 9.5 15 8.82843 15 8C15 7.17157 14.3284 6.5 13.5 6.5C12.6716 6.5 12 7.17157 12 8C12 8.82843 12.6716 9.5 13.5 9.5Z" fill="currentColor" />
                            </svg>
                          </button>
                          <ul 
                            className={`absolute right-0 z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 ${openMoreActionsDropdown === asset.id ? 'block' : 'hidden'}`}
                            role="menu"
                          >
                            <li role="menuitem">
                              <button 
                                type="button" 
                                onClick={() => handleEditAsset(asset)}
                                className={openMoreActionsDropdown === asset.id && highlightedIndex === 0 ? 'bg-base-200' : ''}
                                ref={(ref) => {
                                  if (openMoreActionsDropdown === asset.id) {
                                    menuItemRefs.current[`${asset.id}-0`] = ref;
                                  }
                                }}
                                onMouseEnter={() => setHighlightedIndex(0)}
                              >
                                Edit Asset
                              </button>
                            </li>
                            <li role="menuitem">
                              <button 
                                type="button"
                                className={`hover:bg-error/20 duration-200 ${openMoreActionsDropdown === asset.id && highlightedIndex === 1 ? 'bg-error/20' : ''}`}
                                onClick={() => handleDeleteAsset({ isOpen: true, assetId: asset.id })}
                                ref={(ref) => {
                                  if (openMoreActionsDropdown === asset.id) {
                                    menuItemRefs.current[`${asset.id}-1`] = ref;
                                  }
                                }}
                                onMouseEnter={() => setHighlightedIndex(1)}
                              >
                                Remove Asset
                              </button>
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
                <div className="flex items-center gap-2 text-xs font-bold tooltip tooltip-neutral tooltip-left" data-tip={`${asset.description} represent ${formatPercentage(getAssetPercentage(asset, totalAssetsValue), 2)} of your portfolio`} style={{ color: chartColors[assetIndex % chartColors.length] }}>
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

export default memo(AssetsList); 