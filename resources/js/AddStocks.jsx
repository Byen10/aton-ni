import React, { useState, useEffect } from 'react';
import HomeSidebar from './HomeSidebar';
import { Copy, Plus, Minus, X, ChevronRight } from 'lucide-react';
import Taskbar from './components/Taskbar.jsx';

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
  const [selectedCategory, setSelectedCategory] = useState('all');
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

    // Apply category filter
    if (selectedCategory !== 'all') {
      filteredEquipment = filteredEquipment.filter(
        item => item.category?.id === parseInt(selectedCategory)
      );
    }

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
        <Taskbar title="Equipment" />

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
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
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
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            serialNumbers={serialNumbers}
            addSerialRow={addSerialRow}
            removeSerialRow={removeSerialRow}
            updateSerial={updateSerial}
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

// Modal Component
const AddStocksModal = ({ onClose, selectedEquipment }) => {
  const [serialNumbers, setSerialNumbers] = useState(['']);
  const [errors, setErrors] = useState({});
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSerialChange = (index, value) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value;
    setSerialNumbers(newSerialNumbers);
  };

  const addSerialField = () => {
    setSerialNumbers([...serialNumbers, '']);
  };

  const removeSerialField = (index) => {
    const newSerialNumbers = serialNumbers.filter((_, idx) => idx !== index);
    setSerialNumbers(newSerialNumbers);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[700px] max-w-[92vw] p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-blue-600">
          <X className="h-6 w-6" />
        </button>
        <h3 className="text-xl font-bold text-blue-600 text-center">Add Stocks</h3>

        <form onSubmit={handleSubmit}>
          {/* Selected Item Info */}
          <div className="mt-5">
            <label className="text-sm text-gray-600">Item</label>
            <div className="mt-2 flex items-start space-x-4">
              {selectedEquipment.item_image ? (
                <img 
                  src={`/storage/${selectedEquipment.item_image}`}
                  alt={selectedEquipment.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{selectedEquipment.name}</h4>
                <p className="text-sm text-gray-500">{selectedEquipment.specifications}</p>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <span className="text-gray-600">Brand: {selectedEquipment.brand}</span>
                  <span className="text-gray-600">Category: {selectedEquipment.category?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Serial Numbers */}
          <div className="mt-6">
            <label className="text-sm text-gray-600">Serial Numbers</label>
            <div className="mt-2 space-y-3">
              {serialNumbers.map((serial, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <input 
                    value={serial}
                    onChange={(e) => handleSerialChange(idx, e.target.value)}
                    placeholder="Enter serial number"
                    className="flex-1 px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                  <button 
                    type="button"
                    onClick={addSerialField}
                    className="p-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  {serialNumbers.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeSerialField(idx)}
                      className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.serials && (
              <p className="mt-1 text-sm text-red-500">{errors.serials}</p>
            )}
          </div>

          {/* Receipt Upload */}
          <div className="mt-6">
            <label className="text-sm text-gray-600">Receipt Image</label>
            <div className="mt-2">
              <div 
                className={`h-36 w-full border-2 border-dashed rounded-lg ${
                  receipt ? 'border-blue-300' : 'border-gray-300'
                } ${
                  errors.receipt ? 'border-red-500' : ''
                } hover:border-blue-400 transition-colors relative overflow-hidden`}
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
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceipt(null);
                        setReceiptPreview(null);
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
              {errors.receipt && (
                <p className="mt-1 text-sm text-red-500">{errors.receipt}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-5 py-2 rounded-full ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
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

      // Reset form and refresh
      handleReset();
      if (onSuccess) {
        onSuccess();
      }
      
      // Refresh equipment list
      if (onSuccess) {
        onSuccess();
      }
      
      onClose(); // Close modal on success
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
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-8 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : ''
                    } appearance-none`}
                    style={{ maxHeight: '200px' }}
                  >
                    <option value="">Select a category</option>
                    {categories && categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name || 'Unknown Category'}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </div>
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