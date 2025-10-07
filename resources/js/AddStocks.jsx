import React, { useState, useEffect } from 'react';
import HomeSidebar from './HomeSidebar';
import { Copy, Plus, Minus, X, ChevronRight } from 'lucide-react';
import GlobalHeader from './components/GlobalHeader';

// Add custom scrollbar styles
const scrollbarStyles = `
  .select-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #3B82F6 #F3F4F6;
  }
  .select-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .select-scrollbar::-webkit-scrollbar-track {
    background: #F3F4F6;
    border-radius: 4px;
  }
  .select-scrollbar::-webkit-scrollbar-thumb {
    background: #3B82F6;
    border-radius: 4px;
  }
  .select-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #2563EB;
  }
`;

const style = document.createElement('style');
style.textContent = scrollbarStyles;
document.head.appendChild(style);

const rows = [
  { id: 1, item: 'Lenovo', serial: '353454', date: 'Sept 05 2025', status: 'Available', price: '₱0.00' },
  { id: 2, item: 'Mouse', serial: '4543543', date: 'Sept 5 2025', status: 'Available', price: '₱0.00' },
  { id: 3, item: 'Acer', serial: '345435', date: 'Sept 5 2025', status: 'Available', price: '₱0.00' },
  { id: 4, item: 'Keyboard', serial: '6456546', date: 'Sept 5 2025', status: 'Available', price: '₱0.00' },
  { id: 5, item: 'Monitor', serial: '545644', date: 'Sept 5 2025', status: 'Available', price: '₱0.00' },
  { id: 6, item: 'Mouse', serial: '5646436', date: 'Sept 5 2025', status: 'Available', price: '₱0.00' },
];

