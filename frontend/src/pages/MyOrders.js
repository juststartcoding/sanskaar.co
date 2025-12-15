import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag, Loader } from "lucide-react";
import api from "../services/api";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/shop/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Mock data for demo
      setOrders([
        { _id: "ORD001", createdAt: new Date(), total: 2499, status: "delivered", items: [{ product: { name: { english: "Brass Diya Set" } }, quantity: 2 }] },
        { _id: "ORD002", createdAt: new Date(Date.now() - 86400000), total: 1850, status: "shipped", items: [{ product: { name: { english: "Pooja Thali" } }, quantity: 1 }] },
        { _id: "ORD003", createdAt: new Date(Date.now() - 172800000), total: 3200, status: "processing", items: [{ product: { name: { english: "Kumkum Set" } }, quantity: 3 }] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped": return <Truck className="w-5 h-5 text-blue-500" />;
      case "processing": return <Package className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-orange-100 text-orange-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "processing", "shipped", "delivered", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                filter === f ? "bg-orange-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order._id}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="border-t border-b border-gray-100 py-4 my-4">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 mb-2 last:mb-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product?.name?.english || "Product"}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-sm text-gray-500 mt-2">+{order.items.length - 2} more items</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-xl font-bold text-gray-900">₹{order.total?.toLocaleString()}</p>
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="flex items-center gap-1 text-orange-600 font-medium hover:text-orange-700"
                    >
                      View Details
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
