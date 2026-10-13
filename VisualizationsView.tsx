import React, { useState } from 'react';
import { 
  BarChart2, 
  Compass, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { SchoolRecord, SubjectSummary, DistrictSummary } from '../types';
import { calculateDistance } from '../utils/equityEngine';

interface VisualizationsViewProps {
  records: SchoolRecord[];
  allRecords: SchoolRecord[];
  subjectSummaries: SubjectSummary[];
  districtSummaries: DistrictSummary[];
  maxDistance: number;
  onMaxDistanceChange: (km: number) => void;
}

export const VisualizationsView: React.FC<VisualizationsViewProps> = ({
  records,
  allRecords,
  subjectSummaries,
  districtSummaries,
  maxDistance,
  onMaxDistanceChange,
}) => {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Compute distance sensitivity curve:
  // For each distance increment from 10km to 50km, calculate feasible moves unlocked
  const distanceThresholds = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  const sensitivityData = distanceThresholds.map((dist) => {
    // Quick calculation of feasible moves at distance `dist`
    let movesCount = 0;
    const subjects = [...new Set(records.map((r) => r.subject))];

    subjects.forEach((sub) => {
      const group = records.filter((r) => r.subject === sub);
      const donors = group.filter((r) => r.available > r.required).map((r) => ({ ...r, surplus: r.available - r.required }));
      const needs = group.filter((r) => r.required > r.available).map((r) => ({ ...r, need: r.required - r.available }));

      needs.forEach((dest) => {
        donors.forEach((src) => {
          if (src.surplus <= 0 || dest.need <= 0 || src.school === dest.school || src.district !== dest.district) return;
          const d = calculateDistance(src, dest);
          if (d <= dist) {
            const transfer = Math.min(src.surplus, dest.need);
            movesCount += transfer;
            src.surplus -= transfer;
            dest.need -= transfer;
          }
        });
      });
    });

    const totalDeficit = records.reduce((acc, r) => acc + Math.max(0, r.required - r.available), 0);
    const residualGap = Math.max(0, totalDeficit - movesCount);
    return {
      distance: dist,
      moves: movesCount,
      residualGap,
      resolvedPercent: totalDeficit > 0 ? Math.round((movesCount / totalDeficit) * 100) : 100,
    };
  });

  const maxSubjectRequired = Math.max(1, ...subjectSummaries.map((s) => Math.max(s.required, s.available)));

  return (
    <div className="space-y-6">
      {/* Intro Note */}
      <div className="p-4 rounded-xl border border-teal-200/90 dark:border-teal-900/60 bg-teal-50/40 dark:bg-teal-950/20 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300">
          <strong className="font-semibold text-teal-900 dark:text-teal-200 block mb-0.5">
            Intuitive Equity Visualizations
          </strong>
          These graphics translate raw staffing counts into actionable policy insights: where deficits concentrate, which districts are near parity, and how relaxing teacher travel thresholds unlocks vital classroom coverage.
        </div>
      </div>

      {/* Grid: Visual 1 (Subject Gap Divergence) & Visual 2 (District Parity Index) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual 1: Subject Supply vs Demand Divergence Chart */}
        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Subject Supply vs Demand Gap</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing required quota against actual deployed teachers
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-700" />
                Required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-teal-600 dark:bg-teal-500" />
                Available
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {subjectSummaries.map((sub) => {
              const reqPct = (sub.required / maxSubjectRequired) * 100;
              const availPct = (sub.available / maxSubjectRequired) * 100;
              const hasDeficit = sub.deficit > 0;
              const isSelected = activeSubject === sub.subject;

              return (
                <div 
                  key={sub.subject}
                  onMouseEnter={() => setActiveSubject(sub.subject)}
                  onMouseLeave={() => setActiveSubject(null)}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'border-teal-500/80 bg-teal-50/30 dark:bg-teal-950/30' 
                      : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{sub.subject}</span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        ({sub.coverageRatio}% staffed)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums font-semibold">
                      {hasDeficit ? (
                        <span className="text-amber-800 dark:text-amber-300 flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Shortage: -{sub.deficit}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Fully Staffed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Display */}
                  <div className="space-y-1.5">
                    {/* Required Bar */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 text-slate-500 dark:text-slate-400 shrink-0">Required</span>
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                        <div 
                          className="h-full bg-slate-400/80 dark:bg-slate-600 rounded-sm transition-all duration-300"
                          style={{ width: `${reqPct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300 font-semibold">
                        {sub.required}
                      </span>
                    </div>

                    {/* Available Bar */}
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="w-16 text-slate-500 dark:text-slate-400 shrink-0">Available</span>
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                        <div 
                          className={`h-full rounded-sm transition-all duration-300 ${
                            sub.available >= sub.required 
                              ? 'bg-emerald-600 dark:bg-emerald-500' 
                              : 'bg-teal-600 dark:bg-teal-500'
                          }`}
                          style={{ width: `${availPct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono tabular-nums text-slate-900 dark:text-white font-bold">
                        {sub.available}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual 2: District Parity & Deficit Comparison */}
        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>District Parity & Equity Score</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Percentage of required teacher positions filled across schools
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Target: 100%
              </span>
            </div>

            <div className="space-y-4">
              {districtSummaries.map((dist) => {
                const isUnderperforming = dist.parityScore < 85;
                return (
                  <div 
                    key={dist.district}
                    className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {dist.district}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-2 font-mono tabular-nums">
                          {dist.totalSchools} schools
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                          {dist.parityScore}%
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isUnderperforming 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' 
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300'
                        }`}>
                          {isUnderperforming ? 'Needs Support' : 'Stable'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar with target marker */}
                    <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUnderperforming 
                            ? 'bg-amber-500 dark:bg-amber-400' 
                            : 'bg-teal-600 dark:bg-teal-400'
                        }`}
                        style={{ width: `${Math.min(100, dist.parityScore)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                      <span>Deficit: <strong className="text-amber-800 dark:text-amber-300">{dist.deficit}</strong></span>
                      <span>Surplus Reserve: <strong className="text-emerald-800 dark:text-emerald-300">{dist.surplus}</strong></span>
                      <span>Total Available: <strong>{dist.totalAvailable} / {dist.totalRequired}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>District Parity Index Standard</span>
            <span>Calculated using active pupil-to-teacher staffing norms</span>
          </div>
        </div>
      </div>

      {/* Visual 3: Interactive Distance Sensitivity Curve */}
      <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Travel Distance Sensitivity & Deficit Reduction Curve</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shows how expanding the allowable travel commute threshold unlocks teacher redeployments
            </p>
          </div>

          {/* Interactive Slider embedded in visualization */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Active Radius:
            </span>
            <input 
              type="range"
              min={10}
              max={50}
              step={5}
              value={maxDistance}
              onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
              className="w-28 sm:w-36 accent-teal-600 cursor-pointer"
            />
            <span className="text-xs font-mono tabular-nums font-bold text-teal-700 dark:text-teal-300">
              {maxDistance} km
            </span>
          </div>
        </div>

        {/* Visual Curve Graph (SVG) */}
        <div className="relative w-full h-48 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-x-4 top-8 border-b border-dashed border-slate-200 dark:border-slate-700" />
          <div className="absolute inset-x-4 top-20 border-b border-dashed border-slate-200 dark:border-slate-700" />
          <div className="absolute inset-x-4 top-32 border-b border-dashed border-slate-200 dark:border-slate-700" />

          {/* Interactive Steps Display */}
          <div className="relative h-full flex items-end justify-between gap-2 pt-4">
            {sensitivityData.map((point) => {
              const isCurrent = point.distance === maxDistance;
              const maxMoves = Math.max(1, ...sensitivityData.map((d) => d.moves));
              const heightPct = Math.max(12, (point.moves / maxMoves) * 85);

              return (
                <div 
                  key={point.distance}
                  onClick={() => onMaxDistanceChange(point.distance)}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                >
                  {/* Tooltip on hover or active */}
                  <div className={`mb-1 text-[11px] font-mono tabular-nums font-bold transition-all ${
                    isCurrent 
                      ? 'text-teal-700 dark:text-teal-300 scale-110' 
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {point.moves} moves
                  </div>

                  {/* Bar element */}
                  <div 
                    className={`w-full max-w-[48px] rounded-t-md transition-all duration-200 ${
                      isCurrent 
                        ? 'bg-teal-600 dark:bg-teal-400 shadow-sm ring-2 ring-teal-500/30' 
                        : 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />

                  {/* Distance label */}
                  <div className={`mt-2 text-xs font-mono tabular-nums transition-colors ${
                    isCurrent 
                      ? 'font-bold text-teal-800 dark:text-teal-200 underline' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {point.distance}km
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Readout */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Commute Limit:</span>
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums text-sm">
              {maxDistance} km maximum
            </strong>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Potential Transfers Unlocked:</span>
            <strong className="text-teal-700 dark:text-teal-300 font-mono tabular-nums text-sm">
              {sensitivityData.find((d) => d.distance === maxDistance)?.moves || 0} teachers
            </strong>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Deficit Coverage Rate:</span>
            <strong className="text-slate-900 dark:text-white font-mono tabular-nums text-sm">
              {sensitivityData.find((d) => d.distance === maxDistance)?.resolvedPercent || 0}% of net shortage
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
