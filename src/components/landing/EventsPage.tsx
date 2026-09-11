import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Heart, Music } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import type { EventItem } from './data';

const EventsPage: React.FC = () => {
  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') ?? '';
    }
    return '';
  });
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let active = true;
    fetchEventsAPI()
      .then((data) => {
        if (active) setLiveEvents(data);
      })
      .catch(() => {
        if (active) setLiveEvents([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const sourceEvents = useMemo(
    () => (liveEvents.length > 0 ? liveEvents : CONCERT_EVENTS),
    [liveEvents]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sourceEvents;
    return sourceEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
    );
  }, [search, sourceEvents]);

  return (
    <div className="min-h-screen bg-[--color-obsidian-canvas] text-[--color-chalk]">
      {/* Hero panel - preserved hero feel, cleaned up colors */}
      <div className="mx-auto max-w-[1400px] px-10 pt-[80px] pb-10">
        <a href="/" className="inline-flex items-center gap-2 text-base font-light tracking-[-0.05px] text-[--color-ash]/60 hover:opacity-60 transition-opacity mb-10">
          <ArrowLeft size={16} strokeWidth={1} />
          <span>Kembali ke Beranda</span>
        </a>

        <div className="relative overflow-hidden rounded-2xl bg-[--color-obsidian-canvas]/[0.04] border border-[--color-border]/20 px-10 py-12 md:px-14 md:py-16">
          <div className="max-w-[560px]">
            <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] font-light m-0">
              Temukan konser dari orkestra favoritmu
            </h1>
            <p className="text-xl tracking-[-0.01em] font-light text-[--color-ash]/60 mt-4">
              Sambungkan selera musikmu dan jelajahi semua pertunjukan simfoni musim ini.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <span className="relative inline-flex items-center gap-2 rounded-full bg-[--color-obsidian-canvas]/50 text-[--color-ash]/60 text-sm font-light tracking-[-0.05px] px-6 py-3 hover:bg-[--color-obsidian-canvas]/60 transition-colors">
                <Music size={16} strokeWidth={1.5} className="text-[--color-ash]"/>
                Orkestra
              </span>
              <span className="relative inline-flex items-center gap-2 rounded-full bg-[--color-obsidian-canvas]/50 text-[--color-ash]/60 text-sm font-light tracking-[-0.05px] px-6 py-3 hover:bg-[--color-obsidian-canvas]/60 transition-colors">
                <Music size={16} strokeWidth={1.5} className="text-[--color-ash]"/>
                Kamar Musik
              </span>
            </div>
          </div>
          {/* Ilustrasi dekoratif kanan */}
          <div className="hidden md:flex absolute right-14 top-1/2 -translate-y-1/2 items-center justify-center w-[180px] h-[180px] rounded-full border border-[--color-border]/30 opacity-60">
            <Music size={72} strokeWidth={0.75} className="text-[--color-ash]" />
          </div>
        </div>
      </div>

      {/* Popular events heading */}
      <div className="mx-auto max-w-[1400px] px-10 pb-8">
        <h2 className="text-[clamp(24px,3vw,36px)] leading-[1.1] tracking-[-0.02em] font-light m-0">
          Event Populer <span className="text-[--color-ash]">di Jakarta</span>
        </h2>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-[1400px] px-10 pb-12">
        <div className="flex items-center gap-3 max-w-[400px] border-b border-[--color-border]/20 pb-2">
          <Search size={14} strokeWidth={1} className="text-[--color-ash]" />
          <input
            type="text"
            placeholder="Cari konser, artis, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-base font-light tracking-[-0.05px] text-[--color-chalk] bg-[--color-obsidian-canvas]/50 border-b border-[--color-border]/20 placeholder-[--color-ash]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-chalk]/20 transition-colors"
          />
        </div>
      </div>

      {/* Poster grid */}
      <div className="mx-auto max-w-[1400px] px-10 pb-[120px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {filtered.map((event) => {
            const minPrice = event.categories?.[0]?.price ?? 0;
            return (
              <a
                key={event.id}
                href={`/concert/${event.id}`}
                className="cursor-pointer group block"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl min-h-[260px]">
                  <img
                    src={event.image}
                    alt={event.title}
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ${
                      event.isClosed ? 'grayscale brightness-50' : 'brightness-90 group-hover:brightness-100'
                    }`}
                  />
                  {event.isClosed && (
                    <div className="absolute inset-0 bg-[--color-obsidian]/80 flex items-center justify-center p-2">
                      <span className="text-xs font-mono font-bold text-[--color-chalk] uppercase tracking-wider">
                        PENJUALAN DITUTUP
                      </span>
                    </div>
                  )}
                  <button
                    aria-label="Simpan ke favorit"
                    onClick={(e) => e.preventDefault()}
                    className="absolute bottom-3 right-3 rounded-none bg-[--color-brand-accent]/90 backdrop-blur-sm flex items-center justify-center text-[--color-obsidian] hover:bg-[--color-brand-accent] transition-colors cursor-pointer border-none z-10"
                  >
                    <Heart size={16} />
                  </button>
                </div>
                <h3 className="text-base tracking-[-0.05px] font-light text-[--color-chalk] line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-base font-light tracking-[-0.05px] text-[--color-ash]/60 leading-[1.5]">
                  {event.date}
                </p>
                <p className="text-base font-light tracking-[-0.05px] text-[--color-ash]/60 leading-[1.5] truncate">
                  {event.venue}
                </p>
                <p className="text-base font-light tracking-[-0.05px] text-[--color-ash]/60 leading-[1.5]">
                  {event.isClosed ? (
                    <span className="text-[--color-brand-light] font-mono text-xs">Penjualan Berakhir</span>
                  ) : (
                    `Mulai ${formatIDR(minPrice)}`
                  )}
                </p>
              </a>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-base font-light text-[--color-ash]/60 py-10">Konser tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
