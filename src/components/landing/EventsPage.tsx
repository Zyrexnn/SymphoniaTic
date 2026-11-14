import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Search, X, Heart, MapPin, Calendar, Music2, ChevronRight, Ticket } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import { parseDate, MONTHS } from './Sections';
import type { EventItem } from './data';
import { Footer } from './Footer';
import { Header } from './Navbar';
import { EventCategoriesSection } from './EventCategoriesSection';

const lowestPrice = (event: EventItem): number => {
  if (!event.categories?.length) return 0;
  return Math.min(...event.categories.map((c) => Number(c.price) || 0));
};

const sortKey = (event: EventItem): number => {
  const { day, month, year } = parseDate(event.date);
  const mi = MONTHS.indexOf(month);
  const y = parseInt(year, 10) || 0;
  const mo = mi >= 0 ? mi + 1 : 0;
  const d = parseInt(day, 10) || 0;
  return y * 10000 + mo * 100 + d;
};

const isWeekend = (event: EventItem): boolean => {
  const w = (parseDate(event.date).weekday || '').toLowerCase();
  return w.startsWith('sab') || w.startsWith('min');
};

const titleCase = (s: string): string =>
  (s.charAt(0) + s.slice(1).toLowerCase()).trim();

const DateBlock: React.FC<{ date?: string; size?: 'sm' | 'lg' }> = ({ date, size = 'sm' }) => {
  const { day, month, year } = parseDate(date);
  return (
    <div
      className={`absolute left-4 rounded-lg bg-[#0C0D12]/85 border border-white/20 backdrop-blur-sm shadow-md text-center ${
        size === 'lg' ? 'px-3.5 py-2.5 left-5' : 'px-2.5 py-2'
      }`}
    >
      <span
        className={`block leading-none font-bold text-white tabular-nums ${
          size === 'lg' ? 'text-2xl' : 'text-lg'
        }`}
      >
        {day}
      </span>
      <span
        className={`block mt-1 leading-none font-semibold tracking-[0.16em] text-[#A1A1AA] uppercase ${
          size === 'lg' ? 'text-[11px]' : 'text-[10px]'
        }`}
      >
        {month} {size === 'lg' ? year : ''}
      </span>
    </div>
  );
};

const FavoriteButton: React.FC<{ active: boolean; onToggle: () => void }> = ({ active, onToggle }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }}
    aria-label={active ? 'Hapus dari favorit' : 'Simpan ke favorit'}
    aria-pressed={active}
    className="absolute top-4 right-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-[#0C0D12]/75 border border-white/20 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
  >
    <Heart
      size={16}
      strokeWidth={2}
      className={active ? 'fill-white text-white' : 'text-[#A1A1AA]'}
    />
  </button>
);

