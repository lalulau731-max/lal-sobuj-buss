import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lal Sobuj Bus System Error Caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('lsp_firebase_rtdb_config_v3');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                লাল-সবুজ পরিবহন (Lal Sobuj Paribahan)
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Operational Dispatch & Seat Management System
              </p>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-left">
              <p className="text-xs font-mono text-rose-300 break-words line-clamp-3">
                {this.state.error?.message || 'A render exception occurred.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl transition shadow-lg shadow-emerald-900/30 cursor-pointer text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                onClick={() => {
                  window.location.href = window.location.pathname;
                }}
                className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2.5 px-3.5 rounded-xl transition text-sm cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reset Route
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
