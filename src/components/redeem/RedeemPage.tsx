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
  Clock,
  ChevronDown,
  Ticket,
  FileText,
  Smartphone,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  UserCheck
} from 'lucide-react';

interface SampleCode {
  code: string;
  label: string;
  status: 'active' | 'checked_in' | 'refunded';
}

const SAMPLE_CODES: SampleCode[] = [
  { code: 'SYM-893472', label: 'Beethoven Symphony — Active', status: 'active' },
  { code: 'SYM-102948', label: 'Viva La Vida — Checked-in', status: 'checked_in' },
  { code: 'SYM-448291', label: 'Laskar Pelangi — Active', status: 'active' }
];

export const RedeemPage: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
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

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const faqs = [
    {
      question: 'Di mana saya dapat menemukan kode unik pesanan E-Ticket?',
      answer:
        'Kode pesanan unik (contoh: SYM-893472) dikirimkan melalui email konfirmasi saat Anda berhasil membeli tiket di SymphoniaTic. Anda juga dapat melihat kode tersebut di halaman Dashboard Akun Saya pada menu Riwayat Tiket.'
    },
    {
      question: 'Apakah E-Ticket perlu dicetak saat datang ke lokasi venue konser?',
      answer:
        'Tidak perlu. Anda cukup menunjukkan Kode QR digital dari layar smartphone Anda di pintu gerbang Open Gate. Pastikan kecerahan layar ponsel Anda diatur maksimal saat pemindaian scanner.'
    },
    {
      question: 'Bagaimana jika nama di E-Ticket berbeda dengan KTP/Identitas saya?',
      answer:
        'Jika tiket didapatkan melalui pembelian resmi atau pemindaian sah, tunjukkan E-Ticket digital beserta bukti email transaksi pesanan kepada petugas di meja verifikasi khusus gate.'
    },
    {
      question: 'Apa yang harus dilakukan jika tiket saya berstatus CHECKED-IN?',
      answer:
        'Status CHECKED-IN menandakan Kode QR E-Ticket telah berhasil dipindai oleh scanner gate venue saat pemegang tiket masuk ke dalam main hall pertunjukan.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col justify-between selection:bg-white selection:text-[#171717] relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#171717] border border-white/20 text-white px-4 py-3 shadow-2xl text-xs font-light tracking-wide flex items-center gap-2 rounded-none"
          >
            <Check className="w-4 h-4 text-white" strokeWidth={1} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#171717]/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
            <span className="text-xs font-light tracking-wide">Kembali ke Beranda</span>
          </a>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
            <span className="text-xs font-light tracking-widest text-[#9a9a9a] uppercase">
              Portal Cek Tiket
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[960px] w-full mx-auto px-6 py-12 sm:py-16 flex flex-col gap-16 sm:gap-20">
        {/* Title Header Section */}
        <div className="flex flex-col items-start max-w-2xl">
          <span className="text-xs font-light tracking-[0.2em] uppercase text-[#9a9a9a] border border-white/10 px-3.5 py-1 mb-5">
            [ VERIFIKASI RESMI TIKET SIMFONI ]
          </span>
          <h1 className="text-3xl sm:text-5xl tracking-[-0.03em] font-light text-white leading-[1.1]">
            Cek E-Ticket Konser Anda
          </h1>
          <p className="text-sm sm:text-base font-light text-[#9a9a9a] mt-4 leading-relaxed max-w-xl">
            Masukkan kode unik pesanan Anda untuk mengakses pass digital resmi, QR Code scanner gate, informasi lokasi venue, serta dokumen E-Ticket cetak PDF.
          </p>
        </div>

        {/* Search Bar & Input Form Card */}
        <div className="bg-[#171717] border border-white/15 p-6 sm:p-10 relative">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]"
                strokeWidth={1}
              />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE PESANAN (SYM-XXXXXX)..."
                className="w-full bg-[#171717] border border-white/20 pl-11 pr-10 py-3.5 text-sm font-mono tracking-wider text-white uppercase outline-none focus:border-white transition-colors"
                autoFocus
              />
              {searchCode && (
                <button
                  type="button"
                  onClick={() => setSearchCode('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-white text-xs px-1 py-0.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchCode.trim()}
              className={`px-8 py-3.5 text-xs font-light tracking-wider uppercase bg-white text-[#171717] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/90 transition-all shrink-0 ${
                isLoading || !searchCode.trim() ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span>Memeriksa...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1} />
                  <span>Verifikasi Tiket</span>
                </>
              )}
            </button>
          </form>

          {/* Helper Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9a9a9a] pt-4 mt-3 border-t border-white/10">
            <span className="font-mono text-[11px]">Contoh format kode: SYM-893472</span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="inline-flex items-center gap-1.5 text-xs text-[#9a9a9a] hover:text-white transition-colors underline cursor-pointer bg-transparent border-none p-0 w-fit"
            >
              <Copy className="w-3.5 h-3.5" strokeWidth={1} />
              <span>Tempel dari Clipboard</span>
            </button>
          </div>

          {/* Sample Codes Chip Selection */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[11px] font-light uppercase tracking-widest text-[#9a9a9a] block mb-3">
              Sampel Kode Tiket (Klik untuk verifikasi langsung):
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectSampleCode(item.code)}
                  className="px-3 py-1.5 bg-[#171717] hover:bg-white/10 border border-white/15 text-xs font-mono text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-3 h-3 text-[#9a9a9a]" strokeWidth={1} />
                  <span>{item.code}</span>
                  <span className="text-[11px] text-[#9a9a9a] font-sans font-light">
                    ({item.label})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State Banner */}
        {hasSearched && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border border-red-500/30 bg-red-950/20 text-red-200 flex items-start gap-4"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1} />
            <div className="text-sm font-light leading-relaxed flex-1">
              <p className="font-normal text-red-300 text-base mb-1">Tiket Tidak Ditemukan</p>
              <p className="text-[#9a9a9a]">{errorMessage}</p>
              <div className="mt-4 pt-3 border-t border-red-500/20 flex flex-wrap items-center gap-4 text-xs">
                <span className="text-red-200">Bantuan pencarian:</span>
                <a
                  href="/login"
                  className="text-white underline hover:opacity-80 transition-opacity"
                >
                  Masuk ke Akun Saya untuk melihat daftar tiket
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3-Step Process Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg sm:text-xl font-light text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
              <span>Panduan Alur Verifikasi Tiket</span>
            </h2>
            <span className="text-xs text-[#9a9a9a] font-mono">PROSES VERIFIKASI</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-white/10 p-6 flex flex-col gap-3">
              <span className="text-xs font-mono text-[#9a9a9a] border border-white/10 px-2 py-0.5 w-fit">
                01
              </span>
              <h3 className="text-base font-light text-white mt-1">1. Masukkan Kode Unik</h3>
              <p className="text-xs font-light text-[#9a9a9a] leading-relaxed">
                Ketikkan kode unik transaksi Anda (contoh: <code className="text-white bg-white/10 px-1 font-mono">SYM-893472</code>) yang dikirim melalui email atau tercantum di akun Anda.
              </p>
            </div>

            <div className="border border-white/10 p-6 flex flex-col gap-3">
              <span className="text-xs font-mono text-[#9a9a9a] border border-white/10 px-2 py-0.5 w-fit">
                02
              </span>
              <h3 className="text-base font-light text-white mt-1">2. Periksa Keabsahan Tiket</h3>
              <p className="text-xs font-light text-[#9a9a9a] leading-relaxed">
                Sistem secara otomatis memverifikasi keaktifan tiket, rincian tempat duduk, waktu pertunjukan, serta status pendaftaran gate.
              </p>
            </div>

            <div className="border border-white/10 p-6 flex flex-col gap-3">
              <span className="text-xs font-mono text-[#9a9a9a] border border-white/10 px-2 py-0.5 w-fit">
                03
              </span>
              <h3 className="text-base font-light text-white mt-1">3. Tunjukkan QR Code Gate</h3>
              <p className="text-xs font-light text-[#9a9a9a] leading-relaxed">
                Tunjukkan QR Code digital di pintu masuk hall konser (Open Gate) atau simpan dokumen E-Ticket cetak format PDF/PNG ke perangkat Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Sample E-Ticket Stub Preview & Concert Rules Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* E-Ticket Sample Visual Preview Stub */}
          <div className="lg:col-span-7 border border-white/15 p-6 sm:p-8 flex flex-col justify-between relative bg-[#171717]">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="text-xs font-light text-[#9a9a9a] tracking-widest uppercase flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
                  <span>CONTOH PRATINJAU PASS DIGITAL</span>
                </span>
                <span className="px-2.5 py-0.5 border border-white/20 text-[10px] uppercase font-mono tracking-wider text-white">
                  VERIFIED PASS
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] text-[#9a9a9a] uppercase tracking-wider block mb-1">
                    Pertunjukan Simfoni
                  </span>
                  <h4 className="text-xl font-light text-white tracking-tight">
                    Symphony No. 5 in C minor — Ludwig van Beethoven
                  </h4>
                  <p className="text-xs font-light text-[#9a9a9a] mt-1">
                    Royal Philharmonic Orchestra & Jakarta Choral Society
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-[#9a9a9a] uppercase block">Tanggal & Waktu</span>
                    <span className="text-xs text-white font-light">Sabtu, 18 April 2026 (19:30 WIB)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9a9a9a] uppercase block">Venue Hall</span>
                    <span className="text-xs text-white font-light">Aula Simfonia Jakarta</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-dashed border-white/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#9a9a9a] uppercase block">Kode Unik Ticket</span>
                <span className="text-sm font-mono text-white tracking-wider">SYM-893472</span>
              </div>
              <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5 text-xs text-[#9a9a9a]">
                <QrCode className="w-4 h-4 text-white" strokeWidth={1} />
                <span>QR Gate Ready</span>
              </div>
            </div>
          </div>

          {/* Concert Entry Guidelines & Rules */}
          <div className="lg:col-span-5 border border-white/15 bg-[#171717] p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <h3 className="text-base font-light text-white tracking-tight flex items-center gap-2 mb-4">
                <UserCheck className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
                <span>Aturan Pemeriksaan Gate</span>
              </h3>

              <ul className="space-y-3.5 text-xs font-light text-[#9a9a9a]">
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-white shrink-0 mt-0.5" strokeWidth={1} />
                  <span>
                    <strong className="text-white font-normal">Open Gate:</strong> Pintu hall dibuka 90 menit sebelum pertunjukan dimulai. Pengunjung disarankan hadir lebih awal.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-white shrink-0 mt-0.5" strokeWidth={1} />
                  <span>
                    <strong className="text-white font-normal">Kecerahan Layar HP:</strong> Atur kecerahan layar ponsel secara maksimal saat memindai Kode QR E-Ticket di scanner gate.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-white shrink-0 mt-0.5" strokeWidth={1} />
                  <span>
                    <strong className="text-white font-normal">Identitas Resmi:</strong> Siapkan KTP/SIM/Paspor sesuai nama pemesan tiket untuk verifikasi acak.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" strokeWidth={1} />
                  <span>
                    <strong className="text-white font-normal">Dress Code:</strong> Pengunjung wajib mengenakan pakaian Rapi & Sopan (Formal, Smart Casual, atau Batik).
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-3 border border-white/10 text-[11px] text-[#9a9a9a] leading-relaxed">
              Catatan: E-Ticket hanya dapat digunakan 1x untuk akses masuk gate hall pertunjukan.
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg sm:text-xl font-light text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
              <span>Pertanyaan Sering Diajukan (FAQ)</span>
            </h2>
            <span className="text-xs text-[#9a9a9a] font-mono">INFORMASI PERTANYAAN</span>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/10 bg-[#171717] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-sm sm:text-base font-light text-white">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#9a9a9a] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                      strokeWidth={1}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm font-light text-[#9a9a9a] leading-relaxed border-t border-white/[0.06]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Help & Account Access Bar */}
        <section className="border border-white/15 bg-[#171717] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-light text-white">Kesulitan Menemukan Kode Tiket Anda?</h3>
            <p className="text-xs font-light text-[#9a9a9a]">
              Masuk ke akun SymphoniaTic Anda untuk melihat semua tiket aktif, riwayat transaksi, dan refund.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/login"
              className="px-5 py-2.5 text-xs font-light tracking-wider uppercase bg-white text-[#171717] hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              <span>Masuk Akun Saya</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1} />
            </a>
            <a
              href="/refund"
              className="px-5 py-2.5 text-xs font-light tracking-wider uppercase border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              Layanan Refund
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-[#9a9a9a] font-light mt-12">
        &copy; 2026 SymphoniaTic Official Ticket Redemption Portal. All rights reserved.
      </footer>
    </div>
  );
};
