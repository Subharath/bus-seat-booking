import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, bookingAPI } from '../services/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancellationReason, setCancellationReason] = useState('')

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

  const handleRequestCancellation = async (bookingId) => {
    if (!window.confirm('Are you sure you want to request cancellation? Admin approval is required.')) {
      return
    }

    try {
      await bookingAPI.requestCancellation(bookingId, { reason: cancellationReason })
      setCancellationReason('')
      setSelectedBooking(null)
      // Refresh bookings
      fetchUserBookings()
      alert('Cancellation request submitted. Please wait for admin approval.')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request cancellation')
    }
  }

  const getCancellationStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
                      {booking.cancellationStatus && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCancellationStatusColor(booking.cancellationStatus)}`}>
                          Cancel: {booking.cancellationStatus}
                        </span>
                      )}
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

                  <div className="ml-4">
                    {booking.status === 'CONFIRMED' && !booking.cancellationStatus && (
                      <>
                        {selectedBooking === booking.id ? (
                          <div className="w-64 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Cancellation Reason (Optional)
                            </label>
                            <textarea
                              value={cancellationReason}
                              onChange={(e) => setCancellationReason(e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                              placeholder="Reason for cancellation..."
                              rows="2"
                            />
                            <div className="flex gap-2 text-xs">
                              <button
                                onClick={() => handleRequestCancellation(booking.id)}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-1 rounded font-semibold transition"
                              >
                                Confirm Request
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(null)
                                  setCancellationReason('')
                                }}
                                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-1 rounded font-semibold transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedBooking(booking.id)}
                            className="btn btn-outline text-sm"
                          >
                            Request Cancel
                          </button>
                        )}
                      </>
                    )}
                    {booking.cancellationStatus === 'PENDING' && (
                      <div className="text-xs text-yellow-700 bg-yellow-50 px-3 py-2 rounded text-center">
                        Awaiting Admin Approval
                      </div>
                    )}
                    {booking.cancellationStatus === 'REJECTED' && (
                      <div className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded text-center">
                        Request Rejected
                      </div>
                    )}
                  </div>
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
