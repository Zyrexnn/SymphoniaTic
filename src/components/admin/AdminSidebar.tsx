import React from 'react';
import {
  BarChart3, Ticket, Layers, ExternalLink, LogOut, RefreshCw, Menu, X, RotateCcw, ChevronRight
} from 'lucide-react';
import { formatIDR } from '../landing/data';

export type TabId = 'METRICS' | 'EVENTS' | 'ORDERS' | 'REFUNDS';

interface AdminSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  eventsCount: number;
  ordersCount: number;
  refundsCount?: number;
  totalRevenue: number;
}

const NAV_ITEMS: { id: TabId; label: string; shortLabel: string; icon: typeof BarChart3 }[] = [
  { id: 'METRICS', label: 'Metrik & Finansial', shortLabel: 'Metrik', icon: BarChart3 },
  { id: 'EVENTS', label: 'Postingan Konser', shortLabel: 'Konser', icon: Ticket },
  { id: 'ORDERS', label: 'Manajemen Pesanan', shortLabel: 'Pesanan', icon: Layers },
  { id: 'REFUNDS', label: 'Permohonan Refund', shortLabel: 'Refund', icon: RotateCcw },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab, onTabChange, onLogout, eventsCount, ordersCount, refundsCount, totalRevenue,
}) => (
  <aside className="hidden md:flex flex-col justify-between h-screen w-64 border-r border-white/[0.08] bg-[#171717] p-6 shrink-0 sticky top-0">
    <div>
      {/* Brand Header */}
      <a href="/" className="flex items-center gap-3 px-1 mb-8 no-underline group">
        <div className="w-10 h-10 border border-white/20 bg-white/[0.02] flex items-center justify-center group-hover:border-white/40 transition-colors">
          <span className="text-sm font-light text-white tracking-[0.1em]">S</span>
        </div>
        <div>
          <span className="text-sm font-light text-white tracking-tight block">SymphoniaTic</span>
          <span className="text-[9px] font-light text-[#9a9a9a] tracking-[0.18em] uppercase block">ADMIN PORTAL</span>
        </div>
      </a>

      {/* Navigation Links */}
      <nav className="space-y-1">
        <p className="px-3 text-[10px] font-light text-[#9a9a9a] tracking-[0.15em] uppercase mb-3">Menu utama</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = item.id === 'EVENTS' ? `${eventsCount}`
            : item.id === 'ORDERS' ? `${ordersCount}`
            : item.id === 'REFUNDS' ? `${refundsCount || 0}`
            : totalRevenue ? formatIDR(totalRevenue) : '';

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 text-[13px] font-light text-left transition-all duration-200 cursor-pointer border-none ${
                isActive
                  ? 'text-white bg-white/[0.06] border-l-2 border-white pl-3'
                  : 'text-[#9a9a9a] bg-transparent hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} strokeWidth={1.25} />
                <span>{item.label}</span>
              </div>
              {badge && (
                <span className={`text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm ${
                  isActive ? 'text-white bg-white/10' : 'text-[#9a9a9a] bg-white/[0.03]'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>

    {/* Footer Navigation */}
    <div className="border-t border-white/[0.08] pt-4 space-y-1">
      <a
        href="/"
        className="flex items-center justify-between px-3.5 py-2.5 text-[13px] font-light text-[#9a9a9a] no-underline hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2.5"><ExternalLink size={14} strokeWidth={1.25} /> Web Utama</span>
        <ChevronRight size={14} strokeWidth={1} className="text-[#9a9a9a]" />
      </a>

      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-light text-rose-400/80 hover:text-rose-300 bg-transparent border-none cursor-pointer w-full text-left transition-colors"
      >
        <LogOut size={14} strokeWidth={1.25} />
        <span>Keluar Sesi Admin</span>
      </button>
    </div>
  </aside>
);

interface MobileHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab, onTabChange, onLogout, isOpen, onToggle, onRefresh, isLoading,
}) => {
  const currentItem = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <>
      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#171717]/95 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-white/20 bg-white/[0.02] flex items-center justify-center">
            <span className="text-xs font-light text-white">S</span>
          </div>
          <div>
            <span className="text-xs font-light text-white tracking-tight block">SymphoniaTic</span>
            <span className="text-[9px] font-light text-[#9a9a9a] uppercase block">{currentItem.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 bg-transparent border border-white/10 text-[#9a9a9a] hover:text-white cursor-pointer active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={14} strokeWidth={1.25} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onToggle}
            className="p-2 bg-transparent border border-white/10 text-white cursor-pointer active:scale-95 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={16} strokeWidth={1.25} /> : <Menu size={16} strokeWidth={1.25} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-[#171717]/98 backdrop-blur-xl z-50 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <p className="text-[10px] font-light text-[#9a9a9a] tracking-[0.2em] uppercase mb-2">Navigasi Admin</p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); onToggle(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-light text-left border cursor-pointer transition-all ${
                    isActive
                      ? 'text-white bg-white/[0.08] border-white/30'
                      : 'text-[#9a9a9a] bg-transparent border-white/[0.05]'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.25} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/[0.08] space-y-3">
            <a
              href="/"
              className="flex items-center justify-between px-4 py-3 text-sm font-light text-[#9a9a9a] hover:text-white no-underline border border-white/[0.05]"
            >
              <span className="flex items-center gap-2"><ExternalLink size={16} strokeWidth={1.25} /> Halaman Utama</span>
              <ChevronRight size={16} />
            </a>
            <button
              onClick={() => { onLogout(); onToggle(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-light text-rose-400 bg-rose-500/10 border border-rose-500/20 cursor-pointer"
            >
              <LogOut size={16} strokeWidth={1.25} />
              <span>Keluar Admin</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const MobileBottomNav: React.FC<{
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}> = ({ activeTab, onTabChange }) => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171717]/95 backdrop-blur-lg border-t border-white/[0.08] flex items-center justify-around py-1.5 px-2">
    {NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center justify-center py-1 px-3 bg-transparent border-none cursor-pointer transition-all ${
            isActive ? 'text-white scale-105' : 'text-[#9a9a9a] hover:text-white/80'
          }`}
        >
          <Icon size={18} strokeWidth={isActive ? 1.75 : 1} />
          <span className={`text-[10px] font-light tracking-tight mt-1 ${isActive ? 'text-white font-normal' : 'text-[#9a9a9a]'}`}>
            {item.shortLabel}
          </span>
        </button>
      );
    })}
  </div>
);
