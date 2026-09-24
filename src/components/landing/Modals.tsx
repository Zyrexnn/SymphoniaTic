import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, ChevronRight,
  CheckCircle2, QrCode, Ticket, Download, Search, Copy, Check, Mail,
} from 'lucide-react';
import { formatIDR, createOrderAPI, lookupTicketAPI } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { AdminDashboard } from './AdminDashboard';
import { drawTicketCanvas } from '@/lib/ticketCanvas';

interface BookingProps { event: EventItem; initialCategory: TicketCategory; onClose: () => void; onSubmit: (order: OrderRecord) => void; }

export const BookingModal: React.FC<BookingProps> = ({ event, initialCategory, onClose, onSubmit }) => {
  const [selectedCat, setSelectedCat] = useState<TicketCategory>(initialCategory);
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (event.isClosed) {
      alert('Maaf, penjualan tiket untuk pertunjukan ini telah ditutup.');
      return;
    }
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
        className="w-full max-w-md text-[#183B56] relative my-auto max-h-[90vh] overflow-y-auto flex flex-col bg-white border border-line shadow-2xl">

        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-[#94A3B8] hover:text-[#183B56] cursor-pointer bg-transparent border-none z-10">
          <X className="w-4 h-4" strokeWidth={1} />
        </button>

        <div className="px-6 pt-6">
          <p className="text-[13px] font-light text-[#64748B] tracking-wider uppercase mb-1.5">Pemesanan Tiket</p>
          <h3 className="text-[22px] tracking-[-0.02em] font-light text-[#183B56] leading-[1.2]">{event.title}</h3>
          <p className="text-sm font-light text-[#64748B] mt-1">{event.artist}</p>
        </div>

        {event.isClosed ? (
          <div className="p-6">
            <div className="p-4 border border-brand-accent/40 bg-brand-accent/10 text-brand-accent text-xs font-light rounded leading-relaxed">
              ⚠️ <strong>Penjualan Tiket Ditutup</strong> — Pertunjukan konser ini sudah dimulai atau penjualan tiket dihentikan oleh panitia.
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 text-xs font-light text-[#183B56] border border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors"
            >
              Tutup Modal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Kategori */}
            <div className="px-6 pt-5">
              <p className="text-[13px] font-light text-[#64748B] tracking-wider uppercase mb-2.5">Kategori</p>
              <div className="flex gap-2">
                {event.categories.map((cat) => (
                  <button type="button" key={cat.id} onClick={() => setSelectedCat(cat)}
                    className={`flex-1 text-left cursor-pointer bg-transparent p-3 ${
                      selectedCat.id === cat.id ? 'border-2 border-brand bg-[#F8FAFC]' : 'border border-line px-3'
                    }`}>
                    <span className={`block truncate text-[13px] font-light ${selectedCat.id === cat.id ? 'text-[#183B56]' : 'text-[#64748B]'}`}>{cat.name}</span>
                    <span className="block text-[13px] font-light text-[#64748B] mt-0.5">{formatIDR(cat.price)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah */}
            <div className="px-6 pt-5">
              <div className="flex items-center justify-between mb-8">
                <p className="text-[13px] font-light text-[#64748B] tracking-wider uppercase">Jumlah</p>
                <span className="text-[13px] font-light text-[#64748B]">Maks 4</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button type="button" key={num} onClick={() => setQuantity(num)}
                    className={`flex-1 cursor-pointer bg-transparent text-center py-2.5 text-[15px] font-light ${
                      quantity === num
                        ? 'text-[#183B56] border-2 border-brand bg-[#F8FAFC]'
                        : 'text-[#64748B] border border-line'
                    }`}>
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Pemesan */}
            <div className="px-6 pt-5">
              <p className="text-[13px] font-light text-[#64748B] tracking-wider uppercase mb-3">Data Pemesan</p>
              <div className="space-y-3">
                <input type="text" required placeholder="Nama lengkap" value={userName} onChange={(e) => setUserName(e.target.value)}
                  className="text-sm font-light text-[#183B56] bg-transparent border border-line outline-none w-full px-3.5 py-3" />
                <input type="email" required placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                  className="text-sm font-light text-[#183B56] bg-transparent border border-line outline-none w-full px-3.5 py-3" />
              </div>
            </div>

            {/* Total & Submit */}
            <div className="px-6 pb-6 mt-2">
              <div className="flex items-center justify-between border-t border-line pt-5">
                <div>
                  <span className="text-[13px] font-light text-[#64748B] block mb-0.5">Total</span>
                  <span className="text-[22px] tracking-[-0.02em] font-light text-[#183B56]">{formatIDR(selectedCat.price * quantity)}</span>
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="cursor-pointer bg-brand text-white hover:bg-brand-dark transition-colors text-sm font-medium border border-brand px-6 py-3">
                  {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </form>
        )}
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

  const handleDownloadPNG = async () => {
    setIsDownloading('PNG');
    try {
      const canvas = drawTicketCanvas(order);
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
      const canvas = drawTicketCanvas(order);
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPos = (pdfWidth - imgWidth) / 2;

      pdf.setFillColor(24, 59, 86);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(imgData, 'PNG', xPos, 10, imgWidth, imgHeight);
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
        className="w-full max-w-md text-[#183B56] relative my-auto max-h-[90vh] overflow-y-auto flex flex-col bg-white border border-line shadow-2xl">

        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-[#94A3B8] hover:text-[#183B56] cursor-pointer bg-transparent border-none z-10">
          <X className="w-4 h-4" strokeWidth={1} />
        </button>

        <div className="px-6 pt-6">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#64748B]" strokeWidth={1} />
            <p className="text-[13px] font-light text-[#64748B] tracking-wider uppercase">E-Ticket Terbit</p>
          </div>
          <h3 className="text-[22px] tracking-[-0.02em] font-light text-[#183B56] leading-[1.2]">Simpan kode atau unduh tiket Anda</h3>
        </div>

        {/* Order Code */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[13px] font-light text-[#64748B] block mb-1">Kode Pesanan</span>
              <span className="text-lg tracking-[-0.01em] font-light text-[#183B56] tabular-nums">{order.orderCode}</span>
            </div>
            <button onClick={handleCopyCode}
              className={`cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center gap-1.5 text-[13px] font-light ${copied ? 'text-[#183B56]' : 'text-[#64748B]'}`}>
              {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1} />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Mailpit Info Banner */}
        <div className="px-6 pt-4">
          <div className="flex items-start gap-3 p-3 text-left bg-[rgba(24,59,86,0.06)] border border-[rgba(24,59,86,0.16)] rounded-lg">
            <Mail className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-xs leading-[1.4]">
              <p className="text-[#183B56] font-normal m-0">
                E-Ticket telah dikirim ke <span className="text-brand-accent font-medium">{order.userEmail}</span>.
              </p>
              <p className="text-[#64748B] mt-0.5 m-0">
                Cek kotak masuk testing email lokal di Mailpit UI: <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-brand-accent underline hover:text-brand-accent-hover">http://localhost:8025</a>
              </p>
            </div>
          </div>
        </div>

        {/* E-Ticket Card */}
        <div ref={ticketRef} data-ticket-card="true" className="px-6 pt-5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
            <span className="text-sm font-light text-[#183B56]">SymphoniaTic Pass</span>
            <span className="text-[13px] font-light text-[#64748B] tracking-wider">VERIFIED</span>
          </div>

          <div className="mb-4">
            <span className="text-xs font-light text-[#64748B] tracking-wider uppercase block mb-1">Pertunjukan Resmi</span>
            <h4 className="text-lg tracking-[-0.01em] font-light text-[#183B56]">{order.eventTitle}</h4>
            <p className="text-sm font-light text-[#64748B] mt-0.5">{order.artist}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 mb-4">
            <div>
              <span className="text-xs font-light text-[#64748B] tracking-wider uppercase block mb-1">Tanggal & Waktu</span>
              <span className="text-sm font-light text-[#183B56]">{order.date}</span>
            </div>
            <div>
              <span className="text-xs font-light text-[#64748B] tracking-wider uppercase block mb-1">Venue</span>
              <span className="text-sm font-light text-[#183B56]">{order.venue}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 mb-5">
            <div>
              <span className="text-xs font-light text-[#64748B] tracking-wider uppercase block mb-1">Pemegang Tiket</span>
              <span className="text-sm font-light text-[#183B56]">{order.userName}</span>
            </div>
            <div>
              <span className="text-xs font-light text-[#64748B] tracking-wider uppercase block mb-1">Kategori</span>
              <span className="text-sm font-light text-[#183B56]">{order.categoryName} ({order.quantity}x)</span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center border-t border-dashed border-line pt-5">
            <div className="p-2.5 bg-white">
              <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-[#183B56]" strokeWidth={1} />
            </div>
            <span className="text-[15px] font-light text-[#183B56] mt-3 tabular-nums">{order.orderCode}</span>
            <span className="text-[13px] font-light text-[#64748B] mt-1">Tunjukkan QR ini di pintu masuk</span>
          </div>
        </div>

        {/* Download buttons */}
        <div className="px-6 pb-6 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleDownloadPNG} disabled={!!isDownloading}
              className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center justify-center gap-1.5 text-[13px] font-light text-[#183B56] py-2.5 border-b border-line">
              <Download className="w-3.5 h-3.5" strokeWidth={1} />
              <span>{isDownloading === 'PNG' ? 'Membuat...' : 'PNG'}</span>
            </button>
            <button onClick={handleDownloadPDF} disabled={!!isDownloading}
              className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center justify-center gap-1.5 text-[13px] font-light text-[#183B56] py-2.5 border-b border-line">
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
        className="w-full max-w-md text-[#183B56] h-full flex flex-col overflow-y-auto bg-white border-l border-line">
        <div className="flex items-center justify-between pb-4 border-b border-line px-6 py-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#64748B]" strokeWidth={1} />
            <h2 className="text-xl tracking-[-0.01em] font-light text-[#183B56]">Cek Tiket & Invoice</h2>
          </div>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-[#183B56] cursor-pointer bg-transparent border-none"><X className="w-5 h-5" strokeWidth={1} /></button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-6 border-b border-line pb-5">
            <p className="text-xs font-light text-[#64748B] leading-relaxed mb-3">
              Ingin memverifikasi kode pesanan `SYM-XXXXXX` atau mengunduh E-Ticket PDF?
            </p>
            <a
              href="/redeem"
              className="w-full bg-brand text-white py-2.5 text-xs font-medium tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors"
            >
              <QrCode className="w-4 h-4" strokeWidth={1.5} />
              <span>Buka Halaman Redem Tiket Resmi</span>
            </a>
          </div>

          {/* Local Orders */}
          <div>
            <h3 className="text-base font-light text-[#64748B] mb-3">E-Ticket Di Perangkat Ini</h3>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="w-8 h-8 mx-auto mb-3 text-[#64748B]" strokeWidth={1} />
                <p className="text-base font-light text-[#64748B]">Belum Ada Tiket Tersimpan</p>
                <p className="text-base font-light text-[#64748B] mt-1">Pesan tiket konser baru atau cari menggunakan kode invoice.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {orders.map((ord, idx) => (
                  <div key={idx} className="py-4 border-b border-line">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-light text-[#183B56] tabular-nums">{ord.orderCode}</span>
                      <span className="text-base font-light text-[#64748B]">{ord.status}</span>
                    </div>
                    <h4 className="text-base font-light text-[#183B56] mb-1">{ord.eventTitle}</h4>
                    <p className="text-base font-light text-[#64748B] mb-2">{ord.artist}</p>
                    <div className="flex items-center justify-between border-t border-line pt-2">
                      <span className="text-base font-light text-[#64748B]">{ord.categoryName} ({ord.quantity}x)</span>
                      <button onClick={() => onShowTicket(ord)} className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center gap-2 text-base font-light text-[#183B56] border-b border-brand pb-0.5">
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

interface AdminProps { onClose: () => void; onEventsUpdated?: () => void; allEvents?: EventItem[]; }

export const AdminDrawer: React.FC<AdminProps> = ({ onClose, onEventsUpdated, allEvents }) => (
  <AdminDashboard onClose={onClose} onEventsUpdated={onEventsUpdated} allEvents={allEvents} />
);
