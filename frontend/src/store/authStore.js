import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, userApi } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.login(email, password)
          const { user, accessToken } = response.data
          
          set({ 
            user, 
            accessToken,
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          
          return user
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Invalid email or password' 
          })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.register(userData)
          const { user, accessToken } = response.data
          
          set({ 
            user, 
            accessToken,
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          
          return user
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed' 
          })
          throw error
        }
      },

      loginWithGoogle: async (idToken) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await authApi.googleSignIn(idToken)
          const { user, accessToken } = response.data
          
          set({ 
            user, 
            accessToken,
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          
          return user
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Google sign-in failed' 
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ 
            user: null, 
            accessToken: null,
            isAuthenticated: false, 
            error: null 
          })
        }
      },

      refreshUser: async () => {
        try {
          const response = await authApi.getMe()
          set({ user: response.data.user })
          return response.data.user
        } catch (error) {
          console.error('Failed to refresh user:', error)
          // If refresh fails, logout
          get().logout()
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await userApi.updateProfile(updates)
          const updatedUser = response.data.user
          
          set({ 
            user: updatedUser,
            isLoading: false,
            error: null 
          })
          
          return updatedUser
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update profile' 
          })
          throw error
        }
      },

      uploadAvatar: async (file) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await userApi.uploadAvatar(file)
          const updatedUser = response.data.user
          
          set({ 
            user: updatedUser,
            isLoading: false,
            error: null 
          })
          
          return updatedUser
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to upload avatar' 
          })
          throw error
        }
      },

      deleteAvatar: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await userApi.deleteAvatar()
          const updatedUser = response.data.user
          
          set({ 
            user: updatedUser,
            isLoading: false,
            error: null 
          })
          
          return updatedUser
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to delete avatar' 
          })
          throw error
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null })
        
        try {
          await userApi.changePassword(currentPassword, newPassword)
          set({ isLoading: false, error: null })
          return true
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to change password' 
          })
          throw error
        }
      },

      // Getters
      isAdmin: () => get().user?.role === 'admin',
      isUser: () => get().user?.role === 'user',
    }),
    {
      name: 'glamour-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Export dummy credentials for display in login page (matching backend seed data)
export const DUMMY_CREDENTIALS = {
  user: { email: 'sarah@glamour.com', password: 'user123' },
  admin: { email: 'admin@glamour.com', password: 'admin123' },
}

export default useAuthStore
