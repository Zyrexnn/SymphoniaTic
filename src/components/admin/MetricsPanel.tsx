import React from 'react';
import { Ticket, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatIDR } from '../landing/data';
import type { AdminMetricsData } from '../landing/data';
import { StatusBadge, ProgressBar } from './ui';
import { Dashboard } from '@/components/dashboard';

interface MetricsPanelProps {
  metrics: AdminMetricsData | null;
  eventsCount: number;
  onGoToOrders: () => void;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, eventsCount, onGoToOrders }) => {
  const eventStats = metrics?.eventStats || [];
  const maxEventRevenue = Math.max(...eventStats.map((s) => s.revenue), 1);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <Dashboard metrics={metrics} eventsCount={eventsCount} onGoToOrders={onGoToOrders} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="border-b border-[#272A38] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white">
                  <TrendingUp size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F4F6] tracking-tight m-0">Rincian Pendapatan Per Event</h3>
                  <span className="text-[11px] font-normal text-[#A1A1AA]">Performa penjualan tiket per pertunjukan simfoni</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {eventStats.length > 0 ? (
                eventStats.map((st) => {
                  const percent = Math.round((st.revenue / maxEventRevenue) * 100);
                  return (
                    <div key={st.eventId} className="border border-[#272A38] bg-[#0C0D12] p-4 rounded-lg hover:border-white/30 transition-all space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-medium text-[#F4F4F6] truncate max-w-[260px]">{st.title}</span>
                        <span className="text-xs font-mono text-white font-semibold shrink-0">{formatIDR(st.revenue)}</span>
                      </div>
                      <ProgressBar value={st.revenue} max={maxEventRevenue} />
                      <div className="flex justify-between items-center text-[10px] font-normal text-[#A1A1AA]">
                        <span>Tiket Terjual: <strong className="text-[#F4F4F6] font-medium">{st.ticketsSold}</strong> lembar</span>
                        <span className="font-mono text-white">Kontribusi: {percent}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-xs font-normal text-[#A1A1AA] py-12">Belum ada data transaksi per event</div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="border-b border-[#272A38] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white">
                  <Ticket size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F4F6] tracking-tight m-0">Transaksi Pesanan Terbaru</h3>
                  <span className="text-[11px] font-normal text-[#A1A1AA]">Riwayat 5 pesanan terkonfirmasi terakhir</span>
                </div>
              </div>
              <button
                onClick={onGoToOrders}
                className="text-xs font-medium text-white hover:text-neutral-300 bg-transparent border-none cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>Kelola</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                metrics.recentOrders.map((ro) => (
                  <div key={ro.id} className="border border-[#272A38] bg-[#0C0D12] p-3.5 rounded-lg flex justify-between items-center hover:border-white/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[#F4F4F6] font-medium">{ro.orderCode}</span>
                        <StatusBadge status={ro.status} />
                      </div>
                      <div className="text-[11px] font-normal text-[#A1A1AA] truncate max-w-[220px]">
                        {ro.userName} &bull; <span className="text-[#F4F4F6]">{ro.eventTitle}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-white font-semibold block">{formatIDR(ro.totalPrice)}</span>
                      <span className="text-[10px] font-normal text-[#A1A1AA]">{ro.quantity}x Tiket</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs font-normal text-[#A1A1AA] py-12">Belum ada data pesanan terbaru</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
