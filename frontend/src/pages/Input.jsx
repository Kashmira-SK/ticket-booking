export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm text-gray-400 font-medium">{label}</label>
      )}
      <input
        className={`bg-white/5 border ${
          error ? 'border-red-500/60' : 'border-white/10'
        } rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:bg-white/8 transition-all duration-200 w-full ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
