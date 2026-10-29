import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

export const CATEGORIES = [
  'All',
  'Electronics',
  'ID Cards',
  'Keys',
  'Wallets & Bags',
  'Books & Stationery',
  'Clothing',
  'Other'
];

export default function FilterBar({
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  onReset
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Search Input & Status Pills */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by keywords, item name, campus location (e.g., 'Library', 'Calculator')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Lost', value: 'LOST' },
            { label: 'Found', value: 'FOUND' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                typeFilter === tab.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Horizontal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = categoryFilter === (cat === 'All' ? 'ALL' : cat);
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === 'All' ? 'ALL' : cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
