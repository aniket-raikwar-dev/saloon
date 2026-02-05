// API Service - Handles all backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  // Get stored access token
  getToken() {
    const authStorage = localStorage.getItem('glamour-auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.accessToken || null
    }
    return null
  }

  // Set access token
  setToken(token) {
    const authStorage = localStorage.getItem('glamour-auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      parsed.state = { ...parsed.state, accessToken: token }
      localStorage.setItem('glamour-auth-storage', JSON.stringify(parsed))
    }
  }

  // Clear token
  clearToken() {
    const authStorage = localStorage.getItem('glamour-auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      parsed.state = { ...parsed.state, accessToken: null }
      localStorage.setItem('glamour-auth-storage', JSON.stringify(parsed))
    }
  }

  // Default headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
    
    return headers
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        // Handle token expiry
        if (response.status === 401) {
          this.clearToken()
        }
        throw new Error(data.message || 'An error occurred')
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' })
  }

  // POST request
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  // PUT request
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' })
  }

  // POST with FormData (for file uploads)
  async postFormData(endpoint, formData) {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getToken()
    
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred')
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }
}

// Create singleton instance
const api = new ApiService()

// ==================== AUTH API ====================
export const authApi = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData, { auth: false })
    if (response.data?.accessToken) {
      api.setToken(response.data.accessToken)
    }
    return response
  },

  // Login with email/password
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password }, { auth: false })
    if (response.data?.accessToken) {
      api.setToken(response.data.accessToken)
    }
    return response
  },

  // Google Sign-In (for future use)
  googleSignIn: async (idToken) => {
    const response = await api.post('/auth/google', { idToken }, { auth: false })
    if (response.data?.accessToken) {
      api.setToken(response.data.accessToken)
    }
    return response
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout', {})
    } finally {
      api.clearToken()
    }
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh', {})
    if (response.data?.accessToken) {
      api.setToken(response.data.accessToken)
    }
    return response
  },

  // Get current user
  getMe: async () => {
    return api.get('/auth/me')
  },

  // Check if email exists
  checkEmail: async (email) => {
    return api.post('/auth/check-email', { email }, { auth: false })
  },
}

// ==================== USER API ====================
export const userApi = {
  // Get user profile
  getProfile: async () => {
    return api.get('/users/profile')
  },

  // Update profile
  updateProfile: async (updates) => {
    return api.put('/users/profile', updates)
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.postFormData('/users/avatar', formData)
  },

  // Delete avatar
  deleteAvatar: async () => {
    return api.delete('/users/avatar')
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return api.put('/users/password', { currentPassword, newPassword })
  },

  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/users?${query}`)
  },

  // Admin: Get user by ID
  getUserById: async (id) => {
    return api.get(`/users/${id}`)
  },

  // Admin: Update user role
  updateUserRole: async (id, role) => {
    return api.put(`/users/${id}/role`, { role })
  },
}

// ==================== SERVICES API ====================
export const servicesApi = {
  // Get all services (public)
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/services?${query}`, { auth: false })
  },

  // Get service by ID
  getById: async (id) => {
    return api.get(`/services/${id}`, { auth: false })
  },

  // Get services by category
  getByCategory: async (category) => {
    return api.get(`/services/category/${category}`, { auth: false })
  },

  // Get popular services
  getPopular: async () => {
    return api.get('/services/popular', { auth: false })
  },

  // Get categories
  getCategories: async () => {
    return api.get('/services/categories', { auth: false })
  },

  // Admin: Create service
  create: async (serviceData) => {
    return api.post('/services', serviceData)
  },

  // Admin: Update service
  update: async (id, updates) => {
    return api.put(`/services/${id}`, updates)
  },

  // Admin: Delete service
  delete: async (id) => {
    return api.delete(`/services/${id}`)
  },
}

// ==================== BOOKINGS API ====================
export const bookingsApi = {
  // Create booking
  create: async (bookingData) => {
    return api.post('/bookings', bookingData)
  },

  // Get user's bookings
  getMyBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/bookings/my-bookings?${query}`)
  },

  // Get booking by ID
  getById: async (id) => {
    return api.get(`/bookings/${id}`)
  },

  // Cancel booking
  cancel: async (id, reason) => {
    return api.put(`/bookings/${id}/cancel`, { reason })
  },

  // Reschedule booking
  reschedule: async (id, date, time) => {
    return api.put(`/bookings/${id}/reschedule`, { date, time })
  },

  // Admin: Get all bookings
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return api.get(`/bookings?${query}`)
  },

  // Admin: Get today's bookings
  getToday: async () => {
    return api.get('/bookings/admin/today')
  },

  // Admin: Get upcoming bookings
  getUpcoming: async () => {
    return api.get('/bookings/admin/upcoming')
  },

  // Admin: Get pending bookings
  getPending: async () => {
    return api.get('/bookings/admin/pending')
  },

  // Admin: Get booking stats
  getStats: async () => {
    return api.get('/bookings/admin/stats')
  },

  // Admin: Update booking status
  updateStatus: async (id, status) => {
    return api.put(`/bookings/${id}/status`, { status })
  },

  // Admin: Confirm booking
  confirm: async (id) => {
    return api.put(`/bookings/${id}/confirm`, {})
  },

  // Admin: Complete booking
  complete: async (id) => {
    return api.put(`/bookings/${id}/complete`, {})
  },
}

export default api
