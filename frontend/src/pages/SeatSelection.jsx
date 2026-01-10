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
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  useEffect(() => {
    fetchScheduleAndSeats()
  }, [scheduleId])

  const fetchScheduleAndSeats = async () => {
    try {
      setLoading(true)
      
      // Fetch all routes and find the schedule
      const allRoutesResponse = await routesAPI.getAll()
      let foundSchedule = null
      let routeId = null
      
      // Search through all routes to find the schedule
      for (const route of allRoutesResponse.data) {
        try {
          const schedulesResponse = await routesAPI.getSchedules(route.id)
          foundSchedule = schedulesResponse.data.find(s => s.id === parseInt(scheduleId))
          if (foundSchedule) {
            routeId = route.id
            break
          }
        } catch (err) {
          // Continue searching other routes
          continue
        }
      }
      
      if (!foundSchedule) {
        throw new Error('Schedule not found')
      }
      
      setSchedule(foundSchedule)

      // Fetch available seats
      const seatsResponse = await routesAPI.getAvailableSeats(scheduleId)
      setAvailableSeats(seatsResponse.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load seat information')
    } finally {
      setLoading(false)
    }
  }

  const handleSeatSelect = (seat) => {
    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null)
      setShowBookingForm(false)
    } else {
      setSelectedSeat(seat)
      setShowBookingForm(true)
    }
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/routes')}
          className="btn btn-primary mt-4"
        >
          Back to Routes
        </button>
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
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Schedules
        </button>
        <h1 className="text-3xl font-bold mb-2">Select Your Seat</h1>
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
            selectedSeat={selectedSeat}
            onSeatSelect={handleSeatSelect}
          />
        </div>

        {/* Booking Form Sidebar */}
        <div className="lg:col-span-1">
          {showBookingForm && selectedSeat ? (
            <BookingForm
              seat={selectedSeat}
              schedule={schedule}
              onSuccess={handleBookingSuccess}
              onCancel={() => {
                setSelectedSeat(null)
                setShowBookingForm(false)
              }}
            />
          ) : (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Booking Instructions</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Click on an available seat (green) to select it</li>
                <li>Fill in passenger details</li>
                <li>Confirm your booking</li>
              </ol>
              <div className="mt-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 rounded"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Selected</span>
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
