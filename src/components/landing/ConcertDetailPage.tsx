import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowLeft, Minus, Plus, Ticket } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { BookingModal, ETicketConfirmation } from './Modals';
import { Footer } from './Footer';

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

const BuyCard: React.FC<{ event: EventItem; onBuy: () => void }> = ({ event, onBuy }) => {
  const [selectedCatId, setSelectedCatId] = useState(event.categories?.[0]?.id || '');
  const [qty, setQty] = useState(1);

  const selectedCat = event.categories?.find((c) => c.id === selectedCatId) || event.categories?.[0];
  const totalPrice = selectedCat ? selectedCat.price * qty : 0;
  const isMaxQty = qty >= 4;
  const isClosed = event.isClosed;

  const purchaseContent = (
    <>
      {/* ── HEADER ── */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#183B56] tracking-[-0.01em]">Pilih Tiket</h3>
        <p className="text-sm text-[#94A3B8] mt-1">Pilih kategori dan jumlah tiket yang ingin kamu pesan.</p>
      </div>

      {/* ── CLOSED NOTICE ── */}
      {isClosed && (
        <div className="mb-5 p-3 border border-red-200 bg-red-50 text-red-600 text-xs font-medium rounded-lg">
          ⚠️ <strong>Penjualan Ditutup</strong> — Pertunjukan ini sudah dimulai atau penjualan tiket telah dihentikan.
        </div>
      )}

      {/* ── TICKET CATEGORIES ── */}
      <div className="mb-6">
        <span className="text-[11px] font-bold text-[#94A3B8] tracking-[0.1em] uppercase block mb-3">
          Kategori Tiket
        </span>

        <div className="divide-y divide-[#E5E7EB]">
          {(event.categories || []).map((cat) => {
            const isSelected = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                disabled={isClosed}
                onClick={() => setSelectedCatId(cat.id)}
                className={`w-full flex items-center justify-between py-4 px-4 -mx-4 text-left transition-all duration-200 group ${
                  isClosed
                    ? 'opacity-40 cursor-not-allowed'
                    : isSelected
                      ? 'bg-brand-accent/[0.04] cursor-pointer'
                      : 'cursor-pointer hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Radio indicator */}
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-accent bg-brand-accent'
                        : 'border-[#CBD5E1] bg-transparent group-hover:border-[#94A3B8]'
                    }`}
                  >
                    {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>

                  <div>
                    <span
                      className={`text-sm block transition-colors ${
                        isSelected ? 'font-bold text-brand-accent' : 'font-semibold text-[#183B56]'
                      }`}
                    >
                      {cat.name}
                    </span>
                    <span className="text-xs text-[#94A3B8] mt-0.5 block">
                      Sisa {cat.quota} kursi
                    </span>
                  </div>
                </div>

                <span
                  className={`text-sm tabular-nums transition-colors ${
                    isSelected ? 'font-bold text-brand-accent' : 'font-semibold text-[#183B56]'
                  }`}
                >
                  {formatIDR(cat.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── QUANTITY ── */}
      {!isClosed && (
        <div className="mb-6">
          <span className="text-[11px] font-bold text-[#94A3B8] tracking-[0.1em] uppercase block mb-3">
            Jumlah Tiket
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              aria-label="Kurangi jumlah tiket"
              className="h-9 w-9 flex items-center justify-center rounded-full border border-[#E5E7EB] text-[#64748B] hover:border-brand-accent hover:text-brand-accent hover:bg-brand-accent/5 transition-all disabled:opacity-30 disabled:cursor-default disabled:hover:border-[#E5E7EB] disabled:hover:text-[#64748B] disabled:hover:bg-transparent"
            >
              <Minus size={14} strokeWidth={2} />
            </button>
            <span className="min-w-[28px] text-center text-base font-bold text-[#183B56] tabular-nums select-none">
              {qty}
            </span>
            <button
              onClick={() => setQty(Math.min(4, qty + 1))}
              disabled={isMaxQty}
              aria-label="Tambah jumlah tiket"
              className="h-9 w-9 flex items-center justify-center rounded-full border border-[#E5E7EB] text-[#64748B] hover:border-brand-accent hover:text-brand-accent hover:bg-brand-accent/5 transition-all disabled:opacity-30 disabled:cursor-default disabled:hover:border-[#E5E7EB] disabled:hover:text-[#64748B] disabled:hover:bg-transparent"
            >
              <Plus size={14} strokeWidth={2} />
            </button>
            <span className="text-xs text-[#94A3B8] ml-1">maks. 4 tiket</span>
          </div>
        </div>
      )}

      {/* ── DIVIDER ── */}
      <div className="border-t border-[#E5E7EB] mb-5" />

      {/* ── TOTAL + CTA ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#64748B]">Total Pembayaran</span>
        <span className="text-xl font-bold text-[#183B56] tabular-nums tracking-[-0.01em]">
          {formatIDR(totalPrice)}
        </span>
      </div>
      <button
        onClick={onBuy}
        disabled={isClosed}
        className={`w-full py-3.5 text-sm font-bold rounded-full min-h-[48px] flex items-center justify-center gap-2 transition-all duration-300 ${
          isClosed
            ? 'bg-[#F8FAFC] border border-[#E5E7EB] text-[#94A3B8] opacity-60 cursor-not-allowed'
            : 'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-[0_8px_24px_-8px_rgba(108,43,217,0.9)] cursor-pointer active:scale-[0.98]'
        }`}
      >
        {isClosed ? (
          <span>ORDER DITUTUP</span>
        ) : (
          <>
            <Ticket size={16} strokeWidth={2} />
            <span>Beli Tiket</span>
          </>
        )}
      </button>
    </>
  );

  return (
    <>
      {/* ═══════════ DESKTOP — STICKY SIDEBAR (NO CARD) ═══════════ */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24">
          {purchaseContent}
        </div>
      </div>

      {/* ═══════════ MOBILE — INLINE CONTENT (CTA in bottom bar) ═══════════ */}
      <div className="lg:hidden pt-2">
        {purchaseContent}
      </div>

      {/* ═══════════ MOBILE — STICKY BOTTOM BAR ═══════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
          <div className="min-w-0">
            <span className="text-xs text-[#94A3B8] font-medium block leading-tight">
              {qty} tiket{selectedCat ? ` · ${selectedCat.name}` : ''}
            </span>
            <span className="text-lg font-bold text-[#183B56] tabular-nums tracking-[-0.01em]">
              {formatIDR(totalPrice)}
            </span>
          </div>
          <button
            onClick={onBuy}
            disabled={isClosed}
            className={`flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold min-h-[48px] transition-all duration-300 ${
              isClosed
                ? 'bg-[#F8FAFC] border border-[#E5E7EB] text-[#94A3B8] opacity-60 cursor-not-allowed'
                : 'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-[0_8px_24px_-8px_rgba(108,43,217,0.9)] cursor-pointer active:scale-[0.98]'
            }`}
          >
            {isClosed ? (
              <span>Ditutup</span>
            ) : (
              <>
                <Ticket size={15} strokeWidth={2} />
                <span>Beli Tiket</span>
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

const ConcertDetailPage: React.FC<Props> = ({ eventId }) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DetailTab>('INFO');
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
        } else {
          const staticEvent = CONCERT_EVENTS.find((e) => String(e.id) === eventId);
          if (staticEvent) setEvent(staticEvent);
        }
      } catch (err) {
        console.error('Failed to load event:', err);
        const staticEvent = CONCERT_EVENTS.find((e) => String(e.id) === eventId);
        if (staticEvent) setEvent(staticEvent);
      }
      setLoading(false);
    };
    loadEvent();
  }, [eventId]);

  const openBooking = (evt: EventItem) => {
    setBookingEvent(evt);
    setBookingCategory(evt.categories[0]);
  };

  const handleBookingSubmit = (order: OrderRecord) => {
    setActiveSuccessOrder(order);
    setBookingEvent(null);
    setBookingCategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-base font-medium text-[#94A3B8]">Memuat...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <p className="text-2xl font-semibold text-[#183B56] mb-4">Konser Tidak Ditemukan</p>
        <a href="/" className="text-base font-medium text-brand-accent hover:underline">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative w-full h-[55vh] min-h-[380px] md:h-[60vh]">
        <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 py-5">
          <a
            href="/events"
            className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-[#183B56] hover:bg-white hover:shadow-md transition-all"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            <span>Kembali</span>
          </a>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-[1400px] px-6 sm:px-10 pb-10 md:pb-12">
          <p className="text-sm font-bold tracking-[0.08em] uppercase text-brand-accent mb-2">
            {event.category}
          </p>
          <h1 className="text-[clamp(28px,5vw,52px)] leading-[1.05] tracking-[-0.04em] font-bold text-[#183B56]">
            {event.title}
          </h1>
          <p className="text-lg md:text-xl tracking-[-0.01em] font-medium text-[#64748B] mt-2.5">
            {event.artist}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 pb-20 lg:pb-20 pb-32 lg:pb-20">
        {/* Quick Info Bar */}
        <div className="flex flex-wrap items-center gap-8 pt-10 pb-10 border-b border-[#E5E7EB]">
          {[
            { label: 'Tanggal', value: event.date },
            { label: 'Waktu', value: event.time },
            { label: 'Open Gate', value: event.openGate },
            { label: 'Venue', value: event.venue },
          ].map((item) => (
            <div key={item.label}>
              <span className="text-xs font-bold text-[#94A3B8] tracking-[0.06em] uppercase block mb-1">{item.label}</span>
              <span className="text-base font-semibold text-[#183B56]">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-[#E5E7EB] mt-10 -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap cursor-pointer bg-transparent text-sm font-semibold px-5 sm:px-6 pt-4 pb-3.5 border-b-[3px] transition-all ${
                tab === t.id
                  ? 'text-brand-accent border-b-brand-accent'
                  : 'text-[#94A3B8] border-b-transparent hover:text-[#64748B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Grid: Tab Content + Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 pt-12">
          {/* Left: Tab Content */}
          <div className="lg:col-span-2">
            {tab === 'INFO' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl tracking-[-0.02em] font-bold text-[#183B56] mb-4">Deskripsi Mahakarya</h2>
                  <p className="text-base font-normal text-[#64748B] leading-[1.75] max-w-[720px]">{event.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[720px]">
                  {[
                    ['Penyelenggara', event.organizer],
                    ['Konduktor & Solois', event.conductor],
                    ['Jadwal Tanggal', event.date],
                    ['Waktu Konser', `${event.time} (Open Gate ${event.openGate})`],
                  ].map(([label, value]) => (
                    <div key={label} className="border-b border-[#E5E7EB] pb-4">
                      <span className="text-xs font-bold text-[#94A3B8] tracking-[0.06em] uppercase block mb-1.5">{label}</span>
                      <span className="text-base font-semibold text-[#183B56]">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="max-w-[720px]">
                  <h3 className="text-lg font-bold text-[#183B56] mb-3 flex items-center gap-2">
                    <MapPin size={18} strokeWidth={2} className="text-brand-accent" /> Detail Lokasi Venue
                  </h3>
                  <p className="text-base font-semibold text-[#183B56] mb-1">{event.venue}</p>
                  {event.address && (
                    isUrl(event.address) ? (
                      <p className="text-sm text-[#94A3B8] mb-4">
                        <a
                          href={event.address}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-accent font-medium hover:underline"
                        >
                          Buka Link Peta Lokasi
                        </a>
                      </p>
                    ) : (
                      <p className="text-sm text-[#94A3B8] mb-4">{event.address}</p>
                    )
                  )}
                  <div className="w-full h-[280px] border border-[#E5E7EB] overflow-hidden rounded-lg relative mb-3 bg-[#F8FAFC]">
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
                    className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-brand-accent bg-brand-accent/5 border border-brand-accent/20 px-4 py-2.5 rounded-full hover:bg-brand-accent/10 hover:border-brand-accent/40 transition-all"
                  >
                    <MapPin size={14} strokeWidth={2} />
                    <span>Buka Petunjuk Arah di Google Maps</span>
                  </a>
                </div>
              </div>
            )}

            {tab === 'RUNDOWN' && (
              <div className="space-y-4 max-w-[720px]">
                <h2 className="text-2xl tracking-[-0.02em] font-bold text-[#183B56] mb-5 flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                    <Clock size={16} strokeWidth={2} className="text-brand-accent" />
                  </span>
                  Rangkaian Acara
                </h2>
                {(event.rundown || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-5 py-4 border-b border-[#E5E7EB] last:border-b-0">
                    <span className="text-sm font-bold text-brand-accent min-w-[90px] bg-brand-accent/5 rounded-full px-3 py-1 text-center">
                      {item.time}
                    </span>
                    <span className="text-base font-medium text-[#183B56] pt-0.5">{item.activity}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'BENEFITS' && (
              <div className="space-y-6 max-w-[720px]">
                <h2 className="text-2xl tracking-[-0.02em] font-bold text-[#183B56] mb-5">Pilihan Kategori Tiket</h2>
                {(event.categories || []).map((cat) => (
                  <div key={cat.id} className="py-6 border-b border-[#E5E7EB] last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-[#183B56]">{cat.name}</span>
                      <span className="text-lg font-bold text-brand-accent">{formatIDR(cat.price)}</span>
                    </div>
                    <p className="text-sm font-medium text-[#94A3B8] mb-3">
                      Sisa Kuota:{' '}
                      <span className="font-bold text-[#64748B]">{cat.quota}</span> Tempat Duduk
                    </p>
                    <div>
                      <span className="text-xs font-bold text-[#94A3B8] tracking-[0.06em] uppercase block mb-2">Fasilitas Termasuk:</span>
                      <div className="flex flex-wrap gap-2">
                        {(cat.benefits || []).map((b, i) => (
                          <span
                            key={i}
                            className="text-sm font-medium text-[#64748B] bg-[#F8FAFC] border border-[#E5E7EB] rounded-full px-3.5 py-1.5"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'TERMS' && (
              <div className="max-w-[720px]">
                <h2 className="text-2xl tracking-[-0.02em] font-bold text-[#183B56] mb-5">Syarat & Ketentuan</h2>
                <ul className="space-y-4 text-base font-normal text-[#64748B] leading-[1.75]">
                  {[
                    'Setiap akun/identitas pemesan hanya diperbolehkan membeli maksimal 4 tiket dalam 1 transaksi resmi.',
                    'Pengunjung wajib menggunakan pakaian Rapi & Sopan (Smart Casual / Formal).',
                    'Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan simfoni.',
                    'E-Ticket resmi ber-Kode QR wajib ditunjukkan dari smartphone pada saat registrasi Open Gate.',
                    'Tiket yang sudah dibeli tidak dapat ditukarkan uang tunai (non-refundable).',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-accent flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Purchase Module */}
          <BuyCard event={event} onBuy={() => openBooking(event)} />
        </div>
      </div>

      {/* Booking Modal */}
      {bookingEvent && bookingCategory && (
        <BookingModal
          event={bookingEvent}
          initialCategory={bookingCategory}
          onClose={() => { setBookingEvent(null); setBookingCategory(null); }}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* E-Ticket Confirmation */}
      {activeSuccessOrder && (
        <ETicketConfirmation order={activeSuccessOrder} onClose={() => setActiveSuccessOrder(null)} />
      )}
      <Footer />
    </div>
  );
};

export default ConcertDetailPage;