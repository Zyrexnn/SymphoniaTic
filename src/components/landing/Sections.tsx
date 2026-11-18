import React, { useRef, useMemo } from 'react';
import { ArrowUpRight, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ARTISTS_LINEUP, formatIDR } from './data';
import type { EventItem } from './data';
import { SectionHeading } from './SectionHeading';
import { parseDateFlexible } from '@/lib/timeUtils';

export interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

export const parseDate = (date?: string) => {
  if (!date) return { day: '', month: '', year: '', weekday: '' };
  const parsed = parseDateFlexible(date);
  if (parsed) {
    return {
      day: parsed.day,
      month: parsed.shortMonthID,
      year: parsed.year,
      weekday: parsed.weekdayID,
    };
  }
  return { day: '', month: '', year: '', weekday: '' };
};

const getLowestPrice = (event: EventItem): number => {
  if (!event.categories || event.categories.length === 0) return 0;
  return Math.min(...event.categories.map((c) => Number(c.price) || 0));
};

const getTotalRemaining = (event: EventItem): number => {
  if (!event.categories || event.categories.length === 0) return 0;
  return event.categories.reduce((total, cat) => {
    const rem = cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota;
    return total + (typeof rem === 'number' && !isNaN(rem) ? rem : 0);
  }, 0);
};

const getQuotaBadge = (event: EventItem, remaining: number) => {
  if (event.isClosed) {
    return {
      label: 'Penjualan Tutup',
      className: 'bg-[#0C0D12]/90 text-[#E4E4E7] border border-[#3E4357]',
      isSoldOut: true,
    };
  }
  if (remaining <= 0) {
    return {
      label: 'Tiket Habis',
      className: 'bg-[#0C0D12]/90 text-[#E4E4E7] border border-[#3E4357]',
      isSoldOut: true,
    };
  }
  if (remaining <= 15) {
    return {
      label: `Tersisa ${remaining} Kursi`,
      className: 'bg-[#0C0D12]/90 text-amber-300 border border-amber-500/50',
      isSoldOut: false,
    };
  }
  return {
    label: `Tersisa ${remaining} Kursi`,
    className: 'bg-[#0C0D12]/90 text-emerald-300 border border-emerald-500/40',
    isSoldOut: false,
  };
};

const ArtistCard: React.FC<{ image: string; name: string; genre: string; shows?: string }> = ({
  image,
  name,
  genre,
  shows,
}) => {
  return (
    <a
      href={`/events?q=${encodeURIComponent(name)}`}
      className="group relative block w-[74vw] sm:w-[280px] lg:w-[320px] shrink-0 snap-start overflow-hidden rounded-xl border border-[#272A38] bg-[#14161F] hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12]"
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="w-full aspect-[3/4] h-full object-cover brightness-[0.82] group-hover:scale-[1.03] group-hover:brightness-95 transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12] via-[#0C0D12]/35 to-transparent" />

      {shows && (
        <span className="absolute top-4 right-4 rounded-md bg-[#0C0D12]/90 border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {shows}
        </span>
      )}

      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D4D4D8] m-0">
          {genre}
        </p>
        <h3 className="mt-1.5 text-xl font-bold leading-snug tracking-tight text-white mb-0">
          {name}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
          <span>Lihat Konser</span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </span>
      </div>
    </a>
  );
};

