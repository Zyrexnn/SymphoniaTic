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
import type {
  EventItem,
  TicketCategory,
  OrderRecord,
  AdminMetricsData,
  AdminRole,
  PromotionItem,
  StaffMember,
  AuditLogItem,
  EmailBroadcastRecord,
  BroadcastRecipientRecord,
  CancelEventPayload,
  RescheduleEventPayload,
  CreateBroadcastPayload,
} from '../landing/data';
import {
  adminLoginAPI,
  fetchAdminMetricsAPI,
  fetchEventsAPI,
  createEventAPI,
  updateEventAPI,
  deleteEventAPI,
  cancelEventAPI,
  rescheduleEventAPI,
  batchRefundEventAPI,
  createTicketCategoryAPI,
  updateTicketCategoryAPI,
  deleteTicketCategoryAPI,
  fetchAdminOrdersAPI,
  updateOrderStatusAPI,
  fetchAdminRefundsAPI,
  updateRefundStatusAPI,
  checkInTicketAPI,
  fetchAdminPromosAPI,
  createAdminPromoAPI,
  updateAdminPromoAPI,
  toggleAdminPromoActiveAPI,
  deleteAdminPromoAPI,
  fetchAdminStaffAPI,
  createAdminStaffAPI,
  updateAdminStaffAPI,
  toggleAdminStaffStatusAPI,
  resetAdminStaffPasswordAPI,
  deleteAdminStaffAPI,
  fetchAdminAuditLogsAPI,
  fetchAdminBroadcastsAPI,
  createAdminBroadcastAPI,
  fetchBroadcastRecipientsAPI,
  retryBroadcastAPI,
} from '../landing/data';

import { AdminThemeProvider, AdminThemeToggle, useAdminTheme } from './AdminThemeContext';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar, MobileHeader, MobileBottomNav, type TabId } from './AdminSidebar';
import { EventsPanel } from './EventsPanel';
import { BroadcastPanel } from './BroadcastPanel';
import { PromosPanel } from './PromosPanel';
import { OrdersPanel } from './OrdersPanel';
import { RefundsPanel, type RefundRecord } from './RefundsPanel';
import { StaffPanel } from './StaffPanel';
import { StaffFormModal, type StaffFormData } from './StaffFormModal';
import { AuditLogsPanel } from './AuditLogsPanel';
import { EventFormModal, type EventFormData } from './EventFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { PromoFormModal, type PromoFormData } from './PromoFormModal';
import { Skeleton } from '@/components/ui/skeleton';

const MetricsPanel = React.lazy(() => import('./MetricsPanel').then((m) => ({ default: m.MetricsPanel })));
const GateScannerPanel = React.lazy(() =>
  import('./GateScannerPanel').then((m) => ({ default: m.GateScannerPanel }))
);

const PanelSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 w-full rounded-none" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full rounded-none" />
      <Skeleton className="h-64 w-full rounded-none" />
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
  salesEndAt: '',
  initialCatName: 'VIP Pit',
  initialCatPrice: 1000000,
  initialCatQuota: 50,
  rundown: [],
};

