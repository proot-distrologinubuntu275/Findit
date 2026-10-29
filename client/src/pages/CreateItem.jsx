import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { CATEGORIES } from '../components/FilterBar';
import {
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Lock,
  MapPin,
  Calendar,
  X,
  FileText
} from 'lucide-react';

export default function CreateItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialType = searchParams.get('type') === 'FOUND' ? 'FOUND' : 'LOST';

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size exceeds 5MB limit.');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!title.trim() || !location.trim() || !description.trim() || !date) {
      setError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('location', location.trim());
      formData.append('date', date);
      formData.append('description', description.trim());
      if (type === 'FOUND' && securityQuestion.trim()) {
        formData.append('securityQuestion', securityQuestion.trim());
      }
      if (contactEmail.trim()) formData.append('contactEmail', contactEmail.trim());
      if (contactPhone.trim()) formData.append('contactPhone', contactPhone.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate(`/items/${res.data.item.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Report an Item Application
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Provide detailed information and a photograph to help verify belongings on campus
          </p>
        </div>

        {/* Type Toggle: LOST vs FOUND */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('LOST')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              type === 'LOST'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            I Lost Something
          </button>

          <button
            type="button"
            onClick={() => setType('FOUND')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
              type === 'FOUND'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            I Found Something
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Casio fx-991EX Calculator, Black Backpack, Room Key"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Campus Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Central Library 2nd Floor, Room 302, Cafeteria"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date Incident Occurred *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Detailed Description & Characteristics *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe brand, color, stickers, model, scratches, or unique features that will help identify it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            ></textarea>
          </div>

          {/* Security Question (Only if FOUND item) */}
          {type === 'FOUND' && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                Ownership Verification Question (Recommended for Found Items)
              </label>
              <input
                type="text"
                placeholder="e.g., What color is the inner lining? What brand sticker is on the back?"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-amber-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <p className="text-[11px] text-amber-700">
                This prevents scammers from falsely claiming the item. Only the genuine owner can answer this correctly.
              </p>
            </div>
          )}

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Upload Item Photograph (Optional but highly recommended)
            </label>

            {previewUrl ? (
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Item preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30 group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
                <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Contact Details */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Direct Contact Details (for resolution)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Contact Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all ${
                type === 'LOST'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              } disabled:opacity-50`}
            >
              {submitting
                ? 'Publishing Application...'
                : `Submit ${type === 'LOST' ? 'Lost' : 'Found'} Item Application`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
