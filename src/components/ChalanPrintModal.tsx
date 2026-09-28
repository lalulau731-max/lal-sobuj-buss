import React from 'react';
import { Trip, Seat } from '../types/bus';
import { 
  Printer, 
  X, 
  Download, 
  FileText, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ChalanPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const ChalanPrintModal: React.FC<ChalanPrintModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  if (!isOpen) return null;

  const seatsList = Object.values(trip.seats || {});
  
  // Sort seats in standard operational order:
  // Lower deck / Single deck first (A1, A2... or L-A1...), then Upper deck (U-A1...)
  const sortedSeats = [...seatsList].sort((a, b) => {
    const deckA = a.deckNumber || 1;
    const deckB = b.deckNumber || 1;
    if (deckA !== deckB) return deckA - deckB;
    if (a.row === b.row) return a.column - b.column;
    return a.row.localeCompare(b.row);
  });

  // STRICT REQUIREMENT: Only includes details for sold, reserved, and locked seats.
  // No other categories (such as vacant/available) or dummy data are present.
  const manifestSeats = sortedSeats.filter(
    (s) => s.status === 'sold' || s.status === 'reserved' || s.status === 'locked'
  );

  const soldCount = manifestSeats.filter((s) => s.status === 'sold').length;
  const reservedCount = manifestSeats.filter((s) => s.status === 'reserved').length;
  const lockedCount = manifestSeats.filter((s) => s.status === 'locked').length;

  // Calculate gross fare, due amount, and net cash collected
  const grossFare = manifestSeats.reduce((sum, s) => {
    // For locked seats without charge, fare is 0 unless recorded
    if (s.status === 'locked' && !s.paidAmount && !s.fare) return sum;
    return sum + (s.fare || trip.baseFare);
  }, 0);

  const totalDueAmount = manifestSeats.reduce((sum, s) => {
    const seatDue = s.dueAmount !== undefined 
      ? s.dueAmount 
      : (s.paymentStatus === 'due' ? (s.fare || trip.baseFare) : s.status === 'reserved' ? (s.fare || trip.baseFare) : 0);
    return sum + (seatDue || 0);
  }, 0);

  const netCashCollected = Math.max(0, grossFare - totalDueAmount);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'SL',
      'Seat No',
      'Status',
      'Ticket/Reference',
      'Passenger Name',
      'Mobile Phone',
      'Boarding Point',
      'Dropping Point',
      'Fare (BDT)',
      'Due Amount (BDT)',
      'Payment Status',
      'Counter/Issuer',
    ];

    const rows = manifestSeats.map((s, idx) => {
      const seatDue = s.dueAmount !== undefined 
        ? s.dueAmount 
        : (s.paymentStatus === 'due' ? (s.fare || trip.baseFare) : s.status === 'reserved' ? (s.fare || trip.baseFare) : 0);
      
      const statusLabel = s.status === 'sold' 
        ? 'SOLD' 
        : s.status === 'reserved' 
        ? 'RESERVATION' 
        : 'LOCKED';

      return [
        idx + 1,
        s.seatNumber,
        statusLabel,
        s.ticketNumber || s.bookingReference || '',
        `"${s.passengerName || ''}"`,
        s.phone || '',
        `"${s.boardingPoint || trip.startingCounter || ''}"`,
        `"${s.droppingPoint || trip.destination || ''}"`,
        s.fare || trip.baseFare,
        seatDue,
        seatDue > 0 ? 'DUE' : 'PAID',
        `"${s.counterName || ''}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Chalan_${trip.coachNumber}_${trip.departureDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-2 sm:my-4">
        
        {/* Floating Controls Bar (Hidden during printing via .no-print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Chalan Sheet (Passenger Manifest)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                  Coach #{trip.coachNumber} • {trip.departureDate}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Filtered: <strong className="text-emerald-400">{manifestSeats.length} Active Seats</strong> (Sold: {soldCount}, Reserved: {reservedCount}, Locked: {lockedCount})</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-medium">Scaled to Top Half of A4 (140mm)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
              title="Download CSV Manifest"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Top-Half Sheet</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container for Preview */}
        <div className="p-3 sm:p-6 max-h-[88vh] overflow-y-auto bg-slate-100/50 flex flex-col items-center">
          
          {/* Printable Chalan Sheet: Scaled and calibrated to fit top half of an A4 sheet */}
          <div 
            id="printable-chalan"
            className="w-full max-w-[194mm] bg-white text-black border border-black p-3 sm:p-4 text-[10.5px] leading-tight select-text shadow-sm"
          >
            {/* Header: Company Name & Document Title (No Solid Background) */}
            <div className="border-b border-black pb-1.5 mb-2 text-center">
              <div className="flex items-start justify-between">
                <div className="text-left text-[9px] text-black w-32">
                  <span className="font-bold uppercase block tracking-wider">LAL SABUJ PARIBAHAN</span>
                  <span className="text-[8.5px] text-gray-700">Govt. Regd. Luxury Coach</span>
                </div>

                <div className="text-center flex-1 px-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-black uppercase leading-tight font-serif">
                    LAL SABUJ PARIBAHAN (PVT.) LTD.
                  </h1>
                  <h2 className="text-xs font-bold text-black font-serif">
                    লাল সবুজ পরিবহন (প্রাঃ) লিঃ
                  </h2>
                  <div className="mt-0.5 inline-block border border-black px-3 py-0.5 text-[9.5px] font-black uppercase tracking-widest text-black bg-white">
                    TRIP CHALAN SHEET (যাত্রী চালান পত্র)
                  </div>
                </div>

                <div className="text-right text-[9px] text-black w-32 font-mono">
                  <span className="font-bold block">FORM: LSP-CH-01</span>
                  <span className="text-[8.5px] text-gray-700">Waybill Manifest</span>
                </div>
              </div>
            </div>

            {/* Trip Details Metadata Grid: Clear typography without solid background */}
            <div className="border border-black grid grid-cols-3 sm:grid-cols-6 text-[10px] mb-2 divide-x divide-y sm:divide-y-0 divide-black">
              <div className="p-1 px-1.5">
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Serial / Chalan No</span>
                <span className="font-mono font-black text-black text-[11px] block">{trip.chalanNumber}</span>
              </div>

              <div className="p-1 px-1.5">
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Coach / Bus No</span>
                <span className="font-mono font-black text-black text-[11px] block">{trip.coachNumber}</span>
                <span className="text-[8px] text-gray-600 block">{trip.registrationNumber || 'DHAKA METRO'}</span>
              </div>

              <div className="p-1 px-1.5">
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Date & Day</span>
                <span className="font-bold text-black block">{trip.departureDate}</span>
              </div>

              <div className="p-1 px-1.5">
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Departure / Reporting</span>
                <span className="font-bold text-black block">{trip.departureTime}</span>
                <span className="text-[8px] text-gray-600 block">Rep: {trip.reportingTime || trip.departureTime}</span>
              </div>

              <div className="p-1 px-1.5 sm:col-span-1">
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Assigned Road / Route</span>
                <span className="font-bold text-black block truncate" title={trip.routeTitle}>
                  {trip.routeTitle}
                </span>
              </div>

              <div className="p-1 px-1.5">
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Supervisor Mobile</span>
                <span className="font-mono font-bold text-black block">{trip.supervisorPhone}</span>
                <span className="text-[8px] text-gray-600 block truncate">{trip.supervisorName.split('(')[0]}</span>
              </div>
            </div>

            {/* Passenger Manifest Data Table */}
            {/* Note: ONLY Sold, Reserved, and Locked seats are rendered. No vacant or dummy rows. */}
            <div className="overflow-x-auto mb-2 border border-black">
              <table className="w-full text-left text-[9.5px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-white text-black font-extrabold uppercase text-[9px] tracking-wider">
                    <th className="p-1 border-r border-black text-center w-6">SL</th>
                    <th className="p-1 border-r border-black text-center w-10">Seat</th>
                    <th className="p-1 border-r border-black text-center w-16">Status</th>
                    <th className="p-1 border-r border-black w-24">Mobile No</th>
                    <th className="p-1 border-r border-black">Passenger Name</th>
                    <th className="p-1 border-r border-black w-24">Boarding</th>
                    <th className="p-1 border-r border-black w-24">Dropping</th>
                    <th className="p-1 border-r border-black text-right w-14">Fare (৳)</th>
                    <th className="p-1 border-r border-black text-center w-22">Due Amount</th>
                    <th className="p-1 text-center w-10">Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/30 bg-white">
                  {manifestSeats.length > 0 ? (
                    manifestSeats.map((seat, index) => {
                      const isSold = seat.status === 'sold';
                      const isReserved = seat.status === 'reserved';
                      const isLocked = seat.status === 'locked';

                      // Determine Due Amount
                      // Requirement: highlight any due amount for a seat in a small, distinct box in a bold color.
                      const seatDue = seat.dueAmount !== undefined 
                        ? seat.dueAmount 
                        : (seat.paymentStatus === 'due' ? (seat.fare || trip.baseFare) : isReserved ? (seat.fare || trip.baseFare) : 0);

                      const hasDue = seatDue > 0;

                      return (
                        <tr 
                          key={seat.seatNumber}
                          className="bg-white hover:bg-slate-50/50"
                        >
                          {/* Serial No */}
                          <td className="p-0.5 px-1 border-r border-black text-center font-mono font-medium">
                            {index + 1}
                          </td>

                          {/* Seat No */}
                          <td className="p-0.5 px-1 border-r border-black text-center font-mono font-black text-black">
                            {seat.seatNumber}
                          </td>

                          {/* Status Badge */}
                          <td className="p-0.5 px-1 border-r border-black text-center font-mono font-bold text-[8.5px]">
                            {isSold && (
                              <span className="text-black uppercase">[SOLD]</span>
                            )}
                            {isReserved && (
                              <span className="text-black uppercase">[RESERVATION]</span>
                            )}
                            {isLocked && (
                              <span className="text-black uppercase">[LOCKED]</span>
                            )}
                          </td>

                          {/* Mobile Phone */}
                          <td className="p-0.5 px-1 border-r border-black font-mono text-[9px] text-black">
                            {seat.phone || '-'}
                          </td>

                          {/* Passenger Name / Holder */}
                          <td className="p-0.5 px-1 border-r border-black font-semibold text-black truncate max-w-[130px]">
                            {seat.passengerName || (isLocked ? 'COUNTER LOCKED' : isReserved ? 'VIP Counter Hold' : '-')}
                          </td>

                          {/* Boarding Point */}
                          <td className="p-0.5 px-1 border-r border-black text-[9px] text-black truncate max-w-[80px]">
                            {seat.boardingPoint || trip.startingCounter || 'Sayedabad'}
                          </td>

                          {/* Dropping Point */}
                          <td className="p-0.5 px-1 border-r border-black text-[9px] text-black truncate max-w-[80px]">
                            {seat.droppingPoint || trip.destination || 'Sonapur'}
                          </td>

                          {/* Fare */}
                          <td className="p-0.5 px-1 border-r border-black text-right font-mono font-bold text-black">
                            {isLocked && !seat.fare ? '0' : (seat.fare || trip.baseFare)}
                          </td>

                          {/* Due Amount: HIGHLIGHTED IN A SMALL DISTINCT BOX IN A BOLD COLOR */}
                          <td className="p-0.5 px-1 border-r border-black text-center">
                            {hasDue ? (
                              <div className="inline-block px-1.5 py-0.5 text-[9px] font-black text-white bg-red-600 border border-red-700 rounded-xs shadow-xs tracking-tight whitespace-nowrap">
                                ৳{seatDue} DUE
                              </div>
                            ) : (
                              <span className="text-[9px] text-gray-500 font-mono">0</span>
                            )}
                          </td>

                          {/* Ticket / Supervisor Check */}
                          <td className="p-0.5 px-1 text-center">
                            <span className="inline-block w-3.5 h-3.5 border border-black rounded-2xs"></span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-gray-600 font-medium">
                        No sold, reserved, or locked seats recorded for this coach.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reconciliation Totals & Summary Row (No Solid Background) */}
            <div className="border border-black p-1.5 mb-2 grid grid-cols-4 gap-2 text-[9.5px] text-black bg-white">
              <div>
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Manifest Count:</span>
                <span className="font-mono font-bold">
                  {manifestSeats.length} Seats ({soldCount} Sold, {reservedCount} Res, {lockedCount} Lck)
                </span>
              </div>

              <div>
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Gross Fare:</span>
                <span className="font-mono font-black text-black">৳{grossFare.toLocaleString()}</span>
              </div>

              <div>
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Total Due Amount:</span>
                {totalDueAmount > 0 ? (
                  <span className="inline-block px-1.5 py-0.2 bg-red-600 text-white font-mono font-black text-[9px] rounded-2xs">
                    ৳{totalDueAmount.toLocaleString()} DUE
                  </span>
                ) : (
                  <span className="font-mono font-bold text-gray-600">৳0 (Fully Paid)</span>
                )}
              </div>

              <div>
                <span className="text-[8.5px] font-bold text-gray-600 uppercase block">Cash Collected:</span>
                <span className="font-mono font-black text-black">৳{netCashCollected.toLocaleString()}</span>
              </div>
            </div>

            {/* Official Dispatch Signatures (Compact 4-Column Layout) */}
            <div className="grid grid-cols-4 gap-2 text-center text-[9px] pt-4 mt-1 border-t border-black">
              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-0.5 font-bold text-black">
                  Prepared By (Counter)
                </div>
                <p className="text-[8px] text-gray-600">{trip.startingCounter || 'Mirpur-10'}</p>
              </div>

              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-0.5 font-bold text-black">
                  Supervisor Signature
                </div>
                <p className="text-[8px] text-gray-600">{trip.supervisorName.split('(')[0]}</p>
              </div>

              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-0.5 font-bold text-black">
                  Driver's Acknowledgment
                </div>
                <p className="text-[8px] text-gray-600">{trip.driverName.split('(')[0]}</p>
              </div>

              <div>
                <div className="border-t border-black w-4/5 mx-auto pt-0.5 font-bold text-black">
                  Dispatch Terminal Seal
                </div>
                <p className="text-[8px] text-gray-600">Central Arambagh / Sayedabad</p>
              </div>
            </div>

            {/* Bottom Scale & Perforation Line Indicating A4 Top Half Cut */}
            <div className="mt-3 pt-1 border-t border-dashed border-gray-400 text-center text-[8.5px] text-gray-500 flex items-center justify-between font-mono">
              <span>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</span>
              <span className="font-bold text-black uppercase tracking-wider px-2">
                TOP HALF OF A4 SHEET (140MM SCALE)
              </span>
              <span>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
