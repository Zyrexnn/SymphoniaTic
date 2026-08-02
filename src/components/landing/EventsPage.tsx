import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Heart, Music } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import type { EventItem } from './data';

const EventsPage: React.FC = () => {
  const [search, setSearch] = useState('');
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
    <div className="min-h-screen bg-[#171717] text-white">
      {/* Hero panel ala DICE */}
      <div className="mx-auto max-w-[1400px] px-10 pt-[80px] pb-10">
        <a href="/" className="inline-flex items-center gap-2 text-base font-light tracking-[-0.05px] text-[#9a9a9a] hover:opacity-60 transition-opacity mb-10">
          <ArrowLeft size={16} strokeWidth={1} />
          <span>Kembali ke Beranda</span>
        </a>

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/[0.06] px-10 py-12 md:px-14 md:py-16">
          <div className="max-w-[560px]">
            <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.1] tracking-[-0.02em] font-light m-0">
              Temukan konser dari orkestra favoritmu
            </h1>
            <p className="text-xl tracking-[-0.01em] font-light text-[#9a9a9a] mt-4">
              Sambungkan selera musikmu dan jelajahi semua pertunjukan simfoni musim ini.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white text-[#171717] text-base font-light tracking-[-0.05px] px-6 py-3">
                <Music size={16} strokeWidth={1.5} />
                Orkestra
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white text-[#171717] text-base font-light tracking-[-0.05px] px-6 py-3">
                <Music size={16} strokeWidth={1.5} />
                Kamar Musik
              </span>
            </div>
          </div>
          {/* Ilustrasi dekoratif kanan */}
          <div className="hidden md:flex absolute right-14 top-1/2 -translate-y-1/2 items-center justify-center w-[180px] h-[180px] rounded-full border border-white/[0.08] opacity-60">
            <Music size={72} strokeWidth={0.75} className="text-[#9a9a9a]" />
          </div>
        </div>
      </div>

      {/* Popular events heading */}
      <div className="mx-auto max-w-[1400px] px-10 pb-8">
        <h2 className="text-[clamp(24px,3vw,36px)] leading-[1.1] tracking-[-0.02em] font-light m-0">
          Event Populer <span className="text-[#9a9a9a]">di Jakarta</span>
        </h2>
      </div>

      {/* Search */}
      <div className="mx-auto max-w-[1400px] px-10 pb-12">
        <div className="flex items-center gap-3 max-w-[400px] border-b border-white/[0.08] pb-2">
          <Search size={14} strokeWidth={1} className="text-[#9a9a9a]" />
          <input
            type="text"
            placeholder="Cari konser, artis, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-base font-light tracking-[-0.05px] text-white bg-transparent border-none outline-none w-full py-1"
          />
        </div>
      </div>

      {/* Poster grid */}
      <div className="mx-auto max-w-[1400px] px-10 pb-[120px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {filtered.map((event) => {
            const minPrice = event.categories?.[0]?.price ?? 0;
            return (
              <a
                key={event.id}
                href={`/concert/${event.id}`}
                className="cursor-pointer group block"
              >
                <div className="relative mb-4 overflow-hidden rounded-xl aspect-square">
                  <img
                    src={event.image}
                    alt={event.title}
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ${
                      event.isClosed ? 'grayscale brightness-50' : ''
                    }`}
                  />
                  {event.isClosed && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2">
                      <span className="text-xs font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-500/40 px-3 py-1 uppercase tracking-wider rounded">
                        PENJUALAN DITUTUP
                      </span>
                    </div>
                  )}
                  <button
                    aria-label="Simpan ke favorit"
                    onClick={(e) => e.preventDefault()}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black transition-colors cursor-pointer border-none z-10"
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
                  {event.isClosed ? (
                    <span className="text-rose-400 font-mono text-xs">Penjualan Berakhir</span>
                  ) : (
                    `Mulai ${formatIDR(minPrice)}`
                  )}
                </p>
              </a>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-base font-light text-[#9a9a9a] py-10">Konser tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
