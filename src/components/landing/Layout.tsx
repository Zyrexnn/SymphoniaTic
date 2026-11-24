import React from 'react';
import { ArrowUpRight, Ticket, MapPin, Clock, Calendar } from 'lucide-react';
import { BoomerangVideoBg } from '../BoomerangVideoBg';
import { parseDate } from './Sections';
import type { EventItem } from './data';

interface HeroProps {
  featuredEvent?: EventItem;
  isLoading?: boolean;
  onBuyTicket?: (event: EventItem) => void;
}

export const Hero: React.FC<HeroProps> = ({ featuredEvent, isLoading = false, onBuyTicket }) => {
  const parsed = featuredEvent ? parseDate(featuredEvent.date) : null;
  const heroDay = parsed?.day || '18';
  const heroMonth = parsed?.month || 'APR';
  const heroYear = parsed?.year || '2027';

  return (
    <main className="relative bg-[#141413] text-[#F4F3EF] pt-[64px] border-b border-[#141413] overflow-hidden">
      <div className="relative mx-auto max-w-[1360px] border-x border-white/15 min-h-[540px] sm:min-h-[620px] lg:min-h-[680px] flex flex-col justify-between">
        <BoomerangVideoBg />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,20,19,0.72) 0%, rgba(20,20,19,0.34) 45%, rgba(20,20,19,0.94) 100%)',
          }}
        />

        {/* Top Editorial Metadata & Action Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 border-b border-white/15">
          <div className="lg:col-span-7 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 flex flex-wrap items-center gap-2.5 border-b lg:border-b-0 lg:border-r border-white/15">
            {isLoading ? (
              <>
                <span className="inline-block h-7 w-28 bg-white/15 animate-pulse" aria-hidden="true" />
                <span className="inline-block h-7 w-24 bg-[#D4FF2A]/35 animate-pulse" aria-hidden="true" />
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 bg-[#141413]/90 border border-white/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F4F3EF]">
                  <span className="w-1.5 h-1.5 bg-[#D4FF2A]" aria-hidden="true" />
                  <span>{featuredEvent?.category || 'Simfoni Utama'}</span>
                </span>
                <span className="inline-flex items-center bg-[#D4FF2A] px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#141413] tabular-nums">
                  {heroDay} {heroMonth} {heroYear}
                </span>
              </>
            )}
          </div>

          <div className="lg:col-span-5 px-5 sm:px-8 lg:px-10 py-6 sm:py-8 bg-[#141413]/65">
            <p className="text-xs sm:text-sm text-[#D8D6CE] leading-relaxed m-0">
              Platform resmi pemesanan tiket pertunjukan musik simfoni, ansambel kamar, resital piano, dan opera di Indonesia.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {isLoading && !featuredEvent ? (
                <>
                  <span className="inline-block h-11 w-36 bg-[#D4FF2A]/35 animate-pulse" aria-hidden="true" />
                  <span className="inline-block h-11 w-36 border border-white/20 bg-white/10 animate-pulse" aria-hidden="true" />
                </>
              ) : (
                <>
                  {featuredEvent && onBuyTicket && !featuredEvent.isClosed ? (
                    <button
                      type="button"
                      onClick={() => onBuyTicket(featuredEvent)}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-none bg-[#D4FF2A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#C2EE1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
                    >
                      <span>Pesan Tiket</span>
                      <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
                    </button>
                  ) : (
                    <a
                      href="/events"
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-none bg-[#D4FF2A] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#C2EE1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
                    >
                      <span>Jelajahi Konser</span>
                      <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden="true" />
                    </a>
                  )}
                  <a
                    href={featuredEvent ? `/concert/${featuredEvent.id}` : '/redeem'}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-none border border-white/30 bg-[#141413]/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F4F3EF] hover:border-[#D4FF2A] hover:text-[#D4FF2A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
                  >
                    <Ticket size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{featuredEvent ? 'Detail Konser' : 'Cek E-Ticket'}</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Stage Title & Specs */}
        <div className="relative z-10 mt-auto">
          <div className="px-5 sm:px-8 lg:px-10 pt-16 pb-8 sm:pb-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4FF2A] m-0">
              • Musim Pertunjukan Pilihan
            </p>
            {isLoading ? (
              <div className="mt-3 space-y-3 max-w-3xl" aria-busy="true" aria-label="Memuat konser pilihan">
                <div className="h-10 sm:h-14 w-4/5 bg-white/15 animate-pulse" />
                <div className="h-10 sm:h-14 w-3/5 bg-white/10 animate-pulse" />
              </div>
            ) : (
              <h1 className="mt-3 font-display text-[clamp(38px,6.6vw,88px)] leading-[0.94] tracking-[-0.04em] font-extrabold text-[#F4F3EF] max-w-4xl m-0">
                {featuredEvent?.title || 'Resapi Harmoni Orkestra dan Simfoni Pilihan'}
              </h1>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-white/15 bg-[#141413]/85 text-xs">
            <div className="px-5 sm:px-8 py-4 border-b sm:border-b-0 sm:border-r border-white/15 flex items-center gap-2 text-[#D8D6CE]">
              <MapPin size={14} className="shrink-0 text-[#D4FF2A]" aria-hidden="true" />
              {isLoading ? (
                <span className="h-3.5 w-36 bg-white/15 animate-pulse inline-block" aria-hidden="true" />
              ) : (
                <span className="truncate font-medium">
                  {featuredEvent?.venue || 'Aula Simfonia Jakarta'}
                </span>
              )}
            </div>
            <div className="px-5 sm:px-8 py-4 border-b sm:border-b-0 sm:border-r border-white/15 flex items-center gap-2 text-[#D8D6CE] tabular-nums">
              <Calendar size={14} className="shrink-0 text-[#D4FF2A]" aria-hidden="true" />
              {isLoading ? (
                <span className="h-3.5 w-28 bg-white/15 animate-pulse inline-block" aria-hidden="true" />
              ) : (
                <span className="truncate font-medium">
                  {featuredEvent?.date || '18 April 2027'}
                </span>
              )}
            </div>
            <div className="px-5 sm:px-8 py-4 flex items-center justify-between gap-2 text-[#D8D6CE] tabular-nums">
              <span className="inline-flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-[#D4FF2A]" aria-hidden="true" />
                {isLoading ? (
                  <span className="h-3.5 w-20 bg-white/15 animate-pulse inline-block" aria-hidden="true" />
                ) : (
                  <span className="font-medium">{featuredEvent?.time || '19:30 WIB'}</span>
                )}
              </span>
              <a
                href="/events"
                className="text-[11px] font-bold uppercase tracking-wider text-[#D4FF2A] hover:underline"
              >
                Semua Jadwal
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
