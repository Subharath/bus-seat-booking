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
import UserOnlyRoute from './components/common/UserOnlyRoute'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import AdminDashboard from './pages/AdminDashboard'
import AdminBuses from './pages/AdminBuses'
import AdminRoutes from './pages/AdminRoutes'
import AdminSchedules from './pages/AdminSchedules'
import AdminBookings from './pages/AdminBookings'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes - No Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/buses" element={<ProtectedRoute adminOnly={true}><AdminBuses /></ProtectedRoute>} />
          <Route path="/admin/routes" element={<ProtectedRoute adminOnly={true}><AdminRoutes /></ProtectedRoute>} />
          <Route path="/admin/schedules" element={<ProtectedRoute adminOnly={true}><AdminSchedules /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute adminOnly={true}><AdminBookings /></ProtectedRoute>} />

          {/* User Routes - With Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<UserOnlyRoute><Home /></UserOnlyRoute>} />
            <Route path="/login" element={<UserOnlyRoute><Login /></UserOnlyRoute>} />
            <Route path="/register" element={<UserOnlyRoute><Register /></UserOnlyRoute>} />
            <Route path="/routes" element={<UserOnlyRoute><RoutesPage /></UserOnlyRoute>} />
            <Route path="/routes/:routeId/schedules" element={<UserOnlyRoute><ScheduleSelection /></UserOnlyRoute>} />
            <Route path="/schedules/:scheduleId/seats" element={<UserOnlyRoute><SeatSelection /></UserOnlyRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Payment Routes */}
            <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
