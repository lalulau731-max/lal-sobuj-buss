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
  KeyRound,
  Check,
  User,
  BadgeCheck
} from 'lucide-react';
import { authService, DEMO_ADMIN_ACCOUNTS, AdminUser } from '../services/authService';

// Direct import of generated assets
import lalSobujBusImg from '../assets/images/lal_sobuj_bus_1790950083304.jpg';
import lalSobujLogoImg from '../assets/images/lal_sobuj_logo_1790950102649.jpg';

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
    setSuccessMessage(`${demo.name} (${demo.role}) ক্রেডেনশিয়াল পূরণ করা হয়েছে।`);
    setTimeout(() => setSuccessMessage(''), 3000);
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
        setSuccessMessage(`সফলভাবে লগইন হয়েছে! স্বাগতম, ${result.admin.displayName}।`);
        setTimeout(() => {
          onLoginSuccess(result.admin!);
        }, 500);
      } else {
        setErrorMessage(result.error || 'লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে। আবার চেষ্টা করুন।');
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
      setErrorMessage('অনুগ্রহ করে সমস্ত প্রয়োজনীয় তথ্য পূরণ করুন।');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register(regEmail, regPassword, regName, regRole);
      if (result.success && result.admin) {
        setSuccessMessage(`নতুন অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে (${result.admin.displayName})!`);
        setTimeout(() => {
          onLoginSuccess(result.admin!);
        }, 600);
      } else {
        setErrorMessage(result.error || 'অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'নিবন্ধনে ত্রুটি হয়েছে।');
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
            alt="লাল সবুজ পরিবহন লোগো" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              // Fallback to public route if needed
              (e.currentTarget as HTMLImageElement).src = '/lal_sobuj_logo.jpg';
            }}
          />
          <div className="hidden sm:block border-l border-slate-300 pl-3">
            <h1 className="text-sm font-black text-slate-900 leading-tight">
              লাল সবুজ পরিবহন
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              সেন্ট্রাল বাস ট্র্যাকিং ও অ্যাডমিন পোর্টাল
            </p>
          </div>
        </div>

        {/* Live System Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline font-mono">Firebase Online</span>
            <span>লাইভ সিস্টেম</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>নিরাপদ সেশন সক্রিয়</span>
          </div>
        </div>
      </header>

      {/* Main Centered Login Section with White Background */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
          
          {/* Left Column: Realistic Bus Showcase & Bengali Identity */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 sm:p-7 flex flex-col justify-between">
            
            {/* Top Brand Banner */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                  অফিসিয়াল অ্যাডমিন
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ২০২৬ সংস্করণ
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                <span className="text-[#dc2626]">লাল </span>
                <span className="text-[#16a34a]">সবুজ </span>
                <span className="text-black">পরিবহন</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                আন্তর্জাতিক মানের অত্যাধুনিক আরামদায়ক কোচ নেটওয়ার্ক ও অনলাইন টিকিট সংরক্ষণ ব্যবস্থাপনা।
              </p>
            </div>

            {/* Realistic Bus Photo Container */}
            <div className="my-5 relative rounded-2xl overflow-hidden shadow-md border-2 border-slate-200 group bg-slate-900">
              <img 
                src={lalSobujBusImg} 
                alt="লাল সবুজ পরিবহন রিয়েল বাস" 
                className="w-full h-48 sm:h-52 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/lal_sobuj_bus.jpg';
                }}
              />
              {/* Overlay Badge for Authentic Coach */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center justify-between text-white text-[11px]">
                <div className="flex items-center gap-1.5 font-bold">
                  <Bus className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-black">ঢাকা মেট্রো-ব ১১-৪৩০১</span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">Scania Multi-Axle</span>
              </div>
            </div>

            {/* Operational Highlights */}
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>রিয়েল-টাইম আসন বুকিং ও পেমেন্ট হিসেব</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>স্বয়ংক্রিয় হাফ-পেজ এ৪ চালান ও যাত্রী তালিকা</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                <span>পারসিস্টেন্ট ফায়ারবেস লগইন সেশন</span>
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
                অ্যাডমিন প্যানেলে লগইন করুন
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Lal Sabuj Paribahan Secure Staff Portal
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                স্টাফ সাইন-ইন
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                নতুন অ্যাডমিন নিবন্ধন
              </button>
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

            {activeTab === 'signin' ? (
              /* ================= SIGN IN FORM ================= */
              <form onSubmit={handleSubmitLogin} className="space-y-4">
                
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    অ্যাডমিন ইমেইল (Email Address)
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
                      placeholder="admin@lalsobuj.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-3 focus:ring-red-100 text-slate-900 text-sm font-semibold transition-all bg-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      পাসওয়ার্ড (Password)
                    </label>
                    <span className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer">
                      ডেমো: Admin@2026!
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
                    <span>লগইন সেশন মনে রাখুন (Persistent Session)</span>
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
                      <span>যাচাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>লগইন করুন (Sign In)</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ================= REGISTRATION FORM ================= */
              <form onSubmit={handleSubmitRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    অপারেটর বা কর্মকর্তার নাম (Full Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-3 focus:ring-red-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    অফিসিয়াল ইমেইল (Email)
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="rafiq@lalsobuj.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-3 focus:ring-red-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    পাসওয়ার্ড (Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-3 focus:ring-red-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    অ্যাডমিন পদবী (Role)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as AdminUser['role'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-3 focus:ring-red-100 text-slate-900 text-sm font-semibold transition-all bg-white"
                  >
                    <option value="Terminal Controller">টার্মিনাল কন্ট্রোলার (Counter & Seat Matrix)</option>
                    <option value="Operations Manager">অপারেশনস ম্যানেজার (Fleet & Schedules)</option>
                    <option value="Super Admin">সুপার অ্যাডমিন (Full Access & Accounts)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-3"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>অ্যাকাউন্ট তৈরি করুন (Create Account)</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Access Bar */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-bold">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                  <span>দ্রুত ডেমো অ্যাকাউন্টে লগইন:</span>
                </span>
                <span className="text-[11px] text-slate-400">১-ক্লিক পূরণ</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {DEMO_ADMIN_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all text-left cursor-pointer group"
                    title={`Click to fill ${demo.email}`}
                  >
                    <div className="text-[11px] font-black text-slate-800 group-hover:text-red-700 truncate">
                      {demo.role}
                    </div>
                    <div className="text-[9.5px] text-slate-500 truncate font-mono">
                      {demo.branch.split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Clean Bottom Footer */}
      <footer className="w-full bg-white border-t border-slate-200 px-4 sm:px-8 py-3 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1">
        <p>© 2026 লাল সবুজ পরিবহন (Lal Sabuj Paribahan). সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="font-semibold text-slate-600">গুগল ফায়ারবেস অথেনটিকেশন দ্বারা সুরক্ষিত</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">সেশন পারসিস্টেন্স সক্রিয়</span>
        </div>
      </footer>

    </div>
  );
};
