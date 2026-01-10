import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { bookingAPI } from '../../services/api'

const BookingForm = ({ seat, schedule, onSuccess, onCancel }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    passengerName: user?.name || '',
    phoneNumber: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const bookingData = {
        seatId: seat.id,
        scheduleId: schedule.id,
        passengerName: formData.passengerName,
        phoneNumber: formData.phoneNumber || null,
      }

      const response = await bookingAPI.create(bookingData)

      // Show success message
      alert(`Booking confirmed! Booking ID: ${response.data.booking.bookingId}`)
      
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Booking Details</h3>

      {/* Selected Seat Info */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Selected Seat:</span>
          <span className="font-semibold text-primary-700">{seat.seatNo}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Route:</span>
          <span className="text-sm font-medium">
            {schedule.route?.from} → {schedule.route?.to}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">Date & Time:</span>
          <span className="text-sm font-medium">
            {new Date(schedule.date).toLocaleDateString()} {schedule.time}
          </span>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="passengerName" className="block text-sm font-medium text-gray-700 mb-1">
            Passenger Name *
          </label>
          <input
            type="text"
            id="passengerName"
            name="passengerName"
            required
            value={formData.passengerName}
            onChange={handleChange}
            className="input"
            placeholder="Enter passenger name"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input"
            placeholder="+94771234567"
          />
        </div>

        <div className="pt-4 space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
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
      <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p>* Required fields</p>
        <p className="mt-1">You will receive a booking confirmation with a unique booking ID.</p>
      </div>
    </div>
  )
}

export default BookingForm
