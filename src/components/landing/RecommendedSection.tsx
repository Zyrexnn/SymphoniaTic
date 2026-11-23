import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, ArrowUpRight, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ConcertCard,
  getFallbackPoster,
  getLowestPrice,
  getTotalRemaining,
  getQuotaStatus,
} from './ConcertCard';
import type { EventItem } from './data';
import { formatIDR } from './data';
import { parseDate } from './Sections';
import { SectionHeading } from './SectionHeading';

export interface RecommendedProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const TABS = ['Semua', 'Simfoni', 'Kamar Musik', 'Resital Piano', 'Opera'] as const;
type FilterTab = (typeof TABS)[number];

const matchesCategory = (category: string, tab: FilterTab): boolean => {
  if (tab === 'Semua') return true;
  const c = (category || '').toLowerCase();
  switch (tab) {
    case 'Simfoni':
      return c.includes('simfoni') || c.includes('symphony') || c.includes('orchestra');
    case 'Kamar Musik':
      return c.includes('kamar') || c.includes('chamber');
    case 'Resital Piano':
      return c.includes('piano') || c.includes('resital') || c.includes('recital');
    case 'Opera':
      return c.includes('opera') || c.includes('balet');
    default:
      return true;
  }
};

const SkeletonCard: React.FC = () => (
  <div className="flex flex-col h-full border border-[#DFDDD6] bg-white p-4 animate-pulse">
    <div className="aspect-[16/10] w-full bg-[#EAE8E1]" />
    <div className="pt-5 flex-1 flex flex-col justify-between space-y-5">
      <div className="space-y-2.5">
        <div className="h-3 w-24 bg-[#EAE8E1]" />
        <div className="h-6 w-4/5 bg-[#EAE8E1]" />
        <div className="h-4 w-1/2 bg-[#EAE8E1]" />
      </div>
      <div className="pt-4 border-t border-[#DFDDD6] flex items-center justify-between">
        <div className="h-6 w-24 bg-[#EAE8E1]" />
        <div className="h-11 w-28 bg-[#EAE8E1]" />
      </div>
    </div>
  </div>
);

