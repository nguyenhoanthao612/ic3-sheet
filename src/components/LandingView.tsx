import React from 'react';
import { Award, Shield, FileSpreadsheet, PlayCircle, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

interface LandingViewProps {
  onStartLearning: () => void;
  onEnterExam: () => void;
  onEnterAdmin: () => void;
  totalQuestionsCount: number;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartLearning,
  onEnterExam,
  onEnterAdmin,
  totalQuestionsCount,
}) => {
  return (
    <div id="landing-page" className="space-y-16 py-4">
      {/* Hero Section */}
      <div id="hero-wrap" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-8 sm:p-14 shadow-2xl flex flex-col md:flex-row items-center gap-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div id="hero-left" className="space-y-6 md:w-3/5 text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4 text-indigo-400" /> Authorized Training System Simulator
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Master the IC3 GS6 Certification
          </h1>
          
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            A complete, ultra-premium practice and exam training platform mirroring standard GMetrix and Pearson Vue setups. Managed via your own Google Sheets CMS.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              id="cta-practice"
              onClick={onStartLearning}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white transition shadow-lg shadow-indigo-600/15 active:translate-y-px cursor-pointer text-sm font-sans"
            >
              Start Practice Sections
            </button>
            <button
              id="cta-exam"
              onClick={onEnterExam}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white transition shadow-lg shadow-emerald-600/15 active:translate-y-px cursor-pointer text-sm font-sans"
            >
              Launch Mock Exam (Timer)
            </button>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {totalQuestionsCount} Loaded Questions</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 Realistic Question Types</span>
          </div>
        </div>

        <div id="hero-right" className="md:w-2/5 flex justify-center z-10 w-full">
          {/* Glassmorphism Badge Card */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-xl space-y-6 w-full max-w-sm">
            <div className="absolute top-2 right-2 flex space-x-1.5 justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-60"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-60"></span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">CMS Synced</p>
                <p className="text-slate-100 font-bold font-mono text-xs sm:text-sm">GOOGLE SHEETS API v4</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-left">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-semibold text-indigo-300">Spreadsheet Row CRM</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400">Active Sync Mode:</span>
                <span className="font-semibold text-emerald-400">Auto Caching / ISR</span>
              </div>
              <div className="flex justify-between items-center py-1.5 ">
                <span className="text-slate-400">AI Tutoring System:</span>
                <span className="font-semibold text-cyan-400">Gemini 3.5 Flash</span>
              </div>
            </div>

            <button
              id="cta-admin-sync"
              onClick={onEnterAdmin}
              className="w-full py-2.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-[11px] font-bold text-slate-200 tracking-wider uppercase transition cursor-pointer"
            >
              Configure Custom Spreadsheet
            </button>
          </div>
        </div>
      </div>

      {/* Domain Cards */}
      <div id="domains-overview" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Three Pillars of IC3 GS6</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">Every core module and syllabus question group complies with standard Global Standard 6 specifications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Domain 1 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-350 transition flex flex-col justify-between space-y-4 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Computing Fundamentals</h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                Hardware devices, operating virtual memory, local filing, CPU registers, clock speeds, and basic cloud mechanics.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition flex items-center gap-1 cursor-pointer" onClick={onStartLearning}>
              View computing lessons &rarr;
            </div>
          </div>

          {/* Domain 2 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-350 transition flex flex-col justify-between space-y-4 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">Key Applications</h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                Word processing formats, spreadsheet cell formulas, absolute range reference locking ($A$1), and interactive database items.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition flex items-center gap-1 cursor-pointer" onClick={onStartLearning}>
              View applications lessons &rarr;
            </div>
          </div>

          {/* Domain 3 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-350 transition flex flex-col justify-between space-y-4 shadow-sm group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">Living Online</h3>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                Cybersecurity, phishing identifying, scam mitigations, multi-factor credential layers (MFA), and digital footprints.
              </p>
            </div>
            <div className="pt-2 text-xs font-semibold text-cyan-600 group-hover:translate-x-1 transition flex items-center gap-1 cursor-pointer" onClick={onStartLearning}>
              View online safety lessons &rarr;
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlighting Grid */}
      <div id="features-grid" className="p-8 sm:p-10 rounded-2xl bg-indigo-50/40 border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
        <div className="space-y-1">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Google Sheets CMS</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Simply load, cache, and sync custom exams using basic public share links.</p>
        </div>

        <div className="space-y-1">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
            <PlayCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">10 Interact formats</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Enjoy detailed setups representing matching, ordering, hot-spotting, etc.</p>
        </div>

        <div className="space-y-1">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">AI Tutor Feedback</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Proxy requests server-side to Gemini for deep mentoring explanation notes.</p>
        </div>

        <div className="space-y-1">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-violet-600" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Gamified Progression</h4>
          <p className="text-xs text-slate-500 leading-relaxed">Earn leveling points (XP), keep daily active streaks, and lock badges!</p>
        </div>
      </div>
    </div>
  );
};
