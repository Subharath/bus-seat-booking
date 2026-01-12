import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { bookingAPI } from '../../services/api'
import BookingConfirmationModal from './BookingConfirmationModal'

const BookingForm = ({ seats, schedule, onSuccess, onCancel, onRemoveSeat }) => {
  const { user } = useAuth()
  const [passengerDetails, setPassengerDetails] = useState(
    seats.reduce((acc, seat) => {
      acc[seat.id] = {
        passengerName: user?.name || '',
        phoneNumber: user?.phone || '',
      }
      return acc
    }, {})
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState(null)

  const handleChange = (seatId, field, value) => {
    // Handle phone number validation
    if (field === 'phoneNumber') {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '')
      // Limit to 9 digits
      const limitedDigits = digitsOnly.slice(0, 9)
      value = limitedDigits
    }

    setPassengerDetails({
      ...passengerDetails,
      [seatId]: {
        ...passengerDetails[seatId],
        [field]: value,
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate all passengers have names
      for (const seat of seats) {
        if (!passengerDetails[seat.id]?.passengerName?.trim()) {
          throw new Error(`Passenger name is required for seat ${seat.seatNo}`)
        }
      }

      // Book all seats
      const bookingPromises = seats.map((seat) =>
        bookingAPI.create({
          seatId: seat.id,
          scheduleId: schedule.id,
          passengerName: passengerDetails[seat.id].passengerName,
          phoneNumber: passengerDetails[seat.id].phoneNumber || null,
        })
      )

      const results = await Promise.all(bookingPromises)

      // Show professional confirmation modal
      const bookingIds = results.map((r) => r.data.booking.bookingId)
      setConfirmationData({
        bookingIds,
        seats,
        schedule,
      })
      setShowConfirmation(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Booking failed. Please try again.')

    } finally {
      setLoading(false)
    }
  }

  const totalPrice = seats.length * (schedule.ticketPrice || 2500) // Use schedule price or fallback to default

  return (
    <div className="card sticky top-4">
      <h3 className="text-lg font-semibold mb-4">
        Booking Details ({seats.length} seat{seats.length !== 1 ? 's' : ''})
      </h3>

      {/* Selected Seats Summary */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Selected Seats:</span>
          <span className="font-semibold text-primary-700">{seats.map((s) => s.seatNo).join(', ')}</span>
        </div>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">Route:</span>
          <span className="font-medium">
            {schedule.route?.from} → {schedule.route?.to}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="text-gray-600">Date & Time:</span>
          <span className="font-medium">
            {new Date(schedule.date).toLocaleDateString()} {schedule.time}
          </span>
        </div>
        <div className="border-t pt-2 mt-2 flex items-center justify-between">
          <span className="text-gray-700 font-medium">Price per seat: Rs. {schedule.ticketPrice || 2500}</span>
          <span className="font-bold text-lg text-primary-700">Total: Rs. {totalPrice}</span>
        </div>
      </div>

      {/* Passenger Details Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Passenger Details for Each Seat */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {seats.map((seat) => (
            <div key={seat.id} className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-primary-700">Seat {seat.seatNo}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSeat(seat.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label
                    htmlFor={`name-${seat.id}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Passenger Name *
                  </label>
                  <input
                    type="text"
                    id={`name-${seat.id}`}
                    required
                    value={passengerDetails[seat.id]?.passengerName || ''}
                    onChange={(e) => handleChange(seat.id, 'passengerName', e.target.value)}
                    className="input text-sm"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`phone-${seat.id}`}
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm font-medium">+94</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      id={`phone-${seat.id}`}
                      value={passengerDetails[seat.id]?.phoneNumber || ''}
                      onChange={(e) => handleChange(seat.id, 'phoneNumber', e.target.value)}
                      className="input text-sm pl-12"
                      placeholder="771234567"
                      maxLength="9"
                      pattern="[0-9]{9}"
                      title="Please enter exactly 9 digits"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter 9 digits only (e.g., 771234567)</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 space-y-2 border-t">
          <button
            type="submit"
            disabled={loading || seats.length === 0}
            className="btn btn-primary w-full"
          >
            {loading ? 'Booking...' : `Confirm Booking (${seats.length} seat${seats.length !== 1 ? 's' : ''})`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-outline w-full"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-700">
        <p className="font-medium mb-1">📝 Booking Terms:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>One passenger per seat</li>
          <li>Booking confirmation will be sent to your email</li>
          <li>You can cancel up to 24 hours before departure</li>
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <BookingConfirmationModal
          bookingIds={confirmationData.bookingIds}
          seats={confirmationData.seats}
          schedule={confirmationData.schedule}
          onClose={() => {
            setShowConfirmation(false)
            onSuccess()
          }}
        />
      )}
    </div>
  )
}

export default BookingForm
