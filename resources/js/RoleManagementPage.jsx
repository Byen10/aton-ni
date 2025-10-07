import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, MoreVertical, Save, ArrowRight, Check } from "lucide-react";
import HomeSidebar from "./HomeSidebar";
import GlobalHeader from "./components/GlobalHeader";
import { roleService, userService, apiUtils } from "./services/api";

const RoleManagementPage = () => {
  const [admins, setAdmins] = useState([]);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({ name: "", display_name: "", description: "" });
  const [overlay, setOverlay] = useState({ visible: false, status: 'idle', message: '' });

  // This list controls which items appear in the checkbox list and how they map to backend permission strings
  const permissionKeys = [
    { key: 'dashboard', label: 'Home', api: 'dashboard' },
    { key: 'viewRequest', label: 'Transaction • View Request', api: 'view_request' },
    { key: 'viewApprove', label: 'Transaction • View Approved', api: 'view_approve' },
    { key: 'inventory', label: 'Equipment • Inventory', api: 'equipment_inventory' },
    { key: 'addStocks', label: 'Equipment • Add Stocks', api: 'add_stocks' },
    { key: 'employee', label: 'Employee', api: 'employee' },
    { key: 'reports', label: 'Reports', api: 'reports' },
    { key: 'controlPanel', label: 'Control Panel', api: 'control_panel' },
    { key: 'activityLogs', label: 'Activity Logs', api: 'activity_logs' },
    { key: 'users', label: 'Users', api: 'users' },
  ];

  const buildAccessToolsFromPermissions = (permissionsArray) => {
    const normalized = Array.isArray(permissionsArray)
      ? permissionsArray
      : (typeof permissionsArray === 'string' ? (() => { try { return JSON.parse(permissionsArray); } catch { return []; } })() : []);
    const access = {};
    for (const item of permissionKeys) {
      access[item.key] = normalized.includes(item.api || item.key);
    }
    return access;
  };

  const mapUserToAdmin = (user) => {
    const role = user.role || {};
    const permissions = role.permissions || [];
    const accessTools = buildAccessToolsFromPermissions(permissions);
    return {
      id: user.id,
      name: user.name,
      // In Admin list, always reflect the role title first
      position: role.display_name || user.position || '',
      profileImage: null,
      accessTools,
      _user: user,
      _role: role,
    };
  };

  useEffect(() => {
    const load = async () => {
      // Client guard: only super_admin may access
      // First check localStorage
      let user = apiUtils.getCurrentUser();
      
      // If no user in localStorage or no role info, try to fetch from server
      if (!user || !user.role) {
        try {
          const response = await fetch('/check-auth', { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated && data.user) {
              user = {
                ...data.user,
                role: { name: data.user.role, display_name: data.user.role_display }
              };
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(user));
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      
      // Check if user has super_admin role
      const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
      if (roleName !== 'super_admin') {
        window.location.href = '/dashboard';
        return;
      }
      
      const res = await userService.getAll();
      const adminsData = res?.data?.admins || [];
      // Filter out super_admin accounts
      const filteredAdmins = adminsData.filter(admin => 
        admin.role?.name !== 'super_admin' && 
        admin.role?.display_name !== 'Super Admin'
      );
      const items = filteredAdmins.map(mapUserToAdmin);
      setAdmins(items);
      setSelectedAdmin(items[0] || null);
    };
    load();
  }, []);

  const handleAddRole = async () => {
    if (!newRole.name || !newRole.display_name) return;
    const res = await roleService.create({
      name: newRole.name,
      display_name: newRole.display_name,
      description: newRole.description,
      permissions: [],
    });
    const created = mapRoleToAdmin(res.data);
    setAdmins([...admins, created]);
    setNewRole({ name: "", display_name: "", description: "" });
    setShowAddModal(false);
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;
    const res = await roleService.update(selectedRole.id, {
      name: newRole.name,
      display_name: newRole.display_name,
      description: newRole.description,
    });
    const updated = mapRoleToAdmin(res.data);
    setAdmins(admins.map(a => a.id === updated.id ? updated : a));
    if (selectedAdmin?.id === updated.id) setSelectedAdmin(updated);
    setSelectedRole(null);
    setNewRole({ name: "", display_name: "", description: "" });
    setShowEditModal(false);
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    await roleService.delete(selectedRole.id);
    const filtered = admins.filter(admin => admin.id !== selectedRole.id);
    setAdmins(filtered);
    if (selectedAdmin?.id === selectedRole.id) {
      setSelectedAdmin(filtered[0] || null);
    }
    setSelectedRole(null);
    setShowDeleteModal(false);
  };

  const openEditModal = (admin) => {
    setSelectedRole(admin);
    setNewRole({ name: admin._raw?.name || '', display_name: admin.name, description: admin.position });
    setShowEditModal(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedRole(admin);
    setShowDeleteModal(true);
  };

  const handleAccessToolChange = (tool) => {
    setSelectedAdmin({
      ...selectedAdmin,
      accessTools: {
        ...selectedAdmin.accessTools,
        [tool]: !selectedAdmin.accessTools[tool]
      }
    });
  };

  const handleSaveAccessTools = async () => {
    if (!selectedAdmin) return;
    setOverlay({ visible: true, status: 'saving', message: 'Saving changes...' });
    const permissions = [];
    for (const item of permissionKeys) {
      if (selectedAdmin.accessTools[item.key]) {
        permissions.push(item.api || item.key);
      }
    }
    const roleId = selectedAdmin._role?.id;
    if (!roleId) return;
    const res = await roleService.setPermissions(roleId, permissions);
    const updatedRole = res.data;
    const updatedAdmin = mapUserToAdmin({ ...selectedAdmin._user, role: updatedRole });
    setAdmins(admins.map(a => a.id === updatedAdmin.id ? updatedAdmin : a));
    setSelectedAdmin(updatedAdmin);

    // If we just changed the role of the CURRENT logged-in user, refresh local user so sidebar updates
    try {
      const current = apiUtils.getCurrentUser();
      const currentRoleName = typeof current?.role === 'string' ? current.role : current?.role?.name;
      const changedRoleName = updatedAdmin?._role?.name;
      if (current && changedRoleName && currentRoleName === changedRoleName) {
        const resAuth = await fetch('/check-auth', { credentials: 'include' });
        if (resAuth.ok) {
          const data = await resAuth.json();
          if (data?.authenticated && data.user) {
            const normalized = {
              ...data.user,
              role: { name: data.user.role, display_name: data.user.role_display, permissions: data.user.permissions }
            };
            localStorage.setItem('user', JSON.stringify(normalized));
          }
        }
      }
    } catch (e) {
      console.warn('Failed to refresh current user after permission save:', e);
    }
    // Show centered success and auto-hide
    setOverlay({ visible: true, status: 'success', message: 'Changes updated' });
    setTimeout(() => setOverlay({ visible: false, status: 'idle', message: '' }), 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <HomeSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <GlobalHeader title="Role Management" />
        <main className="px-10 py-6 mb-10 flex flex-row gap-8 overflow-hidden">
        {/* Left Panel - Admin Lists */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
           <h1 className="text-3xl font-extrabold text-blue-600">Role Management</h1>
          <p className="text-2xl font-semibold text-gray-500 mt-4">Admin Lists</p>
          </div>
          
          {/* Table Headers */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-medium text-gray-800 uppercase tracking-wider">
            <div>Names</div>
            <div>Positions</div>
          </div>
          
          {/* Admin List */}
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                onClick={() => setSelectedAdmin(admin)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedAdmin?.id === admin.id
                    ? 'bg-blue-50 border-blue-200 shadow'
                    : 'bg-white border-gray-200 hover:shadow'
                }`}
              >
                <div className="grid grid-cols-2 items-center">
                  <div className="font-semibold text-gray-600 truncate">{admin.name}</div>
                  <div className="text-right text-gray-900 uppercase text-meduim tracking-wide">{admin.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Panel - Admin Details */}
        <div className="w-full max-w-xs">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col h-[calc(100vh-200px)]">
            {/* Profile Section */}
            <div className="text-center mb-6 flex-shrink-0">
              {selectedAdmin?.profileImage ? (
                <img src={selectedAdmin.profileImage} alt={selectedAdmin.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">
                    {selectedAdmin?.name ? selectedAdmin.name.split(' ').map(n => n[0]).join('') : ''}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{selectedAdmin?.name || ''}</h3>
              <p className="text-gray-500">{selectedAdmin?.position || ''}</p>
            </div>
            
            {/* Access Tools Section - Scrollable */}
            <div className="flex-1 overflow-y-auto mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4 sticky top-0 bg-white pb-2">Access tools</h4>
              <div className="space-y-3 pr-2">
                {selectedAdmin && permissionKeys.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={!!selectedAdmin.accessTools?.[item.key]}
                      onChange={() => handleAccessToolChange(item.key)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Save Button - Fixed at bottom */}
            <button
              onClick={handleSaveAccessTools}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex-shrink-0"
              disabled={overlay.visible && overlay.status === 'saving'}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
        </main>
      </div>
      
      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Admin</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Name</label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter admin name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter position"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRole(null);
                    setNewRole({ name: "", description: "" });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Update Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Admin</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete the admin "{selectedRole?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRole(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRole}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen loading/success overlay */}
      {overlay.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex items-center gap-3">
            {overlay.status === 'saving' ? (
              <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            ) : (
              <div className="text-green-600"><Check className="h-6 w-6" /></div>
            )}
            <span className="text-base font-semibold text-gray-800">{overlay.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;