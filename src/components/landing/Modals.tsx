import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Clock, ChevronRight, ShieldCheck, User, Mail,
  CheckCircle2, QrCode, Ticket, BarChart3,
} from 'lucide-react';
import { formatIDR } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';

// ════════════════════════════════════════════════════════════════════
// DETAIL CONCERT MODAL
// ════════════════════════════════════════════════════════════════════
type DetailTab = 'INFO' | 'RUNDOWN' | 'BENEFITS' | 'TERMS';
const TABS: { id: DetailTab; label: string }[] = [
  { id: 'INFO', label: 'Informasi & Lokasi' },
  { id: 'RUNDOWN', label: 'Rangkaian Acara' },
  { id: 'BENEFITS', label: 'Kategori & Benefit' },
  { id: 'TERMS', label: 'Syarat & Ketentuan' },
];

interface DetailProps { event: EventItem; onClose: () => void; onBuyTicket: (e: EventItem) => void; }

export const DetailConcertModal: React.FC<DetailProps> = ({ event, onClose, onBuyTicket }) => {
  const [tab, setTab] = useState<DetailTab>('INFO');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#0f121d] text-white rounded-3xl overflow-hidden border border-white/15 shadow-2xl my-auto relative flex flex-col max-h-[92vh]">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 liquid-glass p-2.5 rounded-full text-white hover:bg-white/20 transition-all cursor-pointer border border-white/20">
          <X className="w-5 h-5" />
        </button>
        <div className="relative h-52 sm:h-72 w-full shrink-0">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f121d] via-[#0f121d]/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border backdrop-blur-md ${event.categoryBadgeColor}`}>{event.category}</span>
            <h2 className="text-xl sm:text-3xl font-bold text-white mt-2 leading-tight">{event.title}</h2>
            <p className="text-xs sm:text-sm text-blue-300 mt-1 font-medium line-clamp-1">{event.subtitle}</p>
          </div>
        </div>
        <div className="flex border-b border-white/10 px-4 sm:px-6 bg-gray-950/60 shrink-0 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`py-3.5 px-3.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${tab === t.id ? 'border-blue-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {tab === 'INFO' && (
            <div className="space-y-6">
              <div><h4 className="text-sm font-semibold text-white mb-2">Deskripsi Mahakarya</h4><p className="text-gray-300 leading-relaxed text-xs">{event.description}</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                {[['Penyelenggara', event.organizer], ['Konduktor & Solois', event.conductor], ['Jadwal Tanggal', event.date], ['Waktu Konser', `${event.time} (Open Gate ${event.openGate})`]].map(([l, v]) => (
                  <div key={l} className="space-y-1"><span className="text-[10px] text-gray-400 block uppercase font-medium">{l}</span><span className="text-white font-medium block">{v}</span></div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /><span>Detail Lokasi Venue</span></h4>
                <p className="text-white font-semibold text-xs">{event.venue}</p><p className="text-gray-400 text-xs mt-0.5">{event.address}</p>
              </div>
            </div>
          )}
          {tab === 'RUNDOWN' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /><span>Rangkaian Acara (Rundown Konser)</span></h4>
              <div className="space-y-2.5">
                {event.rundown.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-mono text-blue-400 font-bold shrink-0 w-20 text-xs">{item.time}</span>
                    <span className="text-gray-200 font-medium text-xs">{item.activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'BENEFITS' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white mb-2">Pilihan Kategori Tiket & Benefit Kursi</h4>
              <div className="space-y-3">
                {event.categories.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between"><span className="font-bold text-white text-sm">{cat.name}</span><span className="font-bold text-blue-400 text-sm">{formatIDR(cat.price)}</span></div>
                    <span className="text-[10px] text-emerald-400 block font-semibold">Sisa Kuota: {cat.quota} Tempat Duduk</span>
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-400 block font-medium">Fasilitas Termasuk:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {cat.benefits.map((b, i) => (<span key={i} className="bg-blue-950/60 text-blue-200 text-[10px] px-2.5 py-0.5 rounded-full border border-blue-800/40">{b}</span>))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === 'TERMS' && (
            <div className="space-y-3 text-gray-300 text-xs">
              <h4 className="text-sm font-semibold text-white mb-2">Syarat & Ketentuan Pembelian Tiket</h4>
              <ul className="list-disc pl-5 space-y-2 leading-relaxed">
                <li>Setiap akun/identitas pemesan hanya diperbolehkan membeli maksimal 4 tiket dalam 1 transaksi resmi.</li>
                <li>Pengunjung wajib menggunakan pakaian Rapi &amp; Sopan (Smart Casual / Formal). Pengunjung berpakaian celana pendek atau sandal jepit tidak diizinkan masuk.</li>
                <li>Anak-anak berusia di bawah 7 tahun tidak diperkenankan memasuki arena pertunjukan simfoni.</li>
                <li>E-Ticket resmi ber-Kode QR <code className="text-blue-400 font-mono">QR-SYM</code> wajib ditunjukkan dari smartphone pada saat registrasi Open Gate di lokasi.</li>
                <li>Tiket yang sudah dibeli tidak dapat ditukarkan uang tunai (non-refundable), namun dapat dipindahtangankan dengan konfirmasi data identitas.</li>
              </ul>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 bg-gray-950 border-t border-white/10 flex items-center justify-between shrink-0">
          <div><span className="text-[10px] text-gray-400 block font-medium">Harga Mulai Dari</span><span className="text-sm sm:text-base font-bold text-white">{formatIDR(event.categories[0].price)}</span></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onClose} className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs text-gray-400 hover:text-white transition-all">Tutup</button>
            <button onClick={() => { onBuyTicket(event); onClose(); }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 sm:px-6 rounded-xl transition-all shadow-lg cursor-pointer active:scale-95 flex items-center gap-1.5">
              <span>Lanjut Pesan Tiket</span><ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// BOOKING MODAL
// ════════════════════════════════════════════════════════════════════
interface BookingProps { event: EventItem; initialCategory: TicketCategory; onClose: () => void; onSubmit: (order: OrderRecord) => void; }

export const BookingModal: React.FC<BookingProps> = ({ event, initialCategory, onClose, onSubmit }) => {
  const [selectedCat, setSelectedCat] = useState<TicketCategory>(initialCategory);
  const [quantity, setQuantity] = useState(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    const num = Math.floor(100000 + Math.random() * 900000);
    const code = `SYM-${num}`;
    onSubmit({
      orderCode: code, eventTitle: event.title, artist: event.artist, venue: event.venue,
      date: `${event.date} @ ${event.time}`, categoryName: selectedCat.name, quantity,
      totalPrice: selectedCat.price * quantity, userName, userEmail, qrCode: `QR-SYM-${code}`,
      status: 'VERIFIED', expiresAt: '30 Menit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0f121d] text-white rounded-3xl p-5 sm:p-6 border border-white/15 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 liquid-glass p-2 rounded-xl text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
        <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-500" /><h3 className="text-base sm:text-lg font-bold">Pilih Tempat Duduk & Tiket</h3></div>
        <p className="text-xs text-blue-300 mt-1 font-semibold truncate">{event.title}</p>

        <div className="my-4 p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="text-center bg-blue-600/30 text-blue-300 py-1.5 rounded-lg border border-blue-500/40 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">STAGE / PANGGUNG UTAMA ORKESTRA</div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold">
            {event.categories.map((cat, idx) => {
              const labels = ['VIP Pit', 'CAT 1', 'Festival'];
              const sublabels = ['Depan Tengah', 'Balkon Utama', 'Lantai Utama'];
              return (
                <button type="button" key={cat.id} onClick={() => setSelectedCat(cat)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${selectedCat.name === cat.name ? 'border-blue-500 bg-blue-600/30 text-white shadow-lg' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}>
                  <div className="font-bold">{labels[idx] || cat.name}</div>
                  <div className="text-[9px] text-blue-400 mt-0.5">{sublabels[idx] || ''}</div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-300 font-medium block mb-1.5">Kategori Yang Dipilih</label>
            <div className="grid grid-cols-1 gap-2">
              {event.categories.map((cat) => (
                <button type="button" key={cat.id} onClick={() => setSelectedCat(cat)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${selectedCat.id === cat.id ? 'border-blue-500 bg-blue-950/50 text-white shadow-md' : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'}`}>
                  <div><div className="font-bold text-white">{cat.name}</div><div className="text-[10px] text-emerald-400 mt-0.5">Sisa {cat.quota} kursi kuota</div></div>
                  <div className="font-bold text-white">{formatIDR(cat.price)}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5"><label className="text-xs text-gray-300 font-medium">Jumlah Tiket</label><span className="text-[10px] text-blue-400 font-semibold">Maks. 4 tiket/transaksi</span></div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button type="button" key={num} onClick={() => setQuantity(num)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${quantity === num ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'}`}>
                  {num} Tiket
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs text-gray-300 font-medium block mb-1">Nama Lengkap Pemesan</label>
              <div className="relative"><User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input type="text" required placeholder="Contoh: Budi Santoso" value={userName} onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div><label className="text-xs text-gray-300 font-medium block mb-1">Alamat Email Aktif</label>
              <div className="relative"><Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input type="email" required placeholder="budi@example.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
            <div><span className="text-[10px] text-gray-400 block uppercase font-medium">Total Pembayaran</span><span className="text-sm sm:text-base font-bold text-white">{formatIDR(selectedCat.price * quantity)}</span></div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer">Konfirmasi & Terbitkan Pass</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// E-TICKET CONFIRMATION
// ════════════════════════════════════════════════════════════════════
interface ConfirmProps { order: OrderRecord; onClose: () => void; }

export const ETicketConfirmation: React.FC<ConfirmProps> = ({ order, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm bg-[#0f121d] text-white rounded-3xl p-6 border border-blue-500/40 shadow-2xl text-center relative my-auto">
      <button onClick={onClose} className="absolute top-4 right-4 liquid-glass p-2 rounded-xl text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg"><CheckCircle2 className="w-6 h-6" /></div>
      <h3 className="text-lg font-bold text-white mt-3">E-Ticket Resmi Terbit!</h3>
      <p className="text-xs text-gray-400 mt-0.5">Kode Order: <span className="font-mono text-blue-400 font-bold">{order.orderCode}</span></p>
      <div className="my-5 p-4 bg-white rounded-2xl max-w-[200px] mx-auto shadow-inner flex flex-col items-center">
        <QrCode className="w-32 h-32 text-gray-900" />
        <span className="text-[10px] font-mono text-gray-800 mt-2 font-bold tracking-wider">{order.qrCode}</span>
      </div>
      <div className="text-left bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-1.5 text-xs">
        {[
          ['Nama Konser:', order.eventTitle],
          ['Kategori Kursi:', `${order.categoryName} (${order.quantity}x)`],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-gray-400"><span>{l}</span><span className="text-white font-semibold truncate max-w-[170px]">{v}</span></div>
        ))}
        <div className="flex justify-between text-gray-400"><span>Total Bayar:</span><span className="text-emerald-400 font-bold">{formatIDR(order.totalPrice)}</span></div>
      </div>
      <button onClick={onClose} className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-lg">Simpan & Selesai</button>
    </motion.div>
  </div>
);

// ════════════════════════════════════════════════════════════════════
// ORDERS DRAWER
// ════════════════════════════════════════════════════════════════════
interface OrdersProps { orders: OrderRecord[]; onClose: () => void; onShowTicket: (o: OrderRecord) => void; }

export const OrdersDrawer: React.FC<OrdersProps> = ({ orders, onClose, onShowTicket }) => (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="w-full max-w-md bg-[#0f121d] text-white h-full flex flex-col p-6 overflow-y-auto border-l border-white/10 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2"><QrCode className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-bold tracking-tight">E-Ticket Aktif Saya</h2></div>
        <button onClick={onClose} className="liquid-glass p-2 rounded-xl text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
          <Ticket className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-sm font-semibold text-white">Belum Ada E-Ticket</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">Anda belum memesan tiket konser. Jelajahi katalog konser dan dapatkan tempat duduk terbaik Anda!</p>
          <a href="#concerts" onClick={onClose} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all inline-block shadow-lg">Jelajahi Konser</a>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {orders.map((ord, idx) => (
            <div key={idx} className="liquid-glass rounded-2xl p-4 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 font-bold">{ord.orderCode}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">{ord.status}</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">{ord.eventTitle}</h4>
              <p className="text-xs text-gray-300">{ord.artist}</p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                <div><span className="text-gray-400 block text-[10px]">Kategori</span><span className="text-white font-medium">{ord.categoryName} ({ord.quantity}x)</span></div>
                <button onClick={() => onShowTicket(ord)} className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"><QrCode className="w-3.5 h-3.5" /><span>Tampilkan QR</span></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  </div>
);

// ════════════════════════════════════════════════════════════════════
// ADMIN DRAWER
// ════════════════════════════════════════════════════════════════════
interface AdminProps { onClose: () => void; }

export const AdminDrawer: React.FC<AdminProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="w-full max-w-md bg-[#0f121d] text-white h-full flex flex-col p-6 overflow-y-auto border-l border-white/10 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" /><h2 className="text-xl font-bold tracking-tight">Portal Metrik Admin</h2></div>
        <button onClick={onClose} className="liquid-glass p-2 rounded-xl text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="mt-4 space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1">
          <span className="text-gray-400 font-medium">Rest API Endpoint:</span>
          <p className="font-mono text-blue-400 font-semibold">GET /api/v1/admin/dashboard</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Total Pendapatan', 'Rp 485.500.000', 'text-emerald-400'],
            ['Tiket Terjual', '1.420', 'text-white'],
            ['Sisa Kuota Kursi', '288', 'text-blue-400'],
            ['Perlu Verifikasi', '12 Order', 'text-amber-400'],
          ].map(([l, v, c]) => (
            <div key={l} className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-gray-400 block font-medium">{l}</span>
              <span className={`text-base font-bold ${c}`}>{v}</span>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <h4 className="font-bold text-white">Proteksi Transaksi Basis Data</h4>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            Setiap verifikasi pesanan mengeksekusi <code className="text-blue-400 font-mono">db.Begin()</code> dengan penguncian <code className="text-blue-400 font-mono">FOR UPDATE</code> untuk mencegah alokasi ganda kuota saat lonjakan pembelian tiket.
          </p>
        </div>
      </div>
    </motion.div>
  </div>
);
