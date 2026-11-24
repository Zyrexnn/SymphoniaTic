import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Calendar, Clock, User, Ticket, CalendarClock, Ban, RotateCcw } from 'lucide-react';
import type { CancelEventPayload, EventItem, RescheduleEventPayload, TicketCategory } from '../landing/data';
import { formatIDR, formatSalesEndLabel } from '../landing/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface EventsPanelProps {
  events: EventItem[];
  isLoading?: boolean;
  onAddEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onToggleCloseEvent?: (id: string) => void;
  onCancelEvent?: (id: string, payload: CancelEventPayload) => Promise<boolean>;
  onRescheduleEvent?: (id: string, payload: RescheduleEventPayload) => Promise<boolean>;
  onBatchRefundEvent?: (id: string, title: string) => Promise<void>;
  onAddCategory: (event: EventItem) => void;
  onEditCategory: (eventId: string, cat: TicketCategory) => void;
  onDeleteCategory: (catId: string, name: string) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  events,
  isLoading,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleCloseEvent,
  onCancelEvent,
  onRescheduleEvent,
  onBatchRefundEvent,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [rescheduleTarget, setRescheduleTarget] = useState<EventItem | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newOpenGate, setNewOpenGate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleNotify, setRescheduleNotify] = useState(true);
  const [isLifecycleSubmitting, setIsLifecycleSubmitting] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<EventItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotify, setCancelNotify] = useState(true);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [batchRefundTarget, setBatchRefundTarget] = useState<EventItem | null>(null);
  const [isBatchRefunding, setIsBatchRefunding] = useState(false);

  const openRescheduleModal = (evt: EventItem) => {
    setRescheduleTarget(evt);
    setNewDate(evt.date || '');
    setNewTime(evt.time || '');
    setNewOpenGate(evt.openGate || '');
    setRescheduleReason('');
    setRescheduleNotify(true);
  };

  const openCancelModal = (evt: EventItem) => {
    setCancelTarget(evt);
    setCancelReason('');
    setCancelNotify(true);
  };

  const submitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !onRescheduleEvent) return;
    setIsLifecycleSubmitting(true);
    const ok = await onRescheduleEvent(String(rescheduleTarget.id), {
      newDate: newDate.trim(),
      newTime: newTime.trim(),
      newOpenGate: newOpenGate.trim() || undefined,
      reason: rescheduleReason.trim(),
      notifyAttendees: rescheduleNotify,
    });
    setIsLifecycleSubmitting(false);
    if (ok) {
      setRescheduleTarget(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget || !onCancelEvent) return;
    setCancelConfirmOpen(false);
    setIsLifecycleSubmitting(true);
    const ok = await onCancelEvent(String(cancelTarget.id), {
      reason: cancelReason.trim(),
      notifyAttendees: cancelNotify,
    });
    setIsLifecycleSubmitting(false);
    if (ok) {
      setCancelTarget(null);
    }
  };

  return (
  <div className="flex flex-col gap-6 pb-8">
    <Card>
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-base font-semibold text-card-foreground tracking-tight m-0">
            Postingan Konser &amp; Kategori Tiket
          </h2>
          <p className="text-xs text-muted-foreground mt-1 m-0 leading-relaxed">
            Kelola jadwal pertunjukan, jam open gate, penutupan penjualan tiket, lokasi venue, serta kuota kursi.
          </p>
        </div>
        <Button type="button" onClick={onAddEvent} className="shrink-0">
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          <span>Tambah Konser Baru</span>
        </Button>
      </CardContent>
    </Card>

    {isLoading && events.length === 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    ) : events.length === 0 ? (
      <Card className="border-dashed border-border-strong">
        <CardContent className="p-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-none border border-border bg-background flex items-center justify-center mb-3">
            <Ticket className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-foreground m-0">
            Belum Ada Konser Terdaftar
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 mb-5 max-w-md">
            Tambahkan jadwal konser pertama Anda untuk mulai membuka pemesanan tiket dan kategori kursi.
          </p>
          <Button type="button" onClick={onAddEvent}>
            <Plus size={16} aria-hidden="true" />
            <span>Tambah Konser Pertama</span>
          </Button>
        </CardContent>
      </Card>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((evt) => (
          <EventCard
            key={evt.id}
            event={evt}
            onEdit={() => onEditEvent(evt)}
            onDelete={() => onDeleteEvent(String(evt.id), evt.title)}
            onToggleClose={() => onToggleCloseEvent && onToggleCloseEvent(String(evt.id))}
            onReschedule={() => openRescheduleModal(evt)}
            onCancelEvent={() => openCancelModal(evt)}
            onBatchRefund={() => setBatchRefundTarget(evt)}
            onAddCategory={() => onAddCategory(evt)}
            onEditCategory={(cat) => onEditCategory(String(evt.id), cat)}
            onDeleteCategory={(catId, name) => onDeleteCategory(catId, name)}
          />
        ))}
      </div>
    )}

    <Dialog open={!!rescheduleTarget} onOpenChange={(open) => !open && setRescheduleTarget(null)}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Undur Jadwal Konser</DialogTitle>
          <DialogDescription>
            Perbarui jadwal untuk <strong>{rescheduleTarget?.title}</strong>. Jadwal awal akan disimpan sebagai riwayat.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submitReschedule} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="resched-date">Tanggal Baru</Label>
            <Input
              id="resched-date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder="Sabtu, 25 April 2027"
              className="rounded-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="resched-time">Jam Mulai Baru</Label>
              <Input
                id="resched-time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="20:00 WIB"
                className="rounded-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resched-gate">Open Gate Baru (Opsional)</Label>
              <Input
                id="resched-gate"
                value={newOpenGate}
                onChange={(e) => setNewOpenGate(e.target.value)}
                placeholder="18:30 WIB"
                className="rounded-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resched-reason">Alasan Perubahan Jadwal</Label>
            <Textarea
              id="resched-reason"
              required
              rows={3}
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="Misal: Penyesuaian jadwal konduktor tamu..."
              className="rounded-none"
            />
          </div>
          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={rescheduleNotify}
              onChange={(e) => setRescheduleNotify(e.target.checked)}
              className="mt-0.5"
            />
            <span>Kirim email pemberitahuan otomatis ke seluruh pemegang tiket</span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRescheduleTarget(null)} className="rounded-none">
              Batal
            </Button>
            <Button type="submit" disabled={isLifecycleSubmitting} className="rounded-none">
              {isLifecycleSubmitting ? 'Menyimpan...' : 'Simpan Jadwal Baru'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
      <DialogContent className="rounded-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400">Batalkan Konser</DialogTitle>
          <DialogDescription>
            Tindakan ini menutup penjualan tiket secara permanen dan membuka hak refund penuh bagi seluruh pemegang tiket{' '}
            <strong>{cancelTarget?.title}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">Alasan Pembatalan</Label>
            <Textarea
              id="cancel-reason"
              required
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Jelaskan alasan pembatalan secara resmi untuk ditampilkan kepada penonton..."
              className="rounded-none"
            />
          </div>
          <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={cancelNotify}
              onChange={(e) => setCancelNotify(e.target.checked)}
              className="mt-0.5"
            />
            <span>Kirim email pemberitahuan pembatalan &amp; panduan refund ke seluruh pemegang tiket</span>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelTarget(null)} className="rounded-none">
              Tutup
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!cancelReason.trim() || isLifecycleSubmitting}
              onClick={() => setCancelConfirmOpen(true)}
              className="rounded-none"
            >
              Batalkan Konser
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
      <AlertDialogContent className="rounded-none">
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Pembatalan Konser Permanen</AlertDialogTitle>
          <AlertDialogDescription>
            Setelah dibatalkan, seluruh tiket konser <strong>{cancelTarget?.title}</strong> tidak dapat digunakan untuk
            check-in di gate dan penjualan tiket tidak dapat dibuka kembali. Lanjutkan pembatalan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none">Kembali</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmCancel}
            className="rounded-none bg-red-600 text-white hover:bg-red-700"
          >
            Ya, Batalkan Konser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={!!batchRefundTarget} onOpenChange={(open) => !open && setBatchRefundTarget(null)}>
      <AlertDialogContent className="rounded-none">
        <AlertDialogHeader>
          <AlertDialogTitle>Proses Refund Massal Konser Batal</AlertDialogTitle>
          <AlertDialogDescription>
            Seluruh tiket aktif (<strong>ISSUED / VERIFIED / REMINDED</strong>) untuk konser{' '}
            <strong>{batchRefundTarget?.title}</strong> yang belum pernah diajukan refund akan langsung disetujui,
            kursi dikembalikan menjadi tersedia, dan email pemberitahuan dikirimkan ke masing-masing pembeli.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none" disabled={isBatchRefunding}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isBatchRefunding}
            onClick={async () => {
              if (!batchRefundTarget || !onBatchRefundEvent) return;
              setIsBatchRefunding(true);
              await onBatchRefundEvent(String(batchRefundTarget.id), batchRefundTarget.title);
              setIsBatchRefunding(false);
              setBatchRefundTarget(null);
            }}
            className="rounded-none bg-[#C81E1E] text-white hover:bg-[#A01616]"
          >
            {isBatchRefunding ? 'Memproses...' : 'Ya, Proses Refund Massal'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
  );
};

