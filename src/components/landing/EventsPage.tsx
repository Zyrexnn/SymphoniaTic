import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Search, X, Heart, MapPin, Calendar, Music2, ChevronRight, Ticket } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import { parseDate, MONTHS } from './Sections';
import type { EventItem } from './data';
import { Footer } from './Footer';
import { Header } from './Layout';

/* ── Data helpers ── */

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

/* ── Small pieces ── */

const DateBlock: React.FC<{ date?: string; size?: 'sm' | 'lg' }> = ({ date, size = 'sm' }) => {
  const { day, month, year } = parseDate(date);
  return (
    <div
      className={`absolute left-4 rounded-xl bg-white/95 backdrop-blur-sm shadow-[0_4px_16px_-6px_rgba(17,17,17,0.25)] text-center ${
        size === 'lg' ? 'px-3.5 py-2.5 left-5' : 'px-2.5 py-2'
      }`}
    >
      <span
        className={`block leading-none font-bold text-[#183B56] tabular-nums ${
          size === 'lg' ? 'text-2xl' : 'text-lg'
        }`}
      >
        {day}
      </span>
      <span
        className={`block mt-1 leading-none font-bold tracking-[0.16em] text-brand-accent ${
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
    className="absolute top-4 right-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
  >
    <Heart
      size={16}
      strokeWidth={2}
      className={active ? 'fill-brand-accent text-brand-accent' : 'text-[#64748B]'}
    />
  </button>
);

/* ── Event poster card ── */

const EventCard: React.FC<{ event: EventItem; saved: boolean; onToggleSave: () => void }> = ({
  event,
  saved,
  onToggleSave,
}) => {
  const isClosed = !!event.isClosed;
  return (
    <a
      href={`/concert/${event.id}`}
      className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden rounded-xl bg-[#F1F5F9] aspect-[7/6]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.05] ${
            isClosed ? 'grayscale brightness-50' : 'brightness-[0.94] group-hover:brightness-100'
          }`}
        />
        {/* {!isClosed && <DateBlock date={event.date} />} */}
        <FavoriteButton active={saved} onToggle={onToggleSave} />

        {isClosed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 p-4">
            <span className="rounded-full border border-white/30 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              Penjualan Ditutup
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <span className="text-[13px] font-bold text-brand-accent">
          {titleCase(event.category || 'Konser')}
        </span>
        <h3 className="mt-1.5 line-clamp-2 text-[17px] font-bold leading-snug tracking-[-0.01em] text-[#183B56]">
          {event.title}
        </h3>
        <p className="mt-1 truncate text-sm text-[#64748B]">{event.artist}</p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-[#94A3B8]">
          <MapPin size={13} strokeWidth={2} className="shrink-0" />
          <span className="truncate">{event.venue}</span>
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-[#E5E7EB] pt-3.5 mt-4">
          {isClosed ? (
            <span className="text-sm font-semibold text-[#94A3B8]">Penjualan Selesai</span>
          ) : (
            <span className="text-sm font-bold text-[#183B56]">
              Mulai {formatIDR(lowestPrice(event))}
            </span>
          )}
          <ChevronRight
            size={18}
            strokeWidth={2}
            className="text-[#94A3B8] transition-all group-hover:translate-x-1 group-hover:text-brand-accent"
          />
        </div>
      </div>
    </a>
  );
};

/* ── Category discovery card ── */

const CategoryCard: React.FC<{ name: string; count: number; image: string; onSelect: () => void }> = ({
  name,
  count,
  image,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className="group relative block w-[74vw] sm:w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#F1F5F9] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="aspect-[3/4] w-full object-cover brightness-[0.82] transition-all duration-700 group-hover:scale-[1.05] group-hover:brightness-[0.9]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#183B56]">
        {count} konser
      </span>
      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="text-xl font-bold leading-tight tracking-tight text-white">{name}</h3>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white opacity-0 translate-y-1 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Telusuri {name}
          <ChevronRight size={15} strokeWidth={2} />
        </span>
      </div>
    </button>
  );
};

/* ── Main page ── */

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
    <div className="min-h-screen bg-white text-[#183B56]">
      {/* ═══════════ TOP BAR ═══════════ */}
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md">
        <Header />
      </header>

      {/* ═══════════ DISCOVERY HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-120px] h-[520px] w-[520px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #6C2BD9 0%, rgba(108,43,217,0) 70%)' }}
        />
        <div className="mx-auto max-w-[1360px] px-5 sm:px-10 pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: headline + search */}
            <div className="lg:col-span-7 max-w-[720px]">
              <h1 className="mt-5 text-[clamp(34px,5.5vw,60px)] leading-[1.04] font-bold tracking-[-0.04em] text-[#183B56]">
                Temukan konser yang ingin kamu dengarkan.
              </h1>
              <p className="mt-5 max-w-[540px] text-base md:text-lg leading-relaxed text-[#64748B]">
                Jelajahi pertunjukan orkestra, simfoni, balet, dan ansambel terbaik musim ini pilih,
                pesan, dan dapatkan E-Ticket kamu dalam hitungan detik.
              </p>

              {/* Central search */}
              <form
                role="search"
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 group/input relative"
              >
                <Search
                  size={20}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-brand-accent"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari konser, artis, atau venue..."
                  aria-label="Cari konser, artis, atau venue"
                  className="h-14 sm:h-16 w-full rounded-full border border-[#E5E7EB] bg-white pl-14 pr-12 text-base sm:text-lg text-[#183B56] placeholder-[#94A3B8] shadow-[0_10px_30px_-18px_rgba(24,59,86,0.18)] outline-none transition-all focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/15"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-3.5 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B] transition-colors hover:bg-brand-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </form>

              {/* Context chips */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#183B56]">
                  <MapPin size={14} strokeWidth={2} className="text-brand-accent" />
                  Jakarta, ID
                </span>
                <span className="inline-flex items-center gap-2 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#183B56]">
                  <Calendar size={14} strokeWidth={2} className="text-brand-accent" />
                  Musim 2026
                </span>
              </div>
            </div>

            {/* Right: season snapshot */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-24 rounded-2xl border border-[#E5E7EB] bg-white p-8">
                <p className="text-xl font-bold text-brand-accent">
                  Temukan Musik Mu!
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-[64px] font-bold leading-none tracking-[-0.04em] text-[#183B56] tabular-nums">
                    {sourceEvents.length}
                  </span>
                  <span className="text-sm font-medium text-[#64748B]">pertunjukan tersedia</span>
                </div>
                <div className="mt-7 space-y-4 border-t border-[#E5E7EB] pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">Venue</span>
                    <span className="text-sm font-bold text-[#183B56]">{venueCount} lokasi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">Kategori</span>
                    <span className="text-sm font-bold text-[#183B56]">{categories.length} jenis</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#94A3B8]">Harga mulai</span>
                    <span className="text-sm font-bold text-brand-accent">{formatIDR(seasonMin)}</span>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-[#F8FAFC] px-4 py-3.5 text-xs leading-relaxed text-[#64748B]">
                  E-Ticket ber-Kode QR dikirim langsung ke akun kamu setelah pemesanan siap di scan saat Open Gate.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <div className="sticky top-14 z-30 border-y border-[#E5E7EB] bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            {filterChips.map((chip) => {
              const active = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => selectFilter(chip.id)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${
                    active
                      ? 'bg-brand-accent text-white'
                      : 'bg-white text-[#64748B] border border-[#E5E7EB] hover:border-brand-accent/50 hover:text-brand-accent'
                  }`}
                >
                  {chip.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      active ? 'bg-white/20 text-white' : 'bg-[#F8FAFC] text-[#94A3B8]'
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

      {/* ═══════════ RESULTS ═══════════ */}
      <div ref={resultsRef} className="mx-auto max-w-[1360px] px-5 sm:px-10 pt-14 pb-6 scroll-mt-28">
        {hasCriteria ? (
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-accent">
              
                Hasil Pencarian
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#183B56]">
                {filtered.length} konser ditemukan
              </h2>
              {query.trim() && (
                <p className="mt-1.5 text-sm text-[#64748B]">
                  untuk “<span className="font-semibold text-[#183B56]">{query.trim()}</span>”
                  {activeFilter !== 'SEMUA' && (
                    <> · filter <span className="font-semibold text-[#183B56]">{titleCase(activeFilter)}</span></>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setQuery('');
                setActiveFilter('SEMUA');
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#64748B] transition-colors hover:border-brand-accent hover:text-brand-accent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <X size={14} strokeWidth={2} />
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="mb-3">
            <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-accent">
              
              Agenda Konser
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#183B56]">
              Semua Konser
            </h2>
          </div>
        )}
      </div>

      {/* ═══════════ FEATURED EVENT ═══════════ */}
      {featured && !hasCriteria && (
        <section className="mx-auto max-w-[1360px] px-5 sm:px-10 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7">
              <a
                href={`/concert/${featured.id}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#F1F5F9]">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover brightness-[0.9] transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-100"
                  />
                  {featured.isClosed ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                      <span className="rounded-full border border-white/30 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                        Penjualan Ditutup
                      </span>
                    </div>
                  ) : (
                    <DateBlock date={featured.date} size="lg" />
                  )}
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">
                    Pertunjukan Pilihan
                  </span>
                </div>
              </a>
            </div>

            <div className="lg:col-span-5">
              <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-accent">
                
                Featured
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.06] tracking-[-0.03em] text-[#183B56]">
                {featured.title}
              </h2>
              <p className="mt-3 text-lg font-medium text-[#64748B]">{featured.artist}</p>

              <div className="mt-7 space-y-4 border-t border-[#E5E7EB] pt-6">
                {featuredMeta.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between gap-6 border-b border-[#E5E7EB] pb-4"
                  >
                    <span className="text-sm text-[#94A3B8]">
                      {m.label}
                    </span>
                    <span className="text-right text-sm font-bold text-[#183B56]">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-5">
                <div>
                  <span className="block text-xs font-medium text-[#94A3B8]">Mulai dari</span>
                  <span className="text-2xl font-bold tracking-[-0.02em] text-[#183B56] tabular-nums">
                    {formatIDR(lowestPrice(featured))}
                  </span>
                </div>
                <a
                  href={`/concert/${featured.id}`}
                  className="group/btn inline-flex items-center justify-center gap-2 rounded-sm bg-[#183B56] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-accent sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                >
                  <Ticket size={16} strokeWidth={2} />
                  Lihat Event & Tiket
                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    className="transition-transform group-hover/btn:translate-x-0.5"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ EVENT GRID ═══════════ */}
      <section className="mx-auto max-w-[1360px] px-5 sm:px-10 pb-20">
        {isBrowsingAll ? (
          mainEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
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
          /* ── Empty state ── */
          <div className="mx-auto max-w-md py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8FAFC]">
              <Search size={24} strokeWidth={1.5} className="text-[#94A3B8]" />
            </span>
            <h3 className="mt-6 text-xl font-bold text-[#183B56]">Tidak ada konser yang cocok</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
              Coba gunakan kata kunci lain, pilih kategori berbeda, atau atur ulang semua filter.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setActiveFilter('SEMUA');
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-accent-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </section>

      
      {categories.length > 1 && (
        <section className="border-t border-[#E5E7EB] bg-[#F8FAFC]/60 py-16">
          <div className="mx-auto max-w-[1360px] px-5 sm:px-10">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-accent">
                  
                  Telusuri Pengalaman
                </p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#183B56]">
                  Jelajahi Berdasarkan Kategori
                </h2>
              </div>
              <p className="text-sm text-[#64748B] max-w-sm sm:text-right">
                Temukan arah konser yang sesuai dengan seleramu musim ini.
              </p>
            </div>

            <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-5 sm:mx-0 px-5 sm:px-0">
              {categories.map((cat) => {
                const rep = sourceEvents.find(
                  (e) => (e.category || '').trim().toUpperCase() === cat
                );
                const count = sourceEvents.filter(
                  (e) => (e.category || '').trim().toUpperCase() === cat
                ).length;
                if (!rep) return null;
                return (
                  <CategoryCard
                    key={cat}
                    name={titleCase(cat)}
                    count={count}
                    image={rep.image}
                    onSelect={() => selectFilter(cat)}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default EventsPage;