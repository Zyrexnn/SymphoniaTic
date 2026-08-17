import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, MapPin, MoreHorizontal } from 'lucide-react';
import { CONCERT_EVENTS } from './data';
import { Reveal } from './Reveal';

type RecCategory = 'Konser' | 'Pameran' | 'Teater' | 'Festival' | 'Konferensi';

interface RecEvent {
  id: string;
  title: string;
  image: string;
  venue: string;
  dateShort: string;
  category: RecCategory;
  price: number;
  ticketsLeft: number;
}

const CATEGORY_COLORS: Record<RecCategory, string> = {
  Konser: 'bg-emerald-500',
  Pameran: 'bg-pink-500',
  Teater: 'bg-[#6C2BD9]',
  Festival: 'bg-amber-500',
  Konferensi: 'bg-[#6C2BD9]',
};

const TABS: (RecCategory | 'Semua')[] = [
  'Semua', 'Konser', 'Pameran', 'Teater', 'Festival', 'Konferensi',
];

const PRICE_FMT = (price: number) => (price / 1000).toLocaleString('id-ID');

const buildEvents = (): RecEvent[] => {
  const base = CONCERT_EVENTS.slice(0, 4).map((e, i) => ({
    id: e.id,
    title: e.title,
    image: e.image,
    venue: e.venue,
    dateShort: ['13 NOV', '20 NOV', '24 APR', '02 MEI'][i] ?? '15 DES',
    category: (['Konser', 'Teater', 'Festival', 'Konferensi'] as RecCategory[])[i],
    price: e.categories?.[0]?.price ?? 500000,
    ticketsLeft: [124, 58, 12, 230][i] ?? 80,
  }));
  const clones: RecEvent[] = [base[0], base[1]].map((b, i) => ({
    ...b,
    id: `${b.id}-r${i}`,
    category: (i === 0 ? 'Pameran' : 'Konser') as RecCategory,
    ticketsLeft: 40 + i * 17,
  }));
  return [...base, ...clones];
};

const EventCard: React.FC<{ ev: RecEvent; hero?: boolean }> = ({ ev, hero }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.25 }}
    className={`group flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-xl transition-shadow ${
      hero ? 'lg:col-span-2 lg:row-span-2 rounded-2xl' : 'rounded-xl'
    }`}
  >
      <div className={`relative w-full overflow-hidden ${hero ? 'h-[320px] lg:h-[460px]' : 'h-[200px]'}`}>
      <img
        src={ev.image}
        alt={ev.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute top-3 left-3 bg-white text-ink text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
        {ev.dateShort}
      </div>
      <div className={`absolute top-3 right-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${CATEGORY_COLORS[ev.category]}`}>
        {ev.category}
      </div>

      {hero && (
        <button
          aria-label="Putar preview"
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <Play className="w-6 h-6 text-white fill-white" />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-base lg:text-lg leading-snug">
          {ev.title}
        </h3>
        <p className="text-white/80 text-[13px] mt-1">
          Tersisa {ev.ticketsLeft} tiket
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white">
      <div className="flex items-center gap-2 min-w-0">
        <MapPin className="w-3.5 h-3.5 text-muted shrink-0" strokeWidth={2} />
        <span className="text-[13px] text-ink-soft truncate">{ev.venue}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] font-semibold text-ink whitespace-nowrap">
          <Zap className="w-3 h-3 inline text-[#6C2BD9]" strokeWidth={2.5} /> mulai {PRICE_FMT(ev.price)}rb
        </span>
        <a
          href={`/concert/${ev.id}`}
          className="text-[11px] font-bold text-white uppercase px-4 py-2 rounded-full bg-[#6C2BD9] hover:bg-[#5a23b8] transition-colors"
        >
          Tiket
        </a>
      </div>
    </div>
  </motion.div>
);

export const RecommendedSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RecCategory | 'Semua'>('Semua');
  const all = buildEvents();
  const displayed = activeTab === 'Semua' ? all : all.filter((e) => e.category === activeTab);
  const hero = displayed[0];
  const rest = displayed.slice(1);

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 md:px-10 pt-16 pb-12">
      <Reveal>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-ink">
            Rekomendasi
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-4 py-2 text-[13px] font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#6C2BD9] text-white border-[#6C2BD9] shadow-sm'
                    : 'bg-white text-ink-soft border-line hover:border-[#6C2BD9]/40 hover:text-[#6C2BD9]'
                }`}
              >
                {tab}
              </button>
            ))}
            <button
              aria-label="Lainnya"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-line text-ink-soft hover:border-[#6C2BD9]/40 hover:text-[#6C2BD9] transition-colors cursor-pointer"
            >
              <MoreHorizontal size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </Reveal>

      {displayed.length === 0 ? (
        <div className="py-20 text-center text-muted text-sm">
          Belum ada event pada kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {hero && <EventCard ev={hero} hero />}
          {rest.map((ev) => (
            <EventCard key={ev.id} ev={ev} />
          ))}
        </div>
      )}
      </div>
    </section>
  );
};
