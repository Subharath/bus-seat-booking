import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🚌</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LankaRoute</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/routes"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Routes
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Hello, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
