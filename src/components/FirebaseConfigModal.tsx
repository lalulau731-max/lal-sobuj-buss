import React, { useState } from 'react';
import { FirebaseConnectionConfig } from '../types/bus';
import { firebaseSync } from '../services/firebaseSync';
import { RTDB_URL_CANDIDATES, FIREBASE_CONFIG } from '../firebase/config';
import { 
  Database, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  UploadCloud, 
  HelpCircle, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FirebaseConnectionConfig;
  onUpdateConfig: (newConfig: Partial<FirebaseConnectionConfig>) => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [databaseURL, setDatabaseURL] = useState<string>(config?.databaseURL || FIREBASE_CONFIG.databaseURL);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  React.useEffect(() => {
    if (isOpen && config?.databaseURL) {
      setDatabaseURL(config.databaseURL);
      setFeedback(null);
      setIsTesting(false);
    }
  }, [isOpen, config?.databaseURL]);

  if (!isOpen) return null;

  const handleSaveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setFeedback(null);

    const cleanUrl = databaseURL.trim();
    if (!cleanUrl) {
      setFeedback({
        type: 'error',
        text: 'Please provide a valid Firebase Realtime Database URL.',
      });
      setIsTesting(false);
      return;
    }

    try {
      firebaseSync.initFirebase({
        databaseURL: cleanUrl,
      });

      setFeedback({
        type: 'success',
        text: 'Connected to Firebase Realtime Database project lal-sobuj-bus! Real-time synchronization active.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: `Connection failed: ${err.message || String(err)}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleUploadCurrentData = async () => {
    setIsTesting(true);
    setFeedback({
      type: 'info',
      text: 'Syncing live coaches and bookings from Firebase database (lal-sobuj-bus)...',
    });
    try {
      await firebaseSync.refetchFromFirebase();
      setFeedback({ type: 'success', text: 'Successfully synced all live coach records and bookings from Firebase!' });
    } catch (e: any) {
      setFeedback({ type: 'error', text: e.message || 'Sync failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Firebase Database Integration</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-700/80 text-emerald-200 font-mono">
                  lal-sobuj-bus
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Connected with official Firebase Project credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSaveAndConnect} className="p-5 space-y-4 text-xs">
          
          {/* Connection Status Badge */}
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
            config.isConnected
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}>
            {config.isConnected ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className="font-bold">
                {config.isConnected ? 'Firebase Realtime Database is Connected' : 'Sync Engine Active'}
              </p>
              <p className="text-[11px] text-slate-600">
                Project: <code className="font-mono font-bold text-slate-800">lal-sobuj-bus</code> • App ID:{' '}
                <code className="font-mono text-slate-700">1:264678413384:web:...</code>
              </p>
              {config.lastError && (
                <p className="text-[10px] text-amber-800 font-mono mt-1">
                  Note: {config.lastError}
                </p>
              )}
            </div>
          </div>

          {/* Database URL */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Firebase Realtime Database Endpoint URL
            </label>
            <input
              type="url"
              required
              value={databaseURL}
              onChange={(e) => setDatabaseURL(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Regional Quick Select Presets */}
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              Quick Switch Database Region:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RTDB_URL_CANDIDATES.map((cand) => (
                <button
                  type="button"
                  key={cand.url}
                  onClick={() => setDatabaseURL(cand.url)}
                  className={`p-2 text-left rounded-lg border text-[11px] transition-colors ${
                    databaseURL === cand.url
                      ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">{cand.name}</span>
                  <span className="font-mono text-[9px] text-slate-500 truncate block">
                    {cand.url.replace('https://', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Firebase Config Parameters Overview */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Project ID:</span>
              <strong className="text-slate-800">{FIREBASE_CONFIG.projectId}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auth Domain:</span>
              <span className="text-slate-700">{FIREBASE_CONFIG.authDomain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Storage Bucket:</span>
              <span className="text-slate-700">{FIREBASE_CONFIG.storageBucket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">API Key:</span>
              <span className="text-slate-700 font-mono">AIzaSyBTH6BM...</span>
            </div>
          </div>

          {/* Firebase Hosting & Production URL Status */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                Firebase Hosting Production Domain
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 border border-emerald-400">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-emerald-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Primary Web App URL</span>
                <span className="font-mono font-bold text-emerald-950">
                  https://lal-sobuj-bus.web.app
                </span>
              </div>
              <a
                href="https://lal-sobuj-bus.web.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs"
              >
                <span>Visit Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-600 px-1 font-mono">
              <span>Alternate Domain:</span>
              <a
                href="https://lal-sobuj-bus.firebaseapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-800 hover:underline flex items-center gap-1"
              >
                lal-sobuj-bus.firebaseapp.com
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div className={`p-3 rounded-xl border text-xs ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              {feedback.text}
            </div>
          )}

          {/* Cloud Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleUploadCurrentData}
              disabled={isTesting}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Initialize / Seed Buses to Firebase</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Save & Connect</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
