import { useState, useEffect } from 'react'
import { useAuthStore, useBookingStore } from '../../store'
import { Button } from '../../components'
import { getInitials, getAvatarColor } from '../../utils'

const Booking = () => {
  const { user } = useAuthStore()
  const { 
    bookings,
    services,
    fetchServices,
    fetchMyBookings,
    fetchAllBookings,
    confirmBooking, 
    cancelBooking,
    completeBooking,
    rescheduleBooking,
    isLoading 
  } = useBookingStore()
  
  const isAdmin = user?.role === 'admin'
  const [activeTab, setActiveTab] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' })
  const [actionLoading, setActionLoading] = useState(null)

  // Fetch data on mount
  useEffect(() => {
    fetchServices()
    if (isAdmin) {
      fetchAllBookings()
    } else if (user) {
      fetchMyBookings()
    }
  }, [isAdmin, user, fetchServices, fetchMyBookings, fetchAllBookings])

  // Filter bookings based on user role
  const displayBookings = isAdmin 
    ? bookings 
    : bookings.filter(b => b.user === user?._id || b.user?._id === user?._id)

  // Filter bookings by tab
  const filteredBookings = activeTab === 'all' 
    ? displayBookings 
    : displayBookings.filter(b => b.status === activeTab)

  const tabs = [
    { id: 'all', label: 'All', count: displayBookings.length },
    { id: 'pending', label: 'Pending', count: displayBookings.filter(b => b.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: displayBookings.filter(b => b.status === 'confirmed').length },
    { id: 'completed', label: 'Completed', count: displayBookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: displayBookings.filter(b => b.status === 'cancelled').length },
  ]

  const getServiceNames = (booking) => {
    // Use denormalized serviceNames if available
    if (booking.serviceNames && booking.serviceNames.length > 0) {
      return booking.serviceNames.join(', ')
    }
    // Fallback to looking up from services
    if (booking.services && services.length > 0) {
      return booking.services
        .map(serviceId => {
          const id = typeof serviceId === 'object' ? serviceId._id : serviceId
          const service = services.find(s => s._id === id)
          return service?.name
        })
        .filter(Boolean)
        .join(', ')
    }
    return 'Service'
  }

  const getServiceIcons = (booking) => {
    if (booking.services && services.length > 0) {
      return booking.services
        .map(serviceId => {
          const id = typeof serviceId === 'object' ? serviceId._id : serviceId
          const service = services.find(s => s._id === id)
          return service?.icon
        })
        .filter(Boolean)
    }
    return ['✨']
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status--pending',
      confirmed: 'status--confirmed',
      completed: 'status--completed',
      cancelled: 'status--cancelled'
    }
    return colors[status] || ''
  }

  const handleAction = async (action, bookingId, ...args) => {
    setActionLoading(bookingId)
    try {
      await action(bookingId, ...args)
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReschedule = (booking) => {
    setSelectedBooking(booking)
    const bookingDate = new Date(booking.date).toISOString().split('T')[0]
    setRescheduleData({ date: bookingDate, time: booking.time })
    setShowRescheduleModal(true)
  }

  const submitReschedule = async () => {
    if (selectedBooking && rescheduleData.date && rescheduleData.time) {
      setActionLoading(selectedBooking._id)
      try {
        await rescheduleBooking(selectedBooking._id, rescheduleData.date, rescheduleData.time)
        setShowRescheduleModal(false)
        setSelectedBooking(null)
      } catch (error) {
        console.error('Reschedule failed:', error)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'
  ]

  if (isLoading && bookings.length === 0) {
    return (
      <div className="booking-page">
        <div className="booking-loading">
          <i className="ri-loader-4-line spin"></i>
          <p>Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-page">
      {/* Header */}
      <div className="booking-header">
        <h2>{isAdmin ? 'Manage Bookings' : 'My Bookings'}</h2>
        <p>{isAdmin ? 'View and manage all client appointments' : 'View and manage your appointments'}</p>
      </div>

      {/* Tabs */}
      <div className="booking-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`booking-tab ${activeTab === tab.id ? 'booking-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-bookings">
            <i className="ri-calendar-line"></i>
            <h3>No bookings found</h3>
            <p>{activeTab === 'all' ? 'No appointments yet' : `No ${activeTab} appointments`}</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card__header">
                <div className="booking-id">
                  <span>#{booking.bookingId}</span>
                </div>
                <span className={`status ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              {/* Show user info for admin */}
              {isAdmin && (
                <div className="booking-card__user">
                  <span className="avatar" style={{ backgroundColor: getAvatarColor(booking.userName) }}>{getInitials(booking.userName)}</span>
                  <div className="user-info">
                    <h4>{booking.userName}</h4>
                    <span>{booking.userPhone}</span>
                  </div>
                </div>
              )}

              <div className="booking-card__services">
                <div className="service-icons">
                  {getServiceIcons(booking).map((icon, i) => (
                    <span key={i} className="service-icon">{icon}</span>
                  ))}
                </div>
                <div className="service-names">
                  {getServiceNames(booking)}
                </div>
              </div>

              <div className="booking-card__details">
                <div className="detail">
                  <i className="ri-calendar-line"></i>
                  <span>{formatDate(booking.date)}</span>
                </div>
                <div className="detail">
                  <i className="ri-time-line"></i>
                  <span>{booking.time}</span>
                </div>
                <div className="detail">
                  <i className="ri-money-rupee-circle-line"></i>
                  <span>₹{booking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {booking.notes && (
                <div className="booking-card__notes">
                  <i className="ri-sticky-note-line"></i>
                  <span>{booking.notes}</span>
                </div>
              )}

              {/* Actions based on role and status */}
              <div className="booking-card__actions">
                {isAdmin ? (
                  // Admin Actions
                  <>
                    {booking.status === 'pending' && (
                      <>
                        <Button 
                          variant="primary" 
                          size="small"
                          icon="ri-check-line"
                          onClick={() => handleAction(confirmBooking, booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          {actionLoading === booking._id ? '...' : 'Confirm'}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="small"
                          icon="ri-close-line"
                          onClick={() => handleAction(cancelBooking, booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <Button 
                          variant="primary" 
                          size="small"
                          icon="ri-check-double-line"
                          onClick={() => handleAction(completeBooking, booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          {actionLoading === booking._id ? '...' : 'Complete'}
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="small"
                          icon="ri-calendar-line"
                          onClick={() => handleReschedule(booking)}
                          disabled={actionLoading === booking._id}
                        >
                          Reschedule
                        </Button>
                        <Button 
                          variant="outline" 
                          size="small"
                          icon="ri-close-line"
                          onClick={() => handleAction(cancelBooking, booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  // User Actions
                  <>
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <>
                        <Button 
                          variant="secondary" 
                          size="small"
                          icon="ri-calendar-line"
                          onClick={() => handleReschedule(booking)}
                          disabled={actionLoading === booking._id}
                        >
                          Reschedule
                        </Button>
                        <Button 
                          variant="outline" 
                          size="small"
                          icon="ri-close-line"
                          onClick={() => handleAction(cancelBooking, booking._id)}
                          disabled={actionLoading === booking._id}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <Button 
                        variant="secondary" 
                        size="small"
                        icon="ri-star-line"
                      >
                        Rate Service
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Reschedule Appointment</h3>
              <button className="close-btn" onClick={() => setShowRescheduleModal(false)}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Select New Date</label>
                <input 
                  type="date" 
                  value={rescheduleData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Select New Time</label>
                <div className="time-grid">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`time-option ${rescheduleData.time === time ? 'time-option--selected' : ''}`}
                      onClick={() => setRescheduleData({...rescheduleData, time})}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={submitReschedule}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Confirm Reschedule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Booking
