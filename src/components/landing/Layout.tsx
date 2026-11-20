import React from 'react';
import { ArrowUpRight, Ticket, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoomerangVideoBg } from '../BoomerangVideoBg';
import { parseDate } from './Sections';
import type { EventItem } from './data';

interface HeroProps {
  featuredEvent?: EventItem;
  onBuyTicket?: (event: EventItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ featuredEvent, onBuyTicket }) => {
  const parsed = featuredEvent ? parseDate(featuredEvent.date) : null;
  const heroDay = parsed?.day || '18';
  const heroMonth = parsed?.month || 'APR';
  const heroYear = parsed?.year || '2027';

  return (
    <main className="bg-[#F6F4EE] pt-24 sm:pt-28 pb-10 sm:pb-14">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-[clamp(36px,6vw,72px)] leading-[1.04] tracking-[-0.025em] font-semibold text-[#171614] m-0">
            Resapi Harmoni Orkestra dan Simfoni Pilihan
          </h1>

          <p className="mt-4 text-sm sm:text-lg text-[#5C5850] max-w-2xl mx-auto leading-relaxed">
            Platform resmi pemesanan tiket pertunjukan musik simfoni, ansambel kamar, resital piano, dan opera musim pertunjukan di Indonesia.
          </p>

          <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href="/events">
                <span>Jelajahi Konser</span>
                <ArrowUpRight size={16} strokeWidth={2.2} aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/redeem">
                <Ticket size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>Cek E-Ticket</span>
              </a>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 sm:mt-12 overflow-hidden rounded-2xl bg-[#11100E] border border-[#E4DFD3] min-h-[300px] sm:min-h-[420px] lg:min-h-[480px] flex flex-col justify-between p-5 sm:p-8 lg:p-10">
          <BoomerangVideoBg />
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(180deg, rgba(17,16,14,0.38) 0%, rgba(17,16,14,0.22) 42%, rgba(17,16,14,0.88) 100%)',
            }}
          />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <span className="inline-flex items-center rounded-md bg-[#11100E]/85 border border-white/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              {featuredEvent?.category || 'Simfoni Utama'}
            </span>

            <div className="rounded-lg bg-[#C93018] px-3.5 py-2 sm:px-4 sm:py-2.5 text-center text-white">
              <span className="block font-display text-2xl sm:text-4xl font-semibold leading-none tabular-nums">
                {heroDay}
              </span>
              <span className="mt-1 block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white/95">
                {heroMonth} {heroYear}
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-10 sm:pt-16 flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#D8D3C8] m-0">
                Pertunjukan Unggulan
              </p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-4xl lg:text-[42px] font-semibold leading-[1.1] text-white m-0">
                {featuredEvent?.title || 'Symphony No. 5 in C minor'}
              </h2>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-[#E7E2D8]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="shrink-0 text-[#F6F4EE]" aria-hidden="true" />
                  <span>{featuredEvent?.venue || 'Aula Simfonia Jakarta'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock size={14} className="shrink-0 text-[#F6F4EE]" aria-hidden="true" />
                  <span>{featuredEvent?.time || '19:30 WIB'}</span>
                </span>
              </div>
            </div>

            {featuredEvent && (
              <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 shrink-0">
                <a
                  href={`/concert/${featuredEvent.id}`}
                  className="min-h-[44px] inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-white/35 bg-[#11100E]/75 text-white text-xs sm:text-sm font-medium hover:bg-white hover:text-[#171614] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Detail Konser
                </a>
                {onBuyTicket && !featuredEvent.isClosed && (
                  <button
                    type="button"
                    onClick={() => onBuyTicket(featuredEvent)}
                    className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-lg bg-[#C93018] text-white text-xs sm:text-sm font-semibold hover:bg-[#A82511] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Pesan Tiket</span>
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