const AddStocks = () => {
  const [isAddStocksOpen, setIsAddStocksOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [formData, setFormData] = useState({
    category: '',
    serial_number: '',
    brand: '',
    supplier: '',
    description: '',
    price: '',
    item_image: null,
    receipt_image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch equipment data
  useEffect(() => {
    fetchEquipment();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories');
    }
  };

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/equipment');
      const data = await response.json();
      
      if (data.success) {
        const equipmentWithCategories = data.data.data.map(item => ({
          ...item,
          category: item.category || { id: null, name: 'Uncategorized' }
        }));
        setEquipment(equipmentWithCategories);
      } else {
        setError('Failed to fetch equipment');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort equipment
  const getFilteredAndSortedEquipment = () => {
    let filteredEquipment = [...equipment];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredEquipment = filteredEquipment.filter(
        item =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.brand?.toLowerCase().includes(searchLower) ||
          item.serial_number?.toLowerCase().includes(searchLower) ||
          item.category?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filteredEquipment.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle special cases
        if (sortConfig.key === 'category') {
          aValue = a.category?.name || 'Uncategorized';
          bValue = b.category?.name || 'Uncategorized';
        } else if (sortConfig.key === 'price') {
          aValue = parseFloat(a.purchase_price) || 0;
          bValue = parseFloat(b.purchase_price) || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredEquipment;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category' ? (value ? parseInt(value, 10) : '') : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Check file size (5MB max)
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [name]: 'File size must be less than 5MB'
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('/api/equipment', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error adding equipment');
      }

      // Reset form and close modal on success
      setFormData({
        category: '',
        serial_number: '',
        brand: '',
        supplier: '',
        description: '',
        price: '',
        item_image: null,
        receipt_image: null
      });
      setIsAddItemOpen(false);

    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setIsAddStocksOpen(false);

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <div className="flex-shrink-0">
        <HomeSidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <GlobalHeader title="Add Stocks" />

        <main className="flex-1 px-10 py-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-blue-600">Equipment</h2>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 max-w-2xl flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
            <div className="space-x-3">
              <button 
                onClick={() => setIsAddStocksOpen(true)} 
                className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 text-sm hover:bg-blue-600 hover:text-white"
              >
                Add Stocks
              </button>
              <button 
                onClick={() => setIsAddItemOpen(true)} 
                className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 text-sm hover:bg-blue-600 hover:text-white"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Table with proper HTML structure */}
          <div className="mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading equipment...</div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">{error}</div>
              ) : equipment.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No equipment found. Add some items to get started.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th 
                        onClick={() => {
                          const direction = sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                          setSortConfig({ key: 'name', direction });
                        }}
                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Items
                          {sortConfig.key === 'name' && (
                            <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => {
                          const direction = sortConfig.key === 'serial_number' && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                          setSortConfig({ key: 'serial_number', direction });
                        }}
                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Serial Number
                          {sortConfig.key === 'serial_number' && (
                            <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => {
                          const direction = sortConfig.key === 'category' && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                          setSortConfig({ key: 'category', direction });
                        }}
                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Category
                          {sortConfig.key === 'category' && (
                            <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                      <th 
                        onClick={() => {
                          const direction = sortConfig.key === 'price' && sortConfig.direction === 'asc' ? 'desc' : 'asc';
                          setSortConfig({ key: 'price', direction });
                        }}
                        className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Price
                          {sortConfig.key === 'price' && (
                            <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAndSortedEquipment().map((item, index) => (
                      <tr 
                        key={item.id}
                        className={`
                          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} 
                          hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0
                        `}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            {item.item_image ? (
                              <img 
                                src={`/storage/${item.item_image}`} 
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                                <span className="text-gray-400 text-xs">No img</span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700">{item.serial_number}</td>
                        <td className="py-4 px-6 text-gray-700">
                          {item.category?.name || 'Uncategorized'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium
                            ${item.status === 'available' ? 'bg-green-100 text-green-800' : ''}
                            ${item.status === 'in_use' ? 'bg-blue-100 text-blue-800' : ''}
                            ${item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${item.status === 'retired' ? 'bg-gray-100 text-gray-800' : ''}
                          `}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">
                          ₱{Number(item.purchase_price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => {
                              setSelectedEquipment(item);
                              setIsAddStocksOpen(true);
                            }}
                            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Add Stock"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {isAddStocksOpen && (
          <AddStocksModal
            onClose={closeModal}
            selectedEquipment={selectedEquipment}
          />
        )}
        {isAddItemOpen && (
          <AddItemModal 
            onClose={() => setIsAddItemOpen(false)} 
            categories={categories}
            onSuccess={fetchEquipment}
          />
        )}
      </div>
    </div>
  );
};

export default AddStocks;

// Modal Component - Modern UI Design
const AddStocksModal = ({ onClose, selectedEquipment }) => {
  const [serialNumbers, setSerialNumbers] = useState(['4354354', '4354354', '4354354']);
  const [errors, setErrors] = useState({});
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newFieldIndex, setNewFieldIndex] = useState(null);

  const handleSerialChange = (index, value) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value;
    setSerialNumbers(newSerialNumbers);
  };

  const addSerialField = () => {
    if (serialNumbers.length < 10) {
      const newSerialNumbers = [...serialNumbers, ''];
      setSerialNumbers(newSerialNumbers);
      setNewFieldIndex(serialNumbers.length);
    }
  };

  const removeSerialField = (index) => {
    if (serialNumbers.length > 1) {
      const newSerialNumbers = serialNumbers.filter((_, idx) => idx !== index);
      setSerialNumbers(newSerialNumbers);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ receipt: 'File size must be less than 5MB' });
        return;
      }
      setReceipt(file);
      setReceiptPreview(URL.createObjectURL(file));
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate serial numbers
    const emptySerials = serialNumbers.filter(s => !s.trim());
    if (emptySerials.length > 0) {
      setErrors({ serials: 'All serial numbers must be filled' });
      setLoading(false);
      return;
    }

    // Validate receipt
    if (!receipt) {
      setErrors({ receipt: 'Receipt image is required' });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('equipment_id', selectedEquipment.id);
      formData.append('serial_numbers', JSON.stringify(serialNumbers));
      formData.append('receipt_image', receipt);

      const response = await fetch('/api/equipment/add-stock', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error adding stocks');
      }

      onClose(); // Close modal on success
      // You might want to refresh the equipment list here
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal with blue shadow */}
      <div className="relative bg-white rounded-3xl w-[480px] max-w-[90vw] p-8 max-h-[85vh] overflow-y-auto" 
           style={{
             boxShadow: '0 30px 70px -12px rgba(34, 98, 198, 0.5)'
           }}>
        
        {/* Decorative bubble */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-100 rounded-full opacity-60"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-200 rounded-full opacity-40"></div>
        <div className="absolute top-1/4 -left-3 w-4 h-4 bg-blue-300 rounded-full opacity-30"></div>
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-full hover:bg-gray-100/50 backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-center mb-8" style={{ color: '#2262C6' }}>
          Add Stocks
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information Card with soft blue glow */}
          <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/60 rounded-2xl p-6 shadow-lg border border-blue-200/30 backdrop-blur-sm"
               style={{
                 boxShadow: '0 8px 32px rgba(34, 98, 198, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
               }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-800 mb-1">LENOVO</div>
                <div className="text-sm text-gray-600">
                  icore 5 16gb RAM, 1T storage, Windows 11
                </div>
              </div>
              <button 
                type="button"
                className="p-3 rounded-2xl bg-white/60 hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                title="More details"
                style={{
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Serial Numbers Section - Clean minimal design */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Serial Numbers</h4>
            <div className="space-y-3">
              {serialNumbers.map((serial, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center space-x-4"
                  style={{ animation: newFieldIndex === idx ? 'fadeInUp 0.5s ease-out' : '' }}
                >
                  <div className="flex-1">
                    <input 
                      value={serial}
                      onChange={(e) => handleSerialChange(idx, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50/50 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 backdrop-blur-sm" 
                      placeholder="Serial No."
                      autoFocus={newFieldIndex === idx}
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      type="button"
                      onClick={addSerialField}
                      disabled={serialNumbers.length >= 10}
                      className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title={serialNumbers.length >= 10 ? "Maximum 10 serial numbers" : "Add another serial number"}
                      style={{
                        boxShadow: '0 4px 16px rgba(34, 98, 198, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => removeSerialField(idx)}
                      disabled={serialNumbers.length <= 1}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      title="Remove this serial number"
                      style={{
                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {errors.serials && (
              <p className="mt-3 text-sm text-red-500 bg-red-50/50 p-3 rounded-xl border border-red-200/50 backdrop-blur-sm">
                {errors.serials}
              </p>
            )}
          </div>

          {/* Receipt Upload Section - Clean dotted border */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800">Receipt</h4>
            <div 
              className={`h-28 w-full border-2 border-dashed rounded-2xl ${
                receipt ? 'border-blue-400/60 bg-blue-50/50' : 'border-gray-300/60 bg-gray-50/30'
              } ${
                errors.receipt ? 'border-red-400/60 bg-red-50/50' : ''
              } hover:border-blue-400/80 hover:bg-blue-50/60 transition-all duration-300 relative overflow-hidden group backdrop-blur-sm`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files[0];
                if (file) handleFileChange({ target: { files: [file] } });
              }}
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {receiptPreview ? (
                <div className="relative w-full h-full">
                  <img 
                    src={receiptPreview} 
                    alt="Receipt preview" 
                    className="w-full h-full object-contain p-4"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReceipt(null);
                      setReceiptPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="p-4 rounded-full bg-blue-100/60 mb-3 mx-auto w-fit backdrop-blur-sm">
                      <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">Click to upload receipt</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </div>
                </div>
              )}
            </div>
            {errors.receipt && (
              <p className="mt-2 text-sm text-red-500 bg-red-50/50 p-3 rounded-xl border border-red-200/50 backdrop-blur-sm">
                {errors.receipt}
              </p>
            )}
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-50/50 border border-red-200/50 text-red-700 rounded-xl backdrop-blur-sm">
              {errors.submit}
            </div>
          )}

          {/* Save Button with gradient and glow */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
              style={{ 
                backgroundColor: loading ? '#60A5FA' : '#2262C6',
                boxShadow: loading 
                  ? '0 8px 32px rgba(96, 165, 250, 0.3)' 
                  : '0 8px 32px rgba(34, 98, 198, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              <span className="mr-2">{loading ? 'Saving...' : 'Save'}</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Custom CSS for animations and effects */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const AddItemModal = ({ onClose, categories = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    category: '',
    serial_number: '',
    brand: '',
    supplier: '',
    description: '',
    price: '',
    item_image: null,
    receipt_image: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [preview, setPreview] = useState({
    item_image: null,
    receipt_image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [name]: 'File size must be less than 5MB'
        }));
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(files[0]);
      setPreview(prev => ({
        ...prev,
        [name]: url
      }));

      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const requiredFields = ['category', 'serial_number', 'brand', 'supplier', 'description'];
    const newErrors = {};
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Special handling for category - convert to category_id
      if (formData.category) {
        formDataToSend.append('category_id', formData.category);
      }

      // Add other form fields
      const fieldsToAdd = ['serial_number', 'brand', 'supplier', 'description', 'price'];
      fieldsToAdd.forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files if they exist
      if (formData.item_image) {
        formDataToSend.append('item_image', formData.item_image);
      }
      if (formData.receipt_image) {
        formDataToSend.append('receipt_image', formData.receipt_image);
      }

      const response = await fetch('/api/equipment', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server response:', data);
        throw new Error(data.message || 'Error adding equipment');
      }

      // Show success message
      setShowSuccess(true);
      
      // Reset form and refresh after a short delay
      setTimeout(() => {
        handleReset();
        if (onSuccess) {
          onSuccess();
        }
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };



  const handleReset = () => {
    setFormData({
      category: '',
      serial_number: '',
      brand: '',
      supplier: '',
      description: '',
      price: '0',
      item_image: null,
      receipt_image: null
    });
    setPreview({
      item_image: null,
      receipt_image: null
    });
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[880px] max-w-[95vw] p-8">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-gray-500 hover:text-blue-600"
          type="button"
        >
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-xl font-bold text-blue-600 text-center">Add Equipment</h3>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-sm text-gray-600">Category*</label>
              <div className="mt-2">
                <div className="relative">
                  {/* Dropdown trigger button */}
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full px-3 py-2 rounded-md bg-gray-100 cursor-pointer flex items-center justify-between ${
                      errors.category ? 'border-red-500' : 'border-transparent'
                    } border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <span className={!formData.category ? 'text-gray-500' : ''}>
                      {formData.category ? 
                        categories.find(c => c.id === formData.category)?.name 
                        : 'Select a category'}
                    </span>
                    <ChevronRight 
                      className={`h-4 w-4 text-gray-700 transform transition-transform ${
                        isDropdownOpen ? 'rotate-90' : ''
                      }`} 
                    />
                  </div>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                      <div 
                        className="max-h-48 overflow-y-auto select-scrollbar"
                      >
                        {categories && categories.map(category => (
                          <div
                            key={category.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                              formData.category === category.id ? 'bg-blue-50 text-blue-600' : ''
                            }`}
                            onClick={() => {
                              handleInputChange({
                                target: { name: 'category', value: category.id }
                              });
                              setIsDropdownOpen(false);
                            }}
                          >
                            {category.name || 'Unknown Category'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Serial Number*</label>
              <input 
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                className={`mt-2 w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.serial_number ? 'border-red-500' : ''
                }`}
                placeholder="4354354"
              />
              {errors.serial_number && <p className="mt-1 text-sm text-red-500">{errors.serial_number}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-600">Brand*</label>
              <input 
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={`mt-2 w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand ? 'border-red-500' : ''
                }`}
                placeholder="Brand name"
              />
              {errors.brand && <p className="mt-1 text-sm text-red-500">{errors.brand}</p>}
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Supplier*</label>
              <input 
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className={`mt-2 w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.supplier ? 'border-red-500' : ''
                }`}
                placeholder="Supplier name"
              />
              {errors.supplier && <p className="mt-1 text-sm text-red-500">{errors.supplier}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-600">Description*</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`mt-2 w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : ''
                }`}
                placeholder="Item description"
                rows={3}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Price</label>
              <input 
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-2 w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="₱ 0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Item image</label>
              <div className="mt-2">
                <div 
                  className={`h-36 w-full border-2 border-dashed rounded-lg ${
                    formData.item_image ? 'border-blue-300' : 'border-gray-300'
                  } ${
                    errors.item_image ? 'border-red-500' : ''
                  } hover:border-blue-400 transition-colors relative overflow-hidden`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileChange({ target: { name: 'item_image', files: [file] }});
                  }}
                >
                  <input
                    type="file"
                    name="item_image"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {formData.item_image ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={preview.item_image} 
                        alt="Item preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, item_image: null }));
                          setPreview(prev => ({ ...prev, item_image: null }));
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="p-2 rounded-full bg-blue-50 mb-2">
                        <Plus className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Click to upload</div>
                      <div className="text-xs text-gray-500 mt-1">or drag and drop</div>
                      <div className="text-xs text-gray-400 mt-2">
                        JPEG, PNG, GIF, WebP up to 5MB
                      </div>
                    </div>
                  )}
                </div>
                {errors.item_image && (
                  <p className="mt-1 text-sm text-red-500">{errors.item_image}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Receipt image</label>
              <div className="mt-2">
                <div 
                  className={`h-36 w-full border-2 border-dashed rounded-lg ${
                    formData.receipt_image ? 'border-blue-300' : 'border-gray-300'
                  } ${
                    errors.receipt_image ? 'border-red-500' : ''
                  } hover:border-blue-400 transition-colors relative overflow-hidden`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileChange({ target: { name: 'receipt_image', files: [file] }});
                  }}
                >
                  <input
                    type="file"
                    name="receipt_image"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {formData.receipt_image ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={preview.receipt_image} 
                        alt="Receipt preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, receipt_image: null }));
                          setPreview(prev => ({ ...prev, receipt_image: null }));
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="p-2 rounded-full bg-blue-50 mb-2">
                        <Plus className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="text-sm font-medium text-gray-700">Click to upload</div>
                      <div className="text-xs text-gray-500 mt-1">or drag and drop</div>
                      <div className="text-xs text-gray-400 mt-2">
                        JPEG, PNG, GIF, WebP up to 5MB
                      </div>
                    </div>
                  )}
                </div>
                {errors.receipt_image && (
                  <p className="mt-1 text-sm text-red-500">{errors.receipt_image}</p>
                )}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-blue-600 hover:underline"
              disabled={loading}
            >
              Reset all
            </button>
            <button
              type="submit"
              className={`inline-flex items-center px-5 py-2 rounded-full ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
              disabled={loading}
            >
              <span>{loading ? 'Saving...' : 'Save'}</span>
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};