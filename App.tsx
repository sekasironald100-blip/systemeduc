/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  SchoolRecord, 
  RedeploymentMove, 
  ViewMode, 
  FilterState 
} from './types';
import { INITIAL_RECORDS } from './data/mockData';
import { 
  filterRecords, 
  generateRecommendations, 
  computeMetrics, 
  getSubjectSummaries, 
  getDistrictSummaries 
} from './utils/equityEngine';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { FilterToolbar } from './components/FilterToolbar';
import { StaffingTable } from './components/StaffingTable';
import { RedeploymentView } from './components/RedeploymentView';
import { VisualizationsView } from './components/VisualizationsView';
import { DistrictMapView } from './components/DistrictMapView';
import { AuditExportView } from './components/AuditExportView';
import { SchoolDetailModal } from './components/SchoolDetailModal';

export default function App() {
  // Dark mode state with persistent storage and system preference
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edumap_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('edumap_dark_mode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('edumap_dark_mode', 'false');
    }
  }, [isDark]);

  // Sidebar collapse & mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Active view navigation mode
  const [currentView, setCurrentView] = useState<ViewMode>('overview');

  // School dataset state (with support for live in-memory redeployment simulations)
  const [records, setRecords] = useState<SchoolRecord[]>(INITIAL_RECORDS);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  // Inspected school for detail modal
  const [selectedSchool, setSelectedSchool] = useState<SchoolRecord | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    district: 'All',
    subject: 'All',
    search: '',
    status: 'all',
    maxDistance: 30,
  });

  // Unique dropdown lists
  const districts = useMemo(() => {
    return [...new Set(INITIAL_RECORDS.map((r) => r.district))].sort();
  }, []);

  const subjects = useMemo(() => {
    return [...new Set(INITIAL_RECORDS.map((r) => r.subject))].sort();
  }, []);

  // Filtered dataset based on user criteria
  const filteredRecords = useMemo(() => {
    return filterRecords(records, filters);
  }, [records, filters]);

  // Algorithmic redeployment moves based on current records and distance threshold
  const recommendations = useMemo(() => {
    return generateRecommendations(filteredRecords, filters.maxDistance);
  }, [filteredRecords, filters.maxDistance]);

  // Key KPI metrics
  const metrics = useMemo(() => {
    return computeMetrics(filteredRecords, recommendations);
  }, [filteredRecords, recommendations]);

  // Aggregated summaries for charts and visual analytics
  const subjectSummaries = useMemo(() => {
    return getSubjectSummaries(filteredRecords);
  }, [filteredRecords]);

  const districtSummaries = useMemo(() => {
    return getDistrictSummaries(filteredRecords);
  }, [filteredRecords]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      district: 'All',
      subject: 'All',
      search: '',
      status: 'all',
      maxDistance: 30,
    });
  };

  // Adjust staffing (+1 / -1) for interactive scenario planning
  const handleAdjustStaffing = (id: string, delta: number) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newAvail = Math.max(1, r.available + delta);
          return { ...r, available: newAvail };
        }
        return r;
      })
    );
    setIsSimulated(true);
  };

  // Apply a single proposed move to simulate equity improvement
  const handleApplyMove = (move: RedeploymentMove) => {
    setRecords((prev) => {
      return prev.map((r) => {
        // Decrement donor school
        if (r.school === move.fromSchool && r.subject === move.subject) {
          return { ...r, available: Math.max(1, r.available - move.count) };
        }
        // Increment recipient school
        if (r.school === move.toSchool && r.subject === move.subject) {
          return { ...r, available: r.available + move.count };
        }
        return r;
      });
    });
    setIsSimulated(true);
  };

  // Batch apply all feasible moves
  const handleApplyAllMoves = () => {
    if (recommendations.length === 0) return;
    setRecords((prev) => {
      let updated = [...prev];
      recommendations.forEach((move) => {
        updated = updated.map((r) => {
          if (r.school === move.fromSchool && r.subject === move.subject) {
            return { ...r, available: Math.max(1, r.available - move.count) };
          }
          if (r.school === move.toSchool && r.subject === move.subject) {
            return { ...r, available: r.available + move.count };
          }
          return r;
        });
      });
      return updated;
    });
    setIsSimulated(true);
  };

  // Reset simulation back to verified baseline data
  const handleResetSimulation = () => {
    setRecords(INITIAL_RECORDS);
    setIsSimulated(false);
  };

  // Export dataset to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'School Name',
      'District',
      'Subject',
      'Required Teachers',
      'Available Teachers',
      'Net Gap',
      'Status',
      'Distance to Center (km)',
      'Student Enrollment',
    ];

    const rows = filteredRecords.map((r) => {
      const gap = r.required - r.available;
      const statusText = gap > 0 ? 'Shortage' : gap < 0 ? 'Surplus' : 'Balanced';
      return [
        r.school,
        r.district,
        r.subject,
        r.required,
        r.available,
        gap,
        statusText,
        r.km,
        r.studentCount || 'N/A',
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teacher-deployment-equity-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-50 w-72 h-full flex flex-col bg-white dark:bg-slate-900 shadow-xl">
            <Sidebar
              currentView={currentView}
              onSelectView={(v) => {
                setCurrentView(v);
                setIsMobileMenuOpen(false);
              }}
              isDark={isDark}
              onToggleDark={() => setIsDark(!isDark)}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileMenuOpen(false)}
              totalDeficit={metrics.grossDeficit}
              feasibleMovesCount={metrics.totalFeasibleMoves}
              parityScore={metrics.parityIndex}
            />
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar Menu */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          totalDeficit={metrics.grossDeficit}
          feasibleMovesCount={metrics.totalFeasibleMoves}
          parityScore={metrics.parityIndex}
        />
      </div>

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          currentView={currentView}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          onExportCSV={handleExportCSV}
          onNavigateToRedeployment={() => setCurrentView('redeployment')}
          feasibleMovesCount={metrics.totalFeasibleMoves}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {/* Universal Metric Cards Strip (displayed across key views for instant clarity) */}
          {currentView !== 'audit' && (
            <MetricCards
              uniqueSchools={metrics.uniqueSchools}
              totalDeficit={metrics.grossDeficit}
              totalSurplus={metrics.grossSurplus}
              feasibleMovesCount={metrics.totalFeasibleMoves}
              postDeficit={metrics.postDeficit}
              maxDistance={filters.maxDistance}
              onFilterShortage={() => setFilters({ ...filters, status: 'shortage' })}
              onFilterSurplus={() => setFilters({ ...filters, status: 'surplus' })}
              onNavigateToRedeployment={() => setCurrentView('redeployment')}
            />
          )}

          {/* Universal Filter Toolbar (for Overview, Roster, and Map views) */}
          {(currentView === 'overview' || currentView === 'roster') && (
            <FilterToolbar
              filters={filters}
              onFilterChange={setFilters}
              districts={districts}
              subjects={subjects}
              onReset={handleResetFilters}
              totalFilteredCount={filteredRecords.length}
            />
          )}

          {/* View Mode Switching */}
          {currentView === 'overview' && (
            <div className="space-y-6">
              {/* Split layout: Staffing Roster + Redeployment Snapshot */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className="xl:col-span-2">
                  <StaffingTable
                    records={filteredRecords}
                    onSelectSchool={setSelectedSchool}
                    onAdjustStaffing={handleAdjustStaffing}
                    onResetFilters={handleResetFilters}
                  />
                </div>

                <div className="space-y-6">
                  {/* Quick Visuals Preview */}
                  <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Subject Deficit Breakdown
                      </h3>
                      <button
                        onClick={() => setCurrentView('visualizations')}
                        className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                      >
                        All Visuals →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {subjectSummaries.slice(0, 4).map((sub) => {
                        const maxVal = Math.max(1, ...subjectSummaries.map((s) => s.deficit));
                        const pct = Math.min(100, (sub.deficit / maxVal) * 100);
                        return (
                          <div key={sub.subject} className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {sub.subject}
                              </span>
                              <span className="font-mono tabular-nums text-amber-800 dark:text-amber-300 font-bold">
                                {sub.deficit > 0 ? `-${sub.deficit} teachers` : 'Balanced'}
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-600 dark:bg-teal-500 transition-all duration-300"
                                style={{ width: `${sub.coverageRatio}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Proposed Transfers */}
                  <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Immediate Transfer Pairs
                      </h3>
                      <button
                        onClick={() => setCurrentView('redeployment')}
                        className="text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                      >
                        Engine View →
                      </button>
                    </div>
                    {recommendations.length > 0 ? (
                      <div className="space-y-2.5">
                        {recommendations.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-slate-900 dark:text-white truncate">
                                {m.fromSchool} → {m.toSchool}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                                {m.count} {m.subject} · ~{m.distance} km commute
                              </div>
                            </div>
                            <button
                              onClick={() => handleApplyMove(m)}
                              className="px-2 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] transition-colors whitespace-nowrap shrink-0"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                        No feasible moves within {filters.maxDistance} km.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'roster' && (
            <StaffingTable
              records={filteredRecords}
              onSelectSchool={setSelectedSchool}
              onAdjustStaffing={handleAdjustStaffing}
              onResetFilters={handleResetFilters}
            />
          )}

          {currentView === 'redeployment' && (
            <RedeploymentView
              moves={recommendations}
              records={filteredRecords}
              allRecords={records}
              maxDistance={filters.maxDistance}
              onMaxDistanceChange={(d) => setFilters({ ...filters, maxDistance: d })}
              onApplyMove={handleApplyMove}
              onApplyAllMoves={handleApplyAllMoves}
              onResetSimulation={handleResetSimulation}
              isSimulated={isSimulated}
            />
          )}

          {currentView === 'visualizations' && (
            <VisualizationsView
              records={filteredRecords}
              allRecords={records}
              subjectSummaries={subjectSummaries}
              districtSummaries={districtSummaries}
              maxDistance={filters.maxDistance}
              onMaxDistanceChange={(d) => setFilters({ ...filters, maxDistance: d })}
            />
          )}

          {currentView === 'map' && (
            <DistrictMapView
              records={filteredRecords}
              moves={recommendations}
              onSelectSchool={setSelectedSchool}
              selectedDistrict={filters.district}
              onDistrictSelect={(d) => setFilters({ ...filters, district: d })}
            />
          )}

          {currentView === 'audit' && (
            <AuditExportView
              records={filteredRecords}
              allRecords={records}
              moves={recommendations}
              subjectSummaries={subjectSummaries}
              districtSummaries={districtSummaries}
              onExportCSV={handleExportCSV}
            />
          )}
        </main>
      </div>

      {/* School Detailed Inspection Modal */}
      <SchoolDetailModal
        school={selectedSchool}
        allRecords={records}
        moves={recommendations}
        onClose={() => setSelectedSchool(null)}
        onAdjustStaffing={handleAdjustStaffing}
        onApplyMove={handleApplyMove}
      />
    </div>
  );
}