const ArtistRail: React.FC<{ events: EventItem[] }> = ({ events }) => {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const artistItems = useMemo(() => {
    if (events.length === 0) {
      return ARTISTS_LINEUP.slice(0, 4).map((a) => ({
        name: a.name,
        genre: a.genre,
        image: a.image,
        shows: undefined as string | undefined,
      }));
    }

    const grouped = new Map<string, { name: string; genre: string; image: string; count: number }>();
    for (const evt of events) {
      const artistName = (evt.artist || '').trim();
      if (!artistName) continue;
      const existing = grouped.get(artistName);
      if (existing) {
        existing.count += 1;
      } else {
        grouped.set(artistName, {
          name: artistName,
          genre: evt.category || 'Simfoni',
          image: evt.image,
          count: 1,
        });
      }
    }

    return Array.from(grouped.values()).map((item) => ({
      name: item.name,
      genre: item.genre,
      image: item.image,
      shows: `${item.count} Jadwal Konser`,
    }));
  }, [events]);

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Geser artis ke kiri"
          className="h-11 w-11 rounded-lg border border-[#3E4357] bg-[#14161F] text-white flex items-center justify-center hover:bg-white hover:text-[#0C0D12] hover:border-white transition-colors"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Geser artis ke kanan"
          className="h-11 w-11 rounded-lg border border-[#3E4357] bg-[#14161F] text-white flex items-center justify-center hover:bg-white hover:text-[#0C0D12] hover:border-white transition-colors"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div
        ref={railRef}
        className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 sm:-mx-8 md:-mx-12 px-4 sm:px-8 md:px-12 pb-2"
      >
        {artistItems.map((artist) => (
          <ArtistCard
            key={artist.name}
            image={artist.image}
            name={artist.name}
            genre={artist.genre}
            shows={artist.shows}
          />
        ))}
      </div>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="flex flex-col h-full rounded-xl border border-[#272A38] bg-[#14161F] overflow-hidden animate-pulse">
    <div className="aspect-[16/9] w-full bg-[#1D202D]" />
    <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-[#272A38] rounded" />
          <div className="h-3 w-16 bg-[#272A38] rounded" />
        </div>
        <div className="h-5 w-4/5 bg-[#272A38] rounded" />
        <div className="h-3.5 w-1/2 bg-[#272A38] rounded" />
      </div>
      <div className="pt-4 border-t border-[#272A38] flex items-center justify-between">
        <div className="h-6 w-24 bg-[#272A38] rounded" />
        <div className="h-10 w-28 bg-[#272A38] rounded-lg" />
      </div>
    </div>
  </div>
);

const TrendingConcertCard: React.FC<{
  event: EventItem;
  onBuyTicket: (event: EventItem) => void;
}> = ({ event, onBuyTicket }) => {
  const minPrice = getLowestPrice(event);
  const totalRemaining = getTotalRemaining(event);
  const badge = getQuotaBadge(event, totalRemaining);

  return (
    <article className="group flex flex-col h-full rounded-xl border border-[#272A38] bg-[#14161F] overflow-hidden transition-colors duration-200 hover:border-white/40">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#1D202D]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
            badge.isSoldOut ? 'grayscale brightness-75' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14161F] via-[#14161F]/25 to-transparent" />

        <span className="absolute top-3 left-3 rounded-md bg-[#0C0D12]/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border border-white/25">
          {event.category || 'Simfoni'}
        </span>

        <span className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${badge.className}`}>
          {badge.label}
        </span>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#E4E4E7]">
          <span className="flex items-center gap-1.5 rounded-md bg-[#0C0D12]/90 px-2.5 py-1 border border-white/10">
            <Calendar size={13} className="text-[#E4E4E7] shrink-0" aria-hidden="true" />
            <span className="font-medium text-white">{event.date}</span>
          </span>
          <span className="rounded-md bg-[#0C0D12]/90 px-2.5 py-1 text-[11px] text-[#E4E4E7] border border-white/10">
            {event.time}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 justify-between">
        <div>
          <a
            href={`/concert/${event.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          >
            <h3 className="text-lg font-bold leading-snug text-white line-clamp-1 group-hover:underline underline-offset-4">
              {event.title}
            </h3>
          </a>

          <p className="mt-1 text-xs text-[#A1A1AA] line-clamp-1">
            {event.conductor && event.conductor !== '-' ? `${event.artist} · ${event.conductor}` : event.artist}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#A1A1AA]">
            <MapPin size={14} className="text-[#A1A1AA] shrink-0" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#272A38] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#A1A1AA] m-0">
              Mulai dari
            </p>
            <p className="text-base sm:text-lg font-bold text-white truncate tabular-nums m-0 mt-0.5">
              {formatIDR(minPrice)}
            </p>
          </div>

          {badge.isSoldOut ? (
            <button
              type="button"
              disabled
              className="min-h-[44px] px-4 py-2 rounded-lg bg-[#1D202D] text-[#A1A1AA] text-xs sm:text-sm font-semibold border border-[#3E4357]"
            >
              {event.isClosed ? 'Penjualan Tutup' : 'Tiket Habis'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onBuyTicket(event)}
              className="min-h-[44px] px-4 py-2 rounded-lg bg-white text-[#0C0D12] text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Pesan Tiket
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const getPopularityMetrics = (event: EventItem) => {
  const categories = event.categories || [];
  const totalQuota = categories.reduce((sum, cat) => sum + (Number(cat.quota) || 0), 0);
  const totalRemaining = getTotalRemaining(event);
  const ticketsSold = Math.max(0, totalQuota - totalRemaining);
  const remainingRatio = totalQuota > 0 ? totalRemaining / totalQuota : 1;
  return {
    isClosed: event.isClosed ? 1 : 0,
    remainingRatio,
    ticketsSold,
  };
};

export const BentoSection: React.FC<SectionProps> = ({
  events = [],
  onBuyTicket,
  isLoading = false,
  error = null,
}) => {
  const trending = useMemo(() => {
    return [...events]
      .sort((a, b) => {
        const pa = getPopularityMetrics(a);
        const pb = getPopularityMetrics(b);
        if (pa.isClosed !== pb.isClosed) return pa.isClosed - pb.isClosed;
        if (pa.remainingRatio !== pb.remainingRatio) return pa.remainingRatio - pb.remainingRatio;
        return pb.ticketsSold - pa.ticketsSold;
      })
      .slice(0, 6);
  }, [events]);

  return (
    <div className="bg-[#0C0D12] text-[#F4F4F6]">
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 pt-14 sm:pt-20">
        <SectionHeading
          eyebrow="Jelajahi Artis"
          title="Orkestra & Ansambel Musim Ini"
          support="Dari orkestra simfoni hingga kelompok ansambel kamar, kenali penampil yang siap menghidupkan panggung SymphoniaTic."
          actionLabel="Semua Artis"
          actionHref="/events"
        />
        <ArtistRail events={events} />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12 py-14 sm:py-20">
        <SectionHeading
          eyebrow="Sedang Ramai"
          title="Jadwal Paling Diminati"
          support="Pertunjukan dengan reservasi tertinggi musim ini. Pesan kursi Anda sebelum kuota tiket habis."
          actionLabel="Lihat Semua"
          actionHref="/events"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error && events.length === 0 ? (
          <div role="alert" className="rounded-xl border border-rose-500/40 bg-[#14161F] p-8 text-center">
            <p className="text-sm font-medium text-rose-300 m-0">
              {error}
            </p>
            <p className="mt-1.5 text-xs text-[#A1A1AA] m-0">
              Pastikan layanan backend API sedang berjalan.
            </p>
          </div>
        ) : trending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#3E4357] bg-[#14161F] px-6 py-16 text-center">
            <p className="text-sm text-[#A1A1AA] m-0">
              Belum ada jadwal pertunjukan pada kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((event) => (
              <TrendingConcertCard key={event.id} event={event} onBuyTicket={onBuyTicket} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
