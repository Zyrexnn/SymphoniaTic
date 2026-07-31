import React from 'react';
import { BarChart3, Ticket, DollarSign, Layers, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatIDR } from '../landing/data';
import type { AdminMetricsData } from '../landing/data';
import { StatCard } from './ui';

interface MetricsPanelProps {
  metrics: AdminMetricsData | null;
  eventsCount: number;
  onGoToOrders: () => void;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, eventsCount, onGoToOrders }) => (
  <div className="flex flex-col gap-8">
    {/* Top Grid of Stat Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Pendapatan Tiket"
        value={formatIDR(metrics?.totalRevenue || 0)}
        subtext="Akumulasi pesanan terverifikasi"
        icon={DollarSign}
        badgeText="+12.4% vs bln lalu"
      />
      <StatCard
        label="Tiket Terjual"
        value={`${metrics?.ticketsSold || 0} Tiket`}
        subtext="Total transaksi terkonfirmasi"
        icon={Ticket}
        badgeText="Terverifikasi"
      />
      <StatCard
        label="Sisa Kuota Kursi"
        value={`${metrics?.remainingQuota || 0} Kursi`}
        subtext="Tersedia di seluruh event aktif"
        icon={Layers}
        trendColor="text-blue-400 border-blue-500/30 bg-blue-500/10"
        badgeText="Real-time"
      />
      <StatCard
        label="Konser & Resital Aktif"
        value={`${metrics?.totalEvents || eventsCount} Event`}
        subtext="Musim Semi 2026"
        icon={BarChart3}
        trendColor="text-purple-400 border-purple-500/30 bg-purple-500/10"
        badgeText="Aktif Dipublikasikan"
      />
    </div>

    {/* Section 2: Detailed Breakdown */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue per event */}
      <div className="border border-white/10 bg-[#121826]/90 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
        <div>
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="text-sm font-light text-white tracking-tight m-0">Rincian Pendapatan Per Event</h3>
                <span className="text-[11px] font-light text-[#8a99ad]">Breakdown penjualan tiket per pertunjukan simfoni</span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {metrics?.eventStats && metrics.eventStats.length > 0 ? (
              metrics.eventStats.map((st) => (
                <div key={st.eventId} className="border border-white/[0.06] bg-[#0c101a] p-3.5 hover:border-white/15 transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-light text-white font-medium truncate max-w-[240px]">{st.title}</span>
                    <span className="text-xs font-mono font-semibold text-amber-300">{formatIDR(st.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-light text-[#8a99ad]">
                    <span>Tiket Terjual: <strong className="text-slate-200">{st.ticketsSold}</strong> Lembar</span>
                    <span className="font-mono text-[10px] text-[#5a6a7e]">ID: #{st.eventId}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs font-light text-[#8a99ad] py-10">Belum ada data transaksi per event</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="border border-white/10 bg-[#121826]/90 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
        <div>
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Ticket size={16} />
              </div>
              <div>
                <h3 className="text-sm font-light text-white tracking-tight m-0">Transaksi Pesanan Terbaru</h3>
                <span className="text-[11px] font-light text-[#8a99ad]">5 Transaksi tiket masuk terakhir</span>
              </div>
            </div>
            <button
              onClick={onGoToOrders}
              className="text-xs font-light text-amber-400 hover:text-amber-300 bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
              metrics.recentOrders.map((ro) => (
                <div key={ro.id} className="border border-white/[0.06] bg-[#0c101a] p-3.5 flex justify-between items-center hover:border-white/15 transition-all">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-amber-400 font-medium">{ro.orderCode}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                        {ro.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8a99ad] truncate max-w-[220px]">
                      {ro.userName} &bull; <span className="text-slate-300">{ro.eventTitle}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-semibold text-white block">{formatIDR(ro.totalPrice)}</span>
                    <span className="text-[10px] text-[#8a99ad]">{ro.quantity}x Tiket</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs font-light text-[#8a99ad] py-10">Belum ada data pesanan</div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
