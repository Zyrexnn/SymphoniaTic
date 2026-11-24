import React, { useEffect, useMemo, useState } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Users,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Eye,
} from 'lucide-react';
import type {
  BroadcastCategory,
  BroadcastRecipientRecord,
  BroadcastTargetScope,
  CreateBroadcastPayload,
  EmailBroadcastRecord,
  EventItem,
  PromotionItem,
} from '../landing/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface BroadcastPanelProps {
  events: EventItem[];
  promos: PromotionItem[];
  broadcasts: EmailBroadcastRecord[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onRefresh: () => void;
  onSendBroadcast: (payload: CreateBroadcastPayload) => Promise<boolean>;
  onRetryBroadcast: (broadcastId: string) => Promise<void>;
  onFetchRecipients: (broadcastId: string) => Promise<BroadcastRecipientRecord[]>;
}

const VARIABLE_TOKENS = [
  { token: '{{name}}', label: 'Nama Penerima' },
  { token: '{{eventTitle}}', label: 'Judul Konser' },
  { token: '{{orderCode}}', label: 'Kode Pesanan' },
];

const CATEGORY_LABELS: Record<BroadcastCategory, string> = {
  ANNOUNCEMENT: 'Pengumuman',
  PROMO: 'Promosi',
  EVENT_CANCELLED: 'Pembatalan Konser',
  EVENT_RESCHEDULED: 'Perubahan Jadwal',
};

const SCOPE_LABELS: Record<BroadcastTargetScope, string> = {
  EVENT_ATTENDEES: 'Pemegang Tiket Konser Tertentu',
  CATEGORY_ATTENDEES: 'Pemegang Tiket Kategori Tertentu',
  ALL_USERS: 'Seluruh Akun Pengguna Terdaftar',
  ALL_CUSTOMERS: 'Seluruh Akun + Pembeli Unik',
};

