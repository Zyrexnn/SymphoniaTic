import React, { useRef } from 'react';
import { Heart, ArrowUpRight, MapPin, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { CONCERT_EVENTS, ARTISTS_LINEUP, formatIDR } from './data';
import type { EventItem } from './data';

interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
}

const goToConcert = (event: EventItem) => {
  window.location.href = `/concert/${event.id}`;
};

export const getMinPrice = (event: EventItem) => event.categories?.[0]?.price ?? 0;

export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

/* Parse date string like "Sabtu, 18 April 2026" or "2026-04-18" â†’ { day, month, year } */
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

/* â”€â”€ Reusable editorial section header â”€â”€ */
const SectionHeading: React.FC<{
  eyebrow: string;
  title: string;
  support: string;
  actionLabel: string;
  actionHref: string;
}> = ({ eyebrow, title, support, actionLabel, actionHref }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-accent">
          <span className="h-px w-9 bg-brand-accent" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.03em] leading-[1.08] text-ink">
          {title}
        </h2>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#64748B] max-w-xl">
          {support}
        </p>
      </div>
      <a
        href={actionHref}
        className="group/btn inline-flex items-center gap-2 rounded-full bg-[#183B56] text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-accent transition-colors shrink-0"
      >
        {actionLabel}
        <ArrowUpRight
          size={16}
          className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
        />
      </a>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â• ARTIST DISCOVERY â€” horizontal portrait rail â•â•â•â•â•â•â•â•â•â•â• */

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

/* â•â•â•â•â•â•â•â•â•â•â• UPCOMING CONCERTS â€” editorial discovery â•â•â•â•â•â•â•â•â•â•â• */

/* Ticket-stub date badge */
const DateBlock: React.FC<{ event: EventItem; size?: 'sm' | 'lg' }> = ({ event, size = 'sm' }) => {
  const { day, month, year } = parseDate(event.date);
  return (
    <div
      className={`rounded-xl bg-white text-ink text-center shadow-[0_8px_24px_-8px_rgba(24,59,86,0.2)] ${
        size === 'lg' ? 'px-4 py-3' : 'px-2.5 py-1.5'
      }`}
    >
      <div className={`font-black tracking-[0.18em] text-brand-accent ${size === 'lg' ? 'text-[10px]' : 'text-[8px]'}`}>
        {month || 'KONSER'}
      </div>
      <div className={`font-black leading-none text-ink ${size === 'lg' ? 'text-3xl' : 'text-sm'}`}>
        {day || 'â€”'}
      </div>
      <div className={`font-semibold text-[#94A3B8] ${size === 'lg' ? 'text-[10px] mt-0.5' : 'text-[8px]'}`}>
        {year || ''}
      </div>
    </div>
  );
};

