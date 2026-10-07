import React, { useRef } from 'react';
import { Heart, ArrowUpRight, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { CONCERT_EVENTS, ARTISTS_LINEUP, formatIDR } from './data';
import type { EventItem } from './data';
import { SectionHeading } from './SectionHeading';

interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
}

const goToConcert = (event: EventItem) => {
  window.location.href = `/concert/${event.id}`;
};

export const getMinPrice = (event: EventItem) => event.categories?.[0]?.price ?? 0;

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

const ArtistCard: React.FC<{ image: string; name: string; genre: string; shows: string }> = ({
  image,
  name,
  genre,
  shows,
}) => {
  return (
    <a
      href="/events"
      className="group relative block w-[74vw] sm:w-[280px] lg:w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#F1F5F9] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      <img
        src={image}
        alt={name}
        className="w-full aspect-[3/4] h-full object-cover brightness-[0.88] group-hover:scale-[1.05] group-hover:brightness-100 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <span className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
        {shows}
      </span>

      <div className="absolute bottom-5 left-5 right-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
          {genre}
        </p>
        <h3 className="mt-1.5 text-xl font-bold leading-snug tracking-tight text-white">
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
          aria-label="Geser artist ke kiri"
          className="h-11 w-11 rounded-full bg-[#F8FAFC] text-ink flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Geser artist ke kanan"
          className="h-11 w-11 rounded-full bg-[#F8FAFC] text-ink flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
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

type BadgeTone = 'accent' | 'navy' | 'muted';

interface TrendBadge {
  label: string;
  tone: BadgeTone;
}

const getTrendBadge = (event: EventItem, index: number): TrendBadge => {
  const total = event.categories?.reduce((sum, c) => sum + (c.quota ?? 0), 0) ?? 0;
  const remaining = event.categories?.reduce((sum, c) => sum + (c.remainingQuota ?? c.quota ?? 0), 0) ?? 0;

  if (event.isClosed) return { label: 'TIKET TUTUP', tone: 'muted' };

  if (total > 0 && remaining < total) {
    const ratio = remaining / total;
    if (ratio <= 0.15) return { label: 'HAMPIR HABIS', tone: 'accent' };
    if (ratio <= 0.45) return { label: 'TIKET TERBATAS', tone: 'accent' };
  }

  return { label: 'TRENDING', tone: index === 1 ? 'navy' : 'accent' };
};

const BADGE_TONE: Record<BadgeTone, string> = {
  accent: 'bg-brand-accent text-white',
  navy: 'bg-[#183B56] text-white',
  muted: 'bg-[#183B56]/85 text-white',
};

const TrendingConcertCard: React.FC<{ event: EventItem; index: number }> = ({ event, index }) => {
  const minPrice = getMinPrice(event);
  const { day, month } = parseDate(event.date);
  const badge = getTrendBadge(event, index);
  const dateLabel = day && month ? `${day} ${month} ${new Date().getFullYear()}` : event.date;

  return (
    <article
      onClick={() => goToConcert(event)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-accent/45 hover:shadow-[0_24px_48px_-28px_rgba(24,59,86,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F1F5F9]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05] ${
            event.isClosed ? 'grayscale' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm transition-colors duration-300 ${BADGE_TONE[badge.tone]}`}
        >
          {badge.label}
        </span>

        <button
          aria-label="Simpan ke favorit"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#183B56] shadow-sm transition-all duration-300 hover:bg-brand-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          <Heart size={15} />
        </button>

        <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#183B56] shadow-sm">
          {dateLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {event.category && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">
            {event.category}
          </p>
        )}

        <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-ink line-clamp-2">
          {event.title}
        </h3>

        <p className="mt-1.5 text-sm text-[#64748B] line-clamp-1">
          {event.artist}
        </p>

        <div className="mt-4 space-y-2 text-xs text-[#64748B]">
          <p className="flex items-center gap-2">
            <Calendar size={13} className="shrink-0 text-brand-accent" />
            <span className="truncate">{event.time}</span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={13} className="shrink-0 text-brand-accent" />
            <span className="truncate">{event.venue}</span>
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
              Mulai dari
            </p>
            <p className="truncate text-lg font-bold text-ink">
              {event.isClosed ? 'Tutup' : formatIDR(minPrice)}
            </p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#183B56] text-white transition-all duration-300 ease-out group-hover:bg-brand-accent group-hover:rotate-45">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </article>
  );
};

export const BentoSection: React.FC<SectionProps> = ({ events }) => {
  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  const trending = sourceEvents.slice(0, 4);

  return (
    <div className="bg-canvas text-ink">
      <section className="mx-auto max-w-[1440px] px-6 sm:px-8 md:px-12 pt-20 sm:pt-24 lg:pt-28">
        <SectionHeading
          eyebrow="Jelajahi Artis"
          title="Orkestra & Ensemble Musim Ini"
          support="Dari orkestra simfoni kelas dunia hingga chamber ensemble — kenali penampil yang siap menghidupkan panggung SymphoniaTic."
          actionLabel="Semua Artis"
          actionHref="/events"
        />
        <ArtistRail />
      </section>

      <section className="mx-auto max-w-[1440px] px-6 sm:px-8 md:px-12 py-20 sm:py-24 lg:py-28">
        <SectionHeading
          eyebrow="Sedang Ramai"
          title="Yang Lagi Ramai"
          support="Konser yang paling banyak diminati dan tiketnya mulai terbatas."
          actionLabel="Lihat Semua"
          actionHref="/events"
        />

        {trending.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {trending.map((event, index) => (
              <TrendingConcertCard key={event.id} event={event} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-6 py-16 text-center">
            <p className="text-sm text-[#64748B]">Belum ada konser yang sedang ramai saat ini.</p>
          </div>
        )}
      </section>
    </div>
  );
};