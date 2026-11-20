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
  <div className="flex flex-col h-full rounded-xl border border-[#E4DFD3] bg-white overflow-hidden animate-pulse">
    <div className="aspect-[16/10] w-full bg-[#ECE8DF]" />
    <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
      <div className="space-y-2.5">
        <div className="h-3 w-24 bg-[#ECE8DF] rounded" />
        <div className="h-6 w-4/5 bg-[#ECE8DF] rounded" />
        <div className="h-4 w-1/2 bg-[#ECE8DF] rounded" />
      </div>
      <div className="pt-4 border-t border-[#E4DFD3] flex items-center justify-between">
        <div className="h-6 w-24 bg-[#ECE8DF] rounded" />
        <div className="h-11 w-28 bg-[#ECE8DF] rounded-lg" />
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
    <div className="mb-8 rounded-2xl border border-[#E4DFD3] bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:min-h-[340px] bg-[#11100E] overflow-hidden">
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
              'linear-gradient(180deg, rgba(17,16,14,0.22) 0%, rgba(17,16,14,0.62) 100%)',
          }}
        />
        {parsed.day && (
          <div className="absolute top-4 right-4 rounded-lg bg-[#C93018] px-3.5 py-2 text-center text-white">
            <span className="block font-display text-2xl font-semibold leading-none tabular-nums">
              {parsed.day}
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em]">
              {parsed.month} {parsed.year}
            </span>
          </div>
        )}
        <span className="absolute top-4 left-4 rounded-md bg-[#11100E]/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
          {event.category || 'Simfoni'}
        </span>
      </div>

      <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C93018]">
              Sorotan Jadwal
            </span>
            <Badge variant="outline" className={`text-[11px] font-semibold ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          <a
            href={`/concert/${event.id}`}
            className="mt-3 block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
          >
            <h3 className="font-display text-2xl sm:text-3xl font-semibold leading-tight text-[#171614] hover:text-[#C93018] transition-colors m-0">
              {event.title}
            </h3>
          </a>

          <p className="mt-2 text-sm text-[#5C5850] m-0">
            {event.conductor && event.conductor !== '-' ? `${event.artist} · ${event.conductor}` : event.artist}
          </p>

          <p className="mt-3.5 text-sm text-[#5C5850] leading-relaxed line-clamp-3 m-0">
            {event.description}
          </p>

          <div className="mt-4 space-y-2 text-xs text-[#5C5850] tabular-nums">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="text-[#C93018] shrink-0" aria-hidden="true" />
                <span>{event.date}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-[#6B665D] shrink-0" aria-hidden="true" />
                <span>{event.time}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#6B665D] shrink-0" aria-hidden="true" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Separator className="bg-[#E4DFD3] mb-4" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B665D] m-0">
                Mulai dari
              </p>
              <p className="text-xl font-bold text-[#171614] tabular-nums m-0 mt-0.5">
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
    <section id="jadwal" className="bg-[#F6F4EE] py-12 sm:py-16 border-b border-[#E4DFD3]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018] m-0">
            Agenda Pertunjukan
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-[-0.02em] leading-[1.08] text-[#171614] m-0">
            Jadwal Musim Ini
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#5C5850] leading-relaxed m-0">
            Telusuri agenda konser berdasarkan kategori pertunjukan dan pesan kursi pilihan Anda secara langsung.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
          className="mb-8"
        >
          <TabsList className="h-auto w-full flex flex-wrap items-center justify-center gap-2 bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-none min-h-[44px] rounded-lg border border-[#CFC9BC] bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-[#5C5850] transition-colors hover:border-[#171614] hover:text-[#171614] data-[state=active]:border-[#C93018] data-[state=active]:bg-[#C93018] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error && events.length === 0 ? (
          <div role="alert" className="rounded-xl border border-[#B91C1C]/30 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-[#B91C1C] m-0">{error}</p>
            <p className="mt-1.5 text-xs text-[#5C5850] m-0">
              Silakan periksa koneksi backend atau muat ulang halaman.
            </p>
            {onRetry && (
              <Button type="button" onClick={onRetry} className="mt-4">
                Coba Lagi
              </Button>
            )}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#CFC9BC] bg-white px-6 py-14 text-center">
            <p className="text-sm text-[#5C5850] m-0">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restEvents.map((ev) => (
                  <ConcertCard key={ev.id} event={ev} onBuyTicket={onBuyTicket} />
                ))}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <Button asChild variant="outline">
                <a href="/events">
                  <span>Buka Katalog Lengkap</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
