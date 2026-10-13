import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { FilterState, StatusFilter } from '../types';

interface FilterToolbarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  districts: string[];
  subjects: string[];
  onReset: () => void;
  totalFilteredCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  districts,
  subjects,
  onReset,
  totalFilteredCount,
}) => {
  const statusOptions: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All Records' },
    { id: 'shortage', label: 'Shortages Only' },
    { id: 'surplus', label: 'Surplus Only' },
    { id: 'balanced', label: 'Balanced' },
  ];

  return (
    <div className="mb-6 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
      {/* Top Filter Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
        {/* District Filter */}
        <div>
          <label 
            htmlFor="district-select"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            District
          </label>
          <select
            id="district-select"
            value={filters.district}
            onChange={(e) => onFilterChange({ ...filters, district: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          >
            <option value="All">All Districts ({districts.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d} District
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label 
            htmlFor="subject-select"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Subject Specialization
          </label>
          <select
            id="subject-select"
            value={filters.subject}
            onChange={(e) => onFilterChange({ ...filters, subject: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          >
            <option value="All">All Subjects ({subjects.length})</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* School Name Search */}
        <div>
          <label 
            htmlFor="school-search"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            Search School
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="school-search"
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="e.g. Nabweru, Kawanda..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Reset & Count */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
          <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {totalFilteredCount} records
          </div>
        </div>
      </div>

      {/* Bottom Filter Controls: Status Segments & Travel Distance Slider */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Status Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg max-w-full overflow-x-auto">
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange({ ...filters, status: opt.id })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
                filters.status === opt.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Max Travel Distance Threshold Slider */}
        <div className="flex items-center gap-3 w-full lg:w-auto bg-slate-50 dark:bg-slate-800/50 px-3.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Max Travel Radius:</span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={filters.maxDistance}
            onChange={(e) => onFilterChange({ ...filters, maxDistance: Number(e.target.value) })}
            className="w-32 lg:w-40 accent-teal-600 cursor-pointer"
            aria-label="Maximum travel distance threshold"
          />
          <span className="text-xs font-bold font-mono tabular-nums text-teal-700 dark:text-teal-300 w-14 shrink-0 text-right">
            ≤ {filters.maxDistance} km
          </span>
        </div>
      </div>
    </div>
  );
};
