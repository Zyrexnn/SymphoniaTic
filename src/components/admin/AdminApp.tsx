import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  X,
  AlertCircle,
  Check,
  ChevronDown,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import type { EventItem, TicketCategory, OrderRecord, AdminMetricsData, AdminRole } from '../landing/data';
import {
  adminLoginAPI,
  fetchAdminMetricsAPI,
  fetchEventsAPI,
  createEventAPI,
  updateEventAPI,
  deleteEventAPI,
  createTicketCategoryAPI,
  updateTicketCategoryAPI,
  deleteTicketCategoryAPI,
  fetchAdminOrdersAPI,
  updateOrderStatusAPI,
  fetchAdminRefundsAPI,
  updateRefundStatusAPI,
  checkInTicketAPI,
} from '../landing/data';

import { AdminThemeProvider, AdminThemeToggle, useAdminTheme } from './AdminThemeContext';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar, MobileHeader, MobileBottomNav, type TabId } from './AdminSidebar';
import { EventsPanel } from './EventsPanel';
import { OrdersPanel } from './OrdersPanel';
import { RefundsPanel, type RefundRecord } from './RefundsPanel';
import { EventFormModal, type EventFormData } from './EventFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { Skeleton } from '@/components/ui/skeleton';

const MetricsPanel = React.lazy(() => import('./MetricsPanel').then((m) => ({ default: m.MetricsPanel })));
const GateScannerPanel = React.lazy(() =>
  import('./GateScannerPanel').then((m) => ({ default: m.GateScannerPanel }))
);

const PanelSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 w-full rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  </div>
);
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { calculateDefaultOpenGate, generateDynamicRundown, isTimeBefore } from '@/lib/timeUtils';

const EMPTY_EVENT_FORM: EventFormData = {
  title: '',
  artist: '',
  venue: '',
  date: '',
  time: '',
  category: 'SIMFONI UTAMA',
  categoryBadgeColor: 'bg-white/10 text-white border-white/20',
  image: '',
  audioUrl: '',
  description: '',
  conductor: '',
  subtitle: '',
  openGate: '',
  address: '',
  googleMapsUrl: '',
  organizer: 'SymphoniaTic Production',
  initialCatName: 'VIP Pit',
  initialCatPrice: 1000000,
  initialCatQuota: 50,
  rundown: [],
};

const EMPTY_CAT_FORM = { name: '', price: 500000, quota: 50 };

interface AdminAppProps {
  onClose?: () => void;
  onEventsUpdated?: () => void;
}

