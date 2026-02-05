import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import MainLayout from './components/layout/MainLayout/MainLayout'
import Login from './pages/Login/Login'
import Home from './pages/Home/Home'
import Services from './pages/Services/Services'
import Booking from './pages/Booking/Booking'
import Profile from './pages/Profile/Profile'
import BookingConfirm from './pages/BookingConfirm/BookingConfirm'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route (redirect to home if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public Route - Login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes with MainLayout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="booking" element={<Booking />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Protected Route - Book Appointment (without MainLayout) */}
        <Route 
          path="/book" 
          element={
            <ProtectedRoute>
              <BookingConfirm />
            </ProtectedRoute>
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
