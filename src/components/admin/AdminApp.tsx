import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Ticket, Plus, Edit, Trash2, ShieldCheck, Lock, Search,
  Download, RefreshCw, Layers, DollarSign, Calendar, MapPin, User, Mail,
  CheckCircle2, AlertTriangle, Sparkles, ChevronRight, LogOut, ArrowLeft,
  Clock, Building, Users, ExternalLink, Menu, X, LayoutDashboard, Settings
} from 'lucide-react';
import {
  formatIDR,
  adminLoginAPI, fetchAdminMetricsAPI, fetchEventsAPI, createEventAPI, updateEventAPI,
  deleteEventAPI, createTicketCategoryAPI, updateTicketCategoryAPI,
  deleteTicketCategoryAPI, fetchAdminOrdersAPI, updateOrderStatusAPI
} from '../landing/data';
import type { EventItem, TicketCategory, OrderRecord, AdminMetricsData } from '../landing/data';

export const AdminApp: React.FC = () => {
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<AdminMetricsData | null>(null);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
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

  // Refresh data from API
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const met = await fetchAdminMetricsAPI();
      if (met) setMetrics(met);

      const ords = await fetchAdminOrdersAPI(orderSearch, orderStatusFilter);
      setOrdersList(ords);

      const evts = await fetchEventsAPI();
      if (evts) setEventsList(evts);
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, orderSearch, orderStatusFilter]);

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
      setAuthError('Gagal menghubungi server backend Golang');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('symphoniatic_admin_token');
    }
    setIsAuthenticated(false);
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
      alert('Terjadi kesalahan koneksi ke backend');
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
        alert('Gagal memperbarui event: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus event "${title}" beserta seluruh kategori tiket terkait?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteEventAPI(eventId);
      if (res.success) {
        refreshData();
      } else {
        alert('Gagal menghapus event: ' + res.message);
      }
    } catch (err) {
      alert('Gagal terhubung ke backend');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Add Ticket Category Submit
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
        setShowAddCategoryModal(null);
        setCatForm({ name: '', price: 500000, quota: 50 });
        refreshData();
      } else {
        alert('Gagal menambah kategori: ' + res.message);
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
        setEditingCategory(null);
        refreshData();
      } else {
        alert('Gagal update kategori: ' + res.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Hapus kategori tiket "${catName}"?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteTicketCategoryAPI(catId);
      if (res.success) {
        refreshData();
      } else {
        alert('Gagal menghapus kategori: ' + res.message);
      }
    } catch (err) {
      alert('Gagal terhubung ke backend');
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
  // 1. STANDALONE UNAUTHENTICATED LOGIN SCREEN
  // ════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#05070d] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Glowing Background Lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md bg-gradient-to-b from-[#0e1322] via-[#090c17] to-[#04060c] rounded-3xl p-8 border border-blue-500/30 shadow-[0_0_80px_rgba(37,99,235,0.25)] relative z-10"
        >
          {/* Header Branding */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <a href="/" className="flex items-center gap-2 group mb-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-xl border border-blue-400/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </a>
            <div>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                PORTAL ADMINISTRATOR
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-3">SymphoniaTic Admin</h1>
              <p className="text-xs text-gray-400 mt-1">Otorisasi Manajemen Tiket Konser & Analytics</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Username Administrator</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Password Akses</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="mt-2 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-300/90 flex items-center justify-between">
                <span>Default Credentials:</span>
                <span className="font-mono text-white bg-blue-900/60 px-2 py-0.5 rounded font-bold">admin / 123</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isAuthenticating ? 'Memverifikasi...' : 'Masuk Ke Dashboard Admin'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <a href="/" className="text-xs text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5 font-medium">
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Kembali Ke Landing Page Main Site</span>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // 2. STANDALONE FULL-PAGE ADMIN DASHBOARD (SIDEBAR + CONTENT LAYOUT)
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen w-full bg-[#05070d] text-white flex flex-col md:flex-row relative font-sans">

      {/* ─── SIDEBAR NAVIGATION (DESKTOP) ─── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#090c17] border-r border-white/10 shrink-0 min-h-screen p-5 justify-between">
        <div className="space-y-6">
          {/* Logo Branding */}
          <a href="/" className="flex items-center gap-3 px-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-black text-sm shadow-md border border-blue-400/30">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight leading-none">SymphoniaTic</span>
              <span className="text-[9px] text-blue-400 font-mono tracking-widest mt-1 uppercase font-bold">ADMIN PORTAL</span>
            </div>
          </a>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5 pt-4 border-t border-white/10">
            {[
              { id: 'METRICS', label: 'Metrik & Finansial', icon: BarChart3, badge: metrics?.totalRevenue ? formatIDR(metrics.totalRevenue) : '' },
              { id: 'EVENTS', label: 'Postingan Konser', icon: Ticket, badge: `${eventsList.length}` },
              { id: 'ORDERS', label: 'Manajemen Pesanan', icon: Layers, badge: `${ordersList.length}` },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Action Buttons */}
        <div className="space-y-2 pt-6 border-t border-white/10">
          <a
            href="/"
            className="w-full liquid-glass px-3.5 py-2.5 rounded-xl text-xs text-gray-300 hover:text-white flex items-center justify-between border border-white/10 transition-all"
          >
            <span className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Web Utama</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-950/40 border border-red-500/20 transition-all flex items-center gap-2 cursor-pointer font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi Admin</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE TOP HEADER ─── */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#090c17] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs">S</div>
          <span className="font-bold text-white text-sm">SymphoniaTic Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={refreshData} className="p-2 bg-white/5 rounded-xl text-gray-300">
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} className="p-2 bg-white/5 rounded-xl text-white">
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#090c17] border-b border-white/10 p-4 space-y-3 z-30">
            {[
              { id: 'METRICS', label: 'Metrik & Finansial', icon: BarChart3 },
              { id: 'EVENTS', label: 'Postingan Konser', icon: Ticket },
              { id: 'ORDERS', label: 'Manajemen Pesanan', icon: Layers },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <a href="/" className="text-xs text-blue-400 font-semibold flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Web Utama</a>
              <button onClick={handleLogout} className="text-xs text-red-400 font-semibold flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> Keluar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#05070d]">

        {/* Top Header Bar */}
        <header className="px-6 py-4 border-b border-white/10 bg-[#070a14]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'METRICS' && '📊 Dashboard Metrik & Pendapatan Finansial'}
              {activeTab === 'EVENTS' && '🎭 Manajemen Postingan Tiket Konser'}
              {activeTab === 'ORDERS' && '🎟️ Pengelolaan Pesanan & Laporan Transaksi'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">SymphoniaTic Executive Management Portal</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="liquid-glass px-3.5 py-2 rounded-xl text-xs text-gray-300 hover:text-white flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* Main Body View */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">

          {/* ════════════════════════════════════════════════════════════════
              TAB 1: METRICS & FINANCIAL ANALYTICS
              ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-emerald-900/10 to-transparent border border-emerald-500/30 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-400 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Pendapatan</span>
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {formatIDR(metrics?.totalRevenue || 0)}
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-2">Akumulasi dari pesanan terverifikasi</span>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-blue-900/10 to-transparent border border-blue-500/30 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-blue-400 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">Tiket Terjual</span>
                    <div className="w-9 h-9 rounded-2xl bg-blue-500/20 flex items-center justify-center"><Ticket className="w-5 h-5" /></div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {metrics?.ticketsSold || 0} <span className="text-sm text-gray-400 font-normal">Lembar</span>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-2">Total unit tiket terkonfirmasi</span>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-amber-900/10 to-transparent border border-amber-500/30 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-amber-400 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">Sisa Kuota Kursi</span>
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/20 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300">
                    {metrics?.remainingQuota || 0} <span className="text-sm text-gray-400 font-normal">Kursi</span>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-2">Tersedia di seluruh event aktif</span>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-purple-900/10 to-transparent border border-purple-500/30 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between text-purple-400 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider">Konser Aktif</span>
                    <div className="w-9 h-9 rounded-2xl bg-purple-500/20 flex items-center justify-center"><BarChart3 className="w-5 h-5" /></div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-purple-200">
                    {metrics?.totalEvents || eventsList.length} <span className="text-sm text-gray-400 font-normal">Event</span>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-2">Konser yang sedang dipublikasikan</span>
                </div>
              </div>

              {/* Revenue Breakdown & Recent Transactions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Breakdown per Event */}
                <div className="p-6 rounded-3xl bg-[#090c17] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span>Rincian Pendapatan Per Event</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {metrics?.eventStats && metrics.eventStats.length > 0 ? (
                      metrics.eventStats.map((st) => (
                        <div key={st.eventId} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white truncate max-w-[220px]">{st.title}</span>
                            <span className="font-bold text-emerald-400">{formatIDR(st.revenue)}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>Tiket Terjual: <strong className="text-white">{st.ticketsSold} Lembar</strong></span>
                            <span>ID: <code className="text-blue-300 font-mono">{st.eventId}</code></span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-gray-400 py-8">Belum ada data transaksi per event</div>
                    )}
                  </div>
                </div>

                {/* 5 Transaksi Terbaru */}
                <div className="p-6 rounded-3xl bg-[#090c17] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-blue-400" />
                      <span>5 Transaksi Pesanan Terbaru</span>
                    </h3>
                    <button onClick={() => setActiveTab('ORDERS')} className="text-xs text-blue-400 hover:underline font-semibold">Lihat Semua</button>
                  </div>

                  <div className="space-y-2.5">
                    {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                      metrics.recentOrders.map((ro) => (
                        <div key={ro.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-400">{ro.orderCode}</span>
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">{ro.status}</span>
                            </div>
                            <div className="text-white font-semibold mt-1 text-[11px] truncate max-w-[200px]">{ro.userName} • {ro.eventTitle}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-400 block">{formatIDR(ro.totalPrice)}</span>
                            <span className="text-[10px] text-gray-400">{ro.quantity}x Tiket</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-gray-400 py-8">Belum ada data pesanan</div>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#090c17] p-5 rounded-3xl border border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white">Postingan Konser & Kategori Tiket</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Kelola data event, jam open gate, konduktor, lokasi venue, serta kuota tempat duduk</p>
                </div>

                <button
                  onClick={() => setShowAddEventModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Konser Baru</span>
                </button>
              </div>

              {/* List Events Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventsList.map((evt) => (
                  <div key={evt.id} className="p-6 rounded-3xl bg-[#090c17] border border-white/10 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <img src={evt.image} alt={evt.title} className="w-16 h-16 rounded-2xl object-cover border border-white/15 shadow-md" />
                          <div>
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${evt.categoryBadgeColor}`}>
                              {evt.category}
                            </span>
                            <h4 className="text-base font-bold text-white leading-snug mt-1.5">{evt.title}</h4>
                            <p className="text-xs text-gray-300 font-medium">{evt.artist}</p>
                          </div>
                        </div>

                        {/* Event Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingEvent(evt)}
                            title="Edit Detail Event"
                            className="liquid-glass p-2.5 rounded-xl text-blue-400 hover:text-white border border-blue-500/30 cursor-pointer transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteEvent(String(evt.id), evt.title)}
                            title="Hapus Event"
                            className="liquid-glass p-2.5 rounded-xl text-red-400 hover:text-white border border-red-500/30 cursor-pointer transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Event Key Detail Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                          <span className="text-[9px] text-gray-400 uppercase font-medium block">Venue & Hall</span>
                          <span className="text-white font-semibold truncate block mt-0.5">{evt.venue}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                          <span className="text-[9px] text-gray-400 uppercase font-medium block">Jadwal Tanggal</span>
                          <span className="text-white font-semibold truncate block mt-0.5">{evt.date} @ {evt.time}</span>
                        </div>
                        {evt.conductor && (
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase font-medium block">Konduktor</span>
                            <span className="text-white font-semibold truncate block mt-0.5">{evt.conductor}</span>
                          </div>
                        )}
                        {evt.openGate && (
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                            <span className="text-[9px] text-gray-400 uppercase font-medium block">Open Gate</span>
                            <span className="text-white font-semibold truncate block mt-0.5">{evt.openGate}</span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Categories List Inside Event */}
                      <div className="space-y-2.5 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-300">Kategori Tiket & Kuota:</span>
                          <button
                            onClick={() => {
                              setShowAddCategoryModal(evt);
                              setCatForm({ name: '', price: 500000, quota: 50 });
                            }}
                            className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Kategori</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {evt.categories && evt.categories.length > 0 ? (
                            evt.categories.map((cat) => (
                              <div key={cat.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-white">{cat.name}</span>
                                  <span className="text-[10px] text-emerald-400 block font-semibold mt-0.5">
                                    Sisa Kuota: {cat.quota} tempat duduk
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
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
                            <span className="text-xs text-gray-400 italic block py-2">Belum ada kategori tiket</span>
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#090c17] p-5 rounded-3xl border border-white/10">
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Cari Kode Pesanan, Nama, Email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto font-semibold"
                  >
                    <option value="" className="bg-gray-900 text-white">Semua Status</option>
                    <option value="VERIFIED" className="bg-gray-900 text-white">VERIFIED</option>
                    <option value="CHECKED_IN" className="bg-gray-900 text-white">CHECKED_IN</option>
                    <option value="CANCELLED" className="bg-gray-900 text-white">CANCELLED</option>
                  </select>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="liquid-glass border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/20 text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Laporan CSV</span>
                </button>
              </div>

              {/* Orders Table */}
              <div className="rounded-3xl bg-[#090c17] border border-white/10 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-950/90 text-gray-400 uppercase text-[10px] font-bold border-b border-white/10">
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
                              <span className="text-[10px] text-gray-400 block mt-0.5">{ord.categoryName}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-white block">{ord.userName}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{ord.userEmail}</span>
                            </td>
                            <td className="p-4 font-semibold">{ord.quantity}x Tiket</td>
                            <td className="p-4 font-bold text-emerald-400">{formatIDR(ord.totalPrice)}</td>
                            <td className="p-4">
                              <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${
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
                                className="bg-white/5 border border-white/15 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
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
                          <td colSpan={7} className="text-center text-gray-400 py-12">
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
      </main>

      {/* ════════════════════════════════════════════════════════════════
          MODAL: TAMBAH KONSER BARU
          ════════════════════════════════════════════════════════════════ */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#0f1322] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
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
                  <input type="text" required placeholder="Contoh: Royal Philharmonic Orchestra" value={eventForm.artist} onChange={(e) => setEventForm({ ...eventForm, artist: e.target.value })}
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
                <label className="text-gray-300 font-semibold block mb-1">URL Gambar Cover Konser (Simpan di DB)</label>
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
            className="w-full max-w-2xl bg-[#0f1322] text-white rounded-3xl p-6 sm:p-8 border border-blue-500/30 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
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
