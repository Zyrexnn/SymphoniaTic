import React, { useRef } from 'react';
import { ArrowUpRight, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ARTISTS_LINEUP, formatIDR } from './data';
import type { EventItem } from './data';
import { SectionHeading } from './SectionHeading';

export interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

export const parseDate = (date?: string) => {
  if (!date) return { day: '', month: '', year: '', weekday: '' };
  let day = '';
  let month = '';
  let year = '';
  let weekday = '';

  const weekdayMatch = date.match(/^([A-Za-z]+),/);
  if (weekdayMatch) weekday = weekdayMatch[1];

  const long = date.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (long) {
    day = long[1];
    month = long[2].slice(0, 3).toUpperCase();
    year = long[3];
    return { day, month, year, weekday };
  }

  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    year = iso[1];
    month = MONTHS[parseInt(iso[2], 10) - 1] || '';
    day = iso[3];
  }
  return { day, month, year, weekday };
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
      className: 'bg-[#272A38]/90 text-[#94A3B8] border border-[#3A3F55]',
      isSoldOut: true,
    };
  }
  if (remaining <= 0) {
    return {
      label: 'Tiket Habis',
      className: 'bg-[#272A38]/90 text-[#94A3B8] border border-[#3A3F55]',
      isSoldOut: true,
    };
  }
  if (remaining <= 15) {
    return {
      label: `Tersisa ${remaining} Kursi`,
      className: 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50',
      isSoldOut: false,
    };
  }
  return {
    label: `Tersisa ${remaining} Kursi`,
    className: 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30',
    isSoldOut: false,
  };
};

const ArtistCard: React.FC<{ image: string; name: string; genre: string; shows: string }> = ({
  image,
  name,
  genre,
  shows,
}) => {
  return (
    <a
      href="/events"
      className="group relative block w-[74vw] sm:w-[280px] lg:w-[320px] shrink-0 snap-start overflow-hidden rounded-xl border border-[#272A38] bg-[#14161F] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12]"
    >
      <img
        src={image}
        alt={name}
        className="w-full aspect-[3/4] h-full object-cover brightness-[0.85] group-hover:scale-[1.05] group-hover:brightness-100 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12]/90 via-[#0C0D12]/20 to-transparent" />

      <span className="absolute top-4 right-4 rounded-md bg-[#0C0D12]/80 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {shows}
      </span>

      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
          {genre}
        </p>
        <h3 className="mt-1.5 text-xl font-bold leading-snug tracking-tight text-[#F4F4F6]">
          {name}
        </h3>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          Lihat Konser
          <ArrowUpRight size={15} />
        </span>
      </div>
    </a>
  );
};

const ArtistRail: React.FC = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-end gap-2">
        <button
          onClick={() => scroll(-1)}
          aria-label="Geser artis ke kiri"
          className="h-10 w-10 rounded-lg border border-[#272A38] bg-[#14161F] text-[#F4F4F6] flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Geser artis ke kanan"
          className="h-10 w-10 rounded-lg border border-[#272A38] bg-[#14161F] text-[#F4F4F6] flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        ref={railRef}
        className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 sm:-mx-8 md:-mx-12 px-6 sm:px-8 md:px-12 pb-2"
      >
        {ARTISTS_LINEUP.slice(0, 4).map((artist) => (
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
        <div className="h-9 w-28 bg-[#272A38] rounded-lg" />
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
    <article
      className="group flex flex-col h-full rounded-xl border border-[#272A38] bg-[#14161F] overflow-hidden transition-all duration-300 hover:border-white/40 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#1D202D]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            badge.isSoldOut ? 'grayscale brightness-75' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14161F] via-[#14161F]/20 to-transparent" />

        <span className="absolute top-3 left-3 rounded-md bg-[#0C0D12]/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border border-white/20 backdrop-blur-sm">
          {event.category || 'Simfoni'}
        </span>

        <span
          className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${badge.className}`}
        >
          {badge.label}
        </span>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1.5 rounded-md bg-[#0C0D12]/75 px-2 py-1 backdrop-blur-sm">
            <Calendar size={13} className="text-[#A1A1AA] shrink-0" />
            <span className="font-medium text-[#F4F4F6]">{event.date}</span>
          </span>
          <span className="rounded-md bg-[#0C0D12]/75 px-2 py-1 text-[11px] text-[#94A3B8] backdrop-blur-sm">
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
            <h3 className="text-lg font-bold leading-snug text-[#F4F4F6] line-clamp-1 group-hover:text-white transition-colors">
              {event.title}
            </h3>
          </a>

          <p className="mt-1 text-xs text-[#94A3B8] line-clamp-1">
            {event.conductor && event.conductor !== '-' ? `${event.artist} • ${event.conductor}` : event.artist}
          </p>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#64748B]">
            <MapPin size={13} className="text-[#94A3B8] shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#272A38] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Mulai dari
            </p>
            <p className="text-base sm:text-lg font-bold text-[#F4F4F6] truncate tabular-nums">
              {formatIDR(minPrice)}
            </p>
          </div>

          {badge.isSoldOut ? (
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-[#272A38] text-[#64748B] text-xs sm:text-sm font-semibold cursor-not-allowed border border-[#3A3F55]"
            >
              {event.isClosed ? 'Penjualan Tutup' : 'Tiket Habis'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onBuyTicket(event)}
              className="px-4 py-2 rounded-lg bg-white text-[#0C0D12] text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Pesan Tiket
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const BentoSection: React.FC<SectionProps> = ({
  events = [],
  onBuyTicket,
  isLoading = false,
  error = null,
}) => {
  const trending = events.slice(0, 6);

  return (
    <div className="bg-[#0C0D12] text-[#F4F4F6]">
      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 pt-16 sm:pt-20">
        <SectionHeading
          eyebrow="Jelajahi Artis"
          title="Orkestra & Ansambel Musim Ini"
          support="Dari orkestra simfoni kelas dunia hingga kelompok ansambel kamar, kenali penampil yang siap menghidupkan panggung SymphoniaTic."
          actionLabel="Semua Artis"
          actionHref="/events"
        />
        <ArtistRail />
      </section>

      <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12 py-16 sm:py-20">
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
          <div className="rounded-xl border border-[#EF4444]/30 bg-[#14161F] p-8 text-center">
            <p className="text-sm font-medium text-[#EF4444]">
              {error}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Pastikan layanan backend API sedang berjalan di port 8082.
            </p>
          </div>
        ) : trending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#272A38] bg-[#14161F] px-6 py-16 text-center">
            <p className="text-sm text-[#94A3B8]">
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
