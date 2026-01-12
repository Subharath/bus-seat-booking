import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routesAPI } from '../services/api'

const Routes = () => {
  const navigate = useNavigate()
  const [routes, setRoutes] = useState([])
  const [allSchedules, setAllSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter states
  const [selectedRoute, setSelectedRoute] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeRange, setSelectedTimeRange] = useState('')

  useEffect(() => {
    fetchRoutesAndSchedules()
  }, [])

  const fetchRoutesAndSchedules = async () => {
    try {
      setLoading(true)
      const routesResponse = await routesAPI.getAll()
      setRoutes(routesResponse.data)

      // Fetch schedules for all routes
      const schedulesPromises = routesResponse.data.map(async (route) => {
        try {
          const scheduleResponse = await routesAPI.getSchedules(route.id)
          return scheduleResponse.data.map(schedule => ({
            ...schedule,
            routeInfo: route
          }))
        } catch {
          return []
        }
      })

      const schedulesArrays = await Promise.all(schedulesPromises)
      const flatSchedules = schedulesArrays.flat()
      setAllSchedules(flatSchedules)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load routes')
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

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getTimeRange = (timeString) => {
    const hour = parseInt(timeString.split(':')[0])
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  const getAvailableSeatsCount = (schedule) => {
    const totalSeats = schedule.bus?.totalSeats || schedule.bus?.seats?.length || 0
    const bookedSeats = schedule.bookings?.filter(b => b.status === 'CONFIRMED').length || 0
    return totalSeats - bookedSeats
  }

  // Filter schedules based on selected filters
  const filteredSchedules = allSchedules.filter(schedule => {
    const matchesRoute = !selectedRoute || schedule.route?.id === parseInt(selectedRoute)
    
    const matchesDate = !selectedDate || 
      new Date(schedule.date).toDateString() === new Date(selectedDate).toDateString()
    
    const matchesTime = !selectedTimeRange || 
      getTimeRange(schedule.time) === selectedTimeRange

    return matchesRoute && matchesDate && matchesTime
  })

  const clearFilters = () => {
    setSelectedRoute('')
    setSelectedDate('')
    setSelectedTimeRange('')
  }

  const hasActiveFilters = selectedRoute || selectedDate || selectedTimeRange

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading routes and schedules...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Bus</h1>
          <p className="text-gray-600">Search and book bus tickets across Sri Lanka</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Search Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Route Filter */}
            <div>
              <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <div className="relative">
                <select
                  id="route"
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none bg-white"
                >
                  <option value="">All Routes</option>
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>
                      {route.from} → {route.to}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Time Range Filter */}
            <div>
              <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-2">
                Time of Day
              </label>
              <div className="relative">
                <select
                  id="timeRange"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 appearance-none bg-white"
                >
                  <option value="">Any Time</option>
                  <option value="morning">Morning (5:00 AM - 12:00 PM)</option>
                  <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                  <option value="evening">Evening (5:00 PM - 9:00 PM)</option>
                  <option value="night">Night (9:00 PM - 5:00 AM)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedRoute && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {routes.find(r => r.id === parseInt(selectedRoute))?.from} → {routes.find(r => r.id === parseInt(selectedRoute))?.to}
                  <button
                    onClick={() => setSelectedRoute('')}
                    className="ml-2 inline-flex items-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedDate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  <button
                    onClick={() => setSelectedDate('')}
                    className="ml-2 inline-flex items-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedTimeRange && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {selectedTimeRange.charAt(0).toUpperCase() + selectedTimeRange.slice(1)}
                  <button
                    onClick={() => setSelectedTimeRange('')}
                    className="ml-2 inline-flex items-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {hasActiveFilters ? 'Search Results' : 'All Available Schedules'}
          </h2>
          <p className="text-gray-600">
            {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Schedules Grid */}
        {filteredSchedules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more results.' 
                : 'No schedules are currently available.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.map((schedule) => {
              const availableSeats = getAvailableSeatsCount(schedule)
              const isAvailable = availableSeats > 0

              return (
                <div
                  key={schedule.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${
                    !isAvailable ? 'opacity-60' : ''
                  }`}
                >
                  {/* Header with Route */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-semibold">{schedule.route?.from || schedule.routeInfo?.from}</span>
                      </div>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{schedule.route?.to || schedule.routeInfo?.to}</span>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Date and Time */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                          <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(schedule.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 rounded-lg p-2">
                          <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Departure</p>
                          <p className="text-sm font-semibold text-gray-900">{formatTime(schedule.time)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bus Info */}
                    {schedule.bus && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">Bus: {schedule.bus.busNumber}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {schedule.bus.make && schedule.bus.model && (
                            <p>Type: {schedule.bus.make} {schedule.bus.model}</p>
                          )}
                          {schedule.bus.totalSeats && (
                            <p>Capacity: {schedule.bus.totalSeats} seats</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Available Seats & Price */}
                    <div className="mb-4 flex items-center justify-between py-3 border-t border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Available Seats</p>
                        <p className={`text-2xl font-bold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {availableSeats}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                        <p className="text-2xl font-bold text-blue-600">
                          Rs. {schedule.ticketPrice || 2500}
                        </p>
                      </div>
                    </div>

                    {/* Select Button */}
                    <button
                      onClick={() => navigate(`/schedules/${schedule.id}/seats`)}
                      disabled={!isAvailable}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                        isAvailable
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Select Seats
                        </span>
                      ) : (
                        'Fully Booked'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Routes
