import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Ticket, ShieldCheck, ChevronRight, User, LogOut, LayoutDashboard, Search } from 'lucide-react';
import type { UserRecord } from './data';

interface HeaderProps {
  isScrolled?: boolean;
  isMenuOpen?: boolean;
  ordersCount?: number;
  user?: UserRecord | null;
  onToggleMenu?: () => void;
  onOpenOrders?: () => void;
  onLogout?: () => void;
}

const mainNavItems = [
  { label: 'Jadwal Konser', href: '/events' },
  { label: 'Cek E-Ticket', href: '/redeem' },
  { label: 'Bantuan & Refund', href: '/refund' },
];

const BrandMark: React.FC = () => (
  <a
    href="/"
    aria-label="SymphoniaTic - Beranda"
    className="group flex items-center gap-3 cursor-pointer no-underline rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12]"
  >
    <span className="flex flex-col leading-none">
      <span className="text-[17px] font-bold tracking-[-0.03em] uppercase text-white">
        SymphoniaTic
      </span>
      <span className="mt-1 text-[10px] font-medium tracking-[0.22em] uppercase text-[#A1A1AA]">
        Concert Ticketing
      </span>
    </span>
  </a>
);

const SearchPill: React.FC<{ light?: boolean; className?: string; onNavigate?: () => void }> = ({
  light,
  className = '',
  onNavigate,
}) => {
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
      className={`group flex items-center rounded-lg transition-colors ${className} ${
        light
          ? 'bg-[#14161F]/90 border border-white/25 focus-within:border-white focus-within:ring-2 focus-within:ring-white/25'
          : 'bg-[#14161F] border border-[#3E4357] focus-within:border-white focus-within:ring-2 focus-within:ring-white/25'
      }`}
    >
      <button type="submit" aria-label="Cari konser" className="min-h-[42px] pl-3.5 pr-1.5 flex items-center">
        <Search
          size={16}
          strokeWidth={2}
          className="text-[#A1A1AA] group-focus-within:text-white transition-colors"
          aria-hidden="true"
        />
      </button>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari konser, artis, venue"
        aria-label="Cari konser, artis, atau venue"
        className="bg-transparent py-2 pr-3.5 text-sm text-white placeholder-[#94A3B8] outline-none truncate min-w-0 flex-1 focus-visible:ring-0"
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
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleToggleMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, handleToggleMenu]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
          scrolled
            ? 'bg-[#0C0D12]/95 backdrop-blur-md border-b border-[#272A38] py-2.5'
            : 'bg-gradient-to-b from-[#0C0D12]/90 via-[#0C0D12]/55 to-transparent py-3.5 md:py-4'
        }`}
      >
        <div className="flex items-center justify-between gap-4 sm:gap-6 mx-auto max-w-[1440px] px-4 sm:px-8 md:px-12">
          <BrandMark />

          <nav className="hidden lg:flex items-center gap-8" aria-label="Navigasi utama">
            {mainNavItems.map((item) => {
              const isActive =
                currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
              return (
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-2.5 text-sm tracking-[-0.01em] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12] ${
                    isActive
                      ? 'font-semibold text-white'
                      : 'font-medium text-[#D4D4D8] hover:text-white'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-1 left-0 h-[2px] rounded-full bg-white transition-all duration-200 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="hidden sm:block">
              <SearchPill light={!scrolled} className="w-40 md:w-48 focus-within:w-60 md:focus-within:w-72" />
            </div>

            {ordersCount > 0 && (
              <button
                type="button"
                onClick={onOpenOrders}
                title="Tiket Saya"
                className="relative hidden sm:inline-flex items-center gap-1.5 min-h-[42px] rounded-lg px-3.5 py-2 text-sm font-medium bg-[#14161F] border border-[#3E4357] text-white hover:bg-white hover:text-[#0C0D12] transition-colors"
              >
                <Ticket size={15} strokeWidth={2} aria-hidden="true" />
                <span>Tiket</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-[#0C0D12]">
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
                    className="min-h-[42px] inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#D4D4D8] hover:text-white hover:bg-[#14161F] transition-colors"
                  >
                    <ShieldCheck size={15} strokeWidth={2} aria-hidden="true" />
                    <span>Admin</span>
                  </a>
                )}
                <a
                  href="/dashboard"
                  title="Dashboard"
                  className="min-h-[42px] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-[#14161F] border border-[#3E4357] text-white hover:border-white/60 transition-colors"
                >
                  <LayoutDashboard size={15} strokeWidth={2} className="text-white" aria-hidden="true" />
                  <span className="max-w-[96px] truncate">{user.name}</span>
                </a>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Keluar"
                    aria-label="Keluar dari akun"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#14161F] border border-[#3E4357] text-[#E4E4E7] hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                  >
                    <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/login"
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-[#E4E4E7] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <User size={15} strokeWidth={2} aria-hidden="true" />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  className="min-h-[42px] inline-flex items-center gap-1.5 rounded-lg bg-white hover:bg-neutral-200 text-[#0C0D12] px-4 py-2 text-sm font-semibold transition-colors"
                >
                  <span>Daftar</span>
                  <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleMenu}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className="lg:hidden h-11 min-w-[44px] px-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#14161F] border border-[#3E4357] text-white hover:border-white transition-colors"
            >
              {menuOpen ? <X size={19} strokeWidth={2} aria-hidden="true" /> : <Menu size={19} strokeWidth={2} aria-hidden="true" />}
              <span className="text-xs font-medium sm:inline hidden">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi seluler"
          className="fixed inset-0 z-50 bg-[#0C0D12] text-[#F4F4F6] flex flex-col lg:hidden overflow-y-auto"
        >
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#272A38]">
            <BrandMark />
            <button
              type="button"
              onClick={handleToggleMenu}
              aria-label="Tutup menu"
              className="h-11 w-11 flex items-center justify-center rounded-lg bg-[#14161F] border border-[#3E4357] text-white hover:bg-white hover:text-[#0C0D12] transition-colors"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 sm:px-8 pt-5 pb-4">
            <SearchPill light={false} className="w-full" onNavigate={handleToggleMenu} />
            <p className="mt-2 text-xs text-[#A1A1AA] font-normal">
              Cari konser, artis, atau venue favorit Anda.
            </p>
          </div>

          <nav className="flex flex-col px-5 sm:px-8 py-3" aria-label="Navigasi menu seluler">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-2 px-1">
              Navigasi Utama
            </span>
            {mainNavItems.map((item, idx) => {
              const isActive =
                currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href));
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={handleToggleMenu}
                  className={`group flex items-center justify-between min-h-[52px] rounded-xl px-4 py-3.5 my-1 transition-colors ${
                    isActive
                      ? 'bg-[#14161F] border border-white/40 text-white'
                      : 'text-white hover:bg-[#14161F] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-4 text-base font-semibold tracking-tight">
                    <span className="font-mono text-xs font-bold text-[#A1A1AA]">
                      0{idx + 1}
                    </span>
                    {item.label}
                  </span>
                  <ChevronRight size={18} strokeWidth={1.8} className="text-[#A1A1AA]" aria-hidden="true" />
                </a>
              );
            })}
          </nav>

          <div className="px-5 sm:px-8 mt-4">
            {user ? (
              <div className="grid gap-3">
                <a
                  href="/dashboard"
                  onClick={handleToggleMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#14161F] border border-[#3E4357] text-white py-3.5 text-sm font-semibold hover:border-white/60 transition-colors min-h-[48px]"
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
                    className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 py-3.5 text-sm font-semibold hover:bg-rose-500/20 transition-colors min-h-[48px]"
                  >
                    <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                    <span>Keluar</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                <a
                  href="/login"
                  onClick={handleToggleMenu}
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#3E4357] text-white bg-[#14161F] py-3.5 text-sm font-semibold hover:border-white/60 transition-colors min-h-[48px]"
                >
                  <User size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  onClick={handleToggleMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-neutral-200 text-[#0C0D12] py-3.5 text-sm font-bold transition-colors min-h-[48px]"
                >
                  <span>Daftar</span>
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="px-5 sm:px-8 mt-4">
              <a
                href="/admin"
                onClick={handleToggleMenu}
                className="flex items-center justify-between rounded-lg border border-[#3E4357] bg-[#14161F] px-4 py-3.5 text-sm font-semibold text-white hover:border-white/60 transition-colors min-h-[48px]"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Portal Admin</span>
                </span>
                <ChevronRight size={16} className="text-[#A1A1AA]" aria-hidden="true" />
              </a>
            </div>
          )}

          <div className="px-5 sm:px-8 pt-8 pb-10 mt-auto text-xs text-[#A1A1AA] flex flex-col gap-1.5 border-t border-[#272A38]">
            <p className="m-0">&copy; {new Date().getFullYear()} SymphoniaTic Official Concert Booking Platform.</p>
            <p className="text-[11px] tracking-[0.16em] text-[#A1A1AA] font-semibold uppercase m-0">
              Harmoni Nusantara
            </p>
          </div>
        </div>
      )}
    </>
  );
};