const AdminAppInner: React.FC<AdminAppProps> = ({ onClose, onEventsUpdated }) => {
  const { theme, toggleTheme } = useAdminTheme();

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

  const [metrics, setMetrics] = useState<AdminMetricsData | null>(null);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [refundsList, setRefundsList] = useState<RefundRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingInCode, setCheckingInCode] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  const [refundSearch, setRefundSearch] = useState('');
  const [refundStatusFilter, setRefundStatusFilter] = useState('');

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<EventItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    eventId: string;
    cat: TicketCategory;
  } | null>(null);

  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [catForm, setCatForm] = useState(EMPTY_CAT_FORM);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const refreshData = async () => {
    const activeRole = currentRole;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [ords, evts, met, rfds] = await Promise.all([
        fetchAdminOrdersAPI(orderSearch, orderStatusFilter),
        fetchEventsAPI(),
        activeRole === 'ADMIN' ? fetchAdminMetricsAPI() : Promise.resolve(null),
        activeRole === 'ADMIN' ? fetchAdminRefundsAPI() : Promise.resolve([]),
      ]);
      if (ords) setOrdersList(ords);
      if (evts) setEventsList(evts);
      if (met) setMetrics(met);
      if (rfds) setRefundsList(rfds);
      if (onEventsUpdated) onEventsUpdated();
    } catch (err) {
      console.error('Error refreshing admin data:', err);
      setLoadError('Gagal memuat data terbaru dari server. Periksa koneksi backend Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) void refreshData();
  }, [isAuthenticated, orderSearch, orderStatusFilter, currentRole]);

  useEffect(() => {
    if (currentRole === 'PETUGAS' && activeTab !== 'SCANNER' && activeTab !== 'ORDERS') {
      setActiveTab('SCANNER');
    }
  }, [currentRole, activeTab]);

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
    if (
      !eventForm.title ||
      !eventForm.artist ||
      !eventForm.venue ||
      !eventForm.date ||
      !eventForm.time ||
      !eventForm.openGate
    ) {
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
        title: eventForm.title,
        artist: eventForm.artist,
        venue: eventForm.venue,
        date: eventForm.date,
        time: eventForm.time,
        category: eventForm.category,
        categoryBadgeColor: eventForm.categoryBadgeColor,
        image:
          eventForm.image ||
          'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop',
        audioUrl: eventForm.audioUrl || '',
        conductor: eventForm.conductor,
        subtitle: eventForm.subtitle,
        openGate: eventForm.openGate,
        address: eventForm.address,
        organizer: eventForm.organizer,
        description: eventForm.description,
        rundown: eventForm.rundown,
        categories: [
          {
            name: catName,
            price: catPrice,
            quota: catQuota,
          },
        ],
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
        title: eventForm.title,
        artist: eventForm.artist,
        venue: eventForm.venue,
        date: eventForm.date,
        time: eventForm.time,
        category: eventForm.category,
        categoryBadgeColor: eventForm.categoryBadgeColor,
        image: eventForm.image,
        audioUrl: eventForm.audioUrl || '',
        conductor: eventForm.conductor,
        subtitle: eventForm.subtitle,
        openGate: eventForm.openGate,
        address: eventForm.address,
        organizer: eventForm.organizer,
        description: eventForm.description,
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
      confirmLabel: 'Hapus Konser',
      variant: 'danger',
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
        name: catForm.name,
        price: Number(catForm.price),
        quota: Number(catForm.quota),
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
        name: catForm.name,
        price: Number(catForm.price),
        quota: Number(catForm.quota),
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
      confirmLabel: 'Hapus Kategori',
      variant: 'danger',
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

  const handleManualCheckIn = (order: OrderRecord) => {
    setConfirmModal({
      title: 'Konfirmasi Check-In Manual',
      message: `Tandai tiket "${order.orderCode}" atas nama ${order.userName} (${order.categoryName}, ${order.quantity}x) telah masuk gate sekarang?`,
      confirmLabel: 'Proses Check-In',
      variant: 'default',
      onConfirm: async () => {
        setConfirmModal(null);
        setCheckingInCode(order.orderCode);
        try {
          const res = await checkInTicketAPI(order.orderCode);
          if (res.success) {
            showToast(res.message || `Tiket ${order.orderCode} berhasil check-in`, 'success');
            await refreshData();
          } else {
            showToast(res.message || 'Gagal memproses check-in manual', 'error');
          }
        } catch (err) {
          console.error('Error manual check-in:', err);
          showToast('Terjadi kesalahan koneksi server', 'error');
        } finally {
          setCheckingInCode(null);
        }
      },
    });
  };

  const handleExportCSV = () => {
    if (ordersList.length === 0) {
      showToast('Tidak ada data pesanan untuk diekspor!', 'error');
      return;
    }
    const headers = [
      'Kode Pesanan',
      'Event',
      'Musisi',
      'Venue',
      'Tanggal',
      'Nama Pemesan',
      'Email',
      'Kategori Tiket',
      'Nomor Kursi',
      'Jumlah',
      'Total Harga',
      'Status',
      'Waktu Transaksi',
    ];
    const rows = ordersList.map((o) =>
      [
        `"${o.orderCode}"`,
        `"${o.eventTitle.replace(/"/g, '""')}"`,
        `"${o.artist.replace(/"/g, '""')}"`,
        `"${o.venue.replace(/"/g, '""')}"`,
        `"${o.date}"`,
        `"${o.userName.replace(/"/g, '""')}"`,
        `"${o.userEmail}"`,
        `"${o.categoryName}"`,
        `"${(o.seatNumbers || '').replace(/"/g, '""')}"`,
        o.quantity,
        o.totalPrice,
        `"${o.status}"`,
        `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
      ].join(',')
    );
    const csv =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent([headers.join(','), ...rows].join('\n'));
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
    SCANNER: {
      title: 'Pemindai Kamera Gate & Validasi Check-In',
      subtitle: 'Sistem kontrol pintu masuk pertunjukan',
    },
    METRICS: {
      title: 'Dashboard Metrik & Pendapatan Finansial',
      subtitle: 'Ringkasan transaksi dan kapasitas kursi konser',
    },
    EVENTS: {
      title: 'Manajemen Postingan Tiket Konser',
      subtitle: 'Kelola konser, jadwal open gate, dan kategori kursi',
    },
    ORDERS: {
      title: 'Pengelolaan Pesanan & Laporan Transaksi',
      subtitle:
        currentRole === 'PETUGAS'
          ? 'Verifikasi data pesanan penonton dan check-in manual di gate'
          : 'Cari, perbarui status, dan ekspor laporan pesanan',
    },
    REFUNDS: {
      title: 'Persetujuan Permohonan Refund Tiket',
      subtitle: 'Tinjau pengajuan pengembalian dana penonton',
    },
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
    <SidebarProvider>
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

      <SidebarInset>
        <MobileHeader
          activeTab={activeTab}
          role={currentRole}
          onRefresh={refreshData}
          isLoading={isLoading}
        />

        <header className="hidden md:flex sticky top-0 items-center justify-between gap-4 px-6 py-3.5 border-b border-border bg-card z-20">
          <div className="flex items-center gap-3 min-w-0">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold text-card-foreground tracking-tight leading-tight m-0 truncate">
                {tabLabels[activeTab].title}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 m-0 truncate">
                {tabLabels[activeTab].subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <AdminThemeToggle />

            <Button
              type="button"
              variant="outline"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw
                size={14}
                strokeWidth={1.7}
                className={isLoading ? 'animate-spin' : ''}
                aria-hidden="true"
              />
              <span>Refresh</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="secondary" className="gap-2">
                  <ShieldCheck
                    size={15}
                    className="text-[#C93018] dark:text-[#F2644E]"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold">
                    {currentRole === 'PETUGAS' ? 'Petugas Gate' : 'Administrator'}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Sesi Operasional</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {currentRole}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'dark' ? (
                    <Sun size={15} className="text-amber-300" aria-hidden="true" />
                  ) : (
                    <Moon size={15} aria-hidden="true" />
                  )}
                  <span>{theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/" className="no-underline">
                    <ExternalLink size={15} aria-hidden="true" />
                    <span>Buka Halaman Utama</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut size={15} aria-hidden="true" />
                  <span>Keluar Sesi</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {onClose && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onClose}
                aria-label="Tutup Admin"
              >
                <X size={16} strokeWidth={1.7} aria-hidden="true" />
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-10 max-w-[1280px] mx-auto w-full space-y-6">
          {loadError && (
            <div
              role="alert"
              className="p-4 rounded-xl border border-[#B91C1C]/35 bg-[#B91C1C]/10 dark:border-rose-500/40 dark:bg-rose-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 text-sm text-[#B91C1C] dark:text-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{loadError}</span>
              </div>
              <Button type="button" variant="dark" size="sm" onClick={refreshData} className="shrink-0">
                Coba Lagi
              </Button>
            </div>
          )}

          {activeTab === 'SCANNER' && (
            <React.Suspense fallback={<PanelSkeleton />}>
              <GateScannerPanel events={eventsList} onScanSuccess={() => refreshData()} />
            </React.Suspense>
          )}
          {currentRole === 'ADMIN' && activeTab === 'METRICS' && (
            <React.Suspense fallback={<PanelSkeleton />}>
              <MetricsPanel
                metrics={metrics}
                eventsCount={eventsList.length}
                onGoToOrders={() => setActiveTab('ORDERS')}
              />
            </React.Suspense>
          )}
          {currentRole === 'ADMIN' && activeTab === 'EVENTS' && (
            <EventsPanel
              events={eventsList}
              isLoading={isLoading}
              onAddEvent={() => {
                setShowAddEventModal(true);
                setEventForm(EMPTY_EVENT_FORM);
              }}
              onEditEvent={(evt) => {
                const resolvedOpenGate = evt.openGate || calculateDefaultOpenGate(evt.time);
                setEditingEvent(evt);
                setEventForm({
                  title: evt.title,
                  artist: evt.artist,
                  venue: evt.venue,
                  date: evt.date,
                  time: evt.time,
                  category: evt.category,
                  categoryBadgeColor: evt.categoryBadgeColor,
                  image: evt.image,
                  audioUrl: evt.audioUrl || '',
                  conductor: evt.conductor || '',
                  subtitle: evt.subtitle || '',
                  openGate: resolvedOpenGate,
                  address: evt.address || '',
                  googleMapsUrl: evt.googleMapsUrl || '',
                  organizer: evt.organizer || '',
                  description: evt.description || '',
                  initialCatName: '',
                  initialCatPrice: 0,
                  initialCatQuota: 0,
                  rundown:
                    evt.rundown && evt.rundown.length > 0
                      ? evt.rundown.map((item) => ({ ...item }))
                      : generateDynamicRundown(evt.time, resolvedOpenGate),
                });
              }}
              onDeleteEvent={handleDeleteEvent}
              onToggleCloseEvent={handleToggleCloseEvent}
              onAddCategory={(evt) => {
                setShowAddCategoryModal(evt);
                setCatForm(EMPTY_CAT_FORM);
              }}
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
              role={currentRole}
              isLoading={isLoading}
              checkingInCode={checkingInCode}
              search={orderSearch}
              statusFilter={orderStatusFilter}
              onSearchChange={setOrderSearch}
              onStatusFilterChange={setOrderStatusFilter}
              onUpdateStatus={handleUpdateStatus}
              onManualCheckIn={handleManualCheckIn}
              onExportCSV={handleExportCSV}
            />
          )}
          {currentRole === 'ADMIN' && activeTab === 'REFUNDS' && (
            <RefundsPanel
              refunds={filteredRefunds}
              isLoading={isLoading}
              search={refundSearch}
              statusFilter={refundStatusFilter}
              onSearchChange={setRefundSearch}
              onStatusFilterChange={setRefundStatusFilter}
              onUpdateStatus={handleUpdateRefundStatus}
            />
          )}
        </main>
      </SidebarInset>

      <MobileBottomNav activeTab={activeTab} role={currentRole} onTabChange={setActiveTab} />

      <EventFormModal
        isOpen={showAddEventModal || !!editingEvent}
        editingEvent={editingEvent}
        form={eventForm}
        isLoading={isLoading}
        onFormChange={setEventForm}
        onClose={() => {
          setShowAddEventModal(false);
          setEditingEvent(null);
        }}
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

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium max-w-sm ${
            toast.type === 'error'
              ? 'bg-[#B91C1C] border-[#B91C1C] text-white'
              : 'bg-card border-border text-card-foreground'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          ) : (
            <Check
              className="w-4 h-4 text-[#1F6E43] dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => setToast(null)}
            className="ml-1 min-h-[32px] min-w-[32px] inline-flex items-center justify-center opacity-75 hover:opacity-100 rounded"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <AlertDialog
        open={Boolean(confirmModal)}
        onOpenChange={(open) => {
          if (!open) setConfirmModal(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmModal?.title || ''}</AlertDialogTitle>
            <AlertDialogDescription>{confirmModal?.message || ''}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmModal(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmModal?.onConfirm()}
              className={
                confirmModal?.variant === 'danger'
                  ? 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
                  : undefined
              }
            >
              {confirmModal?.confirmLabel || 'Konfirmasi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export const AdminApp: React.FC<AdminAppProps> = (props) => (
  <AdminThemeProvider>
    <TooltipProvider delayDuration={150}>
      <AdminAppInner {...props} />
    </TooltipProvider>
  </AdminThemeProvider>
);
