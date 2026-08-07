import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Ticket, ShieldCheck, ChevronRight, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
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
  const [currentPath, setCurrentPath] = React.useState('');
  const [internalScrolled, setInternalScrolled] = React.useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      const handleScroll = () => {
        setInternalScrolled(window.scrollY > 30);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrolled = isScrolled !== undefined ? isScrolled : internalScrolled;
  const menuOpen = isMenuOpen !== undefined ? isMenuOpen : internalMenuOpen;
  const handleToggleMenu = onToggleMenu || (() => setInternalMenuOpen((prev) => !prev));

  // Only real, existing pages in the navbar (no fake anchors, no duplicate Cek Tiket text link)
  const mainNavItems = [
    { label: 'Konser', href: '/events' },
    { label: 'Edukasi', href: '/edukasi' },
    { label: 'Refund', href: '/refund' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#171717]/90 backdrop-blur-md border-b border-white/[0.08] shadow-2xl shadow-black/50 py-3.5'
            : 'bg-gradient-to-b from-[#171717]/95 via-[#171717]/50 to-transparent py-4 md:py-5'
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

          {/* Desktop Navigation Links (Real Pages Only) */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {mainNavItems.map((item) => {
              const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative text-sm xl:text-base tracking-[-0.02em] transition-colors duration-200 py-1 group ${
                    isActive ? 'text-white font-normal' : 'text-[#9a9a9a] hover:text-white font-light'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              );
            })}
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

            {/* Dedicated Primary Action: Cek Tiket */}
            <a
              href="/redeem"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase px-4 py-2 border border-white/20 text-white bg-white/5 hover:bg-white hover:text-[#171717] hover:border-white transition-all duration-300"
            >
              <Ticket className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Cek Tiket</span>
            </a>

            {/* Admin Link */}
            <a
              href="/admin"
              onClick={(e) => {
                if (onOpenAdmin) {
                  e.preventDefault();
                  onOpenAdmin();
                }
              }}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-mono tracking-wider text-[#9a9a9a] hover:text-white transition-colors px-2 py-1 bg-transparent border-none cursor-pointer"
              title="Portal Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Admin</span>
            </a>

            {/* User Auth: Dashboard + Logout jika login, else Masuk/Daftar */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase px-3 py-2 border border-white/20 text-white hover:border-white hover:bg-white/5 transition-all"
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </a>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider text-[#9a9a9a] hover:text-white transition-colors px-2 py-2 border border-transparent hover:border-white/20 cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider text-[#9a9a9a] hover:text-white transition-colors px-2.5 py-1.5"
                >
                  <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase px-3 py-1.5 bg-white text-[#171717] hover:bg-neutral-200 transition-colors"
                >
                  Daftar
                </a>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={handleToggleMenu}
              aria-label="Buka Menu Navigasi"
              className="lg:hidden cursor-pointer bg-white/5 border border-white/15 hover:border-white text-white p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus:outline-none"
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#171717]/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 lg:hidden overflow-y-auto"
          >
            {/* Drawer Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <a href="/" onClick={handleToggleMenu} className="flex items-center gap-2.5 text-white">
                <div className="w-7 h-7 border border-white/30 flex items-center justify-center bg-white/10">
                  <span className="font-mono text-xs font-bold">S</span>
                </div>
                <span className="text-base font-light tracking-widest uppercase">SYMPHONIATIC</span>
              </a>

              <button
                onClick={handleToggleMenu}
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
                  onClick={handleToggleMenu}
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
                  onClick={handleToggleMenu}
                  style={{ color: '#171717' }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white !text-[#171717] font-mono text-xs font-semibold uppercase tracking-wider text-center cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  <Ticket size={14} style={{ color: '#171717' }} />
                  <span style={{ color: '#171717' }}>Cek Tiket</span>
                </a>
                <a
                  href="/admin"
                  onClick={(e) => {
                    handleToggleMenu();
                    if (onOpenAdmin) {
                      e.preventDefault();
                      onOpenAdmin();
                    }
                  }}
                  style={{ color: '#ffffff' }}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-white/30 text-white font-mono text-xs uppercase tracking-wider text-center hover:bg-white/10"
                >
                  <ShieldCheck size={14} />
                  <span>Admin</span>
                </a>
              </div>

              {/* Auth actions in mobile drawer */}
              <div className="pt-3 grid grid-cols-1 gap-2">
                {user ? (
                  <>
                    <a
                      href="/dashboard"
                      onClick={handleToggleMenu}
                      className="flex items-center justify-center gap-2 py-3 px-4 border border-white/30 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/10"
                    >
                      <LayoutDashboard size={14} strokeWidth={1.5} />
                      <span>Dashboard — {user.name}</span>
                    </a>
                    {onLogout && (
                      <button
                        onClick={() => { handleToggleMenu(); onLogout(); }}
                        className="flex items-center justify-center gap-2 py-3 px-4 text-[#9a9a9a] font-mono text-xs uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                      >
                        <LogOut size={14} strokeWidth={1.5} />
                        <span>Keluar</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/login"
                      onClick={handleToggleMenu}
                      className="flex items-center justify-center gap-2 py-3 px-4 border border-white/30 text-white font-mono text-xs uppercase tracking-wider hover:bg-white/10"
                    >
                      <User size={14} strokeWidth={1.5} />
                      <span>Masuk</span>
                    </a>
                    <a
                      href="/register"
                      onClick={handleToggleMenu}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-[#171717] font-mono text-xs uppercase tracking-wider hover:bg-neutral-200"
                    >
                      Daftar
                    </a>
                  </div>
                )}
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