export const BroadcastPanel: React.FC<BroadcastPanelProps> = ({
  events,
  promos,
  broadcasts,
  isLoading,
  isSubmitting,
  onRefresh,
  onSendBroadcast,
  onRetryBroadcast,
  onFetchRecipients,
}) => {
  const [targetScope, setTargetScope] = useState<BroadcastTargetScope>('EVENT_ATTENDEES');
  const [targetEventId, setTargetEventId] = useState<string>(events[0] ? String(events[0].id) : '');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [category, setCategory] = useState<BroadcastCategory>('ANNOUNCEMENT');
  const [subject, setSubject] = useState('');
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState(
    'Halo {{name}},\n\nKami ingin menyampaikan informasi terbaru mengenai konser Anda.'
  );
  const [promoCode, setPromoCode] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [recipientsModalBroadcast, setRecipientsModalBroadcast] = useState<EmailBroadcastRecord | null>(null);
  const [recipientsList, setRecipientsList] = useState<BroadcastRecipientRecord[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  useEffect(() => {
    if (!targetEventId && events.length > 0) {
      setTargetEventId(String(events[0].id));
    }
  }, [events, targetEventId]);

  const selectedEvent = useMemo(
    () => events.find((e) => String(e.id) === String(targetEventId)),
    [events, targetEventId]
  );

  const eventCategories = useMemo(() => selectedEvent?.categories || [], [selectedEvent]);

  useEffect(() => {
    if (targetScope === 'CATEGORY_ATTENDEES') {
      if (eventCategories.length > 0 && !eventCategories.some((c) => String(c.id) === String(targetCategoryId))) {
        setTargetCategoryId(String(eventCategories[0].id));
      } else if (eventCategories.length === 0) {
        setTargetCategoryId('');
      }
    }
  }, [targetScope, eventCategories, targetCategoryId]);

  const hasProcessingBroadcast = useMemo(
    () => broadcasts.some((b) => b.status === 'PROCESSING'),
    [broadcasts]
  );

  useEffect(() => {
    if (!hasProcessingBroadcast) return;
    const timer = window.setInterval(() => {
      onRefresh();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [hasProcessingBroadcast, onRefresh]);

  const activePromos = useMemo(() => promos.filter((p) => p.isActive), [promos]);

  const previewText = useMemo(() => {
    const sampleTitle = selectedEvent?.title || 'Symphony No. 5 in C minor';
    const replaceVars = (str: string) =>
      str
        .replaceAll('{{name}}', 'Clara Wijaya')
        .replaceAll('{{eventTitle}}', sampleTitle)
        .replaceAll('{{orderCode}}', 'SYM-842109');

    return {
      subject: replaceVars(subject || 'Subjek Email Broadcast'),
      headline: replaceVars(headline || 'Judul Utama Pesan'),
      body: replaceVars(bodyText || ''),
    };
  }, [subject, headline, bodyText, selectedEvent]);

  const insertToken = (token: string) => {
    setBodyText((prev) => `${prev}${prev.endsWith(' ') || prev.endsWith('\n') || prev === '' ? '' : ' '}${token}`);
  };

  const needsEvent = targetScope === 'EVENT_ATTENDEES' || targetScope === 'CATEGORY_ATTENDEES';
  const needsCategory = targetScope === 'CATEGORY_ATTENDEES';
  const canSubmit =
    subject.trim() !== '' &&
    headline.trim() !== '' &&
    bodyText.trim() !== '' &&
    (!needsEvent || targetEventId.trim() !== '') &&
    (!needsCategory || targetCategoryId.trim() !== '');

  const handleConfirmSend = async () => {
    setConfirmOpen(false);
    const ok = await onSendBroadcast({
      targetScope,
      targetEventId: needsEvent ? targetEventId : undefined,
      targetCategoryId: needsCategory ? targetCategoryId : undefined,
      category,
      subject: subject.trim(),
      headline: headline.trim(),
      bodyText: bodyText.trim(),
      promoCode: promoCode.trim() || undefined,
      ctaLabel: ctaLabel.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
    });
    if (ok) {
      setSubject('');
      setHeadline('');
      setPromoCode('');
      setCtaLabel('');
      setCtaUrl('');
    }
  };

  const handleOpenRecipients = async (b: EmailBroadcastRecord) => {
    setRecipientsModalBroadcast(b);
    setLoadingRecipients(true);
    const list = await onFetchRecipients(b.id);
    setRecipientsList(list);
    setLoadingRecipients(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card>
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-card-foreground tracking-tight m-0 flex items-center gap-2">
              <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>Broadcast Email Dinamis</span>
              {hasProcessingBroadcast && (
                <Badge className="rounded-none bg-[#D4FF2A] text-[#141413] text-[10px] font-mono">
                  AUTO-SYNC AKTIF
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 m-0 leading-relaxed">
              Kirim pengumuman, promo tiket, atau pemberitahuan jadwal ke pemegang tiket konser/kategori tertentu maupun seluruh akun pengguna.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="rounded-none shrink-0">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
            <span>Muat Ulang Riwayat</span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <Card className="xl:col-span-7">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="broadcast-scope">Target Penerima</Label>
                <select
                  id="broadcast-scope"
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value as BroadcastTargetScope)}
                  className="w-full h-10 px-3 bg-background border border-input text-sm text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="EVENT_ATTENDEES">Pemegang Tiket Konser Tertentu</option>
                  <option value="CATEGORY_ATTENDEES">Pemegang Tiket Kategori Tertentu</option>
                  <option value="ALL_USERS">Seluruh Akun Pengguna Terdaftar</option>
                  <option value="ALL_CUSTOMERS">Seluruh Akun + Pembeli Unik</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="broadcast-category">Kategori Email</Label>
                <select
                  id="broadcast-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BroadcastCategory)}
                  className="w-full h-10 px-3 bg-background border border-input text-sm text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="ANNOUNCEMENT">Pengumuman (Announcement)</option>
                  <option value="PROMO">Promosi &amp; Diskon (Respect Opt-Out)</option>
                  <option value="EVENT_RESCHEDULED">Perubahan Jadwal Konser</option>
                  <option value="EVENT_CANCELLED">Pembatalan Konser</option>
                </select>
              </div>
            </div>

            {needsEvent && (
              <div className={`grid grid-cols-1 ${needsCategory ? 'sm:grid-cols-2' : ''} gap-4`}>
                <div className="space-y-1.5">
                  <Label htmlFor="broadcast-event">Pilih Konser Target</Label>
                  <select
                    id="broadcast-event"
                    value={targetEventId}
                    onChange={(e) => setTargetEventId(e.target.value)}
                    className="w-full h-10 px-3 bg-background border border-input text-sm text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">-- Pilih Konser --</option>
                    {events.map((evt) => (
                      <option key={evt.id} value={String(evt.id)}>
                        {evt.title} ({evt.date}){' '}
                        {evt.status === 'CANCELLED' ? '[DIBATALKAN]' : evt.status === 'RESCHEDULED' ? '[DIUNDUR]' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {needsCategory && (
                  <div className="space-y-1.5">
                    <Label htmlFor="broadcast-ticket-cat">Pilih Kategori Tiket</Label>
                    <select
                      id="broadcast-ticket-cat"
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full h-10 px-3 bg-background border border-input text-sm text-foreground rounded-none focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {eventCategories.length === 0 ? (
                        <option value="">Tidak ada kategori</option>
                      ) : (
                        eventCategories.map((cat) => (
                          <option key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="broadcast-subject">Subjek Email</Label>
              <Input
                id="broadcast-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Misal: Informasi Open Gate {{eventTitle}}"
                className="rounded-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="broadcast-headline">Judul Utama (Headline)</Label>
              <Input
                id="broadcast-headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Misal: Jadwal Pintu Masuk Konser Dibuka Lebih Awal"
                className="rounded-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="broadcast-body">Isi Pesan</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Sisipkan variabel:</span>
                  {VARIABLE_TOKENS.map((item) => (
                    <button
                      key={item.token}
                      type="button"
                      onClick={() => insertToken(item.token)}
                      className="px-2 py-1 min-h-[28px] text-[11px] font-mono border border-border bg-muted/50 hover:bg-muted text-foreground rounded-none cursor-pointer"
                    >
                      {item.token}
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                id="broadcast-body"
                rows={6}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Tulis pesan Anda di sini..."
                className="rounded-none font-sans text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="broadcast-promo">Kode Promo (Opsional)</Label>
                <Input
                  id="broadcast-promo"
                  list="active-promo-list"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="SYMPHONIA10"
                  className="rounded-none font-mono"
                />
                <datalist id="active-promo-list">
                  {activePromos.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.description}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="broadcast-cta-label">Label Tombol CTA (Opsional)</Label>
                <Input
                  id="broadcast-cta-label"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Lihat Jadwal Konser"
                  className="rounded-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="broadcast-cta-url">Tautan CTA (Opsional)</Label>
                <Input
                  id="broadcast-cta-url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/refund atau https://..."
                  className="rounded-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                disabled={!canSubmit || isSubmitting}
                onClick={() => setConfirmOpen(true)}
                className="rounded-none min-h-[44px]"
              >
                <Send size={15} aria-hidden="true" />
                <span>{isSubmitting ? 'Mengirim Broadcast...' : 'Kirim Broadcast Email'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles size={14} aria-hidden="true" />
                Pratinjau Langsung Email
              </span>
              <Badge variant="outline" className="rounded-none text-[10px] font-mono">
                {CATEGORY_LABELS[category]}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                <span className="font-semibold text-foreground">Subjek: </span>
                {previewText.subject}
              </div>
              <div>
                <span className="font-semibold text-foreground">Target: </span>
                {SCOPE_LABELS[targetScope]}
                {needsEvent && selectedEvent ? ` — ${selectedEvent.title}` : ''}
              </div>
            </div>

            <div className="border border-[#141413] bg-[#F4F3EF] p-4 text-[#141413]">
              <div className="bg-white border border-[#141413]">
                <div className="bg-[#141413] px-5 py-4 text-[#F4F3EF] border-b border-[#141413]">
                  <div className="text-sm font-extrabold tracking-[0.2em]">SYMPHONIATIC.</div>
                  <span
                    className={`inline-block mt-2.5 px-2.5 py-0.5 text-[10px] font-mono font-extrabold tracking-wider ${
                      category === 'EVENT_CANCELLED'
                        ? 'bg-[#C81E1E] text-white'
                        : category === 'EVENT_RESCHEDULED'
                          ? 'bg-[#8A5A00] text-white'
                          : 'bg-[#D4FF2A] text-[#141413]'
                    }`}
                  >
                    {CATEGORY_LABELS[category].toUpperCase()}
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="text-base font-extrabold leading-snug m-0 text-[#141413]">{previewText.headline}</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-[#52514D] m-0">
                    {previewText.body}
                  </p>
                  {promoCode.trim() && (
                    <div className="bg-[#F4F3EF] border border-[#141413] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#52514D]">
                        Kode Promo Eksklusif
                      </div>
                      <div className="text-base font-extrabold font-mono tracking-widest mt-1 text-[#141413]">
                        {promoCode}
                      </div>
                    </div>
                  )}
                  {ctaLabel.trim() && ctaUrl.trim() && (
                    <div className="pt-1">
                      <span className="inline-block bg-[#141413] text-[#D4FF2A] border border-[#141413] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider">
                        {ctaLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 bg-[#F4F3EF] border-t border-[#DFDDD6] text-[10px] text-[#6E6D68] space-y-1">
                  <div>Pesan ini dikirim secara resmi oleh sistem informasi SymphoniaTic.</div>
                  {category === 'PROMO' && (
                    <div className="underline text-[#52514D]">Berhenti berlangganan email promo</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-semibold text-card-foreground m-0">Riwayat Pengiriman Broadcast</h3>
          {broadcasts.length === 0 ? (
            <p className="text-xs text-muted-foreground m-0 py-4">
              Belum ada riwayat broadcast email yang dikirim.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 pr-4">Waktu</th>
                    <th className="py-2.5 pr-4">Kategori</th>
                    <th className="py-2.5 pr-4">Target</th>
                    <th className="py-2.5 pr-4">Subjek</th>
                    <th className="py-2.5 pr-4">Terkirim</th>
                    <th className="py-2.5 pr-4">Status</th>
                    <th className="py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {broadcasts.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                        {new Date(b.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="rounded-none text-[10px]">
                          {CATEGORY_LABELS[b.category] || b.category}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-foreground flex items-center gap-1">
                          {b.targetScope === 'EVENT_ATTENDEES' || b.targetScope === 'CATEGORY_ATTENDEES' ? (
                            <Ticket size={12} />
                          ) : (
                            <Users size={12} />
                          )}
                          <span>{SCOPE_LABELS[b.targetScope] || b.targetScope}</span>
                        </div>
                        {b.targetEventName && (
                          <div className="text-[11px] text-muted-foreground">{b.targetEventName}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium text-foreground">{b.subject}</td>
                      <td className="py-3 pr-4 font-mono whitespace-nowrap">
                        {b.sentCount} / {b.totalRecipients}
                        {b.failedCount > 0 ? ` (${b.failedCount} gagal)` : ''}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="outline"
                          className={`rounded-none text-[10px] inline-flex items-center gap-1 ${
                            b.status === 'COMPLETED'
                              ? 'border-[#156E3F]/40 text-[#156E3F] dark:text-emerald-300'
                              : b.status === 'PROCESSING'
                                ? 'border-[#8A5A00]/40 text-[#8A5A00] dark:text-amber-300'
                                : 'border-[#C81E1E]/40 text-[#C81E1E] dark:text-red-300'
                          }`}
                        >
                          {b.status === 'COMPLETED' ? (
                            <CheckCircle2 size={11} />
                          ) : b.status === 'PROCESSING' ? (
                            <Clock size={11} />
                          ) : (
                            <AlertTriangle size={11} />
                          )}
                          <span>{b.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRecipients(b)}
                            className="rounded-none h-7 px-2 text-[11px]"
                          >
                            <Eye size={12} aria-hidden="true" />
                            <span>Detail</span>
                          </Button>
                          {(b.status === 'PARTIAL_FAILED' || b.status === 'FAILED') && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={retryingId === b.id}
                              onClick={async () => {
                                setRetryingId(b.id);
                                await onRetryBroadcast(b.id);
                                setRetryingId(null);
                              }}
                              className="rounded-none h-7 px-2 text-[11px] border-[#C81E1E]/40 text-[#C81E1E] hover:bg-[#C81E1E] hover:text-white"
                            >
                              <RotateCcw size={12} aria-hidden="true" />
                              <span>{retryingId === b.id ? '...' : 'Kirim Ulang Gagal'}</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!recipientsModalBroadcast} onOpenChange={(open) => !open && setRecipientsModalBroadcast(null)}>
        <DialogContent className="rounded-none sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Penerima Broadcast</DialogTitle>
            <DialogDescription>{recipientsModalBroadcast?.subject}</DialogDescription>
          </DialogHeader>
          {loadingRecipients ? (
            <p className="text-xs text-muted-foreground py-4">Memuat daftar penerima...</p>
          ) : recipientsList.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">Belum ada log penerima tercatat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground uppercase text-[10px]">
                    <th className="py-2 pr-3">Nama</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recipientsList.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2 pr-3 font-medium">{r.recipientName}</td>
                      <td className="py-2 pr-3 font-mono">{r.recipientEmail}</td>
                      <td className="py-2 pr-3">
                        <Badge
                          variant="outline"
                          className={`rounded-none text-[10px] ${
                            r.status === 'SENT'
                              ? 'border-[#156E3F]/40 text-[#156E3F]'
                              : r.status === 'FAILED'
                                ? 'border-[#C81E1E]/40 text-[#C81E1E]'
                                : 'border-[#8A5A00]/40 text-[#8A5A00]'
                          }`}
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">{r.errorMessage || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengiriman Broadcast Email</AlertDialogTitle>
            <AlertDialogDescription>
              Email dengan subjek <strong>&ldquo;{subject}&rdquo;</strong> akan dikirimkan secara massal ke target:{' '}
              <strong>
                {SCOPE_LABELS[targetScope]}
                {needsEvent && selectedEvent ? ` (${selectedEvent.title})` : ''}
              </strong>
              . Pastikan isi pesan sudah benar sebelum melanjutkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend} className="rounded-none">
              Ya, Kirim Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
