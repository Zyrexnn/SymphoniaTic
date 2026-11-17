import React, { useState, useEffect } from 'react';
import { RefreshCw, X, AlertCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventItem, TicketCategory, OrderRecord, AdminMetricsData, AdminRole } from '../landing/data';
import {
  adminLoginAPI, fetchAdminMetricsAPI, fetchEventsAPI, createEventAPI, updateEventAPI,
  deleteEventAPI, createTicketCategoryAPI, updateTicketCategoryAPI,
  deleteTicketCategoryAPI, fetchAdminOrdersAPI, updateOrderStatusAPI,
  fetchAdminRefundsAPI, updateRefundStatusAPI,
} from '../landing/data';

import { AdminLogin } from './AdminLogin';
import { AdminSidebar, MobileHeader, MobileBottomNav, type TabId } from './AdminSidebar';
import { MetricsPanel } from './MetricsPanel';
import { EventsPanel } from './EventsPanel';
import { OrdersPanel } from './OrdersPanel';
import { RefundsPanel, type RefundRecord } from './RefundsPanel';
import { GateScannerPanel } from './GateScannerPanel';
import { EventFormModal, type EventFormData } from './EventFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { calculateDefaultOpenGate, generateDynamicRundown, isTimeBefore } from '@/lib/timeUtils';

const EMPTY_EVENT_FORM: EventFormData = {
  title: '', artist: '', venue: '', date: '', time: '',
  category: 'SIMFONI UTAMA',
  categoryBadgeColor: 'bg-white/10 text-white border-white/20',
  image: '', audioUrl: '', description: '', conductor: '', subtitle: '', openGate: '', address: '', googleMapsUrl: '',
  organizer: 'SymphoniaTic Production',
  initialCatName: 'VIP Pit', initialCatPrice: 1000000, initialCatQuota: 50,
  rundown: [],
};

const EMPTY_CAT_FORM = { name: '', price: 500000, quota: 50 };

