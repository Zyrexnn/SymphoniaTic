import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { CONCERT_EVENTS, ARTISTS_LINEUP, formatIDR } from './data';
import type { EventItem } from './data';

interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
}

const goToConcert = (event: EventItem) => {
  window.location.href = `/concert/${event.id}`;
};

const getFeaturedEvent = (events: EventItem[]) => {
  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  return sourceEvents[0];
};

const getRestEvents = (events: EventItem[]) => {
  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  return sourceEvents.filter((e) => e.id !== sourceEvents[0]?.id);
};

export const BentoSection: React.FC<SectionProps> = ({ events, onBuyTicket }) => {
  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  const featured = getFeaturedEvent(sourceEvents);
  const rest = getRestEvents(sourceEvents);

  return (
    <section className="bg-[--color-obsidian-canvas]">
      {/* =========================
          SECTION HEADER
      =========================== */}
      <section id="concerts" className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pt-16 pb-[120px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-border gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-chalk m-0">
              Jelajahi Simfoni & Sistem Gate Pilihan.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ash max-w-md leading-relaxed">
            Integrasi langsung antara ansambel orkestra kelas dunia dan platform tiket berkecepatan tinggi dengan verifikasi instan.
          </p>
        </div>

        {/* =========================
            DESKTOP GRID: FEATURED + 2 SECONDARY
        =========================== */}
        <div className="md:grid md:grid-cols-12 gap-6 md:gap-10">
          {/* FEATURED CONCERT (8 cols) */}
          <div
            className="md:col-span-8 bg-[--color-obsidian] relative overflow-hidden cursor-pointer group"
            onClick={() => featured && goToConcert(featured)}
          >
            <img
              src={featured?.image}
              alt={featured?.title}
              className="w-full h-[420px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[--color-obsidian]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badges */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
              <span className="text-[11px] font-semibold tracking-wide text-[--color-ash]/90 bg-[--color-obsidian]/50 backdrop-blur-sm px-3 py-1.5 uppercase">
                Konser Utama
              </span>
              {featured?.categories?.[0] && (
                <span className="text-xs font-semibold tracking-wide text-white bg-[--color-obsidian]/50 backdrop-blur-sm px-3 py-1.5">
                  Mulai {formatIDR(featured.categories[0].price)}
                </span>
              )}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="flex items-center gap-3 text-xs text-[--color-ash]/70 uppercase tracking-wider mb-2">
                <span>{featured?.date}</span>
                <span>•</span>
                <span>{featured?.time}</span>
                <span>•</span>
                <span className="text-white">{featured?.venue}</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-semibold text-chalk tracking-[-0.03em] leading-tight group-hover:text-[--color-brand-accent]/95 transition-colors">
                {featured?.title}
              </h3>
              <p className="text-sm text-[--color-ash]/70 mt-2 max-w-xl line-clamp-1">
                {featured?.artist}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                <span>Detail Konser & Tiket</span>
                <ArrowUpRight size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* SECONDARY CONCERTS (4 cols - 2 cards) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {rest.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 bg-[--color-obsidian]"
                onClick={() => goToConcert(event)}
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-[220px] object-cover group-hover:scale-[1.02] transition-transform duration-500 brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[--color-obsidian]/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <div className="flex items-center gap-2 text-xs text-[--color-ash]/70 uppercase tracking-wider mb-1.5">
                    <span>{event.date}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-chalk tracking-tight line-clamp-1">
                    {event.title}
                  </h4>
                  <p className="text-xs text-[--color-ash]/80 mt-1">Mulai {formatIDR(event.categories?.[0]?.price ?? 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          ARTIST LINEUP SUB-SECTION
      =========================== */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pb-12">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-[--color-ash]/60 mb-4">
              Artis Musim Ini
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {ARTISTS_LINEUP.slice(0, 4).map((artist) => (
                <div
                  key={artist.name}
                  className="flex flex-col items-center gap-2 px-4 py-6 rounded-0 border border-[--color-border] rounded-0 hover:border-[--color-border]/12 transition-colors"
                >
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-16 h-16 object-cover rounded-0 border-2 border-[--color-border]/1"
                  />
                  <span className="text-xs font-medium tracking-widest uppercase text-[--color-ash]/60">
                    {artist.name}
                  </span>
                  <span className="text-xs text-[--color-ash]/40">{artist.shows}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <a
              href="/events"
              className="text-sm text-[--color-brand-accent] hover:text-[--color-chalk] transition-colors inline-flex items-center gap-1"
            >
              Lihat Semua Artis
              <ArrowUpRight size={10} className="transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* =========================
        CATALOG HEADER
    =========================== */}
    <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pb-6 flex items-baseline justify-between border-t border-border pt-12">
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold text-chalk tracking-tight">
          Semua Jadwal Konser
        </h3>
      </div>
      <a
        href="/events"
        className="text-sm text-[--color-ash]/60 hover:text-[--color-brand-accent] transition-colors inline-flex items-center gap-1 group"
      >
        <span>Lihat Semua</span>
        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    </div>

    {/* =========================
        ALL EVENTS CAROUSEL
    =========================== */}
    <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pb-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sourceEvents.map((event) => {
          const minPrice = event.categories?.[0]?.price ?? 0;
          return (
            <div
              key={event.id}
              className="cursor-pointer group rounded-0 shrink-0 bg-[--color-obsidian-canvas] border border-[--color-border]/20 hover:shadow-lg transition-all duration-200"
              onClick={() => goToConcert(event)}
            >
              {/* Event Image */}
              <div className="relative mb-3 overflow-hidden rounded-0 min-h-[180px] bg-[--color-canvas-alt]">
                <img
                  src={event.image}
                  alt={event.title}
                  className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ${
                    event.isClosed ? 'grayscale brightness-50' : 'brightness-90 group-hover:brightness-100'
                  }`}
                />
                {event.isClosed && (
                  <div className="absolute inset-0 bg-[--color-obsidian]/70 flex items-center justify-center p-2">
                    <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
                      Tutup
                    </span>
                  </div>
                )}
                {/* Favorite Button */}
                <button
                  aria-label="Simpan ke favorit"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-0 bg-[--color-brand-accent]/90 backdrop-blur-sm flex items-center justify-center text-[--color-obsidian] hover:bg-[--color-brand-accent] transition-colors cursor-pointer z-10"
                >
                  <Heart size={14} />
                </button>
              </div>

              {/* Event Info */}
              <div className="px-4 pb-4">
                <h4 className="text-base font-semibold tracking-tight text-chalk line-clamp-2 min-h-[44px]">
                  {event.title}
                </h4>

                <p className="text-xs text-[--color-ash]/60 mt-2">
                  {event.date}
                </p>

                <p className="text-xs text-[--color-ash]/60 truncate mt-0.5">
                  {event.venue}
                </p>

                {/* Price */}
                <div className="mt-3 pt-2 border-t border-[--color-border]/10 flex items-center justify-between">
                  <span className="text-sm font-semibold text-chalk">
                    {event.isClosed ? (
                      <span className="text-[--color-brand-light]">Tutup</span>
                    ) : (
                      formatIDR(minPrice)
                    )}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};