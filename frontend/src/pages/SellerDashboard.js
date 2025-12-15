import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, ShoppingBag, DollarSign, TrendingUp,
  Plus, Edit, Eye, Settings, LogOut, AlertCircle
} from 'lucide-react';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStock: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setStats({
      totalProducts: 45,
      totalOrders: 234,
      pendingOrders: 12,
      totalRevenue: 456000,
      lowStock: 5
    });
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      link: '/seller/products'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'from-green-500 to-green-600',
      link: '/seller/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      link: '/seller/orders?status=pending'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      link: '/seller/earnings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your store and products</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/seller/products/new"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Link>
              <Link
                to="/seller/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6" />
              </Link>
              <Link
                to="/logout"
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`h-2 bg-gradient-to-r ${stat.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Low Stock Alert */}
        {stats.lowStock > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900">Low Stock Alert</p>
              <p className="text-sm text-yellow-800">
                {stats.lowStock} products are running low on stock. Please restock soon.
              </p>
            </div>
            <Link
              to="/seller/products?filter=low-stock"
              className="ml-auto bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium whitespace-nowrap"
            >
              View Products
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/seller/products"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <Package className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Manage Products</h3>
          </Link>
          <Link
            to="/seller/orders"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <ShoppingBag className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Manage Orders</h3>
          </Link>
          <Link
            to="/seller/earnings"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <DollarSign className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">View Earnings</h3>
          </Link>
          <Link
            to="/seller/analytics"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <TrendingUp className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Analytics</h3>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link to="/seller/orders" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Products</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">#{1000 + i}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">Customer {i}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{Math.floor(Math.random() * 3) + 1} items</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      ₹{(Math.random() * 3000 + 500).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-semibold">
                        Pending
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;