interface AdminAppProps {
  onClose?: () => void;
  onEventsUpdated?: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onClose, onEventsUpdated }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && !!sessionStorage.getItem('symphoniatic_admin_token');
    } catch {
      return false;
    }
  });
  const [currentRole, setCurrentRole] = useState<AdminRole>(() => {
    try {
      return (sessionStorage.getItem('symphoniatic_admin_role') as AdminRole) || 'ADMIN';
    } catch {
      return 'ADMIN';
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    try {
      const savedRole = sessionStorage.getItem('symphoniatic_admin_role');
      return savedRole === 'PETUGAS' ? 'SCANNER' : 'METRICS';
    } catch {
      return 'METRICS';
    }
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetricsData | null>(null);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [refundsList, setRefundsList] = useState<RefundRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  const [refundSearch, setRefundSearch] = useState('');
  const [refundStatusFilter, setRefundStatusFilter] = useState('');

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<EventItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ eventId: string; cat: TicketCategory } | null>(null);

  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [catForm, setCatForm] = useState(EMPTY_CAT_FORM);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [met, ords, evts, rfds] = await Promise.all([
        fetchAdminMetricsAPI(),
        fetchAdminOrdersAPI(orderSearch, orderStatusFilter),
        fetchEventsAPI(),
        fetchAdminRefundsAPI(),
      ]);
      if (met) setMetrics(met);
      if (ords) setOrdersList(ords);
      if (evts) setEventsList(evts);
      if (rfds) setRefundsList(rfds);
      if (onEventsUpdated) onEventsUpdated();
    } catch (err) {
      console.error('Error refreshing admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated, orderSearch, orderStatusFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    const cleanUser = username.trim().toLowerCase();

    try {
      const res = await adminLoginAPI(username, password);
      if (res.success && res.data?.token) {
        const userRole = res.data?.user?.role || (cleanUser === 'petugas' ? 'PETUGAS' : 'ADMIN');
        try {
          sessionStorage.setItem('symphoniatic_admin_token', res.data.token);
          sessionStorage.setItem('symphoniatic_admin_role', userRole);
        } catch {}
        setCurrentRole(userRole);
        setActiveTab(userRole === 'PETUGAS' ? 'SCANNER' : 'METRICS');
        setIsAuthenticated(true);
      } else {
        setAuthError(res.message || 'Username atau Password Admin salah');
      }
    } catch {
      setAuthError('Terjadi kesalahan koneksi saat login');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('symphoniatic_admin_token');
      sessionStorage.removeItem('symphoniatic_admin_role');
    } catch {}
    setIsAuthenticated(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.artist || !eventForm.venue || !eventForm.date || !eventForm.time || !eventForm.openGate) {
      showToast('Judul, Musisi, Venue, Tanggal, Waktu Konser, dan Open Gate wajib diisi!', 'error');
      return;
    }
    if (!isTimeBefore(eventForm.openGate, eventForm.time)) {
      showToast('Waktu Open Gate harus lebih awal dari waktu konser!', 'error');
      return;
    }
    setIsLoading(true);
    const catName = eventForm.initialCatName.trim() || 'VIP Pit';
    const catPrice = Number(eventForm.initialCatPrice) || 1000000;
    const catQuota = Number(eventForm.initialCatQuota) || 50;

    try {
      const res = await createEventAPI({
        title: eventForm.title, artist: eventForm.artist, venue: eventForm.venue,
        date: eventForm.date, time: eventForm.time, category: eventForm.category,
        categoryBadgeColor: eventForm.categoryBadgeColor,
        image: eventForm.image || 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop',
        audioUrl: eventForm.audioUrl || '',
        conductor: eventForm.conductor, subtitle: eventForm.subtitle,
        openGate: eventForm.openGate, address: eventForm.address,
        organizer: eventForm.organizer, description: eventForm.description,
        rundown: eventForm.rundown,
        categories: [{
          name: catName,
          price: catPrice,
          quota: catQuota,
        }],
      });
      if (res.success) {
        setShowAddEventModal(false);
        setEventForm(EMPTY_EVENT_FORM);
        showToast('Event konser berhasil dibuat', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'Gagal membuat event baru', 'error');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    if (!eventForm.openGate || !eventForm.time || !isTimeBefore(eventForm.openGate, eventForm.time)) {
      showToast('Waktu Open Gate harus lebih awal dari waktu konser!', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await updateEventAPI(String(editingEvent.id), {
        title: eventForm.title, artist: eventForm.artist, venue: eventForm.venue,
        date: eventForm.date, time: eventForm.time, category: eventForm.category,
        categoryBadgeColor: eventForm.categoryBadgeColor, image: eventForm.image,
        audioUrl: eventForm.audioUrl || '',
        conductor: eventForm.conductor, subtitle: eventForm.subtitle,
        openGate: eventForm.openGate, address: eventForm.address,
        organizer: eventForm.organizer, description: eventForm.description,
        rundown: eventForm.rundown,
      });
      if (res.success) {
        setEditingEvent(null);
        setEventForm(EMPTY_EVENT_FORM);
        showToast('Data event konser berhasil diperbarui', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'Gagal mengupdate data event', 'error');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (id: string, title: string) => {
    setConfirmModal({
      title: 'Hapus Event Konser',
      message: `Apakah Anda yakin ingin menghapus konser "${title}"? Data kategori tiket terkait juga akan terhapus.`,
      onConfirm: async () => {
        setConfirmModal(null);
        setIsLoading(true);
        try {
          const res = await deleteEventAPI(id);
          if (res.success) {
            showToast('Konser berhasil dihapus', 'success');
            refreshData();
          } else {
            showToast(res.message || 'Gagal menghapus event', 'error');
          }
        } catch (err) {
          console.error('Error deleting event:', err);
          showToast('Terjadi kesalahan koneksi server', 'error');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddCategoryModal || !catForm.name || catForm.price <= 0 || catForm.quota <= 0) {
      showToast('Lengkapi nama, harga (>0), dan kuota (>0) kategori tiket!', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await createTicketCategoryAPI(String(showAddCategoryModal.id), {
        name: catForm.name, price: Number(catForm.price), quota: Number(catForm.quota),
      });
      if (res.success) {
        setShowAddCategoryModal(null);
        setCatForm(EMPTY_CAT_FORM);
        showToast('Kategori tiket berhasil ditambahkan', 'success');
        refreshData();
      } else {
        showToast(res.message || 'Gagal menambahkan kategori tiket', 'error');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !catForm.name || catForm.price <= 0 || catForm.quota <= 0) return;
    setIsLoading(true);
    try {
      const res = await updateTicketCategoryAPI(editingCategory.cat.id, {
        name: catForm.name, price: Number(catForm.price), quota: Number(catForm.quota),
      });
      if (res.success) {
        setEditingCategory(null);
        setCatForm(EMPTY_CAT_FORM);
        showToast('Kategori tiket berhasil diperbarui', 'success');
        refreshData();
      } else {
        showToast(res.message || 'Gagal mengupdate kategori tiket', 'error');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    setConfirmModal({
      title: 'Hapus Kategori Tiket',
      message: `Hapus kategori tiket "${name}"?`,
      onConfirm: async () => {
        setConfirmModal(null);
        setIsLoading(true);
        try {
          const res = await deleteTicketCategoryAPI(catId);
          if (res.success) {
            showToast('Kategori tiket berhasil dihapus', 'success');
            refreshData();
          } else {
            showToast(res.message || 'Gagal menghapus kategori tiket', 'error');
          }
        } catch (err) {
          console.error('Error deleting category:', err);
          showToast('Terjadi kesalahan koneksi server', 'error');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await updateOrderStatusAPI(orderId, status);
      if (res.success) {
        showToast('Status pesanan berhasil diperbarui', 'success');
        refreshData();
      } else {
        showToast(res.message || 'Gagal mengupdate status pesanan', 'error');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      showToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      showToast('Tidak ada data pesanan untuk diekspor!', 'error');
      return;
    }
    const headers = ['Kode Pesanan', 'Event', 'Musisi', 'Venue', 'Tanggal', 'Nama Pemesan', 'Email', 'Kategori Tiket', 'Jumlah', 'Total Harga', 'Status', 'Waktu Transaksi'];
    const rows = ordersList.map((o) => [
      `"${o.orderCode}"`,
      `"${o.eventTitle.replace(/"/g, '""')}"`,
      `"${o.artist.replace(/"/g, '""')}"`,
      `"${o.venue.replace(/"/g, '""')}"`,
      `"${o.date}"`,
      `"${o.userName.replace(/"/g, '""')}"`,
      `"${o.userEmail}"`,
      `"${o.categoryName}"`,
      o.quantity,
      o.totalPrice,
     `"${o.status}"`,
      `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
    ].join(','));
    const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const link = document.createElement('a');
    link.href = csv;
    link.download = `SymphoniaTic_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateRefundStatus = async (refundId: string, status: string, adminNote: string) => {
    try {
      const res = await updateRefundStatusAPI(refundId, status, adminNote);
      if (res.success) {
        showToast('Status refund berhasil diperbarui', 'success');
        refreshData();
      } else {
        showToast(res.message || 'Gagal mengupdate status refund', 'error');
      }
    } catch (err) {
      console.error('Error updating refund status:', err);
      showToast('Terjadi kesalahan koneksi server', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        username={username}
        password={password}
        error={authError}
        isLoading={isAuthenticating}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const tabLabels: Record<TabId, { title: string; subtitle: string }> = {
    SCANNER: { title: 'Pemindai Kamera Gate & Validasi Check-In', subtitle: 'SymphoniaTic Gate Entry Control System' },
    METRICS: { title: 'Dashboard Metrik & Pendapatan Finansial', subtitle: 'SymphoniaTic Executive Management Portal' },
    EVENTS: { title: 'Manajemen Postingan Tiket Konser', subtitle: 'SymphoniaTic Executive Management Portal' },
    ORDERS: { title: 'Pengelolaan Pesanan & Laporan Transaksi', subtitle: 'SymphoniaTic Executive Management Portal' },
    REFUNDS: { title: 'Persetujuan Permohonan Refund Tiket', subtitle: 'SymphoniaTic Executive Management Portal' },
  };

  const filteredRefunds = (refundsList || []).filter((rf) => {
    const searchLower = refundSearch.toLowerCase();
    const matchSearch =
      !refundSearch ||
      rf.orderCode.toLowerCase().includes(searchLower) ||
      rf.userEmail.toLowerCase().includes(searchLower) ||
      rf.bankName.toLowerCase().includes(searchLower) ||
      rf.accountHolder.toLowerCase().includes(searchLower);
    const matchStatus = !refundStatusFilter || rf.status === refundStatusFilter;
    return matchSearch && matchStatus;
  });

  const handleToggleCloseEvent = async (id: string) => {
    setIsLoading(true);
    try {
      const { toggleEventCloseAPI } = await import('../landing/data');
      const res = await toggleEventCloseAPI(id);
      if (res.success) {
        showToast('Status penjualan tiket konser berhasil diubah', 'success');
        refreshData();
        if (onEventsUpdated) onEventsUpdated();
      } else {
        showToast(res.message || 'Gagal mengubah status penutupan order', 'error');
      }
    } catch (err) {
      console.error('Error toggling event close:', err);
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0C0D12] text-[#F4F4F6] flex flex-col md:flex-row font-sans">
      <AdminSidebar
        activeTab={activeTab}
        role={currentRole}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        eventsCount={eventsList.length}
        ordersCount={ordersList.length}
        refundsCount={(refundsList || []).filter((r) => r.status === 'PENDING').length}
        totalRevenue={metrics?.totalRevenue || 0}
      />

      <MobileHeader
        activeTab={activeTab}
        role={currentRole}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onRefresh={refreshData}
        isLoading={isLoading}
      />

      <main className="flex flex-col flex-1 min-w-0 bg-[#0C0D12] overflow-y-auto">
        <header className="sticky top-0 flex items-center justify-between px-6 py-3.5 border-b border-[#272A38] bg-[#0C0D12]/95 backdrop-blur-md z-20">
          <div>
            <h1 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">{tabLabels[activeTab].title}</h1>
            <p className="text-[11px] font-normal text-[#94A3B8] mt-0.5 m-0">{tabLabels[activeTab].subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className={`px-3.5 py-1.5 text-xs font-medium text-[#A1A1AA] border border-[#272A38] bg-[#14161F] rounded-lg flex items-center gap-1.5 transition-colors ${isLoading ? 'opacity-40 cursor-default' : 'cursor-pointer hover:text-white hover:border-white/40'}`}
            >
              <RefreshCw size={13} strokeWidth={1.5} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-[#94A3B8] hover:text-[#F4F4F6] border border-[#272A38] bg-[#14161F] rounded-lg cursor-pointer transition-colors"
                title="Tutup Admin"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto max-w-[1200px] mx-auto w-full">
          {activeTab === 'SCANNER' && (
            <GateScannerPanel />
          )}
          {activeTab === 'METRICS' && (
            <MetricsPanel metrics={metrics} eventsCount={eventsList.length} onGoToOrders={() => setActiveTab('ORDERS')} />
          )}
          {activeTab === 'EVENTS' && (
            <EventsPanel
              events={eventsList}
              onAddEvent={() => { setShowAddEventModal(true); setEventForm(EMPTY_EVENT_FORM); }}
              onEditEvent={(evt) => {
                const resolvedOpenGate = evt.openGate || calculateDefaultOpenGate(evt.time);
                setEditingEvent(evt);
                setEventForm({
                  title: evt.title, artist: evt.artist, venue: evt.venue,
                  date: evt.date, time: evt.time, category: evt.category,
                  categoryBadgeColor: evt.categoryBadgeColor, image: evt.image,
                  audioUrl: evt.audioUrl || '',
                  conductor: evt.conductor || '', subtitle: evt.subtitle || '',
                  openGate: resolvedOpenGate, address: evt.address || '',
                  googleMapsUrl: evt.googleMapsUrl || '',
                  organizer: evt.organizer || '', description: evt.description || '',
                  initialCatName: '', initialCatPrice: 0, initialCatQuota: 0,
                  rundown: evt.rundown && evt.rundown.length > 0
                    ? evt.rundown.map((item) => ({ ...item }))
                    : generateDynamicRundown(evt.time, resolvedOpenGate),
                });
              }}
              onDeleteEvent={handleDeleteEvent}
              onToggleCloseEvent={handleToggleCloseEvent}
              onAddCategory={(evt) => { setShowAddCategoryModal(evt); setCatForm(EMPTY_CAT_FORM); }}
              onEditCategory={(eventId, cat) => {
                setEditingCategory({ eventId, cat });
                setCatForm({ name: cat.name, price: cat.price, quota: cat.quota });
              }}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
          {activeTab === 'ORDERS' && (
            <OrdersPanel
              orders={ordersList}
              search={orderSearch}
              statusFilter={orderStatusFilter}
              onSearchChange={setOrderSearch}
              onStatusFilterChange={setOrderStatusFilter}
              onUpdateStatus={handleUpdateStatus}
              onExportCSV={handleExportCSV}
            />
          )}
          {activeTab === 'REFUNDS' && (
            <RefundsPanel
              refunds={filteredRefunds}
              search={refundSearch}
              statusFilter={refundStatusFilter}
              onSearchChange={setRefundSearch}
              onStatusFilterChange={setRefundStatusFilter}
              onUpdateStatus={handleUpdateRefundStatus}
            />
          )}
        </div>
      </main>

      <MobileBottomNav activeTab={activeTab} role={currentRole} onTabChange={setActiveTab} />

      <EventFormModal
        isOpen={showAddEventModal || !!editingEvent}
        editingEvent={editingEvent}
        form={eventForm}
        isLoading={isLoading}
        onFormChange={setEventForm}
        onClose={() => { setShowAddEventModal(false); setEditingEvent(null); }}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
      />

      <CategoryFormModal
        showAddCategoryModal={showAddCategoryModal}
        editingCategory={editingCategory}
        catForm={catForm}
        isLoading={isLoading}
        onCatFormChange={setCatForm}
        onCloseAdd={() => setShowAddCategoryModal(null)}
        onCloseEdit={() => setEditingCategory(null)}
        onAddSubmit={handleAddCategory}
        onEditSubmit={handleUpdateCategory}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-[#181B26] border-[#272A38] text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/40 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#14161F] border border-[#272A38] rounded-2xl p-6 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-base font-semibold text-white">{confirmModal.title}</h3>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6">
                {confirmModal.message}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white bg-[#1C1F2E] border border-[#272A38] rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
