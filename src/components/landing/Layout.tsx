import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Ticket, ShieldCheck, ChevronRight, User, LogOut, LayoutDashboard, Search, Music2 } from 'lucide-react';
import type { UserRecord } from './data';

interface HeaderProps {
  isScrolled?: boolean;
  isMenuOpen?: boolean;
  ordersCount?: number;
  user?: UserRecord | null;
  onToggleMenu?: () => void;
  onOpenAdmin?: () => void;
  onOpenOrders?: () => void;
  onLogout?: () => void;
}

/* Real existing routes only — no fake anchors */
const mainNavItems = [
  { label: 'Konser', href: '/events', primary: true },
  { label: 'Edukasi', href: '/edukasi', primary: false },
  { label: 'Cek Tiket', href: '/redeem', primary: false },
  { label: 'Refund', href: '/refund', primary: false },
];

const BrandMark: React.FC<{ light?: boolean }> = ({ light }) => {
  return (
    <a
      href="/"
      aria-label="SymphoniaTic — Beranda"
      className="group flex items-center gap-3 cursor-pointer no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      <span className="h-10 w-10 rounded-[12px] bg-brand-accent flex items-center justify-center text-white shadow-[0_8px_20px_-8px_rgba(108,43,217,0.9)] transition-transform duration-300 group-hover:scale-[1.04]">
        <Music2 size={20} strokeWidth={2} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`text-[17px] font-bold tracking-[-0.03em] uppercase transition-colors duration-300 ${
            light ? 'text-white' : 'text-[#111111]'
          }`}
        >
          SymphoniaTic
        </span>
        <span
          className={`mt-1 text-[9px] font-semibold tracking-[0.24em] uppercase transition-colors duration-300 ${
            light ? 'text-white/60' : 'text-[#999999]'
          }`}
        >
          Concert Ticketing
        </span>
      </span>
    </a>
  );
};

/* Expandable search pill — navigates to /events?q=… */
const SearchPill: React.FC<{ light?: boolean; onNavigate?: () => void }> = ({ light, onNavigate }) => {
  const [q, setQ] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = q.trim() ? `/events?q=${encodeURIComponent(q.trim())}` : '/events';
    if (onNavigate) onNavigate();
    window.location.href = url;
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`group flex items-center rounded-full transition-all duration-300 focus-within:w-72 w-44 ${
        light
          ? 'bg-white/10 border border-white/15 focus-within:border-white/40'
          : 'bg-[#F7F7F7] border border-[#E5E5E5] focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/15'
      }`}
    >
      <button type="submit" aria-label="Cari" className="pl-3.5 pr-1 py-2 flex items-center cursor-pointer">
        <Search
          size={16}
          strokeWidth={2}
          className={light ? 'text-white/70 group-focus-within:text-white' : 'text-[#666666] group-focus-within:text-brand-accent transition-colors'}
        />
      </button>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari konser, artis, venue"
        aria-label="Cari konser, artis, atau venue"
        className={`bg-transparent py-2 pr-4 text-sm outline-none truncate min-w-0 flex-1 transition-colors duration-300 ${
          light
            ? 'text-white placeholder-white/45'
            : 'text-[#111111] placeholder-[#999999] focus-visible:outline-none focus-visible:ring-0'
        }`}
      />
    </form>
  );
};

