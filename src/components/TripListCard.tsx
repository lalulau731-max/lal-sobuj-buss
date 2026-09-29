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
    <div className="bg-white rounded-lg border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-purple-300">
      
      {/* Main Row Matching Reference Image 1 */}
      <div className="p-3 sm:p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        
        {/* Left Column: Coach Code, Time & Date, Reg No, Coach Class */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-3 lg:gap-5 flex-1">
          
          {/* Coach Code */}
          <div className="min-w-[70px]">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 font-mono tracking-tight block">
              {trip.coachNumber}
            </span>
          </div>

          {/* Departure Time & Date */}
          <div className="min-w-[85px] leading-tight">
            <span className="font-bold text-slate-900 font-mono block">
              {trip.departureTime}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {shortDate}
            </span>
          </div>

          {/* Registration Number */}
          <div className="min-w-[65px] leading-tight">
            <span className="font-mono text-slate-700 text-xs block">
              {trip.registrationNumber?.replace(/DHAKA METRO-BA\s*/i, '') || '12-4101'}
            </span>
          </div>

          {/* Coach Class / Model */}
          <div className="min-w-[90px] leading-tight">
            <span className="text-slate-700 font-medium block">
              {trip.coachType || 'Economy AC'}
            </span>
          </div>

          {/* Route & Travel Duration with Green Clock Icon */}
          <div className="col-span-2 sm:col-span-4 lg:flex-1 leading-tight">
            <span className="font-bold text-slate-800 text-xs sm:text-[13px] block">
              {trip.routeTitle}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{estimatedDuration}</span>
            </div>
          </div>

          {/* Available Seats Label & Count */}
          <div className="min-w-[65px] text-center sm:text-left leading-tight">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Available</span>
            <span className="text-[10px] text-slate-500 block">seats</span>
            <span className="font-extrabold text-slate-900 font-mono text-sm sm:text-base">
              {availableCount}
            </span>
          </div>

        </div>

        {/* Right Action Buttons: Trip Report | Info | Get Seat ∨ (Image 1) */}
        <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
          
          {/* Trip Report Button (Opens printable chalan sheet) */}
          <button
            onClick={onOpenReport}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            title="Official Trip Report / Chalan Manifest"
          >
            <span>Trip Report</span>
          </button>

          {/* Info Button */}
          <button
            onClick={onOpenInfo}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            title="Coach & Driver Details"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Info</span>
          </button>

          {/* Get Seat ∨ / Close ✕ Toggle Button (Exact Match to Image 1 & Image 2) */}
          <button
            onClick={onToggleExpand}
            className={`text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded transition-colors shadow-2xs flex items-center gap-1 cursor-pointer ${
              isExpanded
                ? 'bg-[#481357] hover:bg-[#390d45]'
                : 'bg-[#661d7a] hover:bg-[#521563]'
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
          onRefresh={onRefresh}
        />
      )}

    </div>
  );
};
