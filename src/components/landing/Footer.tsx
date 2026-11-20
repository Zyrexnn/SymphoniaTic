import React, { useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
    <footer className="border-t border-[#E4DFD3] bg-white text-[#171614]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-10">
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#171614] rounded-lg flex items-center justify-center shrink-0">
                  <span className="font-display text-lg font-semibold text-[#F6F4EE]">S</span>
                </div>
                <div>
                  <span className="font-display text-xl font-semibold text-[#171614] tracking-tight block leading-tight">
                    SymphoniaTic
                  </span>
                  <span className="text-[10px] font-semibold text-[#6B665D] tracking-[0.2em] uppercase block">
                    Harmoni Nusantara
                  </span>
                </div>
              </div>
              <p className="text-sm text-[#5C5850] leading-relaxed max-w-sm m-0">
                Platform tiket resmi untuk pertunjukan orkestra, simfoni, balet, dan resital musik klasik di Indonesia.
              </p>
            </div>

            <form onSubmit={handleQuickLookup} className="max-w-sm">
              <label
                htmlFor="footer-ticket-lookup"
                className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#171614] mb-2"
              >
                Cek Cepat E-Ticket
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B665D] pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    id="footer-ticket-lookup"
                    type="text"
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="Kode SYM-XXXXXX"
                    className="min-h-[44px] border-[#CFC9BC] bg-[#F6F4EE] pl-9 pr-3 text-sm text-[#171614] placeholder:text-[#6B665D] focus-visible:border-[#C93018] focus-visible:ring-[#C93018]/20"
                  />
                </div>
                <Button type="submit" variant="dark" className="shrink-0">
                  Cek
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold text-[#171614] tracking-[0.16em] uppercase mb-4">
                Navigasi
              </p>
              <div className="flex flex-col gap-2 items-start">
                <a href="/" className="min-h-[36px] inline-flex items-center text-sm text-[#5C5850] hover:text-[#C93018] transition-colors no-underline">
                  Beranda
                </a>
                <a href="/events" className="min-h-[36px] inline-flex items-center text-sm text-[#5C5850] hover:text-[#C93018] transition-colors no-underline">
                  Jadwal Konser
                </a>
                <a href="/edukasi" className="min-h-[36px] inline-flex items-center text-sm text-[#5C5850] hover:text-[#C93018] transition-colors no-underline">
                  Edukasi &amp; Etiket
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#171614] tracking-[0.16em] uppercase mb-4">
                Layanan
              </p>
              <div className="flex flex-col gap-2 items-start">
                <a href="/redeem" className="min-h-[36px] inline-flex items-center text-sm text-[#5C5850] hover:text-[#C93018] transition-colors no-underline">
                  Cek E-Ticket
                </a>
                <a href="/refund" className="min-h-[36px] inline-flex items-center text-sm text-[#5C5850] hover:text-[#C93018] transition-colors no-underline">
                  Pengajuan Refund
                </a>
                <a href="/admin" className="min-h-[36px] inline-flex items-center text-sm text-[#5C5850] hover:text-[#C93018] transition-colors no-underline">
                  Portal Admin
                </a>
                <span className="text-xs text-[#6B665D] mt-1">support@symphoniatic.id</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#171614] tracking-[0.16em] uppercase mb-4">
                Ikuti Kami
              </p>
              <div className="flex flex-col gap-2 items-start">
                {[
                  { name: 'Instagram', href: 'https://instagram.com' },
                  { name: 'Twitter / X', href: 'https://x.com' },
                  { name: 'YouTube', href: 'https://youtube.com' },
                  { name: 'TikTok', href: 'https://tiktok.com' },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[36px] text-sm text-[#5C5850] hover:text-[#C93018] transition-colors no-underline inline-flex items-center gap-1.5 group"
                  >
                    <span>{s.name}</span>
                    <ExternalLink
                      size={12}
                      strokeWidth={1.6}
                      className="text-[#6B665D] group-hover:text-[#C93018] transition-colors"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-[#E4DFD3]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
          <p className="text-xs text-[#6B665D] m-0">
            &copy; {new Date().getFullYear()} SymphoniaTic Production. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-xs font-medium text-[#5C5850] hover:text-[#C93018] transition-colors bg-transparent border-none p-0 py-1"
            >
              Syarat &amp; Ketentuan Pengunjung
            </button>
          </div>
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
        <ol className="space-y-4 text-sm sm:text-base text-[#171614] leading-relaxed pl-5 m-0">
          {CONCERT_TERMS.map((term, idx) => (
            <li key={idx} className="pl-2 text-[#5C5850]">
              <span className="text-[#171614]">{term}</span>
            </li>
          ))}
        </ol>
      </FullscreenWorkspace>
    </footer>
  );
};
