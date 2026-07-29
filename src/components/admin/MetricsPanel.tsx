import React from 'react';
import { BarChart3, Ticket, DollarSign, Layers } from 'lucide-react';
import { formatIDR } from '../landing/data';
import type { AdminMetricsData } from '../landing/data';
import { StatCard } from './ui';

interface MetricsPanelProps {
  metrics: AdminMetricsData | null;
  eventsCount: number;
  onGoToOrders: () => void;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, eventsCount, onGoToOrders }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
      <StatCard
        label="Total Pendapatan"
        value={formatIDR(metrics?.totalRevenue || 0)}
        subtext="Akumulasi dari pesanan terverifikasi"
        icon={DollarSign}
      />
      <StatCard
        label="Tiket Terjual"
        value={`${metrics?.ticketsSold || 0} Lembar`}
        subtext="Total unit tiket terkonfirmasi"
        icon={Ticket}
      />
      <StatCard
        label="Sisa Kuota Kursi"
        value={`${metrics?.remainingQuota || 0} Kursi`}
        subtext="Tersedia di seluruh event aktif"
        icon={Layers}
      />
      <StatCard
        label="Konser Aktif"
        value={`${metrics?.totalEvents || eventsCount} Event`}
        subtext="Konser yang sedang dipublikasikan"
        icon={BarChart3}
      />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#171717', padding: 20 }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={15} strokeWidth={1} style={{ color: '#9a9a9a' }} />
          <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em' }}>Rincian Pendapatan Per Event</span>
        </div>
        <div style={{ marginTop: 16 }}>
          {metrics?.eventStats && metrics.eventStats.length > 0 ? (
            metrics.eventStats.map((st) => (
              <div key={st.eventId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 300, color: '#ffffff', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.title}</span>
                  <span style={{ fontSize: 13, fontWeight: 300, color: '#ffffff' }}>{formatIDR(st.revenue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 300, color: '#9a9a9a', marginTop: 2 }}>
                  <span>Tiket Terjual: {st.ticketsSold} Lembar</span>
                  <span style={{ fontFamily: 'monospace' }}>#{st.eventId}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 300, color: '#9a9a9a', padding: '32px 0' }}>Belum ada data transaksi per event</div>
          )}
        </div>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#171717', padding: 20 }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ticket size={15} strokeWidth={1} style={{ color: '#9a9a9a' }} />
            <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em' }}>5 Transaksi Pesanan Terbaru</span>
          </div>
          <button
            onClick={onGoToOrders}
            style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9a9a9a'; }}
          >
            Lihat Semua
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
            metrics.recentOrders.map((ro) => (
              <div key={ro.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', fontFamily: 'monospace' }}>{ro.orderCode}</span>
                    <span style={{ fontSize: 10, fontWeight: 300, color: '#9a9a9a' }}>{ro.status}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 300, color: '#9a9a9a', marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ro.userName} &bull; {ro.eventTitle}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 13, fontWeight: 300, color: '#ffffff', display: 'block' }}>{formatIDR(ro.totalPrice)}</span>
                  <span style={{ fontSize: 10, fontWeight: 300, color: '#9a9a9a' }}>{ro.quantity}x Tiket</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 300, color: '#9a9a9a', padding: '32px 0' }}>Belum ada data pesanan</div>
          )}
        </div>
      </div>
    </div>
  </div>
);
