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
  { name: 'VIP Orchestral Pit', value: 16500000, color: '#FFFFFF' },
  { name: 'CAT 1 Grand Tier', value: 11200000, color: '#A1A1AA' },
  { name: 'Festival Stalls', value: 6800000, color: '#71717A' },
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

  const timelineData = metrics?.revenueTimeline && metrics.revenueTimeline.length > 0
    ? metrics.revenueTimeline
    : REVENUE_TIMELINE;

  const categoryData = metrics?.categoryDistribution && metrics.categoryDistribution.length > 0
    ? metrics.categoryDistribution
    : CATEGORY_DISTRIBUTION;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 w-full text-[#F4F4F6]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          label="Total Pendapatan Tiket"
          value={formatIDR(totalRevenue)}
          subtext="Total transaksi berhasil"
          icon={DollarSign}
          badgeText="+18.5% YTD"
          badgeColor="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        />
        <KPIWidget
          label="Tiket Terverifikasi"
          value={`${ticketsSold} Tiket`}
          subtext="Terkonfirmasi sistem gate"
          icon={Ticket}
          badgeText="Verified"
          badgeColor="text-white border-white/20 bg-white/10"
        />
        <KPIWidget
          label="Sisa Kuota Kursi"
          value={`${remainingQuota} Kursi`}
          subtext="Okupansi 72.8%"
          icon={Layers}
          badgeText="Real-time"
          badgeColor="text-[#94A3B8] border-[#272A38] bg-[#0C0D12]"
        />
        <KPIWidget
          label="Konser Active Season"
          value={`${totalEvents} Pertunjukan`}
          subtext="Musim 2026"
          icon={BarChart3}
          badgeText="Live"
          badgeColor="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="border-b border-[#272A38] pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">Tren Pertumbuhan Pendapatan Simfoni</h3>
                <p className="text-xs font-normal text-[#94A3B8] mt-0.5 m-0">Visualisasi penjualan tiket dan estimasi pendapatan bulanan</p>
              </div>
              <div className="flex items-center gap-1 border border-[#272A38] p-0.5 rounded-lg bg-[#0C0D12]">
                <button
                  onClick={() => setChartTimeframe('MONTHLY')}
                  className={`px-3 py-1 text-xs font-medium cursor-pointer rounded border-none transition-colors ${
                    chartTimeframe === 'MONTHLY' ? 'bg-white text-[#0C0D12] font-semibold' : 'text-[#A1A1AA] hover:text-white bg-transparent'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setChartTimeframe('WEEKLY')}
                  className={`px-3 py-1 text-xs font-medium cursor-pointer rounded border-none transition-colors ${
                    chartTimeframe === 'WEEKLY' ? 'bg-white text-[#0C0D12] font-semibold' : 'text-[#A1A1AA] hover:text-white bg-transparent'
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
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                  <YAxis stroke="#A1A1AA" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000000}JT`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#14161F', borderColor: '#272A38', color: '#FFFFFF', fontSize: '12px', borderRadius: '8px' }}
                    formatter={(val: any) => [formatIDR(Number(val)), 'Pendapatan']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="border-b border-[#272A38] pb-4">
              <h3 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">Distribusi Kategori Tiket</h3>
              <p className="text-xs font-normal text-[#94A3B8] mt-0.5 m-0">Komposisi omset berdasarkan kelas kursi</p>
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#14161F" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#14161F', borderColor: '#272A38', color: '#F4F4F6', fontSize: '12px', borderRadius: '8px' }}
                    formatter={(val: any) => [formatIDR(Number(val)), 'Omset']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2 pt-2 border-t border-[#272A38]">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cat.color }} />
                    <span className="text-[#A1A1AA]">{cat.name}</span>
                  </div>
                  <span className="text-white font-mono font-medium">{formatIDR(cat.value)}</span>
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
}> = ({ label, value, subtext, icon: Icon, badgeText, badgeColor = 'text-[#A1A1AA] border-[#272A38] bg-[#0C0D12]' }) => (
  <div className="p-5 sm:p-6 border border-[#272A38] bg-[#14161F] rounded-xl relative group hover:border-white/30 transition-all shadow-lg overflow-hidden">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-medium text-[#A1A1AA] tracking-wider uppercase">{label}</span>
      <div className="w-8 h-8 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white">
        <Icon size={15} strokeWidth={1.5} />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 font-sans tabular-nums">{value}</div>
    <div className="flex items-center justify-between text-xs font-normal text-[#A1A1AA]">
      <span className="truncate mr-2">{subtext}</span>
      {badgeText && (
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
          {badgeText}
        </span>
      )}
    </div>
  </div>
);
