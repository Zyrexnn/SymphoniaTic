import React, { useState } from 'react';
import {
  DollarSign, Ticket, Layers, BarChart3, TrendingUp, Calendar, ArrowUpRight,
  TrendingDown, Users, ShieldCheck, RefreshCw, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { formatIDR } from '@/components/landing/data';
import type { AdminMetricsData } from '@/components/landing/data';

const REVENUE_TIMELINE = [
  { month: 'Jan', revenue: 14500000, tickets: 18, refunds: 0 },
  { month: 'Feb', revenue: 19800000, tickets: 24, refunds: 1 },
  { month: 'Mar', revenue: 27500000, tickets: 35, refunds: 0 },
  { month: 'Apr', revenue: 34500000, tickets: 42, refunds: 1 },
  { month: 'Mei (Est)', revenue: 42000000, tickets: 50, refunds: 0 },
  { month: 'Jun (Est)', revenue: 48000000, tickets: 58, refunds: 0 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'VIP Orchestral Pit', value: 16500000, color: '#ffffff' },
  { name: 'CAT 1 Grand Tier', value: 11200000, color: '#9a9a9a' },
  { name: 'Festival Stalls', value: 6800000, color: '#4a4a4a' },
];

interface DashboardProps {
  metrics?: AdminMetricsData | null;
  eventsCount?: number;
  onGoToOrders?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, eventsCount = 4, onGoToOrders }) => {
  const [chartTimeframe, setChartTimeframe] = useState<'MONTHLY' | 'WEEKLY'>('MONTHLY');
  const totalRevenue = metrics ? (metrics.totalRevenue ?? 0) : 0;
  const ticketsSold = metrics ? (metrics.ticketsSold ?? 0) : 0;
  const remainingQuota = metrics ? (metrics.remainingQuota ?? 0) : 0;
  const totalEvents = metrics ? (metrics.totalEvents ?? eventsCount) : eventsCount;

  // Real-time timeline from database or mock fallback
  const timelineData = metrics?.revenueTimeline && metrics.revenueTimeline.length > 0
    ? metrics.revenueTimeline
    : REVENUE_TIMELINE;

  // Real-time category distribution from database or mock fallback
  const categoryData = metrics?.categoryDistribution && metrics.categoryDistribution.length > 0
    ? metrics.categoryDistribution
    : CATEGORY_DISTRIBUTION;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 w-full text-white">
      {/* Financial KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          label="Total Pendapatan Tiket"
          value={formatIDR(totalRevenue)}
          subtext="Total transaksi berhasil"
          icon={DollarSign}
          badgeText="+18.5% YTD"
          badgeColor="text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
        />
        <KPIWidget
          label="Tiket Terverifikasi"
          value={`${ticketsSold} Tiket`}
          subtext="Terkonfirmasi sistem gate"
          icon={Ticket}
          badgeText="Verified"
          badgeColor="text-white border-white/20 bg-white/5"
        />
        <KPIWidget
          label="Sisa Kuota Kursi"
          value={`${remainingQuota} Kursi`}
          subtext="Okupansi 72.8%"
          icon={Layers}
          badgeText="Real-time"
          badgeColor="text-sky-300 border-sky-500/30 bg-sky-500/10"
        />
        <KPIWidget
          label="Konser Active Season"
          value={`${totalEvents} Pertunjukan`}
          subtext="Musim Semi 2026"
          icon={BarChart3}
          badgeText="Live"
          badgeColor="text-purple-300 border-purple-500/30 bg-purple-500/10"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trend (2 Cols) */}
        <div className="lg:col-span-2 border border-white/[0.08] bg-[#1a1a1a]/90 p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between shadow-xl">
          <div>
            <div className="border-b border-white/[0.08] pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-light text-white tracking-tight m-0">Tren Pertumbuhan Pendapatan Simfoni</h3>
                <p className="text-xs font-light text-[#9a9a9a] mt-0.5 m-0">Visualisasi penjualan tiket &amp; estimasi pendapatan bulanan</p>
              </div>
              <div className="flex items-center gap-1 border border-white/10 p-0.5 bg-[#141414]">
                <button
                  onClick={() => setChartTimeframe('MONTHLY')}
                  className={`px-3 py-1 text-xs font-light cursor-pointer border-none transition-colors ${
                    chartTimeframe === 'MONTHLY' ? 'bg-white text-[#171717] font-normal' : 'text-[#9a9a9a] hover:text-white bg-transparent'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setChartTimeframe('WEEKLY')}
                  className={`px-3 py-1 text-xs font-light cursor-pointer border-none transition-colors ${
                    chartTimeframe === 'WEEKLY' ? 'bg-white text-[#171717] font-normal' : 'text-[#9a9a9a] hover:text-white bg-transparent'
                  }`}
                >
                  Mingguan
                </button>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#9a9a9a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9a9a9a" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000000}JT`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '12px' }}
                    formatter={(val: any) => [formatIDR(Number(val)), 'Pendapatan']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Share Donut Chart (1 Col) */}
        <div className="border border-white/[0.08] bg-[#1a1a1a]/90 p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between shadow-xl">
          <div>
            <div className="border-b border-white/[0.08] pb-4">
              <h3 className="text-base font-light text-white tracking-tight m-0">Distribusi Kategori Tiket</h3>
              <p className="text-xs font-light text-[#9a9a9a] mt-0.5 m-0">Komposisi omset berdasarkan kelas kursi</p>
            </div>

            <div className="h-52 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '12px' }}
                    formatter={(val: any) => [formatIDR(Number(val)), 'Omset']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2 pt-2 border-t border-white/[0.06]">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex justify-between items-center text-xs font-light">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#9a9a9a]">{cat.name}</span>
                  </div>
                  <span className="text-white font-mono">{formatIDR(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPIWidget: React.FC<{
  label: string;
  value: string;
  subtext: string;
  icon: any;
  badgeText?: string;
  badgeColor?: string;
}> = ({ label, value, subtext, icon: Icon, badgeText, badgeColor = 'text-white border-white/20 bg-white/5' }) => (
  <div className="p-5 sm:p-6 border border-white/[0.08] bg-[#1a1a1a] relative group hover:border-white/20 transition-all shadow-lg overflow-hidden">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-light text-[#9a9a9a] tracking-wider uppercase">{label}</span>
      <div className="w-8 h-8 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center text-white">
        <Icon size={15} strokeWidth={1.25} />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2 font-sans tabular-nums">{value}</div>
    <div className="flex items-center justify-between text-xs font-light text-[#9a9a9a]">
      <span className="truncate mr-2">{subtext}</span>
      {badgeText && (
        <span className={`text-[10px] font-mono px-2 py-0.5 border ${badgeColor}`}>
          {badgeText}
        </span>
      )}
    </div>
  </div>
);
