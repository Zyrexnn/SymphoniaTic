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
        <div className="min-h-screen w-full bg-[#141413] text-[#F4F3EF] flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-[480px] w-full bg-[#1C1C1A] border border-[#2E2E2B] rounded-none p-8 text-center space-y-5">
            <div className="w-12 h-12 bg-[#C81E1E]/15 border border-[#C81E1E] text-[#F4F3EF] rounded-none flex items-center justify-center mx-auto">
              <AlertTriangle size={24} aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-[#F4F3EF] m-0">
                {this.props.fallbackTitle || 'Terjadi Kendala Memuat Tampilan'}
              </h2>
              <p className="text-xs text-[#B8B6AE] mt-2 leading-relaxed m-0">
                Aplikasi mengalami masalah pengolahan data sementara. Silakan segarkan halaman atau kembali ke beranda.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#141413] border border-[#2E2E2B] rounded-none text-left text-[11px] font-mono text-[#FCA5A5] max-h-24 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href="/"
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-none bg-transparent border border-[#52514D] hover:border-[#D4FF2A] text-[#F4F3EF] hover:text-[#D4FF2A] font-semibold text-xs uppercase tracking-wider text-center no-underline transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
              >
                <Home size={14} aria-hidden="true" />
                <span>Beranda Utama</span>
              </a>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 min-h-[44px] py-2.5 px-4 rounded-none bg-[#D4FF2A] hover:bg-[#C2EE1A] text-[#141413] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C1C1A]"
              >
                <RefreshCw size={14} aria-hidden="true" />
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