interface EventCardProps {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleClose: () => void;
  onReschedule: () => void;
  onCancelEvent: () => void;
  onBatchRefund: () => void;
  onAddCategory: () => void;
  onEditCategory: (cat: TicketCategory) => void;
  onDeleteCategory: (catId: string, name: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event: evt,
  onEdit,
  onDelete,
  onToggleClose,
  onReschedule,
  onCancelEvent,
  onBatchRefund,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const isCancelled = evt.status === 'CANCELLED';
  const isRescheduled = evt.status === 'RESCHEDULED';
  const nowMs = Date.now();
  const salesEndMs = evt.salesEndAt ? new Date(evt.salesEndAt).getTime() : NaN;
  const eventStartMs = evt.eventDateTime ? new Date(evt.eventDateTime).getTime() : NaN;
  const isClosedBySchedule =
    (!Number.isNaN(salesEndMs) && salesEndMs <= nowMs) ||
    (Number.isNaN(salesEndMs) && !Number.isNaN(eventStartMs) && eventStartMs <= nowMs);

  return (
    <Card className="p-5 sm:p-6 flex flex-col justify-between gap-5 transition-colors hover:border-border-strong">
      <div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-28 h-44 sm:h-28 shrink-0 overflow-hidden rounded-none border border-border bg-background">
            <img
              src={evt.image}
              alt={evt.title}
              width={224}
              height={224}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono text-[11px] uppercase rounded-none">
                  {evt.category || 'SIMFONI'}
                </Badge>
                {isCancelled ? (
                  <Badge className="font-mono text-[11px] rounded-none bg-red-500/15 text-red-500 border border-red-500/30">
                    DIBATALKAN
                  </Badge>
                ) : isRescheduled ? (
                  <Badge className="font-mono text-[11px] rounded-none bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    DIUNDUR
                  </Badge>
                ) : (
                  <Badge className="font-mono text-[11px] rounded-none bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    AKTIF
                  </Badge>
                )}
                {evt.isClosed && !isCancelled && (
                  <Badge variant="destructive" className="font-mono text-[11px] rounded-none">
                    PENJUALAN DITUTUP
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isClosedBySchedule || isCancelled}
                        onClick={onToggleClose}
                        className={
                          evt.isClosed
                            ? 'border-[#156E3F]/35 bg-[#156E3F]/10 text-[#156E3F] hover:bg-[#156E3F]/20 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300'
                            : 'border-[#C81E1E]/35 bg-[#C81E1E]/10 text-[#C81E1E] hover:bg-[#C81E1E]/20 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-300'
                        }
                      >
                        {isCancelled ? 'Dibatalkan' : isClosedBySchedule ? 'Tutup (Jadwal)' : evt.isClosed ? 'Buka Order' : 'Tutup Order'}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isClosedBySchedule
                      ? 'Penjualan ditutup otomatis sesuai jadwal. Ubah Batas Penjualan melalui Edit Konser untuk membuka kembali.'
                      : 'Mengatur status penjualan tiket online tanpa memblokir check-in tiket yang sudah terbit.'}
                  </TooltipContent>
                </Tooltip>

              {isCancelled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onBatchRefund}
                      className="rounded-none border-[#C81E1E]/40 bg-[#C81E1E]/10 text-[#C81E1E] hover:bg-[#C81E1E] hover:text-white"
                    >
                      <RotateCcw size={13} strokeWidth={1.8} aria-hidden="true" />
                      <span>Proses Refund Massal</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Setujui refund seluruh tiket aktif konser yang dibatalkan ini</TooltipContent>
                </Tooltip>
              )}

