import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Book Your Bus Seat in Sri Lanka
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Easy, fast, and reliable bus seat booking for all major routes across Sri Lanka
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/routes" className="btn btn-secondary text-lg px-8 py-3">
                Book Now
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Sign Up
                </Link>
              )}
            </div>
            <div className="mt-6">
              <p className="text-primary-100 text-sm">
                <Link to="/admin/login" className="text-white font-semibold hover:underline">
                  Admin Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and intuitive booking process. Book your seat in just a few clicks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚌</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Routes</h3>
              <p className="text-gray-600">
                Access to all major bus routes across Sri Lanka. From Colombo to Kandy, Galle, and more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Confirmation</h3>
              <p className="text-gray-600">
                Get instant booking confirmation with your unique booking ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Routes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { from: 'Colombo', to: 'Kandy', distance: '120 km' },
              { from: 'Colombo', to: 'Galle', distance: '116 km' },
              { from: 'Kandy', to: 'Nuwara Eliya', distance: '77 km' },
            ].map((route, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {route.from} → {route.to}
                    </h3>
                    <p className="text-gray-600 text-sm">{route.distance}</p>
                  </div>
                  <span className="text-2xl">🚌</span>
                </div>
                <Link
                  to="/routes"
                  className="btn btn-primary w-full mt-4"
                >
                  View Schedules
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
