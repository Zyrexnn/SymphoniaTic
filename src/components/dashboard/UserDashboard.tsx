import React, { useEffect, useState, useCallback, useMemo, useId } from 'react';
import {
  LayoutDashboard, Ticket as TicketIcon, RefreshCw, LogOut, ArrowLeft,
  ShoppingBag, CalendarClock, CheckCircle2, AlertCircle, Loader2, Download, Copy, Check, QrCode,
  ExternalLink, Eye, EyeOff, ShieldCheck, Lock, UserCheck, ChevronRight
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
  getUserDashboardSummaryAPI, getUserOrdersAPI, getUserRefundsAPI,
  updateUserProfileAPI, changeUserPasswordAPI, formatIDR,
} from '@/components/landing/data';
import type { UserDashboardSummary, OrderRecord, RefundRecord } from '@/components/landing/data';
import { drawTicketCanvas } from '@/lib/ticketCanvas';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField, fieldInputLight, FormField } from '@/components/ui/form-controls';

type Tab = 'summary' | 'orders' | 'refunds' | 'profile';

const ORDER_STATUSES = ['ISSUED', 'VERIFIED', 'CHECKED_IN', 'REMINDED', 'REFUND_REQUESTED', 'REFUNDED', 'CANCELLED'];

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  ISSUED: { label: 'Aktif / Tiket Terbit', style: 'border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10' },
  VERIFIED: { label: 'Terverifikasi Gate', style: 'border-[#171614]/25 text-[#171614] bg-[#ECE8DF]' },
  CHECKED_IN: { label: 'Sudah Check-In', style: 'border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10' },
  REMINDED: { label: 'Pengingat Dikirim', style: 'border-[#855A0E]/30 text-[#855A0E] bg-[#855A0E]/10' },
  REFUND_REQUESTED: { label: 'Menunggu Refund', style: 'border-[#855A0E]/30 text-[#855A0E] bg-[#855A0E]/10' },
  REFUNDED: { label: 'Direfund', style: 'border-[#B91C1C]/30 text-[#B91C1C] bg-[#B91C1C]/10' },
  CANCELLED: { label: 'Dibatalkan', style: 'border-[#CFC9BC] text-[#5C5850] bg-[#ECE8DF]' },
};

const REFUND_STATUS_CONFIG: Record<string, { label: string; style: string; step: number }> = {
  PENDING: { label: 'Menunggu Peninjauan', style: 'border-[#855A0E]/30 text-[#855A0E] bg-[#855A0E]/10', step: 1 },
  APPROVED: { label: 'Disetujui Admin', style: 'border-[#171614]/25 text-[#171614] bg-[#ECE8DF]', step: 2 },
  COMPLETED: { label: 'Dana Dicairkan', style: 'border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10', step: 3 },
  REJECTED: { label: 'Ditolak', style: 'border-[#B91C1C]/30 text-[#B91C1C] bg-[#B91C1C]/10', step: 0 },
};

