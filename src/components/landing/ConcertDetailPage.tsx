import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowLeft, Minus, Plus, Ticket, AlertCircle } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { BookingModal, ETicketConfirmation } from './Modals';
import { Footer } from './Footer';
import { AuthProvider } from '@/context/AuthContext';

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
  onBuy: (cat: TicketCategory) => void;
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
  const maxAllowed = Math.min(4, Math.max(0, remaining));
  const totalPrice = selectedCat ? selectedCat.price * qty : 0;
  const isClosed = event.isClosed;

  useEffect(() => {
    if (maxAllowed > 0 && qty > maxAllowed) {
      setQty(maxAllowed);
    }
  }, [maxAllowed, qty]);

  const purchaseContent = (
    <div className="bg-[#14161F] border border-[#272A38] rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#F4F4F6] tracking-tight">Pilih Tiket</h3>
        <p className="text-xs text-[#A1A1AA] mt-1">Pilih kategori kursi dan kuota tiket yang ingin dipesan.</p>
      </div>

      {isClosed && (
        <div className="mb-5 p-3.5 border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs font-medium rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Penjualan Ditutup</strong>: Pertunjukan ini sudah dimulai atau penjualan tiket telah dihentikan oleh panitia.
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-[#A1A1AA] tracking-wider uppercase">
            Kategori Kursi
          </span>
          <span className="text-xs text-[#A1A1AA]">
            {categories.length} Pilihan
          </span>
        </div>

        <div className="space-y-2">
          {categories.map((cat) => {
            const isSelected = selectedCat?.id === cat.id;
            const catRem = getRemainingQuota(cat);
            const catSoldOut = catRem <= 0;

            return (
              <button
                key={cat.id}
                disabled={isClosed || catSoldOut}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all border ${
                  catSoldOut
                    ? 'opacity-40 cursor-not-allowed bg-[#10121A] border-[#272A38]'
                    : isSelected
                    ? 'border-2 border-white bg-[#1D202D] shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                    : 'border border-[#272A38] bg-[#14161F] hover:border-white/30 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-white bg-white'
                        : 'border-[#3E4357] bg-transparent'
                    }`}
                  >
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-black" />}
                  </span>

                  <div>
                    <span
                      className={`text-sm block transition-colors ${
                        isSelected ? 'font-bold text-white' : 'font-semibold text-[#F4F4F6]'
                      }`}
                    >
                      {cat.name}
                    </span>
                    <span className="text-xs text-[#A1A1AA] mt-0.5 block">
                      {catSoldOut ? (
                        <span className="text-rose-400 font-semibold">(HABIS)</span>
                      ) : (
                        `Sisa ${catRem} kursi`
                      )}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-sm font-bold tabular-nums ${
                    isSelected ? 'text-white' : 'text-[#F4F4F6]'
                  }`}
                >
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
            <span className="text-[11px] font-bold text-[#A1A1AA] tracking-wider uppercase">
              Jumlah Tiket
            </span>
            <span className="text-xs text-[#A1A1AA]">
              Maksimal {maxAllowed} tiket
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              aria-label="Kurangi jumlah tiket"
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#272A38] bg-[#1C1F2E] text-[#F4F4F6] hover:border-white hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={14} strokeWidth={2} />
            </button>
            <span className="min-w-[28px] text-center text-base font-bold text-[#F4F4F6] tabular-nums select-none">
              {qty}
            </span>
            <button
              onClick={() => setQty(Math.min(maxAllowed, qty + 1))}
              disabled={qty >= maxAllowed}
              aria-label="Tambah jumlah tiket"
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#272A38] bg-[#1C1F2E] text-[#F4F4F6] hover:border-white hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={14} strokeWidth={2} />
            </button>
            <span className="text-xs text-[#A1A1AA] ml-1">tiket</span>
          </div>
        </div>
      )}

      <div className="border-t border-[#272A38] mb-5" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#A1A1AA]">Total Pembayaran</span>
        <span className="text-xl font-bold text-white tabular-nums tracking-tight">
          {formatIDR(totalPrice)}
        </span>
      </div>

      <button
        onClick={() => selectedCat && onBuy(selectedCat)}
        disabled={isClosed || isSoldOut || !selectedCat}
        className={`w-full py-3.5 text-sm font-bold rounded-xl min-h-[48px] flex items-center justify-center gap-2 transition-all ${
          isClosed || isSoldOut || !selectedCat
            ? 'bg-[#10121A] border border-[#272A38] text-[#64748B] opacity-60 cursor-not-allowed'
            : 'bg-white text-[#0C0D12] hover:bg-neutral-200 shadow-sm cursor-pointer active:scale-[0.98]'
        }`}
      >
        {isClosed ? (
          <span>ORDER DITUTUP</span>
        ) : isSoldOut ? (
          <span>KUOTA HABIS</span>
        ) : (
          <>
            <Ticket size={16} strokeWidth={2} />
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

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#14161F]/95 backdrop-blur-md border-t border-[#272A38] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
          <div className="min-w-0">
            <span className="text-xs text-[#A1A1AA] font-medium block leading-tight truncate">
              {qty} tiket &middot; {selectedCat ? selectedCat.name : ''}
            </span>
            <span className="text-lg font-bold text-white tabular-nums tracking-tight">
              {formatIDR(totalPrice)}
            </span>
          </div>
          <button
            onClick={() => selectedCat && onBuy(selectedCat)}
            disabled={isClosed || isSoldOut || !selectedCat}
            className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold min-h-[44px] transition-all ${
              isClosed || isSoldOut || !selectedCat
                ? 'bg-[#10121A] border border-[#272A38] text-[#64748B] opacity-60 cursor-not-allowed'
                : 'bg-white text-[#0C0D12] hover:bg-neutral-200 shadow-sm cursor-pointer active:scale-[0.98]'
            }`}
          >
            {isClosed ? (
              <span>Ditutup</span>
            ) : isSoldOut ? (
              <span>Habis</span>
            ) : (
              <>
                <Ticket size={15} strokeWidth={2} />
                <span>Pesan Tiket Sekarang</span>
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

const ConcertDetailContent: React.FC<Props> = ({ eventId }) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DetailTab>('INFO');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingCategory, setBookingCategory] = useState<TicketCategory | null>(null);
  const [activeSuccessOrder, setActiveSuccessOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const events = await fetchEventsAPI();
        const found = events.find((e) => String(e.id) === eventId);
        if (found) {
          setEvent(found);
          if (found.categories && found.categories.length > 0) {
            setSelectedCatId(found.categories[0].id);
          }
        } else {
          const staticEvent = CONCERT_EVENTS.find((e) => String(e.id) === eventId);
          if (staticEvent) {
            setEvent(staticEvent);
            if (staticEvent.categories && staticEvent.categories.length > 0) {
              setSelectedCatId(staticEvent.categories[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load event:', err);
        const staticEvent = CONCERT_EVENTS.find((e) => String(e.id) === eventId);
        if (staticEvent) {
          setEvent(staticEvent);
          if (staticEvent.categories && staticEvent.categories.length > 0) {
            setSelectedCatId(staticEvent.categories[0].id);
          }
        }
      }
      setLoading(false);
    };
    loadEvent();
  }, [eventId]);

  const openBookingWithCategory = (evt: EventItem, cat: TicketCategory) => {
    setBookingEvent(evt);
    setBookingCategory(cat);
  };

  const handleBookingSubmit = (order: OrderRecord) => {
    setActiveSuccessOrder(order);
    setBookingEvent(null);
    setBookingCategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0D12] text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#A1A1AA]">Memuat Informasi Konser...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0C0D12] text-white px-4">
        <p className="text-2xl font-bold text-white mb-3">Konser Tidak Ditemukan</p>
        <p className="text-sm text-[#A1A1AA] mb-6 text-center max-w-md">
          Pertunjukan yang Anda cari mungkin telah berakhir atau tautan tidak valid.
        </p>
        <a
          href="/"
          className="rounded-lg bg-white text-black font-semibold px-6 py-2.5 text-sm hover:bg-neutral-200 transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  const getRemainingQuota = (cat: TicketCategory) => {
    if (typeof cat?.remainingQuota === 'number') return cat.remainingQuota;
    if (typeof cat?.quota === 'number') return cat.quota;
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#0C0D12] text-[#F4F4F6]">
      {/* Hero Banner */}
      <div className="relative w-full h-[55vh] min-h-[380px] md:h-[60vh] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12] via-[#0C0D12]/70 to-black/30" />

        <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 py-5 z-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#14161F]/80 backdrop-blur-md border border-[#272A38] px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition-all"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Kembali</span>
          </a>
        </div>

        <div className="absolute bottom-0 left-0 right-0 max-w-[1400px] px-6 sm:px-10 pb-10 md:pb-12">
          <p className="text-xs font-semibold tracking-wider uppercase text-white mb-2 bg-white/10 inline-block px-3 py-1 rounded-md border border-white/20">
            {event.category}
          </p>
          <h1 className="text-[clamp(28px,5vw,52px)] leading-tight tracking-tight font-bold text-white">
            {event.title}
          </h1>
          <p className="text-lg md:text-xl font-medium text-[#A1A1AA] mt-2">
            {event.artist}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pb-20 lg:pb-24">
        {/* Quick Info Bar */}
        <div className="flex flex-wrap items-center gap-8 pt-8 pb-8 border-b border-[#272A38]">
          {[
            { label: 'Tanggal', value: event.date },
            { label: 'Waktu Konser', value: event.time },
            { label: 'Open Gate', value: event.openGate },
            { label: 'Gedung Venue', value: event.venue },
          ].map((item) => (
            <div key={item.label}>
              <span className="text-[11px] font-bold text-[#A1A1AA] tracking-wider uppercase block mb-1">
                {item.label}
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#F4F4F6]">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-[#272A38] mt-8 -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap cursor-pointer bg-transparent text-sm font-semibold px-5 sm:px-6 pt-4 pb-3.5 border-b-[3px] transition-all ${
                tab === t.id
                  ? 'text-white border-b-white'
                  : 'text-[#A1A1AA] border-b-transparent hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 pt-10">
          <div className="lg:col-span-2">
            {tab === 'INFO' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F6] mb-3">
                    Deskripsi Pertunjukan
                  </h2>
                  <p className="text-base text-[#D1D5DB] leading-relaxed max-w-[720px]">
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
                    <div key={label} className="p-4 rounded-xl bg-[#14161F] border border-[#272A38]">
                      <span className="text-[11px] font-bold text-[#A1A1AA] tracking-wider uppercase block mb-1">
                        {label}
                      </span>
                      <span className="text-sm font-semibold text-[#F4F4F6]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="max-w-[720px]">
                  <h3 className="text-lg font-bold text-[#F4F4F6] mb-3 flex items-center gap-2">
                    <MapPin size={18} strokeWidth={2} className="text-white" />
                    <span>Detail Lokasi Venue</span>
                  </h3>
                  <p className="text-base font-semibold text-[#F4F4F6] mb-1">{event.venue}</p>
                  {event.address && (
                    isUrl(event.address) ? (
                      <p className="text-sm text-[#A1A1AA] mb-4">
                        <a
                          href={event.address}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white font-medium hover:underline"
                        >
                          Buka Link Peta Lokasi
                        </a>
                      </p>
                    ) : (
                      <p className="text-sm text-[#A1A1AA] mb-4">{event.address}</p>
                    )
                  )}

                  <div className="w-full h-[280px] border border-[#272A38] overflow-hidden rounded-xl relative mb-4 bg-[#14161F]">
                    <iframe
                      title="Peta Lokasi Venue Konser"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={event.googleMapsUrl || (isUrl(event.address) ? `https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : `https://maps.google.com/maps?q=${encodeURIComponent(event.venue + ' ' + event.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`)}
                    />
                  </div>

                  <a
                    href={event.googleMapsUrl || (isUrl(event.address) ? event.address : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + ' ' + event.address)}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-white bg-[#1D202D] border border-[#272A38] px-4 py-2.5 rounded-lg hover:border-white/40 transition-all"
                  >
                    <MapPin size={14} strokeWidth={2} />
                    <span>Buka Petunjuk Arah di Google Maps</span>
                  </a>
                </div>
              </div>
            )}

            {tab === 'RUNDOWN' && (
              <div className="space-y-4 max-w-[720px]">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F6] mb-5 flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Clock size={16} strokeWidth={2} className="text-white" />
                  </span>
                  <span>Rangkaian Acara Konser</span>
                </h2>

                <div className="space-y-3">
                  {(event.rundown || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[#14161F] border border-[#272A38]"
                    >
                      <span className="text-xs font-bold text-white min-w-[95px] bg-white/10 border border-white/20 rounded-md px-3 py-1 text-center shrink-0">
                        {item.time}
                      </span>
                      <span className="text-sm font-medium text-[#F4F4F6] pt-0.5">
                        {item.activity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'BENEFITS' && (
              <div className="space-y-4 max-w-[720px]">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F6] mb-5">
                  Kategori Tiket & Fasilitas
                </h2>

                <div className="space-y-4">
                  {(event.categories || []).map((cat) => {
                    const rem = getRemainingQuota(cat);
                    const isSoldOut = rem <= 0;

                    return (
                      <div
                        key={cat.id}
                        className="p-5 rounded-xl bg-[#14161F] border border-[#272A38]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-[#F4F4F6]">{cat.name}</span>
                          <span className="text-lg font-bold text-white tabular-nums">{formatIDR(cat.price)}</span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] mb-3">
                          Sisa Kuota:{' '}
                          {isSoldOut ? (
                            <span className="font-bold text-rose-400">HABIS</span>
                          ) : (
                            <span className="font-bold text-[#F4F4F6]">{rem} Tempat Duduk</span>
                          )}
                        </p>
                        <div>
                          <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-2">
                            Fasilitas Termasuk:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {(cat.benefits || []).map((b, i) => (
                              <span
                                key={i}
                                className="text-xs font-medium text-[#D1D5DB] bg-[#1D202D] border border-[#272A38] rounded-md px-3 py-1"
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
              <div className="max-w-[720px]">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F6] mb-5">
                  Syarat & Ketentuan Konser
                </h2>
                <ul className="space-y-3.5 text-sm text-[#D1D5DB] leading-relaxed">
                  {[
                    'Setiap akun atau identitas pemesan diperbolehkan memesan maksimal 4 tiket dalam 1 transaksi resmi.',
                    'Pengunjung diwajibkan mengenakan pakaian rapi dan sopan (Smart Casual atau Formal).',
                    'Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan orkestra demi menjaga kenyamanan akustik.',
                    'E-Ticket resmi ber-Kode QR wajib ditunjukkan melalui smartphone pada saat registrasi di meja Open Gate.',
                    'Tiket yang telah berhasil dibeli bersifat final dan tidak dapat ditukarkan uang tunai.',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14161F] border border-[#272A38]">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-white shrink-0" />
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
            onBuy={(cat) => openBookingWithCategory(event, cat)}
          />
        </div>
      </div>

      {bookingEvent && bookingCategory && (
        <BookingModal
          event={bookingEvent}
          initialCategory={bookingCategory}
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
