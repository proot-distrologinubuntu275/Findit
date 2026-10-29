import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  HelpCircle,
  Laptop,
  CreditCard,
  Key,
  Briefcase,
  BookOpen,
  Shirt,
  Package
} from 'lucide-react';

const categoryIcons = {
  Electronics: Laptop,
  'ID Cards': CreditCard,
  Keys: Key,
  'Wallets & Bags': Briefcase,
  'Books & Stationery': BookOpen,
  Clothing: Shirt,
  Other: Package
};

export default function ItemCard({ item }) {
  const IconComponent = categoryIcons[item.category] || Package;

  const isLost = item.type === 'LOST';
  const isResolved = item.status === 'RESOLVED';
  const isPending = item.status === 'CLAIM_PENDING';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group">
      
      {/* Top Media / Thumbnail */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
            <IconComponent className="w-14 h-14 stroke-1 mb-1" />
            <span className="text-[11px] font-medium text-slate-400">No Photo Attached</span>
          </div>
        )}

        {/* Type Badge: LOST or FOUND */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide shadow-sm backdrop-blur ${
              isLost
                ? 'bg-rose-500/90 text-white'
                : 'bg-emerald-500/90 text-white'
            }`}
          >
            {item.type}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isResolved ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Resolved
            </span>
          ) : isPending ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur">
              Claim Pending
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-slate-700 backdrop-blur shadow-sm">
              Open
            </span>
          )}
        </div>

        {/* Category Pill on bottom right */}
        <div className="absolute bottom-2 right-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/60 text-white backdrop-blur">
            <IconComponent className="w-3 h-3" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            {item._count?.claims > 0 && (
              <span className="font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                {item._count.claims} {item._count.claims === 1 ? 'claim' : 'claims'}
              </span>
            )}
          </div>
        </div>

        {/* View Details CTA */}
        <div className="mt-4">
          <Link
            to={`/items/${item.id}`}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-center block transition-colors ${
              isResolved
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'
            }`}
          >
            {isResolved ? 'View Record' : isLost ? 'Found This? Reach Out' : 'Claim Ownership'}
          </Link>
        </div>

      </div>
    </div>
  );
}
