import React, { useState, useMemo } from 'react';
import { Trip, Seat } from '../types/bus';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Tag, 
  Printer, 
  FileText, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  Bus, 
  ShieldCheck, 
  AlertCircle,
  Hash,
  Building,
  Sparkles,
  Unlock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Edit3,
  Save,
  Users,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { BOARDING_POINTS, DROPPING_POINTS } from '../data/mockTrips';

interface OccupiedSeatInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  trip: Trip;
  onPrintTicket?: (seatNumber: string) => void;
  onOpenChalan?: () => void;
  onUnlockSeat?: (seatNumber: string) => void;
  onConfirmReservation?: (seatNumber: string) => void;
  onCancelReservation?: (seatNumber: string) => void;
  onReleaseSeat?: (seatNumber: string) => void;
  onReleaseMultipleSeats?: (seatNumbers: string[]) => void;
  onUpdateSeatStatus?: (
    seatNumbers: string[], 
    updates: Partial<Seat>, 
    metaAction: 'sold' | 'reserved' | 'released'
  ) => void;
  onSettleDuePayment?: (
    seatNumbers: string[], 
    settledAmount: number, 
    paymentMethod: string
  ) => void;
}

export const OccupiedSeatInfoModal: React.FC<OccupiedSeatInfoModalProps> = ({
  isOpen,
  onClose,
  seat,
  trip,
  onPrintTicket,
  onOpenChalan,
  onUnlockSeat,
  onConfirmReservation,
  onCancelReservation,
  onReleaseSeat,
  onReleaseMultipleSeats,
  onUpdateSeatStatus,
  onSettleDuePayment,
}) => {
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [activeSubView, setActiveSubView] = useState<'details' | 'edit' | 'settle'>('details');

  // Inline confirmation state for safe cancellation without window.confirm
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'single' | 'group';
    seatNumber?: string;
  } | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);

  // Edit form states
  const [editStatus, setEditStatus] = useState<'sold' | 'reserved' | 'locked'>('sold');
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editFare, setEditFare] = useState<number>(700);
  const [editDueAmount, setEditDueAmount] = useState<number>(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState<'paid' | 'due'>('paid');
  const [editBoarding, setEditBoarding] = useState<string>('Mirpur-10');
  const [editDropping, setEditDropping] = useState<string>('Sonapur');
  const [editScope, setEditScope] = useState<'single' | 'group'>('single');

  // Settlement form states
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMethod, setSettleMethod] = useState<string>('Cash');
  const [settleScope, setSettleScope] = useState<'single' | 'group'>('single');

  // Find all connected seats in the same group booking
  const connectedGroupSeats = useMemo(() => {
    if (!seat || !trip?.seats) return [];
    const currentTicket = seat.ticketNumber?.trim();
    const currentPhone = seat.phone?.trim();
    const currentBookingRef = seat.bookingReference?.trim();

    const map = new Map<string, Seat>();
    map.set(seat.seatNumber, seat);

    Object.values(trip.seats).forEach((s) => {
      if (s.status === 'available') return;
      // Match by exact ticket number (multi-seat POS booking)
      if (currentTicket && s.ticketNumber && s.ticketNumber.trim() === currentTicket) {
        map.set(s.seatNumber, s);
        return;
      }
      // Match by bookingReference
      if (currentBookingRef && s.bookingReference && s.bookingReference.trim() === currentBookingRef) {
        map.set(s.seatNumber, s);
        return;
      }
      // Match by phone & name when phone is valid
      if (
        currentPhone && 
        currentPhone.length >= 7 && 
        s.phone?.trim() === currentPhone && 
        s.passengerName?.trim() && 
        s.passengerName?.trim() === seat.passengerName?.trim() &&
        s.status === seat.status
      ) {
        map.set(s.seatNumber, s);
      }
    });

    return Array.from(map.values()).sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));
  }, [seat, trip?.seats]);

  const isGroup = connectedGroupSeats.length > 1;

  // Initialize edit and settle forms when modal opens or seat changes
  React.useEffect(() => {
    if (seat) {
      setActiveSubView('details');
      const st = seat.status === 'locked' ? 'locked' : seat.status === 'reserved' ? 'reserved' : 'sold';
      setEditStatus(st);
      setEditName(seat.passengerName || '');
      setEditPhone(seat.phone || '');
      setEditFare(seat.fare || trip.baseFare || 700);
      
      const due = seat.dueAmount !== undefined 
        ? seat.dueAmount 
        : (seat.paymentStatus === 'due' || seat.status === 'reserved') ? (seat.fare || trip.baseFare || 700) : 0;
      setEditDueAmount(due);
      setEditPaymentStatus(due > 0 ? 'due' : 'paid');
      setEditBoarding(seat.boardingPoint || 'Mirpur-10');
      setEditDropping(seat.droppingPoint || trip.destination || 'Sonapur');
      setEditScope('single');

      setSettleAmount(due);
      setSettleMethod('Cash');
      setSettleScope('single');
    }
  }, [seat, trip.baseFare, trip.destination]);

  if (!isOpen || !seat) return null;

  const isSold = seat.status === 'sold';
  const isReserved = seat.status === 'reserved';
  const isLocked = seat.status === 'locked';

  // Specific passenger data
  const passengerName = seat.passengerName && seat.passengerName.trim() 
    ? seat.passengerName 
    : isLocked ? 'Seat Locked (Management Hold)' : 'VIP / Counter Passenger';

  const mobileNumber = seat.phone && seat.phone.trim() ? seat.phone : 'Not Specified';
  const droppingPoint = seat.droppingPoint || trip.destination || 'Sonapur';
  const boardingPoint = seat.boardingPoint || trip.startingCounter || 'Mirpur-10';

  // Financial calculations
  const baseFare = seat.fare || trip.baseFare || 700;
  const discount = seat.discount || 0;
  const netFare = Math.max(0, baseFare - discount);

  // Paid amount calculation
  let paidAmount = 0;
  if (seat.paidAmount !== undefined) {
    paidAmount = seat.paidAmount;
  } else if (seat.paymentStatus === 'paid' || isSold) {
    paidAmount = netFare;
  } else {
    paidAmount = 0;
  }

  // Due amount calculation
  let dueAmount = 0;
  if (seat.dueAmount !== undefined) {
    dueAmount = seat.dueAmount;
  } else if (seat.paymentStatus === 'due' || isReserved) {
    dueAmount = Math.max(0, netFare - paidAmount);
  } else {
    dueAmount = 0;
  }

  // Group Totals
  const totalGroupFare = connectedGroupSeats.reduce((acc, s) => acc + (s.fare || trip.baseFare || 700), 0);
  const totalGroupDue = connectedGroupSeats.reduce((acc, s) => {
    if (s.dueAmount !== undefined) return acc + s.dueAmount;
    if (s.paymentStatus === 'due' || s.status === 'reserved') return acc + (s.fare || trip.baseFare || 700);
    return acc;
  }, 0);

  // Ticket / PNR Reference
  const ticketRef = seat.ticketNumber || seat.bookingReference || `TKT-${seat.seatNumber}-${trip.coachNumber}`;

  const handleCopyPhone = () => {
    if (seat.phone) {
      navigator.clipboard.writeText(seat.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // Requirement 1: Full Group Cancellation
  const handleCancelFullGroup = () => {
    setConfirmDialog({ type: 'group' });
  };

  const executeCancelFullGroup = () => {
    const seatNos = connectedGroupSeats.map((s) => s.seatNumber);
    if (onReleaseMultipleSeats) {
      onReleaseMultipleSeats(seatNos);
    } else if (onReleaseSeat) {
      seatNos.forEach((sn) => onReleaseSeat(sn));
    }
    onClose();
  };

  // Requirement 1: Individual Seat Cancellation
  const handleCancelSingleSeat = (seatNoToCancel: string = seat.seatNumber) => {
    setConfirmDialog({ type: 'single', seatNumber: seatNoToCancel });
  };

  const executeCancelSingleSeat = (seatNoToCancel: string) => {
    const isThisSeat = seatNoToCancel === seat.seatNumber;
    if (onReleaseSeat) {
      onReleaseSeat(seatNoToCancel);
    } else if (onUnlockSeat) {
      onUnlockSeat(seatNoToCancel);
    }
    if (isThisSeat || connectedGroupSeats.length <= 1) {
      onClose();
    }
  };

  // Requirement 2: Save Status & Details Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSeatNumbers = editScope === 'group' && isGroup
      ? connectedGroupSeats.map((s) => s.seatNumber)
      : [seat.seatNumber];

    const newPaymentStatus: 'paid' | 'due' = editDueAmount > 0 ? 'due' : 'paid';

    const updates: Partial<Seat> = {
      status: editStatus,
      passengerName: editName.trim() || (editStatus === 'locked' ? 'Management Hold' : 'Counter Passenger'),
      phone: editPhone.trim(),
      fare: editFare,
      dueAmount: editStatus === 'locked' ? 0 : editDueAmount,
      paidAmount: editStatus === 'locked' ? 0 : Math.max(0, editFare - editDueAmount),
      paymentStatus: editStatus === 'locked' ? 'due' : newPaymentStatus,
      boardingPoint: editBoarding,
      droppingPoint: editDropping,
      remarks: `Status edited to ${editStatus.toUpperCase()} at Mirpur-10 Terminal`,
    };

    const metaAction: 'sold' | 'reserved' | 'released' = 
      editStatus === 'sold' ? 'sold' : 'reserved';

    if (onUpdateSeatStatus) {
      onUpdateSeatStatus(targetSeatNumbers, updates, metaAction);
    } else if (editStatus === 'sold' && onConfirmReservation) {
      targetSeatNumbers.forEach((sn) => onConfirmReservation(sn));
    }
    onClose();
  };

  // Requirement 3: Process Due Payment Settlement
  const handleProcessSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (settleAmount <= 0) {
      setSettleError('Please enter a valid settlement amount greater than BDT 0.');
      return;
    }
    setSettleError(null);

    const targetSeatNumbers = settleScope === 'group' && isGroup
      ? connectedGroupSeats.map((s) => s.seatNumber)
      : [seat.seatNumber];

    if (onSettleDuePayment) {
      onSettleDuePayment(targetSeatNumbers, settleAmount, settleMethod);
    } else if (onConfirmReservation) {
      targetSeatNumbers.forEach((sn) => onConfirmReservation(sn));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-3 flex flex-col max-h-[92vh]">
        
        {/* Header with Status Banner */}
        <div className={`px-5 py-3.5 text-white flex items-center justify-between shrink-0 ${
          isSold ? 'bg-[#c41230]' : isReserved ? 'bg-[#ca8a04]' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-mono font-black text-lg text-white border border-white/30 shadow-xs">
              {seat.seatNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  Seat {seat.seatNumber} Control & Operations
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white text-slate-900 tracking-wider shadow-2xs">
                  {isSold ? 'SOLD' : isReserved ? 'RESERVED' : 'LOCKED'}
                </span>
                {isGroup && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-100 border border-indigo-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Group: {connectedGroupSeats.length} Seats</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Coach #{trip.coachNumber} • {trip.departureDate} • {trip.departureTime}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-view Navigation Bar: Details | Edit Status | Settle Due */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center gap-1 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveSubView('details')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeSubView === 'details'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Ticket & Group Details
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('edit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubView === 'edit'
                ? 'bg-white text-purple-950 shadow-xs border border-purple-300'
                : 'text-purple-700 hover:text-purple-950 hover:bg-purple-100/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-600" />
            <span>Edit Status (Sold / Reserved / Lock)</span>
          </button>

          {(dueAmount > 0 || totalGroupDue > 0 || isReserved) && (
            <button
              type="button"
              onClick={() => {
                setActiveSubView('settle');
                setSettleAmount(dueAmount > 0 ? dueAmount : isGroup ? totalGroupDue : baseFare);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubView === 'settle'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Settle Due Payment (BDT {dueAmount})</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 bg-slate-50">

          {/* SAFE IN-MODAL CANCELLATION CONFIRMATION DIALOG */}
          {confirmDialog && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-3 animate-in fade-in shadow-md">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-sm font-black text-rose-950 uppercase tracking-wide">
                    {confirmDialog.type === 'group'
                      ? `Confirm Full Group Cancellation (${connectedGroupSeats.length} Seats)`
                      : `Confirm Cancellation for Seat ${confirmDialog.seatNumber}`}
                  </h5>
                  <p className="text-xs text-rose-800 font-medium mt-1">
                    {confirmDialog.type === 'group'
                      ? `Are you sure you want to cancel and unlock all ${connectedGroupSeats.length} seats in this group: [${connectedGroupSeats.map((s) => s.seatNumber).join(', ')}]? All connected tickets will be released back to Available.`
                      : `Are you sure you want to cancel and release Seat ${confirmDialog.seatNumber} back to Available? ${isGroup ? `The remaining ${connectedGroupSeats.length - 1} seat(s) in this booking will stay active.` : ''}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-200">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Keep Ticket (Go Back)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmDialog.type === 'group') {
                      executeCancelFullGroup();
                    } else if (confirmDialog.seatNumber) {
                      executeCancelSingleSeat(confirmDialog.seatNumber);
                    }
                    setConfirmDialog(null);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-black text-white bg-rose-700 hover:bg-rose-800 transition-colors shadow-xs cursor-pointer"
                >
                  Yes, Confirm Cancellation
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 1: TICKET & GROUP DETAILS + CANCELLATION SYSTEM  */}
          {/* ======================================================== */}
          {activeSubView === 'details' && (
            <div className="space-y-4">
              
              {/* REQUIREMENT 1: MULTI-SEAT GROUP BOOKING DETECTION & FULL / INDIVIDUAL CANCELLATION */}
              {isGroup && (
                <div className="p-4 rounded-xl bg-indigo-50/80 border-2 border-indigo-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-indigo-950">
                          Connected Group Booking ({connectedGroupSeats.length} Seats)
                        </h4>
                        <span className="text-[11px] text-indigo-700 font-mono">
                          Shared Ticket: <strong>{ticketRef}</strong> • Total Fare: BDT {totalGroupFare}
                          {totalGroupDue > 0 && <span className="text-amber-800 font-bold ml-1.5">(Due: BDT {totalGroupDue})</span>}
                        </span>
                      </div>
                    </div>

                    {/* Master Cancellation Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelFullGroup}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title="Cancel all tickets in this group booking together"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Full Group ({connectedGroupSeats.length} Seats)</span>
                      </button>
                    </div>
                  </div>

                  {/* Connected Tickets Interactive List */}
                  <div>
                    <span className="text-[10.5px] uppercase font-black text-indigo-900 tracking-wider block mb-1.5">
                      Connected Group Seats (Click to cancel individually):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {connectedGroupSeats.map((s) => {
                        const isThis = s.seatNumber === seat.seatNumber;
                        const sDue = s.dueAmount !== undefined ? s.dueAmount : s.paymentStatus === 'due' ? (s.fare || baseFare) : 0;
                        return (
                          <div 
                            key={s.seatNumber}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                              isThis 
                                ? 'bg-white border-indigo-400 ring-2 ring-indigo-200 shadow-xs' 
                                : 'bg-white/80 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs text-white ${
                                s.status === 'sold' ? 'bg-red-600' : s.status === 'reserved' ? 'bg-yellow-500 text-slate-950 font-black' : 'bg-black'
                              }`}>
                                {s.seatNumber}
                              </span>
                              <div className="leading-tight">
                                <span className="font-bold text-xs text-slate-900 block truncate max-w-[120px]">
                                  {s.passengerName || 'Passenger'} {isThis && '(Current)'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500">
                                  BDT {s.fare || baseFare} {sDue > 0 ? `• Due: BDT ${sDue}` : '• Paid'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCancelSingleSeat(s.seatNumber)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black transition-colors cursor-pointer"
                              title={`Cancel only seat ${s.seatNumber}`}
                            >
                              Cancel Seat
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SINGLE SEAT QUICK ACTIONS (When not in a group, or individual quick action) */}
              {!isGroup && (
                <div className="p-3.5 rounded-xl bg-white border-2 border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
                  <div className="leading-tight">
                    <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-700 block">
                      Single Seat Operations
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {isLocked
                        ? 'This seat is currently locked. You can release it back to available.'
                        : isReserved
                        ? `Reservation has BDT ${dueAmount} due. Confirm payment to sell or cancel hold.`
                        : 'Confirmed ticket. You can cancel and release back to available.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Unlock Action for Locked Seats */}
                    {isLocked && onUnlockSeat && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onUnlockSeat(seat.seatNumber);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Unlock className="w-4 h-4 stroke-[2.5]" />
                        <span>Unlock Seat (Make Available)</span>
                      </button>
                    )}

                    {/* Confirm Reservation Action */}
                    {isReserved && onConfirmReservation && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onConfirmReservation(seat.seatNumber);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Confirm Reservation (Mark as Paid)</span>
                      </button>
                    )}

                    {/* Cancel Single Seat */}
                    <button
                      type="button"
                      onClick={() => handleCancelSingleSeat(seat.seatNumber)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                      <span>Cancel Ticket & Unlock</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Passenger Identity Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-600" />
                    <span>Passenger Information</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    Ticket: <strong className="text-slate-900">{ticketRef}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Passenger Name</span>
                    <span className="text-sm font-black text-slate-900 block truncate mt-0.5">
                      {passengerName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Mobile</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-black font-mono text-purple-900">
                        {mobileNumber}
                      </span>
                      {seat.phone && (
                        <button
                          type="button"
                          onClick={handleCopyPhone}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Copy phone number"
                        >
                          {copiedPhone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Boarding Point</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5">
                      {boardingPoint}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination / Dropping</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5">
                      {droppingPoint}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Status Breakdown */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Payment Status & Breakdown</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    dueAmount > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}>
                    {dueAmount > 0 ? `DUE BDT ${dueAmount}` : 'FULLY PAID'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Fare</span>
                    <span className="font-mono font-black text-slate-900 text-sm">BDT {netFare}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Paid Amount</span>
                    <span className="font-mono font-black text-emerald-700 text-sm">BDT {paidAmount}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Due Balance</span>
                    <span className="font-mono font-black text-amber-700 text-sm">BDT {dueAmount}</span>
                  </div>
                </div>

                {/* Settle due shortcut button if balance remaining */}
                {dueAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubView('settle');
                      setSettleAmount(dueAmount);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Settle Due Payment (BDT {dueAmount})</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 2: EDIT SEAT STATUS (SOLD / RESERVED / LOCKED)   */}
          {/* ======================================================== */}
          {activeSubView === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-purple-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-700" />
                  <h4 className="text-sm font-black text-purple-950">
                    Edit Status & Seat Details
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubView('details')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  Cancel Edit
                </button>
              </div>

              {/* Status Radio / Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Change Seat Status To:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus('sold');
                      setEditPaymentStatus('paid');
                    }}
                    className={`py-3 px-2 rounded-xl border-2 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      editStatus === 'sold'
                        ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-300'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span>SOLD</span>
                    <span className={`text-[10px] font-normal ${editStatus === 'sold' ? 'text-red-100' : 'text-slate-400'}`}>
                      Confirmed Ticket
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus('reserved');
                      setEditPaymentStatus('due');
                      if (editDueAmount === 0) setEditDueAmount(editFare);
                    }}
                    className={`py-3 px-2 rounded-xl border-2 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      editStatus === 'reserved'
                        ? 'bg-yellow-500 text-slate-950 border-yellow-600 shadow-xs ring-2 ring-yellow-300'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span>RESERVED</span>
                    <span className={`text-[10px] font-normal ${editStatus === 'reserved' ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      Hold / Pay Later
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditStatus('locked');
                      setEditName('Management Hold');
                    }}
                    className={`py-3 px-2 rounded-xl border-2 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      editStatus === 'locked'
                        ? 'bg-black text-white border-black shadow-xs ring-2 ring-slate-400'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span>LOCKED</span>
                    <span className={`text-[10px] font-normal ${editStatus === 'locked' ? 'text-slate-300' : 'text-slate-400'}`}>
                      Management Hold
                    </span>
                  </button>
                </div>
              </div>

              {/* Editable Passenger Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Passenger Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Passenger full name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="01711-XXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Fare (BDT)</label>
                  <input
                    type="number"
                    value={editFare}
                    onChange={(e) => setEditFare(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Due Balance (BDT)</label>
                  <input
                    type="number"
                    value={editDueAmount}
                    onChange={(e) => setEditDueAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-amber-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Boarding Location</label>
                  <select
                    value={editBoarding}
                    onChange={(e) => setEditBoarding(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {BOARDING_POINTS.map((bp) => (
                      <option key={bp} value={bp}>{bp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Dropping Point</label>
                  <select
                    value={editDropping}
                    onChange={(e) => setEditDropping(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {DROPPING_POINTS.map((dp) => (
                      <option key={dp} value={dp}>{dp}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Group scope selector if part of group */}
              {isGroup && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs">
                  <span className="font-bold text-purple-950 block mb-1">Apply Status Changes to:</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-purple-900">
                      <input
                        type="radio"
                        name="editScope"
                        checked={editScope === 'single'}
                        onChange={() => setEditScope('single')}
                        className="accent-purple-700"
                      />
                      <span>This Seat ({seat.seatNumber}) Only</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-purple-900">
                      <input
                        type="radio"
                        name="editScope"
                        checked={editScope === 'group'}
                        onChange={() => setEditScope('group')}
                        className="accent-purple-700"
                      />
                      <span>All {connectedGroupSeats.length} Seats in Group</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSubView('details')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Status Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SUB-VIEW 3: SETTLE DUE PAYMENTS                          */}
          {/* ======================================================== */}
          {activeSubView === 'settle' && (
            <form onSubmit={handleProcessSettlement} className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-300 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">
                      Due Payment Settlement
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-mono">
                      Seat {seat.seatNumber} • Outstanding Due: <strong>BDT {dueAmount}</strong>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubView('details')}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  Back to Details
                </button>
              </div>

              {settleError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{settleError}</span>
                </div>
              )}

              {/* Settlement Amount Input */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-emerald-950">
                    Amount to Collect / Settle (BDT):
                  </label>
                  <span className="text-xs font-bold text-emerald-800">
                    Full Clearance: BDT {settleScope === 'group' && isGroup ? totalGroupDue : dueAmount}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-white border-2 border-emerald-400 rounded-xl font-mono text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSettleAmount(settleScope === 'group' && isGroup ? totalGroupDue : dueAmount)}
                      className="px-2 py-1 rounded bg-emerald-200 hover:bg-emerald-300 text-emerald-900 text-[11px] font-bold cursor-pointer"
                    >
                      Full Due
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  Settlement Payment Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Cash', 'bKash', 'Nagad', 'Card / POS'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSettleMethod(method)}
                      className={`p-2.5 rounded-xl border-2 font-bold text-xs transition-all cursor-pointer ${
                        settleMethod === method
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group scope option for due settlement */}
              {isGroup && totalGroupDue > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Apply Settlement to:</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                      <input
                        type="radio"
                        name="settleScope"
                        checked={settleScope === 'single'}
                        onChange={() => {
                          setSettleScope('single');
                          setSettleAmount(dueAmount);
                        }}
                        className="accent-emerald-700"
                      />
                      <span>This Seat Only (Due: BDT {dueAmount})</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                      <input
                        type="radio"
                        name="settleScope"
                        checked={settleScope === 'group'}
                        onChange={() => {
                          setSettleScope('group');
                          setSettleAmount(totalGroupDue);
                        }}
                        className="accent-emerald-700"
                      />
                      <span>Full Group ({connectedGroupSeats.length} Seats • Due: BDT {totalGroupDue})</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveSubView('details')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm Settlement & Clear Due</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenChalan && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChalan();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>View on Chalan</span>
              </button>
            )}

            {onPrintTicket && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPrintTicket(seat.seatNumber);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
