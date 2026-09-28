import React, { useState } from 'react';
import { Trip, DeckConfig } from '../types/bus';
import { generate2x2Seats, BOARDING_POINTS, DROPPING_POINTS, COUNTERS } from '../data/mockTrips';
import { X, Plus, Bus, Calendar, Clock, MapPin, DollarSign, User } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
}) => {
  const [tripNumber, setTripNumber] = useState<string>('LSP-');
  const [routeTitle, setRouteTitle] = useState<string>('Dhaka ⇄ Maijdee - Sonapur');
  const [source, setSource] = useState<string>('Dhaka (Mirpur-10)');
  const [destination, setDestination] = useState<string>('Sonapur (Noakhali)');
  const [departureDate, setDepartureDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [departureTime, setDepartureTime] = useState<string>('09:00 AM');
  const [coachNumber, setCoachNumber] = useState<string>('230');
  const [registrationNumber, setRegistrationNumber] = useState<string>('DHAKA METRO-BA');
  const [coachType, setCoachType] = useState<string>('Scania Multi-Axle AC');
  const [deckConfig, setDeckConfig] = useState<DeckConfig>('SINGLE_DECK');
  const [seatCapacity, setSeatCapacity] = useState<number>(40);
  const [baseFare, setBaseFare] = useState<number>(700);
  const [driverName, setDriverName] = useState<string>('মো: রফিকুল ইসলাম');
  const [driverPhone, setDriverPhone] = useState<string>('01712-884910');
  const [supervisorName, setSupervisorName] = useState<string>('মো: কামাল উদ্দিন');
  const [supervisorPhone, setSupervisorPhone] = useState<string>('01601-331216');
  const [startingCounter, setStartingCounter] = useState<string>('Mirpur-10');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = coachNumber.trim() || `trip-${Date.now()}`;
    const chalanNumber = `CH-${id}-${departureDate.replace(/-/g, '')}`;

    const newTrip: Trip = {
      id,
      tripNumber: `Coach ${id} (${routeTitle})`,
      chalanNumber,
      routeTitle: routeTitle.trim(),
      source: source.trim(),
      destination: destination.trim(),
      departureDate,
      departureTime,
      coachNumber: id,
      registrationNumber: registrationNumber.trim(),
      coachType,
      deckConfig,
      seatMatrixLayout: deckConfig === 'DOUBLE_DECK' ? 'L:1+2 VIP (28) | U:1+2 VIP (15)' : '2+2',
      seatCapacity,
      driverName: driverName.trim() || 'Assigned Driver',
      driverPhone: driverPhone.trim(),
      supervisorName: supervisorName.trim() || 'Assigned Supervisor',
      supervisorPhone: supervisorPhone.trim(),
      startingCounter,
      baseFare,
      fuelAdvance: 4500,
      tollAdvance: 1850,
      terminalExpense: 600,
      counterCommissionRate: 5,
      seats: generate2x2Seats(seatCapacity, baseFare),
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-emerald-800 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-base font-bold">Add New Coach in Firebase Fleet</h3>
              <p className="text-xs text-red-100">
                Initializes active coach seat layout in your Firebase project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Coach ID / Number *
              </label>
              <input
                type="text"
                required
                value={coachNumber}
                onChange={(e) => setCoachNumber(e.target.value)}
                placeholder="e.g. 230"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Departure Time *
              </label>
              <input
                type="text"
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                placeholder="11:40 PM"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Assigned Route (যাত্রাপথ) *
            </label>
            <input
              type="text"
              required
              value={routeTitle}
              onChange={(e) => setRouteTitle(e.target.value)}
              placeholder="ঢাকা - সোনাপুর"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="DHAKA METRO-BA 2185"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Deck Configuration
              </label>
              <select
                value={deckConfig}
                onChange={(e) => setDeckConfig(e.target.value as DeckConfig)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="SINGLE_DECK">Single Deck (2+2)</option>
                <option value="DOUBLE_DECK">Double Deck (1+2 VIP 43 Seats)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Total Seats
              </label>
              <input
                type="number"
                value={seatCapacity}
                onChange={(e) => setSeatCapacity(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Fare (৳)
              </label>
              <input
                type="number"
                value={baseFare}
                onChange={(e) => setBaseFare(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Supervisor Phone
              </label>
              <input
                type="text"
                value={supervisorPhone}
                onChange={(e) => setSupervisorPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Boarding Location
              </label>
              <input
                type="text"
                value={startingCounter}
                onChange={(e) => setStartingCounter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coach in Fleet</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
