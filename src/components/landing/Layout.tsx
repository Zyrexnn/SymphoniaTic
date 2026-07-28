import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Menu, X, ShieldCheck, ShoppingCart, ChevronRight,
  Info, ArrowDown,
} from 'lucide-react';
import { NAV_PAGES, CONCERT_EVENTS } from './data';
import type { EventItem } from './data';

// ════════════════════════════════════════════════════════════════════
// HEADER
// ════════════════════════════════════════════════════════════════════
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
  <header className={`fixed top-0 left-0 right-0 z-40 px-4 py-3 sm:px-6 sm:py-4 transition-all duration-300 ${
    isScrolled || isMenuOpen
      ? 'bg-[#07080c]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl'
      : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
  }`}>
    <div className="flex items-center justify-between max-w-7xl mx-auto">
      <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-blue-400/30">
          <Music className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">SymphoniaTic</span>
          <span className="text-[9px] sm:text-[10px] text-blue-400 font-mono tracking-wider">TIKET KONSER RESMI</span>
        </div>
      </a>

      <nav className="hidden md:flex items-center gap-1.5 liquid-glass px-4 py-1.5 rounded-full border border-white/10">
        {NAV_PAGES.map((p) => (
          <a key={p.label} href={p.href} className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">{p.label}</a>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <button onClick={onOpenAdmin} className="hidden sm:flex text-xs text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-xl hover:bg-blue-950/60 transition-all cursor-pointer items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /><span>Metrik Admin</span>
        </button>
        <button onClick={onOpenOrders} className="rounded-xl bg-white p-1 pr-3 sm:pr-4 flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shadow-xl">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="text-xs sm:text-sm font-bold text-gray-900"><span className="hidden sm:inline">Cek Tiket / Invoice </span>({ordersCount})</span>
        </button>
        <button onClick={onToggleMenu} className="liquid-glass h-9 w-9 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer md:hidden border border-white/20" aria-label="Toggle menu">
          {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
      </div>
    </div>

    <AnimatePresence>
      {isMenuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="md:hidden pt-4 pb-3 flex flex-col gap-1.5 border-t border-white/10 mt-3">
          {NAV_PAGES.map((p) => (
            <a key={p.label} href={p.href} onClick={onToggleMenu}
              className="rounded-xl px-4 py-3 text-sm text-white hover:bg-blue-600/30 transition-all font-semibold flex items-center justify-between">
              <span>{p.label}</span><ChevronRight className="w-4 h-4 text-blue-400" />
            </a>
          ))}
          <div className="pt-2 border-t border-white/10 mt-1 flex flex-col gap-2">
            <button onClick={() => { onToggleMenu(); onOpenAdmin(); }}
              className="rounded-xl px-4 py-2.5 text-xs text-blue-300 bg-blue-950/40 border border-blue-500/30 text-left font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /><span>Portal Metrik Admin & System</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </header>
);

// ════════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════════
interface HeroProps {
  onShowDetail: (event: EventItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ onShowDetail }) => (
  <main className="relative z-10 flex flex-col items-center text-center pt-16 sm:pt-24 md:pt-28 px-4 sm:px-6 max-w-4xl mx-auto my-auto pb-28 sm:pb-32">
    <div className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white mb-5 animate-fade-up delay-1 flex items-center gap-2 border border-white/20 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="font-medium text-[11px] sm:text-xs">Tiket Konser Musik Klasik Musim Semi 2026 Dibuka</span>
    </div>
    <h1 className="max-w-3xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] text-white tracking-tight animate-fade-up delay-2 font-normal">
      Nikmati Harmoni Konser<br />Orkestra & Simfoni Terbaik.
    </h1>
    <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-base md:text-lg leading-relaxed text-gray-200 animate-fade-up delay-3 font-normal px-2">
      Platform resmi pemesanan tiket pertunjukan simfoni, orkestra philharmonic, opera, dan resital klasik di Indonesia. Dapatkan kepastian nomor kursi dan akses E-Ticket QR Code instan.
    </p>
    <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto animate-fade-up delay-4 px-2">
      <a href="#concerts" className="rounded-xl bg-white px-8 py-3.5 text-sm text-gray-900 font-bold hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer shadow-2xl flex items-center justify-center gap-2">
        <span>Jelajahi Konser & Beli Tiket</span><ArrowDown className="w-4 h-4" />
      </a>
      <button onClick={() => onShowDetail(CONCERT_EVENTS[0])}
        className="liquid-glass rounded-xl px-7 py-3.5 text-sm text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2 border border-white/20">
        <Info className="w-4 h-4 text-blue-400" /><span>Detail Konser Beethoven</span>
      </button>
    </div>
  </main>
);

// ════════════════════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════════════════════
export const Footer: React.FC = () => (
  <footer className="relative z-10 py-10 px-4 sm:px-6 md:px-12 border-t border-white/10 bg-[#050609] text-xs text-gray-400">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center"><Music className="w-4 h-4 text-white" /></div>
        <span className="text-sm font-semibold text-white">SymphoniaTic</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-gray-400">
        <a href="#concerts" className="hover:text-white transition-colors">Jelajah Konser</a>
        <a href="#lineup" className="hover:text-white transition-colors">Artis</a>
        <a href="#ticket-war" className="hover:text-white transition-colors">Proteksi Kuota</a>
        <a href="#guide" className="hover:text-white transition-colors">Panduan</a>
        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
      </div>
      <p className="text-center">© 2026 SymphoniaTic Events Inc. Hak Cipta Dilindungi.</p>
    </div>
  </footer>
);
