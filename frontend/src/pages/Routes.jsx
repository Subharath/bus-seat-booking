import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { routesAPI } from '../services/api'

const Routes = () => {
  const navigate = useNavigate()
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await routesAPI.getAll()
      setRoutes(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load routes')
    } finally {
      setLoading(false)
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Available Routes</h1>
      
      {routes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No routes available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <div key={route.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {route.from} → {route.to}
                  </h3>
                </div>
                <span className="text-3xl">🚌</span>
              </div>
              <button
                onClick={() => navigate(`/routes/${route.id}/schedules`)}
                className="btn btn-primary w-full"
              >
                View Schedules
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Routes
