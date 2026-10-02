import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Menu, 
  X, 
  Home, 
  LayoutDashboard, 
  Banknote, 
  LogOut, 
  Database, 
  Smartphone,
  ChevronDown,
  UserCheck,
  ShieldAlert,
  Ruler,
  Palette
} from 'lucide-react';
import { FirebaseConnectionConfig } from '../types/bus';
import { AdminUser } from '../services/authService';
import { themeManager, HomepageTheme } from '../services/themeManager';

interface LalSobujHeaderProps {
  connectionConfig: FirebaseConnectionConfig;
  currentView: 'home' | 'dashboard';
  adminUser: AdminUser | null;
  onNavigate: (view: 'home' | 'dashboard') => void;
  onOpenHDeposit: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenSimulator: () => void;
  onOpenChalanConfig?: () => void;
  onOpenThemeManager?: () => void;
  onLogout: () => void;
}

export const LalSobujHeader: React.FC<LalSobujHeaderProps> = ({
  connectionConfig,
  currentView,
  adminUser,
  onNavigate,
  onOpenHDeposit,
  onOpenFirebaseConfig,
  onOpenSimulator,
  onOpenChalanConfig,
  onOpenThemeManager,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<HomepageTheme>(() => themeManager.getActiveTheme());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = themeManager.subscribe(() => {
      setActiveTheme(themeManager.getActiveTheme());
    });
    return () => unsub();
  }, []);

  // Live time updater matching "Tue, Sep 29, 2026, 4:42 PM"
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as "Tue, Sep 29, 2026, 4:42 PM"
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = now.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = now.getDate();
      const year = now.getFullYear();
      const timePart = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setTimeStr(`${dayName}, ${monthName} ${dayNum}, ${year}, ${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header 
      className="no-print navbar navigation-bar text-white shadow-md select-none sticky top-0 z-40 transition-colors duration-300"
      style={{ backgroundColor: activeTheme.primaryColor }}
    >
      <div className="w-full px-3 sm:px-4 py-2 flex items-center justify-between">
        
        {/* Left: Brand Title */}
        <div 
          onClick={() => {
            onNavigate('home');
            setIsMenuOpen(false);
          }}
          className="cursor-pointer flex items-center gap-2"
        >
          <span className="font-bold text-sm sm:text-base tracking-tight text-white hover:text-purple-100 transition-colors">
            Lal Sobuj Paribahan
          </span>
          {connectionConfig.isConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 hidden md:inline-block animate-pulse" title="Firebase RTDB Connected" />
          )}
        </div>

        {/* Right Info & Hamburger Menu */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          
          {/* Quick Theme Studio Launcher */}
          {onOpenThemeManager && (
            <button
              type="button"
              onClick={onOpenThemeManager}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all cursor-pointer border border-white/20 shadow-2xs"
              title="Theme & Template Studio (12 Homepage Themes & 36 Chalan Templates)"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Theme Studio</span>
            </button>
          )}

          {/* Live Clock */}
          <span className="hidden lg:inline-block text-purple-100/90 font-medium text-[11px] sm:text-xs">
            {timeStr || 'Tue, Sep 29, 2026, 4:45 PM'}
          </span>

          {/* Notification Bell */}
          <button 
            onClick={onOpenSimulator}
            className="text-white hover:text-purple-200 transition-colors p-1 relative cursor-pointer"
            title="Notifications & Mobile Simulator"
          >
            <Bell className="w-4 h-4 fill-white" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          </button>

          {/* Language selector */}
          <span className="hidden sm:inline-block text-white font-medium text-[11px] sm:text-xs px-1">
            English
          </span>

          {/* Currency */}
          <span className="hidden sm:inline-block text-white font-medium text-[11px] sm:text-xs px-1">
            BDT
          </span>

          {/* Counter Location */}
          <span className="hidden md:inline-block text-purple-100 text-[11px] sm:text-xs font-semibold px-1">
            North
          </span>

          {/* Operator & Admin Role */}
          {adminUser ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-bold text-white truncate max-w-[120px]">
                {adminUser.displayName}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black uppercase bg-purple-950 text-amber-300 border border-purple-700">
                {adminUser.role === 'Super Admin' ? 'Admin' : 'Staff'}
              </span>
            </div>
          ) : (
            <span className="hidden sm:inline-block text-purple-100 text-[11px] sm:text-xs font-semibold px-1">
              Mirpur-10
            </span>
          )}

          {/* Hamburger Menu Button (Three Horizontal Lines - Reference Image 1 & 3) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
              title="Toggle Menu"
              aria-label="Navigation Menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 stroke-[2.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2.5]" />
              )}
            </button>

            {/* Hamburger Dropdown Menu (Exact Match to Image 3) */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 sm:w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                
                {/* Admin Profile Overview */}
                {adminUser && (
                  <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {adminUser.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden leading-tight">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {adminUser.displayName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-mono">
                          {adminUser.email}
                        </p>
                        <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200">
                          {adminUser.role} • {adminUser.branchOrCounter}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 🏠 Home */}
                <button
                  onClick={() => {
                    onNavigate('home');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    currentView === 'home' ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <Home className="w-4 h-4 text-slate-700" />
                  <span>Home</span>
                </button>

                {/* 🎛️ Dashboard */}
                <button
                  onClick={() => {
                    onNavigate('dashboard');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${
                    currentView === 'dashboard' ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-700" />
                  <span>Dashboard</span>
                </button>

                {/* 💵 H Deposit */}
                <button
                  onClick={() => {
                    onOpenHDeposit();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center gap-3 hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer"
                >
                  <Banknote className="w-4 h-4 text-slate-700" />
                  <span>H Deposit</span>
                </button>

                {/* 📏 Chalan Print Settings */}
                <button
                  onClick={() => {
                    if (onOpenChalanConfig) onOpenChalanConfig();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center gap-3 hover:bg-blue-50 text-slate-800 hover:text-blue-800 transition-colors cursor-pointer"
                  title="Configure custom height & half-inch increments for chalan sheet"
                >
                  <Ruler className="w-4 h-4 text-blue-600" />
                  <span>Chalan Dimensions</span>
                </button>

                {/* 🎨 Theme & Template Studio */}
                <button
                  onClick={() => {
                    if (onOpenThemeManager) onOpenThemeManager();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center gap-3 hover:bg-purple-50 text-slate-800 hover:text-purple-900 transition-colors cursor-pointer"
                  title="Choose from 12 homepage themes and 36 chalan templates"
                >
                  <Palette className="w-4 h-4 text-purple-600" />
                  <div className="flex items-center justify-between flex-1">
                    <span>Theme & Template Studio</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono font-bold">12+36</span>
                  </div>
                </button>

                {/* 🚪 Logout */}
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center gap-3 hover:bg-red-50 text-slate-800 hover:text-red-700 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                >
                  <LogOut className="w-4 h-4 text-slate-700" />
                  <span>Logout</span>
                </button>

                {/* Extra Utility Links */}
                <div className="pt-1.5 mt-1 border-t border-slate-100 px-3 text-[10px] text-slate-400 flex items-center justify-between">
                  <button 
                    onClick={() => {
                      onOpenFirebaseConfig();
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-purple-700 font-mono underline"
                  >
                    RTDB Settings
                  </button>
                  <button 
                    onClick={() => {
                      onOpenSimulator();
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-purple-700 font-mono underline"
                  >
                    Mobile Simulator
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
