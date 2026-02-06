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

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  useEffect(() => {
    if (location.state?.activeCategory) {
      setActiveCategory(location.state.activeCategory)
    }
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
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="services-page">
      {/* Header Section */}
      <div className="services-header">
        <div className="header-content">
          <h1>Services</h1>
          <p>Select treatments for your appointment</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="services-controls">
        <div className="search-wrapper">
          <i className="ri-search-line"></i>
          <input 
            type="text" 
            placeholder="Search services..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filter-btn ${activeCategory === category.id ? 'filter-btn--active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <i className={category.icon}></i>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-container">
        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="ri-search-line"></i>
            </div>
            <h3>No services found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map((service) => {
              const isSelected = selectedServices.includes(service._id)
              return (
                <div 
                  key={service._id} 
                  className={`service-item ${isSelected ? 'service-item--selected' : ''}`}
                  onClick={() => toggleService(service._id)}
                >
                  {/* Selection Checkbox */}
                  <div className={`service-checkbox ${isSelected ? 'service-checkbox--checked' : ''}`}>
                    {isSelected && <i className="ri-check-line"></i>}
                  </div>

                  {/* Popular Tag */}
                  {service.isPopular && (
                    <div className="popular-tag">
                      <i className="ri-star-fill"></i>
                    </div>
                  )}

                  {/* Service Icon */}
                  <div className="service-icon-wrapper">
                    <div className="service-icon">{service.icon}</div>
                  </div>

                  {/* Service Info */}
                  <div className="service-info">
                    <h3 className="service-title">{service.name}</h3>
                    <div className="service-details">
                      <span className="service-time">
                        <i className="ri-time-line"></i>
                        {service.duration}
                      </span>
                    </div>
                    <div className="service-price-wrapper">
                      <span className="service-price">₹{service.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {selectedServices.length > 0 && (
        <div className="action-bar">
          <div className="action-info">
            <span className="action-count">{selectedServices.length} selected</span>
            <span className="action-total">₹{getSelectedTotal().toLocaleString()}</span>
          </div>
          <button className="action-button" onClick={handleBookNow}>
            Continue
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default Services
