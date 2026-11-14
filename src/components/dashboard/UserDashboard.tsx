import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Ticket as TicketIcon, RefreshCw, LogOut, ArrowLeft,
  ShoppingBag, CalendarClock, CheckCircle2, AlertCircle, Loader2, Download, Copy, Check, QrCode,
  ExternalLink, Eye, X, ShieldCheck, Lock, UserCheck, Sparkles, ChevronRight
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  getUserDashboardSummaryAPI, getUserOrdersAPI, getUserRefundsAPI,
  updateUserProfileAPI, changeUserPasswordAPI, formatIDR,
} from '@/components/landing/data';
import type { UserDashboardSummary, OrderRecord, RefundRecord } from '@/components/landing/data';
import { drawTicketCanvas } from '@/lib/ticketCanvas';

type Tab = 'summary' | 'orders' | 'refunds' | 'profile';

const ORDER_STATUSES = ['ISSUED', 'VERIFIED', 'CHECKED_IN', 'REMINDED', 'REFUNDED', 'CANCELLED'];

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  ISSUED: { label: 'Aktif / Tiket Terbit', style: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  VERIFIED: { label: 'Terverifikasi Gate', style: 'border-white/30 text-white bg-white/10' },
  CHECKED_IN: { label: 'Sudah Check-In', style: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' },
  REMINDED: { label: 'Pengingat Dikirim', style: 'border-amber-500/30 text-amber-300 bg-amber-500/10' },
  REFUNDED: { label: 'Direfund', style: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
  CANCELLED: { label: 'Dibatalkan', style: 'border-white/10 text-[#71717A] bg-white/5' },
};

const REFUND_STATUS_CONFIG: Record<string, { label: string; style: string; step: number }> = {
  PENDING: { label: 'Menunggu Peninjauan', style: 'border-amber-500/30 text-amber-300 bg-amber-500/10', step: 1 },
  APPROVED: { label: 'Disetujui Admin', style: 'border-white/30 text-white bg-white/10', step: 2 },
  COMPLETED: { label: 'Dana Dicairkan', style: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10', step: 3 },
  REJECTED: { label: 'Ditolak', style: 'border-rose-500/30 text-rose-400 bg-rose-500/10', step: 0 },
};

function StatusBadge({ status }: { status: string }) {
  const conf = STATUS_CONFIG[status] || { label: status, style: 'border-white/10 text-[#71717A]' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-md ${conf.style}`}>
      {conf.label}
    </span>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  badge,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtext?: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`border border-[#272A38] bg-[#14161F] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-white/40 hover:bg-[#1D202D]' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between text-[#A1A1AA] mb-4">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{label}</span>
          </div>
          {badge && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border border-white/20 text-[#A1A1AA] bg-white/5 rounded">
              {badge}
            </span>
          )}
        </div>
        <div className="text-3xl sm:text-4xl font-light tracking-[-0.03em] text-white leading-none mb-2">
          {value}
        </div>
      </div>
      {subtext && <p className="text-xs text-[#A1A1AA] font-light mt-3">{subtext}</p>}
    </div>
  );
}

function TicketModal({ order, onClose }: { order: OrderRecord; onClose: () => void }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dlPNG = async () => {
    setDownloading('PNG');
    try {
      const c = drawTicketCanvas(order);
      const url = c.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `E-Ticket-${order.orderCode}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('PNG download error:', e);
    } finally {
      setDownloading(null);
    }
  };

  const dlPDF = async () => {
    setDownloading('PDF');
    try {
      const c = drawTicketCanvas(order);
      const { jsPDF } = await import('jspdf');
      const img = c.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = 180;
      const h = (c.height * w) / c.width;
      pdf.setFillColor(12, 13, 18);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(img, 'PNG', (pdf.internal.pageSize.getWidth() - w) / 2, 10, w, h);
      pdf.save(`E-Ticket-${order.orderCode}.pdf`);
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#14161F] border border-[#272A38] rounded-2xl p-6 sm:p-8 shadow-2xl text-white my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white transition-colors"
          aria-label="Tutup Pass"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#71717A] mb-2">
          <span>[ SYMPHONIATIC OFFICIAL PASS ]</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-light tracking-[-0.02em] text-white mb-1">
          {order.eventTitle}
        </h2>
        <p className="text-sm text-[#A1A1AA] font-light mb-6">{order.artist}</p>

        <div className="bg-white p-6 rounded-xl flex flex-col items-center justify-center text-center mb-6">
          <QrCode className="w-48 h-48 text-black" strokeWidth={1} />
          <div className="mt-4 flex items-center gap-3 bg-[#0C0D12] text-white px-4 py-2 rounded-lg border border-[#272A38]">
            <span className="font-mono text-sm tracking-wider">{order.orderCode}</span>
            <button onClick={copyCode} className="text-[#A1A1AA] hover:text-white transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[11px] font-mono text-[#71717A] mt-2">
            Tingkatkan kecerahan layar HP saat pemindaian QR di pintu masuk gate
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs border-y border-[#272A38] py-4 mb-6">
          <div>
            <span className="text-[#71717A] block mb-1">Tanggal & Waktu</span>
            <span className="text-white font-light block">{order.date}</span>
          </div>
          <div>
            <span className="text-[#71717A] block mb-1">Venue</span>
            <span className="text-white font-light block">{order.venue}</span>
          </div>
          <div>
            <span className="text-[#71717A] block mb-1">Pemegang Tiket</span>
            <span className="text-white font-light block">{order.userName}</span>
          </div>
          <div>
            <span className="text-[#71717A] block mb-1">Kategori</span>
            <span className="text-white font-light block">
              {order.categoryName} ({order.quantity}x)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={dlPNG}
            disabled={!!downloading}
            className="inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-mono uppercase tracking-wider text-white border border-[#272A38] bg-[#0C0D12] hover:bg-[#1D202D] hover:border-white/40 rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            <span>{downloading === 'PNG' ? 'Memproses...' : 'Unduh PNG'}</span>
          </button>
          <button
            onClick={dlPDF}
            disabled={!!downloading}
            className="inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-mono uppercase tracking-wider text-[#0C0D12] bg-white hover:bg-neutral-200 font-semibold rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            <span>{downloading === 'PDF' ? 'Memproses...' : 'Unduh PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function TicketCard({ order, onOpenModal }: { order: OrderRecord; onOpenModal: (order: OrderRecord) => void }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dlPNG = async () => {
    setDownloading('PNG');
    try {
      const c = drawTicketCanvas(order);
      const url = c.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `E-Ticket-${order.orderCode}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('PNG download error:', e);
    } finally {
      setDownloading(null);
    }
  };

  const dlPDF = async () => {
    setDownloading('PDF');
    try {
      const c = drawTicketCanvas(order);
      const { jsPDF } = await import('jspdf');
      const img = c.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = 180;
      const h = (c.height * w) / c.width;
      pdf.setFillColor(12, 13, 18);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(img, 'PNG', (pdf.internal.pageSize.getWidth() - w) / 2, 10, w, h);
      pdf.save(`E-Ticket-${order.orderCode}.pdf`);
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setDownloading(null);
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.venue)}`;

  return (
    <div className="border border-[#272A38] bg-[#14161F] rounded-xl flex flex-col justify-between transition-all hover:border-white/30 group overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#272A38] bg-[#0C0D12]/60">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
            E-TICKET PASS · {order.orderCode}
          </span>
          <span className="text-xs text-[#A1A1AA] font-light mt-0.5">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : order.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-white font-medium">{formatIDR(order.totalPrice)}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#71717A] block mb-1">Pertunjukan Resmi</span>
          <h3 className="text-lg sm:text-xl font-light text-white tracking-[-0.01em] group-hover:text-white transition-colors">
            {order.eventTitle}
          </h3>
          <p className="text-xs text-[#A1A1AA] font-light mt-0.5">{order.artist}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-y border-[#272A38] py-3">
          <div>
            <span className="text-[#71717A] block mb-0.5">Tanggal & Waktu</span>
            <span className="text-white font-light">{order.date}</span>
          </div>
          <div>
            <span className="text-[#71717A] block mb-0.5">Venue</span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-light hover:underline inline-flex items-center gap-1"
            >
              {order.venue} <ExternalLink className="w-3 h-3 text-[#A1A1AA]" />
            </a>
          </div>
          <div>
            <span className="text-[#71717A] block mb-0.5">Pemegang Tiket</span>
            <span className="text-white font-light">{order.userName}</span>
          </div>
          <div>
            <span className="text-[#71717A] block mb-0.5">Kategori & Jumlah</span>
            <span className="text-white font-light">
              {order.categoryName} ({order.quantity}x)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg flex items-center justify-center shrink-0">
              <QrCode className="w-12 h-12 text-black" strokeWidth={1.2} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono text-white tracking-wider">{order.orderCode}</span>
                <button onClick={copyCode} className="text-[#A1A1AA] hover:text-white transition-colors p-1" title="Salin Kode Order">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-[#71717A] font-light mt-0.5">Scan di gate konser</span>
            </div>
          </div>

          <button
            onClick={() => onOpenModal(order)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-mono uppercase tracking-wider text-white border border-[#272A38] bg-[#0C0D12] hover:bg-[#1D202D] hover:border-white/40 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Buka QR Gate</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#0C0D12]/60 border-t border-[#272A38] grid grid-cols-2 gap-2">
        <button
          onClick={dlPNG}
          disabled={!!downloading}
          className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-mono uppercase tracking-wider text-[#A1A1AA] hover:text-white border border-[#272A38] hover:border-white/30 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{downloading === 'PNG' ? '...' : 'PNG Pass'}</span>
        </button>
        <button
          onClick={dlPDF}
          disabled={!!downloading}
          className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-mono uppercase tracking-wider text-[#A1A1AA] hover:text-white border border-[#272A38] hover:border-white/30 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>{downloading === 'PDF' ? '...' : 'PDF Document'}</span>
        </button>
      </div>
    </div>
  );
}

function SummaryPanel({ onSelectTab }: { onSelectTab: (t: Tab) => void }) {
  const [summary, setSummary] = useState<UserDashboardSummary | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<OrderRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [sumRes, ordRes] = await Promise.all([
      getUserDashboardSummaryAPI(),
      getUserOrdersAPI('ISSUED')
    ]);
    if (sumRes.success && sumRes.data) setSummary(sumRes.data);
    if (ordRes.success && Array.isArray(ordRes.data)) setOrders(ordRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-6 h-6 text-white animate-spin mb-3" strokeWidth={1.5} />
        <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Memuat Ringkasan Konsul...</span>
      </div>
    );
  }

  const activeTicket = orders.length > 0 ? orders[0] : null;

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={ShoppingBag}
          label="Total Tiket"
          value={summary?.totalTicketsBought ?? 0}
          subtext="Seluruh tiket resmi terbeli"
          onClick={() => onSelectTab('orders')}
        />
        <KPICard
          icon={CalendarClock}
          label="Akan Datang"
          value={summary?.upcomingEventsCount ?? 0}
          subtext="Pertunjukan aktif mendatang"
          badge="Live Pass"
          onClick={() => onSelectTab('orders')}
        />
        <KPICard
          icon={CheckCircle2}
          label="Selesai"
          value={summary?.pastEventsCount ?? 0}
          subtext="Konser terverifikasi checked-in"
        />
        <KPICard
          icon={AlertCircle}
          label="Refund Aktif"
          value={summary?.activeRefundsCount ?? 0}
          subtext="Pengajuan dalam proses admin"
          onClick={() => onSelectTab('refunds')}
        />
      </div>

      {activeTicket ? (
        <div className="border border-[#272A38] bg-[#14161F] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex flex-col justify-between max-w-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 rounded-md mb-4">
                <Sparkles className="w-3 h-3" /> Tiket Konser Mendatang Utama
              </div>
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2">
                {activeTicket.eventTitle}
              </h2>
              <p className="text-sm text-[#A1A1AA] font-light mb-6">{activeTicket.artist}</p>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-[#272A38] pt-4 mb-6">
                <div>
                  <span className="text-[#71717A] block mb-0.5">Tanggal & Jam</span>
                  <span className="text-white font-light">{activeTicket.date}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block mb-0.5">Lokasi Venue</span>
                  <span className="text-white font-light">{activeTicket.venue}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block mb-0.5">Kategori</span>
                  <span className="text-white font-light">{activeTicket.categoryName} ({activeTicket.quantity}x)</span>
                </div>
                <div>
                  <span className="text-[#71717A] block mb-0.5">Kode Order</span>
                  <span className="text-white font-mono">{activeTicket.orderCode}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedTicket(activeTicket)}
                className="inline-flex items-center gap-2 py-3 px-5 bg-white text-[#0C0D12] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" /> Buka Pass Gate Fullscreen
              </button>
              <button
                onClick={() => onSelectTab('orders')}
                className="inline-flex items-center gap-2 py-3 px-5 text-xs font-mono uppercase tracking-wider text-[#A1A1AA] hover:text-white border border-[#272A38] hover:border-white/30 rounded-lg transition-colors cursor-pointer"
              >
                Lihat Semua Tiket <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 border border-[#272A38] bg-[#0C0D12] rounded-xl text-center min-w-[240px]">
            <div className="p-3 bg-white rounded-lg mb-3">
              <QrCode className="w-32 h-32 text-black" strokeWidth={1} />
            </div>
            <span className="text-xs font-mono text-white tracking-widest">{activeTicket.orderCode}</span>
            <span className="text-[10px] text-[#71717A] mt-1">Tunjukkan di pintu masuk</span>
          </div>
        </div>
      ) : (
        <div className="border border-[#272A38] bg-[#14161F] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <TicketIcon className="w-10 h-10 text-[#71717A] mb-4" strokeWidth={1} />
          <h3 className="text-lg font-light text-white mb-1">Belum Ada Tiket Mendatang</h3>
          <p className="text-xs text-[#A1A1AA] max-w-md font-light mb-6">
            Anda belum memiliki tiket konser simfoni yang akan datang. Jelajahi kalender pertunjukan kami untuk memesan tiket.
          </p>
          <a
            href="/events"
            className="inline-flex items-center gap-2 py-3 px-6 bg-white text-[#0C0D12] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Jelajahi Konser <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectTab('orders')}
          className="border border-[#272A38] p-6 bg-[#14161F] rounded-xl hover:border-white/40 cursor-pointer transition-all group"
        >
          <TicketIcon className="w-6 h-6 text-white mb-4" strokeWidth={1.5} />
          <h4 className="text-sm font-light text-white group-hover:text-white flex items-center justify-between mb-1">
            Kelola Tiket & E-Pass <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-xs text-[#A1A1AA] font-light">Unduh E-Ticket PNG/PDF dan kelola status pemeriksaan gate.</p>
        </div>

        <div
          onClick={() => onSelectTab('refunds')}
          className="border border-[#272A38] p-6 bg-[#14161F] rounded-xl hover:border-white/40 cursor-pointer transition-all group"
        >
          <RefreshCw className="w-6 h-6 text-white mb-4" strokeWidth={1.5} />
          <h4 className="text-sm font-light text-white group-hover:text-white flex items-center justify-between mb-1">
            Status Refund & Pencairan <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-xs text-[#A1A1AA] font-light">Pantau peninjauan dan pencairan dana pengembalian tiket Anda.</p>
        </div>

        <div
          onClick={() => onSelectTab('profile')}
          className="border border-[#272A38] p-6 bg-[#14161F] rounded-xl hover:border-white/40 cursor-pointer transition-all group"
        >
          <UserCheck className="w-6 h-6 text-white mb-4" strokeWidth={1.5} />
          <h4 className="text-sm font-light text-white group-hover:text-white flex items-center justify-between mb-1">
            Profil & Keamanan Akun <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-xs text-[#A1A1AA] font-light">Perbarui data diri pemegang tiket dan ubah kata sandi akses.</p>
        </div>
      </div>

      {selectedTicket && <TicketModal order={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<OrderRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getUserOrdersAPI(filter || undefined);
    if (res.success && Array.isArray(res.data)) setOrders(res.data);
    else setOrders([]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-[#272A38]">
        <button
          onClick={() => setFilter('')}
          className={`px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider border rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            !filter ? 'border-white text-[#0C0D12] bg-white font-semibold' : 'border-[#272A38] text-[#A1A1AA] hover:text-white hover:border-white/30 bg-[#14161F]'
          }`}
        >
          Semua Tiket
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-2 text-[10px] font-mono uppercase tracking-wider border rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filter === s ? 'border-white text-[#0C0D12] bg-white font-semibold' : 'border-[#272A38] text-[#A1A1AA] hover:text-white hover:border-white/30 bg-[#14161F]'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-6 h-6 text-white animate-spin mb-3" strokeWidth={1.5} />
          <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Memuat Daftar E-Ticket...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-[#272A38] bg-[#14161F] rounded-xl py-16 px-6 text-center flex flex-col items-center">
          <TicketIcon className="w-8 h-8 text-[#71717A] mb-3" strokeWidth={1} />
          <p className="text-sm text-white font-light mb-1">Tidak Ada Pesanan Tiket</p>
          <p className="text-xs text-[#A1A1AA] font-light max-w-sm">
            {filter ? `Tidak ditemukan tiket dengan status "${filter}".` : 'Anda belum membeli tiket konser. Tiket yang sudah dipesan akan tampil di sini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((o) => (
            <TicketCard key={o.id} order={o} onOpenModal={(ord) => setSelectedTicket(ord)} />
          ))}
        </div>
      )}

      {selectedTicket && <TicketModal order={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
}

function RefundsPanel() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getUserRefundsAPI();
    if (res.success && Array.isArray(res.data)) setRefunds(res.data);
    else setRefunds([]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-6 h-6 text-white animate-spin mb-3" strokeWidth={1.5} />
        <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">Memuat Data Refund...</span>
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="border border-[#272A38] bg-[#14161F] rounded-xl py-16 px-6 text-center flex flex-col items-center animate-fade-in">
        <RefreshCw className="w-8 h-8 text-[#71717A] mb-3" strokeWidth={1} />
        <h3 className="text-sm font-light text-white mb-1">Belum Ada Pengajuan Refund</h3>
        <p className="text-xs text-[#A1A1AA] font-light max-w-md">
          Apabila terdapat pembatalan pertunjukan atau kendala jadwal, pengajuan pengembalian dana tiket Anda akan tercatat secara transparan di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {refunds.map((r) => {
        const conf = REFUND_STATUS_CONFIG[r.status] || { label: r.status, style: 'border-white/10 text-[#71717A]', step: 1 };
        return (
          <div key={r.id} className="border border-[#272A38] bg-[#14161F] rounded-xl p-6 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#272A38] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">KODE ORDER / PERMINTAAN REFUND</span>
                <span className="text-base font-mono text-white">{r.orderCode}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-mono text-white font-medium">{formatIDR(r.amount)}</span>
                <span className={`inline-flex items-center px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-md ${conf.style}`}>
                  {conf.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-b border-[#272A38] text-center">
              <div className={`p-2 border rounded-lg ${conf.step >= 1 ? 'border-white/40 text-white bg-white/10' : 'border-[#272A38] text-[#71717A]'}`}>
                <span className="text-[10px] font-mono block">01. DIAJUKAN</span>
              </div>
              <div className={`p-2 border rounded-lg ${conf.step >= 2 ? 'border-white/40 text-white bg-white/10' : 'border-[#272A38] text-[#71717A]'}`}>
                <span className="text-[10px] font-mono block">02. VERIFIKASI ADMIN</span>
              </div>
              <div className={`p-2 border rounded-lg ${conf.step >= 3 ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-[#272A38] text-[#71717A]'}`}>
                <span className="text-[10px] font-mono block">03. CAIR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#71717A] block mb-0.5">Bank Tujuan</span>
                <span className="text-white font-medium">{r.bankName}</span>
              </div>
              <div>
                <span className="text-[#71717A] block mb-0.5">No. Rekening</span>
                <span className="text-white font-mono">{r.accountNumber}</span>
              </div>
              <div>
                <span className="text-[#71717A] block mb-0.5">Pemilik Rekening</span>
                <span className="text-white font-medium">{r.accountHolder}</span>
              </div>
              <div>
                <span className="text-[#71717A] block mb-0.5">Tanggal Pengajuan</span>
                <span className="text-white">{new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#272A38] text-xs">
              <div>
                <span className="text-[#71717A] block mb-1">Alasan Pengajuan:</span>
                <p className="text-white font-light bg-[#0C0D12] p-3 border border-[#272A38] rounded-lg">{r.reason}</p>
              </div>
              {r.adminNote && (
                <div>
                  <span className="text-[#71717A] block mb-1">Catatan Verifikator Admin:</span>
                  <p className="text-emerald-400 font-light bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">{r.adminNote}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfilePanel() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    const res = await updateUserProfileAPI(name.trim(), phone.trim());
    if (res.success && res.data) {
      updateUser(res.data);
      setProfileMsg({ text: 'Data profil berhasil diperbarui.', type: 'success' });
    } else {
      setProfileMsg({ text: res.message || 'Gagal memperbarui profil.', type: 'error' });
    }
    setProfileLoading(false);
  };

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd.length < 6) {
      setPwdMsg({ text: 'Kata sandi baru minimal 6 karakter.', type: 'error' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ text: 'Konfirmasi kata sandi baru tidak cocok.', type: 'error' });
      return;
    }
    setPwdLoading(true);
    const res = await changeUserPasswordAPI(oldPwd, newPwd);
    if (res.success) {
      setPwdMsg({ text: 'Kata sandi berhasil diperbarui.', type: 'success' });
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } else {
      setPwdMsg({ text: res.message || 'Gagal mengubah kata sandi.', type: 'error' });
    }
    setPwdLoading(false);
  };

  const userInitials = useMemo(() => {
    if (!user?.name) return 'US';
    return user.name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const inputCls =
    'w-full bg-[#0C0D12] border border-[#272A38] focus:border-white focus:ring-1 focus:ring-white px-4 py-3 text-sm text-white placeholder:text-[#71717A] outline-none transition-colors rounded-lg';
  const btnCls =
    'inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#0C0D12] hover:bg-neutral-200 text-xs font-mono font-semibold uppercase tracking-wider transition-colors disabled:opacity-40 rounded-lg cursor-pointer';

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="border border-[#272A38] bg-[#14161F] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#0C0D12] text-white font-mono text-xl font-light flex items-center justify-center shrink-0 border border-[#272A38] rounded-xl">
            {userInitials}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-light text-white">{user?.name}</h2>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 rounded">
                TERVERIFIKASI
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs text-right sm:text-right border-t sm:border-t-0 border-[#272A38] pt-4 sm:pt-0 w-full sm:w-auto">
          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">TIPE PASS KONTRIBUSI</span>
          <span className="text-sm font-mono text-white">OFFICIAL SYMPHONIATIC MEMBER</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={saveProfile} className="border border-[#272A38] bg-[#14161F] rounded-xl p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-[#272A38] pb-4">
            <UserCheck className="w-4 h-4 text-white" strokeWidth={1.5} />
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Data Identitas Pemegang Pass</h3>
          </div>

          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">Nama Lengkap Sesuai KTP/ID</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
          </label>

          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">Nomor Telepon / WhatsApp Aktif</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className={inputCls} />
          </label>

          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">Alamat Email (Akun Utama)</span>
            <input value={user?.email || ''} disabled className={inputCls + ' opacity-50 cursor-not-allowed'} />
            <span className="text-[10px] text-[#71717A] font-light mt-1 block">Alamat email digunakan untuk pengiriman berkas PDF E-Ticket.</span>
          </label>

          {profileMsg && (
            <div
              className={`p-3 text-xs font-light border rounded-lg ${
                profileMsg.type === 'success' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <button type="submit" disabled={profileLoading} className={btnCls}>
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : 'Simpan Perubahan Profil'}
          </button>
        </form>

        <form onSubmit={changePwd} className="border border-[#272A38] bg-[#14161F] rounded-xl p-6 sm:p-8 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-[#272A38] pb-4">
            <Lock className="w-4 h-4 text-white" strokeWidth={1.5} />
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Keamanan & Kredensial Akses</h3>
          </div>

          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">Kata Sandi Saat Ini</span>
            <input
              type="password"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              required
              autoComplete="current-password"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">Kata Sandi Baru (Min. 6 Karakter)</span>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              required
              autoComplete="new-password"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">Konfirmasi Kata Sandi Baru</span>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              required
              autoComplete="new-password"
              className={inputCls}
            />
          </label>

          {pwdMsg && (
            <div
              className={`p-3 text-xs font-light border rounded-lg ${
                pwdMsg.type === 'success' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
              }`}
            >
              {pwdMsg.text}
            </div>
          )}

          <button type="submit" disabled={pwdLoading} className={btnCls}>
            {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : 'Perbarui Kata Sandi'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardInner() {
  const { user, status, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('summary');

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-[#0C0D12] text-white flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-4" strokeWidth={1.5} />
        <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-widest">Otentikasi Akun User...</span>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'summary', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'orders', label: 'Tiket Saya', icon: TicketIcon },
    { id: 'refunds', label: 'Refund', icon: RefreshCw },
    { id: 'profile', label: 'Profil & Keamanan', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#0C0D12] text-white selection:bg-white selection:text-black font-sans antialiased">
      <header className="border-b border-[#272A38] bg-[#0C0D12]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A1A1AA] hover:text-white transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} /> <span className="hidden sm:inline">Kembali ke</span> Beranda
            </a>
            <span className="text-[#272A38]">|</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#71717A] hidden md:inline">
              SYMPHONIATIC CONCERT CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs text-white font-light">{user?.name}</span>
              <span className="text-[10px] font-mono text-[#71717A]">{user?.email}</span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider border border-[#272A38] bg-[#14161F] text-[#A1A1AA] hover:text-white hover:border-white/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={14} strokeWidth={1.5} /> <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#272A38] pb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#71717A] mb-2">
              <span>[ USER DASHBOARD CONSOLE ]</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.03em] font-light text-white">
              Selamat Datang, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="text-sm text-[#A1A1AA] font-light mt-2 max-w-2xl">
              Pusat kendali e-tiket konser simfoni, pemeriksaan barcode gate, pengajuan pengembalian dana, dan kredensial anggota SymphoniaTic.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" /> Akun Terverifikasi
            </span>
          </div>
        </div>

        <div className="flex items-center border-b border-[#272A38] mb-10 overflow-x-auto no-scrollbar gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2.5 px-5 py-3 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap rounded-t-lg border-b-2 cursor-pointer ${
                  isActive
                    ? 'text-white border-white bg-white/5 font-semibold'
                    : 'text-[#71717A] border-transparent hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#71717A]'}`} strokeWidth={1.5} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'summary' && <SummaryPanel onSelectTab={(t) => setTab(t)} />}
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'refunds' && <RefundsPanel />}
        {tab === 'profile' && <ProfilePanel />}
      </main>
    </div>
  );
}

export const UserDashboard: React.FC = () => (
  <AuthProvider>
    <DashboardInner />
  </AuthProvider>
);

export default UserDashboard;
