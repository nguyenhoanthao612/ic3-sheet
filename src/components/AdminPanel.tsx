import React, { useState, useEffect } from 'react';
import { 
  Users, 
  HelpCircle, 
  GraduationCap, 
  Settings as SettingIcon, 
  FileSpreadsheet, 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  LogOut, 
  Award,
  BookOpen,
  PieChart,
  Calendar,
  Lock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileDown
} from 'lucide-react';
import { Question } from '../types';

interface AdminPanelProps {
  currentSubRoute: 'dashboard' | 'questions' | 'exams' | 'students' | 'settings';
  onNavigateSubRoute: (sub: 'dashboard' | 'questions' | 'exams' | 'students' | 'settings') => void;
  onLogout: () => void;
  googleSheetId: string;
  setGoogleSheetId: (id: string) => void;
  syncStatus: { status: 'idle' | 'loading' | 'success' | 'error'; message: string; syncedAt?: string };
  syncWithGoogleSheet: (id?: string) => Promise<boolean>;
  resetToLocalDefaults: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentSubRoute,
  onNavigateSubRoute,
  onLogout,
  googleSheetId,
  setGoogleSheetId,
  syncStatus,
  syncWithGoogleSheet,
  resetToLocalDefaults,
  onRefreshData
}) => {
  // In-Memory state fetched securely from the protected backend
  const adminFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('ic3_admin_token') || '';
    const headers = {
      ...options.headers,
      'x-admin-token': token,
    };
    return fetch(url, { ...options, headers });
  };

  const [analytics, setAnalytics] = useState<{
    totalQuestions: number;
    totalStudents: number;
    averageXP: number;
    examsCompleted: number;
  }>({ totalQuestions: 0, totalStudents: 0, averageXP: 0, examsCompleted: 0 });

  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Question Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<'multiple-choice' | 'true-false' | 'fill-blank'>('multiple-choice');
  const [newQDomain, setNewQDomain] = useState<'Computing Fundamentals' | 'Key Applications' | 'Living Online'>('Computing Fundamentals');
  const [newQDifficulty, setNewQDifficulty] = useState<'Beginner' | 'Intermediate' | 'Expert'>('Intermediate');
  const [newQAnswer, setNewQAnswer] = useState('');
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQOptions, setNewQOptions] = useState<string[]>(['', '', '', '']);

  // Fetch verified stats, students, and exams
  const fetchSecretData = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/stats');
      if (res.status === 401) {
        onLogout(); // Session died
        return;
      }
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.stats);
        setStudents(data.students);
        setExams(data.recentExams);
      }
    } catch (err) {
      console.error('Failed to retrieve stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch questions pool
  const fetchQuestionsList = async () => {
    try {
      const res = await adminFetch('/api/admin/questions');
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSecretData();
    fetchQuestionsList();
  }, [currentSubRoute]);

  // Handle Question Deletion
  const handleDeleteQuestion = async (qId: string) => {
    if (!window.confirm('Are you absolutely certain you want to remove this question from live memory?')) return;
    try {
      const res = await adminFetch('/api/admin/questions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: qId })
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => prev.filter(q => q.id !== qId));
        showNotification('success', 'Question deleted successfully.');
        onRefreshData(); // alert top hooks
      } else {
        showNotification('error', data.message || 'Failed to delete question.');
      }
    } catch {
      showNotification('error', 'Network failure when deleting.');
    }
  };

  // Handle Question Addition
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newQAnswer.trim()) {
      showNotification('error', 'Please write a question text and official answer.');
      return;
    }

    // Filter blank options
    const filteredOptions = newQType === 'multiple-choice' 
      ? newQOptions.map(o => o.trim()).filter(Boolean)
      : newQType === 'true-false' ? ['True', 'False'] : [];

    const payload = {
      questionText: newQText,
      type: newQType,
      options: filteredOptions,
      correctAnswer: newQAnswer.trim(),
      explanation: newQExplanation.trim() || 'Custom published item.',
      domain: newQDomain,
      difficulty: newQDifficulty
    };

    try {
      const res = await adminFetch('/api/admin/questions/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(prev => [data.question, ...prev]);
        setShowAddForm(false);
        setNewQText('');
        setNewQAnswer('');
        setNewQExplanation('');
        setNewQOptions(['', '', '', '']);
        showNotification('success', 'Custom question successfully published to central pool.');
        onRefreshData(); // refresh parent questions copy
      } else {
        showNotification('error', data.message || 'Failed to submit question.');
      }
    } catch {
      showNotification('error', 'Connection failure while publishing.');
    }
  };

  // Handle student reset or delete actions
  const handleStudentAction = async (studentId: string, action: 'delete' | 'reset') => {
    const confirmationMsg = action === 'delete' 
      ? 'Are you sure you want to remove this student student directory?' 
      : 'Reset this student diagnostic streak and level XP back to zero?';
    if (!window.confirm(confirmationMsg)) return;

    try {
      const res = await adminFetch('/api/admin/students/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action })
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        showNotification('success', data.message);
      } else {
        showNotification('error', data.message || 'Action failed.');
      }
    } catch {
      showNotification('error', 'Network failure completing action.');
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage(null);
    }, 4500);
  };

  // Clear server sheets cache
  const handleClearServerCache = async () => {
    try {
      const res = await adminFetch('/api/questions/clear-cache', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'In-Memory Google Spreadsheet questions cache cleared.');
        fetchSecretData();
        fetchQuestionsList();
      }
    } catch {
      showNotification('error', 'Failed to communicate cache cleaner.');
    }
  };

  const downloadSecretBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `admin_diagnostic_questions_backup_${Math.round(Date.now() / 1000)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSyllabusColor = (domain: string) => {
    if (domain === 'Key Applications') return 'text-sky-600 bg-sky-50 dark:bg-sky-950/20';
    if (domain === 'Computing Fundamentals') return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20';
    return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20';
  };

  return (
    <div id="admin-panel-container" className="space-y-6 text-left max-w-6xl mx-auto py-2">
      
      {/* Upper Context Header */}
      <div id="admin-header-banner" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Platform Supervisor Settings
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            IC3 GS6 Control Room
          </h2>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Welcome to the secure administrative terminal. Manage learning content parameters, monitor diagnostics, and configure sheets bindings.
          </p>
        </div>

        <button 
          id="admin-logout-trigger-btn"
          onClick={onLogout}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition cursor-pointer self-start md:self-auto select-none"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Lock Session</span>
        </button>
      </div>

      {/* Persistent action notification banner */}
      {actionMessage && (
        <div id="admin-action-toast animate-fadeIn" className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
          actionMessage.type === 'success' 
            ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400' 
            : 'border-rose-250 bg-rose-50/50 text-rose-800 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
          <span className="font-semibold">{actionMessage.text}</span>
        </div>
      )}

      {/* Horizontal Protected Sub-Routes Tabs Navigation bar */}
      <div id="admin-subroutes-tabs" className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        {[
          { label: 'Dashboard Overview', val: 'dashboard', icon: PieChart },
          { label: 'Manage Syllabus', val: 'questions', icon: HelpCircle },
          { label: 'Exam Tracking', val: 'exams', icon: GraduationCap },
          { label: 'Active Students', val: 'students', icon: Users },
          { label: 'Systems & Sync', val: 'settings', icon: SettingIcon }
        ].map(tab => {
          const isActive = currentSubRoute === tab.val;
          return (
            <button
              id={`admin-tablink-${tab.val}`}
              key={tab.val}
              onClick={() => {
                // Update URL pathway beautifully and update state
                window.history.pushState(null, '', `/admin/${tab.val}`);
                onNavigateSubRoute(tab.val as any);
              }}
              className={`px-4 py-3 text-xs font-bold shrink-0 flex items-center gap-1.5 border-b-2 transition cursor-pointer select-none ${
                isActive 
                  ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Core Dynamic Tab view Render block */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-10 h-10 mx-auto animate-spin text-indigo-600" />
          <p className="text-xs text-slate-400 font-medium">Validating security session token...</p>
        </div>
      ) : (
        <div id="admin-subroute-central-viewport" className="space-y-6">
          
          {/* VIEW 1: /admin/dashboard */}
          {currentSubRoute === 'dashboard' && (
            <div id="admin-view-dashboard" className="space-y-6 animate-fadeIn">
              
              {/* Analytics metrics KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Syllabus Questions</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">{analytics.totalQuestions}</p>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Registered Students</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">{analytics.totalStudents}</p>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 shrink-0">
                    <Award className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Average Level XP</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">{analytics.averageXP} XP</p>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Exams Completed</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-1">{analytics.examsCompleted}</p>
                  </div>
                </div>
              </div>

              {/* Combined dashboard grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side: Recent Student Submissions */}
                <div id="analytics-recent-exams-card" className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-500" /> Live Exam Submissions Logs (Real-Time)
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase uppercase">Verified logs</span>
                  </div>

                  {exams.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400">No mock exam attempts registered yet on the backend server daemon.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 font-bold capitalize select-none border-b border-slate-50 dark:border-slate-800 pb-2">
                            <th className="py-2.5">Student</th>
                            <th className="py-2.5">Date Submitted</th>
                            <th className="py-2.5 text-center">Score Result</th>
                            <th className="py-2.5 text-center">Correctness ratio</th>
                            <th className="py-2.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800 pl-1">
                          {exams.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 font-medium">
                              <td className="py-3 pr-2 text-slate-900 dark:text-white font-bold">{item.studentName}</td>
                              <td className="py-3 pr-2 text-slate-450 dark:text-slate-550 font-mono text-[11px]">
                                {new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-3 pr-2 text-center font-bold font-mono text-indigo-600 dark:text-indigo-400">{item.score}%</td>
                              <td className="py-3 pr-2 text-center font-mono text-slate-500">{item.correctCount} / {item.totalQuestions}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                                  item.passed 
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                                }`}>
                                  {item.passed ? 'PASSED' : 'FAILED'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right side: quick shortcuts and server status */}
                <div id="analytics-shortcuts-status-card" className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm sm:text-base border-b border-slate-100 dark:border-slate-800 pb-2">
                    System Parameters
                  </h3>

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Server Health Status:</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        ONLINE (SECURE)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Environment Bindings:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">Full-Stack Cloud Container</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Sync Config Target:</span>
                      <span className="font-mono text-slate-500 font-normal">
                        {googleSheetId ? `ID: ${googleSheetId.slice(0,6)}...` : 'Built-in Local JSON DB'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Recommended steps</p>
                    <button
                      onClick={() => onNavigateSubRoute('questions')}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 flex items-center justify-between group transition text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <span>Questions Pool Inspector</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>

                    <button
                      onClick={() => onNavigateSubRoute('settings')}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 flex items-center justify-between group transition text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <span>Database Sync Manager</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* VIEW 2: /admin/questions */}
          {currentSubRoute === 'questions' && (
            <div id="admin-view-questions" className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg flex items-center gap-1.5">
                    Syllabus Diagnostic Questions
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal font-semibold">
                    Inspect loaded questions, add custom practice questions directly, or delete entries.
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button 
                    id="admin-backup-syllabus-btn"
                    onClick={downloadSecretBackup}
                    className="px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition select-none shadow-sm"
                  >
                    <FileDown className="w-4 h-4" /> Export Backup
                  </button>

                  <button
                    id="admin-show-add-form-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition select-none shadow-md shadow-indigo-600/15"
                  >
                    <PlusCircle className="w-4 h-4" /> 
                    <span>{showAddForm ? 'Close Editor' : 'Publish Question'}</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Question Form Container Panel */}
              {showAddForm && (
                <form 
                  id="admin-add-question-form" 
                  onSubmit={handleAddQuestion} 
                  className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-slideDown"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1 pb-2 border-b border-slate-200 dark:border-slate-805">
                    📝 Syllabus Question Creator Form
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Syllabus Domain</label>
                      <select 
                        value={newQDomain} 
                        onChange={(e: any) => setNewQDomain(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-300 focus:outline-none font-semibold"
                      >
                        <option value="Computing Fundamentals">Computing Fundamentals</option>
                        <option value="Key Applications">Key Applications</option>
                        <option value="Living Online">Living Online</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Question Type</label>
                      <select 
                        value={newQType} 
                        onChange={(e: any) => {
                          setNewQType(e.target.value);
                          if (e.target.value === 'true-false') setNewQAnswer('True');
                        }}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-300 focus:outline-none font-semibold"
                      >
                        <option value="multiple-choice">Multiple Choice (Standard)</option>
                        <option value="true-false">True / False</option>
                        <option value="fill-blank">Fill in the blank</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Target Difficulty</label>
                      <select 
                        value={newQDifficulty} 
                        onChange={(e: any) => setNewQDifficulty(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-300 focus:outline-none font-semibold"
                      >
                        <option value="Beginner">Beginner core</option>
                        <option value="Intermediate">Intermediate average</option>
                        <option value="Expert">Expert challenge</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Question Prompt / Scenario</label>
                    <textarea
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      placeholder="e.g. Which tool offers symmetric cryptographic keys protection for secure data exchanges?"
                      required
                      rows={2}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 select-none focus:outline-none font-semibold"
                    />
                  </div>

                  {newQType === 'multiple-choice' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 block">Choices Options (Left block empty to discard)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {newQOptions.map((opt, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const copy = [...newQOptions];
                              copy[idx] = e.target.value;
                              setNewQOptions(copy);
                            }}
                            placeholder={`Choice option #${idx + 1}`}
                            className="px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Official Correct Answer</label>
                      {newQType === 'true-false' ? (
                        <select 
                          value={newQAnswer} 
                          onChange={(e) => setNewQAnswer(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-300 focus:outline-none font-semibold"
                        >
                          <option value="True">True</option>
                          <option value="False">False</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={newQAnswer}
                          onChange={(e) => setNewQAnswer(e.target.value)}
                          placeholder="Must match one of options exactly"
                          required
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 font-semibold focus:outline-none"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Syllabus Rationale / Study Note Explanation</label>
                      <input
                        type="text"
                        value={newQExplanation}
                        onChange={(e) => setNewQExplanation(e.target.value)}
                        placeholder="Explanation provided to Student during review corrections..."
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-805">
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 hover:bg-slate-150 dark:hover:bg-slate-805 text-slate-500 rounded-lg font-bold text-xs cursor-pointer select-none"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer active:translate-y-px transition select-none"
                    >
                      Publish Question
                    </button>
                  </div>
                </form>
              )}

              {/* Questions table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold capitalize select-none border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5 w-16">No.</th>
                        <th className="p-3.5">Domain</th>
                        <th className="p-3.5">Question details</th>
                        <th className="p-3.5">Correct Answer</th>
                        <th className="p-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-805 font-medium text-slate-600 dark:text-slate-350">
                      {questions.map((q, qIndex) => (
                        <tr id={`q-table-row-${q.id}`} key={q.id} className="hover:bg-slate-50/20 dark:hover:bg-white/5">
                          <td className="p-3.5 font-bold text-slate-400">{qIndex + 1}</td>
                          <td className="p-3.5 shrink-0">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider block text-center w-max ${getSyllabusColor(q.domain)}`}>
                              {q.domain}
                            </span>
                          </td>
                          <td className="p-3.5 max-w-sm sm:max-w-md">
                            <p className="font-semibold text-slate-850 dark:text-white line-clamp-2">{q.questionText}</p>
                            <div className="flex gap-1 mt-1">
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-400 font-mono capitalize">
                                {q.type}
                              </span>
                              <span className="text-[9px] bg-indigo-50/40 dark:bg-indigo-950/20 px-1 py-0.5 rounded text-slate-400 font-mono capitalize">
                                {q.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</td>
                          <td className="p-3.5 text-center">
                            <button
                              id={`admin-btn-delete-q-${q.id}`}
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg border border-slate-150 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/20 cursor-pointer transition select-none flex items-center justify-center mx-auto"
                              title="Delete Question permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 3: /admin/exams */}
          {currentSubRoute === 'exams' && (
            <div id="admin-view-exams" className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-bold text-slate-850 dark:text-white text-base sm:text-lg">
                  Historical Exams Tracking logs
                </h3>
                <p className="text-xs text-slate-400 leading-normal font-semibold">
                  Comprehensive audit traces of individual student activity submissions and their associated diagnostics performance.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {exams.length === 0 ? (
                  <p className="text-center py-12 text-xs text-slate-400">No mock exam attempts registered yet on the backend server.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold capitalize select-none border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3.5">Student</th>
                          <th className="p-3.5">Activity Area</th>
                          <th className="p-3.5">Date Completed</th>
                          <th className="p-3.5 text-center">Score achieved</th>
                          <th className="p-3.5 text-center">Correct answers</th>
                          <th className="p-3.5 text-center">Duration</th>
                          <th className="p-3.5">Result Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-805 font-medium text-slate-600 dark:text-slate-350">
                        {exams.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/20 dark:hover:bg-white/5">
                            <td className="p-3.5 text-slate-900 dark:text-white font-bold">{item.studentName}</td>
                            <td className="p-3.5 capitalize font-semibold">{item.examType.replace('-', ' ')}</td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-400">
                              {new Date(item.submittedAt).toLocaleDateString()} {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3.5 text-center font-bold font-mono text-indigo-500 text-sm">{item.score}%</td>
                            <td className="p-3.5 text-center font-mono">{item.correctCount} / {item.totalQuestions}</td>
                            <td className="p-3.5 text-center font-mono text-[11px] text-slate-400">{Math.floor(item.duration / 60)}m {item.duration % 60}s</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider block text-center w-max ${
                                item.passed 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              }`}>
                                {item.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 4: /admin/students */}
          {currentSubRoute === 'students' && (
            <div id="admin-view-students" className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-bold text-slate-850 dark:text-white text-base sm:text-lg">
                  Active Student Directory
                </h3>
                <p className="text-xs text-slate-400 leading-normal font-semibold">
                  Inspect student list profiles, monitor XP accumulation scores, activity day streaks, or trigger resets.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold capitalize select-none border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3.5">Student Username</th>
                        <th className="p-3.5 text-center">Diagnostic level</th>
                        <th className="p-3.5 text-center font-mono">Assigned XP</th>
                        <th className="p-3.5 text-center">Streak days</th>
                        <th className="p-3.5">Last active date</th>
                        <th className="p-3.5 text-center">Administrative action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-805 font-medium text-slate-600 dark:text-slate-350">
                      {students.map((st) => (
                        <tr id={`student-row-${st.id}`} key={st.id} className="hover:bg-slate-50/20 dark:hover:bg-white/5">
                          <td className="p-3.5 text-slate-900 dark:text-white font-bold select-all">{st.name}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-100">
                            Level {st.level}
                          </td>
                          <td className="p-3.5 text-center font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {st.xp} XP
                          </td>
                          <td className="p-3.5 text-center font-mono text-amber-600">
                            🔥 {st.streak} Days
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">{st.lastActiveDate || 'N/A'}</td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleStudentAction(st.id, 'reset')}
                                className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 dark:bg-slate-950 dark:hover:bg-slate-900 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-bold uppercase transition cursor-pointer select-none"
                                title="Reset scores to default configuration"
                              >
                                Reset XP
                              </button>
                              <button
                                onClick={() => handleStudentAction(st.id, 'delete')}
                                className="p-1 px-1.5 rounded-md border border-transparent text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20 cursor-pointer transition select-none"
                                title="Delete student profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: /admin/settings */}
          {currentSubRoute === 'settings' && (
            <div id="admin-view-settings" className="space-y-6 lg:max-w-4xl animate-fadeIn">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Synchronization Column */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm sm:text-base border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Google Sheets Sync Settings
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Input your published dynamic spreadsheet ID block. Our server will inspect row schemas and build practice question pools instantly.
                  </p>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const txt = (e.target as any).sheetInput.value.trim();
                      if (!txt) return;
                      await syncWithGoogleSheet(txt);
                    }} 
                    className="space-y-3 text-left pt-2"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Spreadsheet ID or full URL Link</label>
                      <input
                        name="sheetInput"
                        type="text"
                        defaultValue={googleSheetId}
                        placeholder="e.g. 1uK7G_Iic_lBqfNqL... or copy URL"
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={syncStatus.status === 'loading'}
                      className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer select-none flex items-center justify-center gap-1.5 disabled:opacity-75"
                    >
                      {syncStatus.status === 'loading' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Syncing sheets data...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Trigger Sheets Resync</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Sync status text */}
                  {syncStatus.status !== 'idle' && (
                    <div className={`p-3 rounded-lg text-xs leading-normal font-semibold ${
                      syncStatus.status === 'success' 
                        ? 'bg-emerald-50 border border-emerald-150 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/20' 
                        : syncStatus.status === 'error'
                        ? 'bg-rose-50 border border-rose-150 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/20'
                        : 'bg-indigo-50 border border-indigo-150 text-indigo-800'
                    }`}>
                      <p>{syncStatus.message}</p>
                      {syncStatus.syncedAt && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                          Last Synchronization: {new Date(syncStatus.syncedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* System Diagnostics Reset Column */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-850 dark:text-white text-sm sm:text-base border-b border-slate-100 dark:border-slate-850 pb-2">
                    Supervisor System Actions
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Flush server caches and restart databases or restore local defaults instantly.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={handleClearServerCache}
                      className="w-full py-2.5 rounded-lg border border-indigo-200 hover:bg-indigo-50/50 dark:border-indigo-900 dark:hover:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider cursor-pointer text-center transition select-none flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" /> Clear Server cache
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Restore system questions pool back to original default settings? This will drop custom additions.')) {
                          resetToLocalDefaults();
                          showNotification('success', 'Restored client questions to default settings.');
                        }
                      }}
                      className="w-full py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950/20 text-slate-650 dark:text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer text-center transition select-none flex items-center justify-center gap-1"
                    >
                      Restore Local JSON Defaults
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
