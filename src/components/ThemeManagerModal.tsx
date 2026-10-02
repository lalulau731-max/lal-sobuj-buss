import React, { useState, useEffect } from 'react';
import { 
  X, 
  Palette, 
  FileText, 
  Check, 
  Sparkles, 
  Bus, 
  SlidersHorizontal,
  Search,
  CheckCircle2,
  ExternalLink,
  Layers,
  Printer
} from 'lucide-react';
import { 
  themeManager, 
  HOMEPAGE_THEMES, 
  CHALAN_TEMPLATES, 
  HomepageTheme, 
  ChalanTemplate 
} from '../services/themeManager';

interface ThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'homepage' | 'chalan';
  onSelectChalanTemplate?: (template: ChalanTemplate) => void;
}

export const ThemeManagerModal: React.FC<ThemeManagerModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'homepage',
  onSelectChalanTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'homepage' | 'chalan'>(defaultTab);
  const [currentTheme, setCurrentTheme] = useState<HomepageTheme>(() => themeManager.getActiveTheme());
  const [currentTemplate, setCurrentTemplate] = useState<ChalanTemplate>(() => themeManager.getActiveTemplate());
  const [chalanSearch, setChalanSearch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const unsub = themeManager.subscribe(() => {
      setCurrentTheme(themeManager.getActiveTheme());
      setCurrentTemplate(themeManager.getActiveTemplate());
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleApplyTheme = (theme: HomepageTheme) => {
    themeManager.setHomepageTheme(theme.id);
    showSuccess(`Homepage theme updated to "${theme.name}"!`);
  };

  const handleApplyTemplate = (template: ChalanTemplate) => {
    themeManager.setChalanTemplate(template.id);
    if (onSelectChalanTemplate) {
      onSelectChalanTemplate(template);
    }
    showSuccess(`Chalan template set to "${template.name}"!`);
  };

  // Unique groups for filtering chalan templates
  const groups = ['All', ...Array.from(new Set(CHALAN_TEMPLATES.map((t) => t.operatorGroup)))];

  const filteredChalanTemplates = CHALAN_TEMPLATES.filter((tpl) => {
    const matchesGroup = selectedGroup === 'All' || tpl.operatorGroup === selectedGroup;
    const matchesSearch = 
      tpl.name.toLowerCase().includes(chalanSearch.toLowerCase()) ||
      tpl.banglaName.toLowerCase().includes(chalanSearch.toLowerCase()) ||
      tpl.description.toLowerCase().includes(chalanSearch.toLowerCase()) ||
      tpl.features.some((f) => f.toLowerCase().includes(chalanSearch.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Theme & Template Studio
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                  অ্যাডমিন স্টুডিও
                </span>
              </div>
              <p className="text-xs text-slate-400">
                12 Bangladesh transport-inspired homepage themes & 36 authentic chalan manifest layouts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 shrink-0 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('homepage')}
              className={`pb-3 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'homepage'
                  ? 'border-purple-600 text-purple-900 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>Homepage Themes (12 Options)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono">
                12
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('chalan')}
              className={`pb-3 px-4 text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chalan'
                  ? 'border-purple-600 text-purple-900 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Chalan Sheet Templates (36 Options)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                36
              </span>
            </button>
          </div>

          {/* Quick Active Notification */}
          {toastMessage && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-in fade-in duration-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          
          {/* ========================================================= */}
          {/* TAB 1: HOMEPAGE THEMES                                    */}
          {/* ========================================================= */}
          {activeTab === 'homepage' && (
            <div className="space-y-4">
              
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Active Homepage Theme:
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span 
                      className="w-4 h-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: currentTheme.primaryColor }}
                    />
                    <strong className="text-sm font-black text-slate-900">
                      {currentTheme.name}
                    </strong>
                    <span className="text-xs text-slate-500 font-medium">
                      ({currentTheme.banglaName})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Inspired by: {currentTheme.inspiredBy}</span>
                </div>
              </div>

              {/* Grid of 12 Themes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {HOMEPAGE_THEMES.map((theme) => {
                  const isActive = currentTheme.id === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => handleApplyTheme(theme)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white relative flex flex-col justify-between group hover:shadow-md ${
                        isActive
                          ? 'border-purple-600 ring-2 ring-purple-200 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Active Checkmark Pill */}
                      {isActive && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Active</span>
                        </div>
                      )}

                      <div>
                        {/* Color Swatch & Operator Identity */}
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            <span 
                              className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-xs" 
                              style={{ backgroundColor: theme.primaryColor }}
                              title="Primary Brand Color"
                            />
                            <span 
                              className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-xs" 
                              style={{ backgroundColor: theme.secondaryColor }}
                              title="Accent Color"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">
                              {theme.inspiredBy}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors leading-tight">
                              {theme.name}
                            </h4>
                          </div>
                        </div>

                        {/* Bengali Label */}
                        <p className="text-xs font-bold text-slate-600 mb-2">
                          {theme.banglaName}
                        </p>

                        <p className="text-[11px] text-slate-500 leading-snug mb-3">
                          {theme.description}
                        </p>
                      </div>

                      {/* Mini Live Preview Strip */}
                      <div>
                        <div className="rounded-lg overflow-hidden border border-slate-200 mb-3 shadow-2xs">
                          {/* Mini Header */}
                          <div 
                            className="px-2.5 py-1.5 flex items-center justify-between text-white text-[10px] font-bold"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            <span className="truncate">LAL SOBUJ PARIBAHAN</span>
                            <span 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: theme.secondaryColor }}
                            />
                          </div>
                          {/* Mini Body */}
                          <div className="bg-slate-50 p-2 flex items-center justify-between text-[9px] text-slate-600 font-semibold">
                            <span>Coach #212 • AC Multi-Axle</span>
                            <span 
                              className="px-1.5 py-0.5 rounded text-[8px] font-black text-white"
                              style={{ backgroundColor: theme.primaryColor }}
                            >
                              ৳700
                            </span>
                          </div>
                        </div>

                        {/* Apply Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTheme(theme);
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Current Theme</span>
                            </>
                          ) : (
                            <span>Apply This Theme</span>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: CHALAN SHEET TEMPLATES (36 Options)                */}
          {/* ========================================================= */}
          {activeTab === 'chalan' && (
            <div className="space-y-4">
              
              {/* Filter Controls: Search & Operator Categories */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chalanSearch}
                      onChange={(e) => setChalanSearch(e.target.value)}
                      placeholder="Search 36 chalan templates..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:border-purple-600 focus:ring-1 focus:ring-purple-200 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold self-end sm:self-auto">
                    <span>Active Template:</span>
                    <span className="font-mono text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                      {currentTemplate.name}
                    </span>
                  </div>
                </div>

                {/* Operator Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {groups.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedGroup === grp
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of 36 Chalan Templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredChalanTemplates.map((template) => {
                  const isSelected = currentTemplate.id === template.id;
                  return (
                    <div
                      key={template.id}
                      onClick={() => handleApplyTemplate(template)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white relative flex flex-col justify-between group hover:shadow-md ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-200 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Active Status Badge */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Active Layout</span>
                        </div>
                      )}

                      <div>
                        {/* Operator Group Tag */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[9.5px] uppercase font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {template.operatorGroup}
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-400">
                            {template.tableDensity}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                          {template.name}
                        </h4>

                        <p className="text-xs font-bold text-slate-600 mt-0.5 mb-2">
                          {template.banglaName}
                        </p>

                        <p className="text-[11px] text-slate-500 leading-snug mb-3">
                          {template.description}
                        </p>

                        {/* Feature Badges */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.features.map((feat) => (
                            <span
                              key={feat}
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mini Chalan Visual Outline */}
                      <div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 mb-3 space-y-1">
                          <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 border-b border-slate-200 pb-1">
                            <span>TRIP CHALAN</span>
                            <span>{template.headerLayout}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[7.5px] text-center font-mono text-slate-400">
                            <span className="bg-white border border-slate-200 p-0.5 rounded-xs">SEAT</span>
                            <span className="bg-white border border-slate-200 p-0.5 rounded-xs">PAX</span>
                            <span className="bg-white border border-slate-200 p-0.5 rounded-xs">GRP</span>
                            <span className="bg-white border border-slate-200 p-0.5 rounded-xs">DUE</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTemplate(template);
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Current Chalan Layout</span>
                            </>
                          ) : (
                            <>
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span>Select This Template</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Configurations are saved to persistent local storage and applied fleet-wide.
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
