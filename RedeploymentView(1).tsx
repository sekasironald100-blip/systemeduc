import React from 'react';
import { 
  ArrowRight, 
  MapPin, 
  CheckCheck, 
  RotateCcw, 
  ShieldCheck, 
  Compass, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';
import { RedeploymentMove, SchoolRecord } from '../types';

interface RedeploymentViewProps {
  moves: RedeploymentMove[];
  records: SchoolRecord[];
  allRecords: SchoolRecord[];
  maxDistance: number;
  onMaxDistanceChange: (val: number) => void;
  onApplyMove: (move: RedeploymentMove) => void;
  onApplyAllMoves: () => void;
  onResetSimulation: () => void;
  isSimulated: boolean;
}

export const RedeploymentView: React.FC<RedeploymentViewProps> = ({
  moves,
  records,
  allRecords,
  maxDistance,
  onMaxDistanceChange,
  onApplyMove,
  onApplyAllMoves,
  onResetSimulation,
  isSimulated,
}) => {
  const totalMovesCount = moves.reduce((acc, m) => acc + m.count, 0);
  const avgDistance = moves.length > 0 
    ? Math.round(moves.reduce((acc, m) => acc + m.distance, 0) / moves.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Simulator Controls */}
      <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Redeployment Recommendations
            </h2>
            {isSimulated && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                Simulation Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Algorithmic pairings linking donor schools with surplus teachers to nearest deficit schools.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Distance Slider */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Radius:</span>
            <input 
              type="range"
              min={10}
              max={50}
              step={5}
              value={maxDistance}
              onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
              className="w-20 accent-teal-600 cursor-pointer"
            />
            <span className="text-xs font-mono tabular-nums font-bold text-teal-700 dark:text-teal-300">
              {maxDistance}km
            </span>
          </div>

          {moves.length > 0 && (
            <button
              onClick={onApplyAllMoves}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Apply All ({totalMovesCount} Teachers)</span>
            </button>
          )}

          {isSimulated && (
            <button
              onClick={onResetSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset to Baseline</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Recommendations Cards & Ranking Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Recommendations Cards (2 cols span) */}
        <div className="lg:col-span-2 space-y-3.5">
          {moves.length > 0 ? (
            moves.map((move, idx) => (
              <div 
                key={move.id}
                className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-teal-300 dark:hover:border-teal-800/80 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
                      {idx + 1}
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 flex-wrap">
                      <span>{move.fromSchool}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-teal-700 dark:text-teal-300">{move.toSchool}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onApplyMove(move)}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 dark:bg-slate-800 dark:hover:bg-teal-950/80 dark:hover:text-teal-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Simulate Move</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  Transfer <strong className="font-semibold text-slate-900 dark:text-white">{move.count} {move.subject}</strong> teacher{move.count > 1 ? 's' : ''} to resolve critical deficit at {move.toSchool}.
                </p>

                {/* Metadata row with clean unboxed text and dot separators */}
                <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{move.district} District</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono tabular-nums">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>~{move.distance} km commute</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-teal-700 dark:text-teal-300 font-medium">Subject match: {move.subject}</span>
                  <span aria-hidden="true">·</span>
                  <span>Protects donor minimum</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Feasible Moves Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No donor schools have matching subject surplus within the current {maxDistance} km travel threshold. Try increasing the travel radius above.
              </p>
              <button
                onClick={() => onMaxDistanceChange(40)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                Expand Radius to 40 km
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Policy Ranking Rules & Impact Preview */}
        <div className="space-y-4">
          {/* Equity Policy Card */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>How Transfers Are Ranked</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Our redeployment engine follows strict statutory deployment principles:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                  <span>1. Subject Certification</span>
                  <span className="text-[11px] text-teal-700 dark:text-teal-300 font-mono">100% Match</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Teachers are only redeployed into their qualified discipline (Mathematics, English, Science).
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                  <span>2. Feasible Commute</span>
                  <span className="text-[11px] text-teal-700 dark:text-teal-300 font-mono">≤ {maxDistance} km</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Prioritizes schools along existing transit corridors to prevent hardship for teachers.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                  <span>3. Minimum Baseline Rule</span>
                  <span className="text-[11px] text-teal-700 dark:text-teal-300 font-mono">Retain ≥ 1</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Donor schools are never stripped below minimum subject coverage under any scenario.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                  <span>4. Deficit Urgency</span>
                  <span className="text-[11px] text-teal-700 dark:text-teal-300 font-mono">High Need</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Schools with severe student-to-teacher deficits are prioritized first in line.
                </p>
              </div>
            </div>
          </div>

          {/* District Advisory Notice */}
          <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Administrative Guidance</span>
            </div>
            These recommendations are decision-support aids for District Education Officers (DEOs). Always verify contracts, transport feasibility, and school management committee consent before actual deployment.
          </div>
        </div>
      </div>
    </div>
  );
};
