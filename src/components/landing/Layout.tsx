import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Ticket, ShieldCheck, ChevronRight, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  ordersCount: number;
  onToggleMenu: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isScrolled,
  isMenuOpen,
  ordersCount,
  onToggleMenu,
  onOpenAdmin,
  onOpenOrders,
}) => {
  // All navigation items for clean, non-duplicated structure
  const mainNavItems = [
    { label: 'Jelajah Konser', href: '/events' },
    { label: 'Artis & Lineup', href: '#lineup' },
    { label: 'Sistem Kuota', href: '#ticket-war' },
    { label: 'Edukasi', href: '/edukasi' },
    { label: 'Cek Tiket', href: '/redeem' },
    { label: 'Refund', href: '/refund' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#171717]/90 backdrop-blur-md border-b border-white/[0.08] shadow-2xl shadow-black/50 py-3'
            : 'bg-gradient-to-b from-[#171717]/90 via-[#171717]/40 to-transparent py-4 md:py-5'
        }`}
      >
        <div className="flex items-center justify-between mx-auto max-w-[1400px] px-4 sm:px-8 md:px-10 lg:px-12">
          {/* Brand Wordmark Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer text-white no-underline focus:outline-none"
          >
            <div className="w-8 h-8 rounded-none border border-white/20 flex items-center justify-center bg-white/5 group-hover:border-white group-hover:bg-white text-white group-hover:text-[#171717] transition-all duration-300">
              <span className="font-mono text-xs font-bold tracking-tighter">S</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-light tracking-[-0.04em] uppercase text-white leading-none">
                SYMPHONIATIC
              </span>
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#9a9a9a] uppercase leading-tight mt-0.5">
                CONCERT TICKETING
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {mainNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(item.href);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="relative text-sm xl:text-base font-light tracking-[-0.03em] text-[#9a9a9a] hover:text-white transition-colors duration-200 py-1 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Right Utilities & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {ordersCount > 0 && (
              <button
                onClick={onOpenOrders}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 hover:bg-emerald-900/40 transition-colors cursor-pointer"
                title="Lihat Pesanan Saya"
              >
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{ordersCount} Tiket</span>
              </button>
            )}

            {/* Quick Cek Tiket Button for Tablet & Desktop */}
            <a
              href="/redeem"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase px-4 py-2 border border-white/20 text-white bg-white/5 hover:bg-white hover:text-[#171717] hover:border-white transition-all duration-300"
            >
              <Ticket className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Cek Tiket</span>
            </a>

            {/* Admin Trigger Link / Button */}
            <button
              onClick={onOpenAdmin}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono tracking-wider text-[#9a9a9a] hover:text-white transition-colors px-2 py-1 bg-transparent border-none cursor-pointer"
              title="Portal Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Admin</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={onToggleMenu}
              aria-label="Buka Menu Navigasi"
              className="lg:hidden cursor-pointer bg-white/5 border border-white/15 hover:border-white text-white p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus:outline-none"
            >
              {isMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Fullscreen Navigation Overlay Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#171717]/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 lg:hidden overflow-y-auto"
          >
            {/* Drawer Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <a href="/" onClick={onToggleMenu} className="flex items-center gap-2.5 text-white">
                <div className="w-7 h-7 border border-white/30 flex items-center justify-center bg-white/10">
                  <span className="font-mono text-xs font-bold">S</span>
                </div>
                <span className="text-base font-light tracking-widest uppercase">SYMPHONIATIC</span>
              </a>

              <button
                onClick={onToggleMenu}
                aria-label="Tutup Menu"
                className="bg-white/10 border border-white/20 text-white p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white hover:text-[#171717] transition-all cursor-pointer"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <nav className="flex flex-col py-8 gap-2">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#9a9a9a] mb-2 px-2">
                NAVIGASI UTAMA
              </span>

              {mainNavItems.map((item, idx) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  onClick={(e) => {
                    onToggleMenu();
                    if (item.href.startsWith('#')) {
                      e.preventDefault();
                      const target = document.querySelector(item.href);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="group flex items-center justify-between py-3.5 px-3 border-b border-white/5 text-lg sm:text-xl font-light tracking-tight text-white hover:text-[#9a9a9a] hover:bg-white/[0.03] transition-all"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#9a9a9a] group-hover:text-white">
                      0{idx + 1}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight size={18} strokeWidth={1} className="text-[#9a9a9a] group-hover:translate-x-1 transition-transform" />
                </motion.a>
              ))}

              <div className="pt-4 mt-2 grid grid-cols-2 gap-3">
                <a
                  href="/redeem"
                  onClick={onToggleMenu}
                  style={{ color: '#171717' }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white !text-[#171717] font-mono text-xs font-semibold uppercase tracking-wider text-center cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  <Ticket size={14} style={{ color: '#171717' }} />
                  <span style={{ color: '#171717' }}>Cek Tiket</span>
                </a>
                <a
                  href="/admin"
                  onClick={onToggleMenu}
                  style={{ color: '#ffffff' }}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-white/30 text-white font-mono text-xs uppercase tracking-wider text-center hover:bg-white/10"
                >
                  <ShieldCheck size={14} />
                  <span>Admin</span>
                </a>
              </div>
            </nav>

            {/* Drawer Footer Info */}
            <div className="border-t border-white/10 pt-6 text-xs text-[#9a9a9a] font-light flex flex-col gap-2">
              <p>&copy; 2026 SymphoniaTic Official Concert Booking Platform.</p>
              <p className="font-mono text-[10px] text-white/40">BEETHOVEN • VIVALDI • ABBA • TRUST</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const Hero: React.FC = () => (
  <main className="relative z-10 flex flex-col justify-end mx-auto max-w-[1400px] min-h-[100dvh] px-5 sm:px-8 md:px-10 lg:px-12 pb-[100px] md:pb-[120px]">
    <div className="max-w-4xl">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/15 text-xs font-mono text-[#9a9a9a] uppercase tracking-widest mb-6">
        <span>[ MUSIM SEMI 2026 ]</span>
      </div>

      <h1 className="text-[clamp(36px,6.5vw,60px)] leading-[1.05] tracking-[-0.04em] font-light text-white m-0 max-w-4xl">
        Nikmati Harmoni Orkestra &amp; Simfoni Terbaik.
      </h1>

      <p className="text-base sm:text-lg md:text-xl font-light text-[#9a9a9a] mt-6 max-w-2xl leading-relaxed">
        Platform resmi pemesanan tiket pertunjukan musik simfoni kelas dunia, ansambel neoklasik, dan opera pilihan.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
        <a
          href="#bento"
          style={{ color: '#171717' }}
          className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white !text-[#171717] text-xs sm:text-sm font-mono font-medium tracking-wider uppercase hover:bg-neutral-200 transition-all duration-300 shadow-xl cursor-pointer"
        >
          <span style={{ color: '#171717' }}>Jelajahi Konser</span>
          <ArrowUpRight size={16} strokeWidth={2} style={{ color: '#171717' }} className="!text-[#171717] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
        <a
          href="/redeem"
          style={{ color: '#ffffff' }}
          className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/30 text-white bg-white/5 text-xs sm:text-sm font-mono tracking-wider uppercase hover:border-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <Ticket size={16} strokeWidth={1.5} className="text-white" />
          <span>Cek Tiket Saya</span>
        </a>
      </div>
    </div>
  </main>
);



