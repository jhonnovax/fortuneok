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
  const [emailVerified, setEmailVerified] = useState('');
  const [hasAccess, setHasAccess] = useState('');
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
        if (emailVerified !== '') {
          params.append('emailVerified', emailVerified);
        }
        if (hasAccess !== '') {
          params.append('hasAccess', hasAccess);
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
  }, [page, search, emailVerified, hasAccess, sortField, sortDirection, status]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [search, emailVerified, hasAccess, sortField, sortDirection]);

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
        <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h1 className="card-title text-xl sm:text-2xl mb-4">Users</h1>

              {/* Filters Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Search Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Search</span>
                  </label>
                  <input
                    type="search"
                    placeholder="Search by ID, name, email, or customerId"
                    className="input input-bordered w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Email Verified Toggle */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email Verified</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={emailVerified}
                    onChange={(e) => setEmailVerified(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Not Verified</option>
                  </select>
                </div>

                {/* Has Access Toggle */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Has Access</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={hasAccess}
                    onChange={(e) => setHasAccess(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-base-content/70">
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
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('_id')}
                        >
                          <div className="flex items-center">
                            ID
                            <SortIcon field="ID" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
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
                          onClick={() => handleSort('emailVerified')}
                        >
                          <div className="flex items-center">
                            Email Verified
                            <SortIcon field="Email Verified" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('hasAccess')}
                        >
                          <div className="flex items-center">
                            Has Access
                            <SortIcon field="Has Access" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('customerId')}
                        >
                          <div className="flex items-center">
                            Customer ID
                            <SortIcon field="Customer ID" />
                          </div>
                        </th>
                        <th>Assets</th>
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
                            <td className="font-mono text-xs">{user.id}</td>
                            <td>{user.name || '❌'}</td>
                            <td>{user.email || 'N/A'}</td>
                            <td>
                              {user.emailVerified !== undefined ? (
                                user.emailVerified ? '✅' : '❌'
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td>
                              {user.hasAccess ? '✅' : '❌'}
                            </td>
                            <td className="font-mono text-xs">{user.customerId || '❌'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleViewAssets(user)}
                                disabled={!user.assetStats || user.assetStats.totalAssets === 0}
                              >
                                {user.assetStats ? (
                                  <span className="text-sm">
                                    {user.assetStats.totalCategories} categories, {user.assetStats.totalAssets} assets
                                  </span>
                                ) : (
                                  '0 categories, 0 assets'
                                )}
                              </button>
                            </td>
                            <td className="text-sm">{user.createdAt ? formatDate(user.createdAt) : '❌'}</td>
                            <td className="text-sm">{user.lastAccessAt ? formatDate(user.lastAccessAt) : '❌'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn btn-sm sm:btn-md"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      «
                    </button>
                    <button className="join-item btn btn-sm sm:btn-md" disabled>
                      <span className="hidden sm:inline">Page </span>
                      {page} <span className="hidden sm:inline">of {totalPages}</span>
                    </button>
                    <button
                      className="join-item btn btn-sm sm:btn-md"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
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
