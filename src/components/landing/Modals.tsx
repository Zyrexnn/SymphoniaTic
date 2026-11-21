import React, { useState, useEffect, useId, useMemo } from 'react';
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
import { formatIDR, createOrderAPI, lookupTicketAPI, getEventSeatsAPI } from './data';
import type { EventItem, TicketCategory, OrderRecord, SeatItem } from './data';
import { useAuth } from '@/context/AuthContext';
import { drawTicketCanvas } from '@/lib/ticketCanvas';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField, fieldInputLight } from '@/components/ui/form-controls';
import { SeatingPlanVisualizer, getCategoryTierMap, pickBestAdjacentSeats } from './SeatingPlanVisualizer';

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
  const [eventSeats, setEventSeats] = useState<SeatItem[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [seatsError, setSeatsError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadEventSeats = async () => {
    setSeatsLoading(true);
    setSeatsError('');
    try {
      const res = await getEventSeatsAPI(String(event.id));
      if (res.success && Array.isArray(res.data)) {
        setEventSeats(res.data);
      } else {
        setSeatsError(res.message || 'Gagal memuat ketersediaan nomor kursi.');
      }
    } catch {
      setSeatsError('Gagal terhubung ke server untuk memuat denah kursi.');
    } finally {
      setSeatsLoading(false);
    }
  };

  useEffect(() => {
    loadEventSeats();
  }, [event.id]);

  // Sinkronkan pilihan kursi saat data kursi dari server dimuat, kategori berganti, atau jumlah tiket berubah
  useEffect(() => {
    if (eventSeats.length === 0) return;

    const validInCat = new Set(
      eventSeats
        .filter((s) => s.categoryId === selectedCat.id && s.status === 'AVAILABLE')
        .map((s) => s.seatCode)
    );
    const kept = selectedSeats.filter((code) => validInCat.has(code));

    if (kept.length === quantity) {
      if (kept.length !== selectedSeats.length) {
        setSelectedSeats(kept);
      }
      return;
    }

    if (kept.length > quantity) {
      setSelectedSeats(kept.slice(0, quantity));
      return;
    }

    const needed = quantity - kept.length;
    const extraPool = eventSeats.filter((s) => !kept.includes(s.seatCode));
    const additions = pickBestAdjacentSeats(extraPool, selectedCat.id, needed);
    setSelectedSeats([...kept, ...additions]);
  }, [eventSeats, selectedCat.id, quantity]);

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
    if (eventSeats.length > 0 && selectedSeats.length !== quantity) {
      setErrorMessage(`Silakan pilih tepat ${quantity} nomor kursi pada denah sebelum melanjutkan.`);
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
        seatNumbers: selectedSeats.length > 0 ? selectedSeats : undefined,
      });
      if (res.success && res.data) {
        onSubmit({
          ...res.data,
          openGate: res.data.openGate || event.openGate,
          eventTime: res.data.eventTime || event.time,
        });
      } else {
        setErrorMessage(res.message || 'Gagal memproses pesanan tiket.');
        loadEventSeats();
      }
    } catch {
      setErrorMessage('Gagal terhubung ke server backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = selectedCat.price * quantity;
  const tierMap = useMemo(() => getCategoryTierMap(event.categories || []), [event.categories]);
  const selectedTierMeta = tierMap.get(selectedCat.id);
  const seatsReady = eventSeats.length === 0 || selectedSeats.length === quantity;
  const canSubmit =
    !isSubmitting &&
    !isSelectedSoldOut &&
    maxAllowedTickets > 0 &&
    seatsReady &&
    userName.trim().length > 0 &&
    userEmail.trim().length > 0;

  return (
    <FullscreenWorkspace
      isOpen={true}
      onClose={onClose}
      theme="light"
      eyebrow="Reservasi Tiket Resmi"
      title={event.title}
      subtitle={`${event.artist} · ${event.venue}`}
      maxWidthClass="max-w-6xl"
      backLabel="Kembali"
      footer={
        !event.isClosed ? (
          <div className="lg:hidden flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs text-[#5C5850] block truncate">
                {quantity}x {selectedCat.name}{selectedSeats.length > 0 ? ` (${selectedSeats.join(', ')})` : ''}
              </span>
              <span className="text-lg font-bold text-[#171614] tabular-nums block truncate">
                {formatIDR(totalPrice)}
              </span>
            </div>
            <button
              type="submit"
              form={formId}
              disabled={!canSubmit}
              className="min-h-[48px] shrink-0 rounded-lg bg-[#C93018] text-white font-semibold hover:bg-[#A82511] disabled:opacity-40 transition-colors px-5 py-3 text-sm flex items-center justify-center gap-2"
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
        <div className="max-w-xl mx-auto rounded-2xl border border-[#E4DFD3] bg-white p-6 sm:p-8 space-y-5">
          <div
            role="alert"
            className="p-4 border border-[#855A0E]/30 bg-[#855A0E]/10 text-[#171614] text-sm rounded-xl leading-relaxed flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#855A0E] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-base text-[#855A0E] mb-1 m-0">Penjualan Tiket Ditutup</p>
              <p className="m-0 text-[#5C5850]">
                Pertunjukan konser ini sudah dimulai atau penjualan tiket telah dihentikan oleh pihak penyelenggara.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] py-3 text-sm font-semibold text-[#171614] bg-[#F6F4EE] hover:bg-[#ECE8DF] border border-[#CFC9BC] rounded-lg transition-colors"
          >
            Kembali ke Halaman Konser
          </button>
        </div>
      ) : (
        <form id={formId} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {errorMessage && (
              <div
                role="alert"
                className="p-4 bg-[#B91C1C]/10 border border-[#B91C1C]/30 text-[#B91C1C] text-sm rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-[#B91C1C] mt-0.5" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {user && (
              <div className="p-4 bg-white border border-[#E4DFD3] rounded-xl flex items-start gap-3 text-sm text-[#5C5850]">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#1F6E43] mt-0.5" aria-hidden="true" />
                <span>
                  Terhubung sebagai <strong className="text-[#171614]">{user.name}</strong> ({user.email}). E-Ticket otomatis tersimpan di akun Anda.
                </span>
              </div>
            )}

            <div className="lg:hidden rounded-xl border border-[#E4DFD3] bg-white overflow-hidden">
              {event.image && (
                <div className="relative aspect-[16/9] w-full bg-[#11100E] overflow-hidden">
                  <img
                    src={event.image}
                    alt={`Tampilan venue ${event.venue}`}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 px-4 py-3 flex items-end justify-between gap-2"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(17,16,14,0.88) 100%)' }}
                  >
                    <span className="text-xs font-semibold text-white">Referensi Venue</span>
                    <span className="text-xs text-[#E7E2D8] truncate">{event.venue}</span>
                  </div>
                </div>
              )}
              <div className="p-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#5C5850]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#C93018] shrink-0" aria-hidden="true" />
                  <span>{event.date} &middot; {event.time}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#6B665D] shrink-0" aria-hidden="true" />
                  <span>Open Gate {event.openGate}</span>
                </span>
              </div>
            </div>

            <section className="rounded-xl border border-[#E4DFD3] bg-white p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#171614] m-0">1. Pilih Zona &amp; Nomor Kursi</h3>
                  <p className="text-xs text-[#5C5850] mt-0.5 m-0">
                    Pilih kategori lalu tentukan nomor kursi Anda langsung pada denah atau gunakan pilihan otomatis.
                  </p>
                </div>
                <span className="text-xs text-[#6B665D] font-mono shrink-0">
                  {event.categories.length} Pilihan
                </span>
              </div>

              <SeatingPlanVisualizer
                eventId={String(event.id)}
                venue={event.venue}
                categories={event.categories}
                selectedCategoryId={selectedCat.id}
                quantity={quantity}
                eventSeats={eventSeats}
                seatsLoading={seatsLoading}
                seatsError={seatsError}
                selectedSeats={selectedSeats}
                onSelectCategory={setSelectedCat}
                onSelectSeats={setSelectedSeats}
                onRetrySeats={loadEventSeats}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.categories.map((cat) => {
                  const rem = getRemainingQuota(cat);
                  const isSoldOut = rem <= 0;
                  const isSelected = selectedCat.id === cat.id;
                  const meta = tierMap.get(cat.id);

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      disabled={isSoldOut}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedCat(cat)}
                      className={`text-left p-4 min-h-[88px] rounded-xl transition-colors border flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] ${
                        isSoldOut
                          ? 'bg-[#ECE8DF] border-[#E4DFD3] opacity-65'
                          : isSelected
                          ? 'bg-[#171614] border-2 border-[#171614] text-white'
                          : 'bg-[#F6F4EE] border-[#CFC9BC] text-[#171614] hover:border-[#171614]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="min-w-0">
                          <span className={`inline-flex items-center gap-2 text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#171614]'}`}>
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: isSoldOut ? '#857F74' : (meta?.style.color || '#3E5668') }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{cat.name}</span>
                          </span>
                          {meta && (
                            <span className={`block text-[11px] mt-0.5 ${isSelected ? 'text-[#D8D3C8]' : 'text-[#5C5850]'}`}>
                              {meta.style.zoneLabel}
                            </span>
                          )}
                        </div>
                        {isSoldOut ? (
                          <span className="text-[11px] font-mono font-semibold text-[#B91C1C] bg-[#B91C1C]/10 px-2 py-0.5 rounded shrink-0">
                            HABIS
                          </span>
                        ) : (
                          <span className={`text-xs shrink-0 tabular-nums ${isSelected ? 'text-[#D8D3C8]' : 'text-[#5C5850]'}`}>
                            Sisa {rem}
                          </span>
                        )}
                      </div>
                      <span className={`text-base font-bold tabular-nums block ${isSelected ? 'text-white' : 'text-[#171614]'}`}>
                        {formatIDR(cat.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-[#E4DFD3] bg-white p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#171614] m-0">2. Jumlah Tiket</h3>
                <p className="text-xs text-[#5C5850] mt-0.5 m-0">
                  {isSelectedSoldOut ? 'Kategori ini sedang habis' : `Maksimal ${maxAllowedTickets} tiket per transaksi`}
                </p>
              </div>

              {isSelectedSoldOut ? (
                <div className="p-3.5 bg-[#B91C1C]/10 border border-[#B91C1C]/25 text-[#B91C1C] text-sm rounded-xl">
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
                        className={`min-h-[48px] py-2.5 rounded-lg text-sm font-semibold transition-colors border tabular-nums ${
                          isDisabled
                            ? 'opacity-45 bg-[#ECE8DF] border-[#E4DFD3] text-[#6B665D]'
                            : active
                            ? 'bg-[#171614] text-white border-[#171614]'
                            : 'bg-[#F6F4EE] text-[#171614] border-[#CFC9BC] hover:border-[#171614]'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#E4DFD3] bg-white p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#171614] m-0">3. Data Pemesan</h3>
                <p className="text-xs text-[#5C5850] mt-0.5 m-0">
                  Digunakan untuk penerbitan E-Ticket resmi dan verifikasi di pintu masuk.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextInputField
                  theme="light"
                  label="Nama Lengkap"
                  required
                  placeholder="Nama sesuai kartu identitas"
                  value={userName}
                  onValueChange={setUserName}
                  readOnly={!!user}
                  className={user ? 'bg-[#ECE8DF]' : ''}
                />
                <TextInputField
                  theme="light"
                  label="Alamat Email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={userEmail}
                  onValueChange={setUserEmail}
                  readOnly={!!user}
                  hint="E-Ticket resmi dan invoice akan dikirimkan ke email ini."
                  className={user ? 'bg-[#ECE8DF]' : ''}
                />
              </div>
            </section>
          </div>

          <aside className="hidden lg:block lg:col-span-5 sticky top-6">
            <div className="rounded-xl border border-[#E4DFD3] bg-white overflow-hidden">
              {event.image && (
                <div className="relative aspect-[16/9] w-full bg-[#11100E] overflow-hidden">
                  <img
                    src={event.image}
                    alt={`Tampilan venue ${event.venue}`}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 px-5 py-3.5 flex items-end justify-between gap-2"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(17,16,14,0.88) 100%)' }}
                  >
                    <span className="text-xs font-semibold text-white">Referensi Tampilan Venue</span>
                    <span className="text-xs text-[#E7E2D8] truncate">{event.venue}</span>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-[#171614] m-0">
                    Ringkasan Pesanan
                  </h3>
                  <div className="mt-3 space-y-2 text-xs text-[#5C5850]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C93018] shrink-0" aria-hidden="true" />
                      <span>{event.date} &middot; {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#6B665D] shrink-0" aria-hidden="true" />
                      <span>Open Gate {event.openGate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6B665D] shrink-0" aria-hidden="true" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E4DFD3] pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3 items-start">
                    <span className="text-[#5C5850]">Zona &amp; Kategori</span>
                    <div className="text-right">
                      <span className="inline-flex items-center justify-end gap-1.5 text-[#171614] font-semibold">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: selectedTierMeta?.style.color || '#3E5668' }}
                          aria-hidden="true"
                        />
                        <span>{selectedCat.name}</span>
                      </span>
                      {selectedTierMeta && (
                        <span className="block text-[11px] text-[#5C5850]">
                          {selectedTierMeta.style.zoneLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#5C5850]">Harga Satuan</span>
                    <span className="text-[#171614] font-mono tabular-nums">{formatIDR(selectedCat.price)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#5C5850]">Jumlah</span>
                    <span className="text-[#171614] font-mono">{quantity} tiket</span>
                  </div>
                  <div className="flex justify-between gap-3 items-start">
                    <span className="text-[#5C5850]">Nomor Kursi</span>
                    <span className="text-[#171614] font-mono font-semibold text-right">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Menunggu pilihan'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E4DFD3] pt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#5C5850]">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-[#171614] tabular-nums">{formatIDR(totalPrice)}</span>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full min-h-[48px] rounded-lg bg-[#C93018] text-white font-semibold hover:bg-[#A82511] disabled:opacity-40 transition-colors py-3 px-6 text-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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

      pdf.setFillColor(246, 244, 238);
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
      theme="light"
      eyebrow="E-Ticket Resmi Terbit"
      title="Tiket Berhasil Diterbitkan"
      subtitle={`Kode Pesanan ${order.orderCode}`}
      maxWidthClass="max-w-4xl"
      backLabel="Tutup Pass"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-white border border-[#E4DFD3] rounded-xl text-sm text-[#5C5850]">
          <Mail className="w-5 h-5 text-[#C93018] shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
          <div className="leading-relaxed">
            <p className="text-[#171614] font-medium m-0">
              E-Ticket dan konfirmasi pesanan telah dikirim ke <span className="font-semibold">{order.userEmail}</span>.
            </p>
            <p className="text-xs text-[#5C5850] mt-1 m-0">
              Simpan pass digital ini atau periksa folder inbox email Anda untuk mengunduh tanda masuk resmi.
            </p>
          </div>
        </div>

        <div
          data-ticket-card="true"
          className="bg-white border border-[#E4DFD3] rounded-2xl overflow-hidden"
        >
          <div className="h-1.5 w-full bg-[#C93018]" />
          <div className="px-6 py-4 border-b border-[#E4DFD3] bg-[#F6F4EE] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-display text-lg font-semibold text-[#171614] block leading-tight">
                SymphoniaTic Pass
              </span>
              <span className="text-xs text-[#5C5850]">Pass Masuk Konser Orkestra</span>
            </div>
            <span className="text-xs font-semibold text-[#1F6E43] bg-[#1F6E43]/10 border border-[#1F6E43]/25 px-3 py-1 rounded-md">
              {order.status || 'VERIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6 border-b md:border-b-0 md:border-r border-[#E4DFD3]">
              <div>
                <span className="text-xs font-semibold text-[#C93018] uppercase tracking-wider block mb-1">
                  Pertunjukan
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#171614] leading-snug m-0">
                  {order.eventTitle}
                </h3>
                <p className="text-sm text-[#5C5850] mt-1 mb-0">{order.artist}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E4DFD3] text-sm">
                <div>
                  <span className="text-xs text-[#6B665D] block mb-0.5">Tanggal Konser</span>
                  <span className="font-semibold text-[#171614]">{order.date}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6B665D] block mb-0.5">Open Gate</span>
                  <span className="font-semibold text-[#171614]">{order.openGate || 'Sesuai Jadwal Venue'}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6B665D] block mb-0.5">Gedung &amp; Lokasi</span>
                  <span className="font-semibold text-[#171614]">{order.venue}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6B665D] block mb-0.5">Kategori Kursi</span>
                  <span className="font-semibold text-[#171614]">{order.categoryName} ({order.quantity}x)</span>
                </div>
                <div>
                  <span className="text-xs text-[#6B665D] block mb-0.5">Nomor Kursi</span>
                  <span className="font-mono font-bold text-[#C93018]">
                    {order.seatNumbers || 'Sesuai Kategori'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B665D] block mb-0.5">Nama Pemesan</span>
                  <span className="font-semibold text-[#171614]">{order.userName}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6B665D] block mb-0.5">Total Pembayaran</span>
                  <span className="font-semibold text-[#171614] tabular-nums">{formatIDR(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 p-6 sm:p-8 bg-[#F6F4EE] flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white border border-[#E4DFD3] rounded-xl inline-block">
                <QRCodeCanvas
                  id="ticket-real-qrcode"
                  value={order.qrCode || order.orderCode}
                  size={170}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#171614"
                />
              </div>

              <div className="mt-4 w-full">
                <span className="text-xs text-[#6B665D] uppercase tracking-wider block mb-1">
                  Kode Pesanan Resmi
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-[#171614] tracking-wider tabular-nums">
                    {order.orderCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    aria-label="Salin kode invoice"
                    className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-white text-[#171614] hover:border-[#171614] border border-[#CFC9BC] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#1F6E43]" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                <p className="text-xs text-[#5C5850] mt-2 mb-0 leading-relaxed">
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
            className="min-h-[48px] bg-white hover:bg-[#ECE8DF] text-[#171614] border border-[#CFC9BC] rounded-lg py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isDownloading === 'PNG' ? 'Membuat...' : 'Unduh Gambar (PNG)'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!!isDownloading}
            className="min-h-[48px] bg-[#C93018] hover:bg-[#A82511] text-white rounded-lg py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isDownloading === 'PDF' ? 'Membuat...' : 'Cetak Tiket (PDF)'}</span>
          </button>
          <a
            href={`/ticket/${order.orderCode}`}
            className="min-h-[48px] bg-[#171614] hover:bg-[#2C2A26] text-white rounded-lg py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
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
      className="fixed inset-0 z-50 flex justify-end bg-[#11100E]/65"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cek Tiket dan Invoice"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md text-[#171614] h-full flex flex-col overflow-y-auto bg-[#F6F4EE] border-l border-[#E4DFD3]"
      >
        <div className="flex items-center justify-between border-b border-[#E4DFD3] px-5 py-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-[#C93018]" strokeWidth={1.8} aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-[#171614] m-0">Cek Tiket &amp; Invoice</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup laci tiket"
            className="h-11 w-11 inline-flex items-center justify-center text-[#5C5850] hover:text-[#171614] bg-[#F6F4EE] border border-[#CFC9BC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6 flex-1">
          <form onSubmit={handleSearch} className="space-y-3 border-b border-[#E4DFD3] pb-6">
            <label htmlFor="drawer-order-search" className="text-xs font-semibold text-[#171614] block">
              Cari Cepat Kode Pesanan
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6B665D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="drawer-order-search"
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="SYM-893472"
                  className={`${fieldInputLight} pl-10 font-mono uppercase`}
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchCode.trim()}
                className="min-h-[46px] px-4 bg-[#C93018] text-white hover:bg-[#A82511] rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-40 shrink-0"
              >
                {isSearching ? '...' : 'Cari'}
              </button>
            </div>

            {hasSearched && !isSearching && (
              foundOrder ? (
                <div className="p-4 rounded-xl bg-white border border-[#171614] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#171614]">{foundOrder.orderCode}</span>
                    <span className="text-xs font-semibold text-[#1F6E43]">{foundOrder.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#171614] m-0">{foundOrder.eventTitle}</p>
                  <button
                    type="button"
                    onClick={() => onShowTicket(foundOrder)}
                    className="w-full min-h-[44px] mt-2 rounded-lg bg-[#C93018] text-white text-xs font-semibold hover:bg-[#A82511]"
                  >
                    Buka E-Ticket &amp; QR
                  </button>
                </div>
              ) : (
                <p role="status" className="text-xs text-[#B91C1C] m-0">
                  Kode pesanan tidak ditemukan. Periksa kembali format SYM-XXXXXX.
                </p>
              )
            )}

            <a
              href="/redeem"
              className="w-full min-h-[44px] bg-white border border-[#CFC9BC] text-[#171614] py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 hover:border-[#171614] transition-colors"
            >
              <QrCode className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
              <span>Buka Halaman Redeem Tiket Resmi</span>
            </a>
          </form>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5C5850] mb-3">
              E-Ticket di Akun Anda ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 bg-white border border-[#E4DFD3] rounded-xl p-5">
                <Ticket className="w-8 h-8 mx-auto mb-3 text-[#6B665D]" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-sm font-semibold text-[#171614] m-0">Belum Ada Tiket Tersimpan</p>
                <p className="text-xs text-[#5C5850] mt-1 m-0">
                  Pesan tiket konser baru atau cari menggunakan kode invoice di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord, idx) => (
                  <div key={ord.id || idx} className="p-4 rounded-xl bg-white border border-[#E4DFD3]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-[#171614] tabular-nums">
                        {ord.orderCode}
                      </span>
                      <span className="text-[11px] font-semibold text-[#1F6E43] bg-[#1F6E43]/10 px-2.5 py-0.5 rounded border border-[#1F6E43]/25">
                        {ord.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#171614] mb-1 m-0">{ord.eventTitle}</h4>
                    <p className="text-xs text-[#5C5850] mb-3 mt-0">{ord.artist}</p>
                    <div className="flex items-center justify-between border-t border-[#E4DFD3] pt-3 gap-2">
                      <div className="text-xs text-[#5C5850] min-w-0">
                        <span className="block truncate">{ord.categoryName} ({ord.quantity}x)</span>
                        {ord.seatNumbers && (
                          <span className="font-mono font-semibold text-[#171614] block mt-0.5">
                            Kursi: {ord.seatNumbers}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onShowTicket(ord)}
                        className="min-h-[40px] px-3 rounded-lg bg-[#171614] text-white hover:bg-[#C93018] flex items-center gap-1.5 text-xs font-semibold transition-colors"
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
