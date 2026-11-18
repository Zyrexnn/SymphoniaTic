import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  QrCode,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { drawTicketCanvas } from '@/lib/ticketCanvas';
import { parseDateFlexible, parseTimeString } from '@/lib/timeUtils';
import type { OrderRecord } from '../landing/data';

interface TicketDetailPageProps {
  orderCode?: string;
  code?: string;
}

const isConcertExpired = (order?: OrderRecord | null): boolean => {
  if (!order || !order.date) return false;
  const parsedDate = parseDateFlexible(order.date);
  if (!parsedDate) {
    const d = new Date(order.date);
    return !isNaN(d.getTime()) && d.getTime() < Date.now();
  }

  const year = parseInt(parsedDate.year, 10);
  const month = parsedDate.monthIndex;
  const day = parseInt(parsedDate.day, 10);

  if (order.eventTime) {
    const parsedTime = parseTimeString(order.eventTime);
    if (parsedTime) {
      const concertEnd = new Date(year, month, day, parsedTime.hours + 3, parsedTime.minutes, 0);
      return concertEnd.getTime() < Date.now();
    }
  }

  const endOfDay = new Date(year, month, day, 23, 59, 59);
  return endOfDay.getTime() < Date.now();
};

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ orderCode, code }) => {
  const initialCode = orderCode || code || '';
  const [, setOrderCode] = useState(initialCode);
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let targetCode = initialCode;
    if (!targetCode && typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      targetCode = pathParts[pathParts.length - 1];
    }
    if (targetCode) {
      setOrderCode(targetCode.toUpperCase());
      fetchTicketData(targetCode.toUpperCase());
    } else {
      setIsLoading(false);
      setErrorMessage('Kode pesanan tiket tidak ditentukan.');
    }
  }, [initialCode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTicketData = async (targetCode: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { lookupTicketAPI } = await import('../landing/data');
      const res = await lookupTicketAPI(targetCode);
      if (res.success && res.data) {
        setFoundOrder(res.data);
      } else {
        setErrorMessage(res.message || 'Kode tiket tidak ditemukan.');
      }
    } catch {
      setErrorMessage('Gagal menghubungi server untuk memverifikasi tiket.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!foundOrder) return;
    navigator.clipboard.writeText(foundOrder.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast(`Kode pesanan ${foundOrder.orderCode} berhasil disalin`);
  };

  const handleDownloadImage = async () => {
    if (!foundOrder) return;
    setIsDownloading(true);
    try {
      const canvas = drawTicketCanvas(foundOrder);
      const link = document.createElement('a');
      link.download = `SymphoniaTic-Pass-${foundOrder.orderCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('E-Ticket PNG berhasil diunduh');
    } catch {
      showToast('Gagal memproses gambar tiket');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!foundOrder) return;
    setIsDownloading(true);
    try {
      const canvas = drawTicketCanvas(foundOrder);
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.addImage(imgData, 'PNG', 15, 15, 180, 247.5);
      doc.save(`SymphoniaTic-Pass-${foundOrder.orderCode}.pdf`);
      showToast('Dokumen E-Ticket PDF berhasil diunduh');
    } catch {
      showToast('Gagal membuat dokumen PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C0D12] text-white flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
        <p className="text-xs font-mono tracking-widest uppercase text-[#A1A1AA]">
          Memverifikasi E-Ticket &amp; Gate Data...
        </p>
      </div>
    );
  }

  if (errorMessage || !foundOrder) {
    return (
      <div className="min-h-screen bg-[#0C0D12] text-white flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="w-10 h-10 text-[#94A3B8] mb-4" strokeWidth={1.5} aria-hidden="true" />
        <h1 className="text-2xl font-semibold text-white mb-2">E-Ticket Tidak Ditemukan</h1>
        <p className="text-sm text-[#A1A1AA] mb-8 max-w-md leading-relaxed">
          {errorMessage || 'Kode pesanan tiket yang Anda cari tidak terdaftar atau telah kadaluarsa.'}
        </p>
        <a
          href="/redeem"
          className="min-h-[44px] text-sm font-semibold text-[#0C0D12] bg-white px-6 py-2.5 rounded-lg hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.7} aria-hidden="true" />
          <span>Kembali ke Portal Cek Tiket</span>
        </a>
      </div>
    );
  }

  const isCheckedIn = foundOrder.status === 'CHECKED_IN';
  const isRefundRequested = foundOrder.status === 'REFUND_REQUESTED';
  const isRefunded = foundOrder.status === 'REFUNDED' || foundOrder.status === 'CANCELLED';
  const isExpired = isConcertExpired(foundOrder);
  const isTicketExpired = isExpired && !isCheckedIn;

  return (
    <div className="min-h-screen bg-[#0C0D12] text-white selection:bg-white selection:text-[#0C0D12] pb-24 md:pb-16 relative font-sans">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-5 z-50 bg-[#14161F] border border-[#3E4357] text-white px-4 py-3 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-[#0C0D12] border-b border-[#272A38]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/redeem"
            className="min-h-[44px] inline-flex items-center gap-2 px-2 -ml-2 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 text-white" strokeWidth={1.7} aria-hidden="true" />
            <span>Cari Kode Lain</span>
          </a>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#14161F] border border-[#272A38]">
            <QrCode className="w-3.5 h-3.5 text-white" strokeWidth={1.7} aria-hidden="true" />
            <span className="text-xs font-mono tracking-wider text-[#E4E4E7] uppercase">E-Ticket Pass</span>
          </div>
        </div>
      </header>

      <main className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="p-5 rounded-2xl border border-[#272A38] bg-[#14161F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {isCheckedIn ? (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.7} aria-hidden="true" />
              ) : isTicketExpired ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.7} aria-hidden="true" />
              ) : isRefunded ? (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.7} aria-hidden="true" />
              ) : isRefundRequested ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.7} aria-hidden="true" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.7} aria-hidden="true" />
              )}
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-white font-semibold m-0">
                  {isCheckedIn
                    ? 'TIKET SUDAH CHECKED-IN'
                    : isTicketExpired
                    ? 'TIKET KEDALUWARSA / KONSER TELAH BERAKHIR'
                    : isRefunded
                    ? 'TIKET DIBATALKAN / REFUND'
                    : isRefundRequested
                    ? 'TIKET DALAM PROSES REFUND'
                    : 'E-TICKET RESMI TERVERIFIKASI'}
                </p>
                <p className="text-xs text-[#A1A1AA] mt-1 mb-0">
                  {isCheckedIn
                    ? 'Tiket telah dipindai di pintu masuk gate.'
                    : isTicketExpired
                    ? 'Pertunjukan konser telah selesai diselenggarakan.'
                    : isRefunded
                    ? 'Tiket ini tidak berlaku untuk masuk hall konser.'
                    : isRefundRequested
                    ? 'Tiket sedang dalam tinjauan pengajuan refund.'
                    : 'Siap digunakan untuk akses masuk hall konser.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-mono text-white bg-[#0C0D12] border border-[#272A38] px-3 py-2 rounded-lg">
                {foundOrder.orderCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                aria-label="Salin kode pesanan"
                className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-[#3E4357] bg-[#0C0D12] text-[#E4E4E7] hover:text-white transition-colors"
              >
                {copied ? <Check size={15} className="text-emerald-400" aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#272A38] bg-[#14161F] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#272A38]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2.5 py-1 rounded bg-[#0C0D12] border border-[#272A38] text-[11px] font-mono text-white uppercase tracking-wider">
                      Konser Simfoni Resmi
                    </span>
                    <span className="text-xs font-mono text-[#A1A1AA]">
                      ID: {foundOrder.id.slice(0, 8)}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight m-0">
                      {foundOrder.eventTitle}
                    </h1>
                    <p className="text-sm text-[#A1A1AA] mt-1 mb-0">{foundOrder.artist}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#272A38] text-xs">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block">Jadwal</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.date}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block">Open Gate</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.openGate || 'Sesuai Jadwal Venue'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block">Kategori</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.categoryName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block">Jumlah Tiket</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.quantity}x Kursi</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block">Pemegang Tiket</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.userName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block">Venue &amp; Lokasi</span>
                      <span className="text-white font-medium block mt-0.5 truncate">{foundOrder.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-[#0C0D12] font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    <Download size={15} aria-hidden="true" />
                    <span>Cetak PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0C0D12] border border-[#3E4357] text-white font-medium text-xs uppercase tracking-wider hover:border-white/60 transition-colors disabled:opacity-50"
                  >
                    <Download size={15} aria-hidden="true" />
                    <span>Simpan PNG</span>
                  </button>
                </div>
              </div>

              <div
                className={`lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 bg-[#0C0D12] transition-opacity ${
                  isTicketExpired ? 'opacity-65' : ''
                }`}
              >
                <div className="p-3 bg-white rounded-xl inline-block relative">
                  <QRCodeCanvas
                    value={foundOrder.qrCode || foundOrder.orderCode}
                    size={164}
                    level="H"
                  />
                  {isTicketExpired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-xl">
                      <span className="rounded-md border border-rose-500/50 bg-black px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
                        EXPIRED
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#94A3B8] block">
                    Kode Scanner Gate
                  </span>
                  <span className="text-sm font-mono font-semibold text-white tracking-wider block mt-1">
                    {foundOrder.orderCode}
                  </span>
                  <p className="text-xs text-[#A1A1AA] mt-2 max-w-[220px] leading-relaxed">
                    {isTicketExpired
                      ? 'Acara konser telah berakhir. Tiket ini tidak lagi dapat digunakan.'
                      : 'Tunjukkan QR Code ini di gerbang masuk venue saat Open Gate.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TicketDetailPage;
