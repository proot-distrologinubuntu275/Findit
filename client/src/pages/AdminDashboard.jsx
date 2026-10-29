import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  ShieldAlert,
  Users,
  Package,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/overview');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    if (!confirm(`Change role to ${nextRole}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role.');
    }
  };

  const handleDeleteItemAdmin = async (itemId) => {
    if (!confirm('Are you sure as Admin to delete this item?')) return;
    try {
      await api.delete(`/admin/items/${itemId}`);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting item.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400 text-xs">
        Loading Campus Security Administration data...
      </div>
    );
  }

  const filteredUsers = (data?.users || []).filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.collegeId && u.collegeId.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-800 text-purple-200 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Campus Security & Admin Desk</h1>
            <p className="text-xs text-purple-300">
              Centralized oversight of all reported items, claims, and student accounts
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] bg-purple-900 text-purple-200 px-3 py-1 rounded-full border border-purple-700">
            Logged in as Administrator
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Campus Users', value: data?.stats?.totalUsers, color: 'text-slate-900' },
          { label: 'Total Items', value: data?.stats?.totalItems, color: 'text-indigo-600' },
          { label: 'Lost Items', value: data?.stats?.totalLost, color: 'text-rose-600' },
          { label: 'Found Items', value: data?.stats?.totalFound, color: 'text-emerald-600' },
          { label: 'Resolved Cases', value: data?.stats?.totalResolved, color: 'text-purple-600' },
          { label: 'Pending Claims', value: data?.stats?.pendingClaims, color: 'text-amber-600' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value || 0}</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 2-Column Split: Student Directory & Recent Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Student Directory */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-slate-900">Student & Member Directory</h2>
              <p className="text-xs text-slate-500">Registered campus members with active posts</p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Email & Roll No</th>
                  <th className="py-2.5 px-3">Posts / Claims</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{u.email}</div>
                      {u.collegeId && (
                        <span className="text-[10px] font-mono text-slate-400">ID: {u.collegeId}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium mr-1">
                        {u._count?.items || 0} items
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        {u._count?.claims || 0} claims
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline"
                        >
                          Make {u.role === 'ADMIN' ? 'Student' : 'Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Recent Claims Feed */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900">Recent Campus Claims</h2>
          <p className="text-xs text-slate-500">Live feed of student claim requests</p>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {data?.recentClaims && data.recentClaims.length > 0 ? (
              data.recentClaims.map((claim) => (
                <div key={claim.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">
                      {claim.claimant?.name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
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
                  <p className="text-slate-600 text-[11px]">
                    Item: <span className="font-medium text-slate-800">{claim.item?.title}</span>
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{new Date(claim.createdAt).toLocaleDateString()}</span>
                    <Link
                      to={`/items/${claim.itemId}`}
                      className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                    >
                      Inspect <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No claims logged yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
