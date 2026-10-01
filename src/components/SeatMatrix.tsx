import React from 'react';
import { Trip, Seat, SeatStatus } from '../types/bus';
import { 
  Check, 
  Smartphone, 
  Building2, 
  Clock, 
  AlertCircle, 
  User, 
  ShieldAlert, 
  ArrowRight,
  Disc,
  Armchair,
  Layers,
  Lock
} from 'lucide-react';

interface SeatMatrixProps {
  trip: Trip;
  selectedSeats: string[];
  onToggleSeatSelection: (seatNo: string) => void;
  onOpenSeatModal: (seatNo: string) => void;
  onBookSelectedSeats: () => void;
  searchQuery: string;
  statusFilter: 'all' | 'available' | 'sold' | 'reserved';
  recentlyUpdatedSeats: string[];
  activeDeck?: 'lower' | 'upper';
  onSelectDeck?: (deck: 'lower' | 'upper') => void;
}

export const SeatMatrix: React.FC<SeatMatrixProps> = ({
  trip,
  selectedSeats,
  onToggleSeatSelection,
  onOpenSeatModal,
  onBookSelectedSeats,
  searchQuery,
  statusFilter,
  recentlyUpdatedSeats,
  activeDeck = 'lower',
  onSelectDeck,
}) => {
  const seats = trip.seats || {};
  const isDoubleDeck = trip.deckConfig === 'DOUBLE_DECK';

  // Determine row letters to display
  let rowKeys: { label: string; prefix: string; colsLeft: number[]; colsRight: number[] }[] = [];

  if (isDoubleDeck) {
    if (activeDeck === 'lower') {
      // Lower Deck: L-A to L-J (1 on left, 2 on right)
      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      rowKeys = letters.map((l) => ({
        label: l,
        prefix: `L-${l}`,
        colsLeft: [1],
        colsRight: l === 'J' ? [] : [2, 3],
      }));
    } else {
      // Upper Deck: U-A to U-E (1 on left, 2 on right)
      const letters = ['A', 'B', 'C', 'D', 'E'];
      rowKeys = letters.map((l) => ({
        label: l,
        prefix: `U-${l}`,
        colsLeft: [1],
        colsRight: [2, 3],
      }));
    }
  } else {
    // Single Deck: A to J (2+2)
    const rowCount = Math.ceil((trip.seatCapacity || 40) / 4);
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].slice(0, rowCount);
    rowKeys = letters.map((l) => ({
      label: l,
      prefix: l,
      colsLeft: [1, 2],
      colsRight: [3, 4],
    }));
  }

  const isSeatHighlighted = (seat: Seat): boolean => {
    if (!seat) return false;
    if (statusFilter !== 'all' && seat.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSeat = seat.seatNumber.toLowerCase().includes(q);
      const matchName = seat.passengerName?.toLowerCase().includes(q);
      const matchPhone = seat.phone?.toLowerCase().includes(q);
      const matchTicket = seat.ticketNumber?.toLowerCase().includes(q);
      const matchRef = seat.bookingReference?.toLowerCase().includes(q);
      const matchCounter = seat.counterName?.toLowerCase().includes(q);
      return Boolean(matchSeat || matchName || matchPhone || matchTicket || matchRef || matchCounter);
    }
    return true;
  };

  const renderSeatCard = (seatNo: string) => {
    const seat = seats[seatNo] || {
      seatNumber: seatNo,
      row: seatNo.includes('-') ? seatNo.split('-')[1].charAt(0) : seatNo.charAt(0),
      column: parseInt(seatNo.slice(-1), 10) || 1,
      status: 'available',
      fare: trip.baseFare,
    };

    const isSelected = selectedSeats.includes(seatNo);
    const isRecentlyUpdated = recentlyUpdatedSeats.includes(seatNo);
    const matchesFilter = isSeatHighlighted(seat);
    const opacityClass = matchesFilter ? 'opacity-100' : 'opacity-25 grayscale pointer-events-none';

    // Due amount calculation for display next to seat
    const seatDue = seat.dueAmount !== undefined
      ? seat.dueAmount
      : (seat.paymentStatus === 'due' ? (seat.fare || trip.baseFare) : seat.status === 'reserved' ? (seat.fare || trip.baseFare) : 0);

    let statusBg = '';
    let statusBorder = '';
    let statusBadge = null;

    if (seat.status === 'sold') {
      // Sold: RED
      statusBg = 'bg-[#dc2626] text-white';
      statusBorder = 'border-red-800 shadow-sm';
      statusBadge = (
        <span className="flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-950 text-white uppercase tracking-wider">
          SOLD
        </span>
      );
    } else if (seat.status === 'reserved') {
      // Reserved: YELLOW
      statusBg = 'bg-[#eab308] text-slate-950';
      statusBorder = 'border-yellow-600 shadow-sm';
      statusBadge = (
        <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-yellow-950 text-amber-300 uppercase tracking-wider">
          <Clock className="w-3 h-3 inline stroke-[2.5]" /> HOLD
        </span>
      );
    } else if (seat.status === 'locked') {
      // Locked: BLACK
      statusBg = 'bg-black text-white';
      statusBorder = 'border-black shadow-sm';
      statusBadge = (
        <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-white uppercase tracking-wider border border-slate-700">
          <Lock className="w-3 h-3 inline stroke-[2.5]" /> LOCKED
        </span>
      );
    } else {
      // Available: WHITE
      statusBg = 'bg-white hover:bg-slate-50 text-slate-900';
      statusBorder = 'border-slate-300 hover:border-slate-400 shadow-xs';
      statusBadge = (
        <span className="text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
          BDT {seat.fare || trip.baseFare}
        </span>
      );
    }

    if (isSelected) {
      statusBg = 'bg-indigo-700 text-white';
      statusBorder = 'border-indigo-400 ring-4 ring-indigo-400/40 shadow-lg';
    }

    return (
      <div
        key={seatNo}
        onClick={() => {
          if (seat.status === 'available') {
            onToggleSeatSelection(seatNo);
          } else {
            onOpenSeatModal(seatNo);
          }
        }}
        onDoubleClick={() => onOpenSeatModal(seatNo)}
        className={`group relative flex flex-col justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${statusBg} ${statusBorder} ${opacityClass} ${
          isRecentlyUpdated ? 'animate-bounce ring-4 ring-emerald-400' : ''
        } min-h-[105px]`}
        title={`Seat ${seatNo}: ${seat.status.toUpperCase()} ${
          seat.passengerName ? ` - ${seat.passengerName}` : ''
        } • Due: ৳${seatDue}`}
      >
        {/* Top: Seat number & Due Amount displayed next to each seat */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black tracking-tight font-mono">
              {seatNo}
            </span>
            {/* Due Amount displayed prominently next to each seat */}
            {seatDue > 0 ? (
              <span className="px-1.5 py-0.5 text-[9.5px] font-black bg-black text-white rounded font-mono shadow-xs border border-slate-700 uppercase tracking-tight">
                ৳{seatDue} DUE
              </span>
            ) : seat.status === 'sold' ? (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-black/20 text-white rounded font-mono">
                ৳0 DUE
              </span>
            ) : seat.status === 'available' ? (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded font-mono">
                Due: ৳0
              </span>
            ) : null}
            {isSelected && (
              <span className="w-4 h-4 rounded-full bg-white text-indigo-700 flex items-center justify-center font-black text-[10px]">
                ✓
              </span>
            )}
          </div>
          {statusBadge}
        </div>

        {/* Middle: Passenger or Status info */}
        <div className="my-1 overflow-hidden">
          {seat.status === 'sold' && (
            <div className="space-y-0.5">
              <p className="text-xs sm:text-[13px] font-black leading-tight truncate text-white drop-shadow-2xs">
                {seat.passengerName || 'Confirmed Passenger'}
              </p>
              <p className="text-[10px] text-red-100/90 truncate flex items-center gap-1 font-semibold">
                <span>{seat.boardingPoint || 'Mirpur-10'}</span>
                <span>→</span>
                <span>{seat.droppingPoint?.split(',')[0] || 'Sonapur'}</span>
              </p>
              {seat.ticketNumber && (
                <p className="text-[10px] font-mono text-red-200 truncate font-bold">
                  {seat.ticketNumber}
                </p>
              )}
            </div>
          )}

          {seat.status === 'reserved' && (
            <div className="space-y-0.5">
              <p className="text-xs sm:text-[13px] font-black text-slate-950 truncate leading-tight">
                {seat.passengerName || 'Reservation Hold'}
              </p>
              <p className="text-[10px] text-slate-900 font-bold truncate">
                {seat.phone || 'Phone Booking'}
              </p>
            </div>
          )}

          {seat.status === 'locked' && (
            <div className="space-y-0.5">
              <p className="text-xs sm:text-[13px] font-black text-white truncate leading-tight">
                {seat.passengerName || 'Locked Seat'}
              </p>
              <p className="text-[10px] text-slate-300 font-bold truncate">
                Terminal Locked
              </p>
            </div>
          )}

          {seat.status === 'available' && !isSelected && (
            <div className="flex flex-col items-center justify-center py-1 text-center">
              <span className="text-xs font-black text-slate-700 group-hover:hidden tracking-wide uppercase">
                Available
              </span>
              <span className="text-[11px] font-black text-slate-900 hidden group-hover:block bg-slate-100 border border-slate-300 px-2 py-0.5 rounded uppercase">
                + Select Seat
              </span>
            </div>
          )}

          {isSelected && (
            <div className="text-center py-1">
              <span className="text-xs font-black text-white bg-indigo-900/80 px-2 py-0.5 rounded tracking-wide uppercase">
                Selected
              </span>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between pt-1 border-t border-black/10 text-[10px] font-bold opacity-85">
          <span className="uppercase tracking-wider">
            {seat.column === 1 ? 'Window' : seat.column === 4 || (isDoubleDeck && seat.column === 3) ? 'Window' : 'Aisle'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSeatModal(seatNo);
            }}
            className="underline font-bold hover:opacity-100 cursor-pointer"
          >
            Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="seat-matrix-wrapper bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
      
      {/* Double Deck Selector if Coach is Double-Decker */}
      {isDoubleDeck && (
        <div className="flex items-center justify-between bg-gradient-to-r from-red-50 via-slate-50 to-emerald-50 p-2.5 rounded-2xl border border-slate-300">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                Double-Deck Scania Coach ({trip.seatMatrixLayout})
              </span>
              <span className="text-xs text-slate-600 font-medium">
                1+2 VIP Layout: Single seat on Door side (Left), Double seats on Driver side (Right)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => onSelectDeck && onSelectDeck('lower')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeDeck === 'lower'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Lower Deck (28 VIP)
            </button>
            <button
              onClick={() => onSelectDeck && onSelectDeck('upper')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeDeck === 'upper'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Upper Deck (15 VIP)
            </button>
          </div>
        </div>
      )}

      {/* Legend: Available (White), Locked (Black), Sold (Red), Reserved (Yellow), Selected (Indigo) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/90 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Armchair className="w-4 h-4 text-slate-600" />
            Legend:
          </span>
          
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-white border-2 border-slate-400 shadow-2xs"></div>
            <span className="font-bold text-slate-800">Available</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-black border border-black shadow-2xs"></div>
            <span className="font-bold text-slate-800">Locked</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#dc2626] border border-red-800 shadow-2xs"></div>
            <span className="font-bold text-slate-800">Sold</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#eab308] border border-yellow-600 shadow-2xs"></div>
            <span className="font-bold text-slate-800">Reserved</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-indigo-700 border border-indigo-400 ring-2 ring-indigo-300 shadow-2xs"></div>
            <span className="font-bold text-slate-800">Selected</span>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-semibold">
          Coach: <strong className="text-slate-900 font-mono text-sm">{trip.coachNumber}</strong> • {trip.routeTitle}
        </div>
      </div>

      {/* Luxury Bus Body Container */}
      <div className="max-w-2xl mx-auto bg-slate-100 p-4 sm:p-6 rounded-3xl border-4 border-slate-300 shadow-inner relative">
        
        {/* Front Windshield Curved Glass & Cabin Head */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-700 rounded-t-2xl p-3 text-white mb-6 border-b-2 border-emerald-500 shadow-md">
          <div className="flex items-center justify-between text-xs px-2 pb-2 border-b border-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-black tracking-widest text-emerald-300 uppercase text-xs">
                {isDoubleDeck ? (activeDeck === 'upper' ? 'UPPER DECK WINDSHIELD' : 'LOWER CABIN FRONT') : 'FRONT WINDSHIELD'}
              </span>
            </div>
            <span className="font-mono text-slate-300 font-bold text-xs">
              {trip.registrationNumber} • Coach {trip.coachNumber}
            </span>
          </div>

          {/* Cabin Layout Header: Door on Left, Driver on Right */}
          <div className="flex items-center justify-between mt-3 px-2">
            
            {/* Passenger Entry Stairs (Door side: Left single seat) */}
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-emerald-500/50">
              <div className="flex flex-col space-y-0.5">
                <span className="w-6 h-1.5 bg-emerald-400 rounded-full"></span>
                <span className="w-5 h-1.5 bg-emerald-400/70 rounded-full"></span>
                <span className="w-4 h-1.5 bg-emerald-400/40 rounded-full"></span>
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-black text-emerald-300 block uppercase">
                  {isDoubleDeck ? 'Door (Single Seat)' : 'Passenger Door'}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">Entrance</span>
              </div>
            </div>

            {/* Central Gangway Entrance Arrow */}
            <div className="text-center text-slate-400 hidden sm:block">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-widest block font-mono">
                {isDoubleDeck ? '1+2 VIP AISLE' : 'CENTRAL AISLE'}
              </span>
              <span className="text-sm font-bold">↓</span>
            </div>

            {/* Driver Cockpit (Driver side: Right double seats) */}
            <div className="flex items-center gap-2.5 bg-slate-900/80 px-3 py-2 rounded-xl border border-red-500/50">
              <div className="w-7 h-7 rounded-full border-2 border-dashed border-red-400 flex items-center justify-center">
                <Disc className="w-4 h-4 text-red-300" />
              </div>
              <div className="text-right">
                <span className="text-[11px] sm:text-xs font-black text-red-300 block uppercase">
                  {isDoubleDeck ? 'Driver (Double Seats)' : 'Driver Cabin'}
                </span>
                <span className="text-[10px] text-slate-300 font-medium">{trip.driverName?.split(' ')[0] || 'Captain'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Bus Seat Rows Matrix */}
        <div className="space-y-3.5">
          {rowKeys.map((row) => (
            <div key={row.prefix} className="flex items-center justify-between gap-2 sm:gap-4">
              
              {/* Left Column(s) */}
              <div className={`grid ${row.colsLeft.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 ${row.colsLeft.length === 1 ? 'w-24 sm:w-28' : 'flex-1'}`}>
                {row.colsLeft.map((col) => {
                  const seatNo = `${row.prefix}${col}`;
                  return renderSeatCard(seatNo);
                })}
              </div>

              {/* Central Gangway / Aisle */}
              <div className="w-8 sm:w-12 flex flex-col items-center justify-center text-center select-none">
                <span className="text-xs sm:text-sm font-black text-slate-600 font-mono bg-white px-2.5 py-1 rounded-full border border-slate-300 shadow-2xs">
                  {row.label}
                </span>
              </div>

              {/* Right Column(s) */}
              <div className={`grid ${row.colsRight.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 flex-1`}>
                {row.colsRight.map((col) => {
                  const seatNo = `${row.prefix}${col}`;
                  return renderSeatCard(seatNo);
                })}
                {row.colsRight.length === 0 && (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-[10px] text-slate-400 font-semibold p-2 text-center">
                    Rear Engine Area
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Bus Rear & Emergency Exit */}
        <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-xs text-slate-600 px-2">
          <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 font-bold text-[11px]">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>EMERGENCY EXIT</span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono font-bold">
            {trip.coachType} • Lal Sabuj Fleet
          </div>
        </div>

      </div>

      {/* Floating Action Bar for Selected Seats */}
      {selectedSeats.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md">
              {selectedSeats.length}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">
                Selected Seats: <span className="font-mono text-emerald-300 font-extrabold text-sm">{selectedSeats.join(', ')}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Total Base Fare: <span className="font-bold text-white">BDT {(selectedSeats.length * trip.baseFare).toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleSeatSelection('')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={onBookSelectedSeats}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg border border-emerald-400 transition-all transform active:scale-95"
            >
              <span>Book / Reserve Selected ({selectedSeats.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
