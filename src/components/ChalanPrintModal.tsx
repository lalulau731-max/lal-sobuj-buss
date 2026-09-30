import React from 'react';
import { Trip, Seat } from '../types/bus';
import { 
  Printer, 
  X, 
  Download, 
  FileText
} from 'lucide-react';
import { ChalanLogoBW } from './ChalanLogoBW';

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
  
  // Sort seats in standard operational order
  const sortedSeats = [...seatsList].sort((a, b) => {
    const deckA = a.deckNumber || 1;
    const deckB = b.deckNumber || 1;
    if (deckA !== deckB) return deckA - deckB;
    if (a.row === b.row) return a.column - b.column;
    return a.row.localeCompare(b.row);
  });

  // Only includes details for sold, reserved, and locked seats
  const manifestSeats = sortedSeats.filter(
    (s) => s.status === 'sold' || s.status === 'reserved' || s.status === 'locked'
  );

  const soldCount = manifestSeats.filter((s) => s.status === 'sold').length;
  const reservedCount = manifestSeats.filter((s) => s.status === 'reserved').length;
  const lockedCount = manifestSeats.filter((s) => s.status === 'locked').length;

  // Calculate total due amount
  const totalDueAmount = manifestSeats.reduce((sum, s) => {
    const seatDue = s.dueAmount !== undefined 
      ? s.dueAmount 
      : (s.paymentStatus === 'due' ? (seatFare(s) || trip.baseFare) : s.status === 'reserved' ? (seatFare(s) || trip.baseFare) : 0);
    return sum + (seatDue || 0);
  }, 0);

  function seatFare(s: Seat) {
    return s.fare;
  }

  // Calculate Group sizes for multi-seat bookings
  const seatGroupMap = React.useMemo(() => {
    const groupIds = new Map<string, string>();
    const groupCounts = new Map<string, number>();

    manifestSeats.forEach((seat) => {
      let gId = '';

      if (seat.bookingReference && seat.bookingReference.trim()) {
        gId = `ref:${seat.bookingReference.trim()}`;
      } else if (seat.ticketNumber && seat.ticketNumber.trim()) {
        gId = `tkt:${seat.ticketNumber.trim()}`;
      } else if (seat.phone && !isDummyPhone(seat.phone)) {
        gId = `phn:${seat.phone.trim()}`;
      } else if (seat.passengerName && !isDummyName(seat.passengerName)) {
        const baseName = seat.passengerName.trim().replace(/\s*\(\d+\)$/, '').replace(/\s*#\d+$/, '').toLowerCase();
        const timeBucket = seat.bookedAt ? seat.bookedAt.substring(0, 16) : 'same';
        gId = `pax:${baseName}:${timeBucket}`;
      } else {
        gId = `seat:${seat.seatNumber}`;
      }

      groupIds.set(seat.seatNumber, gId);
      groupCounts.set(gId, (groupCounts.get(gId) || 0) + 1);
    });

    const result: Record<string, number> = {};
    manifestSeats.forEach((seat) => {
      const gId = groupIds.get(seat.seatNumber) || '';
      result[seat.seatNumber] = groupCounts.get(gId) || 1;
    });

    return result;
  }, [manifestSeats]);

  // Helper: Detect and remove dummy/placeholder names
  const isDummyName = (name?: string): boolean => {
    if (!name) return true;
    const trimmed = name.trim();
    if (!trimmed) return true;
    const lower = trimmed.toLowerCase();
    return (
      lower === 'passenger' ||
      lower === 'counter passenger' ||
      lower === 'female passenger' ||
      lower === 'male passenger' ||
      lower === 'app cart user' ||
      lower === 'app cart hold' ||
      lower.startsWith('app passenger') ||
      lower.startsWith('seed-') ||
      lower === 'counter locked' ||
      lower === 'vip counter hold' ||
      lower === 'holder' ||
      lower === 'md. tariqul islam' ||
      lower === 'kazi farhan ahmed' ||
      lower === 'test' ||
      lower === 'test user' ||
      lower === 'dummy'
    );
  };

  // Helper: Detect and remove dummy phone numbers
  const isDummyPhone = (phone?: string): boolean => {
    if (!phone) return true;
    const trimmed = phone.trim();
    if (!trimmed) return true;
    return (
      trimmed === '01711-000000' ||
      trimmed === '01712-445566' ||
      trimmed === '01819-332211' ||
      trimmed === '01819-778899' ||
      trimmed.includes('XXXX') ||
      trimmed.length < 10
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // SL, Boarding, and Fare columns removed as instructed; Group column included
    const headers = [
      'Seat No',
      'Status',
      'Ticket/Reference',
      'Mobile Phone',
      'Passenger Name',
      'Group',
      'Dropping Point',
      'Due Amount (BDT)',
      'Payment Status',
      'Counter/Issuer',
    ];

    const rows = manifestSeats.map((s) => {
      const isLocked = s.status === 'locked';
      const cleanName = isLocked || isDummyName(s.passengerName) ? '' : s.passengerName;
      const cleanPhone = isLocked || isDummyPhone(s.phone) ? '' : s.phone;
      const groupSize = seatGroupMap[s.seatNumber] || 1;

      const seatDue = s.dueAmount !== undefined 
        ? s.dueAmount 
        : (s.paymentStatus === 'due' ? (s.fare || trip.baseFare) : s.status === 'reserved' ? (s.fare || trip.baseFare) : 0);
      
      const statusLabel = s.status === 'sold' 
        ? 'SOLD' 
        : s.status === 'reserved' 
        ? 'RESERVATION' 
        : 'LOCKED';

      return [
        s.seatNumber,
        statusLabel,
        s.ticketNumber || s.bookingReference || '',
        cleanPhone || '',
        `"${cleanName || ''}"`,
        groupSize > 1 ? groupSize : 1,
        `"${s.droppingPoint || trip.destination || ''}"`,
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

  const densityClass = manifestSeats.length > 24 
    ? 'chalan-ultra-dense' 
    : manifestSeats.length > 14 
    ? 'chalan-dense' 
    : '';

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-2 sm:my-4">
        
        {/* Floating Controls Bar (Hidden during printing via .no-print) */}
        <div className="no-print controls-bar chalan-controls-bar bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Chalan Sheet (Passenger Manifest)
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700 font-bold">
                  Coach #{trip.coachNumber} • {trip.departureDate}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Active Manifest: <strong className="text-white font-bold">{manifestSeats.length} Seats</strong> (Sold: {soldCount}, Reserved: {reservedCount}, Locked: {lockedCount})</span>
                <span className="text-slate-500">•</span>
                <span className="text-white font-bold">Bold Black Format (No Boarding / No Fare)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors cursor-pointer"
              title="Download CSV Manifest"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-black hover:bg-slate-900 text-white shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Chalan</span>
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
        <div className="chalan-preview-container p-3 sm:p-6 max-h-[88vh] overflow-y-auto bg-slate-100/50 flex flex-col items-center">
          
          {/* Printable Chalan Sheet: ALL TEXT IN SMOOTH PROFESSIONAL SANS-SERIF, BOLD AND BLACK */}
          <div 
            id="printable-chalan"
            className={`w-full max-w-[194mm] bg-white text-black border-2 border-black p-3 sm:p-4 text-[10.5px] leading-tight select-text shadow-sm font-bold font-sans ${densityClass}`}
          >
            {/* Header: Company Name & Document Title in Bold Black */}
            <div className="chalan-header border-b-2 border-black pb-2 mb-2 text-center">
              <div className="flex items-start justify-between">
                
                {/* Top Left: Clean High-Contrast Black & White Logo Neatly in the Designated Corner */}
                <div className="text-left w-36 sm:w-40 flex flex-col items-start justify-center pt-0.5">
                  <ChalanLogoBW className="chalan-logo w-24 sm:w-28 h-auto shrink-0" width={112} height={80} />
                </div>

                {/* Center: Brand Title, Trip Chalan Header, & Large Mirpur-10 */}
                <div className="text-center flex-1 px-2">
                  {/* Clean sans-serif English brand title */}
                  <h1 className="chalan-brand-title text-2xl sm:text-3xl font-black text-black tracking-wide leading-tight font-sans">
                    LAL SABUJ PARIBAHAN
                  </h1>

                  {/* Trip Chalan Header */}
                  <div className="chalan-subtitle-badge mt-1 inline-block border-2 border-black px-4 py-0.5 text-[9.5px] font-black uppercase tracking-widest text-black bg-white font-sans">
                    TRIP CHALAN SHEET (PASSENGER MANIFEST)
                  </div>

                  {/* Below Trip Chalan Header: Mirpur-10 in Large Bold Black Text */}
                  <div className="chalan-counter-location text-lg sm:text-xl font-black uppercase text-black tracking-wider mt-1 font-sans">
                    Mirpur-10
                  </div>
                </div>

                {/* Top Right Form Reference */}
                <div className="chalan-form-ref text-right text-[9px] text-black w-32 font-sans font-bold pt-1">
                  <span className="font-black block text-black">FORM: LSP-CH-01</span>
                  <span className="text-[8.5px] text-black font-bold">Waybill Manifest</span>
                </div>
              </div>
            </div>

            {/* Trip Details Metadata Grid in Bold Black (Serial/Chalan No box removed) */}
            <div className="chalan-meta-grid border-2 border-black grid grid-cols-2 sm:grid-cols-5 text-[10px] mb-2 divide-x-2 divide-y sm:divide-y-0 divide-black font-bold font-sans">
              <div className="chalan-meta-cell p-1 px-1.5">
                <span className="chalan-meta-label text-[8.5px] font-black text-black uppercase block">Coach / Bus No</span>
                <span className="chalan-meta-value font-sans font-black text-black text-[11px] block">{trip.coachNumber}</span>
                <span className="chalan-meta-sub text-[8px] text-black font-bold block">{trip.registrationNumber || 'DHAKA METRO'}</span>
              </div>

              <div className="chalan-meta-cell p-1 px-1.5">
                <span className="chalan-meta-label text-[8.5px] font-black text-black uppercase block">Date & Day</span>
                <span className="chalan-meta-value font-black text-black block">{trip.departureDate}</span>
              </div>

              <div className="chalan-meta-cell p-1 px-1.5">
                <span className="chalan-meta-label text-[8.5px] font-black text-black uppercase block">Departure / Reporting</span>
                <span className="chalan-meta-value font-black text-black block">{trip.departureTime}</span>
                <span className="chalan-meta-sub text-[8px] text-black font-bold block">Rep: {trip.reportingTime || trip.departureTime}</span>
              </div>

              <div className="chalan-meta-cell p-1 px-1.5 sm:col-span-1">
                <span className="chalan-meta-label text-[8.5px] font-black text-black uppercase block">Assigned Road / Route</span>
                <span className="chalan-meta-value font-black text-black block truncate" title={trip.routeTitle}>
                  {trip.routeTitle}
                </span>
              </div>

              <div className="chalan-meta-cell p-1 px-1.5">
                <span className="chalan-meta-label text-[8.5px] font-black text-black uppercase block">Supervisor Mobile</span>
                <span className="chalan-meta-value font-sans font-black text-black block">{trip.supervisorPhone}</span>
                <span className="chalan-meta-sub text-[8px] text-black font-bold block truncate">{trip.supervisorName.split('(')[0]}</span>
              </div>
            </div>

            {/* Passenger Manifest Data Table (SL and Sign columns removed, Group column included) */}
            <div className="chalan-table-wrapper overflow-x-auto mb-2 border-2 border-black font-sans">
              <table className="chalan-table w-full text-left text-[9.5px] border-collapse font-bold font-sans">
                <thead>
                  <tr className="border-b-2 border-black bg-white text-black font-black uppercase text-[9px] tracking-wider">
                    <th className="p-1 border-r-2 border-black text-center w-12 text-black font-black">Seat</th>
                    <th className="p-1 border-r-2 border-black text-center w-22 text-black font-black">Status</th>
                    <th className="p-1 border-r-2 border-black w-28 text-black font-black">Mobile No</th>
                    <th className="p-1 border-r-2 border-black text-black font-black">Passenger Name</th>
                    <th className="p-1 border-r-2 border-black text-center w-14 text-black font-black">Group</th>
                    <th className="p-1 border-r-2 border-black w-32 text-black font-black">Dropping</th>
                    <th className="p-1 text-center w-24 text-black font-black">Due Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-black bg-white font-bold font-sans">
                  {manifestSeats.length > 0 ? (
                    manifestSeats.map((seat) => {
                      const isSold = seat.status === 'sold';
                      const isReserved = seat.status === 'reserved';
                      const isLocked = seat.status === 'locked';

                      // Determine Due Amount
                      const seatDue = seat.dueAmount !== undefined 
                        ? seat.dueAmount 
                        : (seat.paymentStatus === 'due' ? (seat.fare || trip.baseFare) : isReserved ? (seat.fare || trip.baseFare) : 0);

                      const hasDue = seatDue > 0;

                      // For locked seats, leave mobile number and passenger name blank
                      // For other seats, remove dummy names and placeholder phones
                      const displayPassengerName = isLocked || isDummyName(seat.passengerName)
                        ? '' 
                        : seat.passengerName;

                      const displayPhone = isLocked || isDummyPhone(seat.phone)
                        ? '' 
                        : seat.phone;

                      const groupSize = seatGroupMap[seat.seatNumber] || 1;

                      return (
                        <tr 
                          key={seat.seatNumber}
                          className="bg-white border-b border-black font-bold font-sans"
                        >
                          {/* Seat No */}
                          <td className="p-0.5 px-1 border-r border-black text-center font-sans font-black text-black">
                            {seat.seatNumber}
                          </td>

                          {/* Status Badge */}
                          <td className="p-0.5 px-1 border-r border-black text-center font-sans font-black text-[8.5px] text-black">
                            {isSold && (
                              <span className="text-black uppercase font-black">[SOLD]</span>
                            )}
                            {isReserved && (
                              <span className="text-black uppercase font-black">[RESERVATION]</span>
                            )}
                            {isLocked && (
                              <span className="text-black uppercase font-black">[LOCKED]</span>
                            )}
                          </td>

                          {/* Mobile Phone - Blank for locked seats or dummy numbers */}
                          <td className="p-0.5 px-1 border-r border-black font-sans text-[9px] font-bold text-black">
                            {displayPhone}
                          </td>

                          {/* Passenger Name - Blank for locked seats or dummy names */}
                          <td className="p-0.5 px-1 border-r border-black font-black text-black truncate max-w-[150px] font-sans">
                            {displayPassengerName}
                          </td>

                          {/* Group Column: Display total number of seats in the group as a small count for multi-seat bookings */}
                          <td className="p-0.5 px-1 border-r border-black text-center font-sans">
                            {groupSize > 1 ? (
                              <span 
                                className="chalan-group-badge inline-block px-1.5 py-0.5 text-[8.5px] font-black text-white bg-black rounded-xs leading-none"
                                title={`Group booking: ${groupSize} seats`}
                              >
                                {groupSize}
                              </span>
                            ) : (
                              <span className="text-black font-bold text-[8.5px]">-</span>
                            )}
                          </td>

                          {/* Dropping Point */}
                          <td className="p-0.5 px-1 border-r border-black text-[9px] font-bold text-black truncate max-w-[120px] font-sans">
                            {seat.droppingPoint || trip.destination || 'Sonapur'}
                          </td>

                          {/* Due Amount: BACKGROUND IS BOLD BLACK */}
                          <td className="p-0.5 px-1 text-center font-sans">
                            {hasDue ? (
                              <div className="chalan-due-badge inline-block px-2 py-0.5 text-[9px] font-black text-white bg-black border border-black rounded-xs tracking-tight whitespace-nowrap font-sans">
                                ৳{seatDue} DUE
                              </div>
                            ) : (
                              <span className="text-[9px] text-black font-black font-sans">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-black font-bold font-sans">
                        No sold, reserved, or locked seats recorded for this coach.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reconciliation Totals & Summary Row (Fare section removed, Due Amount with bold black background) */}
            <div className="chalan-summary-box border-2 border-black p-1.5 mb-2 grid grid-cols-2 gap-4 text-[9.5px] text-black bg-white font-bold font-sans">
              <div>
                <span className="chalan-summary-label text-[8.5px] font-black text-black uppercase block">Manifest Seat Count:</span>
                <span className="chalan-summary-value font-sans font-black text-black text-[10px]">
                  {manifestSeats.length} Seats ({soldCount} Sold, {reservedCount} RESERVATION, {lockedCount} LOCKED)
                </span>
              </div>

              <div>
                <span className="chalan-summary-label text-[8.5px] font-black text-black uppercase block">Total Due Amount:</span>
                {totalDueAmount > 0 ? (
                  <span className="chalan-summary-badge inline-block px-2.5 py-0.5 bg-black text-white font-sans font-black text-[9.5px] rounded-xs mt-0.5">
                    ৳{totalDueAmount.toLocaleString()} DUE
                  </span>
                ) : (
                  <span className="chalan-summary-value font-sans font-black text-black">৳0 (Fully Paid)</span>
                )}
              </div>
            </div>

            {/* Bottom Scale & Perforation Line */}
            <div className="chalan-perforation mt-3 pt-1 border-t border-dashed border-black text-center text-[8.5px] text-black flex items-center justify-between font-sans font-bold">
              <span>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</span>
              <span className="font-black text-black uppercase tracking-wider px-2 font-sans">
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
