import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { Header } from '../landing/Navbar';
import { Footer } from '../landing/Footer';

interface SampleCode {
  code: string;
  label: string;
  status: 'active' | 'checked_in' | 'refunded';
}

const SAMPLE_CODES: SampleCode[] = [
  { code: 'SYM-893472', label: 'Beethoven Symphony (Active)', status: 'active' },
  { code: 'SYM-102948', label: 'Viva La Vida (Checked-in)', status: 'checked_in' },
  { code: 'SYM-448291', label: 'Laskar Pelangi (Active)', status: 'active' }
];

export const RedeemPage: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleSelectSampleCode = (code: string) => {
    setSearchCode(code);
    performLookup(code);
  };

  return (
    <div className="min-h-screen bg-[#0C0D12] font-sans text-white selection:bg-white selection:text-[#0C0D12] relative flex flex-col justify-between">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="status"
            className="fixed right-6 top-24 z-50 flex items-center gap-2 rounded-xl border border-[#272A38] bg-[#14161F] px-4 py-3 text-xs text-white shadow-2xl"
          >
            <Check className="h-4 w-4 shrink-0 text-white" strokeWidth={2} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Header isScrolled />

      <main className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-16 flex-1">
        <div className="flex flex-col gap-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-start">
            <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-4">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-white" strokeWidth={1.5} />
                <span>Kembali ke Beranda</span>
              </a>
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#14161F] border border-[#272A38]">
                <QrCode className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#A1A1AA]">
                  Portal Cek Tiket
                </span>
              </div>
            </div>

            <h1 className="text-[clamp(32px,5vw,52px)] font-semibold leading-[1.1] tracking-tight text-white">
              Cek E-Ticket Konser Anda
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#A1A1AA]">
              Masukkan kode unik pesanan Anda untuk mengakses pass digital resmi, QR Code scanner gate, informasi lokasi venue, serta dokumen E-Ticket cetak PDF.
            </p>
          </div>

          <div className="relative rounded-2xl border border-[#272A38] bg-[#14161F] p-6 sm:p-8">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode pesanan (SYM-XXXXXX)"
                  aria-label="Kode pesanan tiket"
                  className="w-full rounded-lg border border-[#272A38] bg-[#0C0D12] py-3.5 pl-11 pr-10 font-mono text-sm uppercase tracking-wider text-white outline-none transition-colors duration-200 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-[#71717A] focus:border-white"
                  autoFocus
                />
                {searchCode && (
                  <button
                    type="button"
                    onClick={() => setSearchCode('')}
                    aria-label="Hapus kode"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-[#71717A] hover:text-white"
                  >
                    <span aria-hidden>&times;</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !searchCode.trim()}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-black transition-colors duration-200 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? (
                  <span>Memeriksa...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-black" strokeWidth={1.5} />
                    <span>Verifikasi Tiket</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 flex flex-col justify-between gap-3 border-t border-[#272A38] pt-4 text-xs text-[#A1A1AA] sm:flex-row sm:items-center">
              <span className="font-mono text-[11px] text-[#71717A]">Contoh format kode: SYM-893472</span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="inline-flex w-fit cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-xs text-[#A1A1AA] hover:text-white underline transition-colors"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>Tempel dari Clipboard</span>
              </button>
            </div>

            <div className="mt-6 border-t border-[#272A38] pt-5">
              <span className="mb-3 block text-[11px] font-mono uppercase tracking-[0.16em] text-[#71717A]">
                Sampel Kode Tiket, klik untuk verifikasi langsung:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_CODES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectSampleCode(item.code)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#272A38] bg-[#0C0D12] px-3 py-2 text-xs font-mono text-white transition-colors duration-200 hover:border-white/50"
                  >
                    <Ticket className="h-3.5 w-3.5 text-white" strokeWidth={1.5} />
                    <span>{item.code}</span>
                    <span className="font-sans text-[11px] text-[#A1A1AA]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasSearched && errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="flex items-start gap-4 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" strokeWidth={1.5} />
              <div className="flex-1 leading-relaxed text-red-200">
                <p className="mb-1 font-semibold text-white">Tiket Tidak Ditemukan</p>
                <p className="text-xs text-red-300">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          <section className="flex flex-col gap-6 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#272A38] pb-4">
              <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-white">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={1.5} />
                <span>Panduan Alur Verifikasi Tiket</span>
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
                  body: 'Sistem secara otomatis memverifikasi keaktifan tiket, rincian tempat duduk, waktu pertunjukan, serta status pendaftaran gate.'
                },
                {
                  step: '03',
                  title: 'Tunjukkan QR Code Gate',
                  body: 'Tunjukkan QR Code digital di pintu masuk hall konser (Open Gate) atau simpan dokumen E-Ticket cetak format PDF/PNG ke perangkat Anda.'
                }
              ].map((item) => (
                <div key={item.step} className="flex flex-col gap-2 rounded-xl border border-[#272A38] bg-[#14161F] p-5">
                  <span className="text-2xl font-mono font-bold text-white/40">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-[#A1A1AA]">{item.body}</p>
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
