import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Upload,
  MessageSquare,
  Lock,
  ExternalLink,
  Trash2,
  Tag
} from 'lucide-react';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Claim modal state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimantContact, setClaimantContact] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  // Action status state
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/items/${id}`);
      setItem(res.data.item);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimMessage.trim()) {
      setClaimError('Please provide details or answer the security question.');
      return;
    }

    setSubmittingClaim(true);
    setClaimError('');

    try {
      const formData = new FormData();
      formData.append('itemId', item.id);
      formData.append('message', claimMessage);
      if (claimantContact) formData.append('claimantContact', claimantContact);
      if (proofFile) formData.append('proofImage', proofFile);

      await api.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setClaimSuccess('Claim request filed successfully! The poster will review it.');
      setTimeout(() => {
        setClaimModalOpen(false);
        fetchItem();
      }, 1500);
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to file claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleClaimStatusChange = async (claimId, newStatus) => {
    if (!confirm(`Are you sure you want to mark this claim as ${newStatus}?`)) return;
    setActionLoading(true);
    try {
      await api.put(`/claims/${claimId}/status`, { status: newStatus });
      await fetchItem();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleResolved = async () => {
    const nextStatus = item.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    if (!confirm(`Change item status to ${nextStatus}?`)) return;
    setActionLoading(true);
    try {
      await api.put(`/items/${item.id}`, { status: nextStatus });
      await fetchItem();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!confirm('Are you sure you want to permanently delete this application?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/items/${item.id}`);
      navigate('/items');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-xs text-slate-500">Loading item application details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Item Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'This listing may have been removed or does not exist.'}</p>
        <Link to="/items" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === item.userId;
  const isAdmin = user && user.role === 'ADMIN';
  const isOwnerOrAdmin = isOwner || isAdmin;
  const userExistingClaim = user ? item.claims?.find(c => c.claimantId === user.id) : null;
  const isLost = item.type === 'LOST';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Details & Image */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            
            {/* Image Preview Banner */}
            <div className="relative h-72 sm:h-96 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <Tag className="w-16 h-16 mx-auto stroke-1 text-slate-600 mb-2" />
                  <p className="text-xs font-medium">No photograph attached with this report</p>
                </div>
              )}

              {/* Status & Type Pills */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide backdrop-blur shadow-md ${
                    isLost ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                  }`}
                >
                  {item.type}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur shadow-md ${
                    item.status === 'RESOLVED'
                      ? 'bg-slate-900 text-emerald-400'
                      : item.status === 'CLAIM_PENDING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-slate-800'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{item.category}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {item.title}
                </h1>
              </div>

              {/* Location & Date Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Campus Location</p>
                    <p className="font-semibold text-slate-900">{item.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Reported Incident Date</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Detailed Description & Identifying Marks
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Security Question if FOUND item */}
              {item.securityQuestion && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Ownership Verification Question
                  </div>
                  <p className="text-xs text-amber-900 font-medium">
                    "{item.securityQuestion}"
                  </p>
                  <p className="text-[11px] text-amber-700/80">
                    To claim this item, please provide the exact answer in your claim submission.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Owner Claim Management Panel (Visible to Poster or Admin) */}
          {isOwnerOrAdmin && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Verification & Claim Management
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review ownership claim requests submitted by fellow students
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleResolved}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      item.status === 'RESOLVED'
                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {item.status === 'RESOLVED' ? 'Reopen Application' : 'Mark as Handed Over / Resolved'}
                  </button>

                  <button
                    onClick={handleDeleteItem}
                    disabled={actionLoading}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List of claims */}
              <div className="space-y-4">
                {item.claims && item.claims.length > 0 ? (
                  item.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : claim.status === 'REJECTED'
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {claim.claimant?.name || 'Student Claimant'}
                          </span>
                          {claim.claimant?.collegeId && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              ID: {claim.claimant.collegeId}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
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
                        <span className="text-[11px] text-slate-400">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 whitespace-pre-wrap">
                        {claim.message}
                      </p>

                      {/* Proof photo if uploaded */}
                      {claim.proofImageUrl && (
                        <div className="mb-3">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Attached Proof Document:</p>
                          <a
                            href={claim.proofImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Claimant Photo Evidence
                          </a>
                        </div>
                      )}

                      {/* Contact & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-slate-500 flex items-center gap-3">
                          {claim.claimantContact && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-emerald-600" /> {claim.claimantContact}
                            </span>
                          )}
                          {claim.claimant?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-indigo-600" /> {claim.claimant.email}
                            </span>
                          )}
                        </div>

                        {claim.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleClaimStatusChange(claim.id, 'APPROVED')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm shadow-emerald-200"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Claim
                            </button>
                            <button
                              onClick={() => handleClaimStatusChange(claim.id, 'REJECTED')}
                              disabled={actionLoading}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No claims received on this item yet.
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Poster Contact & Action Buttons */}
        <div className="space-y-6">
          
          {/* Action Box: Claim or Contact */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {isLost ? 'Found this item?' : 'Is this your item?'}
            </h3>

            {item.status === 'RESOLVED' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-xs text-slate-900">Case Resolved</p>
                <p className="text-[11px] text-slate-500">
                  This item has already been successfully claimed and returned to its owner.
                </p>
              </div>
            ) : userExistingClaim ? (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-xs text-indigo-900">Claim Submitted</span>
                </div>
                <p className="text-xs text-indigo-700">
                  Status: <strong>{userExistingClaim.status}</strong>
                </p>
                <p className="text-[11px] text-indigo-600">
                  The reporter has received your details. Check your notification inbox for updates.
                </p>
              </div>
            ) : isOwner ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                You created this application. You can review claimant submissions in the panel below.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isLost
                    ? 'If you have found this item or have information on its whereabouts, contact the student or file a response.'
                    : 'Submit a verified claim explaining proof of ownership to collect this item.'}
                </p>

                {user ? (
                  <button
                    onClick={() => setClaimModalOpen(true)}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {isLost ? 'I Have Found This / Reach Out' : 'Submit Ownership Claim'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs transition-colors text-center block"
                    >
                      Log In with Student Account to Claim
                    </Link>
                    <p className="text-[10px] text-slate-400 text-center">
                      College login required to prevent spam and verify student identity.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reporter Contact Information */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Reported By
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm">
                {item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">{item.user?.name || 'Campus Member'}</p>
                {item.user?.collegeId && (
                  <p className="text-[11px] text-slate-500 font-mono">ID: {item.user.collegeId}</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
              {item.contactEmail && (
                <a
                  href={`mailto:${item.contactEmail}?subject=Regarding Lost & Found Item: ${encodeURIComponent(item.title)}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-slate-50"
                >
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span className="truncate">{item.contactEmail}</span>
                </a>
              )}

              {item.contactPhone && (
                <a
                  href={`tel:${item.contactPhone}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors p-2 rounded-xl hover:bg-slate-50"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>{item.contactPhone}</span>
                </a>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                Campus Security Desk is available at Main Gate #1 to mediate handovers for valuable items.
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Claim Submission Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isLost ? 'Reach Out Regarding Found Item' : 'Submit Ownership Claim'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Item: <span className="font-semibold text-slate-800">{item.title}</span>
                </p>
              </div>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {claimSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm text-slate-900">{claimSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                {claimError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {claimError}
                  </div>
                )}

                {item.securityQuestion && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-800 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Poster's Verification Question:
                    </span>
                    <p className="text-amber-900 italic">"{item.securityQuestion}"</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {item.securityQuestion
                      ? 'Answer to Security Question & Proof of Ownership *'
                      : 'Description / Identifying Marks (Color, scratches, contents, etc.) *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide specific details that only the true owner would know..."
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Contact Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={claimantContact}
                    onChange={(e) => setClaimantContact(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supporting Photo / Document (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    E.g., original bill, photo of you with the item, or ID card image (Max 5MB).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-50"
                  >
                    {submittingClaim ? 'Submitting...' : 'Submit Claim Request'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
