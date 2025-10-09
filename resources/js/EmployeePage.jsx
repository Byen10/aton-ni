import React, { useState, useEffect } from 'react';
import HomeSidebar from './HomeSidebar';
import GlobalHeader from './components/GlobalHeader';
import { Search, Eye, Edit, Trash2, Plus, Bell, Settings, ArrowRight, X } from 'lucide-react';

const getBadgeColor = (name) => {
  const colors = {
    J: 'bg-blue-500',
    K: 'bg-pink-500', 
    R: 'bg-yellow-500',
    C: 'bg-blue-500',
  };
  const first = name?.[0]?.toUpperCase() || 'B';
  return colors[first] || 'bg-gray-400';
};

const EmployeePage = () => {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [deleting, setDeleting] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contact: '',
    address: '',
    employeeType: 'End of Service'
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {/* Lines 35-49 omitted */}, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const resetAll = () => setForm({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contact: '',
    address: '',
    employeeType: 'End of Service'
  });
  const closeModal = () => setIsAddOpen(false);

  const refreshEmployees = () => {/* Lines 64-80 omitted */};

  const saveEmployee = () => {/* Lines 83-111 omitted */};

  const openView = (emp) => setViewing(emp);
  const closeView = () => setViewing(null);

  // Populate form with employee data for editing
  const openEdit = (emp) => {/* Lines 118-130 omitted */};
  
  const closeEdit = () => {/* Line 132 omitted */};

  const updateEmployee = () => {/* Lines 135-160 omitted */};

  const openDelete = (emp) => setDeleting(emp);
  const closeDelete = () => setDeleting(null);

  const confirmDelete = () => {/* Lines 166-178 omitted */};

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden bg-white flex">
      <HomeSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Global Header with Profile */}
        <GlobalHeader 
          title="Employees" 
          hideSearch={true}
          showTitle={true}
        />

        {/* Search Bar and Add Button */}
        <div className="bg-white px-8 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg">
                Filter
              </button>
              
            </div>
            <button 
              onClick={() => setIsAddOpen(true)} 
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add New
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white px-8 py-6 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Employees</h2>
          
          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Employee Type</div>
                <div className="col-span-3">Department</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No employees found.</div>
              ) : (
                filteredEmployees.map((e) => (
                  <div key={e.id} className="px-6 py-4 hover:bg-blue-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center space-x-3">
                        <div className={`w-8 h-8 ${e.color} rounded-full text-white text-sm flex items-center justify-center font-medium`}>
                          {e.badge}
                        </div>
                        <span className="text-gray-900 font-medium">{e.name}</span>
                      </div>
                      <div className="col-span-3 text-gray-600">{e.employeeType}</div>
                      <div className="col-span-3 text-gray-600">{e.department}</div>
                      <div className="col-span-2 flex items-center justify-center space-x-3">
                        <button
                          onClick={() => openView(e)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(e)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDelete(e)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* View Modal */}
        {viewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={closeView} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-[700px] max-w-[95vw] p-8 border border-gray-200">
              <button onClick={closeView} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 text-xl">✕</button>
              <h3 className="text-2xl font-semibold text-blue-600 mb-8">Employee Details</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">First Name</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.firstName}</span>
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Last Name</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.lastName}</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Email</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.email}</span>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Password</label>
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-gray-900">••••••••••</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Contact Number</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.contact}</span>
                  </div>
                </div>

                {/* Employee Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Employee Type</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.employeeType}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 mb-2">Address</label>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-gray-900">{viewing.address}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={closeModal} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-[700px] max-w-[95vw] p-8 border border-gray-200">
              <button onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
              <h3 className="text-xl font-semibold text-blue-500 text-center mb-8">Add employee</h3>

              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">First Name*</label>
                    <input 
                      value={form.firstName || ''} 
                      onChange={(e) => setForm({...form, firstName: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter first name"
                      tabIndex={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Email*</label>
                    <input 
                      type="email"
                      value={form.email} 
                      onChange={update('email')} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter email address"
                      tabIndex={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Contact Number*</label>
                    <input 
                      type="tel"
                      value={form.contact} 
                      onChange={update('contact')} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter phone number"
                      tabIndex={5}
                    />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Last Name*</label>
                    <input 
                      value={form.lastName || ''} 
                      onChange={(e) => setForm({...form, lastName: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter last name"
                      tabIndex={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Password*</label>
                    <input 
                      type="password"
                      value={form.password || ''} 
                      onChange={(e) => setForm({...form, password: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter password"
                      tabIndex={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Employee Type*</label>
                    <select 
                      value={form.employeeType} 
                      onChange={(e) => setForm({...form, employeeType: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      tabIndex={6}
                    >
                      <option value="End of Service">End of Service</option>
                      <option value="Independent Contractor">Independent Contractor</option>
                      <option value="Probationary">Probationary</option>
                      <option value="Regular">Regular</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Separated">Separated</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                {/* Full Width Address Field */}
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 font-medium mb-2">Address*</label>
                  <textarea 
                    value={form.address || ''} 
                    onChange={(e) => setForm({...form, address: e.target.value})} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter complete address"
                    rows="3"
                    tabIndex={7}
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button onClick={resetAll} className="text-blue-500 hover:text-blue-600 font-medium">Reset all</button>
                <button onClick={saveEmployee} className="px-8 py-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 font-medium transition-colors">Save →</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/20" onClick={closeEdit} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-[700px] max-w-[95vw] p-8 border border-gray-200">
              <button onClick={closeEdit} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
              <h3 className="text-xl font-semibold text-blue-500 text-center mb-8">Edit employee</h3>
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">First Name*</label>
                    <input 
                      value={form.firstName || ''} 
                      onChange={(e) => setForm({...form, firstName: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter first name"
                      tabIndex={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Email*</label>
                    <input 
                      type="email"
                      value={form.email} 
                      onChange={update('email')} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter email address"
                      tabIndex={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Contact Number*</label>
                    <input 
                      type="tel"
                      value={form.contact} 
                      onChange={update('contact')} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter phone number"
                      tabIndex={5}
                    />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Last Name*</label>
                    <input 
                      value={form.lastName || ''} 
                      onChange={(e) => setForm({...form, lastName: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter last name"
                      tabIndex={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Password*</label>
                    <input 
                      type="password"
                      value={form.password || ''} 
                      onChange={(e) => setForm({...form, password: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter password"
                      tabIndex={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-2">Employee Type*</label>
                    <select 
                      value={form.employeeType} 
                      onChange={(e) => setForm({...form, employeeType: e.target.value})} 
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      tabIndex={6}
                    >
                      <option value="End of Service">End of Service</option>
                      <option value="Independent Contractor">Independent Contractor</option>
                      <option value="Probationary">Probationary</option>
                      <option value="Regular">Regular</option>
                      <option value="Resigned">Resigned</option>
                      <option value="Separated">Separated</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>

                {/* Full Width Address Field */}
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 font-medium mb-2">Address*</label>
                  <textarea 
                    value={form.address || ''} 
                    onChange={(e) => setForm({...form, address: e.target.value})} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter complete address"
                    rows="3"
                    tabIndex={7}
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button onClick={resetAll} className="text-blue-500 hover:text-blue-600 font-medium">Reset</button>
                <button onClick={updateEmployee} className="px-8 py-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 font-medium transition-colors">Update →</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={closeDelete} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-[400px] max-w-[95vw] p-6 border border-gray-200">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Employee</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-medium text-gray-900">{deleting.name}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex space-x-3 justify-center">
                  <button 
                    onClick={closeDelete}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;