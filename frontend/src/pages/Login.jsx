import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Ticket, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 30% 50%, rgba(124,58,237,0.25), transparent), #0a0a0f' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(192,38,211,0.1),transparent_50%)]" />
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Ticket className="w-8 h-8 text-violet-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              TicketApp
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Your next <br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              experience
            </span>
            <br /> awaits.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Discover events, book tickets, <br /> and make memories.
          </p>
          <div className="mt-12 flex items-center gap-2 justify-center text-gray-600 text-sm">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>10,000+ events listed</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:max-w-[480px]">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Ticket className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              TicketApp
            </span>
          </div>

          <div className="bg-[#111118] rounded-2xl p-8 border border-white/5">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-400 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all duration-200 w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-400 font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all duration-200 w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
