import React from 'react';
import { ActivityLogItem } from '../types/bus';
import { 
  Activity, 
  Smartphone, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap,
  TrendingUp
} from 'lucide-react';

interface RecentActivityLogProps {
  activities: ActivityLogItem[];
  onClearActivities?: () => void;
}

export const RecentActivityLog: React.FC<RecentActivityLogProps> = ({
  activities,
  onClearActivities,
}) => {
  return (
    <div className="activity-log bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Sync Activity Feed</span>
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {activities.length} Events
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs scrollbar-thin">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <Activity className="w-6 h-6 mx-auto mb-1 opacity-30" />
            <p className="text-[11px]">Awaiting real-time bookings from mobile app or counter...</p>
          </div>
        ) : (
          activities.map((act) => {
            const timeDiff = Math.round((Date.now() - act.timestamp) / 1000);
            const timeLabel =
              timeDiff < 5 ? 'Just now' : timeDiff < 60 ? `${timeDiff}s ago` : `${Math.floor(timeDiff / 60)}m ago`;

            return (
              <div
                key={act.id}
                className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-start gap-2 overflow-hidden">
                  <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    act.action === 'sold'
                      ? 'bg-red-100 text-red-700'
                      : act.action === 'reserved'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {act.action === 'sold' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : act.action === 'reserved' ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-800 text-[11px] leading-tight truncate">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 mr-1">
                        {act.seatNumbers.join(', ')}
                      </span>
                      <span>
                        {act.action === 'sold'
                          ? `booked by ${act.passengerName || 'Passenger'}`
                          : act.action === 'reserved'
                          ? `held for ${act.passengerName || 'Counter'}`
                          : 'booking released'}
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        {act.source === 'mobile_app' ? (
                          <>
                            <Smartphone className="w-2.5 h-2.5 text-emerald-600 inline" /> Mobile App
                          </>
                        ) : (
                          <>
                            <Building2 className="w-2.5 h-2.5 text-slate-500 inline" /> {act.counterOrUser}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                  {timeLabel}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
