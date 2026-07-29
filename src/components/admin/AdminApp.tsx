import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import type { EventItem, TicketCategory, OrderRecord, AdminMetricsData } from '../landing/data';
import {
  adminLoginAPI, fetchAdminMetricsAPI, fetchEventsAPI, createEventAPI, updateEventAPI,
  deleteEventAPI, createTicketCategoryAPI, updateTicketCategoryAPI,
  deleteTicketCategoryAPI, fetchAdminOrdersAPI, updateOrderStatusAPI,
} from '../landing/data';

import { AdminLogin } from './AdminLogin';
import { AdminSidebar, MobileHeader, type TabId } from './AdminSidebar';
import { MetricsPanel } from './MetricsPanel';
import { EventsPanel } from './EventsPanel';
import { OrdersPanel } from './OrdersPanel';
import { EventFormModal } from './EventFormModal';
import { CategoryFormModal } from './CategoryFormModal';

const EMPTY_EVENT_FORM = {
  title: '', artist: '', venue: '', date: '', time: '',
  category: 'SIMFONI UTAMA',
  categoryBadgeColor: 'bg-blue-900/80 text-blue-200 border-blue-500/40',
  image: '', description: '', conductor: '', subtitle: '', openGate: '', address: '',
  organizer: 'SymphoniaTic Production',
  initialCatName: 'VIP Pit', initialCatPrice: 1000000, initialCatQuota: 50,
};

const EMPTY_CAT_FORM = { name: '', price: 500000, quota: 50 };

