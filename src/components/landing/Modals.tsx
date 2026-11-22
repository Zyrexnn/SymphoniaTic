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
import { resolveOrderTickets, downloadOrderPNG, downloadOrderPDF } from '@/lib/ticketCanvas';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField, fieldInputLight } from '@/components/ui/form-controls';
import { TicketPassSwitcher } from '@/components/ui/TicketPassSwitcher';
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
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
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

  useEffect(() => {
    setAttendeeNames((prev) =>
      Array.from({ length: quantity }, (_, i) => prev[i] ?? (i === 0 ? userName : ''))
    );
  }, [quantity]);

  useEffect(() => {
    if (userName) {
      setAttendeeNames((prev) => {
        if (prev.length === 0) return [userName];
        if (!prev[0]?.trim()) {
          const next = [...prev];
          next[0] = userName;
          return next;
        }
        return prev;
      });
    }
  }, [userName]);

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
      const resolvedAttendees =
        quantity > 1
          ? Array.from({ length: quantity }, (_, i) => (attendeeNames[i] || '').trim() || userName.trim())
          : undefined;
      const res = await createOrderAPI({
        eventId: String(event.id),
        ticketCategoryId: selectedCat.id,
        quantity,
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        seatNumbers: selectedSeats.length > 0 ? selectedSeats : undefined,
        attendeeNames: resolvedAttendees,
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
              <span className="text-xs text-[#52514D] block truncate">
                {quantity}x {selectedCat.name}{selectedSeats.length > 0 ? ` (${selectedSeats.join(', ')})` : ''}
              </span>
              <span className="text-lg font-extrabold text-[#141413] tabular-nums block truncate">
                {formatIDR(totalPrice)}
              </span>
            </div>
            <button
              type="submit"
              form={formId}
              disabled={!canSubmit}
              className="min-h-[48px] shrink-0 rounded-none bg-[#D4FF2A] text-[#141413] border border-[#141413] font-bold hover:bg-[#C2EE1A] disabled:opacity-40 transition-colors px-5 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
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
        <div className="max-w-xl mx-auto rounded-none border border-[#DFDDD6] bg-white p-6 sm:p-8 space-y-5">
          <div
            role="alert"
            className="p-4 border border-[#8A5A00] bg-[#8A5A00]/10 text-[#141413] text-sm rounded-none leading-relaxed flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-[#8A5A00] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-base text-[#8A5A00] mb-1 m-0">Penjualan Tiket Ditutup</p>
              <p className="m-0 text-[#52514D]">
                Pertunjukan konser ini sudah dimulai atau penjualan tiket telah dihentikan oleh pihak penyelenggara.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[46px] py-3 text-xs font-bold uppercase tracking-wider text-[#141413] bg-[#F4F3EF] hover:bg-[#EAE8E1] border border-[#141413] rounded-none transition-colors"
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
                className="p-4 bg-[#C81E1E]/10 border border-[#C81E1E] text-[#C81E1E] text-sm rounded-none flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-[#C81E1E] mt-0.5" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {user && (
              <div className="p-4 bg-white border border-[#DFDDD6] rounded-none flex items-start gap-3 text-sm text-[#52514D]">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#156E3F] mt-0.5" aria-hidden="true" />
                <span>
                  Terhubung sebagai <strong className="text-[#141413]">{user.name}</strong> ({user.email}). E-Ticket otomatis tersimpan di akun Anda.
                </span>
              </div>
            )}

            <div className="lg:hidden rounded-none border border-[#DFDDD6] bg-white overflow-hidden">
              {event.image && (
                <div className="relative aspect-[16/9] w-full bg-[#141413] overflow-hidden">
                  <img
                    src={event.image}
                    alt={`Tampilan venue ${event.venue}`}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 px-4 py-3 flex items-end justify-between gap-2"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(20,20,19,0.9) 100%)' }}
                  >
                    <span className="text-xs font-semibold text-white">Referensi Venue</span>
                    <span className="text-xs text-[#D8D6CE] truncate">{event.venue}</span>
                  </div>
                </div>
              )}
              <div className="p-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#52514D]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#141413] shrink-0" aria-hidden="true" />
                  <span>{event.date} &middot; {event.time}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#6E6D68] shrink-0" aria-hidden="true" />
                  <span>Open Gate {event.openGate}</span>
                </span>
              </div>
            </div>

            <section className="rounded-none border border-[#DFDDD6] bg-white p-4 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#141413] m-0">1. Pilih Zona &amp; Nomor Kursi</h3>
                  <p className="text-xs text-[#52514D] mt-0.5 m-0">
                    Pilih kategori lalu tentukan nomor kursi Anda langsung pada denah atau gunakan pilihan otomatis.
                  </p>
                </div>
                <span className="text-xs text-[#6E6D68] font-mono shrink-0">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
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
                      className={`text-left p-4 min-h-[88px] rounded-none transition-colors flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                        isSoldOut
                          ? 'bg-[#EAE8E1] opacity-65'
                          : isSelected
                          ? 'bg-[#D4FF2A] text-[#141413]'
                          : 'bg-white text-[#141413] hover:bg-[#F4F3EF]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-2 text-sm font-bold text-[#141413]">
                            <span
                              className="w-2.5 h-2.5 rounded-none shrink-0 border border-[#141413]"
                              style={{ backgroundColor: isSoldOut ? '#6E6D68' : (meta?.style.color || '#3E5668') }}
                              aria-hidden="true"
                            />
                            <span className="truncate">{cat.name}</span>
                          </span>
                          {meta && (
                            <span className={`block text-[11px] mt-0.5 ${isSelected ? 'text-[#141413]/80' : 'text-[#52514D]'}`}>
                              {meta.style.zoneLabel}
                            </span>
                          )}
                        </div>
                        {isSoldOut ? (
                          <span className="text-[11px] font-mono font-bold text-[#C81E1E] bg-[#C81E1E]/10 px-2 py-0.5 shrink-0">
                            HABIS
                          </span>
                        ) : (
                          <span className={`text-xs shrink-0 tabular-nums font-medium ${isSelected ? 'text-[#141413]' : 'text-[#52514D]'}`}>
                            Sisa {rem}
                          </span>
                        )}
                      </div>
                      <span className="text-base font-extrabold tabular-nums block text-[#141413]">
                        {formatIDR(cat.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-none border border-[#DFDDD6] bg-white p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#141413] m-0">2. Jumlah Tiket</h3>
                <p className="text-xs text-[#52514D] mt-0.5 m-0">
                  {isSelectedSoldOut ? 'Kategori ini sedang habis' : `Maksimal ${maxAllowedTickets} tiket per transaksi`}
                </p>
              </div>

              {isSelectedSoldOut ? (
                <div className="p-3.5 bg-[#C81E1E]/10 border border-[#C81E1E] text-[#C81E1E] text-sm rounded-none">
                  Kategori kursi ini telah habis dipesan. Silakan pilih kategori lain.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
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
                        className={`min-h-[48px] py-2.5 rounded-none text-sm font-bold transition-colors border tabular-nums ${
                          isDisabled
                            ? 'opacity-45 bg-[#EAE8E1] border-[#DFDDD6] text-[#6E6D68]'
                            : active
                            ? 'bg-[#141413] text-[#D4FF2A] border-[#141413]'
                            : 'bg-[#F4F3EF] text-[#141413] border-[#DFDDD6] hover:border-[#141413]'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-none border border-[#DFDDD6] bg-white p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#141413] m-0">3. Data Pemesan</h3>
                <p className="text-xs text-[#52514D] mt-0.5 m-0">
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
                  className={user ? 'bg-[#EAE8E1]' : ''}
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
                  className={user ? 'bg-[#EAE8E1]' : ''}
                />
              </div>

              {quantity > 1 && (
                <div className="pt-4 border-t border-[#DFDDD6] space-y-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#141413] m-0">
                      Identitas Pemegang Kursi ({quantity} Tiket)
                    </h4>
                    <p className="text-xs text-[#52514D] mt-1 mb-0">
                      Nama masing-masing pengunjung akan dicetak di E-Ticket per kursi. Jika dikosongkan, nama pemesan utama akan digunakan.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {Array.from({ length: quantity }, (_, idx) => {
                      const seatCode = selectedSeats[idx];
                      const seatLabel = seatCode ? `Kursi ${seatCode}` : `Tiket ${idx + 1}`;
                      return (
                        <TextInputField
                          key={`${seatLabel}-${idx}`}
                          theme="light"
                          label={idx === 0 ? `${seatLabel} (Pemesan)` : seatLabel}
                          placeholder={`Nama pengunjung ${seatLabel.toLowerCase()} (opsional)`}
                          value={attendeeNames[idx] ?? ''}
                          onValueChange={(val) =>
                            setAttendeeNames((prev) => {
                              const next = [...prev];
                              next[idx] = val;
                              return next;
                            })
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="hidden lg:block lg:col-span-5 sticky top-6">
            <div className="rounded-none border border-[#141413] bg-white overflow-hidden">
              {event.image && (
                <div className="relative aspect-[16/9] w-full bg-[#141413] overflow-hidden">
                  <img
                    src={event.image}
                    alt={`Tampilan venue ${event.venue}`}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 px-5 py-3.5 flex items-end justify-between gap-2"
                    style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(20,20,19,0.9) 100%)' }}
                  >
                    <span className="text-xs font-semibold text-white">Referensi Tampilan Venue</span>
                    <span className="text-xs text-[#D8D6CE] truncate">{event.venue}</span>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-[#141413] m-0">
                    Ringkasan Pesanan
                  </h3>
                  <div className="mt-3 space-y-2 text-xs text-[#52514D]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#141413] shrink-0" aria-hidden="true" />
                      <span>{event.date} &middot; {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#6E6D68] shrink-0" aria-hidden="true" />
                      <span>Open Gate {event.openGate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6E6D68] shrink-0" aria-hidden="true" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#DFDDD6] pt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3 items-start">
                    <span className="text-[#52514D]">Zona &amp; Kategori</span>
                    <div className="text-right">
                      <span className="inline-flex items-center justify-end gap-1.5 text-[#141413] font-bold">
                        <span
                          className="w-2.5 h-2.5 rounded-none shrink-0 border border-[#141413]"
                          style={{ backgroundColor: selectedTierMeta?.style.color || '#3E5668' }}
                          aria-hidden="true"
                        />
                        <span>{selectedCat.name}</span>
                      </span>
                      {selectedTierMeta && (
                        <span className="block text-[11px] text-[#52514D]">
                          {selectedTierMeta.style.zoneLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#52514D]">Harga Satuan</span>
                    <span className="text-[#141413] font-mono tabular-nums">{formatIDR(selectedCat.price)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#52514D]">Jumlah</span>
                    <span className="text-[#141413] font-mono">{quantity} tiket</span>
                  </div>
                  <div className="flex justify-between gap-3 items-start">
                    <span className="text-[#52514D]">Nomor Kursi</span>
                    <span className="text-[#141413] font-mono font-bold text-right">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Menunggu pilihan'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#DFDDD6] pt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-[#52514D]">Total Pembayaran</span>
                  <span className="font-display text-2xl font-extrabold text-[#141413] tabular-nums">{formatIDR(totalPrice)}</span>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full min-h-[48px] rounded-none bg-[#D4FF2A] text-[#141413] border border-[#141413] font-bold uppercase tracking-wider hover:bg-[#C2EE1A] disabled:opacity-40 transition-colors py-3 px-6 text-xs flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
  const tickets = useMemo(() => resolveOrderTickets(order), [order]);
  const [activeTab, setActiveTab] = useState<number>(() => (tickets.length > 1 ? 0 : -1));
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab(tickets.length > 1 ? 0 : -1);
  }, [order.orderCode, tickets.length]);

  const activeTicket = activeTab >= 0 ? tickets[activeTab] || null : null;
  const activeQRValue = activeTicket?.qrCode || order.qrCode || order.orderCode;
  const activeSeatLabel = activeTicket?.seatCode || order.seatNumbers || 'Sesuai Kategori';
  const activeAttendee = activeTicket?.attendeeName || order.userName;
  const activeDisplayCode = activeTicket?.seatCode
    ? `${order.orderCode}-${activeTicket.seatCode}`
    : order.orderCode;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = async () => {
    setIsDownloading('PNG');
    try {
      downloadOrderPNG(order, activeTicket, activeTab >= 0 ? activeTab : undefined);
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading('PDF');
    try {
      await downloadOrderPDF(order);
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
        <div className="flex items-start gap-3 p-4 bg-white border border-[#DFDDD6] rounded-none text-sm text-[#52514D]">
          <Mail className="w-5 h-5 text-[#141413] shrink-0 mt-0.5" strokeWidth={1.8} aria-hidden="true" />
          <div className="leading-relaxed">
            <p className="text-[#141413] font-semibold m-0">
              E-Ticket dan konfirmasi pesanan telah dikirim ke <span className="font-bold">{order.userEmail}</span>.
            </p>
            <p className="text-xs text-[#52514D] mt-1 m-0">
              Simpan pass digital ini atau periksa folder inbox email Anda untuk mengunduh tanda masuk resmi.
            </p>
          </div>
        </div>

        <TicketPassSwitcher tickets={tickets} activeTab={activeTab} onChangeTab={setActiveTab} />

        <div
          data-ticket-card="true"
          className="bg-white border border-[#141413] rounded-none overflow-hidden"
        >
          <div className="h-2 w-full bg-[#D4FF2A] border-b border-[#141413]" />
          <div className="px-6 py-4 border-b border-[#DFDDD6] bg-[#141413] text-[#F4F3EF] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-display text-lg font-extrabold tracking-tight text-[#F4F3EF] block leading-tight">
                SymphoniaTic<span className="text-[#D4FF2A]">.</span> Pass
              </span>
              <span className="text-xs text-[#B8B6AE]">
                {activeTicket && tickets.length > 1
                  ? `Pass Tiket ${activeTab + 1} dari ${tickets.length} · Kursi ${activeTicket.seatCode}`
                  : 'Pass Masuk Konser Orkestra'}
              </span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#141413] bg-[#D4FF2A] px-3 py-1">
              {activeTicket?.status || order.status || 'VERIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6 border-b md:border-b-0 md:border-r border-[#DFDDD6]">
              <div>
                <span className="text-[10px] font-bold text-[#52514D] uppercase tracking-[0.16em] block mb-1">
                  • Pertunjukan
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#141413] leading-tight m-0">
                  {order.eventTitle}
                </h3>
                <p className="text-sm text-[#52514D] mt-1 mb-0">{order.artist}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#DFDDD6] text-sm">
                <div>
                  <span className="text-xs text-[#6E6D68] block mb-0.5">Tanggal Konser</span>
                  <span className="font-bold text-[#141413]">{order.date}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6E6D68] block mb-0.5">Open Gate</span>
                  <span className="font-bold text-[#141413]">{order.openGate || 'Sesuai Jadwal Venue'}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6E6D68] block mb-0.5">Gedung &amp; Lokasi</span>
                  <span className="font-bold text-[#141413]">{order.venue}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6E6D68] block mb-0.5">Kategori Kursi</span>
                  <span className="font-bold text-[#141413]">
                    {activeTicket && tickets.length > 1 ? order.categoryName : `${order.categoryName} (${order.quantity}x)`}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6E6D68] block mb-0.5">Nomor Kursi</span>
                  <span className="inline-block font-mono font-bold text-[#141413] bg-[#D4FF2A] px-2 py-0.5">
                    {activeSeatLabel}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6E6D68] block mb-0.5">Pemegang Tiket</span>
                  <span className="font-bold text-[#141413]">{activeAttendee}</span>
                </div>
                <div>
                  <span className="text-xs text-[#6E6D68] block mb-0.5">Total Pembayaran</span>
                  <span className="font-bold text-[#141413] tabular-nums">{formatIDR(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 p-6 sm:p-8 bg-[#F4F3EF] flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white border border-[#141413] rounded-none inline-block">
                <QRCodeCanvas
                  id="ticket-real-qrcode"
                  value={activeQRValue}
                  size={170}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#141413"
                />
              </div>

              <div className="mt-4 w-full">
                <span className="text-[11px] font-bold text-[#52514D] uppercase tracking-wider block mb-1">
                  {activeTicket && tickets.length > 1 ? 'Kode Pass Kursi' : 'Kode Pesanan Resmi'}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl font-mono font-bold text-[#141413] tracking-wider tabular-nums break-all">
                    {activeDisplayCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    aria-label="Salin kode invoice"
                    className="h-10 w-10 shrink-0 inline-flex items-center justify-center rounded-none bg-white text-[#141413] hover:border-[#141413] border border-[#DFDDD6] transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#156E3F]" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                <p className="text-xs text-[#52514D] mt-2 mb-0 leading-relaxed">
                  {activeTicket && tickets.length > 1
                    ? 'QR Code ini berlaku khusus untuk kursi ini, sehingga pemegang tiket dapat masuk gate secara terpisah.'
                    : 'Tunjukkan Kode QR ini kepada petugas di pintu masuk concert hall.'}
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
            className="min-h-[48px] bg-white hover:bg-[#EAE8E1] text-[#141413] border border-[#141413] rounded-none py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>
              {isDownloading === 'PNG'
                ? 'Membuat...'
                : activeTicket?.seatCode
                ? `Unduh PNG (${activeTicket.seatCode})`
                : 'Unduh Gambar (PNG)'}
            </span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!!isDownloading}
            className="min-h-[48px] bg-[#D4FF2A] hover:bg-[#C2EE1A] text-[#141413] border border-[#141413] rounded-none py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>
              {isDownloading === 'PDF'
                ? 'Membuat...'
                : tickets.length > 1
                ? `Unduh ${tickets.length} Tiket (PDF)`
                : 'Cetak Tiket (PDF)'}
            </span>
          </button>
          <a
            href={`/ticket/${order.orderCode}`}
            className="min-h-[48px] bg-[#141413] hover:bg-[#2A2A28] text-[#F4F3EF] rounded-none py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
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
      className="fixed inset-0 z-50 flex justify-end bg-[#141413]/70"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cek Tiket dan Invoice"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md text-[#141413] h-full flex flex-col overflow-y-auto bg-[#F4F3EF] border-l border-[#141413]"
      >
        <div className="flex items-center justify-between border-b border-[#DFDDD6] px-5 py-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-[#141413]" strokeWidth={1.8} aria-hidden="true" />
            <h2 className="font-display text-xl font-extrabold tracking-tight text-[#141413] m-0">Cek Tiket &amp; Invoice</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup laci tiket"
            className="h-11 w-11 inline-flex items-center justify-center text-[#52514D] hover:text-[#141413] bg-[#F4F3EF] border border-[#DFDDD6] rounded-none transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-6 space-y-6 flex-1">
          <form onSubmit={handleSearch} className="space-y-3 border-b border-[#DFDDD6] pb-6">
            <label htmlFor="drawer-order-search" className="text-xs font-bold uppercase tracking-wider text-[#141413] block">
              Cari Cepat Kode Pesanan
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6E6D68] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
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
                className="min-h-[46px] px-4 bg-[#D4FF2A] text-[#141413] border border-[#141413] hover:bg-[#C2EE1A] rounded-none text-xs font-bold uppercase tracking-wider disabled:opacity-40 shrink-0"
              >
                {isSearching ? '...' : 'Cari'}
              </button>
            </div>

            {hasSearched && !isSearching && (
              foundOrder ? (
                <div className="p-4 rounded-none bg-white border border-[#141413] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#141413]">{foundOrder.orderCode}</span>
                    <span className="text-xs font-bold text-[#156E3F]">{foundOrder.status}</span>
                  </div>
                  <p className="text-sm font-bold text-[#141413] m-0">{foundOrder.eventTitle}</p>
                  <button
                    type="button"
                    onClick={() => onShowTicket(foundOrder)}
                    className="w-full min-h-[44px] mt-2 rounded-none bg-[#141413] text-[#D4FF2A] text-xs font-bold uppercase tracking-wider hover:bg-[#2A2A28]"
                  >
                    Buka E-Ticket &amp; QR
                  </button>
                </div>
              ) : (
                <p role="status" className="text-xs text-[#C81E1E] m-0">
                  Kode pesanan tidak ditemukan. Periksa kembali format SYM-XXXXXX.
                </p>
              )
            )}

            <a
              href="/redeem"
              className="w-full min-h-[44px] bg-white border border-[#141413] text-[#141413] py-2.5 px-4 rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#EAE8E1] transition-colors"
            >
              <QrCode className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" />
              <span>Buka Halaman Redeem Tiket Resmi</span>
            </a>
          </form>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#52514D] mb-3">
              E-Ticket di Akun Anda ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 bg-white border border-[#DFDDD6] rounded-none p-5">
                <Ticket className="w-8 h-8 mx-auto mb-3 text-[#6E6D68]" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-sm font-bold text-[#141413] m-0">Belum Ada Tiket Tersimpan</p>
                <p className="text-xs text-[#52514D] mt-1 m-0">
                  Pesan tiket konser baru atau cari menggunakan kode invoice di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord, idx) => (
                  <div key={ord.id || idx} className="p-4 rounded-none bg-white border border-[#DFDDD6]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono font-bold text-[#141413] tabular-nums">
                        {ord.orderCode}
                      </span>
                      <span className="text-[11px] font-bold text-[#156E3F] bg-[#156E3F]/10 px-2.5 py-0.5 border border-[#156E3F]/30">
                        {ord.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#141413] mb-1 m-0">{ord.eventTitle}</h4>
                    <p className="text-xs text-[#52514D] mb-3 mt-0">{ord.artist}</p>
                    <div className="flex items-center justify-between border-t border-[#DFDDD6] pt-3 gap-2">
                      <div className="text-xs text-[#52514D] min-w-0">
                        <span className="block truncate">{ord.categoryName} ({ord.quantity}x)</span>
                        {ord.seatNumbers && (
                          <span className="font-mono font-semibold text-[#141413] block mt-0.5">
                            Kursi: {ord.seatNumbers}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onShowTicket(ord)}
                        className="min-h-[40px] px-3 rounded-none bg-[#141413] text-[#F4F3EF] hover:bg-[#D4FF2A] hover:text-[#141413] flex items-center gap-1.5 text-xs font-bold transition-colors"
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
