import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  Ticket,
  ShieldCheck,
  ChevronRight,
  User,
  LogOut,
  LayoutDashboard,
  Search,
} from 'lucide-react';
import type { UserRecord } from './data';

interface HeaderProps {
  isScrolled?: boolean;
  isMenuOpen?: boolean;
  ordersCount?: number;
  user?: UserRecord | null;
  onToggleMenu?: () => void;
  onOpenOrders?: () => void;
  onLogout?: () => void;
  variant?: 'solid' | 'overlay';
}

const mainNavItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Jadwal Konser', href: '/events' },
  { label: 'Cek E-Ticket', href: '/redeem' },
  { label: 'Edukasi', href: '/edukasi' },
  { label: 'Refund', href: '/refund' },
];

const BrandMark: React.FC<{ onDark?: boolean }> = ({ onDark = false }) => (
  <a
    href="/"
    aria-label="SymphoniaTic - Beranda"
    className={`group inline-flex items-center gap-2.5 cursor-pointer no-underline py-1 focus-visible:outline-none focus-visible:ring-2 ${
      onDark
        ? 'focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]'
        : 'focus-visible:ring-[#141413] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F3EF]'
    }`}
  >
    <span
      className={`font-display text-xl sm:text-2xl font-extrabold tracking-[-0.04em] leading-none transition-colors ${
        onDark ? 'text-[#F4F3EF]' : 'text-[#141413]'
      }`}
    >
      SymphoniaTic
      <span className={onDark ? 'text-[#D4FF2A]' : 'text-[#141413]'}>.</span>
    </span>
    <span
      className={`hidden sm:inline-block border-l pl-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase ${
        onDark ? 'border-white/25 text-[#D8D6CE]' : 'border-[#DFDDD6] text-[#52514D]'
      }`}
    >
      ID
    </span>
  </a>
);

