import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import type { EventItem, RundownItem } from '../landing/data';

export interface EventFormData {
  title: string; artist: string; venue: string; date: string; time: string;
  category: string; categoryBadgeColor: string; image: string; description: string;
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

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen, editingEvent, form, isLoading, onFormChange, onClose, onSubmit,
}) => {
  if (!isOpen) return null;

  const update = (partial: Partial<EventFormData>) => onFormChange({ ...form, ...partial });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const isEdit = !!editingEvent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#171717] border border-white/20 my-auto max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 shrink-0 bg-[#1a1a1a]">
          <h3 className="text-base font-light text-white tracking-tight m-0">
            {isEdit ? 'Edit Detail Event Konser' : 'Tambah Event Konser Baru'}
          </h3>
          <button onClick={onClose} className="p-1.5 bg-transparent border border-white/10 text-[#9a9a9a] hover:text-white cursor-pointer transition-colors">
            <X size={16} strokeWidth={1} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
          {/* Main Info */}
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
              value={form.time}
              onChange={(formattedTime) => update({ time: formattedTime })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">Kategori Genre Konser</label>
              <select
                value={form.category}
                onChange={(e) => {
                  const val = e.target.value;
                  let badge = 'bg-blue-900/80 text-blue-200 border-blue-500/40';
                  if (val === 'SIMFONI UTAMA' || val === 'SIMFONI') badge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  else if (val === 'KAMAR MUSIK') badge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                  else if (val === 'PADUAN SUARA') badge = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
                  else if (val === 'SOLO RESITAL') badge = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                  update({ category: val, categoryBadgeColor: badge });
                }}
                className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none"
              >
                <option value="SIMFONI UTAMA">SIMFONI UTAMA</option>
                <option value="SIMFONI">SIMFONI</option>
                <option value="KAMAR MUSIK">KAMAR MUSIK</option>
                <option value="PADUAN SUARA">PADUAN SUARA</option>
                <option value="SOLO RESITAL">SOLO RESITAL</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">Gambar Cover Konser</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Masukkan URL gambar atau gunakan tombol upload..."
                  value={form.image}
                  onChange={(e) => update({ image: e.target.value })}
                  className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none"
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
                        const { getApiBaseUrl } = await import('../landing/data');
                        const res = await fetch(`${getApiBaseUrl()}/admin/upload`, {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success && data.data?.url) {
                          update({ image: data.data.url });
                        } else {
                          alert(data.message || 'Gagal mengunggah gambar');
                        }
                      } catch (err) {
                        console.error('Error uploading image:', err);
                        alert('Terjadi kesalahan koneksi saat mengunggah gambar');
                      }
                    }}
                    className="hidden"
                    id="event-image-upload-input"
                  />
                  <label
                    htmlFor="event-image-upload-input"
                    className="px-3 py-1.5 border border-white/20 bg-white/5 text-[11px] font-light text-white hover:bg-white/10 cursor-pointer select-none transition-colors"
                  >
                    Upload Gambar Lokal
                  </label>
                  {form.image && (
                    <span className="text-[10px] text-emerald-400 font-mono truncate max-w-[200px]" title={form.image}>
                      ✓ File siap
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="border border-white/10 bg-[#141414] p-4 flex flex-col gap-4">
            <span className="text-xs font-light text-white uppercase tracking-wider">Spesifikasi Acara</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Konduktor" value={form.conductor} onChange={(v) => update({ conductor: v })} placeholder="Maestro Alexander Vance" />
              <InputField label="Subtitle / Tagline" value={form.subtitle} onChange={(v) => update({ subtitle: v })} placeholder="Pertunjukan Mahakarya Simfoni" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Open Gate" value={form.openGate} onChange={(v) => update({ openGate: v })} placeholder="18:00 WIB" />
              <div className="sm:col-span-2">
                <InputField 
                  label="Alamat Lengkap Venue / Link Share Google Maps" 
                  value={form.address} 
                  onChange={(v) => update({ address: v })} 
                  placeholder="Jl. Industri Blok B14 No.1, Kemayoran atau https://maps.google.com/..." 
                />
                <span className="text-[10px] text-[#9a9a9a] block mt-1 leading-normal">
                  Info: Kolom ini digunakan untuk rute peta pada e-ticket. Anda bisa memasukkan alamat tekstual biasa atau Link Share Google Maps.
                </span>
              </div>
            </div>
          </div>

          {/* Rundown Builder */}
          <div className="border border-white/10 bg-[#141414] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-light text-white uppercase tracking-wider">Rangkaian Acara (Rundown)</span>
              <button
                type="button"
                onClick={() => {
                  const current = form.rundown || [];
                  update({ rundown: [...current, { time: '18:00 WIB', activity: 'Aktivitas Baru' }] });
                }}
                className="text-xs font-light text-white bg-white/10 border border-white/20 px-2.5 py-1 cursor-pointer hover:bg-white/20 flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Item Rundown</span>
              </button>
            </div>

            {(!form.rundown || form.rundown.length === 0) ? (
              <p className="text-xs font-light text-[#9a9a9a] m-0 italic">Belum ada item rundown disetel.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {form.rundown.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Waktu (19:30 WIB)"
                      value={item.time}
                      onChange={(e) => {
                        const updated = [...form.rundown];
                        updated[idx].time = e.target.value;
                        update({ rundown: updated });
                      }}
                      className="w-1/3 bg-[#171717] border border-white/10 px-2.5 py-1.5 text-xs font-light text-white outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Kegiatan / Movement"
                      value={item.activity}
                      onChange={(e) => {
                        const updated = [...form.rundown];
                        updated[idx].activity = e.target.value;
                        update({ rundown: updated });
                      }}
                      className="flex-1 bg-[#171717] border border-white/10 px-2.5 py-1.5 text-xs font-light text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.rundown.filter((_, i) => i !== idx);
                        update({ rundown: updated });
                      }}
                      className="p-1.5 text-rose-400 bg-transparent border border-rose-500/20 cursor-pointer hover:bg-rose-500/10"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">Deskripsi Konser</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none resize-y"
            />
          </div>

          {!isEdit && (
            <div className="border border-white/10 bg-[#141414] p-4 flex flex-col gap-3">
              <span className="text-xs font-light text-white uppercase tracking-wider">Kategori Tiket Awal</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputField label="Nama Kategori" required value={form.initialCatName} onChange={(v) => update({ initialCatName: v })} />
                <InputField label="Harga (IDR)" required type="number" value={form.initialCatPrice} onChange={(v) => update({ initialCatPrice: Number(v) })} />
                <InputField label="Kuota Kursi" required type="number" value={form.initialCatQuota} onChange={(v) => update({ initialCatQuota: Number(v) })} />
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-4 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-light text-[#9a9a9a] hover:text-white bg-transparent border-none cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2 text-xs font-normal text-[#171717] bg-white hover:bg-white/90 cursor-pointer transition-all ${
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

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder, required, type = 'text' }) => (
  <div>
    <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">{label}</label>
    <input
      type={type} required={required} placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none"
    />
  </div>
);

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (formattedDate: string) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, value, onChange }) => {
  // Convert standard date string or YYYY-MM-DD to date input format
  const getIsoDate = (strVal: string): string => {
    if (!strVal) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) return strVal;
    try {
      // Try parsing custom strings like "Sabtu, 18 April 2026"
      const parts = strVal.replace(/^[A-Za-z]+,\s*/, '').split(' ');
      if (parts.length >= 3) {
        const day = parts[0].padStart(2, '0');
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const monthIdx = monthNames.findIndex((m) => m.toLowerCase() === parts[1].toLowerCase());
        const year = parts[2];
        if (monthIdx !== -1 && year) {
          return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${day}`;
        }
      }
    } catch {}
    return '';
  };

  const isoValue = getIsoDate(value);

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value; // YYYY-MM-DD
    if (!rawVal) {
      onChange('');
      return;
    }
    const [yearStr, monthStr, dayStr] = rawVal.split('-');
    const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
    const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long' });
    // Format: "Sabtu, 18 April 2026"
    const formatted = `${dayName}, ${dateObj.getDate()} ${monthName} ${dateObj.getFullYear()}`;
    onChange(formatted);
  };

  return (
    <div>
      <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="date"
          required
          value={isoValue}
          onChange={handleDateSelect}
          className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none [color-scheme:dark] cursor-pointer"
        />
        {value && (
          <span className="text-[10px] font-mono text-emerald-400 block mt-1">
            ✓ Terformat DB: {value}
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
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({ label, value, onChange }) => {
  const getRawTime = (strVal: string): string => {
    if (!strVal) return '';
    const match = strVal.match(/(\d{2}:\d{2})/);
    return match ? match[1] : '';
  };

  const timeValue = getRawTime(value);

  const handleTimeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value; // HH:mm
    if (!rawVal) {
      onChange('');
      return;
    }
    onChange(`${rawVal} WIB`);
  };

  return (
    <div>
      <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="time"
          required
          value={timeValue}
          onChange={handleTimeSelect}
          className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none [color-scheme:dark] cursor-pointer"
        />
        {value && (
          <span className="text-[10px] font-mono text-emerald-400 block mt-1">
            ✓ Terformat DB: {value}
          </span>
        )}
      </div>
    </div>
  );
};
