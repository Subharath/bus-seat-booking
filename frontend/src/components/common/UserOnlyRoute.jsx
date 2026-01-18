import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const UserOnlyRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If user is an admin, redirect them to admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  // Regular users (including unauthenticated) can access
  return children
}

export default UserOnlyRoute
