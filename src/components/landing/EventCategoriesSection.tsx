import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { EventItem } from './data';

interface EventCategoriesSectionProps {
  categories: string[];
  events: EventItem[];
  onSelect: (category: string) => void;
}

const titleCase = (value: string) =>
  (value.charAt(0) + value.slice(1).toLowerCase()).trim();

const CategoryCard: React.FC<{
  name: string;
  count: number;
  image: string;
  onSelect: () => void;
}> = ({ name, count, image, onSelect }) => (
  <button
    onClick={onSelect}
    className="group relative block w-[74vw] sm:w-[300px] shrink-0 snap-start overflow-hidden rounded-xl border border-[#272A38] bg-[#14161F] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12]"
  >
    <img
      src={image}
      alt={name}
      loading="lazy"
      className="aspect-[3/4] w-full object-cover brightness-[0.82] transition-all duration-700 group-hover:scale-[1.05] group-hover:brightness-[0.9]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D12]/90 via-[#0C0D12]/20 to-transparent" />
    <span className="absolute right-4 top-4 rounded-md bg-[#0C0D12]/80 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
      {count} konser
    </span>
    <div className="absolute bottom-5 left-5 right-5">
      <h3 className="text-xl font-bold leading-tight tracking-tight text-white">{name}</h3>
      <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white opacity-0 translate-y-1 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        Telusuri {name}
        <ChevronRight size={15} strokeWidth={2} />
      </span>
    </div>
  </button>
);

export const EventCategoriesSection: React.FC<EventCategoriesSectionProps> = ({
  categories,
  events,
  onSelect,
}) => {
  if (categories.length <= 1) return null;

  return (
    <section className="border-t border-[#272A38] bg-[#0C0D12] py-16">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-10">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#A1A1AA]">
              Telusuri Pengalaman
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-white">
              Jelajahi Berdasarkan Kategori
            </h2>
          </div>
          <p className="text-sm text-[#A1A1AA] max-w-sm sm:text-right">
            Temukan arah konser yang sesuai dengan seleramu musim ini.
          </p>
        </div>

        <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-5 sm:mx-0 px-5 sm:px-0">
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
                name={titleCase(category)}
                count={count}
                image={representativeEvent.image}
                onSelect={() => onSelect(category)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
