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
      <section
        id="concerts"
        className="mx-auto max-w-[1400px] px-10 pb-[120px]"
      >
        {/* Desktop: bento grid */}
        <div className="hidden md:grid grid-cols-12 gap-5 auto-rows-[220px]">
          {/* FEATURED — 8 col, 2 rows */}
          <div
            className="col-span-8 row-span-2 relative overflow-hidden cursor-pointer group"
            onClick={() => featured && goToConcert(featured)}
          >
            <img src={featured?.image} alt={featured?.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#171717_0%,transparent_50%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-2">
                {featured?.date} · {featured?.time}
              </p>
              <h2 className="text-[28px] leading-[1.2] tracking-[-0.02em] font-light text-white">
                {featured?.title}
              </h2>
              <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mt-2">
                {featured?.artist}
              </p>
            </div>
          </div>

          {/* ARTIST — 4 col, 2 rows */}
          <div id="lineup" className="col-span-4 row-span-2 relative overflow-hidden">
            <img src={ARTISTS_LINEUP[0].image} alt={ARTISTS_LINEUP[0].name}
              className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#171717_0%,transparent_50%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-1.5">Artis Musim Ini</p>
              <h3 className="text-xl tracking-[-0.01em] font-light text-white">
                {ARTISTS_LINEUP[0].name}
              </h3>
            </div>
          </div>

          {/* CONCERT 2 — 5 col */}
          {rest[0] && (
            <div
              className="col-span-5 relative overflow-hidden cursor-pointer group"
              onClick={() => goToConcert(rest[0])}
            >
              <img src={rest[0].image} alt={rest[0].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#171717_0%,transparent_50%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl tracking-[-0.01em] font-light text-white">{rest[0].title}</h3>
                <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mt-1">{rest[0].date}</p>
              </div>
            </div>
          )}

          {/* METRIC — 4 col */}
          <div id="ticket-war" className="col-span-4 flex flex-col justify-center px-4 py-6 border border-white/[0.06] bg-[#171717]">
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-2">Akurasi Gate</p>
            <p className="text-[48px] leading-[1] tracking-[-0.04em] font-light text-white">99,8%</p>
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mt-2">Pemindaian tanpa overbooking.</p>
          </div>

          {/* STEP 1 — 3 col */}
          <div id="guide" className="col-span-3 flex flex-col justify-end px-4 py-6 border border-white/[0.06] bg-[#171717]">
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-1.5">01</p>
            <p className="text-xl tracking-[-0.01em] font-light text-white leading-[1.3]">Pilih Konser</p>
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mt-1.5">Maksimal 4 tiket per transaksi.</p>
          </div>

          {/* CONCERT 3 — 4 col */}
          {rest[1] && (
            <div
              className="col-span-4 relative overflow-hidden cursor-pointer group"
              onClick={() => goToConcert(rest[1])}
            >
              <img src={rest[1].image} alt={rest[1].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#171717_0%,transparent_50%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl tracking-[-0.01em] font-light text-white">{rest[1].title}</h3>
                <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mt-1">{rest[1].date}</p>
              </div>
            </div>
          )}

          {/* STEP 2 — 4 col */}
          <div className="col-span-4 flex flex-col justify-end px-4 py-6 border border-white/[0.06] bg-[#171717]">
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-1.5">02</p>
            <p className="text-xl tracking-[-0.01em] font-light text-white leading-[1.3]">Verifikasi Instan</p>
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mt-1.5">Sistem atomic menerbitkan kode transaksi.</p>
          </div>

          {/* STEP 3 — 4 col */}
          <div className="col-span-4 flex flex-col justify-end px-4 py-6 border border-white/[0.06] bg-[#171717]">
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-1.5">03</p>
            <p className="text-xl tracking-[-0.01em] font-light text-white leading-[1.3]">Tunjukkan QR Code</p>
            <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mt-1.5">E-Ticket dipindai di pintu masuk hall.</p>
          </div>
        </div>

        {/* Dedicated FAQ Section to prevent layout collision */}
        <div id="faq" className="mt-20 border-t border-white/[0.06] pt-12">
          <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-8 uppercase">Pertanyaan Umum (FAQ)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-white/[0.06] pb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-2 text-left cursor-pointer hover:opacity-60 transition-opacity bg-transparent border-none"
                >
                  <span className="text-lg font-light tracking-[-0.05px] text-white">
                    {faq.q}
                  </span>
                  <ChevronDown size={16} className="text-[#9a9a9a] shrink-0 transition-transform duration-200" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
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
                      <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] leading-[1.6] pt-2 pb-3">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: stacked layout */}
        <div className="md:hidden flex flex-col gap-5 mt-10">
          {featured && (
            <div className="relative overflow-hidden h-[280px] cursor-pointer group"
              onClick={() => goToConcert(featured)}
            >
              <img src={featured.image} alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#171717_0%,transparent_50%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-base font-light text-[#9a9a9a] mb-1.5">{featured.date}</p>
                <h2 className="text-[22px] tracking-[-0.01em] font-light text-white">{featured.title}</h2>
                <p className="text-base font-light text-[#9a9a9a] mt-1">{featured.artist}</p>
              </div>
            </div>
          )}

          {rest.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="relative overflow-hidden h-[200px] cursor-pointer group"
              onClick={() => goToConcert(event)}
            >
              <img src={event.image} alt={event.title}
                className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,#171717_0%,transparent_50%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-light text-white">{event.title}</h3>
                <p className="text-base font-light text-[#9a9a9a] mt-1">{event.date}</p>
              </div>
            </div>
          ))}

          <div className="py-5">
            <p className="text-base font-light text-[#9a9a9a] mb-1.5">Akurasi Gate</p>
            <p className="text-[40px] leading-[1] tracking-[-0.04em] font-light text-white">99,8%</p>
          </div>

          <div className="py-5 border-t border-white/[0.06]">
            {['Pilih Konser', 'Verifikasi Instan', 'Tunjukkan QR Code'].map((step, i) => (
              <div key={i} className="mb-5">
                <p className="text-base font-light text-[#9a9a9a] mb-1">{`0${i + 1}`}</p>
                <p className="text-xl font-light text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-10 pb-8">
        <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a]">
          ↓ Semua Konser
        </p>
      </div>

      <div className="mx-auto max-w-[1400px] px-10 pb-12">
        <div className="flex items-center gap-3 mb-8 max-w-[400px]">
          <Search size={14} className="text-[#9a9a9a]" />
          <input
            type="text"
            placeholder="Cari konser, artis, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-base font-light tracking-[-0.05px] text-white bg-transparent border-none border-b border-white/[0.08] outline-none w-full py-1"
          />
        </div>

        <div className="flex items-center gap-6 overflow-x-auto pb-3 mb-12 no-scrollbar">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap transition-opacity cursor-pointer shrink-0 bg-transparent border-none text-base font-light tracking-[-0.05px] pb-1 ${
                selectedCategory === cat.id
                  ? 'text-white border-b border-white'
                  : 'text-[#9a9a9a] border-b border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {filteredEvents.map((event) => {
            const minPrice = event.categories?.[0]?.price ?? 0;
            return (
              <div
                key={event.id}
                className="cursor-pointer group"
                onClick={() => goToConcert(event)}
              >
                <div className="mb-4 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-700 aspect-[3/2]"
                  />
                </div>
                <h3 className="text-xl tracking-[-0.01em] font-light leading-[1.4] mb-1 text-white">
                  {event.title}
                </h3>
                <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] leading-[1.5]">
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
