import React, { useState, useEffect } from 'react';
import { useAppData } from './hooks/useAppData';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { PracticeView } from './components/PracticeView';
import { ExamView } from './components/ExamView';
import { LessonsView } from './components/LessonsView';
import { AdminView } from './components/AdminView';
import {
  Layout,
  BookOpen,
  CheckCircle,
  Award,
  Flame,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  User,
  Zap,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  const {
    currentRoute,
    setCurrentRoute,
    googleSheetId,
    setGoogleSheetId,
    questions,
    syncStatus,
    syncWithGoogleSheet,
    profile,
    history,
    leaderboard,
    saveQuizAttempt,
    resetToLocalDefaults,
    selectedReviewId,
    setSelectedReviewId,
    awardBadge,
    addXp,
  } = useAppData();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Synchronization with server on load if googleSheetId is set
  useEffect(() => {
    if (googleSheetId.trim()) {
      syncWithGoogleSheet(googleSheetId);
    }
  }, []);

  // Update theme classes on DOM document root
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleReviewAttempt = (attemptId: string) => {
    setSelectedReviewId(attemptId);
    setCurrentRoute('review-mistakes');
  };

  // Find attempt values for review
  const activeReviewAttempt = history.find(h => h.id === selectedReviewId);

  // Render comparative Leaderboard page directly
  const renderLeaderboard = () => {
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.xp - a.xp);
    // Find current user rank to calculate gap
    const userIndex = sortedLeaderboard.findIndex(p => p.isCurrentUser);
    const playerAbove = userIndex > 0 ? sortedLeaderboard[userIndex - 1] : null;
    const gapToNext = playerAbove ? playerAbove.xp - sortedLeaderboard[userIndex].xp : 0;

    return (
      <div id="leaderboard-view" className="space-y-6 text-left max-w-4xl mx-auto py-2">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 animate-pulse" />
            Comparative Hall of Fame
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
            Keep practicing and take Mock Exams to earn massive Level XP. Maintain constant study day streaks for multiplier bonuses!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rank Board Left 2 Columns */}
          <div id="leaderboard-table-panel" className="md:col-span-2 p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm border-b border-slate-100 pb-2">Active Standings</h4>
            
            <div className="space-y-2">
              {sortedLeaderboard.map((player) => {
                const medalBgClass = player.rank === 1 ? 'bg-amber-100 border border-amber-300 text-amber-800' :
                                   player.rank === 2 ? 'bg-slate-100 border border-slate-300 text-slate-700' :
                                   player.rank === 3 ? 'bg-orange-100 border border-orange-300 text-orange-850' : 'bg-slate-100 text-slate-600';
                
                const highlightStyle = player.isCurrentUser
                  ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/5'
                  : 'border-slate-100 bg-white hover:bg-slate-50/50';

                return (
                  <div
                    id={`leaderboard-row-${player.rank}`}
                    key={player.rank}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${highlightStyle}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Medal or rank index circle */}
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs sm:text-sm ${medalBgClass}`}>
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                      </span>
                      
                      <div className="text-left">
                        <p className={`font-bold text-slate-800 text-xs sm:text-[13px] ${player.isCurrentUser ? 'text-indigo-600' : ''}`}>
                          {player.name}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">Level {player.level} • {player.streak} day streak</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold font-mono text-slate-800 text-xs sm:text-[13px]">{player.xp} XP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: comparative gap widget */}
          <div id="leaderboard-gap-widget" className="p-5 rounded-2xl border border-slate-200 bg-indigo-50/10 space-y-4 shadow-sm text-left flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-indigo-100 pb-2.5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-indigo-950 text-sm">Target catch up</h3>
              </div>
              
              <div className="space-y-3.5 text-xs">
                {playerAbove ? (
                  <div className="space-y-1 text-slate-600 leading-relaxed">
                    <p>You are currently placed at <strong>Rank #{userIndex + 1}</strong>.</p>
                    <p>To overtake <strong>{playerAbove.name}</strong> at Rank #{userIndex}, you require exactly:</p>
                    
                    <div className="p-3 bg-white border border-indigo-100 rounded-lg text-center mt-3">
                      <p className="font-black font-mono text-lg text-indigo-600">+{gapToNext} XP</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">Remaining difference</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 leading-relaxed font-semibold">🏆 Absolute Legend! You are holding Rank #1 in the Hall of Fame. Keep practicing daily to cement your supremacy!</p>
                )}
                
                <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
                  Complete questions in Practice Focus modules to secure 15 XP points per query, or solve timed mock quizzes for massive +100 XP pass bonuses.
                </p>
              </div>
            </div>

            <button
              id="leaderboard-practice-arena-btn"
              onClick={() => setCurrentRoute('practice')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs uppercase cursor-pointer transition text-center"
            >
              Practice to gain XP
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Mistake corrections review screens
  const renderReviewMistakes = () => {
    if (!activeReviewAttempt) {
      return (
        <div className="py-20 text-center space-y-3 text-slate-400 max-w-sm mx-auto">
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h3 className="font-bold text-slate-800">Review log not found</h3>
          <button onClick={() => setCurrentRoute('dashboard')} className="text-indigo-600 hover:underline">Return to progress board</button>
        </div>
      );
    }

    const { examDate, score, correctCount, totalQuestions, examType } = activeReviewAttempt;

    return (
      <div id="review-mistakes-stage" className="space-y-6 text-left max-w-3xl mx-auto py-2">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <button
              onClick={() => setCurrentRoute('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-1.5 cursor-pointer"
            >
              &larr; Back to Dashboard
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Diagnostic Mistakes Review
            </h2>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4 self-start sm:self-auto text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Date Taken</p>
              <p className="font-mono font-semibold text-slate-700">{new Date(examDate).toLocaleDateString()}</p>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <p className="text-[10px] uppercase font-bold text-slate-400">Score Achieved</p>
              <p className="font-mono font-extrabold text-indigo-600">{score}% ({correctCount}/{totalQuestions})</p>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
          Examine the exact corrections for difficulties experienced inside your past <strong>{examType.toUpperCase()}</strong> runs. Studying these explanations is essential for exam clearance.
        </p>

        {/* Detailed error listing table lists */}
        <div className="p-6 md:p-8 rounded-2xl border border-slate-200 bg-white space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3">Syllabus Explanations:</h3>
          
          <div className="divide-y divide-slate-200 space-y-6">
            {questions.slice(0, 5).map((q, idx) => (
              <div id={`review-corrected-card-${idx}`} key={q.id} className="pt-6 first:pt-0 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-[14px] leading-relaxed text-left">{q.questionText}</p>
                    <p className="text-[10px] text-slate-400 capitalize mt-0.5">{q.domain} • Difficulty: {q.difficulty}</p>
                  </div>
                </div>

                <div className="pl-9 space-y-2 text-xs">
                  <p className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg font-semibold text-[11px] sm:text-xs">
                    Correct Official Answer: <span className="font-mono">{q.correctAnswer}</span>
                  </p>
                  
                  <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-lg text-slate-600 leading-relaxed font-semibold">
                    <strong>Study Note Guide:</strong> {q.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setCurrentRoute('dashboard')}
          className="px-5 py-3 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer transition select-none flex items-center gap-1"
        >
          &larr; Return to Dashboard
        </button>
      </div>
    );
  };

  // Switch views corresponding to State routing
  const renderActiveView = () => {
    switch (currentRoute) {
      case 'landing':
        return (
          <LandingView
            onStartLearning={() => setCurrentRoute('practice')}
            onEnterExam={() => setCurrentRoute('mock-exam')}
            onEnterAdmin={() => setCurrentRoute('admin')}
            totalQuestionsCount={questions.length}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            profile={profile}
            history={history}
            leaderboard={leaderboard}
            onNavigate={setCurrentRoute}
            onReviewAttempt={handleReviewAttempt}
          />
        );
      case 'practice':
        return (
          <PracticeView
            questions={questions}
            onSaveQuizAttempt={saveQuizAttempt}
            onNavigate={setCurrentRoute}
          />
        );
      case 'mock-exam':
        return (
          <ExamView
            questions={questions}
            onSaveQuizAttempt={saveQuizAttempt}
            onNavigate={setCurrentRoute}
          />
        );
      case 'lessons':
        return <LessonsView onNavigate={setCurrentRoute} />;
      case 'leaderboard':
        return renderLeaderboard();
      case 'admin':
        return (
          <AdminView
            googleSheetId={googleSheetId}
            setGoogleSheetId={setGoogleSheetId}
            questions={questions}
            syncStatus={syncStatus}
            syncWithGoogleSheet={syncWithGoogleSheet}
            resetToLocalDefaults={resetToLocalDefaults}
          />
        );
      case 'review-mistakes':
        return renderReviewMistakes();
      default:
        return (
          <LandingView
            onStartLearning={() => setCurrentRoute('practice')}
            onEnterExam={() => setCurrentRoute('mock-exam')}
            onEnterAdmin={() => setCurrentRoute('admin')}
            totalQuestionsCount={questions.length}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition duration-200 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Root Layout wrapper: sidebar left layout desktop */}
      <div className="flex min-h-screen">
        
        {/* Sidebar Nav panel (collapsible mobile) */}
        <aside
          id="sidebar-nav"
          className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-805 text-slate-600 dark:text-slate-300 w-64 p-5 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col lg:justify-between shrink-0 ${
            isSidebarOpen ? 'translate-x-0 font-medium' : '-translate-x-full'
          }`}
        >
          {/* Logo brand */}
          <div className="space-y-6 flex-grow">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shrink-0">I</div>
                <div className="text-left leading-tight">
                  <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 block">
                    IC3 Masters
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold font-mono uppercase tracking-wider">Sheets CMS v4</span>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Level Widgets */}
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl text-white space-y-2.5 text-left select-none relative overflow-hidden group shadow-md shadow-indigo-100 dark:shadow-none">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-white/90" />
                  <span className="font-bold text-white text-xs">Alex (You)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-white/20 border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                  Level {profile.level}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/85 font-mono">
                  <span>Level Progress</span>
                  <span>{profile.xp} XP</span>
                </div>
                <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-300" style={{ width: `${Math.min(100, (profile.xp % 150) / 1.5)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Navigation links groups */}
            <nav className="space-y-1">
              {[
                { label: 'Platform Home', route: 'landing', icon: Home },
                { label: 'Progress Board', route: 'dashboard', icon: TrendingUp },
                { label: 'Practice Arena', route: 'practice', icon: CheckCircle },
                { label: 'Timed mock simulator', route: 'mock-exam', icon: Layout },
                { label: 'Curriculum lessons', route: 'lessons', icon: BookOpen },
                { label: 'Leaderboard rank', route: 'leaderboard', icon: Award },
                { label: 'CMS Sync settings', route: 'admin', icon: Settings },
              ].map((link) => {
                const isSelected = currentRoute === link.route || (link.route === 'dashboard' && currentRoute === 'review-mistakes');
                return (
                  <button
                    id={`sidebar-link-${link.route}`}
                    key={link.route}
                    onClick={() => {
                      setCurrentRoute(link.route);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-[13px] font-semibold transition select-none cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footers credit lines */}
          <div className="pt-4 border-t border-slate-150 dark:border-slate-800 space-y-1 text-left">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono uppercase tracking-widest">Global standard 6</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-600 leading-tight">Syncing database values dynamically. Made with React + Vite.</p>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            id="mobile-backdrop"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 lg:hidden"
          ></div>
        )}

        {/* Master Right Main panels */}
        <div id="main-frame-holder" className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
          
          {/* Responsive Header Bar */}
          <header id="stage-header" className="sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between gap-4 select-none">
            
            {/* Hamburger for mobile */}
            <div className="flex items-center gap-3">
              <button
                id="hamburger-trigger"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-450 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div id="route-headers" className="text-left font-extrabold text-sm sm:text-base capitalize text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentRoute.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Topbar Right parameters links / Streaks and Theme switch */}
            <div className="flex items-center gap-4">
              
              {/* Daily dynamic active streak multiplier label on header */}
              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-amber-200/60 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/10 text-amber-600 font-bold font-mono text-[11px] sm:text-xs">
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-500" />
                <span>{profile.streak} Days active streak</span>
              </div>

              {/* Light/Dark Toggle */}
              <button
                id="theme-toggler"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer transition flex items-center justify-center shadow-sm"
                title="Toggle visual style theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </header>

          {/* Central stage page container viewport scroll bounds */}
          <main id="main-viewport" className="flex-grow p-6 sm:p-8 max-w-7xl w-full mx-auto pb-24">
            {renderActiveView()}
          </main>

        </div>
      </div>
    </div>
  );
}
