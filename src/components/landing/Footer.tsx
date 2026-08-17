import React from 'react';
import { ExternalLink } from 'lucide-react';
import { NAV_PAGES } from './data';

export const Footer: React.FC = () => (
  <footer className="border-t border-line bg-canvas-alt">
    <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pt-16 sm:pt-20 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-line">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-brand flex items-center justify-center">
              <span className="text-sm font-bold text-white tracking-[0.05em]">S</span>
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
          <div className="flex flex-col gap-3">
            {NAV_PAGES.map((p) => (
              <a
                key={p.label}
                href={p.href}
                className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline"
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink tracking-wide uppercase mb-5">Layanan</p>
          <div className="flex flex-col gap-3">
            <a href="/admin" className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline">
              Portal Admin
            </a>
            <a href="/redeem" className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline">
              Redem E-Tiket
            </a>
            <a href="/refund" className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline">
              Pengajuan Refund Tiket
            </a>
            <span className="text-sm text-muted mt-1">support@symphoniatic.id</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink tracking-wide uppercase mb-5">Ikuti Kami</p>
          <div className="flex flex-col gap-3">
            {['Instagram', 'Twitter / X', 'YouTube', 'TikTok'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-sm text-ink-soft hover:text-brand transition-colors duration-200 no-underline inline-flex items-center gap-1.5 group"
              >
                <span>{s}</span>
                <ExternalLink
                  size={10}
                  strokeWidth={1.5}
                  className="text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
        <div className="flex items-center gap-6">
          {['Kebijakan Privasi', 'Syarat & Ketentuan'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs text-muted hover:text-brand transition-colors duration-200 no-underline"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
