import React, { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';

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
}) => {
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  if (!isOpen || !seat) return null;

  const isSold = seat.status === 'sold';
  const isReserved = seat.status === 'reserved';
  const isLocked = seat.status === 'locked';

  // Specific passenger data
  const passengerName = seat.passengerName && seat.passengerName.trim() 
    ? seat.passengerName 
    : isLocked ? 'Seat Locked (Management Hold)' : 'VIP / Counter Passenger';

  const mobileNumber = seat.phone && seat.phone.trim() 
    ? seat.phone 
    : 'Not Specified';

  const droppingPoint = seat.droppingPoint || trip.destination || 'Sonapur';
  const destination = trip.destination || 'Sonapur';
  const boardingPoint = seat.boardingPoint || trip.source || 'Mirpur-10';

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

  // Ticket / PNR Reference
  const ticketRef = seat.ticketNumber || seat.bookingReference || `TKT-${seat.seatNumber}-${trip.coachNumber}`;

  const handleCopyPhone = () => {
    if (seat.phone) {
      navigator.clipboard.writeText(seat.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-4">
        
        {/* Header with Status Banner */}
        <div className={`px-5 py-4 text-white flex items-center justify-between ${
          isSold ? 'bg-[#c41230]' : isReserved ? 'bg-[#ca8a04]' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-mono font-black text-lg text-white border border-white/30 shadow-xs">
              {seat.seatNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide">
                  Seat {seat.seatNumber} Management
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white text-slate-900 tracking-wider shadow-2xs">
                  {isSold ? 'SOLD / CONFIRMED' : isReserved ? 'RESERVED / DUE' : 'LOCKED (HOLD)'}
                </span>
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-slate-50">

          {/* Quick Management Action Panel */}
          <div className="p-3.5 rounded-xl bg-white border-2 border-purple-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="leading-tight">
              <span className="text-[10.5px] uppercase font-black tracking-wider text-purple-900 block">
                Quick Action (Mobile & Web Sync)
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {isLocked
                  ? 'This seat is currently locked. You can release it to available status.'
                  : isReserved
                  ? `Reservation has BDT ${dueAmount} due. Confirm payment to sell or cancel to unlock.`
                  : 'Confirmed ticket. You can reprint or release if cancelled.'}
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

              {/* Cancel Reservation Action */}
              {isReserved && onCancelReservation && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Cancel reservation for Seat ${seat.seatNumber} and unlock back to available?`)) {
                      onClose();
                      onCancelReservation(seat.seatNumber);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel Reservation</span>
                </button>
              )}

              {/* Release / Cancel Sold Ticket */}
              {isSold && onReleaseSeat && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Release sold ticket for Seat ${seat.seatNumber}? This will mark the seat as available in the cloud database.`)) {
                      onClose();
                      onReleaseSeat(seat.seatNumber);
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel Ticket & Unlock</span>
                </button>
              )}
            </div>
          </div>
          
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
              {/* Passenger Name */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Passenger Name</span>
                <span className="text-sm font-black text-slate-900 block truncate mt-0.5">
                  {passengerName}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  Gender: {seat.gender || 'Not specified'}
                </span>
              </div>

              {/* Mobile Number with Copy Button */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Mobile</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-black font-mono text-slate-900">
                    {mobileNumber}
                  </span>
                  {seat.phone && (
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      title="Copy phone number"
                    >
                      {copiedPhone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                {seat.phone && (
                  <a
                    href={`tel:${seat.phone}`}
                    className="text-[10px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>Call Passenger</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stoppage & Route Coordinates */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Route & Dropping Details</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Boarding Point</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">
                  {boardingPoint}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Dropping Point</span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  {droppingPoint}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Final Destination</span>
                <span className="text-xs font-black text-slate-900 block mt-0.5">
                  {destination}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown: Fare, Discount, Paid Amount & Due Amount */}
          <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Financial Transaction Breakdown</span>
              </span>
              <span className={`text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded font-mono ${
                dueAmount > 0 
                  ? 'bg-black text-white' 
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {dueAmount > 0 ? `BDT ${dueAmount.toLocaleString()} DUE` : 'FULLY PAID'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-center">
              
              {/* Base Fare */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Base Fare</span>
                <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
                  BDT {baseFare.toLocaleString()}
                </span>
              </div>

              {/* Applicable Discount */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-amber-600" />
                  <span>Discount</span>
                </span>
                <span className="text-sm font-black text-amber-700 font-mono block mt-0.5">
                  {discount > 0 ? `-BDT ${discount.toLocaleString()}` : 'BDT 0'}
                </span>
              </div>

              {/* Total Paid Amount */}
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-black text-emerald-800 uppercase block">Paid Amount</span>
                <span className="text-base font-black text-emerald-700 font-mono block mt-0.5">
                  BDT {paidAmount.toLocaleString()}
                </span>
              </div>

              {/* Due Amount */}
              <div className={`p-2.5 rounded-lg border ${
                dueAmount > 0 
                  ? 'bg-black text-white border-black shadow-xs' 
                  : 'bg-slate-50 text-slate-800 border-slate-200'
              }`}>
                <span className={`text-[10px] font-black uppercase block ${dueAmount > 0 ? 'text-white' : 'text-slate-500'}`}>
                  Due Amount
                </span>
                <span className={`text-base font-black font-mono block mt-0.5 ${dueAmount > 0 ? 'text-white' : 'text-slate-900'}`}>
                  BDT {dueAmount.toLocaleString()}
                </span>
              </div>

            </div>
          </div>

          {/* Operational Counter & Audit Metadata */}
          <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1.5 font-medium">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" />
                <span>Booking Location / Counter:</span>
              </span>
              <strong className="text-slate-900 font-bold">
                {seat.counterName || seat.operatorId || 'Mirpur-10 Terminal'}
              </strong>
            </div>

            {seat.remarks && (
              <div className="flex items-start justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Remarks / Note:</span>
                <span className="text-slate-800 font-semibold italic text-right max-w-[280px]">
                  "{seat.remarks}"
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
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
                <span>Print Seat Ticket</span>
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
