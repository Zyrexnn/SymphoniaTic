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
          // fallback to static
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#171717' }}>
        <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>Memuat...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#171717' }}>
        <p style={{ fontSize: 24, fontWeight: 300, color: '#ffffff', marginBottom: 16 }}>Konser Tidak Ditemukan</p>
        <a href="/" style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', borderBottom: '1px solid #9a9a9a', paddingBottom: 2 }}>
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#171717' }}>
      {/* Hero Image */}
      <div className="relative w-full" style={{ height: '60vh', minHeight: 400 }}>
        <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, rgba(23,23,23,0.3) 40%, transparent 100%)' }} />

        {/* Back button */}
        <div className="absolute top-0 left-0 right-0" style={{ padding: '16px 40px' }}>
          <a href="/" className="inline-flex items-center gap-2 hover:opacity-60 transition-opacity"
            style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            <span>Kembali</span>
          </a>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0" style={{ maxWidth: 1400, padding: '0 40px 48px' }}>
          <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 8 }}>
            {event.category}
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.0, letterSpacing: '-0.056em', fontWeight: 300, color: '#ffffff' }}>
            {event.title}
          </h1>
          <p style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.01em', color: '#9a9a9a', marginTop: 12 }}>
            {event.artist}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto" style={{ maxWidth: 1400, padding: '0 40px 120px' }}>
        {/* Quick Info Bar */}
        <div className="flex flex-wrap items-center gap-6" style={{ paddingTop: 40, paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Tanggal', value: event.date },
            { label: 'Waktu', value: event.time },
            { label: 'Open Gate', value: event.openGate },
            { label: 'Venue', value: event.venue },
          ].map((item) => (
            <div key={item.label}>
              <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>{item.label}</span>
              <span style={{ fontSize: 16, fontWeight: 300, color: '#ffffff' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', marginTop: 40 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="whitespace-nowrap cursor-pointer bg-transparent border-none"
              style={{
                fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px',
                color: tab === t.id ? '#ffffff' : '#9a9a9a',
                borderBottom: tab === t.id ? '1px solid #ffffff' : '1px solid transparent',
                padding: '16px 24px 14px',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ paddingTop: 48 }}>
          {tab === 'INFO' && (
            <div className="space-y-8">
              <div>
                <h2 style={{ fontSize: 28, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff', marginBottom: 16 }}>Deskripsi Mahakarya</h2>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', lineHeight: 1.7, maxWidth: 720 }}>{event.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" style={{ maxWidth: 720 }}>
                {[['Penyelenggara', event.organizer], ['Konduktor & Solois', event.conductor], ['Jadwal Tanggal', event.date], ['Waktu Konser', `${event.time} (Open Gate ${event.openGate})`]].map(([label, value]) => (
                  <div key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 16 }}>
                    <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>{label}</span>
                    <span style={{ fontSize: 16, fontWeight: 300, color: '#ffffff' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ maxWidth: 720 }}>
                <h3 style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin className="w-4 h-4" strokeWidth={1} /> Detail Lokasi Venue
                </h3>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#ffffff' }}>{event.venue}</p>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginTop: 4 }}>{event.address}</p>
              </div>
            </div>
          )}

          {tab === 'RUNDOWN' && (
            <div className="space-y-4" style={{ maxWidth: 720 }}>
              <h2 style={{ fontSize: 28, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock className="w-5 h-5" strokeWidth={1} /> Rangkaian Acara
              </h2>
              {(event.rundown || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-6" style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', minWidth: 100 }}>{item.time}</span>
                  <span style={{ fontSize: 16, fontWeight: 300, color: '#ffffff' }}>{item.activity}</span>
                </div>
              ))}
            </div>
          )}

          {tab === 'BENEFITS' && (
            <div className="space-y-6" style={{ maxWidth: 720 }}>
              <h2 style={{ fontSize: 28, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff', marginBottom: 16 }}>Pilihan Kategori Tiket</h2>
              {(event.categories || []).map((cat) => (
                <div key={cat.id} style={{ padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff' }}>{cat.name}</span>
                    <span style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff' }}>{formatIDR(cat.price)}</span>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginBottom: 12 }}>Sisa Kuota: {cat.quota} Tempat Duduk</p>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', display: 'block', marginBottom: 8 }}>Fasilitas Termasuk:</span>
                    <div className="flex flex-wrap gap-3">
                      {(cat.benefits || []).map((b, i) => (
                        <span key={i} style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a' }}>{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'TERMS' && (
            <div style={{ maxWidth: 720 }}>
              <h2 style={{ fontSize: 28, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff', marginBottom: 16 }}>Syarat & Ketentuan</h2>
              <ul className="list-disc pl-5 space-y-3" style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', lineHeight: 1.7 }}>
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
        <div className="fixed bottom-0 left-0 right-0 z-30" style={{ background: 'rgba(23,23,23,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mx-auto" style={{ maxWidth: 1400, padding: '16px 40px' }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', display: 'block', marginBottom: 4 }}>Harga Mulai Dari</span>
              <span style={{ fontSize: 24, letterSpacing: '-0.014em', fontWeight: 300, color: '#ffffff' }}>
                {formatIDR(event.categories?.[0]?.price ?? 0)}
              </span>
            </div>
            <button onClick={() => openBooking(event)}
              className="cursor-pointer bg-transparent border-none hover:opacity-60 transition-opacity flex items-center gap-2"
              style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', borderBottom: '1px solid #ffffff', paddingBottom: 2 }}>
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
