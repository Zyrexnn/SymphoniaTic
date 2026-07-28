import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { CONCERT_EVENTS, ARTISTS_LINEUP, FAQS, formatIDR } from './data';
import type { EventItem } from './data';

const CATEGORY_FILTERS = [
  { id: 'SEMUA', label: 'Semua' },
  { id: 'SIMFONI', label: 'Simfoni' },
  { id: 'KAMAR MUSIK', label: 'Kamar Musik' },
  { id: 'BALET & OPERA', label: 'Balet & Opera' },
  { id: 'PADUAN SUARA', label: 'Paduan Suara' },
  { id: 'RESITAL PIANO', label: 'Resital Piano' },
  { id: 'PHILHARMONIC', label: 'Philharmonic' },
];

interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
}

const goToConcert = (event: EventItem) => {
  window.location.href = `/concert/${event.id}`;
};

export const BentoSection: React.FC<SectionProps> = ({ events, onBuyTicket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  const filteredEvents = sourceEvents.filter((e) => {
    const matchCat = selectedCategory === 'SEMUA' || e.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.artist.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const featured = sourceEvents[0];
  const rest = filteredEvents.filter((e) => e.id !== featured?.id);

  return (
    <>
      {/* ═══ BENTO GRID ═══ */}
      <section
        id="bento"
        className="mx-auto"
        style={{ maxWidth: 1400, padding: '0 40px 120px' }}
      >
        {/* Desktop: bento grid */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: 20, gridAutoRows: '200px' }}>
          {/* FEATURED — 8 col, 2 rows */}
          <div
            style={{ gridColumn: 'span 8', gridRow: 'span 2', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            className="group"
            onClick={() => featured && goToConcert(featured)}
          >
            <img src={featured?.image} alt={featured?.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, transparent 50%)' }} />
            <div className="absolute bottom-0 left-0 right-0" style={{ padding: '32px' }}>
              <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 8 }}>
                {featured?.date} · {featured?.time}
              </p>
              <h2 style={{ fontSize: 28, lineHeight: 1.2, letterSpacing: '-0.02em', fontWeight: 300, color: '#ffffff' }}>
                {featured?.title}
              </h2>
              <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 8 }}>
                {featured?.artist}
              </p>
            </div>
          </div>

          {/* ARTIST — 4 col, 2 rows */}
          <div
            style={{ gridColumn: 'span 4', gridRow: 'span 2', position: 'relative', overflow: 'hidden' }}
          >
            <img src={ARTISTS_LINEUP[0].image} alt={ARTISTS_LINEUP[0].name}
              className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, transparent 50%)' }} />
            <div className="absolute bottom-0 left-0 right-0" style={{ padding: '28px' }}>
              <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 6 }}>
                {ARTISTS_LINEUP[0].genre}
              </p>
              <h3 style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff' }}>
                {ARTISTS_LINEUP[0].name}
              </h3>
            </div>
          </div>

          {/* CONCERT 2 — 5 col */}
          {rest[0] && (
            <div
              style={{ gridColumn: 'span 5', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
              className="group"
              onClick={() => goToConcert(rest[0])}
            >
              <img src={rest[0].image} alt={rest[0].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff' }}>{rest[0].title}</h3>
                <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 4 }}>{rest[0].date}</p>
              </div>
            </div>
          )}

          {/* METRIC — 4 col */}
          <div
            style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px' }}
          >
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 8 }}>Akurasi Gate</p>
            <p style={{ fontSize: 48, lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 300, color: '#ffffff' }}>99,8%</p>
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 8 }}>Pemindaian tanpa overbooking.</p>
          </div>

          {/* STEP 1 — 3 col */}
          <div
            style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 8px' }}
          >
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 6 }}>01</p>
            <p style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff', lineHeight: 1.3 }}>Pilih Konser</p>
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 6 }}>Maksimal 4 tiket per transaksi.</p>
          </div>

          {/* CONCERT 3 — 4 col */}
          {rest[1] && (
            <div
              style={{ gridColumn: 'span 4', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
              className="group"
              onClick={() => goToConcert(rest[1])}
            >
              <img src={rest[1].image} alt={rest[1].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff' }}>{rest[1].title}</h3>
                <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 4 }}>{rest[1].date}</p>
              </div>
            </div>
          )}

          {/* STEP 2 — 4 col */}
          <div
            style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 8px' }}
          >
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 6 }}>02</p>
            <p style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff', lineHeight: 1.3 }}>Verifikasi Instan</p>
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 6 }}>Sistem atomic menerbitkan kode transaksi.</p>
          </div>

          {/* STEP 3 — 4 col */}
          <div
            style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 8px' }}
          >
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 6 }}>03</p>
            <p style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff', lineHeight: 1.3 }}>Tunjukkan QR Code</p>
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 6 }}>E-Ticket dipindai di pintu masuk hall.</p>
          </div>

          {/* ARTIST 2 — 3 col */}
          {ARTISTS_LINEUP[1] && (
            <div
              style={{ gridColumn: 'span 3', position: 'relative', overflow: 'hidden' }}
            >
              <img src={ARTISTS_LINEUP[1].image} alt={ARTISTS_LINEUP[1].name}
                className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px' }}>
                <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#ffffff' }}>{ARTISTS_LINEUP[1].name}</p>
              </div>
            </div>
          )}

          {/* REVENUE — 3 col */}
          <div
            style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px' }}
          >
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 6 }}>Total Pendapatan</p>
            <p style={{ fontSize: 32, lineHeight: 1.2, letterSpacing: '-0.03em', fontWeight: 300, color: '#ffffff' }}>Rp 485M</p>
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginTop: 6 }}>1.420 dari 1.708 kuota.</p>
          </div>

          {/* FAQ — 6 col */}
          <div
            style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px' }}
          >
            <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', marginBottom: 12 }}>Pertanyaan Umum</p>
            <div>
              {FAQS.slice(0, 3).map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-3 text-left cursor-pointer hover:opacity-60 transition-opacity bg-transparent border-none"
                  >
                    <span style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#ffffff' }}>
                      {faq.q.length > 45 ? faq.q.slice(0, 45) + '…' : faq.q}
                    </span>
                    <ChevronDown size={14} style={{ color: '#9a9a9a', flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', lineHeight: 1.6, paddingBottom: 12 }}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: stacked layout */}
        <div className="md:hidden flex flex-col" style={{ gap: 20 }}>
          {featured && (
            <div
              style={{ position: 'relative', overflow: 'hidden', height: 280, cursor: 'pointer' }}
              className="group"
              onClick={() => goToConcert(featured)}
            >
              <img src={featured.image} alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0" style={{ padding: '24px' }}>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginBottom: 6 }}>{featured.date}</p>
                <h2 style={{ fontSize: 22, letterSpacing: '-0.01em', fontWeight: 300, color: '#ffffff' }}>{featured.title}</h2>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginTop: 4 }}>{featured.artist}</p>
              </div>
            </div>
          )}

          {rest.slice(0, 2).map((event, i) => (
            <div
              key={event.id}
              style={{ position: 'relative', overflow: 'hidden', height: 200, cursor: 'pointer' }}
              className="group"
              onClick={() => goToConcert(event)}
            >
              <img src={event.image} alt={event.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #171717 0%, transparent 50%)' }} />
              <div className="absolute bottom-0 left-0 right-0" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: 20, fontWeight: 300, color: '#ffffff' }}>{event.title}</h3>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginTop: 4 }}>{event.date}</p>
              </div>
            </div>
          ))}

          {/* Mobile metrics */}
          <div style={{ padding: '20px 0' }}>
            <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginBottom: 6 }}>Akurasi Gate</p>
            <p style={{ fontSize: 40, lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 300 }}>99,8%</p>
          </div>

          {/* Mobile steps */}
          <div style={{ padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {['Pilih Konser', 'Verifikasi Instan', 'Tunjukkan QR Code'].map((step, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 16, fontWeight: 300, color: '#9a9a9a', marginBottom: 4 }}>{`0${i + 1}`}</p>
                <p style={{ fontSize: 20, fontWeight: 300 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION INDICATOR ═══ */}
      <div className="mx-auto" style={{ maxWidth: 1400, padding: '0 40px 32px' }}>
        <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a' }}>
          ↓ Semua Konser
        </p>
      </div>

      {/* ═══ SEARCH + FILTERS ═══ */}
      <div className="mx-auto" style={{ maxWidth: 1400, padding: '0 40px 48px' }}>
        <div className="flex items-center gap-3 mb-8" style={{ maxWidth: 400 }}>
          <Search size={14} style={{ color: '#9a9a9a' }} />
          <input
            type="text"
            placeholder="Cari konser, artis, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              fontSize: 16,
              fontWeight: 300,
              letterSpacing: '-0.05px',
              color: '#ffffff',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              outline: 'none',
              width: '100%',
              padding: '4px 0',
            }}
          />
        </div>

        <div className="flex items-center gap-6 overflow-x-auto pb-3 mb-12 no-scrollbar">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap transition-opacity cursor-pointer shrink-0 bg-transparent border-none"
              style={{
                fontSize: 16,
                fontWeight: 300,
                letterSpacing: '-0.05px',
                color: selectedCategory === cat.id ? '#ffffff' : '#9a9a9a',
                borderBottom: selectedCategory === cat.id ? '1px solid #ffffff' : '1px solid transparent',
                paddingBottom: 4,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ═══ CONCERT LIST ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '64px 48px' }}>
          {filteredEvents.map((event) => {
            const minPrice = event.categories?.[0]?.price ?? 0;
            return (
              <div
                key={event.id}
                className="cursor-pointer group"
                onClick={() => goToConcert(event)}
              >
                <div style={{ marginBottom: 16, overflow: 'hidden' }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-700"
                    style={{ aspectRatio: '3/2' }}
                  />
                </div>
                <h3 style={{ fontSize: 20, letterSpacing: '-0.01em', fontWeight: 300, lineHeight: 1.4, marginBottom: 4 }}>
                  {event.title}
                </h3>
                <p style={{ fontSize: 16, fontWeight: 300, letterSpacing: '-0.05px', color: '#9a9a9a', lineHeight: 1.5 }}>
                  {event.artist} · {event.venue} · {formatIDR(minPrice)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
