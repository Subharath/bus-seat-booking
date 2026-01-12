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

  const downloadTicketPDF = (booking) => {
    try {
      const printWindow = window.open('', '', 'height=600,width=800')
      const totalPrice = booking.schedule?.ticketPrice || 0
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .ticket-container { max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
              .logo { font-size: 28px; font-weight: bold; color: #0066cc; }
              .subtitle { color: #666; margin-top: 5px; }
              .booking-section { margin-bottom: 25px; padding: 15px; background: #f9f9f9; border-left: 4px solid #0066cc; }
              .booking-title { font-size: 14px; color: #0066cc; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
              .booking-id { font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace; color: #000; margin-bottom: 15px; }
              .seat-info { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dotted #ddd; }
              .info-label { color: #666; font-weight: bold; }
              .info-value { text-align: right; }
              .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 12px; }
              .important { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 13px; }
              .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
              .status.confirmed { background: #d4edda; color: #155724; }
              .status.cancelled { background: #f8d7da; color: #721c24; }
            </style>
          </head>
          <body>
            <div class="ticket-container">
              <div class="header">
                <div class="logo">🎫 LankaRoute Ticket</div>
                <div class="subtitle">Your Journey Confirmation</div>
              </div>
              
              <div class="booking-section">
                <div class="booking-title">Ticket Details</div>
                <div class="status ${booking.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'}">${booking.status}</div>
                <div class="booking-id">ID: ${booking.bookingId}</div>
                <div class="seat-info">Seat: ${booking.seat?.seatNo}</div>
                
                <div class="info-row">
                  <span class="info-label">Passenger:</span>
                  <span class="info-value">${booking.passengerName || user?.name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Route:</span>
                  <span class="info-value">${booking.schedule?.route?.from} → ${booking.schedule?.route?.to}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span class="info-value">${new Date(booking.schedule?.date).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Time:</span>
                  <span class="info-value">${booking.schedule?.time}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Bus:</span>
                  <span class="info-value">${booking.schedule?.bus?.busNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Price:</span>
                  <span class="info-value">Rs. ${totalPrice}</span>
                </div>
                <div class="info-row" style="border: none; margin-top: 10px;">
                  <span class="info-label">Booked On:</span>
                  <span class="info-value">${new Date(booking.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div class="important">
                <strong>📌 Important Information:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Please arrive 30 minutes before departure</li>
                  <li>Keep this ticket safe for your journey</li>
                  ${booking.status === 'CONFIRMED' ? '<li>You can cancel up to 24 hours before departure</li>' : ''}
                  <li>For any queries, contact our support team</li>
                </ul>
              </div>

              <div class="footer">
                <p>Thank you for choosing LankaRoute! Have a great journey!</p>
                <p style="margin-top: 10px; font-size: 11px;">Downloaded on ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    } catch (err) {
      console.error('Error downloading PDF:', err)
      alert('Failed to generate PDF')
    }
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
                        <p className="font-medium">{booking.passengerName ? booking.passengerName : user?.name}</p>
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
                        <p className="text-gray-600">Booking ID</p>
                        <p className="font-mono text-xs font-semibold text-blue-600">{booking.bookingId?.substring(0, 12)}...</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-medium text-green-600">Rs. {booking.schedule?.ticketPrice || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => downloadTicketPDF(booking)}
                      className="btn btn-primary text-sm whitespace-nowrap"
                    >
                      📄 Download Ticket
                    </button>

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
