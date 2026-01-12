import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { routesAPI } from '../services/api'
import SeatMap from '../components/booking/SeatMap'
import BookingForm from '../components/booking/BookingForm'

const SeatSelection = () => {
  const { scheduleId } = useParams()
  const navigate = useNavigate()

  const [schedule, setSchedule] = useState(null)
  const [availableSeats, setAvailableSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const MAX_SEATS = 10

  useEffect(() => {
    fetchScheduleAndSeats()
  }, [scheduleId])

  const fetchScheduleAndSeats = async () => {
    try {
      setLoading(true)

      const allRoutesResponse = await routesAPI.getAll()
      let foundSchedule = null
      let routeId = null

      for (const route of allRoutesResponse.data) {
        try {
          const schedulesResponse = await routesAPI.getSchedules(route.id)
          foundSchedule = schedulesResponse.data.find(
            (s) => s.id === parseInt(scheduleId)
          )

          if (foundSchedule) {
            routeId = route.id
            break
          }
        } catch (err) {
          continue
        }
      }

      if (!foundSchedule) {
        throw new Error(
          `Schedule ID ${scheduleId} not found. Please select a valid schedule from the routes page.`
        )
      }

      setSchedule(foundSchedule)

      try {
        const seatsResponse = await routesAPI.getAvailableSeats(scheduleId)
        setAvailableSeats(seatsResponse.data)
      } catch (seatErr) {
        const seatErrorMsg =
          seatErr.response?.data?.message || seatErr.message
        throw new Error(
          `Could not load seats: ${seatErrorMsg}. This might mean the bus has no seats configured. Please contact support.`
        )
      }
    } catch (err) {
      setError(
        err.message ||
          err.response?.data?.message ||
          'Failed to load seat information'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSeatSelect = (seat) => {
    setSelectedSeats((prevSeats) => {
      const exists = prevSeats.find((s) => s.id === seat.id)

      if (exists) {
        return prevSeats.filter((s) => s.id !== seat.id)
      } else {
        if (prevSeats.length < MAX_SEATS) {
          return [...prevSeats, seat]
        }
        return prevSeats
      }
    })
  }

  const handleRemoveSeat = (seatId) => {
    setSelectedSeats((prevSeats) =>
      prevSeats.filter((s) => s.id !== seatId)
    )
  }

  const handleBookingSuccess = () => {
    navigate('/dashboard')
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to Load Seats
            </h3>
            <p className="text-red-700 mb-4">{error}</p>

            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              <li>Go back to the Routes page</li>
              <li>Select a valid schedule date/time</li>
              <li>Contact support if the issue continues</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/routes')}
            className="btn btn-primary mt-6"
          >
            Back to Routes
          </button>
        </div>
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-gray-600">Schedule not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header Section */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Schedules
        </button>

        <h1 className="text-3xl font-bold mb-2">Select Your Seats</h1>
        <p className="text-gray-600 mb-4">
          You can select up to {MAX_SEATS} seats
        </p>

        <div className="flex items-center space-x-4 text-gray-600">
          <span>
            {schedule.route?.from} → {schedule.route?.to}
          </span>
          <span>•</span>
          <span>{new Date(schedule.date).toLocaleDateString()}</span>
          <span>•</span>
          <span>{schedule.time}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Seat Map */}
        <div className="lg:col-span-2">
          <SeatMap
            bus={schedule.bus}
            availableSeats={availableSeats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            maxSeats={MAX_SEATS}
          />
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-1">
          {selectedSeats.length > 0 ? (
            <BookingForm
              seats={selectedSeats}
              schedule={schedule}
              onSuccess={handleBookingSuccess}
              onCancel={() => setSelectedSeats([])}
              onRemoveSeat={handleRemoveSeat}
            />
          ) : (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">
                Booking Instructions
              </h3>

              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Click available seats (green)</li>
                <li>Select up to {MAX_SEATS} seats</li>
                <li>Enter passenger details</li>
                <li>Confirm your booking</li>
              </ol>

              <div className="mt-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Selected</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 rounded opacity-60"></div>
                  <span className="text-sm">Booked</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded opacity-60"></div>
                  <span className="text-sm">Reserved</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default SeatSelection
