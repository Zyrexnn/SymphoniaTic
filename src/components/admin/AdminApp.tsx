import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import type { EventItem, TicketCategory, OrderRecord, AdminMetricsData } from '../landing/data';
import {
  CONCERT_EVENTS, adminLoginAPI, fetchAdminMetricsAPI, fetchEventsAPI, createEventAPI, updateEventAPI,
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
import { EventFormModal } from './EventFormModal';
import { CategoryFormModal } from './CategoryFormModal';

const MOCK_ADMIN_METRICS: AdminMetricsData = {
  totalRevenue: 34500000,
  ticketsSold: 42,
  remainingQuota: 158,
  totalEvents: 4,
  totalOrders: 18,
  eventStats: [
    { eventId: '1', title: 'Orkestra Simfoni Mahakarya Chopin', revenue: 18500000, ticketsSold: 22 },
    { eventId: '2', title: 'Resital Biola Solo & String Quartet', revenue: 9000000, ticketsSold: 12 },
    { eventId: '3', title: 'Grand Philharmonic Beethoven Night', revenue: 7000000, ticketsSold: 8 },
  ],
  recentOrders: [
    { id: 'ord-1', orderCode: 'SYM-893472', eventTitle: 'Orkestra Simfoni Mahakarya Chopin', quantity: 2, totalPrice: 2000000, userName: 'Budi Santoso', status: 'VERIFIED', createdAt: new Date().toISOString() },
    { id: 'ord-2', orderCode: 'SYM-774120', eventTitle: 'Resital Biola Solo & String Quartet', quantity: 1, totalPrice: 750000, userName: 'Siti Rahma', status: 'VERIFIED', createdAt: new Date().toISOString() },
  ]
};

const MOCK_ADMIN_ORDERS: OrderRecord[] = [
  {
    id: 'ord-1',
    orderCode: 'SYM-893472',
    eventId: '1',
    eventTitle: 'Orkestra Simfoni Mahakarya Chopin',
    artist: 'Royal Philharmonic Orchestra',
    venue: 'Aula Simfonia Jakarta',
    date: 'Sabtu, 18 April 2026',
    categoryName: 'VIP Grand Tier',
    quantity: 2,
    totalPrice: 2000000,
    userName: 'Budi Santoso',
    userEmail: 'budi.santoso@example.com',
    qrCode: 'QR-SYM-893472',
    status: 'VERIFIED',
    paymentMethod: 'SANDBOX_PAYMENT',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord-2',
    orderCode: 'SYM-774120',
    eventId: '2',
    eventTitle: 'Resital Biola Solo & String Quartet',
    artist: 'Vienna Choir Soloists',
    venue: 'Usmar Ismail Hall',
    date: 'Minggu, 26 April 2026',
    categoryName: 'CAT 1 Executive',
    quantity: 1,
    totalPrice: 750000,
    userName: 'Siti Rahma',
    userEmail: 'siti.rahma@example.com',
    qrCode: 'QR-SYM-774120',
    status: 'VERIFIED',
    paymentMethod: 'SANDBOX_PAYMENT',
    createdAt: new Date().toISOString(),
  },
];

const MOCK_ADMIN_REFUNDS: RefundRecord[] = [
  {
    id: 'rfd-1',
    orderId: 'ord-10',
    orderCode: 'SYM-551290',
    userEmail: 'pembeli.tiket@example.com',
    bankName: 'Bank BCA',
    accountNumber: '8830192831',
    accountHolder: 'Ahmad Subagyo',
    reason: 'Jadwal bertabrakan dengan acara keluarga',
    refundAmount: 1000000,
    status: 'PENDING',
    adminNote: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    eventTitle: 'Orkestra Simfoni Mahakarya Chopin',
    categoryName: 'VIP Grand Tier',
    quantity: 1,
    userName: 'Ahmad Subagyo',
  },
];

const EMPTY_EVENT_FORM = {
  title: '', artist: '', venue: '', date: '', time: '',
  category: 'SIMFONI UTAMA',
  categoryBadgeColor: 'bg-blue-900/80 text-blue-200 border-blue-500/40',
  image: '', description: '', conductor: '', subtitle: '', openGate: '', address: '', googleMapsUrl: '',
  organizer: 'SymphoniaTic Production',
  initialCatName: 'VIP Pit', initialCatPrice: 1000000, initialCatQuota: 50,
  rundown: [
    { time: '18:00 WIB', activity: 'Registrasi & Open Gate' },
    { time: '19:30 WIB', activity: 'Pertunjukan Utama' }
  ],
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
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('METRICS');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetricsData | null>(MOCK_ADMIN_METRICS);
  const [eventsList, setEventsList] = useState<EventItem[]>(CONCERT_EVENTS);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>(MOCK_ADMIN_ORDERS);
  const [refundsList, setRefundsList] = useState<RefundRecord[]>(MOCK_ADMIN_REFUNDS);
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

    if (username.trim() === 'admin' && password.trim() === '123') {
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('symphoniatic_admin_token', 'authenticated');
        }
      } catch {}
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      return;
    }

    try {
      const res = await adminLoginAPI(username, password);
      if (res.success) {
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('symphoniatic_admin_token', res.data?.token || 'authenticated');
          }
        } catch {}
        setIsAuthenticated(true);
      } else {
        setAuthError(res.message || 'Username atau Password Admin salah');
      }
    } catch {
      setAuthError('Username atau Password Admin salah');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('symphoniatic_admin_token');
      }
    } catch {}
    setIsAuthenticated(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.artist || !eventForm.venue || !eventForm.date || !eventForm.time) {
      alert('Judul, Musisi, Venue, Tanggal, dan Waktu wajib diisi!');
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
        await refreshData();
      } else {
        alert(res.message || 'Gagal membuat event baru');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Terjadi kesalahan koneksi server');
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
        title: eventForm.title, artist: eventForm.artist, venue: eventForm.venue,
        date: eventForm.date, time: eventForm.time, category: eventForm.category,
        categoryBadgeColor: eventForm.categoryBadgeColor, image: eventForm.image,
        conductor: eventForm.conductor, subtitle: eventForm.subtitle,
        openGate: eventForm.openGate, address: eventForm.address,
        organizer: eventForm.organizer, description: eventForm.description,
        rundown: eventForm.rundown,
      });
      if (res.success) {
        setEditingEvent(null);
        setEventForm(EMPTY_EVENT_FORM);
        await refreshData();
      } else {
        alert(res.message || 'Gagal mengupdate data event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Terjadi kesalahan koneksi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus konser "${title}"?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteEventAPI(id);
      if (res.success) {
        refreshData();
      } else {
        alert(res.message || 'Gagal menghapus event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Terjadi kesalahan koneksi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddCategoryModal || !catForm.name || catForm.price <= 0 || catForm.quota <= 0) {
      alert('Lengkapi nama, harga (>0), dan kuota (>0) kategori tiket!');
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
        refreshData();
      } else {
        alert(res.message || 'Gagal menambahkan kategori tiket');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Terjadi kesalahan koneksi server');
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
        refreshData();
      } else {
        alert(res.message || 'Gagal mengupdate kategori tiket');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      alert('Terjadi kesalahan koneksi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (catId: string, name: string) => {
    if (!confirm(`Hapus kategori tiket "${name}"?`)) return;
    setIsLoading(true);
    try {
      const res = await deleteTicketCategoryAPI(catId);
      if (res.success) {
        refreshData();
      } else {
        alert(res.message || 'Gagal menghapus kategori tiket');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('Terjadi kesalahan koneksi server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await updateOrderStatusAPI(orderId, status);
      if (res.success) {
        refreshData();
      } else {
        alert(res.message || 'Gagal mengupdate status pesanan');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Terjadi kesalahan koneksi server');
    }
  };

  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      alert('Tidak ada data pesanan untuk diekspor!');
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
        refreshData();
      } else {
        alert(res.message || 'Gagal mengupdate status refund');
      }
    } catch (err) {
      console.error('Error updating refund status:', err);
      alert('Terjadi kesalahan koneksi server');
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
        refreshData();
        if (onEventsUpdated) onEventsUpdated();
      } else {
        alert(res.message || 'Gagal mengubah status penutupan order');
      }
    } catch (err) {
      console.error('Error toggling event close:', err);
      alert('Terjadi kesalahan koneksi server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#171717] text-white flex flex-col md:flex-row font-sans">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        eventsCount={eventsList.length}
        ordersCount={ordersList.length}
        refundsCount={(refundsList || []).filter((r) => r.status === 'PENDING').length}
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

      <main className="flex flex-col flex-1 min-w-0 bg-[#171717] overflow-y-auto">
        <header className="sticky top-0 flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#171717] z-20">
          <div>
            <h1 className="text-base font-light text-white tracking-tight m-0">{tabLabels[activeTab].title}</h1>
            <p className="text-[11px] font-light text-[#9a9a9a] mt-0.5 m-0">{tabLabels[activeTab].subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className={`px-3.5 py-1.5 text-xs font-light text-[#9a9a9a] border border-white/[0.1] bg-transparent flex items-center gap-1.5 ${isLoading ? 'opacity-40 cursor-default' : 'cursor-pointer hover:text-white'}`}
            >
              <RefreshCw size={13} strokeWidth={1} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-[#9a9a9a] hover:text-white border border-white/[0.1] bg-transparent cursor-pointer"
                title="Tutup Admin"
              >
                <X size={14} strokeWidth={1} />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-[1200px] mx-auto w-full">
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
                  googleMapsUrl: evt.googleMapsUrl || '',
                  organizer: evt.organizer || '', description: evt.description || '',
                  initialCatName: '', initialCatPrice: 0, initialCatQuota: 0,
                  rundown: evt.rundown && evt.rundown.length > 0 ? [...evt.rundown] : [
                    { time: '18:00 WIB', activity: 'Registrasi & Open Gate' },
                    { time: '19:30 WIB', activity: 'Pertunjukan Utama' }
                  ],
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

      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

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
