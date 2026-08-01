import React from 'react';
import { Heart } from 'lucide-react';
import { CONCERT_EVENTS, ARTISTS_LINEUP, formatIDR } from './data';
import type { EventItem } from './data';

interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
}

const goToConcert = (event: EventItem) => {
  window.location.href = `/concert/${event.id}`;
};

export const BentoSection: React.FC<SectionProps> = ({ events, onBuyTicket }) => {
  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  const featured = sourceEvents[0];
  const rest = sourceEvents.filter((e) => e.id !== featured?.id);

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

      <div className="mx-auto max-w-[1400px] px-10 pb-8 flex items-baseline justify-between">
        <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a]">
          ↓ Semua Konser
        </p>
        <a
          href="/events"
          className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] hover:opacity-60 transition-opacity"
        >
          Lihat Semua →
        </a>
      </div>

      <div className="mx-auto max-w-[1400px] px-10 pb-12">
        {/* Poster cards — horizontal scroll ala DICE */}
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-10 px-10 no-scrollbar snap-x snap-mandatory">
          {sourceEvents.map((event) => {
            const minPrice = event.categories?.[0]?.price ?? 0;
            return (
              <div
                key={event.id}
                className="cursor-pointer group shrink-0 w-[220px] md:w-[260px] snap-start"
                onClick={() => goToConcert(event)}
              >
                <div className="relative mb-4 overflow-hidden rounded-xl aspect-square">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  <button
                    aria-label="Simpan ke favorit"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black transition-colors cursor-pointer border-none"
                  >
                    <Heart size={16} />
                  </button>
                </div>
                <h3 className="text-base tracking-[-0.05px] font-light leading-[1.4] text-white line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] leading-[1.5]">
                  {event.date}
                </p>
                <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] leading-[1.5] truncate">
                  {event.venue}
                </p>
                <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] leading-[1.5]">
                  Mulai {formatIDR(minPrice)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
