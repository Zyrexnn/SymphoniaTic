import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, ChevronRight,
  CheckCircle2, QrCode, Ticket, Download, Search, Copy, Check, Mail,
} from 'lucide-react';
import { formatIDR, createOrderAPI, lookupTicketAPI } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { AdminDashboard } from './AdminDashboard';

// ════════════════════════════════════════════════════════════════════
// BOOKING MODAL
// ════════════════════════════════════════════════════════════════════
interface BookingProps { event: EventItem; initialCategory: TicketCategory; onClose: () => void; onSubmit: (order: OrderRecord) => void; }

export const BookingModal: React.FC<BookingProps> = ({ event, initialCategory, onClose, onSubmit }) => {
  const [selectedCat, setSelectedCat] = useState<TicketCategory>(initialCategory);
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !selectedCat) return;
    setIsSubmitting(true);
    try {
      const res = await createOrderAPI({
        eventId: String(event.id),
        ticketCategoryId: selectedCat.id,
        quantity,
        userName,
        userEmail,
      });
      if (res.success && res.data) {
        onSubmit(res.data);
      } else {
        alert(res.message || 'Gagal membuat pesanan tiket');
      }
    } catch (err) {
      alert('Gagal terhubung ke backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="w-full max-w-md text-white relative my-auto max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ background: '#171717' }}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-white/40 hover:text-white cursor-pointer bg-transparent border-none z-10">
          <X className="w-4 h-4" strokeWidth={1} />
        </button>

        {/* Header */}
        <div style={{ padding: '24px 24px 0' }}>
          <p style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Pemesanan Tiket</p>
          <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff', lineHeight: 1.2 }}>{event.title}</h3>
          <p style={{ fontSize: 14, fontWeight: 300, color: '#9a9a9a', marginTop: 4 }}>{event.artist}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Kategori */}
          <div style={{ padding: '20px 24px 0' }}>
            <p style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>Kategori</p>
            <div className="flex gap-2">
              {event.categories.map((cat) => (
                <button type="button" key={cat.id} onClick={() => setSelectedCat(cat)}
                  className="flex-1 text-left cursor-pointer bg-transparent"
                  style={{
                    padding: '12px',
                    border: selectedCat.id === cat.id ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <span className="block truncate" style={{ fontSize: 13, fontWeight: 300, color: selectedCat.id === cat.id ? '#ffffff' : '#9a9a9a' }}>{cat.name}</span>
                  <span className="block" style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', marginTop: 2 }}>{formatIDR(cat.price)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah */}
          <div style={{ padding: '20px 24px 0' }}>
            <div className="flex items-center justify-between mb-8">
              <p style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Jumlah</p>
              <span style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a' }}>Maks 4</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button type="button" key={num} onClick={() => setQuantity(num)}
                  className="flex-1 cursor-pointer bg-transparent text-center"
                  style={{
                    padding: '10px 0',
                    fontSize: 15,
                    fontWeight: 300,
                    color: quantity === num ? '#ffffff' : '#9a9a9a',
                    border: quantity === num ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Data Pemesan */}
          <div style={{ padding: '20px 24px 0' }}>
            <p style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>Data Pemesan</p>
            <div className="space-y-3">
              <input type="text" required placeholder="Nama lengkap" value={userName} onChange={(e) => setUserName(e.target.value)}
                style={{
                  fontSize: 14, fontWeight: 300, color: '#ffffff', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)', outline: 'none',
                  width: '100%', padding: '12px 14px',
                }} />
              <input type="email" required placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                style={{
                  fontSize: 14, fontWeight: 300, color: '#ffffff', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)', outline: 'none',
                  width: '100%', padding: '12px 14px',
                }} />
            </div>
          </div>

          {/* Total & Submit */}
          <div style={{ padding: '24px', marginTop: 8 }}>
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', display: 'block', marginBottom: 2 }}>Total</span>
                <span style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff' }}>{formatIDR(selectedCat.price * quantity)}</span>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="cursor-pointer bg-transparent hover:opacity-60 transition-opacity"
                style={{
                  fontSize: 14, fontWeight: 300, color: '#ffffff',
                  border: '1px solid #ffffff', padding: '12px 24px',
                }}>
                {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// E-TICKET CONFIRMATION
// ════════════════════════════════════════════════════════════════════
interface ConfirmProps { order: OrderRecord; onClose: () => void; }

export const ETicketConfirmation: React.FC<ConfirmProps> = ({ order, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const drawTicketCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 36px Inter, system-ui, sans-serif';
    ctx.fillText('SymphoniaTic Pass', 60, 100);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 20px Inter, system-ui, sans-serif';
    ctx.fillText('VERIFIED', 600, 100);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(60, 130);
    ctx.lineTo(740, 130);
    ctx.stroke();

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 12px sans-serif';
    ctx.fillText('PERTUNJUKAN RESMI', 60, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = '300 28px sans-serif';
    ctx.fillText(order.eventTitle, 60, 180);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 16px sans-serif';
    ctx.fillText(order.artist, 60, 210);

    const drawInfo = (y: number, label: string, value: string) => {
      ctx.fillStyle = '#9a9a9a';
      ctx.font = '300 11px sans-serif';
      ctx.fillText(label.toUpperCase(), 60, y);
      ctx.fillStyle = '#ffffff';
      ctx.font = '300 16px sans-serif';
      ctx.fillText(value, 60, y + 22);
    };

    drawInfo(260, 'Tanggal & Waktu', order.date);
    drawInfo(320, 'Venue', order.venue);
    drawInfo(380, 'Pemegang Tiket', order.userName);
    drawInfo(440, 'Kategori', `${order.categoryName} (${order.quantity}x)`);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(60, 500);
    ctx.lineTo(width - 60, 500);
    ctx.stroke();
    ctx.setLineDash([]);

    const qrSize = 200;
    const qrX = (width - qrSize) / 2;
    const qrY = 530;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = '#171717';
    const drawFinder = (fx: number, fy: number) => {
      ctx.fillRect(fx, fy, 40, 40);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 6, fy + 6, 28, 28);
      ctx.fillStyle = '#171717';
      ctx.fillRect(fx + 12, fy + 12, 16, 16);
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

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(order.orderCode, width / 2, 780);

    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 12px sans-serif';
    ctx.fillText('Tunjukkan QR Code ini di pintu pemeriksaan gate', width / 2, 810);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '300 11px sans-serif';
    ctx.fillText('SYMPHONIATIC OFFICIAL PASS', width / 2, 930);

    return canvas;
  };

  const handleDownloadPNG = async () => {
    setIsDownloading('PNG');
    try {
      const canvas = drawTicketCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `E-Ticket-${order.orderCode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading('PDF');
    try {
      const canvas = drawTicketCanvas();
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPos = (pdfWidth - imgWidth) / 2;

      pdf.setFillColor(23, 23, 23);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(imgData, 'PNG', xPos, 15, imgWidth, imgHeight);
      pdf.save(`E-Ticket-${order.orderCode}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="w-full max-w-md text-white relative my-auto max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ background: '#171717' }}>

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-white/40 hover:text-white cursor-pointer bg-transparent border-none z-10">
          <X className="w-4 h-4" strokeWidth={1} />
        </button>

        {/* Header */}
        <div style={{ padding: '24px 24px 0' }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1} style={{ color: '#9a9a9a' }} />
            <p style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>E-Ticket Terbit</p>
          </div>
          <h3 style={{ fontSize: 22, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff', lineHeight: 1.2 }}>Simpan kode atau unduh tiket Anda</h3>
        </div>

        {/* Order Code */}
        <div style={{ padding: '20px 24px 0' }}>
          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Kode Pesanan</span>
              <span style={{ fontSize: 18, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{order.orderCode}</span>
            </div>
            <button onClick={handleCopyCode}
              className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center gap-1.5"
              style={{ fontSize: 13, fontWeight: 300, color: copied ? '#ffffff' : '#9a9a9a' }}>
              {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1} />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Mailpit Info Banner */}
        <div style={{ padding: '16px 24px 0' }}>
          <div className="flex items-start gap-3 p-3 text-left"
            style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 8 }}>
            <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>
              <p style={{ color: '#e2e8f0', fontWeight: 400, margin: 0 }}>
                E-Ticket telah dikirim ke <span className="text-indigo-300 font-medium">{order.userEmail}</span>.
              </p>
              <p style={{ color: '#94a3b8', marginTop: 2, margin: 0 }}>
                Cek kotak masuk testing email lokal di Mailpit UI: <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300">http://localhost:8025</a>
              </p>
            </div>
          </div>
        </div>

        {/* E-Ticket Card */}
        <div ref={ticketRef} data-ticket-card="true" style={{ padding: '20px 24px 0' }}>
          {/* Top branding */}
          <div className="flex items-center justify-between" style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff' }}>SymphoniaTic Pass</span>
            <span style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em' }}>VERIFIED</span>
          </div>

          {/* Event Title */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Pertunjukan Resmi</span>
            <h4 style={{ fontSize: 18, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff' }}>{order.eventTitle}</h4>
            <p style={{ fontSize: 14, fontWeight: 300, color: '#9a9a9a', marginTop: 2 }}>{order.artist}</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4" style={{ marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Tanggal & Waktu</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff' }}>{order.date}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Venue</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff' }}>{order.venue}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4" style={{ marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Pemegang Tiket</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff' }}>{order.userName}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Kategori</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: '#ffffff' }}>{order.categoryName} ({order.quantity}x)</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center text-center" style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 20 }}>
            <div className="p-2.5" style={{ background: '#ffffff' }}>
              <QrCode className="w-20 h-20 sm:w-24 sm:h-24" strokeWidth={1} style={{ color: '#171717' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 300, color: '#ffffff', marginTop: 12, fontVariantNumeric: 'tabular-nums' }}>{order.orderCode}</span>
            <span style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', marginTop: 4 }}>Tunjukkan QR ini di pintu masuk</span>
          </div>
        </div>

        {/* Download buttons */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleDownloadPNG} disabled={!!isDownloading}
              className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center justify-center gap-1.5"
              style={{ fontSize: 13, fontWeight: 300, color: '#ffffff', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Download className="w-3.5 h-3.5" strokeWidth={1} />
              <span>{isDownloading === 'PNG' ? 'Membuat...' : 'PNG'}</span>
            </button>
            <button onClick={handleDownloadPDF} disabled={!!isDownloading}
              className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center justify-center gap-1.5"
              style={{ fontSize: 13, fontWeight: 300, color: '#ffffff', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Download className="w-3.5 h-3.5" strokeWidth={1} />
              <span>{isDownloading === 'PDF' ? 'Membuat...' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ORDERS & TICKET LOOKUP DRAWER
// ════════════════════════════════════════════════════════════════════
interface OrdersProps { orders: OrderRecord[]; onClose: () => void; onShowTicket: (o: OrderRecord) => void; }

export const OrdersDrawer: React.FC<OrdersProps> = ({ orders, onClose, onShowTicket }) => {
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setHasSearched(true);
    try {
      const res = await lookupTicketAPI(searchCode.trim());
      if (res.success && res.data) {
        setFoundOrder(res.data);
      } else {
        const q = searchCode.trim().toLowerCase();
        const match = orders.find((o) => o.orderCode.toLowerCase() === q);
        setFoundOrder(match || null);
      }
    } catch (err) {
      const q = searchCode.trim().toLowerCase();
      const match = orders.find((o) => o.orderCode.toLowerCase() === q);
      setFoundOrder(match || null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        className="w-full max-w-md text-white h-full flex flex-col overflow-y-auto"
        style={{ background: '#171717', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px' }}>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" strokeWidth={1} style={{ color: '#9a9a9a' }} />
            <h2 style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300 }}>Cek Tiket & Invoice</h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white cursor-pointer bg-transparent border-none"><X className="w-5 h-5" strokeWidth={1} /></button>
        </div>

        <div style={{ padding: '16px 24px' }}>
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <label style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', display: 'block', marginBottom: 8 }}>Cari Berdasarkan Kode Pesanan</label>
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-0 top-3" strokeWidth={1} style={{ color: '#9a9a9a' }} />
              <input type="text" placeholder="SYM-123456" value={searchCode} onChange={(e) => setSearchCode(e.target.value)}
                style={{
                  fontSize: 16,
                  fontWeight: 300,
                  color: '#ffffff',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  outline: 'none',
                  width: '100%',
                  padding: '8px 0 8px 24px',
                  fontVariantNumeric: 'tabular-nums',
                }} />
            </div>
            <button type="submit"
              className="w-full cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center justify-center gap-2"
              style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', padding: '10px 0', borderBottom: '1px solid #ffffff' }}>
              <Search className="w-3.5 h-3.5" strokeWidth={1} />
              <span>Cek Kode Pesanan</span>
            </button>
          </form>

          {/* Search Result */}
          {hasSearched && (
            <div className="mb-6">
              {foundOrder ? (
                <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{foundOrder.orderCode}</span>
                    <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>VERIFIED</span>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', marginBottom: 4 }}>{foundOrder.eventTitle}</h4>
                  <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginBottom: 12 }}>Pemegang: {foundOrder.userName}</p>
                  <button onClick={() => onShowTicket(foundOrder)}
                    className="w-full cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center justify-center gap-2"
                    style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', padding: '10px 0', borderBottom: '1px solid #ffffff' }}>
                    <QrCode className="w-3.5 h-3.5" strokeWidth={1} />
                    <span>Buka E-Ticket</span>
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>Kode Pesanan tidak ditemukan.</p>
              )}
            </div>
          )}

          {/* Local Orders */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginBottom: 12 }}>E-Ticket Di Perangkat Ini</h3>
            {orders.length === 0 ? (
              <div className="text-center" style={{ padding: '32px 0' }}>
                <Ticket className="w-8 h-8 mx-auto mb-3" strokeWidth={1} style={{ color: '#9a9a9a' }} />
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>Belum Ada Tiket Tersimpan</p>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginTop: 4 }}>Pesan tiket konser baru atau cari menggunakan kode invoice.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {orders.map((ord, idx) => (
                  <div key={idx} style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{ord.orderCode}</span>
                      <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>{ord.status}</span>
                    </div>
                    <h4 style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', marginBottom: 4 }}>{ord.eventTitle}</h4>
                    <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginBottom: 8 }}>{ord.artist}</p>
                    <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>{ord.categoryName} ({ord.quantity}x)</span>
                      <button onClick={() => onShowTicket(ord)} className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center gap-2"
                        style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', borderBottom: '1px solid #ffffff', paddingBottom: 2 }}>
                        <QrCode className="w-3.5 h-3.5" strokeWidth={1} /><span>Tampilkan QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ADMIN DRAWER
// ════════════════════════════════════════════════════════════════════
interface AdminProps { onClose: () => void; onEventsUpdated?: () => void; allEvents?: EventItem[]; }

export const AdminDrawer: React.FC<AdminProps> = ({ onClose, onEventsUpdated, allEvents }) => (
  <AdminDashboard onClose={onClose} onEventsUpdated={onEventsUpdated} allEvents={allEvents} />
);
