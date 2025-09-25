import React, { useState, useEffect } from 'react';
import HomeSidebar from './HomeSidebar';
import { Eye, Pencil, Trash2, Search } from 'lucide-react';

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
    name: '',
    email: '',
    contact: '',
    address: '',
    position: '',
    client: ''
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setEmployees(data.data.map(e => ({
            id: e.id,
            name: `${e.first_name} ${e.last_name}`,
            position: e.position,
            department: e.department || '',
            badge: (e.first_name?.[0] || '').toUpperCase(),
            color: getBadgeColor(e.first_name)
          })));
        }
      });
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const resetAll = () => setForm({ name: '', email: '', contact: '', address: '', position: '', client: '' });
  const closeModal = () => setIsAddOpen(false);

  const refreshEmployees = () => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setEmployees(data.data.map(e => ({
            id: e.id,
            name: `${e.first_name} ${e.last_name}`,
            position: e.position,
            department: e.department || '',
            email: e.email,
            phone: e.phone || '',
            badge: (e.first_name?.[0] || '').toUpperCase(),
            color: getBadgeColor(e.first_name)
          })));
        }
      });
  };

  const saveEmployee = () => {
    fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        first_name: form.name.split(' ')[0] || '',
        last_name: form.name.split(' ').slice(1).join(' ') || '',
        email: form.email,
        phone: form.contact,
        position: form.position,
        department: form.client || null,
        status: 'active',
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          closeModal();
          resetAll();
          refreshEmployees();
        } else {
          alert(data.message || 'Failed to save employee');
        }
      })
      .catch(() => alert('Failed to save employee'));
  };

  const openView = (emp) => setViewing(emp);
  const closeView = () => setViewing(null);

  // Fixed openEdit function - clear form for blank fields
  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: '',
      email: '',
      contact: '',
      address: '',
      position: '',
      client: ''
    });
    setIsAddOpen(false);
  };
  
  const closeEdit = () => { setEditing(null); resetAll(); };

  const updateEmployee = () => {
    if (!editing) return;
    const firstName = form.name.split(' ')[0] || '';
    const lastName = form.name.split(' ').slice(1).join(' ') || '';
    fetch(`/api/employees/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email: form.email,
        phone: form.contact,
        position: form.position,
        department: form.client || null,
        status: 'active'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          closeEdit();
          refreshEmployees();
        } else {
          alert(data.message || 'Failed to update employee');
        }
      })
      .catch(() => alert('Failed to update employee'));
  };

  const openDelete = (emp) => setDeleting(emp);
  const closeDelete = () => setDeleting(null);

  const confirmDelete = () => {
    if (!deleting) return;
    fetch(`/api/employees/${deleting.id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          closeDelete();
          refreshEmployees();
        } else {
          alert(data.message || 'Failed to delete employee');
        }
      })
      .catch(() => alert('Failed to delete employee'));
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden bg-white flex">
      <HomeSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-blue-600">Employees</h1>
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </button>
              <button className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">John F.</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  J
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <div className="col-span-3">Position</div>
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
                      <div className="col-span-3 text-gray-600">{e.position}</div>
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
              
              <div className="grid grid-cols-12 gap-4 mb-6">
                {/* Employee ID */}
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">EMP ID</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900 font-medium">{viewing.id || '19247'}</span>
                  </div>
                </div>
                
                {/* Full Name */}
                <div className="col-span-5">
                  <label className="block text-xs font-medium text-gray-500 mb-2">User ID</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900 font-medium">{viewing.name}</span>
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Password</label>
                  <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-gray-900">••••••••••</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <small className="text-xs text-gray-400 mt-1">Reset to Default</small>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Email</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.email || 'Christopher.Francisco@example.com'}</span>
                  </div>
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Phone</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.phone || '09123456789'}</span>
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 mb-2">Address</label>
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="text-gray-900">543 Zone 5 old brio street bacolod negros occ</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Client/Department */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Client</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.department || 'Cloud Service Center'}</span>
                  </div>
                </div>
                
                {/* Position */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Position</label>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-900">{viewing.position || 'Graphic Designer'}</span>
                  </div>
                </div>
              </div>
              
              {/* Issued Item */}
              <div className="mb-8">
                <label className="block text-xs font-medium text-gray-500 mb-2">Issued Item</label>
                <div className="bg-gray-100 rounded-lg p-4 min-h-[80px]">
                  <div className="bg-gray-300 rounded-lg h-6 w-full"></div>
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
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Name*</label>
                  <input 
                    value={form.name} 
                    onChange={update('name')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter full name" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Email*</label>
                  <input 
                    value={form.email} 
                    onChange={update('email')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter email address" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Contact no.</label>
                  <input 
                    value={form.contact} 
                    onChange={update('contact')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter phone number" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Position*</label>
                  <input 
                    value={form.position} 
                    onChange={update('position')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter job position" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 font-medium mb-2">Department</label>
                  <input 
                    value={form.client} 
                    onChange={update('client')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter department" 
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
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Name*</label>
                  <input 
                    value={form.name} 
                    onChange={update('name')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter Name" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Email*</label>
                  <input 
                    value={form.email} 
                    onChange={update('email')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter Email" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Contact no.</label>
                  <input 
                    value={form.contact} 
                    onChange={update('contact')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter Contact No." 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-2">Position*</label>
                  <input 
                    value={form.position} 
                    onChange={update('position')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter Position" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 font-medium mb-2">Department</label>
                  <input 
                    value={form.client} 
                    onChange={update('client')} 
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter Department" 
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