import React, { useState, useEffect, useMemo } from 'react';
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
import { resolveOrderTickets, downloadOrderPNG, downloadOrderPDF } from '@/lib/ticketCanvas';
import { TicketPassSwitcher } from '@/components/ui/TicketPassSwitcher';
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
  const [activeTab, setActiveTab] = useState<number>(-1);

  const tickets = useMemo(() => (foundOrder ? resolveOrderTickets(foundOrder) : []), [foundOrder]);

  useEffect(() => {
    setActiveTab(tickets.length > 1 ? 0 : -1);
  }, [tickets.length, foundOrder?.orderCode]);

  const activeTicket = activeTab >= 0 ? tickets[activeTab] || null : null;

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
      downloadOrderPNG(foundOrder, activeTicket, activeTab >= 0 ? activeTab : undefined);
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
      await downloadOrderPDF(foundOrder);
      showToast('Dokumen E-Ticket PDF berhasil diunduh');
    } catch {
      showToast('Gagal membuat dokumen PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F3EF] text-[#141413] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-6 h-6 animate-spin text-[#141413]" aria-hidden="true" />
        <p className="text-xs font-mono tracking-widest uppercase text-[#52514D]">
          Memverifikasi E-Ticket &amp; Gate Data...
        </p>
      </div>
    );
  }

  if (errorMessage || !foundOrder) {
    return (
      <div className="min-h-screen bg-[#F4F3EF] text-[#141413] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="w-10 h-10 text-[#C81E1E] mb-4" strokeWidth={1.6} aria-hidden="true" />
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-[#141413] mb-2">E-Ticket Tidak Ditemukan</h1>
        <p className="text-sm text-[#52514D] mb-8 max-w-md leading-relaxed">
          {errorMessage || 'Kode pesanan tiket yang Anda cari tidak terdaftar atau telah kadaluarsa.'}
        </p>
        <a
          href="/redeem"
          className="min-h-[44px] text-xs font-bold uppercase tracking-wider text-[#141413] bg-[#D4FF2A] border border-[#141413] px-6 py-2.5 rounded-none hover:bg-[#C2EE1A] transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
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
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413] pb-24 md:pb-16 relative font-sans">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-5 z-50 bg-white border border-[#141413] text-[#141413] px-4 py-3 rounded-none text-xs font-semibold flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[#156E3F]" strokeWidth={2} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-[#DFDDD6]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/redeem"
            className="min-h-[44px] inline-flex items-center gap-2 px-2 -ml-2 text-xs font-bold uppercase tracking-wider text-[#52514D] hover:text-[#141413] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#141413]" strokeWidth={1.8} aria-hidden="true" />
            <span>Cari Kode Lain</span>
          </a>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-[#D4FF2A] border border-[#141413]">
            <QrCode className="w-3.5 h-3.5 text-[#141413]" strokeWidth={2} aria-hidden="true" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-[#141413] uppercase">E-Ticket Pass</span>
          </div>
        </div>
      </header>

      <main className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="p-5 rounded-none border border-[#DFDDD6] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {isCheckedIn ? (
                <CheckCircle2 className="w-5 h-5 text-[#156E3F] shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
              ) : isTicketExpired ? (
                <AlertCircle className="w-5 h-5 text-[#8A5A00] shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
              ) : isRefunded ? (
                <AlertCircle className="w-5 h-5 text-[#C81E1E] shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
              ) : isRefundRequested ? (
                <AlertCircle className="w-5 h-5 text-[#8A5A00] shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-[#156E3F] shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
              )}
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[#141413] font-bold m-0">
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
                <p className="text-xs text-[#52514D] mt-1 mb-0">
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
              <span className="text-xs font-mono text-[#141413] bg-[#F4F3EF] border border-[#DFDDD6] px-3 py-2 rounded-none font-bold">
                {foundOrder.orderCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                aria-label="Salin kode pesanan"
                className="h-10 w-10 inline-flex items-center justify-center rounded-none border border-[#DFDDD6] bg-[#F4F3EF] text-[#141413] hover:border-[#141413] transition-colors"
              >
                {copied ? <Check size={15} className="text-[#156E3F]" aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <TicketPassSwitcher tickets={tickets} activeTab={activeTab} onChangeTab={setActiveTab} />

          <div className="rounded-none border border-[#141413] bg-white overflow-hidden">
            <div className="h-2 w-full bg-[#D4FF2A] border-b border-[#141413]" />
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#DFDDD6]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2.5 py-1 bg-[#141413] text-[10px] font-bold text-[#D4FF2A] uppercase tracking-[0.14em]">
                      {activeTicket && tickets.length > 1
                        ? `Pass Tiket ${activeTab + 1} dari ${tickets.length}`
                        : 'Konser Simfoni Resmi'}
                    </span>
                    <span className="text-xs font-mono text-[#6E6D68]">
                      ID: {foundOrder.id.slice(0, 8)}
                    </span>
                  </div>

                  <div>
                    <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#141413] leading-[1.02] m-0">
                      {foundOrder.eventTitle}
                    </h1>
                    <p className="text-sm text-[#52514D] mt-1 mb-0">{foundOrder.artist}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#DFDDD6] text-xs">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D68] block">Jadwal</span>
                      <span className="text-[#141413] font-bold block mt-0.5">{foundOrder.date}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D68] block">Open Gate</span>
                      <span className="text-[#141413] font-bold block mt-0.5">{foundOrder.openGate || 'Sesuai Jadwal Venue'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D68] block">Kategori</span>
                      <span className="text-[#141413] font-bold block mt-0.5">{foundOrder.categoryName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D68] block">Nomor Kursi</span>
                      <span className="text-[#141413] bg-[#D4FF2A] px-2 py-0.5 font-mono font-bold inline-block mt-0.5">
                        {activeTicket?.seatCode || foundOrder.seatNumbers || 'Sesuai Kategori'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D68] block">Jumlah Tiket</span>
                      <span className="text-[#141413] font-bold block mt-0.5">{foundOrder.quantity}x Kursi</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D68] block">Pemegang Tiket</span>
                      <span className="text-[#141413] font-bold block mt-0.5">
                        {activeTicket?.attendeeName || foundOrder.userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6D68] block">Venue &amp; Lokasi</span>
                      <span className="text-[#141413] font-bold block mt-0.5 truncate">{foundOrder.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-[#D4FF2A] border border-[#141413] text-[#141413] font-bold text-xs uppercase tracking-wider hover:bg-[#C2EE1A] transition-colors disabled:opacity-50"
                  >
                    <Download size={15} aria-hidden="true" />
                    <span>{tickets.length > 1 ? `Cetak ${tickets.length} Tiket (PDF)` : 'Cetak PDF'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    disabled={isDownloading}
                    className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none bg-[#141413] text-[#F4F3EF] font-bold text-xs uppercase tracking-wider hover:bg-[#2A2A28] transition-colors disabled:opacity-50"
                  >
                    <Download size={15} aria-hidden="true" />
                    <span>{activeTicket?.seatCode ? `Simpan PNG (${activeTicket.seatCode})` : 'Simpan PNG'}</span>
                  </button>
                </div>
              </div>

              <div
                className={`lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 bg-[#F4F3EF] transition-opacity ${
                  isTicketExpired ? 'opacity-70' : ''
                }`}
              >
                <div className="p-3 bg-white border border-[#141413] rounded-none inline-block relative">
                  <QRCodeCanvas
                    value={activeTicket?.qrCode || foundOrder.qrCode || foundOrder.orderCode}
                    size={164}
                    level="H"
                    bgColor="#FFFFFF"
                    fgColor="#141413"
                  />
                  {isTicketExpired && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#141413]/80 rounded-none">
                      <span className="bg-[#C81E1E] px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-white uppercase">
                        EXPIRED
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#6E6D68] block">
                    {activeTicket?.seatCode ? `Kode Pass Kursi ${activeTicket.seatCode}` : 'Kode Scanner Gate'}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#141413] tracking-wider block mt-1 break-all">
                    {activeTicket?.seatCode ? `${foundOrder.orderCode}-${activeTicket.seatCode}` : foundOrder.orderCode}
                  </span>
                  <p className="text-xs text-[#52514D] mt-2 max-w-[220px] leading-relaxed">
                    {isTicketExpired
                      ? 'Acara konser telah berakhir. Tiket ini tidak lagi dapat digunakan.'
                      : activeTicket && tickets.length > 1
                      ? 'QR Code ini dapat dipindai mandiri untuk kursi ini jika pengunjung datang terpisah.'
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
