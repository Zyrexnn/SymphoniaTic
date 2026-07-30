import React from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { NAV_PAGES } from './data';

export const Footer: React.FC = () => (
  <footer className="border-t border-white/[0.06] bg-[#171717]">
    <div className="mx-auto max-w-[1400px] px-10 pt-16 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/[0.04]">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 border border-white/[0.12] flex items-center justify-center">
              <span className="text-sm font-light text-white tracking-[0.1em]">S</span>
            </div>
            <div>
              <span className="text-sm font-light text-white tracking-tight block">SymphoniaTic</span>
              <span className="text-[9px] font-light text-[#6a6a6a] tracking-[0.15em] uppercase block">Harmoni Nusantara</span>
            </div>
          </div>
          <p className="text-sm font-light text-[#6a6a6a] leading-[1.7] max-w-[280px]">
            Platform tiket resmi untuk pertunjukan orkestra, simfoni, balet, dan musik klasik terbaik di Indonesia.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-light text-[#5a5a5a] tracking-[0.12em] uppercase mb-4">Navigasi</p>
          <div className="flex flex-col gap-2.5">
            {NAV_PAGES.map((p) => (
              <a
                key={p.label}
                href={p.href}
                className="text-sm font-light text-[#9a9a9a] hover:text-white transition-colors duration-200 no-underline"
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-light text-[#5a5a5a] tracking-[0.12em] uppercase mb-4">Layanan</p>
          <div className="flex flex-col gap-2.5">
            <a href="/admin" className="text-sm font-light text-[#9a9a9a] hover:text-white transition-colors duration-200 no-underline">
              Portal Admin
            </a>
            <a href="/redeem" className="text-sm font-light text-[#9a9a9a] hover:text-white transition-colors duration-200 no-underline">
              Redem E-Tiket
            </a>
            <span className="text-sm font-light text-[#5a5a5a]">Bantuan: support@symphoniatic.id</span>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-light text-[#5a5a5a] tracking-[0.12em] uppercase mb-4">Ikuti Kami</p>
          <div className="flex flex-col gap-2.5">
            {['Instagram', 'Twitter / X', 'YouTube', 'TikTok'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-sm font-light text-[#9a9a9a] hover:text-white transition-colors duration-200 no-underline flex items-center gap-1.5"
              >
                <span>{s}</span>
                <ExternalLink size={10} strokeWidth={1} className="text-[#4a4a4a]" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8">
        <p className="text-sm font-light text-[#4a4a4a] m-0">
          &copy; {new Date().getFullYear()} SymphoniaTic Production. Seluruh hak cipta dilindungi.
        </p>
        <div className="flex items-center gap-6">
          {['Kebijakan Privasi', 'Syarat & Ketentuan'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs font-light text-[#4a4a4a] hover:text-[#9a9a9a] transition-colors duration-200 no-underline"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
