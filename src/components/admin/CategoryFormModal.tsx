import React, { useId } from 'react';
import { formatIDR, type EventItem, type TicketCategory } from '../landing/data';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  showAddCategoryModal,
  editingCategory,
  catForm,
  isLoading,
  onCatFormChange,
  onCloseAdd,
  onCloseEdit,
  onAddSubmit,
  onEditSubmit,
}) => {
  const formId = useId();
  const isAdd = !!showAddCategoryModal;
  const isEdit = !!editingCategory;
  const isOpen = isAdd || isEdit;

  const title = isAdd ? 'Tambah Kategori Tiket' : 'Edit Kategori Tiket & Kuota';
  const subtitle = isAdd
    ? showAddCategoryModal!.title
    : 'Perbarui nama kelas kursi, harga resmi, atau total kuota tersedia.';
  const onClose = isAdd ? onCloseAdd : onCloseEdit;
  const onSubmit = isAdd ? onAddSubmit : onEditSubmit;

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <Button type="button" variant="outline" onClick={onClose}>
        Batal
      </Button>
      <Button type="submit" form={formId} disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Kategori'}
      </Button>
    </div>
  );

  return (
    <FullscreenWorkspace
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={isAdd ? 'Kategori Kursi Baru' : 'Sunting Kategori'}
      title={title}
      subtitle={subtitle}
      maxWidthClass="max-w-2xl"
      backLabel="Kembali"
      theme="auto"
      footer={footer}
    >
      <form id={formId} onSubmit={onSubmit}>
        <Card className="p-5 sm:p-8 space-y-6">
          <TextInputField
            theme="auto"
            label="Nama Kategori Tiket"
            required
            placeholder="CAT 1 Grand Tier"
            value={catForm.name}
            onValueChange={(v) => onCatFormChange({ ...catForm, name: v })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInputField
              theme="auto"
              label="Harga Tiket (IDR)"
              required
              type="number"
              min={1000}
              placeholder="500000"
              value={catForm.price}
              onValueChange={(v) => onCatFormChange({ ...catForm, price: Number(v) })}
              hint={
                catForm.price > 0
                  ? `Tampil kepada pembeli: ${formatIDR(catForm.price)}`
                  : undefined
              }
              className="font-mono"
            />

            <TextInputField
              theme="auto"
              label="Kuota Tempat Duduk"
              required
              type="number"
              min={1}
              placeholder="50"
              value={catForm.quota}
              onValueChange={(v) => onCatFormChange({ ...catForm, quota: Number(v) })}
              hint="Total kursi yang dialokasikan untuk kategori ini."
              className="font-mono"
            />
          </div>
        </Card>
      </form>
    </FullscreenWorkspace>
  );
};
