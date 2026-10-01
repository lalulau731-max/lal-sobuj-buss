import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Bus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Server,
  Zap,
  Globe2,
  Clock,
  KeyRound,
  ChevronRight
} from 'lucide-react';
import { authService, DEMO_ADMIN_ACCOUNTS, AdminUser } from '../services/authService';

interface AdminLoginProps {
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('admin@lalsobuj.com');
  const [password, setPassword] = useState<string>('Admin@2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // New admin registration form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<AdminUser['role']>('Terminal Controller');

  // Handle Demo Account Quick Fill
  const handleSelectDemo = (demo: typeof DEMO_ADMIN_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword(demo.passwordHint);
    setErrorMessage('');
    setSuccessMessage(`Loaded ${demo.role} credentials for ${demo.branch}.`);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Submit Handler for Sign-In
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success && result.admin) {
        setSuccessMessage(`Authenticated successfully! Welcome back, ${result.admin.displayName}.`);
        setTimeout(() => {
          onLoginSuccess(result.admin!);
        }, 600);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler for Registration
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regEmail || !regPassword || !regName) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register(regEmail, regPassword, regName, regRole);
      if (result.success && result.admin) {
        setSuccessMessage(`Account created for ${result.admin.displayName}! Launching portal...`);
        setTimeout(() => {
          onLoginSuccess(result.admin!);
        }, 800);
      } else {
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Background Graphic Accents with Deep Blue Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

        {/* High-tech Blueprint Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 py-4 border-b border-blue-900/40 bg-slate-950/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-900/40 border border-blue-400/40">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-tight">
                Lal Sabuj Paribahan
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                Official Portal
              </span>
            </div>
            <p className="text-xs text-blue-300 font-medium">
              Bus Seat Matrix & Passenger Chalan Administration
            </p>
          </div>
        </div>

        {/* Live Network & Security Badges */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Firebase RTDB Live</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Content Area: Split 2-Column High Contrast Layout */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Branding, Mission & System Architecture Showcase */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950 border border-blue-700/60 text-blue-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Version 3.8.2 Enterprise Fleet Release</span>
            </div>

            {/* Bold Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-blue-200">Admin Control</span> & Manifest Dispatch
              </h1>
              <p className="text-sm sm:text-base text-blue-200/80 leading-relaxed max-w-xl">
                Secure, unified access for Lal Sabuj Paribahan station masters, fleet managers, and counter operators. Synchronizes live seat reservations, due payments, and chalan sheets in real time.
              </p>
            </div>

            {/* Feature Cards Grid (High Contrast Blue Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 hover:border-blue-500/60 transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-900/80 text-blue-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Live Seat Matrix</h3>
                </div>
                <p className="text-xs text-blue-300/80 leading-normal">
                  Real-time color-coded seats: Available (White), Locked (Black), Sold (Red), and Reserved (Yellow).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 hover:border-blue-500/60 transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-900/80 text-blue-300">
                    <Server className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Firebase Auth Sync</h3>
                </div>
                <p className="text-xs text-blue-300/80 leading-normal">
                  Persistent local session token keep-alive so your administrative terminal remains signed in.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 hover:border-blue-500/60 transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-900/80 text-blue-300">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Multi-Route Dispatch</h3>
                </div>
                <p className="text-xs text-blue-300/80 leading-normal">
                  Covering Dhaka, Sonapur, Chittagong, Maijdee, and Ramganj routes with single & double-deck layouts.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 hover:border-blue-500/60 transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-900/80 text-blue-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-white">Chalan Manifest</h3>
                </div>
                <p className="text-xs text-blue-300/80 leading-normal">
                  Automated A4 half-page trip sheets, aggregate group due calculations, and supervisor printouts.
                </p>
              </div>
            </div>

            {/* Quick Demo Credentials Panel */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/90 to-slate-900/90 border border-blue-800/80 shadow-xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>One-Click Demo Admin Accounts</span>
                </span>
                <span className="text-[11px] text-blue-300">Click to auto-fill</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_ADMIN_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="p-2.5 text-left rounded-xl bg-blue-900/30 hover:bg-blue-800/50 border border-blue-700/50 hover:border-blue-400 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-white group-hover:text-blue-200 truncate">
                      {demo.role}
                    </div>
                    <div className="text-[11px] text-blue-300 truncate font-mono">
                      {demo.email}
                    </div>
                    <div className="text-[10px] text-blue-400/80 truncate mt-0.5">
                      {demo.branch}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: High-Contrast Executive Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl shadow-blue-950/50 border-2 border-blue-600/30 overflow-hidden relative">
              
              {/* Top Accent Strip */}
              <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600" />

              <div className="p-6 sm:p-8">
                
                {/* Card Title & Icon */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Admin Sign In
                    </h2>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Authenticate with your Lal Sabuj staff credentials
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                {/* Tabs: Sign In vs Create Admin */}
                <div className="flex border-b border-slate-200 mt-4 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signin');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold tracking-wide uppercase transition-colors cursor-pointer border-b-2 ${
                      activeTab === 'signin'
                        ? 'border-blue-700 text-blue-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Staff Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage('');
                    }}
                    className={`flex-1 py-2 text-xs font-extrabold tracking-wide uppercase transition-colors cursor-pointer border-b-2 ${
                      activeTab === 'register'
                        ? 'border-blue-700 text-blue-800'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register New Staff
                  </button>
                </div>

                {/* Feedback Alerts */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{successMessage}</span>
                  </div>
                )}

                {activeTab === 'signin' ? (
                  /* ================= STAFF SIGN IN FORM ================= */
                  <form onSubmit={handleSubmitLogin} className="space-y-4">
                    
                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Admin Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. admin@lalsobuj.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 text-sm font-semibold transition-all placeholder:text-slate-400 bg-white"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                          Password
                        </label>
                        <span className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer">
                          Demo: Admin@2026!
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 text-sm font-semibold transition-all placeholder:text-slate-400 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Session & Security Badge */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-bold">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                        />
                        <span>Keep me logged in</span>
                      </label>
                      <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                        Persistent Session Active
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:via-blue-700 hover:to-indigo-800 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-700/30 hover:shadow-blue-700/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Admin Console</span>
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* ================= REGISTER NEW ADMIN FORM ================= */
                  <form onSubmit={handleSubmitRegister} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Full Name / Operator Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Md. Tariqul Islam"
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Staff Official Email
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. tariqul@lalsobuj.com"
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Password (Min. 6 chars)
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Assigned Administrative Role
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as AdminUser['role'])}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                      >
                        <option value="Terminal Controller">Terminal Controller (Counter Access)</option>
                        <option value="Operations Manager">Operations Manager (Fleet & Scheduling)</option>
                        <option value="Super Admin">Super Admin (Full System & Revenue Access)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-3"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Staff Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Admin Account</span>
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer Notice */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Protected by Google Firebase Authentication</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Authorized personnel only. All access attempts are recorded.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-blue-900/30 bg-slate-950/80 text-xs text-blue-300/70 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Lal Sabuj Paribahan. All rights reserved. Bus Ticketing & Reservation System.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Security Protocol v12</span>
          <span>•</span>
          <span>Session Auto-Persist: Enabled</span>
          <span>•</span>
          <span className="text-blue-400 font-semibold">HQ: 28/A Mirpur Road, Dhaka</span>
        </div>
      </footer>

    </div>
  );
};