function StatusBadge({ status }: { status: string }) {
  const conf = STATUS_CONFIG[status] || { label: status, style: 'border-[#CFC9BC] text-[#5C5850] bg-[#ECE8DF]' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border rounded-md font-semibold ${conf.style}`}>
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
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtext?: string;
  badge?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div>
        <div className="flex items-center justify-between text-[#5C5850] mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 text-[#C93018] shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider truncate">{label}</span>
          </div>
          {badge && (
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10 rounded shrink-0 font-semibold">
              {badge}
            </span>
          )}
        </div>
        <div className="font-display text-4xl font-semibold tracking-tight text-[#171614] leading-none mb-2 tabular-nums">
          {value}
        </div>
      </div>
      {subtext && <p className="text-xs text-[#5C5850] font-normal mt-2 mb-0">{subtext}</p>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left border border-[#E4DFD3] bg-white rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-[#171614] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="border border-[#E4DFD3] bg-white rounded-xl p-5 flex flex-col justify-between">
      {content}
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
      pdf.setFillColor(246, 244, 238);
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
    <FullscreenWorkspace
      isOpen={true}
      onClose={onClose}
      theme="light"
      eyebrow="SymphoniaTic Official Pass"
      title={order.eventTitle}
      subtitle={`${order.artist} · ${order.orderCode}`}
      maxWidthClass="max-w-3xl"
      backLabel="Tutup Pass"
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-[#E4DFD3] bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-[#C93018]" />
          <div className="bg-[#F6F4EE] p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white border border-[#E4DFD3] rounded-xl">
              <QRCodeCanvas
                value={order.qrCode || order.orderCode}
                size={200}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#171614"
              />
            </div>
            <div className="mt-4 flex items-center gap-3 bg-white text-[#171614] px-4 py-2 rounded-lg border border-[#CFC9BC]">
              <span className="font-mono text-base font-bold tracking-wider">{order.orderCode}</span>
              <button
                type="button"
                onClick={copyCode}
                aria-label="Salin kode pesanan"
                className="h-9 w-9 inline-flex items-center justify-center text-[#5C5850] hover:text-[#171614] rounded"
              >
                {copied ? <Check className="w-4 h-4 text-[#1F6E43]" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <span className="text-xs font-medium text-[#5C5850] mt-3">
              Tingkatkan kecerahan layar perangkat Anda saat pemindaian QR di pintu masuk gate.
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-[#E4DFD3]">
            <div>
              <span className="text-xs text-[#6B665D] block mb-1">Tanggal &amp; Waktu</span>
              <span className="text-[#171614] font-semibold block">{order.date}</span>
            </div>
            <div>
              <span className="text-xs text-[#6B665D] block mb-1">Open Gate</span>
              <span className="text-[#171614] font-semibold block">{order.openGate || 'Sesuai Jadwal Venue'}</span>
            </div>
            <div>
              <span className="text-xs text-[#6B665D] block mb-1">Venue</span>
              <span className="text-[#171614] font-semibold block">{order.venue}</span>
            </div>
            <div>
              <span className="text-xs text-[#6B665D] block mb-1">Pemegang Tiket</span>
              <span className="text-[#171614] font-semibold block">{order.userName}</span>
            </div>
            <div>
              <span className="text-xs text-[#6B665D] block mb-1">Kategori Kursi</span>
              <span className="text-[#171614] font-semibold block">
                {order.categoryName} ({order.quantity}x Tiket)
              </span>
            </div>
            <div>
              <span className="text-xs text-[#6B665D] block mb-1">Nomor Kursi</span>
              <span className="text-[#C93018] font-mono font-bold block">
                {order.seatNumbers || 'Sesuai Kategori'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={dlPNG}
            disabled={!!downloading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-[#171614] border border-[#CFC9BC] bg-white hover:border-[#171614] rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.7} aria-hidden="true" />
            <span>{downloading === 'PNG' ? 'Memproses...' : 'Unduh Gambar (PNG)'}</span>
          </button>
          <button
            type="button"
            onClick={dlPDF}
            disabled={!!downloading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#C93018] hover:bg-[#A82511] rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.7} aria-hidden="true" />
            <span>{downloading === 'PDF' ? 'Memproses...' : 'Unduh Dokumen (PDF)'}</span>
          </button>
        </div>
      </div>
    </FullscreenWorkspace>
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
      pdf.setFillColor(246, 244, 238);
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
    <div className="border border-[#E4DFD3] bg-white rounded-xl flex flex-col justify-between transition-colors hover:border-[#CFC9BC] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#E4DFD3] bg-[#F6F4EE]">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-[#171614] uppercase tracking-wider font-bold">
            {order.orderCode}
          </span>
          <span className="text-xs text-[#6B665D] mt-0.5">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : order.date}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-mono text-[#171614] font-bold tabular-nums">{formatIDR(order.totalPrice)}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C93018] block mb-1">
            Pertunjukan Resmi
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#171614] tracking-tight m-0">
            {order.eventTitle}
          </h3>
          <p className="text-xs text-[#5C5850] mt-1 mb-0">{order.artist}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-y border-[#E4DFD3] py-3.5">
          <div>
            <span className="text-[#6B665D] block mb-0.5">Tanggal &amp; Waktu</span>
            <span className="text-[#171614] font-semibold">{order.date}</span>
          </div>
          <div>
            <span className="text-[#6B665D] block mb-0.5">Open Gate</span>
            <span className="text-[#171614] font-semibold">{order.openGate || 'Sesuai Jadwal Venue'}</span>
          </div>
          <div>
            <span className="text-[#6B665D] block mb-0.5">Venue</span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#171614] font-semibold hover:text-[#C93018] inline-flex items-center gap-1"
            >
              <span>{order.venue}</span>
              <ExternalLink className="w-3 h-3 text-[#6B665D]" aria-hidden="true" />
            </a>
          </div>
          <div>
            <span className="text-[#6B665D] block mb-0.5">Pemegang Tiket</span>
            <span className="text-[#171614] font-semibold">{order.userName}</span>
          </div>
          <div>
            <span className="text-[#6B665D] block mb-0.5">Kategori &amp; Jumlah</span>
            <span className="text-[#171614] font-semibold">
              {order.categoryName} ({order.quantity}x)
            </span>
          </div>
          <div>
            <span className="text-[#6B665D] block mb-0.5">Nomor Kursi</span>
            <span className="text-[#C93018] font-mono font-bold">
              {order.seatNumbers || 'Sesuai Kategori'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#F6F4EE] border border-[#E4DFD3] rounded-lg flex items-center justify-center shrink-0">
              <QRCodeSVG value={order.qrCode || order.orderCode} size={48} level="M" fgColor="#171614" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-semibold text-[#171614] tracking-wider">{order.orderCode}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label="Salin kode pesanan"
                  className="h-9 w-9 inline-flex items-center justify-center text-[#5C5850] hover:text-[#171614] rounded"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#1F6E43]" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                </button>
              </div>
              <span className="text-xs text-[#6B665D]">Scan di gate konser</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenModal(order)}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-[#171614] border border-[#CFC9BC] bg-[#F6F4EE] hover:border-[#171614] rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" strokeWidth={1.7} aria-hidden="true" />
            <span>Buka QR Gate</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#F6F4EE] border-t border-[#E4DFD3] grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={dlPNG}
          disabled={!!downloading}
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#171614] bg-white border border-[#CFC9BC] hover:border-[#171614] rounded-lg transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.7} aria-hidden="true" />
          <span>{downloading === 'PNG' ? '...' : 'PNG Pass'}</span>
        </button>
        <button
          type="button"
          onClick={dlPDF}
          disabled={!!downloading}
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#C93018] hover:bg-[#A82511] rounded-lg transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.7} aria-hidden="true" />
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
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<OrderRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, ordRes] = await Promise.all([
        getUserDashboardSummaryAPI(),
        getUserOrdersAPI(),
      ]);
      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
      if (ordRes.success && Array.isArray(ordRes.data)) {
        setOrders(ordRes.data.filter((o) => ['ISSUED', 'VERIFIED', 'REMINDED'].includes(o.status)));
      }
      if (!sumRes.success && !ordRes.success) {
        setError('Gagal memuat ringkasan tiket akun Anda.');
      }
    } catch {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-6 h-6 text-[#C93018] animate-spin mb-3" strokeWidth={1.7} aria-hidden="true" />
        <span className="text-xs font-mono text-[#5C5850] uppercase tracking-wider">Memuat Ringkasan Akun...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="border border-[#B91C1C]/30 bg-[#B91C1C]/10 rounded-xl p-6 text-center space-y-3">
        <p className="text-sm text-[#B91C1C] m-0">{error}</p>
        <button
          type="button"
          onClick={load}
          className="min-h-[44px] px-5 py-2 rounded-lg bg-[#C93018] text-white text-xs font-semibold hover:bg-[#A82511]"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const activeTicket = orders.length > 0 ? orders[0] : null;

  return (
    <div className="flex flex-col gap-8">
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
          badge="Aktif"
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
        <div className="border border-[#E4DFD3] bg-white rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex flex-col justify-between max-w-xl">
            <div>
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-mono uppercase tracking-wider border border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10 rounded-md mb-4 font-semibold">
                Tiket Konser Mendatang
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171614] tracking-tight mb-1">
                {activeTicket.eventTitle}
              </h2>
              <p className="text-sm text-[#5C5850] mb-6">{activeTicket.artist}</p>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-[#E4DFD3] pt-4 mb-6">
                <div>
                  <span className="text-[#6B665D] block mb-0.5">Tanggal &amp; Jam</span>
                  <span className="text-[#171614] font-semibold">{activeTicket.date}</span>
                </div>
                <div>
                  <span className="text-[#6B665D] block mb-0.5">Open Gate</span>
                  <span className="text-[#171614] font-semibold">{activeTicket.openGate || 'Sesuai Jadwal Venue'}</span>
                </div>
                <div>
                  <span className="text-[#6B665D] block mb-0.5">Lokasi Venue</span>
                  <span className="text-[#171614] font-semibold">{activeTicket.venue}</span>
                </div>
                <div>
                  <span className="text-[#6B665D] block mb-0.5">Kategori</span>
                  <span className="text-[#171614] font-semibold">{activeTicket.categoryName} ({activeTicket.quantity}x)</span>
                </div>
                <div>
                  <span className="text-[#6B665D] block mb-0.5">Nomor Kursi</span>
                  <span className="text-[#C93018] font-mono font-bold">
                    {activeTicket.seatNumbers || 'Sesuai Kategori'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B665D] block mb-0.5">Kode Order</span>
                  <span className="text-[#171614] font-mono font-semibold">{activeTicket.orderCode}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedTicket(activeTicket)}
                className="min-h-[46px] inline-flex items-center gap-2 py-2.5 px-5 bg-[#C93018] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A82511] rounded-lg transition-colors"
              >
                <QrCode className="w-4 h-4" aria-hidden="true" />
                <span>Buka Pass Gate</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('orders')}
                className="min-h-[46px] inline-flex items-center gap-2 py-2.5 px-5 text-xs font-semibold uppercase tracking-wider text-[#171614] border border-[#CFC9BC] hover:border-[#171614] rounded-lg transition-colors"
              >
                <span>Lihat Semua Tiket</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 border border-[#E4DFD3] bg-[#F6F4EE] rounded-xl text-center min-w-[240px]">
            <div className="p-3 bg-white border border-[#E4DFD3] rounded-lg mb-3">
              <QRCodeSVG value={activeTicket.qrCode || activeTicket.orderCode} size={128} level="H" fgColor="#171614" />
            </div>
            <span className="text-xs font-mono font-bold text-[#171614] tracking-widest">{activeTicket.orderCode}</span>
            <span className="text-xs text-[#5C5850] mt-1">Tunjukkan di pintu masuk</span>
          </div>
        </div>
      ) : (
        <div className="border border-[#E4DFD3] bg-white rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <TicketIcon className="w-10 h-10 text-[#6B665D] mb-4" strokeWidth={1.3} aria-hidden="true" />
          <h3 className="font-display text-2xl font-semibold text-[#171614] mb-1">Belum Ada Tiket Mendatang</h3>
          <p className="text-sm text-[#5C5850] max-w-md mb-6">
            Anda belum memiliki tiket konser yang akan datang. Jelajahi jadwal pertunjukan kami untuk memesan tiket.
          </p>
          <a
            href="/events"
            className="min-h-[46px] inline-flex items-center gap-2 py-2.5 px-6 bg-[#C93018] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A82511] rounded-lg transition-colors"
          >
            <span>Jelajahi Konser</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onSelectTab('orders')}
          className="text-left border border-[#E4DFD3] p-6 bg-white rounded-xl hover:border-[#171614] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
        >
          <TicketIcon className="w-6 h-6 text-[#C93018] mb-4" strokeWidth={1.6} aria-hidden="true" />
          <div className="text-sm font-semibold text-[#171614] flex items-center justify-between mb-1">
            <span>Kelola Tiket &amp; E-Pass</span>
            <ChevronRight className="w-4 h-4 text-[#6B665D] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
          <p className="text-xs text-[#5C5850] m-0">Unduh E-Ticket PNG/PDF dan lihat kode QR gate.</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('refunds')}
          className="text-left border border-[#E4DFD3] p-6 bg-white rounded-xl hover:border-[#171614] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
        >
          <RefreshCw className="w-6 h-6 text-[#C93018] mb-4" strokeWidth={1.6} aria-hidden="true" />
          <div className="text-sm font-semibold text-[#171614] flex items-center justify-between mb-1">
            <span>Status Refund &amp; Pencairan</span>
            <ChevronRight className="w-4 h-4 text-[#6B665D] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
          <p className="text-xs text-[#5C5850] m-0">Pantau peninjauan dan pencairan dana tiket Anda.</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className="text-left border border-[#E4DFD3] p-6 bg-white rounded-xl hover:border-[#171614] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
        >
          <UserCheck className="w-6 h-6 text-[#C93018] mb-4" strokeWidth={1.6} aria-hidden="true" />
          <div className="text-sm font-semibold text-[#171614] flex items-center justify-between mb-1">
            <span>Profil &amp; Keamanan Akun</span>
            <ChevronRight className="w-4 h-4 text-[#6B665D] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
          <p className="text-xs text-[#5C5850] m-0">Perbarui data diri dan ubah kata sandi akses.</p>
        </button>
      </div>

      {selectedTicket && <TicketModal order={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<OrderRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserOrdersAPI(filter || undefined);
      if (res.success && Array.isArray(res.data)) setOrders(res.data);
      else setOrders([]);
    } catch {
      setError('Gagal memuat daftar tiket Anda.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-[#E4DFD3]">
        <button
          type="button"
          onClick={() => setFilter('')}
          aria-pressed={!filter}
          className={`min-h-[40px] px-3.5 py-2 text-xs font-mono uppercase tracking-wider border rounded-lg whitespace-nowrap transition-colors ${
            !filter
              ? 'border-[#C93018] text-white bg-[#C93018] font-semibold'
              : 'border-[#CFC9BC] text-[#5C5850] hover:text-[#171614] hover:border-[#171614] bg-white'
          }`}
        >
          Semua Tiket
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            type="button"
            key={s}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-mono uppercase tracking-wider border rounded-lg whitespace-nowrap transition-colors ${
              filter === s
                ? 'border-[#C93018] text-white bg-[#C93018] font-semibold'
                : 'border-[#CFC9BC] text-[#5C5850] hover:text-[#171614] hover:border-[#171614] bg-white'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-6 h-6 text-[#C93018] animate-spin mb-3" strokeWidth={1.7} aria-hidden="true" />
          <span className="text-xs font-mono text-[#5C5850] uppercase tracking-wider">Memuat Daftar E-Ticket...</span>
        </div>
      ) : error ? (
        <div role="alert" className="border border-[#B91C1C]/30 bg-[#B91C1C]/10 rounded-xl p-6 text-center space-y-3">
          <p className="text-sm text-[#B91C1C] m-0">{error}</p>
          <button
            type="button"
            onClick={load}
            className="min-h-[44px] px-5 py-2 rounded-lg bg-[#C93018] text-white text-xs font-semibold hover:bg-[#A82511]"
          >
            Muat Ulang
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-[#E4DFD3] bg-white rounded-xl py-16 px-6 text-center flex flex-col items-center">
          <TicketIcon className="w-8 h-8 text-[#6B665D] mb-3" strokeWidth={1.3} aria-hidden="true" />
          <p className="font-display text-xl text-[#171614] font-semibold mb-1">Tidak Ada Pesanan Tiket</p>
          <p className="text-sm text-[#5C5850] max-w-sm">
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
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserRefundsAPI();
      if (res.success && Array.isArray(res.data)) setRefunds(res.data);
      else setRefunds([]);
    } catch {
      setError('Gagal memuat data pengajuan refund.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-6 h-6 text-[#C93018] animate-spin mb-3" strokeWidth={1.7} aria-hidden="true" />
        <span className="text-xs font-mono text-[#5C5850] uppercase tracking-wider">Memuat Data Refund...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="border border-[#B91C1C]/30 bg-[#B91C1C]/10 rounded-xl p-6 text-center space-y-3">
        <p className="text-sm text-[#B91C1C] m-0">{error}</p>
        <button
          type="button"
          onClick={load}
          className="min-h-[44px] px-5 py-2 rounded-lg bg-[#C93018] text-white text-xs font-semibold hover:bg-[#A82511]"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="border border-[#E4DFD3] bg-white rounded-xl py-16 px-6 text-center flex flex-col items-center">
        <RefreshCw className="w-8 h-8 text-[#6B665D] mb-3" strokeWidth={1.3} aria-hidden="true" />
        <h3 className="font-display text-2xl font-semibold text-[#171614] mb-1">Belum Ada Pengajuan Refund</h3>
        <p className="text-sm text-[#5C5850] max-w-md mb-5">
          Apabila terdapat kendala jadwal, pengajuan pengembalian dana tiket Anda akan tercatat di sini.
        </p>
        <a
          href="/refund"
          className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-lg bg-[#C93018] text-white text-xs font-semibold hover:bg-[#A82511]"
        >
          Ajukan Refund Tiket
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {refunds.map((r) => {
        const conf = REFUND_STATUS_CONFIG[r.status] || { label: r.status, style: 'border-[#CFC9BC] text-[#5C5850]', step: 1 };
        return (
          <div key={r.id} className="border border-[#E4DFD3] bg-white rounded-xl p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DFD3] pb-4">
              <div>
                <span className="text-xs font-mono text-[#6B665D] uppercase tracking-wider block">Kode Order Refund</span>
                <span className="text-base font-mono text-[#171614] font-bold">{r.orderCode}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-mono text-[#171614] font-bold tabular-nums">{formatIDR(r.amount)}</span>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-mono uppercase tracking-wider border rounded-md font-semibold ${conf.style}`}>
                  {conf.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-[#E4DFD3] text-center">
              <div className={`p-2.5 border rounded-lg ${conf.step >= 1 ? 'border-[#171614] text-[#171614] bg-[#F6F4EE] font-semibold' : 'border-[#E4DFD3] text-[#6B665D]'}`}>
                <span className="text-xs font-mono block">01. Diajukan</span>
              </div>
              <div className={`p-2.5 border rounded-lg ${conf.step >= 2 ? 'border-[#171614] text-[#171614] bg-[#F6F4EE] font-semibold' : 'border-[#E4DFD3] text-[#6B665D]'}`}>
                <span className="text-xs font-mono block">02. Verifikasi Admin</span>
              </div>
              <div className={`p-2.5 border rounded-lg ${conf.step >= 3 ? 'border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10 font-semibold' : 'border-[#E4DFD3] text-[#6B665D]'}`}>
                <span className="text-xs font-mono block">03. Cair</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#6B665D] block mb-0.5">Bank Tujuan</span>
                <span className="text-[#171614] font-semibold">{r.bankName}</span>
              </div>
              <div>
                <span className="text-[#6B665D] block mb-0.5">No. Rekening</span>
                <span className="text-[#171614] font-mono font-semibold">{r.accountNumber}</span>
              </div>
              <div>
                <span className="text-[#6B665D] block mb-0.5">Pemilik Rekening</span>
                <span className="text-[#171614] font-semibold">{r.accountHolder}</span>
              </div>
              <div>
                <span className="text-[#6B665D] block mb-0.5">Tanggal Pengajuan</span>
                <span className="text-[#171614] font-semibold">
                  {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#E4DFD3] text-xs">
              <div>
                <span className="text-[#6B665D] block mb-1">Alasan Pengajuan</span>
                <p className="text-[#171614] bg-[#F6F4EE] p-3 border border-[#E4DFD3] rounded-lg m-0">{r.reason || '-'}</p>
              </div>
              {r.adminNote && (
                <div>
                  <span className="text-[#6B665D] block mb-1">Catatan Verifikator Admin</span>
                  <p className="text-[#1F6E43] bg-[#1F6E43]/10 border border-[#1F6E43]/25 p-3 rounded-lg m-0">{r.adminNote}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PasswordInputRow({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <FormField label={label} htmlFor={id} required theme="light">
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className={`${fieldInputLight} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center text-[#6B665D] hover:text-[#171614] rounded-md"
        >
          {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </div>
    </FormField>
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

  return (
    <div className="flex flex-col gap-8">
      <div className="border border-[#E4DFD3] bg-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 bg-[#171614] text-[#F6F4EE] font-display text-2xl font-semibold flex items-center justify-center shrink-0 rounded-xl">
            {userInitials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-display text-2xl font-semibold text-[#171614] m-0">{user?.name}</h2>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10 rounded font-semibold">
                Terverifikasi
              </span>
            </div>
            <p className="text-xs text-[#5C5850] font-mono m-0">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs sm:text-right border-t sm:border-t-0 border-[#E4DFD3] pt-4 sm:pt-0 w-full sm:w-auto">
          <span className="text-xs font-mono text-[#6B665D] uppercase tracking-wider">Status Keanggotaan</span>
          <span className="text-sm font-semibold text-[#171614]">Official SymphoniaTic Member</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={saveProfile} className="border border-[#E4DFD3] bg-white rounded-xl p-5 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-[#E4DFD3] pb-4">
            <UserCheck className="w-4 h-4 text-[#C93018]" strokeWidth={1.7} aria-hidden="true" />
            <h3 className="text-sm font-semibold text-[#171614] m-0">Data Identitas Pemegang Pass</h3>
          </div>

          <TextInputField
            theme="light"
            label="Nama Lengkap Sesuai Identitas"
            required
            value={name}
            onValueChange={setName}
          />

          <TextInputField
            theme="light"
            label="Nomor Telepon / WhatsApp Aktif"
            value={phone}
            onValueChange={setPhone}
            placeholder="08xxxxxxxxxx"
          />

          <TextInputField
            theme="light"
            label="Alamat Email (Akun Utama)"
            value={user?.email || ''}
            onValueChange={() => {}}
            disabled
            hint="Alamat email digunakan untuk pengiriman berkas PDF E-Ticket."
          />

          {profileMsg && (
            <div
              role={profileMsg.type === 'error' ? 'alert' : 'status'}
              className={`p-3.5 text-sm border rounded-lg ${
                profileMsg.type === 'success'
                  ? 'border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10'
                  : 'border-[#B91C1C]/30 text-[#B91C1C] bg-[#B91C1C]/10'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C93018] text-white hover:bg-[#A82511] text-sm font-semibold transition-colors disabled:opacity-40 rounded-lg"
          >
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.7} aria-hidden="true" /> : 'Simpan Perubahan Profil'}
          </button>
        </form>

        <form onSubmit={changePwd} className="border border-[#E4DFD3] bg-white rounded-xl p-5 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-[#E4DFD3] pb-4">
            <Lock className="w-4 h-4 text-[#C93018]" strokeWidth={1.7} aria-hidden="true" />
            <h3 className="text-sm font-semibold text-[#171614] m-0">Keamanan &amp; Kata Sandi</h3>
          </div>

          <PasswordInputRow
            label="Kata Sandi Saat Ini"
            value={oldPwd}
            onChange={setOldPwd}
            autoComplete="current-password"
          />

          <PasswordInputRow
            label="Kata Sandi Baru (Min. 6 Karakter)"
            value={newPwd}
            onChange={setNewPwd}
            autoComplete="new-password"
          />

          <PasswordInputRow
            label="Konfirmasi Kata Sandi Baru"
            value={confirmPwd}
            onChange={setConfirmPwd}
            autoComplete="new-password"
          />

          {pwdMsg && (
            <div
              role={pwdMsg.type === 'error' ? 'alert' : 'status'}
              className={`p-3.5 text-sm border rounded-lg ${
                pwdMsg.type === 'success'
                  ? 'border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10'
                  : 'border-[#B91C1C]/30 text-[#B91C1C] bg-[#B91C1C]/10'
              }`}
            >
              {pwdMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pwdLoading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#171614] text-white hover:bg-[#C93018] text-sm font-semibold transition-colors disabled:opacity-40 rounded-lg"
          >
            {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.7} aria-hidden="true" /> : 'Perbarui Kata Sandi'}
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
      <div className="min-h-screen bg-[#F6F4EE] text-[#171614] flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="w-8 h-8 text-[#C93018] animate-spin mb-4" strokeWidth={1.7} aria-hidden="true" />
        <span className="text-xs font-mono text-[#5C5850] uppercase tracking-widest">Memuat Akun Anda...</span>
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
    <div className="min-h-screen bg-[#F6F4EE] text-[#171614] font-sans antialiased">
      <header className="border-b border-[#E4DFD3] bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="min-h-[44px] inline-flex items-center gap-2 text-xs font-medium text-[#5C5850] hover:text-[#171614] transition-colors px-2 -ml-2 rounded-lg"
            >
              <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs text-[#171614] font-semibold">{user?.name}</span>
              <span className="text-xs font-mono text-[#6B665D]">{user?.email}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-[#CFC9BC] bg-[#F6F4EE] text-[#171614] hover:border-[#171614] rounded-lg transition-colors"
            >
              <LogOut size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#E4DFD3] pb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018] m-0 mb-2">
              Portal Penonton
            </p>
            <h1 className="font-display text-3xl sm:text-5xl leading-tight tracking-[-0.02em] font-semibold text-[#171614] m-0">
              Selamat Datang, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="text-sm text-[#5C5850] mt-2 max-w-2xl mb-0">
              Kelola e-ticket konser, pantau status pengembalian dana, dan atur kredensial akun Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-[#1F6E43]/30 text-[#1F6E43] bg-[#1F6E43]/10 rounded-lg font-semibold">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Akun Terverifikasi
            </span>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Navigasi dashboard pengguna"
          className="flex items-center border-b border-[#E4DFD3] mb-8 overflow-x-auto no-scrollbar gap-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(t.id)}
                className={`min-h-[44px] inline-flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap rounded-t-lg border-b-2 ${
                  isActive
                    ? 'text-[#171614] border-[#C93018] bg-white font-semibold'
                    : 'text-[#6B665D] border-transparent hover:text-[#171614]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C93018]' : 'text-[#6B665D]'}`} strokeWidth={1.7} aria-hidden="true" />
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
