import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../../components'
import { useAuthStore, useBookingStore } from '../../store'

const BookingConfirm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    services,
    selectedServices, 
    setSelectedServices, 
    createBooking,
    clearSelectedServices,
    getSelectedTotal,
    fetchServices,
    isLoading 
  } = useBookingStore()
  
  // Initialize from navigation state if present
  useEffect(() => {
    fetchServices()
    if (location.state?.selectedServices) {
      setSelectedServices(location.state.selectedServices)
    }
  }, [location.state, setSelectedServices, fetchServices])

  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: ''
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  // Generate dates for next 14 days
  const generateDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        isoDate: date.toISOString().split('T')[0]
      })
    }
    return dates
  }

  const dates = generateDates()

  // Time slots grouped by period
  const timeSlots = {
    morning: [
      { id: 1, time: '09:00 AM', available: true },
      { id: 2, time: '09:30 AM', available: true },
      { id: 3, time: '10:00 AM', available: true },
      { id: 4, time: '10:30 AM', available: true },
      { id: 5, time: '11:00 AM', available: true },
      { id: 6, time: '11:30 AM', available: true },
    ],
    afternoon: [
      { id: 7, time: '12:00 PM', available: true },
      { id: 8, time: '12:30 PM', available: true },
      { id: 9, time: '02:00 PM', available: true },
      { id: 10, time: '02:30 PM', available: true },
      { id: 11, time: '03:00 PM', available: true },
      { id: 12, time: '03:30 PM', available: true },
    ],
    evening: [
      { id: 13, time: '04:00 PM', available: true },
      { id: 14, time: '04:30 PM', available: true },
      { id: 15, time: '05:00 PM', available: true },
      { id: 16, time: '05:30 PM', available: true },
      { id: 17, time: '06:00 PM', available: true },
      { id: 18, time: '06:30 PM', available: true },
    ]
  }

  const selectedServiceDetails = services.filter(s => selectedServices.includes(s._id))

  const getTotalDuration = () => {
    const totalMinutes = selectedServiceDetails.reduce((sum, s) => sum + (s.durationMinutes || 45), 0)
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      return mins > 0 ? `~${hours}h ${mins}m` : `~${hours}h`
    }
    return `~${totalMinutes} mins`
  }

  const removeService = (serviceId) => {
    setSelectedServices(selectedServices.filter(id => id !== serviceId))
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddMore = () => {
    navigate('/services', { 
      state: { 
        selectedServices: selectedServices,
        returnTo: '/book'
      } 
    })
  }

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    setError(null)

    const bookingData = {
      services: selectedServices,
      date: selectedDate?.isoDate,
      time: selectedTime?.time,
      notes: formData.notes || undefined
    }
    
    try {
      await createBooking(bookingData)
      clearSelectedServices()
      navigate('/booking')
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.')
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedServices.length > 0
      case 2:
        return selectedDate !== null && selectedTime !== null
      case 3:
        return formData.name.trim() !== '' && formData.phone.trim() !== ''
      default:
        return false
    }
  }

  return (
    <div className="booking-confirm">
      {/* Header */}
      <div className="booking-confirm__header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="ri-arrow-left-line"></i>
        </button>
        <h1>Book Appointment</h1>
        <div className="step-indicator">
          <span>{currentStep}/3</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`progress-step ${currentStep >= 1 ? 'progress-step--active' : ''} ${currentStep > 1 ? 'progress-step--completed' : ''}`}>
          <div className="progress-step__circle">
            {currentStep > 1 ? <i className="ri-check-line"></i> : '1'}
          </div>
          <span>Services</span>
        </div>
        <div className="progress-step__line"></div>
        <div className={`progress-step ${currentStep >= 2 ? 'progress-step--active' : ''} ${currentStep > 2 ? 'progress-step--completed' : ''}`}>
          <div className="progress-step__circle">
            {currentStep > 2 ? <i className="ri-check-line"></i> : '2'}
          </div>
          <span>Schedule</span>
        </div>
        <div className="progress-step__line"></div>
        <div className={`progress-step ${currentStep >= 3 ? 'progress-step--active' : ''}`}>
          <div className="progress-step__circle">3</div>
          <span>Confirm</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="booking-error">
          <i className="ri-error-warning-line"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Step 1: Services */}
      {currentStep === 1 && (
        <div className="booking-step animate-fade-in">
          <div className="step-header">
            <div className="step-header__title">
              <h2>Selected Services</h2>
              <span className="count-badge">{selectedServiceDetails.length}</span>
            </div>
            <button className="add-more-btn" onClick={handleAddMore}>
              <i className="ri-add-line"></i>
              Add More
            </button>
          </div>

          {selectedServiceDetails.length === 0 ? (
            <div className="empty-services">
              <div className="empty-services__icon">
                <i className="ri-scissors-cut-line"></i>
              </div>
              <p>No services selected</p>
              <Button variant="primary" onClick={handleAddMore}>
                Browse Services
              </Button>
            </div>
          ) : (
            <div className="services-summary">
              {selectedServiceDetails.map((service) => (
                <div key={service._id} className="service-summary-card">
                  <div className="service-summary-card__icon">
                    <span>{service.icon}</span>
                  </div>
                  <div className="service-summary-card__content">
                    <h4>{service.name}</h4>
                    <span className="duration">
                      <i className="ri-time-line"></i>
                      {service.duration}
                    </span>
                  </div>
                  <div className="service-summary-card__right">
                    <span className="price">₹{service.price.toLocaleString()}</span>
                    <button 
                      className="remove-btn"
                      onClick={() => removeService(service._id)}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {selectedServiceDetails.length > 0 && (
            <div className="booking-summary-card">
              <div className="summary-row">
                <span>Services ({selectedServiceDetails.length})</span>
                <span>₹{getSelectedTotal().toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Duration</span>
                <span>{getTotalDuration()}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{getSelectedTotal().toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date & Time */}
      {currentStep === 2 && (
        <div className="booking-step animate-fade-in">
          {/* Date Selection */}
          <div className="selection-section">
            <div className="selection-header">
              <div className="selection-header__icon">
                <i className="ri-calendar-2-line"></i>
              </div>
              <div className="selection-header__text">
                <h2>Choose Date</h2>
                <p>Select your preferred appointment date</p>
              </div>
            </div>

            {/* Date Picker */}
            <div className="date-picker">
              <div className="date-picker__scroll">
                {dates.map((d, index) => (
                  <button
                    key={index}
                    className={`date-card ${selectedDate?.dayNum === d.dayNum ? 'date-card--selected' : ''} ${d.isToday ? 'date-card--today' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <span className="date-card__day">{d.day}</span>
                    <span className="date-card__num">{d.dayNum}</span>
                    <span className="date-card__month">{d.month}</span>
                    {d.isToday && <span className="date-card__badge">Today</span>}
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="selection-confirm">
                <i className="ri-checkbox-circle-fill"></i>
                <span>{selectedDate.fullDate}</span>
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div className="selection-section">
            <div className="selection-header">
              <div className="selection-header__icon">
                <i className="ri-time-line"></i>
              </div>
              <div className="selection-header__text">
                <h2>Choose Time</h2>
                <p>Pick an available time slot</p>
              </div>
            </div>

            {/* Morning Slots */}
            <div className="time-section">
              <div className="time-section__header">
                <i className="ri-sun-line"></i>
                <span>Morning</span>
              </div>
              <div className="time-slots-grid">
                {timeSlots.morning.map((slot) => (
                  <button
                    key={slot.id}
                    className={`time-slot ${selectedTime?.id === slot.id ? 'time-slot--selected' : ''} ${!slot.available ? 'time-slot--disabled' : ''}`}
                    onClick={() => slot.available && setSelectedTime(slot)}
                    disabled={!slot.available}
                  >
                    <span className="time-slot__time">{slot.time}</span>
                    {!slot.available && <span className="time-slot__status">Booked</span>}
                    {selectedTime?.id === slot.id && <i className="ri-check-line time-slot__check"></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon Slots */}
            <div className="time-section">
              <div className="time-section__header">
                <i className="ri-sun-foggy-line"></i>
                <span>Afternoon</span>
              </div>
              <div className="time-slots-grid">
                {timeSlots.afternoon.map((slot) => (
                  <button
                    key={slot.id}
                    className={`time-slot ${selectedTime?.id === slot.id ? 'time-slot--selected' : ''} ${!slot.available ? 'time-slot--disabled' : ''}`}
                    onClick={() => slot.available && setSelectedTime(slot)}
                    disabled={!slot.available}
                  >
                    <span className="time-slot__time">{slot.time}</span>
                    {!slot.available && <span className="time-slot__status">Booked</span>}
                    {selectedTime?.id === slot.id && <i className="ri-check-line time-slot__check"></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening Slots */}
            <div className="time-section">
              <div className="time-section__header">
                <i className="ri-moon-line"></i>
                <span>Evening</span>
              </div>
              <div className="time-slots-grid">
                {timeSlots.evening.map((slot) => (
                  <button
                    key={slot.id}
                    className={`time-slot ${selectedTime?.id === slot.id ? 'time-slot--selected' : ''} ${!slot.available ? 'time-slot--disabled' : ''}`}
                    onClick={() => slot.available && setSelectedTime(slot)}
                    disabled={!slot.available}
                  >
                    <span className="time-slot__time">{slot.time}</span>
                    {!slot.available && <span className="time-slot__status">Booked</span>}
                    {selectedTime?.id === slot.id && <i className="ri-check-line time-slot__check"></i>}
                  </button>
                ))}
              </div>
            </div>

            {selectedTime && (
              <div className="selection-confirm">
                <i className="ri-checkbox-circle-fill"></i>
                <span>{selectedTime.time}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Contact Details */}
      {currentStep === 3 && (
        <div className="booking-step animate-fade-in">
          <div className="selection-section">
            <div className="selection-header">
              <div className="selection-header__icon">
                <i className="ri-user-3-line"></i>
              </div>
              <div className="selection-header__text">
                <h2>Your Details</h2>
                <p>We'll use this to confirm your booking</p>
              </div>
            </div>

            <div className="contact-form">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <div className="input-field">
                  <i className="ri-user-line"></i>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number <span className="required">*</span></label>
                <div className="input-field">
                  <i className="ri-phone-line"></i>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-field">
                  <i className="ri-mail-line"></i>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email (optional)"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Special Requests</label>
                <div className="input-field input-field--textarea">
                  <i className="ri-chat-3-line"></i>
                  <textarea
                    name="notes"
                    placeholder="Any special requests or notes..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Final Summary */}
          <div className="final-summary">
            <h3>
              <i className="ri-file-list-3-line"></i>
              Booking Summary
            </h3>
            
            <div className="final-summary__items">
              <div className="summary-item">
                <div className="summary-item__icon">
                  <i className="ri-scissors-cut-line"></i>
                </div>
                <div className="summary-item__content">
                  <span className="label">Services</span>
                  <span className="value">{selectedServiceDetails.map(s => s.name).join(', ')}</span>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-item__icon">
                  <i className="ri-calendar-line"></i>
                </div>
                <div className="summary-item__content">
                  <span className="label">Date</span>
                  <span className="value">{selectedDate?.fullDate}</span>
                </div>
              </div>
              
              <div className="summary-item">
                <div className="summary-item__icon">
                  <i className="ri-time-line"></i>
                </div>
                <div className="summary-item__content">
                  <span className="label">Time</span>
                  <span className="value">{selectedTime?.time}</span>
                </div>
              </div>
            </div>
            
            <div className="final-summary__total">
              <span>Total Amount</span>
              <span className="amount">₹{getSelectedTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="booking-confirm__footer">
        {currentStep > 1 && (
          <Button 
            variant="secondary" 
            onClick={() => setCurrentStep(prev => prev - 1)}
            icon="ri-arrow-left-line"
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button 
            variant="primary" 
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
            icon="ri-arrow-right-line"
            iconPosition="right"
          >
            Continue
          </Button>
        ) : (
          <Button 
            variant="primary" 
            onClick={handleConfirmBooking}
            disabled={!canProceed() || isSubmitting}
            icon={isSubmitting ? "" : "ri-check-line"}
            iconPosition="right"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default BookingConfirm
