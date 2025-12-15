'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import apiClient from '@/libs/api';
import HeaderDashboard from '@/components/HeaderDashboard';

export default function LogsPage() {
  const { status } = useSession();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [errorType, setErrorType] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        setSelectedLog(null);
      }
    };

    if (isModalOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

  // Fetch logs
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        });

        if (search) {
          params.append('search', search);
        }
        if (action) {
          params.append('action', action);
        }
        if (errorType) {
          params.append('errorType', errorType);
        }
        if (userEmail) {
          params.append('userEmail', userEmail);
        }
        if (startDate) {
          params.append('startDate', startDate);
        }
        if (endDate) {
          params.append('endDate', endDate);
        }
        
        params.append('sortField', sortField);
        params.append('sortDirection', sortDirection);

        const response = await apiClient.get(`/logs?${params.toString()}`);
        setLogs(response.logs || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotal(response.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
        setError(err.message || 'Failed to load logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [page, search, action, errorType, userEmail, startDate, endDate, sortField, sortDirection, status]);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setPage(1);
  }, [search, action, errorType, userEmail, startDate, endDate, sortField, sortDirection]);

  // Handle column header click for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort icon component
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
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

  const getErrorTypeBadge = (type) => {
    const badges = {
      error: 'badge-error',
      warning: 'badge-warning',
      info: 'badge-info',
    };
    return badges[type] || 'badge-ghost';
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
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
              <h1 className="card-title text-xl sm:text-2xl mb-4">Error Logs</h1>

              {/* Filters Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Search Input */}
                <div className="form-control w-full">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-xs sm:text-sm">Search</span>
                  </label>
                  <input
                    type="search"
                    placeholder="Search error message, URL, email..."
                    className="input input-bordered w-full input-sm sm:input-md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Action Filter */}
                <div className="form-control w-full">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-xs sm:text-sm">Action</span>
                  </label>
                  <select
                    className="select select-bordered w-full select-sm sm:select-md"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="add">Add</option>
                    <option value="delete">Delete</option>
                    <option value="update">Update</option>
                    <option value="fetch">Fetch</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                    <option value="api_error">API Error</option>
                    <option value="validation_error">Validation Error</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                {/* Error Type Filter */}
                <div className="form-control w-full">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-xs sm:text-sm">Error Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full select-sm sm:select-md"
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>

                {/* User Email Filter */}
                <div className="form-control w-full">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-xs sm:text-sm">User Email</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by email"
                    className="input input-bordered w-full input-sm sm:input-md"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>

                {/* Start Date Filter */}
                <div className="form-control w-full">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-xs sm:text-sm">Start Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full input-sm sm:input-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {/* End Date Filter */}
                <div className="form-control w-full">
                  <label className="label py-1 sm:py-2">
                    <span className="label-text text-xs sm:text-sm">End Date</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full input-sm sm:input-md"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-base-content/70">
                  Showing {logs.length} of {total} logs
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

              {/* Logs Table */}
              {!isLoading && !error && (
                <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                  <table className="table table-zebra w-full min-w-[1000px]">
                    <thead>
                      <tr>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center">
                            Timestamp
                            <SortIcon field="createdAt" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('errorType')}
                        >
                          <div className="flex items-center">
                            Type
                            <SortIcon field="errorType" />
                          </div>
                        </th>
                        <th 
                          className="cursor-pointer hover:bg-base-200 select-none"
                          onClick={() => handleSort('action')}
                        >
                          <div className="flex items-center">
                            Action
                            <SortIcon field="action" />
                          </div>
                        </th>
                        <th>Error Message</th>
                        <th>User</th>
                        <th>URL</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-8">
                            No logs found
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id}>
                            <td className="text-sm">{formatDate(log.createdAt)}</td>
                            <td>
                              <span className={`badge ${getErrorTypeBadge(log.errorType)}`}>
                                {log.errorType}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-ghost">{log.action}</span>
                            </td>
                            <td className="max-w-xs truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </td>
                            <td className="text-sm">
                              {log.userEmail || log.userName || 'N/A'}
                            </td>
                            <td className="max-w-xs truncate text-xs" title={log.url}>
                              {log.url}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleViewDetails(log)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && totalPages > 1 && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <div className="join">
                    <button
                      className="join-item btn btn-xs sm:btn-sm md:btn-md"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      «
                    </button>
                    <button className="join-item btn btn-xs sm:btn-sm md:btn-md" disabled>
                      <span className="hidden sm:inline">Page </span>
                      {page} <span className="hidden sm:inline">of {totalPages}</span>
                    </button>
                    <button
                      className="join-item btn btn-xs sm:btn-sm md:btn-md"
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

      {/* Log Details Modal */}
      {isModalOpen && selectedLog && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] p-0 flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-base-300">
              <h3 className="font-bold text-lg">Log Details</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedLog(null);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Timestamp</span>
                    </label>
                    <p className="text-sm">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Error Type</span>
                    </label>
                    <span className={`badge ${getErrorTypeBadge(selectedLog.errorType)}`}>
                      {selectedLog.errorType}
                    </span>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Action</span>
                    </label>
                    <span className="badge badge-ghost">{selectedLog.action}</span>
                  </div>
                  {selectedLog.statusCode && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Status Code</span>
                      </label>
                      <p className="text-sm">{selectedLog.statusCode}</p>
                    </div>
                  )}
                  {selectedLog.userEmail && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">User Email</span>
                      </label>
                      <p className="text-sm">{selectedLog.userEmail}</p>
                    </div>
                  )}
                  {selectedLog.userName && (
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">User Name</span>
                      </label>
                      <p className="text-sm">{selectedLog.userName}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Error Message</span>
                  </label>
                  <div className="bg-base-200 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap break-words">{selectedLog.errorMessage}</p>
                  </div>
                </div>

                {selectedLog.errorStack && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Stack Trace</span>
                    </label>
                    <div className="bg-base-200 p-3 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap break-words overflow-x-auto">
                        {selectedLog.errorStack}
                      </pre>
                    </div>
                  </div>
                )}

                <div>
                  <label className="label">
                    <span className="label-text font-semibold">URL</span>
                  </label>
                  <p className="text-sm break-all">{selectedLog.url}</p>
                </div>

                {selectedLog.requestUrl && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Request URL</span>
                    </label>
                    <p className="text-sm break-all">{selectedLog.requestUrl}</p>
                  </div>
                )}

                {selectedLog.requestMethod && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Request Method</span>
                    </label>
                    <p className="text-sm">{selectedLog.requestMethod}</p>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">User Agent</span>
                    </label>
                    <p className="text-xs break-all">{selectedLog.userAgent}</p>
                  </div>
                )}

                {selectedLog.requestBody && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Request Body</span>
                    </label>
                    <div className="bg-base-200 p-3 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap break-words overflow-x-auto">
                        {JSON.stringify(selectedLog.requestBody, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.responseData && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Response Data</span>
                    </label>
                    <div className="bg-base-200 p-3 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap break-words overflow-x-auto">
                        {JSON.stringify(selectedLog.responseData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedLog.additionalData && Object.keys(selectedLog.additionalData).length > 0 && (
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">Additional Data</span>
                    </label>
                    <div className="bg-base-200 p-3 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap break-words overflow-x-auto">
                        {JSON.stringify(selectedLog.additionalData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setIsModalOpen(false);
              setSelectedLog(null);
            }}>close</button>
          </form>
        </div>
      )}
    </div>
  );
}