function toLocalDateTimeInput(iso?: string): string {
  if (!iso) return '';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function toIsoOrNull(localVal?: string): string | null {
  if (!localVal) return null;
  const dt = new Date(localVal);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

const EMPTY_CAT_FORM = { name: '', price: 500000, quota: 50 };

const EMPTY_STAFF_FORM: StaffFormData = {
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'PETUGAS',
};

function createDefaultPromoForm(): PromoFormData {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 100000,
    maxDiscount: 50000,
    isMemberOnly: true,
    isActive: true,
    quota: 100,
    validFrom: toLocalDateTimeInput(now.toISOString()),
    validUntil: toLocalDateTimeInput(nextMonth.toISOString()),
  };
}

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
      const saved = sessionStorage.getItem('symphoniatic_admin_role');
      if (saved === 'SUPER_ADMIN' || saved === 'ADMIN' || saved === 'PETUGAS') return saved;
      return 'ADMIN';
    } catch {
      return 'ADMIN';
    }
  });
  const [currentStaffId, setCurrentStaffId] = useState<string>(() => {
    try {
      return sessionStorage.getItem('symphoniatic_admin_id') || '';
    } catch {
      return '';
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
  const [promosList, setPromosList] = useState<PromotionItem[]>([]);
  const [ordersList, setOrdersList] = useState<OrderRecord[]>([]);
  const [refundsList, setRefundsList] = useState<RefundRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogItem[]>([]);
  const [broadcastsList, setBroadcastsList] = useState<EmailBroadcastRecord[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
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
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromotionItem | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [catForm, setCatForm] = useState(EMPTY_CAT_FORM);
  const [promoForm, setPromoForm] = useState<PromoFormData>(() => createDefaultPromoForm());
  const [staffForm, setStaffForm] = useState<StaffFormData>(EMPTY_STAFF_FORM);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'default';
    onConfirm: () => void;
  } | null>(null);

  const handleCancelEvent = async (id: string, payload: CancelEventPayload): Promise<boolean> => {
    try {
      const res = await cancelEventAPI(id, payload);
      if (!res?.success) {
        showToast(res?.message || 'Gagal membatalkan konser', 'error');
        return false;
      }
      showToast(res.message || 'Konser berhasil dibatalkan', 'success');
      await refreshData();
      return true;
    } catch {
      showToast('Terjadi kesalahan jaringan saat membatalkan konser', 'error');
      return false;
    }
  };

  const handleRescheduleEvent = async (id: string, payload: RescheduleEventPayload): Promise<boolean> => {
    try {
      const res = await rescheduleEventAPI(id, payload);
      if (!res?.success) {
        showToast(res?.message || 'Gagal menjadwalkan ulang konser', 'error');
        return false;
      }
      showToast(res.message || 'Jadwal konser berhasil diperbarui', 'success');
      await refreshData();
      return true;
    } catch {
      showToast('Terjadi kesalahan jaringan saat memperbarui jadwal', 'error');
      return false;
    }
  };

  const handleSendBroadcast = async (payload: CreateBroadcastPayload): Promise<boolean> => {
    setIsBroadcasting(true);
    try {
      const res = await createAdminBroadcastAPI(payload);
      if (!res?.success) {
        showToast(res?.message || 'Gagal mengirim broadcast email', 'error');
        return false;
      }
      showToast(res.message || 'Broadcast email sedang diproses', 'success');
      await refreshData();
      return true;
    } catch {
      showToast('Terjadi kesalahan jaringan saat mengirim broadcast', 'error');
      return false;
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleBatchRefundEvent = async (id: string, title: string) => {
    try {
      const res = await batchRefundEventAPI(id);
      if (!res?.success) {
        showToast(res?.message || `Gagal memproses refund massal untuk ${title}`, 'error');
        return;
      }
      const processed = res.data?.processedCount ?? 0;
      const skipped = res.data?.skippedCount ?? 0;
      showToast(`Refund massal ${title}: ${processed} disetujui, ${skipped} dilewati`, 'success');
      await refreshData();
    } catch {
      showToast('Terjadi kesalahan jaringan saat memproses refund massal', 'error');
    }
  };

  const handleRetryBroadcast = async (broadcastId: string) => {
    try {
      const res = await retryBroadcastAPI(broadcastId);
      if (!res?.success) {
        showToast(res?.message || 'Gagal mengirim ulang broadcast', 'error');
        return;
      }
      showToast(res.message || 'Pengiriman ulang sedang diproses', 'success');
      await refreshData();
    } catch {
      showToast('Terjadi kesalahan jaringan saat mengirim ulang broadcast', 'error');
    }
  };

  const handleFetchBroadcastRecipients = async (broadcastId: string): Promise<BroadcastRecipientRecord[]> => {
    try {
      const res = await fetchBroadcastRecipientsAPI(broadcastId);
      return res?.success && Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const canManageOps = currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN';
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';

  const refreshData = async () => {
    const activeRole = currentRole;
    const opsAllowed = activeRole === 'ADMIN' || activeRole === 'SUPER_ADMIN';
    const superAllowed = activeRole === 'SUPER_ADMIN';

    setIsLoading(true);
    setLoadError(null);
    try {
      const [ords, evts, met, rfds, promosRes, staffRes, auditRes, broadcastsRes] = await Promise.all([
        fetchAdminOrdersAPI(orderSearch, orderStatusFilter),
        fetchEventsAPI(),
        opsAllowed ? fetchAdminMetricsAPI() : Promise.resolve(null),
        opsAllowed ? fetchAdminRefundsAPI() : Promise.resolve([]),
        opsAllowed ? fetchAdminPromosAPI() : Promise.resolve({ success: true, data: [] }),
        superAllowed ? fetchAdminStaffAPI() : Promise.resolve({ success: true, data: [] }),
        superAllowed ? fetchAdminAuditLogsAPI() : Promise.resolve({ success: true, data: [] }),
        opsAllowed ? fetchAdminBroadcastsAPI().catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: true, data: [] }),
      ]);
      if (ords) setOrdersList(ords);
      if (evts) setEventsList(evts);
      if (met) setMetrics(met);
      if (rfds) setRefundsList(rfds);
      if (promosRes?.success && Array.isArray(promosRes.data)) setPromosList(promosRes.data);
      if (staffRes?.success && Array.isArray(staffRes.data)) setStaffList(staffRes.data);
      if (auditRes?.success && Array.isArray(auditRes.data)) setAuditLogsList(auditRes.data);
      if (broadcastsRes?.success && Array.isArray(broadcastsRes.data)) setBroadcastsList(broadcastsRes.data);
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
    } else if (currentRole === 'ADMIN' && (activeTab === 'STAFF' || activeTab === 'AUDIT_LOGS')) {
      setActiveTab('METRICS');
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
        const userRole = (res.data?.user?.role ||
          (cleanUser === 'petugas'
            ? 'PETUGAS'
            : cleanUser === 'superadmin'
            ? 'SUPER_ADMIN'
            : 'ADMIN')) as AdminRole;
        const staffId = String(res.data?.user?.id || '');
        try {
          sessionStorage.setItem('symphoniatic_admin_token', res.data.token);
          sessionStorage.setItem('symphoniatic_admin_role', userRole);
          sessionStorage.setItem('symphoniatic_admin_id', staffId);
        } catch {}
        setCurrentRole(userRole);
        setCurrentStaffId(staffId);
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
      sessionStorage.removeItem('symphoniatic_admin_id');
    } catch {}
    setCurrentStaffId('');
    setStaffList([]);
    setAuditLogsList([]);
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
          '/images/concerts/symphony-no-5.jpg',
        audioUrl: eventForm.audioUrl || '',
        conductor: eventForm.conductor,
        subtitle: eventForm.subtitle,
        openGate: eventForm.openGate,
        address: eventForm.address,
        organizer: eventForm.organizer,
        description: eventForm.description,
        salesEndAt: toIsoOrNull(eventForm.salesEndAt),
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
        salesEndAt: toIsoOrNull(eventForm.salesEndAt),
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

  const buildPromoPayload = () => {
    const validFromIso = toIsoOrNull(promoForm.validFrom);
    const validUntilIso = toIsoOrNull(promoForm.validUntil);
    if (!validFromIso || !validUntilIso) {
      return null;
    }
    return {
      code: promoForm.code.trim().toUpperCase(),
      description: promoForm.description.trim(),
      discountType: promoForm.discountType,
      discountValue: Number(promoForm.discountValue),
      minOrderAmount: Number(promoForm.minOrderAmount) || 0,
      maxDiscount: promoForm.discountType === 'PERCENTAGE' ? Number(promoForm.maxDiscount) || 0 : 0,
      isMemberOnly: promoForm.isMemberOnly,
      isActive: promoForm.isActive,
      quota: Number(promoForm.quota),
      validFrom: validFromIso,
      validUntil: validUntilIso,
    };
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPromoPayload();
    if (!payload) {
      showToast('Format tanggal mulai dan berakhir promo tidak valid', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await createAdminPromoAPI(payload);
      if (res.success) {
        setShowAddPromoModal(false);
        setPromoForm(createDefaultPromoForm());
        showToast('Kode promo kustom berhasil dibuat', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'Gagal membuat kode promo', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;
    const payload = buildPromoPayload();
    if (!payload) {
      showToast('Format tanggal mulai dan berakhir promo tidak valid', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await updateAdminPromoAPI(editingPromo.id, payload);
      if (res.success) {
        setEditingPromo(null);
        showToast('Kode promo berhasil diperbarui', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'Gagal memperbarui kode promo', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePromoActive = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await toggleAdminPromoActiveAPI(id);
      if (res.success) {
        showToast(res.message || 'Status aktif promo diperbarui', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'Gagal mengubah status promo', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePromo = (id: string, code: string) => {
    setConfirmModal({
      title: 'Hapus Kode Promo',
      message: `Hapus kode promo "${code}" secara permanen? Pembeli tidak akan dapat menukarkan kode ini lagi.`,
      confirmLabel: 'Hapus Promo',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setIsLoading(true);
        try {
          const res = await deleteAdminPromoAPI(id);
          if (res.success) {
            showToast('Kode promo berhasil dihapus', 'success');
            await refreshData();
          } else {
            showToast(res.message || 'Gagal menghapus kode promo', 'error');
          }
        } catch {
          showToast('Terjadi kesalahan koneksi server', 'error');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleExportFinancialCSV = () => {
    const eventStats = metrics?.eventStats || [];
    if (eventStats.length === 0 && ordersList.length === 0) {
      showToast('Belum ada data transaksi finansial untuk diekspor', 'error');
      return;
    }

    const lines: string[] = [];
    lines.push('REKAPITULASI PENDAPATAN PER KONSER');
    lines.push(['ID Event', 'Judul Konser', 'Tiket Terjual', 'Total Pendapatan (IDR)'].join(','));
    for (const st of eventStats) {
      lines.push(
        [`"${st.eventId}"`, `"${st.title.replace(/"/g, '""')}"`, st.ticketsSold, st.revenue].join(',')
      );
    }
    lines.push('');
    lines.push('RINGKASAN KEUANGAN SISTEM');
    lines.push(['Total Pendapatan (IDR)', metrics?.totalRevenue || 0].join(','));
    lines.push(['Total Tiket Terjual', metrics?.ticketsSold || 0].join(','));
    lines.push(['Total Pesanan', metrics?.totalOrders || 0].join(','));
    lines.push('');
    lines.push('RINCIAN TRANSAKSI TERCATAT');
    lines.push(['Kode Pesanan', 'Event', 'Pemesan', 'Kategori', 'Jumlah', 'Total (IDR)', 'Status', 'Waktu'].join(','));
    for (const o of ordersList) {
      lines.push(
        [
          `"${o.orderCode}"`,
          `"${o.eventTitle.replace(/"/g, '""')}"`,
          `"${o.userName.replace(/"/g, '""')}"`,
          `"${o.categoryName}"`,
          o.quantity,
          o.totalPrice,
          `"${o.status}"`,
          `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
        ].join(',')
      );
    }

    const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.href = csv;
    link.download = `SymphoniaTic_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan keuangan CSV berhasil diunduh', 'success');
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await createAdminStaffAPI({
        username: staffForm.username.trim(),
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        password: staffForm.password,
        role: staffForm.role,
      });
      if (res.success) {
        setShowAddStaffModal(false);
        setStaffForm(EMPTY_STAFF_FORM);
        showToast(res.message || 'Akun staf baru berhasil ditambahkan', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'Gagal menambahkan akun staf', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setIsLoading(true);
    try {
      const res = await updateAdminStaffAPI(editingStaff.id, {
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        role: staffForm.role,
      });
      if (res.success) {
        setEditingStaff(null);
        setStaffForm(EMPTY_STAFF_FORM);
        showToast(res.message || 'Data akun staf berhasil diperbarui', 'success');
        await refreshData();
      } else {
        showToast(res.message || 'Gagal memperbarui akun staf', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStaffStatus = (staff: StaffMember) => {
    const actionLabel = staff.isActive ? 'Nonaktifkan' : 'Aktifkan';
    setConfirmModal({
      title: `${actionLabel} Akun Staf`,
      message: `${actionLabel} akses login untuk akun "@${staff.username}" (${staff.name})?`,
      confirmLabel: actionLabel,
      variant: staff.isActive ? 'danger' : 'default',
      onConfirm: async () => {
        setConfirmModal(null);
        setIsLoading(true);
        try {
          const res = await toggleAdminStaffStatusAPI(staff.id);
          if (res.success) {
            showToast(res.message || 'Status akun staf diperbarui', 'success');
            await refreshData();
          } else {
            showToast(res.message || 'Gagal mengubah status akun staf', 'error');
          }
        } catch {
          showToast('Terjadi kesalahan koneksi server', 'error');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleResetStaffPassword = async (staffId: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await resetAdminStaffPasswordAPI(staffId, newPassword);
      if (res.success) {
        showToast(res.message || 'Kata sandi staf berhasil direset', 'success');
        await refreshData();
        return true;
      }
      showToast(res.message || 'Gagal mereset kata sandi staf', 'error');
      return false;
    } catch {
      showToast('Terjadi kesalahan koneksi server', 'error');
      return false;
    }
  };

  const handleDeleteStaff = (staff: StaffMember) => {
    setConfirmModal({
      title: 'Hapus Permanen Akun Staf',
      message: `Hapus akun "@${staff.username}" (${staff.name}) secara permanen? Staf tersebut tidak akan lagi dapat masuk ke portal operasional.`,
      confirmLabel: 'Hapus Akun',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setIsLoading(true);
        try {
          const res = await deleteAdminStaffAPI(staff.id);
          if (res.success) {
            showToast(res.message || 'Akun staf berhasil dihapus', 'success');
            await refreshData();
          } else {
            showToast(res.message || 'Gagal menghapus akun staf', 'error');
          }
        } catch {
          showToast('Terjadi kesalahan koneksi server', 'error');
        } finally {
          setIsLoading(false);
        }
      },
    });
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
    PROMOS: {
      title: 'Manajemen Kode Promo & Voucher',
      subtitle: 'Buat kode promo kustom, kuota penukaran, dan syarat keanggotaan',
    },
    BROADCASTS: {
      title: 'Broadcast Email Dinamis',
      subtitle: 'Kirim pengumuman, promo, atau notifikasi jadwal ke peserta konser maupun seluruh akun',
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
    STAFF: {
      title: 'Manajemen Akun Staf & Kontrol Akses',
      subtitle: 'Kelola akun Super Admin, Administrator, dan Petugas Gate secara terpusat',
    },
    AUDIT_LOGS: {
      title: 'Log Audit Aktivitas & Keamanan Sistem',
      subtitle: 'Rekam jejak kronologis operasi administrasi, transaksi, dan perubahan akses',
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
        promosCount={promosList.length}
        ordersCount={ordersList.length}
        refundsCount={(refundsList || []).filter((r) => r.status === 'PENDING').length}
        staffCount={staffList.length}
        auditLogsCount={auditLogsList.length}
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
                    className="text-foreground dark:text-[#D4FF2A]"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold">
                    {currentRole === 'SUPER_ADMIN'
                      ? 'Super Admin'
                      : currentRole === 'PETUGAS'
                      ? 'Petugas Gate'
                      : 'Administrator'}
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
              className="p-4 rounded-none border border-[#C81E1E]/35 bg-[#C81E1E]/10 dark:border-rose-500/40 dark:bg-rose-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 text-sm text-[#C81E1E] dark:text-rose-200">
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
          {canManageOps && activeTab === 'METRICS' && (
            <React.Suspense fallback={<PanelSkeleton />}>
              <MetricsPanel
                metrics={metrics}
                eventsCount={eventsList.length}
                onGoToOrders={() => setActiveTab('ORDERS')}
                onExportFinancialCSV={handleExportFinancialCSV}
              />
            </React.Suspense>
          )}
          {canManageOps && activeTab === 'EVENTS' && (
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
                  salesEndAt: toLocalDateTimeInput(evt.salesEndAt),
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
              onCancelEvent={handleCancelEvent}
              onRescheduleEvent={handleRescheduleEvent}
              onBatchRefundEvent={handleBatchRefundEvent}
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
          {canManageOps && activeTab === 'BROADCASTS' && (
            <BroadcastPanel
              events={eventsList}
              promos={promosList}
              broadcasts={broadcastsList}
              isLoading={isLoading}
              isSubmitting={isBroadcasting}
              onRefresh={refreshData}
              onSendBroadcast={handleSendBroadcast}
              onRetryBroadcast={handleRetryBroadcast}
              onFetchRecipients={handleFetchBroadcastRecipients}
            />
          )}
          {canManageOps && activeTab === 'PROMOS' && (
            <PromosPanel
              promos={promosList}
              isLoading={isLoading}
              onAddPromo={() => {
                setPromoForm(createDefaultPromoForm());
                setShowAddPromoModal(true);
              }}
              onEditPromo={(promo) => {
                setEditingPromo(promo);
                setPromoForm({
                  code: promo.code,
                  description: promo.description || '',
                  discountType: promo.discountType,
                  discountValue: promo.discountValue,
                  minOrderAmount: promo.minOrderAmount || 0,
                  maxDiscount: promo.maxDiscount || 0,
                  isMemberOnly: promo.isMemberOnly,
                  isActive: promo.isActive,
                  quota: promo.quota,
                  validFrom: toLocalDateTimeInput(promo.validFrom),
                  validUntil: toLocalDateTimeInput(promo.validUntil),
                });
              }}
              onToggleActive={handleTogglePromoActive}
              onDeletePromo={handleDeletePromo}
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
          {canManageOps && activeTab === 'REFUNDS' && (
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
          {isSuperAdmin && activeTab === 'STAFF' && (
            <StaffPanel
              staffList={staffList}
              currentStaffId={currentStaffId}
              isLoading={isLoading}
              onAddStaff={() => {
                setStaffForm(EMPTY_STAFF_FORM);
                setShowAddStaffModal(true);
              }}
              onEditStaff={(staff) => {
                setEditingStaff(staff);
                setStaffForm({
                  username: staff.username,
                  name: staff.name,
                  email: staff.email,
                  password: '',
                  role: staff.role,
                });
              }}
              onToggleStatus={handleToggleStaffStatus}
              onResetPassword={handleResetStaffPassword}
              onDeleteStaff={handleDeleteStaff}
            />
          )}
          {isSuperAdmin && activeTab === 'AUDIT_LOGS' && (
            <AuditLogsPanel logs={auditLogsList} isLoading={isLoading} onNotify={showToast} />
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

      <PromoFormModal
        isOpen={showAddPromoModal || !!editingPromo}
        editingPromo={editingPromo}
        form={promoForm}
        isLoading={isLoading}
        onFormChange={setPromoForm}
        onClose={() => {
          setShowAddPromoModal(false);
          setEditingPromo(null);
        }}
        onSubmit={editingPromo ? handleUpdatePromo : handleCreatePromo}
      />

      <StaffFormModal
        isOpen={showAddStaffModal || !!editingStaff}
        editingStaff={editingStaff}
        currentStaffId={currentStaffId}
        form={staffForm}
        isLoading={isLoading}
        onFormChange={setStaffForm}
        onClose={() => {
          setShowAddStaffModal(false);
          setEditingStaff(null);
        }}
        onSubmit={editingStaff ? handleUpdateStaff : handleCreateStaff}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-none border shadow-xl text-sm font-medium max-w-sm ${
            toast.type === 'error'
              ? 'bg-[#C81E1E] border-[#C81E1E] text-white'
              : 'bg-card border-border text-card-foreground'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          ) : (
            <Check
              className="w-4 h-4 text-[#156E3F] dark:text-emerald-400 shrink-0"
              aria-hidden="true"
            />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Tutup notifikasi"
            onClick={() => setToast(null)}
            className="ml-1 min-h-[32px] min-w-[32px] inline-flex items-center justify-center opacity-75 hover:opacity-100 rounded-none"
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
                  ? 'bg-[#C81E1E] text-white hover:bg-[#9E1616]'
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
