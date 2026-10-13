import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeftRight, 
  BarChart3, 
  MapPin, 
  FileSpreadsheet, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  isDark: boolean;
  onToggleDark: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  totalDeficit: number;
  feasibleMovesCount: number;
  parityScore: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isDark,
  onToggleDark,
  isCollapsed,
  onToggleCollapse,
  totalDeficit,
  feasibleMovesCount,
  parityScore,
}) => {
  const navItems = [
    {
      id: 'overview' as ViewMode,
      label: 'Overview & KPIs',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'roster' as ViewMode,
      label: 'Staffing Roster',
      icon: Users,
      badge: null,
    },
    {
      id: 'redeployment' as ViewMode,
      label: 'Redeployment Engine',
      icon: ArrowLeftRight,
      badge: feasibleMovesCount > 0 ? `${feasibleMovesCount} moves` : null,
      badgeType: 'amber',
    },
    {
      id: 'visualizations' as ViewMode,
      label: 'Intuitive Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'map' as ViewMode,
      label: 'District Spatial Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'audit' as ViewMode,
      label: 'Audit & Reports',
      icon: FileSpreadsheet,
      badge: null,
    },
  ];

  return (
    <aside 
      className={`relative flex flex-col border-r transition-all duration-200 z-30 shrink-0 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-800'
      } ${isCollapsed ? 'w-20' : 'w-72'}`}
      aria-label="Primary Dashboard Navigation"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white shrink-0 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-900 dark:text-white truncate text-base">
                <span>EduMap</span>
                <span className="text-teal-600 dark:text-teal-400 font-black">/</span>
                <span className="text-teal-700 dark:text-teal-300 font-semibold">Equity</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                Teacher Deployment Planner
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-2 mb-2 text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 ${isCollapsed ? 'sr-only' : 'block'}`}>
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left group ${
                isActive
                  ? isDark
                    ? 'bg-teal-950/70 text-teal-300 border border-teal-800/60 shadow-xs'
                    : 'bg-teal-50 text-teal-900 border border-teal-200/80 shadow-xs'
                  : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive 
                    ? 'text-teal-600 dark:text-teal-400' 
                    : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                }`} 
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shrink-0 tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Equity Parity Mini-Widget (when expanded) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Parity Health
            </span>
            <span className="font-mono tabular-nums text-teal-700 dark:text-teal-300">{parityScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, parityScore)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Net Gap: <strong className="font-mono tabular-nums text-slate-900 dark:text-white">{totalDeficit}</strong></span>
            <span>Moves: <strong className="font-mono tabular-nums text-slate-900 dark:text-white">{feasibleMovesCount}</strong></span>
          </div>
        </div>
      )}

      {/* Dark Mode Toggle & Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
        <button
          onClick={onToggleDark}
          className={`w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDark 
              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
          }`}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600 shrink-0" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="px-1 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              District Decision Support · v2.4
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
