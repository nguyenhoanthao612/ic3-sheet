import React from 'react';
import { QuizHistory, StudentProfile, LeaderboardEntry } from '../types';
import { Award, Flame, Zap, Shield, CheckCircle2, History, AlertCircle, BarChart3, LineChart as LineIcon, Grid } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

interface DashboardViewProps {
  profile: StudentProfile;
  history: QuizHistory[];
  leaderboard: LeaderboardEntry[];
  onNavigate: (route: string) => void;
  onReviewAttempt: (attemptId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  history,
  leaderboard,
  onNavigate,
  onReviewAttempt,
}) => {
  // Aggregate stats from history
  const totalExams = history.length;
  
  const avgScore = totalExams > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / totalExams)
    : 0;
    
  const passRate = totalExams > 0
    ? Math.round((history.filter(h => h.passed).length / totalExams) * 100)
    : 0;

  // Domain averages aggregation
  const getDomainAverages = () => {
    if (totalExams === 0) {
      return [
        { name: 'Computing Fund.', value: 0 },
        { name: 'Key Apps', value: 0 },
        { name: 'Living Online', value: 0 },
      ];
    }

    let compSum = 0, compCount = 0;
    let appSum = 0, appCount = 0;
    let onlineSum = 0, onlineCount = 0;

    history.forEach(h => {
      if (h.domainScores) {
        if (h.domainScores['Computing Fundamentals'] !== undefined) {
          compSum += h.domainScores['Computing Fundamentals'];
          compCount++;
        }
        if (h.domainScores['Key Applications'] !== undefined) {
          appSum += h.domainScores['Key Applications'];
          appCount++;
        }
        if (h.domainScores['Living Online'] !== undefined) {
          onlineSum += h.domainScores['Living Online'];
          onlineCount++;
        }
      }
    });

    return [
      { name: 'Computing Fund.', value: compCount > 0 ? Math.round(compSum / compCount) : 0 },
      { name: 'Key Apps', value: appCount > 0 ? Math.round(appSum / appCount) : 0 },
      { name: 'Living Online', value: onlineCount > 0 ? Math.round(onlineSum / onlineCount) : 0 },
    ];
  };

  const domainData = getDomainAverages();

  // Recharts score trends formatting
  const trendData = [...history]
    .reverse()
    .map((h, i) => ({
      index: i + 1,
      date: new Date(h.examDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: h.score,
    }));

  const COLORS = ['#3b82f6', '#6366f1', '#06b6d4'];

  return (
    <div id="student-dashboard" className="space-y-8 py-2">
      {/* KPI Cards Grid */}
      <div id="kpi-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Level Progress */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Level</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">Lvl {profile.level}</p>
            <p className="text-[11px] text-slate-500">{profile.xp} Total XP</p>
          </div>
        </div>

        {/* KPI 2: Total Exams */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exams Taken</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{totalExams}</p>
            <p className="text-[11px] text-slate-500">Practice + Mock Simulation</p>
          </div>
        </div>

        {/* KPI 3: Passing Rate */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{passRate}%</p>
            <p className="text-[11px] text-slate-500">Avg Score: {avgScore}%</p>
          </div>
        </div>

        {/* KPI 4: Streak */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Streak</p>
            <p className="text-2xl font-bold text-slate-900 font-mono">{profile.streak} Days</p>
            <p className="text-[11px] text-slate-500">Keep practicing daily!</p>
          </div>
        </div>
      </div>

      {totalExams === 0 ? (
        /* Empty State */
        <div id="dashboard-empty-state" className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-6 max-w-xl mx-auto bg-slate-50/50">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Your Study Progress Board is Blank</h3>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
              To unlock line charts tracking accuracy trends, strengths radar graphs, and diagnostic logs, launch a practice session or take a mock exam.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
               id="empty-btn-practice"
              onClick={() => onNavigate('practice')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              Practice Syllabus Topics
            </button>
            <button
              id="empty-btn-exam"
              onClick={() => onNavigate('mock-exam')}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-white text-slate-600 cursor-pointer"
            >
              Take Mock Exam
            </button>
          </div>
        </div>
      ) : (
        /* Recharts Analytics Charts */
        <div id="analytics-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Score History Trends */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <LineIcon className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-sm">Exam Accuracy Trend History (%)</h3>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#e2e8f0" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#e2e8f0" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    labelFormatter={(label) => `Exam Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', stroke: '#fff', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Domain Strength Bar chart */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-slate-800 text-sm">Syllabus Domain Mastery (%)</h3>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#e2e8f0" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#e2e8f0" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                    formatter={(value) => [`${value}% Mastery`, 'Accuracy']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {domainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Split view */}
      <div id="dashboard-split-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recent Attempts */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm lg:col-span-2 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Recent Practice & Exam Diagnostic Logs</h3>
            </div>
            {totalExams > 0 && (
              <span className="text-xs text-slate-500 font-medium font-mono">{totalExams} total</span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Your test record history is clean. Complete quizzes to populate.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-[13px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Type</th>
                    <th className="py-2.5">Result</th>
                    <th className="py-2.5">Performance</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.slice(0, 5).map((log, index) => (
                    <tr id={`history-row-${index}`} key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 text-slate-500 min-w-[70px]">
                        {new Date(log.examDate).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          log.examType === 'mock-exam' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {log.examType === 'mock-exam' ? 'MOCK EXAM' : 'PRACTICE'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`font-semibold inline-flex items-center gap-1 ${log.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {log.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700 font-mono">
                        {log.score}% <span className="font-normal text-slate-400 text-[11px]">({log.correctCount}/{log.totalQuestions})</span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          id={`review-btn-${index}`}
                          onClick={() => onReviewAttempt(log.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded cursor-pointer transition"
                        >
                          Review Mistakes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Achievements & Badges */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm text-left">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Achievements & Badges</h3>
          </div>

          <div id="badges-container" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3">
            {profile.badges.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-2 text-center py-4">No achievements earned yet.</p>
            ) : (
              profile.badges.map((badge, bIdx) => {
                let badgeIconStyle = "bg-orange-50 text-orange-600";
                if (badge.icon === 'shield') badgeIconStyle = "bg-blue-50 text-blue-600";
                if (badge.icon === 'flame') badgeIconStyle = "bg-rose-50 text-rose-600";
                if (badge.icon === 'award') badgeIconStyle = "bg-emerald-50 text-emerald-600";
                if (badge.icon === 'grid') badgeIconStyle = "bg-cyan-50 text-cyan-600";
                if (badge.icon === 'refresh-cw') badgeIconStyle = "bg-slate-100 text-slate-700";

                return (
                  <div
                    id={`badge-block-${badge.id}`}
                    key={badge.id}
                    className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center text-center space-y-1.5 transition hover:scale-[1.02] shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${badgeIconStyle}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800 text-[11px] leading-none">{badge.name}</p>
                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{badge.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
