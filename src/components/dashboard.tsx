import React from 'react';
import { DollarSign, Ticket, Layers, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { formatIDR } from '@/components/landing/data';
import type { AdminMetricsData } from '@/components/landing/data';

const MONOCHROME_PALETTE = ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#94A3B8', '#64748B'];

interface DashboardProps {
  metrics?: AdminMetricsData | null;
  eventsCount?: number;
  onGoToOrders?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ metrics, eventsCount = 4 }) => {
  const totalRevenue = metrics ? (metrics.totalRevenue ?? 0) : 0;
  const ticketsSold = metrics ? (metrics.ticketsSold ?? 0) : 0;
  const remainingQuota = metrics ? (metrics.remainingQuota ?? 0) : 0;
  const totalEvents = metrics ? (metrics.totalEvents ?? eventsCount) : eventsCount;

  const totalQuota = ticketsSold + remainingQuota;
  const occupancyPct = totalQuota > 0 ? Math.round((ticketsSold / totalQuota) * 100) : 0;

  const timelineData = metrics?.revenueTimeline && metrics.revenueTimeline.length > 0
    ? metrics.revenueTimeline
    : [];

  const rawCategoryData = metrics?.categoryDistribution && metrics.categoryDistribution.length > 0
    ? metrics.categoryDistribution
    : [];

  const categoryData = rawCategoryData.map((cat, idx) => ({
    ...cat,
    color: cat.color || MONOCHROME_PALETTE[idx % MONOCHROME_PALETTE.length],
  }));

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full text-[#F4F4F6]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          label="Total Pendapatan Tiket"
          value={formatIDR(totalRevenue)}
          subtext={ticketsSold > 0 ? `Dari ${ticketsSold} tiket terbit` : 'Belum ada transaksi tercatat'}
          icon={DollarSign}
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
          value={`${totalEvents} Pertunjukan`}
          subtext="Terdaftar di katalog"
          icon={BarChart3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between">
          <div className="border-b border-[#272A38] pb-4">
            <h3 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">
              Pendapatan Penjualan Tiket per Bulan
            </h3>
            <p className="text-xs font-normal text-[#A1A1AA] mt-1 m-0">
              Total nilai transaksi tiket terkonfirmasi berdasarkan data server.
            </p>
          </div>

          {timelineData.length > 0 ? (
            <div className="h-64 sm:h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" stroke="#A1A1AA" fontSize={12} tickLine={false} />
                  <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000000)}JT`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#14161F', borderColor: '#3E4357', color: '#FFFFFF', fontSize: '12px', borderRadius: '8px' }}
                    formatter={(val: any) => [formatIDR(Number(val)), 'Pendapatan']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FFFFFF" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-[#3E4357] rounded-xl mt-6 p-6 bg-[#0C0D12]">
              <p className="text-sm font-medium text-white m-0">Belum Ada Riwayat Pendapatan Bulanan</p>
              <p className="text-xs text-[#94A3B8] mt-1.5 m-0 max-w-sm">
                Grafik akan terisi otomatis setelah terdapat transaksi pesanan tiket yang tercatat di sistem.
              </p>
            </div>
          )}
        </div>

        <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col justify-between">
          <div className="border-b border-[#272A38] pb-4">
            <h3 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">
              Distribusi Pendapatan per Kategori Kursi
            </h3>
            <p className="text-xs font-normal text-[#A1A1AA] mt-1 m-0">
              Komposisi nilai penjualan berdasarkan kelas tempat duduk.
            </p>
          </div>

          {categoryData.length > 0 ? (
            <>
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
                      contentStyle={{ backgroundColor: '#14161F', borderColor: '#3E4357', color: '#F4F4F6', fontSize: '12px', borderRadius: '8px' }}
                      formatter={(val: any) => [formatIDR(Number(val)), 'Omset']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5 mt-2 pt-3 border-t border-[#272A38]">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex justify-between items-center text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                      <span className="text-[#E4E4E7] truncate">{cat.name}</span>
                    </div>
                    <span className="text-white font-mono font-medium shrink-0 tabular-nums">{formatIDR(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center border border-dashed border-[#3E4357] rounded-xl mt-6 p-6 bg-[#0C0D12]">
              <p className="text-sm font-medium text-white m-0">Belum Ada Data Kategori Terjual</p>
              <p className="text-xs text-[#94A3B8] mt-1.5 m-0">
                Proporsi kelas kursi akan tampil setelah ada pesanan masuk.
              </p>
            </div>
          )}
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
}> = ({ label, value, subtext, icon: Icon }) => (
  <div className="p-5 sm:p-6 border border-[#272A38] bg-[#14161F] rounded-xl transition-colors hover:border-white/30">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase">{label}</span>
      <div className="w-9 h-9 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white">
        <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
      </div>
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1.5 font-sans tabular-nums">{value}</div>
    <p className="text-xs font-normal text-[#A1A1AA] m-0 truncate">{subtext}</p>
  </div>
);
