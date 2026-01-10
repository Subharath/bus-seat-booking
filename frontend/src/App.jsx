import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import RoutesPage from './pages/Routes'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="mt-4 text-gray-600">Your bookings will appear here.</p>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