const SearchPill: React.FC<{
  className?: string;
  onDark?: boolean;
  onNavigate?: () => void;
  autoFocus?: boolean;
}> = ({ className = '', onDark = false, onNavigate, autoFocus = false }) => {
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
      className={`group flex h-11 items-center rounded-none border transition-colors ${
        onDark
          ? 'bg-[#1C1C1A]/90 border-white/25 focus-within:border-[#D4FF2A]'
          : 'bg-white border-[#DFDDD6] focus-within:border-[#141413]'
      } ${className}`}
    >
      <button
        type="submit"
        aria-label="Cari konser"
        className={`h-11 pl-3 pr-1.5 flex items-center transition-colors ${
          onDark
            ? 'text-[#D8D6CE] group-focus-within:text-[#D4FF2A]'
            : 'text-[#6E6D68] group-focus-within:text-[#141413]'
        }`}
      >
        <Search size={14} strokeWidth={2} aria-hidden="true" />
      </button>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari konser..."
        aria-label="Cari konser, artis, atau venue"
        autoFocus={autoFocus}
        className={`bg-transparent py-2 pr-3 text-xs font-medium outline-none truncate min-w-0 flex-1 ${
          onDark
            ? 'text-[#F4F3EF] placeholder-[#B8B6AE]'
            : 'text-[#141413] placeholder-[#6E6D68]'
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
  onOpenOrders,
  onLogout,
  variant = 'solid',
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
      const handleScroll = () => {
        setInternalScrolled(window.scrollY > 36);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrolled = isScrolled !== undefined ? isScrolled : internalScrolled;
  const menuOpen = isMenuOpen !== undefined ? isMenuOpen : internalMenuOpen;
  const handleToggleMenu = onToggleMenu || (() => setInternalMenuOpen((prev) => !prev));
  const onDarkHero = variant === 'overlay' && !scrolled;

  useEffect(() => {
    if (menuOpen && searchOpen) {
      setSearchOpen(false);
    }
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (menuOpen) handleToggleMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, searchOpen, handleToggleMenu]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-[64px] flex items-center transition-colors duration-200 border-b ${
          onDarkHero
            ? 'bg-[#141413]/75 backdrop-blur-sm border-white/15 text-[#F4F3EF]'
            : 'bg-[#F4F3EF] border-[#DFDDD6] text-[#141413]'
        }`}
      >
        <div className="w-full flex items-center justify-between gap-4 mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
          <BrandMark onDark={onDarkHero} />

          <nav className="hidden lg:flex items-center gap-5 xl:gap-6" aria-label="Navigasi utama">
            {mainNavItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? currentPath === '/'
                  : currentPath === item.href || currentPath.startsWith(item.href);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-2 text-xs uppercase tracking-[0.12em] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    onDarkHero
                      ? isActive
                        ? 'text-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                        : 'text-[#D8D6CE] hover:text-[#F4F3EF] focus-visible:ring-[#D4FF2A]'
                      : isActive
                      ? 'text-[#141413] focus-visible:ring-[#141413]'
                      : 'text-[#52514D] hover:text-[#141413] focus-visible:ring-[#141413]'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] transition-all duration-150 ${
                      onDarkHero ? 'bg-[#D4FF2A]' : 'bg-[#141413]'
                    } ${isActive ? 'w-full' : 'w-0'}`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <SearchPill className="w-48 2xl:w-56" onDark={onDarkHero} />
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-expanded={searchOpen}
              aria-label={searchOpen ? 'Tutup pencarian konser' : 'Buka pencarian konser'}
              className={`xl:hidden inline-flex h-11 w-11 items-center justify-center rounded-none border transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                onDarkHero
                  ? searchOpen
                    ? 'bg-[#D4FF2A] border-[#D4FF2A] text-[#141413] focus-visible:ring-[#D4FF2A]'
                    : 'bg-[#1C1C1A] border-white/25 text-[#F4F3EF] hover:border-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                  : searchOpen
                  ? 'bg-[#141413] border-[#141413] text-[#D4FF2A] focus-visible:ring-[#141413]'
                  : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
              }`}
            >
              {searchOpen ? (
                <X size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Search size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>

            {ordersCount > 0 && onOpenOrders && (
              <button
                type="button"
                onClick={onOpenOrders}
                title="Tiket Saya"
                className={`relative hidden sm:inline-flex items-center gap-1.5 min-h-[44px] rounded-none px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                  onDarkHero
                    ? 'bg-[#1C1C1A] border-white/25 text-[#F4F3EF] hover:border-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                    : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
                }`}
              >
                <Ticket
                  size={14}
                  strokeWidth={2}
                  className={onDarkHero ? 'text-[#D4FF2A]' : 'text-[#141413]'}
                  aria-hidden="true"
                />
                <span>Tiket</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-none bg-[#D4FF2A] px-1.5 text-[11px] font-bold text-[#141413] tabular-nums">
                  {ordersCount}
                </span>
              </button>
            )}

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <a
                    href="/admin"
                    title="Portal Admin"
                    className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-none px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      onDarkHero
                        ? 'text-[#D8D6CE] hover:text-[#D4FF2A]'
                        : 'text-[#52514D] hover:text-[#141413] hover:bg-[#EAE8E1]'
                    }`}
                  >
                    <ShieldCheck size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Admin</span>
                  </a>
                )}
                <a
                  href="/dashboard"
                  title="Dashboard"
                  className={`min-h-[44px] inline-flex items-center gap-2 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wider border transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    onDarkHero
                      ? 'bg-[#1C1C1A] border-white/25 text-[#F4F3EF] hover:border-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                      : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
                  }`}
                >
                  <LayoutDashboard size={14} strokeWidth={2} aria-hidden="true" />
                  <span className="max-w-[96px] truncate">{user.name}</span>
                </a>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Keluar"
                    aria-label="Keluar dari akun"
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-none border transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                      onDarkHero
                        ? 'bg-[#1C1C1A] border-white/25 text-[#D8D6CE] hover:text-white hover:border-[#C81E1E] focus-visible:ring-[#D4FF2A]'
                        : 'bg-white border-[#DFDDD6] text-[#52514D] hover:text-[#C81E1E] hover:border-[#C81E1E] focus-visible:ring-[#141413]'
                    }`}
                  >
                    <LogOut size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/login"
                  className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-none border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    onDarkHero
                      ? 'bg-[#1C1C1A] border-white/25 text-[#F4F3EF] hover:border-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                      : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
                  }`}
                >
                  <User size={14} strokeWidth={2} aria-hidden="true" />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-none border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                    onDarkHero
                      ? 'bg-[#D4FF2A] border-[#D4FF2A] text-[#141413] hover:bg-[#C2EE1A] focus-visible:ring-[#D4FF2A]'
                      : 'bg-[#141413] border-[#141413] text-[#F4F3EF] hover:bg-[#2A2A28] focus-visible:ring-[#141413]'
                  }`}
                >
                  <span>Daftar</span>
                  <ArrowUpRight size={14} strokeWidth={2.2} aria-hidden="true" />
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleMenu}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className={`lg:hidden h-11 min-w-[44px] px-3 flex items-center justify-center gap-1.5 rounded-none border transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                onDarkHero
                  ? 'bg-[#1C1C1A] border-white/25 text-[#F4F3EF] hover:border-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                  : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
              }`}
            >
              {menuOpen ? (
                <X size={19} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Menu size={19} strokeWidth={2} aria-hidden="true" />
              )}
              <span className="text-xs font-semibold sm:inline hidden">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          role="region"
          aria-label="Panel pencarian konser"
          className={`fixed top-[64px] left-0 right-0 z-30 border-b xl:hidden ${
            onDarkHero
              ? 'bg-[#141413] border-white/20'
              : 'bg-[#F4F3EF] border-[#DFDDD6]'
          }`}
        >
          <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 py-3 flex items-center gap-2">
            <SearchPill
              autoFocus
              className="flex-1"
              onDark={onDarkHero}
              onNavigate={() => setSearchOpen(false)}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Tutup pencarian"
              className={`h-11 px-4 rounded-none border text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                onDarkHero
                  ? 'bg-[#1C1C1A] border-white/25 text-[#F4F3EF] hover:border-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                  : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
              }`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi seluler"
          className="fixed inset-0 z-50 bg-[#F4F3EF] text-[#141413] flex flex-col lg:hidden overflow-y-auto"
        >
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#DFDDD6] bg-white">
            <BrandMark />
            <button
              type="button"
              onClick={handleToggleMenu}
              aria-label="Tutup menu"
              className="h-11 w-11 flex items-center justify-center rounded-none bg-[#F4F3EF] border border-[#DFDDD6] text-[#141413] hover:border-[#141413] transition-colors"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 sm:px-8 pt-5 pb-4 border-b border-[#DFDDD6]">
            <SearchPill className="w-full" onNavigate={handleToggleMenu} />
            <p className="mt-2 text-xs text-[#6E6D68] mb-0">
              Cari konser, orkestra, atau gedung pertunjukan.
            </p>
          </div>

          <nav className="flex flex-col px-5 sm:px-8 py-4" aria-label="Navigasi menu seluler">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#52514D] mb-2">
              • Navigasi Utama
            </span>
            <div className="border-t border-[#DFDDD6]">
              {mainNavItems.map((item, idx) => {
                const isActive =
                  item.href === '/'
                    ? currentPath === '/'
                    : currentPath === item.href || currentPath.startsWith(item.href);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={handleToggleMenu}
                    className={`flex items-center justify-between min-h-[52px] px-3 py-3 transition-colors border-b border-[#DFDDD6] ${
                      isActive
                        ? 'bg-[#D4FF2A] text-[#141413]'
                        : 'text-[#141413] hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-4 text-base font-bold tracking-tight">
                      <span className="font-mono text-xs font-bold text-[#141413]">
                        0{idx + 1}
                      </span>
                      {item.label}
                    </span>
                    <ChevronRight size={18} strokeWidth={1.8} className="text-[#141413]" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </nav>

          <div className="px-5 sm:px-8 mt-2">
            {user ? (
              <div className="grid gap-2.5">
                <a
                  href="/dashboard"
                  onClick={handleToggleMenu}
                  className="flex items-center justify-center gap-2 rounded-none bg-white border border-[#141413] text-[#141413] py-3.5 text-sm font-semibold hover:bg-[#141413] hover:text-[#F4F3EF] transition-colors min-h-[48px]"
                >
                  <LayoutDashboard size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Dashboard ({user.name})</span>
                </a>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleMenu();
                      onLogout();
                    }}
                    className="flex items-center justify-center gap-2 rounded-none border border-[#C81E1E] bg-[#C81E1E]/10 text-[#C81E1E] py-3.5 text-sm font-semibold hover:bg-[#C81E1E]/15 transition-colors min-h-[48px]"
                  >
                    <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-2.5">
                <a
                  href="/login"
                  onClick={handleToggleMenu}
                  className="flex items-center justify-center gap-2 rounded-none border border-[#141413] text-[#141413] bg-white py-3.5 text-sm font-semibold hover:bg-[#EAE8E1] transition-colors min-h-[48px]"
                >
                  <User size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  onClick={handleToggleMenu}
                  className="flex items-center justify-center gap-2 rounded-none bg-[#141413] hover:bg-[#2A2A28] text-[#D4FF2A] py-3.5 text-sm font-semibold transition-colors min-h-[48px]"
                >
                  <span>Daftar</span>
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="px-5 sm:px-8 mt-3">
              <a
                href="/admin"
                onClick={handleToggleMenu}
                className="flex items-center justify-between rounded-none border border-[#DFDDD6] bg-white px-4 py-3.5 text-sm font-semibold text-[#141413] hover:border-[#141413] transition-colors min-h-[48px]"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Portal Admin</span>
                </span>
                <ChevronRight size={16} className="text-[#6E6D68]" aria-hidden="true" />
              </a>
            </div>
          )}

          <div className="px-5 sm:px-8 pt-8 pb-10 mt-auto text-xs text-[#52514D] flex flex-col gap-1 border-t border-[#DFDDD6]">
            <p className="m-0">&copy; {new Date().getFullYear()} SymphoniaTic Production.</p>
            <p className="text-[11px] tracking-[0.16em] text-[#141413] font-bold uppercase m-0">
              Harmoni Nusantara
            </p>
          </div>
        </div>
      )}
    </>
  );
};
