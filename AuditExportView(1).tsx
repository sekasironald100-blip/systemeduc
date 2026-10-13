import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  ShieldAlert, 
  Printer 
} from 'lucide-react';
import { SchoolRecord, RedeploymentMove, SubjectSummary, DistrictSummary } from '../types';

interface AuditExportViewProps {
  records: SchoolRecord[];
  allRecords: SchoolRecord[];
  moves: RedeploymentMove[];
  subjectSummaries: SubjectSummary[];
  districtSummaries: DistrictSummary[];
  onExportCSV: () => void;
}

export const AuditExportView: React.FC<AuditExportViewProps> = ({
  records,
  allRecords,
  moves,
  subjectSummaries,
  districtSummaries,
  onExportCSV,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const totalDeficit = records.reduce((acc, r) => acc + Math.max(0, r.required - r.available), 0);
  const totalSurplus = records.reduce((acc, r) => acc + Math.max(0, r.available - r.required), 0);
  const totalMoves = moves.reduce((acc, m) => acc + m.count, 0);

  const handleCopySummary = () => {
    const summaryText = `TEACHER DEPLOYMENT EQUITY AUDIT REPORT
Generated: ${new Date().toLocaleDateString()}
Districts Analyzed: ${districtSummaries.map((d) => d.district).join(', ')}
Total Schools Evaluated: ${records.length}
Gross Teacher Deficit: ${totalDeficit}
Available Surplus Pool: ${totalSurplus}
Feasible Redeployments: ${totalMoves}
Projected Net Deficit After Moves: ${Math.max(0, totalDeficit - totalMoves)}

Subject Breakdown:
${subjectSummaries.map((s) => `- ${s.subject}: ${s.available}/${s.required} (${s.coverageRatio}% coverage, gap: ${s.deficit})`).join('\n')}

District Equity Standings:
${districtSummaries.map((d) => `- ${d.district}: ${d.parityScore}% parity score (deficit: ${d.deficit}, surplus: ${d.surplus})`).join('\n')}
`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      generatedAt: new Date().toISOString(),
      records,
      recommendations: moves,
      subjectSummaries,
      districtSummaries,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `teacher-deployment-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Audit, Compliance & Export Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate official staffing reports and extract clean data records for external ERP systems.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV (.csv)</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Official Summary Card Preview */}
      <div className="p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-start justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-teal-700 dark:text-teal-300">
              Department of District Education Planning
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Teacher Allocation & Equity Assessment Memo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ref: EDU-DEP/2026/Q4 · Scope: Primary Education Cadre
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Print report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Key Indicators Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Total Schools</span>
            <strong className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {records.length}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Gross Deficit</span>
            <strong className="text-base font-bold text-amber-800 dark:text-amber-300 font-mono tabular-nums">
              {totalDeficit} teachers
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Identified Surplus</span>
            <strong className="text-base font-bold text-emerald-800 dark:text-emerald-300 font-mono tabular-nums">
              {totalSurplus} teachers
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block mb-1">Feasible Transfers</span>
            <strong className="text-base font-bold text-teal-800 dark:text-teal-300 font-mono tabular-nums">
              {totalMoves} transfers
            </strong>
          </div>
        </div>

        {/* Methodological Guidance Note */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Statutory Verification Notice</span>
          </div>
          <p>
            All school records, staffing quotas, and travel distance estimates are demonstration planning figures. This software serves as an algorithmic decision-support tool; it does not constitute an automatic or binding transfer order.
          </p>
          <p>
            Before issuing transfer letters, district education officers must verify teacher subject specialization credentials, confirm transport road networks, guarantee school minimum staffing quotas, and ensure full compliance with regional civil service regulations.
          </p>
        </div>
      </div>
    </div>
  );
};