/* Featured editorial card â€” artwork as hero */
const FeaturedConcert: React.FC<{ event: EventItem }> = ({ event }) => {
  const minPrice = getMinPrice(event);

  return (
    <div
      onClick={() => goToConcert(event)}
      className="group relative overflow-hidden rounded-2xl bg-[#183B56] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      <div className="relative h-[440px] sm:h-[500px] lg:h-[560px] overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover brightness-[0.82] group-hover:scale-[1.04] group-hover:brightness-100 transition-all duration-[900ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </div>

      {/* Top row */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 right-4 sm:right-6 z-10 flex items-start justify-between gap-3">
        <DateBlock event={event} size="lg" />
        <button
          aria-label="Simpan ke favorit"
          onClick={(e) => e.stopPropagation()}
          className="h-10 w-10 rounded-full bg-white/90 text-black flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors cursor-pointer"
        >
          <Heart size={16} />
        </button>
      </div>

      {/* Bottom: minimal overlay â€” let artwork speak */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-white/70">
          <span>{event.category || 'Konser'}</span>
          <span className="opacity-50" aria-hidden>Â·</span>
          <span>{event.venue}</span>
          <span className="opacity-50" aria-hidden>Â·</span>
          <span className="normal-case tracking-normal">{event.time}</span>
        </div>

        <h3 className="mt-3 text-2xl sm:text-4xl lg:text-[44px] font-bold tracking-[-0.03em] leading-[1.05] text-white max-w-3xl line-clamp-2">
          {event.title}
        </h3>
        <p className="mt-2 text-sm sm:text-base text-white/75 line-clamp-1 max-w-2xl">
          {event.artist}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-t border-white/15 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              Mulai dari
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {event.isClosed ? 'Tiket Tutup' : formatIDR(minPrice)}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-3 text-sm font-semibold text-white hover:bg-brand-accent-hover transition-colors">
            Detail Konser & Tiket
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </div>
  );
};

/* Borderless soft-surface event card */
const ConcertEventCard: React.FC<{ event: EventItem }> = ({ event }) => {
  const minPrice = getMinPrice(event);
  const { day, month } = parseDate(event.date);

  return (
    <div
      onClick={() => goToConcert(event)}
      className="group rounded-2xl bg-[#F8FAFC] overflow-hidden cursor-pointer hover:shadow-[0_20px_50px_-24px_rgba(17,17,17,0.35)] hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F1F5F9]">
        <img
          src={event.image}
          alt={event.title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] ${
            event.isClosed ? 'grayscale' : 'brightness-[0.98]'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {event.isClosed && (
          <div className="absolute inset-0 bg-[#183B56]/55 flex items-center justify-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black">
              Tutup
            </span>
          </div>
        )}

        <span className="absolute top-3 left-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-black shadow-sm">
          {day && month ? `${day} ${month}` : event.date}
        </span>

        <button
          aria-label="Simpan ke favorit"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 text-black flex items-center justify-center hover:bg-brand-accent hover:text-white transition-colors cursor-pointer"
        >
          <Heart size={14} />
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {event.category && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">
            {event.category}
          </p>
        )}
        <h4 className="mt-1.5 text-lg sm:text-xl font-bold leading-snug tracking-tight text-ink line-clamp-2">
          {event.title}
        </h4>
        <p className="mt-1.5 text-sm text-[#64748B] line-clamp-1">
          {event.artist}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-[#64748B]">
          <Calendar size={13} className="text-brand-accent shrink-0" />
          <span>{event.time}</span>
          <span className="opacity-40" aria-hidden>Â·</span>
          <span className="inline-flex items-center gap-1 min-w-0">
            <MapPin size={13} className="text-brand-accent shrink-0" />
            <span className="truncate">{event.venue}</span>
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
              Mulai dari
            </p>
            <p className="text-lg font-bold text-ink">
              {event.isClosed ? 'Tutup' : formatIDR(minPrice)}
            </p>
          </div>
          <span className="h-11 w-11 rounded-full bg-[#183B56] text-white flex items-center justify-center group-hover:bg-brand-accent transition-colors duration-300">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </div>
  );
};



export const BentoSection: React.FC<SectionProps> = ({ events }) => {
  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  const featured = sourceEvents[0];
  const rest = sourceEvents.slice(1);

  return (
    <div className="bg-canvas text-ink">
      
      <section className="mx-auto max-w-[1440px] px-6 sm:px-8 md:px-12 pt-20 sm:pt-24 lg:pt-28">
        <SectionHeading
          eyebrow="Jelajahi Artis"
          title="Orkestra & Ensemble Musim Ini"
          support="Dari orkestra simfoni kelas dunia hingga chamber ensemble â€” kenali penampil yang siap menghidupkan panggung SymphoniaTic."
          actionLabel="Semua Artis"
          actionHref="/events"
        />
        <ArtistRail />
      </section>


      <section className="mx-auto max-w-[1440px] px-6 sm:px-8 md:px-12 py-20 sm:py-24 lg:py-28">
        <SectionHeading
          eyebrow="Jadwal Konser"
          title="Konser Mendatang"
          support="Pilih konser favoritmu, cek detail line-up dan jadwal, lalu amankan tiketmu sebelum sold out."
          actionLabel="Lihat Semua"
          actionHref="/events"
        />

        {featured && (
          <div className="mb-6 md:mb-8">
            <FeaturedConcert event={featured} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {rest.map((event) => (
              <ConcertEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};