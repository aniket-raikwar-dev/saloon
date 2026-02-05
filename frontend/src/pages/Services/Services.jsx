import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useBookingStore } from '../../store'

const Services = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    services,
    fetchServices,
    selectedServices, 
    toggleService, 
    getSelectedTotal,
    setSelectedServices,
    isLoading 
  } = useBookingStore()
  
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch services on mount
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Set active category from navigation state
  useEffect(() => {
    if (location.state?.activeCategory) {
      setActiveCategory(location.state.activeCategory)
    }
    // If coming back from booking page with selected services
    if (location.state?.selectedServices) {
      setSelectedServices(location.state.selectedServices)
    }
  }, [location.state, setSelectedServices])

  const categories = [
    { id: 'all', name: 'All', icon: 'ri-apps-line' },
    { id: 'hair', name: 'Hair', icon: 'ri-scissors-cut-line' },
    { id: 'skin', name: 'Skin', icon: 'ri-sparkling-line' },
    { id: 'makeup', name: 'Makeup', icon: 'ri-brush-line' },
    { id: 'nails', name: 'Nails', icon: 'ri-hand-heart-line' },
    { id: 'spa', name: 'Spa', icon: 'ri-heart-pulse-line' },
  ]

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && service.isActive
  })

  const handleBookNow = () => {
    navigate('/book', { state: { selectedServices } })
  }

  if (isLoading && services.length === 0) {
    return (
      <div className="services-page">
        <div className="services-loading">
          <i className="ri-loader-4-line spin"></i>
          <p>Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="services-page">
      {/* Sticky Header Section */}
      <div className="services-sticky-header">
        {/* Header */}
        <div className="services-header">
          <h2 className="services-title">Our Services</h2>
          <p className="services-subtitle">Choose your perfect treatment</p>
        </div>

        {/* Search */}
        <div className="services-search">
          <i className="ri-search-line"></i>
          <input 
            type="text" 
            placeholder="Search services..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>

        {/* Categories - Horizontal Scroll */}
        <div className="services-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-chip ${activeCategory === category.id ? 'category-chip--active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <i className={category.icon}></i>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Services Grid */}
      <div className="services-scroll-area">
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div 
              key={service._id} 
              className={`service-card ${selectedServices.includes(service._id) ? 'service-card--selected' : ''}`}
              onClick={() => toggleService(service._id)}
            >
              {/* Checkmark - Top Right of Card */}
              {selectedServices.includes(service._id) && (
                <div className="service-card__check">
                  <i className="ri-check-line"></i>
                </div>
              )}
              
              {/* Popular Badge - Top Left */}
              {service.isPopular && (
                <span className="service-card__badge">Popular</span>
              )}
              
              <div className="service-card__visual">
                <span className="service-card__emoji">{service.icon}</span>
              </div>
              
              <div className="service-card__content">
                <h4 className="service-card__name">{service.name}</h4>
                
                <div className="service-card__meta">
                  <span className="service-card__duration">
                    <i className="ri-time-line"></i>
                    {service.duration}
                  </span>
                </div>
                
                <div className="service-card__footer">
                  <span className="service-card__price">₹{service.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="services-empty">
            <i className="ri-search-eye-line"></i>
            <p>No services found</p>
            <span>Try adjusting your search or category</span>
          </div>
        )}
      </div>

      {/* Book Now Bar */}
      {selectedServices.length > 0 && (
        <div className="book-now-bar">
          <div className="book-now-bar__info">
            <span className="book-now-bar__count">{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''}</span>
            <span className="book-now-bar__total">₹{getSelectedTotal().toLocaleString()}</span>
          </div>
          <button className="book-now-bar__btn" onClick={handleBookNow}>
            Book Now
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default Services
