import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { EventItem, RundownItem } from '../landing/data';

export interface EventFormData {
  title: string; artist: string; venue: string; date: string; time: string;
  category: string; categoryBadgeColor: string; image: string; description: string;
  conductor: string; subtitle: string; openGate: string; address: string;
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      Object.assign(editingEvent, {
        title: form.title, artist: form.artist, venue: form.venue,
        date: form.date, time: form.time, category: form.category,
        categoryBadgeColor: form.categoryBadgeColor, image: form.image,
        conductor: form.conductor, subtitle: form.subtitle, openGate: form.openGate,
        address: form.address, organizer: form.organizer, description: form.description,
      });
    }
    onSubmit(e);
  };

  const isEdit = !!editingEvent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl bg-[#171717] border border-white/10 my-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-white/10 px-6 py-5">
          <h3 className="text-base font-light text-white tracking-tight m-0">
            {isEdit ? 'Edit Detail Event Konser' : 'Tambah Event Konser Baru'}
          </h3>
          <button onClick={onClose} className="p-1.5 bg-transparent border border-white/[0.1] cursor-pointer flex hover:opacity-60">
            <X size={14} strokeWidth={1} className="text-[#9a9a9a]" />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField label="Judul Konser" required value={form.title} onChange={(v) => update({ title: v })} placeholder="Simfoni Beethoven No. 9" />
            <InputField label="Musisi / Orkestra" required value={form.artist} onChange={(v) => update({ artist: v })} placeholder="Royal Philharmonic Orchestra" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputField label="Venue / Gedung" required value={form.venue} onChange={(v) => update({ venue: v })} placeholder="Aula Simfonia Jakarta" />
            <InputField label="Tanggal Konser" required value={form.date} onChange={(v) => update({ date: v })} placeholder="15 Agustus 2026" />
            <InputField label="Waktu Konser" required value={form.time} onChange={(v) => update({ time: v })} placeholder="19:30 WIB" />
          </div>

          <div>
            <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">URL Gambar Cover Konser</label>
            <input type="url" value={form.image} onChange={(e) => update({ image: e.target.value })}
              className="w-full bg-transparent border border-white/[0.1] px-3 py-2 text-[13px] font-light text-white outline-none" />
          </div>

          <div className="border border-white/10 p-4 flex flex-col gap-3">
            <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase">Detail Tambahan Konser</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label="Konduktor / Pemimpin" value={form.conductor} onChange={(v) => update({ conductor: v })} placeholder="Maestro Addie MS" />
              <InputField label="Subtitle / Tagline" value={form.subtitle} onChange={(v) => update({ subtitle: v })} placeholder="Pertunjukan Mahakarya Simfoni" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputField label="Open Gate" value={form.openGate} onChange={(v) => update({ openGate: v })} placeholder="18:00 WIB" />
              <div className="sm:col-span-2">
                <InputField label="Alamat Lengkap Venue" value={form.address} onChange={(v) => update({ address: v })} placeholder="Jl. Industri Blok B14 No.1, Kemayoran" />
              </div>
            </div>
            <InputField label="Penyelenggara / Organizer" value={form.organizer} onChange={(v) => update({ organizer: v })} placeholder="SymphoniaTic Production" />
          </div>

          {/* Rundown Builder */}
          <div className="border border-white/10 p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase">Rangkaian Acara (Rundown Konser)</span>
              <button
                type="button"
                onClick={() => {
                  const current = form.rundown || [];
                  update({ rundown: [...current, { time: '18:00 WIB', activity: 'Aktivitas Baru' }] });
                }}
                className="text-xs font-light text-white bg-transparent border border-white/20 px-2.5 py-1 cursor-pointer hover:opacity-60 flex items-center gap-1"
              >
                + Tambah Item Rundown
              </button>
            </div>

            {(!form.rundown || form.rundown.length === 0) ? (
              <p className="text-xs font-light text-[#9a9a9a] m-0 italic">Belum ada item rundown disetel. Klik tombol di atas untuk menambah.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {form.rundown.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Waktu (contoh: 19:30 WIB)"
                      value={item.time}
                      onChange={(e) => {
                        const updated = [...form.rundown];
                        updated[idx].time = e.target.value;
                        update({ rundown: updated });
                      }}
                      className="w-1/3 bg-transparent border border-white/[0.1] px-2.5 py-1.5 text-xs font-light text-white outline-none"
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
                      className="flex-1 bg-transparent border border-white/[0.1] px-2.5 py-1.5 text-xs font-light text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.rundown.filter((_, i) => i !== idx);
                        update({ rundown: updated });
                      }}
                      className="text-xs text-red-400 bg-transparent border border-red-500/30 px-2 py-1 cursor-pointer hover:bg-red-500/10"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">Deskripsi Konser</label>
            <textarea rows={3} value={form.description} onChange={(e) => update({ description: e.target.value })}
              className="w-full bg-transparent border border-white/[0.1] px-3 py-2 text-[13px] font-light text-white outline-none resize-y" />
          </div>

          {!isEdit && (
            <div className="border border-white/10 p-4 flex flex-col gap-3">
              <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase">Kategori Tiket Awal (Minimal 1 Kategori)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <InputField label="Nama Kategori" required value={form.initialCatName} onChange={(v) => update({ initialCatName: v })} />
                <InputField label="Harga (IDR)" required type="number" value={form.initialCatPrice} onChange={(v) => update({ initialCatPrice: Number(v) })} />
                <InputField label="Kuota Kursi" required type="number" value={form.initialCatQuota} onChange={(v) => update({ initialCatQuota: Number(v) })} />
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-[13px] font-light text-[#9a9a9a] bg-transparent border-none cursor-pointer hover:text-white">
              Batal
            </button>
            <button type="submit" disabled={isLoading}
              className={`px-5 py-2 text-[13px] font-light text-white border border-white bg-transparent ${isLoading ? 'opacity-40 cursor-default' : 'cursor-pointer hover:opacity-60'}`}>
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
      className="w-full bg-transparent border border-white/[0.1] px-3 py-2 text-[13px] font-light text-white outline-none" />
  </div>
);
