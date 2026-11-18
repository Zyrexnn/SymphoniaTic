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
import { FormField, TextInputField, TextAreaField, fieldInputBase } from '@/components/ui/form-controls';

export interface EventFormData {
  title: string; artist: string; venue: string; date: string; time: string;
  category: string; categoryBadgeColor: string; image: string; audioUrl?: string; description: string;
  conductor: string; subtitle: string; openGate: string; address: string; googleMapsUrl: string;
  organizer: string; initialCatName: string; initialCatPrice: number; initialCatQuota: number;
  rundown: RundownItem[];
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
  isOpen, editingEvent, form, isLoading, onFormChange, onClose, onSubmit,
}) => {
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [openGateCustomized, setOpenGateCustomized] = useState(false);
  const [rundownCustomized, setRundownCustomized] = useState(false);
  const formId = useId();
  const categorySelectId = useId();
  const uploadInputId = useId();
  const coverUrlId = useId();

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
    const shouldAutoRundown = !rundownCustomized && (!isEdit || !form.rundown || form.rundown.length === 0);
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

  const hasGateOrderError = Boolean(form.openGate && form.time && !isTimeBefore(form.openGate, form.time));
  const canSyncRundown = Boolean(parseTimeString(form.time));

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-xs text-[#94A3B8] m-0 hidden sm:block">
        Periksa kembali jadwal konser, open gate, dan lokasi sebelum menyimpan.
      </p>
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#E4E4E7] hover:text-white bg-[#0C0D12] border border-[#3E4357] hover:border-white/50 rounded-lg transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          form={formId}
          disabled={isLoading || hasGateOrderError}
          className="min-h-[44px] px-6 py-2.5 text-sm font-semibold text-[#0C0D12] bg-white hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-40"
        >
          {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan Event' : 'Simpan & Terbitkan Event'}
        </button>
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
      footer={footer}
    >
      <form id={formId} onSubmit={handleFormSubmit} className="space-y-8">
        <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-5">
          <div className="border-b border-[#272A38] pb-3">
            <h3 className="text-sm font-semibold text-white m-0">1. Informasi Utama Pertunjukan</h3>
            <p className="text-xs text-[#94A3B8] mt-1 m-0">
              Judul, nama orkestra atau solois, konduktor, dan deskripsi resmi konser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInputField
              label="Judul Konser"
              required
              value={form.title}
              onValueChange={(v) => update({ title: v })}
              placeholder="Simfoni Beethoven No. 9"
            />
            <TextInputField
              label="Musisi / Orkestra"
              required
              value={form.artist}
              onValueChange={(v) => update({ artist: v })}
              placeholder="Jakarta Philharmonic Orchestra"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField label="Kategori Genre Konser" htmlFor={categorySelectId} required>
              <select
                id={categorySelectId}
                value={form.category}
                onChange={(e) => {
                  const val = e.target.value;
                  update({ category: val, categoryBadgeColor: 'bg-white/10 text-white border-white/20' });
                }}
                className={fieldInputBase}
              >
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre} className="bg-[#14161F]">
                    {genre}
                  </option>
                ))}
              </select>
            </FormField>

            <TextInputField
              label="Konduktor"
              value={form.conductor}
              onValueChange={(v) => update({ conductor: v })}
              placeholder="Nama konduktor utama"
            />
            <TextInputField
              label="Subtitle / Tagline"
              value={form.subtitle}
              onValueChange={(v) => update({ subtitle: v })}
              placeholder="Pertunjukan Simfoni Malam Gala"
            />
          </div>

          <TextAreaField
            label="Deskripsi Konser"
            rows={4}
            value={form.description}
            onValueChange={(v) => update({ description: v })}
            placeholder="Tuliskan repertoar, latar belakang pertunjukan, dan catatan penting untuk penonton."
          />
        </section>

        <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-5">
          <div className="border-b border-[#272A38] pb-3">
            <h3 className="text-sm font-semibold text-white m-0">2. Jadwal &amp; Lokasi Venue</h3>
            <p className="text-xs text-[#94A3B8] mt-1 m-0">
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
              className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm flex items-start gap-3"
            >
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Waktu Open Gate harus lebih awal dari Waktu Konser.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInputField
              label="Venue / Gedung"
              required
              value={form.venue}
              onValueChange={(v) => update({ venue: v })}
              placeholder="Aula Simfonia Jakarta"
            />
            <TextInputField
              label="Alamat Lengkap Venue / Link Google Maps"
              value={form.address}
              onValueChange={(v) => update({ address: v })}
              placeholder="Jl. Industri Blok B14 No.1 atau https://maps.google.com/..."
              hint="Digunakan untuk petunjuk peta di halaman detail konser dan e-ticket."
            />
          </div>
        </section>

        <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-5">
          <div className="border-b border-[#272A38] pb-3">
            <h3 className="text-sm font-semibold text-white m-0">3. Media Cover &amp; Audio Pratinjau</h3>
            <p className="text-xs text-[#94A3B8] mt-1 m-0">
              Tempel URL gambar atau unggah berkas lokal untuk poster konser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-8 space-y-4">
              <FormField label="URL Gambar Cover Konser" htmlFor={coverUrlId}>
                <input
                  id={coverUrlId}
                  type="text"
                  placeholder="https://... atau unggah gambar lokal"
                  value={form.image}
                  onChange={(e) => update({ image: e.target.value })}
                  className={fieldInputBase}
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
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 border border-[#3E4357] bg-[#0C0D12] rounded-lg text-sm font-medium text-[#E4E4E7] hover:text-white hover:border-white/60 transition-colors select-none"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>{isUploading ? 'Mengunggah...' : 'Upload Gambar Lokal'}</span>
                </label>

                {uploadError && (
                  <span role="alert" className="text-xs text-rose-400">
                    {uploadError}
                  </span>
                )}
              </div>

              <TextInputField
                label="URL Audio Cuplikan (Opsional)"
                value={form.audioUrl || ''}
                onValueChange={(v) => update({ audioUrl: v })}
                placeholder="/audio/sample-symphony.mp3"
              />
            </div>

            <div className="md:col-span-4">
              <span className="block text-xs font-medium text-[#E4E4E7] mb-1.5">Pratinjau Poster</span>
              <div className="aspect-[16/10] w-full rounded-xl border border-[#272A38] bg-[#0C0D12] overflow-hidden flex items-center justify-center">
                {form.image ? (
                  <img
                    src={form.image}
                    alt={form.title || 'Pratinjau cover konser'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-[#94A3B8]">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1.5" aria-hidden="true" />
                    <span className="text-xs block">Belum ada gambar</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#272A38] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white m-0">4. Rangkaian Acara (Rundown)</h3>
              <p className="text-xs text-[#94A3B8] mt-1 m-0">
                Susun jadwal pintu dibuka, bagian pertama, jeda istirahat, hingga penutup.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={!canSyncRundown}
                onClick={handleSyncRundown}
                className="min-h-[44px] text-xs font-medium bg-[#0C0D12] border border-[#3E4357] rounded-lg px-3.5 py-2 flex items-center gap-2 text-[#E4E4E7] hover:text-white hover:border-white/60 disabled:opacity-40 transition-colors"
              >
                <RefreshCw size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>Sinkronkan dari Waktu Konser</span>
              </button>
              <button
                type="button"
                onClick={handleAddRundownItem}
                className="min-h-[44px] text-xs font-semibold text-[#0C0D12] bg-white hover:bg-neutral-200 rounded-lg px-3.5 py-2 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} strokeWidth={2} aria-hidden="true" />
                <span>Tambah Item</span>
              </button>
            </div>
          </div>

          {(!form.rundown || form.rundown.length === 0) ? (
            <div className="rounded-xl border border-dashed border-[#3E4357] bg-[#0C0D12] p-6 text-center">
              <p className="text-sm text-[#A1A1AA] m-0">
                Belum ada item rundown. Isi waktu konser lalu klik Sinkronkan, atau tambahkan item secara manual.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.rundown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center p-3.5 rounded-xl border border-[#272A38] bg-[#0C0D12]"
                >
                  <input
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
                    className={`${fieldInputBase} sm:w-40 shrink-0 font-mono`}
                  />
                  <input
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
                    className={`${fieldInputBase} flex-1`}
                  />
                  <button
                    type="button"
                    aria-label={`Hapus item rundown ${idx + 1}`}
                    onClick={() => {
                      setRundownCustomized(true);
                      const updated = form.rundown.filter((_, i) => i !== idx);
                      update({ rundown: updated });
                    }}
                    className="min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center gap-1.5 text-rose-400 bg-[#14161F] border border-rose-500/30 rounded-lg hover:bg-rose-500/20 transition-colors shrink-0"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    <span className="sm:hidden text-xs font-medium">Hapus Item</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {!isEdit && (
          <section className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-7 space-y-5">
            <div className="border-b border-[#272A38] pb-3">
              <h3 className="text-sm font-semibold text-white m-0">5. Kategori Tiket Awal</h3>
              <p className="text-xs text-[#94A3B8] mt-1 m-0">
                Kategori tambahan dapat ditambahkan setelah konser diterbitkan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <TextInputField
                label="Nama Kategori"
                required
                value={form.initialCatName}
                onValueChange={(v) => update({ initialCatName: v })}
                placeholder="VIP Pit"
              />
              <TextInputField
                label="Harga (IDR)"
                required
                type="number"
                min={1000}
                value={form.initialCatPrice}
                onValueChange={(v) => update({ initialCatPrice: Number(v) })}
                hint={form.initialCatPrice > 0 ? `Tampil sebagai ${formatIDR(form.initialCatPrice)}` : undefined}
              />
              <TextInputField
                label="Kuota Kursi"
                required
                type="number"
                min={1}
                value={form.initialCatQuota}
                onValueChange={(v) => update({ initialCatQuota: Number(v) })}
              />
            </div>
          </section>
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
      label={label}
      htmlFor={inputId}
      required
      hint={value ? `Format tersimpan: ${value}` : 'Pilih tanggal dari kalender'}
    >
      <input
        id={inputId}
        type="date"
        required
        value={isoValue}
        onChange={handleDateSelect}
        className={`${fieldInputBase} [color-scheme:dark]`}
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

const TimePickerField: React.FC<TimePickerFieldProps> = ({ label, value, onChange, required = true }) => {
  const inputId = useId();
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

  const handleTzChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextTz = e.target.value;
    setFallbackTz(nextTz);
    if (parsed) {
      onChange(formatTimeString(parsed.hours, parsed.minutes, nextTz));
    }
  };

  return (
    <FormField
      label={label}
      htmlFor={inputId}
      required={required}
      hint={value ? `Format tersimpan: ${value}` : undefined}
    >
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="time"
          required={required}
          value={timeValue}
          onChange={handleTimeSelect}
          className={`${fieldInputBase} flex-1 min-w-0 [color-scheme:dark]`}
        />
        <select
          aria-label={`${label} zona waktu`}
          value={activeTz}
          onChange={handleTzChange}
          className={`${fieldInputBase} w-[88px] shrink-0`}
        >
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz} value={tz} className="bg-[#14161F]">
              {tz}
            </option>
          ))}
        </select>
      </div>
    </FormField>
  );
};
