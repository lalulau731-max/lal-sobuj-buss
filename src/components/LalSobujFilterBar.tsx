import React from 'react';
import { ChevronLeft, ChevronRight, Search as SearchIcon, X, Calendar, Sparkles, Lock, MapPin } from 'lucide-react';
import { formatDateDMY } from '../utils/dateUtils';

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
  onToday: () => void;
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
  onToday,
}) => {
  // Format date for the center purple banner strictly in Date-Month-Year format
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

      return `${weekday}, ${day}${suffix} ${month}, ${year} (${formatDateDMY(journeyDate)})`;
    } catch (e) {
      return formatDateDMY(journeyDate);
    }
  }, [journeyDate]);

  return (
    <div className="no-print filter-bar search-bar w-full bg-[#fbf7fc] border-b border-purple-200/80 shadow-xs">
      
      {/* Top Filter Controls: From, To, Date, Today's Trip, Search */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
          
          {/* 1. From Field: Permanently Locked to Mirpur-10 */}
          <div className="lg:col-span-3 space-y-1.5 dropdown-container">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                From (Starting Counter)
              </label>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-300">
                <Lock className="w-2.5 h-2.5 text-amber-700" />
                <span>Locked</span>
              </span>
            </div>
            <div className="relative">
              <div 
                className="w-full bg-slate-100 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-slate-900 font-extrabold flex items-center justify-between shadow-xs select-none cursor-not-allowed"
                title="Starting counter is permanently locked to Mirpur-10."
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <span>Mirpur-10</span>
                </div>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* 2. To Destination Field */}
          <div className="lg:col-span-3 space-y-1.5 dropdown-container">
            <label className="block text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              To (Destination)
            </label>
            <div className="relative">
              <select
                value={toLocation}
                onChange={(e) => onChangeTo(e.target.value)}
                className="dropdown-select w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-slate-900 font-bold focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200 shadow-xs transition-all"
              >
                <option value="">All Destinations</option>
                <option value="Sonapur">Sonapur</option>
                <option value="Raipur">Raipur</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Noakhali">Noakhali</option>
                <option value="Maijdee">Maijdee</option>
                <option value="Lakshmipur">Lakshmipur</option>
                <option value="Navy Gate">Navy Gate</option>
                <option value="Cumilla">Cumilla</option>
              </select>
            </div>
          </div>

          {/* 3. Journey Date Field with Quick Today Button & Date-Month-Year Display */}
          <div className="lg:col-span-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Journey Date
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200" title="Format: Date-Month-Year">
                  {formatDateDMY(journeyDate)}
                </span>
                <button
                  type="button"
                  onClick={onToday}
                  className="text-[11px] sm:text-xs font-black text-[#006837] hover:text-[#00522c] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Set date to Today"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#006837]" />
                  <span>Today</span>
                </button>
              </div>
            </div>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => onChangeJourneyDate(e.target.value)}
              className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-sm sm:text-base text-slate-900 font-mono font-bold focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200 shadow-xs transition-all"
            />
          </div>

          {/* 4. Search Bar & Search Button */}
          <div className="lg:col-span-3 flex items-center gap-2 search-bar search-box">
            <div className="relative flex-1 search-input-wrapper">
              <input
                type="text"
                placeholder="Search coach, route, time..."
                value={searchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="search-input w-full bg-white border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200 shadow-xs transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onChangeSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={onSearch}
              className="bg-[#006837] hover:bg-[#00522c] text-white text-sm sm:text-base font-extrabold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>

        </div>
      </div>

      {/* Date Navigation & Today's Trip Strip */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 pb-3.5 pt-1">
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          
          {/* Today's Trip Button (Prominent Green Button) */}
          <button
            type="button"
            onClick={onToday}
            className="bg-[#15803d] hover:bg-[#166534] active:bg-[#14532d] text-white text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 border-2 border-emerald-600"
            title="Automatically view today's trips and schedules"
          >
            <Calendar className="w-4 h-4 text-emerald-100" />
            <span>Today's Trip</span>
          </button>

          {/* Previous Button */}
          <button
            type="button"
            onClick={onPrevDay}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="View previous day's trips"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Center Date Display Banner */}
          <div className="flex-1 min-w-[200px] bg-gradient-to-r from-[#661d7a] via-[#521563] to-[#661d7a] text-white text-center text-sm sm:text-base lg:text-lg font-black py-2.5 px-4 rounded-xl shadow-sm truncate tracking-wide border border-purple-400/30">
            {formattedBannerDate}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={onNextDay}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
            title="View next day's trips"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>
      </div>

    </div>
  );
};
