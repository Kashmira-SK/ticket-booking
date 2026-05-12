const variants = {
  primary:
    'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white hover:shadow-lg hover:shadow-violet-500/25',
  secondary:
    'border border-violet-500/40 text-violet-400 hover:border-violet-500 hover:bg-violet-500/10',
  danger:
    'border border-red-500/40 text-red-400 hover:border-red-500 hover:bg-red-500/10',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
