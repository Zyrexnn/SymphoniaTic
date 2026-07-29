import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { EventItem, TicketCategory } from '../landing/data';

interface CategoryFormData {
  name: string;
  price: number;
  quota: number;
}

interface CategoryFormModalProps {
  showAddCategoryModal: EventItem | null;
  editingCategory: { eventId: string; cat: TicketCategory } | null;
  catForm: CategoryFormData;
  isLoading: boolean;
  onCatFormChange: (form: CategoryFormData) => void;
  onCloseAdd: () => void;
  onCloseEdit: () => void;
  onAddSubmit: (e: React.FormEvent) => void;
  onEditSubmit: (e: React.FormEvent) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  showAddCategoryModal, editingCategory, catForm, isLoading,
  onCatFormChange, onCloseAdd, onCloseEdit, onAddSubmit, onEditSubmit,
}) => {
  const isAdd = !!showAddCategoryModal;
  const isEdit = !!editingCategory;
  if (!isAdd && !isEdit) return null;

  const title = isAdd
    ? `Tambah Kategori Tiket (${showAddCategoryModal!.title})`
    : 'Edit Kategori Tiket & Kuota';
  const onClose = isAdd ? onCloseAdd : onCloseEdit;
  const onSubmit = isAdd ? onAddSubmit : onEditSubmit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full max-w-md"
        style={{ background: '#171717', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 300, color: '#ffffff', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ padding: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex' }}>
            <X size={14} strokeWidth={1} style={{ color: '#9a9a9a' }} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Nama Kategori Tiket</label>
            <input type="text" required placeholder="CAT 1 Balkon Utama"
              value={catForm.name}
              onChange={(e) => onCatFormChange({ ...catForm, name: e.target.value })}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Harga Tiket (IDR)</label>
            <input type="number" required placeholder="500000"
              value={catForm.price}
              onChange={(e) => onCatFormChange({ ...catForm, price: Number(e.target.value) })}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Kuota Tempat Duduk</label>
            <input type="number" required placeholder="50"
              value={catForm.quota}
              onChange={(e) => onCatFormChange({ ...catForm, quota: Number(e.target.value) })}
              style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none' }} />
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '8px 16px', fontSize: 13, fontWeight: 300, color: '#9a9a9a', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              Batal
            </button>
            <button type="submit" disabled={isLoading}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 300, color: '#ffffff',
                border: '1px solid #ffffff', background: 'transparent', cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.4 : 1,
              }}>
              {isLoading ? 'Menyimpan...' : isEdit ? 'Perbarui Kategori' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
