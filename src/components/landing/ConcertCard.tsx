import React, { useState } from 'react';
import { MapPin, Clock, Heart, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatIDR } from './data';
import type { EventItem } from './data';
import { parseDate } from './Sections';

const FALLBACK_POSTERS = ['/poster_1.jpg', '/poster_2.jpg', '/poster_3.jpg'];

export const getFallbackPoster = (id?: string | number): string => {
  const num = typeof id === 'number' ? id : String(id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK_POSTERS[Math.abs(num) % FALLBACK_POSTERS.length];
};

export const getLowestPrice = (event: EventItem): number => {
  if (!event.categories || event.categories.length === 0) return 0;
  return Math.min(...event.categories.map((c) => Number(c.price) || 0));
};

export const getTotalRemaining = (event: EventItem): number => {
  if (!event.categories || event.categories.length === 0) return 0;
  return event.categories.reduce((total, cat) => {
    const rem = cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota;
    return total + (typeof rem === 'number' && !isNaN(rem) ? rem : 0);
  }, 0);
};

export const getQuotaStatus = (event: EventItem, remaining: number) => {
  if (event.status === 'CANCELLED') {
    return {
      label: 'Dibatalkan',
      className: 'bg-[#C81E1E]/10 text-[#C81E1E] border-[#C81E1E]/35',
      isSoldOut: true,
    };
  }
  if (event.isClosed) {
    return {
      label: 'Penjualan Tutup',
      className: 'bg-[#EAE8E1] text-[#52514D] border-[#DFDDD6]',
      isSoldOut: true,
    };
  }
  if (remaining <= 0) {
    return {
      label: 'Tiket Habis',
      className: 'bg-[#EAE8E1] text-[#52514D] border-[#DFDDD6]',
      isSoldOut: true,
    };
  }
  if (remaining <= 15) {
    return {
      label: `Tersisa ${remaining} Kursi`,
      className: 'bg-[#8A5A00]/10 text-[#8A5A00] border-[#8A5A00]/30',
      isSoldOut: false,
    };
  }
  return {
    label: `Tersisa ${remaining} Kursi`,
    className: 'bg-[#156E3F]/10 text-[#156E3F] border-[#156E3F]/30',
    isSoldOut: false,
  };
};

interface ConcertCardProps {
  event: EventItem;
  onBuyTicket?: (event: EventItem) => void;
  saved?: boolean;
  onToggleSave?: () => void;
  className?: string;
}

export const ConcertCard: React.FC<ConcertCardProps> = ({
  event,
  onBuyTicket,
  saved,
  onToggleSave,
  className = '',
}) => {
  const fallbackImg = getFallbackPoster(event.id);
  const [imgSrc, setImgSrc] = useState(event.image || fallbackImg);

  const minPrice = getLowestPrice(event);
  const totalRemaining = getTotalRemaining(event);
  const status = getQuotaStatus(event, totalRemaining);
  const parsed = parseDate(event.date);

  return (
    <Card
      className={`group flex flex-col h-full overflow-hidden rounded-none border-[#DFDDD6] bg-white transition-colors duration-150 hover:border-[#141413] ${className}`}
    >
      <div className="p-3 pb-0">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#141413] chamfer-br">
          <a
            href={`/concert/${event.id}`}
            tabIndex={-1}
            aria-hidden="true"
            className="block h-full w-full"
          >
            <img
              src={imgSrc}
              alt={event.title}
              loading="lazy"
              onError={() => {
                if (imgSrc !== fallbackImg) setImgSrc(fallbackImg);
              }}
              className={`h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] ${
                status.isSoldOut ? 'grayscale brightness-75' : ''
              }`}
            />
          </a>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(20,20,19,0.34) 0%, rgba(20,20,19,0.04) 45%, rgba(20,20,19,0.28) 100%)',
            }}
          />

          <span className="absolute top-2.5 left-2.5 rounded-none bg-[#141413] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F4F3EF]">
            {event.category || 'Simfoni'}
          </span>

          {parsed.day && (
            <div className="absolute top-2.5 right-2.5 rounded-none border border-[#141413]/15 bg-[#D4FF2A] px-2.5 py-1.5 text-center text-[#141413]">
              <span className="block font-display text-lg font-extrabold leading-none tabular-nums">
                {parsed.day}
              </span>
              <span className="block mt-0.5 text-[9px] font-bold uppercase tracking-wider">
                {parsed.month} {parsed.year}
              </span>
            </div>
          )}

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave();
              }}
              aria-label={saved ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              aria-pressed={saved}
              className="absolute bottom-2.5 left-2.5 z-10 flex h-11 w-11 items-center justify-center rounded-none bg-white/95 border border-[#141413]/25 transition-colors hover:border-[#141413] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
            >
              <Heart
                size={15}
                strokeWidth={2.2}
                className={saved ? 'fill-[#141413] text-[#141413]' : 'text-[#52514D]'}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#52514D] tabular-nums font-medium">
              <Clock size={12} className="text-[#141413] shrink-0" aria-hidden="true" />
              <span>{event.time}</span>
            </span>
            <Badge variant="outline" className={`text-[10px] font-bold ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          <a
            href={`/concert/${event.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
          >
            <h3 className="font-display text-xl sm:text-2xl font-bold leading-[1.08] tracking-[-0.03em] text-[#141413] min-h-[2.75rem] sm:min-h-[3.25rem] line-clamp-2 group-hover:underline decoration-2 underline-offset-4 m-0">
              {event.title}
            </h3>
          </a>

          <p className="mt-2 text-xs text-[#52514D] min-h-[1.25rem] line-clamp-1 m-0">
            {event.conductor && event.conductor !== '-' ? `${event.artist} · ${event.conductor}` : event.artist}
          </p>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6E6D68] min-h-[1.25rem]">
            <MapPin size={12} className="text-[#6E6D68] shrink-0" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="mt-5">
          <Separator className="bg-[#DFDDD6] mb-4" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6E6D68] m-0">
                Mulai dari
              </p>
              <p
                className={`text-base sm:text-lg font-extrabold truncate tabular-nums m-0 mt-0.5 ${
                  status.isSoldOut ? 'text-[#6E6D68] line-through decoration-[#6E6D68]/70' : 'text-[#141413]'
                }`}
              >
                {formatIDR(minPrice)}
              </p>
            </div>

            {status.isSoldOut ? (
              <Button type="button" variant="secondary" disabled className="shrink-0">
                {event.status === 'CANCELLED' ? 'Dibatalkan' : event.isClosed ? 'Penjualan Tutup' : 'Tiket Habis'}
              </Button>
            ) : onBuyTicket ? (
              <Button
                type="button"
                variant="lime"
                onClick={() => onBuyTicket(event)}
                className="shrink-0"
              >
                <span>Pesan Tiket</span>
                <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
              </Button>
            ) : (
              <Button asChild variant="lime" className="shrink-0">
                <a href={`/concert/${event.id}`}>
                  <span>Lihat Tiket</span>
                  <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
