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
}

const mainNavItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Jadwal Konser', href: '/events' },
  { label: 'Cek E-Ticket', href: '/redeem' },
  { label: 'Edukasi', href: '/edukasi' },
  { label: 'Refund', href: '/refund' },
];

const BrandMark: React.FC = () => (
  <a
    href="/"
    aria-label="SymphoniaTic - Beranda"
    className="group flex items-center gap-3 cursor-pointer no-underline rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE]"
  >
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171614] text-[#F6F4EE] font-display text-lg font-semibold tracking-tight transition-colors group-hover:bg-[#C93018]">
      S
    </span>
    <span className="flex flex-col leading-none">
      <span className="font-display text-xl font-semibold tracking-[-0.02em] text-[#171614]">
        SymphoniaTic
      </span>
      <span className="mt-0.5 text-[10px] font-medium tracking-[0.2em] uppercase text-[#6B665D]">
        Harmoni Nusantara
      </span>
    </span>
  </a>
);

const SearchPill: React.FC<{ className?: string; onNavigate?: () => void }> = ({
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
      className={`group flex items-center rounded-lg bg-white border border-[#CFC9BC] focus-within:border-[#C93018] focus-within:ring-2 focus-within:ring-[#C93018]/20 transition-colors ${className}`}
    >
      <button
        type="submit"
        aria-label="Cari konser"
        className="min-h-[40px] pl-3 pr-1.5 flex items-center text-[#6B665D] group-focus-within:text-[#C93018] transition-colors"
      >
        <Search size={15} strokeWidth={2} aria-hidden="true" />
      </button>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari konser..."
        aria-label="Cari konser, artis, atau venue"
        className="bg-transparent py-2 pr-3 text-sm text-[#171614] placeholder-[#6B665D] outline-none truncate min-w-0 flex-1"
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
        setInternalScrolled(window.scrollY > 24);
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
        className={`fixed top-0 left-0 right-0 z-40 h-[68px] flex items-center transition-colors duration-200 border-b ${
          scrolled
            ? 'bg-[#F6F4EE]/95 backdrop-blur-md border-[#E4DFD3]'
            : 'bg-[#F6F4EE] border-[#E4DFD3]/80'
        }`}
      >
        <div className="w-full flex items-center justify-between gap-4 mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
          <BrandMark />

          <nav className="hidden lg:flex items-center gap-7" aria-label="Navigasi utama">
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
                  className={`relative py-2.5 text-sm transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE] ${
                    isActive
                      ? 'font-semibold text-[#171614]'
                      : 'font-medium text-[#5C5850] hover:text-[#171614]'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-1 left-0 h-[2px] bg-[#C93018] transition-all duration-200 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <div className="hidden xl:block">
              <SearchPill className="w-48 2xl:w-60" />
            </div>

            {ordersCount > 0 && onOpenOrders && (
              <button
                type="button"
                onClick={onOpenOrders}
                title="Tiket Saya"
                className="relative hidden sm:inline-flex items-center gap-1.5 min-h-[44px] rounded-lg px-3.5 py-2 text-sm font-medium bg-white border border-[#CFC9BC] text-[#171614] hover:border-[#171614] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
              >
                <Ticket size={15} strokeWidth={2} className="text-[#C93018]" aria-hidden="true" />
                <span>Tiket</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C93018] px-1.5 text-[11px] font-bold text-white tabular-nums">
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
                    className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#5C5850] hover:text-[#171614] hover:bg-[#ECE8DF] transition-colors"
                  >
                    <ShieldCheck size={15} strokeWidth={2} aria-hidden="true" />
                    <span>Admin</span>
                  </a>
                )}
                <a
                  href="/dashboard"
                  title="Dashboard"
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-white border border-[#CFC9BC] text-[#171614] hover:border-[#171614] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
                >
                  <LayoutDashboard size={15} strokeWidth={2} aria-hidden="true" />
                  <span className="max-w-[96px] truncate">{user.name}</span>
                </a>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Keluar"
                    aria-label="Keluar dari akun"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white border border-[#CFC9BC] text-[#5C5850] hover:text-[#B91C1C] hover:border-[#B91C1C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
                  >
                    <LogOut size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <a
                  href="/login"
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-[#5C5850] hover:text-[#171614] hover:bg-[#ECE8DF]/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
                >
                  <User size={15} strokeWidth={2} aria-hidden="true" />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-[#171614] hover:bg-[#C93018] text-white px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
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
              className="lg:hidden h-11 min-w-[44px] px-3 flex items-center justify-center gap-1.5 rounded-lg bg-white border border-[#CFC9BC] text-[#171614] hover:border-[#171614] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
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

      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi seluler"
          className="fixed inset-0 z-50 bg-[#F6F4EE] text-[#171614] flex flex-col lg:hidden overflow-y-auto"
        >
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#E4DFD3] bg-white">
            <BrandMark />
            <button
              type="button"
              onClick={handleToggleMenu}
              aria-label="Tutup menu"
              className="h-11 w-11 flex items-center justify-center rounded-lg bg-[#F6F4EE] border border-[#CFC9BC] text-[#171614] hover:border-[#171614] transition-colors"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="px-5 sm:px-8 pt-5 pb-4">
            <SearchPill className="w-full" onNavigate={handleToggleMenu} />
            <p className="mt-2 text-xs text-[#6B665D]">
              Cari konser, orkestra, atau gedung pertunjukan.
            </p>
          </div>

          <nav className="flex flex-col px-5 sm:px-8 py-2" aria-label="Navigasi menu seluler">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B665D] mb-2 px-1">
              Navigasi Utama
            </span>
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
                  className={`flex items-center justify-between min-h-[52px] rounded-xl px-4 py-3 my-1 transition-colors border ${
                    isActive
                      ? 'bg-white border-[#C93018] text-[#171614]'
                      : 'text-[#171614] hover:bg-white border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-4 text-base font-semibold tracking-tight">
                    <span className="font-mono text-xs font-bold text-[#C93018]">
                      0{idx + 1}
                    </span>
                    {item.label}
                  </span>
                  <ChevronRight size={18} strokeWidth={1.8} className="text-[#6B665D]" aria-hidden="true" />
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
                  className="flex items-center justify-center gap-2 rounded-lg bg-white border border-[#CFC9BC] text-[#171614] py-3.5 text-sm font-semibold hover:border-[#171614] transition-colors min-h-[48px]"
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
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#B91C1C]/30 bg-[#B91C1C]/10 text-[#B91C1C] py-3.5 text-sm font-semibold hover:bg-[#B91C1C]/15 transition-colors min-h-[48px]"
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
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#CFC9BC] text-[#171614] bg-white py-3.5 text-sm font-semibold hover:border-[#171614] transition-colors min-h-[48px]"
                >
                  <User size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Masuk</span>
                </a>
                <a
                  href="/register"
                  onClick={handleToggleMenu}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#C93018] hover:bg-[#A82511] text-white py-3.5 text-sm font-semibold transition-colors min-h-[48px]"
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
                className="flex items-center justify-between rounded-lg border border-[#CFC9BC] bg-white px-4 py-3.5 text-sm font-semibold text-[#171614] hover:border-[#171614] transition-colors min-h-[48px]"
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck size={16} strokeWidth={2} aria-hidden="true" />
                  <span>Portal Admin</span>
                </span>
                <ChevronRight size={16} className="text-[#6B665D]" aria-hidden="true" />
              </a>
            </div>
          )}

          <div className="px-5 sm:px-8 pt-8 pb-10 mt-auto text-xs text-[#6B665D] flex flex-col gap-1.5 border-t border-[#E4DFD3]">
            <p className="m-0">&copy; {new Date().getFullYear()} SymphoniaTic Production. Hak cipta dilindungi.</p>
            <p className="text-[11px] tracking-[0.16em] text-[#5C5850] font-semibold uppercase m-0">
              Harmoni Nusantara
            </p>
          </div>
        </div>
      )}
    </>
  );
};
