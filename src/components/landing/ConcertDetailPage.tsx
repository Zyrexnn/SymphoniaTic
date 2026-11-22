import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Clock, ArrowLeft, Minus, Plus, Ticket, AlertCircle } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR, formatSalesEndLabel } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { BookingModal, ETicketConfirmation } from './Modals';
import { Footer } from './Footer';
import { Header } from './Navbar';
import { parseDate } from './Sections';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SeatingPlanVisualizer, getCategoryTierMap } from './SeatingPlanVisualizer';

type DetailTab = 'INFO' | 'RUNDOWN' | 'BENEFITS' | 'TERMS';
const TABS: { id: DetailTab; label: string }[] = [
  { id: 'INFO', label: 'Informasi & Lokasi' },
  { id: 'RUNDOWN', label: 'Rangkaian Acara' },
  { id: 'BENEFITS', label: 'Kategori & Benefit' },
  { id: 'TERMS', label: 'Syarat & Ketentuan' },
];

interface Props {
  eventId: string;
}

interface BuyCardProps {
  event: EventItem;
  selectedCatId: string;
  onSelectCategory: (catId: string) => void;
  onBuy: (cat: TicketCategory, qty: number) => void;
}

const BuyCard: React.FC<BuyCardProps> = ({ event, selectedCatId, onSelectCategory, onBuy }) => {
  const [qty, setQty] = useState(1);

  const categories = event.categories || [];
  const selectedCat = categories.find((c) => c.id === selectedCatId) || categories[0];

  const getRemainingQuota = (cat: TicketCategory) => {
    if (typeof cat?.remainingQuota === 'number') return cat.remainingQuota;
    if (typeof cat?.quota === 'number') return cat.quota;
    return 0;
  };

  const remaining = selectedCat ? getRemainingQuota(selectedCat) : 0;
  const isSoldOut = remaining <= 0;
  const isAllSoldOut = categories.length > 0 && categories.every((cat) => getRemainingQuota(cat) <= 0);
  const maxAllowed = Math.min(4, Math.max(0, remaining));
  const totalPrice = selectedCat ? selectedCat.price * qty : 0;
  const isClosed = event.isClosed;

  useEffect(() => {
    if (maxAllowed > 0 && qty > maxAllowed) {
      setQty(maxAllowed);
    }
  }, [maxAllowed, qty]);

  const purchaseContent = (
    <div className="bg-white border border-[#E4DFD3] rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="font-display text-2xl font-semibold text-[#171614] tracking-tight m-0">
          Pilih Tiket
        </h3>
        <p className="text-xs text-[#5C5850] mt-1 mb-0">
          Pilih kategori kursi dan jumlah tiket yang ingin dipesan.
        </p>
      </div>

      {isClosed && (
        <div
          role="alert"
          className="mb-5 p-3.5 border border-[#855A0E]/30 bg-[#855A0E]/10 text-[#171614] text-xs font-medium rounded-xl flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-[#855A0E] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Penjualan Ditutup</strong>: Pertunjukan ini sudah dimulai atau penjualan tiket telah dihentikan oleh panitia.
          </span>
        </div>
      )}

      {!isClosed && isAllSoldOut && (
        <div
          role="alert"
          className="mb-5 p-3.5 border border-[#B91C1C]/30 bg-[#B91C1C]/10 text-[#B91C1C] text-xs font-medium rounded-xl flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>Seluruh Tiket Habis Terjual</strong>: Semua kategori kursi untuk konser ini telah habis.
          </span>
        </div>
      )}

      {!isClosed && !isAllSoldOut && event.salesEndAt && (
        <div className="mb-5 p-3 border border-[#E4DFD3] bg-[#F6F4EE] text-[#5C5850] text-xs rounded-xl flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#855A0E] shrink-0" aria-hidden="true" />
          <span>
            Penjualan online ditutup pada{' '}
            <strong className="text-[#171614]">{formatSalesEndLabel(event.salesEndAt)}</strong>
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#5C5850] tracking-wider uppercase">
            Kategori Kursi
          </span>
          <span className="text-xs text-[#6B665D]">
            {categories.length} Pilihan
          </span>
        </div>

        <div className="space-y-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCat?.id === cat.id;
            const catRem = getRemainingQuota(cat);
            const catSoldOut = catRem <= 0;

            return (
              <button
                key={cat.id}
                type="button"
                disabled={isClosed || catSoldOut}
                aria-pressed={isSelected}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full min-h-[60px] flex items-center justify-between p-3.5 rounded-xl text-left transition-colors border ${
                  catSoldOut
                    ? 'opacity-55 bg-[#ECE8DF] border-[#E4DFD3]'
                    : isSelected
                    ? 'border-2 border-[#171614] bg-[#171614] text-white'
                    : 'border border-[#CFC9BC] bg-[#F6F4EE] text-[#171614] hover:border-[#171614]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-[#C93018] bg-[#C93018]' : 'border-[#6B665D] bg-transparent'
                    }`}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>

                  <div className="min-w-0">
                    <span className={`text-sm block truncate font-semibold ${isSelected ? 'text-white' : 'text-[#171614]'}`}>
                      {cat.name}
                    </span>
                    <span className={`text-xs mt-0.5 block tabular-nums ${isSelected ? 'text-[#D8D3C8]' : 'text-[#5C5850]'}`}>
                      {catSoldOut ? (
                        <span className="text-[#B91C1C] font-semibold">(HABIS)</span>
                      ) : (
                        `Sisa ${catRem} kursi`
                      )}
                    </span>
                  </div>
                </div>

                <span className={`text-sm font-bold tabular-nums shrink-0 ml-2 ${isSelected ? 'text-white' : 'text-[#171614]'}`}>
                  {formatIDR(cat.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!isClosed && !isSoldOut && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-[#5C5850] tracking-wider uppercase">
              Jumlah Tiket
            </span>
            <span className="text-xs text-[#6B665D]">
              Maksimal {maxAllowed} tiket
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              aria-label="Kurangi jumlah tiket"
              className="h-11 w-11 flex items-center justify-center rounded-lg border border-[#CFC9BC] bg-[#F6F4EE] text-[#171614] hover:border-[#171614] transition-colors disabled:opacity-35"
            >
              <Minus size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <span className="min-w-[32px] text-center text-base font-bold text-[#171614] tabular-nums select-none">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(Math.min(maxAllowed, qty + 1))}
              disabled={qty >= maxAllowed}
              aria-label="Tambah jumlah tiket"
              className="h-11 w-11 flex items-center justify-center rounded-lg border border-[#CFC9BC] bg-[#F6F4EE] text-[#171614] hover:border-[#171614] transition-colors disabled:opacity-35"
            >
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
            </button>
            <span className="text-xs text-[#5C5850] ml-1">tiket</span>
          </div>
        </div>
      )}

      <div className="border-t border-[#E4DFD3] mb-5" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#5C5850]">Total Pembayaran</span>
        <span className="text-xl font-bold text-[#171614] tabular-nums tracking-tight">
          {formatIDR(totalPrice)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => selectedCat && onBuy(selectedCat, qty)}
        disabled={isClosed || isSoldOut || isAllSoldOut || !selectedCat}
        className={`w-full py-3.5 text-sm font-semibold rounded-lg min-h-[48px] flex items-center justify-center gap-2 transition-colors ${
          isClosed || isSoldOut || isAllSoldOut || !selectedCat
            ? 'bg-[#ECE8DF] border border-[#E4DFD3] text-[#6B665D]'
            : 'bg-[#C93018] text-white hover:bg-[#A82511]'
        }`}
      >
        {isClosed ? (
          <span>ORDER DITUTUP</span>
        ) : isAllSoldOut || isSoldOut ? (
          <span>KUOTA HABIS</span>
        ) : (
          <>
            <Ticket size={16} strokeWidth={2} aria-hidden="true" />
            <span>Pesan Tiket Sekarang</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24">
          {purchaseContent}
        </div>
      </div>

      <div className="lg:hidden pt-2">
        {purchaseContent}
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E4DFD3] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs text-[#5C5850] font-medium block leading-tight truncate">
              {qty} tiket &middot; {selectedCat ? selectedCat.name : ''}
            </span>
            <span className="text-base sm:text-lg font-bold text-[#171614] tabular-nums tracking-tight block truncate">
              {formatIDR(totalPrice)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => selectedCat && onBuy(selectedCat, qty)}
            disabled={isClosed || isSoldOut || isAllSoldOut || !selectedCat}
            className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-lg px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold min-h-[46px] transition-colors ${
              isClosed || isSoldOut || isAllSoldOut || !selectedCat
                ? 'bg-[#ECE8DF] border border-[#E4DFD3] text-[#6B665D]'
                : 'bg-[#C93018] text-white hover:bg-[#A82511]'
            }`}
          >
            {isClosed ? (
              <span>Ditutup</span>
            ) : isAllSoldOut || isSoldOut ? (
              <span>KUOTA HABIS</span>
            ) : (
              <>
                <Ticket size={15} strokeWidth={2} aria-hidden="true" />
                <span>Pesan Tiket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

const isUrl = (str: string): boolean => {
  if (!str) return false;
  return str.startsWith('http://') || str.startsWith('https://');
};

const getCatRemaining = (cat: TicketCategory): number => {
  if (typeof cat?.remainingQuota === 'number') return cat.remainingQuota;
  if (typeof cat?.quota === 'number') return cat.quota;
  return 0;
};

const pickInitialCategoryId = (categories: TicketCategory[], currentId: string): string => {
  if (!categories || categories.length === 0) return '';
  const currentAvailable = categories.find((c) => c.id === currentId && getCatRemaining(c) > 0);
  if (currentAvailable) return currentAvailable.id;
  const firstAvailable = categories.find((c) => getCatRemaining(c) > 0);
  return (firstAvailable || categories[0]).id;
};

const ConcertDetailContent: React.FC<Props> = ({ eventId }) => {
  const { user, logout } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DetailTab>('INFO');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingCategory, setBookingCategory] = useState<TicketCategory | null>(null);
  const [bookingQuantity, setBookingQuantity] = useState<number>(1);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);

  const loadEvent = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const events = await fetchEventsAPI();
      const found = events.find((e) => String(e.id) === eventId);
      const resolved = found || CONCERT_EVENTS.find((e) => String(e.id) === eventId) || null;
      if (resolved) {
        setEvent(resolved);
        if (resolved.categories && resolved.categories.length > 0) {
          setSelectedCatId((prev) => pickInitialCategoryId(resolved.categories, prev));
        }
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      const staticEvent = CONCERT_EVENTS.find((e) => String(e.id) === eventId) || null;
      if (staticEvent) {
        setEvent(staticEvent);
        if (staticEvent.categories && staticEvent.categories.length > 0) {
          setSelectedCatId((prev) => pickInitialCategoryId(staticEvent.categories, prev));
        }
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent(true);
  }, [loadEvent]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#syarat-ketentuan') {
      setTab('TERMS');
    }
  }, []);

  const openBookingWithCategory = (evt: EventItem, cat: TicketCategory, qty: number = 1) => {
    setBookingEvent(evt);
    setBookingCategory(cat);
    setBookingQuantity(qty);
  };

  const handleBookingSubmit = (order: OrderRecord) => {
    setActiveSuccessOrder(order);
    setBookingEvent(null);
    setBookingCategory(null);
    loadEvent(false);
  };

  const tierMap = useMemo(() => getCategoryTierMap(event?.categories || []), [event?.categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] text-[#171614]">
        <Header isScrolled user={user} onLogout={logout} />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#C93018] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-[#5C5850]">Memuat Informasi Konser...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#F6F4EE] text-[#171614]">
        <Header isScrolled user={user} onLogout={logout} />
        <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
          <h1 className="font-display text-3xl font-semibold text-[#171614] mb-3">
            Konser Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#5C5850] mb-6 text-center max-w-md">
            Pertunjukan yang Anda cari mungkin telah berakhir atau tautan tidak valid.
          </p>
          <a
            href="/"
            className="min-h-[44px] inline-flex items-center rounded-lg bg-[#C93018] text-white font-semibold px-6 py-2.5 text-sm hover:bg-[#A82511] transition-colors"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  const getRemainingQuota = (cat: TicketCategory) => {
    if (typeof cat?.remainingQuota === 'number') return cat.remainingQuota;
    if (typeof cat?.quota === 'number') return cat.quota;
    return 0;
  };

  const parsed = parseDate(event.date);

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#171614]">
      <Header isScrolled user={user} onLogout={logout} />

      <div className="relative w-full h-[56vh] min-h-[420px] md:h-[60vh] overflow-hidden pt-16 sm:pt-[68px] bg-[#11100E]">
        <img
          src={event.image}
          alt={event.title}
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,16,14,0.45) 0%, rgba(17,16,14,0.3) 40%, rgba(17,16,14,0.88) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 pt-5 sm:pt-6 flex items-start justify-between gap-4">
          <a
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-[#11100E]/85 border border-white/25 px-4 py-2 min-h-[44px] text-sm font-medium text-white hover:bg-white hover:text-[#171614] transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            <span>Kembali</span>
          </a>

          {parsed.day && (
            <div className="rounded-lg bg-[#C93018] px-4 py-2.5 text-center text-white">
              <span className="block font-display text-2xl sm:text-3xl font-semibold leading-none tabular-nums">
                {parsed.day}
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em]">
                {parsed.month} {parsed.year}
              </span>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 pb-8 md:pb-12">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-white bg-[#11100E]/85 inline-block px-3 py-1 rounded-md border border-white/25">
              {event.category}
            </span>
            {event.isClosed ? (
              <span className="text-xs font-bold tracking-wider uppercase text-white bg-[#11100E]/90 border border-white/30 px-3 py-1 rounded-md">
                Penjualan Ditutup
              </span>
            ) : (event.categories && event.categories.length > 0 && event.categories.every((c) => getRemainingQuota(c) <= 0)) ? (
              <span className="text-xs font-bold tracking-wider uppercase text-white bg-[#C93018] px-3 py-1 rounded-md">
                Tiket Habis
              </span>
            ) : null}
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,56px)] leading-[1.08] tracking-[-0.02em] font-semibold text-white m-0">
            {event.title}
          </h1>
          <p className="text-base md:text-xl font-medium text-[#E7E2D8] mt-2 mb-0">
            {event.artist}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 pb-28 lg:pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-6 pb-6 border-b border-[#E4DFD3]">
          {[
            { label: 'Tanggal', value: event.date },
            { label: 'Waktu Konser', value: event.time },
            { label: 'Open Gate', value: event.openGate },
            { label: 'Gedung Venue', value: event.venue },
          ].map((item) => (
            <div key={item.label} className="min-w-0">
              <span className="text-xs font-semibold text-[#C93018] tracking-wider uppercase block mb-1">
                {item.label}
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#171614] block truncate tabular-nums">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div
          role="tablist"
          aria-label="Informasi detail konser"
          className="flex overflow-x-auto no-scrollbar border-b border-[#E4DFD3] mt-8 -mb-px"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-[48px] whitespace-nowrap bg-transparent text-sm font-semibold px-5 sm:px-6 pt-4 pb-3.5 border-b-[3px] transition-colors ${
                tab === t.id
                  ? 'text-[#171614] border-b-[#C93018]'
                  : 'text-[#6B665D] border-b-transparent hover:text-[#171614]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 pt-10">
          <div className="lg:col-span-2">
            {tab === 'INFO' && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171614] mb-3">
                    Deskripsi Pertunjukan
                  </h2>
                  <p className="text-base text-[#5C5850] leading-relaxed max-w-[720px]">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[720px]">
                  {[
                    ['Penyelenggara Resmi', event.organizer],
                    ['Konduktor & Solois', event.conductor],
                    ['Jadwal Tanggal', event.date],
                    ['Waktu Pertunjukan', `${event.time} (Open Gate ${event.openGate})`],
                  ].map(([label, value]) => (
                    <div key={label} className="p-4 rounded-xl bg-white border border-[#E4DFD3]">
                      <span className="text-xs font-semibold text-[#C93018] tracking-wider uppercase block mb-1">
                        {label}
                      </span>
                      <span className="text-sm font-semibold text-[#171614]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="max-w-[720px]">
                  <h3 className="font-display text-2xl font-semibold text-[#171614] mb-3 flex items-center gap-2">
                    <MapPin size={18} strokeWidth={2} className="text-[#C93018]" aria-hidden="true" />
                    <span>Detail Lokasi Venue</span>
                  </h3>
                  <p className="text-base font-semibold text-[#171614] mb-1">{event.venue}</p>
                  {event.address && (
                    isUrl(event.address) ? (
                      <p className="text-sm text-[#5C5850] mb-4">
                        <a
                          href={event.address}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#C93018] font-medium hover:underline"
                        >
                          Buka Link Peta Lokasi
                        </a>
                      </p>
                    ) : (
                      <p className="text-sm text-[#5C5850] mb-4">{event.address}</p>
                    )
                  )}

                  <div className="w-full h-[280px] border border-[#E4DFD3] overflow-hidden rounded-xl relative mb-4 bg-white">
                    <iframe
                      title="Peta Lokasi Venue Konser"
                      width="100%"
                      height="280"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={
                        event.googleMapsUrl ||
                        (isUrl(event.address)
                          ? `https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                          : `https://maps.google.com/maps?q=${encodeURIComponent(event.venue + ' ' + event.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`)
                      }
                    />
                  </div>

                  <a
                    href={
                      event.googleMapsUrl ||
                      (isUrl(event.address)
                        ? event.address
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + ' ' + event.address)}`)
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#171614] bg-white border border-[#CFC9BC] px-4 py-2.5 rounded-lg hover:border-[#171614] transition-colors"
                  >
                    <MapPin size={14} strokeWidth={2} className="text-[#C93018]" aria-hidden="true" />
                    <span>Buka Petunjuk Arah di Google Maps</span>
                  </a>
                </div>
              </div>
            )}

            {tab === 'RUNDOWN' && (
              <div className="space-y-4 max-w-[720px]">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171614] mb-5 flex items-center gap-2.5">
                  <span className="h-9 w-9 rounded-lg bg-[#ECE8DF] flex items-center justify-center">
                    <Clock size={17} strokeWidth={2} className="text-[#C93018]" aria-hidden="true" />
                  </span>
                  <span>Rangkaian Acara Konser</span>
                </h2>

                <div className="space-y-3">
                  {(event.rundown || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-white border border-[#E4DFD3]"
                    >
                      <span className="text-xs font-bold text-white w-fit min-w-[96px] bg-[#171614] rounded-md px-3 py-1.5 text-center shrink-0 tabular-nums">
                        {item.time}
                      </span>
                      <span className="text-sm font-medium text-[#171614]">
                        {item.activity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'BENEFITS' && (
              <div className="space-y-6 max-w-[720px]">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171614] mb-2">
                  Denah Kursi, Kategori &amp; Fasilitas
                </h2>

                <SeatingPlanVisualizer
                  eventId={String(event.id)}
                  venue={event.venue}
                  categories={event.categories || []}
                  selectedCategoryId={selectedCatId}
                  quantity={1}
                  onSelectCategory={(cat) => setSelectedCatId(cat.id)}
                  compact
                />

                <div className="space-y-4">
                  {(event.categories || []).map((cat) => {
                    const rem = getRemainingQuota(cat);
                    const isSoldOut = rem <= 0;
                    const tierMeta = tierMap.get(cat.id);
                    const isSelected = selectedCatId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`p-5 rounded-xl bg-white transition-colors ${
                          isSelected ? 'border-2 border-[#171614]' : 'border border-[#E4DFD3]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: isSoldOut ? '#857F74' : (tierMeta?.style.color || '#3E5668') }}
                              aria-hidden="true"
                            />
                            <span className="font-display text-xl font-semibold text-[#171614]">{cat.name}</span>
                          </div>
                          <span className="text-lg font-bold text-[#171614] tabular-nums">{formatIDR(cat.price)}</span>
                        </div>
                        <p className="text-xs text-[#5C5850] mb-3">
                          {tierMeta ? `${tierMeta.style.zoneLabel} · ` : ''}
                          Sisa Kuota:{' '}
                          {isSoldOut ? (
                            <span className="font-bold text-[#B91C1C]">HABIS</span>
                          ) : (
                            <span className="font-bold text-[#1F6E43]">{rem} Tempat Duduk</span>
                          )}
                        </p>
                        <div>
                          <span className="text-xs font-semibold text-[#6B665D] uppercase tracking-wider block mb-2">
                            Fasilitas Termasuk:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(cat.benefits || []).map((b, i) => (
                              <span
                                key={i}
                                className="text-xs font-medium text-[#171614] bg-[#F6F4EE] border border-[#E4DFD3] rounded-md px-3 py-1"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'TERMS' && (
              <div id="syarat-ketentuan" className="max-w-[720px] scroll-mt-24">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171614] mb-5">
                  Syarat &amp; Ketentuan Konser
                </h2>
                <ul className="space-y-3.5 text-sm text-[#171614] leading-relaxed list-none p-0 m-0">
                  {[
                    'Setiap akun atau identitas pemesan diperbolehkan memesan maksimal 4 tiket dalam 1 transaksi resmi.',
                    'Pengunjung diwajibkan mengenakan pakaian rapi dan sopan (Smart Casual atau Formal).',
                    'Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan orkestra demi menjaga kenyamanan akustik.',
                    'E-Ticket resmi ber-Kode QR wajib ditunjukkan melalui smartphone pada saat registrasi di meja Open Gate.',
                    'Pengajuan pembatalan atau pengembalian dana dapat dilakukan melalui portal resmi Pengajuan Refund (/refund) sebelum pertunjukan dimulai sesuai ketentuan yang berlaku.',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E4DFD3]">
                      <span className="mt-2 h-2 w-2 rounded-full bg-[#C93018] shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <BuyCard
            event={event}
            selectedCatId={selectedCatId}
            onSelectCategory={(id) => setSelectedCatId(id)}
            onBuy={(cat, qty) => openBookingWithCategory(event, cat, qty)}
          />
        </div>
      </div>

      {bookingEvent && bookingCategory && (
        <BookingModal
          event={bookingEvent}
          initialCategory={bookingCategory}
          initialQuantity={bookingQuantity}
          onClose={() => {
            setBookingEvent(null);
            setBookingCategory(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}

      {activeSuccessOrder && (
        <ETicketConfirmation
          order={activeSuccessOrder}
          onClose={() => setActiveSuccessOrder(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export const ConcertDetailPage: React.FC<Props> = (props) => (
  <AuthProvider>
    <ConcertDetailContent {...props} />
  </AuthProvider>
);

export default ConcertDetailPage;
