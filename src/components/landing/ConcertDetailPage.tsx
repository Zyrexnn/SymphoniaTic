import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { BookingModal, ETicketConfirmation } from './Modals';

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
      <div className="mx-auto max-w-[1400px] px-10 pb-[120px]">
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

        {/* Tab Content */}
        <div className="pt-12">
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
                  <MapPin className="w-4 h-4" strokeWidth={1} /> Detail Lokasi Venue
                </h3>
                <p className="text-base font-light text-white">{event.venue}</p>
                <p className="text-base font-light text-[#9a9a9a] mt-1">{event.address}</p>
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

        {/* Sticky Buy Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[rgba(23,23,23,0.95)] border-t border-white/[0.06]">
          <div className="flex items-center justify-between mx-auto max-w-[1400px] px-10 py-4">
            <div>
              <span className="text-base font-light text-[#9a9a9a] block mb-1">Harga Mulai Dari</span>
              <span className="text-2xl tracking-[-0.014em] font-light text-white">
                {formatIDR(event.categories?.[0]?.price ?? 0)}
              </span>
            </div>
            <button onClick={() => openBooking(event)}
              className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center gap-2 text-base font-light text-white border-b border-white pb-0.5">
              <span>Beli Tiket</span>
              <ChevronRight className="w-4 h-4" strokeWidth={1} />
            </button>
          </div>
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
    </div>
  );
};

export default ConcertDetailPage;
