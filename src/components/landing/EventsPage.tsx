import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, MapPin, Calendar, ChevronRight, Ticket } from 'lucide-react';
import { CONCERT_EVENTS, fetchEventsAPI, formatIDR } from './data';
import { parseDate, MONTHS } from './Sections';
import type { EventItem } from './data';
import { Footer } from './Footer';
import { Header } from './Navbar';
import { EventCategoriesSection } from './EventCategoriesSection';
import { ConcertCard, getFallbackPoster, getLowestPrice, getTotalRemaining } from './ConcertCard';
import { AuthProvider, useAuth } from '@/context/AuthContext';

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

const DateBlock: React.FC<{ date?: string }> = ({ date }) => {
  const { day, month, year } = parseDate(date);
  return (
    <div className="absolute top-3 left-3 sm:left-4 bg-[#D4FF2A] px-3.5 py-2 text-center text-[#141413]">
      <span className="block font-display text-2xl leading-none font-extrabold tabular-nums">
        {day}
      </span>
      <span className="block mt-1 leading-none text-[10px] font-bold tracking-[0.16em] uppercase">
        {month} {year}
      </span>
    </div>
  );
};

const FeaturedImage: React.FC<{ event: EventItem; unavailable: boolean }> = ({ event, unavailable }) => {
  const fallback = getFallbackPoster(event.id);
  const [src, setSrc] = useState(event.image || fallback);
  return (
    <img
      src={src}
      alt={event.title}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
      className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
        unavailable ? 'grayscale brightness-75' : ''
      }`}
    />
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
  const seasonMin = sourceEvents.length ? Math.min(...sourceEvents.map(getLowestPrice)) : 0;

  const featuredMeta: { label: string; value: string }[] = [];
  if (featured) {
    featuredMeta.push({ label: 'Tanggal', value: featured.date });
    featuredMeta.push({ label: 'Gerbang Buka', value: `${featured.time} · Open Gate ${featured.openGate}` });
    featuredMeta.push({ label: 'Lokasi', value: featured.venue });
  }

  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#141413]">
      <Header user={user} onLogout={logout} />

      <section className="relative overflow-hidden border-b border-[#DFDDD6] pt-[64px]">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-7 max-w-[720px]">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#141413]" aria-hidden="true" />
                <span>Katalog Musim 2026-2027</span>
              </p>
              <h1 className="mt-3 font-display text-[clamp(36px,5.4vw,64px)] leading-[0.95] font-extrabold tracking-[-0.04em] text-[#141413] m-0">
                Temukan Konser &amp; Pertunjukan Musik Pilihan
              </h1>
              <p className="mt-4 max-w-[540px] text-sm sm:text-base leading-relaxed text-[#52514D]">
                Jelajahi pertunjukan orkestra, simfoni, balet, dan ansambel kamar. Pesan tiket resmi dan terima E-Ticket instan.
              </p>

              <form
                role="search"
                onSubmit={(e) => e.preventDefault()}
                className="mt-7 group/input relative"
              >
                <Search
                  size={18}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6D68] transition-colors group-focus-within:text-[#141413]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari konser, artis, atau venue..."
                  aria-label="Cari konser, artis, atau venue"
                  className="min-h-[52px] w-full rounded-none border border-[#141413] bg-white pl-12 pr-14 text-base text-[#141413] placeholder-[#6E6D68] outline-none transition-colors focus:ring-2 focus:ring-[#141413]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-none bg-[#EAE8E1] text-[#141413] transition-colors hover:bg-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                  >
                    <X size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-none bg-white border border-[#DFDDD6] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#141413]">
                  <MapPin size={13} strokeWidth={2} aria-hidden="true" />
                  Jakarta, ID
                </span>
                <span className="inline-flex items-center gap-2 rounded-none bg-[#D4FF2A] border border-[#141413]/20 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#141413]">
                  <Calendar size={13} strokeWidth={2} aria-hidden="true" />
                  Jadwal Resmi
                </span>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <div className="rounded-none border border-[#141413] bg-white p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                  • Informasi Musim Ini
                </p>
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="font-display text-5xl font-extrabold leading-none tracking-[-0.04em] text-[#141413] tabular-nums">
                    {sourceEvents.length}
                  </span>
                  <span className="text-sm font-medium text-[#52514D]">pertunjukan aktif</span>
                </div>
                <div className="mt-6 space-y-3 border-t border-[#DFDDD6] pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#52514D]">Venue Pilihan</span>
                    <span className="font-bold text-[#141413]">{venueCount} lokasi</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#52514D]">Kategori Musik</span>
                    <span className="font-bold text-[#141413]">{categories.length} jenis</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#52514D]">Tiket Mulai</span>
                    <span className="font-extrabold text-[#141413] tabular-nums">{formatIDR(seasonMin)}</span>
                  </div>
                </div>
                <div className="mt-6 rounded-none bg-[#F4F3EF] border border-[#DFDDD6] px-4 py-3 text-xs leading-relaxed text-[#52514D]">
                  E-Ticket dengan Kode QR resmi dikirim langsung ke akun dan email Anda setelah pemesanan.
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

      <div className="sticky top-[64px] z-30 border-b border-[#DFDDD6] bg-[#F4F3EF]">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-2 py-3">
            {filterChips.map((chip) => {
              const active = activeFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => selectFilter(chip.id)}
                  aria-pressed={active}
                  className={`min-h-[44px] flex shrink-0 items-center gap-2 rounded-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                    active
                      ? 'bg-[#141413] text-[#D4FF2A]'
                      : 'bg-white text-[#141413] border border-[#DFDDD6] hover:border-[#141413]'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold tabular-nums ${
                      active ? 'bg-[#D4FF2A] text-[#141413]' : 'bg-[#EAE8E1] text-[#52514D]'
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

      <div ref={resultsRef} className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 pt-12 pb-6 scroll-mt-32">
        {fetchError && (
          <div
            role="alert"
            className="mb-8 p-4 rounded-none border border-[#8A5A00] bg-[#8A5A00]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <span className="text-sm text-[#141413]">{fetchError}</span>
            <button
              type="button"
              onClick={loadEvents}
              className="min-h-[40px] px-4 py-2 rounded-none bg-[#141413] text-[#D4FF2A] text-xs font-bold uppercase tracking-wider hover:bg-[#2A2A28] shrink-0"
            >
              Muat Ulang
            </button>
          </div>
        )}

        {hasCriteria ? (
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                • Hasil Pencarian
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#141413] mb-0">
                {filtered.length} konser ditemukan
              </h2>
              {query.trim() && (
                <p className="mt-1.5 text-sm text-[#52514D] mb-0">
                  untuk &ldquo;<span className="font-bold text-[#141413]">{query.trim()}</span>&rdquo;
                  {activeFilter !== 'SEMUA' && (
                    <> · filter <span className="font-bold text-[#141413]">{titleCase(activeFilter)}</span></>
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
              className="min-h-[44px] inline-flex items-center gap-2 rounded-none border border-[#141413] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#141413] transition-colors hover:bg-[#141413] hover:text-[#D4FF2A]"
            >
              <X size={15} strokeWidth={2} aria-hidden="true" />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
              • Agenda Pertunjukan
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] text-[#141413] mb-0">
              Semua Konser
            </h2>
          </div>
        )}
      </div>

      {featured && !hasCriteria && (
        <section className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center rounded-none border border-[#141413] bg-white p-5 sm:p-6 lg:p-10">
            <div className="lg:col-span-7">
              <a
                href={`/concert/${featured.id}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#141413] chamfer-br">
                  <FeaturedImage
                    event={featured}
                    unavailable={!!featured.isClosed || getTotalRemaining(featured) <= 0}
                  />
                  {featured.isClosed ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#141413]/70">
                      <span className="border border-white/30 bg-[#141413] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#F4F3EF]">
                        Penjualan Ditutup
                      </span>
                    </div>
                  ) : getTotalRemaining(featured) <= 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#141413]/70">
                      <span className="bg-[#C81E1E] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                        Tiket Habis
                      </span>
                    </div>
                  ) : (
                    <DateBlock date={featured.date} />
                  )}
                  <span className="absolute bottom-4 left-4 bg-[#141413] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F4F3EF]">
                    Pertunjukan Pilihan
                  </span>
                </div>
              </a>
            </div>

            <div className="lg:col-span-5">
              <span className="inline-flex items-center px-3 py-1 bg-[#D4FF2A] text-[10px] font-bold uppercase tracking-[0.16em] text-[#141413]">
                • Sorotan Utama
              </span>
              <h2 className="mt-4 font-display text-2xl sm:text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] text-[#141413] mb-0">
                {featured.title}
              </h2>
              <p className="mt-2 text-base font-medium text-[#52514D] mb-0">{featured.artist}</p>

              <div className="mt-6 space-y-3 border-t border-[#DFDDD6] pt-5">
                {featuredMeta.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between gap-6 border-b border-[#DFDDD6] pb-3 text-sm"
                  >
                    <span className="text-[#6E6D68]">{m.label}</span>
                    <span className="text-right font-semibold text-[#141413]">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6D68]">
                    {featured.isClosed
                      ? 'Status Penjualan'
                      : getTotalRemaining(featured) <= 0
                      ? 'Status Kuota'
                      : 'Mulai dari'}
                  </span>
                  {featured.isClosed ? (
                    <span className="text-xl font-bold tracking-tight text-[#6E6D68]">
                      Penjualan Ditutup
                    </span>
                  ) : getTotalRemaining(featured) <= 0 ? (
                    <span className="text-xl font-bold tracking-tight text-[#C81E1E]">
                      Tiket Habis
                    </span>
                  ) : (
                    <span className="text-2xl font-extrabold tracking-tight text-[#141413] tabular-nums">
                      {formatIDR(getLowestPrice(featured))}
                    </span>
                  )}
                </div>
                {featured.isClosed || getTotalRemaining(featured) <= 0 ? (
                  <div className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-none bg-[#EAE8E1] border border-[#DFDDD6] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#6E6D68] sm:ml-auto select-none">
                    <Ticket size={16} strokeWidth={2} aria-hidden="true" />
                    <span>{featured.isClosed ? 'Penjualan Ditutup' : 'Tiket Habis'}</span>
                  </div>
                ) : (
                  <a
                    href={`/concert/${featured.id}`}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-none bg-[#D4FF2A] border border-[#141413] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#141413] transition-colors hover:bg-[#C2EE1A] sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
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

      <section className="scroll-mt-24 mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 pb-20">
        {isLoading && sourceEvents.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-[#DFDDD6] bg-white p-4 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-[#EAE8E1]" />
                <div className="h-5 bg-[#EAE8E1] w-3/4" />
                <div className="h-4 bg-[#EAE8E1] w-1/2" />
              </div>
            ))}
          </div>
        ) : mainEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {mainEvents.map((event) => (
              <ConcertCard
                key={String(event.id)}
                event={event}
                saved={favorites.has(String(event.id))}
                onToggleSave={() => toggleSave(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-md py-16 text-center rounded-none border border-[#DFDDD6] bg-white p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center bg-[#EAE8E1] text-[#141413]">
              <Search size={22} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-[#141413]">
              Tidak ada konser yang cocok
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#52514D]">
              Gunakan kata kunci lain atau atur ulang filter pencarian untuk melihat seluruh jadwal.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveFilter('SEMUA');
              }}
              className="mt-6 min-h-[44px] inline-flex items-center gap-2 rounded-none bg-[#141413] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D4FF2A] transition-colors hover:bg-[#2A2A28]"
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
