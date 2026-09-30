import React from 'react';
import { Trip } from '../types/bus';
import { X, Bus, User, Phone, Clock, MapPin, ShieldCheck } from 'lucide-react';

interface CoachInfoModalProps {
  trip: Trip | null;
  onClose: () => void;
}

export const CoachInfoModal: React.FC<CoachInfoModalProps> = ({ trip, onClose }) => {
  if (!trip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#661d7a] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-purple-200" />
            <h3 className="font-bold text-sm sm:text-base">Coach Information • {trip.coachNumber}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs text-slate-700">
          
          <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-800 uppercase font-bold block">Assigned Route</span>
              <span className="font-extrabold text-sm text-purple-950">{trip.routeTitle}</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-200/80 text-purple-900">
              {trip.coachType}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Registration No</span>
              <span className="font-bold font-mono text-slate-900">{trip.registrationNumber}</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Departure Time</span>
              <span className="font-bold font-mono text-slate-900">{trip.departureTime}</span>
              <span className="text-[10px] text-slate-500 block">Report: {trip.reportingTime || trip.departureTime}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-700" />
                <span>Supervisor:</span>
              </span>
              <span className="font-bold text-slate-900">{trip.supervisorName || 'Md. Kamal Uddin'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-700" />
                <span>Supervisor Phone:</span>
              </span>
              <a href={`tel:${trip.supervisorPhone}`} className="font-bold font-mono text-purple-700 hover:underline">
                {trip.supervisorPhone || '01601-331216'}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Starting Counter:</span>
              </span>
              <span className="font-semibold text-slate-800">{trip.startingCounter || 'Mirpur-10'}</span>
            </div>
          </div>

          {trip.rawCoach?.droppingPoints && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
              <span className="font-bold text-slate-700 block mb-0.5">Route Stoppages & Dropping Points:</span>
              <p className="text-slate-600 leading-relaxed">{trip.rawCoach.droppingPoints}</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#661d7a] hover:bg-[#521563] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
