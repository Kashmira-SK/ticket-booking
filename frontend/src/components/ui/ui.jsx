// Badge
const statusMap = {
  CONFIRMED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  CANCELLED: 'bg-red-500/15 text-red-400 border-red-500/25',
};

export function Badge({ status, children }) {
  const cls = statusMap[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/25';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      {children || status}
    </span>
  );
}

// Card
export function Card({ children, hover = false, className = '' }) {
  return (
    <div className={`bg-[#111118] rounded-2xl border border-white/5 ${hover ? 'hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
}

// SkeletonCard
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[#111118] rounded-2xl border border-white/5 ${className}`} />
  );
}
