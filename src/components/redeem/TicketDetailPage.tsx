import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  CheckCircle2,
  MapPin,
  Download,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  User,
  Ticket,
  ShieldCheck,
  Printer,
  Share2,
  Info,
  AlertTriangle,
  Music,
  CheckSquare
} from 'lucide-react';
import { lookupTicketAPI, CONCERT_EVENTS, type OrderRecord, formatIDR } from '../landing/data';

interface Props {
  code: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const TicketDetailPage: React.FC<Props> = ({ code }) => {
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [matchingEvent, setMatchingEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'PNG' | 'PDF' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'rundown' | 'venue' | 'rules'>('rundown');

  const ticketCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lookup = async () => {
      setIsLoading(true);
      try {
        const res = await lookupTicketAPI(code);
        if (res.success && res.data) {
          setFoundOrder(res.data);
          const evt = CONCERT_EVENTS.find(
            (e) => String(e.id) === String(res.data.eventId) || e.title.toLowerCase().includes(res.data.eventTitle.toLowerCase().slice(0, 10))
          ) || CONCERT_EVENTS[0];
          setMatchingEvent(evt);
        } else {
          setErrorMessage(res.message || 'Kode pesanan tiket tidak ditemukan.');
        }
      } catch {
        setErrorMessage('Terjadi kesalahan koneksi saat memverifikasi tiket. Silakan periksa koneksi Anda.');
      } finally {
        setIsLoading(false);
      }
    };
    lookup();
  }, [code]);

