import React from 'react';
import { 
  Menu, 
  Download, 
  ArrowLeftRight, 
  Sun, 
  Moon,
  Compass
} from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onOpenMobileMenu: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onExportCSV: () => void;
  onNavigateToRedeployment: () => void;
  feasibleMovesCount: number;
}

const VIEW_TITLES: Record<ViewMode, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview & Key Metrics',
    subtitle: 'Comprehensive staffing distribution and gap indicators',
  },
  roster: {
    title: 'School Staffing Roster',
    subtitle: 'Inspect school quotas, teacher deficits, and surplus reserves',
  },
  redeployment: {
    title: 'Teacher Redeployment Engine',
    subtitle: 'Optimal subject-matched transfers within allowable travel distance',
  },
  visualizations: {
    title: 'Intuitive Analytics & Visuals',
    subtitle: 'Subject deficit divergence, district parity, and distance sensitivity',
  },
  map: {
    title: 'District Spatial Transfer Map',
    subtitle: 'Interactive school network and donor-to-recipient transit routes',
  },
  audit: {
    title: 'Audit Summary & Data Export',
    subtitle: 'Formal compliance review, CSV extract, and equity methodology',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onOpenMobileMenu,
  isDark,
  onToggleDark,
  onExportCSV,
  onNavigateToRedeployment,
  feasibleMovesCount,
}) => {
  const currentMeta = VIEW_TITLES[currentView] || VIEW_TITLES.overview;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 px-4 lg:px-8 py-3.5 border-b backdrop-blur-md transition-colors bg-white/90 border-slate-200 dark:bg-slate-900/90 dark:border-slate-800">
      {/* Zone 1: Mobile toggle & Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            <span>District Planning</span>
            <span aria-hidden="true" className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-teal-700 dark:text-teal-300 font-semibold">{currentMeta.title}</span>
          </div>
          <h1 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Informative Context Badge (hidden on mobile) */}
      <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
        <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span>Decision-Support Prototype</span>
        <span aria-hidden="true">·</span>
        <span>Verified District Constraints</span>
      </div>

      {/* Zone 3: Primary Actions (single-line controls) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {currentView !== 'redeployment' && feasibleMovesCount > 0 && (
          <button
            onClick={onNavigateToRedeployment}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-200 border border-teal-300 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Review {feasibleMovesCount} Moves</span>
          </button>
        )}

        <button
          onClick={onExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 transition-colors shadow-xs whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>
  );
};
