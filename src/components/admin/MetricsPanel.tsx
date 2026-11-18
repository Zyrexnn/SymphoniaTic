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
    <div className="flex flex-col gap-6 sm:gap-8 pb-8">
      <Dashboard metrics={metrics} eventsCount={eventsCount} onGoToOrders={onGoToOrders} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-[#272A38] pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white shrink-0">
                <TrendingUp size={16} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F6] tracking-tight m-0">Rincian Pendapatan Per Event</h3>
                <span className="text-xs font-normal text-[#A1A1AA]">Performa penjualan tiket per pertunjukan</span>
              </div>
            </div>

            <div className="mt-5 space-y-3.5">
              {eventStats.length > 0 ? (
                eventStats.map((st) => {
                  const percent = Math.round((st.revenue / maxEventRevenue) * 100);
                  return (
                    <div key={st.eventId} className="border border-[#272A38] bg-[#0C0D12] p-4 rounded-lg space-y-2.5">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-sm font-medium text-[#F4F4F6] truncate">{st.title}</span>
                        <span className="text-xs font-mono text-white font-semibold shrink-0 tabular-nums">{formatIDR(st.revenue)}</span>
                      </div>
                      <ProgressBar value={st.revenue} max={maxEventRevenue} />
                      <div className="flex justify-between items-center text-xs font-normal text-[#A1A1AA]">
                        <span>Tiket terjual: <strong className="text-white font-medium">{st.ticketsSold}</strong> lembar</span>
                        <span className="font-mono text-white">{percent}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm font-normal text-[#A1A1AA] py-12 border border-dashed border-[#3E4357] rounded-xl bg-[#0C0D12]">
                  Belum ada data transaksi per event
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-[#272A38] pb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white shrink-0">
                  <Ticket size={16} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#F4F4F6] tracking-tight m-0 truncate">Transaksi Pesanan Terbaru</h3>
                  <span className="text-xs font-normal text-[#A1A1AA] block truncate">5 pesanan terkonfirmasi terakhir</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToOrders}
                className="min-h-[40px] px-3 text-xs font-medium text-white hover:text-neutral-200 bg-[#0C0D12] border border-[#3E4357] hover:border-white/50 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Kelola</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                metrics.recentOrders.map((ro) => (
                  <div key={ro.id} className="border border-[#272A38] bg-[#0C0D12] p-3.5 rounded-lg flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-white font-semibold">{ro.orderCode}</span>
                        <StatusBadge status={ro.status} />
                      </div>
                      <div className="text-xs font-normal text-[#A1A1AA] truncate">
                        {ro.userName} &middot; <span className="text-[#F4F4F6]">{ro.eventTitle}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-white font-semibold block tabular-nums">{formatIDR(ro.totalPrice)}</span>
                      <span className="text-xs font-normal text-[#A1A1AA]">{ro.quantity}x Tiket</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm font-normal text-[#A1A1AA] py-12 border border-dashed border-[#3E4357] rounded-xl bg-[#0C0D12]">
                  Belum ada data pesanan terbaru
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
