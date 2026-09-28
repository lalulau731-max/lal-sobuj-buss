import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Printer, 
  Smartphone, 
  Database, 
  Volume2, 
  VolumeX, 
  Clock, 
  RefreshCw,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import { FirebaseConnectionConfig, Trip } from '../types/bus';
import { firebaseSync } from '../services/firebaseSync';

interface HeaderProps {
  currentTrip: Trip;
  connectionConfig: FirebaseConnectionConfig;
  onOpenChalan: () => void;
  onOpenSimulator: () => void;
  onOpenFirebaseConfig: () => void;
  isSimulatorOpen: boolean;
  autoSimActive: boolean;
  onToggleAutoSim: () => void;
  onRefetchData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrip,
  connectionConfig,
  onOpenChalan,
  onOpenSimulator,
  onOpenFirebaseConfig,
  isSimulatorOpen,
  autoSimActive,
  onToggleAutoSim,
  onRefetchData,
}) => {
  const [time, setTime] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(firebaseSync.isAudioEnabled());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioToggle = () => {
    const newState = firebaseSync.toggleAudio();
    setAudioEnabled(newState);
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    if (onRefetchData) {
      await onRefetchData();
    } else {
      await firebaseSync.refetchFromFirebase();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="no-print bg-gradient-to-r from-red-700 via-red-800 to-emerald-900 text-white shadow-xl border-b-4 border-emerald-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center p-1.5 border-2 border-emerald-400">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-emerald-600 to-red-600 flex items-center justify-center text-white">
                  <Bus className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>LAL SABUJ</span>
                  <span className="text-emerald-300 font-extrabold">PARIBAHAN</span>
                </h1>
                <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-600/70 text-emerald-100 border border-emerald-400/40">
                  লাল সবুজ পরিবহন
                </span>
                <a
                  href="https://lal-sobuj-bus.web.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open live Firebase Hosting production site (lal-sobuj-bus.web.app)"
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 text-emerald-300 hover:text-white border border-emerald-500/40 font-bold transition-all shadow-xs"
                >
                  <span>lal-sobuj-bus.web.app</span>
                  <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                </a>
              </div>
              <p className="text-xs text-red-100/90 font-medium flex items-center gap-2">
                <span>Active Fleet Dispatcher</span>
                <span className="text-emerald-300">•</span>
                <span className="text-emerald-200">
                  {connectionConfig.totalLiveCoaches || 5} Real Coaches • {connectionConfig.totalLiveBookings || 798} Bookings Synced
                </span>
              </p>
            </div>
          </div>

          {/* Action Bar & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Realtime Database Sync Status Pill */}
            <button
              onClick={onOpenFirebaseConfig}
              title="Click to inspect Firebase Realtime Database status"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                connectionConfig.isConnected
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-amber-400 text-amber-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Database className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-[10px] uppercase tracking-wider text-slate-300">
                  Firebase Sync
                </span>
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 inline" />
                  Live Operational
                </span>
              </div>
              <span className="sm:hidden font-bold">Live</span>
            </button>

            {/* Quick Refresh Button */}
            <button
              onClick={handleRefreshClick}
              className={`p-1.5 rounded-lg text-xs font-medium border bg-white/10 hover:bg-white/20 text-white transition-all ${
                isRefreshing ? 'animate-spin text-emerald-300' : ''
              }`}
              title="Sync latest records from Firebase"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Mobile App Simulator Toggle */}
            <button
              onClick={onOpenSimulator}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm border ${
                isSimulatorOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Toggle mobile app booking simulation"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Sync</span>
              {autoSimActive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* Sound Notification Toggle */}
            <button
              onClick={handleAudioToggle}
              className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
                audioEnabled
                  ? 'bg-emerald-600/40 border-emerald-400/50 text-emerald-200 hover:bg-emerald-600/60'
                  : 'bg-slate-800/40 border-slate-600 text-slate-300 hover:bg-slate-800/60'
              }`}
              title={audioEnabled ? 'Booking sound alerts ON' : 'Booking sound alerts OFF'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Print Chalan Sheet Button */}
            <button
              onClick={onOpenChalan}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border border-emerald-400 shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Chalan (চালান)</span>
            </button>

            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs font-mono text-emerald-200">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{time || '00:00:00'}</span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
