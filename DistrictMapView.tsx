import React, { useState } from 'react';
import { 
  MapPin, 
  ArrowRight, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle2, 
  Info,
  Maximize2
} from 'lucide-react';
import { RedeploymentMove, SchoolRecord } from '../types';

interface DistrictMapViewProps {
  records: SchoolRecord[];
  moves: RedeploymentMove[];
  onSelectSchool: (school: SchoolRecord) => void;
  selectedDistrict: string;
  onDistrictSelect: (district: string) => void;
}

export const DistrictMapView: React.FC<DistrictMapViewProps> = ({
  records,
  moves,
  onSelectSchool,
  selectedDistrict,
  onDistrictSelect,
}) => {
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);
  const [showTransitLines, setShowTransitLines] = useState<boolean>(true);

  // Group unique schools with coordinates
  const uniqueSchools = Array.from(
    new Map(records.map((r) => [r.school, r])).values()
  ).filter((r) => r.coordinates);

  const activeSchool = uniqueSchools.find((s) => s.id === activeSchoolId) || null;

  // Filter moves related to active school if selected
  const activeMoves = moves.filter((m) => 
    !activeSchool || m.fromSchool === activeSchool.school || m.toSchool === activeSchool.school
  );

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>District Spatial Transfer Map</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click school nodes to inspect campus staffing and trace proposed teacher transit paths
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
            <input 
              type="checkbox"
              checked={showTransitLines}
              onChange={(e) => setShowTransitLines(e.target.checked)}
              className="rounded-sm text-teal-600 focus:ring-teal-500"
            />
            <span>Show Transfer Routes</span>
          </label>
        </div>
      </div>

      {/* SVG Spatial Canvas Container */}
      <div className="relative w-full aspect-16/10 min-h-[440px] max-h-[580px] rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 p-4 overflow-hidden select-none">
        {/* Background Regional Grid lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* District Zones Labels Overlay */}
        <div className="absolute top-4 left-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pointer-events-none">
          Luweero (North)
        </div>
        <div className="absolute bottom-6 left-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pointer-events-none">
          Mpigi (South-West)
        </div>
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pointer-events-none">
          Wakiso (Central)
        </div>
        <div className="absolute top-1/3 right-8 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pointer-events-none">
          Mukono (East)
        </div>

        {/* Transfer Vectors & Routes (SVG) */}
        {showTransitLines && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" className="fill-teal-600 dark:fill-teal-400" />
              </marker>
            </defs>
            {activeMoves.map((m) => {
              const src = uniqueSchools.find((s) => s.school === m.fromSchool);
              const dst = uniqueSchools.find((s) => s.school === m.toSchool);
              if (!src?.coordinates || !dst?.coordinates) return null;

              const isHighlighted = activeSchool && (src.id === activeSchool.id || dst.id === activeSchool.id);

              return (
                <g key={m.id}>
                  <line
                    x1={`${src.coordinates.x}%`}
                    y1={`${src.coordinates.y}%`}
                    x2={`${dst.coordinates.x}%`}
                    y2={`${dst.coordinates.y}%`}
                    stroke={isHighlighted ? '#0d9488' : '#64748b'}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={isHighlighted ? 'none' : '4 3'}
                    strokeOpacity={isHighlighted ? 1 : 0.6}
                    markerEnd="url(#arrow)"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* School Nodes */}
        {uniqueSchools.map((s) => {
          if (!s.coordinates) return null;
          // Calculate overall school gap across all subjects
          const schoolRecords = records.filter((r) => r.school === s.school);
          const totalReq = schoolRecords.reduce((acc, r) => acc + r.required, 0);
          const totalAvail = schoolRecords.reduce((acc, r) => acc + r.available, 0);
          const gap = totalReq - totalAvail;
          const isShortage = gap > 0;
          const isSurplus = gap < 0;
          const isSelected = activeSchoolId === s.id;

          return (
            <div
              key={s.id}
              style={{
                left: `${s.coordinates.x}%`,
                top: `${s.coordinates.y}%`,
              }}
              onClick={() => setActiveSchoolId(isSelected ? null : s.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
            >
              {/* Pulse ring for selected */}
              {isSelected && (
                <div className="absolute -inset-2 rounded-full border-2 border-teal-500 animate-ping opacity-75" />
              )}

              {/* Node Marker */}
              <div 
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 shadow-md ${
                  isSelected 
                    ? 'ring-4 ring-teal-400/40 scale-125' 
                    : ''
                } ${
                  isShortage
                    ? 'bg-amber-100 border-amber-600 text-amber-800 dark:bg-amber-950 dark:border-amber-400 dark:text-amber-200'
                    : isSurplus
                      ? 'bg-emerald-100 border-emerald-600 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-400 dark:text-emerald-200'
                      : 'bg-slate-100 border-teal-600 text-teal-800 dark:bg-slate-800 dark:border-teal-400 dark:text-teal-200'
                }`}
              >
                <span className="font-mono text-xs font-black tabular-nums">
                  {gap > 0 ? `+${gap}` : gap < 0 ? gap : '0'}
                </span>
              </div>

              {/* School Label */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap shadow-xs pointer-events-none group-hover:block transition-all">
                {s.school}
              </div>
            </div>
          );
        })}

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-1.5 backdrop-blur-xs">
          <div className="font-bold text-slate-900 dark:text-white mb-1">Status Legend</div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Shortage School (Needs Teacher)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>Surplus School (Potential Donor)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded-full bg-teal-500" />
            <span>Balanced School</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="w-4 h-0.5 border-b border-dashed border-teal-500" />
            <span>Redeployment Route</span>
          </div>
        </div>

        {/* Floating Active School Inspector Card (when node clicked) */}
        {activeSchool && (
          <div className="absolute top-4 right-4 w-72 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg z-20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {activeSchool.school}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeSchool.district} District · {activeSchool.km} km to center
                </p>
              </div>
              <button
                onClick={() => setActiveSchoolId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* School Subject Breakdown */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                Subject Staffing
              </span>
              {records.filter((r) => r.school === activeSchool.school).map((r) => {
                const g = r.required - r.available;
                return (
                  <div key={r.subject} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 font-mono text-xs">
                    <span className="font-sans text-slate-700 dark:text-slate-300">{r.subject}</span>
                    <span className="tabular-nums">
                      {r.available} / {r.required}
                      <span className={`ml-1.5 font-bold ${g > 0 ? 'text-amber-800 dark:text-amber-300' : g < 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'}`}>
                        ({g > 0 ? `+${g}` : g})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onSelectSchool(activeSchool)}
              className="w-full py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspect Full Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
