import React from 'react';
import { Trip } from '../types/bus';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Search, 
  Layers,
  RotateCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface TripSelectorProps {
  trips: Trip[];
  activeTrip: Trip;
  onSelectTrip: (tripId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'available' | 'sold' | 'reserved';
  onFilterChange: (filter: 'all' | 'available' | 'sold' | 'reserved') => void;
  journeyDate: string;
  onChangeJourneyDate: (date: string) => void;
  onRefetch?: () => void;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  trips,
  activeTrip,
  onSelectTrip,
  searchQuery,
  onSearchChange,
  statusFilter,
  onFilterChange,
  journeyDate,
  onChangeJourneyDate,
  onRefetch,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4">
      
      {/* Top Bar: Journey Date Selector & Active Trips */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        
        {/* Active Coaches Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Live Fleet:
          </span>

          {trips.map((trip) => {
            const isSelected = trip.id === activeTrip.id;
            const soldCount = Object.values(trip.seats).filter((s) => s.status === 'sold' || s.status === 'locked').length;
            const totalCount = trip.seatCapacity || 40;
            const occupancy = Math.round((soldCount / totalCount) * 100);

            return (
              <button
                key={trip.id}
                onClick={() => onSelectTrip(trip.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-emerald-700 text-white border-transparent shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Bus className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`} />
                <span className="font-bold">Coach {trip.coachNumber}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isSelected ? 'bg-black/30 text-emerald-100' : 'bg-slate-200 text-slate-600'
                }`}>
                  {trip.departureTime}
                </span>
                <span className={`text-[10px] font-bold ${
                  isSelected ? 'text-amber-200' : 'text-emerald-600'
                }`}>
                  {occupancy}% Booked
                </span>
              </button>
            );
          })}
        </div>

        {/* Journey Date Selector & Quick Refresh */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-slate-600">Journey Date:</span>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => onChangeJourneyDate(e.target.value)}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono font-bold text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {onRefetch && (
            <button
              onClick={onRefetch}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh live data from Firebase"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search passenger, seat, phone, TXN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Status Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['all', 'available', 'sold', 'reserved'] as const).map((filter) => {
            const isActive = statusFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  isActive
                    ? filter === 'available'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : filter === 'sold'
                      ? 'bg-red-600 text-white shadow-xs'
                      : filter === 'reserved'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

      </div>

      {/* Selected Coach Operational Metadata Card */}
      <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-red-50/40 rounded-xl p-3.5 border border-emerald-100/90 text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-600 inline" />
                {activeTrip.routeTitle}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                {activeTrip.coachType}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-800 font-mono text-[11px] font-bold">
                {activeTrip.registrationNumber}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                {activeTrip.seatMatrixLayout}
              </span>
            </div>
            
            <p className="text-slate-600 text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">Journey:</strong> {activeTrip.departureDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">Departure:</strong> {activeTrip.departureTime} (Reporting: {activeTrip.reportingTime || activeTrip.departureTime})
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-slate-700">Boarding:</strong>{' '}
                <span className="font-semibold text-slate-800">{activeTrip.startingCounter}</span>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-600 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Supervisor Hotline</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-emerald-600" /> {activeTrip.supervisorPhone}
              </span>
            </div>

            <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Standard Ticket Fare</span>
              <span className="font-black text-emerald-700 font-mono text-sm">৳{activeTrip.baseFare}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
