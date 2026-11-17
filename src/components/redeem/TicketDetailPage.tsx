import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Printer,
  ChevronDown,
  Navigation,
  Sparkles,
  Ticket,
  User,
  CheckSquare,
  X,
  RefreshCw,
  ExternalLink
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

const parseDateRundown = (dateStr?: string) => {
  if (!dateStr) return { day: '18', month: 'APR', year: '2026', full: 'Sabtu, 18 April 2026' };
  const full = dateStr;
  return { day: '18', month: 'APR', year: '2026', full };
};

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({ orderCode, code }) => {
  const initialCode = orderCode || code || '';
  const [, setOrderCode] = useState(initialCode);
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ticket' | 'rundown' | 'location'>('ticket');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    let code = initialCode;
    if (!code && typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      code = pathParts[pathParts.length - 1];
    }
    if (code) {
      setOrderCode(code.toUpperCase());
      fetchTicketData(code.toUpperCase());
    } else {
      setIsLoading(false);
      setErrorMessage('Kode pesanan tiket tidak ditentukan.');
    }
  }, [initialCode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchTicketData = async (code: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { lookupTicketAPI } = await import('../landing/data');
      const res = await lookupTicketAPI(code);
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
        <RefreshCw className="w-6 h-6 animate-spin text-white" />
        <p className="text-xs font-mono tracking-widest uppercase text-[#A1A1AA]">
          Memverifikasi E-Ticket &amp; Gate Data...
        </p>
      </div>
    );
  }

  if (errorMessage || !foundOrder) {
    return (
      <div className="min-h-screen bg-[#0C0D12] text-white flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="w-10 h-10 text-white/40 mb-4" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-white mb-2">E-Ticket Tidak Ditemukan</h1>
        <p className="text-sm text-[#A1A1AA] mb-8 max-w-md leading-relaxed">
          {errorMessage || 'Kode pesanan tiket yang Anda cari tidak terdaftar atau telah kadaluarsa.'}
        </p>
        <a
          href="/redeem"
          className="text-xs font-semibold text-black bg-white px-6 py-3 rounded-lg hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-black" strokeWidth={1.5} />
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
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#14161F] border border-[#272A38] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" strokeWidth={2} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 bg-[#0C0D12]/95 backdrop-blur-md border-b border-[#272A38]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/redeem"
            className="inline-flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" strokeWidth={1.5} />
            <span>Cari Kode Lain</span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#14161F] border border-[#272A38]">
              <QrCode className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
              <span className="text-[11px] font-mono tracking-wider text-[#A1A1AA] uppercase">E-Ticket Pass</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
          {/* Status Banner */}
          <div className="p-5 rounded-2xl border border-[#272A38] bg-[#14161F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isCheckedIn ? (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" strokeWidth={1.5} />
              ) : isTicketExpired ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" strokeWidth={1.5} />
              ) : isRefunded ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" strokeWidth={1.5} />
              ) : isRefundRequested ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" strokeWidth={1.5} />
              ) : (
                <ShieldCheck className="w-5 h-5 text-white shrink-0" strokeWidth={1.5} />
              )}
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-white">
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
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {isCheckedIn
                    ? 'Tiket telah dipindai di pintu masuk gate'
                    : isTicketExpired
                    ? 'Pertunjukan konser telah selesai diselenggarakan. E-Ticket ini sudah melewati masa berlaku.'
                    : isRefunded
                    ? 'Tiket ini tidak berlaku untuk masuk hall konser'
                    : isRefundRequested
                    ? 'Tiket sedang dalam tinjauan pengajuan refund dan sementara tidak dapat digunakan untuk check-in'
                    : 'Siap digunakan untuk akses masuk hall konser'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-mono text-white bg-[#0C0D12] border border-[#272A38] px-3 py-1.5 rounded-md">
                {foundOrder.orderCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-md border border-[#272A38] bg-[#0C0D12] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                title="Salin Kode"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Ticket Stub Pass Presentation */}
          <div className="rounded-2xl border border-[#272A38] bg-[#14161F] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left / Info Side */}
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#272A38]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2.5 py-1 rounded bg-[#0C0D12] border border-[#272A38] text-[10px] font-mono text-white uppercase tracking-widest">
                      KONSER SIMFONI RESMI
                    </span>
                    <span className="text-xs font-mono text-[#A1A1AA]">
                      ID: {foundOrder.id.slice(0, 8)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-tight">
                      {foundOrder.eventTitle}
                    </h2>
                    <p className="text-sm text-[#A1A1AA] mt-1">{foundOrder.artist}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#272A38] text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">Jadwal</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">Open Gate</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.openGate || 'Sesuai Jadwal Venue'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">Kategori</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.categoryName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">Jumlah Tiket</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.quantity}x Kursi</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">Pemegang Tiket</span>
                      <span className="text-white font-medium block mt-0.5">{foundOrder.userName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">Venue &amp; Lokasi</span>
                      <span className="text-white font-medium block mt-0.5 truncate">{foundOrder.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                  >
                    <Download size={14} className="text-black" />
                    <span>Cetak PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-transparent border border-white/20 text-white font-medium text-xs uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px]"
                  >
                    <Download size={14} className="text-white" />
                    <span>Simpan PNG</span>
                  </button>
                </div>
              </div>

              {/* Right / QR Code Stub */}
              <div
                className={`lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 bg-[#0C0D12] transition-opacity ${
                  isTicketExpired ? 'opacity-60' : ''
                }`}
              >
                <div className="p-3 bg-white rounded-xl shadow-lg inline-block relative">
                  <QRCodeCanvas
                    value={foundOrder.qrCode || foundOrder.orderCode}
                    size={160}
                    level="H"
                  />
                  {isTicketExpired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/65 rounded-xl backdrop-blur-[1px]">
                      <span className="rounded-md border border-rose-500/50 bg-black/85 px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-rose-400 uppercase shadow-lg">
                        EXPIRED
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">
                      KODE SCANNER GATE
                    </span>
                    {isTicketExpired && (
                      <span className="rounded bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-rose-400">
                        EXPIRED
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono font-semibold text-white tracking-wider block mt-1">
                    {foundOrder.orderCode}
                  </span>
                  <p className="text-[11px] text-[#A1A1AA] mt-2 max-w-[200px] leading-relaxed">
                    {isTicketExpired
                      ? 'Acara konser telah berakhir. Tiket ini tidak lagi dapat digunakan.'
                      : 'Tunjukkan QR Code ini di gerbang masuk venue saat Open Gate.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TicketDetailPage;
