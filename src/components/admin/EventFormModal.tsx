import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { EventItem } from '../landing/data';

interface EventFormData {
  title: string; artist: string; venue: string; date: string; time: string;
  category: string; categoryBadgeColor: string; image: string; description: string;
  conductor: string; subtitle: string; openGate: string; address: string;
  organizer: string; initialCatName: string; initialCatPrice: number; initialCatQuota: number;
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full max-w-2xl"
        style={{ background: '#171717', border: '1px solid rgba(255,255,255,0.06)', margin: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            {isEdit ? 'Edit Detail Event Konser' : 'Tambah Event Konser Baru'}
          </h3>
          <button onClick={onClose} style={{ padding: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex' }}>
            <X size={14} strokeWidth={1} style={{ color: '#9a9a9a' }} />
          </button>
        </div>

        <form onSubmit={handleEditSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <InputField label="Judul Konser" required value={form.title} onChange={(v) => update({ title: v })} placeholder="Simfoni Beethoven No. 9" />
            <InputField label="Musisi / Orkestra" required value={form.artist} onChange={(v) => update({ artist: v })} placeholder="Royal Philharmonic Orchestra" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <InputField label="Venue / Gedung" required value={form.venue} onChange={(v) => update({ venue: v })} placeholder="Aula Simfonia Jakarta" />
            <InputField label="Tanggal Konser" required value={form.date} onChange={(v) => update({ date: v })} placeholder="15 Agustus 2026" />
            <InputField label="Waktu Konser" required value={form.time} onChange={(v) => update({ time: v })} placeholder="19:30 WIB" />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>URL Gambar Cover Konser</label>
            <input type="url" value={form.image} onChange={(e) => update({ image: e.target.value })}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none' }} />
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Detail Tambahan Konser</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <InputField label="Konduktor / Pemimpin" value={form.conductor} onChange={(v) => update({ conductor: v })} placeholder="Maestro Addie MS" />
              <InputField label="Subtitle / Tagline" value={form.subtitle} onChange={(v) => update({ subtitle: v })} placeholder="Pertunjukan Mahakarya Simfoni" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
              <InputField label="Open Gate" value={form.openGate} onChange={(v) => update({ openGate: v })} placeholder="18:00 WIB" />
              <InputField label="Alamat Lengkap Venue" value={form.address} onChange={(v) => update({ address: v })} placeholder="Jl. Industri Blok B14 No.1, Kemayoran" />
            </div>
            <InputField label="Penyelenggara / Organizer" value={form.organizer} onChange={(v) => update({ organizer: v })} placeholder="SymphoniaTic Production" />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Deskripsi Konser</label>
            <textarea rows={3} value={form.description} onChange={(e) => update({ description: e.target.value })}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none', resize: 'vertical' }} />
          </div>

          {!isEdit && (
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Kategori Tiket Awal (Minimal 1 Kategori)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <InputField label="Nama Kategori" required value={form.initialCatName} onChange={(v) => update({ initialCatName: v })} />
                <InputField label="Harga (IDR)" required type="number" value={form.initialCatPrice} onChange={(v) => update({ initialCatPrice: Number(v) })} />
                <InputField label="Kuota Kursi" required type="number" value={form.initialCatQuota} onChange={(v) => update({ initialCatQuota: Number(v) })} />
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '8px 16px', fontSize: 13, fontWeight: 300, color: '#9a9a9a', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Batal
            </button>
            <button type="submit" disabled={isLoading}
              style={{
                padding: '8px 20px', fontSize: 13, fontWeight: 300, color: '#ffffff',
                border: '1px solid #ffffff', background: 'transparent', cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.4 : 1,
              }}>
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
    <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
    <input
      type={type} required={required} placeholder={placeholder}
      value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
        padding: '8px 12px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none',
      }} />
  </div>
);
