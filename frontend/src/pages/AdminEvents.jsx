import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'

const emptyForm = {
  title: '', description: '', venue: '', date: '', posterUrl: '',
  seatCategories: [{ name: 'General', price: '', totalSeats: '' }]
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const fetchEvents = () => {
    api.get('/api/events')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEvents() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/events', {
        ...form,
        seatCategories: form.seatCategories.map(cat => ({
          ...cat,
          price: Number(cat.price),
          totalSeats: Number(cat.totalSeats)
        }))
      })
      toast.success('Event created!')
      setForm(emptyForm)
      setShowForm(false)
      fetchEvents()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      await api.delete(`/api/events/${id}`)
      toast.success('Event deleted')
      fetchEvents()
    } catch (err) {
      toast.error('Failed to delete event')
    }
  }

  const updateCategory = (index, field, value) => {
    const updated = [...form.seatCategories]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, seatCategories: updated })
  }

  const addCategory = () => {
    setForm({ ...form, seatCategories: [...form.seatCategories, { name: '', price: '', totalSeats: '' }] })
  }

  const removeCategory = (index) => {
    setForm({ ...form, seatCategories: form.seatCategories.filter((_, i) => i !== index) })
  }

  if (loading) return <div className="text-center text-gray-400 mt-20">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-gray-400 hover:text-white transition">← Dashboard</Link>
          <h1 className="text-3xl font-bold">Manage Events</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create Event</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Venue</label>
                <input
                  value={form.venue}
                  onChange={e => setForm({ ...form, venue: e.target.value })}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Poster URL (optional)</label>
                <input
                  value={form.posterUrl}
                  onChange={e => setForm({ ...form, posterUrl: e.target.value })}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Seat Categories</label>
                <button type="button" onClick={addCategory} className="text-violet-400 text-sm hover:text-violet-300">+ Add Category</button>
              </div>
              <div className="space-y-2">
                {form.seatCategories.map((cat, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      placeholder="Name"
                      value={cat.name}
                      onChange={e => updateCategory(i, 'name', e.target.value)}
                      className="flex-1 bg-gray-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                    <input
                      placeholder="Price (LKR)"
                      type="number"
                      value={cat.price}
                      onChange={e => updateCategory(i, 'price', e.target.value)}
                      className="w-32 bg-gray-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                    <input
                      placeholder="Seats"
                      type="number"
                      value={cat.totalSeats}
                      onChange={e => updateCategory(i, 'totalSeats', e.target.value)}
                      className="w-24 bg-gray-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500"
                      required
                    />
                    {form.seatCategories.length > 1 && (
                      <button type="button" onClick={() => removeCategory(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium transition"
            >
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">All Events</h2>
        {!events.length ? (
          <p className="text-gray-400 text-sm">No events yet</p>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-gray-400 text-sm">{event.venue} — {new Date(event.date).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-1">
                    {event.seatCategories.map(cat => (
                      <span key={cat.id} className="text-xs text-gray-500">
                        {cat.name}: {cat.availableSeats}/{cat.totalSeats} left
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-400/10 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
