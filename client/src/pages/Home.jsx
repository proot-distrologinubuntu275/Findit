import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import ItemCard from '../components/ItemCard';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalResolved: 0,
    totalUsers: 0,
    recentItems: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const res = await api.get('/items/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/items');
    }
  };

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-emerald-200/20 blur-3xl rounded-full -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Official University Lost & Found Hub
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Lost Something on Campus? <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
              We'll Help You Find It.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A secured, student-first platform to file lost item reports, log found belongings, and securely verify ownership through campus security.
          </p>

          {/* Search Bar Widget */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
              <div className="flex items-center gap-2 flex-1 px-3 w-full">
                <Search className="w-5 h-5 text-indigo-600 shrink-0" />
                <input
                  type="text"
                  placeholder="What did you lose or find? (e.g. Casio calculator, ID card, keys...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2.5 text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-md shadow-indigo-300"
              >
                Search Campus
              </button>
            </div>
          </form>

          {/* Quick CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/create?type=LOST"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-sm"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Report a Lost Item
            </Link>

            <Link
              to="/create?type=FOUND"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Report a Found Item
            </Link>

            <Link
              to="/items"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
            >
              Browse All Listings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* Live Campus Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-rose-400">{stats.totalLost}</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">Lost Items Reported</p>
            </div>
            <div className="p-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">{stats.totalFound}</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">Found Items Logged</p>
            </div>
            <div className="p-2 pt-4 md:pt-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-400">{stats.totalResolved}</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">Safely Reunited</p>
            </div>
            <div className="p-2 pt-4 md:pt-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400">{stats.totalUsers}</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mt-1">Registered Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Recent Campus Posts</h2>
            <p className="text-xs text-slate-500 mt-1">Latest items reported lost or found across university buildings</p>
          </div>
          <Link
            to="/items"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            View All ({stats.totalLost + stats.totalFound})
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : stats.recentItems && stats.recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-sm">No items posted yet.</p>
            <Link
              to="/create"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              Be the first to post
            </Link>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-black text-slate-900">How CampusTrack Works</h2>
            <p className="text-xs text-slate-500 mt-1">A simple, transparent process to prevent fraud and claim items</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black text-lg mx-auto">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Post an Application</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Whether you misplaced your belongings or found an item in the cafeteria, snap a photo and list it with specific campus coordinates.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg mx-auto">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Verify & Claim Ownership</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit a claim answering the security question or describing unique marks. The poster reviews and approves legitimate owners.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg mx-auto">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Safe Handover</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contact via student email/phone or collect the verified item safely from the Campus Security Desk at Gate #1.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
