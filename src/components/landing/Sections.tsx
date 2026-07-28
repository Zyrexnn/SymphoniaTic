import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Ticket, MapPin, Calendar, Info, ChevronRight, AlertCircle, Flame,
  Layers, Lock, HelpCircle,
} from 'lucide-react';
import { CONCERT_EVENTS, ARTISTS_LINEUP, FAQS, formatIDR } from './data';
import type { EventItem } from './data';

const CATEGORY_FILTERS = [
  { id: 'SEMUA', label: 'Semua Kategori' },
  { id: 'SIMFONI', label: 'Simfoni Utama' },
  { id: 'KAMAR MUSIK', label: 'Kamar Musik' },
  { id: 'BALET & OPERA', label: 'Balet & Opera' },
  { id: 'PADUAN SUARA', label: 'Paduan Suara' },
  { id: 'RESITAL PIANO', label: 'Resital Piano' },
  { id: 'PHILHARMONIC', label: 'Philharmonic' },
];

const GUIDE_STEPS = [
  { step: 1, title: 'Pilih Konser & Kategori', desc: 'Tentukan pertunjukan dan pilihan kategori tempat duduk (VIP, CAT 1, atau Festival). Maksimal 4 tiket dalam satu transaksi.' },
  { step: 2, title: 'Verifikasi Transaksi Instan', desc: 'Isi nama lengkap dan email Anda. Sistem langsung menerbitkan kode transaksi sah dan memverifikasi kuota secara aman.' },
  { step: 3, title: 'Tunjukkan E-Ticket Kode QR', desc: "Simpan E-Ticket ber-Kode QR QR-SYM di menu E-Ticket Saya dan tunjukkan di pintu masuk hall." },
];

interface SectionProps {
  onShowDetail: (event: EventItem) => void;
  onBuyTicket: (event: EventItem) => void;
}

