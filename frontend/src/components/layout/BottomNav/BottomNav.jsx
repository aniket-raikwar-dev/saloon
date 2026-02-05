import { NavLink } from 'react-router-dom'

const BottomNav = () => {
  const navItems = [
    { path: '/', label: 'Home', iconOutline: 'ri-home-5-line', iconFilled: 'ri-home-5-fill' },
    { path: '/services', label: 'Services', iconOutline: 'ri-scissors-cut-line', iconFilled: 'ri-scissors-cut-fill' },
    { path: '/booking', label: 'Bookings', iconOutline: 'ri-calendar-check-line', iconFilled: 'ri-calendar-check-fill' },
    { path: '/profile', label: 'Profile', iconOutline: 'ri-user-3-line', iconFilled: 'ri-user-3-fill' },
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => 
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
        >
          <div className="bottom-nav__icon">
            <i className={`${item.iconOutline} outline`}></i>
            <i className={`${item.iconFilled} filled`}></i>
          </div>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
