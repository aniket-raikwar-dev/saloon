import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useBookingStore } from '../../store'
import { getInitials, getAvatarColor } from '../../utils'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    services,
    fetchServices,
    fetchAllBookings,
    fetchStats,
    getStats, 
    getPendingBookings, 
    getTodayBookings,
    getUpcomingBookings,
    confirmBooking,
    cancelBooking 
  } = useBookingStore()

  const [actionLoading, setActionLoading] = useState(null)

  // Fetch data on mount
  useEffect(() => {
    fetchServices()
    fetchAllBookings()
    fetchStats()
  }, [fetchServices, fetchAllBookings, fetchStats])

  const stats = getStats()
  const pendingBookings = getPendingBookings()
  const todayBookings = getTodayBookings()
  const upcomingBookings = getUpcomingBookings()

  const getServiceNames = (booking) => {
    if (booking.serviceNames && booking.serviceNames.length > 0) {
      return booking.serviceNames.join(', ')
    }
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
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

  const handleConfirm = async (bookingId) => {
    setActionLoading(bookingId)
    try {
      await confirmBooking(bookingId)
    } catch (error) {
      console.error('Confirm failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (bookingId) => {
    setActionLoading(bookingId)
    try {
      await cancelBooking(bookingId)
    } catch (error) {
      console.error('Cancel failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <span className="welcome-greeting">Welcome back 👋</span>
          <h2 className="welcome-name">{user?.name}</h2>
          <p className="welcome-role">{user?.position || 'Administrator'}</p>
        </div>
        <div className="welcome-avatar" style={{ backgroundColor: getAvatarColor(user?.name) }}>
          <span>{getInitials(user?.name)}</span>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card stat-card--primary">
            <div className="stat-card__icon">
              <i className="ri-calendar-check-line"></i>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{stats.todayBookings}</span>
              <span className="stat-card__label">Today's Appointments</span>
            </div>
          </div>
          
          <div className="stat-card stat-card--warning">
            <div className="stat-card__icon">
              <i className="ri-time-line"></i>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{stats.pendingBookings}</span>
              <span className="stat-card__label">Pending Approval</span>
            </div>
          </div>
          
          <div className="stat-card stat-card--success">
            <div className="stat-card__icon">
              <i className="ri-check-double-line"></i>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">{stats.confirmedBookings}</span>
              <span className="stat-card__label">Confirmed</span>
            </div>
          </div>
          
          <div className="stat-card stat-card--info">
            <div className="stat-card__icon">
              <i className="ri-money-rupee-circle-line"></i>
            </div>
            <div className="stat-card__content">
              <span className="stat-card__value">₹{(stats.upcomingRevenue || 0).toLocaleString()}</span>
              <span className="stat-card__label">Expected Revenue</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Approvals */}
      {pendingBookings.length > 0 && (
        <section className="pending-section">
          <div className="section-header">
            <h3 className="section-title">
              <i className="ri-notification-badge-line"></i>
              Pending Approvals
            </h3>
            <span className="pending-count">{pendingBookings.length}</span>
          </div>
          
          <div className="pending-list">
            {pendingBookings.slice(0, 3).map((booking) => (
              <div key={booking._id} className="pending-card">
                <div className="pending-card__header">
                  <div className="pending-card__user">
                    <span className="avatar" style={{ backgroundColor: getAvatarColor(booking.userName) }}>{getInitials(booking.userName)}</span>
                    <div className="info">
                      <h4>{booking.userName}</h4>
                      <span>{booking.userPhone}</span>
                    </div>
                  </div>
                  <span className={`status ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="pending-card__details">
                  <div className="detail">
                    <i className="ri-scissors-cut-line"></i>
                    <span>{getServiceNames(booking)}</span>
                  </div>
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
                
                <div className="pending-card__actions">
                  <button 
                    className="action-btn action-btn--confirm"
                    onClick={() => handleConfirm(booking._id)}
                    disabled={actionLoading === booking._id}
                  >
                    <i className="ri-check-line"></i>
                    {actionLoading === booking._id ? '...' : 'Confirm'}
                  </button>
                  <button 
                    className="action-btn action-btn--cancel"
                    onClick={() => handleCancel(booking._id)}
                    disabled={actionLoading === booking._id}
                  >
                    <i className="ri-close-line"></i>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {pendingBookings.length > 3 && (
            <button className="view-all-btn" onClick={() => navigate('/booking')}>
              View All ({pendingBookings.length})
              <i className="ri-arrow-right-line"></i>
            </button>
          )}
        </section>
      )}

      {/* Today's Schedule */}
      <section className="today-section">
        <div className="section-header">
          <h3 className="section-title">Today's Schedule</h3>
          <span className="today-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        
        {todayBookings.length === 0 ? (
          <div className="empty-today">
            <i className="ri-calendar-check-line"></i>
            <p>No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="today-list">
            {todayBookings.map((booking) => (
              <div key={booking._id} className="today-card">
                <div className="today-card__time">
                  <span>{booking.time}</span>
                </div>
                <div className="today-card__content">
                  <div className="today-card__user">
                    <span className="avatar" style={{ backgroundColor: getAvatarColor(booking.userName) }}>{getInitials(booking.userName)}</span>
                    <div className="info">
                      <h4>{booking.userName}</h4>
                      <span>{getServiceNames(booking)}</span>
                    </div>
                  </div>
                  <span className={`status ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Appointments */}
      <section className="upcoming-section">
        <div className="section-header">
          <h3 className="section-title">Upcoming Appointments</h3>
          <button className="see-all-btn" onClick={() => navigate('/booking')}>
            See All
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
        
        <div className="upcoming-list">
          {upcomingBookings.length === 0 ? (
            <div className="empty-upcoming">
              <p>No upcoming appointments</p>
            </div>
          ) : (
            upcomingBookings.slice(0, 5).map((booking) => (
              <div key={booking._id} className="upcoming-card">
                <div className="upcoming-card__left">
                  <div className="upcoming-card__avatar" style={{ backgroundColor: getAvatarColor(booking.userName) }}>
                    <span>{getInitials(booking.userName)}</span>
                  </div>
                  <div className="upcoming-card__info">
                    <h4>{booking.userName}</h4>
                    <p>{getServiceNames(booking)}</p>
                  </div>
                </div>
                <div className="upcoming-card__right">
                  <div className="upcoming-card__datetime">
                    <span className="date">{formatDate(booking.date)}</span>
                    <span className="time">{booking.time}</span>
                  </div>
                  <span className={`upcoming-card__status ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-card quick-action-card--primary" onClick={() => navigate('/booking')}>
            <div className="quick-action-card__icon">
              <i className="ri-calendar-check-line"></i>
            </div>
            <div className="quick-action-card__content">
              <span className="quick-action-card__title">Bookings</span>
              <span className="quick-action-card__desc">Manage all</span>
            </div>
          </button>
          <button className="quick-action-card quick-action-card--accent" onClick={() => navigate('/services')}>
            <div className="quick-action-card__icon">
              <i className="ri-service-line"></i>
            </div>
            <div className="quick-action-card__content">
              <span className="quick-action-card__title">Services</span>
              <span className="quick-action-card__desc">Browse all</span>
            </div>
          </button>
          <button className="quick-action-card quick-action-card--secondary" onClick={() => navigate('/profile')}>
            <div className="quick-action-card__icon">
              <i className="ri-settings-3-line"></i>
            </div>
            <div className="quick-action-card__content">
              <span className="quick-action-card__title">Settings</span>
              <span className="quick-action-card__desc">Preferences</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
