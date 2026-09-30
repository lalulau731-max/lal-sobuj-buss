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
            <div className="bg-[#e0f2f1] text-[#00695c] font-bold text-xs sm:text-sm px-4 py-2 flex items-center justify-between border-b border-teal-200">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs">
                  {isDoubleDeck ? 'Door (Single Seat)' : 'Passenger Door'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs">
                  {isDoubleDeck ? 'Driver Side (Double Seats)' : 'Driver Cabin'}
                </span>
                <span className="text-base leading-none">✇</span>
              </div>
            </div>

            {/* Seat Matrix Grid */}
            <div className="p-3.5 space-y-3 select-none">
              {rows.map(([rowLetter, cols]) => {
                const s1 = cols.col1;
                const s2 = cols.col2;
                const s3 = cols.col3;
                const s4 = cols.col4;

                const renderSeatBtn = (seat?: Seat) => {
                  if (!seat) {
                    return <div className="w-11 h-10 sm:w-13 sm:h-11" />;
                  }

                  const isSold = seat.status === 'sold';
                  const isLocked = seat.status === 'locked'; // Processing / Locked
                  const isReserved = seat.status === 'reserved';
                  const isSelected = selectedSeatNos.includes(seat.seatNumber);
                  const isAvailable = seat.status === 'available';

                  // Strict Color-coding:
                  // Red for sold
                  // Green for available
                  // Yellow for reserved
                  // Distinct Royal Blue for processing
                  // Indigo for operator selected
                  let seatColors = '';
                  if (isSelected) {
                    seatColors = 'bg-indigo-700 text-white shadow-md ring-3 ring-indigo-400 border-2 border-indigo-400';
                  } else if (isSold) {
                    seatColors = 'bg-[#dc2626] text-white border-2 border-red-800 opacity-95 cursor-not-allowed';
                  } else if (isLocked) {
                    seatColors = 'bg-blue-600 text-white border-2 border-blue-800 animate-pulse cursor-not-allowed';
                  } else if (isReserved) {
                    seatColors = 'bg-[#eab308] hover:bg-[#ca8a04] text-slate-950 font-black border-2 border-yellow-600';
                  } else {
                    // Available: GREEN
                    seatColors = 'bg-[#16a34a] hover:bg-[#15803d] text-white border-2 border-emerald-700 shadow-xs cursor-pointer';
                  }

                  return (
                    <button
                      key={seat.seatNumber}
                      type="button"
                      disabled={isSold || isLocked}
                      onClick={() => handleToggleSeat(seat.seatNumber)}
                      title={`${seat.seatNumber} • ${seat.status.toUpperCase()} ${seat.passengerName ? `(${seat.passengerName})` : ''}`}
                      className={`w-11 h-10 sm:w-13 sm:h-11 rounded-xl text-sm sm:text-base font-black transition-all flex items-center justify-center relative ${seatColors}`}
                    >
                      <span className="font-mono tracking-tight">{seat.seatNumber.replace(/^[LU]-/, '')}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 absolute top-1 right-1 stroke-[3]" />
                      )}
                    </button>
                  );
                };

                return (
                  <div key={rowLetter} className="flex items-center justify-between px-2">
                    
                    {/* Double Decker (1+2 Layout): Single Seat on Door Side (Left) */}
                    {isDoubleDeck ? (
                      <div className="flex items-center justify-center w-11 sm:w-13">
                        {renderSeatBtn(s1)}
                      </div>
                    ) : (
                      /* Single Deck (2+2 Layout): Left Pair */
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {renderSeatBtn(s1)}
                        {renderSeatBtn(s2)}
                      </div>
                    )}

                    {/* Central Aisle with Clear Row Letter */}
                    <div className="flex flex-col items-center justify-center px-2 select-none min-w-[36px]">
                      <span className="text-xs sm:text-sm font-black text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-300 shadow-2xs">
                        {rowLetter}
                      </span>
                    </div>

                    {/* Double Decker (1+2 Layout): Double Seats on Driver Side (Right) */}
                    {isDoubleDeck ? (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {renderSeatBtn(s2)}
                        {renderSeatBtn(s3)}
                      </div>
                    ) : (
                      /* Single Deck (2+2 Layout): Right Pair */
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {renderSeatBtn(s3)}
                        {renderSeatBtn(s4)}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Bottom Color Swatches Bar: Green=Available, Red=Sold, Yellow=Reserved, Blue=Processing */}
            <div className="bg-slate-50 px-3.5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs sm:text-sm font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#16a34a] border-2 border-emerald-700" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#dc2626] border-2 border-red-800" />
                <span>Sold</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#eab308] border-2 border-yellow-600" />
                <span>Reserved</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-blue-600 border-2 border-blue-800 animate-pulse" />
                <span>Processing</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-indigo-700 border-2 border-indigo-400" />
                <span>Selected</span>
              </span>
            </div>

          </div>

          {/* Selected Seat Count Pill */}
          <div className="mt-2.5 text-xs sm:text-sm font-bold text-[#006837] font-mono">
            {selectedSeatNos.length > 0 ? (
              <span>Selected Seats: <strong className="text-slate-950 font-black text-sm sm:text-base">{selectedSeatNos.join(', ')}</strong> ({selectedSeatNos.length})</span>
            ) : (
              <span className="text-slate-500 font-sans">Click seats on cabin grid to select</span>
            )}
          </div>

        </div>

        {/* Right: Passenger Details & Payment Form (Reference Image 2) */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-xl border border-slate-300 shadow-xs space-y-4">
          
          {/* Passenger Details Header */}
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Passenger Details
            </h4>
            <span className="text-xs text-[#006837] font-extrabold font-mono uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Mode: {activeMode.toUpperCase()}
            </span>
          </div>

          {/* Passenger Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1">Passenger Name *</label>
              <input
                type="text"
                placeholder="e.g. Md. Tariqul Islam"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                placeholder="01712-XXXXXX"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200 font-mono font-medium"
              />
            </div>
          </div>

          {/* Stoppage: Boarding & Dropping Dropdowns (Exact Match to Image 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1">Boarding Counter *</label>
              <select
                value={boardingPoint}
                onChange={(e) => setBoardingPoint(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200 font-bold"
              >
                {boardingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1">Dropping Point *</label>
              <select
                value={droppingPoint}
                onChange={(e) => setDroppingPoint(e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl px-3 py-2 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200 font-bold"
              >
                {droppingOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900">Gender</label>
              <div className="flex items-center gap-5 text-sm text-slate-800 font-bold pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={passengerGender === 'male'}
                    onChange={() => setPassengerGender('male')}
                    className="accent-[#006837] w-4 h-4"
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    checked={passengerGender === 'female'}
                    onChange={() => setPassengerGender('female')}
                    className="accent-[#006837] w-4 h-4"
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-extrabold text-slate-900 mb-1">Remarks</label>
              <input
                type="text"
                placeholder="Optional remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-[#006837] focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          {/* Payment Section (Exact Match to Image 2) */}
          <div className="border-t border-slate-200 pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900">Payment Breakdown</h5>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-800">
                <span className="font-extrabold">Pay By:</span>
                <label className="flex items-center gap-1 cursor-pointer ml-1 font-bold">
                  <input type="radio" checked readOnly className="accent-[#006837] w-4 h-4" />
                  <span>Cash</span>
                </label>
              </div>
            </div>

            {/* Per Seat & Discount Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Per Seat</span>
                <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
                  BDT {baseFarePerSeat.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Discount %</span>
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
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:border-[#006837]"
                />
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Total Discount</span>
                <span className="font-mono font-black text-red-600 text-sm sm:text-base">
                  - BDT {totalDiscount.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block uppercase">Seats Total</span>
                <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
                  BDT {subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total Payable Banner (Large Bold Text matching Lal Sabuj website) */}
            <div className="pt-2 text-center bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
              <div className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                Total Payable: <span className="text-[#006837] font-mono text-xl sm:text-2xl font-black ml-1">BDT {totalPayable.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirm Selling Button (Large solid button matching Lal Sabuj style) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={selectedSeatNos.length === 0}
                className={`w-full py-3 rounded-xl font-black text-sm sm:text-base text-white shadow-md transition-all cursor-pointer ${
                  selectedSeatNos.length > 0
                    ? activeMode === 'sell'
                      ? 'bg-[#006837] hover:bg-[#00522c] active:scale-[0.99] border-2 border-emerald-800'
                      : 'bg-[#661d7a] hover:bg-[#521563] active:scale-[0.99] border-2 border-purple-800'
                    : 'bg-slate-300 border-2 border-slate-400 cursor-not-allowed text-slate-500'
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
