import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Bus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Flame, 
  Filter,
  Layers,
  ChevronDown
} from 'lucide-react';
import { DayAnalytics, TripDaySummary } from '../types/bus';
import { firebaseSync } from '../services/firebaseSync';

interface CalendarViewProps {
  currentDate: string; // Active journey date YYYY-MM-DD
  onSelectJourneyDate: (date: string) => void;
  onOpenCoachSeatMatrix: (coachNumber: string, date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onSelectJourneyDate,
  onOpenCoachSeatMatrix,
}) => {
  // Today's official operational date
  const todayStr = '2026-09-29';

  // Selected date in the calendar for viewing analytics
  const [selectedDate, setSelectedDate] = useState<string>(currentDate || todayStr);

  // Month & Year state for calendar navigation
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(9); // 1-indexed (9 = September)

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Quick Preset Filters
  const handleSelectPastMonth = () => {
    setViewYear(2026);
    setViewMonth(8); // August
    setSelectedDate('2026-08-15');
  };

  const handleSelectCurrentMonth = () => {
    setViewYear(2026);
    setViewMonth(9); // September
    setSelectedDate(todayStr);
  };

  const handleSelectUpcomingMonth = () => {
    setViewYear(2026);
    setViewMonth(10); // October
    setSelectedDate('2026-10-10');
  };

  const handleSelectToday = () => {
    setViewYear(2026);
    setViewMonth(9);
    setSelectedDate(todayStr);
    onSelectJourneyDate(todayStr);
  };

  // Compute month summary and days grid
  const monthSummary = useMemo(() => {
    return firebaseSync.getMonthSummary(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  // Aggregate stats across the viewed month
  const monthAggregates = useMemo(() => {
    const days = Object.values(monthSummary);
    let totalTrips = 0;
    let totalPassengers = 0;
    let totalGrossRevenue = 0;
    let sumOccupancy = 0;

    days.forEach((d) => {
      totalTrips += d.totalTrips;
      totalPassengers += d.soldSeats;
      totalGrossRevenue += d.totalRevenue;
      sumOccupancy += d.occupancyRate;
    });

    const avgOccupancy = days.length > 0 ? Math.round(sumOccupancy / days.length) : 0;

    return {
      totalTrips,
      totalPassengers,
      totalGrossRevenue,
      avgOccupancy,
      daysCount: days.length,
    };
  }, [monthSummary]);

  // Daily analytics for the currently selected date
  const dayAnalytics: DayAnalytics = useMemo(() => {
    return firebaseSync.getDayAnalytics(selectedDate);
  }, [selectedDate, currentDate]);

  // Build calendar grid cells
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: {
      date: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isActiveJourneyDate: boolean;
      stats?: { totalTrips: number; soldSeats: number; occupancyRate: number; totalRevenue: number };
    }[] = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonthNum = viewMonth === 1 ? 12 : viewMonth - 1;
      const prevYearNum = viewMonth === 1 ? viewYear - 1 : viewYear;
      const dStr = `${prevYearNum}-${String(prevMonthNum).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      cells.push({
        date: dStr,
        dayNumber: prevDay,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        isActiveJourneyDate: dStr === currentDate,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        date: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        isActiveJourneyDate: dStr === currentDate,
        stats: monthSummary[dStr],
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remaining; nextDay++) {
      const nextMonthNum = viewMonth === 12 ? 1 : viewMonth + 1;
      const nextYearNum = viewMonth === 12 ? viewYear + 1 : viewYear;
      const dStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      cells.push({
        date: dStr,
        dayNumber: nextDay,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
        isSelected: dStr === selectedDate,
        isActiveJourneyDate: dStr === currentDate,
      });
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate, currentDate, monthSummary]);

  // Names of months in English
  const monthNames = [
    { en: 'January', bn: 'January' },
    { en: 'February', bn: 'February' },
    { en: 'March', bn: 'March' },
    { en: 'April', bn: 'April' },
    { en: 'May', bn: 'May' },
    { en: 'June', bn: 'June' },
    { en: 'July', bn: 'July' },
    { en: 'August', bn: 'August' },
    { en: 'September', bn: 'September' },
    { en: 'October', bn: 'October' },
    { en: 'November', bn: 'November' },
    { en: 'December', bn: 'December' },
  ];

  const currentMonthName = monthNames[viewMonth - 1];

  // Format date helper for Bengali and English
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const en = dt.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return en;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Calendar Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Operations Calendar & Fleet Analytics</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                    Live Dispatch Scheduler
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Select any day to inspect seat occupancy, revenue collection, and passenger demographics.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Preset Filter Tabs (Past Month / Today / Upcoming Month) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSelectPastMonth}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                viewMonth === 8 && viewYear === 2026
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Past Month (August)
            </button>

            <button
              onClick={handleSelectCurrentMonth}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                viewMonth === 9 && viewYear === 2026
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              Current Month (September)
            </button>

            <button
              onClick={handleSelectUpcomingMonth}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                viewMonth === 10 && viewYear === 2026
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Upcoming Month (October)
            </button>

            {/* Today Jump Button */}
            <button
              onClick={handleSelectToday}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all shadow-xs cursor-pointer"
              title="Jump directly to today's operations"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Today</span>
            </button>
          </div>

        </div>

        {/* Month Stepper Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-left">
              <span className="text-base sm:text-lg font-black text-slate-900">
                {currentMonthName.en} {viewYear}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>75%+ Occupancy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>50-74% Occupancy</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Today's Date</span>
            </span>
          </div>
        </div>

      </div>

      {/* Month Overview Aggregate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Month Dispatches</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {monthAggregates.totalTrips}
            </span>
            <span className="text-xs text-emerald-700 font-bold">Coach Trips</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across all 5 assigned fleet routes</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Month Passengers</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {monthAggregates.totalPassengers.toLocaleString()}
            </span>
            <span className="text-xs text-sky-700 font-bold">Tickets Sold</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Counter POS + Mobile App users</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              BDT {(monthAggregates.totalGrossRevenue / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-emerald-700 font-bold">Gross Fare</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total revenue collected for {currentMonthName.en}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Occupancy</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {monthAggregates.avgOccupancy}%
            </span>
            <span className="text-xs text-amber-700 font-bold">Fleet Full</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consistent high load factor</p>
        </div>

      </div>

      {/* Main 2-Column Section: Left Calendar Grid + Right Day Analytics Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 7-Column Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span>Day-by-Day Grid</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-normal">Click any day to inspect</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Viewing: <strong className="text-slate-800">{selectedDate}</strong>
            </span>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-slate-600 pb-1">
            <div className="py-1">Sun</div>
            <div className="py-1">Mon</div>
            <div className="py-1">Tue</div>
            <div className="py-1">Wed</div>
            <div className="py-1">Thu</div>
            <div className="py-1 text-emerald-700">Fri</div>
            <div className="py-1 text-emerald-700">Sat</div>
          </div>

          {/* Day Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const occ = cell.stats?.occupancyRate || 0;
              const isSelected = cell.isSelected;
              const isToday = cell.isToday;

              return (
                <button
                  key={`${cell.date}-${idx}`}
                  onClick={() => {
                    setSelectedDate(cell.date);
                    // If it's a day in another month, auto switch view month
                    const cellMonth = parseInt(cell.date.split('-')[1], 10);
                    const cellYear = parseInt(cell.date.split('-')[0], 10);
                    if (cellMonth !== viewMonth || cellYear !== viewYear) {
                      setViewMonth(cellMonth);
                      setViewYear(cellYear);
                    }
                  }}
                  className={`min-h-[78px] sm:min-h-[88px] p-2 rounded-xl text-left border flex flex-col justify-between transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : isToday
                      ? 'bg-amber-50/70 hover:bg-amber-100/60 border-amber-300'
                      : cell.isCurrentMonth
                      ? 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                      : 'bg-slate-50/20 hover:bg-slate-100/40 border-slate-100 opacity-40'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs sm:text-sm font-bold font-mono ${
                      isSelected
                        ? 'text-emerald-900'
                        : isToday
                        ? 'text-amber-950 font-black'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}>
                      {cell.dayNumber}
                    </span>

                    {isToday && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-amber-500 text-white shadow-2xs leading-none">
                        TODAY
                      </span>
                    )}

                    {cell.isActiveJourneyDate && !isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" title="Active Fleet Date"></span>
                    )}
                  </div>

                  {/* Day Content Badges (If Current Month) */}
                  {cell.isCurrentMonth && cell.stats && (
                    <div className="space-y-1 w-full mt-1">
                      
                      {/* Occupancy Indicator */}
                      <div className="flex items-center justify-between text-[10px] leading-tight">
                        <span className={`font-bold font-mono ${
                          occ >= 75
                            ? 'text-emerald-700'
                            : occ >= 50
                            ? 'text-sky-700'
                            : 'text-slate-500'
                        }`}>
                          {occ}% full
                        </span>
                        <span className="text-[9px] text-slate-400 hidden sm:inline">
                          {cell.stats.totalTrips}c
                        </span>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occ >= 75
                              ? 'bg-emerald-500'
                              : occ >= 50
                              ? 'bg-sky-500'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${occ}%` }}
                        />
                      </div>

                      {/* Revenue Pill */}
                      <div className="text-[9px] text-slate-600 font-mono truncate hidden sm:block">
                        BDT {Math.round(cell.stats.totalRevenue / 1000)}k
                      </div>

                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Showing operational days for <strong>{currentMonthName.en} {viewYear}</strong></span>
            <button
              onClick={() => onSelectJourneyDate(selectedDate)}
              className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Sync {selectedDate} to Dispatcher</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Right Column: Selected Day Analytics Detail Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          
          {/* Day Hero Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Selected Day Performance
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {formatFriendlyDate(selectedDate)}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                ISO Date: {selectedDate} {selectedDate === todayStr ? '• Today\'s Fleet Date' : ''}
              </p>
            </div>

            {/* Set as Active Operational Date Button */}
            <button
              onClick={() => onSelectJourneyDate(selectedDate)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                currentDate === selectedDate
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentDate === selectedDate ? 'Active in Dispatcher' : 'Set as Matrix Date'}</span>
            </button>
          </div>

          {/* Core Daily KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Occupancy Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Day Occupancy
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {dayAnalytics.occupancyRate}%
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  {dayAnalytics.soldSeats}/{dayAnalytics.totalCapacity}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${dayAnalytics.occupancyRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>Sold: {dayAnalytics.soldSeats}</span>
                <span>Hold: {dayAnalytics.reservedSeats}</span>
                <span>Avail: {dayAnalytics.availableSeats}</span>
              </div>
            </div>

            {/* Gross Revenue Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Day Revenue
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  BDT {dayAnalytics.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 space-y-0.5 text-[10px] text-slate-600 font-mono">
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-bold">Paid / Confirmed:</span>
                  <span>BDT {dayAnalytics.collectedRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700 font-bold">Due / On-Board:</span>
                  <span>BDT {dayAnalytics.dueRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Passenger Demographics & Booking Channels */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Passenger Split & Channels
            </h4>

            {/* Male vs Female Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="text-sky-700 flex items-center gap-1">
                  <span>Male: {dayAnalytics.malePassengers}</span>
                </span>
                <span className="text-rose-700 flex items-center gap-1">
                  <span>Female: {dayAnalytics.femalePassengers}</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-sky-500 h-full"
                  style={{
                    width: `${
                      dayAnalytics.soldSeats > 0
                        ? (dayAnalytics.malePassengers / dayAnalytics.soldSeats) * 100
                        : 50
                    }%`,
                  }}
                  title="Male Passengers"
                />
                <div
                  className="bg-rose-400 h-full"
                  style={{
                    width: `${
                      dayAnalytics.soldSeats > 0
                        ? (dayAnalytics.femalePassengers / dayAnalytics.soldSeats) * 100
                        : 50
                    }%`,
                  }}
                  title="Female Passengers"
                />
              </div>
            </div>

            {/* Counter vs Mobile App */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Terminal POS</span>
                  <span className="font-bold text-slate-800 font-mono">{dayAnalytics.counterBookings} seats</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Mobile App</span>
                  <span className="font-bold text-slate-800 font-mono">{dayAnalytics.mobileAppBookings} seats</span>
                </div>
              </div>
            </div>

          </div>

          {/* Coach Schedule Table for Selected Date */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scheduled Fleet ({dayAnalytics.tripsSummary.length} Coaches)</span>
              </h4>
              <span className="text-[11px] text-slate-500">Live Status</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {dayAnalytics.tripsSummary.map((trip) => (
                <div
                  key={trip.tripId}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 font-mono">
                          Coach {trip.coachNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {trip.departureTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        {trip.routeTitle}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {trip.registrationNumber} • {trip.coachType}
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenCoachSeatMatrix(trip.coachNumber, selectedDate)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Load seat matrix for this coach and date"
                    >
                      <span>View Seats</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                      <span>Occupancy: <strong className="text-slate-800">{trip.soldSeats}/{trip.seatCapacity}</strong> ({trip.occupancyRate}%)</span>
                      <span className="font-bold text-emerald-700">BDT {trip.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          trip.occupancyRate >= 75
                            ? 'bg-emerald-500'
                            : trip.occupancyRate >= 50
                            ? 'bg-sky-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${trip.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
