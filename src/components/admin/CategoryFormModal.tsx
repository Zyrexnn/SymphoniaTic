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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md bg-[#171717] border border-white/10"
      >
        <div className="flex justify-between items-center border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-light text-white m-0">{title}</h3>
          <button onClick={onClose} className="p-1.5 bg-transparent border border-white/[0.1] cursor-pointer flex hover:opacity-60">
            <X size={14} strokeWidth={1} className="text-[#9a9a9a]" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 flex flex-col gap-3">
          <div>
            <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">Nama Kategori Tiket</label>
            <input type="text" required placeholder="CAT 1 Balkon Utama"
              value={catForm.name}
              onChange={(e) => onCatFormChange({ ...catForm, name: e.target.value })}
              className="w-full bg-transparent border border-white/[0.1] px-3 py-2 text-[13px] font-light text-white outline-none" />
          </div>
          <div>
            <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">Harga Tiket (IDR)</label>
            <input type="number" required placeholder="500000"
              value={catForm.price}
              onChange={(e) => onCatFormChange({ ...catForm, price: Number(e.target.value) })}
              className="w-full bg-transparent border border-white/[0.1] px-3 py-2 text-[13px] font-light text-white outline-none" />
          </div>
          <div>
            <label className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1.5">Kuota Tempat Duduk</label>
            <input type="number" required placeholder="50"
              value={catForm.quota}
              onChange={(e) => onCatFormChange({ ...catForm, quota: Number(e.target.value) })}
              className="w-full bg-transparent border border-white/[0.1] px-3 py-2 text-[13px] font-light text-white outline-none" />
          </div>

          <div className="border-t border-white/10 pt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-[13px] font-light text-[#9a9a9a] bg-transparent border-none cursor-pointer hover:text-white">
              Batal
            </button>
            <button type="submit" disabled={isLoading}
              className={`px-4 py-2 text-[13px] font-light text-white border border-white bg-transparent ${isLoading ? 'opacity-40 cursor-default' : 'cursor-pointer hover:opacity-60'}`}>
              {isLoading ? 'Menyimpan...' : isEdit ? 'Perbarui Kategori' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
