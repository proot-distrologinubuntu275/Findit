import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ItemCard from '../components/ItemCard';
import FilterBar from '../components/FilterBar';
import { PackageSearch, RefreshCw } from 'lucide-react';

export default function BrowseItems() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    fetchItems();
  }, [typeFilter, categoryFilter, statusFilter, sort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (sort) params.sort = sort;

      const res = await api.get('/items', { params });
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setTypeFilter('ALL');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setSort('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and search all lost and found applications across campus
          </p>
        </div>

        {/* Sort & Status Select */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="date_desc">Incident Date (Latest)</option>
            <option value="date_asc">Incident Date (Earliest)</option>
          </select>
        </div>
      </div>

      {/* Filter Component */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong className="text-slate-800">{items.length}</strong> items
          {typeFilter !== 'ALL' && ` in ${typeFilter.toLowerCase()} category`}
        </span>
        {(search || typeFilter !== 'ALL' || categoryFilter !== 'ALL') && (
          <button
            onClick={handleReset}
            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        )}
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <PackageSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, removing filters, or check if the item hasn't been posted yet.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}
