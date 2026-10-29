import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  User,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Bell,
  Trash2,
  ExternalLink,
  ShieldAlert,
  PlusCircle,
  Tag
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'claims' | 'notifications'
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [itemsRes, claimsRes, notifsRes] = await Promise.all([
        api.get('/items/my'),
        api.get('/claims/my'),
        api.get('/claims/notifications')
      ]);

      setMyItems(itemsRes.data.items || []);
      setMyClaims(claimsRes.data.claims || []);
      setNotifications(notifsRes.data.notifications || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      setMyItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-indigo-200">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            {user?.collegeId && (
              <p className="text-xs font-mono text-slate-600 bg-slate-100 inline-block px-2 py-0.5 rounded">
                Student ID: {user.collegeId}
              </p>
            )}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <Link
            to="/create"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-200 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Post New Item
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" /> Admin Security Desk
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'items'
              ? 'text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          My Reported Items ({myItems.length})
          {activeTab === 'items' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          My Submitted Claims ({myClaims.length})
          {activeTab === 'claims' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'text-indigo-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications ({notifications.length})
          {activeTab === 'notifications' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Loading your data...
        </div>
      ) : activeTab === 'items' ? (
        <div className="space-y-4">
          {myItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">You haven't posted any items yet</p>
              <p className="text-xs text-slate-400 mt-1">Report lost items or belongings you've found on campus</p>
              <Link
                to="/create"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          item.type === 'LOST'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'RESOLVED'
                            ? 'bg-slate-900 text-emerald-400'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    <p className="text-[11px] text-slate-400 mt-2">Location: {item.location}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {item.claims?.length || 0} claim requests
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/items/${item.id}`}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                      >
                        Manage Claims
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'claims' ? (
        <div className="space-y-4">
          {myClaims.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">No claims filed yet</p>
              <p className="text-xs text-slate-400 mt-1">If you find an item in listings that belongs to you, submit a claim</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Claimed for item:</span>
                      <h3 className="font-bold text-sm text-slate-900">{claim.item?.title}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full self-start sm:self-auto ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-600 text-white'
                          : claim.status === 'REJECTED'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900 mb-0.5">Your submitted verification message:</p>
                    <p className="whitespace-pre-wrap">{claim.message}</p>
                  </div>

                  {claim.status === 'APPROVED' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-emerald-900">🎉 Claim Approved by Owner!</p>
                      <p className="text-emerald-800">
                        Owner Contact: {claim.item?.user?.name} ({claim.item?.user?.phone || claim.item?.user?.email})
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <span>Submitted on {new Date(claim.createdAt).toLocaleDateString()}</span>
                    <Link
                      to={`/items/${claim.itemId}`}
                      className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      View Item Details <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Notifications Tab */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="inline-block mt-2 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        View Related Item →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
