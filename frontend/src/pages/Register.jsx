import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Ticket, Star } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-all duration-200 w-full';

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 70% 50%, rgba(192,38,211,0.2), transparent), #0a0a0f' }}>
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Ticket className="w-8 h-8 text-violet-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">TicketApp</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Join thousands <br />of{' '}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">event-goers</span>.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">Book tickets in seconds.<br />Never miss what matters.</p>
          <div className="mt-12 flex items-center gap-2 justify-center text-gray-600 text-sm">
            <Star className="w-4 h-4 text-fuchsia-600 fill-fuchsia-600" />
            <span>Free to join, forever</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:max-w-[480px]">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Ticket className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">TicketApp</span>
          </div>
          <div className="bg-[#111118] rounded-2xl p-8 border border-white/5">
            <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-gray-400 text-sm mb-8">Start booking in under a minute</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-400 font-medium">Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-400 font-medium">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required className={inputCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-gray-400 font-medium">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
