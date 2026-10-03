import React, { useState } from 'react';
import { X, Banknote, Building2, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { Trip } from '../types/bus';

interface HDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  journeyDate: string;
}

export const HDepositModal: React.FC<HDepositModalProps> = ({
  isOpen,
  onClose,
  trips,
  journeyDate,
}) => {
  const [bankName, setBankName] = useState<string>('Islami Bank Bangladesh Ltd');
  const [accountNumber, setAccountNumber] = useState<string>('2050-1122334455');
  const [slipRef, setSlipRef] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate total sold seats and collections across all trips for today
  let totalSoldTickets = 0;
  let totalGrossCollection = 0;
  let totalAdvances = 0;

  trips.forEach((t) => {
    Object.values(t.seats || {}).forEach((s) => {
      if (s.status === 'sold' && s.bookedVia === 'counter') {
        totalSoldTickets++;
        totalGrossCollection += s.fare || t.baseFare || 650;
      }
    });
    totalAdvances += (t.fuelAdvance || 0) + (t.tollAdvance || 0);
  });

  const netPayableToHeadOffice = Math.max(0, totalGrossCollection - totalAdvances);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#661d7a] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-purple-200" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Head Office Deposit (H Deposit)</h3>
              <p className="text-[11px] text-purple-200">Terminal Cash Reconciliation & Bank Deposit</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">H Deposit Slip Logged Successfully!</h4>
            <p className="text-xs text-slate-500">
              Deposit of <strong>BDT {netPayableToHeadOffice.toLocaleString()}</strong> has been submitted to Lal Sobuj Paribahan central accounts.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs text-slate-700">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                <span className="text-[10px] text-purple-800 uppercase block font-semibold">Counter Sold</span>
                <span className="font-extrabold text-base text-purple-950 font-mono">{totalSoldTickets}</span>
                <span className="text-[10px] text-slate-500 block">Tickets</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Gross Fare</span>
                <span className="font-extrabold text-base text-slate-900 font-mono">BDT {totalGrossCollection.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">Total Revenue</span>
              </div>

              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Net H Deposit</span>
                <span className="font-extrabold text-base text-emerald-950 font-mono">BDT {netPayableToHeadOffice.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-700 block">Net in Hand</span>
              </div>
            </div>

            {/* Bank Deposit Inputs */}
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Head Office Designated Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-600"
                >
                  <option>Islami Bank Bangladesh Ltd - CD A/C 20501122334455</option>
                  <option>Dutch-Bangla Bank Ltd - A/C 118.110.45678</option>
                  <option>BRAC Bank Ltd - Corporate A/C 150120334455</option>
                  <option>Cash Handover to Central Collector</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Counter Terminal</label>
                  <input
                    type="text"
                    readOnly
                    value="North / Mirpur-10 Terminal"
                    className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-600 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Deposit Slip / Txn Ref *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SLIP-84920"
                    value={slipRef}
                    onChange={(e) => setSlipRef(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-purple-600 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Notice:</strong> Once submitted, the terminal collection for {journeyDate} will be reconciled against the central accounts ledger.
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#661d7a] hover:bg-[#521563] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              >
                Submit H Deposit (BDT {netPayableToHeadOffice.toLocaleString()})
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
