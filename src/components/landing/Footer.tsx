import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { NAV_PAGES } from './data';
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

  return (
    <footer className="border-t border-[#272A38] bg-[#14161F]">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pt-14 sm:pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-[#272A38]">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-[#0C0D12] tracking-[0.05em]">S</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-white tracking-tight block leading-tight">SymphoniaTic</span>
                <span className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block">Harmoni Nusantara</span>
              </div>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-[280px] m-0">
              Platform tiket resmi untuk pertunjukan orkestra, simfoni, balet, dan musik klasik terbaik di Indonesia.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-white tracking-wide uppercase mb-4">Navigasi</p>
            <div className="flex flex-col gap-2.5 items-start">
              {NAV_PAGES.map((p) =>
                p.href === '#syarat-ketentuan' ? (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="min-h-[36px] text-sm text-[#A1A1AA] hover:text-white transition-colors bg-transparent border-none p-0 text-left"
                  >
                    {p.label}
                  </button>
                ) : (
                  <a
                    key={p.label}
                    href={p.href}
                    className="min-h-[36px] inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors no-underline"
                  >
                    {p.label}
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-white tracking-wide uppercase mb-4">Layanan</p>
            <div className="flex flex-col gap-2.5 items-start">
              <a href="/redeem" className="min-h-[36px] inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors no-underline">
                Cek E-Ticket
              </a>
              <a href="/refund" className="min-h-[36px] inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors no-underline">
                Pengajuan Refund
              </a>
              <a href="/admin" className="min-h-[36px] inline-flex items-center text-sm text-[#A1A1AA] hover:text-white transition-colors no-underline">
                Portal Admin
              </a>
              <span className="text-sm text-[#E4E4E7] mt-1">support@symphoniatic.id</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-white tracking-wide uppercase mb-4">Ikuti Kami</p>
            <div className="flex flex-col gap-2.5 items-start">
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
                  className="min-h-[36px] text-sm text-[#A1A1AA] hover:text-white transition-colors no-underline inline-flex items-center gap-1.5 group"
                >
                  <span>{s.name}</span>
                  <ExternalLink
                    size={12}
                    strokeWidth={1.6}
                    className="text-[#A1A1AA] group-hover:text-white transition-colors"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8">
          <p className="text-sm text-[#A1A1AA] m-0">
            &copy; {new Date().getFullYear()} SymphoniaTic Production. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <a
              href="/refund"
              className="text-xs text-[#A1A1AA] hover:text-white transition-colors no-underline py-1"
            >
              Kebijakan Tiket &amp; Refund
            </a>
            <a
              href="/events"
              className="text-xs text-[#A1A1AA] hover:text-white transition-colors no-underline py-1"
            >
              Panduan Masuk Hall
            </a>
          </div>
        </div>
      </div>

      <FullscreenWorkspace
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        eyebrow="SymphoniaTic"
        title="Syarat & Ketentuan Resmi"
        subtitle="Ketentuan pemesanan tiket dan tata tertib pertunjukan"
        maxWidthClass="max-w-2xl"
        backLabel="Tutup"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <a
              href="/refund"
              className="min-h-[44px] px-5 py-2.5 rounded-lg border border-[#3E4357] bg-[#0C0D12] text-sm font-semibold text-white hover:border-white/60 transition-colors inline-flex items-center justify-center"
            >
              Buka Portal Refund
            </a>
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="min-h-[44px] px-6 py-2.5 rounded-lg bg-white text-[#0C0D12] text-sm font-semibold hover:bg-neutral-200 transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        }
      >
        <ul className="space-y-3.5 text-sm text-[#E4E4E7] leading-relaxed list-none p-0 m-0">
          {CONCERT_TERMS.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#14161F] border border-[#272A38]">
              <span className="font-mono text-xs font-bold text-[#A1A1AA] mt-0.5 shrink-0">
                0{idx + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </FullscreenWorkspace>
    </footer>
  );
};
