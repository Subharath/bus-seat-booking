import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminData = localStorage.getItem('adminUser');

        if (adminData) setAdminUser(JSON.parse(adminData));

        const response = await api.get('/admin/dashboard/stats');
        setStats(response.data.stats);
      } catch (err) {
        setError('Failed to fetch dashboard stats');
        console.error('Error:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('adminUser');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              {adminUser && (
                <p className="text-gray-600 mt-1">Welcome, {adminUser.name}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Buses</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {stats?.totalBuses || 0}
                </p>
              </div>
              <div className="text-5xl text-blue-200">🚌</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Routes</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {stats?.totalRoutes || 0}
                </p>
              </div>
              <div className="text-5xl text-green-200">🗺️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Schedules</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">
                  {stats?.totalSchedules || 0}
                </p>
              </div>
              <div className="text-5xl text-orange-200">⏰</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Bookings</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {stats?.totalBookings || 0}
                </p>
              </div>
              <div className="text-5xl text-purple-200">📋</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Active Users</p>
                <p className="text-4xl font-bold text-red-600 mt-2">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <div className="text-5xl text-red-200">👥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Admin Users</p>
                <p className="text-4xl font-bold text-indigo-600 mt-2">
                  {stats?.totalAdmins || 0}
                </p>
              </div>
              <div className="text-5xl text-indigo-200">🔐</div>
            </div>
          </div>
        </div>

        {/* Management Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/admin/buses"
            className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-semibold transition shadow hover:shadow-lg text-center"
          >
            Manage Buses
          </Link>
          <Link
            to="/admin/routes"
            className="bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg font-semibold transition shadow hover:shadow-lg text-center"
          >
            Manage Routes
          </Link>
          <Link
            to="/admin/schedules"
            className="bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-lg font-semibold transition shadow hover:shadow-lg text-center"
          >
            Manage Schedules
          </Link>
          <Link
            to="/admin/bookings"
            className="bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-lg font-semibold transition shadow hover:shadow-lg text-center"
          >
            View Bookings
          </Link>
        </div>

        {/* Recent Bookings */}
        {stats?.recentBookings && stats.recentBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Bus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        #{booking.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.schedule.route.from} → {booking.schedule.route.to}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {booking.schedule.bus.busNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.schedule.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
