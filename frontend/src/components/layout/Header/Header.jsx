import { useState } from 'react'

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    {
      id: 1,
      title: 'Booking Confirmed',
      message: 'Your hair coloring appointment is confirmed for Feb 12',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      title: 'Reminder',
      message: 'Your facial appointment is tomorrow at 2:00 PM',
      time: '1 day ago',
      read: false,
    },
    {
      id: 3,
      title: 'Special Offer',
      message: 'Get 20% off on all spa treatments this weekend!',
      time: '2 days ago',
      read: true,
    },
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="app-header">
      <div className="app-header__left">
        <h1 className="app-header__logo">Glamour Studio</h1>
      </div>
      
      <div className="app-header__right">
        <div className="notification">
          <button 
            className={`notification__btn icon-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="ri-notification-3-line"></i>
            {unreadCount > 0 && (
              <span className="notification__badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                className="notification__overlay"
                onClick={() => setShowNotifications(false)}
              />
              <div className="notification__dropdown">
                <div className="notification__header">
                  <h3>Notifications</h3>
                  <button>Mark all read</button>
                </div>
                <div className="notification__list">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification__item ${!notification.read ? 'notification__item--unread' : ''}`}
                    >
                      <div className="notification__icon">
                        <i className="ri-notification-3-fill"></i>
                      </div>
                      <div className="notification__content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="notification__footer">
                  <button>View All Notifications</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
