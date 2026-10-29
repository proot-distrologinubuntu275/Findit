import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Search,
  PlusCircle,
  Bell,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Compass,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll notifications every 30s
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/claims/notifications');
      setNotifications(res.data.notifications || []);
      const unread = (res.data.notifications || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      // Ignore
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.put(`/claims/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setNotificationsOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-slate-900">
                <span>Campus<span className="text-indigo-600">Track</span></span>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  College Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">
                Lost & Found Assistance System
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/items"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/items'
                  ? 'text-indigo-600 bg-indigo-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              Browse Listings
            </Link>

            <Link
              to="/create"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Post Lost / Found
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-indigo-600 bg-indigo-50/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                My Dashboard
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border ${
                  location.pathname === '/admin'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    aria-label="Notifications"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-indigo-600" /> Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-sm">
                            No notifications yet!
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkAsRead(n.id, n.link)}
                              className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors text-left ${
                                !n.isRead ? 'bg-indigo-50/40 font-medium' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5">
                                  {!n.isRead ? (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 block"></span>
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5 text-slate-300" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                                  <span className="text-[10px] text-slate-400 mt-1 block">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 hidden sm:block max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {user.collegeId && (
                          <span className="inline-block mt-1 text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            ID: {user.collegeId}
                          </span>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" /> My Profile & Claims
                      </Link>

                      <Link
                        to="/create"
                        className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-emerald-600" /> Report Lost / Found
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          className="px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Campus Security Portal
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/items"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Browse Listings
          </Link>
          <Link
            to="/create"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-600 hover:bg-emerald-50"
          >
            + Post Lost or Found Item
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              My Dashboard & Claims
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50"
            >
              Admin Security Panel
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
