import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { routesAPI } from '../services/api'

const ScheduleSelection = () => {
  const { routeId } = useParams()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchSchedules()
  }, [routeId])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await routesAPI.getSchedules(routeId)
      setSchedules(response.data)
      
      // Extract route info from first schedule
      if (response.data.length > 0) {
        setRoute(response.data[0].route)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getAvailableSeatsCount = (schedule) => {
    // This would ideally come from the API
    // For now, we'll calculate from bus seats
    const totalSeats = schedule.bus?.totalSeats || schedule.bus?.seats?.length || 0
    const bookedSeats = schedule.bookings?.filter(b => b.status === 'CONFIRMED').length || 0
    return totalSeats - bookedSeats
  }

  const handleSelectSchedule = (scheduleId) => {
    navigate(`/schedules/${scheduleId}/seats`)
  }

  // Filter schedules by selected date
  const filteredSchedules = selectedDate
    ? schedules.filter((s) => {
        const scheduleDate = new Date(s.date).toDateString()
        const selected = new Date(selectedDate).toDateString()
        return scheduleDate === selected
      })
    : schedules

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Route Info */}
      {route && (
        <div className="mb-8">
          <button
            onClick={() => navigate('/routes')}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Back to Routes
          </button>
          <h1 className="text-3xl font-bold mb-2">
            {route.from} → {route.to}
          </h1>
          <p className="text-gray-600">
            Select your preferred date and time
          </p>
        </div>
      )}

      {/* Date Filter */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Date (Optional)
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input max-w-xs"
          min={new Date().toISOString().split('T')[0]}
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="ml-2 text-sm text-primary-600 hover:text-primary-700"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Schedules List */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {selectedDate ? 'No schedules available for selected date' : 'No schedules available'}
          </p>
          <button
            onClick={() => navigate('/routes')}
            className="btn btn-primary"
          >
            Back to Routes
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => {
            const availableSeats = getAvailableSeatsCount(schedule)
            const isAvailable = availableSeats > 0

            return (
              <div
                key={schedule.id}
                className={`card hover:shadow-lg transition-shadow ${
                  !isAvailable ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {schedule.time}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {formatDate(schedule.date)}
                    </p>
                  </div>
                  <span className="text-2xl">🚌</span>
                </div>

                {/* Bus Info */}
                {schedule.bus && (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Bus:</span>
                      <span className="ml-2">{schedule.bus.busNumber}</span>
                    </div>
                    {schedule.bus.make && schedule.bus.model && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Type:</span>
                        <span className="ml-2">
                          {schedule.bus.make} {schedule.bus.model}
                        </span>
                      </div>
                    )}
                    {schedule.bus.totalSeats && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Capacity:</span>
                        <span className="ml-2">{schedule.bus.totalSeats} seats</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Available Seats */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Available Seats:
                    </span>
                    <span
                      className={`text-lg font-bold ${
                        isAvailable ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {availableSeats}
                    </span>
                  </div>
                  {!isAvailable && (
                    <p className="text-xs text-red-600 mt-1">Fully booked</p>
                  )}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectSchedule(schedule.id)}
                  disabled={!isAvailable}
                  className={`btn w-full ${
                    isAvailable
                      ? 'btn-primary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAvailable ? 'Select Seats' : 'Fully Booked'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ScheduleSelection
