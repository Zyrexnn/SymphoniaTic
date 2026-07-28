import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, BarChart3, Ticket, Plus, Edit, Trash2, ShieldCheck, Lock, Search,
  Download, RefreshCw, Layers, DollarSign, Calendar, MapPin, User, Mail,
  CheckCircle2, AlertTriangle, Sparkles, ChevronRight, LogOut, Clock, Building, Users
} from 'lucide-react';
import type { EventItem, TicketCategory, OrderRecord, AdminMetricsData } from './data';
import {
  formatIDR,
  adminLoginAPI, fetchAdminMetricsAPI, createEventAPI, updateEventAPI,
  deleteEventAPI, createTicketCategoryAPI, updateTicketCategoryAPI,
  deleteTicketCategoryAPI, fetchAdminOrdersAPI, updateOrderStatusAPI
} from './data';

interface AdminDashboardProps {
  onClose: () => void;
  onEventsUpdated?: () => void;
  allEvents?: EventItem[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onEventsUpdated, allEvents = [] }) => {
  // Auth state persisted in sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('symphoniatic_admin_token');
    }
    return false;
  });
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'METRICS' | 'EVENTS' | 'ORDERS'>('METRICS');

  // Data states
  const [metrics, setMetrics] = useState<AdminMetricsData | null>(null);
  const [eventsList, setEventsList] = useState<EventItem[]>(allEvents);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  // Modals state
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<EventItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ eventId: string; cat: TicketCategory } | null>(null);

  // Form states for Add/Edit Event
  const [eventForm, setEventForm] = useState({
    title: '',
    artist: '',
    venue: '',
    date: '',
    time: '',
    category: 'SIMFONI UTAMA',
    categoryBadgeColor: 'bg-blue-900/80 text-blue-200 border-blue-500/40',
    image: '',
    description: '',
    conductor: '',
    subtitle: '',
    openGate: '',
    address: '',
    organizer: 'SymphoniaTic Production',
    initialCatName: 'VIP Pit',
    initialCatPrice: 1000000,
    initialCatQuota: 50,
  });

  // Form state for Add/Edit Category
  const [catForm, setCatForm] = useState({ name: '', price: 500000, quota: 50 });

  // Sync allEvents prop when changed
  useEffect(() => {
    if (allEvents && allEvents.length > 0) {
      setEventsList(allEvents);
    }
  }, [allEvents]);

  // Load metrics, orders, and events on mount / tab change
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const met = await fetchAdminMetricsAPI();
      if (met) setMetrics(met);

      const ords = await fetchAdminOrdersAPI(orderSearch, orderStatusFilter);
      setOrdersList(ords);

      const evts = await fetchEventsAPI();
      if (evts && evts.length > 0) {
        setEventsList(evts);
      }

      if (onEventsUpdated) onEventsUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, orderSearch, orderStatusFilter]);

  // Handle Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('symphoniatic_admin_token');
    }
    setIsAuthenticated(false);
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await adminLoginAPI(username, password);
      if (res.success) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('symphoniatic_admin_token', res.data?.token || 'authenticated');
        }
        setIsAuthenticated(true);
      } else {
        setAuthError(res.message || 'Username atau Password Admin salah');
      }
    } catch (err) {
      setAuthError('Gagal menghubungi server backend');
    } finally {
      setIsAuthenticating(false);
    }
  };


  // Handle Create Event Submit
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.artist || !eventForm.venue || !eventForm.date || !eventForm.time) {
      alert('Judul, Musisi, Venue, Tanggal, dan Waktu wajib diisi!');
      return;
    }
    setIsLoading(true);
    try {
      const res = await createEventAPI({
        title: eventForm.title,
        artist: eventForm.artist,
        venue: eventForm.venue,
        date: eventForm.date,
        time: eventForm.time,
        category: eventForm.category,
        categoryBadgeColor: eventForm.categoryBadgeColor,
        image: eventForm.image || 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop',
        conductor: eventForm.conductor,
        subtitle: eventForm.subtitle,
        openGate: eventForm.openGate,
        address: eventForm.address,
        organizer: eventForm.organizer,
        description: eventForm.description,
        categories: [
          { name: eventForm.initialCatName, price: Number(eventForm.initialCatPrice), quota: Number(eventForm.initialCatQuota) }
        ],
      });

      if (res.success) {
        alert('Event konser berhasil ditambahkan!');
        setShowAddEventModal(false);
        setEventForm({
          title: '', artist: '', venue: '', date: '', time: '',
          category: 'SIMFONI UTAMA', categoryBadgeColor: 'bg-blue-900/80 text-blue-200 border-blue-500/40',
          image: '', description: '', conductor: '', subtitle: '', openGate: '', address: '',
          organizer: 'SymphoniaTic Production',
          initialCatName: 'VIP Pit', initialCatPrice: 1000000, initialCatQuota: 50,
        });
        refreshData();
      } else {
        alert('Gagal menambah event: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Update Event Submit
  const handleUpdateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsLoading(true);
    try {
      const res = await updateEventAPI(String(editingEvent.id), {
        title: editingEvent.title,
        artist: editingEvent.artist,
        venue: editingEvent.venue,
        date: editingEvent.date,
        time: editingEvent.time,
        category: editingEvent.category,
        categoryBadgeColor: editingEvent.categoryBadgeColor,
        image: editingEvent.image,
        conductor: editingEvent.conductor,
        subtitle: editingEvent.subtitle,
        openGate: editingEvent.openGate,
        address: editingEvent.address,
        organizer: editingEvent.organizer,
        description: editingEvent.description,
      });

      if (res.success) {
        alert('Event konser berhasil diperbarui!');
        setEditingEvent(null);
        refreshData();
      } else {
        alert('Gagal mengedit event: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus event "${title}" beserta seluruh kategori tiketnya?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteEventAPI(eventId);
      if (res.success) {
        alert('Event berhasil dihapus!');
        refreshData();
      } else {
        alert('Gagal menghapus event: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Add Category Submit
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddCategoryModal) return;
    setIsLoading(true);
    try {
      const res = await createTicketCategoryAPI(String(showAddCategoryModal.id), {
        name: catForm.name,
        price: Number(catForm.price),
        quota: Number(catForm.quota),
      });

      if (res.success) {
        alert('Kategori tiket berhasil ditambahkan!');
        setShowAddCategoryModal(null);
        setCatForm({ name: '', price: 500000, quota: 50 });
        refreshData();
      } else {
        alert('Gagal membuat kategori: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Update Category Submit
  const handleUpdateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsLoading(true);
    try {
      const res = await updateTicketCategoryAPI(editingCategory.cat.id, {
        name: editingCategory.cat.name,
        price: Number(editingCategory.cat.price),
        quota: Number(editingCategory.cat.quota),
      });

      if (res.success) {
        alert('Kategori tiket berhasil diperbarui!');
        setEditingCategory(null);
        refreshData();
      } else {
        alert('Gagal memperbarui kategori: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (catId: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteTicketCategoryAPI(catId);
      if (res.success) {
        alert('Kategori tiket berhasil dihapus!');
        refreshData();
      } else {
        alert('Gagal menghapus kategori: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Update Order Status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await updateOrderStatusAPI(orderId, newStatus);
      if (res.success) {
        refreshData();
      } else {
        alert('Gagal update status: ' + res.message);
      }
    } catch (err) {
      alert('Gagal terhubung ke backend');
    }
  };

  // Handle Export CSV Orders
  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      alert('Belum ada pesanan untuk diekspor.');
      return;
    }
    const headers = ['Kode Pesanan', 'Judul Event', 'Pemegang Tiket', 'Email', 'Kategori', 'Jumlah', 'Total Harga (IDR)', 'Status', 'Tanggal Transaksi'];
    const csvRows = [headers.join(',')];

    ordersList.forEach((o) => {
      const row = [
        `"${o.orderCode}"`,
        `"${o.eventTitle.replace(/"/g, '""')}"`,
        `"${o.userName.replace(/"/g, '""')}"`,
        `"${o.userEmail}"`,
        `"${o.categoryName}"`,
        o.quantity,
        o.totalPrice,
        `"${o.status}"`,
        `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SymphoniaTic_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ════════════════════════════════════════════════════════════════════
  // 1. AUTHENTICATION LOGIN FORM (If not logged in)
  // ════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-gradient-to-b from-[#101424] via-[#0b0e1a] to-[#060810] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-[0_0_60px_rgba(37,99,235,0.2)] relative">
          <button onClick={onClose} className="absolute top-5 right-5 liquid-glass p-2 rounded-xl text-white/70 hover:text-white cursor-pointer border border-white/10">
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Otorisasi Admin Portal</h2>
              <p className="text-xs text-gray-400 mt-1">Masukkan Password/PIN Pengelola SymphoniaTic</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Username Admin</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan Username Admin (Default: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">Password Admin</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan Password Admin (Default: 123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <span className="text-[10px] text-blue-400/80 block mt-1">Kredensial Login: Username <code className="font-mono bg-blue-950/60 px-1 py-0.5 rounded">admin</code> | PW <code className="font-mono bg-blue-950/60 px-1 py-0.5 rounded">123</code></span>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isAuthenticating ? 'Memverifikasi...' : 'Masuk Ke Dashboard Admin'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. MAIN ADMIN PORTAL (FULL-SCREEN OVERLAY MODAL)
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="w-full max-w-7xl h-[94vh] bg-gradient-to-b from-[#0e121e] via-[#090b14] to-[#04050a] text-white rounded-3xl border border-blue-500/30 shadow-[0_0_80px_rgba(37,99,235,0.2)] relative flex flex-col overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gray-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-black text-sm shadow-md">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Portal Admin SymphoniaTic</h2>
                <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                  MANAGEMENT PORTAL
                </span>
              </div>
              <p className="text-[11px] text-gray-400">CRUD Tiket Konser, Monitoring Pendapatan & Finansial, Manajemen Transaksi</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="liquid-glass p-2 sm:px-3 sm:py-2 rounded-xl text-xs text-gray-300 hover:text-white flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <button
              onClick={handleLogout}
              className="liquid-glass p-2 sm:px-3 sm:py-2 rounded-xl text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 border border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            <button
              onClick={onClose}
              className="liquid-glass p-2 rounded-xl text-white/80 hover:text-white border border-white/15 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex border-b border-white/10 px-6 bg-gray-950/40 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'METRICS', label: '📊 Metrik & Finansial', badge: metrics?.totalRevenue ? formatIDR(metrics.totalRevenue) : '' },
            { id: 'EVENTS', label: '🎭 Postingan Konser (CRUD)', badge: `${eventsList.length} Event` },
            { id: 'ORDERS', label: '🎟️ Manajemen Pesanan', badge: `${ordersList.length} Transaksi` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3.5 px-5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === t.id
                  ? 'border-blue-500 text-white bg-blue-600/10'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{t.label}</span>
              {t.badge && (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-500/30">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ════════════════════════════════════════════════════════════════
              TAB 1: METRICS & FINANCIAL ANALYTICS
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-emerald-900/10 border border-emerald-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatIDR(metrics?.totalRevenue || 0)}
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Akumulasi dari pesanan terverifikasi</span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-blue-900/10 border border-blue-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-blue-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Tiket Terjual</span>
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-white">
                    {metrics?.ticketsSold || 0} <span className="text-sm text-gray-400 font-normal">Lembar</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Total unit tiket terkonfirmasi</span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-amber-900/10 border border-amber-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-amber-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Sisa Kuota Kursi</span>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-amber-300">
                    {metrics?.remainingQuota || 0} <span className="text-sm text-gray-400 font-normal">Kursi</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Tersedia di semua kategori</span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-purple-900/10 border border-purple-500/30 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between text-purple-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Konser Aktif</span>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black text-purple-200">
                    {metrics?.totalEvents || eventsList.length} <span className="text-sm text-gray-400 font-normal">Event</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-1">Konser yang sedang dipublikasikan</span>
                </div>
              </div>

              {/* Revenue Breakdown & Recent Transactions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown per Event */}
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span>Rincian Pendapatan Per Event</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {metrics?.eventStats && metrics.eventStats.length > 0 ? (
                      metrics.eventStats.map((st) => (
                        <div key={st.eventId} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate max-w-[220px]">{st.title}</span>
                            <span className="font-bold text-emerald-400">{formatIDR(st.revenue)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>Tiket Terjual: <strong className="text-white">{st.ticketsSold} Lembar</strong></span>
                            <span>Event ID: <code className="text-blue-300 font-mono">{st.eventId}</code></span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-gray-400 py-6">Belum ada data transaksi per event</div>
                    )}
                  </div>
                </div>

                {/* 5 Transaksi Terbaru */}
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-blue-400" />
                      <span>5 Transaksi Pesanan Terbaru</span>
                    </h3>
                    <button onClick={() => setActiveTab('ORDERS')} className="text-xs text-blue-400 hover:underline">Lihat Semua</button>
                  </div>

                  <div className="space-y-2.5">
                    {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                      metrics.recentOrders.map((ro) => (
                        <div key={ro.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-400">{ro.orderCode}</span>
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">{ro.status}</span>
                            </div>
                            <div className="text-white font-semibold mt-0.5 text-[11px] truncate max-w-[200px]">{ro.userName} • {ro.eventTitle}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-400 block">{formatIDR(ro.totalPrice)}</span>
                            <span className="text-[10px] text-gray-400">{ro.quantity}x Tiket</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-gray-400 py-6">Belum ada data pesanan</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: EVENT POSTING & TICKET CRUD MANAGEMENT
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-6">
              {/* Header Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white">Manajemen Postingan Tiket Konser</h3>
                  <p className="text-xs text-gray-400">Kelola event konser simfoni, kuota tempat duduk, dan daftar kategori tiket</p>
                </div>

                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Konser Baru</span>
                </button>
              </div>

              {/* List Events Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventsList.map((evt) => (
                  <div key={evt.id} className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={evt.image} alt={evt.title} className="w-14 h-14 rounded-2xl object-cover border border-white/15" />
                          <div>
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${evt.categoryBadgeColor}`}>
                              {evt.category}
                            </span>
                            <h4 className="text-base font-bold text-white leading-snug mt-1">{evt.title}</h4>
                            <p className="text-xs text-gray-300">{evt.artist}</p>
                          </div>
                        </div>

                        {/* Event Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditingEvent(evt)}
                            title="Edit Event"
                            className="liquid-glass p-2 rounded-xl text-blue-400 hover:text-white border border-blue-500/30 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteEvent(String(evt.id), evt.title)}
                            title="Hapus Event"
                            className="liquid-glass p-2 rounded-xl text-red-400 hover:text-white border border-red-500/30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                          <span className="text-[9px] text-gray-400 uppercase font-medium block">Venue & Hall</span>
                          <span className="text-white font-semibold truncate block">{evt.venue}</span>
                        </div>
                        <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                          <span className="text-[9px] text-gray-400 uppercase font-medium block">Jadwal Tanggal</span>
                          <span className="text-white font-semibold truncate block">{evt.date} @ {evt.time}</span>
                        </div>
                        {evt.conductor && (
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase font-medium block">Konduktor</span>
                            <span className="text-white font-semibold truncate block">{evt.conductor}</span>
                          </div>
                        )}
                        {evt.openGate && (
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase font-medium block">Open Gate</span>
                            <span className="text-white font-semibold truncate block">{evt.openGate}</span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Categories List Inside Event */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-300">Kategori Tiket & Kuota:</span>
                          <button
                            onClick={() => {
                              setShowAddCategoryModal(evt);
                              setCatForm({ name: '', price: 500000, quota: 50 });
                            }}
                            className="text-[10px] text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Tambah Kategori</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {evt.categories && evt.categories.length > 0 ? (
                            evt.categories.map((cat) => (
                              <div key={cat.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-white">{cat.name}</span>
                                  <span className="text-[10px] text-emerald-400 block">
                                    Sisa: {cat.quota} tempat duduk
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">{formatIDR(cat.price)}</span>
                                  <button
                                    onClick={() => setEditingCategory({ eventId: String(evt.id), cat })}
                                    className="text-blue-400 hover:text-white p-1 cursor-pointer"
                                    title="Edit Kategori"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                    className="text-red-400 hover:text-white p-1 cursor-pointer"
                                    title="Hapus Kategori"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Belum ada kategori tiket</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: ORDERS MANAGEMENT & EXPORT REPORT
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-6">
              {/* Controls Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Cari Kode, Nama, Email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto"
                  >
                    <option value="" className="bg-gray-900 text-white">Semua Status</option>
                    <option value="VERIFIED" className="bg-gray-900 text-white">VERIFIED</option>
                    <option value="CHECKED_IN" className="bg-gray-900 text-white">CHECKED_IN</option>
                    <option value="CANCELLED" className="bg-gray-900 text-white">CANCELLED</option>
                  </select>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="liquid-glass border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/20 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Laporan CSV</span>
                </button>
              </div>

              {/* Orders Table */}
              <div className="rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-950/80 text-gray-400 uppercase text-[10px] font-bold border-b border-white/10">
                      <tr>
                        <th className="p-4">Kode Pesanan</th>
                        <th className="p-4">Konser & Kategori</th>
                        <th className="p-4">Pemegang Tiket</th>
                        <th className="p-4">Jumlah</th>
                        <th className="p-4">Total Bayar</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Aksi Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-200">
                      {ordersList.length > 0 ? (
                        ordersList.map((ord) => (
                          <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-mono font-bold text-blue-400">{ord.orderCode}</td>
                            <td className="p-4">
                              <span className="font-bold text-white block">{ord.eventTitle}</span>
                              <span className="text-[10px] text-gray-400 block">{ord.categoryName}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-white block">{ord.userName}</span>
                              <span className="text-[10px] text-gray-400 block">{ord.userEmail}</span>
                            </td>
                            <td className="p-4 font-semibold">{ord.quantity}x Tiket</td>
                            <td className="p-4 font-bold text-emerald-400">{formatIDR(ord.totalPrice)}</td>
                            <td className="p-4">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                                ord.status === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : ord.status === 'CHECKED_IN'
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  : 'bg-red-500/20 text-red-300 border-red-500/40'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                                className="bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                              >
                                <option value="VERIFIED" className="bg-gray-900">VERIFIED</option>
                                <option value="CHECKED_IN" className="bg-gray-900">CHECKED_IN</option>
                                <option value="CANCELLED" className="bg-gray-900">CANCELLED</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center text-gray-400 py-8">
                            Tidak ada data pesanan yang cocok dengan kriteria pencarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: TAMBAH KONSER BARU
          ════════════════════════════════════════════════════════════════ */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#0f1322] text-white rounded-3xl p-6 border border-blue-500/30 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Tambah Event Konser Baru</span>
              </h3>
              <button onClick={() => setShowAddEventModal(false)} className="liquid-glass p-2 rounded-xl text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Judul Konser</label>
                  <input type="text" required placeholder="Contoh: Simfoni Beethoven No. 9" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Musisi / Orkestra</label>
                  <input type="text" required placeholder="Contoh: Royal Philharmonic" value={eventForm.artist} onChange={(e) => setEventForm({ ...eventForm, artist: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Venue / Gedung</label>
                  <input type="text" required placeholder="Aula Simfonia Jakarta" value={eventForm.venue} onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Tanggal Konser</label>
                  <input type="text" required placeholder="15 Agustus 2026" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Waktu Konser</label>
                  <input type="text" required placeholder="19:30 WIB" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">URL Gambar Cover Konser (Disimpan di DB)</label>
                <input type="url" placeholder="https://images.unsplash.com/..." value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>

              {/* Detail Tambahan Konser */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                <span className="font-bold text-purple-300 block text-xs">Detail Tambahan Konser</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Konduktor / Pemimpin</label>
                    <input type="text" placeholder="Maestro Addie MS" value={eventForm.conductor} onChange={(e) => setEventForm({ ...eventForm, conductor: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Subtitle / Tagline</label>
                    <input type="text" placeholder="Pertunjukan Mahakarya Simfoni" value={eventForm.subtitle} onChange={(e) => setEventForm({ ...eventForm, subtitle: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Open Gate</label>
                    <input type="text" placeholder="18:00 WIB" value={eventForm.openGate} onChange={(e) => setEventForm({ ...eventForm, openGate: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-gray-300 font-medium block mb-1">Alamat Lengkap Venue</label>
                    <input type="text" placeholder="Jl. Industri Blok B14, Kemayoran" value={eventForm.address} onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 font-medium block mb-1">Penyelenggara / Organizer</label>
                  <input type="text" placeholder="SymphoniaTic Production" value={eventForm.organizer} onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Deskripsi Konser</label>
                <textarea rows={3} placeholder="Penjelasan mahakarya musik..." value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3">
                <span className="font-bold text-blue-300 block text-xs">Kategori Tiket Awal (Minimal 1 Kategori)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Nama Kategori</label>
                    <input type="text" required value={eventForm.initialCatName} onChange={(e) => setEventForm({ ...eventForm, initialCatName: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Harga (IDR)</label>
                    <input type="number" required value={eventForm.initialCatPrice} onChange={(e) => setEventForm({ ...eventForm, initialCatPrice: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Kuota Kursi</label>
                    <input type="number" required value={eventForm.initialCatQuota} onChange={(e) => setEventForm({ ...eventForm, initialCatQuota: Number(e.target.value) })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddEventModal(false)} className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white">Batal</button>
                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer">
                  {isLoading ? 'Menyimpan...' : 'Simpan & Terbitkan Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: EDIT EVENT
          ════════════════════════════════════════════════════════════════ */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#0f1322] text-white rounded-3xl p-6 border border-blue-500/30 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-400" />
                <span>Edit Detail Event Konser</span>
              </h3>
              <button onClick={() => setEditingEvent(null)} className="liquid-glass p-2 rounded-xl text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEventSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Judul Konser</label>
                  <input type="text" required value={editingEvent.title} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Musisi / Orkestra</label>
                  <input type="text" required value={editingEvent.artist} onChange={(e) => setEditingEvent({ ...editingEvent, artist: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Venue / Gedung</label>
                  <input type="text" required value={editingEvent.venue} onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Tanggal Konser</label>
                  <input type="text" required value={editingEvent.date} onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white" />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Waktu Konser</label>
                  <input type="text" required value={editingEvent.time} onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white" />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">URL Gambar Cover</label>
                <input type="url" value={editingEvent.image} onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white" />
              </div>

              {/* Detail Tambahan Konser */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                <span className="font-bold text-purple-300 block text-xs">Detail Tambahan Konser</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Konduktor / Pemimpin</label>
                    <input type="text" placeholder="Maestro Addie MS" value={editingEvent.conductor || ''} onChange={(e) => setEditingEvent({ ...editingEvent, conductor: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Subtitle / Tagline</label>
                    <input type="text" placeholder="Pertunjukan Mahakarya" value={editingEvent.subtitle || ''} onChange={(e) => setEditingEvent({ ...editingEvent, subtitle: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-300 font-medium block mb-1">Open Gate</label>
                    <input type="text" placeholder="18:00 WIB" value={editingEvent.openGate || ''} onChange={(e) => setEditingEvent({ ...editingEvent, openGate: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-gray-300 font-medium block mb-1">Alamat Lengkap Venue</label>
                    <input type="text" placeholder="Jl. Industri Blok B14" value={editingEvent.address || ''} onChange={(e) => setEditingEvent({ ...editingEvent, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 font-medium block mb-1">Penyelenggara / Organizer</label>
                  <input type="text" placeholder="SymphoniaTic Production" value={editingEvent.organizer || ''} onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Deskripsi Konser</label>
                <textarea rows={3} value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white" />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white">Batal</button>
                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer">
                  {isLoading ? 'Menyimpan...' : 'Perbarui Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: TAMBAH KATEGORI TIKET
          ════════════════════════════════════════════════════════════════ */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0f1322] text-white rounded-3xl p-6 border border-blue-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-sm font-bold text-white">Tambah Kategori Tiket ({showAddCategoryModal.title})</h3>
              <button onClick={() => setShowAddCategoryModal(null)} className="liquid-glass p-2 rounded-xl text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Nama Kategori Tiket</label>
                <input type="text" required placeholder="Contoh: CAT 1 Balkon Utama" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Harga Tiket (IDR)</label>
                <input type="number" required placeholder="500000" value={catForm.price} onChange={(e) => setCatForm({ ...catForm, price: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Kuota Tempat Duduk</label>
                <input type="number" required placeholder="50" value={catForm.quota} onChange={(e) => setCatForm({ ...catForm, quota: Number(e.target.value) })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setShowAddCategoryModal(null)} className="px-4 py-2 rounded-xl text-gray-400 hover:text-white">Batal</button>
                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg cursor-pointer">
                  {isLoading ? 'Menyimpan...' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          MODAL: EDIT KATEGORI TIKET
          ════════════════════════════════════════════════════════════════ */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0f1322] text-white rounded-3xl p-6 border border-blue-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <h3 className="text-sm font-bold text-white">Edit Kategori Tiket & Kuota</h3>
              <button onClick={() => setEditingCategory(null)} className="liquid-glass p-2 rounded-xl text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Nama Kategori Tiket</label>
                <input type="text" required value={editingCategory.cat.name} onChange={(e) => setEditingCategory({ ...editingCategory, cat: { ...editingCategory.cat, name: e.target.value } })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Harga Tiket (IDR)</label>
                <input type="number" required value={editingCategory.cat.price} onChange={(e) => setEditingCategory({ ...editingCategory, cat: { ...editingCategory.cat, price: Number(e.target.value) } })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Kuota Tempat Duduk</label>
                <input type="number" required value={editingCategory.cat.quota} onChange={(e) => setEditingCategory({ ...editingCategory, cat: { ...editingCategory.cat, quota: Number(e.target.value) } })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 rounded-xl text-gray-400 hover:text-white">Batal</button>
                <button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg cursor-pointer">
                  {isLoading ? 'Menyimpan...' : 'Perbarui Kategori'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
