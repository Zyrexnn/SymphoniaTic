import React, { useEffect } from 'react';
import {
  BarChart3, Ticket, Layers, ExternalLink, LogOut, RefreshCw, Menu, X, RotateCcw, ChevronRight, QrCode
} from 'lucide-react';
import { formatIDR, type AdminRole } from '../landing/data';

export type TabId = 'METRICS' | 'EVENTS' | 'ORDERS' | 'REFUNDS' | 'SCANNER';

interface AdminSidebarProps {
  activeTab: TabId;
  role?: AdminRole;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  eventsCount: number;
  ordersCount: number;
  refundsCount?: number;
  totalRevenue: number;
}

const ALL_NAV_ITEMS: { id: TabId; label: string; shortLabel: string; icon: typeof BarChart3; roles: AdminRole[]; group: 'GATE' | 'OPERASI' }[] = [
  { id: 'SCANNER', label: 'Scanner Gate Masuk', shortLabel: 'Scan Gate', icon: QrCode, roles: ['ADMIN', 'PETUGAS'], group: 'GATE' },
  { id: 'ORDERS', label: 'Manajemen Pesanan', shortLabel: 'Pesanan', icon: Layers, roles: ['ADMIN', 'PETUGAS'], group: 'GATE' },
  { id: 'METRICS', label: 'Metrik & Finansial', shortLabel: 'Metrik', icon: BarChart3, roles: ['ADMIN'], group: 'OPERASI' },
  { id: 'EVENTS', label: 'Postingan Konser', shortLabel: 'Konser', icon: Ticket, roles: ['ADMIN'], group: 'OPERASI' },
  { id: 'REFUNDS', label: 'Permohonan Refund', shortLabel: 'Refund', icon: RotateCcw, roles: ['ADMIN'], group: 'OPERASI' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab, role = 'ADMIN', onTabChange, onLogout, eventsCount, ordersCount, refundsCount, totalRevenue,
}) => {
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const gateItems = visibleNavItems.filter((i) => i.group === 'GATE');
  const opsItems = visibleNavItems.filter((i) => i.group === 'OPERASI');

  const renderNavItem = (item: (typeof ALL_NAV_ITEMS)[number]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const badge = item.id === 'EVENTS' ? `${eventsCount}`
      : item.id === 'ORDERS' ? `${ordersCount}`
      : item.id === 'REFUNDS' ? `${refundsCount || 0}`
      : item.id === 'METRICS' && totalRevenue ? formatIDR(totalRevenue) : '';

    return (
      <button
        key={item.id}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onTabChange(item.id)}
        className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-left transition-colors rounded-lg border ${
          isActive
            ? 'text-white bg-[#1D202D] border-white/40 font-semibold'
            : 'text-[#A1A1AA] bg-transparent border-transparent hover:text-white hover:bg-[#14161F]'
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <Icon size={17} strokeWidth={1.7} className={isActive ? 'text-white shrink-0' : 'text-[#A1A1AA] shrink-0'} aria-hidden="true" />
          <span className="truncate">{item.label}</span>
        </span>
        {badge && (
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded shrink-0 ${
            isActive ? 'text-[#0C0D12] bg-white font-semibold' : 'text-[#E4E4E7] bg-[#14161F] border border-[#272A38]'
          }`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="hidden md:flex flex-col justify-between h-screen w-68 border-r border-[#272A38] bg-[#0C0D12] p-5 shrink-0 sticky top-0">
      <div className="space-y-6">
        <a href="/" className="flex items-center gap-3 px-2 py-1 no-underline group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <div className="w-10 h-10 border border-[#3E4357] bg-[#14161F] rounded-lg flex items-center justify-center group-hover:border-white transition-colors">
            <span className="text-sm font-bold text-white tracking-[0.1em]">S</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-white tracking-tight block">SymphoniaTic</span>
            <span className="text-[11px] font-medium text-[#A1A1AA] tracking-wider uppercase block">
              {role === 'PETUGAS' ? 'Gate Officer' : 'Admin Portal'}
            </span>
          </div>
        </a>

        <nav className="space-y-5" aria-label="Navigasi panel admin">
          {gateItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase mb-2">
                {role === 'PETUGAS' ? 'Menu Petugas Gate' : 'Operasional Gate & Order'}
              </p>
              {gateItems.map(renderNavItem)}
            </div>
          )}

          {opsItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-[#94A3B8] tracking-wider uppercase mb-2">
                Manajemen &amp; Keuangan
              </p>
              {opsItems.map(renderNavItem)}
            </div>
          )}
        </nav>
      </div>

      <div className="border-t border-[#272A38] pt-4 space-y-1.5">
        <a
          href="/"
          className="min-h-[44px] flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-[#A1A1AA] no-underline hover:text-white transition-colors rounded-lg hover:bg-[#14161F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex items-center gap-2.5"><ExternalLink size={15} strokeWidth={1.6} aria-hidden="true" /> Web Utama</span>
          <ChevronRight size={15} strokeWidth={1.6} className="text-[#94A3B8]" aria-hidden="true" />
        </a>

        <button
          type="button"
          onClick={onLogout}
          className="min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-rose-300 hover:text-rose-200 bg-transparent border border-transparent hover:border-rose-500/30 w-full text-left transition-colors rounded-lg hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <LogOut size={15} strokeWidth={1.6} aria-hidden="true" />
          <span>Keluar Sesi Admin</span>
        </button>
      </div>
    </aside>
  );
};

interface MobileHeaderProps {
  activeTab: TabId;
  role?: AdminRole;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab, role = 'ADMIN', onTabChange, onLogout, isOpen, onToggle, onRefresh, isLoading,
}) => {
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const currentItem = visibleNavItems.find((n) => n.id === activeTab) || visibleNavItems[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onToggle]);

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0C0D12] border-b border-[#272A38] sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg border border-[#3E4357] bg-[#14161F] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-white tracking-tight block truncate">SymphoniaTic</span>
            <span className="text-[11px] font-medium text-[#A1A1AA] uppercase block truncate">{currentItem.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            aria-label="Muat ulang data"
            className="h-11 w-11 inline-flex items-center justify-center bg-[#14161F] border border-[#3E4357] text-[#E4E4E7] hover:text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} strokeWidth={1.7} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="h-11 px-3 inline-flex items-center justify-center gap-1.5 bg-[#14161F] border border-[#3E4357] text-white rounded-lg text-xs font-medium transition-colors"
          >
            {isOpen ? <X size={16} strokeWidth={1.7} aria-hidden="true" /> : <Menu size={16} strokeWidth={1.7} aria-hidden="true" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi admin"
          className="md:hidden fixed inset-0 top-[69px] bg-[#0C0D12] z-50 p-5 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase mb-2">
              {role === 'PETUGAS' ? 'Navigasi Petugas Gate' : 'Navigasi Admin'}
            </p>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => { onTabChange(item.id); onToggle(); }}
                  className={`w-full min-h-[48px] flex items-center gap-3 px-4 py-3 text-sm font-medium text-left border rounded-xl transition-colors ${
                    isActive
                      ? 'text-white bg-[#1D202D] border-white font-semibold'
                      : 'text-[#A1A1AA] bg-[#14161F] border-[#272A38] hover:text-white'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.7} className={isActive ? 'text-white' : 'text-[#A1A1AA]'} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-[#272A38] space-y-3 pb-[env(safe-area-inset-bottom)]">
            <a
              href="/"
              className="min-h-[48px] flex items-center justify-between px-4 py-3 text-sm font-medium text-[#E4E4E7] hover:text-white no-underline border border-[#3E4357] rounded-xl bg-[#14161F]"
            >
              <span className="flex items-center gap-2"><ExternalLink size={16} strokeWidth={1.6} aria-hidden="true" /> Halaman Utama</span>
              <ChevronRight size={16} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => { onLogout(); onToggle(); }}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/35 rounded-xl hover:bg-rose-500/20"
            >
              <LogOut size={16} strokeWidth={1.6} aria-hidden="true" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const MobileBottomNav: React.FC<{
  activeTab: TabId;
  role?: AdminRole;
  onTabChange: (tab: TabId) => void;
}> = ({ activeTab, role = 'ADMIN', onTabChange }) => {
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav
      aria-label="Navigasi cepat admin"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0D12] border-t border-[#272A38] flex items-center justify-around py-1.5 px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))]"
    >
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange(item.id)}
            className={`min-h-[48px] min-w-[52px] flex flex-col items-center justify-center py-1.5 px-2.5 rounded-lg bg-transparent border-none transition-colors ${
              isActive ? 'text-white bg-[#14161F]' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
            <span className={`text-[11px] tracking-tight mt-1 ${isActive ? 'text-white font-semibold' : 'text-[#A1A1AA]'}`}>
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
