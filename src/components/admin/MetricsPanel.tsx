import React from 'react';
import { Ticket, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatIDR } from '../landing/data';
import type { AdminMetricsData } from '../landing/data';
import { StatusBadge, ProgressBar } from './ui';
import { Dashboard } from '@/components/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MetricsPanelProps {
  metrics: AdminMetricsData | null;
  eventsCount: number;
  onGoToOrders: () => void;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, eventsCount, onGoToOrders }) => {
  const eventStats = metrics?.eventStats || [];
  const maxEventRevenue = Math.max(...eventStats.map((s) => s.revenue), 1);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Dashboard metrics={metrics} eventsCount={eventsCount} onGoToOrders={onGoToOrders} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4 flex-row items-center gap-3 space-y-0">
            <div className="w-9 h-9 rounded-lg border border-border bg-background flex items-center justify-center text-[#C93018] dark:text-[#F2644E] shrink-0">
              <TrendingUp size={16} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-sans text-sm font-semibold tracking-tight truncate">
                Rincian Pendapatan Per Konser
              </CardTitle>
              <CardDescription className="text-xs truncate">
                Performa penjualan tiket per pertunjukan
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-5 space-y-3.5">
            {eventStats.length > 0 ? (
              eventStats.map((st) => {
                const percent = Math.round((st.revenue / maxEventRevenue) * 100);
                return (
                  <div
                    key={st.eventId}
                    className="border border-border bg-background p-4 rounded-xl space-y-2.5"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-sm font-medium text-foreground truncate">{st.title}</span>
                      <span className="text-xs font-mono text-foreground font-semibold shrink-0 tabular-nums">
                        {formatIDR(st.revenue)}
                      </span>
                    </div>
                    <ProgressBar value={st.revenue} max={maxEventRevenue} />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        Tiket terjual:{' '}
                        <strong className="text-foreground font-semibold tabular-nums">
                          {st.ticketsSold}
                        </strong>{' '}
                        lembar
                      </span>
                      <span className="font-mono font-semibold text-foreground tabular-nums">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-sm text-muted-foreground py-12 border border-dashed border-border-strong rounded-xl bg-background">
                Belum ada data transaksi per konser.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4 flex-row items-center justify-between gap-3 space-y-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg border border-border bg-background flex items-center justify-center text-foreground shrink-0">
                <Ticket size={16} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <CardTitle className="font-sans text-sm font-semibold tracking-tight truncate">
                  Transaksi Pesanan Terbaru
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  5 pesanan terkonfirmasi terakhir
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGoToOrders}
              className="shrink-0"
            >
              <span>Kelola</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Button>
          </CardHeader>

          <CardContent className="pt-5 space-y-3">
            {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
              metrics.recentOrders.map((ro) => (
                <div
                  key={ro.id}
                  className="border border-border bg-background p-3.5 rounded-xl flex justify-between items-center gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-foreground font-semibold">
                        {ro.orderCode}
                      </span>
                      <StatusBadge status={ro.status} />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {ro.userName} &middot;{' '}
                      <span className="text-foreground font-medium">{ro.eventTitle}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-foreground font-semibold block tabular-nums">
                      {formatIDR(ro.totalPrice)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {ro.quantity}x Tiket
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-12 border border-dashed border-border-strong rounded-xl bg-background">
                Belum ada data pesanan terbaru.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
