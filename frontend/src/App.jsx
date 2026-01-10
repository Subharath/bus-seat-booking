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
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes - No Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

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
