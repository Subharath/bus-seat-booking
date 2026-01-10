import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, bookingAPI } from '../services/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUserBookings()
  }, [])

  const fetchUserBookings = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getMe()
      setBookings(response.data.user.bookings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await bookingAPI.cancel(bookingId)
      // Refresh bookings
      fetchUserBookings()
      alert('Booking cancelled successfully')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}!
        </p>
      </div>

      {/* User Info Card */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          {user?.phone && (
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{user?.phone}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Bookings Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">You don't have any bookings yet.</p>
            <a href="/routes" className="btn btn-primary">
              Book a Seat
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`card ${
                  booking.status === 'CANCELLED' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold">
                        Booking #{booking.bookingId?.substring(0, 8) || booking.id}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Passenger</p>
                        <p className="font-medium">{booking.passengerName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Seat</p>
                        <p className="font-medium">{booking.seat?.seatNo || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Route</p>
                        <p className="font-medium">
                          {booking.schedule?.route?.from} → {booking.schedule?.route?.to}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Date & Time</p>
                        <p className="font-medium">
                          {booking.schedule?.date
                            ? formatDate(booking.schedule.date)
                            : 'N/A'}{' '}
                          {booking.schedule?.time || ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Booked On</p>
                        <p className="font-medium">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && (
                    <div className="ml-4">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn btn-outline text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
