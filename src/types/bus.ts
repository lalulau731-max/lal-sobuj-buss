export type SeatStatus = 'available' | 'sold' | 'reserved' | 'selected' | 'locked';

export type Gender = 'male' | 'female' | 'other';

export type BookedVia = 'mobile_app' | 'counter' | 'online_web' | 'phone_call';

export type PaymentStatus = 'paid' | 'due' | 'cash_on_board';

export type DeckConfig = 'SINGLE_DECK' | 'DOUBLE_DECK';

export interface Seat {
  seatNumber: string; // e.g. "A1", "B2", "L-A1", "U-B2"
  row: string; // "A", "B", "L-A", "U-A"
  column: number; // 1, 2, 3, 4
  deckNumber?: number; // 1 = lower, 2 = upper
  status: SeatStatus;
  passengerName?: string;
  phone?: string;
  gender?: Gender;
  boardingPoint?: string;
  droppingPoint?: string;
  fare: number;
  ticketNumber?: string;
  bookingReference?: string;
  counterName?: string;
  bookedVia?: BookedVia;
  bookedAt?: string; // ISO string
  holdExpiresAt?: string; // ISO string
  paymentStatus?: PaymentStatus;
  remarks?: string;
  updatedBy?: string;
  lastUpdated?: number;
  operatorId?: string;
  dueAmount?: number;
  paidAmount?: number;
  discount?: number;
}

export interface CoachRecord {
  id: number | string;
  coachNumber: string;
  registrationNumber: string;
  assignedRoute: string;
  departureTime: string;
  reportingTime?: string;
  scheduleType?: 'Day' | 'Night' | string;
  deckConfig: DeckConfig;
  seatMatrixLayout: string;
  totalSeats: number;
  ticketFare: number;
  counterLocation?: string;
  boardingPoints?: string;
  droppingPoints?: string;
  supervisorName?: string;
  supervisorPhone?: string;
  helperName?: string;
  helperPhone?: string;
  coachModel?: string;
  isVisible?: boolean;
}

export interface Trip {
  id: string;
  tripNumber: string; // e.g. "Coach 212"
  chalanNumber: string; // e.g. "CH-LSP-2026-0412"
  routeTitle: string; // e.g. "Dhaka - Sonapur"
  source: string;
  destination: string;
  departureDate: string; // e.g. "2026-09-28"
  departureTime: string; // e.g. "11:40 PM"
  reportingTime?: string;
  coachNumber: string; // e.g. "212"
  registrationNumber: string; // e.g. "DHAKA METRO-BA 2185"
  coachType: string; // e.g. "Scania Multi-Axle AC"
  deckConfig: DeckConfig;
  seatMatrixLayout: string; // e.g. "L:1+2 VIP (28) | U:1+2 VIP (15)" or "2+2"
  seatCapacity: number; // e.g. 43 or 40
  driverName: string;
  driverPhone: string;
  driverLicense?: string;
  supervisorName: string;
  supervisorPhone: string;
  startingCounter: string;
  baseFare: number;
  fuelAdvance: number;
  tollAdvance: number;
  terminalExpense: number;
  counterCommissionRate: number; // e.g. 5%
  seats: Record<string, Seat>;
  lastSyncedAt?: number;
  activeDeck?: 'lower' | 'upper';
  rawCoach?: CoachRecord;
}

export interface BookingFormData {
  passengerName: string;
  phone: string;
  gender: Gender;
  boardingPoint: string;
  droppingPoint: string;
  fare: number;
  discount: number;
  paymentStatus: PaymentStatus;
  counterName: string;
  remarks: string;
}

export interface ReservationFormData {
  reservedFor: string;
  phone: string;
  counterName: string;
  holdMinutes: number;
  remarks: string;
}

export interface FirebaseConnectionConfig {
  databaseURL: string;
  apiKey?: string;
  projectId?: string;
  appId?: string;
  isConnected: boolean;
  syncMode: 'cloud' | 'local_broadcast';
  lastError?: string;
  totalLiveCoaches?: number;
  totalLiveBookings?: number;
}

export interface ActivityLogItem {
  id: string;
  timestamp: number;
  seatNumbers: string[];
  action: 'sold' | 'reserved' | 'cancelled' | 'released' | 'trip_switch';
  passengerName?: string;
  source: BookedVia | 'system';
  counterOrUser: string;
}

export interface TripDaySummary {
  tripId: string;
  coachNumber: string;
  registrationNumber: string;
  routeTitle: string;
  departureTime: string;
  coachType: string;
  seatCapacity: number;
  soldSeats: number;
  reservedSeats: number;
  availableSeats: number;
  revenue: number;
  occupancyRate: number;
}

export interface DayAnalytics {
  date: string; // YYYY-MM-DD
  totalTrips: number;
  totalCapacity: number;
  soldSeats: number;
  reservedSeats: number;
  availableSeats: number;
  occupancyRate: number; // 0 - 100
  totalRevenue: number;
  collectedRevenue: number;
  dueRevenue: number;
  malePassengers: number;
  femalePassengers: number;
  counterBookings: number;
  mobileAppBookings: number;
  tripsSummary: TripDaySummary[];
}
