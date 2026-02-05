import { useAuthStore } from '../../store'
import UserHome from './UserHome'
import AdminDashboard from './AdminDashboard'

const Home = () => {
  const { user } = useAuthStore()
  
  // Render different home based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />
  }
  
  return <UserHome />
}

export default Home
