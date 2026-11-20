import React, { useState } from 'react';
import { MapPin, Clock, Heart } from 'lucide-react';
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
  if (event.isClosed) {
    return {
      label: 'Penjualan Tutup',
      className: 'bg-[#ECE8DF] text-[#5C5850] border-[#CFC9BC]',
      isSoldOut: true,
    };
  }
  if (remaining <= 0) {
    return {
      label: 'Tiket Habis',
      className: 'bg-[#ECE8DF] text-[#5C5850] border-[#CFC9BC]',
      isSoldOut: true,
    };
  }
  if (remaining <= 15) {
    return {
      label: `Tersisa ${remaining} Kursi`,
      className: 'bg-[#855A0E]/10 text-[#855A0E] border-[#855A0E]/30',
      isSoldOut: false,
    };
  }
  return {
    label: `Tersisa ${remaining} Kursi`,
    className: 'bg-[#1F6E43]/10 text-[#1F6E43] border-[#1F6E43]/25',
    isSoldOut: false,
  };
};

interface ConcertCardProps {
  event: EventItem;
  onBuyTicket?: (event: EventItem) => void;
  saved?: boolean;
  onToggleSave?: () => void;
}

export const ConcertCard: React.FC<ConcertCardProps> = ({
  event,
  onBuyTicket,
  saved,
  onToggleSave,
}) => {
  const fallbackImg = getFallbackPoster(event.id);
  const [imgSrc, setImgSrc] = useState(event.image || fallbackImg);

  const minPrice = getLowestPrice(event);
  const totalRemaining = getTotalRemaining(event);
  const status = getQuotaStatus(event, totalRemaining);
  const parsed = parseDate(event.date);

  return (
    <Card className="group flex flex-col h-full overflow-hidden border-[#E4DFD3] bg-white transition-colors duration-200 hover:border-[#171614]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#11100E]">
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
            className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
              status.isSoldOut ? 'grayscale brightness-75' : ''
            }`}
          />
        </a>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,16,14,0.38) 0%, rgba(17,16,14,0.06) 45%, rgba(17,16,14,0.28) 100%)',
          }}
        />

        <span className="absolute top-3 left-3 rounded-md bg-[#11100E]/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {event.category || 'Simfoni'}
        </span>

        {onToggleSave ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave();
            }}
            aria-label={saved ? 'Hapus dari favorit' : 'Simpan ke favorit'}
            aria-pressed={saved}
            className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 border border-[#E4DFD3] transition-colors hover:border-[#171614] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
          >
            <Heart
              size={16}
              strokeWidth={2}
              className={saved ? 'fill-[#C93018] text-[#C93018]' : 'text-[#5C5850]'}
              aria-hidden="true"
            />
          </button>
        ) : parsed.day ? (
          <div className="absolute top-3 right-3 rounded-md bg-[#C93018] px-2.5 py-1.5 text-center text-white">
            <span className="block font-display text-lg font-semibold leading-none tabular-nums">
              {parsed.day}
            </span>
            <span className="block mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {parsed.month} {parsed.year}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#5C5850] tabular-nums">
              <Clock size={13} className="text-[#C93018] shrink-0" aria-hidden="true" />
              <span>
                {onToggleSave && parsed.day ? `${event.date} · ` : ''}
                {event.time}
              </span>
            </span>
            <Badge variant="outline" className={`text-[11px] font-semibold ${status.className}`}>
              {status.label}
            </Badge>
          </div>

          <a
            href={`/concert/${event.id}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] rounded"
          >
            <h3 className="font-display text-xl sm:text-2xl font-semibold leading-snug text-[#171614] line-clamp-2 group-hover:text-[#C93018] transition-colors m-0">
              {event.title}
            </h3>
          </a>

          <p className="mt-1.5 text-xs text-[#5C5850] line-clamp-1 m-0">
            {event.conductor && event.conductor !== '-' ? `${event.artist} · ${event.conductor}` : event.artist}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#6B665D]">
            <MapPin size={13} className="text-[#6B665D] shrink-0" aria-hidden="true" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="mt-5">
          <Separator className="bg-[#E4DFD3] mb-4" />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B665D] m-0">
                Mulai dari
              </p>
              <p className="text-base sm:text-lg font-bold text-[#171614] truncate tabular-nums m-0 mt-0.5">
                {formatIDR(minPrice)}
              </p>
            </div>

            {status.isSoldOut ? (
              <Button type="button" variant="secondary" disabled className="shrink-0">
                {event.isClosed ? 'Tutup' : 'Habis'}
              </Button>
            ) : onBuyTicket ? (
              <Button
                type="button"
                onClick={() => onBuyTicket(event)}
                className="shrink-0"
              >
                Pesan Tiket
              </Button>
            ) : (
              <Button asChild className="shrink-0">
                <a href={`/concert/${event.id}`}>Lihat Tiket</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
