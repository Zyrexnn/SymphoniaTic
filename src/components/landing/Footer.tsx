import React, { useState } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';

const CONCERT_TERMS = [
  'Setiap akun atau identitas pemesan diperbolehkan memesan maksimal 4 tiket dalam 1 transaksi resmi.',
  'Pengunjung diwajibkan mengenakan pakaian rapi dan sopan (Smart Casual atau Formal).',
  'Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan orkestra demi menjaga kenyamanan akustik.',
  'E-Ticket resmi ber-Kode QR wajib ditunjukkan melalui smartphone pada saat registrasi di meja Open Gate.',
  'Pengajuan pembatalan dan pengembalian dana dapat diproses melalui portal resmi Pengajuan Refund (/refund) sebelum acara dimulai sesuai ketentuan.',
];

export const Footer: React.FC = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = ticketCode.trim();
    window.location.href = cleaned
      ? `/redeem?code=${encodeURIComponent(cleaned)}`
      : '/redeem';
  };

  return (
    <footer className="bg-[#D4FF2A] text-[#141413] border-t border-[#141413] overflow-x-clip">
      <div className="mx-auto max-w-[1360px] border-x border-[#141413]/20">
        {/* Top CTA & Quick E-Ticket Lookup Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#141413]/20">
          <div className="lg:col-span-4 px-5 sm:px-8 lg:px-10 py-8 lg:py-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#141413]/20">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413]">
              • Portal Tiket Resmi
            </span>
            <div className="mt-6 lg:mt-0">
              <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.04em] leading-none tabular-nums m-0">
                19:30 WIB
              </p>
              <p className="text-xs font-medium text-[#141413]/80 mt-1.5 mb-0">
                Standar jam panggung konser simfoni malam
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 px-5 sm:px-8 lg:px-10 py-8 lg:py-12">
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[0.96] text-[#141413] max-w-xl m-0">
              Akses E-Ticket.
              <br />
              Siap sebelum pintu dibuka.
            </h2>
            <p className="mt-4 text-sm text-[#141413]/85 max-w-lg leading-relaxed mb-0">
              Masukkan kode booking atau kode tiket Anda untuk membuka pass QR digital, unduh PNG resolusi tinggi, atau cetak PDF A4.
            </p>

            <form onSubmit={handleQuickLookup} className="mt-6 max-w-md">
              <label
                htmlFor="footer-ticket-lookup"
                className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#141413] mb-2"
              >
                Kode Booking / Tiket
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  id="footer-ticket-lookup"
                  type="text"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value)}
                  placeholder="Contoh: SYM-XXXXXX"
                  className="min-h-[44px] flex-1 rounded-none border border-[#141413] bg-white px-3.5 py-2 font-mono text-sm text-[#141413] placeholder:text-[#6E6D68] outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-none bg-[#141413] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D4FF2A] hover:bg-[#2A2A28] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] focus-visible:ring-offset-2 focus-visible:ring-offset-[#D4FF2A]"
                >
                  <span>Cek Tiket</span>
                  <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 4-Column Compact Directory */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[#141413]/20">
          <div className="px-5 sm:px-8 py-7 border-r border-b lg:border-b-0 border-[#141413]/20">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#141413]/75 mb-3 mt-0">
              Program
            </p>
            <div className="flex flex-col gap-1 items-start">
              <a href="/" className="min-h-[44px] inline-flex items-center text-sm font-semibold text-[#141413] hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]">
                Beranda
              </a>
              <a href="/events" className="min-h-[44px] inline-flex items-center text-sm font-semibold text-[#141413] hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]">
                Jadwal Konser
              </a>
              <a href="/edukasi" className="min-h-[44px] inline-flex items-center text-sm font-semibold text-[#141413] hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]">
                Edukasi &amp; Etiket
              </a>
            </div>
          </div>

          <div className="px-5 sm:px-8 py-7 lg:border-r border-b lg:border-b-0 border-[#141413]/20">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#141413]/75 mb-3 mt-0">
              Layanan
            </p>
            <div className="flex flex-col gap-1 items-start">
              <a href="/redeem" className="min-h-[44px] inline-flex items-center text-sm font-semibold text-[#141413] hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]">
                Cek E-Ticket
              </a>
              <a href="/refund" className="min-h-[44px] inline-flex items-center text-sm font-semibold text-[#141413] hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]">
                Pengajuan Refund
              </a>
              <a href="/dashboard" className="min-h-[44px] inline-flex items-center text-sm font-semibold text-[#141413] hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]">
                Akun &amp; Pesanan
              </a>
            </div>
          </div>

          <div className="px-5 sm:px-8 py-7 border-r border-[#141413]/20">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#141413]/75 mb-3 mt-0">
              Ikuti Kami
            </p>
            <div className="flex flex-col gap-1 items-start">
              {[
                { name: 'Instagram', href: 'https://instagram.com' },
                { name: 'Twitter / X', href: 'https://x.com' },
                { name: 'YouTube', href: 'https://youtube.com' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] text-sm font-semibold text-[#141413] hover:underline no-underline inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                >
                  <span>{s.name}</span>
                  <ExternalLink size={12} strokeWidth={2} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="px-5 sm:px-8 py-7">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#141413]/75 mb-3 mt-0">
              Informasi
            </p>
            <div className="flex flex-col gap-1 items-start">
              <a href="/admin" className="min-h-[44px] inline-flex items-center text-sm font-semibold text-[#141413] hover:underline no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]">
                Portal Admin
              </a>
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="min-h-[44px] text-left text-sm font-semibold text-[#141413] hover:underline bg-transparent border-none p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
              >
                Syarat &amp; Ketentuan
              </button>
              <span className="text-xs font-mono text-[#141413]/80 pt-1">
                support@symphoniatic.id
              </span>
            </div>
          </div>
        </div>

        {/* Legal Meta Strip */}
        <div className="px-5 sm:px-8 lg:px-10 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-medium text-[#141413]/80 border-b border-[#141413]/20">
          <p className="m-0">
            &copy; {new Date().getFullYear()} SymphoniaTic Production. Harmoni Nusantara.
          </p>
          <p className="m-0 font-mono text-[11px]">
            INDONESIA CLASSICAL TICKETING
          </p>
        </div>

        {/* Massive Edge-to-Edge Wordmark */}
        <div className="px-3 sm:px-6 pt-4 pb-2 sm:pb-4 overflow-hidden select-none">
          <p
            aria-hidden="true"
            className="font-display font-extrabold tracking-[-0.055em] leading-[0.84] text-[#141413] text-[clamp(36px,11.6vw,164px)] whitespace-nowrap m-0"
          >
            SymphoniaTic.
          </p>
        </div>
      </div>

      <FullscreenWorkspace
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        theme="light"
        eyebrow="Informasi Resmi"
        title="Syarat & Ketentuan Pengunjung"
        subtitle="Tata tertib gedung konser dan ketentuan pemesanan tiket SymphoniaTic"
        maxWidthClass="max-w-2xl"
        footer={
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="w-full sm:w-auto"
            >
              Mengerti
            </Button>
          </div>
        }
      >
        <ol className="space-y-4 text-sm sm:text-base text-[#141413] leading-relaxed pl-5 m-0">
          {CONCERT_TERMS.map((term, idx) => (
            <li key={idx} className="pl-2 text-[#52514D]">
              <span className="text-[#141413]">{term}</span>
            </li>
          ))}
        </ol>
      </FullscreenWorkspace>
    </footer>
  );
};
