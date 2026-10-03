import React from 'react';
import { Trip, Seat } from '../types/bus';
import { 
  CheckCircle, 
  Armchair, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface QuickStatsProps {
  trip: Trip;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ trip }) => {
  const seatsList = Object.values(trip.seats);
  const total = trip.seatCapacity || seatsList.length || 36;
  const sold = seatsList.filter((s) => s.status === 'sold').length;
  const reserved = seatsList.filter((s) => s.status === 'reserved').length;
  const available = total - sold - reserved;

  const occupancyPct = Math.round((sold / total) * 100);

  const maleCount = seatsList.filter((s) => s.status === 'sold' && s.gender === 'male').length;
  const femaleCount = seatsList.filter((s) => s.status === 'sold' && s.gender === 'female').length;

  const totalFareCollected = seatsList
    .filter((s) => s.status === 'sold')
    .reduce((sum, s) => sum + (s.fare || trip.baseFare), 0);

  const potentialRevenue = seatsList
    .filter((s) => s.status === 'sold' || s.status === 'reserved')
    .reduce((sum, s) => sum + (s.fare || trip.baseFare), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      
      {/* Total Seats */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Coach Capacity</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{total}</p>
          <span className="text-[11px] text-slate-500 font-medium">2x2 Luxury Layout</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          <Armchair className="w-5 h-5" />
        </div>
      </div>

      {/* Available Seats */}
      <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Available Seats</p>
          <p className="text-2xl font-black text-emerald-800 mt-0.5">{available}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{Math.round((available / total) * 100)}% vacant</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Sold Seats */}
      <div className="bg-red-50/70 p-3.5 rounded-xl border border-red-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Sold Seats</p>
          <p className="text-2xl font-black text-red-800 mt-0.5">{sold}</p>
          <span className="text-[11px] text-red-600 font-semibold">{occupancyPct}% Booked</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Reserved Seats */}
      <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Reserved / Hold</p>
          <p className="text-2xl font-black text-amber-800 mt-0.5">{reserved}</p>
          <span className="text-[11px] text-amber-600 font-medium">Counter & VIP hold</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Gross Revenue */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Collection</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">BDT {totalFareCollected.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 font-semibold">Base: BDT {trip.baseFare}</span>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs font-mono">
          <span>BDT</span>
        </div>
      </div>

      {/* Passengers Breakdown */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Passenger Mix</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              ♂ {maleCount}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              ♀ {femaleCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {sold > 0 ? `${Math.round((femaleCount / sold) * 100)}% Female` : 'No bookings'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
};
