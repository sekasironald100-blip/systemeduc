import React from 'react';
import { 
  Building2, 
  AlertCircle, 
  Users, 
  ArrowLeftRight, 
  TrendingDown 
} from 'lucide-react';

interface MetricCardsProps {
  uniqueSchools: number;
  totalDeficit: number;
  totalSurplus: number;
  feasibleMovesCount: number;
  postDeficit: number;
  maxDistance: number;
  onFilterShortage?: () => void;
  onFilterSurplus?: () => void;
  onNavigateToRedeployment?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  uniqueSchools,
  totalDeficit,
  totalSurplus,
  feasibleMovesCount,
  postDeficit,
  maxDistance,
  onFilterShortage,
  onFilterSurplus,
  onNavigateToRedeployment,
}) => {
  const percentResolvable = totalDeficit > 0 
    ? Math.round((Math.min(feasibleMovesCount, totalDeficit) / totalDeficit) * 100) 
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {/* Metric 1: Schools in View */}
      <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <span>Schools in View</span>
          <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
          {uniqueSchools}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Across filtered districts
        </p>
      </div>

      {/* Metric 2: Gross Deficit */}
      <div 
        onClick={onFilterShortage}
        className="p-4 rounded-xl border border-amber-200/90 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs transition-all hover:border-amber-300 dark:hover:border-amber-800/60 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-300 mb-2">
          <span>Teacher Deficit</span>
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-amber-950 dark:text-amber-200 font-mono tabular-nums flex items-baseline gap-1">
          <span>{totalDeficit}</span>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">teachers</span>
        </div>
        <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80 group-hover:underline">
          Shortage at under-staffed schools
        </p>
      </div>

      {/* Metric 3: Gross Surplus */}
      <div 
        onClick={onFilterSurplus}
        className="p-4 rounded-xl border border-emerald-200/90 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs transition-all hover:border-emerald-300 dark:hover:border-emerald-800/60 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
          <span>Available Surplus</span>
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-200 font-mono tabular-nums flex items-baseline gap-1">
          <span>{totalSurplus}</span>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">teachers</span>
        </div>
        <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80 group-hover:underline">
          Potential donor school capacity
        </p>
      </div>

      {/* Metric 4: Feasible Moves */}
      <div 
        onClick={onNavigateToRedeployment}
        className="p-4 rounded-xl border border-teal-200/90 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-950/20 shadow-xs transition-all hover:border-teal-300 dark:hover:border-teal-800/60 cursor-pointer group"
      >
        <div className="flex items-center justify-between text-xs font-semibold text-teal-900 dark:text-teal-300 mb-2">
          <span>Feasible Transfers</span>
          <ArrowLeftRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-teal-950 dark:text-teal-200 font-mono tabular-nums flex items-baseline gap-1">
          <span>{feasibleMovesCount}</span>
          <span className="text-xs font-medium text-teal-700 dark:text-teal-400">moves</span>
        </div>
        <p className="mt-1 text-xs text-teal-800/80 dark:text-teal-300/80 group-hover:underline">
          ≤ {maxDistance} km travel radius
        </p>
      </div>

      {/* Metric 5: Post-Redeployment Deficit */}
      <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          <span>Projected Net Gap</span>
          <TrendingDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums flex items-baseline gap-1">
          <span>{postDeficit}</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">teachers</span>
        </div>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {percentResolvable}% gap resolved if applied
        </p>
      </div>
    </div>
  );
};
