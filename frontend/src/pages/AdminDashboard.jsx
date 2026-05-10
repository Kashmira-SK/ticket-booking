import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/bookings')
    ])
      .then(([statsRes, bookingsRes]) => {
        setStats(statsRes.data)
        setBookings(bookingsRes.data)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-gray-400 mt-20">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link
          to="/admin/events"
          className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Manage Events
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events', value: stats.totalEvents },
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Total Bookings', value: stats.totalBookings },
            { label: 'Revenue', value: `LKR ${stats.totalRevenue.toLocaleString()}` },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-violet-400">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
        {!bookings.length ? (
          <p className="text-gray-400 text-sm">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2 pr-4">ID</th>
                  <th className="text-left py-2 pr-4">User</th>
                  <th className="text-left py-2 pr-4">Event</th>
                  <th className="text-left py-2 pr-4">Category</th>
                  <th className="text-left py-2 pr-4">Qty</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 pr-4 text-gray-500">#{b.id}</td>
                    <td className="py-3 pr-4">{b.user.name}</td>
                    <td className="py-3 pr-4">{b.event.title}</td>
                    <td className="py-3 pr-4">{b.seatCategory.name}</td>
                    <td className="py-3 pr-4">{b.quantity}</td>
                    <td className="py-3 pr-4">LKR {(b.seatCategory.price * b.quantity).toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        b.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                        b.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