const ScheduleSpotlight: React.FC<{
  event: EventItem;
  onBuyTicket: (event: EventItem) => void;
}> = ({ event, onBuyTicket }) => {
  const fallback = getFallbackPoster(event.id);
  const [imgSrc, setImgSrc] = useState(event.image || fallback);

  const minPrice = getLowestPrice(event);
  const totalRemaining = getTotalRemaining(event);
  const status = getQuotaStatus(event, totalRemaining);
  const parsed = parseDate(event.date);

  return (
    <div className="mb-8 border border-[#DFDDD6] bg-white grid grid-cols-1 lg:grid-cols-12">
      <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:min-h-[360px] bg-[#141413] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#DFDDD6]">
        <img
          src={imgSrc}
          alt={event.title}
          loading="lazy"
          onError={() => {
            if (imgSrc !== fallback) setImgSrc(fallback);
          }}
          className={`h-full w-full object-cover ${status.isSoldOut ? 'grayscale brightness-75' : ''}`}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,20,19,0.22) 0%, rgba(20,20,19,0.68) 100%)',
          }}
        />
        {parsed.day && (
          <div className="absolute top-4 right-4 bg-[#D4FF2A] px-3.5 py-2 text-center text-[#141413]">
            <span className="block font-display text-2xl font-extrabold leading-none tabular-nums">
              {parsed.day}
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em]">
              {parsed.month} {parsed.year}
            </span>
          </div>
        )}
        <span className="absolute top-4 left-4 bg-[#141413] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F4F3EF]">
          {event.category || 'Simfoni'}
        </span>
      </div>

      <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#D4FF2A]/15">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413]">
              • Sorotan Jadwal
            </span>
            <Badge variant="outline" className={`text-[10px] font-bold ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          <a
            href={`/concert/${event.id}`}
            className="mt-3 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
          >
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold leading-[1.02] tracking-[-0.035em] text-[#141413] hover:underline decoration-2 underline-offset-4 m-0">
              {event.title}
            </h3>
          </a>

          <p className="mt-2 text-sm font-medium text-[#52514D] m-0">
            {event.conductor && event.conductor !== '-' ? `${event.artist} · ${event.conductor}` : event.artist}
          </p>

          <p className="mt-3.5 text-sm text-[#52514D] leading-relaxed line-clamp-3 m-0">
            {event.description}
          </p>

          <div className="mt-5 space-y-2 text-xs text-[#141413] tabular-nums font-medium">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="text-[#141413] shrink-0" aria-hidden="true" />
                <span>{event.date}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-[#52514D] shrink-0" aria-hidden="true" />
                <span>{event.time}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#52514D]">
              <MapPin size={14} className="text-[#52514D] shrink-0" aria-hidden="true" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Separator className="bg-[#DFDDD6] mb-4" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#52514D] m-0">
                Mulai dari
              </p>
              <p className="text-xl font-extrabold text-[#141413] tabular-nums m-0 mt-0.5">
                {formatIDR(minPrice)}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button asChild variant="outline">
                <a href={`/concert/${event.id}`}>Detail</a>
              </Button>
              {status.isSoldOut ? (
                <Button type="button" variant="secondary" disabled>
                  {event.isClosed ? 'Tutup' : 'Habis'}
                </Button>
              ) : (
                <Button type="button" onClick={() => onBuyTicket(event)}>
                  <span>Pesan Tiket</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RecommendedSection: React.FC<RecommendedProps> = ({
  events = [],
  onBuyTicket,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('Semua');

  const filteredEvents = useMemo(() => {
    return events.filter((e) => matchesCategory(e.category, activeTab));
  }, [events, activeTab]);

  const spotlightEvent = filteredEvents[0];
  const restEvents = filteredEvents.slice(1);

  return (
    <section id="jadwal" className="scroll-mt-20 bg-[#F4F3EF] border-b border-[#DFDDD6]">
      <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
        <SectionHeading
          eyebrow="Agenda Pertunjukan"
          title="Jadwal Musim Ini"
          support="Telusuri agenda konser berdasarkan kategori pertunjukan dan pesan kursi pilihan Anda secara langsung."
          actionLabel="Buka Katalog"
          actionHref="/events"
        />

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
          className="mb-8"
        >
          <TabsList className="h-auto w-full flex flex-wrap items-center justify-start gap-2 bg-transparent border-0 p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-none min-h-[44px] rounded-none border border-[#DFDDD6] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#52514D] transition-colors hover:border-[#141413] hover:text-[#141413] data-[state=active]:border-[#141413] data-[state=active]:bg-[#141413] data-[state=active]:text-[#D4FF2A]"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error && events.length === 0 ? (
          <div role="alert" className="border border-[#C81E1E]/35 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-[#C81E1E] m-0">{error}</p>
            <p className="mt-1.5 text-xs text-[#52514D] m-0">
              Silakan periksa koneksi backend atau muat ulang halaman.
            </p>
            {onRetry && (
              <Button type="button" onClick={onRetry} className="mt-4">
                Coba Lagi
              </Button>
            )}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="border border-dashed border-[#DFDDD6] bg-white px-6 py-14 text-center">
            <p className="text-sm text-[#52514D] m-0">
              Belum ada jadwal pertunjukan pada kategori {activeTab}.
            </p>
            {activeTab !== 'Semua' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('Semua')}
                className="mt-4"
              >
                Tampilkan Semua Kategori
              </Button>
            )}
          </div>
        ) : (
          <>
            {spotlightEvent && (
              <ScheduleSpotlight event={spotlightEvent} onBuyTicket={onBuyTicket} />
            )}

            {restEvents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {restEvents.map((ev) => (
                  <ConcertCard
                    key={ev.id}
                    event={ev}
                    onBuyTicket={onBuyTicket}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
