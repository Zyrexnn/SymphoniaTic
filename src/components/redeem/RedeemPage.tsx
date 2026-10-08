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
import { Header } from '../landing/Navbar';

interface SampleCode {
  code: string;
  label: string;
  status: 'active' | 'checked_in' | 'refunded';
}

const SAMPLE_CODES: SampleCode[] = [
  { code: 'SYM-893472', label: 'Beethoven Symphony, Active', status: 'active' },
  { code: 'SYM-102948', label: 'Viva La Vida, Checked-in', status: 'checked_in' },
  { code: 'SYM-448291', label: 'Laskar Pelangi, Active', status: 'active' }
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2';

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
    <div className="min-h-screen bg-canvas font-sans text-ink selection:bg-brand selection:text-chalk relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="status"
            className="fixed right-6 top-24 z-50 flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-xs text-ink shadow-[0_18px_40px_-24px_rgba(24,59,86,0.5)]"
          >
            <Check className="h-4 w-4 shrink-0 text-brand-accent" strokeWidth={2} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Header isScrolled />

      <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 md:px-12 pt-24 sm:pt-28">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-16 pb-12 sm:gap-20 sm:pb-16">
        <div className="flex max-w-3xl flex-col items-start">
          <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-4">
            <a
              href="/"
              className={`inline-flex min-h-11 items-center gap-2 text-xs text-muted transition-colors duration-200 hover:text-ink ${focusRing}`}
            >
              <ArrowLeft className="h-4 w-4 text-brand-accent" strokeWidth={1.5} />
              <span>Kembali ke Beranda</span>
            </a>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-brand-accent" strokeWidth={1.5} />
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Portal Cek Tiket
              </span>
            </div>
          </div>
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
            <span className="h-2 w-2 bg-brand-accent" aria-hidden />
            Verifikasi Resmi Tiket Simfoni
          </p>
          <h1 className="text-[clamp(32px,6vw,56px)] font-bold leading-[1.05] tracking-[-0.04em] text-ink">
            Cek E-Ticket Konser Anda
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Masukkan kode unik pesanan Anda untuk mengakses pass digital resmi, QR Code scanner gate, informasi lokasi venue, serta dokumen E-Ticket cetak PDF.
          </p>
        </div>

        <div className="relative rounded-2xl border border-line bg-white p-6 sm:p-10">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode pesanan (SYM-XXXXXX)"
                aria-label="Kode pesanan tiket"
                className={`w-full rounded-lg border border-line bg-white py-3.5 pl-11 pr-10 font-mono text-sm uppercase tracking-wider text-ink outline-none transition-colors duration-200 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-soft hover:border-brand/40 focus:border-brand ${focusRing}`}
                autoFocus
              />
              {searchCode && (
                <button
                  type="button"
                  onClick={() => setSearchCode('')}
                  aria-label="Hapus kode"
                  className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-ink-soft transition-colors duration-200 hover:text-brand-accent ${focusRing}`}
                >
                  <span aria-hidden>&times;</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchCode.trim()}
              className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-chalk transition-colors duration-200 hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
            >
              {isLoading ? (
                <span>Memeriksa...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                  <span>Verifikasi Tiket</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-3 flex flex-col justify-between gap-3 border-t border-line pt-4 text-xs text-muted sm:flex-row sm:items-center">
            <span className="font-mono text-[11px] text-ink-soft">Contoh format kode: SYM-893472</span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className={`inline-flex w-fit cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-xs text-muted underline transition-colors duration-200 hover:text-brand-accent ${focusRing}`}
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Tempel dari Clipboard</span>
            </button>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Sampel Kode Tiket, klik untuk verifikasi langsung
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_CODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectSampleCode(item.code)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-canvas-alt px-3 py-2 text-xs font-mono text-ink transition-colors duration-200 hover:border-brand-accent/45 hover:bg-brand-light ${focusRing}`}
                >
                  <Ticket className="h-3 w-3 text-brand-accent" strokeWidth={1.5} />
                  <span>{item.code}</span>
                  <span className="font-sans text-[11px] text-muted">{item.label}</span>
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
            className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" strokeWidth={1.5} />
            <div className="flex-1 text-sm leading-relaxed">
              <p className="mb-1 text-base font-semibold text-red-900">Tiket Tidak Ditemukan</p>
              <p className="text-red-800">{errorMessage}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-red-200 pt-3 text-xs">
                <span className="text-red-800">Bantuan pencarian:</span>
                <a
                  href="/login"
                  className={`font-medium text-red-900 underline transition-opacity hover:opacity-70 ${focusRing}`}
                >
                  Masuk ke Akun Saya untuk melihat daftar tiket
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <h2 className={`flex items-center gap-2.5 text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl ${focusRing}`}>
              <ShieldCheck className="h-5 w-5 shrink-0 text-brand-accent" strokeWidth={1.5} />
              <span>Panduan Alur Verifikasi Tiket</span>
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Proses Verifikasi
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
              <div key={item.step} className="flex flex-col gap-3 rounded-2xl border border-line p-6 transition-colors duration-300 hover:border-brand-accent/45">
                <span className="text-4xl font-bold leading-none tracking-[-0.04em] text-brand-accent">
                  {item.step}
                </span>
                <h3 className="mt-1 text-base font-bold tracking-[-0.01em] text-ink">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="relative flex flex-col justify-between rounded-2xl border border-line bg-white p-6 sm:p-8 lg:col-span-7">
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  <Ticket className="h-4 w-4 text-brand-accent" strokeWidth={1.5} />
                  <span>Contoh Pratinjau Pass Digital</span>
                </span>
                <span className="rounded-lg border border-brand/25 bg-canvas-alt px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
                  Verified Pass
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-accent">
                    Pertunjukan Simfoni
                  </span>
                  <h4 className="text-xl font-bold tracking-[-0.02em] text-ink">
                    Symphony No. 5 in C minor
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    Ludwig van Beethoven, Royal Philharmonic Orchestra &amp; Jakarta Choral Society
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-line pt-3 sm:grid-cols-2">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Tanggal &amp; Waktu
                    </span>
                    <span className="mt-1 block text-xs text-ink">Sabtu, 18 April 2026, 19:30 WIB</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                      Venue Hall
                    </span>
                    <span className="mt-1 block text-xs text-ink">Aula Simfonia Jakarta</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-line pt-4">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  Kode Unik Ticket
                </span>
                <span className="mt-0.5 block font-mono text-sm tracking-wider text-ink">SYM-893472</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-xs text-muted">
                <QrCode className="h-4 w-4 text-brand-accent" strokeWidth={1.5} />
                <span>QR Gate Ready</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-2xl border border-line bg-white p-6 sm:p-8 lg:col-span-5">
            <div>
              <h3 className={`mb-4 flex items-center gap-2.5 text-lg font-bold tracking-[-0.01em] text-ink ${focusRing}`}>
                <UserCheck className="h-5 w-5 shrink-0 text-brand-accent" strokeWidth={1.5} />
                <span>Aturan Pemeriksaan Gate</span>
              </h3>

              <ul className="space-y-3.5 text-xs leading-relaxed text-muted">
                {[
                  { icon: Clock, label: 'Open Gate:', text: 'Pintu hall dibuka 90 menit sebelum pertunjukan dimulai. Pengunjung disarankan hadir lebih awal.' },
                  { icon: Smartphone, label: 'Kecerahan Layar HP:', text: 'Atur kecerahan layar ponsel secara maksimal saat memindai Kode QR E-Ticket di scanner gate.' },
                  { icon: FileText, label: 'Identitas Resmi:', text: 'Siapkan KTP/SIM/Paspor sesuai nama pemesan tiket untuk verifikasi acak.' },
                  { icon: AlertTriangle, label: 'Dress Code:', text: 'Pengunjung wajib mengenakan pakaian Rapi & Sopan (Formal, Smart Casual, atau Batik).' }
                ].map(({ icon: Icon, label, text }) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" strokeWidth={1.5} />
                    <span>
                      <strong className="font-semibold text-ink">{label}</strong> {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-line bg-canvas-alt p-3 text-[11px] leading-relaxed text-muted">
              Catatan: E-Ticket hanya dapat digunakan 1x untuk akses masuk gate hall pertunjukan.
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <h2 className={`flex items-center gap-2.5 text-2xl font-bold tracking-[-0.02em] text-ink sm:text-3xl ${focusRing}`}>
              <HelpCircle className="h-5 w-5 shrink-0 text-brand-accent" strokeWidth={1.5} />
              <span>Pertanyaan Sering Diajukan</span>
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Informasi Pertanyaan
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-line bg-white transition-colors duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors duration-200 hover:bg-canvas-alt ${focusRing}`}
                  >
                    <span className="text-sm font-bold text-ink sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-accent' : ''
                      }`}
                      strokeWidth={1.5}
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
                        <div className="border-t border-line px-5 pb-5 pt-4 text-xs leading-relaxed text-muted sm:text-sm">
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

        <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-line bg-canvas-alt p-6 sm:flex-row sm:p-8">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold tracking-[-0.01em] text-ink">
              Kesulitan Menemukan Kode Tiket Anda?
            </h3>
            <p className="text-xs text-muted">
              Masuk ke akun SymphoniaTic Anda untuk melihat semua tiket aktif, riwayat transaksi, dan refund.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <a
              href="/login"
              className={`inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-chalk transition-colors duration-200 hover:bg-brand-dark ${focusRing}`}
            >
              <span>Masuk Akun Saya</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
            <a
              href="/refund"
              className={`rounded-lg border border-line bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink transition-colors duration-200 hover:border-brand-accent/45 hover:bg-brand-light ${focusRing}`}
            >
              Layanan Refund
            </a>
          </div>
        </section>
        </div>
      </main>

      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        &copy; 2026 SymphoniaTic Official Ticket Redemption Portal. All rights reserved.
      </footer>
    </div>
  );
};
