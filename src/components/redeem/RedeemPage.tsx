import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, QrCode, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const RedeemPage: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code');
      if (codeParam) {
        setSearchCode(codeParam.toUpperCase());
        performLookup(codeParam.toUpperCase());
      }
    }
  }, []);

  const performLookup = async (codeStr: string) => {
    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage('');

    try {
      const { lookupTicketAPI } = await import('../landing/data');
      const res = await lookupTicketAPI(cleanCode);
      if (res.success && res.data) {
        window.location.href = `/ticket/${cleanCode}`;
        return;
      } else {
        setErrorMessage(res.message || 'Kode pesanan tiket tidak ditemukan. Pastikan kode yang Anda masukkan benar.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi saat memverifikasi tiket. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchCode);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSearchCode(text.trim().toUpperCase());
      }
    } catch {
      // Browser permission fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col justify-between selection:bg-white selection:text-[#171717]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#171717]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            <span className="text-sm font-light tracking-wide">Kembali ke Beranda</span>
          </a>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
            <span className="text-xs font-light tracking-widest text-[#9a9a9a] uppercase">Portal Cek Tiket</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Title Header Section */}
        <div className="text-center flex flex-col items-center">
          <span className="text-xs font-light tracking-[0.2em] uppercase text-[#9a9a9a] border border-white/10 px-3.5 py-1 mb-4">
            [ VERIFIKASI RESMI TIKET SIMFONI ]
          </span>
          <h1 className="text-3xl sm:text-4xl tracking-[-0.03em] font-light text-white leading-tight">
            Cek E-Ticket Konser Anda
          </h1>
          <p className="text-sm sm:text-base font-light text-[#9a9a9a] max-w-[560px] mt-3 leading-relaxed">
            Masukkan kode unik pesanan Anda (contoh: <code className="text-white bg-white/10 px-1.5 py-0.5 font-mono">SYM-893472</code>) untuk mengakses tiket pass digital, QR code gate, serta dokumen cetak PDF.
          </p>
        </div>

        {/* Search Bar Input Form */}
        <div className="bg-[#0f172a] border border-white/10 p-6 sm:p-8 flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9a9a9a]" strokeWidth={1} />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE PESANAN (SYM-XXXXXX)..."
                className="w-full bg-[#171717] border border-white/15 pl-12 pr-4 py-3.5 text-base font-mono tracking-wider text-white uppercase outline-none focus:border-white transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchCode.trim()}
              className={`px-8 py-3.5 text-sm font-light tracking-wider uppercase bg-white text-[#171717] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/90 transition-all ${
                isLoading || !searchCode.trim() ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span>Memeriksa...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                  <span>Verifikasi Tiket</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-[#9a9a9a] pt-1">
            <span>Contoh format kode: SYM-XXXXXX</span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="hover:text-white transition-colors underline cursor-pointer bg-transparent border-none"
            >
              Tempel dari Clipboard
            </button>
          </div>
        </div>

        {/* Error State */}
        {hasSearched && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 border border-red-500/30 bg-red-950/20 text-red-200 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-sm font-light leading-relaxed">
              <p className="font-normal text-red-300 mb-1">Tiket Tidak Ditemukan</p>
              <p>{errorMessage}</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-[#9a9a9a] font-light">
        &copy; 2026 SymphoniaTic Official Ticket Redemption Portal. All rights reserved.
      </footer>
    </div>
  );
};
