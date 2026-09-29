import React from 'react';
import { ChevronLeft, ChevronRight, Search as SearchIcon, X } from 'lucide-react';

interface LalSobujFilterBarProps {
  fromLocation: string;
  onChangeFrom: (from: string) => void;
  toLocation: string;
  onChangeTo: (to: string) => void;
  journeyDate: string; // YYYY-MM-DD
  onChangeJourneyDate: (date: string) => void;
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onSearch: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
}

export const LalSobujFilterBar: React.FC<LalSobujFilterBarProps> = ({
  fromLocation,
  onChangeFrom,
  toLocation,
  onChangeTo,
  journeyDate,
  onChangeJourneyDate,
  searchQuery,
  onChangeSearchQuery,
  onSearch,
  onPrevDay,
  onNextDay,
}) => {
  // Format date for the center purple banner, e.g. "Tuesday, 29th September, 2026"
  const formattedBannerDate = React.useMemo(() => {
    try {
      const [y, m, d] = journeyDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      
      const weekday = dt.toLocaleDateString('en-US', { weekday: 'long' });
      const month = dt.toLocaleDateString('en-US', { month: 'long' });
      const day = dt.getDate();
      const year = dt.getFullYear();

      // Ordinal suffix (1st, 2nd, 3rd, 4th...)
      let suffix = 'th';
      if (day % 10 === 1 && day !== 11) suffix = 'st';
      else if (day % 10 === 2 && day !== 12) suffix = 'nd';
      else if (day % 10 === 3 && day !== 13) suffix = 'rd';

      return `${weekday}, ${day}${suffix} ${month}, ${year}`;
    } catch (e) {
      return journeyDate;
    }
  }, [journeyDate]);

  // Display date formatted as DD-MM-YYYY for the input
  const displayDateStr = React.useMemo(() => {
    if (!journeyDate) return '';
    const parts = journeyDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return journeyDate;
  }, [journeyDate]);

  return (
    <div className="w-full bg-[#fcf8fd] border-b border-purple-100 shadow-2xs">
      
      {/* Top Filter Controls (Matching Image 1: From, To, Date, Search bar, NO PNR) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-2.5 items-end">
          
          {/* 1. From Field */}
          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">From</label>
            <div className="relative">
              <select
                value={fromLocation}
                onChange={(e) => onChangeFrom(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
              >
                <option value="North">North</option>
                <option value="Mirpur-10">Mirpur-10</option>
                <option value="Savar">Savar</option>
                <option value="Jigatola">Jigatola</option>
                <option value="Sayedabad">Sayedabad</option>
                <option value="All">All Counters</option>
              </select>
            </div>
          </div>

          {/* 2. To Destination Field (Filters trips by destination: Sonapur, Raipur, Chittagong, etc.) */}
          <div className="lg:col-span-3 space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">To</label>
            <div className="relative">
              <select
                value={toLocation}
                onChange={(e) => onChangeTo(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
              >
                <option value="">Select To</option>
                <option value="Sonapur">Sonapur</option>
                <option value="Raipur">Raipur</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Noakhali">Noakhali</option>
                <option value="Maijdee">Maijdee</option>
                <option value="Lakshmipur">Lakshmipur</option>
                <option value="Navy Gate">Navy Gate</option>
              </select>
            </div>
          </div>

          {/* 3. Date Field (No PNR field as instructed) */}
          <div className="lg:col-span-2 space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">Date</label>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => onChangeJourneyDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
            />
          </div>

          {/* 4. Search Bar & Search Button (replaces PNR with requested Search bar) */}
          <div className="lg:col-span-4 flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search coach, route, time..."
                value={searchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => onChangeSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={onSearch}
              className="bg-[#661d7a] hover:bg-[#521563] text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors shadow-2xs cursor-pointer"
            >
              Search
            </button>
          </div>

        </div>
      </div>

      {/* Date Navigation Strip (Exact Match to Reference Image 1) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-2.5 pt-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Previous Button */}
          <button
            onClick={onPrevDay}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span>⍃</span>
            <span>Previous</span>
          </button>

          {/* Center Date Display Banner */}
          <div className="flex-1 bg-[#661d7a] text-white text-center text-xs sm:text-sm font-semibold py-1.5 px-3 rounded shadow-2xs truncate">
            {formattedBannerDate}
          </div>

          {/* Next Button */}
          <button
            onClick={onNextDay}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span>Next</span>
            <span>⍄</span>
          </button>

        </div>
      </div>

    </div>
  );
};
