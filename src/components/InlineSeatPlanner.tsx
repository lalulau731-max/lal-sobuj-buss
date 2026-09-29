import React, { useState, useMemo } from 'react';
import { Trip, Seat, SeatStatus, Gender, PaymentStatus } from '../types/bus';
import { 
  RotateCw, 
  Check, 
  User, 
  Users, 
  Phone, 
  CreditCard, 
  Tag, 
  FileText, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface InlineSeatPlannerProps {
  trip: Trip;
  journeyDate: string;
  onClose: () => void;
  onConfirmBooking: (
    updates: Record<string, Partial<Seat>>,
    meta: {
      action: 'sold' | 'reserved';
      source: 'counter';
      passengerName: string;
      counterOrUser: string;
    }
  ) => void;
  onOpenChalan: () => void;
  onRefresh: () => void;
}

export const InlineSeatPlanner: React.FC<InlineSeatPlannerProps> = ({
  trip,
  journeyDate,
  onClose,
  onConfirmBooking,
  onOpenChalan,
  onRefresh,
}) => {
  // Mode: Sell (Direct Sale) or Book (Reservation Hold)
  const [activeMode, setActiveMode] = useState<'sell' | 'book'>('sell');

  // Multi-seat selection state
  const [selectedSeatNos, setSelectedSeatNos] = useState<string[]>([]);

  // Double decker switch (if coach is double decker)
  const isDoubleDeck = trip.deckConfig === 'DOUBLE_DECK';
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');

  // Passenger & Stoppage form state
  const [passengerName, setPassengerName] = useState<string>('');
  const [passengerPhone, setPassengerPhone] = useState<string>('');
  const [passengerGender, setPassengerGender] = useState<Gender>('male');
  
  // Boarding & Dropping defaults from coach
  const boardingOptions = useMemo(() => {
    if (trip.rawCoach?.boardingPoints) {
      return trip.rawCoach.boardingPoints.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return ['North', 'Mirpur-10 05:30 AM', 'Arambagh', 'Sayedabad'];
  }, [trip]);

  const droppingOptions = useMemo(() => {
    if (trip.rawCoach?.droppingPoints) {
      return trip.rawCoach.droppingPoints.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return ['Noakhali 12:25 PM', 'Sonapur', 'Maijdee', 'Raipur', 'Chittagong'];
  }, [trip]);

  const [boardingPoint, setBoardingPoint] = useState<string>(boardingOptions[0] || 'Mirpur-10');
  const [droppingPoint, setDroppingPoint] = useState<string>(droppingOptions[0] || 'Sonapur');
  const [remarks, setRemarks] = useState<string>('');

  // Payment state
  const baseFarePerSeat = trip.baseFare || 650;
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountPerSeat, setDiscountPerSeat] = useState<number>(0);

  // Seat toggle handler
  const handleToggleSeat = (seatNo: string) => {
    const seat = trip.seats[seatNo];
    if (!seat) return;
    if (seat.status === 'sold' || seat.status === 'locked') return;

    if (selectedSeatNos.includes(seatNo)) {
      setSelectedSeatNos((prev) => prev.filter((s) => s !== seatNo));
    } else {
      setSelectedSeatNos((prev) => [...prev, seatNo]);
    }
  };

  // Inventory counts
  const allSeatList = Object.values(trip.seats || {});
  const availableCount = allSeatList.filter((s) => s.status === 'available').length;
  const soldCount = allSeatList.filter((s) => s.status === 'sold' || s.status === 'locked').length;
  const bookedCount = allSeatList.filter((s) => s.status === 'reserved').length;

  // Payment calculations
  const seatCount = selectedSeatNos.length;
  const subtotal = seatCount * baseFarePerSeat;
  const totalDiscount = discountPercent > 0 
    ? Math.round((subtotal * discountPercent) / 100)
    : discountPerSeat * seatCount;
  const totalPayable = Math.max(0, subtotal - totalDiscount);

  // Group seats by row for 2+2 layout or Double Deck
  const rows = useMemo(() => {
    const seatMap: Record<string, Seat> = trip.seats || {};
    const rowObj: Record<string, { col1?: Seat; col2?: Seat; col3?: Seat; col4?: Seat }> = {};

    Object.values(seatMap).forEach((s) => {
      // Filter by deck if double decker
      if (isDoubleDeck) {
        if (activeDeck === 'lower' && !s.seatNumber.startsWith('L-')) return;
        if (activeDeck === 'upper' && !s.seatNumber.startsWith('U-')) return;
      }

      // Determine row letter
      const rKey = s.row.replace(/^[LU]-/, '');
      if (!rowObj[rKey]) rowObj[rKey] = {};

      if (s.column === 1) rowObj[rKey].col1 = s;
      else if (s.column === 2) rowObj[rKey].col2 = s;
      else if (s.column === 3) rowObj[rKey].col3 = s;
      else if (s.column === 4) rowObj[rKey].col4 = s;
    });

    return Object.entries(rowObj).sort(([a], [b]) => a.localeCompare(b));
  }, [trip.seats, isDoubleDeck, activeDeck]);

  // Submission handler
  const handleConfirmAction = () => {
    if (selectedSeatNos.length === 0) {
      alert('Please click on at least one available seat to select it.');
      return;
    }

    const updates: Record<string, Partial<Seat>> = {};
    const pName = passengerName.trim() || 'Counter Passenger';
    const pPhone = passengerPhone.trim() || '01711-000000';
    const txnNumber = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;

    selectedSeatNos.forEach((seatNo) => {
      updates[seatNo] = {
        status: activeMode === 'sell' ? 'sold' : 'reserved',
        passengerName: pName,
        phone: pPhone,
        gender: passengerGender,
        boardingPoint,
        droppingPoint,
        fare: baseFarePerSeat,
        ticketNumber: txnNumber,
        paymentStatus: activeMode === 'sell' ? 'paid' : 'due',
        remarks: remarks || (activeMode === 'sell' ? 'Counter POS Sale' : 'Counter Hold Reservation'),
        bookedVia: 'counter',
        bookedAt: new Date().toISOString(),
        counterName: 'Mirpur-10 Terminal',
      };
    });

    onConfirmBooking(updates, {
      action: activeMode === 'sell' ? 'sold' : 'reserved',
      source: 'counter',
      passengerName: pName,
      counterOrUser: 'Terminal Counter (Mirpur-10)',
    });

    // Reset local selection & form
    setSelectedSeatNos([]);
    setPassengerName('');
    setPassengerPhone('');
    setRemarks('');
  };

  return (
    <div className="bg-[#fcfaff] border-t-2 border-purple-500 p-3 sm:p-4 rounded-b-lg shadow-inner animate-in fade-in duration-150">
      
      {/* Top Strip (Coach No, Sub Route, Sell / Book / Passenger List) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-purple-100">
        
        {/* Left: Coach No & Date */}
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Coach No</span>
            <span className="font-extrabold text-amber-700 text-sm sm:text-base font-mono">
              {trip.coachNumber}
            </span>
            <span className="text-[11px] text-slate-600 ml-2 font-mono">
              {journeyDate} {trip.departureTime}
            </span>
          </div>

          {/* Select Sub Route Dropdown */}
          <div className="hidden sm:block">
            <select className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-purple-600 shadow-2xs">
              <option>{trip.source} - {trip.destination} - BDT {baseFarePerSeat}.00</option>
              <option>North - Noakhali - BDT 650.00</option>
              <option>North - Sonapur - BDT 700.00</option>
              <option>North - Chittagong - BDT 800.00</option>
            </select>
          </div>
        </div>

        {/* Right: Sell / Book / Passenger List Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveMode('sell')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeMode === 'sell'
                ? 'bg-[#661d7a] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Sell
          </button>

          <button
            onClick={() => setActiveMode('book')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeMode === 'book'
                ? 'bg-[#661d7a] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Book
          </button>

          <button
            onClick={onOpenChalan}
            className="px-3 py-1 text-xs font-semibold rounded bg-[#661d7a] hover:bg-[#521563] text-white transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="View Passenger Manifest & Chalan Sheet"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Passanger List</span>
          </button>
        </div>

      </div>

      {/* Inventory Counts & Refresh Bar (Exact Match to Image 2) */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded">
            Available {availableCount}
          </span>
          <span className="bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded">
            Sold {soldCount}
          </span>
          <span className="bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded">
            Booked {bookedCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isDoubleDeck && (
            <div className="flex items-center bg-purple-100/70 p-0.5 rounded text-xs">
              <button
                onClick={() => setActiveDeck('lower')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  activeDeck === 'lower' ? 'bg-[#661d7a] text-white' : 'text-purple-900 hover:bg-purple-200/60'
                }`}
              >
                Lower VIP
              </button>
              <button
                onClick={() => setActiveDeck('upper')}
                className={`px-2 py-0.5 rounded font-bold transition-colors ${
                  activeDeck === 'upper' ? 'bg-[#661d7a] text-white' : 'text-purple-900 hover:bg-purple-200/60'
                }`}
              >
                Upper VIP
              </button>
            </div>
          )}

          <button
            onClick={onRefresh}
            className="bg-[#661d7a] hover:bg-[#521563] text-white text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
            title="Refresh latest seats from Firebase"
          >
            <RotateCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Section: Left Seat Cabin Grid + Right Passenger & Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-1">
        
        {/* Left: Seat Grid Container (Matching Reference Image 2) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          
          <div className="w-full max-w-sm bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            
            {/* Cabin Header: Door on Left, Driver on Right */}
            <div className="bg-[#e0f2f1] text-[#00695c] font-bold text-xs px-4 py-2 flex items-center justify-between border-b border-teal-200">
              <span className="uppercase tracking-wider text-[11px]">Door</span>
              <div className="flex items-center gap-1">
                <span className="uppercase tracking-wider text-[11px]">Driver</span>
                <span className="text-base leading-none">✇</span>
              </div>
            </div>

            {/* Seat Matrix Grid */}
            <div className="p-3 space-y-2 select-none">
              {rows.map(([rowLetter, cols]) => {
                const s1 = cols.col1;
                const s2 = cols.col2;
                const s3 = cols.col3;
                const s4 = cols.col4;

                const renderSeatBtn = (seat?: Seat) => {
                  if (!seat) {
                    return <div className="w-9 h-8 sm:w-10 sm:h-9" />;
                  }

                  const isSold = seat.status === 'sold' || seat.status === 'locked';
                  const isBooked = seat.status === 'reserved';
                  const isSelected = selectedSeatNos.includes(seat.seatNumber);

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={isSold}
                      onClick={() => handleToggleSeat(seat.seatNumber)}
                      title={`${seat.seatNumber} • ${seat.status.toUpperCase()} ${seat.passengerName ? `(${seat.passengerName})` : ''}`}
                      className={`w-9 h-8 sm:w-10 sm:h-9 rounded text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                          : isSold
                          ? 'bg-[#e57373] text-white border border-red-300 opacity-90 cursor-not-allowed'
                          : isBooked
                          ? 'bg-amber-400 text-slate-900 border border-amber-500'
                          : 'bg-white hover:bg-purple-50 text-slate-800 border border-slate-300 hover:border-purple-400 shadow-2xs'
                      }`}
                    >
                      <span className="font-mono">{seat.seatNumber.replace(/^[LU]-/, '')}</span>
                      {isSelected && (
                        <Check className="w-2.5 h-2.5 absolute top-0.5 right-0.5" />
                      )}
                    </button>
                  );
                };

                return (
                  <div key={rowLetter} className="flex items-center justify-between px-2">
                    
                    {/* Left Pair */}
                    <div className="flex items-center gap-1.5">
                      {renderSeatBtn(s1)}
                      {renderSeatBtn(s2)}
                    </div>

                    {/* Central Aisle (COR) */}
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono px-1">
                      COR
                    </div>

                    {/* Right Pair */}
                    <div className="flex items-center gap-1.5">
                      {renderSeatBtn(s3)}
                      {renderSeatBtn(s4)}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Color Swatches Bar (Reference Image 2) */}
            <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex items-center justify-center gap-2 text-[10px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-white border border-slate-400" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-600 text-white" />
                <span>Selected</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-[#e57373]" />
                <span>Sold</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span>Booked</span>
              </span>
            </div>

          </div>

          {/* Selected Seat Count Pill */}
          <div className="mt-2 text-xs font-semibold text-purple-900 font-mono">
            {selectedSeatNos.length > 0 ? (
              <span>Selected Seats: <strong>{selectedSeatNos.join(', ')}</strong> ({selectedSeatNos.length})</span>
            ) : (
              <span className="text-slate-500">Click seats on cabin grid to select</span>
            )}
          </div>

        </div>

        {/* Right: Passenger Details & Payment Form (Reference Image 2) */}
        <div className="lg:col-span-6 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-300 shadow-xs space-y-3.5">
          
          {/* Passenger Details Header */}
          <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Passenger Details
            </h4>
            <span className="text-[11px] text-purple-800 font-semibold font-mono">
              Mode: {activeMode.toUpperCase()}
            </span>
          </div>

          {/* Passenger Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Passenger Name *</label>
              <input
                type="text"
                placeholder="e.g. Md. Tariqul Islam"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mobile Phone *</label>
              <input
                type="tel"
                placeholder="01712-XXXXXX"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 font-mono"
              />
            </div>
          </div>

          {/* Stoppage: Boarding & Dropping Dropdowns (Exact Match to Image 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Boarding *</label>
              <select
                value={boardingPoint}
                onChange={(e) => setBoardingPoint(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              >
                {boardingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Dropping *</label>
              <select
                value={droppingPoint}
                onChange={(e) => setDroppingPoint(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              >
                {droppingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <div className="space-y-0.5">
              <label className="block text-[11px] font-bold text-slate-700">Gender</label>
              <div className="flex items-center gap-4 text-xs text-slate-700 pt-0.5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={passengerGender === 'male'}
                    onChange={() => setPassengerGender('male')}
                    className="accent-purple-700"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={passengerGender === 'female'}
                    onChange={() => setPassengerGender('female')}
                    className="accent-purple-700"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Remarks</label>
              <input
                type="text"
                placeholder="Optional remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* Payment Section (Exact Match to Image 2) */}
          <div className="border-t border-slate-200 pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Payment</h5>
              <div className="flex items-center gap-1 text-xs text-slate-700">
                <span className="font-semibold">Pay By:</span>
                <label className="flex items-center gap-1 cursor-pointer ml-1">
                  <input type="radio" checked readOnly className="accent-purple-700" />
                  <span>Cash</span>
                </label>
              </div>
            </div>

            {/* Per Seat & Discount Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Per Seat</span>
                <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                  BDT {baseFarePerSeat.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Discount %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ''}
                  onChange={(e) => {
                    setDiscountPercent(Number(e.target.value) || 0);
                    setDiscountPerSeat(0);
                  }}
                  placeholder="0"
                  className="w-full border border-slate-300 rounded px-1.5 py-0.5 font-mono text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Total Discount</span>
                <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                  BDT {totalDiscount.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Seats Total</span>
                <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
                  BDT {subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total Payable Banner (Large Text matching Image 2) */}
            <div className="pt-2 text-center">
              <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Total Payable: <span className="text-purple-900 font-mono">BDT {totalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Selling Button (Large solid purple button matching Image 2) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={selectedSeatNos.length === 0}
                className={`w-full py-2.5 rounded font-bold text-xs sm:text-sm text-white shadow-sm transition-all cursor-pointer ${
                  selectedSeatNos.length > 0
                    ? 'bg-[#661d7a] hover:bg-[#521563] active:scale-[0.99]'
                    : 'bg-purple-300 cursor-not-allowed'
                }`}
              >
                {activeMode === 'sell' ? 'Confirm Selling' : 'Confirm Hold / Reservation'}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
