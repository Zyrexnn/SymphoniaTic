import React, { useEffect, useState, useCallback, useMemo, useId } from 'react';
import {
  LayoutDashboard, Ticket as TicketIcon, RefreshCw, LogOut, ArrowLeft,
  ShoppingBag, CalendarClock, CheckCircle2, AlertCircle, Loader2, Download, Copy, Check, QrCode,
  ExternalLink, Eye, EyeOff, ShieldCheck, Lock, UserCheck, ChevronRight, Tag
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import {
  getUserDashboardSummaryAPI, getUserOrdersAPI, getUserRefundsAPI,
  updateUserProfileAPI, changeUserPasswordAPI, submitUserRefundAPI, fetchActivePromosAPI, formatIDR,
} from '@/components/landing/data';
import type { UserDashboardSummary, OrderRecord, RefundRecord, PromotionItem } from '@/components/landing/data';
import { resolveOrderTickets, downloadOrderPNG, downloadOrderPDF } from '@/lib/ticketCanvas';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField, fieldInputLight, FormField } from '@/components/ui/form-controls';
import { TicketPassSwitcher } from '@/components/ui/TicketPassSwitcher';

type Tab = 'summary' | 'orders' | 'refunds' | 'profile';

const ORDER_STATUSES = ['ISSUED', 'VERIFIED', 'CHECKED_IN', 'REMINDED', 'REFUND_REQUESTED', 'REFUNDED', 'CANCELLED'];

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  ISSUED: { label: 'Aktif / Tiket Terbit', style: 'border-[#156E3F]/35 text-[#156E3F] bg-[#156E3F]/10' },
  VERIFIED: { label: 'Terverifikasi Gate', style: 'border-[#141413] text-[#141413] bg-[#D4FF2A]' },
  CHECKED_IN: { label: 'Sudah Check-In', style: 'border-[#156E3F]/35 text-[#156E3F] bg-[#156E3F]/10' },
  REMINDED: { label: 'Pengingat Dikirim', style: 'border-[#8A5A00]/35 text-[#8A5A00] bg-[#8A5A00]/10' },
  REFUND_REQUESTED: { label: 'Menunggu Refund', style: 'border-[#8A5A00]/35 text-[#8A5A00] bg-[#8A5A00]/10' },
  REFUNDED: { label: 'Direfund', style: 'border-[#C81E1E]/35 text-[#C81E1E] bg-[#C81E1E]/10' },
  CANCELLED: { label: 'Dibatalkan', style: 'border-[#DFDDD6] text-[#52514D] bg-[#EAE8E1]' },
};

const REFUND_STATUS_CONFIG: Record<string, { label: string; style: string; step: number }> = {
  PENDING: { label: 'Menunggu Peninjauan', style: 'border-[#8A5A00]/35 text-[#8A5A00] bg-[#8A5A00]/10', step: 1 },
  APPROVED: { label: 'Disetujui Admin', style: 'border-[#141413] text-[#141413] bg-[#D4FF2A]', step: 2 },
  COMPLETED: { label: 'Dana Dicairkan', style: 'border-[#156E3F]/35 text-[#156E3F] bg-[#156E3F]/10', step: 3 },
  REJECTED: { label: 'Ditolak', style: 'border-[#C81E1E]/35 text-[#C81E1E] bg-[#C81E1E]/10', step: 0 },
};

