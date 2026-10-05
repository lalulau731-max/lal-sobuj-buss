import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ruler, 
  Printer, 
  RotateCcw, 
  Plus, 
  Minus, 
  Check, 
  Scissors, 
  SlidersHorizontal,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { 
  chalanConfigService, 
  ChalanPrintConfig, 
  EXACT_HALF_A4_HEIGHT_INCHES, 
  EXACT_HALF_A4_HEIGHT_MM,
  STANDARD_A4_HEIGHT_INCHES,
  STANDARD_A4_WIDTH_INCHES
} from '../services/chalanConfig';

interface ChalanDimensionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAndPrint?: () => void;
}

export const ChalanDimensionConfigModal: React.FC<ChalanDimensionConfigModalProps> = ({
  isOpen,
  onClose,
  onApplyAndPrint,
}) => {
  const [config, setConfig] = useState<ChalanPrintConfig>(() => chalanConfigService.getConfig());
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    const unsub = chalanConfigService.subscribe((cfg) => {
      setConfig(cfg);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const currentHeightInches = config.heightInches;
  const currentHeightMm = Math.round(currentHeightInches * 25.4 * 10) / 10;
  const heightRatioPercent = Math.round((currentHeightInches / STANDARD_A4_HEIGHT_INCHES) * 100);

  // Quick Half-Inch Presets starting from exactly Half of A4
  const PRESETS = [
    { label: 'Tight (4.85")', val: 4.85, tag: '-1.0 in' },
    { label: 'Compact (5.35")', val: 5.35, tag: '-0.5 in' },
    { label: 'Half A4 (5.85")', val: EXACT_HALF_A4_HEIGHT_INCHES, tag: 'Standard Top Half', isDefault: true },
    { label: 'Extended (6.35")', val: 6.35, tag: '+0.5 in' },
    { label: 'Large (6.85")', val: 6.85, tag: '+1.0 in' },
    { label: 'Full A4 (11.69")', val: STANDARD_A4_HEIGHT_INCHES, tag: 'Full Sheet' },
  ];

  const handleStep = (deltaInches: number) => {
    chalanConfigService.adjustHeight(deltaInches);
    flashSaved();
  };

  const handleSetExact = (val: number) => {
    chalanConfigService.updateConfig({ heightInches: val });
    flashSaved();
  };

  const handleReset = () => {
    chalanConfigService.updateConfig({
      heightInches: EXACT_HALF_A4_HEIGHT_INCHES,
      widthInches: STANDARD_A4_WIDTH_INCHES,
      marginTopMm: 3.5,
      marginBottomMm: 3.5,
      marginLeftMm: 5,
      marginRightMm: 5,
      scalePercent: 100,
      showCutMark: true,
    });
    flashSaved();
  };

  const handleMarginChange = (side: 'marginTopMm' | 'marginBottomMm' | 'marginLeftMm' | 'marginRightMm', delta: number) => {
    const currentVal = config[side] || 4;
    const newVal = Math.max(0, Math.min(25, currentVal + delta));
    chalanConfigService.updateConfig({ [side]: newVal });
    flashSaved();
  };

  const flashSaved = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-4">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Chalan Print Dimension Settings</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Single A4 Portrait (Top Half)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calibrated for single A4 portrait page, strictly fitting the top half with dynamic scaling.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status Alert if Saved */}
          {savedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-100">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Dimension and scale configuration updated and saved to printer profile!</span>
            </div>
          )}

          {/* Current Dimension Visual Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-slate-50 border border-slate-200">
            
            {/* Visual Sheet Preview Box */}
            <div className="md:col-span-4 flex flex-col items-center justify-center">
              <div className="text-[10px] uppercase font-black text-slate-500 mb-1">
                Visual Sheet Proportion
              </div>
              <div className="relative w-36 h-48 bg-white border-2 border-slate-400 rounded-sm shadow-inner flex flex-col justify-between overflow-hidden">
                {/* Active Chalan Section */}
                <div 
                  className="w-full bg-blue-100/90 border-b-2 border-dashed border-red-500 relative transition-all duration-300 flex flex-col justify-between p-1.5"
                  style={{ height: `${Math.min(100, Math.max(25, heightRatioPercent))}%` }}
                >
                  <div className="flex items-center justify-between text-[9px] font-black text-blue-900">
                    <span>CHALAN</span>
                    <span>{currentHeightInches}"</span>
                  </div>
                  <div className="text-center text-[8.5px] font-mono text-blue-800 font-bold truncate">
                    {currentHeightMm} mm
                  </div>
                </div>

                {/* Remaining Blank Area of A4 */}
                <div className="flex-1 bg-slate-100/50 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                  {heightRatioPercent < 90 ? 'Lower Half (Blank)' : ''}
                </div>

                {/* Scissor Cut Line */}
                <div 
                  className="absolute left-0 right-0 border-t border-red-500 flex items-center justify-between px-1 pointer-events-none"
                  style={{ top: `${Math.min(98, Math.max(25, heightRatioPercent))}%` }}
                >
                  <Scissors className="w-2.5 h-2.5 text-red-600 -translate-y-1/2" />
                  <span className="text-[7.5px] font-mono text-red-600 bg-white px-0.5 -translate-y-1/2">
                    Cut Line
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                A4 Standard (8.27" × 11.69")
              </span>
            </div>

            {/* Current Measurements & Half-Inch Increment Steppers */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Active Sheet Height
                  </span>
                  <div className="text-3xl font-black text-slate-900 flex items-baseline gap-2">
                    <span>{currentHeightInches}"</span>
                    <span className="text-base text-slate-500 font-semibold font-mono">
                      ({currentHeightMm} mm)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    A4 Coverage
                  </span>
                  <div className="text-lg font-black text-blue-700">
                    {heightRatioPercent}% of A4
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentHeightInches === EXACT_HALF_A4_HEIGHT_INCHES ? 'Exact Half A4 (Top)' : 'Custom Height'}
                  </span>
                </div>
              </div>

              {/* Half-Inch Increment / Decrement Steppers */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Half-Inch Increment / Decrement:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStep(-0.5)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Minus className="w-4 h-4 text-red-600 stroke-[3]" />
                    <span>Decrease (-0.5 Inch)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStep(0.5)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Plus className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Increase (+0.5 Inch)</span>
                  </button>
                </div>
              </div>

              {/* Slider for smooth fine-tuning */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold">
                  <span>Fine Slider: 3.5"</span>
                  <span className="text-blue-700 font-black">Half A4 (5.85")</span>
                  <span>Full A4 (11.69")</span>
                </div>
                <input
                  type="range"
                  min="3.5"
                  max="11.69"
                  step="0.05"
                  value={currentHeightInches}
                  onChange={(e) => {
                    chalanConfigService.updateConfig({ heightInches: parseFloat(e.target.value) });
                    flashSaved();
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

            </div>

          </div>

          {/* Quick Half-Inch Presets starting from Half-A4 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Presets (Targeted for A4 Top Half):</span>
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Standard Top Half</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const isSelected = Math.abs(currentHeightInches - p.val) < 0.04;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSetExact(p.val)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="text-xs font-black truncate">
                      {p.label}
                    </div>
                    <div className={`text-[10px] font-medium truncate mt-0.5 ${
                      isSelected ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {p.tag}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale & Print Margin Tuning */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
              Scale & Print Margin Calibration:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Scale Percentage */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Font & Table Scale:</span>
                  <span className="text-[10px] text-slate-500">Live scales preview & print</span>
                </div>
                <select
                  value={config.scalePercent || 100}
                  onChange={(e) => {
                    chalanConfigService.updateConfig({ scalePercent: parseInt(e.target.value, 10) });
                    flashSaved();
                  }}
                  className="px-2.5 py-1.5 rounded-lg border-2 border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value={85}>85% (Micro Fit)</option>
                  <option value={90}>90% (Ultra Compact)</option>
                  <option value={95}>95% (Compact)</option>
                  <option value={100}>100% (Standard Half-A4)</option>
                  <option value={105}>105% (Large)</option>
                  <option value={110}>110% (Maximum Legibility)</option>
                  <option value={115}>115% (Extra Bold)</option>
                </select>
              </div>

              {/* Scissor Cut Line Toggle */}
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.showCutMark}
                  onChange={(e) => {
                    chalanConfigService.updateConfig({ showCutMark: e.target.checked });
                    flashSaved();
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Show Cut Line (✂)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Half-sheet separation mark
                  </span>
                </div>
              </label>

            </div>

            {/* Margin Controls */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Top Margin</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button onClick={() => handleMarginChange('marginTopMm', -0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">-</button>
                  <span className="font-mono font-bold text-xs">{config.marginTopMm || 3.5}mm</span>
                  <button onClick={() => handleMarginChange('marginTopMm', 0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">+</button>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Bottom Margin</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button onClick={() => handleMarginChange('marginBottomMm', -0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">-</button>
                  <span className="font-mono font-bold text-xs">{config.marginBottomMm || 3.5}mm</span>
                  <button onClick={() => handleMarginChange('marginBottomMm', 0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">+</button>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Left Margin</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button onClick={() => handleMarginChange('marginLeftMm', -0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">-</button>
                  <span className="font-mono font-bold text-xs">{config.marginLeftMm || 5}mm</span>
                  <button onClick={() => handleMarginChange('marginLeftMm', 0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">+</button>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Right Margin</span>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <button onClick={() => handleMarginChange('marginRightMm', -0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">-</button>
                  <span className="font-mono font-bold text-xs">{config.marginRightMm || 5}mm</span>
                  <button onClick={() => handleMarginChange('marginRightMm', 0.5)} className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">+</button>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-medium">
            Standard: Half A4 = 5.85" (148.5 mm). Persists in local printer config.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Done / Close
            </button>

            {onApplyAndPrint && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApplyAndPrint();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Apply & Print Now</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
