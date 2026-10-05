import React, { useState, useEffect } from 'react';
import { Trip, Seat } from '../types/bus';
import { 
  Printer, 
  X, 
  Download, 
  FileText,
  Ruler,
  SlidersHorizontal,
  Palette
} from 'lucide-react';
import { ChalanLogoBW } from './ChalanLogoBW';
import { 
  chalanConfigService, 
  ChalanPrintConfig, 
  EXACT_HALF_A4_HEIGHT_INCHES 
} from '../services/chalanConfig';
import { ChalanDimensionConfigModal } from './ChalanDimensionConfigModal';
import { themeManager, ChalanTemplate, CHALAN_TEMPLATES } from '../services/themeManager';
import { ThemeManagerModal } from './ThemeManagerModal';
import { formatDateDMY, formatDateDMYWithDay } from '../utils/dateUtils';

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
  const [printConfig, setPrintConfig] = useState<ChalanPrintConfig>(() => chalanConfigService.getConfig());
  const [chalanTemplate, setChalanTemplate] = useState<ChalanTemplate>(() => themeManager.getActiveTemplate());
  const [isDimensionModalOpen, setIsDimensionModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = chalanConfigService.subscribe((cfg) => {
      setPrintConfig(cfg);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubTheme = themeManager.subscribe(() => {
      setChalanTemplate(themeManager.getActiveTemplate());
    });
    return () => unsubTheme();
  }, []);

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

  const getSeatDue = React.useCallback((s: Seat): number => {
    if (s.dueAmount !== undefined) return s.dueAmount;
    if (s.paymentStatus === 'due') return s.fare || trip.baseFare;
    if (s.status === 'reserved') return s.fare || trip.baseFare;
    return 0;
  }, [trip.baseFare]);

  // Calculate total due amount across all active seats
  const totalDueAmount = manifestSeats.reduce((sum, s) => {
    return sum + getSeatDue(s);
  }, 0);

  // Group Details interface
  interface GroupInfo {
    groupId: string;
    seatCount: number;
    firstSeatNumber: string;
    totalDue: number;
    seats: string[];
  }

  // Calculate Group sizes and aggregate Due Amount for multi-seat bookings
  const { seatGroupMap, seatGroupInfoMap } = React.useMemo(() => {
    const seatToGroupId = new Map<string, string>();
    const groups = new Map<string, { seats: string[]; totalDue: number }>();

    manifestSeats.forEach((seat) => {
      let gId = '';

      if (seat.bookingReference && seat.bookingReference.trim()) {
        gId = `ref:${seat.bookingReference.trim().toLowerCase()}`;
      } else if (seat.ticketNumber && seat.ticketNumber.trim()) {
        gId = `tkt:${seat.ticketNumber.trim().toLowerCase()}`;
      } else if (seat.phone && !isDummyPhone(seat.phone)) {
        gId = `phn:${seat.phone.trim().replace(/[-\s]/g, '')}`;
      } else if (seat.passengerName && !isDummyName(seat.passengerName)) {
        const baseName = seat.passengerName.trim().replace(/\s*\(\d+\)$/, '').replace(/\s*#\d+$/, '').toLowerCase();
        gId = `pax:${baseName}`;
      } else {
        gId = `seat:${seat.seatNumber}`;
      }

      seatToGroupId.set(seat.seatNumber, gId);

      const due = getSeatDue(seat);
      const existing = groups.get(gId);
      if (existing) {
        existing.seats.push(seat.seatNumber);
        existing.totalDue += due;
      } else {
        groups.set(gId, { seats: [seat.seatNumber], totalDue: due });
      }
    });

    const counts: Record<string, number> = {};
    const infoMap: Record<string, GroupInfo> = {};

    manifestSeats.forEach((seat) => {
      const gId = seatToGroupId.get(seat.seatNumber) || `seat:${seat.seatNumber}`;
      const gData = groups.get(gId);
      const count = gData ? gData.seats.length : 1;
      const firstSeat = gData ? gData.seats[0] : seat.seatNumber;
      const totalDue = gData ? gData.totalDue : getSeatDue(seat);

      counts[seat.seatNumber] = count;
      infoMap[seat.seatNumber] = {
        groupId: gId,
        seatCount: count,
        firstSeatNumber: firstSeat,
        totalDue,
        seats: gData ? gData.seats : [seat.seatNumber],
      };
    });

    return { seatGroupMap: counts, seatGroupInfoMap: infoMap };
  }, [manifestSeats, getSeatDue]);

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
      const groupInfo = seatGroupInfoMap[s.seatNumber];
      const groupSize = groupInfo ? groupInfo.seatCount : 1;
      const isFirstSeat = !groupInfo || groupInfo.firstSeatNumber === s.seatNumber;

      // Group aggregated Due Amount displayed only on first seat
      const seatDue = isFirstSeat ? (groupInfo ? groupInfo.totalDue : getSeatDue(s)) : 0;
      
      const statusLabel = s.status === 'sold' 
        ? 'SOLD' 
        : s.status === 'reserved' 
        ? 'RESERVATION' 
        : 'LOCKED';

      const paymentStatus = isFirstSeat
        ? (seatDue > 0 ? 'DUE' : 'PAID')
        : (groupSize > 1 ? '-' : 'PAID');

      return [
        s.seatNumber,
        statusLabel,
        s.ticketNumber || s.bookingReference || '',
        cleanPhone || '',
        `"${cleanName || ''}"`,
        groupSize > 1 && isFirstSeat ? groupSize : '',
        `"${s.droppingPoint || trip.destination || ''}"`,
        isFirstSeat ? seatDue : '',
        paymentStatus,
        `"${s.counterName || ''}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Chalan_${trip.coachNumber}_${formatDateDMY(trip.departureDate)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Automatic scaling density based on seat count
  // Scales content larger or smaller to ensure everything covers and aligns within top half of A4 page
  const densityClass = manifestSeats.length <= 8 
    ? 'chalan-spacious' 
    : manifestSeats.length <= 16 
    ? 'chalan-normal' 
    : manifestSeats.length <= 24 
    ? 'chalan-compact' 
    : manifestSeats.length <= 32 
    ? 'chalan-dense' 
    : 'chalan-ultra-dense';

  const templateBorderClass =
    chalanTemplate.borderStyle === 'double-black' ? 'border-4 border-double border-black' :
    chalanTemplate.borderStyle === 'heavy-bordered' ? 'border-4 border-black' :
    chalanTemplate.borderStyle === 'dashed-vintage' ? 'border-2 border-dashed border-black' :
    chalanTemplate.borderStyle === 'thin-slate' ? 'border border-black' :
    'border-2 border-black';

  const templateFontClass =
    chalanTemplate.fontTheme === 'mono-dispatch' ? 'font-mono' :
    chalanTemplate.fontTheme === 'serif-classic' ? 'font-serif' :
    chalanTemplate.fontTheme === 'condensed-fast' ? 'font-sans tracking-tight' :
    'font-sans font-bold';

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
                  Coach #{trip.coachNumber} • {formatDateDMY(trip.departureDate)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Active Manifest: <strong className="text-white font-bold">{manifestSeats.length} Seats</strong> (Sold: {soldCount}, Reserved: {reservedCount}, Locked: {lockedCount})</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-300 font-bold">{chalanTemplate.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Template Switcher Button */}
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-700 hover:bg-purple-600 text-white border border-purple-500 shadow-xs transition-colors cursor-pointer"
              title="Choose from 36 Chalan Manifest Templates"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Template:</span>
              <span className="font-mono text-purple-200 truncate max-w-[110px]">{chalanTemplate.name.split('(')[0]}</span>
            </button>

            {/* Print Dimensions Button */}
            <button
              type="button"
              onClick={() => setIsDimensionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 shadow-xs transition-colors cursor-pointer"
              title="Adjust printing dimensions (Half A4 & half-inch increments)"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Dimensions: {printConfig.heightInches}"</span>
            </button>

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

        {/* Dynamic Print Stylesheet: Single A4 Page in Portrait Mode, Content configured to exact dimensions */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: ${printConfig.marginTopMm ?? 3.5}mm ${printConfig.marginRightMm ?? 4.5}mm ${printConfig.marginBottomMm ?? 3.5}mm ${printConfig.marginLeftMm ?? 4.5}mm;
            }
            html, body {
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
              page-break-inside: avoid !important;
            }
            #printable-chalan {
              --chalan-height: ${Math.round(printConfig.heightInches * 25.4 * 10) / 10}mm !important;
              --chalan-max-height: ${Math.round(printConfig.heightInches * 25.4 * 10) / 10}mm !important;
              max-width: ${Math.round((printConfig.widthInches || 8.27) * 25.4 * 10) / 10}mm !important;
              max-height: ${Math.round(printConfig.heightInches * 25.4 * 10) / 10}mm !important;
              height: ${Math.round(printConfig.heightInches * 25.4 * 10) / 10}mm !important;
              zoom: ${(printConfig.scalePercent || 100) / 100} !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}</style>

        {/* Modal Scrollable Container for Preview */}
        <div className="chalan-preview-container p-3 sm:p-6 max-h-[88vh] overflow-y-auto bg-slate-100/50 flex flex-col items-center">
          
          {/* Printable Chalan Sheet: DYNAMIC TEMPLATE & DIMENSION STYLING */}
          <div 
            id="printable-chalan"
            style={{
              maxHeight: `${Math.round(printConfig.heightInches * 25.4 * 10) / 10}mm`,
              height: `${Math.round(printConfig.heightInches * 25.4 * 10) / 10}mm`,
              maxWidth: `${Math.min(200, Math.round((printConfig.widthInches || 8.27) * 25.4 * 10) / 10)}mm`,
              zoom: `${(printConfig.scalePercent || 100) / 100}`,
            }}
            className={`w-full bg-white text-black p-3 sm:p-4 text-[10.5px] leading-tight select-text shadow-sm ${templateBorderClass} ${templateFontClass} ${densityClass} ${chalanTemplate.styleClass}`}
          >
            {/* Header: Company Name & Document Title in Bold Black */}
            <div className="chalan-header border-b-2 border-black pb-2 mb-2 text-center">
              <div className="flex items-center justify-between gap-2">
                
                {/* Top Left: Significantly Increased Size and Prominence Lal Sabuj Logo */}
                <div className="chalan-logo-col text-left flex items-center justify-start shrink-0 pr-2">
                  <ChalanLogoBW className="chalan-logo w-48 sm:w-60 h-auto shrink-0" width={220} height={140} />
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

                {/* Top Right: Mirpur 10 Exclusive Software Notice Box (Replacing form label) */}
                <div className="chalan-location-notice-box shrink-0 border-2 border-black bg-white p-1.5 sm:p-2 max-w-[170px] sm:max-w-[210px] text-center rounded-xs shadow-none">
                  <p className="font-bangla text-[9.5px] sm:text-[10.5px] font-bold text-black leading-snug tracking-normal">
                    এই সফটওয়্যারটা শুধুমাত্র মিরপুর ১০ এর জন্য বানানো হয়েছে.
                  </p>
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
                <span className="chalan-meta-value font-black text-black block">{formatDateDMYWithDay(trip.departureDate)}</span>
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

                      const groupInfo = seatGroupInfoMap[seat.seatNumber];
                      const groupSize = groupInfo ? groupInfo.seatCount : 1;
                      const isFirstSeat = !groupInfo || groupInfo.firstSeatNumber === seat.seatNumber;

                      // Aggregate group Due Amount for the first seat; subsequent seats show '-'
                      const groupDue = groupInfo ? groupInfo.totalDue : getSeatDue(seat);
                      const hasDue = isFirstSeat && groupDue > 0;

                      // For locked seats, leave mobile number and passenger name blank
                      // For other seats, remove dummy names and placeholder phones
                      const displayPassengerName = isLocked || isDummyName(seat.passengerName)
                        ? '' 
                        : seat.passengerName;

                      const displayPhone = isLocked || isDummyPhone(seat.phone)
                        ? '' 
                        : seat.phone;

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

                          {/* Group Column: Display group identifier only in the row for the first passenger of a group booking. Subsequent rows for passengers in the same group must have an empty group column. */}
                          <td className="p-0.5 px-1 border-r border-black text-center font-sans">
                            {groupSize > 1 && isFirstSeat ? (
                              <span 
                                className="chalan-group-badge inline-block px-1.5 py-0.5 text-[8.5px] font-black text-white bg-black rounded-xs leading-none"
                                title={`Group booking: ${groupSize} seats`}
                              >
                                {groupSize}
                              </span>
                            ) : null}
                          </td>

                          {/* Dropping Point */}
                          <td className="p-0.5 px-1 border-r border-black text-[9px] font-bold text-black truncate max-w-[120px] font-sans">
                            {seat.droppingPoint || trip.destination || 'Sonapur'}
                          </td>

                          {/* Due Amount: Aggregated total displayed only on the first seat of the group */}
                          <td className="p-0.5 px-1 text-center font-sans">
                            {isFirstSeat ? (
                              hasDue ? (
                                <div 
                                  className="chalan-due-badge inline-block px-2 py-0.5 text-[9px] font-black text-white bg-black border border-black rounded-xs tracking-tight whitespace-nowrap font-sans"
                                  title={groupSize > 1 ? `Total group due for ${groupSize} seats` : undefined}
                                >
                                  BDT {groupDue} DUE
                                </div>
                              ) : (
                                <span className="text-[9px] text-black font-black font-sans">0</span>
                              )
                            ) : (
                              <span 
                                className="text-black font-bold text-[8.5px]"
                                title={`Due included in first seat of group (${groupInfo?.firstSeatNumber})`}
                              >
                                -
                              </span>
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
                    BDT {totalDueAmount.toLocaleString()} DUE
                  </span>
                ) : (
                  <span className="chalan-summary-value font-sans font-black text-black">BDT 0 (Fully Paid)</span>
                )}
              </div>
            </div>

            {/* Bottom Scale & Perforation Line */}
            {printConfig.showCutMark && (
              <div className="chalan-perforation mt-3 pt-1 border-t border-dashed border-black text-center text-[8.5px] text-black flex items-center justify-between font-sans font-bold">
                <span>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</span>
                <span className="font-black text-black uppercase tracking-wider px-2 font-sans">
                  TOP HALF MANIFEST (A4 PORTRAIT • 210mm × 148.5mm)
                </span>
                <span>✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂</span>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Chalan Print Dimension Configuration Modal */}
      <ChalanDimensionConfigModal
        isOpen={isDimensionModalOpen}
        onClose={() => setIsDimensionModalOpen(false)}
        onApplyAndPrint={handlePrint}
      />

      {/* Chalan Manifest Template Switcher Modal */}
      <ThemeManagerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        defaultTab="chalan"
        onSelectChalanTemplate={(tpl) => setChalanTemplate(tpl)}
      />
    </div>
  );
};
