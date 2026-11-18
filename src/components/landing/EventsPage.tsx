import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, Heart, MapPin, Calendar, ChevronRight, Ticket } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import { parseDate, MONTHS } from './Sections';
import type { EventItem } from './data';
import { Footer } from './Footer';
import { Header } from './Navbar';
import { EventCategoriesSection } from './EventCategoriesSection';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const lowestPrice = (event: EventItem): number => {
  if (!event.categories?.length) return 0;
  return Math.min(...event.categories.map((c) => Number(c.price) || 0));
};

const getTotalRemaining = (e: EventItem): number => {
  if (!e.categories || e.categories.length === 0) return 0;
  return e.categories.reduce((total, cat) => {
    const rem = cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota;
    return total + (typeof rem === 'number' && !isNaN(rem) ? rem : 0);
  }, 0);
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
      className={`absolute top-4 left-4 rounded-lg bg-[#0C0D12]/90 border border-white/25 text-center ${
        size === 'lg' ? 'px-3.5 py-2.5 sm:left-5' : 'px-2.5 py-2'
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
        className={`block mt-1 leading-none font-semibold tracking-[0.16em] text-[#E4E4E7] uppercase ${
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
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }}
    aria-label={active ? 'Hapus dari favorit' : 'Simpan ke favorit'}
    aria-pressed={active}
    className="absolute top-3.5 right-3.5 z-10 flex h-11 w-11 items-center justify-center rounded-lg bg-[#0C0D12]/90 border border-white/25 transition-colors hover:bg-white hover:text-[#0C0D12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
  >
    <Heart
      size={17}
      strokeWidth={2}
      className={active ? 'fill-current text-white' : 'text-[#E4E4E7]'}
      aria-hidden="true"
    />
  </button>
);

