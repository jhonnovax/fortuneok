'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import apiClient from '@/libs/api';
import HeaderDashboard from '@/components/HeaderDashboard';
import { ASSET_CATEGORIES } from '@/services/assetService';

export default function UsersPage() {
  const { status } = useSession();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('lastAccessAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUserAssets, setSelectedUserAssets] = useState(null);
  const [isAssetsModalOpen, setIsAssetsModalOpen] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isAssetsModalOpen) {
        setIsAssetsModalOpen(false);
        setSelectedUserAssets(null);
      }
    };

    if (isAssetsModalOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isAssetsModalOpen]);

  // Note: Authentication check is handled server-side in layout.js to prevent flash

  // Get category label from value
  const getCategoryLabel = (categoryValue) => {
    const category = ASSET_CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Handle viewing user assets
  const handleViewAssets = async (user) => {
    setIsAssetsModalOpen(true);
    setIsLoadingAssets(true);
    setSelectedUserAssets(null);
    
    try {
      const response = await apiClient.get(`/users/${user.id}/assets`);
      setSelectedUserAssets({
        ...response,
        userName: user.name || user.email || 'Unknown User'
      });
    } catch (err) {
      console.error('Failed to fetch user assets:', err);
      setError(err.message || 'Failed to load assets');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Fetch users
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        });

        if (search) {
          params.append('search', search);
        }
        
        params.append('sortField', sortField);
        params.append('sortDirection', sortDirection);

        const response = await apiClient.get(`/users?${params.toString()}`);
        setUsers(response.users || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page, search, sortField, sortDirection, status]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [search, sortField, sortDirection]);

  // Handle column header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Map display column names to database field names
  const getSortField = (displayName) => {
    const fieldMap = {
      'ID': '_id',
      'Name': 'name',
      'Email': 'email',
      'Email Verified': 'emailVerified',
      'Has Access': 'hasAccess',
      'Customer ID': 'customerId',
      'Assets': 'totalAssets',
      'Created At': 'createdAt',
      'Last Access At': 'lastAccessAt',
    };
    return fieldMap[displayName] || displayName;
  };

  // Sort icon component
  const SortIcon = ({ field }) => {
    const dbField = getSortField(field);
    if (sortField !== dbField) {
      return (
        <svg className="w-4 h-4 ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const time = date.toLocaleTimeString();
      return `${day}/${month}/${year} ${time}`;
    } catch {
      return 'N/A';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <HeaderDashboard />
      
      <div className="flex pt-16 min-h-screen">
        <main className="flex-1 w-full p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
          <div className="card bg-base-100 shadow-xl w-full">
            <div className="card-body p-3 sm:p-4 md:p-6 overflow-visible">
              <h1 className="card-title text-xl sm:text-2xl mb-4">Users</h1>

              {/* Filters Section */}
              <div className="mb-4 sm:mb-6">
                {/* Search Input */}
                <div className="form-control w-full">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-xs sm:text-sm">Search</span>
                  </label>
                  <input
                    type="search"
                    placeholder="Search by ID, name, email, or customerId"
                    className="input input-bordered w-full input-sm sm:input-md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-base-content/70">
                  Showing {users.length} of {total} users
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              {/* Users Table */}
              {!isLoading && !error && (
                <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                  <table className="table table-zebra w-full min-w-[800px]">
                    <thead>
                      <tr>
                        <th 
                          className="hidden lg:table-cell cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('_id')}
                        >
                          <div className="flex items-center">
                            ID
                            <SortIcon field="ID" />
                          </div>
                        </th>
                        <th 
                          className="hidden lg:table-cell cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Name
                            <SortIcon field="Name" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center">
                            Email
                            <SortIcon field="Email" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('hasAccess')}
                        >
                          <div className="flex items-center">
                          Customer ID
                            <SortIcon field="Customer ID" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('totalAssets')}
                        >
                          <div className="flex items-center">
                            Assets
                            <SortIcon field="Assets" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center">
                            Created At
                            <SortIcon field="Created At" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('lastAccessAt')}
                        >
                          <div className="flex items-center">
                            Last Access At
                            <SortIcon field="Last Access At" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center py-8">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="hidden lg:table-cell font-mono text-xs">{user.id}</td>
                            <td className="hidden lg:table-cell">{user.name || '-'}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                {user.providers && user.providers.length > 0 ? (
                                  user.providers.map((provider, index) => (
                                    <span key={index}>
                                      {provider === 'google' && (
                                        <svg title="Google" className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                        </svg>
                                      )}
                                      {provider === 'email' && (
                                        <svg title="Email" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                      )}
                                    </span>
                                  ))
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                )}
                                <span> {user.email || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="font-mono text-xs cursor-default" title={user.hasAccess ? 'Premium User' : 'Free User'}>
                              {user.hasAccess ? '✅' : '❌'} {user.customerId || ''}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleViewAssets(user)}
                                disabled={!user.assetStats || user.assetStats.totalAssets === 0}
                              >
                                <span className="hidden xl:inline text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                  {user.assetStats ? (
                                    `${user.assetStats.totalCategories} categories, ${user.assetStats.totalAssets} assets`
                                  ) : (
                                    '0 categories, 0 assets'
                                  )}
                                </span>
                                <span className="xl:hidden text-sm">Assets</span>
                              </button>
                            </td>
                            <td className="text-sm">{user.createdAt ? formatDate(user.createdAt) : '-'}</td>
                            <td
                              className={`text-sm ${
                                user.lastAccessAt &&
                                user.createdAt &&
                                new Date(user.lastAccessAt).toISOString().slice(0, 10) !==
                                  new Date(user.createdAt).toISOString().slice(0, 10)
                                  ? 'text-green-600 font-bold'
                                  : ''
                              }`}
                            >
                              {user.lastAccessAt ? formatDate(user.lastAccessAt) : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && totalPages > 1 && (() => {
                // Generate page numbers to display with ellipsis logic
                const getPageNumbers = () => {
                  const pages = [];
                  const showFirst = 2; // Always show first N pages
                  const showLast = 2; // Always show last N pages
                  const showAround = 1; // Show N pages around current page
                  
                  // If total pages is small, show all
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                    return pages;
                  }
                  
                  const pageSet = new Set();
                  
                  // Add first pages
                  for (let i = 1; i <= showFirst; i++) {
                    pageSet.add(i);
                  }
                  
                  // Add pages around current page
                  for (let i = Math.max(1, page - showAround); i <= Math.min(totalPages, page + showAround); i++) {
                    pageSet.add(i);
                  }
                  
                  // Add last pages
                  for (let i = totalPages - showLast + 1; i <= totalPages; i++) {
                    pageSet.add(i);
                  }
                  
                  // Convert to sorted array
                  const sortedPages = Array.from(pageSet).sort((a, b) => a - b);
                  
                  // Build final array with ellipsis
                  const result = [];
                  for (let i = 0; i < sortedPages.length; i++) {
                    const current = sortedPages[i];
                    const next = sortedPages[i + 1];
                    
                    result.push(current);
                    
                    // Add ellipsis if there's a gap
                    if (next && next - current > 1) {
                      result.push('ellipsis');
                    }
                  }
                  
                  return result;
                };
                
                const pageNumbers = getPageNumbers();
                
                return (
                  <div className="flex justify-center mt-4 sm:mt-6">
                    <div className="join">
                      {/* First Page Button */}
                      <button
                        className="join-item btn btn-xs sm:btn-sm md:btn-md"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        aria-label="Go to first page"
                      >
                        First
                      </button>
                      
                      {/* Previous Page Button */}
                      <button
                        className="join-item btn btn-xs sm:btn-sm md:btn-md"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        aria-label="Go to previous page"
                      >
                        Prev
                      </button>
                      
                      {/* Page Number Buttons */}
                      {pageNumbers.map((pageNum, index) => {
                        if (pageNum === 'ellipsis') {
                          return (
                            <button
                              key={`ellipsis-${index}`}
                              className="join-item btn btn-xs sm:btn-sm md:btn-md btn-disabled"
                              disabled
                            >
                              ...
                            </button>
                          );
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            className={`join-item btn btn-xs sm:btn-sm md:btn-md ${
                              page === pageNum ? 'btn-active' : ''
                            }`}
                            onClick={() => setPage(pageNum)}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={page === pageNum ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      {/* Next Page Button */}
                      <button
                        className="join-item btn btn-xs sm:btn-sm md:btn-md"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        aria-label="Go to next page"
                      >
                        Next
                      </button>
                      
                      {/* Last Page Button */}
                      <button
                        className="join-item btn btn-xs sm:btn-sm md:btn-md"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        aria-label="Go to last page"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </main>
      </div>

      {/* Assets Modal */}
      {isAssetsModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] p-0 flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-base-300">
              <h3 className="font-bold text-lg">
                Assets for {selectedUserAssets?.userName || 'User'}
              </h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setIsAssetsModalOpen(false);
                  setSelectedUserAssets(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingAssets ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : selectedUserAssets ? (
                <div className="space-y-6">
                  <div className="stats border shadow-md">
                    <div className="stat">
                      <div className="stat-title text-base-content">Total Categories</div>
                      <div className="stat-value text-green-600">{selectedUserAssets.totalCategories}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title text-base-content">Total Assets</div>
                      <div className="stat-value text-green-600">{selectedUserAssets.totalAssets}</div>
                    </div>
                  </div>

                  {selectedUserAssets.categories && selectedUserAssets.categories.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUserAssets.categories.map((categoryData) => (
                        <div key={categoryData.category} className="card bg-base-200 shadow">
                          <div className="card-body p-4">
                            <h4 className="card-title text-base mb-0">
                              {getCategoryLabel(categoryData.category)} ({categoryData.count} {categoryData.count === 1 ? 'asset' : 'assets'})
                            </h4>
                            <div className="space-y-3">
                              {categoryData.assets.map((asset) => {
                                // Format date without time
                                const formatDateOnly = (dateString) => {
                                  if (!dateString) return null;
                                  try {
                                    const date = new Date(dateString);
                                    const day = date.getDate();
                                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    const month = monthNames[date.getMonth()];
                                    const year = date.getFullYear();
                                    return `${day}/${month}/${year}`;
                                  } catch {
                                    return null;
                                  }
                                };

                                const dateOnly = formatDateOnly(asset.date);
                                const valuation = asset.currentValuation?.amount 
                                  ? `${asset.currentValuation.currency} ${asset.currentValuation.amount.toLocaleString()}`
                                  : null;
                                
                                return (
                                  <div key={asset.id} className="flex items-start gap-3 py-2 border-b border-base-300 last:border-b-0">
                                    <div className="flex-1">
                                      {/* First line: Asset Description - larger, darker, title case */}
                                      <div className="text-base font-medium text-base-content mb-1">
                                        {asset.description || 'N/A'}
                                      </div>
                                      
                                      {/* Second line: Date without time - smaller, lighter grey */}
                                      {dateOnly && (
                                        <div className="text-xs text-base-content/60 mb-1">
                                          {dateOnly}
                                        </div>
                                      )}
                                      
                                      {/* Third line: Valuation - smaller, lighter grey */}
                                      {valuation && (
                                        <div className="text-xs text-base-content/60 mb-1">
                                          {valuation}
                                        </div>
                                      )}
                                      
                                      {/* Fourth line: Shares (if exists) - smaller, lighter grey */}
                                      {asset.shares && (
                                        <div className="text-xs text-base-content/60 mb-1">
                                          {asset.shares} shares
                                        </div>
                                      )}
                                      
                                      {/* Fifth line: BrokerName (if exists) - smaller, lighter grey */}
                                      {asset.brokerName && (
                                        <div className="text-xs text-base-content/60">
                                          {asset.brokerName}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-base-content/70">
                      No assets found
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/70">
                  Failed to load assets
                </div>
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setIsAssetsModalOpen(false);
              setSelectedUserAssets(null);
            }}>close</button>
          </form>
        </div>
      )}
    </div>
  );
}
