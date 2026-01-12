import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import './Home.css'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="loader-container">
          <div className="loader-bus">🚌</div>
          <div className="loader-text">LankaRoute</div>
          <div className="loader-progress">
            <div className="loader-bar"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-50 text-gray-900 py-24 md:py-32 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center md:ml-12 lg:ml-20">
            {/* Left side - Text Content */}
            <div className="fade-in-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 leading-tight text-gray-900">
                Welcome to <span className="text-blue-600">LankaRoute</span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-gray-700 leading-relaxed font-light">
                Easy, fast, and reliable bus seat booking for all major routes across Sri Lanka. Your journey starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 mb-10">
                <Link 
                  to="/routes" 
                  className="btn-book-now bg-gradient-to-r from-sky-400 to-blue-400 text-white hover:from-sky-300 hover:to-blue-300 text-lg md:text-xl px-10 py-4 transform hover:scale-105 transition-all duration-300 text-center font-bold shadow-xl hover:shadow-2xl rounded-xl"
                >
                  🚏 Book Your Journey Now
                </Link>
                {!isAuthenticated && (
                  <Link 
                    to="/register" 
                    className="btn bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-300 text-lg md:text-xl px-10 py-4 transform hover:scale-105 transition-all duration-300 font-semibold text-center rounded-xl shadow-lg"
                  >
                    ✨ Sign Up Free
                  </Link>
                )}
              </div>
              <div className="pt-6">
                <p className="text-gray-600 text-base">
                  <Link to="/admin/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors underline-offset-4 hover:underline">
                    Admin Portal →
                  </Link>
                </p>
              </div>
            </div>

            {/* Right side - Bus Image */}
            <div className="flex justify-center items-center fade-in-right">
              <div className="bus-image-container">
                <div className="bus-glow"></div>
                <img 
                  src="/Bus.png" 
                  alt="LankaRoute Bus" 
                  className="bus-hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 animate-fadeIn text-gray-900">Why Choose LankaRoute?</h2>
          <p className="text-center text-gray-600 mb-20 text-lg md:text-xl max-w-3xl mx-auto">Experience seamless bus booking like never before</p>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            <div className="feature-card animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and intuitive booking process. Book your seat in just a few clicks with our user-friendly interface.
              </p>
            </div>
            <div className="feature-card animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">🌍</div>
              <h3 className="text-xl font-semibold mb-3">Multiple Routes</h3>
              <p className="text-gray-600">
                Access to all major bus routes across Sri Lanka. From Colombo to Kandy, Galle, and more destinations.
              </p>
            </div>
            <div className="feature-card animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">✅</div>
              <h3 className="text-xl font-semibold mb-3">Instant Confirmation</h3>
              <p className="text-gray-600">
                Get instant booking confirmation with your unique booking ID and professional PDF ticket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 animate-fadeIn text-gray-900">Popular Routes</h2>
          <p className="text-center text-gray-600 mb-20 text-lg md:text-xl max-w-3xl mx-auto">Explore our most traveled destinations</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { from: 'Colombo', to: 'Kandy', distance: '120 km' },
              { from: 'Colombo', to: 'Galle', distance: '116 km' },
              { from: 'Kandy', to: 'Nuwara Eliya', distance: '77 km' },
            ].map((route, index) => (
              <div 
                key={index} 
                className="route-card animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {route.from} <span className="text-primary-600">→</span> {route.to}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">📍 {route.distance}</p>
                  </div>
                  <div className="text-4xl animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>🚌</div>
                </div>
                <Link
                  to="/routes"
                  className="btn btn-primary w-full mt-4 transform hover:scale-105 transition-transform duration-300"
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