  // Countdown Timer Logic
  useEffect(() => {
    if (!foundOrder) return;

    const targetDate = new Date('2026-04-18T19:30:00+07:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [foundOrder]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyCode = () => {
    if (!foundOrder) return;
    navigator.clipboard.writeText(foundOrder.orderCode);
    setIsCopied(true);
    showToast('Kode pesanan berhasil disalin ke clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareTicket = async () => {
    if (!foundOrder) return;
    const shareData = {
      title: `E-Ticket Pass: ${foundOrder.eventTitle}`,
      text: `SymphoniaTic E-Ticket Pass (${foundOrder.orderCode}) untuk ${foundOrder.eventTitle}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Tautan E-Ticket berhasil disalin');
      }
    } catch {
      // User cancelled share
    }
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const drawTicketCanvas = (order: OrderRecord, evt: any): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 840;
    const height = 1240;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '400 32px Inter, sans-serif';
    ctx.fillText('SymphoniaTic Pass', 50, 75);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('VERIFIED DIGITAL E-TICKET', width - 50, 75);
    ctx.textAlign = 'left';

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(50, 95);
    ctx.lineTo(width - 50, 95);
    ctx.stroke();

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 12px sans-serif';
    ctx.fillText('PERTUNJUKAN SIMFONI RESMI', 50, 125);

    ctx.fillStyle = '#ffffff';
    ctx.font = '400 24px sans-serif';
    ctx.fillText(order.eventTitle, 50, 160);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 15px sans-serif';
    ctx.fillText(order.artist, 50, 188);

    const drawInfo = (x: number, y: number, label: string, value: string) => {
      ctx.fillStyle = '#9a9a9a';
      ctx.font = '300 11px sans-serif';
      ctx.fillText(label.toUpperCase(), x, y);
      ctx.fillStyle = '#ffffff';
      ctx.font = '400 15px sans-serif';
      ctx.fillText(value, x, y + 22);
    };

    drawInfo(50, 230, 'Tanggal & Waktu Konser', order.date);
    drawInfo(450, 230, 'Open Gate Entrance', evt?.openGate || '18:00 WIB');

    drawInfo(50, 290, 'Pemegang E-Ticket', order.userName);
    drawInfo(450, 290, 'Email Terdaftar', order.userEmail);

    drawInfo(50, 350, 'Kategori Tiket & Kuota', `${order.categoryName} (${order.quantity}x Tiket)`);
    drawInfo(450, 350, 'Total Pembayaran', formatIDR(order.totalPrice));

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(50, 410);
    ctx.lineTo(width - 50, 410);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#171717';
    ctx.fillRect(50, 440, width - 100, 150);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 440, width - 100, 150);

    ctx.fillStyle = '#ffffff';
    ctx.font = '400 14px sans-serif';
    ctx.fillText('PETUNJUK LOKASI VENUE & GATE PETUGAS', 75, 475);

    ctx.fillStyle = '#ffffff';
    ctx.font = '400 16px sans-serif';
    ctx.fillText(order.venue, 75, 505);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 12px sans-serif';
    ctx.fillText(`Alamat: ${evt?.address || order.venue}`, 75, 532);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 11px sans-serif';
    ctx.fillText('Tunjukkan dokumen E-Ticket ini di pintu pemeriksaan gate saat memasuki concert hall.', 75, 565);

    const qrSize = 200;
    const qrX = (width - qrSize) / 2;
    const qrY = 630;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = '#171717';
    const drawFinder = (fx: number, fy: number) => {
      ctx.fillRect(fx, fy, 40, 40);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 5, fy + 5, 30, 30);
      ctx.fillStyle = '#171717';
      ctx.fillRect(fx + 10, fy + 10, 20, 20);
    };

    const qrPad = 20;
    const qrInner = qrSize - qrPad * 2;
    drawFinder(qrX + qrPad, qrY + qrPad);
    drawFinder(qrX + qrPad + qrInner - 40, qrY + qrPad);
    drawFinder(qrX + qrPad, qrY + qrPad + qrInner - 40);

    ctx.fillStyle = '#171717';
    const gridSize = 10;
    const cellSize = qrInner / gridSize;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if ((r < 4 && c < 4) || (r < 4 && c >= 6) || (r >= 6 && c < 4)) continue;
        if ((r + c * 3 + order.orderCode.length) % 3 === 0) {
          ctx.fillRect(qrX + qrPad + c * cellSize, qrY + qrPad + r * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '400 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(order.orderCode, width / 2, 875);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 13px sans-serif';
    ctx.fillText('Pindai Kode QR ini pada scanner gate di pintu masuk hall', width / 2, 910);

    ctx.fillStyle = '#171717';
    ctx.fillRect(50, 940, width - 100, 190);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(50, 940, width - 100, 190);

    ctx.fillStyle = '#ffffff';
    ctx.font = '400 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RUNDOWN & JADWAL PERTUNJUKAN', 75, 970);

    const rundownList = evt?.rundown || [
      { time: '18:00 WIB', activity: 'Open Gate & Registrasi Tiket' },
      { time: '19:30 WIB', activity: 'Pertunjukan Simfoni Utama' },
      { time: '21:30 WIB', activity: 'Penutupan & Selesai' }
    ];

    rundownList.slice(0, 4).forEach((item: any, idx: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '400 12px sans-serif';
      ctx.fillText(item.time, 75, 1000 + idx * 28);
      ctx.fillStyle = '#9a9a9a';
      ctx.font = '300 12px sans-serif';
      ctx.fillText(item.activity, 190, 1000 + idx * 28);
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '300 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYMPHONIATIC OFFICIAL TICKET REDEMPTION & VENUE PASS SYSTEM 2026', width / 2, 1180);

    return canvas;
  };

  const handleDownloadPNG = () => {
    if (!foundOrder) return;
    setIsDownloading('PNG');
    try {
      const canvas = drawTicketCanvas(foundOrder, matchingEvent);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `E-Ticket-${foundOrder.orderCode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('E-Ticket format PNG berhasil disimpan');
    } catch (err) {
      console.error('PNG download error:', err);
      showToast('Gagal mengunduh gambar PNG');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!foundOrder) return;
    setIsDownloading('PDF');
    try {
      const canvas = drawTicketCanvas(foundOrder, matchingEvent);
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPos = (pdfWidth - imgWidth) / 2;

      pdf.setFillColor(23, 23, 23);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(imgData, 'PNG', xPos, 5, imgWidth, imgHeight);
      pdf.save(`E-Ticket-${foundOrder.orderCode}.pdf`);
      showToast('Dokumen E-Ticket PDF berhasil diunduh');
    } catch (err) {
      console.error('PDF download error:', err);
      showToast('Gagal mengunduh PDF');
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171717] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-light text-[#9a9a9a] tracking-wider uppercase">
          Memverifikasi E-Ticket & Gate Data...
        </p>
      </div>
    );
  }

  if (errorMessage || !foundOrder) {
    return (
      <div className="min-h-screen bg-[#171717] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="w-8 h-8 text-[#9a9a9a] mb-5" strokeWidth={1} />
        <h1 className="text-2xl font-light text-white mb-2">E-Ticket Tidak Ditemukan</h1>
        <p className="text-sm font-light text-[#9a9a9a] mb-8 max-w-md leading-relaxed">
          {errorMessage || 'Kode pesanan tiket yang Anda cari tidak terdaftar atau telah kadaluarsa.'}
        </p>
        <a
          href="/redeem"
          className="text-xs font-light text-white tracking-wider uppercase border border-white/30 px-6 py-3 hover:bg-white/10 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
          <span>Kembali ke Portal Cek Tiket</span>
        </a>
      </div>
    );
  }

  const isCheckedIn = foundOrder.status === 'CHECKED_IN';
  const isRefunded = foundOrder.status === 'REFUNDED' || foundOrder.status === 'CANCELLED';

  return (
    <div className="min-h-screen bg-[#171717] text-white selection:bg-white selection:text-[#171717] pb-24 md:pb-12 relative">
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-[#171717] border border-white/20 text-white px-4 py-3 shadow-2xl text-xs font-light tracking-wide flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-white" strokeWidth={1} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#171717]/95 backdrop-blur-md border-b border-white/[0.08] print:hidden">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <a
            href="/redeem"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
            <span className="text-xs font-light tracking-wide">Cari Kode Lain</span>
          </a>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShareTicket}
              className="p-2 text-[#9a9a9a] hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
              title="Bagikan Tiket"
            >
              <Share2 className="w-4 h-4" strokeWidth={1} />
            </button>
            <button
              onClick={handlePrintTicket}
              className="p-2 text-[#9a9a9a] hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer hidden sm:block"
              title="Cetak Halaman"
            >
              <Printer className="w-4 h-4" strokeWidth={1} />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
              <QrCode className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
              <span className="text-xs font-mono tracking-wider text-[#9a9a9a] uppercase">E-Ticket Pass</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[960px] w-full mx-auto px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-8"
        >
          {/* Status Alert Banner */}
          <div className="p-5 border border-white/20 bg-[#171717] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isCheckedIn ? (
                <CheckCircle2 className="w-5 h-5 text-white shrink-0" strokeWidth={1} />
              ) : isRefunded ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" strokeWidth={1} />
              ) : (
                <ShieldCheck className="w-5 h-5 text-white shrink-0" strokeWidth={1} />
              )}
              <div>
                <p className="text-sm font-light tracking-wide uppercase text-white">
                  {isCheckedIn
                    ? 'TIKET TELAH DIPINDAI (CHECKED-IN)'
                    : isRefunded
                    ? 'TIKET TIDAK BERLAKU / VOID'
                    : 'TIKET AKTIF — SIAP DIGUNAKAN'}
                </p>
                <p className="text-xs text-[#9a9a9a] mt-0.5 font-light">
                  {isCheckedIn
                    ? 'E-Ticket ini telah digunakan untuk memasuki concert hall.'
                    : isRefunded
                    ? 'Transaksi telah dibatalkan atau dikembalikan (refund).'
                    : 'Tunjukkan Kode QR ini di pintu masuk (Open Gate) untuk dipindai oleh petugas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-mono text-[#9a9a9a] border border-white/10 px-2.5 py-1">
                KODE: {foundOrder.orderCode}
              </span>
            </div>
          </div>

          {/* MAIN E-TICKET PASS STUB CONTAINER */}
          <div
            ref={ticketCardRef}
            className="bg-[#171717] border border-white/20 relative overflow-hidden"
          >
            {/* Top Event Hero Banner */}
            <div className="relative h-48 sm:h-64 overflow-hidden border-b border-white/15">
              <img
                src={
                  matchingEvent?.image ||
                  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80'
                }
                alt={foundOrder.eventTitle}
                className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/60 to-transparent" />

              {/* Event Badge Overlay */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-white text-[#171717] text-[11px] font-mono tracking-widest uppercase">
                  {foundOrder.categoryName}
                </span>
                <span className="px-3 py-1 bg-black/60 border border-white/20 text-white text-[11px] font-light">
                  {foundOrder.quantity}x TIKET PASS
                </span>
              </div>

              {/* Event Title in Banner */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6">
                <span className="text-xs font-light text-[#9a9a9a] tracking-widest uppercase block mb-1">
                  PERTUNJUKAN SIMFONI
                </span>
                <h1 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight">
                  {foundOrder.eventTitle}
                </h1>
                <p className="text-xs sm:text-sm font-light text-[#9a9a9a] mt-1 flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-[#9a9a9a]" strokeWidth={1} />
                  <span>{foundOrder.artist}</span>
                </p>
              </div>
            </div>

            {/* Countdown Bar */}
            {!timeLeft.isPast && !isRefunded && (
              <div className="bg-[#171717] border-b border-white/10 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-light">
                <span className="text-[#9a9a9a] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9a9a9a]" strokeWidth={1} />
                  <span>Waktu Tersisa Menuju Pertunjukan:</span>
                </span>
                <div className="flex items-center gap-3 font-mono text-white text-sm">
                  <span className="border border-white/10 px-2 py-0.5">{timeLeft.days}d</span>
                  <span>:</span>
                  <span className="border border-white/10 px-2 py-0.5">{timeLeft.hours}h</span>
                  <span>:</span>
                  <span className="border border-white/10 px-2 py-0.5">{timeLeft.minutes}m</span>
                  <span>:</span>
                  <span className="border border-white/10 px-2 py-0.5 text-white">{timeLeft.seconds}s</span>
                </div>
              </div>
            )}

            {/* Ticket Stub Middle Body */}
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
              {/* Left Column: Specs */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-light text-[#9a9a9a] tracking-widest uppercase mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
                    <span>Rincian Pemegang Tiket & Transaksi</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white/10 p-5 bg-[#171717]">
                    <div>
                      <span className="text-[11px] font-light text-[#9a9a9a] uppercase block">Pemegang Tiket</span>
                      <span className="text-sm font-normal text-white">{foundOrder.userName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-light text-[#9a9a9a] uppercase block">Email Terdaftar</span>
                      <span className="text-sm font-normal text-white truncate block">{foundOrder.userEmail}</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-light text-[#9a9a9a] uppercase block">Kategori & Jumlah</span>
                      <span className="text-sm font-normal text-white">
                        {foundOrder.categoryName} ({foundOrder.quantity}x)
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-light text-[#9a9a9a] uppercase block">Total Harga Pembayaran</span>
                      <span className="text-sm font-mono text-white">{formatIDR(foundOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Date & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-white/10 p-4 bg-[#171717]">
                    <div className="flex items-center gap-2 text-[#9a9a9a] text-xs font-light mb-1">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1} />
                      <span>Jadwal Konser:</span>
                    </div>
                    <p className="text-sm font-light text-white">{foundOrder.date}</p>
                    <p className="text-xs font-light text-[#9a9a9a] mt-0.5">Open Gate: {matchingEvent?.openGate || '18:00 WIB'}</p>
                  </div>

                  <div className="border border-white/10 p-4 bg-[#171717]">
                    <div className="flex items-center gap-2 text-[#9a9a9a] text-xs font-light mb-1">
                      <MapPin className="w-3.5 h-3.5" strokeWidth={1} />
                      <span>Venue & Hall:</span>
                    </div>
                    <p className="text-sm font-light text-white">{foundOrder.venue}</p>
                    <p className="text-xs font-light text-[#9a9a9a] mt-0.5 truncate">{matchingEvent?.address || 'Jakarta'}</p>
                  </div>
                </div>

                {/* Order Code Box */}
                <div className="border border-white/20 bg-[#171717] p-5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-light text-[#9a9a9a] uppercase tracking-wider block">
                      Kode Pesanan Transaksi
                    </span>
                    <span className="text-xl sm:text-2xl font-mono text-white tracking-widest">
                      {foundOrder.orderCode}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-white text-[#171717] text-xs font-light uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    {isCopied ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: QR Code Scanner */}
              <div className="lg:col-span-5 border border-white/15 p-6 flex flex-col items-center justify-between text-center gap-6 relative bg-[#171717]">
                <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-mono text-[#9a9a9a] uppercase">SCANNER GATEPASS</span>
                  <span className="text-[10px] font-mono text-white border border-white/20 px-2 py-0.5">
                    GATE SCAN READY
                  </span>
                </div>

                <div className="relative p-4 bg-white border border-white shrink-0 shadow-xl">
                  <QrCode
                    className={`w-44 h-44 sm:w-52 sm:h-52 text-[#171717] ${
                      isRefunded || isCheckedIn ? 'opacity-20 blur-[2px]' : ''
                    }`}
                    strokeWidth={1}
                  />

                  {isRefunded && (
                    <div className="absolute inset-0 bg-[#171717]/90 flex flex-col items-center justify-center p-3 text-center border border-red-500/40">
                      <AlertCircle className="w-8 h-8 text-red-400 mb-1" strokeWidth={1} />
                      <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest">
                        VOID / CANCELLED
                      </span>
                    </div>
                  )}

                  {isCheckedIn && (
                    <div className="absolute inset-0 bg-[#171717]/90 flex flex-col items-center justify-center p-3 text-center border border-white/30">
                      <CheckCircle2 className="w-8 h-8 text-white mb-1" strokeWidth={1} />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        USED / CHECKED IN
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-mono text-white tracking-widest mb-1">{foundOrder.orderCode}</p>
                  <p className="text-xs font-light text-[#9a9a9a] max-w-[240px] mx-auto leading-relaxed">
                    Pindai Kode QR ini di pemindai otomatis pintu masuk venue hall.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-2.5 border border-white/20 bg-transparent text-xs font-light text-white tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-white" strokeWidth={1} />
                  <span>Perbesar QR Code di HP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="border border-white/15 bg-[#171717] p-6 flex flex-col gap-6">
            <div className="flex border-b border-white/10 gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('rundown')}
                className={`px-5 py-3 text-xs font-light tracking-wider uppercase border-b transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'rundown'
                    ? 'border-white text-white font-normal'
                    : 'border-transparent text-[#9a9a9a] hover:text-white'
                }`}
              >
                Rundown Jadwal Konser
              </button>
              <button
                onClick={() => setActiveTab('venue')}
                className={`px-5 py-3 text-xs font-light tracking-wider uppercase border-b transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'venue'
                    ? 'border-white text-white font-normal'
                    : 'border-transparent text-[#9a9a9a] hover:text-white'
                }`}
              >
                Lokasi Venue & Maps
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-5 py-3 text-xs font-light tracking-wider uppercase border-b transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'rules'
                    ? 'border-white text-white font-normal'
                    : 'border-transparent text-[#9a9a9a] hover:text-white'
                }`}
              >
                Panduan Masuk & Ketentuan
              </button>
            </div>

            {/* Tab 1: Rundown */}
            {activeTab === 'rundown' && (
              <div className="space-y-4">
                <h4 className="text-xs font-light text-[#9a9a9a] tracking-widest uppercase">
                  Susunan Acara Pertunjukan
                </h4>
                <div className="space-y-3">
                  {(
                    matchingEvent?.rundown || [
                      { time: '18:00 WIB', activity: 'Pemeriksaan E-Ticket & Registrasi Open Gate' },
                      { time: '19:00 WIB', activity: 'Pintu Main Hall Dibuka & Pre-Concert Presentation' },
                      { time: '19:30 WIB', activity: 'Babak I: Pertunjukan Utama Simfoni' },
                      { time: '20:30 WIB', activity: 'Istirahat / Intermission (20 Menit)' },
                      { time: '20:50 WIB', activity: 'Babak II: Finale' },
                      { time: '21:45 WIB', activity: 'Selesai & Sesi Foto' }
                    ]
                  ).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 border border-white/10 flex items-center justify-between gap-4 text-xs font-light"
                    >
                      <span className="font-mono text-white shrink-0 w-24">{item.time}</span>
                      <span className="text-[#9a9a9a] flex-1">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Venue */}
            {activeTab === 'venue' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-light text-white">{foundOrder.venue}</h4>
                    <p className="text-xs font-light text-[#9a9a9a] mt-1">
                      {matchingEvent?.address || 'Jakarta Pusat'}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      foundOrder.venue
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-white text-[#171717] hover:bg-white/90 text-xs font-light tracking-wider uppercase inline-flex items-center gap-2 shrink-0 transition-colors"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1} />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-[#9a9a9a] pt-2">
                  <div className="p-4 border border-white/10">
                    <span className="text-white block font-normal mb-1">Akses Parkir & Pintu Masuk</span>
                    Area parkir tersedia di gedung utama venue. Gunakan Pintu Gerbang Utama A untuk registrasi cepat.
                  </div>
                  <div className="p-4 border border-white/10">
                    <span className="text-white block font-normal mb-1">Fasilitas Venue</span>
                    Tersedia Toilet, Lounge, Area Penyimpanan Barang (Locker Deposit), serta Booth Merchandise Resmi.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Rules */}
            {activeTab === 'rules' && (
              <div className="space-y-4 text-xs font-light text-[#9a9a9a]">
                <h4 className="text-xs font-light text-[#9a9a9a] tracking-widest uppercase">
                  Checklist Kelengkapan & Tata Tertib Gate
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 border border-white/10 flex items-start gap-2.5">
                    <CheckSquare className="w-4 h-4 text-white shrink-0 mt-0.5" strokeWidth={1} />
                    <span>Wajib membawa identitas asli (KTP/SIM/Paspor) sesuai nama pemesan.</span>
                  </div>
                  <div className="p-3 border border-white/10 flex items-start gap-2.5">
                    <CheckSquare className="w-4 h-4 text-white shrink-0 mt-0.5" strokeWidth={1} />
                    <span>Matikan suara HP (Silent mode) selama pertunjukan berlangsung.</span>
                  </div>
                  <div className="p-3 border border-white/10 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#9a9a9a] shrink-0 mt-0.5" strokeWidth={1} />
                    <span>Dilarang membawa makanan dan minuman luar ke dalam hall utama.</span>
                  </div>
                  <div className="p-3 border border-white/10 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#9a9a9a] shrink-0 mt-0.5" strokeWidth={1} />
                    <span>Dilarang merekam dengan kamera profesional atau flash saat musik dimainkan.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
            <button
              onClick={handleDownloadPDF}
              disabled={!!isDownloading}
              className="bg-white text-[#171717] py-3.5 text-xs font-light tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-white/90 transition-opacity"
            >
              <Download className="w-4 h-4" strokeWidth={1} />
              <span>{isDownloading === 'PDF' ? 'Proses PDF...' : 'Unduh PDF E-Ticket Pass'}</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={!!isDownloading}
              className="bg-transparent border border-white/20 text-white py-3.5 text-xs font-light tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-opacity"
            >
              <Download className="w-4 h-4" strokeWidth={1} />
              <span>{isDownloading === 'PNG' ? 'Proses PNG...' : 'Simpan Gambar PNG'}</span>
            </button>

            <a
              href="/refund"
              className="bg-transparent border border-white/20 text-[#9a9a9a] hover:text-white py-3.5 text-xs font-light tracking-wider uppercase flex items-center justify-center gap-2 transition-colors text-center"
            >
              <Info className="w-4 h-4" strokeWidth={1} />
              <span>Pusat Bantuan / Refund</span>
            </a>
          </div>
        </motion.div>
      </main>

      {/* MOBILE STICKY BOTTOM ACTIONS BAR */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-[#171717]/95 backdrop-blur-lg border-t border-white/20 p-3 sm:hidden flex items-center justify-between gap-2 print:hidden shadow-2xl">
        <button
          onClick={() => setShowQrModal(true)}
          className="flex-1 py-3 bg-white/10 border border-white/20 text-white text-xs font-light tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-white" strokeWidth={1} />
          <span>Tampilkan QR</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={!!isDownloading}
          className="flex-1 py-3 bg-white text-[#171717] text-xs font-light tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" strokeWidth={1} />
          <span>PDF Pass</span>
        </button>
      </div>

      {/* QR Code Fullscreen Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="bg-white p-6 rounded-none max-w-sm w-full text-black flex flex-col items-center gap-4">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                SCANNER GATE QR CODE
              </span>
              <QrCode className="w-64 h-64 text-[#171717]" strokeWidth={1} />
              <div className="space-y-1">
                <p className="text-xl font-mono font-bold tracking-widest">{foundOrder.orderCode}</p>
                <p className="text-xs text-gray-600 font-light">{foundOrder.eventTitle}</p>
                <p className="text-[11px] text-gray-500 font-light">Pemegang: {foundOrder.userName}</p>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-3 bg-[#171717] text-white text-xs uppercase font-light tracking-wider mt-2 cursor-pointer"
              >
                Tutup QR Code
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-[#9a9a9a] font-light print:hidden">
        &copy; 2026 SymphoniaTic Official Ticket Redemption Portal. All rights reserved.
      </footer>
    </div>
  );
};
