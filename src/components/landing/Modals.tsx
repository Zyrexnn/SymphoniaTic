import React, { useState, useEffect, useId } from 'react';
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
  AlertCircle,
  Search,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { formatIDR, createOrderAPI, lookupTicketAPI } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { useAuth } from '@/context/AuthContext';
import { drawTicketCanvas } from '@/lib/ticketCanvas';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField, fieldInputBase } from '@/components/ui/form-controls';

interface BookingProps {
  event: EventItem;
  initialCategory: TicketCategory;
  initialQuantity?: number;
  onClose: () => void;
  onSubmit: (order: OrderRecord) => void;
}

export const BookingModal: React.FC<BookingProps> = ({
  event,
  initialCategory,
  initialQuantity = 1,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();
  const formId = useId();
  const [selectedCat, setSelectedCat] = useState<TicketCategory>(() => {
    const initRem = typeof initialCategory.remainingQuota === 'number' ? initialCategory.remainingQuota : initialCategory.quota;
    if (initRem > 0) return initialCategory;
    const firstAvailable = event.categories.find((c) => {
      const rem = typeof c.remainingQuota === 'number' ? c.remainingQuota : c.quota;
      return rem > 0;
    });
    return firstAvailable || initialCategory;
  });
  const [quantity, setQuantity] = useState(initialQuantity);
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
        onSubmit({
          ...res.data,
          openGate: res.data.openGate || event.openGate,
          eventTime: res.data.eventTime || event.time,
        });
      } else {
        setErrorMessage(res.message || 'Gagal memproses pesanan tiket.');
      }
    } catch {
      setErrorMessage('Gagal terhubung ke server backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedCat.price * quantity;
  const canSubmit = !isSubmitting && !isSelectedSoldOut && maxAllowedTickets > 0 && userName.trim().length > 0 && userEmail.trim().length > 0;

  return (
    <FullscreenWorkspace
      isOpen={true}
      onClose={onClose}
      eyebrow="Reservasi Tiket Resmi"
      title={event.title}
      subtitle={`${event.artist} · ${event.venue}`}
      maxWidthClass="max-w-5xl"
      backLabel="Kembali"
      footer={
        !event.isClosed ? (
          <div className="lg:hidden flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs text-[#A1A1AA] block">
                {quantity}x {selectedCat.name}
              </span>
              <span className="text-lg font-bold text-white tabular-nums block truncate">
                {formatIDR(totalPrice)}
              </span>
            </div>
            <button
              type="submit"
              form={formId}
              disabled={!canSubmit}
              className="min-h-[48px] shrink-0 rounded-lg bg-white text-[#0C0D12] font-semibold hover:bg-neutral-200 disabled:opacity-40 transition-colors px-5 py-3 text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Konfirmasi Pesanan</span>
              )}
            </button>
          </div>
        ) : undefined
      }
    >
      {event.isClosed ? (
        <div className="max-w-xl mx-auto rounded-2xl border border-[#272A38] bg-[#14161F] p-6 sm:p-8 space-y-5">
          <div role="alert" className="p-4 border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm rounded-xl leading-relaxed flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-base text-amber-300 mb-1 m-0">Penjualan Tiket Ditutup</p>
              <p className="m-0">Pertunjukan konser ini sudah dimulai atau penjualan tiket telah dihentikan oleh pihak penyelenggara.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] py-3 text-sm font-semibold text-[#F4F4F6] bg-[#1D202D] hover:bg-[#272A38] border border-[#3E4357] rounded-lg transition-colors"
          >
            Kembali ke Halaman Konser
          </button>
        </div>
      ) : (
        <form id={formId} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div role="alert" className="p-4 bg-rose-500/10 border border-rose-500/40 text-rose-200 text-sm rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {user && (
              <div className="p-4 bg-[#14161F] border border-[#272A38] rounded-xl flex items-start gap-3 text-sm text-[#E4E4E7]">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-white mt-0.5" aria-hidden="true" />
                <span>
                  Terhubung sebagai <strong className="text-white">{user.name}</strong> ({user.email}). E-Ticket otomatis tersimpan di akun Anda.
                </span>
              </div>
            )}

            <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white m-0">1. Pilih Kategori Kursi</h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 m-0">Pilih kelas tempat duduk sesuai preferensi Anda.</p>
                </div>
                <span className="text-xs text-[#A1A1AA] font-mono shrink-0">
                  {event.categories.length} Pilihan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.categories.map((cat) => {
                  const rem = getRemainingQuota(cat);
                  const isSoldOut = rem <= 0;
                  const isSelected = selectedCat.id === cat.id;

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      disabled={isSoldOut}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedCat(cat)}
                      className={`text-left p-4 min-h-[84px] rounded-xl transition-colors border flex flex-col justify-between gap-2 ${
                        isSoldOut
                          ? 'bg-[#0C0D12] border-[#272A38] opacity-50'
                          : isSelected
                          ? 'bg-[#1D202D] border-2 border-white'
                          : 'bg-[#0C0D12] border-[#3E4357] hover:border-white/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className="text-sm font-semibold text-white">
                          {cat.name}
                        </span>
                        {isSoldOut ? (
                          <span className="text-[11px] font-mono font-semibold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded shrink-0">
                            HABIS
                          </span>
                        ) : (
                          <span className="text-xs text-[#A1A1AA] shrink-0">
                            Sisa {rem}
                          </span>
                        )}
                      </div>
                      <span className="text-base font-bold text-white tabular-nums block">
                        {formatIDR(cat.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white m-0">2. Jumlah Tiket</h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5 m-0">
                    {isSelectedSoldOut ? 'Kategori ini sedang habis' : `Maksimal ${maxAllowedTickets} tiket per transaksi`}
                  </p>
                </div>
              </div>

              {isSelectedSoldOut ? (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm rounded-xl">
                  Kategori kursi ini telah habis dipesan. Silakan pilih kategori lain.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((num) => {
                    const isDisabled = num > maxAllowedTickets;
                    const active = quantity === num;
                    return (
                      <button
                        type="button"
                        key={num}
                        disabled={isDisabled}
                        aria-pressed={active}
                        onClick={() => setQuantity(num)}
                        className={`min-h-[48px] py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                          isDisabled
                            ? 'opacity-35 bg-[#0C0D12] border-[#272A38] text-[#94A3B8]'
                            : active
                            ? 'bg-white text-[#0C0D12] border-white'
                            : 'bg-[#0C0D12] text-[#E4E4E7] border-[#3E4357] hover:border-white/60 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white m-0">3. Data Pemesan</h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5 m-0">
                  Digunakan untuk penerbitan E-Ticket resmi dan verifikasi di pintu masuk.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextInputField
                  label="Nama Lengkap"
                  required
                  placeholder="Nama sesuai kartu identitas"
                  value={userName}
                  onValueChange={setUserName}
                  readOnly={!!user}
                  className={user ? 'opacity-80' : ''}
                />
                <TextInputField
                  label="Alamat Email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={userEmail}
                  onValueChange={setUserEmail}
                  readOnly={!!user}
                  hint="E-Ticket resmi dan invoice akan dikirimkan ke email ini."
                  className={user ? 'opacity-80' : ''}
                />
              </div>
            </section>
          </div>

          <aside className="hidden lg:block lg:col-span-5 sticky top-6">
            <div className="rounded-xl border border-[#272A38] bg-[#14161F] overflow-hidden">
              {event.image && (
                <div className="aspect-[16/9] w-full bg-[#0C0D12] overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-white m-0">Ringkasan Pesanan</h3>
                  <div className="mt-3 space-y-2 text-xs text-[#A1A1AA]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
                      <span>{event.date} &middot; {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
                      <span>Open Gate {event.openGate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#272A38] pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#A1A1AA]">Kategori</span>
                    <span className="text-white font-medium text-right">{selectedCat.name}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#A1A1AA]">Harga Satuan</span>
                    <span className="text-white font-mono tabular-nums">{formatIDR(selectedCat.price)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#A1A1AA]">Jumlah</span>
                    <span className="text-white font-mono">{quantity} tiket</span>
                  </div>
                </div>

                <div className="border-t border-[#272A38] pt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#A1A1AA]">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-white tabular-nums">{formatIDR(totalPrice)}</span>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full min-h-[48px] rounded-lg bg-white text-[#0C0D12] font-semibold hover:bg-neutral-200 disabled:opacity-40 transition-colors py-3 px-6 text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Memproses Reservasi...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Pemesanan</span>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </form>
      )}
    </FullscreenWorkspace>
  );
};

interface ConfirmProps {
  order: OrderRecord;
  onClose: () => void;
}

export const ETicketConfirmation: React.FC<ConfirmProps> = ({ order, onClose }) => {
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
    <FullscreenWorkspace
      isOpen={true}
      onClose={onClose}
      eyebrow="E-Ticket Resmi Terbit"
      title="Tiket Berhasil Diterbitkan"
      subtitle={`Kode Pesanan ${order.orderCode}`}
      maxWidthClass="max-w-4xl"
      backLabel="Tutup Pass"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-[#14161F] border border-[#272A38] rounded-xl text-sm text-[#E4E4E7]">
          <Mail className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
          <div className="leading-relaxed">
            <p className="text-white font-medium m-0">
              E-Ticket dan konfirmasi pesanan telah dikirim ke <span className="font-semibold">{order.userEmail}</span>.
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1 m-0">
              Simpan pass digital ini atau periksa folder inbox email Anda untuk mengunduh tanda masuk resmi.
            </p>
          </div>
        </div>

        <div
          data-ticket-card="true"
          className="bg-[#14161F] border border-[#272A38] rounded-2xl overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-[#272A38] bg-[#0C0D12] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-white block">
                SYMPHONIATIC PASS
              </span>
              <span className="text-xs text-[#A1A1AA]">Pass Masuk Konser Orkestra</span>
            </div>
            <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 px-3 py-1 rounded-md">
              {order.status || 'VERIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6 border-b md:border-b-0 md:border-r border-[#272A38]">
              <div>
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  Pertunjukan
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug m-0">
                  {order.eventTitle}
                </h3>
                <p className="text-sm text-[#A1A1AA] mt-1 mb-0">{order.artist}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#272A38] text-sm">
                <div>
                  <span className="text-xs text-[#A1A1AA] block mb-0.5">Tanggal Konser</span>
                  <span className="font-semibold text-white">{order.date}</span>
                </div>
                <div>
                  <span className="text-xs text-[#A1A1AA] block mb-0.5">Open Gate</span>
                  <span className="font-semibold text-white">{order.openGate || 'Sesuai Jadwal Venue'}</span>
                </div>
                <div>
                  <span className="text-xs text-[#A1A1AA] block mb-0.5">Gedung &amp; Lokasi</span>
                  <span className="font-semibold text-white">{order.venue}</span>
                </div>
                <div>
                  <span className="text-xs text-[#A1A1AA] block mb-0.5">Kategori Kursi</span>
                  <span className="font-semibold text-white">{order.categoryName} ({order.quantity}x)</span>
                </div>
                <div>
                  <span className="text-xs text-[#A1A1AA] block mb-0.5">Nama Pemesan</span>
                  <span className="font-semibold text-white">{order.userName}</span>
                </div>
                <div>
                  <span className="text-xs text-[#A1A1AA] block mb-0.5">Total Pembayaran</span>
                  <span className="font-semibold text-white tabular-nums">{formatIDR(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 p-6 sm:p-8 bg-[#0C0D12] flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white rounded-xl inline-block">
                <QRCodeCanvas
                  id="ticket-real-qrcode"
                  value={order.qrCode || order.orderCode}
                  size={170}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#0C0D12"
                />
              </div>

              <div className="mt-4 w-full">
                <span className="text-xs text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  Kode Pesanan Resmi
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider tabular-nums">
                    {order.orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    aria-label="Salin kode invoice"
                    className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-[#14161F] text-[#E4E4E7] hover:text-white border border-[#3E4357] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-2 mb-0 leading-relaxed">
                  Tunjukkan Kode QR ini kepada petugas di pintu masuk concert hall.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleDownloadPNG}
            disabled={!!isDownloading}
            className="min-h-[48px] bg-[#14161F] hover:bg-[#1D202D] text-white border border-[#3E4357] rounded-lg py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isDownloading === 'PNG' ? 'Membuat...' : 'Unduh Gambar (PNG)'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!!isDownloading}
            className="min-h-[48px] bg-white hover:bg-neutral-200 text-[#0C0D12] rounded-lg py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isDownloading === 'PDF' ? 'Membuat...' : 'Cetak Tiket (PDF)'}</span>
          </button>
          <a
            href={`/ticket/${order.orderCode}`}
            className="min-h-[48px] bg-[#14161F] hover:bg-[#1D202D] text-white border border-[#3E4357] rounded-lg py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span>Buka Halaman Tiket</span>
          </a>
        </div>
      </div>
    </FullscreenWorkspace>
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
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setHasSearched(true);
    setIsSearching(true);
    try {
      const res = await lookupTicketAPI(searchCode.trim());
      if (res.success && res.data) {
        setFoundOrder(res.data);
      } else {
        const q = searchCode.trim().toLowerCase();
        const match = orders.find((o) => o.orderCode.toLowerCase() === q);
        setFoundOrder(match || null);
      }
    } catch {
      const q = searchCode.trim().toLowerCase();
      const match = orders.find((o) => o.orderCode.toLowerCase() === q);
      setFoundOrder(match || null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/80"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cek Tiket dan Invoice"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md text-[#F4F4F6] h-full flex flex-col overflow-y-auto bg-[#0C0D12] border-l border-[#272A38]"
      >
        <div className="flex items-center justify-between border-b border-[#272A38] px-5 py-4 bg-[#14161F] sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-white" strokeWidth={1.7} aria-hidden="true" />
            <h2 className="text-lg font-bold text-[#F4F4F6] m-0">Cek Tiket &amp; Invoice</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup laci tiket"
            className="h-11 w-11 inline-flex items-center justify-center text-[#A1A1AA] hover:text-white bg-[#0C0D12] border border-[#3E4357] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6 flex-1">
          <form onSubmit={handleSearch} className="space-y-3 border-b border-[#272A38] pb-6">
            <label htmlFor="drawer-order-search" className="text-xs font-medium text-[#E4E4E7] block">
              Cari Cepat Kode Pesanan
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="drawer-order-search"
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="SYM-893472"
                  className={`${fieldInputBase} pl-10 font-mono uppercase`}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchCode.trim()}
                className="min-h-[46px] px-4 bg-white text-[#0C0D12] hover:bg-neutral-200 rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-40 shrink-0"
              >
                {isSearching ? '...' : 'Cari'}
              </button>
            </div>

            {hasSearched && !isSearching && (
              foundOrder ? (
                <div className="p-4 rounded-xl bg-[#14161F] border border-white/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-white">{foundOrder.orderCode}</span>
                    <span className="text-xs font-semibold text-emerald-300">{foundOrder.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-white m-0">{foundOrder.eventTitle}</p>
                  <button
                    type="button"
                    onClick={() => onShowTicket(foundOrder)}
                    className="w-full min-h-[44px] mt-2 rounded-lg bg-white text-[#0C0D12] text-xs font-semibold hover:bg-neutral-200"
                  >
                    Buka E-Ticket &amp; QR
                  </button>
                </div>
              ) : (
                <p role="status" className="text-xs text-rose-300 m-0">
                  Kode pesanan tidak ditemukan. Periksa kembali format SYM-XXXXXX.
                </p>
              )
            )}

            <a
              href="/redeem"
              className="w-full min-h-[44px] bg-[#14161F] border border-[#3E4357] text-white py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:border-white/60 transition-colors"
            >
              <QrCode className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
              <span>Buka Halaman Redeem Tiket Resmi</span>
            </a>
          </form>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
              E-Ticket di Akun Anda ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 bg-[#14161F] border border-[#272A38] rounded-xl p-5">
                <Ticket className="w-8 h-8 mx-auto mb-3 text-[#A1A1AA]" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-sm font-semibold text-white m-0">Belum Ada Tiket Tersimpan</p>
                <p className="text-xs text-[#A1A1AA] mt-1 m-0">Pesan tiket konser baru atau cari menggunakan kode invoice di atas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord, idx) => (
                  <div key={ord.id || idx} className="p-4 rounded-xl bg-[#14161F] border border-[#272A38]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-white tabular-nums">
                        {ord.orderCode}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
                        {ord.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 m-0">{ord.eventTitle}</h4>
                    <p className="text-xs text-[#A1A1AA] mb-3 mt-0">{ord.artist}</p>
                    <div className="flex items-center justify-between border-t border-[#272A38] pt-3">
                      <span className="text-xs text-[#A1A1AA]">{ord.categoryName} ({ord.quantity}x)</span>
                      <button
                        type="button"
                        onClick={() => onShowTicket(ord)}
                        className="min-h-[40px] px-3 rounded-lg bg-[#0C0D12] border border-[#3E4357] text-white hover:border-white flex items-center gap-1.5 text-xs font-semibold transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                        <span>Tampilkan QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
