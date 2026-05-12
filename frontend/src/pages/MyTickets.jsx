import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Badge } from '../components/ui/ui';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my')
      .then((r) => setBookings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#111118] rounded-2xl border border-white/5 h-44" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Tickets</h1>
        {bookings.length > 0 && (
          <span className="bg-violet-500/15 text-violet-400 border border-violet-500/25 text-sm font-semibold px-3 py-1 rounded-full">
            {bookings.length}
          </span>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Ticket className="w-16 h-16 text-gray-700 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tickets yet</h3>
          <p className="text-gray-500 mb-8">
            Your tickets will appear here after booking an event.
          </p>
          <Link
            to="/"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#111118] rounded-2xl border border-white/5 overflow-hidden"
            >
              {/* Top section */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white mb-1 line-clamp-1">
                    {booking.event?.name}
                  </h2>
                  <div className="flex flex-col gap-1">
                    {booking.event?.venue && (
                      <p className="text-sm text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                        {booking.event.venue}
                      </p>
                    )}
                    {booking.event?.date && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                        {formatDate(booking.event.date)}
                      </p>
                    )}
                  </div>
                </div>
                <Badge status={booking.status} />
              </div>

              {/* Tear line */}
              <div className="flex items-center px-2">
                <div className="w-5 h-5 rounded-full bg-[#0a0a0f] -ml-4 shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-white/10 mx-2" />
                <div className="w-5 h-5 rounded-full bg-[#0a0a0f] -mr-4 shrink-0" />
              </div>

              {/* Bottom section */}
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-600">Category</span>{' '}
                    <span className="text-white font-medium">{booking.seatCategory?.name}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-600">Qty</span>{' '}
                    <span className="text-white font-medium">{booking.quantity}</span>
                  </p>
                  <p className="text-base font-bold text-violet-400 mt-1">
                    LKR {(booking.seatCategory?.price * booking.quantity)?.toLocaleString()}
                  </p>
                </div>

                {/* QR code */}
                {booking.qrCode && (
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <img
                      src={booking.qrCode}
                      alt="QR"
                      className="w-20 h-20 rounded-lg bg-white p-1"
                    />
                    <p className="text-xs text-gray-600">Ticket #{booking.id?.slice(0, 6)}</p>
                    <p className={`text-xs font-medium ${booking.status === 'CONFIRMED' ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {booking.status === 'CONFIRMED' ? '✓ Valid' : booking.status}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
