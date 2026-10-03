import React, { useState, useEffect } from 'react';
import { Trip, Seat, Gender, PaymentStatus, BookedVia } from '../types/bus';
import { BOARDING_POINTS, DROPPING_POINTS, COUNTERS } from '../data/mockTrips';
import { 
  X, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Printer, 
  Smartphone, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  CreditCard, 
  Tag, 
  AlertTriangle 
} from 'lucide-react';

interface SeatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatNumbers: string[];
  trip: Trip;
  onConfirmBooking: (
    seatNumbers: string[],
    data: {
      passengerName: string;
      phone: string;
      gender: Gender;
      boardingPoint: string;
      droppingPoint: string;
      fare: number;
      paymentStatus: PaymentStatus;
      counterName: string;
      remarks: string;
    }
  ) => void;
  onConfirmReservation: (
    seatNumbers: string[],
    data: {
      reservedFor: string;
      phone: string;
      counterName: string;
      holdMinutes: number;
      remarks: string;
    }
  ) => void;
  onReleaseSeats: (seatNumbers: string[]) => void;
  onPrintTicket: (seatNumber: string) => void;
}

export const SeatDetailsModal: React.FC<SeatDetailsModalProps> = ({
  isOpen,
  onClose,
  seatNumbers,
  trip,
  onConfirmBooking,
  onConfirmReservation,
  onReleaseSeats,
  onPrintTicket,
}) => {
  const isMulti = seatNumbers.length > 1;
  const primarySeatNo = seatNumbers[0] || '';
  const primarySeat: Seat = (trip?.seats && primarySeatNo ? trip.seats[primarySeatNo] : null) || {
    seatNumber: primarySeatNo || 'A1',
    row: primarySeatNo ? primarySeatNo.charAt(0) : 'A',
    column: 1,
    status: 'available',
    fare: trip?.baseFare || 700,
  };

  const initialStatus = isMulti ? 'available' : primarySeat.status;

  const [activeTab, setActiveTab] = useState<'book' | 'reserve'>('book');

  // Booking Form State
  const [passengerName, setPassengerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('017');
  const [gender, setGender] = useState<Gender>('male');
  const [boardingPoint, setBoardingPoint] = useState<string>(BOARDING_POINTS[0]);
  const [droppingPoint, setDroppingPoint] = useState<string>(DROPPING_POINTS[1]);
  const [farePerSeat, setFarePerSeat] = useState<number>(trip?.baseFare || 700);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [counterName, setCounterName] = useState<string>(COUNTERS[0]);
  const [remarks, setRemarks] = useState<string>('');

  // Reservation Form State
  const [reservedFor, setReservedFor] = useState<string>('VIP / Counter Hold');
  const [reservePhone, setReservePhone] = useState<string>('017');
  const [holdMinutes, setHoldMinutes] = useState<number>(30);
  const [reserveRemarks, setReserveRemarks] = useState<string>('');

  // Re-sync fields when modal is opened for specific seat(s)
  useEffect(() => {
    if (isOpen && seatNumbers.length > 0) {
      setActiveTab(primarySeat.status === 'reserved' ? 'reserve' : 'book');
      setPassengerName(!isMulti && primarySeat.passengerName ? primarySeat.passengerName : '');
      setPhone(!isMulti && primarySeat.phone ? primarySeat.phone : '017');
      setGender(!isMulti && primarySeat.gender ? primarySeat.gender : 'male');
      setBoardingPoint(!isMulti && primarySeat.boardingPoint ? primarySeat.boardingPoint : (trip?.startingCounter || BOARDING_POINTS[0]));
      setDroppingPoint(!isMulti && primarySeat.droppingPoint ? primarySeat.droppingPoint : (trip?.destination || DROPPING_POINTS[1]));
      setFarePerSeat(!isMulti && primarySeat.fare ? primarySeat.fare : (trip?.baseFare || 700));
      setDiscount(0);
      setPaymentStatus(!isMulti && primarySeat.paymentStatus ? primarySeat.paymentStatus : 'paid');
      setCounterName(!isMulti && primarySeat.counterName ? primarySeat.counterName : COUNTERS[0]);
      setRemarks(!isMulti && primarySeat.remarks ? primarySeat.remarks : '');

      setReservedFor(!isMulti && primarySeat.passengerName ? primarySeat.passengerName : 'VIP / Counter Hold');
      setReservePhone(!isMulti && primarySeat.phone ? primarySeat.phone : '017');
      setHoldMinutes(30);
      setReserveRemarks(!isMulti && primarySeat.remarks ? primarySeat.remarks : '');
    }
  }, [isOpen, primarySeatNo, isMulti, primarySeat.status, trip?.baseFare]);

  if (!isOpen || seatNumbers.length === 0) return null;

  const totalSeats = seatNumbers.length;
  const netFarePerSeat = Math.max(0, farePerSeat - discount);
  const totalPayable = netFarePerSeat * totalSeats;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim()) {
      alert('Please enter passenger name');
      return;
    }
    onConfirmBooking(seatNumbers, {
      passengerName: passengerName.trim(),
      phone: phone.trim(),
      gender,
      boardingPoint,
      droppingPoint,
      fare: netFarePerSeat,
      paymentStatus,
      counterName,
      remarks,
    });
    onClose();
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReservation(seatNumbers, {
      reservedFor: reservedFor.trim(),
      phone: reservePhone.trim(),
      counterName,
      holdMinutes,
      remarks: reserveRemarks,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Top Header with Lal Sabuj gradient */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-emerald-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-mono font-black text-emerald-300 text-lg border border-white/20">
              {isMulti ? `${totalSeats}x` : primarySeatNo}
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>{isMulti ? `Multi-Seat Operation (${seatNumbers.join(', ')})` : `Seat ${primarySeatNo} Details`}</span>
                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                  primarySeat.status === 'sold'
                    ? 'bg-red-500 text-white'
                    : primarySeat.status === 'reserved'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-emerald-500 text-white'
                }`}>
                  {primarySeat.status}
                </span>
              </h2>
              <p className="text-xs text-red-200 font-medium">
                {trip.routeTitle} • {trip.departureTime}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          
          {/* If the seat is ALREADY SOLD and not multi-select: Display Ticket View & Cancellation */}
          {!isMulti && primarySeat.status === 'sold' ? (
            <div className="space-y-4">
              <div className="bg-red-50/80 p-4 rounded-xl border border-red-200">
                <div className="flex items-start justify-between pb-3 border-b border-red-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      Confirmed E-Ticket
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">{primarySeat.passengerName}</h3>
                    <p className="text-xs text-slate-600 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3 text-red-600" /> {primarySeat.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-red-800 bg-red-100 px-2 py-1 rounded border border-red-300">
                      {primarySeat.ticketNumber || 'TKT-PENDING'}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-1 capitalize font-medium">
                      via {primarySeat.bookedVia?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Boarding Point</span>
                    <p className="font-semibold text-slate-800">{primarySeat.boardingPoint || 'Main Counter'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Dropping Point</span>
                    <p className="font-semibold text-slate-800">{primarySeat.droppingPoint || 'Destination'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Passenger Gender</span>
                    <p className="font-semibold text-slate-800 capitalize">{primarySeat.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Fare & Status</span>
                    <p className="font-extrabold text-emerald-700">
                      BDT {primarySeat.fare} <span className="text-[10px] font-normal text-slate-500 font-sans">({primarySeat.paymentStatus || 'Paid'})</span>
                    </p>
                  </div>
                  {primarySeat.remarks && (
                    <div className="col-span-2 bg-white/70 p-2 rounded border border-red-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Remarks</span>
                      <p className="text-xs text-slate-700">{primarySeat.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Sold Ticket */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to cancel ticket for Seat ${primarySeatNo}? This will refund the passenger and release the seat to available.`)) {
                      onReleaseSeats([primarySeatNo]);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Ticket & Release</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onPrintTicket(primarySeatNo);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white shadow-sm transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Boarding Slip</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Form Tabs: Sell Ticket vs Hold / Reserve */}
              <div className="flex border-b border-slate-200 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-all ${
                    activeTab === 'book'
                      ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sell / Book Now ({isMulti ? `${totalSeats} Seats` : primarySeatNo})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reserve')}
                  className={`flex-1 py-2.5 text-xs font-bold border-b-2 text-center transition-all ${
                    activeTab === 'reserve'
                      ? 'border-amber-500 text-amber-900 bg-amber-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hold / Reserve Seat
                </button>
              </div>

              {activeTab === 'book' ? (
                /* Book / Sell Ticket Form */
                <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
                  
                  {/* Passenger Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Passenger Name *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={passengerName}
                          onChange={(e) => setPassengerName(e.target.value)}
                          placeholder="e.g. Md. Tariqul Islam"
                          className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01712-345678"
                          className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gender Selection (Vital for Bangladesh Bus Seats) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Gender
                    </label>
                    <div className="flex items-center gap-3">
                      <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border cursor-pointer font-bold transition-all ${
                        gender === 'male'
                          ? 'bg-blue-50 border-blue-400 text-blue-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={gender === 'male'}
                          onChange={() => setGender('male')}
                          className="hidden"
                        />
                        <span>♂ Male</span>
                      </label>

                      <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border cursor-pointer font-bold transition-all ${
                        gender === 'female'
                          ? 'bg-rose-50 border-rose-400 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                          className="hidden"
                        />
                        <span>♀ Female</span>
                      </label>
                    </div>
                  </div>

                  {/* Boarding and Dropping Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Boarding Point
                      </label>
                      <select
                        value={boardingPoint}
                        onChange={(e) => setBoardingPoint(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      >
                        {BOARDING_POINTS.map((pt) => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Dropping Point
                      </label>
                      <select
                        value={droppingPoint}
                        onChange={(e) => setDroppingPoint(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                      >
                        {DROPPING_POINTS.map((pt) => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing and Payment */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fare (BDT)</label>
                      <input
                        type="number"
                        value={farePerSeat}
                        onChange={(e) => setFarePerSeat(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Discount (BDT)</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      >
                        <option value="paid">Paid (Cash / Online)</option>
                        <option value="due">Due / Pay on Board</option>
                        <option value="cash_on_board">Cash on Board</option>
                      </select>
                    </div>
                  </div>

                  {/* Issuing Counter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Issuing Counter
                    </label>
                    <select
                      value={counterName}
                      onChange={(e) => setCounterName(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      {COUNTERS.map((cnt) => (
                        <option key={cnt} value={cnt}>{cnt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Total calculation banner */}
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Net Payable</span>
                      <p className="text-lg font-black text-emerald-950 font-mono">
                        BDT {totalPayable.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-emerald-700 font-sans">
                          ({totalSeats} seat{totalSeats > 1 ? 's' : ''} @ BDT {netFarePerSeat})
                        </span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-200/80 px-2 py-1 rounded">
                      Syncs to RTDB & Chalan
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    {!isMulti && primarySeat.status === 'reserved' && (
                      <button
                        type="button"
                        onClick={() => {
                          onReleaseSeats([primarySeatNo]);
                          onClose();
                        }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Release Existing Hold
                      </button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-emerald-600 hover:from-red-700 hover:to-emerald-700 text-white shadow-md border border-emerald-400"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm & Issue Ticket</span>
                      </button>
                    </div>
                  </div>

                </form>
              ) : (
                /* Reserve / Hold Seat Form */
                <form onSubmit={handleReservationSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Reserved For / Passenger Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reservedFor}
                      onChange={(e) => setReservedFor(e.target.value)}
                      placeholder="e.g. VIP Ministry Passenger / Sayedabad Counter Block"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={reservePhone}
                      onChange={(e) => setReservePhone(e.target.value)}
                      placeholder="01712-345678"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Hold Duration
                      </label>
                      <select
                        value={holdMinutes}
                        onChange={(e) => setHoldMinutes(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>1 Hour</option>
                        <option value={120}>2 Hours</option>
                        <option value={360}>Until Coach Departure</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Counter / Channel
                      </label>
                      <select
                        value={counterName}
                        onChange={(e) => setCounterName(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      >
                        {COUNTERS.map((cnt) => (
                          <option key={cnt} value={cnt}>{cnt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Reservation Note / Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={reserveRemarks}
                      onChange={(e) => setReserveRemarks(e.target.value)}
                      placeholder="Phone reservation, passenger will arrive 30 mins before trip..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="text-[11px]">
                      This seat will be marked as <strong className="font-bold">RESERVED / HOLD</strong> across all mobile apps and counter dashboards.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md border border-amber-400"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Place Hold on {isMulti ? `${totalSeats} Seats` : `Seat ${primarySeatNo}`}</span>
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
