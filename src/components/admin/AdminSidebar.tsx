import React from 'react';
import { BarChart3, Ticket, Layers, ExternalLink, LogOut, RefreshCw, Menu, X, RotateCcw } from 'lucide-react';
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

const NAV_ITEMS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'METRICS', label: 'Metrik & Finansial', icon: BarChart3 },
  { id: 'EVENTS', label: 'Postingan Konser', icon: Ticket },
  { id: 'ORDERS', label: 'Manajemen Pesanan', icon: Layers },
  { id: 'REFUNDS', label: 'Permohonan Refund', icon: RotateCcw },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab, onTabChange, onLogout, eventsCount, ordersCount, refundsCount, totalRevenue,
}) => (
  <aside
    className="hidden md:flex flex-col justify-between h-screen w-60 border-r border-white/10 bg-[#171717] p-6 shrink-0 sticky top-0"
  >
    <div>
      <a href="/" className="flex items-center gap-3 px-2 mb-6 no-underline">
        <div className="w-9 h-9 border border-white/[0.15] flex items-center justify-center">
          <span className="text-sm font-light text-white tracking-[0.1em]">S</span>
        </div>
        <div>
          <span className="text-sm font-light text-white tracking-tight block">SymphoniaTic</span>
          <span className="text-[9px] font-light text-[#9a9a9a] tracking-[0.15em] uppercase block">ADMIN PORTAL</span>
        </div>
      </a>

      <nav className="border-t border-white/10 pt-4">
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
              className={`w-full flex items-center justify-between px-3 py-2.5 text-[13px] font-light text-left border-none cursor-pointer ${
                isActive
                  ? 'text-white bg-white/[0.04] border-b border-white'
                  : 'text-[#9a9a9a] bg-transparent border-b border-transparent hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} strokeWidth={1} />
                <span>{item.label}</span>
              </div>
              {badge && (
                <span className="text-[10px] font-light text-[#9a9a9a] tracking-wider">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>

    <div className="border-t border-white/10 pt-4">
      <a
        href="/"
        className="flex items-center justify-between px-3 py-2.5 text-[13px] font-light text-[#9a9a9a] no-underline hover:text-white"
      >
        <span className="flex items-center gap-2"><ExternalLink size={14} strokeWidth={1} /> Web Utama</span>
        <ChevronRightIcon />
      </a>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-light text-[#9a9a9a] bg-transparent border-none cursor-pointer w-full text-left hover:text-white"
      >
        <LogOut size={14} strokeWidth={1} />
        <span>Keluar Sesi Admin</span>
      </button>
    </div>
  </aside>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
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
}) => (
  <>
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#171717] border-b border-white/10 sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 border border-white/[0.15] flex items-center justify-center">
          <span className="text-xs font-light text-white">S</span>
        </div>
        <span className="text-[13px] font-light text-white">SymphoniaTic Admin</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onRefresh} className="p-1.5 bg-transparent border border-white/[0.1] cursor-pointer">
          <RefreshCw size={14} strokeWidth={1} className={`text-[#9a9a9a] ${isLoading ? 'animate-spin' : ''}`} />
        </button>
        <button onClick={onToggle} className="p-1.5 bg-transparent border border-white/[0.1] cursor-pointer">
          {isOpen ? <X size={14} strokeWidth={1} className="text-white" /> : <Menu size={14} strokeWidth={1} className="text-white" />}
        </button>
      </div>
    </div>

    {isOpen && (
      <div className="md:hidden bg-[#171717] border-b border-white/10 p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); onToggle(); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-light text-left border-none cursor-pointer ${
                activeTab === item.id
                  ? 'text-white bg-white/[0.04] border-b border-white'
                  : 'text-[#9a9a9a] bg-transparent border-b border-transparent'
              }`}
            >
              <Icon size={15} strokeWidth={1} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
          <a href="/" className="text-xs font-light text-[#9a9a9a] no-underline flex items-center gap-1 hover:text-white">
            <ExternalLink size={12} strokeWidth={1} /> Web Utama
          </a>
          <button onClick={onLogout} className="text-xs font-light text-[#9a9a9a] bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-white">
            <LogOut size={12} strokeWidth={1} /> Keluar
          </button>
        </div>
      </div>
    )}
  </>
);
