import React from 'react';
import { GraduationCap, ShieldCheck, ArrowRight, Layers, Award, Sparkles, BookOpen } from 'lucide-react';

interface RoleSelectionViewProps {
  onSelectRole: (role: 'student' | 'admin') => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelectRole }) => {
  return (
    <div id="role-selection-screen" className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Dynamic radial gradient color blobs for aesthetic depth */}
      <div className="absolute top-1/10 left-1/10 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/10 right-1/10 w-[420px] h-[420px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl w-full text-center space-y-10 relative z-10 py-6">
        
        {/* Header Title Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to IC3 Masters Platform
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Select Your Workspace Role
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Choose your administrative or test preparation clearance level as defined by the standard Global Standard 6 specifications.
          </p>
        </div>

        {/* Roles Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
          
          {/* Card 1: Student Access */}
          <button
            id="role-box-student"
            type="button"
            onClick={() => onSelectRole('student')}
            className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl dark:hover:shadow-indigo-950/20 active:scale-[0.99] transition duration-300 flex flex-col justify-between text-left relative overflow-hidden"
          >
            {/* Hover light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-6">
              {/* Box Header Icon */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition duration-300">
                <GraduationCap className="w-7 h-7" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  Student Portal
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Launch interactive practice modules, take official mock exam simulations with realistic timers, view daily study lessons, and track rankings in the comparative Hall of Fame.
                </p>
              </div>

              {/* Bullet Features (Limited functions) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Clearance Privileges:</p>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Solve Practice & Mock Quizzes</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Interactive Lessons & Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-400 dark:text-slate-500">No Custom CMS Synchronization</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Arrow */}
            <div className="pt-6 sm:pt-8 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Access Student Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
            </div>
          </button>

          {/* Card 2: Administrative Control */}
          <button
            id="role-box-admin"
            type="button"
            onClick={() => onSelectRole('admin')}
            className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl dark:hover:shadow-emerald-950/20 active:scale-[0.99] transition duration-300 flex flex-col justify-between text-left relative overflow-hidden"
          >
            {/* Hover light effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-6">
              {/* Box Header Icon */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition duration-300">
                <ShieldCheck className="w-7 h-7" />
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                  System Admin Portal
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Connect dynamic custom Google Sheets for seamless quest synchronizations, view advanced telemetry analytics dashboards, manage classroom directories, and audit exams.
                </p>
              </div>

              {/* Bullet Features (Admin clearance options) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Privileges:</p>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Manage sheets syncing and databases</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Examine student history reports</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Modify live syllabus & delete records</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Arrow */}
            <div className="pt-6 sm:pt-8 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Sign In with SECURE LOCK</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
            </div>
          </button>

        </div>

        {/* Footer legalities secure */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-normal pt-4 border-t border-slate-250 dark:border-slate-800/60 max-w-lg mx-auto">
          ⚖️ Role selections coordinate specific browser session privileges. Administrators are monitored under active security token protocols.
        </div>

      </div>
    </div>
  );
};
