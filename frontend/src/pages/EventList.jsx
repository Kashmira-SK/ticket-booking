import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function EventList() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center text-gray-400 mt-20">Loading events...</div>

  if (!events.length) return (
    <div className="text-center text-gray-400 mt-20">
      <p className="text-2xl mb-2">No events yet</p>
      <p className="text-sm">Check back soon!</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Link key={event.id} to={`/events/${event.id}`}>
            <div className="bg-gray-900 rounded-2xl overflow-hidden hover:ring-2 hover:ring-violet-500 transition">
              {event.posterUrl
                ? <img src={event.posterUrl} alt={event.title} className="w-full h-48 object-cover" />
                : <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-4xl">🎵</div>
              }
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{event.title}</h2>
                <p className="text-gray-400 text-sm mb-2">{event.venue}</p>
                <p className="text-gray-500 text-sm mb-3">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {event.seatCategories.map(cat => (
                    <span key={cat.id} className="bg-gray-800 text-xs px-2 py-1 rounded-full text-violet-300">
                      {cat.name} — LKR {cat.price.toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
