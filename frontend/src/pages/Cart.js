import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, getCartTotal, getCartCount } = useApp();
  const navigate = useNavigate();

  // Safety check for cart
  const safeCart = Array.isArray(cart) ? cart : [];

  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart to continue shopping</p>
          <Link
            to="/shop"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const cartTotal = getCartTotal ? getCartTotal() : 0;
  const cartCount = getCartCount ? getCartCount() : safeCart.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {safeCart.map((item) => {
              const itemId = item.id || item._id;
              const itemQuantity = item.quantity || 1;
              const itemPrice = item.discountPrice || item.price || 0;
              const itemTotal = itemPrice * itemQuantity;

              return (
                <div key={itemId} className="bg-white rounded-lg shadow-md p-6 flex gap-4">
                  <img
                    src={item.mainImage || 'https://via.placeholder.com/150'}
                    alt={item.name?.english || 'Product'}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {item.name?.english || 'Product Name'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{item.category || 'Product'}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => {
                            if (updateCartQuantity) {
                              const newQuantity = Math.max(1, itemQuantity - 1);
                              updateCartQuantity(itemId, newQuantity);
                            }
                          }}
                          className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                          disabled={itemQuantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 font-semibold min-w-[3rem] text-center">
                          {itemQuantity}
                        </span>
                        <button
                          onClick={() => {
                            if (updateCartQuantity) {
                              updateCartQuantity(itemId, itemQuantity + 1);
                            }
                          }}
                          className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        ₹{itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (removeFromCart) {
                        removeFromCart(itemId);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 p-2 transition-colors"
                    title="Remove from cart"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (included)</span>
                  <span>₹0.00</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
              </button>
              <Link
                to="/shop"
                className="block w-full text-center text-orange-600 py-3 mt-3 hover:text-orange-700 font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;