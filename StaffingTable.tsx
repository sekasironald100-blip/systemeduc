import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Plus, 
  Minus, 
  Info,
  MapPin
} from 'lucide-react';
import { SchoolRecord } from '../types';

interface StaffingTableProps {
  records: SchoolRecord[];
  onSelectSchool: (school: SchoolRecord) => void;
  onAdjustStaffing: (id: string, delta: number) => void;
  onResetFilters: () => void;
}

type SortField = 'school' | 'district' | 'subject' | 'required' | 'available' | 'gap' | 'km';
type SortDirection = 'asc' | 'desc';

export const StaffingTable: React.FC<StaffingTableProps> = ({
  records,
  onSelectSchool,
  onAdjustStaffing,
  onResetFilters,
}) => {
  const [sortField, setSortField] = useState<SortField>('gap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    const gapA = a.required - a.available;
    const gapB = b.required - b.available;

    let comp = 0;
    if (sortField === 'school') comp = a.school.localeCompare(b.school);
    else if (sortField === 'district') comp = a.district.localeCompare(b.district);
    else if (sortField === 'subject') comp = a.subject.localeCompare(b.subject);
    else if (sortField === 'required') comp = a.required - b.required;
    else if (sortField === 'available') comp = a.available - b.available;
    else if (sortField === 'gap') comp = gapA - gapB;
    else if (sortField === 'km') comp = a.km - b.km;

    return sortDirection === 'asc' ? comp : -comp;
  });

  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* Table Header & Explanation */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            School Staffing Roster
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Net Gap = Required − Available. Positive values indicate a deficit requiring deployment.
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          Showing {records.length} schools
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort('school')}
                  className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <span>School Name</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  onClick={() => handleSort('district')}
                  className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <span>District</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3">
                <button
                  onClick={() => handleSort('subject')}
                  className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <span>Subject</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('required')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
                >
                  <span>Required</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('available')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
                >
                  <span>Available</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('gap')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
                >
                  <span>Net Gap</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort('km')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
                >
                  <span>Distance</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </th>
              <th className="py-3 px-4 text-center">Simulate & Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedRecords.length > 0 ? (
              sortedRecords.map((r) => {
                const gap = r.required - r.available;
                const isShortage = gap > 0;
                const isSurplus = gap < 0;
                const isBalanced = gap === 0;

                return (
                  <tr 
                    key={r.id} 
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* School Name */}
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{r.school}</span>
                        {r.studentCount && (
                          <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">
                            ({r.studentCount} pupils)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {r.district}
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {r.subject}
                    </td>

                    {/* Required */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {r.required}
                    </td>

                    {/* Available */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                      {r.available}
                    </td>

                    {/* Net Gap */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                      <span className={
                        isShortage 
                          ? 'text-amber-800 dark:text-amber-300' 
                          : isSurplus 
                            ? 'text-emerald-800 dark:text-emerald-300' 
                            : 'text-slate-600 dark:text-slate-400'
                      }>
                        {gap > 0 ? `+${gap}` : gap}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isShortage && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Shortage ({gap})</span>
                        </span>
                      )}
                      {isSurplus && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Surplus ({Math.abs(gap)})</span>
                        </span>
                      )}
                      {isBalanced && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>Balanced</span>
                        </span>
                      )}
                    </td>

                    {/* Distance from Center */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{r.km} km</span>
                      </span>
                    </td>

                    {/* Interactive Simulation & Inspect Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 p-0.5">
                          <button
                            onClick={() => onAdjustStaffing(r.id, -1)}
                            disabled={r.available <= 1}
                            className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-white dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Simulate removing 1 teacher"
                            aria-label={`Reduce staffing at ${r.school}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-1 text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300 font-bold">
                            {r.available}
                          </span>
                          <button
                            onClick={() => onAdjustStaffing(r.id, 1)}
                            className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-white dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
                            title="Simulate adding 1 teacher"
                            aria-label={`Add staffing at ${r.school}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onSelectSchool(r)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-300 dark:hover:bg-teal-950/60 border border-transparent hover:border-teal-200 dark:hover:border-teal-800 transition-colors"
                          title="View school details & potential matches"
                          aria-label={`Inspect ${r.school}`}
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <div className="max-w-xs mx-auto space-y-3">
                    <p className="text-sm font-medium">No schools match the current filter criteria.</p>
                    <button
                      onClick={onResetFilters}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
