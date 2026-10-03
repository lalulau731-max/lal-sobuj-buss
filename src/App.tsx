import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trip, Seat, FirebaseConnectionConfig, ActivityLogItem } from './types/bus';
import { isRealCoach } from './data/mockTrips';
import { firebaseSync } from './services/firebaseSync';
import { authService, AdminUser } from './services/authService';
import { AdminLogin } from './components/AdminLogin';
import { LalSobujHeader } from './components/LalSobujHeader';
import { LalSobujFilterBar } from './components/LalSobujFilterBar';
import { TripListCard } from './components/TripListCard';
import { CalendarView } from './components/CalendarView';
import { CoachInfoModal } from './components/CoachInfoModal';
import { HDepositModal } from './components/HDepositModal';
import { ChalanPrintModal } from './components/ChalanPrintModal';
import { ChalanDimensionConfigModal } from './components/ChalanDimensionConfigModal';
import { MobileSimulatorDrawer } from './components/MobileSimulatorDrawer';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { TicketPrintModal } from './components/TicketPrintModal';
import { ThemeManagerModal } from './components/ThemeManagerModal';
import { themeManager, HomepageTheme } from './services/themeManager';
import { Bus, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation View: 'home' (Image 1 Coach List) or 'dashboard' (Fleet Calendar & Operations Analytics)
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');

  // Admin Authentication State with Persistent Session
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => authService.getStoredSession());

  // Core State
  const [allTrips, setAllTrips] = useState<Trip[]>(() => firebaseSync.getAllTrips());
  const [connectionConfig, setConnectionConfig] = useState<FirebaseConnectionConfig>(() =>
    firebaseSync.getConfig()
  );
  const [journeyDate, setJourneyDate] = useState<string>(() => firebaseSync.getJourneyDate());

  // Theme Management
  const [activeTheme, setActiveTheme] = useState<HomepageTheme>(() => themeManager.getActiveTheme());
  const [isThemeManagerOpen, setIsThemeManagerOpen] = useState<boolean>(false);

  // Filter Bar State (Image 1: From, To, Date, Search bar, NO PNR)
  const [fromLocation, setFromLocation] = useState<string>('North');
  const [toLocation, setToLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inline Seat Plan Expansion (Image 2)
  const [expandedCoachId, setExpandedCoachId] = useState<string | null>(null);

  // Modals
  const [infoTrip, setInfoTrip] = useState<Trip | null>(null);
  const [reportTrip, setReportTrip] = useState<Trip | null>(null);
  const [isHDepositOpen, setIsHDepositOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState<boolean>(false);
  const [isChalanConfigOpen, setIsChalanConfigOpen] = useState<boolean>(false);
  const [printTicketSeatNo, setPrintTicketSeatNo] = useState<string | null>(null);

  // Simulator State
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

  // Subscribe to FirebaseSync service and persistent Admin Auth
  useEffect(() => {
    const unsubAuth = authService.subscribe((admin) => {
      setCurrentAdmin(admin);
    });

    const unsubAllTrips = firebaseSync.subscribeAllTrips((trips) => {
      setAllTrips([...trips]);
    });

    const unsubConn = firebaseSync.subscribeConnection((config) => {
      setConnectionConfig({ ...config });
    });

    const unsubDate = firebaseSync.subscribeDate((d) => {
      setJourneyDate(d);
    });

    const unsubTheme = themeManager.subscribe(() => {
      setActiveTheme(themeManager.getActiveTheme());
    });

    return () => {
      unsubAuth();
      unsubAllTrips();
      unsubConn();
      unsubDate();
      unsubTheme();
    };
  }, []);

  // Previous Day Handler
  const handlePrevDay = () => {
    try {
      const [y, m, d] = journeyDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d - 1);
      const newDate = dt.toISOString().split('T')[0];
      firebaseSync.setJourneyDate(newDate);
      showToast(`Viewing schedule for ${newDate}`, 'info');
    } catch (e) {
      console.warn(e);
    }
  };

  // Next Day Handler
  const handleNextDay = () => {
    try {
      const [y, m, d] = journeyDate.split('-').map(Number);
      const dt = new Date(y, m - 1, d + 1);
      const newDate = dt.toISOString().split('T')[0];
      firebaseSync.setJourneyDate(newDate);
      showToast(`Viewing schedule for ${newDate}`, 'info');
    } catch (e) {
      console.warn(e);
    }
  };

  // Today's Trip Handler - Sets date automatically to current local date
  const handleSetToday = () => {
    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const today = `${y}-${m}-${d}`;
      firebaseSync.setJourneyDate(today);
      showToast(`Viewing Today's Trips (${today})`, 'success');
    } catch (e) {
      console.warn(e);
    }
  };

  // Filtered Trips list based on destination and search query - strictly real coaches only
  const filteredTrips = useMemo(() => {
    let list = allTrips.filter((t) => isRealCoach(t.rawCoach));

    // Filter by destination in To field (e.g. Sonapur, Raipur, Chittagong, Noakhali)
    if (toLocation && toLocation.trim()) {
      const term = toLocation.toLowerCase().trim();
      list = list.filter((t) => {
        const dest = (t.destination || '').toLowerCase();
        const route = (t.routeTitle || '').toLowerCase();
        const dropping = (t.rawCoach?.droppingPoints || '').toLowerCase();
        return dest.includes(term) || route.includes(term) || dropping.includes(term);
      });
    }

    // Filter by Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const cNo = (t.coachNumber || '').toLowerCase();
        const reg = (t.registrationNumber || '').toLowerCase();
        const route = (t.routeTitle || '').toLowerCase();
        const time = (t.departureTime || '').toLowerCase();
        return cNo.includes(q) || reg.includes(q) || route.includes(q) || time.includes(q);
      });
    }

    return list;
  }, [allTrips, toLocation, searchQuery]);

  // Inline Seat Booking Handler
  const handleConfirmInlineBooking = (
    tripId: string,
    updates: Record<string, Partial<Seat>>,
    meta: {
      action: 'sold' | 'reserved';
      source: 'counter';
      passengerName: string;
      counterOrUser: string;
    }
  ) => {
    firebaseSync.updateSeats(tripId, updates, meta);
    const count = Object.keys(updates).length;
    showToast(`Successfully confirmed ${count} seat(s) for Coach ${tripId}!`, 'success');
  };

  // Simulator helper: Book 1 or 2 seats from mobile app
  const handleSimulateAppBooking = (count: number = 1) => {
    const activeTrip = allTrips[0];
    if (!activeTrip || !activeTrip.seats) return;
    const available = Object.keys(activeTrip.seats).filter(
      (k) => activeTrip.seats[k].status === 'available'
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
        fare: activeTrip.baseFare,
        ticketNumber: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        boardingPoint: activeTrip.startingCounter || 'Mirpur-10',
        droppingPoint: activeTrip.destination || 'Sonapur',
        bookedVia: 'mobile_app',
        bookedAt: new Date().toISOString(),
        paymentStatus: 'paid',
        remarks: 'Mobile App booking',
      };
    });

    firebaseSync.updateSeats(activeTrip.id, updates, {
      action: 'sold',
      source: 'mobile_app',
      passengerName: pName,
      counterOrUser: 'Lal Sabuj Mobile App',
    });
  };

  const handleSimulateAppHold = () => {
    const activeTrip = allTrips[0];
    if (!activeTrip || !activeTrip.seats) return;
    const available = Object.keys(activeTrip.seats).filter(
      (k) => activeTrip.seats[k].status === 'available'
    );
    if (available.length === 0) return;
    const sNo = available[0];

    firebaseSync.updateSeats(
      activeTrip.id,
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

  const handleSimulateAppCancel = () => {
    const activeTrip = allTrips[0];
    if (!activeTrip || !activeTrip.seats) return;
    const appBooked = Object.keys(activeTrip.seats).filter(
      (k) => activeTrip.seats[k].status === 'sold' && activeTrip.seats[k].bookedVia === 'mobile_app'
    );
    if (appBooked.length === 0) {
      showToast('No simulated mobile bookings to cancel!', 'info');
      return;
    }
    const sNo = appBooked[appBooked.length - 1];
    firebaseSync.updateSeats(
      activeTrip.id,
      {
        [sNo]: {
          status: 'available',
          passengerName: undefined,
          phone: undefined,
        },
      },
      {
        action: 'released',
        source: 'mobile_app',
        counterOrUser: 'Mobile Gateway',
      }
    );
  };

  const handleResetTripData = () => {
    firebaseSync.refetchFromFirebase();
    showToast('Refreshed seat matrix from Firebase live database.', 'info');
  };

  // If not authenticated, display the attractive modern Admin Panel Login Page
  if (!currentAdmin) {
    return (
      <div className="relative">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="no-print fixed top-5 right-5 z-50 animate-bounce">
            <div className={`px-4 py-2.5 rounded-xl shadow-2xl border flex items-center gap-2 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-blue-900 text-blue-100 border-blue-400'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900 text-amber-100 border-amber-400'
                : 'bg-slate-900 text-white border-slate-700'
            }`}>
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}
        <AdminLogin 
          onLoginSuccess={(admin) => {
            setCurrentAdmin(admin);
            showToast(`Authenticated as ${admin.displayName} (${admin.role})`, 'success');
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4eff6] text-slate-800 flex flex-col font-sans">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="no-print fixed top-14 right-4 z-50 animate-bounce">
          <div className={`px-4 py-2 rounded-lg shadow-xl border flex items-center gap-2 text-xs font-bold ${
            toastMessage.type === 'success'
              ? 'bg-[#521563] text-purple-100 border-purple-400'
              : toastMessage.type === 'warning'
              ? 'bg-amber-900 text-amber-100 border-amber-400'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Purple Header with Hamburger Menu (Image 1 & Image 3) */}
      <LalSobujHeader
        connectionConfig={connectionConfig}
        currentView={currentView}
        adminUser={currentAdmin}
        onNavigate={(v) => setCurrentView(v)}
        onOpenHDeposit={() => setIsHDepositOpen(true)}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenChalanConfig={() => setIsChalanConfigOpen(true)}
        onOpenThemeManager={() => setIsThemeManagerOpen(true)}
        onLogout={async () => {
          await authService.logout();
          setCurrentAdmin(null);
          showToast('Administrative session secured. Logged out.', 'info');
        }}
      />

      {/* Main View: Home (Coach List with Inline Seat Plan) vs Dashboard (Calendar & Analytics) */}
      {currentView === 'home' ? (
        <div className="flex-1 flex flex-col">
          
          {/* Top Filter Bar (From, To, Date, Today's Trip, Search Bar & Date Navigation) */}
          <LalSobujFilterBar
            fromLocation={fromLocation}
            onChangeFrom={setFromLocation}
            toLocation={toLocation}
            onChangeTo={setToLocation}
            journeyDate={journeyDate}
            onChangeJourneyDate={(d) => firebaseSync.setJourneyDate(d)}
            searchQuery={searchQuery}
            onChangeSearchQuery={setSearchQuery}
            onSearch={() => {}}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleSetToday}
          />

          {/* Coach List Container (Reference Image 1) */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-3 space-y-2.5">
            
            {filteredTrips.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-purple-50 text-[#661d7a] flex items-center justify-center mx-auto">
                  <Bus className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No coaches found for this selection</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No scheduled trips found for destination "{toLocation || 'All'}" on {journeyDate}. Try selecting another date or destination.
                </p>
                <button
                  onClick={() => {
                    setToLocation('');
                    setSearchQuery('');
                  }}
                  className="px-4 py-1.5 rounded bg-[#661d7a] hover:bg-[#521563] text-white text-xs font-semibold cursor-pointer"
                >
                  Clear Destination Filter
                </button>
              </div>
            ) : (
              filteredTrips.map((trip) => {
                const isExpanded = expandedCoachId === trip.id;
                return (
                  <TripListCard
                    key={trip.id}
                    trip={trip}
                    journeyDate={journeyDate}
                    isExpanded={isExpanded}
                    onToggleExpand={() => {
                      setExpandedCoachId(isExpanded ? null : trip.id);
                    }}
                    onOpenReport={() => setReportTrip(trip)}
                    onOpenInfo={() => setInfoTrip(trip)}
                    onConfirmBooking={(updates, meta) =>
                      handleConfirmInlineBooking(trip.id, updates, meta)
                    }
                    onPrintTicket={(seatNo) => setPrintTicketSeatNo(seatNo)}
                    onRefresh={() => firebaseSync.refetchFromFirebase()}
                  />
                );
              })
            )}

          </main>

        </div>
      ) : (
        /* Operations Dashboard & Fleet Calendar View (Accessible via Hamburger Menu) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-5">
          <CalendarView
            currentDate={journeyDate}
            onSelectJourneyDate={(date) => {
              firebaseSync.setJourneyDate(date);
              showToast(`Journey date synchronized to ${date}`, 'info');
            }}
            onOpenCoachSeatMatrix={(coachNumber, date) => {
              firebaseSync.setJourneyDate(date);
              firebaseSync.setActiveTrip(coachNumber);
              setExpandedCoachId(coachNumber);
              setCurrentView('home');
              showToast(`Opened seat plan for Coach ${coachNumber}`, 'success');
            }}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="no-print bg-[#661d7a] text-white py-3.5 px-4 text-center text-xs mt-auto border-t border-purple-800">
        <p className="font-bold text-xs tracking-wide">
          Lal Sabuj Paribahan V7 - Powered by Lal Sabuj - Designed by Tuhin.
        </p>
      </footer>

      {/* Coach Info Modal */}
      {infoTrip && (
        <CoachInfoModal
          trip={infoTrip}
          onClose={() => setInfoTrip(null)}
        />
      )}

      {/* Chalan / Passenger Manifest Printable Modal */}
      {reportTrip && (
        <ChalanPrintModal
          isOpen={Boolean(reportTrip)}
          onClose={() => setReportTrip(null)}
          trip={reportTrip}
        />
      )}

      {/* Head Office Deposit Modal (Triggered by Hamburger Menu) */}
      {isHDepositOpen && (
        <HDepositModal
          isOpen={isHDepositOpen}
          onClose={() => setIsHDepositOpen(false)}
          trips={allTrips}
          journeyDate={journeyDate}
        />
      )}

      {/* Mobile App Booking Simulator Drawer */}
      {isSimulatorOpen && (
        <MobileSimulatorDrawer
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          trip={allTrips[0] || ({} as Trip)}
          autoSimActive={autoSimActive}
          onToggleAutoSim={() => setAutoSimActive(!autoSimActive)}
          onSimulateAppBooking={handleSimulateAppBooking}
          onSimulateAppHold={handleSimulateAppHold}
          onSimulateAppCancel={handleSimulateAppCancel}
          onResetTripData={handleResetTripData}
        />
      )}

      {/* Firebase Database Status & Configuration Modal */}
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

      {/* Ticket Print Modal */}
      {printTicketSeatNo && (
        <TicketPrintModal
          isOpen={Boolean(printTicketSeatNo)}
          onClose={() => setPrintTicketSeatNo(null)}
          seatNumber={printTicketSeatNo}
          trip={allTrips[0] || ({} as Trip)}
        />
      )}

      {/* Chalan Print Dimension Settings Tool */}
      <ChalanDimensionConfigModal
        isOpen={isChalanConfigOpen}
        onClose={() => setIsChalanConfigOpen(false)}
      />

      {/* Theme & Template Management Studio */}
      <ThemeManagerModal
        isOpen={isThemeManagerOpen}
        onClose={() => setIsThemeManagerOpen(false)}
      />

    </div>
  );
}