function StatusBadge({ status }: { status: string }) {
  const conf = STATUS_CONFIG[status] || { label: status, style: 'border-[#DFDDD6] text-[#52514D] bg-[#EAE8E1]' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-none font-bold ${conf.style}`}>
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
        <div className="flex items-center justify-between text-[#52514D] mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-4 h-4 text-[#141413] shrink-0" strokeWidth={2} aria-hidden="true" />
            <span className="text-[11px] font-bold uppercase tracking-wider truncate text-[#141413]">{label}</span>
          </div>
          {badge && (
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#141413] text-[#141413] bg-[#D4FF2A] rounded-none shrink-0 font-bold">
              {badge}
            </span>
          )}
        </div>
        <div className="font-display text-4xl font-extrabold tracking-[-0.04em] text-[#141413] leading-none mb-2 tabular-nums">
          {value}
        </div>
      </div>
      {subtext && <p className="text-xs text-[#52514D] font-normal mt-2 mb-0">{subtext}</p>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left border border-[#DFDDD6] bg-white rounded-none p-5 flex flex-col justify-between transition-colors hover:border-[#141413] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="border border-[#DFDDD6] bg-white rounded-none p-5 flex flex-col justify-between">
      {content}
    </div>
  );
}

function TicketModal({ order, onClose }: { order: OrderRecord; onClose: () => void }) {
  const tickets = useMemo(() => resolveOrderTickets(order), [order]);
  const [activeTab, setActiveTab] = useState<number>(() => (tickets.length > 1 ? 0 : -1));
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTicket = activeTab >= 0 ? tickets[activeTab] || null : null;
  const activeQRValue = activeTicket?.qrCode || order.qrCode || order.orderCode;
  const activeSeatLabel = activeTicket?.seatCode || order.seatNumbers || 'Sesuai Kategori';
  const activeAttendee = activeTicket?.attendeeName || order.userName;
  const activeDisplayCode = activeTicket?.seatCode
    ? `${order.orderCode}-${activeTicket.seatCode}`
    : order.orderCode;

  const copyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dlPNG = async () => {
    setDownloading('PNG');
    try {
      downloadOrderPNG(order, activeTicket, activeTab >= 0 ? activeTab : undefined);
    } catch (e) {
      console.error('PNG download error:', e);
    } finally {
      setDownloading(null);
    }
  };

  const dlPDF = async () => {
    setDownloading('PDF');
    try {
      await downloadOrderPDF(order);
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
      eyebrow="SymphoniaTic. Official Pass"
      title={order.eventTitle}
      subtitle={`${order.artist} · ${order.orderCode}`}
      maxWidthClass="max-w-3xl"
      backLabel="Tutup Pass"
    >
      <div className="space-y-6">
        <TicketPassSwitcher tickets={tickets} activeTab={activeTab} onChangeTab={setActiveTab} />

        <div className="rounded-none border border-[#141413] bg-white overflow-hidden">
          <div className="h-2 w-full bg-[#D4FF2A] border-b border-[#141413]" />
          <div className="bg-[#F4F3EF] p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white border border-[#141413] rounded-none">
              <QRCodeCanvas
                value={activeQRValue}
                size={200}
                level="H"
                includeMargin={false}
                bgColor="#FFFFFF"
                fgColor="#141413"
              />
            </div>
            <div className="mt-4 flex items-center gap-3 bg-white text-[#141413] px-4 py-2 rounded-none border border-[#141413]">
              <span className="font-mono text-base font-bold tracking-wider break-all">{activeDisplayCode}</span>
              <button
                type="button"
                onClick={copyCode}
                aria-label="Salin kode pesanan"
                className="h-9 w-9 shrink-0 inline-flex items-center justify-center text-[#52514D] hover:text-[#141413] rounded-none"
              >
                {copied ? <Check className="w-4 h-4 text-[#156E3F]" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <span className="text-xs font-medium text-[#52514D] mt-3">
              Tingkatkan kecerahan layar perangkat Anda saat pemindaian QR di pintu masuk gate.
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-[#DFDDD6]">
            <div>
              <span className="text-xs text-[#6E6D68] block mb-1">Tanggal &amp; Waktu</span>
              <span className="text-[#141413] font-bold block">{order.date}</span>
            </div>
            <div>
              <span className="text-xs text-[#6E6D68] block mb-1">Open Gate</span>
              <span className="text-[#141413] font-bold block">{order.openGate || 'Sesuai Jadwal Venue'}</span>
            </div>
            <div>
              <span className="text-xs text-[#6E6D68] block mb-1">Venue</span>
              <span className="text-[#141413] font-bold block">{order.venue}</span>
            </div>
            <div>
              <span className="text-xs text-[#6E6D68] block mb-1">Pemegang Tiket</span>
              <span className="text-[#141413] font-bold block">{activeAttendee}</span>
            </div>
            <div>
              <span className="text-xs text-[#6E6D68] block mb-1">Kategori Kursi</span>
              <span className="text-[#141413] font-bold block">
                {activeTicket && tickets.length > 1 ? order.categoryName : `${order.categoryName} (${order.quantity}x Tiket)`}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#6E6D68] block mb-1">Nomor Kursi</span>
              <span className="bg-[#D4FF2A] text-[#141413] px-2 py-0.5 font-mono font-bold inline-block">
                {activeSeatLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={dlPNG}
            disabled={!!downloading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#141413] border border-[#141413] bg-white hover:bg-[#EAE8E1] rounded-none transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
            <span>
              {downloading === 'PNG'
                ? 'Memproses...'
                : activeTicket?.seatCode
                ? `Unduh PNG (${activeTicket.seatCode})`
                : 'Unduh Gambar (PNG)'}
            </span>
          </button>
          <button
            type="button"
            onClick={dlPDF}
            disabled={!!downloading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#141413] bg-[#D4FF2A] border border-[#141413] hover:bg-[#C2EE1A] rounded-none transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
            <span>
              {downloading === 'PDF'
                ? 'Memproses...'
                : tickets.length > 1
                ? `Unduh ${tickets.length} Tiket (PDF)`
                : 'Unduh Dokumen (PDF)'}
            </span>
          </button>
        </div>
      </div>
    </FullscreenWorkspace>
  );
}

function DirectRefundModal({
  order,
  onClose,
  onSubmitted,
}: {
  order: OrderRecord;
  onClose: () => void;
  onSubmitted: (message: string) => void;
}) {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(order.userName || '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setError('Nama bank, nomor rekening, dan nama pemilik rekening wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitUserRefundAPI(order.orderCode, {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        reason: reason.trim(),
      });
      if (res.success) {
        onSubmitted(res.message || 'Pengajuan refund berhasil dikirim tanpa perlu verifikasi OTP tambahan.');
      } else {
        setError(res.message || 'Gagal mengajukan pengembalian dana.');
      }
    } catch {
      setError('Gagal terhubung ke server backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FullscreenWorkspace
      isOpen={true}
      onClose={onClose}
      theme="light"
      eyebrow="Refund 1-Klik Anggota"
      title={`Pengembalian Dana ${order.orderCode}`}
      subtitle={`${order.eventTitle} · ${formatIDR(order.totalPrice)}`}
      maxWidthClass="max-w-xl"
      backLabel="Batal"
    >
      <form onSubmit={handleSubmit} className="bg-white border border-[#141413] rounded-none p-6 sm:p-8 space-y-5">
        <div className="p-3.5 bg-[#F4F3EF] border border-[#DFDDD6] rounded-none flex items-start gap-2.5 text-xs text-[#52514D]">
          <ShieldCheck className="w-4 h-4 text-[#156E3F] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Karena Anda masuk sebagai anggota terverifikasi, permohonan refund diproses langsung tanpa kode OTP email tambahan.
          </span>
        </div>

        {error && (
          <div role="alert" className="p-3.5 bg-[#C81E1E]/10 border border-[#C81E1E] text-[#C81E1E] text-xs rounded-none flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <TextInputField
          theme="light"
          label="Nama Bank Tujuan"
          required
          placeholder="Contoh: BCA, Mandiri, BNI, BRI"
          value={bankName}
          onValueChange={setBankName}
        />

        <TextInputField
          theme="light"
          label="Nomor Rekening"
          required
          placeholder="Masukkan nomor rekening penerima"
          value={accountNumber}
          onValueChange={(val) => setAccountNumber(val.replace(/[^\d\s-]/g, ''))}
        />

        <TextInputField
          theme="light"
          label="Nama Pemilik Rekening"
          required
          placeholder="Nama sesuai buku tabungan"
          value={accountHolder}
          onValueChange={setAccountHolder}
        />

        <TextInputField
          theme="light"
          label="Alasan Pengajuan Refund (Opsional)"
          placeholder="Contoh: Perubahan jadwal pribadi"
          value={reason}
          onValueChange={setReason}
        />

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[46px] flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-[#141413] bg-[#F4F3EF] border border-[#141413] hover:bg-[#EAE8E1] rounded-none transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[46px] flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-[#141413] bg-[#D4FF2A] border border-[#141413] hover:bg-[#C2EE1A] disabled:opacity-45 rounded-none inline-flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Mengirim...</span>
              </>
            ) : (
              <span>Kirim Pengajuan Refund</span>
            )}
          </button>
        </div>
      </form>
    </FullscreenWorkspace>
  );
}

function TicketCard({
  order,
  onOpenModal,
  onRequestRefund,
}: {
  order: OrderRecord;
  onOpenModal: (order: OrderRecord) => void;
  onRequestRefund?: (order: OrderRecord) => void;
}) {
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
      downloadOrderPNG(order);
    } catch (e) {
      console.error('PNG download error:', e);
    } finally {
      setDownloading(null);
    }
  };

  const dlPDF = async () => {
    setDownloading('PDF');
    try {
      await downloadOrderPDF(order);
    } catch (e) {
      console.error('PDF download error:', e);
    } finally {
      setDownloading(null);
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.venue)}`;

  return (
    <div className="border border-[#DFDDD6] bg-white rounded-none flex flex-col justify-between transition-colors hover:border-[#141413] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#DFDDD6] bg-[#F4F3EF]">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-[#141413] uppercase tracking-wider font-bold">
            {order.orderCode}
          </span>
          <span className="text-xs text-[#6E6D68] mt-0.5">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : order.date}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {order.discountAmount && order.discountAmount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold border border-[#156E3F]/30 bg-[#156E3F]/10 text-[#156E3F] rounded-none">
              <Tag className="w-3 h-3" aria-hidden="true" />
              {order.promoCode ? `${order.promoCode} (-${formatIDR(order.discountAmount)})` : `Hemat ${formatIDR(order.discountAmount)}`}
            </span>
          ) : null}
          <span className="text-sm font-mono text-[#141413] font-bold tabular-nums">{formatIDR(order.totalPrice)}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514D] block mb-1">
            • Pertunjukan Resmi
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#141413] tracking-[-0.03em] m-0">
            {order.eventTitle}
          </h3>
          <p className="text-xs text-[#52514D] mt-1 mb-0">{order.artist}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs border-y border-[#DFDDD6] py-3.5">
          <div>
            <span className="text-[#6E6D68] block mb-0.5">Tanggal &amp; Waktu</span>
            <span className="text-[#141413] font-bold">{order.date}</span>
          </div>
          <div>
            <span className="text-[#6E6D68] block mb-0.5">Open Gate</span>
            <span className="text-[#141413] font-bold">{order.openGate || 'Sesuai Jadwal Venue'}</span>
          </div>
          <div>
            <span className="text-[#6E6D68] block mb-0.5">Venue</span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#141413] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>{order.venue}</span>
              <ExternalLink className="w-3 h-3 text-[#6E6D68]" aria-hidden="true" />
            </a>
          </div>
          <div>
            <span className="text-[#6E6D68] block mb-0.5">Pemegang Tiket</span>
            <span className="text-[#141413] font-bold">{order.userName}</span>
          </div>
          <div>
            <span className="text-[#6E6D68] block mb-0.5">Kategori &amp; Jumlah</span>
            <span className="text-[#141413] font-bold">
              {order.categoryName} ({order.quantity}x)
            </span>
          </div>
          <div>
            <span className="text-[#6E6D68] block mb-0.5">Nomor Kursi</span>
            <span className="bg-[#D4FF2A] text-[#141413] px-1.5 py-0.5 font-mono font-bold inline-block">
              {order.seatNumbers || 'Sesuai Kategori'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#F4F3EF] border border-[#DFDDD6] rounded-none flex items-center justify-center shrink-0">
              <QRCodeSVG value={order.qrCode || order.orderCode} size={48} level="M" fgColor="#141413" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-[#141413] tracking-wider">{order.orderCode}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label="Salin kode pesanan"
                  className="h-9 w-9 inline-flex items-center justify-center text-[#52514D] hover:text-[#141413] rounded-none"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#156E3F]" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                </button>
              </div>
              <span className="text-xs text-[#6E6D68]">Scan di gate konser</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenModal(order)}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-[#141413] border border-[#141413] bg-[#F4F3EF] hover:bg-[#141413] hover:text-[#D4FF2A] rounded-none transition-colors"
          >
            <Eye className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
            <span>Buka QR Gate</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#F4F3EF] border-t border-[#DFDDD6] flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={dlPNG}
          disabled={!!downloading}
          className="flex-1 min-w-[110px] min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141413] bg-white border border-[#141413] hover:bg-[#EAE8E1] rounded-none transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>{downloading === 'PNG' ? '...' : 'PNG Pass'}</span>
        </button>
        <button
          type="button"
          onClick={dlPDF}
          disabled={!!downloading}
          className="flex-1 min-w-[110px] min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141413] bg-[#D4FF2A] border border-[#141413] hover:bg-[#C2EE1A] rounded-none transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
          <span>{downloading === 'PDF' ? '...' : 'PDF Document'}</span>
        </button>
        {onRequestRefund && ['ISSUED', 'VERIFIED', 'REMINDED'].includes(order.status.toUpperCase()) && (
          <button
            type="button"
            onClick={() => onRequestRefund(order)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-[#C81E1E] bg-white border border-[#C81E1E] hover:bg-[#C81E1E] hover:text-white rounded-none transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span>Ajukan Refund</span>
          </button>
        )}
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
        <Loader2 className="w-6 h-6 text-[#141413] animate-spin mb-3" strokeWidth={1.8} aria-hidden="true" />
        <span className="text-xs font-mono text-[#52514D] uppercase tracking-wider">Memuat Ringkasan Akun...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="border border-[#C81E1E] bg-[#C81E1E]/10 rounded-none p-6 text-center space-y-3">
        <p className="text-sm text-[#C81E1E] font-medium m-0">{error}</p>
        <button
          type="button"
          onClick={load}
          className="min-h-[44px] px-5 py-2 rounded-none bg-[#141413] text-[#D4FF2A] text-xs font-bold uppercase tracking-wider hover:bg-[#2A2A28]"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  const activeTicket = orders.length > 0 ? orders[0] : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
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
        <div className="border border-[#141413] bg-white rounded-none p-6 sm:p-8 flex flex-col lg:flex-row justify-between gap-6">
          <div className="flex flex-col justify-between max-w-xl">
            <div>
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-[#141413] text-[#141413] bg-[#D4FF2A] rounded-none mb-4 font-bold">
                Tiket Konser Mendatang
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-[-0.03em] mb-1">
                {activeTicket.eventTitle}
              </h2>
              <p className="text-sm text-[#52514D] mb-6">{activeTicket.artist}</p>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-[#DFDDD6] pt-4 mb-6">
                <div>
                  <span className="text-[#6E6D68] block mb-0.5">Tanggal &amp; Jam</span>
                  <span className="text-[#141413] font-bold">{activeTicket.date}</span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block mb-0.5">Open Gate</span>
                  <span className="text-[#141413] font-bold">{activeTicket.openGate || 'Sesuai Jadwal Venue'}</span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block mb-0.5">Lokasi Venue</span>
                  <span className="text-[#141413] font-bold">{activeTicket.venue}</span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block mb-0.5">Kategori</span>
                  <span className="text-[#141413] font-bold">{activeTicket.categoryName} ({activeTicket.quantity}x)</span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block mb-0.5">Nomor Kursi</span>
                  <span className="bg-[#D4FF2A] text-[#141413] px-1.5 py-0.5 font-mono font-bold inline-block">
                    {activeTicket.seatNumbers || 'Sesuai Kategori'}
                  </span>
                </div>
                <div>
                  <span className="text-[#6E6D68] block mb-0.5">Kode Order</span>
                  <span className="text-[#141413] font-mono font-bold">{activeTicket.orderCode}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSelectedTicket(activeTicket)}
                className="min-h-[46px] inline-flex items-center gap-2 py-2.5 px-5 bg-[#D4FF2A] text-[#141413] border border-[#141413] text-xs font-bold uppercase tracking-wider hover:bg-[#C2EE1A] rounded-none transition-colors"
              >
                <QrCode className="w-4 h-4" aria-hidden="true" />
                <span>Buka Pass Gate</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTab('orders')}
                className="min-h-[46px] inline-flex items-center gap-2 py-2.5 px-5 text-xs font-bold uppercase tracking-wider text-[#141413] border border-[#141413] hover:bg-[#141413] hover:text-[#F4F3EF] rounded-none transition-colors"
              >
                <span>Lihat Semua Tiket</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 border border-[#DFDDD6] bg-[#F4F3EF] rounded-none text-center min-w-[240px]">
            <div className="p-3 bg-white border border-[#141413] rounded-none mb-3">
              <QRCodeSVG value={activeTicket.qrCode || activeTicket.orderCode} size={128} level="H" fgColor="#141413" />
            </div>
            <span className="text-xs font-mono font-bold text-[#141413] tracking-widest">{activeTicket.orderCode}</span>
            <span className="text-xs text-[#52514D] mt-1">Tunjukkan di pintu masuk</span>
          </div>
        </div>
      ) : (
        <div className="border border-[#DFDDD6] bg-white rounded-none p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <TicketIcon className="w-10 h-10 text-[#6E6D68] mb-4" strokeWidth={1.3} aria-hidden="true" />
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-[#141413] mb-1">Belum Ada Tiket Mendatang</h3>
          <p className="text-sm text-[#52514D] max-w-md mb-6">
            Anda belum memiliki tiket konser yang akan datang. Jelajahi jadwal pertunjukan kami untuk memesan tiket.
          </p>
          <a
            href="/events"
            className="min-h-[46px] inline-flex items-center gap-2 py-2.5 px-6 bg-[#D4FF2A] text-[#141413] border border-[#141413] text-xs font-bold uppercase tracking-wider hover:bg-[#C2EE1A] rounded-none transition-colors"
          >
            <span>Jelajahi Konser</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
        <button
          type="button"
          onClick={() => onSelectTab('orders')}
          className="text-left p-6 bg-white hover:bg-[#F9F8F5] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
        >
          <TicketIcon className="w-6 h-6 text-[#141413] mb-4" strokeWidth={1.8} aria-hidden="true" />
          <div className="text-sm font-bold text-[#141413] flex items-center justify-between mb-1">
            <span>Kelola Tiket &amp; E-Pass</span>
            <ChevronRight className="w-4 h-4 text-[#6E6D68] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
          <p className="text-xs text-[#52514D] m-0">Unduh E-Ticket PNG/PDF dan lihat kode QR gate.</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('refunds')}
          className="text-left p-6 bg-white hover:bg-[#F9F8F5] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
        >
          <RefreshCw className="w-6 h-6 text-[#141413] mb-4" strokeWidth={1.8} aria-hidden="true" />
          <div className="text-sm font-bold text-[#141413] flex items-center justify-between mb-1">
            <span>Status Refund &amp; Pencairan</span>
            <ChevronRight className="w-4 h-4 text-[#6E6D68] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
          <p className="text-xs text-[#52514D] m-0">Pantau peninjauan dan pencairan dana tiket Anda.</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className="text-left p-6 bg-white hover:bg-[#F9F8F5] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
        >
          <UserCheck className="w-6 h-6 text-[#141413] mb-4" strokeWidth={1.8} aria-hidden="true" />
          <div className="text-sm font-bold text-[#141413] flex items-center justify-between mb-1">
            <span>Profil &amp; Keamanan Akun</span>
            <ChevronRight className="w-4 h-4 text-[#6E6D68] group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
          <p className="text-xs text-[#52514D] m-0">Perbarui data diri dan ubah kata sandi akses.</p>
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
  const [refundOrder, setRefundOrder] = useState<OrderRecord | null>(null);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

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
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-[#DFDDD6]">
        <button
          type="button"
          onClick={() => setFilter('')}
          aria-pressed={!filter}
          className={`min-h-[40px] px-3.5 py-2 text-xs font-mono uppercase tracking-wider border rounded-none whitespace-nowrap transition-colors ${
            !filter
              ? 'border-[#141413] text-[#D4FF2A] bg-[#141413] font-bold'
              : 'border-[#DFDDD6] text-[#52514D] hover:text-[#141413] hover:border-[#141413] bg-white'
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
            className={`min-h-[40px] px-3.5 py-2 text-xs font-mono uppercase tracking-wider border rounded-none whitespace-nowrap transition-colors ${
              filter === s
                ? 'border-[#141413] text-[#D4FF2A] bg-[#141413] font-bold'
                : 'border-[#DFDDD6] text-[#52514D] hover:text-[#141413] hover:border-[#141413] bg-white'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {refundSuccessMsg && (
        <div role="status" className="p-4 bg-[#156E3F]/10 border border-[#156E3F] text-[#156E3F] text-xs sm:text-sm rounded-none flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{refundSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setRefundSuccessMsg(null)}
            className="text-xs font-bold uppercase tracking-wider underline shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-6 h-6 text-[#141413] animate-spin mb-3" strokeWidth={1.8} aria-hidden="true" />
          <span className="text-xs font-mono text-[#52514D] uppercase tracking-wider">Memuat Daftar E-Ticket...</span>
        </div>
      ) : error ? (
        <div role="alert" className="border border-[#C81E1E] bg-[#C81E1E]/10 rounded-none p-6 text-center space-y-3">
          <p className="text-sm text-[#C81E1E] m-0">{error}</p>
          <button
            type="button"
            onClick={load}
            className="min-h-[44px] px-5 py-2 rounded-none bg-[#141413] text-[#D4FF2A] text-xs font-bold uppercase tracking-wider"
          >
            Muat Ulang
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-[#DFDDD6] bg-white rounded-none py-16 px-6 text-center flex flex-col items-center">
          <TicketIcon className="w-8 h-8 text-[#6E6D68] mb-3" strokeWidth={1.4} aria-hidden="true" />
          <p className="font-display text-xl text-[#141413] font-extrabold mb-1">Tidak Ada Pesanan Tiket</p>
          <p className="text-sm text-[#52514D] max-w-sm">
            {filter ? `Tidak ditemukan tiket dengan status "${filter}".` : 'Anda belum membeli tiket konser. Tiket yang sudah dipesan akan tampil di sini.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((o) => (
            <TicketCard
              key={o.id}
              order={o}
              onOpenModal={(ord) => setSelectedTicket(ord)}
              onRequestRefund={(ord) => setRefundOrder(ord)}
            />
          ))}
        </div>
      )}

      {selectedTicket && <TicketModal order={selectedTicket} onClose={() => setSelectedTicket(null)} />}
      {refundOrder && (
        <DirectRefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onSubmitted={(msg) => {
            setRefundOrder(null);
            setRefundSuccessMsg(msg);
            load();
          }}
        />
      )}
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
        <Loader2 className="w-6 h-6 text-[#141413] animate-spin mb-3" strokeWidth={1.8} aria-hidden="true" />
        <span className="text-xs font-mono text-[#52514D] uppercase tracking-wider">Memuat Data Refund...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="border border-[#C81E1E] bg-[#C81E1E]/10 rounded-none p-6 text-center space-y-3">
        <p className="text-sm text-[#C81E1E] m-0">{error}</p>
        <button
          type="button"
          onClick={load}
          className="min-h-[44px] px-5 py-2 rounded-none bg-[#141413] text-[#D4FF2A] text-xs font-bold uppercase tracking-wider"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  if (refunds.length === 0) {
    return (
      <div className="border border-[#DFDDD6] bg-white rounded-none py-16 px-6 text-center flex flex-col items-center">
        <RefreshCw className="w-8 h-8 text-[#6E6D68] mb-3" strokeWidth={1.4} aria-hidden="true" />
        <h3 className="font-display text-2xl font-extrabold text-[#141413] mb-1">Belum Ada Pengajuan Refund</h3>
        <p className="text-sm text-[#52514D] max-w-md mb-5">
          Apabila terdapat kendala jadwal, pengajuan pengembalian dana tiket Anda akan tercatat di sini.
        </p>
        <a
          href="/refund"
          className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-none bg-[#D4FF2A] border border-[#141413] text-[#141413] text-xs font-bold uppercase tracking-wider hover:bg-[#C2EE1A]"
        >
          Ajukan Refund Tiket
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {refunds.map((r) => {
        const conf = REFUND_STATUS_CONFIG[r.status] || { label: r.status, style: 'border-[#DFDDD6] text-[#52514D]', step: 1 };
        return (
          <div key={r.id} className="border border-[#DFDDD6] bg-white rounded-none p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFDDD6] pb-4">
              <div>
                <span className="text-xs font-mono text-[#6E6D68] uppercase tracking-wider block">Kode Order Refund</span>
                <span className="text-base font-mono text-[#141413] font-bold">{r.orderCode}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-mono text-[#141413] font-bold tabular-nums">
                  {formatIDR(r.refundAmount ?? r.amount)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-mono uppercase tracking-wider border rounded-none font-bold ${conf.style}`}>
                  {conf.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-[#DFDDD6] text-center">
              <div className={`p-2.5 border rounded-none ${conf.step >= 1 ? 'border-[#141413] text-[#141413] bg-[#F4F3EF] font-bold' : 'border-[#DFDDD6] text-[#6E6D68]'}`}>
                <span className="text-xs font-mono block">01. Diajukan</span>
              </div>
              <div className={`p-2.5 border rounded-none ${conf.step >= 2 ? 'border-[#141413] text-[#141413] bg-[#F4F3EF] font-bold' : 'border-[#DFDDD6] text-[#6E6D68]'}`}>
                <span className="text-xs font-mono block">02. Verifikasi Admin</span>
              </div>
              <div className={`p-2.5 border rounded-none ${conf.step >= 3 ? 'border-[#156E3F] text-[#156E3F] bg-[#156E3F]/10 font-bold' : 'border-[#DFDDD6] text-[#6E6D68]'}`}>
                <span className="text-xs font-mono block">03. Cair</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#6E6D68] block mb-0.5">Bank Tujuan</span>
                <span className="text-[#141413] font-bold">{r.bankName}</span>
              </div>
              <div>
                <span className="text-[#6E6D68] block mb-0.5">No. Rekening</span>
                <span className="text-[#141413] font-mono font-bold">{r.accountNumber}</span>
              </div>
              <div>
                <span className="text-[#6E6D68] block mb-0.5">Pemilik Rekening</span>
                <span className="text-[#141413] font-bold">{r.accountHolder}</span>
              </div>
              <div>
                <span className="text-[#6E6D68] block mb-0.5">Tanggal Pengajuan</span>
                <span className="text-[#141413] font-bold">
                  {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#DFDDD6] text-xs">
              <div>
                <span className="text-[#6E6D68] block mb-1">Alasan Pengajuan</span>
                <p className="text-[#141413] bg-[#F4F3EF] p-3 border border-[#DFDDD6] rounded-none m-0">{r.reason || '-'}</p>
              </div>
              {r.adminNote && (
                <div>
                  <span className="text-[#6E6D68] block mb-1">Catatan Verifikator Admin</span>
                  <p className="text-[#156E3F] bg-[#156E3F]/10 border border-[#156E3F]/30 p-3 rounded-none m-0">{r.adminNote}</p>
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
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center text-[#6E6D68] hover:text-[#141413] rounded-none"
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
      <div className="border border-[#DFDDD6] bg-white rounded-none p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 bg-[#141413] text-[#D4FF2A] font-display text-2xl font-extrabold flex items-center justify-center shrink-0 rounded-none">
            {userInitials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="font-display text-2xl font-extrabold text-[#141413] m-0">{user?.name}</h2>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#156E3F]/30 text-[#156E3F] bg-[#156E3F]/10 rounded-none font-bold">
                Terverifikasi
              </span>
            </div>
            <p className="text-xs text-[#52514D] font-mono m-0">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-xs sm:text-right border-t sm:border-t-0 border-[#DFDDD6] pt-4 sm:pt-0 w-full sm:w-auto">
          <span className="text-xs font-mono text-[#6E6D68] uppercase tracking-wider">Status Keanggotaan</span>
          <span className="text-sm font-bold text-[#141413]">Official SymphoniaTic Member</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={saveProfile} className="border border-[#DFDDD6] bg-white rounded-none p-5 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-[#DFDDD6] pb-4">
            <UserCheck className="w-4 h-4 text-[#141413]" strokeWidth={2} aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141413] m-0">Data Identitas Pemegang Pass</h3>
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
              className={`p-3.5 text-sm border rounded-none ${
                profileMsg.type === 'success'
                  ? 'border-[#156E3F]/30 text-[#156E3F] bg-[#156E3F]/10'
                  : 'border-[#C81E1E]/30 text-[#C81E1E] bg-[#C81E1E]/10'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={profileLoading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4FF2A] border border-[#141413] text-[#141413] hover:bg-[#C2EE1A] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 rounded-none"
          >
            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} aria-hidden="true" /> : 'Simpan Perubahan Profil'}
          </button>
        </form>

        <form onSubmit={changePwd} className="border border-[#DFDDD6] bg-white rounded-none p-5 sm:p-7 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 border-b border-[#DFDDD6] pb-4">
            <Lock className="w-4 h-4 text-[#141413]" strokeWidth={2} aria-hidden="true" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#141413] m-0">Keamanan &amp; Kata Sandi</h3>
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
              className={`p-3.5 text-sm border rounded-none ${
                pwdMsg.type === 'success'
                  ? 'border-[#156E3F]/30 text-[#156E3F] bg-[#156E3F]/10'
                  : 'border-[#C81E1E]/30 text-[#C81E1E] bg-[#C81E1E]/10'
              }`}
            >
              {pwdMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pwdLoading}
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#141413] text-[#F4F3EF] hover:bg-[#2A2A28] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-40 rounded-none"
          >
            {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.8} aria-hidden="true" /> : 'Perbarui Kata Sandi'}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardInner() {
  const { user, status, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('summary');
  const [activePromos, setActivePromos] = useState<PromotionItem[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchActivePromosAPI().then(setActivePromos).catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-[#F4F3EF] text-[#141413] flex flex-col items-center justify-center text-center p-4">
        <Loader2 className="w-8 h-8 text-[#141413] animate-spin mb-4" strokeWidth={1.8} aria-hidden="true" />
        <span className="text-xs font-mono text-[#52514D] uppercase tracking-widest">Memuat Akun Anda...</span>
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
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] font-sans antialiased">
      <header className="border-b border-[#DFDDD6] bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#52514D] hover:text-[#141413] transition-colors px-2 -ml-2"
            >
              <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs text-[#141413] font-bold">{user?.name}</span>
              <span className="text-xs font-mono text-[#6E6D68]">{user?.email}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold uppercase tracking-wider border border-[#141413] bg-[#F4F3EF] text-[#141413] hover:bg-[#141413] hover:text-[#D4FF2A] rounded-none transition-colors"
            >
              <LogOut size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#DFDDD6] pb-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0 mb-2">
              • Portal Penonton
            </p>
            <h1 className="font-display text-3xl sm:text-5xl leading-[0.98] tracking-[-0.04em] font-extrabold text-[#141413] m-0">
              Selamat Datang, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="text-sm text-[#52514D] mt-2 max-w-2xl mb-0">
              Kelola e-ticket konser, pantau status pengembalian dana, dan atur kredensial akun Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border border-[#141413] text-[#141413] bg-[#D4FF2A] rounded-none font-bold">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Akun Terverifikasi
            </span>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-px bg-[#DFDDD6] border border-[#141413]">
          <div className="bg-white p-4 flex items-start gap-3">
            <Tag className="w-4 h-4 text-[#141413] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413] block">
                Akses Kode Promo
              </span>
              <p className="text-xs text-[#52514D] mt-0.5 mb-0">
                {activePromos.length > 0 ? (
                  <>
                    Tersedia saat ini:{' '}
                    {activePromos.slice(0, 3).map((p, idx) => (
                      <React.Fragment key={p.id}>
                        {idx > 0 && ', '}
                        <strong className="font-mono text-[#141413]">{p.code}</strong>
                      </React.Fragment>
                    ))}
                    .
                  </>
                ) : (
                  'Masukkan kode promo anggota yang berlaku saat melakukan pemesanan tiket.'
                )}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 flex items-start gap-3">
            <TicketIcon className="w-4 h-4 text-[#141413] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413] block">
                Kuota Hingga 4 Tiket
              </span>
              <p className="text-xs text-[#52514D] mt-0.5 mb-0">
                Pemesanan lebih leluasa hingga 4 kursi per transaksi (tamu dibatasi 2 tiket).
              </p>
            </div>
          </div>
          <div className="bg-white p-4 flex items-start gap-3">
            <RefreshCw className="w-4 h-4 text-[#141413] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413] block">
                Refund 1-Klik Tanpa OTP
              </span>
              <p className="text-xs text-[#52514D] mt-0.5 mb-0">
                Ajukan pengembalian dana langsung dari daftar tiket tanpa verifikasi OTP email.
              </p>
            </div>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Navigasi dashboard pengguna"
          className="flex items-center border-b border-[#DFDDD6] mb-8 overflow-x-auto no-scrollbar gap-2 -mx-4 px-4 sm:mx-0 sm:px-0"
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
                className={`min-h-[44px] inline-flex items-center gap-2 px-4 sm:px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap rounded-none border-b-2 ${
                  isActive
                    ? 'text-[#D4FF2A] border-[#141413] bg-[#141413] font-bold'
                    : 'text-[#6E6D68] border-transparent hover:text-[#141413]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4FF2A]' : 'text-[#6E6D68]'}`} strokeWidth={1.8} aria-hidden="true" />
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
