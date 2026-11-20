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
      className="group relative block w-full overflow-hidden rounded-xl border border-[#E4DFD3] bg-[#11100E] text-left hover:border-[#171614] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECE8DF]"
    >
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={() => {
          if (src !== fallback) setSrc(fallback);
        }}
        className="aspect-[4/5] w-full object-cover brightness-[0.82] transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-95"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(17,16,14,0.15) 0%, rgba(17,16,14,0.28) 45%, rgba(17,16,14,0.88) 100%)',
        }}
      />
      <span className="absolute right-3 top-3 rounded-md bg-[#C93018] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
        {count} konser
      </span>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="font-display text-xl sm:text-2xl font-semibold leading-tight text-white m-0">
          {name}
        </h3>
        <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#F6F4EE]">
          <span>Telusuri</span>
          <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
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
    <section className="border-t border-[#E4DFD3] bg-[#ECE8DF] py-12 sm:py-16">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018] m-0">
              Telusuri Kategori
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#171614] mb-0">
              Jelajahi Berdasarkan Genre
            </h2>
          </div>
          <p className="text-sm text-[#5C5850] max-w-sm sm:text-right m-0">
            Temukan jenis pertunjukan yang sesuai dengan selera Anda musim ini.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
