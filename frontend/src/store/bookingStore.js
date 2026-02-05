import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { bookingsApi, servicesApi } from '../services/api'

const useBookingStore = create(
  persist(
    (set, get) => ({
      // State
      services: [],
      bookings: [],
      selectedServices: [],
      isLoading: false,
      error: null,
      stats: null,

      // ==================== SERVICE ACTIONS ====================
      
      // Fetch all services from API
      fetchServices: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await servicesApi.getAll()
          const services = response.data.services || []
          set({ services, isLoading: false })
          return services
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Service Selection Actions (local state for cart)
      addService: (serviceId) => {
        set((state) => ({
          selectedServices: state.selectedServices.includes(serviceId)
            ? state.selectedServices
            : [...state.selectedServices, serviceId]
        }))
      },

      removeService: (serviceId) => {
        set((state) => ({
          selectedServices: state.selectedServices.filter((id) => id !== serviceId)
        }))
      },

      toggleService: (serviceId) => {
        set((state) => ({
          selectedServices: state.selectedServices.includes(serviceId)
            ? state.selectedServices.filter((id) => id !== serviceId)
            : [...state.selectedServices, serviceId]
        }))
      },

      clearSelectedServices: () => {
        set({ selectedServices: [] })
      },

      setSelectedServices: (services) => {
        set({ selectedServices: services })
      },

      // ==================== BOOKING ACTIONS ====================

      // Fetch user's bookings
      fetchMyBookings: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await bookingsApi.getMyBookings()
          const bookings = response.data.bookings || []
          set({ bookings, isLoading: false })
          return bookings
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Fetch all bookings (admin)
      fetchAllBookings: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await bookingsApi.getAll()
          const bookings = response.data.bookings || []
          set({ bookings, isLoading: false })
          return bookings
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Create booking
      createBooking: async (bookingData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await bookingsApi.create(bookingData)
          const newBooking = response.data.booking
          
          set((state) => ({
            bookings: [newBooking, ...state.bookings],
            selectedServices: [],
            isLoading: false
          }))
          
          return newBooking
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Cancel booking
      cancelBooking: async (bookingId, reason = '') => {
        set({ isLoading: true, error: null })
        try {
          const response = await bookingsApi.cancel(bookingId, reason)
          const updatedBooking = response.data.booking
          
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking._id === bookingId ? updatedBooking : booking
            ),
            isLoading: false
          }))
          
          return updatedBooking
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Reschedule booking
      rescheduleBooking: async (bookingId, newDate, newTime) => {
        set({ isLoading: true, error: null })
        try {
          const response = await bookingsApi.reschedule(bookingId, newDate, newTime)
          const updatedBooking = response.data.booking
          
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking._id === bookingId ? updatedBooking : booking
            ),
            isLoading: false
          }))
          
          return updatedBooking
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Admin: Confirm booking
      confirmBooking: async (bookingId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await bookingsApi.confirm(bookingId)
          const updatedBooking = response.data.booking
          
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking._id === bookingId ? updatedBooking : booking
            ),
            isLoading: false
          }))
          
          return updatedBooking
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Admin: Complete booking
      completeBooking: async (bookingId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await bookingsApi.complete(bookingId)
          const updatedBooking = response.data.booking
          
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking._id === bookingId ? updatedBooking : booking
            ),
            isLoading: false
          }))
          
          return updatedBooking
        } catch (error) {
          set({ isLoading: false, error: error.message })
          throw error
        }
      },

      // Fetch booking stats (admin)
      fetchStats: async () => {
        try {
          const response = await bookingsApi.getStats()
          const stats = response.data.stats
          set({ stats })
          return stats
        } catch (error) {
          console.error('Failed to fetch stats:', error)
          throw error
        }
      },

      // ==================== GETTERS ====================

      // Get service by ID (from local state)
      getServiceById: (id) => {
        return get().services.find((service) => service._id === id)
      },

      // Get services by IDs
      getServicesByIds: (ids) => {
        return get().services.filter((service) => ids.includes(service._id))
      },

      // Get selected services details
      getSelectedServicesDetails: () => {
        const services = get().services
        const selectedIds = get().selectedServices
        return services.filter((service) => selectedIds.includes(service._id))
      },

      // Get selected total
      getSelectedTotal: () => {
        const services = get().services
        return get().selectedServices.reduce((total, id) => {
          const service = services.find((s) => s._id === id)
          return total + (service?.price || 0)
        }, 0)
      },

      // Filter bookings by user (for user view)
      getBookingsByUser: (userId) => {
        return get().bookings.filter((booking) => booking.user === userId || booking.user?._id === userId)
      },

      // Filter bookings by status
      getBookingsByStatus: (status) => {
        return get().bookings.filter((booking) => booking.status === status)
      },

      // Get today's bookings
      getTodayBookings: () => {
        const today = new Date().toISOString().split('T')[0]
        return get().bookings.filter((booking) => {
          const bookingDate = new Date(booking.date).toISOString().split('T')[0]
          return bookingDate === today && ['pending', 'confirmed'].includes(booking.status)
        })
      },

      // Get upcoming bookings
      getUpcomingBookings: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return get().bookings.filter((booking) => {
          const bookingDate = new Date(booking.date)
          return bookingDate >= today && ['pending', 'confirmed'].includes(booking.status)
        })
      },

      // Get pending bookings
      getPendingBookings: () => {
        return get().bookings.filter((booking) => booking.status === 'pending')
      },

      // Get stats from local bookings (fallback)
      getStats: () => {
        const bookings = get().bookings
        const stats = get().stats
        
        // Return API stats if available
        if (stats) return stats
        
        // Calculate from local data
        const today = new Date().toISOString().split('T')[0]
        
        return {
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b) => b.status === 'pending').length,
          confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
          completedBookings: bookings.filter((b) => b.status === 'completed').length,
          cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
          todayBookings: bookings.filter((b) => {
            const bookingDate = new Date(b.date).toISOString().split('T')[0]
            return bookingDate === today
          }).length,
          totalRevenue: bookings
            .filter((b) => b.status === 'completed')
            .reduce((sum, b) => sum + b.totalAmount, 0),
          upcomingRevenue: bookings
            .filter((b) => ['pending', 'confirmed'].includes(b.status))
            .reduce((sum, b) => sum + b.totalAmount, 0),
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'glamour-booking-storage',
      partialize: (state) => ({ 
        selectedServices: state.selectedServices,
      }),
    }
  )
)

export default useBookingStore
