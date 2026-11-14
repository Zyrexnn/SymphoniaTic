import React from 'react';
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

const ALL_NAV_ITEMS: { id: TabId; label: string; shortLabel: string; icon: typeof BarChart3; roles: AdminRole[] }[] = [
  { id: 'SCANNER', label: 'Scanner Gate Masuk', shortLabel: 'Scan Gate', icon: QrCode, roles: ['ADMIN', 'PETUGAS'] },
  { id: 'ORDERS', label: 'Manajemen Pesanan', shortLabel: 'Pesanan', icon: Layers, roles: ['ADMIN', 'PETUGAS'] },
  { id: 'METRICS', label: 'Metrik & Finansial', shortLabel: 'Metrik', icon: BarChart3, roles: ['ADMIN'] },
  { id: 'EVENTS', label: 'Postingan Konser', shortLabel: 'Konser', icon: Ticket, roles: ['ADMIN'] },
  { id: 'REFUNDS', label: 'Permohonan Refund', shortLabel: 'Refund', icon: RotateCcw, roles: ['ADMIN'] },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab, role = 'ADMIN', onTabChange, onLogout, eventsCount, ordersCount, refundsCount, totalRevenue,
}) => {
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex flex-col justify-between h-screen w-64 border-r border-[#272A38] bg-[#0C0D12] p-6 shrink-0 sticky top-0">
      <div>
        <a href="/" className="flex items-center gap-3 px-1 mb-8 no-underline group">
          <div className="w-10 h-10 border border-[#272A38] bg-[#14161F] rounded-lg flex items-center justify-center group-hover:border-white/40 transition-colors">
            <span className="text-sm font-bold text-white tracking-[0.1em]">S</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-white tracking-tight block">SymphoniaTic</span>
            <span className="text-[9px] font-semibold text-[#A1A1AA] tracking-[0.18em] uppercase block">
              {role === 'PETUGAS' ? 'GATE OFFICER' : 'ADMIN PORTAL'}
            </span>
          </div>
        </a>

        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-medium text-[#71717A] tracking-[0.15em] uppercase mb-3">
            {role === 'PETUGAS' ? 'Menu Petugas Gate' : 'Menu Utama'}
          </p>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.id === 'EVENTS' ? `${eventsCount}`
              : item.id === 'ORDERS' ? `${ordersCount}`
              : item.id === 'REFUNDS' ? `${refundsCount || 0}`
              : item.id === 'METRICS' && totalRevenue ? formatIDR(totalRevenue) : '';

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-medium text-left transition-all duration-200 cursor-pointer rounded-lg border-none ${
                  isActive
                    ? 'text-white bg-[#14161F] border-l-2 border-white pl-3 font-semibold'
                    : 'text-[#A1A1AA] bg-transparent hover:text-white hover:bg-[#14161F]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={1.5} className={isActive ? 'text-white' : 'text-[#A1A1AA]'} />
                  <span>{item.label}</span>
                </div>
                {badge && (
                  <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded ${
                    isActive ? 'text-white bg-white/10 border border-white/20' : 'text-[#A1A1AA] bg-[#14161F] border border-[#272A38]'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#272A38] pt-4 space-y-1">
        <a
          href="/"
          className="flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium text-[#A1A1AA] no-underline hover:text-white transition-colors rounded-lg hover:bg-[#14161F]/50"
        >
          <span className="flex items-center gap-2.5"><ExternalLink size={14} strokeWidth={1.5} /> Web Utama</span>
          <ChevronRight size={14} strokeWidth={1.5} className="text-[#71717A]" />
        </a>

        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-rose-400 hover:text-rose-300 bg-transparent border-none cursor-pointer w-full text-left transition-colors rounded-lg hover:bg-rose-500/10"
        >
          <LogOut size={14} strokeWidth={1.5} />
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

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0C0D12]/95 backdrop-blur-md border-b border-[#272A38] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[#272A38] bg-[#14161F] flex items-center justify-center">
            <span className="text-xs font-bold text-white">S</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-white tracking-tight block">SymphoniaTic</span>
            <span className="text-[9px] font-medium text-[#A1A1AA] uppercase block">{currentItem.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-[#14161F] border border-[#272A38] text-[#A1A1AA] hover:text-white rounded-lg cursor-pointer active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={14} strokeWidth={1.5} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onToggle}
            className="p-2 bg-[#14161F] border border-[#272A38] text-white rounded-lg cursor-pointer active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-[#0C0D12]/98 backdrop-blur-xl z-50 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <p className="text-[10px] font-medium text-[#71717A] tracking-[0.2em] uppercase mb-2">
              {role === 'PETUGAS' ? 'Navigasi Petugas Gate' : 'Navigasi Admin'}
            </p>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); onToggle(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-left border rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'text-white bg-[#14161F] border-white/40 shadow-sm font-semibold'
                      : 'text-[#A1A1AA] bg-transparent border-[#272A38] hover:text-white'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} className={isActive ? 'text-white' : 'text-[#A1A1AA]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-[#272A38] space-y-3">
            <a
              href="/"
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#A1A1AA] hover:text-white no-underline border border-[#272A38] rounded-xl bg-[#14161F]"
            >
              <span className="flex items-center gap-2"><ExternalLink size={16} strokeWidth={1.5} /> Halaman Utama</span>
              <ChevronRight size={16} />
            </a>
            <button
              onClick={() => { onLogout(); onToggle(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl cursor-pointer hover:bg-rose-500/20"
            >
              <LogOut size={16} strokeWidth={1.5} />
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C0D12]/95 backdrop-blur-lg border-t border-[#272A38] flex items-center justify-around py-1.5 px-2">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 bg-transparent border-none cursor-pointer transition-all ${
              isActive ? 'text-white scale-105' : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Icon size={18} strokeWidth={isActive ? 2 : 1.25} />
            <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'text-white font-semibold' : 'text-[#A1A1AA]'}`}>
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
};
