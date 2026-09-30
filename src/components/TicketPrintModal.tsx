import React from 'react';
import { Trip, Seat } from '../types/bus';
import { X, Printer, Bus, CheckCircle2, QrCode } from 'lucide-react';

interface TicketPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatNumber: string;
  trip: Trip;
}

export const TicketPrintModal: React.FC<TicketPrintModalProps> = ({
  isOpen,
  onClose,
  seatNumber,
  trip,
}) => {
  if (!isOpen || !seatNumber) return null;

  const seat: Seat = trip.seats[seatNumber] || {
    seatNumber,
    row: seatNumber.charAt(0),
    column: 1,
    status: 'sold',
    fare: trip.baseFare,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-6">
        
        {/* Top Control Bar */}
        <div className="no-print bg-slate-900 text-white p-3 px-4 flex items-center justify-between">
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Bus className="w-4 h-4 text-emerald-400" />
            <span>Passenger Boarding Pass</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Boarding Slip Body */}
        <div className="p-6 bg-white text-slate-900 font-sans">
          <div className="border-2 border-slate-800 p-4 rounded-xl relative space-y-3 bg-gradient-to-b from-white to-slate-50">
            
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-2">
              <h3 className="text-lg font-black tracking-tight text-red-700 uppercase">
                LAL SABUJ PARIBAHAN
              </h3>
              <p className="text-xs font-bold text-emerald-800">
                Intercity Luxury Coach Service
              </p>
              <p className="text-[10px] text-slate-500">
                Customer Care: 01711-223344 • Central Dispatch: Sayedabad
              </p>
            </div>

            {/* Ticket & Seat Ribbon */}
            <div className="flex items-center justify-between bg-slate-900 text-white p-2 rounded-lg">
              <div>
                <span className="text-[9px] uppercase text-slate-400 block">Ticket No</span>
                <span className="font-mono font-bold text-xs text-emerald-300">
                  {seat.ticketNumber || 'TKT-894101'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase text-slate-400 block">Seat No</span>
                <span className="font-mono font-black text-xl text-amber-300">
                  {seat.seatNumber}
                </span>
              </div>
            </div>

            {/* Passenger Info Grid */}
            <div className="space-y-1.5 text-xs text-slate-700 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Passenger Name:</span>
                <strong className="text-slate-900">{seat.passengerName || 'Valued Passenger'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Number:</span>
                <span className="font-mono font-semibold">{seat.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route & Coach:</span>
                <strong className="text-slate-900">{trip.routeTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coach Reg No:</span>
                <span className="font-mono font-bold">{trip.coachNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Departure:</span>
                <strong className="text-red-700">{trip.departureDate} at {trip.departureTime}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Boarding Point:</span>
                <span className="font-semibold text-emerald-800">{seat.boardingPoint || 'Arambagh Main Counter'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-slate-800">{seat.droppingPoint || 'Maijdee'}</span>
              </div>
            </div>

            {/* Financial Details */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Fare Paid</span>
                <span className="text-base font-black text-emerald-800 font-mono">
                  ৳{seat.fare || trip.baseFare}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">Payment Status</span>
                <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  {seat.paymentStatus || 'Paid'}
                </span>
              </div>
            </div>

            {/* Note & QR Placeholder */}
            <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
              <span>Please report to counter 20 minutes before departure time.</span>
              <span className="font-mono">Checked ✓</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
