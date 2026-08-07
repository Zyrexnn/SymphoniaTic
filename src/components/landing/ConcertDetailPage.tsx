import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowLeft, ChevronRight, Minus, Plus } from 'lucide-react';
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

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8 border border-white/[0.06] bg-[#171717]">
        <div className="p-6 border-b border-white/[0.06]">
          <span className="text-sm font-light text-[#9a9a9a] block mb-1">Harga Mulai Dari</span>
          <span className="text-2xl tracking-[-0.014em] font-light text-white">
            {formatIDR(event.categories?.[0]?.price ?? 0)}
          </span>
        </div>

        <div className="p-6 space-y-5">
          {isClosed && (
            <div className="p-3 border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs font-light rounded">
              ⚠️ <strong>Penjualan Ditutup</strong> — Pertunjukan ini sudah dimulai atau penjualan tiket telah dihentikan.
            </div>
          )}

          <div>
            <label className="text-[11px] font-light text-[#7a7a7a] tracking-[0.12em] uppercase block mb-3">
              Pilih Kategori
            </label>
            <div className="space-y-2">
              {(event.categories || []).map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    disabled={isClosed}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 text-left transition-all duration-200 ${
                      isClosed ? 'opacity-40 cursor-not-allowed border-white/[0.04]' : isSelected
                        ? 'border border-white/[0.15] bg-white/[0.03] cursor-pointer'
                        : 'border border-white/[0.04] bg-transparent hover:border-white/[0.08] cursor-pointer'
                    }`}
                  >
                    <div>
                      <span className={`text-sm font-light block ${isSelected ? 'text-white' : 'text-[#9a9a9a]'}`}>
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-light text-[#5a5a5a] mt-0.5 block">
                        Sisa {cat.quota} kursi
                      </span>
                    </div>
                    <span className={`text-sm font-light ${isSelected ? 'text-white' : 'text-[#9a9a9a]'}`}>
                      {formatIDR(cat.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-light text-[#7a7a7a] tracking-[0.12em] uppercase block mb-3">
              Jumlah Tiket
            </label>
            <div className="flex items-center justify-between border border-white/[0.06] px-4 py-2.5">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={isClosed || qty <= 1}
                className="bg-transparent border-none cursor-pointer p-1 text-[#9a9a9a] hover:text-white disabled:opacity-30 disabled:cursor-default"
              >
                <Minus size={14} strokeWidth={1} />
              </button>
              <span className="text-base font-light text-white">{qty}</span>
              <button
                onClick={() => setQty(Math.min(4, qty + 1))}
                disabled={isClosed || isMaxQty}
                className="bg-transparent border-none cursor-pointer p-1 text-[#9a9a9a] hover:text-white disabled:opacity-30 disabled:cursor-default"
              >
                <Plus size={14} strokeWidth={1} />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-light text-[#9a9a9a]">Total</span>
              <span className="text-lg tracking-[-0.01em] font-light text-white">
                {formatIDR(totalPrice)}
              </span>
            </div>
            <button
              onClick={onBuy}
              disabled={isClosed}
              className={`w-full py-3 text-sm font-light text-white border transition-all duration-300 flex items-center justify-center gap-2 ${
                isClosed
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 opacity-60 cursor-not-allowed'
                  : 'bg-white/[0.04] border-white/[0.1] cursor-pointer hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.98]'
              }`}
            >
              <span>{isClosed ? 'ORDER DITUTUP' : 'Beli Tiket'}</span>
              {!isClosed && <ChevronRight size={14} strokeWidth={1} />}
            </button>
          </div>
        </div>
      </div>
    </div>
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
      <div className="min-h-screen flex items-center justify-center bg-[#171717]">
        <p className="text-base font-light text-[#9a9a9a]">Memuat...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#171717]">
        <p className="text-2xl font-light text-white mb-4">Konser Tidak Ditemukan</p>
        <a href="/" className="text-base font-light text-[#9a9a9a] border-b border-[#9a9a9a] pb-0.5">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#171717]">
      {/* Hero Image */}
      <div className="relative w-full h-[60vh] min-h-[400px]">
        <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#171717_0%,rgba(23,23,23,0.3)_40%,transparent_100%)]" />

        {/* Back button */}
        <div className="absolute top-0 left-0 right-0 px-10 py-4">
          <a href="/" className="inline-flex items-center gap-2 text-base font-light text-[#9a9a9a] hover:opacity-60 transition-opacity">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            <span>Kembali</span>
          </a>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-[1400px] px-10 pb-12">
          <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-2">
            {event.category}
          </p>
          <h1 className="text-[clamp(32px,5vw,56px)] leading-[1.0] tracking-[-0.056em] font-light text-white">
            {event.title}
          </h1>
          <p className="text-xl tracking-[-0.01em] font-light text-[#9a9a9a] mt-3">
            {event.artist}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-10 pb-20">
        {/* Quick Info Bar */}
        <div className="flex flex-wrap items-center gap-6 pt-10 pb-10 border-b border-white/[0.06]">
          {[
            { label: 'Tanggal', value: event.date },
            { label: 'Waktu', value: event.time },
            { label: 'Open Gate', value: event.openGate },
            { label: 'Venue', value: event.venue },
          ].map((item) => (
            <div key={item.label}>
              <span className="text-base font-light text-[#9a9a9a] block mb-1">{item.label}</span>
              <span className="text-base font-light text-white">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-white/[0.06] mt-10">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`whitespace-nowrap cursor-pointer bg-transparent border-none text-base font-light tracking-[-0.05px] px-6 pt-4 pb-[14px] ${
                tab === t.id
                  ? 'text-white border-b border-white'
                  : 'text-[#9a9a9a] border-b border-transparent'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Grid: Tab Content + Buy Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-12">
          {/* Left: Tab Content */}
          <div className="lg:col-span-2">
            {tab === 'INFO' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-[28px] tracking-[-0.02em] font-light text-white mb-4">Deskripsi Mahakarya</h2>
                  <p className="text-base font-light text-[#9a9a9a] leading-[1.7] max-w-[720px]">{event.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[720px]">
                  {[['Penyelenggara', event.organizer], ['Konduktor & Solois', event.conductor], ['Jadwal Tanggal', event.date], ['Waktu Konser', `${event.time} (Open Gate ${event.openGate})`]].map(([label, value]) => (
                    <div key={label} className="border-b border-white/[0.06] pb-4">
                      <span className="text-base font-light text-[#9a9a9a] block mb-1">{label}</span>
                      <span className="text-base font-light text-white">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="max-w-[720px]">
                  <h3 className="text-xl tracking-[-0.01em] font-light text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" strokeWidth={1} /> Detail Lokasi Venue &amp; Peta Interaktif
                  </h3>
                  <p className="text-base font-light text-white">{event.venue}</p>
                  {event.address && (
                    isUrl(event.address) ? (
                      <p className="text-base font-light text-[#9a9a9a] mt-1 mb-4">
                        <a href={event.address} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-300 hover:underline">
                          Buka Link Peta Lokasi
                        </a>
                      </p>
                    ) : (
                      <p className="text-base font-light text-[#9a9a9a] mt-1 mb-4">{event.address}</p>
                    )
                  )}
                  <div className="w-full h-[280px] border border-white/10 overflow-hidden relative mb-3 bg-[#171717]">
                    <iframe
                      title="Peta Lokasi Venue Konser"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'grayscale(0.9) invert(0.92) contrast(1.2)' }}
                      loading="lazy"
                      allowFullScreen
                      src={event.googleMapsUrl || (isUrl(event.address) ? `https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : `https://maps.google.com/maps?q=${encodeURIComponent(event.venue + ' ' + event.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`)}
                    />
                  </div>
                  <a
                    href={event.googleMapsUrl || (isUrl(event.address) ? event.address : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + ' ' + event.address)}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-light tracking-wider uppercase text-white border border-white/20 px-4 py-2 hover:bg-white/10 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1} />
                    <span>Buka Petunjuk Arah di Google Maps</span>
                  </a>
                </div>
              </div>
            )}

            {tab === 'RUNDOWN' && (
              <div className="space-y-4 max-w-[720px]">
                <h2 className="text-[28px] tracking-[-0.02em] font-light text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" strokeWidth={1} /> Rangkaian Acara
                </h2>
                {(event.rundown || []).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-6 py-4 border-b border-white/[0.06]">
                    <span className="text-base font-light text-[#9a9a9a] min-w-[100px]">{item.time}</span>
                    <span className="text-base font-light text-white">{item.activity}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'BENEFITS' && (
              <div className="space-y-6 max-w-[720px]">
                <h2 className="text-[28px] tracking-[-0.02em] font-light text-white mb-4">Pilihan Kategori Tiket</h2>
                {(event.categories || []).map((cat) => (
                  <div key={cat.id} className="py-6 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl tracking-[-0.01em] font-light text-white">{cat.name}</span>
                      <span className="text-xl tracking-[-0.01em] font-light text-white">{formatIDR(cat.price)}</span>
                    </div>
                    <p className="text-base font-light text-[#9a9a9a] mb-3">Sisa Kuota: {cat.quota} Tempat Duduk</p>
                    <div>
                      <span className="text-base font-light text-[#9a9a9a] block mb-2">Fasilitas Termasuk:</span>
                      <div className="flex flex-wrap gap-3">
                        {(cat.benefits || []).map((b, i) => (
                          <span key={i} className="text-base font-light text-[#9a9a9a]">{b}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'TERMS' && (
              <div className="max-w-[720px]">
                <h2 className="text-[28px] tracking-[-0.02em] font-light text-white mb-4">Syarat & Ketentuan</h2>
                <ul className="list-disc pl-5 space-y-3 text-base font-light text-[#9a9a9a] leading-[1.7]">
                  <li>Setiap akun/identitas pemesan hanya diperbolehkan membeli maksimal 4 tiket dalam 1 transaksi resmi.</li>
                  <li>Pengunjung wajib menggunakan pakaian Rapi &amp; Sopan (Smart Casual / Formal).</li>
                  <li>Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan simfoni.</li>
                  <li>E-Ticket resmi ber-Kode QR wajib ditunjukkan dari smartphone pada saat registrasi Open Gate.</li>
                  <li>Tiket yang sudah dibeli tidak dapat ditukarkan uang tunai (non-refundable).</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right: Buy Card */}
          <BuyCard event={event} onBuy={() => openBooking(event)} />
        </div>
      </div>

      {/* Booking Modal */}
      {bookingEvent && bookingCategory && (
        <BookingModal event={bookingEvent} initialCategory={bookingCategory}
          onClose={() => { setBookingEvent(null); setBookingCategory(null); }} onSubmit={handleBookingSubmit} />
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
