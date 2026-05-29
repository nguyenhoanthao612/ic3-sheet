import React, { useState } from 'react';
import { Question } from '../types';
import { DEFAULT_QUESTIONS } from '../mockData';
import { RefreshCw, RefreshCw as Reset, AlertCircle, FileSpreadsheet, Check, Download, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AdminViewProps {
  googleSheetId: string;
  setGoogleSheetId: (id: string) => void;
  questions: Question[];
  syncStatus: { status: 'idle' | 'loading' | 'success' | 'error'; message: string; syncedAt?: string };
  syncWithGoogleSheet: (id?: string) => Promise<boolean>;
  resetToLocalDefaults: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  googleSheetId,
  setGoogleSheetId,
  questions,
  syncStatus,
  syncWithGoogleSheet,
  resetToLocalDefaults,
}) => {
  const [sheetInput, setSheetInput] = useState<string>(googleSheetId);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetInput.trim()) return;
    await syncWithGoogleSheet(sheetInput);
  };

  // Download active questions pool as structured JSON backup
  const handleBackupJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ic3_gs6_cms_backup_${Math.round(Date.now() / 1000)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="admin-dashboard-container" className="space-y-8 py-2 text-left">
      {/* Visual Identity banner */}
      <div id="admin-banner" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="space-y-1.5 z-10 flex-grow">
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 font-mono inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-400" /> Administrative Console
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Active CMS Synchronizer and Controller</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Configure dynamic questions pooling directly from your personal Google Sheets tables, inspect loaded schemas, or export structured datasets.
          </p>
        </div>

        <div className="flex gap-2.5 z-10 shrink-0">
          <button
            id="admin-btn-export"
            onClick={handleBackupJson}
            disabled={questions.length === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
          
          <button
            id="admin-btn-reset-trigger"
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 border border-rose-800 hover:bg-rose-900 bg-rose-950/20 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-sm"
          >
            <Reset className="w-3.5 h-3.5" /> Reset Default mock
          </button>
        </div>
      </div>

      {/* Main Double Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Google Sheets Synchronizer form */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 animate-pulse" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Sync Google Sheets CMS</h3>
          </div>

          <form id="sheet-sync-form" onSubmit={handleSyncSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="sheetIdInput" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Google Sheets URL or spreadsheet ID:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="sheetIdInput"
                  type="text"
                  value={sheetInput}
                  onChange={(e) => setSheetInput(e.target.value)}
                  placeholder="Paste Google sheet Sharing URL or Sheet ID here..."
                  className="px-4 py-3 border border-slate-300 rounded-xl text-xs sm:text-[13px] bg-white text-slate-800 outline-none flex-grow focus:border-indigo-650 focus:ring-4 focus:ring-indigo-100 transition shadow-sm"
                />
                
                <button
                  id="btn-sync-trigger"
                  type="submit"
                  disabled={syncStatus.status === 'loading'}
                  className="px-5 py-3 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.status === 'loading' ? 'animate-spin' : ''}`} />
                  Synchronize Pool
                </button>
              </div>
            </div>

            {/* Sync Feedback Alert card */}
            {syncStatus.status !== 'idle' && (
              <div id="sync-alerts" className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-[13px] leading-relaxed transition shadow-sm ${
                syncStatus.status === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
                syncStatus.status === 'error' ? 'bg-rose-50 border-rose-250 text-rose-950' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                {syncStatus.status === 'success' ? (
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                ) : syncStatus.status === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-spin" />
                )}
                
                <div className="space-y-0.5">
                  <p className="font-bold">
                    {syncStatus.status === 'success' ? 'Synchronization Successful!' :
                     syncStatus.status === 'error' ? 'Error Synchronizing rows' : 'Fetching data from spreadsheet...'}
                  </p>
                  <p className="opacity-90 text-[11px] sm:text-xs">{syncStatus.message}</p>
                  {syncStatus.syncedAt && (
                    <p className="text-[10px] font-mono text-slate-400 mt-1">Last synced time: {new Date(syncStatus.syncedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* Active questions overview table lists */}
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm border-b border-slate-100 pb-2">
              Currently Loaded Questions pool ({questions.length} active rows)
            </h4>

            {questions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 border border-slate-105 rounded-xl">No active rows registered. Restoring system defaults is recommended.</p>
            ) : (
              <div className="overflow-x-auto max-h-72 border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs sm:text-[11px] font-medium text-slate-500">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 sticky top-0 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Question Text</th>
                      <th className="py-2.5 px-3">Domain</th>
                      <th className="py-2.5 px-3">Ans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {questions.map((q, idx) => (
                      <tr id={`grid-row-${idx}`} key={q.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-650 shrink-0">{q.id}</td>
                        <td className="py-2.5 px-3 font-semibold uppercase">{q.type}</td>
                        <td className="py-2.5 px-3 text-slate-850 truncate max-w-xs">{q.questionText}</td>
                        <td className="py-2.5 px-3 truncate max-w-[120px]">{q.domain}</td>
                        <td className="py-2.5 px-3 truncate max-w-[80px] font-mono">{q.correctAnswer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Formatting Guidelines doc */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm text-xs text-slate-600 text-left">
          <div className="border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Spreadsheet setup guide</h3>
          </div>

          <p className="text-[11px] sm:text-xs leading-relaxed text-slate-500">To publish custom exams, follow these simple formatting guidelines inside Google Sheets:</p>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide block">1. Setup Sheet Columns:</span>
              <p className="text-[11px] leading-relaxed text-slate-500">Columns MUST be placed on the top row exactly as follows:</p>
              <div className="p-2 border border-slate-105 rounded bg-slate-50 font-mono text-[10px] break-all leading-tight">
                id | type | question | options | answer | explanation | image | video | domain | difficulty | hotspotarea
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide block">2. Delimit options with Pipe |:</span>
              <p className="text-[11px] leading-relaxed text-slate-500">For choice fields (MCQ or Multi-select), write standard options separated by a pipe character <code>|</code>:</p>
              <div className="p-2 border border-slate-105 rounded bg-slate-50 font-mono text-[10px] leading-tight">
                Option A | Option B | Option C | Option D
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide block">3. Multi-Answers:</span>
              <p className="text-[11px] leading-relaxed text-slate-500">For Matching or Drag & Drop blocks, formatting answers like:</p>
              <div className="p-2 border border-slate-105 rounded bg-slate-50 font-mono text-[10px] leading-relaxed break-all">
                Safe Practices:Unique Passwords,MFA | Insecure Practices:Phishing
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide block">4. Share Spreadsheet public:</span>
              <p className="text-[11px] leading-relaxed text-slate-550">
                Inside Google Sheets, proceed to <strong>Share &rarr; Share with anyone</strong> (and change access from Restricted to <strong>Anyone with the link can view</strong>). This grants connection permission.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation popup modal for resets */}
      {showConfirmReset && (
        <div id="reset-confirm-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="reset-confirm-box" className="p-6 rounded-2xl border border-slate-200 bg-white max-w-sm w-full space-y-5 text-center shadow-2xl animate-scale-up">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-900 text-base">Confirm Database Reset?</h3>
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                This action purges current dynamic synchronize models and restores standard 15 fallback mock questions. Student histories will remain untouched.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                id="modal-reset-cancel"
                onClick={() => setShowConfirmReset(false)}
                className="w-1/2 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              >
                Cancel Reset
              </button>
              
              <button
                id="modal-reset-confirm"
                onClick={() => {
                  resetToLocalDefaults();
                  setSheetInput('');
                  setShowConfirmReset(false);
                }}
                className="w-1/2 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-550 text-white transition shadow"
              >
                Yes, Restore Fallbacks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
