import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard, Ticket as TicketIcon, RefreshCw, LogOut, ArrowLeft,
  ShoppingBag, CalendarClock, CheckCircle2, AlertCircle, Loader2, Download, Copy, Check, QrCode,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  getUserDashboardSummaryAPI, getUserOrdersAPI, getUserRefundsAPI,
  updateUserProfileAPI, changeUserPasswordAPI, formatIDR,
} from '@/components/landing/data';
import type { UserDashboardSummary, OrderRecord, RefundRecord } from '@/components/landing/data';

type Tab = 'summary' | 'orders' | 'refunds' | 'profile';

const ORDER_STATUSES = ['ISSUED', 'VERIFIED', 'CHECKED_IN', 'REMINDED', 'REFUNDED', 'CANCELLED'];

const REFUND_STATUS_STYLE: Record<string, string> = {
  PENDING: 'border-white/30 text-white',
  APPROVED: 'border-white text-white bg-white/5',
  REJECTED: 'border-white/20 text-[#9a9a9a]',
  COMPLETED: 'border-white text-white',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-white/20 text-[#9a9a9a]">
      {status}
    </span>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="border border-white/[0.08] p-5">
      <div className="flex items-center gap-2 text-[#9a9a9a] mb-3">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="text-[32px] font-light tracking-[-0.03em] text-white leading-none">{value}</div>
    </div>
  );
}

