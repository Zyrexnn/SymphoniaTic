import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0d111a] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-[480px] w-full bg-[#131926] border border-amber-500/30 p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h2 className="text-xl font-light text-white tracking-tight m-0">
                {this.props.fallbackTitle || 'Terjadi Kendala Memuat Tampilan'}
              </h2>
              <p className="text-xs font-light text-[#8a99ad] mt-2 leading-relaxed">
                Aplikasi mengalami masalah pengolahan data sementara. Silakan segarkan halaman atau kembali ke beranda.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#0a0d14] border border-white/10 text-left text-[11px] font-mono text-red-300 max-h-24 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <a
                href="/"
                className="flex-1 py-3 px-4 bg-transparent border border-white/20 hover:border-white/40 text-white font-light text-xs uppercase tracking-wider text-center no-underline transition-colors flex items-center justify-center gap-2"
              >
                <Home size={14} />
                <span>Beranda Utama</span>
              </a>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                <span>Muat Ulang Halaman</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
