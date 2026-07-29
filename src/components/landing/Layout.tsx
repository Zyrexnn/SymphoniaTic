import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_PAGES } from './data';
import type { EventItem } from './data';

interface HeaderProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  ordersCount: number;
  onToggleMenu: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isScrolled, isMenuOpen, ordersCount, onToggleMenu, onOpenAdmin, onOpenOrders,
}) => (
  <header
    className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
      isScrolled ? 'bg-[rgba(23,23,23,0.95)]' : 'bg-transparent'
    }`}
  >
    <div className="flex items-center justify-between mx-auto max-w-[1400px] px-10 pt-[5px] pb-2.5">
      <nav className="hidden md:flex items-center gap-8">
        {NAV_PAGES.map((p, i) => (
          <a
            key={p.label}
            href={p.href}
            onClick={(e) => {
              if (p.href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(p.href);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            className={`text-base font-light tracking-[-0.05px] text-white pb-2.5 hover:opacity-60 transition-opacity ${
              i === 0 ? 'border-b border-white' : 'border-b border-transparent'
            }`}
          >
            {p.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-8">
        <button
          onClick={onOpenOrders}
          className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none"
        >
          {ordersCount > 0 ? `Tiket (${ordersCount})` : 'Tiket'}
        </button>
        <a
          href="/admin"
          className="hidden sm:block text-base font-light tracking-[-0.05px] text-[#9a9a9a] hover:opacity-60 transition-opacity"
        >
          Admin
        </a>
        <button
          onClick={onToggleMenu}
          className="md:hidden cursor-pointer bg-transparent border-none text-white"
        >
          {isMenuOpen ? <X size={18} strokeWidth={1} /> : <Menu size={18} strokeWidth={1} />}
        </button>
      </div>
    </div>

    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="md:hidden border-t border-white/[0.06]"
        >
          <div className="flex flex-col px-10 py-4">
            {NAV_PAGES.map((p) => (
              <a
                key={p.label}
                href={p.href}
                onClick={(e) => {
                  onToggleMenu();
                  if (p.href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(p.href);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="py-3 text-base font-light tracking-[-0.05px] text-white hover:opacity-60 transition-opacity"
              >
                {p.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </header>
);

export const Hero: React.FC = () => (
  <main className="relative z-10 flex flex-col justify-end mx-auto max-w-[1400px] min-h-[100dvh] px-10 pb-[120px]">
    <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-5">
      Musim Semi 2026
    </p>

    <h1 className="text-[clamp(36px,7vw,56px)] leading-[1.0] tracking-[-0.056em] font-light text-white m-0">
      Nikmati Harmoni<br />
      Orkestra &amp; Simfoni<br />
      Terbaik.
    </h1>

    <div className="mt-12">
      <a
        href="#bento"
        className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] hover:opacity-60 transition-opacity inline-flex items-center gap-2"
      >
        <span>↓</span>
        <span>Jelajahi Konser</span>
      </a>
    </div>
  </main>
);

export const Footer: React.FC = () => (
  <footer className="mx-auto max-w-[1400px] px-10 pt-[120px] pb-20">
    <div className="border-t border-white/[0.06] pt-10 flex flex-col sm:flex-row items-start justify-between gap-8">
      <div className="text-base font-light tracking-[-0.05px] text-[#9a9a9a]">
        &copy; 2026 SymphoniaTic
      </div>
      <div className="flex flex-wrap items-center gap-8">
        {NAV_PAGES.map((p) => (
          <a
            key={p.label}
            href={p.href}
            className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] hover:opacity-60 transition-opacity"
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  </footer>
);