const EventCard: React.FC<{ event: EventItem; saved: boolean; onToggleSave: () => void }> = ({
  event,
  saved,
  onToggleSave,
}) => {
  const isClosed = !!event.isClosed;
  const isSoldOut = getTotalRemaining(event) <= 0;
  return (
    <a
      href={`/concert/${event.id}`}
      className="group flex flex-col rounded-xl border border-[#272A38] bg-[#14161F] p-4 transition-colors duration-200 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12]"
    >
      <div className="relative overflow-hidden rounded-lg bg-[#1D202D] aspect-[7/6]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
            isClosed || isSoldOut ? 'grayscale brightness-50' : 'brightness-[0.92] group-hover:brightness-100'
          }`}
        />
        <DateBlock date={event.date} size="sm" />
        <FavoriteButton active={saved} onToggle={onToggleSave} />

        {isClosed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 p-4">
            <span className="rounded-md border border-white/30 bg-[#0C0D12]/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              Penjualan Ditutup
            </span>
          </div>
        ) : isSoldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 p-4">
            <span className="rounded-md border border-rose-500/40 bg-[#0C0D12]/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300">
              Tiket Habis
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
          {titleCase(event.category || 'Konser')}
        </span>
        <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em] text-white">
          {event.title}
        </h3>
        <p className="mt-1 truncate text-xs text-[#A1A1AA]">{event.artist}</p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#A1A1AA]">
          <MapPin size={13} strokeWidth={2} className="shrink-0 text-[#A1A1AA]" aria-hidden="true" />
          <span className="truncate">{event.venue}</span>
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-[#272A38] pt-3.5 mt-4">
          {isClosed ? (
            <span className="text-xs font-semibold text-[#A1A1AA]">Penjualan Selesai</span>
          ) : isSoldOut ? (
            <span className="text-xs font-bold text-rose-300">Tiket Habis</span>
          ) : (
            <span className="text-sm font-bold text-white tabular-nums">
              Mulai {formatIDR(lowestPrice(event))}
            </span>
          )}
          <ChevronRight
            size={16}
            strokeWidth={2}
            className="text-[#A1A1AA] transition-transform group-hover:translate-x-1 group-hover:text-white"
            aria-hidden="true"
          />
        </div>
      </div>
    </a>
  );
};

const EventsPageContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') ?? '';
    }
    return '';
  });
  const FAVORITES_STORAGE_KEY = 'symphoniatic_favorite_events';
  const [activeFilter, setActiveFilter] = useState<string>('SEMUA');
  const [liveEvents, setLiveEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!saved) return new Set();
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
    } catch {
      return new Set();
    }
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchEventsAPI();
      setLiveEvents(data);
    } catch {
      setLiveEvents([]);
      setFetchError('Gagal memuat jadwal konser dari server. Menampilkan katalog tersimpan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
          } else if (activeFilter === 'FAVORIT') {
            if (!favorites.has(String(e.id))) return false;
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
  }, [query, activeFilter, sourceEvents, favorites]);

  const isBrowsingAll = query.trim() === '' && activeFilter === 'SEMUA';
  const showFeatured = isBrowsingAll && filtered.length > 1;
  const featured = showFeatured ? filtered[0] : null;
  const mainEvents = showFeatured ? filtered.slice(1) : filtered;

  const filterChips = useMemo(() => {
    const countFor = (cat: string) =>
      sourceEvents.filter((e) => (e.category || '').trim().toUpperCase() === cat).length;
    const weekendCount = sourceEvents.filter(isWeekend).length;
    const favoriteCount = sourceEvents.filter((e) => favorites.has(String(e.id))).length;
    return [
      { id: 'SEMUA', label: 'Semua', count: sourceEvents.length },
      ...categories.map((c) => ({ id: c, label: titleCase(c), count: countFor(c) })),
      { id: 'AKHIR PEKAN', label: 'Akhir Pekan', count: weekendCount },
      { id: 'FAVORIT', label: 'Favorit', count: favoriteCount },
    ];
  }, [categories, sourceEvents, favorites]);

  const toggleSave = (id: string | number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
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
      <Header isScrolled user={user} onLogout={logout} />

      <section className="relative overflow-hidden border-b border-[#272A38]">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-10 pt-24 pb-12 md:pt-28 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-7 max-w-[720px]">
              <h1 className="text-[clamp(30px,5vw,52px)] leading-[1.1] font-semibold tracking-tight text-white m-0">
                Temukan Konser &amp; Pertunjukan Musik Pilihan
              </h1>
              <p className="mt-4 max-w-[540px] text-base md:text-lg leading-relaxed text-[#A1A1AA]">
                Jelajahi pertunjukan orkestra, simfoni, balet, dan ansambel musim 2026. Pesan tiket resmi dan terima E-Ticket instan.
              </p>

              <form
                role="search"
                onSubmit={(e) => e.preventDefault()}
                className="mt-7 group/input relative"
              >
                <Search
                  size={20}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-white"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari konser, artis, atau venue..."
                  aria-label="Cari konser, artis, atau venue"
                  className="min-h-[54px] w-full rounded-xl border border-[#3E4357] bg-[#14161F] pl-12 pr-14 text-base text-white placeholder-[#94A3B8] outline-none transition-colors focus:border-white focus:ring-2 focus:ring-white/25"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg bg-[#1D202D] text-[#E4E4E7] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <X size={17} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg bg-[#14161F] border border-[#272A38] px-4 py-2 text-sm font-medium text-[#E4E4E7]">
                  <MapPin size={14} strokeWidth={2} className="text-white" aria-hidden="true" />
                  Jakarta, ID
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-[#14161F] border border-[#272A38] px-4 py-2 text-sm font-medium text-[#E4E4E7]">
                  <Calendar size={14} strokeWidth={2} className="text-white" aria-hidden="true" />
                  Musim 2026
                </span>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-xl border border-[#272A38] bg-[#14161F] p-7">
                <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA] m-0">
                  Informasi Musim Ini
                </p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-bold leading-none tracking-tight text-white tabular-nums">
                    {sourceEvents.length}
                  </span>
                  <span className="text-sm font-medium text-[#A1A1AA]">pertunjukan aktif</span>
                </div>
                <div className="mt-6 space-y-3.5 border-t border-[#272A38] pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#A1A1AA]">Venue Pilihan</span>
                    <span className="font-semibold text-white">{venueCount} lokasi</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#A1A1AA]">Kategori Musik</span>
                    <span className="font-semibold text-white">{categories.length} jenis</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#A1A1AA]">Tiket Mulai</span>
                    <span className="font-bold text-white tabular-nums">{formatIDR(seasonMin)}</span>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-[#0C0D12] border border-[#272A38] px-4 py-3.5 text-xs leading-relaxed text-[#A1A1AA]">
                  E-Ticket ber-Kode QR resmi dikirim langsung ke akun dan email Anda setelah pemesanan.
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

      <div className="sticky top-[64px] sm:top-[68px] z-30 border-y border-[#272A38] bg-[#0C0D12]">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 -mx-5 px-5 sm:mx-0 sm:px-0">
            {filterChips.map((chip) => {
              const active = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => selectFilter(chip.id)}
                  aria-pressed={active}
                  className={`min-h-[44px] flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    active
                      ? 'bg-white text-[#0C0D12] font-semibold'
                      : 'bg-[#14161F] text-[#E4E4E7] border border-[#3E4357] hover:border-white/60 hover:text-white'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                      active ? 'bg-black/15 text-[#0C0D12]' : 'bg-[#0C0D12] text-[#A1A1AA]'
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

      <div ref={resultsRef} className="mx-auto max-w-[1360px] px-5 sm:px-10 pt-12 pb-6 scroll-mt-32">
        {fetchError && (
          <div role="alert" className="mb-8 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm text-amber-200">{fetchError}</span>
            <button
              type="button"
              onClick={loadEvents}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-white text-[#0C0D12] text-xs font-semibold hover:bg-neutral-200 shrink-0"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {hasCriteria ? (
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA] m-0">
                Hasil Pencarian
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white mb-0">
                {filtered.length} konser ditemukan
              </h2>
              {query.trim() && (
                <p className="mt-1.5 text-sm text-[#A1A1AA] mb-0">
                  untuk &ldquo;<span className="font-semibold text-white">{query.trim()}</span>&rdquo;
                  {activeFilter !== 'SEMUA' && (
                    <> · filter <span className="font-semibold text-white">{titleCase(activeFilter)}</span></>
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveFilter('SEMUA');
              }}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-[#3E4357] bg-[#14161F] px-4 py-2 text-sm font-medium text-[#E4E4E7] transition-colors hover:border-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={15} strokeWidth={2} aria-hidden="true" />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA] m-0">
              Agenda Pertunjukan
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-white mb-0">
              Semua Konser
            </h2>
          </div>
        )}
      </div>

      {featured && !hasCriteria && (
        <section className="mx-auto max-w-[1360px] px-5 sm:px-10 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-2xl border border-[#272A38] bg-[#14161F] p-5 sm:p-6 lg:p-10">
            <div className="lg:col-span-7">
              <a
                href={`/concert/${featured.id}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#1D202D]">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                      featured.isClosed || getTotalRemaining(featured) <= 0
                        ? 'grayscale brightness-50'
                        : 'brightness-[0.9] group-hover:brightness-100'
                    }`}
                  />
                  {featured.isClosed ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/65">
                      <span className="rounded-md border border-white/30 bg-[#0C0D12]/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                        Penjualan Ditutup
                      </span>
                    </div>
                  ) : getTotalRemaining(featured) <= 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/65">
                      <span className="rounded-md border border-rose-500/40 bg-[#0C0D12]/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-300">
                        Tiket Habis
                      </span>
                    </div>
                  ) : (
                    <DateBlock date={featured.date} size="lg" />
                  )}
                  <span className="absolute bottom-4 left-4 rounded-md bg-[#0C0D12]/90 border border-white/25 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    Pertunjukan Pilihan
                  </span>
                </div>
              </a>
            </div>

            <div className="lg:col-span-5">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#0C0D12] border border-[#272A38] text-xs font-mono uppercase tracking-widest text-[#E4E4E7]">
                Sorotan Utama
              </span>
              <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.12] tracking-tight text-white mb-0">
                {featured.title}
              </h2>
              <p className="mt-2 text-base font-normal text-[#A1A1AA] mb-0">{featured.artist}</p>

              <div className="mt-6 space-y-3 border-t border-[#272A38] pt-5">
                {featuredMeta.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between gap-6 border-b border-[#272A38] pb-3 text-sm"
                  >
                    <span className="text-[#A1A1AA]">{m.label}</span>
                    <span className="text-right font-medium text-white">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <div>
                  <span className="block text-xs font-medium text-[#A1A1AA]">
                    {featured.isClosed
                      ? 'Status Penjualan'
                      : getTotalRemaining(featured) <= 0
                      ? 'Status Kuota'
                      : 'Mulai dari'}
                  </span>
                  {featured.isClosed ? (
                    <span className="text-xl font-bold tracking-tight text-[#A1A1AA]">
                      Penjualan Selesai
                    </span>
                  ) : getTotalRemaining(featured) <= 0 ? (
                    <span className="text-xl font-bold tracking-tight text-rose-300">
                      Tiket Habis
                    </span>
                  ) : (
                    <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                      {formatIDR(lowestPrice(featured))}
                    </span>
                  )}
                </div>
                {featured.isClosed || getTotalRemaining(featured) <= 0 ? (
                  <div className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#1D202D] border border-[#3E4357] px-6 py-3 text-sm font-semibold text-[#A1A1AA] sm:ml-auto select-none">
                    <Ticket size={16} strokeWidth={2} aria-hidden="true" />
                    <span>{featured.isClosed ? 'Penjualan Ditutup' : 'Tiket Habis'}</span>
                  </div>
                ) : (
                  <a
                    href={`/concert/${featured.id}`}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0C0D12] transition-colors hover:bg-neutral-200 sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Ticket size={16} strokeWidth={2} aria-hidden="true" />
                    <span>Lihat Jadwal &amp; Tiket</span>
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1360px] px-5 sm:px-10 pb-20">
        {isLoading && sourceEvents.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[#272A38] bg-[#14161F] p-4 space-y-4 animate-pulse">
                <div className="aspect-[7/6] bg-[#1D202D] rounded-lg" />
                <div className="h-5 bg-[#272A38] rounded w-3/4" />
                <div className="h-4 bg-[#272A38] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : mainEvents.length > 0 ? (
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
        ) : (
          <div className="mx-auto max-w-md py-16 text-center rounded-2xl border border-[#272A38] bg-[#14161F] p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1D202D] text-[#E4E4E7]">
              <Search size={22} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-bold text-white">Tidak ada konser yang cocok</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
              Gunakan kata kunci lain atau atur ulang filter pencarian untuk melihat seluruh jadwal.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveFilter('SEMUA');
              }}
              className="mt-6 min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0C0D12] transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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

const EventsPage: React.FC = () => (
  <AuthProvider>
    <EventsPageContent />
  </AuthProvider>
);

export default EventsPage;
