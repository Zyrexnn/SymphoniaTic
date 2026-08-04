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
    <>
      {/* Section Header */}
      <section id="concerts" className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pt-16 pb-[100px] md:pb-[120px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/15 text-[11px] font-mono text-[#9a9a9a] uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-pulse" />
              <span>↓ 01 // KATALOG &amp; INFRASTRUKTUR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.03em] text-white m-0">
              Jelajahi Simfoni &amp; Sistem Gate Pilihan.
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-light text-[#9a9a9a] max-w-md leading-relaxed font-mono">
            Integrasi langsung antara ansambel orkestra kelas dunia dan platform tiket berkecepatan tinggi dengan verifikasi instan.
          </p>
        </div>

        {/* Desktop Bento Grid */}
        <div className="hidden md:grid grid-cols-12 gap-5 auto-rows-[220px]">
          {/* FEATURED (8 cols, 2 rows) */}
          <div
            className="col-span-8 row-span-2 relative overflow-hidden cursor-pointer group border border-white/10 hover:border-white/30 transition-all duration-500 bg-[#171717]"
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
              <span className="text-[10px] font-mono tracking-widest text-[#9a9a9a] bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/15 uppercase">
                [ KONSER UTAMA ]
              </span>
              {featured?.categories?.[0] && (
                <span className="text-xs font-mono tracking-wider text-white bg-[#171717]/90 px-3 py-1.5 border border-white/20">
                  Mulai {formatIDR(featured.categories[0].price)}
                </span>
              )}
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <div className="flex items-center gap-3 text-xs font-mono text-[#9a9a9a] uppercase tracking-wider mb-2">
                <span>{featured?.date}</span>
                <span>•</span>
                <span>{featured?.time}</span>
                <span>•</span>
                <span className="text-white">{featured?.venue}</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-light text-white tracking-[-0.03em] leading-tight group-hover:text-white/95 transition-colors">
                {featured?.title}
              </h3>
              <p className="text-sm font-light text-[#9a9a9a] mt-2 max-w-xl line-clamp-1">
                {featured?.artist}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                <span>Detail Konser &amp; Tiket</span>
                <ArrowUpRight size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* FEATURED ARTIST (4 cols, 2 rows) */}
          <div id="lineup" className="col-span-4 row-span-2 relative overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 bg-[#171717] group">
            <img
              src={ARTISTS_LINEUP[0].image}
              alt={ARTISTS_LINEUP[0].name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/30 to-transparent" />
            
            <div className="absolute top-6 left-6 z-10">
              <span className="text-[10px] font-mono tracking-widest text-[#9a9a9a] bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/15 uppercase">
                [ ARTIS MUSIM INI ]
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <p className="text-xs font-mono text-[#9a9a9a] uppercase tracking-wider mb-1">
                Orkestra Pilihan 2026
              </p>
              <h3 className="text-xl lg:text-2xl font-light text-white tracking-tight leading-snug">
                {ARTISTS_LINEUP[0].name}
              </h3>
              <p className="text-xs font-light text-[#9a9a9a] mt-2 leading-relaxed">
                Menghadirkan harmoni ansambel simfoni legendaris secara eksklusif.
              </p>
            </div>
          </div>

          {/* SECONDARY CONCERT (5 cols) */}
          {rest[0] && (
            <div
              className="col-span-5 relative overflow-hidden cursor-pointer group border border-white/10 hover:border-white/30 transition-all duration-500 bg-[#171717]"
              onClick={() => goToConcert(rest[0])}
            >
              <img
                src={rest[0].image}
                alt={rest[0].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-85 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#9a9a9a] mb-1.5">
                  <span>{rest[0].date}</span>
                </div>
                <h4 className="text-lg font-light text-white tracking-tight line-clamp-1">
                  {rest[0].title}
                </h4>
                <p className="text-xs font-mono text-white/80 mt-1">
                  Mulai {formatIDR(rest[0].categories?.[0]?.price ?? 0)}
                </p>
              </div>
            </div>
          )}

          {/* METRIC TILE (4 cols) */}
          <div id="ticket-war" className="col-span-4 flex flex-col justify-between p-6 border border-white/10 hover:border-white/30 bg-[#171717] transition-all group relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-[#9a9a9a] uppercase">
                [ INFRASTRUKTUR GATE ]
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Sistem Aktif" />
            </div>
            
            <div className="my-2">
              <div className="flex items-baseline gap-2">
                <p className="text-4xl lg:text-5xl font-mono font-light text-white tracking-tighter">
                  99,8%
                </p>
                <span className="text-xs font-mono text-emerald-400">AKURASI</span>
              </div>
              <div className="w-full bg-white/10 h-1 mt-3 overflow-hidden">
                <div className="bg-white h-full w-[99.8%]" />
              </div>
            </div>

            <p className="text-xs font-light text-[#9a9a9a] leading-relaxed">
              Pemindaian E-Ticket real-time dengan validasi atomic untuk menjamin zero overbooking.
            </p>
          </div>

          {/* SECONDARY CONCERT 2 (3 cols) */}
          {rest[1] && (
            <div
              className="col-span-3 relative overflow-hidden cursor-pointer group border border-white/10 hover:border-white/30 transition-all duration-500 bg-[#171717]"
              onClick={() => goToConcert(rest[1])}
            >
              <img
                src={rest[1].image}
                alt={rest[1].title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 brightness-85 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <h4 className="text-base font-light text-white tracking-tight truncate">
                  {rest[1].title}
                </h4>
                <p className="text-xs font-mono text-[#9a9a9a] mt-1">{rest[1].date}</p>
              </div>
            </div>
          )}

          {/* STEP 1 (4 cols) */}
          <div id="guide" className="col-span-4 flex flex-col justify-between p-6 border border-white/10 hover:border-white/30 bg-[#171717] transition-colors">
            <span className="text-xs font-mono text-[#9a9a9a] uppercase tracking-widest">
              01 // SELEKSI
            </span>
            <div className="mt-4">
              <h4 className="text-lg font-light text-white tracking-tight mb-1">
                Pilih Konser &amp; Kategori
              </h4>
              <p className="text-xs font-light text-[#9a9a9a] leading-relaxed">
                Tentukan pertunjukan simfoni impian dan pilih zona tempat duduk terbaik (maks. 4 tiket/transaksi).
              </p>
            </div>
          </div>

          {/* STEP 2 (4 cols) */}
          <div className="col-span-4 flex flex-col justify-between p-6 border border-white/10 hover:border-white/30 bg-[#171717] transition-colors">
            <span className="text-xs font-mono text-[#9a9a9a] uppercase tracking-widest">
              02 // TRANSAKSI
            </span>
            <div className="mt-4">
              <h4 className="text-lg font-light text-white tracking-tight mb-1">
                Verifikasi Atomic Instan
              </h4>
              <p className="text-xs font-light text-[#9a9a9a] leading-relaxed">
                Sistem secara otomatis mengunci kuota tiket dan menerbitkan kode verifikasi unik secara real-time.
              </p>
            </div>
          </div>

          {/* STEP 3 (4 cols) */}
          <div className="col-span-4 flex flex-col justify-between p-6 border border-white/10 hover:border-white/30 bg-[#171717] transition-colors">
            <span className="text-xs font-mono text-[#9a9a9a] uppercase tracking-widest">
              03 // AKSES
            </span>
            <div className="mt-4">
              <h4 className="text-lg font-light text-white tracking-tight mb-1">
                Scan E-Ticket QR Code
              </h4>
              <p className="text-xs font-light text-[#9a9a9a] leading-relaxed">
                Tunjukkan QR Code terenkripsi di pintu masuk hall untuk akses masuk serba cepat tanpa antrean fisik.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-6 mt-6">
          {featured && (
            <div
              className="relative overflow-hidden h-[340px] cursor-pointer group border border-white/15 bg-[#171717]"
              onClick={() => featured && goToConcert(featured)}
            >
              <img src={featured.image} alt={featured.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/50 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="text-[10px] font-mono text-[#9a9a9a] bg-black/60 border border-white/15 px-2.5 py-1">
                  KONSER UTAMA
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-mono text-[#9a9a9a] mb-1">{featured.date} · {featured.time}</p>
                <h3 className="text-xl font-light text-white leading-snug">{featured.title}</h3>
                <p className="text-xs font-light text-[#9a9a9a] mt-1">{featured.artist}</p>
              </div>
            </div>
          )}

          {rest.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="relative overflow-hidden h-[200px] cursor-pointer group border border-white/10 bg-[#171717]"
              onClick={() => goToConcert(event)}
            >
              <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover brightness-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h4 className="text-lg font-light text-white truncate">{event.title}</h4>
                <p className="text-xs font-mono text-[#9a9a9a] mt-1">{event.date} • {event.venue}</p>
              </div>
            </div>
          ))}

          {/* Metric in mobile */}
          <div className="p-6 border border-white/10 bg-[#171717]">
            <span className="text-[10px] font-mono text-[#9a9a9a] uppercase tracking-widest">[ METRIK GATE ]</span>
            <p className="text-4xl font-mono text-white tracking-tighter mt-2">99,8%</p>
            <p className="text-xs font-light text-[#9a9a9a] mt-2">Pemindaian QR real-time tanpa overbooking.</p>
          </div>

          {/* Steps in mobile */}
          <div className="grid grid-cols-1 gap-4">
            {[
              { num: '01', title: 'Pilih Konser', desc: 'Pilih pertunjukan & kategori tempat duduk.' },
              { num: '02', title: 'Verifikasi Instan', desc: 'Sistem atomic mengunci transaksi.' },
              { num: '03', title: 'Tunjukkan QR Code', desc: 'Scan tiket digital di gate masuk hall.' },
            ].map((step) => (
              <div key={step.num} className="p-5 border border-white/10 bg-[#171717]">
                <p className="text-xs font-mono text-[#9a9a9a] mb-1">{step.num} // PROSES</p>
                <h4 className="text-base font-light text-white">{step.title}</h4>
                <p className="text-xs font-light text-[#9a9a9a] mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Title Header */}
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 pb-6 flex items-baseline justify-between border-t border-white/10 pt-12">
        <div>
          <span className="text-[11px] font-mono text-[#9a9a9a] uppercase tracking-widest block mb-1">
            ↓ 02 // AGENDAKAN KUNJUNGAN
          </span>
          <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight">
            Semua Jadwal Konser
          </h3>
        </div>
        <a
          href="/events"
          className="text-xs sm:text-sm font-mono text-[#9a9a9a] hover:text-white transition-colors uppercase tracking-wider inline-flex items-center gap-1"
        >
          <span>Lihat Semua</span>
          <ArrowUpRight size={14} />
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
                className="cursor-pointer group shrink-0 w-[240px] md:w-[280px] snap-start border border-white/10 hover:border-white/30 p-4 bg-[#171717] transition-all duration-300"
                onClick={() => goToConcert(event)}
              >
                <div className="relative mb-4 overflow-hidden aspect-square border border-white/10 bg-black/40">
                  <img
                    src={event.image}
                    alt={event.title}
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ${
                      event.isClosed ? 'grayscale brightness-50' : 'brightness-90 group-hover:brightness-100'
                    }`}
                  />
                  {event.isClosed && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-2">
                      <span className="text-[10px] font-mono text-rose-300 bg-rose-950/90 border border-rose-500/40 px-2.5 py-1 uppercase tracking-widest">
                        DITUTUP
                      </span>
                    </div>
                  )}
                  <button
                    aria-label="Simpan ke favorit"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-none bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#171717] transition-colors cursor-pointer z-10"
                  >
                    <Heart size={14} />
                  </button>
                </div>
                
                <h4 className="text-base tracking-tight font-light leading-snug text-white line-clamp-2 min-h-[44px]">
                  {event.title}
                </h4>
                <p className="text-xs font-mono text-[#9a9a9a] mt-2">
                  {event.date}
                </p>
                <p className="text-xs font-light text-[#9a9a9a] truncate mt-0.5">
                  {event.venue}
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-[#9a9a9a]">HARGA</span>
                  <span className="font-mono text-white font-normal">
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
  );
};

