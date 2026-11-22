import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getFallbackPoster } from './ConcertCard';
import type { EventItem } from './data';

interface EventCategoriesSectionProps {
  categories: string[];
  events: EventItem[];
  onSelect: (category: string) => void;
}

const formatCategoryLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w === '&' ? '&' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

const CategoryCard: React.FC<{
  name: string;
  count: number;
  image: string;
  eventId: string | number;
  onSelect: () => void;
}> = ({ name, count, image, eventId, onSelect }) => {
  const fallback = getFallbackPoster(eventId);
  const [src, setSrc] = useState(image || fallback);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative block w-full overflow-hidden rounded-none border border-white/15 bg-[#141413] text-left hover:border-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
    >
      <div className="chamfer-br overflow-hidden">
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => {
            if (src !== fallback) setSrc(fallback);
          }}
          className="aspect-[4/5] w-full object-cover brightness-[0.8] transition-all duration-300 group-hover:scale-[1.04] group-hover:brightness-95"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(20,20,19,0.18) 0%, rgba(20,20,19,0.28) 45%, rgba(20,20,19,0.92) 100%)',
        }}
      />
      <span className="absolute right-3 top-3 rounded-none bg-[#D4FF2A] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#141413] tabular-nums">
        {count} konser
      </span>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="font-display text-xl sm:text-2xl font-extrabold leading-tight tracking-[-0.03em] text-[#F4F3EF] m-0">
          {name}
        </h3>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#D4FF2A]">
          <span>Telusuri</span>
          <ChevronRight size={14} strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>
    </button>
  );
};

export const EventCategoriesSection: React.FC<EventCategoriesSectionProps> = ({
  categories,
  events,
  onSelect,
}) => {
  if (categories.length <= 1) return null;

  return (
    <section className="border-t border-[#141413] bg-[#141413] text-[#F4F3EF]">
      <div className="mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4FF2A] m-0">
              <span className="inline-block w-1.5 h-1.5 bg-[#D4FF2A]" aria-hidden="true" />
              <span>Telusuri Kategori</span>
            </p>
          </div>
          <div className="lg:col-span-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-[-0.035em] text-[#F4F3EF] m-0">
              Jelajahi Berdasarkan Genre
            </h2>
            <p className="text-xs sm:text-sm text-[#B8B6AE] max-w-xs m-0">
              Temukan jenis pertunjukan yang sesuai dengan selera Anda musim ini.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((category) => {
            const normalizedCategory = category.trim().toUpperCase();
            const representativeEvent = events.find(
              (event) => (event.category || '').trim().toUpperCase() === normalizedCategory
            );
            const count = events.filter(
              (event) => (event.category || '').trim().toUpperCase() === normalizedCategory
            ).length;

            if (!representativeEvent) return null;

            return (
              <CategoryCard
                key={category}
                name={formatCategoryLabel(category)}
                count={count}
                image={representativeEvent.image}
                eventId={representativeEvent.id}
                onSelect={() => onSelect(category)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