// ─── Summary Panel ───
function SummaryPanel() {
  const [summary, setSummary] = useState<UserDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getUserDashboardSummaryAPI();
    if (res.success && res.data) setSummary(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-5 h-5 text-[#9a9a9a] animate-spin" strokeWidth={1.5} /></div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPI icon={<ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Tiket Dibeli" value={summary?.totalTicketsBought ?? 0} />
      <KPI icon={<CalendarClock className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Akan Datang" value={summary?.upcomingEventsCount ?? 0} />
      <KPI icon={<CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Selesai" value={summary?.pastEventsCount ?? 0} />
      <KPI icon={<AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Refund Aktif" value={summary?.activeRefundsCount ?? 0} />
    </div>
  );
}

// ─── Orders Panel ───
function drawTicketCanvas(order: OrderRecord): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 1100;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#171717'; ctx.fillRect(0, 0, 800, 1100);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2; ctx.strokeRect(20, 20, 760, 1060);
  ctx.fillStyle = '#ffffff'; ctx.font = '600 34px Inter, system-ui, sans-serif'; ctx.fillText('SymphoniaTic Pass', 50, 80);
  ctx.fillStyle = '#9a9a9a'; ctx.font = '300 16px Inter, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('VERIFIED E-TICKET', 750, 80); ctx.textAlign = 'left';
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(50, 105); ctx.lineTo(750, 105); ctx.stroke();
  ctx.fillStyle = '#9a9a9a'; ctx.font = '300 12px sans-serif'; ctx.fillText('PERTUNJUKAN RESMI', 50, 130);
  ctx.fillStyle = '#ffffff'; ctx.font = '400 26px sans-serif'; ctx.fillText(order.eventTitle, 50, 165);
  ctx.fillStyle = '#9a9a9a'; ctx.font = '300 15px sans-serif'; ctx.fillText(order.artist, 50, 192);
  const di = (y: number, l: string, v: string) => { ctx.fillStyle = '#9a9a9a'; ctx.font = '300 11px sans-serif'; ctx.fillText(l.toUpperCase(), 50, y); ctx.fillStyle = '#ffffff'; ctx.font = '300 15px sans-serif'; ctx.fillText(v, 50, y + 20); };
  di(235, 'Tanggal & Waktu', order.date); di(290, 'Pemegang Tiket', order.userName); di(345, 'Kategori Tiket', `${order.categoryName} (${order.quantity}x Tiket)`);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(50, 395); ctx.lineTo(750, 395); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(50, 425, 700, 180);
  ctx.fillStyle = '#ffffff'; ctx.font = '400 16px sans-serif'; ctx.fillText(order.venue, 75, 492);
  ctx.fillStyle = '#9a9a9a'; ctx.font = '300 13px sans-serif'; ctx.fillText(`Navigasi: maps.google.com/?q=${encodeURIComponent(order.venue)}`, 75, 522);
  const qs = 190, qx = (800 - qs) / 2, qy = 640;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(qx, qy, qs, qs);
  ctx.fillStyle = '#171717';
  const df = (fx: number, fy: number) => { ctx.fillRect(fx, fy, 38, 38); ctx.fillStyle = '#ffffff'; ctx.fillRect(fx + 5, fy + 5, 28, 28); ctx.fillStyle = '#171717'; ctx.fillRect(fx + 10, fy + 10, 18, 18); };
  const qp = 18, qi = qs - qp * 2; df(qx + qp, qy + qp); df(qx + qp + qi - 38, qy + qp); df(qx + qp, qy + qp + qi - 38);
  const cs = qi / 10;
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    if ((r < 4 && c < 4) || (r < 4 && c >= 6) || (r >= 6 && c < 4)) continue;
    if ((r + c * 3 + order.orderCode.length) % 3 === 0) ctx.fillRect(qx + qp + c * cs, qy + qp + r * cs, cs - 1, cs - 1);
  }
  ctx.fillStyle = '#9a9a9a'; ctx.font = '300 20px monospace'; ctx.textAlign = 'center'; ctx.fillText(order.orderCode, 400, 870);
  ctx.font = '300 12px sans-serif'; ctx.fillText('Pindai QR Code ini pada scanner gate di pintu masuk hall', 400, 905);
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '300 11px sans-serif'; ctx.fillText('SYMPHONIATIC OFFICIAL E-TICKET PASS & MAP GUIDE', 400, 1040);
  return canvas;
}

function TicketCard({ order }: { order: OrderRecord }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyCode = () => { navigator.clipboard.writeText(order.orderCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const dlPNG = async () => {
    setDownloading('PNG');
    try {
      const c = drawTicketCanvas(order); const url = c.toDataURL('image/png');
      const a = document.createElement('a'); a.download = `E-Ticket-${order.orderCode}.png`; a.href = url; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) { console.error('PNG error:', e); } finally { setDownloading(null); }
  };
  const dlPDF = async () => {
    setDownloading('PDF');
    try {
      const c = drawTicketCanvas(order); const { jsPDF } = await import('jspdf');
      const img = c.toDataURL('image/png'); const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const w = 180, h = (c.height * w) / c.width;
      pdf.setFillColor(23, 23, 23); pdf.rect(0, 0, 210, 297, 'F'); pdf.addImage(img, 'PNG', (pdf.internal.pageSize.getWidth() - w) / 2, 10, w, h);
      pdf.save(`E-Ticket-${order.orderCode}.pdf`);
    } catch (e) { console.error('PDF error:', e); } finally { setDownloading(null); }
  };

  return (
    <div className="border border-white/[0.08] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-white font-light">{order.eventTitle}</span>
          <span className="text-[10px] font-mono text-[#9a9a9a]">{order.orderCode} · {order.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white font-light">{formatIDR(order.totalPrice)}</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Ticket body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Event info */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#9a9a9a]">SymphoniaTic Pass</span>
          <span className="text-[10px] font-mono text-[#9a9a9a] tracking-wider">{order.status}</span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] block mb-1">Pertunjukan Resmi</span>
          <h3 className="text-base font-light text-white tracking-[-0.01em]">{order.eventTitle}</h3>
          <p className="text-xs text-[#9a9a9a] font-light mt-0.5">{order.artist}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div><span className="text-[#9a9a9a] block mb-0.5">Tanggal & Waktu</span><span className="text-white font-light">{order.date}</span></div>
          <div><span className="text-[#9a9a9a] block mb-0.5">Venue</span><span className="text-white font-light">{order.venue}</span></div>
          <div><span className="text-[#9a9a9a] block mb-0.5">Pemegang Tiket</span><span className="text-white font-light">{order.userName}</span></div>
          <div><span className="text-[#9a9a9a] block mb-0.5">Kategori</span><span className="text-white font-light">{order.categoryName} ({order.quantity}x)</span></div>
        </div>

        {/* QR section */}
        <div className="flex flex-col items-center text-center border-t border-dashed border-white/[0.1] pt-4">
          <div className="p-2.5 bg-white">
            <QrCode className="w-16 h-16 sm:w-20 sm:h-20 text-[#171717]" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-light text-white tabular-nums">{order.orderCode}</span>
            <button onClick={copyCode} className="text-[#9a9a9a] hover:text-white transition-colors">
              {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
            </button>
          </div>
          <span className="text-[10px] text-[#9a9a9a] mt-1">Tunjukkan QR ini di pintu masuk</span>
        </div>

        {/* Download buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button onClick={dlPNG} disabled={!!downloading}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono uppercase tracking-wider text-white border border-white/20 hover:border-white hover:bg-white/5 transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{downloading === 'PNG' ? '...' : 'PNG'}</span>
          </button>
          <button onClick={dlPDF} disabled={!!downloading}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono uppercase tracking-wider text-white border border-white/20 hover:border-white hover:bg-white/5 transition-colors disabled:opacity-40">
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{downloading === 'PDF' ? '...' : 'PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getUserOrdersAPI(filter || undefined);
    if (res.success && Array.isArray(res.data)) setOrders(res.data);
    else setOrders([]);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors ${!filter ? 'border-white text-white' : 'border-white/20 text-[#9a9a9a] hover:text-white'}`}
        >
          Semua
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors ${filter === s ? 'border-white text-white' : 'border-white/20 text-[#9a9a9a] hover:text-white'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-5 h-5 text-[#9a9a9a] animate-spin" strokeWidth={1.5} /></div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-[#9a9a9a] font-light py-12 text-center">Belum ada tiket. Pesanan tiket Anda akan muncul di sini sebagai postingan E-Ticket.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {orders.map((o) => <TicketCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}

// ─── Refunds Panel ───
function RefundsPanel() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getUserRefundsAPI();
    if (res.success && Array.isArray(res.data)) setRefunds(res.data);
    else setRefunds([]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-5 h-5 text-[#9a9a9a] animate-spin" strokeWidth={1.5} /></div>;

  if (refunds.length === 0) return <p className="text-sm text-[#9a9a9a] font-light py-12 text-center">Belum ada pengajuan refund.</p>;

  return (
    <div className="flex flex-col gap-2">
      {refunds.map((r) => (
        <div key={r.id} className="border border-white/[0.08] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-light">{r.orderCode}</span>
            <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${REFUND_STATUS_STYLE[r.status] || REFUND_STATUS_STYLE.PENDING}`}>
              {r.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
            <div><span className="text-[#9a9a9a]">Bank</span><p className="text-white">{r.bankName}</p></div>
            <div><span className="text-[#9a9a9a]">No. Rekening</span><p className="text-white font-mono">{r.accountNumber}</p></div>
            <div><span className="text-[#9a9a9a]">Pemilik Rekening</span><p className="text-white">{r.accountHolder}</p></div>
            <div><span className="text-[#9a9a9a]">Nominal</span><p className="text-white">{formatIDR(r.amount)}</p></div>
            <div className="col-span-2"><span className="text-[#9a9a9a]">Alasan</span><p className="text-white">{r.reason}</p></div>
            {r.adminNote && <div className="col-span-2"><span className="text-[#9a9a9a]">Catatan Admin</span><p className="text-white">{r.adminNote}</p></div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Profile Panel ───
function ProfilePanel() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg(null);
    const res = await updateUserProfileAPI(name.trim(), phone.trim());
    if (res.success && res.data) { updateUser(res.data); setProfileMsg('Profil berhasil diperbarui.'); }
    else setProfileMsg(res.message || 'Gagal memperbarui profil.');
    setProfileLoading(false);
  };

  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd.length < 6) { setPwdMsg('Kata sandi baru minimal 6 karakter.'); return; }
    if (newPwd !== confirmPwd) { setPwdMsg('Konfirmasi kata sandi tidak cocok.'); return; }
    setPwdLoading(true);
    const res = await changeUserPasswordAPI(oldPwd, newPwd);
    if (res.success) { setPwdMsg('Kata sandi berhasil diubah.'); setOldPwd(''); setNewPwd(''); setConfirmPwd(''); }
    else setPwdMsg(res.message || 'Gagal mengubah kata sandi.');
    setPwdLoading(false);
  };

  const inputCls = 'w-full bg-transparent border border-white/[0.08] focus:border-white/30 px-4 py-3 text-sm text-white placeholder:text-[#9a9a9a]/50 outline-none transition-colors';
  const btnCls = 'inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-[#171717] text-xs font-mono font-medium tracking-wider uppercase hover:bg-neutral-200 transition-colors disabled:opacity-40';

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={saveProfile} className="flex flex-col gap-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-[#9a9a9a]">Data Profil</h3>
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] mb-2">Nama Lengkap</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
        </label>
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] mb-2">Nomor HP</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] mb-2">Email (tidak dapat diubah)</span>
          <input value={user?.email || ''} disabled className={inputCls + ' opacity-50'} />
        </label>
        {profileMsg && <p className="text-xs text-white/60 font-light">{profileMsg}</p>}
        <button type="submit" disabled={profileLoading} className={btnCls}>
          {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : 'Simpan Profil'}
        </button>
      </form>

      <form onSubmit={changePwd} className="flex flex-col gap-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-[#9a9a9a]">Ubah Kata Sandi</h3>
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] mb-2">Kata Sandi Lama</span>
          <input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} required autoComplete="current-password" className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] mb-2">Kata Sandi Baru (min. 6)</span>
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required autoComplete="new-password" className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] mb-2">Konfirmasi Kata Sandi</span>
          <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required autoComplete="new-password" className={inputCls} />
        </label>
        {pwdMsg && <p className="text-xs text-white/60 font-light">{pwdMsg}</p>}
        <button type="submit" disabled={pwdLoading} className={btnCls}>
          {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : 'Ubah Kata Sandi'}
        </button>
      </form>
    </div>
  );
}

// ─── Dashboard Root ───
function DashboardInner() {
  const { user, status, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('summary');

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/login';
  }, [status]);

  if (status !== 'authenticated') {
    return <div className="min-h-screen bg-[#171717] flex items-center justify-center"><Loader2 className="w-6 h-6 text-white animate-spin" strokeWidth={1.5} /></div>;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'summary', label: 'Ringkasan', icon: <LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'orders', label: 'Pesanan', icon: <TicketIcon className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'refunds', label: 'Refund', icon: <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: 'profile', label: 'Profil', icon: <UserRecordIcon /> },
  ];

  return (
    <div className="min-h-screen bg-[#171717] text-white">
      {/* Top bar */}
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-xs font-mono text-[#9a9a9a] hover:text-white transition-colors">
            <ArrowLeft size={14} strokeWidth={1.5} /> Beranda
          </a>
          <div className="flex items-center gap-4">
            <span className="text-xs font-light text-[#9a9a9a] hidden sm:inline">{user?.email}</span>
            <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#9a9a9a] hover:text-white transition-colors">
              <LogOut size={14} strokeWidth={1.5} /> Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10">
        <div className="mb-10">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9a9a9a]">[ Dashboard ]</span>
          <h1 className="text-[32px] leading-[1.1] tracking-[-0.03em] font-light text-white mt-3">
            Selamat datang, {user?.name?.split(' ')[0]}.
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.08] mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                tab === t.id ? 'text-white border-b border-white' : 'text-[#9a9a9a] hover:text-white'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'summary' && <SummaryPanel />}
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'refunds' && <RefundsPanel />}
        {tab === 'profile' && <ProfilePanel />}
      </div>
    </div>
  );
}

function UserRecordIcon() {
  return <span className="text-xs">○</span>;
}

export const UserDashboard: React.FC = () => (
  <AuthProvider>
    <DashboardInner />
  </AuthProvider>
);

export default UserDashboard;