export const AdminApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    typeof window !== 'undefined' && !!sessionStorage.getItem('symphoniatic_admin_token')
  );
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('METRICS');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetricsData | null>(null);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<EventItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ eventId: string; cat: TicketCategory } | null>(null);

  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [catForm, setCatForm] = useState(EMPTY_CAT_FORM);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [met, ords, evts] = await Promise.all([
        fetchAdminMetricsAPI(),
        fetchAdminOrdersAPI(orderSearch, orderStatusFilter),
        fetchEventsAPI(),
      ]);
      if (met) setMetrics(met);
      setOrdersList(ords);
      if (evts) setEventsList(evts);
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
    } catch {
      setAuthError('Gagal menghubungi server backend Golang');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('symphoniatic_admin_token');
    }
    setIsAuthenticated(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.artist || !eventForm.venue || !eventForm.date || !eventForm.time) {
      alert('Judul, Musisi, Venue, Tanggal, dan Waktu wajib diisi!');
      return;
    }
    setIsLoading(true);
    try {
      const res = await createEventAPI({
        title: eventForm.title, artist: eventForm.artist, venue: eventForm.venue,
        date: eventForm.date, time: eventForm.time, category: eventForm.category,
        categoryBadgeColor: eventForm.categoryBadgeColor,
        image: eventForm.image || 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop',
        conductor: eventForm.conductor, subtitle: eventForm.subtitle,
        openGate: eventForm.openGate, address: eventForm.address,
        organizer: eventForm.organizer, description: eventForm.description,
        categories: [{
          name: eventForm.initialCatName, price: Number(eventForm.initialCatPrice),
          quota: Number(eventForm.initialCatQuota),
        }],
      });
      if (res.success) {
        setShowAddEventModal(false);
        setEventForm(EMPTY_EVENT_FORM);
        refreshData();
      } else {
        alert('Gagal menambah event: ' + res.message);
      }
    } catch {
      alert('Terjadi kesalahan koneksi ke backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsLoading(true);
    try {
      const res = await updateEventAPI(String(editingEvent.id), {
        title: editingEvent.title, artist: editingEvent.artist, venue: editingEvent.venue,
        date: editingEvent.date, time: editingEvent.time, category: editingEvent.category,
        categoryBadgeColor: editingEvent.categoryBadgeColor, image: editingEvent.image,
        conductor: editingEvent.conductor, subtitle: editingEvent.subtitle,
        openGate: editingEvent.openGate, address: editingEvent.address,
        organizer: editingEvent.organizer, description: editingEvent.description,
      });
      if (res.success) {
        setEditingEvent(null);
        refreshData();
      } else {
        alert('Gagal memperbarui event: ' + res.message);
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus event "${title}" beserta seluruh kategori tiket terkait?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteEventAPI(eventId);
      if (res.success) refreshData();
      else alert('Gagal menghapus event: ' + res.message);
    } catch {
      alert('Gagal terhubung ke backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddCategoryModal) return;
    setIsLoading(true);
    try {
      const res = await createTicketCategoryAPI(String(showAddCategoryModal.id), catForm);
      if (res.success) {
        setShowAddCategoryModal(null);
        setCatForm(EMPTY_CAT_FORM);
        refreshData();
      } else {
        alert('Gagal menambah kategori: ' + res.message);
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
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
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Hapus kategori tiket "${catName}"?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteTicketCategoryAPI(catId);
      if (res.success) refreshData();
      else alert('Gagal menghapus kategori: ' + res.message);
    } catch {
      alert('Gagal terhubung ke backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await updateOrderStatusAPI(orderId, newStatus);
      if (res.success) refreshData();
      else alert('Gagal update status: ' + res.message);
    } catch {
      alert('Gagal terhubung ke backend');
    }
  };

  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      alert('Belum ada pesanan untuk diekspor.');
      return;
    }
    const headers = ['Kode Pesanan', 'Judul Event', 'Pemegang Tiket', 'Email', 'Kategori', 'Jumlah', 'Total Harga (IDR)', 'Status', 'Tanggal Transaksi'];
    const rows = ordersList.map((o) => [
      `"${o.orderCode}"`,
      `"${o.eventTitle.replace(/"/g, '""')}"`,
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
    METRICS: { title: 'Dashboard Metrik & Pendapatan Finansial', subtitle: 'SymphoniaTic Executive Management Portal' },
    EVENTS: { title: 'Manajemen Postingan Tiket Konser', subtitle: 'SymphoniaTic Executive Management Portal' },
    ORDERS: { title: 'Pengelolaan Pesanan & Laporan Transaksi', subtitle: 'SymphoniaTic Executive Management Portal' },
  };

  return (
    <div className="min-h-screen w-full bg-[#171717] text-white flex flex-col md:flex-row">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        eventsCount={eventsList.length}
        ordersCount={ordersList.length}
        totalRevenue={metrics?.totalRevenue || 0}
      />

      <MobileHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onRefresh={refreshData}
        isLoading={isLoading}
      />

      <main className="flex flex-col flex-1 min-w-0 bg-[#171717]">
        <header
          className="sticky top-0"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: '#171717', zIndex: 20,
          }}
        >
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>{tabLabels[activeTab].title}</h1>
            <p style={{ fontSize: 11, fontWeight: 300, color: '#9a9a9a', margin: '2px 0 0 0' }}>{tabLabels[activeTab].subtitle}</p>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 300, color: '#9a9a9a',
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: isLoading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, opacity: isLoading ? 0.4 : 1,
            }}
          >
            <RefreshCw size={13} strokeWidth={1} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </header>

        <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {activeTab === 'METRICS' && (
            <MetricsPanel metrics={metrics} eventsCount={eventsList.length} onGoToOrders={() => setActiveTab('ORDERS')} />
          )}
          {activeTab === 'EVENTS' && (
            <EventsPanel
              events={eventsList}
              onAddEvent={() => { setShowAddEventModal(true); setEventForm(EMPTY_EVENT_FORM); }}
              onEditEvent={(evt) => {
                setEditingEvent(evt);
                setEventForm({
                  title: evt.title, artist: evt.artist, venue: evt.venue,
                  date: evt.date, time: evt.time, category: evt.category,
                  categoryBadgeColor: evt.categoryBadgeColor, image: evt.image,
                  conductor: evt.conductor || '', subtitle: evt.subtitle || '',
                  openGate: evt.openGate || '', address: evt.address || '',
                  organizer: evt.organizer || '', description: evt.description || '',
                  initialCatName: '', initialCatPrice: 0, initialCatQuota: 0,
                });
              }}
              onDeleteEvent={handleDeleteEvent}
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
        </div>
      </main>

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
    </div>
  );
};
