import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { MapPin, Calendar, Music } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-[#111118] rounded-2xl border border-white/5 overflow-hidden">
      <div className="h-52 bg-white/5" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then((r) => setEvents(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const minPrice = (event) => {
    if (!event.seatCategories?.length) return null;
    return Math.min(...event.seatCategories.map((c) => c.price));
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="w-full py-24 text-center"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.3), transparent)',
        }}
      >
        <p className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4">
          Discover · Book · Experience
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-white mb-4">
          Upcoming Events
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Find the best concerts, workshops, and experiences near you.
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16 -mt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <span className="text-6xl mb-4">🎭</span>
            <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
            <p className="text-gray-500">Check back soon — something exciting is coming.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group bg-[#111118] border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Poster */}
                {event.posterUrl ? (
                  <img
                    src={event.posterUrl}
                    alt={event.name}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="h-52 w-full bg-gradient-to-br from-violet-900/50 to-fuchsia-900/30 flex items-center justify-center">
                    <Music className="w-12 h-12 text-violet-500/40" />
                  </div>
                )}

                {/* Body */}
                <div className="p-5 flex flex-col gap-3">
                  <h2 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {event.name}
                  </h2>

                  <div className="flex flex-col gap-1.5">
                    {event.venue && (
                      <p className="text-sm text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-600" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </p>
                    )}
                    {event.date && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-600" />
                        {formatDate(event.date)}
                      </p>
                    )}
                  </div>

                  {/* Categories + price */}
                  <div className="flex items-end justify-between mt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {event.seatCategories?.slice(0, 2).map((cat) => (
                        <span
                          key={cat.id}
                          className="bg-violet-500/10 text-violet-300 text-xs px-2.5 py-1 rounded-full border border-violet-500/20"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                    {minPrice(event) !== null && (
                      <p className="text-sm font-semibold text-violet-400 shrink-0 ml-2">
                        From LKR {minPrice(event).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
