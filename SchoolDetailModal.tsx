import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Users, 
  ArrowRight, 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { SchoolRecord, RedeploymentMove } from '../types';

interface SchoolDetailModalProps {
  school: SchoolRecord | null;
  allRecords: SchoolRecord[];
  moves: RedeploymentMove[];
  onClose: () => void;
  onAdjustStaffing: (id: string, delta: number) => void;
  onApplyMove: (move: RedeploymentMove) => void;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  school,
  allRecords,
  moves,
  onClose,
  onAdjustStaffing,
  onApplyMove,
}) => {
  if (!school) return null;

  // Find all subject records for this school
  const schoolSubjects = allRecords.filter((r) => r.school === school.school);
  const totalRequired = schoolSubjects.reduce((acc, r) => acc + r.required, 0);
  const totalAvailable = schoolSubjects.reduce((acc, r) => acc + r.available, 0);
  const totalGap = totalRequired - totalAvailable;

  // Find transfers involving this school
  const relevantMoves = moves.filter(
    (m) => m.fromSchool === school.school || m.toSchool === school.school
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-school-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-school-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {school.school}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{school.district} District</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {school.km} km from district hub
                </span>
                {school.studentCount && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Users className="w-3 h-3 text-slate-400" />
                      {school.studentCount} enrolled
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                Total Required
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {totalRequired}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                Total Available
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {totalAvailable}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                School Net Gap
              </span>
              <span className={`text-xl font-bold font-mono tabular-nums ${
                totalGap > 0 
                  ? 'text-amber-800 dark:text-amber-300' 
                  : totalGap < 0 
                    ? 'text-emerald-800 dark:text-emerald-300' 
                    : 'text-teal-800 dark:text-teal-300'
              }`}>
                {totalGap > 0 ? `+${totalGap}` : totalGap}
              </span>
            </div>
          </div>

          {/* Subject Roster for this School */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Subject Deployment Breakdown
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {schoolSubjects.map((sub) => {
                const gap = sub.required - sub.available;
                return (
                  <div key={sub.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-900 dark:text-white">{sub.subject}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                        Req: <strong>{sub.required}</strong> · Avail: <strong>{sub.available}</strong>
                      </div>
                      <div className="w-24 text-right">
                        {gap > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Deficit ({gap})</span>
                          </span>
                        ) : gap < 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold">
                            <PlusCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Surplus ({Math.abs(gap)})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-teal-800 dark:text-teal-300 font-bold">
                            <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                            <span>Balanced</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feasible Redeployment Opportunities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              Associated Redeployment Proposals
            </h4>
            {relevantMoves.length > 0 ? (
              <div className="space-y-2">
                {relevantMoves.map((m) => {
                  const isRecipient = m.toSchool === school.school;
                  return (
                    <div 
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-0.5">
                          <span>{m.fromSchool}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                          <span>{m.toSchool}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {isRecipient ? 'Receives' : 'Provides'} {m.count} {m.subject} teacher · ~{m.distance} km commute
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onApplyMove(m);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors text-xs"
                      >
                        Apply Move
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                No active transfer pairings currently associate with this school under the current distance and subject constraints.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
