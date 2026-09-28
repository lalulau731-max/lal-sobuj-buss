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
  'মিরপুর ১০',
  'Mirpur-10 Hub',
  'Arambagh Main Counter',
  'Sayedabad Central Terminal',
  'Jatrabari VIP Counter',
];

export const DROPPING_POINTS = [
  'Sonapur',
  'Maijdee',
  'Chowrasta',
  'Sonaimuri',
  'Laksam',
  'Raipur',
  'Lakshmipur',
  'নেভিগেট',
  'এ.কে. খান',
  'অলংকার',
  'ফেনী',
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

// Fallback seed coaches matching exact Firebase records if offline
export const INITIAL_COACHES: CoachRecord[] = [
  {
    id: 4,
    coachNumber: '212',
    registrationNumber: 'DHAKA METRO-BA 2185',
    assignedRoute: 'ঢাকা - সোনাপুর',
    departureTime: '11:40 PM',
    reportingTime: '11:30 PM',
    scheduleType: 'Night',
    deckConfig: 'DOUBLE_DECK',
    seatMatrixLayout: 'L:1+2 VIP (28) | U:1+2 VIP (15)',
    totalSeats: 43,
    ticketFare: 700,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'মিরপুর ১০',
    droppingPoints: 'Sonapur, Maijdee, Chowrasta, Sonaimuri, Laksam.',
    supervisorPhone: '01601-331216',
    coachModel: 'Scania Multi-Axle AC',
    isVisible: true,
  },
  {
    id: 2,
    coachNumber: '205CTG',
    registrationNumber: 'DHAKA METRO-BA',
    assignedRoute: 'ঢাকা - চট্টগ্রাম',
    departureTime: '11:45 PM',
    reportingTime: '11:40 PM',
    scheduleType: 'Night',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 800,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'মিরপুর ১০',
    droppingPoints: 'নেভিগেট, এ.কে. খান, অলংকার, ফেনী',
    coachModel: 'Scania Multi-Axle AC',
    isVisible: true,
  },
  {
    id: 3,
    coachNumber: '225lak',
    registrationNumber: 'DHAKA METRO-BA 4087',
    assignedRoute: 'ঢাকা - লক্ষ্মীপুর',
    departureTime: '11:20 PM',
    reportingTime: '11:10 PM',
    scheduleType: 'Night',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 700,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'মিরপুর ১০',
    droppingPoints: 'Raipur, Lakshmipur, Jhumur, ChandraGanj, Chowrasta, Sonaimuri, Laksam.',
    coachModel: 'Scania Multi-Axle AC',
    isVisible: true,
  },
  {
    id: 16,
    coachNumber: '203Sokal',
    registrationNumber: 'DHAKA METRO-BA',
    assignedRoute: 'ঢাকা - সোনাপুর',
    departureTime: '06:15 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 650,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'Mirpur 10',
    droppingPoints: 'Sonapur, Maijdee, Chowrasta, Sonaimuri, Laksam.',
    coachModel: 'Scania Multi-Axle AC',
    isVisible: false,
  },
  {
    id: 25,
    coachNumber: '200nonac',
    registrationNumber: 'DHAKA METRO-BA',
    assignedRoute: 'ঢাকা - সোনাপুর',
    departureTime: '5:50 AM',
    scheduleType: 'Day',
    deckConfig: 'SINGLE_DECK',
    seatMatrixLayout: '2+2',
    totalSeats: 40,
    ticketFare: 550,
    counterLocation: 'Mirpur-10',
    boardingPoints: 'মিরপুর ১০',
    droppingPoints: 'সোনাপুর, মাইজদী, চৌরাস্তা, সোনাইমুড়ী, লাকসাম',
    coachModel: 'Scania Multi-Axle AC',
    isVisible: false,
  },
];
