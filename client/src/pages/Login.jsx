import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Mail, Lock, AlertCircle, Sparkles, Shield, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const destination = location.state?.from || '/dashboard';
      navigate(destination);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo login buttons for college viva/demo
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Make sure the backend server is running and seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-200">
            <Search className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Portal Sign In</h1>
          <p className="text-xs text-slate-500">Access your college lost & found applications and claims</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">College Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> College Viva Demo Accounts
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@college.edu', 'admin123')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold text-left transition-colors flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <div>Campus Admin</div>
                <div className="text-[10px] text-purple-600 font-normal">Security Desk</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('rahul.s@college.edu', 'password123')}
              className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold text-left transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div>Rahul Sharma</div>
                <div className="text-[10px] text-indigo-600 font-normal">Student (CS Dept)</div>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          New student?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
