import React from 'react';
import { Trip, Seat } from '../types/bus';
import { 
  Smartphone, 
  X, 
  Play, 
  Square, 
  Zap, 
  Users, 
  Clock, 
  RotateCcw, 
  CheckCircle,
  Sparkles,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

interface MobileSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  autoSimActive: boolean;
  onToggleAutoSim: () => void;
  onSimulateAppBooking: (seatCount?: number) => void;
  onSimulateAppHold: () => void;
  onSimulateAppCancel: () => void;
  onResetTripData: () => void;
}

export const MobileSimulatorDrawer: React.FC<MobileSimulatorDrawerProps> = ({
  isOpen,
  onClose,
  trip,
  autoSimActive,
  onToggleAutoSim,
  onSimulateAppBooking,
  onSimulateAppHold,
  onSimulateAppCancel,
  onResetTripData,
}) => {
  if (!isOpen) return null;

  const seatsList = Object.values(trip.seats);
  const availableCount = seatsList.filter((s) => s.status === 'available').length;
  const soldByAppCount = seatsList.filter((s) => s.status === 'sold' && s.bookedVia === 'mobile_app').length;
  const reservedCount = seatsList.filter((s) => s.status === 'reserved').length;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left">
      
      {/* Drawer Header */}
      <div className="bg-gradient-to-r from-red-600 via-emerald-800 to-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <Smartphone className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Mobile App Simulator</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-300">
              Simulate passenger actions from Lal Sabuj Android/iOS app
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
        
        {/* Real-time Status Card */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>Mobile App Live State</span>
            <span className="text-emerald-700 font-mono font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600 inline" /> Synced
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Available</span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">{availableCount}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">App Booked</span>
              <span className="text-base font-extrabold text-red-600 font-mono">{soldByAppCount}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Hold/Cart</span>
              <span className="text-base font-extrabold text-amber-600 font-mono">{reservedCount}</span>
            </div>
          </div>
        </div>

        {/* Rapid Traffic Auto-Simulation Toggle */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          autoSimActive
            ? 'bg-red-50 border-red-300 ring-2 ring-red-400/40'
            : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Zap className={`w-4 h-4 ${autoSimActive ? 'text-red-600 animate-bounce' : 'text-emerald-600'}`} />
                <span>Auto-Booking Traffic Storm</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Automatically issues mobile bookings every few seconds to demonstrate live database synchronization.
              </p>
            </div>
          </div>

          <button
            onClick={onToggleAutoSim}
            className={`mt-3 w-full py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              autoSimActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {autoSimActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Traffic Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Traffic Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Instant Triggers */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            One-Click App Actions
          </p>

          {/* Book 1 Seat */}
          <button
            onClick={() => onSimulateAppBooking(1)}
            disabled={availableCount === 0}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                +1
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-emerald-900">
                  App Passenger Books 1 Seat
                </p>
                <p className="text-[10px] text-slate-500">
                  Instant Bkash payment & e-ticket generation
                </p>
              </div>
            </div>
            <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </button>

          {/* Book 2 Adjacent Seats */}
          <button
            onClick={() => onSimulateAppBooking(2)}
            disabled={availableCount < 2}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                +2
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-emerald-900">
                  Book Dual Seats (Family / Couple)
                </p>
                <p className="text-[10px] text-slate-500">
                  Simulates pair selection on mobile app
                </p>
              </div>
            </div>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </button>

          {/* Hold Seat */}
          <button
            onClick={onSimulateAppHold}
            disabled={availableCount === 0}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-amber-900">
                  App User Holds Seat in Cart
                </p>
                <p className="text-[10px] text-slate-500">
                  Applies 15-minute temporary checkout lock
                </p>
              </div>
            </div>
            <Clock className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
          </button>

          {/* Cancel Ticket */}
          <button
            onClick={onSimulateAppCancel}
            disabled={soldByAppCount === 0}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-300 transition-all text-left group disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                ✕
              </div>
              <div>
                <p className="font-bold text-slate-800 group-hover:text-red-900">
                  Passenger Cancels App Booking
                </p>
                <p className="text-[10px] text-slate-500">
                  Releases seat back to Available immediately
                </p>
              </div>
            </div>
            <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
          </button>
        </div>

        {/* Reset Data Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              if (confirm('Reset all seat bookings to initial demo state?')) {
                onResetTripData();
              }
            }}
            className="w-full py-2 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Seat Matrix to Default</span>
          </button>
        </div>

      </div>

    </div>
  );
};
