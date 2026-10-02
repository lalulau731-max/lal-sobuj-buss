import React, { useMemo } from 'react';
import { Trip, Seat } from '../types/bus';
import { Clock, Info, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import { InlineSeatPlanner } from './InlineSeatPlanner';

interface TripListCardProps {
  trip: Trip;
  journeyDate: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onOpenReport: () => void;
  onOpenInfo: () => void;
  onConfirmBooking: (
    updates: Record<string, Partial<Seat>>,
    meta: {
      action: 'sold' | 'reserved';
      source: 'counter';
      passengerName: string;
      counterOrUser: string;
    }
  ) => void;
  onPrintTicket?: (seatNumber: string) => void;
  onRefresh: () => void;
}

export const TripListCard: React.FC<TripListCardProps> = ({
  trip,
  journeyDate,
  isExpanded,
  onToggleExpand,
  onOpenReport,
  onOpenInfo,
  onConfirmBooking,
  onPrintTicket,
  onRefresh,
}) => {
  // Compute available seats count
  const availableCount = useMemo(() => {
    return Object.values(trip.seats || {}).filter((s) => s.status === 'available').length;
  }, [trip.seats]);

  // Format short date for row (e.g. "29-09-26")
  const shortDate = useMemo(() => {
    try {
      const [y, m, d] = journeyDate.split('-');
      return `${d}-${m}-${y.slice(-2)}`;
    } catch (e) {
      return journeyDate;
    }
  }, [journeyDate]);

  // Compute travel duration based on destination
  const estimatedDuration = useMemo(() => {
    const dest = (trip.destination || trip.routeTitle || '').toLowerCase();
    if (dest.includes('chittagong')) return '8h 25m';
    if (dest.includes('jigatola')) return '5h 30m';
    if (dest.includes('savar')) return '7h 5m';
    return '7h 10m';
  }, [trip]);

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-[#006837]/40 hover:shadow-sm">
      
      {/* Main Row Matching Reference Image 1 with Increased Font Size and Readability */}
      <div className="p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-sm">
        
        {/* Left Column: Coach Code, Time & Date, Reg No, Coach Class */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-3 lg:gap-6 flex-1">
          
          {/* Coach Code */}
          <div className="min-w-[75px]">
            <span className="text-[11px] font-black uppercase text-slate-500 block tracking-wider">Coach</span>
            <span className="font-black text-base sm:text-lg text-slate-950 font-mono tracking-tight block">
              {trip.coachNumber}
            </span>
          </div>

          {/* Departure Time & Date */}
          <div className="min-w-[95px] leading-tight">
            <span className="text-[11px] font-black uppercase text-slate-500 block tracking-wider">Time</span>
            <span className="font-extrabold text-sm sm:text-base text-slate-900 font-mono block">
              {trip.departureTime}
            </span>
            <span className="text-xs text-slate-600 font-mono font-semibold">
              {shortDate}
            </span>
          </div>

          {/* Registration Number */}
          <div className="min-w-[75px] leading-tight">
            <span className="text-[11px] font-black uppercase text-slate-500 block tracking-wider">Reg No</span>
            <span className="font-mono text-slate-800 text-xs sm:text-sm font-bold block">
              {trip.registrationNumber?.replace(/DHAKA METRO-BA\s*/i, '') || '12-4101'}
            </span>
          </div>

          {/* Coach Class / Model */}
          <div className="min-w-[100px] leading-tight">
            <span className="text-[11px] font-black uppercase text-slate-500 block tracking-wider">Class</span>
            <span className="text-slate-800 font-bold text-xs sm:text-sm block">
              {trip.coachType || 'Economy AC'}
            </span>
          </div>

          {/* Route & Travel Duration with Green Clock Icon */}
          <div className="col-span-2 sm:col-span-4 lg:flex-1 leading-tight">
            <span className="text-[11px] font-black uppercase text-slate-500 block tracking-wider">Route</span>
            <span className="font-black text-slate-950 text-sm sm:text-base block">
              {trip.routeTitle}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{estimatedDuration}</span>
            </div>
          </div>

          {/* Available Seats Label & Count */}
          <div className="min-w-[80px] text-center sm:text-left leading-tight bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 block uppercase font-extrabold tracking-wider">Available</span>
            <span className="font-black text-emerald-800 font-mono text-base sm:text-lg">
              {availableCount} <span className="text-xs font-semibold text-emerald-700">seats</span>
            </span>
          </div>

        </div>

        {/* Right Action Buttons: Trip Report | Info | Get Seat ∨ (Image 1) */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
          
          {/* Trip Report Button (Opens printable chalan sheet) */}
          <button
            onClick={onOpenReport}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            title="Official Trip Report / Chalan Manifest"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Trip Report</span>
          </button>

          {/* Info Button */}
          <button
            onClick={onOpenInfo}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            title="Coach & Driver Details"
          >
            <Info className="w-3.5 h-3.5 text-slate-600" />
            <span>Info</span>
          </button>

          {/* Get Seat ∨ / Close ✕ Toggle Button (Styled in iconic Lal Sabuj Green) */}
          <button
            onClick={onToggleExpand}
            className={`text-white text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border ${
              isExpanded
                ? 'bg-[#c41230] hover:bg-[#a00e26] border-red-800'
                : 'bg-[#006837] hover:bg-[#00522c] border-emerald-800'
            }`}
          >
            <span>{isExpanded ? 'Close ✕' : 'Get Seat ∨'}</span>
          </button>

        </div>

      </div>

      {/* Inline Seat Plan Workspace (Opens directly below this trip, matching Image 2) */}
      {isExpanded && (
        <InlineSeatPlanner
          trip={trip}
          journeyDate={journeyDate}
          onClose={onToggleExpand}
          onConfirmBooking={onConfirmBooking}
          onOpenChalan={onOpenReport}
          onPrintTicket={onPrintTicket}
          onRefresh={onRefresh}
        />
      )}

    </div>
  );
};
