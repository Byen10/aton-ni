import React, { useState } from "react";
import {
  Eye,
  ArrowLeftRight,
  Folder,
  User,
  FileText,
  Users,
  Settings,
  Clock,
} from "lucide-react";
import { apiUtils } from "./services/api";
import { useEffect } from "react";

const HomeSidebar = ({ onSelect }) => {
  const [openTransaction, setOpenTransaction] = useState(true);
  const [openEquipment, setOpenEquipment] = useState(true);

  const isActive = (path) =>
    typeof window !== "undefined" &&
    window.location &&
    window.location.pathname === path;

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setOpenTransaction(false);
    setOpenEquipment(false);
  };

  // Auto-close dropdowns when other menu items are clicked
  const handleMenuClick = (path, event) => {
    if (event) {
      event.preventDefault();
    }
    
    // Close all dropdowns when clicking any main menu item
    closeAllDropdowns();
    
    // Simulate navigation (in real app, this would be handled by your router)
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = path;
      }, 100);
    }
  };

  // 🔹 Main links (Home, Employee, etc.) - Added motion animation
  const linkClass = (path) =>
  `inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out text-base font-semibold min-w-[140px] transform hover:scale-105 active:scale-95 ${
    isActive(path)
      ? "bg-white text-[#2262C6] shadow-sm scale-105"
      : "text-white hover:bg-white hover:text-[#2262C6] hover:shadow-sm"
  }`;

  // 🔹 Section buttons (Transaction, Equipment) - Added motion animation
  const sectionButtonClass = (active) =>
  `inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ease-out text-base font-semibold min-w-[140px] transform hover:scale-105 active:scale-95 ${
    active
      ? "bg-white text-[#2262C6] shadow-sm scale-105"
      : "text-white hover:bg-white hover:text-[#2262C6] hover:shadow-sm"
  }`;

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const normalizePermissions = (user) => {
      if (!user) return [];
      if (typeof user.role === 'object' && user.role) {
        if (Array.isArray(user.role.permissions)) return user.role.permissions;
        if (typeof user.role.permissions === 'string') {
          try { return JSON.parse(user.role.permissions); } catch { return []; }
        }
      }
      return [];
    };

    const computeIsSuperAdmin = (user) => {
      if (!user) return false;
      // Role can be a string or object; permissions may be array or JSON string
      const roleName = typeof user.role === 'string' ? user.role : user.role?.name;
      const perms = normalizePermissions(user);
      return roleName === 'super_admin' || (Array.isArray(perms) && perms.includes('*'));
    };

    const checkUserRole = async () => {
      // First check localStorage
      const localUser = apiUtils.getCurrentUser();
      if (localUser && localUser.role) {
        const isSA = computeIsSuperAdmin(localUser);
        console.debug('[Sidebar] local role:', (typeof localUser.role === 'string' ? localUser.role : localUser.role?.name), 'isSuperAdmin:', isSA);
        setIsSuperAdmin(isSA);
        setPermissions(normalizePermissions(localUser));
        return;
      }

      // Fallback to session-based auth endpoint
      try {
        const response = await fetch('/check-auth', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data?.authenticated && data.user) {
            // Normalize to match apiUtils expectations
            const normalized = {
              ...data.user,
              role: { name: data.user.role, display_name: data.user.role_display, permissions: data.user.permissions },
            };
            localStorage.setItem('user', JSON.stringify(normalized));
            const isSA = computeIsSuperAdmin(normalized);
            console.debug('[Sidebar] fetched role:', normalized.role?.name, 'isSuperAdmin:', isSA);
            setIsSuperAdmin(isSA);
            setPermissions(normalizePermissions(normalized));
          } else {
            setIsSuperAdmin(false);
            setPermissions([]);
          }
        } else {
          setIsSuperAdmin(false);
          setPermissions([]);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsSuperAdmin(false);
        setPermissions([]);
      }
    };

    checkUserRole();
  }, []);

  const can = (perm) => {
    if (isSuperAdmin) return true;
    if (!perm) return false;
    // If permissions are not loaded or empty, default to showing menus
    if (!permissions || (Array.isArray(permissions) && permissions.length === 0)) return true;
    return Array.isArray(permissions) && (permissions.includes('*') || permissions.includes(perm));
  };

  return (
    <div className="flex flex-col">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-3">
        <img
          src="/images/Frame_89-removebg-preview.png"
          alt="iREPLY Logo"
          className="h-16 w-auto"
        />
      </div>

      {/* Sidebar */}
      <aside className="w-57 bg-gradient-to-b from-[#0064FF] to-[#053786] text-white flex flex-col h-screen overflow-hidden rounded-tr-[72px]">
        {/* Navigation */}
        <nav className="flex-1 min-h-0 px-3 py-4 mt-4 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Home */}
          {can('dashboard') && (
          <a href="/dashboard" className={linkClass("/dashboard")} onClick={(e) => handleMenuClick("/dashboard", e)}>
            <Eye className="h-5 w-5" />
            <span>Home</span>
          </a>
          )}

          {/* Transaction */}
          {(can('view_request') || can('view_approve')) && (
            <>
          <button
            className={sectionButtonClass(
              isActive("/viewrequest") || isActive("/viewapproved")
            )}
            onClick={() => {
              if (openTransaction) {
                // If currently open, close it
                setOpenTransaction(false);
              } else {
                // If currently closed, close equipment dropdown and open transaction
                setOpenEquipment(false);
                setOpenTransaction(true);
              }
            }}
          >
            <ArrowLeftRight className="h-5 w-5" />
            <span>Transaction</span>
            <span className="ml-auto text-xs">
              {openTransaction ? "▾" : "▸"}
            </span>
          </button>
          {openTransaction && (
            <ul className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {can('view_request') && (
              <li>
                <a
                  href="/viewrequest"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/viewrequest")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  View Request
                </a>
              </li>
                  )}
                  {can('view_approve') && (
              <li>
                <a
                  href="/viewapproved"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/viewapproved")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  View Approved
                </a>
              </li>
                  )}
            </ul>
              )}
            </>
          )}

          {/* Equipment */}
          {(can('equipment_inventory') || can('add_stocks')) && (
            <>
          <button
            className={sectionButtonClass(
              isActive("/equipment") || isActive("/addstocks")
            )}
            onClick={() => {
              if (openEquipment) {
                // If currently open, close it
                setOpenEquipment(false);
              } else {
                // If currently closed, close transaction dropdown and open equipment
                setOpenTransaction(false);
                setOpenEquipment(true);
              }
            }}
          >
            <Folder className="h-5 w-5" />
            <span>Equipment</span>
            <span className="ml-auto text-xs">
              {openEquipment ? "▾" : "▸"}
            </span>
          </button>
          {openEquipment && (
            <ul className="ml-6 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {can('equipment_inventory') && (
              <li>
                <a
                  href="/equipment"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/equipment")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  Inventory
                </a>
              </li>
                  )}
                  {can('add_stocks') && (
              <li>
                <a
                  href="/addstocks"
                  className={`inline-block px-3 py-1 rounded-full text-sm w-fit transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive("/addstocks")
                      ? "bg-white text-[#2262C6] shadow-sm scale-105"
                      : "text-white/90 hover:bg-white hover:text-[#2262C6]"
                  }`}
                >
                  Add Stocks
                </a>
              </li>
                  )}
            </ul>
              )}
            </>
          )}

          {/* Other Menus */}
          {can('employee') && (
          <a href="/employee" className={linkClass("/employee")} onClick={(e) => handleMenuClick("/employee", e)}>
            <User className="h-5 w-5" />
            <span>Employee</span>
          </a>
          )}

          {can('reports') && (
          <a href="/reports" className={linkClass("/reports")} onClick={(e) => handleMenuClick("/reports", e)}>
            <FileText className="h-5 w-5" />
            <span>Reports</span>
          </a>
          )}

          {isSuperAdmin && (
            <a href="/role-management" className={linkClass("/role-management")} onClick={(e) => handleMenuClick("/role-management", e)}>
              <Users className="h-5 w-5" />
              <span>Role Management</span>
            </a>
          )}

          {can('control_panel') && (
          <a href="/control-panel" className={linkClass("/control-panel")} onClick={(e) => handleMenuClick("/control-panel", e)}>
            <Settings className="h-5 w-5" />
            <span>Control Panel</span>
          </a>
          )}

          {can('activity_logs') && (
          <a href="/activitylogs" className={linkClass("/activitylogs")} onClick={(e) => handleMenuClick("/activitylogs", e)}>
            <Clock className="h-5 w-5" />
            <span>Activity Logs</span>
          </a>
          )}

          {can('users') && (
          <a href="/users" className={linkClass("/users")} onClick={(e) => handleMenuClick("/users", e)}>
            <User className="h-5 w-5" />
            <span>Users</span>
          </a>
          )}
        </nav>
      </aside>
    </div>
  );
};

export default HomeSidebar;