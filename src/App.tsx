import React, { useState, useEffect, useRef } from 'react';
import { Trip, Seat, FirebaseConnectionConfig, ActivityLogItem, Gender, PaymentStatus } from './types/bus';
import { firebaseSync } from './services/firebaseSync';
import { Header } from './components/Header';
import { QuickStats } from './components/QuickStats';
import { TripSelector } from './components/TripSelector';
import { SeatMatrix } from './components/SeatMatrix';
import { SeatDetailsModal } from './components/SeatDetailsModal';
import { ChalanPrintModal } from './components/ChalanPrintModal';
import { MobileSimulatorDrawer } from './components/MobileSimulatorDrawer';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { TicketPrintModal } from './components/TicketPrintModal';
import { RecentActivityLog } from './components/RecentActivityLog';
import { 
  Bus, 
  Smartphone, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Printer, 
  Layers 
} from 'lucide-react';

export default function App() {
  const [currentTrip, setCurrentTrip] = useState<Trip>(() => {
    const t = firebaseSync.getTrip();
    return t || ({} as Trip);
  });
  const [allTrips, setAllTrips] = useState<Trip[]>(() => firebaseSync.getAllTrips());
  const [connectionConfig, setConnectionConfig] = useState<FirebaseConnectionConfig>(() =>
    firebaseSync.getConfig()
  );
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [journeyDate, setJourneyDate] = useState<string>(() => firebaseSync.getJourneyDate());
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>(() => firebaseSync.getActiveDeck());

  // Selection and filter state
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold' | 'reserved'>('all');
  const [recentlyUpdatedSeats, setRecentlyUpdatedSeats] = useState<string[]>([]);

  // Modals & Drawers
  const [isChalanOpen, setIsChalanOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState<boolean>(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState<boolean>(false);
  const [modalSeatNumbers, setModalSeatNumbers] = useState<string[]>([]);
  const [printTicketSeatNo, setPrintTicketSeatNo] = useState<string | null>(null);

  // Auto-traffic simulator state
  const [autoSimActive, setAutoSimActive] = useState<boolean>(false);
  const autoSimTimerRef = useRef<any>(null);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `${Date.now()}`;
    setToastMessage({ id, text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id === id ? null : prev));
    }, 4000);
  };

  // Subscribe to FirebaseSync service
  useEffect(() => {
    const unsubTrip = firebaseSync.subscribe((trip, updateMeta) => {
      setCurrentTrip({ ...trip });

      if (updateMeta && updateMeta.seatNumbers.length > 0) {
        setRecentlyUpdatedSeats(updateMeta.seatNumbers);
        setTimeout(() => setRecentlyUpdatedSeats([]), 2500);

        if (updateMeta.action === 'sold') {
          showToast(`Seat ${updateMeta.seatNumbers.join(', ')} confirmed via ${updateMeta.source.replace('_', ' ')}!`, 'success');
        } else if (updateMeta.action === 'reserved') {
          showToast(`Seat ${updateMeta.seatNumbers.join(', ')} marked on HOLD!`, 'warning');
        } else if (updateMeta.action === 'cancelled' || updateMeta.action === 'released') {
          showToast(`Seat ${updateMeta.seatNumbers.join(', ')} released to Available.`, 'info');
        }
      }
    });

    const unsubAllTrips = firebaseSync.subscribeAllTrips((trips) => {
      setAllTrips([...trips]);
    });

    const unsubConn = firebaseSync.subscribeConnection((config) => {
      setConnectionConfig({ ...config });
    });

    const unsubActivity = firebaseSync.subscribeActivity((item) => {
      setActivities((prev) => [item, ...prev].slice(0, 30));
    });

    const unsubDate = firebaseSync.subscribeDate((d) => {
      setJourneyDate(d);
    });

    const unsubDeck = firebaseSync.subscribeDeck((dk) => {
      setActiveDeck(dk);
    });

    return () => {
      unsubTrip();
      unsubAllTrips();
      unsubConn();
      unsubActivity();
      unsubDate();
      unsubDeck();
    };
  }, []);

  // Handle auto-simulation interval
  useEffect(() => {
    if (autoSimActive) {
      autoSimTimerRef.current = setInterval(() => {
        simulateMobileAction();
      }, 7500);
    } else {
      if (autoSimTimerRef.current) {
        clearInterval(autoSimTimerRef.current);
        autoSimTimerRef.current = null;
      }
    }
    return () => {
      if (autoSimTimerRef.current) {
        clearInterval(autoSimTimerRef.current);
      }
    };
  }, [autoSimActive, currentTrip]);

  const simulateMobileAction = () => {
    if (!currentTrip || !currentTrip.seats) return;
    const availableSeatKeys = Object.keys(currentTrip.seats).filter(
      (k) => currentTrip.seats[k].status === 'available'
    );

    if (availableSeatKeys.length === 0) {
      setAutoSimActive(false);
      showToast('All coach seats are booked! Simulation stopped.', 'info');
      return;
    }

    // Pick random available seat
    const randomSeatNo = availableSeatKeys[Math.floor(Math.random() * availableSeatKeys.length)];
    const passengerNumber = Math.floor(100 + Math.random() * 900);
    const pName = `Mobile Passenger #${passengerNumber}`;
    const pPhone = `01712-${Math.floor(100000 + Math.random() * 900000)}`;

    firebaseSync.updateSeats(
      currentTrip.id,
      {
        [randomSeatNo]: {
          status: 'sold',
          passengerName: pName,
          phone: pPhone,
          gender: Math.random() > 0.5 ? 'female' : 'male',
          fare: currentTrip.baseFare,
          ticketNumber: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
          boardingPoint: currentTrip.startingCounter || 'মিরপুর ১০',
          droppingPoint: currentTrip.destination || 'Sonapur',
          bookedVia: 'mobile_app',
          bookedAt: new Date().toISOString(),
          paymentStatus: 'paid',
          remarks: 'Booked via Lal Sabuj App',
        },
      },
      {
        action: 'sold',
        source: 'mobile_app',
        passengerName: pName,
        counterOrUser: 'Mobile App User',
      }
    );
  };

  const handleSelectTrip = (tripId: string) => {
    firebaseSync.setActiveTrip(tripId);
    setSelectedSeats([]);
  };

  const handleToggleSeatSelection = (seatNo: string) => {
    if (!seatNo) {
      setSelectedSeats([]);
      return;
    }
    setSelectedSeats((prev) =>
      prev.includes(seatNo) ? prev.filter((s) => s !== seatNo) : [...prev, seatNo]
    );
  };

  const handleOpenSeatModal = (seatNo: string) => {
    setModalSeatNumbers([seatNo]);
    setIsSeatModalOpen(true);
  };

  const handleBookSelectedSeats = () => {
    if (selectedSeats.length > 0) {
      setModalSeatNumbers([...selectedSeats]);
      setIsSeatModalOpen(true);
    }
  };

  // Perform booking on one or more seats
  const handleConfirmBooking = (
    seatNos: string[],
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
  ) => {
    const seatUpdates: Record<string, Partial<Seat>> = {};
    const isDue = data.paymentStatus === 'due';
    seatNos.forEach((seatNo, idx) => {
      seatUpdates[seatNo] = {
        status: 'sold',
        passengerName: seatNos.length > 1 ? `${data.passengerName} (${idx + 1})` : data.passengerName,
        phone: data.phone,
        gender: data.gender,
        boardingPoint: data.boardingPoint,
        droppingPoint: data.droppingPoint,
        fare: data.fare,
        ticketNumber: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        counterName: data.counterName,
        bookedVia: 'counter',
        bookedAt: new Date().toISOString(),
        paymentStatus: data.paymentStatus,
        dueAmount: isDue ? data.fare : 0,
        paidAmount: isDue ? 0 : data.fare,
        remarks: data.remarks,
      };
    });

    firebaseSync.updateSeats(currentTrip.id, seatUpdates, {
      action: 'sold',
      source: 'counter',
      passengerName: data.passengerName,
      counterOrUser: data.counterName,
    });

    setSelectedSeats([]);
  };

  // Perform reservation on one or more seats
  const handleConfirmReservation = (
    seatNos: string[],
    data: {
      reservedFor: string;
      phone: string;
      counterName: string;
      holdMinutes: number;
      remarks: string;
    }
  ) => {
    const seatUpdates: Record<string, Partial<Seat>> = {};
    const holdExpiresAt = new Date(Date.now() + data.holdMinutes * 60000).toISOString();

    seatNos.forEach((seatNo) => {
      seatUpdates[seatNo] = {
        status: 'reserved',
        passengerName: data.reservedFor,
        phone: data.phone,
        counterName: data.counterName,
        bookedVia: 'counter',
        holdExpiresAt,
        remarks: data.remarks,
        dueAmount: currentTrip?.baseFare || 700,
        paidAmount: 0,
        paymentStatus: 'due',
      };
    });

    firebaseSync.updateSeats(currentTrip.id, seatUpdates, {
      action: 'reserved',
      source: 'counter',
      passengerName: data.reservedFor,
      counterOrUser: data.counterName,
    });

    setSelectedSeats([]);
  };

  // Release / Cancel seats back to Available
  const handleReleaseSeats = (seatNos: string[]) => {
    const seatUpdates: Record<string, Partial<Seat>> = {};
    seatNos.forEach((seatNo) => {
      seatUpdates[seatNo] = {
        status: 'available',
        passengerName: undefined,
        phone: undefined,
        ticketNumber: undefined,
        bookedVia: undefined,
        bookedAt: undefined,
        holdExpiresAt: undefined,
        paymentStatus: undefined,
        remarks: undefined,
      };
    });

    firebaseSync.updateSeats(currentTrip.id, seatUpdates, {
      action: 'released',
      source: 'counter',
      counterOrUser: 'Terminal Counter',
    });

    setSelectedSeats([]);
  };

  // Simulator helper: Book 1 or 2 seats from mobile app
  const handleSimulateAppBooking = (count: number = 1) => {
    if (!currentTrip || !currentTrip.seats) return;
    const available = Object.keys(currentTrip.seats).filter(
      (k) => currentTrip.seats[k].status === 'available'
    );
    if (available.length < count) {
      showToast('Not enough available seats to book!', 'warning');
      return;
    }

    const seatsToBook = available.slice(0, count);
    const pName = `App Passenger #${Math.floor(100 + Math.random() * 900)}`;

    const updates: Record<string, Partial<Seat>> = {};
    seatsToBook.forEach((sNo, idx) => {
      updates[sNo] = {
        status: 'sold',
        passengerName: count > 1 ? `${pName} (${idx + 1})` : pName,
        phone: '01819-778899',
        gender: idx % 2 === 0 ? 'female' : 'male',
        fare: currentTrip.baseFare,
        ticketNumber: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        boardingPoint: currentTrip.startingCounter || 'মিরপুর ১০',
        droppingPoint: currentTrip.destination || 'Sonapur',
        bookedVia: 'mobile_app',
        bookedAt: new Date().toISOString(),
        paymentStatus: 'paid',
        remarks: 'Mobile App booking',
      };
    });

    firebaseSync.updateSeats(currentTrip.id, updates, {
      action: 'sold',
      source: 'mobile_app',
      passengerName: pName,
      counterOrUser: 'Lal Sabuj Mobile App',
    });
  };

  // Simulator helper: Hold seat from mobile app
  const handleSimulateAppHold = () => {
    if (!currentTrip || !currentTrip.seats) return;
    const available = Object.keys(currentTrip.seats).filter(
      (k) => currentTrip.seats[k].status === 'available'
    );
    if (available.length === 0) return;
    const sNo = available[0];

    firebaseSync.updateSeats(
      currentTrip.id,
      {
        [sNo]: {
          status: 'reserved',
          passengerName: 'Mobile App Cart Hold',
          phone: '01711-000000',
          bookedVia: 'mobile_app',
          counterName: 'Mobile App API',
          holdExpiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
          remarks: 'App user cart lock - 15 mins',
        },
      },
      {
        action: 'reserved',
        source: 'mobile_app',
        passengerName: 'App Cart User',
        counterOrUser: 'Mobile App Gateway',
      }
    );
  };

  // Simulator helper: Cancel booking from mobile app
  const handleSimulateAppCancel = () => {
    if (!currentTrip || !currentTrip.seats) return;
    const appBooked = Object.keys(currentTrip.seats).filter(
      (k) => currentTrip.seats[k].status === 'sold' && currentTrip.seats[k].bookedVia === 'mobile_app'
    );
    if (appBooked.length === 0) {
      showToast('No simulated mobile bookings to cancel!', 'info');
      return;
    }
    const sNo = appBooked[appBooked.length - 1];
    handleReleaseSeats([sNo]);
  };

  const handleResetTripData = () => {
    firebaseSync.refetchFromFirebase();
    showToast('Refreshed seat matrix from Firebase live database.', 'info');
  };

  if (!currentTrip || !currentTrip.seats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <Bus className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="font-bold text-base">Loading live fleet from Firebase project (lal-sobuj-bus)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="no-print fixed top-4 right-4 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-400'
              : toastMessage.type === 'warning'
              ? 'bg-amber-900 text-amber-100 border-amber-400'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Brand Header */}
      <Header
        currentTrip={currentTrip}
        connectionConfig={connectionConfig}
        onOpenChalan={() => setIsChalanOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        isSimulatorOpen={isSimulatorOpen}
        autoSimActive={autoSimActive}
        onToggleAutoSim={() => setAutoSimActive(!autoSimActive)}
        onRefetchData={() => firebaseSync.refetchFromFirebase()}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Quick Intelligence Metric Cards */}
        <QuickStats trip={currentTrip} />

        {/* Trip Switcher, Journey Date Selector, Search & Route Controls */}
        <TripSelector
          trips={allTrips}
          activeTrip={currentTrip}
          onSelectTrip={handleSelectTrip}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          journeyDate={journeyDate}
          onChangeJourneyDate={(date) => firebaseSync.setJourneyDate(date)}
          onRefetch={() => firebaseSync.refetchFromFirebase()}
        />

        {/* 2-Column Layout: Bus Seat Matrix & Live Sync Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left 3 Columns: Interactive Bus Seat Matrix Cabin */}
          <div className="lg:col-span-3">
            <SeatMatrix
              trip={currentTrip}
              selectedSeats={selectedSeats}
              onToggleSeatSelection={handleToggleSeatSelection}
              onOpenSeatModal={handleOpenSeatModal}
              onBookSelectedSeats={handleBookSelectedSeats}
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              recentlyUpdatedSeats={recentlyUpdatedSeats}
              activeDeck={activeDeck}
              onSelectDeck={(deck) => firebaseSync.setActiveDeck(deck)}
            />
          </div>

          {/* Right Column: Live Sync Feed & Quick Action Cards */}
          <div className="lg:col-span-1 space-y-5">
            
            {/* Live Sync Activity Feed */}
            <RecentActivityLog activities={activities} />

            {/* Quick Chalan Generator Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl border border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Printer className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Waybill & Chalan Sheet</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate the official physical passenger manifest and revenue reconciliation for Coach{' '}
                <strong className="text-white font-mono">{currentTrip.coachNumber}</strong> ({currentTrip.registrationNumber}).
              </p>
              <button
                onClick={() => setIsChalanOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View & Print Chalan (চালান)</span>
              </button>
            </div>

            {/* Mobile App Sync Gateway Card */}
            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Mobile App Sync</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                Connected to project <strong className="font-mono text-emerald-950 font-bold">lal-sobuj-bus</strong>.
              </p>
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-emerald-100/80 text-emerald-900 font-bold text-xs border border-emerald-300 transition-colors shadow-2xs"
              >
                Test Mobile App Sync
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 py-4 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Lal Sabuj Paribahan (Pvt) Ltd. Central Counter Terminal ERP.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-mono">Firebase: lal-sobuj-bus ({connectionConfig.totalLiveCoaches || 5} Coaches, {connectionConfig.totalLiveBookings || 798} Bookings)</span>
            <span>•</span>
            <button
              onClick={() => setIsFirebaseConfigOpen(true)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Database Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Seat Booking & Details Modal */}
      {isSeatModalOpen && modalSeatNumbers.length > 0 && (
        <SeatDetailsModal
          isOpen={isSeatModalOpen}
          onClose={() => setIsSeatModalOpen(false)}
          seatNumbers={modalSeatNumbers}
          trip={currentTrip}
          onConfirmBooking={handleConfirmBooking}
          onConfirmReservation={handleConfirmReservation}
          onReleaseSeats={handleReleaseSeats}
          onPrintTicket={(sNo) => {
            setPrintTicketSeatNo(sNo);
            setIsSeatModalOpen(false);
          }}
        />
      )}

      {/* Printable Chalan Sheet Modal */}
      {isChalanOpen && (
        <ChalanPrintModal
          isOpen={isChalanOpen}
          onClose={() => setIsChalanOpen(false)}
          trip={currentTrip}
        />
      )}

      {/* Mobile App Booking Simulator Drawer */}
      {isSimulatorOpen && (
        <MobileSimulatorDrawer
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          trip={currentTrip}
          autoSimActive={autoSimActive}
          onToggleAutoSim={() => setAutoSimActive(!autoSimActive)}
          onSimulateAppBooking={handleSimulateAppBooking}
          onSimulateAppHold={handleSimulateAppHold}
          onSimulateAppCancel={handleSimulateAppCancel}
          onResetTripData={handleResetTripData}
        />
      )}

      {/* Firebase RTDB Settings Modal */}
      {isFirebaseConfigOpen && (
        <FirebaseConfigModal
          isOpen={isFirebaseConfigOpen}
          onClose={() => setIsFirebaseConfigOpen(false)}
          config={connectionConfig}
          onUpdateConfig={(newCfg) => {
            firebaseSync.initFirebase(newCfg);
          }}
        />
      )}

      {/* Individual Boarding Pass Print Modal */}
      {printTicketSeatNo && (
        <TicketPrintModal
          isOpen={Boolean(printTicketSeatNo)}
          onClose={() => setPrintTicketSeatNo(null)}
          seatNumber={printTicketSeatNo}
          trip={currentTrip}
        />
      )}

    </div>
  );
}
