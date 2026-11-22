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
import { fieldInputLight } from '@/components/ui/form-controls';

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
    <div className="min-h-screen bg-[#F4F3EF] font-sans text-[#141413] relative flex flex-col justify-between">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-24 z-50 flex items-center gap-2 rounded-none border border-[#141413] bg-white px-4 py-3 text-xs font-semibold text-[#141413]"
        >
          <Check className="h-4 w-4 shrink-0 text-[#156E3F]" strokeWidth={2} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header user={user} onLogout={logout} />

      <main className="mx-auto w-full max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 pt-24 sm:pt-28 pb-16 flex-1">
        <div className="flex flex-col gap-10 max-w-4xl mx-auto">
          <div className="flex flex-col items-start">
            <div className="mb-5 flex w-full flex-wrap items-center justify-between gap-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-bold uppercase tracking-wider text-[#52514D] hover:text-[#141413] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-[#141413]" strokeWidth={1.8} aria-hidden="true" />
                <span>Kembali ke Beranda</span>
              </a>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#D4FF2A] border border-[#141413]">
                <QrCode className="h-3.5 w-3.5 text-[#141413]" strokeWidth={2} aria-hidden="true" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#141413]">
                  Portal Cek Tiket
                </span>
              </div>
            </div>

            <h1 className="font-display text-[clamp(34px,5.2vw,60px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#141413] m-0">
              Cek E-Ticket Konser Anda
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#52514D]">
              Masukkan kode unik pesanan Anda untuk mengakses pass digital resmi, QR Code scanner gate, informasi lokasi venue, serta dokumen E-Ticket cetak PDF.
            </p>
          </div>

          <div className="relative rounded-none border border-[#141413] bg-white p-5 sm:p-8 space-y-5">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <label htmlFor={codeInputId} className="block text-xs font-bold uppercase tracking-wider text-[#141413]">
                Kode Pesanan Resmi
              </label>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6D68] pointer-events-none"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <input
                    id={codeInputId}
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode pesanan (contoh: SYM-893472)"
                    className={`${fieldInputLight} pl-10 pr-12 font-mono uppercase tracking-wider`}
                    autoFocus
                  />
                  {searchCode && (
                    <button
                      type="button"
                      onClick={() => setSearchCode('')}
                      aria-label="Hapus kode"
                      className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-none text-[#6E6D68] hover:text-[#141413]"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !searchCode.trim()}
                  className="min-h-[46px] inline-flex shrink-0 items-center justify-center gap-2 rounded-none bg-[#D4FF2A] border border-[#141413] px-7 py-3 text-xs font-bold uppercase tracking-wider text-[#141413] transition-colors hover:bg-[#C2EE1A] disabled:opacity-40"
                >
                  {isLoading ? (
                    <span>Memeriksa...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                      <span>Verifikasi Tiket</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="flex flex-col justify-between gap-3 border-t border-[#DFDDD6] pt-4 text-xs text-[#52514D] sm:flex-row sm:items-center">
              <span className="font-mono text-xs text-[#6E6D68]">Format kode: SYM- diikuti 6-8 karakter kode pesanan</span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="min-h-[40px] inline-flex w-fit items-center gap-2 border border-[#DFDDD6] bg-[#F4F3EF] px-3.5 py-2 rounded-none text-xs font-bold text-[#141413] hover:border-[#141413] transition-colors"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                <span>Tempel dari Clipboard</span>
              </button>
            </div>
          </div>

          {hasSearched && errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-3.5 rounded-none border border-[#C81E1E] bg-[#C81E1E]/10 p-5 text-sm"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#C81E1E]" strokeWidth={1.8} aria-hidden="true" />
              <div className="flex-1 leading-relaxed text-[#C81E1E]">
                <p className="mb-1 font-bold text-[#141413] m-0">Tiket Tidak Ditemukan</p>
                <p className="text-xs text-[#C81E1E] m-0">{errorMessage}</p>
              </div>
            </div>
          )}

          <section className="flex flex-col gap-5 pt-2">
            <div className="border-b border-[#141413] pb-4">
              <h2 className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#141413] m-0">
                <ShieldCheck className="h-5 w-5 text-[#141413]" strokeWidth={2} aria-hidden="true" />
                <span>Alur Verifikasi Tiket</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px bg-[#DFDDD6] border border-[#DFDDD6] md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Masukkan Kode Unik',
                  body: 'Ketikkan kode unik transaksi Anda (contoh: SYM-893472) yang dikirim melalui email atau tercantum di akun Anda.',
                },
                {
                  step: '02',
                  title: 'Periksa Keabsahan Tiket',
                  body: 'Sistem memverifikasi keaktifan tiket, rincian tempat duduk, waktu pertunjukan, serta status gate.',
                },
                {
                  step: '03',
                  title: 'Tunjukkan QR Code Gate',
                  body: 'Tunjukkan QR Code digital di pintu masuk hall konser saat Open Gate atau simpan berkas cetak PDF/PNG.',
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-2 bg-white p-6">
                  <span className="inline-block w-fit bg-[#D4FF2A] px-2 py-0.5 text-sm font-mono font-bold text-[#141413]">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-bold text-[#141413] m-0 mt-1">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-[#52514D] m-0">{item.body}</p>
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