const EventCard: React.FC<{ event: EventItem; saved: boolean; onToggleSave: () => void }> = ({
  event,
  saved,
  onToggleSave,
}) => {
  const isClosed = !!event.isClosed;
  return (
    <a
      href={`/concert/${event.id}`}
      className="group flex flex-col rounded-xl border border-[#272A38] bg-[#14161F] p-4 transition-all duration-300 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12]"
    >
      <div className="relative overflow-hidden rounded-lg bg-[#1D202D] aspect-[7/6]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.05] ${
            isClosed ? 'grayscale brightness-50' : 'brightness-[0.92] group-hover:brightness-100'
          }`}
        />
        <DateBlock date={event.date} size="sm" />
        <FavoriteButton active={saved} onToggle={onToggleSave} />

        {isClosed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4">
            <span className="rounded-md border border-white/30 bg-black/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Penjualan Ditutup
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
          {titleCase(event.category || 'Konser')}
        </span>
        <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em] text-white">
          {event.title}
        </h3>
        <p className="mt-1 truncate text-xs text-[#A1A1AA]">{event.artist}</p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#71717A]">
          <MapPin size={13} strokeWidth={2} className="shrink-0 text-[#A1A1AA]" />
          <span className="truncate">{event.venue}</span>
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-[#272A38] pt-3.5 mt-4">
          {isClosed ? (
            <span className="text-xs font-semibold text-[#71717A]">Penjualan Selesai</span>
          ) : (
            <span className="text-sm font-bold text-white tabular-nums">
              Mulai {formatIDR(lowestPrice(event))}
            </span>
          )}
          <ChevronRight
            size={16}
            strokeWidth={2}
            className="text-[#71717A] transition-all group-hover:translate-x-1 group-hover:text-white"
          />
        </div>
      </div>
    </a>
  );
};

const EventsPage: React.FC = () => {
  const [query, setQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') ?? '';
    }
    return '';
  });
  const [activeFilter, setActiveFilter] = useState<string>('SEMUA');
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const resultsRef = useRef<HTMLDivElement>(null);

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

  const categories = useMemo(() => {
    return Array.from(
      new Set(sourceEvents.map((e) => (e.category || '').trim().toUpperCase()).filter(Boolean))
    );
  }, [sourceEvents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sourceEvents
      .filter((e) => {
        if (activeFilter !== 'SEMUA') {
          if (activeFilter === 'AKHIR PEKAN') {
            if (!isWeekend(e)) return false;
          } else if ((e.category || '').trim().toUpperCase() !== activeFilter) {
            return false;
          }
        }
        if (q) {
          return (
            e.title.toLowerCase().includes(q) ||
            e.artist.toLowerCase().includes(q) ||
            e.venue.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => sortKey(a) - sortKey(b));
  }, [query, activeFilter, sourceEvents]);

  const isBrowsingAll = query.trim() === '' && activeFilter === 'SEMUA';
  const featured = isBrowsingAll ? filtered[0] ?? null : null;
  const mainEvents = isBrowsingAll ? filtered.slice(1) : filtered;

  const filterChips = useMemo(() => {
    const countFor = (cat: string) =>
      sourceEvents.filter((e) => (e.category || '').trim().toUpperCase() === cat).length;
    const weekendCount = sourceEvents.filter(isWeekend).length;
    return [
      { id: 'SEMUA', label: 'Semua', count: sourceEvents.length },
      ...categories.map((c) => ({ id: c, label: titleCase(c), count: countFor(c) })),
      { id: 'AKHIR PEKAN', label: 'Akhir Pekan', count: weekendCount },
    ];
  }, [categories, sourceEvents]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const res: string[] = [];
    for (const e of sourceEvents) {
      for (const term of [e.venue, e.artist]) {
        const t = (term || '').trim();
        if (t && t.length <= 34 && !seen.has(t)) {
          seen.add(t);
          res.push(t);
        }
        if (res.length >= 3) break;
      }
      if (res.length >= 3) break;
    }
    return res;
  }, [sourceEvents]);

  const toggleSave = (id: string | number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectFilter = (id: string) => {
    setActiveFilter(id);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const hasCriteria = query.trim() !== '' || activeFilter !== 'SEMUA';
  const venueCount = new Set(sourceEvents.map((e) => e.venue)).size;
  const seasonMin = sourceEvents.length ? Math.min(...sourceEvents.map(lowestPrice)) : 0;

  const featuredMeta: { label: string; value: string }[] = [];
  if (featured) {
    featuredMeta.push({ label: 'Tanggal', value: featured.date });
    featuredMeta.push({ label: 'Gerbang Buka', value: `${featured.time} · Open Gate ${featured.openGate}` });
    featuredMeta.push({ label: 'Lokasi', value: featured.venue });
  }

  return (
    <div className="min-h-screen bg-[#0C0D12] text-white selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 border-b border-[#272A38] bg-[#0C0D12]/95 backdrop-blur-md">
        <Header />
      </header>

      <section className="relative overflow-hidden border-b border-[#272A38]">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-10 pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7 max-w-[720px]">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                Musim Konser 2026
              </span>
              <h1 className="mt-4 text-[clamp(32px,5vw,56px)] leading-[1.08] font-medium tracking-tight text-white">
                Temukan Konser & Pertunjukan Musik Pilihan
              </h1>
              <p className="mt-5 max-w-[540px] text-base md:text-lg leading-relaxed text-[#A1A1AA]">
                Jelajahi pertunjukan orkestra, simfoni, balet, dan ansambel terbaik musim ini.
                Pesan tiket resmi dan terima E-Ticket instan.
              </p>

              <form
                role="search"
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 group/input relative"
              >
                <Search
                  size={20}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#71717A] transition-colors group-focus-within:text-white"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari konser, artis, atau venue..."
                  aria-label="Cari konser, artis, atau venue"
                  className="h-14 sm:h-16 w-full rounded-xl border border-[#272A38] bg-[#14161F] pl-14 pr-12 text-base text-white placeholder-[#71717A] outline-none transition-all focus:border-white focus:ring-2 focus:ring-white/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg bg-[#1D202D] text-[#A1A1AA] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </form>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg bg-[#14161F] border border-[#272A38] px-4 py-2 text-sm font-medium text-[#A1A1AA]">
                  <MapPin size={14} strokeWidth={2} className="text-white" />
                  Jakarta, ID
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-[#14161F] border border-[#272A38] px-4 py-2 text-sm font-medium text-[#A1A1AA]">
                  <Calendar size={14} strokeWidth={2} className="text-white" />
                  Musim 2026
                </span>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-24 rounded-xl border border-[#272A38] bg-[#14161F] p-8">
                <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                  Informasi Musim Ini
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-[56px] font-bold leading-none tracking-tight text-white tabular-nums">
                    {sourceEvents.length}
                  </span>
                  <span className="text-sm font-medium text-[#A1A1AA]">pertunjukan aktif</span>
                </div>
                <div className="mt-7 space-y-4 border-t border-[#272A38] pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#71717A]">Venue Pilihan</span>
                    <span className="text-sm font-semibold text-white">{venueCount} lokasi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#71717A]">Kategori Musik</span>
                    <span className="text-sm font-semibold text-white">{categories.length} jenis</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#71717A]">Tiket Mulai</span>
                    <span className="text-sm font-bold text-white tabular-nums">{formatIDR(seasonMin)}</span>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-[#1D202D] border border-[#272A38] px-4 py-3.5 text-xs leading-relaxed text-[#A1A1AA]">
                  E-Ticket ber-Kode QR resmi dikirim langsung ke akun Anda setelah pemesanan, siap dipindai saat Open Gate.
                </div>
              </div>
            </div>
          </div>
        </div>

        <EventCategoriesSection
          categories={categories}
          events={sourceEvents}
          onSelect={selectFilter}
        />
      </section>

      <div className="sticky top-14 z-30 border-y border-[#272A38] bg-[#0C0D12]/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            {filterChips.map((chip) => {
              const active = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => selectFilter(chip.id)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12] ${
                    active
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#14161F] text-[#A1A1AA] border border-[#272A38] hover:border-white/40 hover:text-white'
                  }`}
                >
                  {chip.label}
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      active ? 'bg-black/15 text-black' : 'bg-[#1D202D] text-[#71717A]'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={resultsRef} className="mx-auto max-w-[1360px] px-5 sm:px-10 pt-14 pb-6 scroll-mt-28">
        {hasCriteria ? (
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                Hasil Pencarian
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {filtered.length} konser ditemukan
              </h2>
              {query.trim() && (
                <p className="mt-1.5 text-sm text-[#A1A1AA]">
                  untuk “<span className="font-semibold text-white">{query.trim()}</span>”
                  {activeFilter !== 'SEMUA' && (
                    <> · filter <span className="font-semibold text-white">{titleCase(activeFilter)}</span></>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setQuery('');
                setActiveFilter('SEMUA');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#272A38] bg-[#14161F] px-4 py-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-white/40 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={14} strokeWidth={2} />
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="mb-3">
            <p className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
              Agenda Pertunjukan
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Semua Konser
            </h2>
          </div>
        )}
      </div>

      {featured && !hasCriteria && (
        <section className="mx-auto max-w-[1360px] px-5 sm:px-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center rounded-2xl border border-[#272A38] bg-[#14161F] p-6 lg:p-10">
            <div className="lg:col-span-7">
              <a
                href={`/concert/${featured.id}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#1D202D]">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover brightness-[0.9] transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-100"
                  />
                  {featured.isClosed ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="rounded-md border border-white/30 bg-black/50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                        Penjualan Ditutup
                      </span>
                    </div>
                  ) : (
                    <DateBlock date={featured.date} size="lg" />
                  )}
                  <span className="absolute bottom-4 left-4 rounded-md bg-[#0C0D12]/85 border border-white/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                    Pertunjukan Pilihan
                  </span>
                </div>
              </a>
            </div>

            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                Sorotan Utama
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.1] tracking-tight text-white">
                {featured.title}
              </h2>
              <p className="mt-2 text-base font-normal text-[#A1A1AA]">{featured.artist}</p>

              <div className="mt-6 space-y-3.5 border-t border-[#272A38] pt-5">
                {featuredMeta.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between gap-6 border-b border-[#272A38] pb-3 text-sm"
                  >
                    <span className="text-[#71717A]">{m.label}</span>
                    <span className="text-right font-medium text-white">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <div>
                  <span className="block text-xs font-medium text-[#71717A]">Mulai dari</span>
                  <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                    {formatIDR(lowestPrice(featured))}
                  </span>
                </div>
                <a
                  href={`/concert/${featured.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Ticket size={16} strokeWidth={2} />
                  <span>Lihat Jadwal & Tiket</span>
                  <ChevronRight size={16} strokeWidth={2} />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1360px] px-5 sm:px-10 pb-20">
        {isBrowsingAll ? (
          mainEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {mainEvents.map((event) => (
                <EventCard
                  key={String(event.id)}
                  event={event}
                  saved={favorites.has(String(event.id))}
                  onToggleSave={() => toggleSave(event.id)}
                />
              ))}
            </div>
          )
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <EventCard
                key={String(event.id)}
                event={event}
                saved={favorites.has(String(event.id))}
                onToggleSave={() => toggleSave(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center rounded-2xl border border-[#272A38] bg-[#14161F] p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1D202D] text-[#A1A1AA]">
              <Search size={22} strokeWidth={1.5} />
            </span>
            <h3 className="mt-5 text-lg font-bold text-white">Tidak ada konser yang cocok</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
              Gunakan kata kunci lain atau atur ulang filter pencarian untuk melihat seluruh jadwal.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setActiveFilter('SEMUA');
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;