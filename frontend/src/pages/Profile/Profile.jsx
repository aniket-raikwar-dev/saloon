import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useBookingStore } from '../../store'
import { Button } from '../../components'
import { getInitials, getAvatarColor } from '../../utils'

const Profile = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { user, logout, updateProfile, uploadAvatar, deleteAvatar, isLoading } = useAuthStore()
  const { 
    bookings, 
    fetchMyBookings, 
    fetchAllBookings, 
    fetchStats, 
    getStats 
  } = useBookingStore()
  
  const isAdmin = user?.role === 'admin'
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  // Fetch data on mount
  useEffect(() => {
    if (isAdmin) {
      fetchAllBookings()
      fetchStats()
    } else if (user) {
      fetchMyBookings()
    }
  }, [isAdmin, user, fetchMyBookings, fetchAllBookings, fetchStats])

  // Update editData when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
      })
    }
  }, [user])

  // Get user stats
  const userBookings = bookings.filter(b => 
    b.user === user?._id || b.user?._id === user?._id
  )
  const userStats = {
    totalBookings: userBookings.length,
    completedBookings: userBookings.filter(b => b.status === 'completed').length,
    upcomingBookings: userBookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length,
  }
  
  // Admin stats
  const adminStats = isAdmin ? getStats() : null

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    })
  }

  // Format member since
  const formatMemberSince = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      await updateProfile({
        name: editData.name,
        phone: editData.phone || null,
        dateOfBirth: editData.dateOfBirth || null,
        gender: editData.gender || null,
      })
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || '',
    })
    setIsEditing(false)
    setMessage({ type: '', text: '' })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' })
      return
    }

    setIsUploadingAvatar(true)
    setMessage({ type: '', text: '' })

    try {
      await uploadAvatar(file)
      setMessage({ type: 'success', text: 'Profile picture updated!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload image' })
    } finally {
      setIsUploadingAvatar(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.avatar) return
    
    setIsUploadingAvatar(true)
    setMessage({ type: '', text: '' })

    try {
      await deleteAvatar()
      setMessage({ type: 'success', text: 'Profile picture removed!' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to remove image' })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const quickActions = isAdmin ? [
    { icon: 'ri-dashboard-line', label: 'Dashboard', action: () => navigate('/'), color: '#6366f1' },
    { icon: 'ri-calendar-check-line', label: 'Bookings', action: () => navigate('/booking'), color: '#ec4899' },
    { icon: 'ri-service-line', label: 'Services', action: () => navigate('/services'), color: '#8b5cf6' },
  ] : [
    { icon: 'ri-calendar-line', label: 'My Bookings', action: () => navigate('/booking'), color: '#6366f1' },
    { icon: 'ri-service-line', label: 'Services', action: () => navigate('/services'), color: '#ec4899' },
    { icon: 'ri-heart-line', label: 'Favorites', action: () => {}, color: '#8b5cf6' },
  ]

  const settingsItems = [
    { icon: 'ri-notification-3-line', label: 'Notifications', subtitle: 'Manage your alerts', action: () => {} },
    { icon: 'ri-lock-password-line', label: 'Security', subtitle: 'Password & authentication', action: () => {} },
    { icon: 'ri-question-line', label: 'Help & Support', subtitle: 'Get help or contact us', action: () => {} },
    { icon: 'ri-information-line', label: 'About', subtitle: 'App version & info', action: () => {} },
  ]

  return (
    <div className="profile-page">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-card__avatar-section">
          <div 
            className={`profile-avatar ${isUploadingAvatar ? 'profile-avatar--uploading' : ''}`}
            onClick={handleAvatarClick}
            style={!user?.avatar ? { backgroundColor: getAvatarColor(user?.name) } : {}}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span className="profile-avatar__initials">{getInitials(user?.name)}</span>
            )}
            <div className="profile-avatar__overlay">
              {isUploadingAvatar ? (
                <i className="ri-loader-4-line spin"></i>
              ) : (
                <i className="ri-camera-line"></i>
              )}
            </div>
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>
          {user?.avatar && (
            <button 
              className="remove-avatar-btn"
              onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
              disabled={isUploadingAvatar}
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          )}
        </div>

        <div className="profile-card__info">
          <h2 className="profile-card__name">{user?.name || 'Guest User'}</h2>
          <p className="profile-card__email">{user?.email}</p>
          {isAdmin && user?.position && (
            <span className="profile-card__position">{user.position}</span>
          )}
          <p className="profile-card__member">
            <i className="ri-vip-crown-line"></i>
            Member since {formatMemberSince(user?.createdAt)}
          </p>
        </div>

        <button 
          className="profile-card__edit-btn"
          onClick={() => setIsEditing(true)}
        >
          <i className="ri-pencil-line"></i>
          Edit Profile
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`profile-message profile-message--${message.type}`}>
          <i className={message.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })}>
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="profile-stats">
        {isAdmin ? (
          <>
            <div className="stat-card stat-card--primary">
              <div className="stat-card__icon">
                <i className="ri-calendar-check-line"></i>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__value">{adminStats?.totalBookings || 0}</span>
                <span className="stat-card__label">Total Bookings</span>
              </div>
            </div>
            <div className="stat-card stat-card--warning">
              <div className="stat-card__icon">
                <i className="ri-time-line"></i>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__value">{adminStats?.pendingBookings || 0}</span>
                <span className="stat-card__label">Pending</span>
              </div>
            </div>
            <div className="stat-card stat-card--success">
              <div className="stat-card__icon">
                <i className="ri-money-rupee-circle-line"></i>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__value">₹{((adminStats?.totalRevenue || 0) / 1000).toFixed(1)}k</span>
                <span className="stat-card__label">Revenue</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card stat-card--primary">
              <div className="stat-card__icon">
                <i className="ri-calendar-line"></i>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__value">{userStats.totalBookings}</span>
                <span className="stat-card__label">Total Visits</span>
              </div>
            </div>
            <div className="stat-card stat-card--accent">
              <div className="stat-card__icon">
                <i className="ri-time-line"></i>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__value">{userStats.upcomingBookings}</span>
                <span className="stat-card__label">Upcoming</span>
              </div>
            </div>
            <div className="stat-card stat-card--success">
              <div className="stat-card__icon">
                <i className="ri-check-double-line"></i>
              </div>
              <div className="stat-card__content">
                <span className="stat-card__value">{userStats.completedBookings}</span>
                <span className="stat-card__label">Completed</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <section className="profile-section">
        <h3 className="profile-section__title">Quick Actions</h3>
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action"
              onClick={action.action}
              style={{ '--action-color': action.color }}
            >
              <div className="quick-action__icon">
                <i className={action.icon}></i>
              </div>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Personal Information */}
      <section className="profile-section">
        <h3 className="profile-section__title">Personal Information</h3>
        <div className="info-card">
          <div className="info-item">
            <div className="info-item__icon">
              <i className="ri-user-line"></i>
            </div>
            <div className="info-item__content">
              <span className="info-item__label">Full Name</span>
              <span className="info-item__value">{user?.name || 'Not set'}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-item__icon">
              <i className="ri-mail-line"></i>
            </div>
            <div className="info-item__content">
              <span className="info-item__label">Email</span>
              <span className="info-item__value">{user?.email || 'Not set'}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-item__icon">
              <i className="ri-phone-line"></i>
            </div>
            <div className="info-item__content">
              <span className="info-item__label">Phone</span>
              <span className="info-item__value">{user?.phone || 'Not set'}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-item__icon">
              <i className="ri-cake-2-line"></i>
            </div>
            <div className="info-item__content">
              <span className="info-item__label">Date of Birth</span>
              <span className="info-item__value">{formatDate(user?.dateOfBirth)}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-item__icon">
              <i className="ri-user-heart-line"></i>
            </div>
            <div className="info-item__content">
              <span className="info-item__label">Gender</span>
              <span className="info-item__value" style={{ textTransform: 'capitalize' }}>
                {user?.gender?.replace('-', ' ') || 'Not set'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings */}
      <section className="profile-section">
        <h3 className="profile-section__title">Settings</h3>
        <div className="settings-list">
          {settingsItems.map((item, index) => (
            <button
              key={index}
              className="settings-item"
              onClick={item.action}
            >
              <div className="settings-item__icon">
                <i className={item.icon}></i>
              </div>
              <div className="settings-item__content">
                <span className="settings-item__label">{item.label}</span>
                <span className="settings-item__subtitle">{item.subtitle}</span>
              </div>
              <i className="ri-arrow-right-s-line settings-item__arrow"></i>
            </button>
          ))}
        </div>
      </section>

      {/* Logout Button */}
      <button className="logout-btn" onClick={handleLogout}>
        <i className="ri-logout-box-r-line"></i>
        <span>Logout</span>
      </button>

      {/* App Info */}
      <div className="profile-footer">
        <p>Glamour Studio v1.0.0</p>
        <p>© 2026 All rights reserved</p>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="edit-modal__header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={handleCancel}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <div className="edit-modal__body">
              <div className="form-group">
                <label>
                  <i className="ri-user-line"></i>
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="ri-phone-line"></i>
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>
                  <i className="ri-mail-line"></i>
                  Email
                </label>
                <input 
                  type="email" 
                  value={editData.email}
                  disabled
                  className="disabled"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="ri-cake-2-line"></i>
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    value={editData.dateOfBirth}
                    onChange={(e) => setEditData({...editData, dateOfBirth: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="ri-user-heart-line"></i>
                    Gender
                  </label>
                  <select 
                    value={editData.gender}
                    onChange={(e) => setEditData({...editData, gender: e.target.value})}
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="edit-modal__footer">
              <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
