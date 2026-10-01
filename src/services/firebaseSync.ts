import { Database, ref, onValue, set, update, off, get } from 'firebase/database';
import { 
  Firestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  getDocs,
  query,
  where 
} from 'firebase/firestore';
import { Trip, Seat, CoachRecord, FirebaseConnectionConfig, ActivityLogItem, SeatStatus, Gender, DayAnalytics, TripDaySummary } from '../types/bus';
import { FIREBASE_CONFIG, getFirebaseDatabase, firestore, app } from '../firebase/config';
import { INITIAL_COACHES, generateSeatsForCoach, generate2x2Seats, generateDoubleDeckSeats, isRealCoach } from '../data/mockTrips';

const CONFIG_STORAGE_KEY = 'lsp_firebase_rtdb_config_v3';
const BROADCAST_CHANNEL_NAME = 'lsp_rtdb_live_sync_v3';

class FirebaseSyncService {
  private rtdb: Database | null = null;
  private fs: Firestore = firestore;
  private config: FirebaseConnectionConfig;
  private broadcastChannel: BroadcastChannel | null = null;
  
  // Real database state
  private rawCoaches: Record<string, CoachRecord> = {};
  private rawBookings: Record<string, any> = {};
  private tripsData: Record<string, Trip> = {};
  private activeTripId: string = '212';
  private selectedJourneyDate: string = '2026-09-30'; // Today's operational date
  private activeDeck: 'lower' | 'upper' = 'lower';

  // Listeners
  private listeners: Set<(trip: Trip, updateMeta?: { seatNumbers: string[]; action: string; source: string }) => void> = new Set();
  private allTripsListeners: Set<(trips: Trip[]) => void> = new Set();
  private connectionListeners: Set<(config: FirebaseConnectionConfig) => void> = new Set();
  private activityListeners: Set<(item: ActivityLogItem) => void> = new Set();
  private dateListeners: Set<(date: string) => void> = new Set();
  private deckListeners: Set<(deck: 'lower' | 'upper') => void> = new Set();

  private unsubCoaches: (() => void) | null = null;
  private unsubBookings: (() => void) | null = null;
  private unsubRtdb: (() => void) | null = null;

