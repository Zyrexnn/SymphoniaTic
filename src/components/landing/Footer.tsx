import React, { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { NAV_PAGES } from './data';

const CONCERT_TERMS = [
  'Setiap akun atau identitas pemesan diperbolehkan memesan maksimal 4 tiket dalam 1 transaksi resmi.',
  'Pengunjung diwajibkan mengenakan pakaian rapi dan sopan (Smart Casual atau Formal).',
  'Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan orkestra demi menjaga kenyamanan akustik.',
  'E-Ticket resmi ber-Kode QR wajib ditunjukkan melalui smartphone pada saat registrasi di meja Open Gate.',
  'Pengajuan pembatalan dan pengembalian dana dapat diproses melalui portal resmi Pengajuan Refund (/refund) sebelum acara dimulai sesuai ketentuan.',
];

export const Footer: React.FC = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    if (!showTermsModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTermsModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTermsModal]);

  return (
    <footer className="border-t border-line bg-canvas-alt">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pt-16 sm:pt-20 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-line">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-[#0C0D12] tracking-[0.05em]">S</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-ink tracking-tight block leading-tight">SymphoniaTic</span>
                <span className="text-[10px] font-medium text-muted tracking-[0.1em] uppercase block">Harmoni Nusantara</span>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-[280px]">
              Platform tiket resmi untuk pertunjukan orkestra, simfoni, balet, dan musik klasik terbaik di Indonesia.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink tracking-wide uppercase mb-5">Navigasi</p>
            <div className="flex flex-col gap-3 items-start">
              {NAV_PAGES.map((p) =>
                p.href === '#syarat-ketentuan' ? (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer text-left"
                  >
                    {p.label}
                  </button>
                ) : (
                  <a
                    key={p.label}
                    href={p.href}
                    className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline"
                  >
                    {p.label}
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink tracking-wide uppercase mb-5">Layanan</p>
            <div className="flex flex-col gap-3">
              <a href="/redeem" className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline">
                Cek E-Ticket
              </a>
              <a href="/refund" className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline">
                Pengajuan Refund
              </a>
              <a href="/admin" className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline">
                Portal Admin
              </a>
              <span className="text-sm text-muted mt-1">support@symphoniatic.id</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink tracking-wide uppercase mb-5">Ikuti Kami</p>
            <div className="flex flex-col gap-3">
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
                  className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline inline-flex items-center gap-1.5 group"
                >
                  <span>{s.name}</span>
                  <ExternalLink
                    size={10}
                    strokeWidth={1.5}
                    className="text-muted opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8">
          <p className="text-sm text-muted m-0">
            &copy; {new Date().getFullYear()} SymphoniaTic Production. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href="/refund"
              className="text-xs text-muted hover:text-brand transition-colors duration-200 no-underline"
            >
              Kebijakan Tiket & Refund
            </a>
            <a
              href="/events"
              className="text-xs text-muted hover:text-brand transition-colors duration-200 no-underline"
            >
              Panduan Masuk Hall
            </a>
          </div>
        </div>
      </div>

      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-terms-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-[#272A38] bg-[#14161F] p-6 shadow-2xl text-[#F4F4F6]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#272A38]">
              <h3 id="footer-terms-title" className="text-base font-bold text-white m-0">
                Syarat & Ketentuan Resmi
              </h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                aria-label="Tutup syarat dan ketentuan"
                className="p-1.5 rounded-lg bg-[#0C0D12] border border-[#272A38] text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-[#D1D5DB] leading-relaxed">
              {CONCERT_TERMS.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-[#272A38] flex items-center justify-end gap-3">
              <a
                href="/refund"
                className="px-4 py-2 rounded-lg border border-[#272A38] bg-[#0C0D12] text-xs font-semibold text-white hover:border-white/40 transition-colors"
              >
                Portal Refund
              </a>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 rounded-lg bg-white text-[#0C0D12] text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
