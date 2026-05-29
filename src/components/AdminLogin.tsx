import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onBackToStudent: () => void;
  onLoginSuccess: (user: { email: string }) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStudent, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.token) {
          localStorage.setItem('ic3_admin_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      setErrorMessage('Network connection failure. Please confirm the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-login-viewport" className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden select-none bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Dynamic blurred radial background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-3xl pointer-events-none"></div>

      {/* Main Back Button to Student Area */}
      <button
        id="btn-back-to-student"
        onClick={onBackToStudent}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-sm cursor-pointer transition select-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Student Portal</span>
      </button>

      {/* Glassmorphic Login Card */}
      <div 
        id="admin-login-card" 
        className="w-full max-w-md p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/40 backdrop-blur-xl shadow-2xl space-y-6 sm:space-y-8 relative z-10 transition-transform duration-300"
      >
        <div className="text-center space-y-2">
          {/* Platform brand logo */}
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/25 relative overflow-hidden group">
            <ShieldCheck className="w-7 h-7 text-white" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Administrative Access
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Sign in with secured credentials to manage syllabus databases and students statistics.
          </p>
        </div>

        {/* Error Alert Panel */}
        {errorMessage && (
          <div 
            id="login-error-alert" 
            className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/10 text-rose-800 dark:text-rose-400 animate-fadeIn text-xs text-left"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-normal">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                id="login-input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenhoanthao612@gmail.com"
                required
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/30 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 transition"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Security Password
              </label>
            </div>
            <div className="relative">
              <input
                id="login-input-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                required
                className="w-full pl-4 pr-11 py-3 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/30 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 transition"
              />
              <button
                id="login-password-visibility-btn"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition p-1 rounded cursor-pointer"
                title="Toggle password view"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Login button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer active:translate-y-px transition shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 disabled:opacity-75 disabled:cursor-not-allowed select-none mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In Securely</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info lock */}
        <div className="pt-2 text-center text-[10px] text-slate-450 dark:text-slate-500 leading-normal border-t border-slate-100 dark:border-slate-800/60">
          🔒 TLS Encryption Active • Administrative Role Strictly Logged
        </div>
      </div>
    </div>
  );
};
