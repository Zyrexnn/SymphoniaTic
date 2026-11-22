import React from 'react';
import { DollarSign, Ticket, Layers, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatIDR } from '@/components/landing/data';
import type { AdminMetricsData } from '@/components/landing/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminTheme } from '@/components/admin/AdminThemeContext';

const PLAYBILL_CHART_LIGHT = ['#141413', '#52514D', '#156E3F', '#8A5A00', '#9E9C94'];
const PLAYBILL_CHART_DARK = ['#D4FF2A', '#F4F3EF', '#4ADE80', '#FBBF24', '#8A8880'];

interface DashboardProps {
  metrics?: AdminMetricsData | null;
  eventsCount?: number;
  onGoToOrders?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, eventsCount = 0 }) => {
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';

  const totalRevenue = metrics ? (metrics.totalRevenue ?? 0) : 0;
  const ticketsSold = metrics ? (metrics.ticketsSold ?? 0) : 0;
  const remainingQuota = metrics ? (metrics.remainingQuota ?? 0) : 0;
  const totalEvents = metrics ? (metrics.totalEvents ?? eventsCount) : eventsCount;

  const totalQuota = ticketsSold + remainingQuota;
  const occupancyPct = totalQuota > 0 ? Math.round((ticketsSold / totalQuota) * 100) : 0;

  const timelineData =
    metrics?.revenueTimeline && metrics.revenueTimeline.length > 0
      ? metrics.revenueTimeline
      : [];

  const rawCategoryData =
    metrics?.categoryDistribution && metrics.categoryDistribution.length > 0
      ? metrics.categoryDistribution
      : [];

  const palette = isDark ? PLAYBILL_CHART_DARK : PLAYBILL_CHART_LIGHT;
  const categoryData = rawCategoryData.map((cat, idx) => ({
    ...cat,
    color: palette[idx % palette.length],
  }));

  const axisColor = isDark ? '#B8B6AE' : '#52514D';
  const gridColor = isDark ? 'rgba(244, 243, 239, 0.08)' : 'rgba(20, 20, 19, 0.08)';
  const strokeColor = isDark ? '#D4FF2A' : '#141413';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1C1C1A' : '#FFFFFF',
    borderColor: isDark ? '#52514D' : '#141413',
    color: isDark ? '#F4F3EF' : '#141413',
    fontSize: '12px',
    borderRadius: '0px',
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPIWidget
          label="Total Pendapatan Tiket"
          value={formatIDR(totalRevenue)}
          subtext={ticketsSold > 0 ? `Dari ${ticketsSold} tiket terbit` : 'Belum ada transaksi tercatat'}
          icon={DollarSign}
          accent
        />
        <KPIWidget
          label="Tiket Terjual"
          value={`${ticketsSold} Tiket`}
          subtext="Pesanan aktif & terkonfirmasi"
          icon={Ticket}
        />
        <KPIWidget
          label="Sisa Kuota Kursi"
          value={`${remainingQuota} Kursi`}
          subtext={totalQuota > 0 ? `Okupansi ${occupancyPct}% dari ${totalQuota} kursi` : 'Belum ada kuota aktif'}
          icon={Layers}
        />
        <KPIWidget
          label="Konser Aktif"
          value={`${totalEvents} Konser`}
          subtext="Terdaftar di katalog publik"
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="font-sans text-base font-semibold">
              Tren Pendapatan Penjualan Tiket per Bulan
            </CardTitle>
            <CardDescription className="text-xs">
              Total nilai transaksi terkonfirmasi berdasarkan data server.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {timelineData.length > 0 ? (
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="playbillRevFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={strokeColor} stopOpacity={0.26} />
                        <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="month" stroke={axisColor} fontSize={12} tickLine={false} />
                    <YAxis
                      stroke={axisColor}
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000000)}JT`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val: unknown) => [formatIDR(Number(val)), 'Pendapatan']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={strokeColor}
                      strokeWidth={2.25}
                      fillOpacity={1}
                      fill="url(#playbillRevFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-border-strong rounded-none p-6 bg-background">
                <p className="text-sm font-semibold text-foreground m-0">
                  Belum Ada Riwayat Pendapatan Bulanan
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 m-0 max-w-sm">
                  Grafik terisi otomatis setelah terdapat transaksi pesanan tiket yang tercatat di sistem.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="font-sans text-base font-semibold">
              Distribusi Pendapatan per Kelas Kursi
            </CardTitle>
            <CardDescription className="text-xs">
              Komposisi omset berdasarkan kategori tempat duduk.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {categoryData.length > 0 ? (
              <>
                <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={76}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={isDark ? '#1C1C1A' : '#FFFFFF'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(val: unknown) => [formatIDR(Number(val)), 'Omset']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5 mt-2 pt-3 border-t border-border">
                  {categoryData.map((cat) => (
                    <div key={cat.name} className="flex justify-between items-center text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: cat.color }}
                          aria-hidden="true"
                        />
                        <span className="text-foreground truncate">{cat.name}</span>
                      </div>
                      <span className="text-foreground font-mono font-semibold shrink-0 tabular-nums">
                        {formatIDR(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-border-strong rounded-none mt-2 p-6 bg-background">
                <p className="text-sm font-semibold text-foreground m-0">
                  Belum Ada Data Kategori Terjual
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 m-0">
                  Proporsi kelas kursi akan tampil setelah ada pesanan masuk.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const KPIWidget: React.FC<{
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  accent?: boolean;
}> = ({ label, value, subtext, icon: Icon, accent = false }) => (
  <Card className="transition-colors hover:border-border-strong">
    <CardContent className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase truncate">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-none border flex items-center justify-center shrink-0 ${
            accent
              ? 'border-[#141413] bg-[#D4FF2A] text-[#141413]'
              : 'border-border bg-background text-foreground'
          }`}
        >
          <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
        </div>
      </div>
      <div className="font-display text-3xl sm:text-[32px] font-semibold text-card-foreground tracking-tight leading-none mb-2 tabular-nums truncate">
        {value}
      </div>
      <p className="text-xs font-normal text-muted-foreground m-0 truncate">{subtext}</p>
    </CardContent>
  </Card>
);
