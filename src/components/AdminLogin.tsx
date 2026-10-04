import React, { useState } from 'react';
import { 
  Bus, 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import lalSobujLogoImg from '../assets/images/lal_sobuj_logo_1790950102649.jpg';
import lalSobujBusImg from '../assets/images/lal_sobuj_bus_1790950083304.jpg';

interface AdminLoginProps {
  onLoginSuccess: (admin: AdminUser) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('eqtiarwifi@gmail.com');
  const [password, setPassword] = useState<string>('lal123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success && result.admin) {
        setSuccessMessage(`Login successful! Welcome, ${result.admin.displayName}.`);
        setTimeout(() => {
          onLoginSuccess(result.admin!);
        }, 500);
      } else {
        setErrorMessage(result.error || 'Login failed. Please enter a valid email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between selection:bg-red-600 selection:text-white font-sans">
      
      {/* Clean Minimal Top Navigation Bar */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <img 
            src={lalSobujLogoImg} 
            alt="Lal Sabuj Paribahan Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/lal_sobuj_logo.jpg';
            }}
          />
          <div className="hidden sm:block border-l border-slate-300 pl-3">
            <h1 className="text-sm font-black text-slate-900 leading-tight">
              Lal Sabuj Paribahan
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              Central Fleet Tracking & Admin Portal
            </p>
          </div>
        </div>

        {/* Live System Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline font-mono">Firebase Online</span>
            <span>Live System</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Secure Session Active</span>
          </div>
        </div>
      </header>

      {/* Main Centered Login Section with White Background */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
          
          {/* Left Column: Realistic Bus Showcase & Identity */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 sm:p-7 flex flex-col justify-between">
            
            {/* Top Brand Banner */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  Official Admin
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  2026 Edition
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                <span className="text-[#dc2626]">Lal </span>
                <span className="text-[#16a34a]">Sabuj </span>
                <span className="text-black">Paribahan</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                Modern inter-district luxury coach network and real-time cloud ticketing management.
              </p>
            </div>

            {/* Realistic Bus Photo Container */}
            <div className="my-5 relative rounded-2xl overflow-hidden shadow-md border-2 border-slate-200 group bg-slate-900">
              <img 
                src={lalSobujBusImg} 
                alt="Lal Sabuj Paribahan Coach" 
                className="w-full h-48 sm:h-52 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/lal_sobuj_bus.jpg';
                }}
              />
              {/* Overlay Badge for Authentic Coach */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center justify-between text-white text-[11px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <Bus className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-black font-mono">DHAKA METRO-BA 11-4301</span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">Scania Multi-Axle</span>
              </div>
            </div>

            {/* Operational Highlights */}
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Real-time seat booking, lock & due payment tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Automated half-page A4 trip chalan manifest</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>Persistent Firebase authentication session</span>
              </div>
            </div>

          </div>

          {/* Right Column: Centered Modern Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 sm:py-9 flex flex-col justify-center bg-white">
            
            {/* Form Header with Official Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex justify-center items-center mb-2">
                <img 
                  src={lalSobujLogoImg} 
                  alt="Lal Sabuj Logo" 
                  className="h-16 w-auto object-contain mx-auto"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/lal_sobuj_logo.jpg';
                  }}
                />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Admin Portal Sign-In
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Lal Sabuj Paribahan Secure Staff Portal
              </p>
            </div>

            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMessage}</span>
              </div>
            )}

            {/* ================= SIGN IN FORM ================= */}
            <form onSubmit={handleSubmitLogin} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
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
                    placeholder="Enter admin email address"
                    autoComplete="username"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-3 focus:ring-red-100 text-slate-900 text-sm font-semibold transition-all bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Password
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Encrypted & Secure
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
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-3 focus:ring-red-100 text-slate-900 text-sm font-semibold transition-all bg-white placeholder:text-slate-400"
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

              {/* Persistent Session & Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer accent-red-600"
                  />
                  <span>Keep me logged in (Persistent Session)</span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating with Firebase...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Firebase</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Firebase Database & Authentication Verification Status */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-slate-800 block text-xs">
                      Firebase Authentication & Database
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium">
                      Credentials authenticated directly against Cloud Firestore & Firebase Auth
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold shrink-0">
                  Firebase Verified
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Clean Bottom Footer */}
      <footer className="w-full bg-white border-t border-slate-200 px-4 sm:px-8 py-3.5 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1">
        <p className="font-bold text-slate-700 tracking-wide">
          Lal Sabuj Paribahan V7 - Powered by Lal Sabuj - Designed by Tuhin.
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="font-semibold text-slate-600">Secured by Google Firebase Authentication</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">Cloud Persistence Active</span>
        </div>
      </footer>

    </div>
  );
};
