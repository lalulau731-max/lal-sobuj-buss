import { Trip, Seat, CoachRecord } from '../types/bus';

// Generate seats for Single-Deck (2+2)
export function generate2x2Seats(totalSeats: number = 40, baseFare: number = 700): Record<string, Seat> {
  const seats: Record<string, Seat> = {};
  const rowCount = Math.ceil(totalSeats / 4);
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'].slice(0, rowCount);

  rowLetters.forEach((row) => {
    for (let col = 1; col <= 4; col++) {
      const seatNo = `${row}${col}`;
      seats[seatNo] = {
        seatNumber: seatNo,
        row,
        column: col,
        deckNumber: 1,
        status: 'available',
        fare: baseFare,
        lastUpdated: Date.now(),
      };
    }
  });

  return seats;
}

// Generate seats for Double-Deck Coach (Lower 28 VIP 1+2, Upper 15 VIP 1+2)
export function generateDoubleDeckSeats(baseFare: number = 700): Record<string, Seat> {
  const seats: Record<string, Seat> = {};

  // Lower Deck: L-A through L-J
  // Row letters: A through J
  const lowerLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  lowerLetters.forEach((letter) => {
    // Single seat on left: L-X1
    const s1 = `L-${letter}1`;
    seats[s1] = {
      seatNumber: s1,
      row: `L-${letter}`,
      column: 1,
      deckNumber: 1,
      status: 'available',
      fare: baseFare,
      lastUpdated: Date.now(),
    };

    // Right pair: L-X2 and L-X3 (Rows A to I have 2 and 3; row J has only 1 to make 28)
    if (letter !== 'J') {
      const s2 = `L-${letter}2`;
      const s3 = `L-${letter}3`;
      seats[s2] = {
        seatNumber: s2,
        row: `L-${letter}`,
        column: 2,
        deckNumber: 1,
        status: 'available',
        fare: baseFare,
        lastUpdated: Date.now(),
      };
      seats[s3] = {
        seatNumber: s3,
        row: `L-${letter}`,
        column: 3,
        deckNumber: 1,
        status: 'available',
        fare: baseFare,
        lastUpdated: Date.now(),
      };
    }
  });

  // Upper Deck: U-A through U-E (5 rows x 3 seats = 15 seats)
  const upperLetters = ['A', 'B', 'C', 'D', 'E'];
  upperLetters.forEach((letter) => {
    for (let col = 1; col <= 3; col++) {
      const seatNo = `U-${letter}${col}`;
      seats[seatNo] = {
        seatNumber: seatNo,
        row: `U-${letter}`,
        column: col,
        deckNumber: 2,
        status: 'available',
        fare: baseFare,
        lastUpdated: Date.now(),
      };
    }
  });

  return seats;
}

// Generate appropriate seat matrix based on actual coach configuration
export function generateSeatsForCoach(coach: CoachRecord): Record<string, Seat> {
  const fare = coach.ticketFare || 700;
  if (coach.deckConfig === 'DOUBLE_DECK' || coach.seatMatrixLayout?.includes('VIP (28)')) {
    return generateDoubleDeckSeats(fare);
  }
  return generate2x2Seats(coach.totalSeats || 40, fare);
}

export const BOARDING_POINTS = [
  'Mirpur-10',
  'Mirpur-10 05:30 AM',
  'Mirpur-10 Hub',
  'Savar',
  'Jigatola',
  'Arambagh Main Counter',
  'Sayedabad Central Terminal',
  'Jatrabari VIP Counter',
];

export const DROPPING_POINTS = [
  'Sonapur',
  'Raipur',
  'Chittagong',
  'Maijdee',
  'Noakhali',
  'Lakshmipur',
  'Navy Gate',
  'Chowrasta',
  'Sonaimuri',
  'Laksam',
  'Feni',
  'AK Khan',
  'Alangkar',
];

export const COUNTERS = [
  'Mirpur-10',
  'Arambagh Central Counter',
  'Sayedabad Counter #01',
  'Sayedabad Counter #02',
  'Online / Mobile App API',
  'Maijdee Head Booking Office',
  'Sonapur Counter',
];

