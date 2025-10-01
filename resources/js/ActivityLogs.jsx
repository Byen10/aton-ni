import React, { useState, useEffect } from 'react';
import { RefreshCw, Filter, Clock, Search } from 'lucide-react';
import GlobalHeader from './components/GlobalHeader';
import HomeSidebar from './HomeSidebar';

const ActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDays, setFilterDays] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch activity logs from API
  const fetchActivityLogs = async (page = 1, search = '', days = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '15',
        days: days.toString()
      });
      
      if (search.trim()) {
        params.append('q', search.trim());
      }

      const response = await fetch(`/activity-logs${search.trim() ? '/search' : ''}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setActivityLogs(data.data);
        setCurrentPage(data.pagination.current_page);
        setTotalPages(data.pagination.last_page);
        setTotal(data.pagination.total);
      } else {
        throw new Error(data.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setError(error.message);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Load activity logs on component mount
  useEffect(() => {
    fetchActivityLogs();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchActivityLogs(currentPage, searchQuery, filterDays);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchActivityLogs(1, query, filterDays);
  };

  // Handle filter change
  const handleFilterChange = (days) => {
    setFilterDays(days);
    setCurrentPage(1);
    fetchActivityLogs(1, searchQuery, days);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchActivityLogs(page, searchQuery, filterDays);
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex">
      <HomeSidebar />
      <div className="flex-1 flex flex-col">
        <GlobalHeader title="Activity Logs" onSearch={handleSearch} />

        <main className="px-10 py-6 mb-10 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <h2 className="text-4xl font-bold text-blue-600">Activity Logs</h2>
            <p className="text-sm text-gray-500 mt-2">Activity logs / Users</p>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <select
                  value={filterDays}
                  onChange={(e) => handleFilterChange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
                
                <div className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filter</span>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {!loading && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {activityLogs.length} of {total} activity logs
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Header Line */}
            <div className="border-t border-gray-200 mt-4">
              <div className="flex justify-end pt-2">
                <span className="text-xs text-gray-500">Date and time</span>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="mt-4 space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-20 h-3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Activity Log Entries */}
            {!loading && !error && (
              <div className="mt-4 space-y-3">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No activity logs found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery ? 'Try adjusting your search terms' : 'Activity will appear here as users interact with the system'}
                    </p>
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-600">
                            {log.user ? `${log.user.name} ${log.action}` : log.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{log.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {new Date(log.created_at).toLocaleDateString('en-US', {
                              month: 'numeric',
                              day: 'numeric',
                              year: '2-digit',
                              hour: 'numeric',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActivityLogs;
