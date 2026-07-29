import React from 'react';
import { BarChart3, Ticket, Layers, ExternalLink, LogOut, RefreshCw, Menu, X } from 'lucide-react';
import { formatIDR } from '../landing/data';

export type TabId = 'METRICS' | 'EVENTS' | 'ORDERS';

interface AdminSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onLogout: () => void;
  eventsCount: number;
  ordersCount: number;
  totalRevenue: number;
}

const NAV_ITEMS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'METRICS', label: 'Metrik & Finansial', icon: BarChart3 },
  { id: 'EVENTS', label: 'Postingan Konser', icon: Ticket },
  { id: 'ORDERS', label: 'Manajemen Pesanan', icon: Layers },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab, onTabChange, onLogout, eventsCount, ordersCount, totalRevenue,
}) => (
  <aside
    style={{
      width: 240,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: '#171717',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh',
      padding: 24,
      flexShrink: 0,
    }}
    className="hidden md:flex"
  >
    <div>
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', marginBottom: 24, textDecoration: 'none' }}>
        <div
          style={{
            width: 36, height: 36,
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff', letterSpacing: '0.1em' }}>S</span>
        </div>
        <div>
          <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em', display: 'block' }}>SymphoniaTic</span>
          <span style={{ fontSize: 9, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>ADMIN PORTAL</span>
        </div>
      </a>

      <nav style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = item.id === 'EVENTS' ? `${eventsCount}`
            : item.id === 'ORDERS' ? `${ordersCount}`
            : totalRevenue ? formatIDR(totalRevenue) : '';

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 300,
                color: isActive ? '#ffffff' : '#9a9a9a',
                background: isActive ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                borderBottom: isActive ? '1px solid #ffffff' : '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#9a9a9a'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={15} strokeWidth={1} />
                <span>{item.label}</span>
              </div>
              {badge && (
                <span style={{ fontSize: 10, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em' }}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>

    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
      <a
        href="/"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', fontSize: 13, fontWeight: 300, color: '#9a9a9a',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#9a9a9a'; }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ExternalLink size={14} strokeWidth={1} /> Web Utama</span>
        <ChevronRightIcon />
      </a>

      <button
        onClick={onLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', fontSize: 13, fontWeight: 300, color: '#9a9a9a',
          background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#9a9a9a'; }}
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

// ── Mobile ──

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
    <div
      className="md:hidden"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: '#171717',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 40,
      }}
    >
      
    </div>

    {isOpen && (
      <div
        className="md:hidden"
        style={{
          background: '#171717',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: 16,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => { onTabChange(item.id); onToggle(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', fontSize: 13, fontWeight: 300,
              color: activeTab === item.id ? '#ffffff' : '#9a9a9a',
              background: activeTab === item.id ? 'rgba(255,255,255,0.04)' : 'transparent',
              border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              borderBottom: activeTab === item.id ? '1px solid #ffffff' : '1px solid transparent',
            }}
          >
            <item.icon size={15} strokeWidth={1} />
            <span>{item.label}</span>
          </button>
        ))}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ExternalLink size={12} strokeWidth={1} /> Web Utama
          </a>
          <button onClick={onLogout} style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <LogOut size={12} strokeWidth={1} /> Keluar
          </button>
        </div>
      </div>
    )}
  </>
);