// Strict validator to ensure only authentic Lal Sabuj Paribahan coaches are displayed
export function isRealCoach(coach?: CoachRecord | Partial<CoachRecord> | null): boolean {
  if (!coach || !coach.coachNumber) return false;
  if (coach.isVisible === false) return false;

  const num = coach.coachNumber.trim().toUpperCase();
  const model = (coach.coachModel || '').trim().toUpperCase();
  const route = (coach.assignedRoute || '').trim().toUpperCase();
  const reg = (coach.registrationNumber || '').trim().toUpperCase();

  // Filter out any dummy, test, demo, sample, or mock records
  if (
    num.includes('DUMMY') ||
    num.includes('TEST') ||
    num.includes('DEMO') ||
    num.includes('SAMPLE') ||
    num.includes('MOCK') ||
    num.includes('TEMP') ||
    num.includes('FAKE') ||
    num === '0' ||
    num === '000' ||
    num === 'DEFAULT' ||
    model.includes('DUMMY') ||
    model.includes('TEST') ||
    route.includes('DUMMY') ||
    route.includes('TEST') ||
    reg.includes('DUMMY') ||
    reg.includes('TEST')
  ) {
    return false;
  }

  return true;
}

// Fallback seed coaches matching exact Firebase records if offline
export const INITIAL_COACHES: CoachRecord[] = [
  {
    id: 'D-CH205',
    coachNumber: 'D-CH205',
    registrationNumber: '14-6184',
    assignedRoute: 'Dhaka-Kalshi-Chittagong-Navy Gate',
    departureTime: '10:00 PM',
    reportingTime: '09:45 PM',
    scheduleType: 'Night',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 800,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Mirpur-10, Kalshi, Sayedabad',
    droppingPoints: 'Chittagong, Navy Gate, AK Khan, Alangkar, Feni',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Rashed Chowdhury',
    supervisorPhone: '01819-224411',
    isVisible: true,
  },
  {
    id: 'DN001',
    coachNumber: 'DN001',
    registrationNumber: '13-2431',
    assignedRoute: 'Savar-Cumilla-Noakhali',
    departureTime: '05:30 AM',
    reportingTime: '05:15 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Savar, Gabtoli',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Cumilla, Chowrasta',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Rafiq Uddin',
    supervisorPhone: '01712-443322',
    isVisible: true,
  },
  {
    id: 'DN010(TENA)',
    coachNumber: 'DN010(TENA)',
    registrationNumber: '13-2396',
    assignedRoute: 'Savar-Cumilla-Noakhali',
    departureTime: '09:00 PM',
    reportingTime: '08:45 PM',
    scheduleType: 'Night',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 550,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Savar, Nabinagar',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Cumilla, Chowrasta',
    coachModel: 'Economy Non AC',
    supervisorName: 'Md. Babul Hossain',
    supervisorPhone: '01911-332244',
    isVisible: true,
  },
  {
    id: 'DN014',
    coachNumber: 'DN014',
    registrationNumber: '12-4083',
    assignedRoute: 'Savar-Cumilla-Noakhali',
    departureTime: '09:00 PM',
    reportingTime: '08:45 PM',
    scheduleType: 'Night',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Savar',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Cumilla, Chowrasta',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Jahangir Alam',
    supervisorPhone: '01611-554433',
    isVisible: true,
  },
  {
    id: 'DN102',
    coachNumber: 'DN102',
    registrationNumber: '12-4082',
    assignedRoute: 'Jigatola-Cumilla-Noakhali',
    departureTime: '05:00 AM',
    reportingTime: '04:45 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Jigatola, Dhanmondi',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Cumilla, Chowrasta',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Nasir Ahmed',
    supervisorPhone: '01815-778899',
    isVisible: true,
  },
  {
    id: 'DN200',
    coachNumber: 'DN200',
    registrationNumber: '12-5179',
    assignedRoute: 'Mirpur -Cumilla-Noakhali',
    departureTime: '04:45 AM',
    reportingTime: '04:30 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 550,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Mirpur-10, Sayedabad',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Chowrasta, Laksam',
    coachModel: 'Economy Non AC',
    supervisorName: 'Md. Tarequl Islam',
    supervisorPhone: '01719-223344',
    isVisible: true,
  },
  {
    id: 'DN201',
    coachNumber: 'DN201',
    registrationNumber: '12-4126',
    assignedRoute: 'Mirpur -Cumilla-Noakhali',
    departureTime: '05:00 AM',
    reportingTime: '04:45 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Mirpur-10, Sayedabad',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Chowrasta, Laksam',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Kamal Hossain',
    supervisorPhone: '01511-998877',
    isVisible: true,
  },
  {
    id: 'DN202',
    coachNumber: 'DN202',
    registrationNumber: '12-4101',
    assignedRoute: 'Mirpur -Cumilla-Noakhali',
    departureTime: '05:15 AM',
    reportingTime: '05:00 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Mirpur-10 05:30 AM, Sayedabad',
    droppingPoints: 'Noakhali 12:25 PM, Maijdee, Sonapur, Chowrasta, Laksam',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Shafiqul Islam',
    supervisorPhone: '01711-223344',
    isVisible: true,
  },
  {
    id: 'DN203',
    coachNumber: 'DN203',
    registrationNumber: '12-4101',
    assignedRoute: 'Mirpur -Cumilla-Noakhali',
    departureTime: '05:30 AM',
    reportingTime: '05:15 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Mirpur-10, Sayedabad',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Chowrasta, Laksam',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Alauddin',
    supervisorPhone: '01912-334455',
    isVisible: true,
  },
  {
    id: '212',
    coachNumber: 'DN212',
    registrationNumber: '11-2189',
    assignedRoute: 'Mirpur -Cumilla-Noakhali',
    departureTime: '11:45 PM',
    reportingTime: '11:30 PM',
    scheduleType: 'Night',
    deckConfig: 'DOUBLE_DECK',
    seatMatrixLayout: 'L:1+2 VIP (28) | U:1+2 VIP (15)',
    totalSeats: 43,
    ticketFare: 700,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Mirpur-10, Sayedabad',
    droppingPoints: 'Sonapur, Maijdee, Chowrasta, Sonaimuri, Laksam',
    supervisorPhone: '01601-331216',
    supervisorName: 'Md. Kamal Uddin',
    coachModel: 'Suite-Class AC',
    isVisible: true,
  },
  {
    id: 'DN216',
    coachNumber: 'DN216',
    registrationNumber: '15-1851',
    assignedRoute: 'Jigatola-Cumilla-Noakhali',
    departureTime: '06:15 AM',
    reportingTime: '06:00 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Jigatola, Dhanmondi',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Chowrasta, Laksam',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Anisur Rahman',
    supervisorPhone: '01715-667788',
    isVisible: true,
  },
  {
    id: 'DN220',
    coachNumber: 'DN220',
    registrationNumber: '13-4412',
    assignedRoute: 'Jigatola-Cumilla-Noakhali',
    departureTime: '11:30 PM',
    reportingTime: '11:15 PM',
    scheduleType: 'Night',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Jigatola, Dhanmondi',
    droppingPoints: 'Noakhali, Maijdee, Sonapur, Chowrasta, Laksam',
    coachModel: 'Economy AC',
    supervisorName: 'Md. Mostafa Kamal',
    supervisorPhone: '01811-445566',
    isVisible: true,
  },
  {
    id: '225lak',
    coachNumber: 'DN225(LAK)',
    registrationNumber: '12-4082',
    assignedRoute: 'Mirpur -Cumilla-Noakhali',
    departureTime: '11:00 PM',
    reportingTime: '10:45 PM',
    scheduleType: 'Night',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 700,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur-10, Mirpur-10, Sayedabad',
    droppingPoints: 'Raipur, Lakshmipur, Jhumur, ChandraGanj, Chowrasta, Sonaimuri, Laksam',
    supervisorPhone: '01712-887766',
    supervisorName: 'Md. Habibur Rahman',
    coachModel: 'Economy AC',
    isVisible: true,
  },
];