export const Header: React.FC<HeaderProps> = ({
  isScrolled,
  isMenuOpen,
  ordersCount = 0,
  user,
  onToggleMenu,
  onOpenAdmin,
  onOpenOrders,
  onLogout,
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      const handleScroll = () => {
        setInternalScrolled(window.scrollY > 40);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrolled = isScrolled !== undefined ? isScrolled : internalScrolled;
  const menuOpen = isMenuOpen !== undefined ? isMenuOpen : internalMenuOpen;
  const handleToggleMenu = onToggleMenu || (() => setInternalMenuOpen((prev) => !prev));

  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      {/* ═══════════ DESKTOP NAVBAR ═══════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] shadow-[0_1px_2px_rgba(17,17,17,0.04)] py-2.5'
            : 'bg-gradient-to-b from-black/60 via-black/25 to-transparent py-4 md:py-5'
        }`}
      >
        <div className="flex items-center justify-between gap-6 mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <BrandMark light={!scrolled} />

          {/* Desktop primary navigation */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-9" aria-label="Navigasi utama">
            {mainNavItems.map((item) => {
              const isActive =
                currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative py-2 text-sm xl:text-[15px] tracking-[-0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${
                    isActive
                      ? 'font-semibold text-brand-accent'
                      : scrolled
                        ? 'font-medium text-[#444444] hover:text-brand-accent'
                        : 'font-normal text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-brand-accent transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Right utilities */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <SearchPill light={!scrolled} />

            {/* My tickets / orders */}
            {ordersCount > 0 && (
              <button
                onClick={onOpenOrders}
                title="Tiket Saya"
                className={`relative hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  scrolled
                    ? 'bg-[#F7F7F7] text-[#111111] hover:bg-brand-accent hover:text-white'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                }`}
              >
                <Ticket size={15} strokeWidth={2} />
                <span>Tiket</span>
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
                  {ordersCount}
                </span>
              </button>
            )}

            {/* Admin — only for admin role */}
            {isAdmin && (
              <a
                href="/admin"
                onClick={(e) => {
                  if (onOpenAdmin) {
                    e.preventDefault();
                    onOpenAdmin();
                  }
                }}
                title="Portal Admin"
                className={`hidden md:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-[#666666] hover:text-brand-accent hover:bg-[#F7F7F7]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <ShieldCheck size={15} strokeWidth={2} />
                <span>Admin</span>
              </a>
            )}

            {/* Auth — logged in */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2.5">
                <a
                  href="/dashboard"
                  title="Dashboard"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    scrolled
                      ? 'bg-[#111111] text-white hover:bg-brand-accent'
                      : 'bg-white text-[#111111] hover:bg-brand-accent hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={15} strokeWidth={2} className={scrolled ? 'text-brand-accent' : 'text-brand-accent'} />
                  <span className="max-w-[90px] truncate">{user.name}</span>
                </a>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Keluar"
                    aria-label="Keluar"
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${
                      scrolled ? 'bg-[#F7F7F7] text-[#666666] hover:bg-brand-accent hover:text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <LogOut size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            ) : (
              /* Auth — logged out: Masuk (secondary) + Daftar (primary) */
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/login"
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    scrolled ? 'text-[#444444] hover:text-brand-accent' : 'text-white/85 hover:text-white'
                  }`}
                >
                  <User size={15} strokeWidth={2} />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent px-4.5 py-2 text-sm font-semibold text-white hover:bg-brand-accent-hover transition-colors shadow-[0_10px_24px_-10px_rgba(108,43,217,0.9)]"
                >
                  Daftar
                  <ArrowUpRight size={15} strokeWidth={2} />
                </a>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={handleToggleMenu}
              aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className={`lg:hidden cursor-pointer h-10 w-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                scrolled ? 'bg-[#111111] text-white hover:bg-brand-accent' : 'bg-white text-[#111111]'
              }`}
            >
              {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════ MOBILE DRAWER ═══════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden overflow-y-auto"
          >
            {/* Drawer top bar */}
            <div className="flex items-center justify-between px-5 sm:px-8 pt-4 pb-5">
              <BrandMark />
              <button
                onClick={handleToggleMenu}
                aria-label="Tutup menu"
                className="h-11 w-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[#F7F7F7] text-[#111111] hover:bg-brand-accent hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Drawer search */}
            <div className="px-5 sm:px-8 pb-4">
              <SearchPill onNavigate={handleToggleMenu} />
              <p className="mt-2 text-xs text-[#999999] font-light">
                Cari konser, artis, atau venue favoritmu.
              </p>
            </div>

            {/* Drawer navigation */}
            <nav className="flex flex-col px-5 sm:px-8 py-3" aria-label="Navigasi menu seluler">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-accent mb-2 px-1">
                Navigasi Utama
              </span>
              {mainNavItems.map((item, idx) => {
                const isActive =
                  currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.04 }}
                    onClick={handleToggleMenu}
                    className={`group flex items-center justify-between rounded-xl px-4 py-4 my-0.5 transition-colors ${
                      isActive ? 'bg-[#F3EBFF] text-brand-accent' : 'text-[#111111] hover:bg-[#F7F7F7]'
                    }`}
                  >
                    <span className="flex items-center gap-4 text-lg font-semibold tracking-tight">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isActive ? 'text-brand-accent' : 'text-[#999999] group-hover:text-brand-accent'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      {item.label}
                    </span>
                    <ChevronRight size={20} strokeWidth={1.5} className="text-[#999999] group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all" />
                  </motion.a>
                );
              })}
            </nav>

            {/* Account actions */}
            <div className="px-5 sm:px-8 mt-4">
              {user ? (
                <div className="grid gap-2.5">
                  <a
                    href="/dashboard"
                    onClick={handleToggleMenu}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#111111] text-white py-3.5 text-sm font-semibold hover:bg-brand-accent transition-colors min-h-[48px]"
                  >
                    <LayoutDashboard size={16} strokeWidth={2} className="text-brand-accent" />
                    Dashboard — {user.name}
                  </a>
                  {onLogout && (
                    <button
                      onClick={() => {
                        handleToggleMenu();
                        onLogout();
                      }}
                      className="flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] text-[#666666] py-3.5 text-sm font-semibold hover:border-brand-accent hover:text-brand-accent transition-colors min-h-[48px] cursor-pointer"
                    >
                      <LogOut size={16} strokeWidth={2} />
                      Keluar
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-2.5">
                  <a
                    href="/login"
                    onClick={handleToggleMenu}
                    className="flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] text-[#111111] py-3.5 text-sm font-semibold hover:border-brand-accent hover:text-brand-accent transition-colors min-h-[48px]"
                  >
                    <User size={16} strokeWidth={2} />
                    Masuk
                  </a>
                  <a
                    href="/register"
                    onClick={handleToggleMenu}
                    className="flex items-center justify-center gap-2 rounded-full bg-brand-accent text-white py-3.5 text-sm font-bold hover:bg-brand-accent-hover transition-colors min-h-[48px]"
                  >
                    Daftar Sekarang
                    <ArrowUpRight size={16} strokeWidth={2} />
                  </a>
                </div>
              )}
            </div>

            {/* Admin (conditional) */}
            {isAdmin && (
              <div className="px-5 sm:px-8 mt-5">
                <a
                  href="/admin"
                  onClick={(e) => {
                    handleToggleMenu();
                    if (onOpenAdmin) {
                      e.preventDefault();
                      onOpenAdmin();
                    }
                  }}
                  className="flex items-center justify-between rounded-xl border border-dashed border-[#E5E5E5] px-4 py-3.5 text-sm font-semibold text-[#666666] hover:text-brand-accent hover:border-brand-accent transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck size={16} strokeWidth={2} />
                    Portal Admin
                  </span>
                  <ChevronRight size={16} className="text-[#999999]" />
                </a>
              </div>
            )}

            {/* Drawer footer */}
            <div className="px-5 sm:px-8 pt-8 pb-10 mt-auto text-xs text-[#999999] font-light flex flex-col gap-2">
              <p>&copy; 2026 SymphoniaTic Official Concert Booking Platform.</p>
              <p className="text-[10px] tracking-[0.18em] text-brand-accent font-semibold uppercase">
                Beethoven · Vivaldi · ABBA · Trust
              </p>
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
        Nikmati Harmoni Orkestra & Simfoni Terbaik.
      </h1>

      <p className="text-base sm:text-lg md:text-xl font-light text-[#9a9a9a] mt-6 max-w-2xl leading-relaxed">
        Platform resmi pemesanan tiket pertunjukan musik simfoni kelas dunia, ansambel neoklasik, dan opera pilihan.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
        <a
          href="#bento"
          style={{ color: '#171717' }}
          className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white !text-[#171717] text-xs sm:text-sm font-mono font-medium tracking-wider uppercase hover:bg-neutral-200 transition-all duration-300 cursor-pointer"
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