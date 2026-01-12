import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RoutesPage from './pages/Routes'
import ScheduleSelection from './pages/ScheduleSelection'
import SeatSelection from './pages/SeatSelection'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import AdminDashboard from './pages/AdminDashboard'
import AdminBuses from './pages/AdminBuses'
import AdminRoutes from './pages/AdminRoutes'
import AdminSchedules from './pages/AdminSchedules'
import AdminBookings from './pages/AdminBookings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes - No Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/buses" element={<ProtectedRoute adminOnly={true}><AdminDashboard /><AdminBuses /></ProtectedRoute>} />
          <Route path="/admin/routes" element={<ProtectedRoute adminOnly={true}><AdminDashboard /><AdminRoutes /></ProtectedRoute>} />
          <Route path="/admin/schedules" element={<ProtectedRoute adminOnly={true}><AdminDashboard /><AdminSchedules /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute adminOnly={true}><AdminDashboard /><AdminBookings /></ProtectedRoute>} />

          {/* User Routes - With Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/routes/:routeId/schedules" element={<ScheduleSelection />} />
            <Route path="/schedules/:scheduleId/seats" element={<SeatSelection />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
