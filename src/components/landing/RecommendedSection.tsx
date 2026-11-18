import React, { useState, useMemo } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import type { EventItem } from './data';
import { formatIDR } from './data';

export interface RecommendedProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
  isLoading?: boolean;
  error?: string | null;
}

const TABS = ['Semua', 'Simfoni', 'Kamar Musik', 'Resital Piano', 'Opera'] as const;
type FilterTab = (typeof TABS)[number];

const getMinPrice = (event: EventItem): number => {
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

const EventCard: React.FC<{
  event: EventItem;
  onBuyTicket: (event: EventItem) => void;
}> = ({ event, onBuyTicket }) => {
  const minPrice = getMinPrice(event);
  const totalRemaining = getTotalRemaining(event);
  const badge = getQuotaBadge(event, totalRemaining);

  return (
    <article className="group flex flex-col h-full rounded-xl border border-[#272A38] bg-[#14161F] overflow-hidden transition-colors duration-200 hover:border-white/40">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1D202D]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
            badge.isSoldOut ? 'grayscale brightness-75' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14161F] via-[#14161F]/25 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className="inline-block rounded-md bg-[#0C0D12]/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border border-white/25">
            {event.category || 'Simfoni'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
        </div>

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

      <div className="p-5 flex-1 flex flex-col justify-between">
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

export const RecommendedSection: React.FC<RecommendedProps> = ({
  events = [],
  onBuyTicket,
  isLoading = false,
  error = null,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('Semua');

  const filteredEvents = useMemo(() => {
    return events.filter((e) => matchesCategory(e.category, activeTab));
  }, [events, activeTab]);

  return (
    <section className="bg-[#0C0D12] py-14 sm:py-20 border-t border-[#272A38]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 md:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A1A1AA] mb-2 flex items-center gap-2">
              <span className="h-px w-8 bg-white/40" aria-hidden="true" />
              Jadwal Pertunjukan
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white m-0">
              Rekomendasi Musim Ini
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`min-h-[44px] shrink-0 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-[#0C0D12] border-white'
                    : 'bg-[#14161F] text-[#E4E4E7] border-[#3E4357] hover:border-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              Silakan periksa koneksi backend atau muat ulang halaman.
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#3E4357] bg-[#14161F] px-6 py-16 text-center">
            <p className="text-sm text-[#A1A1AA] m-0">
              Belum ada jadwal pertunjukan pada kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} onBuyTicket={onBuyTicket} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