export const ConcertCatalog: React.FC<SectionProps> = ({ onShowDetail, onBuyTicket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');

  const filteredEvents = CONCERT_EVENTS.filter((e) => {
    const matchCat = selectedCategory === 'SEMUA' || e.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || e.title.toLowerCase().includes(q) || e.artist.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <section id="concerts" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <div className="liquid-glass inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs text-blue-400 mb-3 border border-blue-500/30 font-medium">
            <Ticket className="w-3.5 h-3.5" /><span>JADWAL PERTUNJUKAN RESMI 2026</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white">Katalog Konser Simfoni & Tiket</h2>
          <p className="text-gray-400 text-xs sm:text-base mt-1.5 sm:mt-2 max-w-xl">Pilih pertunjukan favorit Anda. Klik tombol Info Detail untuk melihat jadwal lengkap atau Beli Tiket untuk memesan.</p>
        </div>
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input type="text" placeholder="Cari nama konser, artis, atau venue..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all shadow-inner" />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 sm:mb-8 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORY_FILTERS.map((cat) => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'liquid-glass text-gray-300 hover:text-white border border-white/10'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="liquid-glass rounded-3xl p-12 text-center text-gray-400 my-8">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">Konser Tidak Ditemukan</p>
          <p className="text-xs text-gray-400 mt-1">Coba kata kunci lain atau pilih kategori lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const minPrice = event.categories[0].price;
            const totalQuota = event.categories.reduce((a, c) => a + c.quota, 0);
            return (
              <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={event.id}
                className="liquid-glass liquid-glass-card rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group shadow-xl">
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f121d] via-[#0f121d]/40 to-transparent" />
                  <div className="absolute top-3.5 left-3.5">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border backdrop-blur-md uppercase tracking-wider ${event.categoryBadgeColor}`}>{event.category}</span>
                  </div>
                  {totalQuota <= 20 && (
                    <div className="absolute top-3.5 right-3.5 bg-red-950/80 backdrop-blur-md text-red-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-red-500/40 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-400 animate-pulse" /><span>Sisa {totalQuota} Tiket</span>
                    </div>
                  )}
                </div>
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-normal text-white group-hover:text-blue-400 transition-colors leading-snug">{event.title}</h3>
                    <p className="text-xs text-gray-300 mt-1 font-medium">{event.artist}</p>
                    <div className="mt-4 space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" /><span className="truncate">{event.venue}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" /><span>{event.date} - {event.time}</span></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">Harga Mulai</span>
                      <span className="text-sm sm:text-base font-bold text-white">{formatIDR(minPrice)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onShowDetail(event)} className="liquid-glass p-2.5 rounded-xl text-gray-300 hover:text-white transition-all cursor-pointer border border-white/10">
                        <Info className="w-4 h-4 text-blue-400" />
                      </button>
                      <button onClick={() => onBuyTicket(event)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1">
                        <span>Beli Tiket</span><ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export const ArtistLineup: React.FC = () => (
  <section id="lineup" className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
      <div className="liquid-glass inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs text-blue-400 mb-3 border border-blue-500/30 font-medium">
        <Layers className="w-3.5 h-3.5" /><span>SOLOIS & ORKESTRA RESMI</span>
      </div>
      <h2 className="text-2xl sm:text-4xl font-normal tracking-tight text-white">Jajaran Musikus & Orkestra Dunia</h2>
      <p className="text-xs sm:text-sm text-gray-400 mt-2">Diisi oleh konduktor ternama, solois biola/piano bertalenta tinggi, serta himpunan simfoni papan atas.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {ARTISTS_LINEUP.map((art, i) => (
        <div key={i} className="liquid-glass rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-blue-500/40 transition-all text-center group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-blue-500/40 group-hover:scale-105 transition-transform duration-300 shadow-xl">
            <img src={art.image} alt={art.name} className="w-full h-full object-cover" />
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-white">{art.name}</h4>
          <p className="text-xs text-blue-400 mt-0.5 font-medium">{art.genre}</p>
          <span className="inline-block mt-3 text-[10px] text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">{art.shows}</span>
        </div>
      ))}
    </div>
  </section>
);

export const SecurityMetrics: React.FC = () => (
  <section id="ticket-war" className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
    <div className="liquid-glass liquid-glass-accent rounded-3xl p-6 sm:p-8 md:p-12 border border-blue-500/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/60 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-700/40 font-semibold">
            <Lock className="w-3.5 h-3.5" /><span>TRANSAKSI ATOMIC DENGAN ROW LOCKING</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-normal text-white">Keamanan & Kepastian Kuota Tiket</h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            SymphoniaTic mengintegrasikan transaksi basis data Go-Fiber dengan mekanisme penguncian <code className="text-blue-400 font-mono">FOR UPDATE</code>. Setiap kuota yang dibeli dijamin tidak mengalami alokasi ganda (overbooking) walaupun dipesan bersamaan.
          </p>
        </div>
        <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: 'Total Pendapatan Terverifikasi', value: 'Rp 485.5M', color: 'text-emerald-400' },
            { label: 'Tiket Terjual', value: '1.420 / 1.708', color: 'text-white' },
            { label: 'Sisa Kuota Aktif', value: '288 Kursi', color: 'text-blue-400' },
            { label: 'Tingkat Pemindaian Gate', value: '99,8% Akurat', color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 text-center">
              <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider block font-medium">{s.label}</span>
              <span className={`text-lg sm:text-2xl font-bold ${s.color} mt-1 block`}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export const ETicketGuide: React.FC = () => (
  <section id="guide" className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-white/10">
    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
      <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">Panduan Pemesanan & Akses Masuk</h2>
      <p className="text-xs sm:text-sm text-gray-400 mt-2">3 langkah mudah mendapatkan tiket resmi hingga memasuki hall konser.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      {GUIDE_STEPS.map(({ step, title, desc }) => (
        <div key={step} className="liquid-glass rounded-3xl p-5 sm:p-6 border border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-base mb-4">{step}</div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export const FAQSection: React.FC = () => (
  <section id="faq" className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto border-t border-white/10">
    <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
      <div className="liquid-glass inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-blue-400 mb-3 border border-blue-500/20">
        <HelpCircle className="w-3.5 h-3.5" /><span>PERTANYAAN UMUM</span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white">Tanya Jawab Pengunjung</h2>
    </div>
    <div className="space-y-3 sm:space-y-4">
      {FAQS.map((faq, i) => (
        <div key={i} className="liquid-glass rounded-2xl p-4 sm:p-5 border border-white/10 space-y-2">
          <h4 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
            <span className="text-blue-400">Q.</span><span>{faq.q}</span>
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed pl-6">{faq.a}</p>
        </div>
      ))}
    </div>
  </section>
);
