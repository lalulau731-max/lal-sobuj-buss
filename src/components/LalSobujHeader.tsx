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
  ChevronDown
} from 'lucide-react';
import { FirebaseConnectionConfig } from '../types/bus';

interface LalSobujHeaderProps {
  connectionConfig: FirebaseConnectionConfig;
  currentView: 'home' | 'dashboard';
  onNavigate: (view: 'home' | 'dashboard') => void;
  onOpenHDeposit: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenSimulator: () => void;
  onLogout: () => void;
}

export const LalSobujHeader: React.FC<LalSobujHeaderProps> = ({
  connectionConfig,
  currentView,
  onNavigate,
  onOpenHDeposit,
  onOpenFirebaseConfig,
  onOpenSimulator,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="no-print navbar navigation-bar bg-[#661d7a] text-white shadow-md select-none sticky top-0 z-40">
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

          {/* Operator Name */}
          <span className="hidden sm:inline-block text-purple-100 text-[11px] sm:text-xs font-semibold px-1">
            Mirpur-10
          </span>

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
              <div className="absolute right-0 top-full mt-1.5 w-52 sm:w-56 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                
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
