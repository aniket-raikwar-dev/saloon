import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useBookingStore } from '../../store'
import { getInitials, getAvatarColor } from '../../utils'

const UserHome = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    services, 
    bookings, 
    fetchServices, 
    fetchMyBookings,
    setSelectedServices 
  } = useBookingStore()

  // Fetch data on mount
  useEffect(() => {
    fetchServices()
    if (user) {
      fetchMyBookings()
    }
  }, [user, fetchServices, fetchMyBookings])

  // Get user's upcoming booking
  const userBookings = bookings.filter(b => 
    b.user === user?._id || b.user?._id === user?._id
  )
  const upcomingBooking = userBookings.find(b => 
    ['pending', 'confirmed'].includes(b.status) && 
    new Date(b.date) >= new Date()
  )

  const categories = [
    { id: 'hair', name: 'Hair', icon: 'ri-scissors-cut-line', color: '#e9d5ff' },
    { id: 'skin', name: 'Skin', icon: 'ri-sparkling-line', color: '#fce7f3' },
    { id: 'makeup', name: 'Makeup', icon: 'ri-brush-line', color: '#dbeafe' },
    { id: 'nails', name: 'Nails', icon: 'ri-hand-heart-line', color: '#fef3c7' },
    { id: 'spa', name: 'Spa', icon: 'ri-heart-pulse-line', color: '#d1fae5' },
  ]

  const popularServices = services.filter(s => s.isPopular).slice(0, 3)

  const handleCategoryClick = (categoryId) => {
    navigate('/services', { state: { activeCategory: categoryId } })
  }

  const handleMoreClick = () => {
    navigate('/services', { state: { activeCategory: 'all' } })
  }

  const handleQuickBook = (serviceId) => {
    setSelectedServices([serviceId])
    navigate('/book', { state: { selectedServices: [serviceId] } })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

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

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <span className="greeting">{getGreeting()} 👋</span>
          <h2 className="name">{user?.name?.split(' ')[0] || 'Guest'}!</h2>
          <p className="subtitle">Ready to glow today?</p>
        </div>
        <div className="welcome-avatar" style={{ backgroundColor: getAvatarColor(user?.name) }}>
          <span>{getInitials(user?.name)}</span>
        </div>
      </section>

      {/* Upcoming Appointment Card */}
      {upcomingBooking && (
        <section className="upcoming-appointment">
          <div className="appointment-card">
            <div className="appointment-card__header">
              <div className="label">
                <i className="ri-calendar-check-line"></i>
                <span>Upcoming Appointment</span>
              </div>
              <span className={`status status--${upcomingBooking.status}`}>
                {upcomingBooking.status}
              </span>
            </div>
            <div className="appointment-card__body">
              <div className="info">
                <h4>{getServiceNames(upcomingBooking)}</h4>
                <div className="meta">
                  <span>
                    <i className="ri-calendar-line"></i>
                    {formatDate(upcomingBooking.date)}
                  </span>
                  <span>
                    <i className="ri-time-line"></i>
                    {upcomingBooking.time}
                  </span>
                </div>
              </div>
              <button 
                className="view-btn"
                onClick={() => navigate('/booking')}
              >
                View
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Search Bar */}
      <section className="search-section">
        <div className="search-bar-simple" onClick={() => navigate('/services')}>
          <i className="ri-search-line"></i>
          <input 
            type="text" 
            placeholder="Search for services..." 
            readOnly
          />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-section">
        <div className="section-header">
          <h3 className="section-title">Categories</h3>
        </div>
        <div className="categories-grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="category-item"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div 
                className="category-item__icon" 
                style={{ backgroundColor: category.color }}
              >
                <i className={category.icon}></i>
              </div>
              <span className="category-item__name">{category.name}</span>
            </div>
          ))}
          {/* More Button */}
          <div 
            className="category-item category-item--more"
            onClick={handleMoreClick}
          >
            <div className="category-item__icon">
              <i className="ri-more-line"></i>
            </div>
            <span className="category-item__name">More</span>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="popular-section">
        <div className="section-header">
          <h3 className="section-title">Popular Services</h3>
        </div>
        <div className="popular-list">
          {popularServices.length === 0 ? (
            <div className="popular-loading">
              <p>Loading services...</p>
            </div>
          ) : (
            popularServices.map((service) => (
              <div key={service._id} className="popular-card">
                <div className="popular-card__image">
                  <span>{service.icon}</span>
                </div>
                <div className="popular-card__content">
                  <div className="popular-card__header">
                    <h4 className="popular-card__name">{service.name}</h4>
                  </div>
                  <div className="popular-card__footer">
                    <span className="popular-card__price">₹{service.price.toLocaleString()}</span>
                    <span className="popular-card__duration">
                      <i className="ri-time-line"></i>
                      {service.duration}
                    </span>
                  </div>
                </div>
                <button 
                  className="popular-card__action"
                  onClick={() => handleQuickBook(service._id)}
                >
                  <i className="ri-add-line"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Book Now CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-card__content">
            <h3>Ready to book?</h3>
            <p>Explore our services and book your appointment today</p>
          </div>
          <button 
            className="cta-card__btn"
            onClick={() => navigate('/services')}
          >
            Book Now
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </section>
    </div>
  )
}

export default UserHome
