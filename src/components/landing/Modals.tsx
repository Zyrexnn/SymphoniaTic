import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  CheckCircle2,
  QrCode,
  Ticket,
  Download,
  Copy,
  Check,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { formatIDR, createOrderAPI, lookupTicketAPI } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { useAuth } from '@/context/AuthContext';
import { drawTicketCanvas } from '@/lib/ticketCanvas';

interface BookingProps {
  event: EventItem;
  initialCategory: TicketCategory;
  onClose: () => void;
  onSubmit: (order: OrderRecord) => void;
}

export const BookingModal: React.FC<BookingProps> = ({ event, initialCategory, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [selectedCat, setSelectedCat] = useState<TicketCategory>(initialCategory);
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.name) setUserName(user.name);
      if (user.email) setUserEmail(user.email);
    }
  }, [user]);

  const getRemainingQuota = (cat: TicketCategory) => {
    if (typeof cat.remainingQuota === 'number') return cat.remainingQuota;
    if (typeof cat.quota === 'number') return cat.quota;
    return 0;
  };

  const selectedRemaining = getRemainingQuota(selectedCat);
  const isSelectedSoldOut = selectedRemaining <= 0;
  const maxAllowedTickets = Math.min(4, Math.max(0, selectedRemaining));

  useEffect(() => {
    if (maxAllowedTickets > 0 && quantity > maxAllowedTickets) {
      setQuantity(maxAllowedTickets);
    }
  }, [maxAllowedTickets, quantity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (event.isClosed) {
      setErrorMessage('Penjualan tiket untuk pertunjukan ini telah ditutup.');
      return;
    }
    if (isSelectedSoldOut || maxAllowedTickets <= 0) {
      setErrorMessage('Kuota kategori tiket ini telah habis. Silakan pilih kategori lain.');
      return;
    }
    if (!userName.trim() || !userEmail.trim() || !selectedCat) {
      setErrorMessage('Mohon lengkapi nama dan email pemesan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createOrderAPI({
        eventId: String(event.id),
        ticketCategoryId: selectedCat.id,
        quantity,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
      });
      if (res.success && res.data) {
        onSubmit(res.data);
      } else {
        setErrorMessage(res.message || 'Gagal memproses pesanan tiket.');
      }
    } catch (err) {
      setErrorMessage('Gagal terhubung ke server backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg text-[#F4F4F6] relative my-auto max-h-[90vh] overflow-y-auto flex flex-col bg-[#14161F] border border-[#272A38] rounded-2xl shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-[#F4F4F6] hover:bg-[#1C1F2E] rounded-lg transition-colors cursor-pointer bg-transparent border-none z-10"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="p-6 border-b border-[#272A38]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-white tracking-wider uppercase bg-white/10 px-2.5 py-0.5 rounded-md border border-white/20">
              Pemesanan Tiket
            </span>
            <span className="text-xs text-[#A1A1AA]">{event.date}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F4F4F6] leading-tight">
            {event.title}
          </h3>
          <p className="text-sm text-[#A1A1AA] mt-1">{event.artist} &middot; {event.venue}</p>
        </div>

        {event.isClosed ? (
          <div className="p-6">
            <div className="p-4 border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs rounded-xl leading-relaxed flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-300 mb-1">Penjualan Tiket Ditutup</p>
                <p>Pertunjukan konser ini sudah dimulai atau penjualan tiket telah dihentikan oleh pihak penyelenggara.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 text-sm font-semibold text-[#F4F4F6] bg-[#1C1F2E] hover:bg-[#272A38] border border-[#272A38] rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-6 space-y-6">
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {user && (
                <div className="p-3 bg-[#1C1F2E] border border-[#272A38] rounded-xl flex items-center gap-2 text-xs text-[#A1A1AA]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  <span>
                    Terhubung sebagai <strong className="text-white">{user.name}</strong> ({user.email}). E-ticket otomatis terdaftar pada akun Anda.
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Pilih Kategori Kursi
                  </span>
                  <span className="text-xs text-[#A1A1AA]">
                    {event.categories.length} Kategori Tersedia
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {event.categories.map((cat) => {
                    const rem = getRemainingQuota(cat);
                    const isSoldOut = rem <= 0;
                    const isSelected = selectedCat.id === cat.id;

                    return (
                      <button
                        type="button"
                        key={cat.id}
                        disabled={isSoldOut}
                        onClick={() => setSelectedCat(cat)}
                        className={`text-left p-3.5 rounded-xl transition-all border ${
                          isSoldOut
                            ? 'bg-[#10121A] border-[#272A38] opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#1C1F2E] border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                            : 'bg-[#14161F] border-[#272A38] hover:border-white/30 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-[#F4F4F6]'}`}>
                            {cat.name}
                          </span>
                          {isSoldOut ? (
                            <span className="text-[11px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded">
                              (HABIS)
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#A1A1AA]">
                              Sisa {rem}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#F4F4F6] block">
                          {formatIDR(cat.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Jumlah Tiket
                  </span>
                  <span className="text-xs text-[#A1A1AA]">
                    {isSelectedSoldOut ? 'Tiket Habis' : `Maksimal ${maxAllowedTickets} tiket`}
                  </span>
                </div>

                {isSelectedSoldOut ? (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
                    Kategori kursi ini telah habis dipesan.
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => {
                      const isDisabled = num > maxAllowedTickets;
                      return (
                        <button
                          type="button"
                          key={num}
                          disabled={isDisabled}
                          onClick={() => setQuantity(num)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                            isDisabled
                              ? 'opacity-30 cursor-not-allowed bg-[#10121A] border-[#272A38] text-[#64748B]'
                              : quantity === num
                              ? 'bg-white text-black border-white shadow-sm font-semibold'
                              : 'bg-[#1C1F2E] text-[#A1A1AA] border-[#272A38] hover:text-[#F4F4F6] hover:border-white/40 cursor-pointer'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-2.5">
                  Data Pemesan
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      readOnly={!!user}
                      className={`text-sm text-[#F4F4F6] border rounded-lg w-full px-3.5 py-2.5 outline-none transition-colors ${
                        user
                          ? 'bg-[#10121A] border-[#272A38] cursor-not-allowed opacity-80'
                          : 'bg-[#1C1F2E] border-[#272A38] focus:border-white focus:ring-1 focus:ring-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1AA] block mb-1">Alamat Email</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      readOnly={!!user}
                      className={`text-sm text-[#F4F4F6] border rounded-lg w-full px-3.5 py-2.5 outline-none transition-colors ${
                        user
                          ? 'bg-[#10121A] border-[#272A38] cursor-not-allowed opacity-80'
                          : 'bg-[#1C1F2E] border-[#272A38] focus:border-white focus:ring-1 focus:ring-white'
                      }`}
                    />
                    <p className="text-[11px] text-[#A1A1AA] mt-1">E-Ticket resmi dan invoice akan dikirimkan ke email ini.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#10121A] border-t border-[#272A38] rounded-b-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#A1A1AA] block">Total Pembayaran</span>
                  <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                    {formatIDR(selectedCat.price * quantity)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isSelectedSoldOut || maxAllowedTickets <= 0 || !userName.trim() || !userEmail.trim()}
                  className="rounded-lg bg-white text-[#0C0D12] font-semibold hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all py-3 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Reservasi...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Pemesanan</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

interface ConfirmProps {
  order: OrderRecord;
  onClose: () => void;
}

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

      pdf.setFillColor(20, 22, 31);
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
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg text-[#F4F4F6] relative my-auto max-h-[90vh] overflow-y-auto flex flex-col bg-[#14161F] border border-[#272A38] rounded-2xl shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Tutup tiket"
          className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-[#F4F4F6] hover:bg-[#1C1F2E] rounded-lg transition-colors cursor-pointer bg-transparent border-none z-10"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="p-6 border-b border-[#272A38]">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2} />
            <span className="text-[11px] font-semibold text-white tracking-wider uppercase bg-white/10 px-2.5 py-0.5 rounded-md border border-white/20">
              E-Ticket Terbit
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#F4F4F6] leading-tight">
            Tiket Resmi Berhasil Diterbitkan
          </h3>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Simpan bukti tiket digital Anda di bawah ini untuk ditunjukkan pada saat Open Gate.
          </p>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-start gap-3 p-3.5 bg-[#1C1F2E] border border-[#272A38] rounded-xl text-xs text-[#A1A1AA]">
            <Mail className="w-4 h-4 text-white shrink-0 mt-0.5" strokeWidth={2} />
            <div className="leading-relaxed">
              <p className="text-[#F4F4F6] font-medium">
                E-Ticket dan konfirmasi pesanan telah dikirim ke <span className="text-white font-semibold">{order.userEmail}</span>.
              </p>
              <p className="text-[#A1A1AA] mt-1">
                Untuk pengujian email lokal, buka Mailpit Web: <a href="http://localhost:8025" target="_blank" rel="noreferrer" className="text-white underline hover:text-neutral-300">http://localhost:8025</a>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div
            ref={ticketRef}
            data-ticket-card="true"
            className="bg-[#181B26] border border-[#272A38] rounded-2xl overflow-hidden relative shadow-lg"
          >
            <div className="p-5 border-b border-[#272A38] bg-[#10121A] flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-white">SYMPHONIATIC PASS</span>
                <p className="text-[11px] text-[#A1A1AA]">Pass Masuk Konser Orkestra</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                {order.status || 'VERIFIED'}
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  Pertunjukan Mahakarya
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-[#F4F4F6] leading-snug">
                  {order.eventTitle}
                </h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5 font-medium">{order.artist}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#272A38]">
                <div>
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">
                    Tanggal Konser
                  </span>
                  <span className="text-xs font-semibold text-[#F4F4F6]">{order.date}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">
                    Open Gate
                  </span>
                  <span className="text-xs font-semibold text-[#F4F4F6]">18:00 WIB</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">
                    Gedung & Lokasi
                  </span>
                  <span className="text-xs font-semibold text-[#F4F4F6]">{order.venue}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">
                    Kategori Kursi
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {order.categoryName} ({order.quantity}x Tiket)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">
                    Nama Pemesan
                  </span>
                  <span className="text-xs font-semibold text-[#F4F4F6]">{order.userName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider block mb-0.5">
                    Total Pembayaran
                  </span>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {formatIDR(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="w-6 h-6 -ml-3 rounded-full bg-[#14161F] border-r border-[#272A38]" />
              <div className="flex-1 border-t-2 border-dashed border-[#272A38] mx-2" />
              <div className="w-6 h-6 -mr-3 rounded-full bg-[#14161F] border-l border-[#272A38]" />
            </div>

            <div className="p-5 bg-[#10121A] flex flex-col items-center text-center">
              <div className="p-3 bg-white rounded-xl shadow-md inline-block">
                <QRCodeCanvas
                  id="ticket-real-qrcode"
                  value={order.qrCode || order.orderCode}
                  size={160}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#0C0D12"
                />
              </div>

              <div className="mt-3.5">
                <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  Kode Pesanan Resmi
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider tabular-nums">
                    {order.orderCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    aria-label="Salin kode invoice"
                    className="p-1.5 rounded-lg bg-[#1C1F2E] text-[#A1A1AA] hover:text-white border border-[#272A38] transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1.5">
                  Tunjukkan Kode QR ini kepada petugas di pintu masuk concert hall.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={handleDownloadPNG}
              disabled={!!isDownloading}
              className="cursor-pointer bg-[#1C1F2E] hover:bg-[#272A38] text-[#F4F4F6] border border-[#272A38] rounded-lg py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading === 'PNG' ? 'Membuat...' : 'Unduh Gambar (PNG)'}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!!isDownloading}
              className="cursor-pointer bg-white hover:bg-neutral-200 text-[#0C0D12] rounded-lg py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading === 'PDF' ? 'Membuat...' : 'Cetak Tiket (PDF)'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface OrdersProps {
  orders: OrderRecord[];
  onClose: () => void;
  onShowTicket: (o: OrderRecord) => void;
}

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-md text-[#F4F4F6] h-full flex flex-col overflow-y-auto bg-[#14161F] border-l border-[#272A38]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#272A38] px-6 py-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-white" strokeWidth={1.5} />
            <h2 className="text-xl font-bold text-[#F4F4F6]">Cek Tiket & Invoice</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup laci"
            className="p-2 text-[#A1A1AA] hover:text-[#F4F4F6] hover:bg-[#1C1F2E] rounded-lg transition-colors cursor-pointer bg-transparent border-none"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="border-b border-[#272A38] pb-5">
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
              Ingin memverifikasi kode pesanan SYM-XXXXXX atau mengunduh E-Ticket PDF?
            </p>
            <a
              href="/redeem"
              className="w-full bg-white text-[#0C0D12] py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
            >
              <QrCode className="w-4 h-4" strokeWidth={2} />
              <span>Buka Halaman Redeem Tiket Resmi</span>
            </a>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
              E-Ticket Di Perangkat Ini
            </h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 bg-[#181B26] border border-[#272A38] rounded-xl p-4">
                <Ticket className="w-8 h-8 mx-auto mb-3 text-[#A1A1AA]" strokeWidth={1.5} />
                <p className="text-sm font-semibold text-[#F4F4F6]">Belum Ada Tiket Tersimpan</p>
                <p className="text-xs text-[#A1A1AA] mt-1">Pesan tiket konser baru atau cari menggunakan kode invoice.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#181B26] border border-[#272A38]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-white tabular-nums">
                        {ord.orderCode}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">
                        {ord.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F4F4F6] mb-1">{ord.eventTitle}</h4>
                    <p className="text-xs text-[#A1A1AA] mb-3">{ord.artist}</p>
                    <div className="flex items-center justify-between border-t border-[#272A38] pt-2">
                      <span className="text-xs text-[#A1A1AA]">{ord.categoryName} ({ord.quantity}x)</span>
                      <button
                        onClick={() => onShowTicket(ord)}
                        className="cursor-pointer bg-transparent border-none text-white hover:text-neutral-300 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Tampilkan QR</span>
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


