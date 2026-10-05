import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Calendar, 
  Ruler, 
  Bus, 
  DollarSign, 
  Sliders, 
  Plus, 
  Trash2, 
  Check, 
  RotateCcw, 
  Download, 
  RefreshCw, 
  Database, 
  User, 
  AlertTriangle,
  Scissors,
  FileText,
  MapPin,
  Clock,
  Phone,
  Settings
} from 'lucide-react';
import { Trip, CoachRecord } from '../types/bus';
import { appSettingsService, AppSettings } from '../services/appSettings';
import { 
  chalanConfigService, 
  ChalanPrintConfig, 
  EXACT_HALF_A4_HEIGHT_INCHES, 
  STANDARD_A4_HEIGHT_INCHES 
} from '../services/chalanConfig';
import { authService, AdminUser, DEMO_ADMIN_ACCOUNTS } from '../services/authService';
import { firebaseSync } from '../services/firebaseSync';
import { formatDateDMY, formatDateDMYWithDay } from '../utils/dateUtils';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  onOpenCreateTrip: () => void;
  onOpenChalanPreview?: () => void;
  onRefreshData: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  trips,
  onOpenCreateTrip,
  onOpenChalanPreview,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'chalan' | 'fleet' | 'fares' | 'system'>('display');
  const [appSettings, setAppSettings] = useState<AppSettings>(() => appSettingsService.getSettings());
  const [chalanConfig, setChalanConfig] = useState<ChalanPrintConfig>(() => chalanConfigService.getConfig());
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => authService.getStoredSession());
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Editing state for trip row
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editFare, setEditFare] = useState<number>(700);
  const [editTime, setEditTime] = useState<string>('09:00 AM');
  const [editSupervisorPhone, setEditSupervisorPhone] = useState<string>('');

  useEffect(() => {
    const unsubSettings = appSettingsService.subscribe((s) => setAppSettings(s));
    const unsubChalan = chalanConfigService.subscribe((c) => setChalanConfig(c));
    const unsubAuth = authService.subscribe((a) => setCurrentAdmin(a));
    return () => {
      unsubSettings();
      unsubChalan();
      unsubAuth();
    };
  }, []);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Toggle coach numbers on main page
  const handleToggleCoachNumbers = () => {
    appSettingsService.toggleCoachNumbers();
    triggerToast(
      appSettings.showCoachNumbersOnMainPage
        ? 'Coach numbers hidden from main page.'
        : 'Coach numbers enabled on main page.'
    );
  };

  // Chalan dimension step
  const handleChalanStep = (delta: number) => {
    chalanConfigService.adjustHeight(delta);
    triggerToast(`Chalan height adjusted by ${delta > 0 ? '+' : ''}${delta}"`);
  };

  // Chalan height preset
  const handleSetChalanPreset = (val: number) => {
    chalanConfigService.updateConfig({ heightInches: val });
    triggerToast(`Chalan height set to ${val}" (${Math.round(val * 25.4)} mm)`);
  };

  // Reset chalan to Half A4
  const handleResetChalan = () => {
    chalanConfigService.resetToHalfA4();
    triggerToast('Chalan dimension reset to standard Half A4 (5.85" / 148.5 mm)');
  };

  // Export full manifest & database backup as JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        terminal: 'Mirpur-10',
        appSettings,
        chalanConfig,
        tripsCount: trips.length,
        trips,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LalSobuj_Mirpur10_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('System backup exported successfully.');
    } catch (e) {
      console.error(e);
    }
  };

  // Reset all occupied seats for active trips
  const executeResetSeats = () => {
    trips.forEach((t) => {
      const resetSeats: Record<string, any> = {};
      Object.keys(t.seats || {}).forEach((seatKey) => {
        resetSeats[seatKey] = {
          ...t.seats[seatKey],
          status: 'available',
          passengerName: '',
          phone: '',
          ticketNumber: '',
          bookedVia: undefined,
        };
      });
      firebaseSync.updateSeats(t.id, resetSeats, {
        action: 'released',
        source: 'counter',
        passengerName: 'Admin Reset',
        counterOrUser: 'Admin Panel (Mirpur-10)',
      });
    });
    onRefreshData();
    setShowResetConfirm(false);
    triggerToast('All seat allocations have been reset to Available.');
  };

  const chalanHeightMm = Math.round(chalanConfig.heightInches * 25.4 * 10) / 10;
  const heightRatioPercent = Math.round((chalanConfig.heightInches / STANDARD_A4_HEIGHT_INCHES) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-3 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Comprehensive Admin Panel
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 shadow-2xs">
                  Full Control
                </span>
                <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Mirpur-10 Terminal</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized system configuration, display controls, fleet operations & chalan printer engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert Banner */}
        {saveToast && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{saveToast}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-200">SAVED TO CONFIG</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center gap-1 overflow-x-auto shrink-0 select-none">
          <button
            onClick={() => setActiveTab('display')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'display'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Display & Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('chalan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'chalan'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chalan Dimensions</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bus className="w-3.5 h-3.5 text-purple-600" />
            <span>Fleet & Trips ({trips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fares')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'fares'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Fares & Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-slate-700" />
            <span>System & Security</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: DISPLAY & CONTROLS */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              
              {/* PRIMARY USER REQUIREMENT: Toggle Option to turn display of coach numbers on or off */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border-2 border-blue-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-blue-600 text-white">
                        {appSettings.showCoachNumbersOnMainPage ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        Display Coach Numbers on Main Page
                      </h3>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        appSettings.showCoachNumbersOnMainPage
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {appSettings.showCoachNumbersOnMainPage ? 'ON (VISIBLE)' : 'OFF (HIDDEN)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl">
                      Controls whether coach identification numbers (e.g. <strong>D-CH205</strong>, <strong>DN212</strong>) are visible to operators and customers on the main trip cards list. Turn off to hide coach numbers.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={handleToggleCoachNumbers}
                      className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        appSettings.showCoachNumbersOnMainPage ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={appSettings.showCoachNumbersOnMainPage}
                    >
                      <span
                        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                          appSettings.showCoachNumbersOnMainPage ? 'translate-x-8 text-blue-600' : 'translate-x-0 text-slate-400'
                        }`}
                      >
                        {appSettings.showCoachNumbersOnMainPage ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </span>
                    </button>
                    <span className="text-xs font-black text-slate-800">
                      {appSettings.showCoachNumbersOnMainPage ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Visual Live Preview Comparison */}
                <div className="mt-4 pt-4 border-t border-blue-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                      Main Page Coach Card Preview (Current State)
                    </span>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      {appSettings.showCoachNumbersOnMainPage ? (
                        <div className="min-w-[65px]">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Coach</span>
                          <span className="font-black text-sm text-slate-900 font-mono">D-CH205</span>
                        </div>
                      ) : (
                        <div className="px-2 py-1 rounded bg-slate-200 text-slate-500 text-[10px] font-bold">
                          [Coach No Hidden]
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Time & Date</span>
                        <span className="font-bold text-xs text-slate-800 font-mono">10:00 PM • {formatDateDMY(new Date())}</span>
                      </div>
                      <div className="ml-auto font-black text-xs text-emerald-700 font-mono">
                        BDT 800
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                      System Action Note
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Toggle state persists across browser restarts and device sessions. Seat booking and chalan generation still link to the underlying coach record.
                    </p>
                  </div>
                </div>
              </div>

              {/* STARTING COUNTER LOCK (Locked to Mirpur-10) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-amber-600 text-white">
                        <Lock className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        Starting Counter Location (Locked)
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-400">
                        PERMANENTLY LOCKED
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 max-w-xl">
                      Starting counter origin is permanently locked to <strong>Mirpur-10</strong>. This terminal-specific lock is applied fleet-wide to prevent accidental booking origin changes.
                    </p>
                  </div>

                  <div className="px-4 py-2.5 rounded-xl bg-white border-2 border-amber-400 text-slate-900 font-black text-sm flex items-center gap-2 shadow-xs shrink-0 select-none">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Mirpur-10 Terminal</span>
                    <Lock className="w-3.5 h-3.5 text-amber-600 ml-1" />
                  </div>
                </div>
                
                <div className="mt-3 p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900 font-medium">
                  <strong>Notice:</strong> এই সফটওয়্যারটা শুধুমাত্র মিরপুর ১০ এর জন্য বানানো হয়েছে. (Locked to Mirpur-10 Hub for all dispatch chalans, filter defaults, and passenger manifests).
                </div>
              </div>

              {/* JOURNEY DATE FORMAT (Date-Month-Year) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-md bg-purple-600 text-white">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        Journey Date Display Format
                      </h3>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 font-bold">
                        ENFORCED SYSTEM-WIDE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl">
                      The journey date format is always displayed as <strong>Date-Month-Year (DD-MM-YYYY)</strong> across all trip cards, filter banners, tickets, and printed chalan manifests.
                    </p>
                  </div>

                  <div className="px-4 py-2.5 rounded-xl bg-white border-2 border-purple-300 text-purple-950 font-mono font-black text-sm shadow-xs shrink-0 select-none">
                    DD-MM-YYYY
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Today's Date</span>
                    <span className="font-mono font-black text-slate-800 text-sm">{formatDateDMY(new Date())}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">With Day Name</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{formatDateDMYWithDay(new Date())}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Chalan Sheet Format</span>
                    <span className="font-mono font-black text-emerald-800 text-xs">Date & Day: {formatDateDMYWithDay(new Date())}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CHALAN DIMENSIONS */}
          {activeTab === 'chalan' && (
            <div className="space-y-6">
              
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-blue-600" />
                      <span>Chalan Print Dimension Settings</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fine-tune chalan print height in half-inch increments, scale percentage, and perforation cut marks.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetChalan}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Half A4</span>
                    </button>
                    {onOpenChalanPreview && (
                      <button
                        type="button"
                        onClick={onOpenChalanPreview}
                        className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Open Chalan Sheet</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hero Measurements & Visualizer */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-white border border-slate-200">
                  
                  {/* Left: Active Height in Inches & MM */}
                  <div className="md:col-span-4 space-y-1 text-center md:text-left">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Configured Sheet Height
                    </span>
                    <div className="text-3xl font-black text-slate-950 flex items-baseline justify-center md:justify-start gap-2">
                      <span>{chalanConfig.heightInches}"</span>
                      <span className="text-base text-slate-500 font-mono font-semibold">
                        ({chalanHeightMm} mm)
                      </span>
                    </div>
                    <div className="text-xs font-bold text-blue-700">
                      {heightRatioPercent}% of Standard A4 Page
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      A4 Standard: 8.27" × 11.69" (210mm × 297mm)
                    </span>
                  </div>

                  {/* Right: Half-Inch Steppers & Fine Slider */}
                  <div className="md:col-span-8 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Half-Inch Increment Steppers:
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleChalanStep(-0.5)}
                        className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 text-slate-900 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                      >
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-black">-</span>
                        <span>Decrease (-0.5 Inch)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleChalanStep(0.5)}
                        className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-300 text-slate-900 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">+</span>
                        <span>Increase (+0.5 Inch)</span>
                      </button>
                    </div>

                    {/* Fine Adjustment Slider */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold">
                        <span>Compact: 3.5"</span>
                        <span className="text-blue-700 font-black">Exact Half A4 (5.85" / 148.5mm)</span>
                        <span>Full Page: 11.69"</span>
                      </div>
                      <input
                        type="range"
                        min="3.5"
                        max="11.69"
                        step="0.05"
                        value={chalanConfig.heightInches}
                        onChange={(e) => {
                          chalanConfigService.updateConfig({ heightInches: parseFloat(e.target.value) });
                        }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                    Quick Height Presets (Half-Inch Intervals):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '-1.0" (4.85")', val: 4.85, tag: '123 mm' },
                      { label: '-0.5" (5.35")', val: 5.35, tag: '136 mm' },
                      { label: 'Half A4 (5.85")', val: EXACT_HALF_A4_HEIGHT_INCHES, tag: '148.5 mm (Standard)' },
                      { label: '+0.5" (6.35")', val: 6.35, tag: '161 mm' },
                      { label: '+1.0" (6.85")', val: 6.85, tag: '174 mm' },
                      { label: '+1.5" (7.35")', val: 7.35, tag: '187 mm' },
                      { label: '+2.0" (7.85")', val: 7.85, tag: '199 mm' },
                      { label: 'Full A4 (11.69")', val: STANDARD_A4_HEIGHT_INCHES, tag: '297 mm' },
                    ].map((p) => {
                      const isSelected = Math.abs(chalanConfig.heightInches - p.val) < 0.04;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => handleSetChalanPreset(p.val)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-black">{p.label}</div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                            {p.tag}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Print Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={chalanConfig.showCutMark}
                      onChange={(e) => {
                        chalanConfigService.updateConfig({ showCutMark: e.target.checked });
                        triggerToast('Cut mark line updated.');
                      }}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                    />
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-red-600" />
                      <span>Print Scissor Cut/Perforation Line (✂)</span>
                    </span>
                  </label>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-slate-800">Font & Table Scale:</span>
                    <select
                      value={chalanConfig.scalePercent}
                      onChange={(e) => {
                        chalanConfigService.updateConfig({ scalePercent: parseInt(e.target.value, 10) });
                        triggerToast(`Print scale set to ${e.target.value}%`);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    >
                      <option value={90}>90% (Ultra Compact)</option>
                      <option value={95}>95% (Compact)</option>
                      <option value={100}>100% (Standard Half-A4)</option>
                      <option value={105}>105% (Large)</option>
                      <option value={110}>110% (Maximum Legibility)</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: FLEET & TRIPS */}
          {activeTab === 'fleet' && (
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <Bus className="w-4 h-4 text-purple-600" />
                    <span>Master Fleet & Trips ({trips.length} Active Records)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage active coach numbers, departure schedules, fares, and supervisors.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onRefreshData}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    title="Refresh Data from Server"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenCreateTrip}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Coach</span>
                  </button>
                </div>
              </div>

              {/* Coach List Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Coach #</th>
                        <th className="p-2.5">Route</th>
                        <th className="p-2.5">Departure</th>
                        <th className="p-2.5">Starting Counter</th>
                        <th className="p-2.5">Fare</th>
                        <th className="p-2.5">Supervisor</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {trips.map((t) => {
                        const isEditing = editingTripId === t.id;
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-2.5 font-mono font-black text-slate-900 text-xs">
                              {t.coachNumber}
                              <span className="block text-[9.5px] font-sans font-normal text-slate-500">
                                {t.coachType || 'Economy AC'}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium text-slate-800 max-w-[160px] truncate" title={t.routeTitle}>
                              {t.routeTitle}
                            </td>
                            <td className="p-2.5 font-mono text-slate-900 font-bold whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTime}
                                  onChange={(e) => setEditTime(e.target.value)}
                                  className="w-24 px-1.5 py-0.5 rounded border border-slate-300 text-xs font-mono font-bold"
                                />
                              ) : (
                                t.departureTime
                              )}
                            </td>
                            <td className="p-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                                <Lock className="w-2.5 h-2.5 text-amber-700" />
                                <span>Mirpur-10</span>
                              </span>
                            </td>
                            <td className="p-2.5 font-mono font-black text-emerald-800 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editFare}
                                  onChange={(e) => setEditFare(Number(e.target.value))}
                                  className="w-20 px-1.5 py-0.5 rounded border border-slate-300 text-xs font-mono font-bold"
                                />
                              ) : (
                                `BDT ${t.baseFare}`
                              )}
                            </td>
                            <td className="p-2.5 text-slate-600 text-[11px] whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editSupervisorPhone}
                                  onChange={(e) => setEditSupervisorPhone(e.target.value)}
                                  className="w-28 px-1.5 py-0.5 rounded border border-slate-300 text-xs font-mono"
                                />
                              ) : (
                                <div>
                                  <span className="font-semibold text-slate-800 block">{t.supervisorName.split('(')[0]}</span>
                                  <span className="font-mono text-[10px] text-slate-500">{t.supervisorPhone}</span>
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Save trip updates
                                      firebaseSync.updateTrip(t.id, {
                                        departureTime: editTime,
                                        baseFare: editFare,
                                        supervisorPhone: editSupervisorPhone,
                                      });
                                      setEditingTripId(null);
                                      triggerToast(`Trip ${t.coachNumber} updated.`);
                                    }}
                                    className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingTripId(null)}
                                    className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] px-2"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTripId(t.id);
                                      setEditTime(t.departureTime);
                                      setEditFare(t.baseFare);
                                      setEditSupervisorPhone(t.supervisorPhone);
                                    }}
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: FARES & BOOKINGS */}
          {activeTab === 'fares' && (
            <div className="space-y-5">
              
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Ticket Pricing & Booking Management</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Configure default terminal fees, commission, and booking maintenance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Default Fuel & Expense Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Terminal Operational Defaults
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Locked Terminal Station:</span>
                      <strong className="text-slate-900 font-mono">Mirpur-10 Terminal</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Standard Fuel Advance:</span>
                      <strong className="text-slate-900 font-mono">BDT 4,500</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Toll / Highway Advance:</span>
                      <strong className="text-slate-900 font-mono">BDT 1,850</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Counter Commission Rate:</span>
                      <strong className="text-slate-900 font-mono">5.0%</strong>
                    </div>
                  </div>
                </div>

                {/* Booking Maintenance & Safety Tools */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    Maintenance & Backup Operations
                  </h4>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleExportBackup}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Export Full System Backup (JSON)</span>
                    </button>

                    {showResetConfirm ? (
                      <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl space-y-2 text-center animate-in fade-in">
                        <p className="text-xs font-bold text-red-900">
                          Confirm: Reset all booked seats to available across all trips?
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={executeResetSeats}
                            className="px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-bold hover:bg-red-800 shadow-xs"
                          >
                            Yes, Reset All Seats
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-300 text-red-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className="w-4 h-4 text-red-600" />
                        <span>Reset All Booked Seats to Available</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: SYSTEM & SECURITY */}
          {activeTab === 'system' && (
            <div className="space-y-5">
              
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-slate-700" />
                  <span>System Diagnostics & Terminal Exclusivity</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Current authenticated operator and Mirpur-10 system deployment parameters.
                </p>
              </div>

              {/* Admin Profile Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Active Operator Session
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Operator Name</span>
                    <strong className="text-slate-900 text-sm block">{currentAdmin?.displayName || 'Executive Admin'}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Role</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-extrabold text-[11px] uppercase">
                      {currentAdmin?.role || 'Super Admin'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Branch</span>
                    <strong className="text-slate-900 text-sm block">Mirpur-10 Terminal</strong>
                  </div>
                </div>
              </div>

              {/* Exclusivity Notice */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-1">
                <div className="flex items-center gap-2 font-black text-sm text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Terminal Exclusivity Guarantee</span>
                </div>
                <p className="font-bangla font-semibold text-emerald-900">
                  "এই সফটওয়্যারটা শুধুমাত্র মিরপুর ১০ এর জন্য বানানো হয়েছে."
                </p>
                <p className="text-[11px] text-emerald-800">
                  This deployment is locked to Mirpur-10 terminal. All dispatch manifests, boarding lists, and waybills generate with verified Mirpur-10 metadata.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Lal Sabuj Paribahan • Mirpur 10 Station ERP • {formatDateDMY(new Date())}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close Admin Panel
          </button>
        </div>

      </div>
    </div>
  );
};
