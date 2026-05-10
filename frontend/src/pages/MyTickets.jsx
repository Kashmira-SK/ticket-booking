import { useState, useEffect } from 'react'
import api from '../lib/api'

export default function MyTickets() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/bookings/my')
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-gray-400 mt-20">Loading...</div>

  if (!bookings.length) return (
    <div className="text-center text-gray-400 mt-20">
      <p className="text-2xl mb-2">No tickets yet</p>
      <p className="text-sm">Book an event to see your tickets here</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
      <div className="space-y-4">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-gray-900 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">{booking.event.title}</h2>
                <p className="text-gray-400 text-sm">{booking.event.venue}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(booking.event.date).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="flex gap-6 text-sm text-gray-400 mb-4">
              <span>{booking.seatCategory.name}</span>
              <span>x{booking.quantity}</span>
              <span className="text-violet-400 font-medium">
                LKR {(booking.seatCategory.price * booking.quantity).toLocaleString()}
              </span>
            </div>

            {booking.tickets.map(ticket => (
              <div key={ticket.id} className="mt-4 p-4 bg-gray-800 rounded-xl flex items-center gap-4">
                <img src={ticket.qrCode} alt="QR Code" className="w-24 h-24 rounded-lg" />
                <div>
                  <p className="text-sm font-medium">Ticket #{ticket.id}</p>
                  <p className={`text-xs mt-1 ${ticket.isUsed ? 'text-red-400' : 'text-green-400'}`}>
                    {ticket.isUsed ? 'Used' : 'Valid'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
