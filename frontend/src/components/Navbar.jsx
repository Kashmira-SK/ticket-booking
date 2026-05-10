import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-violet-400 tracking-tight">
          🎟 TicketApp
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-gray-400">Hi, {user.name}</span>
              <Link to="/my-tickets" className="text-gray-300 hover:text-white transition">My Tickets</Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="text-violet-400 hover:text-violet-300 transition">Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
              <Link to="/register" className="bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-lg transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
