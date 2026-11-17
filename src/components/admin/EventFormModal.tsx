import React, { useState, useEffect, useId } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import type { EventItem, RundownItem } from '../landing/data';
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
  const [openGateCustomized, setOpenGateCustomized] = useState(false);
  const [rundownCustomized, setRundownCustomized] = useState(false);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-form-modal-title"
        className="w-full max-w-2xl bg-[#14161F] border border-[#272A38] rounded-2xl my-auto max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="flex justify-between items-center border-b border-[#272A38] px-6 py-4 shrink-0 bg-[#0C0D12]/70 rounded-t-2xl">
          <h3 id="event-form-modal-title" className="text-base font-semibold text-white tracking-tight m-0">
            {isEdit ? 'Edit Detail Event Konser' : 'Tambah Event Konser Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-1.5 bg-[#0C0D12] border border-[#272A38] rounded-lg text-[#A1A1AA] hover:text-white cursor-pointer transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Judul Konser" required value={form.title} onChange={(v) => update({ title: v })} placeholder="Simfoni Beethoven No. 9" />
            <InputField label="Musisi / Orkestra" required value={form.artist} onChange={(v) => update({ artist: v })} placeholder="Royal Philharmonic Orchestra" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Venue / Gedung" required value={form.venue} onChange={(v) => update({ venue: v })} placeholder="Aula Simfonia Jakarta" />
            <DatePickerField
              label="Tanggal Konser (Pilih Kalender)"
              value={form.date}
              onChange={(formattedDate) => update({ date: formattedDate })}
            />
            <TimePickerField
              label="Waktu Konser (Jam:Menit)"
              required
              value={form.time}
              onChange={handleConcertTimeChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-category-select" className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">
                Kategori Genre Konser
              </label>
              <select
                id="event-category-select"
                value={form.category}
                onChange={(e) => {
                  const val = e.target.value;
                  const badge = 'bg-white/10 text-white border-white/20';
                  update({ category: val, categoryBadgeColor: badge });
                }}
                className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white outline-none focus:border-white cursor-pointer"
              >
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre} className="bg-[#14161F]">
                    {genre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="event-cover-image-url" className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">
                Gambar Cover Konser
              </label>
              <div className="flex flex-col gap-2">
                <input
                  id="event-cover-image-url"
                  type="text"
                  placeholder="Masukkan URL gambar atau gunakan tombol upload..."
                  value={form.image}
                  onChange={(e) => update({ image: e.target.value })}
                  className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white placeholder-[#71717A] outline-none focus:border-white"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                        const { uploadAdminImageAPI } = await import('../landing/data');
                        const data = await uploadAdminImageAPI(formData);
                        if (data.success && data.data?.url) {
                          setUploadError('');
                          update({ image: data.data.url });
                        } else {
                          setUploadError(data.message || 'Gagal mengunggah gambar');
                        }
                      } catch (err) {
                        console.error('Error uploading image:', err);
                        setUploadError('Terjadi kesalahan koneksi saat mengunggah gambar');
                      }
                    }}
                    className="hidden"
                    id="event-image-upload-input"
                  />
                  <label
                    htmlFor="event-image-upload-input"
                    className="px-3 py-1.5 border border-[#272A38] bg-[#0C0D12] rounded-lg text-[11px] font-medium text-[#A1A1AA] hover:text-white hover:border-white/40 cursor-pointer select-none transition-colors"
                  >
                    Upload Gambar Lokal
                  </label>
                  {uploadError && (
                    <span className="text-xs text-rose-400 block">{uploadError}</span>
                  )}
                  {form.image && (
                    <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px]" title={form.image}>
                      File siap
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-[#272A38] bg-[#0C0D12] rounded-xl p-4 flex flex-col gap-4">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Spesifikasi Acara</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Konduktor" value={form.conductor} onChange={(v) => update({ conductor: v })} placeholder="Maestro Alexander Vance" />
              <InputField label="Subtitle / Tagline" value={form.subtitle} onChange={(v) => update({ subtitle: v })} placeholder="Pertunjukan Mahakarya Simfoni" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <TimePickerField
                label="Waktu Open Gate"
                required
                value={form.openGate}
                onChange={handleOpenGateChange}
              />
              <div className="sm:col-span-2">
                <InputField
                  label="Alamat Lengkap Venue / Link Share Google Maps"
                  value={form.address}
                  onChange={(v) => update({ address: v })}
                  placeholder="Jl. Industri Blok B14 No.1, Kemayoran atau https://maps.google.com/..."
                />
                <span className="text-[10px] text-[#71717A] block mt-1 leading-normal">
                  Info: Kolom ini digunakan untuk rute peta pada e-ticket. Anda bisa memasukkan alamat tekstual biasa atau Link Share Google Maps.
                </span>
              </div>
            </div>

            {hasGateOrderError && (
              <div
                role="alert"
                className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs flex items-center gap-2"
              >
                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                <span>Waktu Open Gate harus lebih awal dari Waktu Konser.</span>
              </div>
            )}

            <InputField
              label="URL Audio Cuplikan (Opsional)"
              value={form.audioUrl || ''}
              onChange={(v) => update({ audioUrl: v })}
              placeholder="/audio/sample-symphony.mp3"
            />
          </div>

          <div className="border border-[#272A38] bg-[#0C0D12] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">Rangkaian Acara (Rundown)</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={!canSyncRundown}
                  onClick={handleSyncRundown}
                  className={`text-xs font-medium bg-[#14161F] border border-[#272A38] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 transition-colors ${
                    canSyncRundown
                      ? 'text-[#A1A1AA] hover:text-white hover:border-white/40 cursor-pointer'
                      : 'text-[#71717A] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={12} strokeWidth={1.5} />
                  <span>Sinkronkan Otomatis dari Waktu Konser</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddRundownItem}
                  className="text-xs font-medium text-white bg-[#14161F] border border-[#272A38] hover:border-white/40 rounded-lg px-2.5 py-1.5 cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} strokeWidth={1.5} />
                  <span>Item Rundown</span>
                </button>
              </div>
            </div>

            {(!form.rundown || form.rundown.length === 0) ? (
              <p className="text-xs font-normal text-[#71717A] m-0 italic">
                Belum ada item rundown disetel. Pilih waktu konser untuk menyusun otomatis atau tambahkan item manual.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {form.rundown.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      aria-label={`Waktu item rundown ${idx + 1}`}
                      placeholder="Waktu (mis. 18:00 WIB)"
                      value={item.time}
                      onChange={(e) => {
                        setRundownCustomized(true);
                        const updated = form.rundown.map((it, i) =>
                          i === idx ? { ...it, time: e.target.value } : it
                        );
                        update({ rundown: updated });
                      }}
                      className="w-1/3 bg-[#14161F] border border-[#272A38] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-white"
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
                      className="flex-1 bg-[#14161F] border border-[#272A38] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      aria-label={`Hapus item rundown ${idx + 1}`}
                      onClick={() => {
                        setRundownCustomized(true);
                        const updated = form.rundown.filter((_, i) => i !== idx);
                        update({ rundown: updated });
                      }}
                      className="p-1.5 text-rose-400 bg-[#14161F] border border-rose-500/30 rounded-lg cursor-pointer hover:bg-rose-500/20"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="event-description-textarea" className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">
              Deskripsi Konser
            </label>
            <textarea
              id="event-description-textarea"
              rows={3}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs text-white placeholder-[#71717A] outline-none resize-y focus:border-white"
            />
          </div>

          {!isEdit && (
            <div className="border border-[#272A38] bg-[#0C0D12] rounded-xl p-4 flex flex-col gap-3">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">Kategori Tiket Awal</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputField label="Nama Kategori" required value={form.initialCatName} onChange={(v) => update({ initialCatName: v })} />
                <InputField label="Harga (IDR)" required type="number" value={form.initialCatPrice} onChange={(v) => update({ initialCatPrice: Number(v) })} />
                <InputField label="Kuota Kursi" required type="number" value={form.initialCatQuota} onChange={(v) => update({ initialCatQuota: Number(v) })} />
              </div>
            </div>
          )}

          <div className="border-t border-[#272A38] pt-4 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2 text-xs font-semibold text-[#0C0D12] bg-white hover:bg-neutral-200 rounded-lg cursor-pointer transition-all shadow-md ${
                isLoading ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Menyimpan...' : isEdit ? 'Perbarui Event' : 'Simpan & Terbitkan Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder, required, type = 'text' }) => {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">
        {label}
      </label>
      <input
        id={inputId}
        type={type} required={required} placeholder={placeholder}
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white placeholder-[#71717A] outline-none focus:border-white transition-colors"
      />
    </div>
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
    <div>
      <label htmlFor={inputId} className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="date"
          required
          value={isoValue}
          onChange={handleDateSelect}
          className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white outline-none [color-scheme:dark] cursor-pointer focus:border-white"
        />
        {value && (
          <span className="text-[10px] font-mono text-[#A1A1AA] block mt-1">
            Terformat DB: {value}
          </span>
        )}
      </div>
    </div>
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
    <div>
      <label htmlFor={inputId} className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <input
            id={inputId}
            type="time"
            required={required}
            value={timeValue}
            onChange={handleTimeSelect}
            className="flex-1 min-w-0 bg-[#0C0D12] border border-[#272A38] rounded-lg px-2.5 py-2 text-xs font-normal text-white outline-none [color-scheme:dark] cursor-pointer focus:border-white"
          />
          <select
            aria-label={`${label} zona waktu`}
            value={activeTz}
            onChange={handleTzChange}
            className="w-[70px] shrink-0 bg-[#0C0D12] border border-[#272A38] rounded-lg px-2 py-2 text-xs font-normal text-white outline-none cursor-pointer focus:border-white"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz} className="bg-[#14161F]">
                {tz}
              </option>
            ))}
          </select>
        </div>
        {value && (
          <span className="text-[10px] font-mono text-[#A1A1AA] block mt-1">
            Terformat DB: {value}
          </span>
        )}
      </div>
    </div>
  );
};
