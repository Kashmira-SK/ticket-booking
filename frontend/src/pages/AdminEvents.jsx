import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Badge } from '../components/ui/ui';
import { Calendar, Users, Ticket, TrendingUp, ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, iconBg, iconColor, value, label, delta }) => (
  <div className="bg-[#111118] rounded-2xl p-5 border border-white/5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-3xl font-bold text-white mt-3">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {delta && <p className="text-xs text-emerald-400 mt-2">{delta}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/bookings')])
      .then(([statsRes, bookingsRes]) => {
        setStats(statsRes.data);
        setBookings(bookingsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin.</p>
        </div>
        <Link
          to="/admin/events"
          className="flex items-center gap-2 border border-violet-500/40 text-violet-400 hover:border-violet-500 hover:bg-violet-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        >
          Manage Events <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111118] rounded-2xl h-32 border border-white/5" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            iconBg="bg-violet-500/10"
            iconColor="text-violet-400"
            value={stats.totalEvents ?? 0}
            label="Total Events"
            delta="↑ 12% this month"
          />
          <StatCard
            icon={Users}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-400"
            value={stats.totalUsers ?? 0}
            label="Registered Users"
            delta="↑ 8% this month"
          />
          <StatCard
            icon={Ticket}
            iconBg="bg-fuchsia-500/10"
            iconColor="text-fuchsia-400"
            value={stats.totalBookings ?? 0}
            label="Total Bookings"
            delta="↑ 23% this month"
          />
          <StatCard
            icon={TrendingUp}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-400"
            value={`LKR ${(stats.totalRevenue ?? 0).toLocaleString()}`}
            label="Total Revenue"
            delta="↑ 18% this month"
          />
        </div>
      ) : null}

      {/* Bookings table */}
      <div className="bg-[#111118] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Bookings</h2>
          <span className="text-xs text-gray-500">{bookings.length} total</span>
        </div>

        {loading ? (
          <div className="animate-pulse p-5 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/3 rounded-xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket className="w-10 h-10 text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/3">
                  {['Booking ID', 'Event', 'User', 'Category', 'Qty', 'Amount', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">#{b.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium max-w-[160px] truncate">
                      {b.event?.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{b.user?.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{b.seatCategory?.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{b.quantity}</td>
                    <td className="px-4 py-3 text-sm text-violet-400 font-medium">
                      LKR {(b.seatCategory?.price * b.quantity)?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
