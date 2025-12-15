import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Calendar, Heart, Users, BookOpen, MapPin, Settings, LogOut, Clock, Star, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const UserDashboard = () => {
  const { user, logout } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, savedPoojas: 0, upcomingBookings: 0, wishlistItems: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recommendedPoojas, setRecommendedPoojas] = useState([]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch orders
      try {
        const ordersRes = await api.get('/shop/orders');
        const orders = ordersRes.data.orders || [];
        setRecentOrders(orders.slice(0, 3));
        setStats(prev => ({ ...prev, totalOrders: orders.length }));
      } catch (e) {
        setRecentOrders([
          { _id: 'ORD12345', createdAt: new Date(), items: [{ quantity: 3 }], total: 2499, status: 'delivered' },
          { _id: 'ORD12344', createdAt: new Date(Date.now() - 86400000 * 2), items: [{ quantity: 2 }], total: 1850, status: 'shipped' },
        ]);
        setStats(prev => ({ ...prev, totalOrders: 12 }));
      }

      // Fetch bookings
      try {
        const bookingsRes = await api.get('/user/bookings');
        const bookings = bookingsRes.data.bookings || [];
        setUpcomingBookings(bookings.filter(b => new Date(b.date) > new Date()).slice(0, 2));
        setStats(prev => ({ ...prev, upcomingBookings: bookings.length }));
      } catch (e) {
        setUpcomingBookings([
          { _id: 1, pooja: 'Satyanarayan Katha', pandit: 'Pt. Rajesh Sharma', date: '2024-12-20', time: '10:00 AM', status: 'confirmed' },
        ]);
        setStats(prev => ({ ...prev, upcomingBookings: 2 }));
      }

      // Fetch poojas
      try {
        const poojasRes = await api.get('/poojas?limit=3');
        setRecommendedPoojas(poojasRes.data.poojas || poojasRes.data || []);
      } catch (e) { setRecommendedPoojas([]); }

      setStats(prev => ({ ...prev, savedPoojas: 8, wishlistItems: 15 }));
    } catch (error) { console.error('Error:', error); } 
    finally { setLoading(false); }
  };

  const quickLinks = [
    { title: 'My Orders', icon: ShoppingBag, link: '/orders', count: stats.totalOrders, color: 'blue' },
    { title: 'Bookings', icon: Calendar, link: '/bookings', count: stats.upcomingBookings, color: 'green' },
    { title: 'Saved Poojas', icon: BookOpen, link: '/saved-poojas', count: stats.savedPoojas, color: 'orange' },
    { title: 'Wishlist', icon: Heart, link: '/wishlist', count: stats.wishlistItems, color: 'red' },
    { title: 'Family Tree', icon: Users, link: '/family-tree', count: null, color: 'purple' },
    { title: 'Addresses', icon: MapPin, link: '/addresses', count: null, color: 'indigo' }
  ];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-orange-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-orange-600 shadow-lg">{user?.name?.charAt(0) || 'U'}</div>
              <div className="text-white">
                <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name || 'User'}!</h1>
                <p className="text-orange-100">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/settings" className="p-2 text-white hover:bg-white/20 rounded-lg"><Settings className="w-6 h-6" /></Link>
              <button onClick={logout} className="p-2 text-white hover:bg-white/20 rounded-lg"><LogOut className="w-6 h-6" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {quickLinks.map((link, idx) => (
            <Link key={idx} to={link.link} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all text-center group">
              <div className={`w-12 h-12 bg-${link.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <link.icon className={`w-6 h-6 text-${link.color}-600`} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{link.title}</h3>
              {link.count !== null && <p className="text-xs text-gray-500 mt-1">{link.count} items</p>}
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Recent Orders</h2>
              <Link to="/orders" className="text-orange-600 text-sm font-medium">View All →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No orders yet</p>
                <Link to="/shop" className="text-orange-600 font-medium">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order._id} className="border-2 border-gray-100 rounded-lg p-4 hover:border-orange-300">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">Order #{order._id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{order.items?.reduce((a, i) => a + (i.quantity || 1), 0)} items</span>
                      <span className="font-bold">₹{order.total?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Upcoming Bookings</h2>
              <Link to="/bookings" className="text-orange-600 text-sm font-medium">View All →</Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming bookings</p>
                <Link to="/pandits" className="text-orange-600 font-medium">Book a Pandit</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking._id} className="border-2 border-gray-100 rounded-lg p-4 hover:border-orange-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{booking.pooja}</h3>
                        <p className="text-sm text-gray-600">{booking.pandit}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">{booking.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{booking.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">Recommended for You</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendedPoojas.length > 0 ? recommendedPoojas.map((pooja) => (
              <Link key={pooja._id} to={`/poojas/${pooja._id}`} className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 relative">
                  {pooja.main_image_url && <img src={pooja.main_image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2 group-hover:text-orange-600">{pooja.name?.hi || pooja.poojaType}</h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{pooja.ratings?.average?.toFixed(1) || '4.5'}</span>
                  </div>
                </div>
              </Link>
            )) : [1, 2, 3].map((i) => (
              <Link key={i} to="/poojas" className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg">
                <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500" />
                <div className="p-4">
                  <h3 className="font-bold mb-2">Explore Poojas</h3>
                  <p className="text-sm text-gray-600">Discover spiritual rituals</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
