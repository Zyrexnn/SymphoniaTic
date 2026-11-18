import React, { useState, useEffect, useId } from 'react';
import {
  Search,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Header } from '../landing/Navbar';
import { Footer } from '../landing/Footer';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { fieldInputBase } from '@/components/ui/form-controls';

const RedeemPageContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const codeInputId = useId();

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const performLookup = async (codeStr: string) => {
    let cleanCode = codeStr.trim().toUpperCase();
    if (cleanCode.startsWith('QR-')) {
      cleanCode = cleanCode.substring(3);
    }
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
        setErrorMessage(
          res.message || 'Kode pesanan tiket tidak ditemukan. Pastikan kode unik yang Anda masukkan benar.'
        );
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
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const formatted = text.trim().toUpperCase();
          setSearchCode(formatted);
          showToast('Kode berhasil ditempel dari clipboard');
        }
      } else {
        showToast('Akses clipboard tidak didukung oleh browser Anda');
      }
    } catch {
      showToast('Gagal membaca clipboard. Pastikan izin browser diberikan');
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D12] font-sans text-white selection:bg-white selection:text-[#0C0D12] relative flex flex-col justify-between">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-24 z-50 flex items-center gap-2 rounded-xl border border-[#3E4357] bg-[#14161F] px-4 py-3 text-xs text-white shadow-xl"
        >
          <Check className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={2} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header isScrolled user={user} onLogout={logout} />

      <main className="mx-auto w-full max-w-[1160px] px-4 sm:px-6 md:px-10 pt-24 sm:pt-28 pb-16 flex-1">
        <div className="flex flex-col gap-10 max-w-4xl mx-auto">
          <div className="flex flex-col items-start">
            <div className="mb-5 flex w-full flex-wrap items-center justify-between gap-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 text-white" strokeWidth={1.7} aria-hidden="true" />
                <span>Kembali ke Beranda</span>
              </a>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#14161F] border border-[#272A38]">
                <QrCode className="h-3.5 w-3.5 text-white" strokeWidth={1.7} aria-hidden="true" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#E4E4E7]">
                  Portal Cek Tiket
                </span>
              </div>
            </div>

            <h1 className="text-[clamp(28px,5vw,48px)] font-semibold leading-[1.12] tracking-tight text-white m-0">
              Cek E-Ticket Konser Anda
            </h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-[#A1A1AA]">
              Masukkan kode unik pesanan Anda untuk mengakses pass digital resmi, QR Code scanner gate, informasi lokasi venue, serta dokumen E-Ticket cetak PDF.
            </p>
          </div>

          <div className="relative rounded-2xl border border-[#272A38] bg-[#14161F] p-5 sm:p-8 space-y-5">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <label htmlFor={codeInputId} className="block text-xs font-medium text-[#E4E4E7]">
                Kode Pesanan Resmi
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                  <input
                    id={codeInputId}
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode pesanan (contoh: SYM-893472)"
                    className={`${fieldInputBase} pl-10 pr-12 font-mono uppercase tracking-wider`}
                    autoFocus
                  />
                  {searchCode && (
                    <button
                      type="button"
                      onClick={() => setSearchCode('')}
                      aria-label="Hapus kode"
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-[#94A3B8] hover:text-white"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !searchCode.trim()}
                  className="min-h-[46px] inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-[#0C0D12] transition-colors hover:bg-neutral-200 disabled:opacity-40"
                >
                  {isLoading ? (
                    <span>Memeriksa...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                      <span>Verifikasi Tiket</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="flex flex-col justify-between gap-3 border-t border-[#272A38] pt-4 text-xs text-[#A1A1AA] sm:flex-row sm:items-center">
              <span className="font-mono text-xs text-[#94A3B8]">Format kode: SYM- diikuti 6 digit angka</span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="min-h-[40px] inline-flex w-fit items-center gap-2 border border-[#3E4357] bg-[#0C0D12] px-3.5 py-2 rounded-lg text-xs text-[#E4E4E7] hover:text-white hover:border-white/60 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.7} aria-hidden="true" />
                <span>Tempel dari Clipboard</span>
              </button>
            </div>
          </div>

          {hasSearched && errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-3.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" strokeWidth={1.7} aria-hidden="true" />
              <div className="flex-1 leading-relaxed text-rose-200">
                <p className="mb-1 font-semibold text-white m-0">Tiket Tidak Ditemukan</p>
                <p className="text-xs text-rose-200 m-0">{errorMessage}</p>
              </div>
            </div>
          )}

          <section className="flex flex-col gap-5 pt-2">
            <div className="border-b border-[#272A38] pb-4">
              <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-semibold tracking-tight text-white m-0">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={1.7} aria-hidden="true" />
                <span>Alur Verifikasi Tiket</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Masukkan Kode Unik',
                  body: 'Ketikkan kode unik transaksi Anda (contoh: SYM-893472) yang dikirim melalui email atau tercantum di akun Anda.'
                },
                {
                  step: '02',
                  title: 'Periksa Keabsahan Tiket',
                  body: 'Sistem memverifikasi keaktifan tiket, rincian tempat duduk, waktu pertunjukan, serta status gate.'
                },
                {
                  step: '03',
                  title: 'Tunjukkan QR Code Gate',
                  body: 'Tunjukkan QR Code digital di pintu masuk hall konser saat Open Gate atau simpan berkas cetak PDF/PNG.'
                }
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-2 rounded-xl border border-[#272A38] bg-[#14161F] p-5">
                  <span className="text-xl font-mono font-bold text-[#94A3B8]">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-semibold text-white m-0">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-[#A1A1AA] m-0">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export const RedeemPage: React.FC = () => (
  <AuthProvider>
    <RedeemPageContent />
  </AuthProvider>
);
