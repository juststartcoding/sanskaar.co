import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, DollarSign, Star, 
  CheckCircle, XCircle, Users, TrendingUp,
  Settings, LogOut, Phone, MapPin
} from 'lucide-react';

const PanditDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0,
    totalEarnings: 0,
    rating: 0,
    reviews: 0
  });

  const [upcomingBookings, setUpcomingBookings] = useState([]);

  useEffect(() => {
    loadStats();
    loadBookings();
  }, []);

  const loadStats = async () => {
    setStats({
      totalBookings: 145,
      completedBookings: 120,
      upcomingBookings: 8,
      totalEarnings: 285000,
      rating: 4.8,
      reviews: 98
    });
  };

  const loadBookings = async () => {
    setUpcomingBookings([
      {
        id: 1,
        pooja: 'Ganesh Chaturthi Pooja',
        customer: 'Rajesh Kumar',
        date: '2024-11-15',
        time: '10:00 AM',
        location: 'Bandra West, Mumbai',
        phone: '9876543210',
        amount: 3500,
        status: 'confirmed'
      },
      {
        id: 2,
        pooja: 'Griha Pravesh',
        customer: 'Priya Sharma',
        date: '2024-11-16',
        time: '8:00 AM',
        location: 'Andheri East, Mumbai',
        phone: '9876543211',
        amount: 5000,
        status: 'pending'
      }
    ]);
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Completed',
      value: stats.completedBookings,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Upcoming',
      value: stats.upcomingBookings,
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Total Earnings',
      value: `₹${(stats.totalEarnings / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pandit Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, Pandit Ji</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-bold text-gray-900">{stats.rating}</span>
                <span className="text-sm text-gray-600">({stats.reviews} reviews)</span>
              </div>
              <Link
                to="/pandit/settings"
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
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
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
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/pandit/calendar"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <Calendar className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Manage Calendar</h3>
          </Link>
          <Link
            to="/pandit/bookings"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <Clock className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">All Bookings</h3>
          </Link>
          <Link
            to="/pandit/earnings"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <DollarSign className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Earnings</h3>
          </Link>
          <Link
            to="/pandit/profile"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <Users className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">My Profile</h3>
          </Link>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
            <Link to="/pandit/bookings" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-orange-500 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.pooja}</h3>
                    <p className="text-sm text-gray-600">{booking.customer}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {booking.date} at {booking.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {booking.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {booking.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    ₹{booking.amount}
                  </div>
                </div>

                <div className="flex gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </button>
                      <button className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanditDashboard;