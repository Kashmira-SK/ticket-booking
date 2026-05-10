import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    api.get(`/api/events/${id}`)
      .then(res => {
        setEvent(res.data)
        setSelectedCategory(res.data.seatCategories[0])
      })
      .catch(() => toast.error('Event not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleBook = async () => {
    if (!user) return navigate('/login')
    setBooking(true)
    try {
      const res = await api.post('/api/bookings', {
        eventId: event.id,
        seatCategoryId: selectedCategory.id,
        quantity
      })
      navigate('/checkout', { state: { booking: res.data.booking, clientSecret: res.data.clientSecret } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (loading) return <div className="text-center text-gray-400 mt-20">Loading...</div>
  if (!event) return <div className="text-center text-gray-400 mt-20">Event not found</div>

  const total = selectedCategory ? selectedCategory.price * quantity : 0

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-2xl overflow-hidden mb-6">
        {event.posterUrl
          ? <img src={event.posterUrl} alt={event.title} className="w-full h-72 object-cover" />
          : <div className="w-full h-72 bg-gray-800 flex items-center justify-center text-6xl">🎵</div>
        }
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-400 mb-1">📍 {event.venue}</p>
          <p className="text-gray-400 mb-4">
            📅 {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
          <p className="text-gray-300 leading-relaxed">{event.description}</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Book Tickets</h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Seat Category</label>
          <div className="flex gap-3 flex-wrap">
            {event.seatCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg border transition ${
                  selectedCategory?.id === cat.id
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="font-medium">{cat.name}</div>
                <div className="text-sm text-gray-400">LKR {cat.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{cat.availableSeats} left</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-lg transition"
            >−</button>
            <span className="text-lg font-semibold w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(selectedCategory?.availableSeats || 1, q + 1))}
              className="bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-lg transition"
            >+</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-violet-400">LKR {total.toLocaleString()}</p>
          </div>
          <button
            onClick={handleBook}
            disabled={booking || !selectedCategory}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-6 py-3 rounded-xl font-semibold transition"
          >
            {booking ? 'Processing...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
