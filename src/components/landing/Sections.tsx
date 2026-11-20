import React, { useMemo, useState } from 'react';
import { ArrowUpRight, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatIDR } from './data';
import type { EventItem } from './data';
import { SectionHeading } from './SectionHeading';
import { getFallbackPoster, getLowestPrice, getTotalRemaining } from './ConcertCard';
import { parseDateFlexible } from '@/lib/timeUtils';

export interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
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

const StaggeredImage: React.FC<{ src: string; alt: string; id: string | number; unavailable: boolean }> = ({
  src,
  alt,
  id,
  unavailable,
}) => {
  const fallback = getFallbackPoster(id);
  const [imgSrc, setImgSrc] = useState(src || fallback);
  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
      className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
        unavailable ? 'grayscale brightness-75' : ''
      }`}
    />
  );
};

const StaggeredSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
    {[0, 1].map((idx) => (
      <div
        key={idx}
        className={`animate-pulse ${idx === 1 ? 'md:mt-12' : ''}`}
      >
        <div className="aspect-[16/10] w-full rounded-xl bg-[#ECE8DF]" />
        <div className="mt-5 space-y-3">
          <div className="h-5 w-1/3 rounded bg-[#ECE8DF]" />
          <div className="h-7 w-3/4 rounded bg-[#ECE8DF]" />
          <div className="h-12 w-full rounded bg-[#ECE8DF]" />
          <div className="h-11 w-40 rounded-lg bg-[#ECE8DF]" />
        </div>
      </div>
    ))}
  </div>
);

export const BentoSection: React.FC<SectionProps> = ({
  events = [],
  onBuyTicket,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const featuredPair = useMemo(() => events.slice(0, 2), [events]);

  return (
    <div className="bg-[#F6F4EE] text-[#171614]">
      <section className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 py-12 sm:py-16">
        <SectionHeading
          eyebrow="Kurasi Musim Ini"
          title="Orkestra & Pertunjukan Pilihan"
          support="Kenali jajaran orkestra, konduktor, dan repertoar pilihan yang akan tampil sepanjang musim konser."
          actionLabel="Semua Konser"
          actionHref="/events"
        />

        {isLoading ? (
          <StaggeredSkeleton />
        ) : error && events.length === 0 ? (
          <div role="alert" className="rounded-xl border border-[#B91C1C]/30 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-[#B91C1C] m-0">{error}</p>
            <p className="mt-1.5 text-xs text-[#5C5850] m-0">
              Pastikan koneksi ke server backend tersedia lalu coba muat ulang.
            </p>
            {onRetry && (
              <Button type="button" onClick={onRetry} className="mt-4">
                Muat Ulang Jadwal
              </Button>
            )}
          </div>
        ) : featuredPair.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#CFC9BC] bg-white px-6 py-16 text-center">
            <p className="text-sm text-[#5C5850] m-0">
              Belum ada jadwal pertunjukan yang tersedia saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
            {featuredPair.map((event, idx) => {
              const minPrice = getLowestPrice(event);
              const remaining = getTotalRemaining(event);
              const isUnavailable = !!event.isClosed || remaining <= 0;

              return (
                <article
                  key={event.id}
                  className={`group flex flex-col ${idx === 1 ? 'md:mt-12' : ''}`}
                >
                  <a
                    href={`/concert/${event.id}`}
                    className="block relative aspect-[16/10] overflow-hidden rounded-xl border border-[#E4DFD3] bg-[#11100E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE]"
                  >
                    <StaggeredImage
                      src={event.image}
                      alt={event.title}
                      id={event.id}
                      unavailable={isUnavailable}
                    />
                    <span className="absolute top-4 left-4 rounded-md bg-[#11100E]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      {event.category || 'Simfoni'}
                    </span>
                  </a>

                  <div className="mt-5 flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C93018] m-0">
                      {event.artist}
                    </p>

                    <a
                      href={`/concert/${event.id}`}
                      className="mt-2 block w-fit rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
                    >
                      <h3 className="font-display text-2xl sm:text-3xl font-semibold leading-tight text-[#171614] group-hover:text-[#C93018] transition-colors m-0">
                        {event.title}
                      </h3>
                    </a>

                    <p className="mt-2 text-sm text-[#5C5850] leading-relaxed line-clamp-2 m-0">
                      {event.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#5C5850] tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#C93018] shrink-0" aria-hidden="true" />
                        <span>{event.date} · {event.time}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#6B665D] shrink-0" aria-hidden="true" />
                        <span>{event.venue}</span>
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
                      <Button asChild variant="outline">
                        <a href={`/concert/${event.id}`}>
                          <span>Lihat Detail</span>
                          <ArrowUpRight size={15} aria-hidden="true" />
                        </a>
                      </Button>

                      {!isUnavailable && (
                        <Button type="button" onClick={() => onBuyTicket(event)}>
                          Pesan · {formatIDR(minPrice)}
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-y border-[#E4DFD3] bg-[#ECE8DF]">
        <div className="mx-auto max-w-[1060px] px-5 sm:px-8 py-14 sm:py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C93018] m-0">
            Pengalaman Gedung Konser
          </p>
          <h2 className="mt-4 font-display text-[clamp(28px,4vw,46px)] leading-[1.15] tracking-[-0.02em] font-semibold text-[#171614] m-0">
            Mempertemukan Orkestra Simfoni, Solois Piano, dan Ansambel Kamar dalam Satu Musim Pertunjukan Resmi
          </h2>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="outline" className="bg-[#F6F4EE]">
              <a href="/edukasi">
                <span>Panduan Etiket Konser</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
