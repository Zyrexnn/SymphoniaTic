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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#14161F] border border-[#272A38] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center border-b border-[#272A38] px-5 py-4 bg-[#0C0D12]/70">
          <h3 className="text-sm font-semibold text-white truncate pr-2 m-0">{title}</h3>
          <button onClick={onClose} className="p-1.5 bg-[#0C0D12] border border-[#272A38] rounded-lg text-[#A1A1AA] hover:text-white cursor-pointer transition-colors">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">Nama Kategori Tiket</label>
            <input
              type="text" required placeholder="CAT 1 Grand Tier"
              value={catForm.name}
              onChange={(e) => onCatFormChange({ ...catForm, name: e.target.value })}
              className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white placeholder-[#71717A] outline-none focus:border-white transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">Harga Tiket (IDR)</label>
            <input
              type="number" required placeholder="500000"
              value={catForm.price}
              onChange={(e) => onCatFormChange({ ...catForm, price: Number(e.target.value) })}
              className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white placeholder-[#71717A] outline-none focus:border-white transition-colors font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase block mb-1.5">Kuota Tempat Duduk</label>
            <input
              type="number" required placeholder="50"
              value={catForm.quota}
              onChange={(e) => onCatFormChange({ ...catForm, quota: Number(e.target.value) })}
              className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white placeholder-[#71717A] outline-none focus:border-white transition-colors font-mono"
            />
          </div>

          <div className="border-t border-[#272A38] pt-4 flex justify-end gap-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A1A1AA] hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit" disabled={isLoading}
              className={`px-4 py-2 text-xs font-semibold text-[#0C0D12] bg-white hover:bg-neutral-200 rounded-lg cursor-pointer transition-all shadow-md ${
                isLoading ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Menyimpan...' : isEdit ? 'Perbarui Kategori' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