              {!isCancelled && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onReschedule}
                        aria-label={`Undur jadwal ${evt.title}`}
                        className="rounded-none border-amber-500/35 text-amber-600 dark:text-amber-300 hover:bg-amber-500/10"
                      >
                        <CalendarClock size={15} strokeWidth={1.7} aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undur Jadwal Konser</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onCancelEvent}
                        aria-label={`Batalkan konser ${evt.title}`}
                        className="rounded-none border-red-500/35 text-red-600 dark:text-red-300 hover:bg-red-500/10"
                      >
                        <Ban size={15} strokeWidth={1.7} aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Batalkan Konser</TooltipContent>
                  </Tooltip>
                </>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onEdit}
                    aria-label={`Edit event ${evt.title}`}
                  >
                    <Edit size={15} strokeWidth={1.7} aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Konser</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onDelete}
                    aria-label={`Hapus event ${evt.title}`}
                    className="border-[#C81E1E]/35 text-[#C81E1E] hover:bg-[#C81E1E]/10 dark:border-rose-500/35 dark:text-rose-300 dark:hover:bg-rose-500/15"
                  >
                    <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hapus Konser</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <h3 className="font-display text-2xl font-semibold text-card-foreground tracking-tight leading-tight m-0">
            {evt.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-0 truncate">{evt.artist}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
        <DetailBox icon={MapPin} label="Venue" value={evt.venue} />
        <DetailBox icon={Calendar} label="Jadwal" value={`${evt.date} (${evt.time})`} />
        {evt.conductor && <DetailBox icon={User} label="Konduktor" value={evt.conductor} />}
        {evt.openGate && <DetailBox icon={Clock} label="Open Gate" value={evt.openGate} />}
        {evt.salesEndAt && (
          <DetailBox icon={Clock} label="Batas Penjualan" value={formatSalesEndLabel(evt.salesEndAt)} />
        )}
      </div>

      <div className="border-t border-border mt-5 pt-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Kategori Tiket &amp; Kuota
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onAddCategory}>
            <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>Kategori Baru</span>
          </Button>
        </div>

        <div className="space-y-2.5">
          {evt.categories && evt.categories.length > 0 ? (
            evt.categories.map((cat) => {
              const remaining = cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota;
              return (
                <div
                  key={cat.id}
                  className="border border-border bg-background rounded-none p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {cat.name}
                      </span>
                      {remaining < 10 && (
                        <Badge variant="destructive" className="font-mono text-[11px]">
                          Kuota Menipis
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5 tabular-nums">
                      Sisa {remaining} dari {cat.quota} kursi
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-foreground font-semibold tabular-nums">
                      {formatIDR(cat.price)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onEditCategory(cat)}
                        aria-label={`Edit kategori ${cat.name}`}
                      >
                        <Edit size={14} strokeWidth={1.7} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteCategory(cat.id, cat.name)}
                        aria-label={`Hapus kategori ${cat.name}`}
                        className="border-[#C81E1E]/35 text-[#C81E1E] hover:bg-[#C81E1E]/10 dark:border-rose-500/35 dark:text-rose-300 dark:hover:bg-rose-500/15"
                      >
                        <Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-muted-foreground py-2">
              Belum ada kategori tiket disetel.
            </div>
          )}
        </div>
      </div>
    </div>
  </Card>
  );
};

const DetailBox: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="border border-border bg-background rounded-none p-3 flex items-start gap-2.5">
    <Icon size={14} className="text-foreground dark:text-[#D4FF2A] mt-0.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
    <div className="min-w-0">
      <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase block">
        {label}
      </span>
      <span className="text-xs font-medium text-foreground block truncate mt-0.5 tabular-nums">
        {value}
      </span>
    </div>
  </div>
);
