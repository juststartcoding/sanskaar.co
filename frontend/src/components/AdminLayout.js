import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  MapPin,
  BookOpen,
  UserCheck,
  Trash2,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  User,
  Home,
  ChevronLeft,
  Database,
  Music,
  Sparkles,
  ScrollText,
  FileText,
  Calendar,
} from "lucide-react";
import api from "../services/api";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ pendingPandits: 0, pendingWaste: 0 });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadQuickStats();
    // Auto-expand master data menu if on master data page
    if (location.pathname.includes("/admin/master")) {
      setMasterDataOpen(true);
    }
  }, [location.pathname]);

  const loadQuickStats = async () => {
    try {
      const response = await api.get("/admin/dashboard/stats");
      if (response.data) {
        setStats({
          pendingPandits: response.data.pendingPandits || 0,
          pendingWaste: response.data.pendingWasteRequests || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
      badge: null,
    },
    {
      title: "Products",
      icon: Package,
      path: "/admin/products",
      badge: null,
    },
    {
      title: "Temples",
      icon: MapPin,
      path: "/admin/temples",
      badge: null,
    },
    {
      title: "Pandits",
      icon: UserCheck,
      path: "/admin/pandits",
      badge: stats.pendingPandits > 0 ? stats.pendingPandits : null,
    },
    {
      title: "Orders",
      icon: ShoppingBag,
      path: "/admin/orders",
      badge: null,
    },
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
      badge: null,
    },
    {
      title: "Waste Requests",
      icon: Trash2,
      path: "/admin/waste-requests",
      badge: stats.pendingWaste > 0 ? stats.pendingWaste : null,
    },
  ];

  const masterDataItems = [
    { title: "Pooja Steps", icon: ScrollText, path: "/admin/master/steps" },
    { title: "Mantras", icon: Music, path: "/admin/master/mantras" },
    { title: "Deities", icon: Sparkles, path: "/admin/master/deities" },
    { title: "Aartis", icon: Music, path: "/admin/master/aartis" },
    {
      title: "Pooja Templates",
      icon: FileText,
      path: "/admin/master/templates",
    },
    {
      title: "Muhurat Calendar",
      icon: Calendar,
      path: "/admin/master/muhurat-calendar",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return (
        location.pathname === "/admin/dashboard" ||
        location.pathname === "/admin"
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-gradient-to-b from-orange-600 via-orange-700 to-red-700 text-white transition-all duration-300 flex flex-col shadow-2xl fixed h-full z-30`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-orange-500/30">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/logo.jpeg"
                  alt="Sanskaar"
                  className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">Sanskaar</h1>
                  <p className="text-xs text-orange-200">Admin Panel</p>
                </div>
              </Link>
            )}
            {sidebarCollapsed && (
              <Link to="/" className="mx-auto">
                <img
                  src="/logo.jpeg"
                  alt="Sanskaar"
                  className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                />
              </Link>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-orange-500/30 rounded-lg transition-colors hidden md:block"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform ${
                  sidebarCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Back to Site Link */}
        {!sidebarCollapsed && (
          <Link
            to="/"
            className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 text-orange-200 hover:text-white hover:bg-orange-500/30 rounded-lg transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Back to Website</span>
          </Link>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mx-2 mb-1 rounded-xl transition-all ${
                  active
                    ? "bg-white text-orange-600 shadow-lg"
                    : "text-white/90 hover:bg-white/10"
                }`}
                title={sidebarCollapsed ? item.title : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.title}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.badge && (
                  <span className="absolute left-12 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Master Data Submenu */}
          {!sidebarCollapsed && (
            <div className="mx-2 mb-1">
              <button
                onClick={() => setMasterDataOpen(!masterDataOpen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname.includes("/admin/master")
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                <Database className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 font-medium text-left">
                  Master Data
                </span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    masterDataOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {masterDataOpen && (
                <div className="mt-1 ml-4 border-l-2 border-white/20 pl-2">
                  {masterDataItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${
                          active
                            ? "bg-white text-orange-600"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Settings Link */}
        <div className="px-2 pb-2">
          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-white/80 hover:bg-white/10 transition-all`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </Link>
        </div>

        {/* User Profile */}
        <div className="border-t border-orange-500/30 p-4">
          {!sidebarCollapsed ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-2 hover:bg-orange-500/30 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm truncate">
                    {user.name || "Admin"}
                  </p>
                  <p className="text-xs text-orange-200 truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white text-gray-900 rounded-xl shadow-xl overflow-hidden">
                  <Link
                    to="/admin/settings"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 hover:bg-orange-500/30 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb / Page Title */}
              <div>
                <nav className="text-sm text-gray-500">
                  <span>Admin</span>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900 font-medium capitalize">
                    {location.pathname.split("/").pop().replace("-", " ") ||
                      "Dashboard"}
                  </span>
                </nav>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {(stats.pendingPandits > 0 || stats.pendingWaste > 0) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role || "Administrator"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
