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
      className={`h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] ${
        unavailable ? 'grayscale brightness-75' : ''
      }`}
    />
  );
};

const StaggeredSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
    {[0, 1].map((idx) => (
      <div key={idx} className="bg-white p-6 animate-pulse">
        <div className="aspect-[16/10] w-full bg-[#EAE8E1]" />
        <div className="mt-5 space-y-3">
          <div className="h-4 w-1/3 bg-[#EAE8E1]" />
          <div className="h-8 w-3/4 bg-[#EAE8E1]" />
          <div className="h-12 w-full bg-[#EAE8E1]" />
          <div className="h-11 w-40 bg-[#EAE8E1]" />
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
    <div className="bg-[#F4F3EF] text-[#141413]">
      <section id="kurasi" className="scroll-mt-20 border-b border-[#DFDDD6]">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
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
            <div role="alert" className="border border-[#C81E1E]/35 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-[#C81E1E] m-0">{error}</p>
              <p className="mt-1.5 text-xs text-[#52514D] m-0">
                Pastikan koneksi ke server backend tersedia lalu coba muat ulang.
              </p>
              {onRetry && (
                <Button type="button" onClick={onRetry} className="mt-4">
                  Muat Ulang Jadwal
                </Button>
              )}
            </div>
          ) : featuredPair.length === 0 ? (
            <div className="border border-dashed border-[#DFDDD6] bg-white px-6 py-16 text-center">
              <p className="text-sm text-[#52514D] m-0">
                Belum ada jadwal pertunjukan yang tersedia saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
              {featuredPair.map((event, idx) => {
                const minPrice = getLowestPrice(event);
                const remaining = getTotalRemaining(event);
                const isUnavailable = !!event.isClosed || remaining <= 0;
                const isHighlight = idx === 0;

                return (
                  <article
                    key={event.id}
                    className={`group flex flex-col justify-between p-5 sm:p-8 ${
                      isHighlight ? 'bg-white' : 'bg-[#F9F8F5]'
                    }`}
                  >
                    <div>
                      <a
                        href={`/concert/${event.id}`}
                        className="block relative aspect-[16/10] overflow-hidden bg-[#141413] chamfer-br focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                      >
                        <StaggeredImage
                          src={event.image}
                          alt={event.title}
                          id={event.id}
                          unavailable={isUnavailable}
                        />
                        <span className="absolute top-3 left-3 bg-[#141413] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F4F3EF]">
                          {event.category || 'Simfoni'}
                        </span>
                        {isHighlight && (
                          <span className="absolute top-3 right-3 bg-[#D4FF2A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#141413]">
                            Sorotan Utama
                          </span>
                        )}
                      </a>

                      <div className="mt-6">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#52514D] m-0">
                          • {event.artist}
                        </p>

                        <a
                          href={`/concert/${event.id}`}
                          className="mt-2 block w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                        >
                          <h3 className="font-display text-2xl sm:text-3xl font-extrabold leading-[1.02] tracking-[-0.035em] text-[#141413] group-hover:underline decoration-2 underline-offset-4 m-0">
                            {event.title}
                          </h3>
                        </a>

                        <p className="mt-3 text-sm text-[#52514D] leading-relaxed line-clamp-2 m-0">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[#DFDDD6]">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#52514D] tabular-nums mb-4">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#141413] shrink-0" aria-hidden="true" />
                          <span>{event.date} · {event.time}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#52514D] shrink-0" aria-hidden="true" />
                          <span>{event.venue}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
                        <Button asChild variant="outline">
                          <a href={`/concert/${event.id}`}>
                            <span>Lihat Detail</span>
                            <ArrowUpRight size={15} aria-hidden="true" />
                          </a>
                        </Button>

                        {!isUnavailable && (
                          <Button type="button" variant="lime" onClick={() => onBuyTicket(event)}>
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
        </div>
      </section>

      {/* Dark Stage Editorial Interlude matching reference polarity alternation */}
      <section className="bg-[#141413] text-[#F4F3EF] border-b border-white/15">
        <div className="mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4FF2A] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#D4FF2A]" aria-hidden="true" />
                <span>Pengalaman Gedung Konser</span>
              </p>
              <p className="mt-3 text-xs text-[#B8B6AE] leading-relaxed max-w-xs m-0">
                Panduan etiket berpakaian, waktu kedatangan pintu aula, dan glosarium musik klasik bagi penonton baru maupun penikmat lama.
              </p>
            </div>

            <div className="lg:col-span-8">
              <h2 className="font-display text-[clamp(28px,4.2vw,52px)] leading-[1.02] tracking-[-0.04em] font-extrabold text-[#F4F3EF] m-0">
                Mempertemukan orkestra simfoni, solois piano, dan ansambel kamar dalam{' '}
                <span className="bg-[#D4FF2A] text-[#141413] px-2 py-0.5 inline-block">
                  satu musim resmi.
                </span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/edukasi"
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-none bg-[#D4FF2A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#C2EE1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
                >
                  <span>Panduan Etiket Konser</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
                <a
                  href="/redeem"
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-none border border-white/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F4F3EF] hover:border-[#D4FF2A] hover:text-[#D4FF2A] transition-colors"
                >
                  <span>Cek E-Ticket</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
