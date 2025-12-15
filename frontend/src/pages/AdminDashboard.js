import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  BookOpen,
  Package,
  MapPin,
  UserCheck,
  Trash2,
  DollarSign,
  Activity,
  Loader,
  ArrowUp,
  ArrowDown,
  Eye,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

const AdminDashboard = ({ isEmbedded = false }) => {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    poojas: 0,
    products: 0,
    temples: 0,
    pandits: 0,
    wasteRequests: 0,
    bookings: 0,
    revenue: 0,
    pendingOrders: 0,
    pendingPandits: 0,
    activePoojas: 0,
    pendingWasteRequests: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load main stats
      const statsResponse = await api.get("/admin/dashboard/stats");
      if (statsResponse.data) {
        setStats({
          users: statsResponse.data.totalUsers || 0,
          orders: statsResponse.data.totalOrders || 0,
          poojas: statsResponse.data.totalPoojas || 0,
          products: statsResponse.data.totalProducts || 0,
          temples: statsResponse.data.totalTemples || 0,
          pandits: statsResponse.data.totalPandits || 0,
          wasteRequests: statsResponse.data.totalWasteRequests || 0,
          bookings: statsResponse.data.totalBookings || 0,
          revenue: statsResponse.data.totalRevenue || 0,
          pendingOrders: statsResponse.data.pendingOrders || 0,
          pendingPandits: statsResponse.data.pendingPandits || 0,
          activePoojas: statsResponse.data.activePoojas || 0,
          pendingWasteRequests: statsResponse.data.pendingWasteRequests || 0,
          totalCourses: statsResponse.data.totalCourses || 0,
        });
      }

      // Try to load recent activities
      try {
        const activitiesResponse = await api.get("/admin/recent-activities");
        if (activitiesResponse.data?.activities) {
          setRecentActivities(activitiesResponse.data.activities);
        }
      } catch (e) {
        // Use placeholder activities if API not available
        setRecentActivities([]);
      }

      // Try to load recent orders
      try {
        const ordersResponse = await api.get("/admin/orders?limit=5");
        if (ordersResponse.data?.orders) {
          setRecentOrders(ordersResponse.data.orders);
        }
      } catch (e) {
        setRecentOrders([]);
      }

      // Try to load top products
      try {
        const productsResponse = await api.get("/admin/products?limit=5&featured=true");
        if (productsResponse.data?.products) {
          setTopProducts(productsResponse.data.products);
        }
      } catch (e) {
        setTopProducts([]);
      }

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      color: "blue",
      link: "/admin/users",
    },
    {
      title: "Total Orders",
      value: stats.orders,
      icon: ShoppingBag,
      color: "green",
      link: "/admin/orders",
    },
    {
      title: "Total Revenue",
      value: `₹${((stats.revenue || 0) / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: "purple",
      link: "/admin/orders",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "yellow",
      link: "/admin/orders",
    },
    {
      title: "Total Poojas",
      value: stats.poojas,
      icon: BookOpen,
      color: "orange",
      link: "/admin/poojas",
    },
    {
      title: "Active Poojas",
      value: stats.activePoojas,
      icon: CheckCircle,
      color: "emerald",
      link: "/admin/poojas",
    },
    {
      title: "Total Products",
      value: stats.products,
      icon: Package,
      color: "indigo",
      link: "/admin/products",
    },
    {
      title: "Total Temples",
      value: stats.temples,
      icon: MapPin,
      color: "pink",
      link: "/admin/temples",
    },
    {
      title: "Active Pandits",
      value: stats.pandits,
      icon: UserCheck,
      color: "teal",
      link: "/admin/pandits",
      badge: stats.pendingPandits > 0 ? `${stats.pendingPandits} pending` : null,
    },
    {
      title: "Waste Requests",
      value: stats.wasteRequests,
      icon: Trash2,
      color: "lime",
      link: "/admin/waste-requests",
      badge: stats.pendingWasteRequests > 0 ? `${stats.pendingWasteRequests} pending` : null,
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: Calendar,
      color: "cyan",
      link: "/admin/orders",
    },
    {
      title: "Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "rose",
      link: "/admin/courses",
    },
  ];

  const quickActions = [
    {
      title: "Add Pooja",
      icon: BookOpen,
      link: "/admin/poojas/add",
      color: "orange",
      description: "Create new pooja with samagri",
    },
    {
      title: "Add Product",
      icon: Package,
      link: "/admin/products/add",
      color: "green",
      description: "Add new product to shop",
    },
    {
      title: "Add Temple",
      icon: MapPin,
      link: "/admin/temples/add",
      color: "purple",
      description: "Add temple to directory",
    },
    {
      title: "Manage Pandits",
      icon: UserCheck,
      link: "/admin/pandits",
      color: "blue",
      description: "Review pandit applications",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" },
    green: { bg: "bg-green-500", light: "bg-green-50", text: "text-green-600" },
    purple: { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600" },
    yellow: { bg: "bg-yellow-500", light: "bg-yellow-50", text: "text-yellow-600" },
    orange: { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600" },
    emerald: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
    indigo: { bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600" },
    pink: { bg: "bg-pink-500", light: "bg-pink-50", text: "text-pink-600" },
    teal: { bg: "bg-teal-500", light: "bg-teal-50", text: "text-teal-600" },
    lime: { bg: "bg-lime-500", light: "bg-lime-50", text: "text-lime-600" },
    cyan: { bg: "bg-cyan-500", light: "bg-cyan-50", text: "text-cyan-600" },
    rose: { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600" },
    red: { bg: "bg-red-500", light: "bg-red-50", text: "text-red-600" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const content = (
    <>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with Sanskaar today.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color] || colorClasses.blue;

          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-orange-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.badge && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full animate-pulse">
                    {stat.badge}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colors = colorClasses[action.color] || colorClasses.orange;

            return (
              <Link
                key={index}
                to={action.link}
                className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all hover:scale-105 ${colors.light} hover:shadow-md`}
              >
                <div className={`p-3 rounded-full ${colors.bg} mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`font-semibold text-sm ${colors.text}`}>{action.title}</span>
                <span className="text-xs text-gray-500 text-center mt-1">{action.description}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity / Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">System Status</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Active Poojas</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.activePoojas}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Products Listed</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.products}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Temples Directory</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.temples}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">Verified Pandits</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{stats.pandits}</span>
            </div>

            {stats.pendingPandits > 0 && (
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Pending Approvals</span>
                </div>
                <Link
                  to="/admin/pandits"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Review {stats.pendingPandits}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Revenue & Quick Stats */}
        <div className="space-y-6">
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Total Revenue</h3>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">
              ₹{((stats.revenue || 0) / 1000).toFixed(2)}K
            </p>
            <div className="flex items-center gap-2 text-orange-100">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">From {stats.orders} orders</span>
            </div>
          </div>

          {/* Waste Collection Stats */}
          {stats.wasteRequests > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Eco Waste Collection</h3>
                <Trash2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.wasteRequests}</p>
                  <p className="text-xs text-gray-600">Total Requests</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingWasteRequests}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>
              {stats.pendingWasteRequests > 0 && (
                <Link
                  to="/admin/waste-requests"
                  className="mt-4 w-full block text-center py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Process Requests
                </Link>
              )}
            </div>
          )}

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Featured Products</h3>
              <div className="space-y-3">
                {topProducts.slice(0, 3).map((product, index) => (
                  <div
                    key={product._id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.mainImage || "https://via.placeholder.com/40"}
                        alt={product.name?.english}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-900 text-sm">
                        {product.name?.english || "Product"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-orange-600">
                      ₹{product.price || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // If embedded (used within AdminLayout from App.js), just return content
  // Otherwise, this shouldn't happen with new routing, but keep for safety
  return content;
};

export default AdminDashboard;
