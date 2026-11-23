import React, { useId } from 'react';
import { Shuffle } from 'lucide-react';
import { formatIDR, type PromotionItem } from '../landing/data';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField, FormField } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface PromoFormData {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  isMemberOnly: boolean;
  isActive: boolean;
  quota: number;
  validFrom: string;
  validUntil: string;
}

interface PromoFormModalProps {
  isOpen: boolean;
  editingPromo: PromotionItem | null;
  form: PromoFormData;
  isLoading: boolean;
  onFormChange: (form: PromoFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CODE_PREFIXES = ['SIMFONI', 'OVERTURE', 'CONCERTO', 'SONATA', 'MAESTRO', 'HARMONI'];

function generateCustomPromoCode(): string {
  const prefix = CODE_PREFIXES[Math.floor(Math.random() * CODE_PREFIXES.length)];
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export const PromoFormModal: React.FC<PromoFormModalProps> = ({
  isOpen,
  editingPromo,
  form,
  isLoading,
  onFormChange,
  onClose,
  onSubmit,
}) => {
  const formId = useId();
  const validFromId = useId();
  const validUntilId = useId();
  const isEdit = !!editingPromo;

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <Button type="button" variant="outline" onClick={onClose}>
        Batal
      </Button>
      <Button type="submit" form={formId} disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Kode Promo'}
      </Button>
    </div>
  );

  return (
    <FullscreenWorkspace
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={isEdit ? 'Sunting Promo' : 'Promo Kustom Baru'}
      title={isEdit ? `Edit Promo ${editingPromo?.code}` : 'Buat Kode Promo Kustom'}
      subtitle="Atur nominal potongan, batas kuota, target anggota, dan masa berlaku promo secara dinamis."
      maxWidthClass="max-w-3xl"
      backLabel="Kembali"
      theme="auto"
      footer={footer}
    >
      <form id={formId} onSubmit={onSubmit}>
        <Card className="p-5 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-9">
              <TextInputField
                theme="auto"
                label="Kode Promo (3-32 karakter)"
                required
                placeholder="BEETHOVEN25"
                value={form.code}
                onValueChange={(v) =>
                  onFormChange({
                    ...form,
                    code: v.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32),
                  })
                }
                hint="Hanya huruf kapital, angka, '-' atau '_'."
                className="font-mono uppercase tracking-wider font-bold"
              />
            </div>
            <div className="sm:col-span-3 sm:pb-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onFormChange({ ...form, code: generateCustomPromoCode() })}
                className="w-full min-h-[44px] gap-2"
              >
                <Shuffle className="w-4 h-4" aria-hidden="true" />
                <span>Acak Kode</span>
              </Button>
            </div>
          </div>

          <TextInputField
            theme="auto"
            label="Deskripsi Promo"
            placeholder="Potongan khusus pembukaan musim konser simfoni"
            value={form.description}
            onValueChange={(v) => onFormChange({ ...form, description: v })}
            hint="Ditampilkan kepada calon penonton saat kode promo diterapkan."
          />

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
              Tipe Potongan Harga
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                aria-pressed={form.discountType === 'PERCENTAGE'}
                onClick={() =>
                  onFormChange({
                    ...form,
                    discountType: 'PERCENTAGE',
                    discountValue: form.discountValue > 100 ? 10 : form.discountValue,
                  })
                }
                className={`min-h-[48px] px-4 py-2.5 border rounded-none text-xs font-bold uppercase tracking-wider transition-colors ${
                  form.discountType === 'PERCENTAGE'
                    ? 'bg-[#141413] text-[#D4FF2A] border-[#141413] dark:bg-[#D4FF2A] dark:text-[#141413] dark:border-[#D4FF2A]'
                    : 'bg-background text-foreground border-border hover:border-border-strong'
                }`}
              >
                Persentase (%)
              </button>
              <button
                type="button"
                aria-pressed={form.discountType === 'FIXED'}
                onClick={() =>
                  onFormChange({
                    ...form,
                    discountType: 'FIXED',
                    discountValue: form.discountValue <= 100 ? 50000 : form.discountValue,
                    maxDiscount: 0,
                  })
                }
                className={`min-h-[48px] px-4 py-2.5 border rounded-none text-xs font-bold uppercase tracking-wider transition-colors ${
                  form.discountType === 'FIXED'
                    ? 'bg-[#141413] text-[#D4FF2A] border-[#141413] dark:bg-[#D4FF2A] dark:text-[#141413] dark:border-[#D4FF2A]'
                    : 'bg-background text-foreground border-border hover:border-border-strong'
                }`}
              >
                Nominal Tetap (Rp)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInputField
              theme="auto"
              label={form.discountType === 'PERCENTAGE' ? 'Persentase Diskon (%)' : 'Nominal Potongan (IDR)'}
              required
              type="number"
              min={1}
              max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
              value={form.discountValue}
              onValueChange={(v) => onFormChange({ ...form, discountValue: Number(v) })}
              hint={
                form.discountType === 'FIXED' && form.discountValue > 0
                  ? `Potongan langsung ${formatIDR(form.discountValue)}`
                  : 'Rentang 1 hingga 100 persen'
              }
              className="font-mono"
            />

            {form.discountType === 'PERCENTAGE' ? (
              <TextInputField
                theme="auto"
                label="Maksimal Potongan (IDR)"
                type="number"
                min={0}
                value={form.maxDiscount}
                onValueChange={(v) => onFormChange({ ...form, maxDiscount: Number(v) })}
                hint={
                  form.maxDiscount > 0
                    ? `Batas maksimum ${formatIDR(form.maxDiscount)}`
                    : 'Isi 0 jika tanpa batas potongan maksimal'
                }
                className="font-mono"
              />
            ) : (
              <TextInputField
                theme="auto"
                label="Minimal Transaksi (IDR)"
                type="number"
                min={0}
                value={form.minOrderAmount}
                onValueChange={(v) => onFormChange({ ...form, minOrderAmount: Number(v) })}
                hint={
                  form.minOrderAmount > 0
                    ? `Berlaku untuk pesanan minimal ${formatIDR(form.minOrderAmount)}`
                    : 'Isi 0 jika berlaku untuk semua nominal transaksi'
                }
                className="font-mono"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {form.discountType === 'PERCENTAGE' && (
              <TextInputField
                theme="auto"
                label="Minimal Transaksi (IDR)"
                type="number"
                min={0}
                value={form.minOrderAmount}
                onValueChange={(v) => onFormChange({ ...form, minOrderAmount: Number(v) })}
                hint={
                  form.minOrderAmount > 0
                    ? `Berlaku untuk pesanan minimal ${formatIDR(form.minOrderAmount)}`
                    : 'Isi 0 jika berlaku untuk semua nominal transaksi'
                }
                className="font-mono"
              />
            )}

            <TextInputField
              theme="auto"
              label="Total Kuota Penggunaan"
              required
              type="number"
              min={1}
              value={form.quota}
              onValueChange={(v) => onFormChange({ ...form, quota: Number(v) })}
              hint={
                isEdit && editingPromo
                  ? `Sudah terpakai ${editingPromo.usedCount} kali. Sisa kuota menyesuaikan otomatis.`
                  : 'Batas total penukaran kode promo oleh seluruh pembeli.'
              }
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Mulai Berlaku" htmlFor={validFromId} required theme="auto">
              <Input
                id={validFromId}
                type="datetime-local"
                required
                value={form.validFrom}
                onChange={(e) => onFormChange({ ...form, validFrom: e.target.value })}
                className="font-mono"
              />
            </FormField>

            <FormField label="Berakhir Pada" htmlFor={validUntilId} required theme="auto">
              <Input
                id={validUntilId}
                type="datetime-local"
                required
                value={form.validUntil}
                onChange={(e) => onFormChange({ ...form, validUntil: e.target.value })}
                className="font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <label className="flex items-start gap-3 p-3.5 border border-border bg-background cursor-pointer hover:border-border-strong transition-colors">
              <input
                type="checkbox"
                checked={form.isMemberOnly}
                onChange={(e) => onFormChange({ ...form, isMemberOnly: e.target.checked })}
                className="mt-1 h-4 w-4 accent-[#141413] dark:accent-[#D4FF2A]"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                  Khusus Anggota Login
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Hanya pembeli terautentikasi yang dapat menukarkan promo ini.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 border border-border bg-background cursor-pointer hover:border-border-strong transition-colors">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => onFormChange({ ...form, isActive: e.target.checked })}
                className="mt-1 h-4 w-4 accent-[#141413] dark:accent-[#D4FF2A]"
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                  Aktifkan Promo Sekarang
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Tampilkan dalam daftar promo aktif dan izinkan penukaran saat checkout.
                </span>
              </div>
            </label>
          </div>
        </Card>
      </form>
    </FullscreenWorkspace>
  );
};
