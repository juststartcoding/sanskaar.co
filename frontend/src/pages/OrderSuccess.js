import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, Truck, Home, ShoppingBag } from "lucide-react";
import api from "../services/api";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/shop/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-green-300 rounded-full animate-ping opacity-20" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">Thank you for your order. We'll send you a confirmation email shortly.</p>

        {orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-xl font-mono font-bold text-gray-900">{orderId}</p>
          </div>
        )}

        {/* Order Timeline */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs text-gray-600">Confirmed</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2">
            <div className="h-full bg-green-500 w-1/3" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs text-gray-600">Packing</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-xs text-gray-600">Shipped</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 mx-2" />
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-2">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-xs text-gray-600">Delivered</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/orders"
            className="block w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
          >
            View My Orders
          </Link>
          <Link
            to="/shop"
            className="block w-full py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
