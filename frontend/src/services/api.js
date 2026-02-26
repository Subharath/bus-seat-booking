import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  adminRegister: (userData) => api.post('/auth/admin/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
}

// Routes API
export const routesAPI = {
  getAll: () => api.get('/user/routes'),
  getSchedules: (routeId) => api.get(`/user/routes/${routeId}/schedules`),
  getAvailableSeats: (scheduleId) => api.get(`/user/schedules/${scheduleId}/seats`),
}

// Booking API
export const bookingAPI = {
  create: (bookingData) => api.post('/user/bookings', bookingData),
  cancel: (bookingId) => api.patch(`/user/bookings/${bookingId}/cancel`),
  requestCancellation: (bookingId, data) => api.post(`/user/bookings/${bookingId}/cancel-request`, data),
}


// Payment API
export const paymentAPI = {
  initiate: (bookingId) => api.post(`/payment/initiate/${bookingId}`),
  checkStatus: (bookingId) => api.get(`/payment/status/${bookingId}`),
}

// Admin API
export const adminAPI = {
  buses: {
    getAll: () => api.get('/admin/buses'),
    create: (busData) => api.post('/admin/buses', busData),
    delete: (id) => api.delete(`/admin/buses/${id}`),
    update: (id, busData) => api.put(`/admin/buses/${id}`, busData),
  },
  routes: {
    getAll: () => api.get('/admin/routes'),
    create: (routeData) => api.post('/admin/routes', routeData),
  },
  schedules: {
    getAll: () => api.get('/admin/schedules'),
    create: (scheduleData) => api.post('/admin/schedules', scheduleData),
  },
  bookings: {
    getAll: () => api.get('/admin/bookings'),
    getById: (id) => api.get(`/admin/bookings/${id}`),
    delete: (id) => api.delete(`/admin/bookings/${id}`),
  },
  cancellations: {
    getPending: () => api.get('/admin/cancellations/pending'),
    getAll: (status) => api.get(`/admin/cancellations${status ? `?status=${status}` : ''}`),
    approve: (bookingId, data) => api.post(`/admin/cancellations/${bookingId}/approve`, data),
    reject: (bookingId, data) => api.post(`/admin/cancellations/${bookingId}/reject`, data),
  },
}

export default api
