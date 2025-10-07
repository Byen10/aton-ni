<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archive - IReply Inventory</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="archive-root"></div>

    <script type="text/babel">
        const { useState } = React;

        // Archive Component
        const Archive = () => {
            const [searchTerm, setSearchTerm] = useState('');
            const [selectedItems, setSelectedItems] = useState([]);

            const archiveItems = [
                { id: 1, name: "Project Documentation", type: "Document", date: "2024-01-15", size: "2.4 MB" },
                { id: 2, name: "Meeting Notes", type: "Notes", date: "2024-01-14", size: "1.2 MB" },
                { id: 3, name: "Budget Report", type: "Spreadsheet", date: "2024-01-13", size: "3.1 MB" },
                { id: 4, name: "Design Assets", type: "Images", date: "2024-01-12", size: "15.8 MB" },
                { id: 5, name: "Code Repository", type: "Code", date: "2024-01-11", size: "8.5 MB" },
                { id: 6, name: "User Manual", type: "Document", date: "2024-01-10", size: "4.2 MB" },
                { id: 7, name: "Test Results", type: "Report", date: "2024-01-09", size: "1.8 MB" },
                { id: 8, name: "Presentation Slides", type: "Presentation", date: "2024-01-08", size: "6.7 MB" }
            ];

            const filteredItems = archiveItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const handleSelectAll = () => {
                setSelectedItems(filteredItems.map(item => item.id));
            };

            const handleClearSelection = () => {
                setSelectedItems([]);
            };

            const handleItemSelect = (itemId) => {
                setSelectedItems(prev => 
                    prev.includes(itemId) 
                        ? prev.filter(id => id !== itemId)
                        : [...prev, itemId]
                );
            };

            const handleDownload = (itemId) => {
                console.log('Downloading item:', itemId);
            };

            const handleDelete = (itemId) => {
                console.log('Deleting item:', itemId);
            };

            const handleRestore = () => {
                console.log('Restoring items:', selectedItems);
                setSelectedItems([]);
            };

            return (
                <div className="min-h-screen bg-gray-50">
                    {/* Simple Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => window.history.back()}
                                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6 6-6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-800">Archive</h1>
                                        <p className="text-gray-600">Manage your archived items</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6">
                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                            <span>Total Items: <span className="font-semibold text-blue-600">{archiveItems.length}</span></span>
                            <span>This Month: <span className="font-semibold text-gray-800">8</span></span>
                            <span>Recently Added: <span className="font-semibold text-blue-600">3</span></span>
                        </div>

                        {/* Search and Filter */}
                        <div className="mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search archived items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                                    />
                                    <div className="absolute left-4 top-3.5 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Archive Items List */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                                    <div className="col-span-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                                            onChange={selectedItems.length === filteredItems.length ? handleClearSelection : handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-4">Name</div>
                                    <div className="col-span-2">Type</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-2">Size</div>
                                    <div className="col-span-1">Actions</div>
                                </div>
                            </div>
                            
                            {/* Archive Items List */}
                            <div className="divide-y divide-gray-200">
                                {filteredItems.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                                        <div className="col-span-1 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleItemSelect(item.id)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-4 flex items-center space-x-3">
                                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 truncate">{item.name}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center text-sm text-gray-600">
                                            {item.type}
                                        </div>
                                        <div className="col-span-2 flex items-center text-sm text-gray-500">
                                            {item.date}
                                        </div>
                                        <div className="col-span-2 flex items-center text-sm text-gray-500">
                                            {item.size}
                                        </div>
                                        <div className="col-span-1 flex items-center space-x-1">
                                            <button 
                                                onClick={() => handleDownload(item.id)}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center justify-between pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={handleSelectAll}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Select All
                                </button>
                                <button 
                                    onClick={handleClearSelection}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Clear Selection
                                </button>
                                {selectedItems.length > 0 && (
                                    <span className="text-sm text-gray-500">
                                        {selectedItems.length} item(s) selected
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                {selectedItems.length > 0 && (
                                    <button 
                                        onClick={handleRestore}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Restore Selected ({selectedItems.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // Render the Archive component
        ReactDOM.render(<Archive />, document.getElementById('archive-root'));
    </script>
</body>
</html>