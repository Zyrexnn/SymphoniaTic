import React, { useState, useEffect, useId } from 'react';
import { Plus, Trash2, RefreshCw, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import { formatIDR, type EventItem, type RundownItem } from '../landing/data';
import {
  calculateDefaultOpenGate,
  formatTimeString,
  generateDynamicRundown,
  isTimeBefore,
  normalizeTimeString,
  parseDateFlexible,
  parseTimeString,
  shiftTimeMinutes,
} from '@/lib/timeUtils';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { FormField, TextInputField, TextAreaField } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminTheme } from './AdminThemeContext';

export interface EventFormData {
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  category: string;
  categoryBadgeColor: string;
  image: string;
  audioUrl?: string;
  description: string;
  conductor: string;
  subtitle: string;
  openGate: string;
  address: string;
  googleMapsUrl: string;
  organizer: string;
  salesEndAt: string;
  initialCatName: string;
  initialCatPrice: number;
  initialCatQuota: number;
  rundown: RundownItem[];
}

function toLocalDateTimeValue(dt: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

interface EventFormModalProps {
  isOpen: boolean;
  editingEvent: EventItem | null;
  form: EventFormData;
  isLoading: boolean;
  onFormChange: (form: EventFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const GENRE_OPTIONS = [
  'SIMFONI UTAMA',
  'SIMFONI',
  'KAMAR MUSIK',
  'SOLO RESITAL',
  'BALET & OPERA',
  'PADUAN SUARA',
  'NUSANTARA SYMPHONY',
];

const TIMEZONE_OPTIONS = ['WIB', 'WITA', 'WIT'] as const;

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  editingEvent,
  form,
  isLoading,
  onFormChange,
  onClose,
  onSubmit,
}) => {
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [openGateCustomized, setOpenGateCustomized] = useState(false);
  const [rundownCustomized, setRundownCustomized] = useState(false);
  const { theme } = useAdminTheme();
  const formId = useId();
  const categorySelectId = useId();
  const uploadInputId = useId();
  const coverUrlId = useId();
  const salesCutoffId = useId();

  const isEdit = !!editingEvent;

  useEffect(() => {
    if (!isOpen) return;
    setUploadError('');
    if (editingEvent) {
      const autoGate = calculateDefaultOpenGate(editingEvent.time);
      const normGate = normalizeTimeString(editingEvent.openGate);
      setOpenGateCustomized(Boolean(normGate && autoGate && normGate !== autoGate));
      setRundownCustomized(Boolean(editingEvent.rundown && editingEvent.rundown.length > 0));
    } else {
      setOpenGateCustomized(false);
      setRundownCustomized(false);
    }
  }, [isOpen, editingEvent?.id]);

  const update = (partial: Partial<EventFormData>) => onFormChange({ ...form, ...partial });

  const handleConcertTimeChange = (newTime: string) => {
    if (!newTime) {
      update({ time: '' });
      return;
    }

    const prevAutoGate = calculateDefaultOpenGate(form.time);
    const shouldAutoGate =
      !openGateCustomized &&
      (!isEdit || !form.openGate || normalizeTimeString(form.openGate) === prevAutoGate);

    const nextOpenGate = shouldAutoGate ? calculateDefaultOpenGate(newTime) : form.openGate;
    const shouldAutoRundown =
      !rundownCustomized && (!isEdit || !form.rundown || form.rundown.length === 0);
    const nextRundown = shouldAutoRundown
      ? generateDynamicRundown(newTime, nextOpenGate)
      : form.rundown;

    update({
      time: newTime,
      openGate: nextOpenGate,
      rundown: nextRundown,
    });
  };

  const handleOpenGateChange = (newGate: string) => {
    if (!newGate) {
      setOpenGateCustomized(false);
      update({ openGate: '' });
      return;
    }

    setOpenGateCustomized(true);
    if (!rundownCustomized && form.time && isTimeBefore(newGate, form.time)) {
      update({
        openGate: newGate,
        rundown: generateDynamicRundown(form.time, newGate),
      });
    } else {
      update({ openGate: newGate });
    }
  };

  const handleSyncRundown = () => {
    if (!parseTimeString(form.time)) return;
    const validGate =
      form.openGate && isTimeBefore(form.openGate, form.time)
        ? form.openGate
        : calculateDefaultOpenGate(form.time);
    const synced = generateDynamicRundown(form.time, validGate);
    setRundownCustomized(false);
    if (!form.openGate || !isTimeBefore(form.openGate, form.time)) {
      setOpenGateCustomized(false);
    }
    update({ openGate: validGate, rundown: synced });
  };

  const handleAddRundownItem = () => {
    const current = form.rundown || [];
    const lastTime = current.length > 0 ? current[current.length - 1].time : '';
    const nextTime =
      (lastTime && shiftTimeMinutes(lastTime, 30, { clampSameDay: false })) ||
      (form.time && normalizeTimeString(form.time)) ||
      (form.openGate && normalizeTimeString(form.openGate)) ||
      '';
    setRundownCustomized(true);
    update({ rundown: [...current, { time: nextTime, activity: 'Aktivitas Baru' }] });
  };

  const hasGateOrderError = Boolean(
    form.openGate && form.time && !isTimeBefore(form.openGate, form.time)
  );
  const parsedFormDate = parseDateFlexible(form.date);
  const parsedFormTime = parseTimeString(form.time);
  const parsedFormGate = parseTimeString(form.openGate);
  const canApplyCutoffPresets = Boolean(parsedFormDate && parsedFormTime);

  const hasCutoffOrderError = (() => {
    if (!form.salesEndAt || !parsedFormDate || !parsedFormTime) return false;
    const cutoffDt = new Date(form.salesEndAt);
    if (Number.isNaN(cutoffDt.getTime())) return false;
    const concertDt = new Date(
      Number(parsedFormDate.year),
      parsedFormDate.monthIndex,
      Number(parsedFormDate.day),
      parsedFormTime.hours,
      parsedFormTime.minutes,
      0,
      0
    );
    return cutoffDt.getTime() > concertDt.getTime();
  })();

  const applyCutoffPreset = (preset: 'one_hour_before_gate' | 'at_concert_start' | 'clear') => {
    if (preset === 'clear') {
      update({ salesEndAt: '' });
      return;
    }
    if (!parsedFormDate || !parsedFormTime) return;
    if (preset === 'at_concert_start') {
      const concertDt = new Date(
        Number(parsedFormDate.year),
        parsedFormDate.monthIndex,
        Number(parsedFormDate.day),
        parsedFormTime.hours,
        parsedFormTime.minutes,
        0,
        0
      );
      update({ salesEndAt: toLocalDateTimeValue(concertDt) });
      return;
    }
    const baseTime = parsedFormGate || parsedFormTime;
    const gateDt = new Date(
      Number(parsedFormDate.year),
      parsedFormDate.monthIndex,
      Number(parsedFormDate.day),
      baseTime.hours,
      baseTime.minutes,
      0,
      0
    );
    const oneHourBefore = new Date(gateDt.getTime() - 60 * 60 * 1000);
    update({ salesEndAt: toLocalDateTimeValue(oneHourBefore) });
  };

  const canSyncRundown = Boolean(parseTimeString(form.time));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-xs text-muted-foreground m-0 hidden sm:block">
        Periksa kembali jadwal konser, open gate, dan lokasi sebelum menyimpan.
      </p>
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <Button type="button" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={isLoading || hasGateOrderError || hasCutoffOrderError}
        >
          {isLoading
            ? 'Menyimpan...'
            : isEdit
            ? 'Simpan Perubahan Event'
            : 'Simpan & Terbitkan Event'}
        </Button>
      </div>
    </div>
  );

  return (
    <FullscreenWorkspace
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={isEdit ? 'Sunting Konser' : 'Buat Konser Baru'}
      title={isEdit ? 'Edit Detail Event Konser' : 'Tambah Event Konser Baru'}
      subtitle="Lengkapi informasi pertunjukan, jadwal, rangkaian acara, serta kategori kursi."
      maxWidthClass="max-w-5xl"
      backLabel="Kembali ke Daftar"
      theme="auto"
      footer={footer}
    >
      <form id={formId} onSubmit={handleFormSubmit} className="space-y-8">
        <Card className="p-5 sm:p-7 space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-card-foreground m-0">
              1. Informasi Utama Pertunjukan
            </h3>
            <p className="text-xs text-muted-foreground mt-1 m-0">
              Judul, nama orkestra atau solois, konduktor, dan deskripsi resmi konser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInputField
              theme="auto"
              label="Judul Konser"
              required
              value={form.title}
              onValueChange={(v) => update({ title: v })}
              placeholder="Simfoni Beethoven No. 9"
            />
            <TextInputField
              theme="auto"
              label="Musisi / Orkestra"
              required
              value={form.artist}
              onValueChange={(v) => update({ artist: v })}
              placeholder="Jakarta Philharmonic Orchestra"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField theme="auto" label="Kategori Genre Konser" htmlFor={categorySelectId} required>
              <Select
                value={form.category}
                onValueChange={(val) =>
                  update({ category: val, categoryBadgeColor: 'bg-white/10 text-white border-white/20' })
                }
              >
                <SelectTrigger id={categorySelectId}>
                  <SelectValue placeholder="Pilih genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRE_OPTIONS.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <TextInputField
              theme="auto"
              label="Konduktor"
              value={form.conductor}
              onValueChange={(v) => update({ conductor: v })}
              placeholder="Nama konduktor utama"
            />
            <TextInputField
              theme="auto"
              label="Subtitle / Tagline"
              value={form.subtitle}
              onValueChange={(v) => update({ subtitle: v })}
              placeholder="Pertunjukan Simfoni Malam Gala"
            />
          </div>

          <TextAreaField
            theme="auto"
            label="Deskripsi Konser"
            rows={4}
            value={form.description}
            onValueChange={(v) => update({ description: v })}
            placeholder="Tuliskan repertoar, latar belakang pertunjukan, dan catatan penting untuk penonton."
          />
        </Card>

        <Card className="p-5 sm:p-7 space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-card-foreground m-0">
              2. Jadwal &amp; Lokasi Venue
            </h3>
            <p className="text-xs text-muted-foreground mt-1 m-0">
              Waktu Open Gate harus lebih awal daripada waktu dimulainya konser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <DatePickerField
              label="Tanggal Konser"
              value={form.date}
              onChange={(formattedDate) => update({ date: formattedDate })}
            />
            <TimePickerField
              label="Waktu Konser"
              required
              value={form.time}
              onChange={handleConcertTimeChange}
            />
            <TimePickerField
              label="Waktu Open Gate"
              required
              value={form.openGate}
              onChange={handleOpenGateChange}
            />
          </div>

          {hasGateOrderError && (
            <div
              role="alert"
              className="p-4 rounded-none border border-[#8A5A00]/35 bg-[#8A5A00]/10 text-[#8A5A00] dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 text-sm flex items-start gap-3"
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>Waktu Open Gate harus lebih awal dari Waktu Konser.</span>
            </div>
          )}

          <FormField
            theme="auto"
            label="Batas Waktu Penjualan Tiket (Opsional)"
            htmlFor={salesCutoffId}
            hint="Kosongkan untuk menutup penjualan otomatis saat konser dimulai. Penutupan penjualan tidak memblokir check-in tiket yang sudah terjual."
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <Input
                id={salesCutoffId}
                type="datetime-local"
                value={form.salesEndAt}
                onChange={(e) => update({ salesEndAt: e.target.value })}
                className={`lg:max-w-xs ${
                  theme === 'dark' ? '[color-scheme:dark]' : '[color-scheme:light]'
                }`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!canApplyCutoffPresets}
                  onClick={() => applyCutoffPreset('one_hour_before_gate')}
                >
                  1 Jam Sebelum Open Gate
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!canApplyCutoffPresets}
                  onClick={() => applyCutoffPreset('at_concert_start')}
                >
                  Saat Konser Dimulai
                </Button>
                {form.salesEndAt && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => applyCutoffPreset('clear')}
                  >
                    Reset (Otomatis)
                  </Button>
                )}
              </div>
            </div>
          </FormField>

          {hasCutoffOrderError && (
            <div
              role="alert"
              className="p-4 rounded-none border border-[#8A5A00]/35 bg-[#8A5A00]/10 text-[#8A5A00] dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200 text-sm flex items-start gap-3"
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>Batas waktu penjualan tiket tidak boleh melebihi waktu mulai konser.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInputField
              theme="auto"
              label="Venue / Gedung"
              required
              value={form.venue}
              onValueChange={(v) => update({ venue: v })}
              placeholder="Aula Simfonia Jakarta"
            />
            <TextInputField
              theme="auto"
              label="Alamat Lengkap Venue / Link Google Maps"
              value={form.address}
              onValueChange={(v) => update({ address: v })}
              placeholder="Jl. Industri Blok B14 No.1 atau https://maps.google.com/..."
              hint="Digunakan untuk petunjuk peta di halaman detail konser dan e-ticket."
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-7 space-y-5">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-card-foreground m-0">
              3. Media Cover &amp; Audio Pratinjau
            </h3>
            <p className="text-xs text-muted-foreground mt-1 m-0">
              Tempel URL gambar atau unggah berkas lokal untuk poster konser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-8 space-y-4">
              <FormField theme="auto" label="URL Gambar Cover Konser" htmlFor={coverUrlId}>
                <Input
                  id={coverUrlId}
                  type="text"
                  placeholder="https://... atau unggah gambar lokal"
                  value={form.image}
                  onChange={(e) => update({ image: e.target.value })}
                />
              </FormField>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  id={uploadInputId}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    setUploadError('');
                    const formData = new FormData();
                    formData.append('image', file);
                    try {
                      const { uploadAdminImageAPI } = await import('../landing/data');
                      const data = await uploadAdminImageAPI(formData);
                      if (data.success && data.data?.url) {
                        update({ image: data.data.url });
                      } else {
                        setUploadError(data.message || 'Gagal mengunggah gambar');
                      }
                    } catch {
                      setUploadError('Terjadi kesalahan koneksi saat mengunggah gambar');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="sr-only"
                />
                <label
                  htmlFor={uploadInputId}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 border border-border-strong bg-background rounded-none text-sm font-medium text-foreground hover:border-foreground transition-colors select-none cursor-pointer"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>{isUploading ? 'Mengunggah...' : 'Upload Gambar Lokal'}</span>
                </label>

                {uploadError && (
                  <span role="alert" className="text-xs text-[#C81E1E] dark:text-rose-400">
                    {uploadError}
                  </span>
                )}
              </div>

              <TextInputField
                theme="auto"
                label="URL Audio Cuplikan (Opsional)"
                value={form.audioUrl || ''}
                onValueChange={(v) => update({ audioUrl: v })}
                placeholder="/audio/sample-symphony.mp3"
              />
            </div>

            <div className="md:col-span-4">
              <span className="block text-xs font-semibold text-foreground mb-1.5">
                Pratinjau Poster
              </span>
              <div className="aspect-[16/10] w-full rounded-none border border-border bg-background overflow-hidden flex items-center justify-center">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={form.title || 'Pratinjau cover konser'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1.5" aria-hidden="true" />
                    <span className="text-xs block">Belum ada gambar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-semibold text-card-foreground m-0">
                4. Rangkaian Acara (Rundown)
              </h3>
              <p className="text-xs text-muted-foreground mt-1 m-0">
                Susun jadwal pintu dibuka, bagian pertama, jeda istirahat, hingga penutup.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canSyncRundown}
                onClick={handleSyncRundown}
              >
                <RefreshCw size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>Sinkronkan dari Waktu Konser</span>
              </Button>
              <Button
                type="button"
                variant="dark"
                size="sm"
                onClick={handleAddRundownItem}
              >
                <Plus size={14} strokeWidth={2} aria-hidden="true" />
                <span>Tambah Item</span>
              </Button>
            </div>
          </div>

          {!form.rundown || form.rundown.length === 0 ? (
            <div className="rounded-none border border-dashed border-border-strong bg-background p-6 text-center">
              <p className="text-sm text-muted-foreground m-0">
                Belum ada item rundown. Isi waktu konser lalu klik Sinkronkan, atau tambahkan item secara manual.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.rundown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3.5 rounded-none border border-border bg-background"
                >
                  <Input
                    type="text"
                    aria-label={`Waktu item rundown ${idx + 1}`}
                    placeholder="18:00 WIB"
                    value={item.time}
                    onChange={(e) => {
                      setRundownCustomized(true);
                      const updated = form.rundown.map((it, i) =>
                        i === idx ? { ...it, time: e.target.value } : it
                      );
                      update({ rundown: updated });
                    }}
                    className="sm:w-40 shrink-0 font-mono"
                  />
                  <Input
                    type="text"
                    aria-label={`Kegiatan item rundown ${idx + 1}`}
                    placeholder="Kegiatan / Movement"
                    value={item.activity}
                    onChange={(e) => {
                      setRundownCustomized(true);
                      const updated = form.rundown.map((it, i) =>
                        i === idx ? { ...it, activity: e.target.value } : it
                      );
                      update({ rundown: updated });
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRundownCustomized(true);
                      const updated = form.rundown.filter((_, i) => i !== idx);
                      update({ rundown: updated });
                    }}
                    aria-label={`Hapus item rundown ${idx + 1}`}
                    className="border-[#C81E1E]/35 text-[#C81E1E] hover:bg-[#C81E1E]/10 dark:border-rose-500/35 dark:text-rose-300 dark:hover:bg-rose-500/15 shrink-0"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="sm:hidden text-xs font-medium">Hapus Item</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {!isEdit && (
          <Card className="p-5 sm:p-7 space-y-5">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-card-foreground m-0">
                5. Kategori Tiket Awal
              </h3>
              <p className="text-xs text-muted-foreground mt-1 m-0">
                Kategori tambahan dapat ditambahkan setelah konser diterbitkan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <TextInputField
                theme="auto"
                label="Nama Kategori"
                required
                value={form.initialCatName}
                onValueChange={(v) => update({ initialCatName: v })}
                placeholder="VIP Pit"
              />
              <TextInputField
                theme="auto"
                label="Harga (IDR)"
                required
                type="number"
                min={1000}
                value={form.initialCatPrice}
                onValueChange={(v) => update({ initialCatPrice: Number(v) })}
                hint={
                  form.initialCatPrice > 0
                    ? `Tampil sebagai ${formatIDR(form.initialCatPrice)}`
                    : undefined
                }
              />
              <TextInputField
                theme="auto"
                label="Kuota Kursi"
                required
                type="number"
                min={1}
                value={form.initialCatQuota}
                onValueChange={(v) => update({ initialCatQuota: Number(v) })}
              />
            </div>
          </Card>
        )}
      </form>
    </FullscreenWorkspace>
  );
};

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (formattedDate: string) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, value, onChange }) => {
  const inputId = useId();
  const { theme } = useAdminTheme();
  const parsed = parseDateFlexible(value);
  const isoValue = parsed ? parsed.iso : '';

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      onChange('');
      return;
    }
    const parsedNew = parseDateFlexible(rawVal);
    onChange(parsedNew ? parsedNew.formattedID : rawVal);
  };

  return (
    <FormField
      theme="auto"
      label={label}
      htmlFor={inputId}
      required
      hint={value ? `Format tersimpan: ${value}` : 'Pilih tanggal dari kalender'}
    >
      <Input
        id={inputId}
        type="date"
        required
        value={isoValue}
        onChange={handleDateSelect}
        className={theme === 'dark' ? '[color-scheme:dark]' : '[color-scheme:light]'}
      />
    </FormField>
  );
};

interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (formattedTime: string) => void;
  required?: boolean;
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  value,
  onChange,
  required = true,
}) => {
  const inputId = useId();
  const { theme } = useAdminTheme();
  const parsed = parseTimeString(value);
  const timeValue = parsed ? parsed.raw24 : '';
  const [fallbackTz, setFallbackTz] = useState<string>('WIB');

  const activeTz =
    parsed?.timezone && (TIMEZONE_OPTIONS as readonly string[]).includes(parsed.timezone)
      ? parsed.timezone
      : fallbackTz;

  const handleTimeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      onChange('');
      return;
    }
    const parsedInput = parseTimeString(rawVal);
    if (parsedInput) {
      onChange(formatTimeString(parsedInput.hours, parsedInput.minutes, activeTz));
    } else {
      onChange(`${rawVal} ${activeTz}`);
    }
  };

  const handleTzChange = (nextTz: string) => {
    setFallbackTz(nextTz);
    if (parsed) {
      onChange(formatTimeString(parsed.hours, parsed.minutes, nextTz));
    }
  };

  return (
    <FormField
      theme="auto"
      label={label}
      htmlFor={inputId}
      required={required}
      hint={value ? `Format tersimpan: ${value}` : undefined}
    >
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          type="time"
          required={required}
          value={timeValue}
          onChange={handleTimeSelect}
          className={`flex-1 min-w-0 ${
            theme === 'dark' ? '[color-scheme:dark]' : '[color-scheme:light]'
          }`}
        />
        <Select value={activeTz} onValueChange={handleTzChange}>
          <SelectTrigger aria-label={`${label} zona waktu`} className="w-[88px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </FormField>
  );
};
