import { Outlet } from 'react-router-dom'
import Header from '../Header'
import BottomNav from '../BottomNav'

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default MainLayout
