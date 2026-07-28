import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  X, MapPin, Clock, ChevronRight, ShieldCheck, User, Mail,
  CheckCircle2, QrCode, Ticket, BarChart3, Download, Search, Copy, Check, Sparkles,
} from 'lucide-react';
import { formatIDR, createOrderAPI, lookupTicketAPI } from './data';
import type { EventItem, TicketCategory, OrderRecord } from './data';
import { AdminDashboard } from './AdminDashboard';


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
                {(event.rundown || []).map((item, idx) => (
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
                {(event.categories || []).map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between"><span className="font-bold text-white text-sm">{cat.name}</span><span className="font-bold text-blue-400 text-sm">{formatIDR(cat.price)}</span></div>
                    <span className="text-[10px] text-emerald-400 block font-semibold">Sisa Kuota: {cat.quota} Tempat Duduk</span>
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[10px] text-gray-400 block font-medium">Fasilitas Termasuk:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(cat.benefits || []).map((b, i) => (<span key={i} className="bg-blue-950/60 text-blue-200 text-[10px] px-2.5 py-0.5 rounded-full border border-blue-800/40">{b}</span>))}
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
          <div><span className="text-[10px] text-gray-400 block font-medium">Harga Mulai Dari</span><span className="text-sm sm:text-base font-bold text-white">{formatIDR(event.categories && event.categories.length > 0 ? event.categories[0].price : 0)}</span></div>
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || !selectedCat) return;
    setIsSubmitting(true);
    try {
      const res = await createOrderAPI({
        eventId: String(event.id),
        ticketCategoryId: selectedCat.id,
        quantity,
        userName,
        userEmail,
      });

      if (res.success && res.data) {
        onSubmit(res.data);
      } else {
        alert(res.message || 'Gagal membuat pesanan tiket');
      }
    } catch (err) {
      alert('Gagal terhubung ke backend server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-gradient-to-b from-[#111627] via-[#0c0f1d] to-[#070912] text-white rounded-3xl p-5 sm:p-7 border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative my-auto max-h-[92vh] overflow-y-auto flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 pr-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold tracking-wider uppercase mb-1">
              <Sparkles className="w-3 h-3" />
              <span>PEMESANAN TIKET INSTAN</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">{event.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{event.artist} • {event.venue}</p>
          </div>
          <button onClick={onClose} className="absolute top-5 right-5 liquid-glass p-2 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer border border-white/15 active:scale-95">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stage Visualization Layout */}
        <div className="my-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
          <div className="relative overflow-hidden text-center bg-gradient-to-r from-blue-900/40 via-blue-600/40 to-blue-900/40 text-blue-200 py-2 rounded-xl border border-blue-500/40 text-[10px] font-extrabold tracking-widest uppercase shadow-inner">
            <div className="absolute inset-0 bg-blue-500/10 blur-sm pointer-events-none" />
            <span>🎭 PANGGUNG UTAMA ORKESTRA (STAGE)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs font-semibold pt-1">
            {event.categories.map((cat, idx) => {
              const labels = ['VIP Pit', 'CAT 1', 'Festival'];
              const sublabels = ['Depan Panggung', 'Balkon Utama', 'Lantai Utama'];
              const isSelected = selectedCat.id === cat.id;
              return (
                <button type="button" key={cat.id} onClick={() => setSelectedCat(cat)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden text-left flex sm:flex-col justify-between items-center sm:items-start ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/25 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] ring-1 ring-blue-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'
                  }`}>
                  <div>
                    <div className="font-bold text-white text-xs">{labels[idx] || cat.name}</div>
                    <div className="text-[10px] text-blue-400 mt-0.5 font-medium">{sublabels[idx] || ''}</div>
                  </div>
                  <div className="font-bold text-emerald-400 text-xs sm:mt-2">{formatIDR(cat.price)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Opsi Kategori Details */}
          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-2">Pilih Kategori Kursi & Tiket</label>
            <div className="space-y-2">
              {event.categories.map((cat) => (
                <button type="button" key={cat.id} onClick={() => setSelectedCat(cat)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedCat.id === cat.id
                      ? 'border-blue-500 bg-blue-950/60 text-white shadow-md ring-1 ring-blue-500/50'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedCat.id === cat.id ? 'border-blue-400 bg-blue-600' : 'border-gray-500'}`}>
                      {selectedCat.id === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs sm:text-sm">{cat.name}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">Tersedia: {cat.quota} Kursi</div>
                    </div>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm">{formatIDR(cat.price)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Opsi Jumlah Tiket */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-300 font-semibold">Jumlah Tiket</label>
              <span className="text-[10px] text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">Maks. 4 tiket / transaksi</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button type="button" key={num} onClick={() => setQuantity(num)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    quantity === num
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}>
                  {num} Tiket
                </button>
              ))}
            </div>
          </div>

          {/* Input Data Pembeli */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-gray-300 font-semibold block mb-1">Nama Lengkap Pemesan</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input type="text" required placeholder="Masukkan nama lengkap Anda" value={userName} onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-300 font-semibold block mb-1">Alamat Email Aktif</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input type="email" required placeholder="nama@email.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Total & Submit Button */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <div>
              <span className="text-[10px] text-gray-400 block uppercase font-semibold">Total Pembayaran</span>
              <span className="text-lg font-bold text-emerald-400">{formatIDR(selectedCat.price * quantity)}</span>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2">
              <span>Konfirmasi & Terbitkan Pass</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// E-TICKET CONFIRMATION (WITH PDF & PNG DOWNLOAD)
// ════════════════════════════════════════════════════════════════════
interface ConfirmProps { order: OrderRecord; onClose: () => void; }

export const ETicketConfirmation: React.FC<ConfirmProps> = ({ order, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const drawTicketCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background Gradient & Pattern
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#111728');
    grad.addColorStop(0.5, '#0b0f1a');
    grad.addColorStop(1, '#06080e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Radial Accent
    const glow = ctx.createRadialGradient(width - 100, 100, 10, width - 100, 100, 300);
    glow.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    glow.addColorStop(1, 'rgba(37, 99, 235, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Outer Border
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Header Branding
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.roundRect(60, 60, 50, 50, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('S', 76, 96);

    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('SymphoniaTic Pass', 125, 93);

    // Verified Badge
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width - 240, 70, 180, 34, 17);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('VERIFIED TICKET', width - 215, 92);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 135);
    ctx.lineTo(width - 60, 135);
    ctx.stroke();

    // Pertunjukan Resmi Badge
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('PERTUNJUKAN RESMI', 60, 170);

    // Concert Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(order.eventTitle, 60, 210);

    // Artist Subtitle
    ctx.fillStyle = '#9ca3af';
    ctx.font = '500 18px sans-serif';
    ctx.fillText(order.artist, 60, 240);

    // Info Grid Boxes Helper
    const drawBox = (x: number, y: number, w: number, h: number, label: string, value: string, valColor = '#ffffff') => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(label.toUpperCase(), x + 16, y + 26);

      ctx.fillStyle = valColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(value, x + 16, y + 54);
    };

    drawBox(60, 270, 330, 75, 'Tanggal & Waktu', order.date);
    drawBox(410, 270, 330, 75, 'Venue / Hall', order.venue);

    drawBox(60, 360, 330, 75, 'Pemegang Tiket', order.userName);
    drawBox(410, 360, 330, 75, 'Kategori Kursi', `${order.categoryName} (${order.quantity}x)`, '#34d399');

    // Dashed Line Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(60, 470);
    ctx.lineTo(width - 60, 470);
    ctx.stroke();
    ctx.setLineDash([]);

    // QR Code Container Box
    const qrBoxSize = 240;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 500;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
    ctx.fill();

    // Draw Simulated Clean High-Res QR Graphic on Canvas
    const qrPad = 25;
    const qrInnerSize = qrBoxSize - qrPad * 2;
    const qrX = qrBoxX + qrPad;
    const qrY = qrBoxY + qrPad;

    ctx.fillStyle = '#111827';
    // Position Detection Patterns (Corners)
    const drawQRFinder = (fx: number, fy: number) => {
      ctx.fillRect(fx, fy, 45, 45);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 7, fy + 7, 31, 31);
      ctx.fillStyle = '#111827';
      ctx.fillRect(fx + 14, fy + 14, 17, 17);
    };

    drawQRFinder(qrX, qrY);
    drawQRFinder(qrX + qrInnerSize - 45, qrY);
    drawQRFinder(qrX, qrY + qrInnerSize - 45);

    // Random QR Data Grid Pattern
    ctx.fillStyle = '#111827';
    const gridSize = 12;
    const cellSize = qrInnerSize / gridSize;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip corner finders
        if ((r < 4 && c < 4) || (r < 4 && c >= 8) || (r >= 8 && c < 4)) continue;
        if ((r + c * 3 + order.orderCode.length) % 3 === 0) {
          ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize - 1.5, cellSize - 1.5);
        }
      }
    }

    // Order Code Below QR
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(order.orderCode, width / 2, 780);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px sans-serif';
    ctx.fillText('Tunjukkan QR Code ini di pintu pemeriksaan gate', width / 2, 810);

    // Footer Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SYMPHONIATIC OFFICIAL PASS • NON-TRANSFERABLE WITHOUT AUTHORIZATION', width / 2, 930);

    return canvas;
  };

  const handleDownloadPNG = async () => {
    setIsDownloading('PNG');
    try {
      const canvas = drawTicketCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `E-Ticket-${order.orderCode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading('PDF');
    try {
      const canvas = drawTicketCanvas();
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPos = (pdfWidth - imgWidth) / 2;

      pdf.setFillColor(6, 8, 14);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(imgData, 'PNG', xPos, 15, imgWidth, imgHeight);
      pdf.save(`E-Ticket-${order.orderCode}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Gagal mengunduh PDF: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0b0e17] text-white rounded-3xl p-5 sm:p-7 border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative my-auto max-h-[92vh] overflow-y-auto flex flex-col">
        
        <button onClick={onClose} className="absolute top-5 right-5 liquid-glass p-2 rounded-xl text-white/80 hover:text-white cursor-pointer transition-all border border-white/15 active:scale-95 z-10">
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Banner */}
        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight">E-Ticket Instan Terbit!</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Simpan kode pesanan atau unduh pas tiket Anda</p>
          </div>
        </div>

        {/* Copy Order Code Quick Bar */}
        <div className="mb-3 p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between gap-2">
          <div>
            <span className="text-[9px] text-blue-300 font-semibold block uppercase tracking-wider">Kode Pesanan / Invoice</span>
            <span className="text-sm font-mono font-extrabold text-white tracking-wider">{order.orderCode}</span>
          </div>
          <button onClick={handleCopyCode}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white shadow-md'
                : 'liquid-glass border border-blue-400/40 text-blue-300 hover:text-white hover:bg-blue-600/30'
            }`}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* E-Ticket Luxury Card Printable Area */}
        <div ref={ticketRef} data-ticket-card="true" className="rounded-3xl bg-gradient-to-b from-[#131829] via-[#0e1220] to-[#0a0d16] p-5 sm:p-6 border border-blue-500/30 shadow-2xl relative overflow-hidden text-left my-1">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Ticket Top Branding */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-xs shadow-md">S</div>
              <span className="font-bold text-sm tracking-tight text-white">SymphoniaTic Pass</span>
            </div>
            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-extrabold">
              VERIFIED TICKET
            </span>
          </div>

          {/* Event & Customer Details Grid */}
          <div className="space-y-3">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-widest text-blue-400 block font-bold">PERTUNJUKAN RESMI</span>
              <h4 className="text-base sm:text-lg font-bold text-white leading-snug">{order.eventTitle}</h4>
              <p className="text-xs text-gray-300 font-medium">{order.artist}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase font-medium block">Tanggal & Waktu</span>
                <span className="text-white font-semibold text-[11px]">{order.date}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase font-medium block">Venue / Hall</span>
                <span className="text-white font-semibold text-[11px] truncate block">{order.venue}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase font-medium block">Pemegang Tiket</span>
                <span className="text-white font-semibold text-[11px] truncate block">{order.userName}</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="text-[9px] text-gray-400 uppercase font-medium block">Kategori Kursi</span>
                <span className="text-emerald-400 font-bold text-[11px]">{order.categoryName} ({order.quantity}x)</span>
              </div>
            </div>
          </div>

          {/* QR Code Pass Section */}
          <div className="mt-3.5 pt-3.5 border-t border-dashed border-white/20 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center">
              <QrCode className="w-24 h-24 sm:w-28 sm:h-28 text-gray-900" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono text-blue-400 font-bold tracking-widest">{order.orderCode}</span>
            </div>
            <span className="text-[9px] text-gray-400 mt-0.5">Tunjukkan QR Code ini di pintu pemeriksaan gate</span>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button onClick={handleDownloadPNG} disabled={!!isDownloading}
            className="liquid-glass border border-white/15 hover:border-blue-400 text-white font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{isDownloading === 'PNG' ? 'Membuat PNG...' : 'Download PNG'}</span>
          </button>

          <button onClick={handleDownloadPDF} disabled={!!isDownloading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading === 'PDF' ? 'Membuat PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ORDERS & TICKET LOOKUP DRAWER (NO LOGIN REQUIRED)
// ════════════════════════════════════════════════════════════════════
interface OrdersProps { orders: OrderRecord[]; onClose: () => void; onShowTicket: (o: OrderRecord) => void; }

export const OrdersDrawer: React.FC<OrdersProps> = ({ orders, onClose, onShowTicket }) => {
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setHasSearched(true);
    try {
      const res = await lookupTicketAPI(searchCode.trim());
      if (res.success && res.data) {
        setFoundOrder(res.data);
      } else {
        const q = searchCode.trim().toLowerCase();
        const match = orders.find((o) => o.orderCode.toLowerCase() === q);
        setFoundOrder(match || null);
      }
    } catch (err) {
      const q = searchCode.trim().toLowerCase();
      const match = orders.find((o) => o.orderCode.toLowerCase() === q);
      setFoundOrder(match || null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xl">
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        className="w-full max-w-md bg-[#0b0e17] text-white h-full flex flex-col p-6 overflow-y-auto border-l border-white/10 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold tracking-tight">Cek Tiket & Invoice Saya</h2>
          </div>
          <button onClick={onClose} className="liquid-glass p-2 rounded-xl text-white/80 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {/* Input Form Cek Kode Pemesanan Tanpa Login */}
        <form onSubmit={handleSearch} className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <label className="text-xs font-semibold text-gray-300 block">Cari Berdasarkan Kode Pesanan / Invoice</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input type="text" placeholder="Masukkan Kode Pesanan (cth: SYM-123456)" value={searchCode} onChange={(e) => setSearchCode(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Cek Kode Pesanan & Buka Tiket</span>
          </button>
        </form>

        {/* Hasil Pencarian Invoice */}
        {hasSearched && (
          <div className="mt-4">
            {foundOrder ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">{foundOrder.orderCode}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">VERIFIED</span>
                </div>
                <h4 className="text-sm font-bold text-white">{foundOrder.eventTitle}</h4>
                <p className="text-xs text-gray-300">Pemegang: {foundOrder.userName}</p>
                <button onClick={() => onShowTicket(foundOrder)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Buka E-Ticket & Download</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-center text-xs text-red-300">
                Kode Pesanan tidak ditemukan. Pastikan Kode Pesanan / Invoice sudah benar.
              </div>
            )}
          </div>
        )}

        {/* Daftar E-Ticket Lokal */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">E-Ticket Di Perangkat Ini</h3>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-400 py-8 liquid-glass rounded-2xl p-6 border border-white/10">
              <Ticket className="w-10 h-10 text-gray-600 mb-2" />
              <p className="text-xs font-semibold text-white">Belum Ada Tiket Tersimpan</p>
              <p className="text-[11px] text-gray-400 mt-1">Pesan tiket konser baru atau cari menggunakan kode invoice Anda di atas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
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
                    <button onClick={() => onShowTicket(ord)} className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
                      <QrCode className="w-3.5 h-3.5" /><span>Tampilkan QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════
// ADMIN DRAWER & PORTAL
// ════════════════════════════════════════════════════════════════════
interface AdminProps { onClose: () => void; onEventsUpdated?: () => void; allEvents?: EventItem[]; }

export const AdminDrawer: React.FC<AdminProps> = ({ onClose, onEventsUpdated, allEvents }) => (
  <AdminDashboard onClose={onClose} onEventsUpdated={onEventsUpdated} allEvents={allEvents} />
);

