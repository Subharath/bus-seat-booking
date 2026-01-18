import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import AdminHeader from '../components/layout/AdminHeader'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminUser, setAdminUser] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const adminData = localStorage.getItem('adminUser')
        if (adminData) setAdminUser(JSON.parse(adminData))

        const response = await api.get('/admin/dashboard/stats')
        setStats(response.data.stats)
      } catch (err) {
        setError('Failed to fetch dashboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/admin/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-red-100 border border-red-300 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader adminUser={adminUser} />

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* STATS */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            System Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Buses" value={stats?.totalBuses} icon="🚌" color="blue" />
            <StatCard title="Total Routes" value={stats?.totalRoutes} icon="🗺️" color="green" />
            <StatCard title="Total Schedules" value={stats?.totalSchedules} icon="⏰" color="orange" />
            <StatCard title="Total Bookings" value={stats?.totalBookings} icon="📋" color="purple" />
            <StatCard title="Active Users" value={stats?.totalUsers} icon="👥" color="red" />
            <StatCard title="Admin Users" value={stats?.totalAdmins} icon="🔐" color="indigo" />
          </div>
        </section>

        {/* MANAGEMENT */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdminTile to="/admin/buses" title="Manage Buses" icon="🚌" color="blue" />
            <AdminTile to="/admin/routes" title="Manage Routes" icon="🗺️" color="green" />
            <AdminTile to="/admin/schedules" title="Manage Schedules" icon="⏰" color="orange" />
            <AdminTile to="/admin/bookings" title="View Bookings" icon="📋" color="purple" />
          </div>
        </section>

        {/* RECENT BOOKINGS */}
        {stats?.recentBookings?.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Bookings
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Booking ID</th>
                    <th className="px-6 py-3 text-left font-semibold">User</th>
                    <th className="px-6 py-3 text-left font-semibold">Route</th>
                    <th className="px-6 py-3 text-left font-semibold">Bus</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">#{booking.id}</td>
                      <td className="px-6 py-4">{booking.user.name}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {booking.schedule.route.from} → {booking.schedule.route.to}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {booking.schedule.bus.busNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(booking.schedule.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

/* ---------- UI HELPERS (LOCAL ONLY) ---------- */

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {value ?? 0}
        </p>
      </div>
    </div>
  )
}

function AdminTile({ to, title, icon, color }) {
  const colors = {
    blue: 'hover:border-blue-500 hover:bg-blue-50',
    green: 'hover:border-green-500 hover:bg-green-50',
    orange: 'hover:border-orange-500 hover:bg-orange-50',
    purple: 'hover:border-purple-500 hover:bg-purple-50',
  }

  return (
    <Link
      to={to}
      className={`bg-white border rounded-xl p-6 flex items-center gap-4 transition ${colors[color]}`}
    >
      <div className="text-3xl">{icon}</div>
      <span className="font-semibold text-gray-800">{title}</span>
    </Link>
  )
}
