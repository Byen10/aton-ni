import React, { useState, useEffect } from 'react';
import { Archive as ArchiveIcon, Search, Filter, Download, Eye, Trash2, RotateCcw, ArrowLeft, Home } from 'lucide-react';
import { useApi } from './hooks/useApi';
import GlobalHeader from './components/GlobalHeader';

const Archive = () => {
    const [archivedItems, setArchivedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    const { get, post } = useApi();

    // Fetch archived items
    const fetchArchivedItems = async () => {
        try {
            setLoading(true);
            // This would be replaced with actual API calls
            // For now, we'll simulate with empty data
            setArchivedItems([]);
        } catch (error) {
            console.error('Error fetching archived items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchivedItems();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === archivedItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(archivedItems.map(item => item.id));
        }
    };

    const handleRestore = async (itemId) => {
        try {
            // API call to restore item
            console.log('Restoring item:', itemId);
            // await post(`/api/archive/${itemId}/restore`);
            // fetchArchivedItems(); // Refresh the list
        } catch (error) {
            console.error('Error restoring item:', error);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to permanently delete this item?')) {
            try {
                // API call to permanently delete item
                console.log('Deleting item:', itemId);
                // await post(`/api/archive/${itemId}/delete`);
                // fetchArchivedItems(); // Refresh the list
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const handleBulkRestore = async () => {
        if (selectedItems.length === 0) return;
        
        try {
            // API call to restore multiple items
            console.log('Bulk restoring items:', selectedItems);
            // await post('/api/archive/bulk-restore', { itemIds: selectedItems });
            // fetchArchivedItems(); // Refresh the list
            setSelectedItems([]);
        } catch (error) {
            console.error('Error bulk restoring items:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) return;
        
        if (window.confirm(`Are you sure you want to permanently delete ${selectedItems.length} items?`)) {
            try {
                // API call to permanently delete multiple items
                console.log('Bulk deleting items:', selectedItems);
                // await post('/api/archive/bulk-delete', { itemIds: selectedItems });
                // fetchArchivedItems(); // Refresh the list
                setSelectedItems([]);
            } catch (error) {
                console.error('Error bulk deleting items:', error);
            }
        }
    };

    const filteredItems = archivedItems.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.type?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading archived items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Global Header with iREPLY Logo */}
            <GlobalHeader 
                title="Archive" 
                hideSearch={false}
                showTitle={true}
            />
            
            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => window.history.back()}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Back</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ArchiveIcon className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
                                    <p className="text-gray-600">Manage archived equipment and requests</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total Items</div>
                                <div className="text-2xl font-bold text-blue-600">{archivedItems.length}</div>
                            </div>
                            <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span>Dashboard</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* iREPLY Logo */}
                        <div className="flex items-center space-x-3">
                            <img 
                                src="/images/Frame_89-removebg-preview.png"
                                alt="iREPLY Logo" 
                                className="h-8 w-auto object-contain"
                                onError={(e) => {
                                    console.error('Logo failed to load:', e.target.src);
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }}
                            />
                            {/* Fallback text logo */}
                            <div className="hidden items-center space-x-2" id="fallback-logo">
                                <div className="relative">
                                    <div className="w-6 h-5 bg-blue-600 rounded-tl-lg rounded-tr-lg rounded-br-lg">
                                        <div className="flex items-center justify-center h-full space-x-0.5">
                                            <div className="w-1 h-1 bg-white rounded-full"></div>
                                            <div className="w-1 h-1 bg-white rounded-full"></div>
                                            <div className="w-1 h-1 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 left-1 w-1.5 h-1.5 bg-blue-600 transform rotate-45"></div>
                                </div>
                                <h1 className="text-sm font-bold">
                                    <span className="text-gray-900">i</span>
                                    <span className="text-blue-600">REPLY</span>
                                </h1>
                            </div>
                        </div>
                        
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search archived items..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                                />
                            </div>
                        </div>

                        {/* Filter */}
                        <div className="sm:w-48">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={filterType}
                                    onChange={handleFilterChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-gray-50 hover:bg-white transition-colors"
                                >
                                    <option value="all">All Types</option>
                                    <option value="equipment">Equipment</option>
                                    <option value="request">Request</option>
                                    <option value="transaction">Transaction</option>
                                </select>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedItems.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleBulkRestore}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>Restore ({selectedItems.length})</span>
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete ({selectedItems.length})</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Archive Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {archivedItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ArchiveIcon className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No archived items</h3>
                            <p className="text-gray-500 mb-6">Items that are archived will appear here.</p>
                            <button 
                                onClick={() => window.location.href = '/dashboard'}
                                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                <span>Go to Dashboard</span>
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gradient-to-r from-blue-50 to-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.length === archivedItems.length && archivedItems.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Archived Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Archived By
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => handleSelectItem(item.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                                            <ArchiveIcon className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                    item.type === 'equipment' ? 'bg-blue-100 text-blue-800' :
                                                    item.type === 'request' ? 'bg-green-100 text-green-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(item.archived_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.archived_by}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleRestore(item.id)}
                                                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                                                        title="Restore"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Archive;
