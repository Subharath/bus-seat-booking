import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.getMe()
      setUser(response.data.user)
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authAPI.login({ email, password })
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)

      return { success: true, user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await authAPI.register(userData)
      const { user, accessToken, refreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)

      return { success: true, user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
