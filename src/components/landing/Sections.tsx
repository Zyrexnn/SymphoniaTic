import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { CONCERT_EVENTS, ARTISTS_LINEUP, formatIDR } from './data';
import type { EventItem } from './data';

interface SectionProps {
  events?: EventItem[];
  onBuyTicket: (event: EventItem) => void;
}

const goToConcert = (event: EventItem) => {
  window.location.href = `/concert/${event.id}`;
};

export const BentoSection: React.FC<SectionProps> = ({ events, onBuyTicket }) => {
  const sourceEvents = (events && events.length > 0) ? events : CONCERT_EVENTS;
  const featured = sourceEvents[0];
  const rest = sourceEvents.filter((e) => e.id !== featured?.id);

  return (
    <section className="bg-canvas">
    <>
      {/* Section Header */}
      <section id="concerts" className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pt-16 pb-[100px] md:pb-[120px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-line gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-ink m-0">
              Jelajahi Simfoni &amp; Sistem Gate Pilihan.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted max-w-md leading-relaxed">
            Integrasi langsung antara ansambel orkestra kelas dunia dan platform tiket berkecepatan tinggi dengan verifikasi instan.
          </p>
        </div>

        {/* Desktop Bento Grid */}
        <div className="hidden md:grid grid-cols-12 gap-5 auto-rows-[220px]">
          {/* FEATURED (8 cols, 2 rows) */}
          <div
            className="col-span-8 row-span-2 relative overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-500 bg-[#171717]"
            onClick={() => featured && goToConcert(featured)}
          >
            <img
              src={featured?.image}
              alt={featured?.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
              <span className="text-[11px] font-semibold tracking-wide text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1.5 uppercase">
                Konser Utama
              </span>
              {featured?.categories?.[0] && (
                <span className="text-xs font-semibold tracking-wide text-white bg-black/50 backdrop-blur-sm px-3 py-1.5">
                  Mulai {formatIDR(featured.categories[0].price)}
                </span>
              )}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <div className="flex items-center gap-3 text-xs text-white/70 uppercase tracking-wider mb-2">
                <span>{featured?.date}</span>
                <span>•</span>
                <span>{featured?.time}</span>
                <span>•</span>
                <span className="text-white">{featured?.venue}</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-semibold text-white tracking-[-0.03em] leading-tight group-hover:text-white/95 transition-colors">
                {featured?.title}
              </h3>
              <p className="text-sm text-white/70 mt-2 max-w-xl line-clamp-1">
                {featured?.artist}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                <span>Detail Konser &amp; Tiket</span>
                <ArrowUpRight size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* FEATURED ARTIST (4 cols, 2 rows) */}
          <div id="lineup" className="col-span-4 row-span-2 relative overflow-hidden hover:shadow-xl transition-all duration-500 bg-[#171717] group">
            <img
              src={ARTISTS_LINEUP[0].image}
              alt={ARTISTS_LINEUP[0].name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/30 to-transparent" />
            
            <div className="absolute top-6 left-6 z-10">
              <span className="text-[11px] font-semibold tracking-wide text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1.5 uppercase">
                Artis Musim Ini
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <p className="text-xs text-white/70 uppercase tracking-wider mb-1">
                Orkestra Pilihan 2026
              </p>
              <h3 className="text-xl lg:text-2xl font-semibold text-white tracking-tight leading-snug">
                {ARTISTS_LINEUP[0].name}
              </h3>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                Menghadirkan harmoni ansambel simfoni legendaris secara eksklusif.
              </p>
            </div>
          </div>

          {/* SECONDARY CONCERT (5 cols) */}
          {rest[0] && (
            <div
              className="col-span-5 relative overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-500 bg-[#171717]"
              onClick={() => goToConcert(rest[0])}
            >
              <img
                src={rest[0].image}
                alt={rest[0].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-85 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <div className="flex items-center gap-2 text-xs text-muted mb-1.5">
                  <span>{rest[0].date}</span>
                </div>
                <h4 className="text-lg font-semibold text-white tracking-tight line-clamp-1">
                  {rest[0].title}
                </h4>
                <p className="text-xs text-white/80 mt-1">
                  Mulai {formatIDR(rest[0].categories?.[0]?.price ?? 0)}
                </p>
              </div>
            </div>
          )}

          {/* METRIC TILE (4 cols) */}
          <div id="ticket-war" className="col-span-4 flex flex-col justify-between p-6 border border-line hover:border-brand/20 bg-white transition-all group relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted tracking-wide uppercase">
                Akurasi Sistem
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Sistem Aktif" />
            </div>
            
            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl lg:text-5xl font-bold text-ink tracking-tight">
                  99,8%
                </p>
                <span className="text-xs font-semibold text-emerald-500">AKURASI</span>
              </div>
              <div className="w-full bg-line h-1.5 mt-3 overflow-hidden">
                <div className="bg-brand h-full w-[99.8%]" />
              </div>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              Pemindaian E-Ticket real-time dengan validasi atomic untuk menjamin zero overbooking.
            </p>
          </div>

          {/* SECONDARY CONCERT 2 (3 cols) */}
          {rest[1] && (
            <div
              className="col-span-3 relative overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-500 bg-[#171717]"
              onClick={() => goToConcert(rest[1])}
            >
              <img
                src={rest[1].image}
                alt={rest[1].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-85 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <h4 className="text-base font-semibold text-white tracking-tight truncate">
                  {rest[1].title}
                </h4>
                <p className="text-xs text-white/70 mt-1">{rest[1].date}</p>
              </div>
            </div>
          )}

          {/* STEP 1 (4 cols) */}
          <div id="guide" className="col-span-4 flex flex-col justify-between p-6 border border-line hover:border-brand/20 bg-white transition-colors">
            <span className="text-xs font-semibold text-brand tracking-wide uppercase">
              Langkah 01
            </span>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-ink tracking-tight mb-1">
                Pilih Konser &amp; Kategori
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Tentukan pertunjukan simfoni impian dan pilih zona tempat duduk terbaik (maks. 4 tiket/transaksi).
              </p>
            </div>
          </div>

          {/* STEP 2 (4 cols) */}
          <div className="col-span-4 flex flex-col justify-between p-6 border border-line hover:border-brand/20 bg-white transition-colors">
            <span className="text-xs font-semibold text-brand tracking-wide uppercase">
              Langkah 02
            </span>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-ink tracking-tight mb-1">
                Verifikasi Atomic Instan
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Sistem secara otomatis mengunci kuota tiket dan menerbitkan kode verifikasi unik secara real-time.
              </p>
            </div>
          </div>

          {/* STEP 3 (4 cols) */}
          <div className="col-span-4 flex flex-col justify-between p-6 border border-line hover:border-brand/20 bg-white transition-colors">
            <span className="text-xs font-semibold text-brand tracking-wide uppercase">
              Langkah 03
            </span>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-ink tracking-tight mb-1">
                Scan E-Ticket QR Code
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Tunjukkan QR Code terenkripsi di pintu masuk hall untuk akses masuk serba cepat tanpa antrean fisik.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-6 mt-6">
          {featured && (
            <div
              className="relative overflow-hidden h-[340px] cursor-pointer group bg-[#171717]"
              onClick={() => featured && goToConcert(featured)}
            >
              <img src={featured.image} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/50 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-[11px] font-semibold text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1.5 uppercase">
                  Konser Utama
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs text-white/70 mb-1">{featured.date} · {featured.time}</p>
                <h3 className="text-xl font-semibold text-white leading-snug">{featured.title}</h3>
                <p className="text-xs text-white/70 mt-1">{featured.artist}</p>
              </div>
            </div>
          )}

          {rest.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="relative overflow-hidden h-[200px] cursor-pointer group bg-[#171717]"
              onClick={() => goToConcert(event)}
            >
              <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover brightness-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h4 className="text-lg font-semibold text-white truncate">{event.title}</h4>
                <p className="text-xs text-white/70 mt-1">{event.date} • {event.venue}</p>
              </div>
            </div>
          ))}

          {/* Metric in mobile */}
          <div className="p-6 border border-line bg-white">
            <span className="text-xs font-semibold text-muted tracking-wide uppercase">Akurasi Sistem</span>
            <p className="text-4xl font-bold text-ink tracking-tight mt-2">99,8%</p>
            <p className="text-sm text-muted mt-2">Pemindaian QR real-time tanpa overbooking.</p>
          </div>

          {/* Steps in mobile */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { num: '01', title: 'Pilih Konser', desc: 'Pilih pertunjukan & kategori tempat duduk.' },
              { num: '02', title: 'Verifikasi Instan', desc: 'Sistem atomic mengunci transaksi.' },
              { num: '03', title: 'Tunjukkan QR Code', desc: 'Scan tiket digital di gate masuk hall.' },
            ].map((step) => (
              <div key={step.num} className="p-5 border border-line bg-white">
                <p className="text-xs font-semibold text-brand mb-1">Langkah {step.num}</p>
                <h4 className="text-base font-semibold text-ink">{step.title}</h4>
                <p className="text-sm text-muted mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Title Header */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pb-6 flex items-baseline justify-between border-t border-line pt-12">
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Semua Jadwal Konser
          </h3>
        </div>
        <a
          href="/events"
          className="text-sm text-muted hover:text-brand transition-colors inline-flex items-center gap-1 group"
        >
          <span>Lihat Semua</span>
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* Carousel Section */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pb-16">
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 sm:-mx-8 sm:px-8 md:-mx-10 md:px-10 no-scrollbar snap-x snap-mandatory">
          {sourceEvents.map((event) => {
            const minPrice = event.categories?.[0]?.price ?? 0;
            return (
              <div
                key={event.id}
                className="cursor-pointer group shrink-0 w-[240px] md:w-[280px] snap-start p-4 bg-white hover:shadow-lg transition-all duration-300"
                onClick={() => goToConcert(event)}
              >
                <div className="relative mb-4 overflow-hidden aspect-square bg-canvas-alt">
                  <img
                    src={event.image}
                    alt={event.title}
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ${
                      event.isClosed ? 'grayscale brightness-50' : 'brightness-90 group-hover:brightness-100'
                    }`}
                  />
                  {event.isClosed && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-2">
                      <span className="text-[10px] font-semibold text-white bg-rose-500 px-2.5 py-1 uppercase tracking-wider">
                        Tutup
                      </span>
                    </div>
                  )}
                  <button
                    aria-label="Simpan ke favorit"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center text-ink hover:bg-brand hover:text-white transition-colors cursor-pointer z-10"
                  >
                    <Heart size={14} />
                  </button>
                </div>
                
                <h4 className="text-base font-semibold tracking-tight leading-snug text-ink line-clamp-2 min-h-[44px]">
                  {event.title}
                </h4>
                <p className="text-xs text-muted mt-2">
                  {event.date}
                </p>
                <p className="text-xs text-muted truncate mt-0.5">
                  {event.venue}
                </p>
                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    {event.isClosed ? (
                      <span className="text-rose-400">Tutup</span>
                    ) : (
                      formatIDR(minPrice)
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
    </section>
  );
};

