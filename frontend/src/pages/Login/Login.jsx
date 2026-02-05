import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components'
import { useAuthStore, DUMMY_CREDENTIALS } from '../../store'

const Login = () => {
  const navigate = useNavigate()
  const { login, register, loginWithGoogle, isLoading, error, clearError } = useAuthStore()
  
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  })
  const [showCredentials, setShowCredentials] = useState(false)

  const handleChange = (e) => {
    clearError()
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
      } else {
        // Registration
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined
        })
      }
      navigate('/')
    } catch (err) {
      // Error is handled by the store
    }
  }

  const handleGoogleSignIn = async () => {
    // Google Sign-In will be implemented later with Firebase
    // For now, show a message
    alert('Google Sign-In will be available soon!')
  }

  const fillCredentials = (type) => {
    const creds = DUMMY_CREDENTIALS[type]
    setFormData({
      ...formData,
      email: creds.email,
      password: creds.password
    })
    clearError()
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({ email: '', password: '', name: '', phone: '' })
    clearError()
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Branding Section */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-badge">
              <span>✨</span>
              <span>Beauty & Wellness</span>
            </div>
            <h1 className="brand-title">
              Glamour
              <span>Studio</span>
            </h1>
            <p className="brand-subtitle">
              Your journey to beauty starts here. Book appointments, explore services, and embrace your natural glow.
            </p>
            <div className="brand-features">
              <div className="feature-item">
                <span>📅</span>
                <span>Easy Booking</span>
              </div>
              <div className="feature-item">
                <span>💆‍♀️</span>
                <span>Expert Stylists</span>
              </div>
              <div className="feature-item">
                <span>💖</span>
                <span>Premium Care</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="login-form-section">
          <div className="login-card">
            {/* Auth Toggle - Full Width */}
            <div className="auth-toggle">
              <button
                className={`auth-toggle__btn ${isLogin ? 'auth-toggle__btn--active' : ''}`}
                onClick={() => { setIsLogin(true); clearError(); }}
              >
                Sign In
              </button>
              <button
                className={`auth-toggle__btn ${!isLogin ? 'auth-toggle__btn--active' : ''}`}
                onClick={() => { setIsLogin(false); clearError(); }}
              >
                Sign Up
              </button>
            </div>

            <div className="form-header">
              <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
              <p>{isLogin ? 'Sign in to continue your beauty journey' : 'Join us and discover amazing services'}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <i className="ri-error-warning-line"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Demo Credentials - Only show on login */}
            {isLogin && (
              <div className="demo-credentials">
                <button 
                  className="demo-toggle"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  <i className="ri-test-tube-line"></i>
                  <span>Demo Credentials</span>
                  <i className={`ri-arrow-${showCredentials ? 'up' : 'down'}-s-line`}></i>
                </button>
                
                {showCredentials && (
                  <div className="credentials-list">
                    <button 
                      className="credential-item"
                      onClick={() => fillCredentials('user')}
                    >
                      <div className="credential-item__icon">👩</div>
                      <div className="credential-item__info">
                        <span className="role">User Account</span>
                        <span className="email">{DUMMY_CREDENTIALS.user.email}</span>
                      </div>
                      <i className="ri-arrow-right-line"></i>
                    </button>
                    <button 
                      className="credential-item"
                      onClick={() => fillCredentials('admin')}
                    >
                      <div className="credential-item__icon">👩‍💼</div>
                      <div className="credential-item__info">
                        <span className="role">Admin Account</span>
                        <span className="email">{DUMMY_CREDENTIALS.admin.email}</span>
                      </div>
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Google Sign In */}
            <button className="google-btn" onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="divider">
              <span>or</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <>
                  <Input
                    label="Full Name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </>
              )}

              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />

              {isLogin && (
                <div className="form-options">
                  <label className="checkbox">
                    <input type="checkbox" className="checkbox__input" />
                    <span className="checkbox__label">Remember me</span>
                  </label>
                  <a href="#">Forgot password?</a>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                icon={isLoading ? "" : "ri-arrow-right-line"}
                iconPosition="right"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <p className="form-footer">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={toggleMode}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