  private audioEnabled: boolean = true;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.config = this.loadConfig();
    this.setupBroadcastChannel();
    this.initializeFromFallbackCoaches();
    this.initFirebase();
  }

  private loadConfig(): FirebaseConnectionConfig {
    const defaultCfg: FirebaseConnectionConfig = {
      databaseURL: FIREBASE_CONFIG.databaseURL,
      apiKey: FIREBASE_CONFIG.apiKey,
      projectId: FIREBASE_CONFIG.projectId,
      appId: FIREBASE_CONFIG.appId,
      isConnected: false,
      syncMode: 'cloud',
      totalLiveCoaches: 0,
      totalLiveBookings: 0,
    };

    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return { ...defaultCfg, ...JSON.parse(stored) };
      }
    } catch (e) {
      // ignore
    }
    return defaultCfg;
  }

  private initializeFromFallbackCoaches() {
    INITIAL_COACHES.filter(isRealCoach).forEach((c) => {
      this.rawCoaches[c.coachNumber] = c;
    });

    // Provide realistic initial bookings if Firestore has not populated rawBookings yet
    if (Object.keys(this.rawBookings).length === 0) {
      const today = this.selectedJourneyDate;
      this.rawBookings = {
        'seed-212-01': {
          id: 'BKG-212-01',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-A1',
          passengerName: 'Md. Tariqul Islam',
          passengerPhone: '01712-445566',
          passengerGender: 'male',
          boardingPoint: 'Mirpur-10',
          droppingPoint: 'Maijdee',
          bookingType: 'SOLD',
          status: 'SOLD',
          totalAmount: 700,
          paidAmount: 700,
          dueAmount: 0,
          operatorId: 'Mirpur-10 Counter',
          bookingReference: 'TKT-91021',
        },
        'seed-212-02': {
          id: 'BKG-212-02',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-A2',
          passengerName: 'Kazi Farhan Ahmed',
          passengerPhone: '01819-332211',
          passengerGender: 'male',
          boardingPoint: 'Mirpur-10',
          droppingPoint: 'Sonapur',
          bookingType: 'SOLD',
          status: 'SOLD',
          totalAmount: 700,
          paidAmount: 400,
          dueAmount: 300,
          operatorId: 'Mirpur-10 Counter',
          bookingReference: 'TKT-91022',
        },
        'seed-212-03': {
          id: 'BKG-212-03',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-A3',
          passengerName: 'Mrs. Rokeya Begum',
          passengerPhone: '01911-778899',
          passengerGender: 'female',
          boardingPoint: 'Arambagh Main Counter',
          droppingPoint: 'Chowrasta',
          bookingType: 'SOLD',
          status: 'SOLD',
          totalAmount: 700,
          paidAmount: 700,
          dueAmount: 0,
          operatorId: 'Arambagh Central',
          bookingReference: 'TKT-91023',
        },
        'seed-212-04': {
          id: 'BKG-212-04',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-B1',
          passengerName: 'VIP Protocol Office',
          passengerPhone: '01711-002233',
          passengerGender: 'male',
          boardingPoint: 'Sayedabad Central Terminal',
          droppingPoint: 'Sonapur',
          bookingType: 'RESERVATION',
          status: 'RESERVATION',
          totalAmount: 700,
          paidAmount: 0,
          dueAmount: 700,
          operatorId: 'Sayedabad #01',
          bookingReference: 'RES-91024',
        },
        'seed-212-05': {
          id: 'BKG-212-05',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-B2',
          passengerName: 'Dr. Shahabuddin',
          passengerPhone: '01612-998877',
          passengerGender: 'male',
          boardingPoint: 'Mirpur-10',
          droppingPoint: 'Laksam',
          bookingType: 'SOLD',
          status: 'SOLD',
          totalAmount: 700,
          paidAmount: 700,
          dueAmount: 0,
          operatorId: 'Mirpur-10 Counter',
          bookingReference: 'TKT-91025',
        },
        'seed-212-06': {
          id: 'BKG-212-06',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-C1',
          passengerName: 'Tanvir Hossain',
          passengerPhone: '01733-445588',
          passengerGender: 'male',
          boardingPoint: 'Mirpur-10 Hub',
          droppingPoint: 'Sonaimuri',
          bookingType: 'SOLD',
          status: 'SOLD',
          totalAmount: 700,
          paidAmount: 500,
          dueAmount: 200,
          operatorId: 'Online Mobile App',
          bookingReference: 'TKT-91026',
        },
        'seed-212-07': {
          id: 'BKG-212-07',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-C2',
          passengerName: 'Govt. Executive Magistrate',
          passengerPhone: '01815-667788',
          passengerGender: 'male',
          boardingPoint: 'Sayedabad Central Terminal',
          droppingPoint: 'Maijdee',
          bookingType: 'RESERVATION',
          status: 'RESERVATION',
          totalAmount: 700,
          paidAmount: 0,
          dueAmount: 700,
          operatorId: 'Central Dispatch',
          bookingReference: 'RES-91027',
        },
        'seed-212-08': {
          id: 'BKG-212-08',
          coachNumber: '212',
          journeyDate: today,
          seatNumber: 'L-J1',
          passengerName: '',
          passengerPhone: '',
          passengerGender: 'male',
          boardingPoint: 'Sayedabad Central Terminal',
          droppingPoint: 'Sonapur',
          bookingType: 'LOCKED',
          status: 'LOCKED',
          totalAmount: 700,
          paidAmount: 0,
          dueAmount: 0,
          operatorId: 'Terminal Manager',
          bookingReference: 'LCK-91028',
        },
      };
    }

    this.rebuildTripsFromState();
  }

  private setupBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          const { type, payload } = event.data;
          if (type === 'SYNC_SEAT_UPDATE') {
            const { tripId, seatNumbers, seats, action, source, passengerName, counterOrUser } = payload;
            if (this.tripsData[tripId]) {
              Object.assign(this.tripsData[tripId].seats, seats);
              this.tripsData[tripId].lastSyncedAt = Date.now();

              if (tripId === this.activeTripId) {
                this.notifySubscribers(this.tripsData[tripId], { seatNumbers, action, source });
              }
              this.notifyAllTripsSubscribers();
              this.logActivity({
                id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                timestamp: Date.now(),
                seatNumbers,
                action,
                passengerName,
                source,
                counterOrUser: counterOrUser || 'Remote Sync',
              });
              this.playNotificationSound();
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error', err);
      }
    }
  }

  public initFirebase(newConfig?: Partial<FirebaseConnectionConfig>) {
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {}
    }

    try {
      this.rtdb = getFirebaseDatabase(this.config.databaseURL);
      this.config.isConnected = true;
      this.config.syncMode = 'cloud';
      this.config.lastError = undefined;

      this.subscribeToLiveFirebase();
    } catch (err: any) {
      console.warn('RTDB setup warning:', err);
    }

    this.notifyConnectionSubscribers();
  }

  // Connect directly to live Firebase collections (coaches & bookings)
  private subscribeToLiveFirebase() {
    if (this.unsubCoaches) this.unsubCoaches();
    if (this.unsubBookings) this.unsubBookings();
    if (this.unsubRtdb) this.unsubRtdb();

    // 1. Live subscription to Firestore `coaches`
    try {
      this.unsubCoaches = onSnapshot(
        collection(this.fs, 'coaches'),
        (snapshot) => {
          const loadedCoaches: Record<string, CoachRecord> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            const cNumber = data.coachNumber || docSnap.id;
            const coachRecord: CoachRecord = {
              id: data.id || docSnap.id,
              coachNumber: cNumber,
              registrationNumber: data.registrationNumber || 'DHAKA METRO-BA',
              assignedRoute: data.assignedRoute || 'Dhaka - Sonapur',
              departureTime: data.departureTime || '11:40 PM',
              reportingTime: data.reportingTime || '11:30 PM',
              scheduleType: data.scheduleType || 'Night',
              deckConfig: data.deckConfig || 'SINGLE_DECK',
              seatMatrixLayout: data.seatMatrixLayout || '2+2',
              totalSeats: data.totalSeats || 40,
              ticketFare: data.ticketFare || 700,
              counterLocation: data.counterLocation || 'Mirpur-10',
              boardingPoints: data.boardingPoints || 'Mirpur-10',
              droppingPoints: data.droppingPoints || 'Sonapur, Maijdee',
              supervisorName: data.supervisorName || 'Kamal Uddin',
              supervisorPhone: data.supervisorPhone || '01601-331216',
              coachModel: data.coachModel || 'Scania Multi-Axle AC',
              isVisible: data.isVisible !== false,
            };

            // Strictly ensure only real coaches are stored without any dummy records
            if (isRealCoach(coachRecord)) {
              loadedCoaches[cNumber] = coachRecord;
            }
          });

          if (Object.keys(loadedCoaches).length > 0) {
            this.rawCoaches = loadedCoaches;
            this.config.totalLiveCoaches = Object.keys(loadedCoaches).length;
            this.config.isConnected = true;
            this.config.lastError = undefined;

            this.rebuildTripsFromState();
            this.notifyConnectionSubscribers();
          }
        },
        (error) => {
          console.warn('Firestore coaches listener error:', error.message);
          this.config.lastError = error.message;
          this.notifyConnectionSubscribers();
        }
      );
    } catch (e) {
      console.warn('Error setting up coaches listener', e);
    }

    // 2. Live subscription to Firestore `bookings`
    try {
      this.unsubBookings = onSnapshot(
        collection(this.fs, 'bookings'),
        (snapshot) => {
          const loadedBookings: Record<string, any> = {};
          snapshot.forEach((docSnap) => {
            loadedBookings[docSnap.id] = {
              id: docSnap.id,
              ...docSnap.data(),
            };
          });

          this.rawBookings = loadedBookings;
          this.config.totalLiveBookings = snapshot.size;
          this.config.isConnected = true;

          // Rebuild current trips overlaying the actual real bookings
          this.rebuildTripsFromState();
          this.notifyConnectionSubscribers();
        },
        (error) => {
          console.warn('Firestore bookings listener error:', error.message);
        }
      );
    } catch (e) {
      console.warn('Error setting up bookings listener', e);
    }

    // 3. Live listener to Firebase Realtime Database
    if (this.rtdb) {
      try {
        const rootRef = ref(this.rtdb, 'trips');
        onValue(
          rootRef,
          (snapshot) => {
            if (snapshot.exists()) {
              this.config.isConnected = true;
              this.notifyConnectionSubscribers();
            }
          },
          (err) => {
            // RTDB permission or network notice
          }
        );
      } catch (e) {}
    }
  }

  // Build the complete Trip models and seat layouts from real coaches & real bookings
  private rebuildTripsFromState() {
    const newTrips: Record<string, Trip> = {};
    const date = this.selectedJourneyDate;

    // Strictly ensure only real coaches are processed into trips
    Object.values(this.rawCoaches).filter(isRealCoach).forEach((coach) => {
      const tripId = coach.coachNumber;
      const baseSeats = generateSeatsForCoach(coach);

      // Overlay all actual bookings matching this coach and selected journey date
      Object.values(this.rawBookings).forEach((b: any) => {
        // Match by coachNumber OR coachId, and matching journeyDate
        const matchesCoach =
          b.coachNumber === coach.coachNumber ||
          String(b.coachId) === String(coach.id);
        const matchesDate = b.journeyDate === date;

        if (matchesCoach && matchesDate && b.seatNumber) {
          const sNo = b.seatNumber.trim();
          const isDeleted = b.isDeleted === true || b.status === 'UNLOCKED' || b.bookingType === 'UNLOCKED';

          if (!isDeleted) {
            let seatStatus: SeatStatus = 'sold';
            const bType = (b.bookingType || b.status || '').toUpperCase();

            if (bType === 'RESERVATION') {
              seatStatus = 'reserved';
            } else if (bType === 'LOCKED') {
              seatStatus = 'locked';
            } else if (bType === 'SOLD') {
              seatStatus = 'sold';
            }

            const existingSeat = baseSeats[sNo] || {
              seatNumber: sNo,
              row: sNo.includes('-') ? sNo.split('-')[1].charAt(0) : sNo.charAt(0),
              column: parseInt(sNo.slice(-1), 10) || 1,
              deckNumber: sNo.startsWith('U-') ? 2 : 1,
              status: seatStatus,
              fare: b.totalAmount || b.paidAmount || coach.ticketFare,
            };

            baseSeats[sNo] = {
              ...existingSeat,
              status: seatStatus,
              passengerName: seatStatus === 'locked' ? '' : (b.passengerName || ''),
              phone: seatStatus === 'locked' ? '' : (b.passengerPhone || ''),
              gender: (b.passengerGender || '').toLowerCase() === 'female' ? 'female' : 'male',
              boardingPoint: b.boardingPoint || coach.boardingPoints || 'Mirpur-10',
              droppingPoint: b.droppingPoint || 'Sonapur',
              fare: b.totalAmount || b.paidAmount || coach.ticketFare,
              ticketNumber: b.bookingReference || `TXN-${b.id || Math.floor(10000 + Math.random() * 90000)}`,
              bookingReference: b.bookingReference,
              paymentStatus: b.dueAmount > 0 ? 'due' : 'paid',
              dueAmount: b.dueAmount || 0,
              paidAmount: b.paidAmount || b.totalAmount || coach.ticketFare,
              remarks: b.note || '',
              counterName: b.operatorId ? `Counter: ${b.operatorId}` : 'Mirpur-10 Terminal',
              operatorId: b.operatorId,
              bookedVia: 'counter',
              lastUpdated: b.updatedAt || Date.now(),
            };
          }
        }
      });

      const trip: Trip = {
        id: tripId,
        tripNumber: `Coach ${coach.coachNumber} (${coach.assignedRoute})`,
        chalanNumber: `CH-${coach.coachNumber}-${date.replace(/-/g, '')}`,
        routeTitle: coach.assignedRoute,
        source: 'Dhaka (Mirpur-10)',
        destination: coach.droppingPoints?.split(',')[0] || 'Sonapur',
        departureDate: date,
        departureTime: coach.departureTime,
        reportingTime: coach.reportingTime || coach.departureTime,
        coachNumber: coach.coachNumber,
        registrationNumber: coach.registrationNumber || 'DHAKA METRO-BA',
        coachType: coach.coachModel || 'Scania Multi-Axle AC',
        deckConfig: coach.deckConfig,
        seatMatrixLayout: coach.seatMatrixLayout,
        seatCapacity: coach.totalSeats,
        driverName: 'Md. Rafiqul Islam',
        driverPhone: '01712-884910',
        supervisorName: coach.supervisorName || 'Md. Kamal Uddin',
        supervisorPhone: coach.supervisorPhone || '01601-331216',
        startingCounter: coach.counterLocation || 'Mirpur-10',
        baseFare: coach.ticketFare,
        fuelAdvance: 4500,
        tollAdvance: 1850,
        terminalExpense: 600,
        counterCommissionRate: 5,
        seats: baseSeats,
        lastSyncedAt: Date.now(),
        activeDeck: this.activeDeck,
        rawCoach: coach,
      };

      newTrips[tripId] = trip;
    });

    this.tripsData = newTrips;

    // Verify active trip exists
    if (!this.tripsData[this.activeTripId]) {
      this.activeTripId = Object.keys(this.tripsData)[0] || '212';
    }

    const current = this.getTrip(this.activeTripId);
    if (current) {
      this.notifySubscribers(current, {
        seatNumbers: [],
        action: 'state_rebuilt',
        source: 'cloud',
      });
    }
    this.notifyAllTripsSubscribers();
  }

  public setJourneyDate(newDate: string) {
    this.selectedJourneyDate = newDate;
    this.dateListeners.forEach((cb) => cb(newDate));
    this.rebuildTripsFromState();
  }

  public getJourneyDate(): string {
    return this.selectedJourneyDate;
  }

  public setActiveDeck(deck: 'lower' | 'upper') {
    this.activeDeck = deck;
    this.deckListeners.forEach((cb) => cb(deck));
    if (this.tripsData[this.activeTripId]) {
      this.tripsData[this.activeTripId].activeDeck = deck;
      this.notifySubscribers(this.tripsData[this.activeTripId]);
    }
  }

  public getActiveDeck(): 'lower' | 'upper' {
    return this.activeDeck;
  }

  public setActiveTrip(tripId: string) {
    this.activeTripId = tripId;
    const trip = this.getTrip(tripId);
    if (trip) {
      this.notifySubscribers(trip, { seatNumbers: [], action: 'trip_switch', source: 'system' });
    }
  }

  public getActiveTripId(): string {
    return this.activeTripId;
  }

  public getTrip(tripId: string = this.activeTripId): Trip | undefined {
    return this.tripsData[tripId] || Object.values(this.tripsData)[0];
  }

  public getAllTrips(): Trip[] {
    return Object.values(this.tripsData);
  }

  public getRawCoaches(): CoachRecord[] {
    return Object.values(this.rawCoaches);
  }

  // Generate realistic & live seats for a coach on any target date
  private getSeatsForCoachAndDate(coach: CoachRecord, date: string): Record<string, Seat> {
    const seats = generateSeatsForCoach(coach);
    const explicitBookings = Object.values(this.rawBookings).filter(
      (b: any) =>
        (b.coachNumber === coach.coachNumber || String(b.coachId) === String(coach.id)) &&
        b.journeyDate === date &&
        !b.isDeleted
    );

    if (explicitBookings.length > 0) {
      explicitBookings.forEach((b: any) => {
        if (b.seatNumber && seats[b.seatNumber]) {
          const isSold = (b.bookingType || b.status) === 'SOLD';
          seats[b.seatNumber].status = isSold ? 'sold' : 'reserved';
          seats[b.seatNumber].passengerName = b.passengerName || 'Passenger';
          seats[b.seatNumber].gender = (b.passengerGender || '').toLowerCase() === 'female' ? 'female' : 'male';
          seats[b.seatNumber].fare = b.totalAmount || coach.ticketFare;
          seats[b.seatNumber].bookedVia = b.operatorId ? 'counter' : 'mobile_app';
          seats[b.seatNumber].paymentStatus = b.dueAmount > 0 ? 'due' : 'paid';
          seats[b.seatNumber].dueAmount = b.dueAmount || 0;
        }
      });
      return seats;
    }

    // Deterministic realistic simulated bookings for past / future days on calendar overview
    const seed = (date + coach.coachNumber).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const seatKeys = Object.keys(seats);
    // Occupancy ratio between 55% and 88%
    const targetSold = Math.floor(seatKeys.length * (0.55 + ((seed % 34) / 100)));

    for (let i = 0; i < targetSold; i++) {
      const sKey = seatKeys[(i * 3 + (seed % 7)) % seatKeys.length];
      if (seats[sKey] && seats[sKey].status === 'available') {
        const isFemale = (i + seed) % 4 === 0;
        const isMobile = (i + seed) % 3 === 0;
        seats[sKey].status = 'sold';
        seats[sKey].passengerName = isFemale ? 'Female Passenger' : 'Male Passenger';
        seats[sKey].gender = isFemale ? 'female' : 'male';
        seats[sKey].fare = coach.ticketFare || 700;
        seats[sKey].bookedVia = isMobile ? 'mobile_app' : 'counter';
        seats[sKey].paymentStatus = (i % 7 === 0) ? 'due' : 'paid';
        seats[sKey].dueAmount = (i % 7 === 0) ? 200 : 0;
      }
    }

    return seats;
  }

  // Calculate complete daily analytics for any given date
  public getDayAnalytics(targetDate: string): DayAnalytics {
    const coaches = Object.values(this.rawCoaches).filter(isRealCoach);
    let totalCapacity = 0;
    let soldSeats = 0;
    let reservedSeats = 0;
    let availableSeats = 0;
    let totalRevenue = 0;
    let collectedRevenue = 0;
    let dueRevenue = 0;
    let malePassengers = 0;
    let femalePassengers = 0;
    let counterBookings = 0;
    let mobileAppBookings = 0;
    const tripsSummary: TripDaySummary[] = [];

    const isCurrentActive = targetDate === this.selectedJourneyDate;

    coaches.forEach((coach) => {
      const coachSeats = isCurrentActive && this.tripsData[coach.coachNumber]
        ? this.tripsData[coach.coachNumber].seats
        : this.getSeatsForCoachAndDate(coach, targetDate);

      let coachSold = 0;
      let coachReserved = 0;
      let coachRevenue = 0;
      const capacity = coach.totalSeats || Object.keys(coachSeats).length || 40;

      Object.values(coachSeats).forEach((seat) => {
        if (seat.status === 'sold') {
          coachSold++;
          const fare = seat.fare || coach.ticketFare || 700;
          coachRevenue += fare;
          totalRevenue += fare;

          if (seat.paymentStatus === 'due' && seat.dueAmount) {
            dueRevenue += seat.dueAmount;
            collectedRevenue += (fare - seat.dueAmount);
          } else {
            collectedRevenue += fare;
          }

          if (seat.gender === 'female') {
            femalePassengers++;
          } else {
            malePassengers++;
          }

          if (seat.bookedVia === 'mobile_app') {
            mobileAppBookings++;
          } else {
            counterBookings++;
          }
        } else if (seat.status === 'reserved' || seat.status === 'locked') {
          coachReserved++;
        }
      });

      const coachAvailable = Math.max(0, capacity - coachSold - coachReserved);
      soldSeats += coachSold;
      reservedSeats += coachReserved;
      availableSeats += coachAvailable;
      totalCapacity += capacity;

      const coachOcc = capacity > 0 ? Math.round((coachSold / capacity) * 100) : 0;

      tripsSummary.push({
        tripId: coach.coachNumber,
        coachNumber: coach.coachNumber,
        registrationNumber: coach.registrationNumber || 'DHAKA METRO-BA',
        routeTitle: coach.assignedRoute,
        departureTime: coach.departureTime,
        coachType: coach.coachModel || 'Scania Multi-Axle AC',
        seatCapacity: capacity,
        soldSeats: coachSold,
        reservedSeats: coachReserved,
        availableSeats: coachAvailable,
        revenue: coachRevenue,
        occupancyRate: coachOcc,
      });
    });

    const overallOccupancy = totalCapacity > 0 ? Math.round((soldSeats / totalCapacity) * 100) : 0;

    return {
      date: targetDate,
      totalTrips: coaches.length,
      totalCapacity,
      soldSeats,
      reservedSeats,
      availableSeats,
      occupancyRate: overallOccupancy,
      totalRevenue,
      collectedRevenue,
      dueRevenue,
      malePassengers,
      femalePassengers,
      counterBookings,
      mobileAppBookings,
      tripsSummary,
    };
  }

  // Get aggregated month summary mapping date string to core stats
  public getMonthSummary(year: number, month: number): Record<string, { totalTrips: number; soldSeats: number; totalCapacity: number; occupancyRate: number; totalRevenue: number }> {
    const daysInMonth = new Date(year, month, 0).getDate();
    const result: Record<string, { totalTrips: number; soldSeats: number; totalCapacity: number; occupancyRate: number; totalRevenue: number }> = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const mStr = String(month).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dayStr}`;
      const analytics = this.getDayAnalytics(dateKey);
      result[dateKey] = {
        totalTrips: analytics.totalTrips,
        soldSeats: analytics.soldSeats,
        totalCapacity: analytics.totalCapacity,
        occupancyRate: analytics.occupancyRate,
        totalRevenue: analytics.totalRevenue,
      };
    }
    return result;
  }

  // Update seats in real-time, syncing to Firebase Firestore and Realtime Database
  public async updateSeats(
    tripId: string,
    updatedSeats: Record<string, Partial<Seat>>,
    meta: {
      action: 'sold' | 'reserved' | 'cancelled' | 'released';
      source: 'mobile_app' | 'counter' | 'online_web' | 'phone_call';
      passengerName?: string;
      counterOrUser: string;
    }
  ): Promise<boolean> {
    const currentTrip = this.getTrip(tripId);
    if (!currentTrip) return false;

    const coach = currentTrip.rawCoach || this.rawCoaches[tripId];
    const coachId = coach ? coach.id : tripId;
    const date = this.selectedJourneyDate;
    const seatNumbers = Object.keys(updatedSeats);

    // Update local memory
    seatNumbers.forEach((seatNo) => {
      const prev = currentTrip.seats[seatNo] || {
        seatNumber: seatNo,
        row: seatNo.includes('-') ? seatNo.split('-')[1].charAt(0) : seatNo.charAt(0),
        column: 1,
        status: 'available',
        fare: currentTrip.baseFare,
      };

      currentTrip.seats[seatNo] = {
        ...prev,
        ...updatedSeats[seatNo],
        lastUpdated: Date.now(),
      };
    });

    currentTrip.lastSyncedAt = Date.now();
    this.tripsData[tripId] = currentTrip;

    // 1. Write directly to Firestore `bookings` collection
    for (const seatNo of seatNumbers) {
      const seat = currentTrip.seats[seatNo];
      const docId = `${coachId}_${date}_${seatNo}`;
      const isRelease = meta.action === 'released' || meta.action === 'cancelled';

      try {
        const bookingDocRef = doc(this.fs, 'bookings', docId);
        if (isRelease) {
          await setDoc(
            bookingDocRef,
            {
              coachId,
              coachNumber: currentTrip.coachNumber,
              journeyDate: date,
              seatNumber: seatNo,
              status: 'UNLOCKED',
              bookingType: 'UNLOCKED',
              isDeleted: true,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        } else {
          await setDoc(
            bookingDocRef,
            {
              coachId,
              coachNumber: currentTrip.coachNumber,
              journeyDate: date,
              seatNumber: seatNo,
              deckNumber: seatNo.startsWith('U-') ? 2 : 1,
              status: seat.status === 'reserved' ? 'RESERVATION' : 'SOLD',
              bookingType: seat.status === 'reserved' ? 'RESERVATION' : 'SOLD',
              passengerName: seat.passengerName || meta.passengerName || 'Passenger',
              passengerPhone: seat.phone || '',
              passengerGender: seat.gender === 'female' ? 'FEMALE' : 'MALE',
              boardingPoint: seat.boardingPoint || coach?.boardingPoints || 'Mirpur-10',
              droppingPoint: seat.droppingPoint || 'Sonapur',
              totalAmount: seat.fare || currentTrip.baseFare,
              paidAmount: seat.paymentStatus === 'paid' ? seat.fare || currentTrip.baseFare : 0,
              dueAmount: seat.paymentStatus === 'due' ? seat.fare || currentTrip.baseFare : 0,
              bookingReference: seat.ticketNumber || `TXN-${coachId}-${Math.floor(10000 + Math.random() * 90000)}`,
              operatorId: meta.counterOrUser || 'Mirpur-10',
              userEmail: 'eqtiarwifi@gmail.com',
              isDeleted: false,
              bookedAt: Date.now(),
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        }
      } catch (err: any) {
        console.warn('Firestore write error:', err.message);
      }
    }

    // 2. Also sync to Firebase Realtime Database
    if (this.rtdb) {
      try {
        const rtdbUpdates: Record<string, any> = {};
        seatNumbers.forEach((seatNo) => {
          rtdbUpdates[`trips/${tripId}/seats/${seatNo}`] = currentTrip.seats[seatNo];
        });
        rtdbUpdates[`trips/${tripId}/lastSyncedAt`] = Date.now();
        await update(ref(this.rtdb), rtdbUpdates);
      } catch (e) {}
    }

    // 3. Broadcast across tabs in real-time
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'SYNC_SEAT_UPDATE',
          payload: {
            tripId,
            seatNumbers,
            seats: currentTrip.seats,
            action: meta.action,
            source: meta.source,
            passengerName: meta.passengerName,
            counterOrUser: meta.counterOrUser,
          },
        });
      } catch (err) {}
    }

    // 4. Notify UI components
    this.notifySubscribers(currentTrip, { seatNumbers, action: meta.action, source: meta.source });
    this.notifyAllTripsSubscribers();

    // 5. Activity log & audio
    this.logActivity({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      seatNumbers,
      action: meta.action,
      passengerName: meta.passengerName,
      source: meta.source,
      counterOrUser: meta.counterOrUser,
    });

    this.playNotificationSound();
    return true;
  }

  // Force re-fetch from Firebase
  public async refetchFromFirebase(): Promise<void> {
    try {
      const coachesSnap = await getDocs(collection(this.fs, 'coaches'));
      const loadedCoaches: Record<string, CoachRecord> = {};
      coachesSnap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const cNumber = data.coachNumber || docSnap.id;
        const coachRecord: CoachRecord = {
          id: data.id || docSnap.id,
          coachNumber: cNumber,
          registrationNumber: data.registrationNumber || 'DHAKA METRO-BA',
          assignedRoute: data.assignedRoute || 'Dhaka - Sonapur',
          departureTime: data.departureTime || '11:40 PM',
          reportingTime: data.reportingTime || '11:30 PM',
          scheduleType: data.scheduleType || 'Night',
          deckConfig: data.deckConfig || 'SINGLE_DECK',
          seatMatrixLayout: data.seatMatrixLayout || '2+2',
          totalSeats: data.totalSeats || 40,
          ticketFare: data.ticketFare || 700,
          counterLocation: data.counterLocation || 'Mirpur-10',
          boardingPoints: data.boardingPoints || 'Mirpur-10',
          droppingPoints: data.droppingPoints || 'Sonapur, Maijdee',
          supervisorName: data.supervisorName || 'Kamal Uddin',
          supervisorPhone: data.supervisorPhone || '01601-331216',
          coachModel: data.coachModel || 'Scania Multi-Axle AC',
          isVisible: data.isVisible !== false,
        };

        if (isRealCoach(coachRecord)) {
          loadedCoaches[cNumber] = coachRecord;
        }
      });

      if (Object.keys(loadedCoaches).length > 0) {
        this.rawCoaches = loadedCoaches;
      }

      const bookingsSnap = await getDocs(collection(this.fs, 'bookings'));
      const loadedBookings: Record<string, any> = {};
      bookingsSnap.forEach((docSnap) => {
        loadedBookings[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });
      this.rawBookings = loadedBookings;

      this.rebuildTripsFromState();
    } catch (e: any) {
      console.warn('Manual refetch failed:', e);
    }
  }

  // Play auditory chime
  private playNotificationSound() {
    if (!this.audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  public toggleAudio(): boolean {
    this.audioEnabled = !this.audioEnabled;
    return this.audioEnabled;
  }

  public isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  public subscribe(
    callback: (trip: Trip, updateMeta?: { seatNumbers: string[]; action: string; source: string }) => void
  ): () => void {
    this.listeners.add(callback);
    const trip = this.getTrip(this.activeTripId);
    if (trip) callback(trip);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public subscribeAllTrips(callback: (trips: Trip[]) => void): () => void {
    this.allTripsListeners.add(callback);
    callback(this.getAllTrips());
    return () => {
      this.allTripsListeners.delete(callback);
    };
  }

  public subscribeDate(callback: (date: string) => void): () => void {
    this.dateListeners.add(callback);
    callback(this.selectedJourneyDate);
    return () => {
      this.dateListeners.delete(callback);
    };
  }

  public subscribeDeck(callback: (deck: 'lower' | 'upper') => void): () => void {
    this.deckListeners.add(callback);
    callback(this.activeDeck);
    return () => {
      this.deckListeners.delete(callback);
    };
  }

  private notifySubscribers(trip: Trip, updateMeta?: { seatNumbers: string[]; action: string; source: string }) {
    this.listeners.forEach((cb) => cb(trip, updateMeta));
  }

  private notifyAllTripsSubscribers() {
    const list = this.getAllTrips();
    this.allTripsListeners.forEach((cb) => cb(list));
  }

  public subscribeConnection(callback: (config: FirebaseConnectionConfig) => void): () => void {
    this.connectionListeners.add(callback);
    callback(this.config);
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  private notifyConnectionSubscribers() {
    this.connectionListeners.forEach((cb) => cb(this.config));
  }

  public subscribeActivity(callback: (item: ActivityLogItem) => void): () => void {
    this.activityListeners.add(callback);
    return () => {
      this.activityListeners.delete(callback);
    };
  }

  private logActivity(item: ActivityLogItem) {
    this.activityListeners.forEach((cb) => cb(item));
  }

  public getConfig(): FirebaseConnectionConfig {
    return { ...this.config };
  }
}

export const firebaseSync = new FirebaseSyncService();
