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
  <div className="flex flex-col gap-6">
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-px">
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

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-white/10 bg-[#171717] p-5">
        <div className="border-b border-white/10 pb-3 flex items-center gap-2">
          <BarChart3 size={15} strokeWidth={1} className="text-[#9a9a9a]" />
          <span className="text-sm font-light text-white tracking-tight">Rincian Pendapatan Per Event</span>
        </div>
        <div className="mt-4">
          {metrics?.eventStats && metrics.eventStats.length > 0 ? (
            metrics.eventStats.map((st) => (
              <div key={st.eventId} className="border-b border-white/[0.04] py-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-light text-white max-w-[220px] truncate">{st.title}</span>
                  <span className="text-[13px] font-light text-white">{formatIDR(st.revenue)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-light text-[#9a9a9a] mt-0.5">
                  <span>Tiket Terjual: {st.ticketsSold} Lembar</span>
                  <span className="font-mono">#{st.eventId}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs font-light text-[#9a9a9a] py-8">Belum ada data transaksi per event</div>
          )}
        </div>
      </div>

      <div className="border border-white/10 bg-[#171717] p-5">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket size={15} strokeWidth={1} className="text-[#9a9a9a]" />
            <span className="text-sm font-light text-white tracking-tight">5 Transaksi Pesanan Terbaru</span>
          </div>
          <button
            onClick={onGoToOrders}
            className="text-xs font-light text-[#9a9a9a] bg-transparent border-none cursor-pointer hover:text-white"
          >
            Lihat Semua
          </button>
        </div>
        <div className="mt-4">
          {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
            metrics.recentOrders.map((ro) => (
              <div key={ro.id} className="border-b border-white/[0.04] py-2.5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-light text-[#9a9a9a] font-mono">{ro.orderCode}</span>
                    <span className="text-[10px] font-light text-[#9a9a9a]">{ro.status}</span>
                  </div>
                  <div className="text-[11px] font-light text-[#9a9a9a] mt-0.5 max-w-[200px] truncate">{ro.userName} &bull; {ro.eventTitle}</div>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-light text-white block">{formatIDR(ro.totalPrice)}</span>
                  <span className="text-[10px] font-light text-[#9a9a9a]">{ro.quantity}x Tiket</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs font-light text-[#9a9a9a] py-8">Belum ada data pesanan</div>
          )}
        </div>
      </div>
    </div>
  </div>
);
