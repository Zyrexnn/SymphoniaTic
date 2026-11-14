import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import type { EventItem } from './data';
import { formatIDR } from './data';
import { Reveal } from './Reveal';

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
        <div className="h-9 w-28 bg-[#272A38] rounded-lg" />
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
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col h-full rounded-xl border border-[#272A38] bg-[#14161F] overflow-hidden transition-all duration-300 hover:border-white/40 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#1D202D]">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            badge.isSoldOut ? 'grayscale brightness-75' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14161F] via-[#14161F]/20 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className="inline-block rounded-md bg-[#0C0D12]/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border border-white/20 backdrop-blur-sm">
            {event.category || 'Simfoni'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>

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

      <div className="p-5 flex-1 flex flex-col justify-between">
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
    </motion.article>
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
    <section className="bg-[#0C0D12] py-16 sm:py-20 border-t border-[#272A38]/50">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-12">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A1A1AA] mb-2 flex items-center gap-2">
                <span className="h-px w-8 bg-white/40" aria-hidden />
                Jadwal Pertunjukan
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F4F4F6]">
                Rekomendasi Musim Ini
              </h2>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-2 px-2 pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white text-black border-white shadow-sm font-semibold'
                      : 'bg-[#14161F] text-[#A1A1AA] border-[#272A38] hover:border-white/40 hover:text-[#F4F4F6]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              Silakan periksa koneksi backend atau muat ulang halaman.
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#272A38] bg-[#14161F] px-6 py-16 text-center">
            <p className="text-sm text-[#94A3B8]">
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
