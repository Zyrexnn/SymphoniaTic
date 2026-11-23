import React, { useState, useId } from 'react';
import type { AdminRole, StaffMember } from '../landing/data';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextInputField, FormField } from '@/components/ui/form-controls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface StaffFormData {
  username: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

interface StaffFormModalProps {
  isOpen: boolean;
  editingStaff: StaffMember | null;
  currentStaffId: string;
  form: StaffFormData;
  isLoading: boolean;
  onFormChange: (form: StaffFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  PETUGAS:
    'Hanya dapat mengakses pemindai QR pintu masuk (gate scanner) dan melihat status pesanan untuk verifikasi penonton.',
  ADMIN:
    'Mengelola konser, kategori kursi, kode promo, status pesanan, dan tinjauan permohonan refund tanpa akses manajemen staf.',
  SUPER_ADMIN:
    'Kendali penuh sistem: mengelola akun staf operasional, memantau log audit, serta seluruh fungsi administrasi dan keuangan.',
};

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  editingStaff,
  currentStaffId,
  form,
  isLoading,
  onFormChange,
  onClose,
  onSubmit,
}) => {
  const formId = useId();
  const roleSelectId = useId();
  const [errors, setErrors] = useState<Partial<Record<keyof StaffFormData, string>>>({});

  const isEdit = Boolean(editingStaff);
  const isEditingSelf = Boolean(editingStaff && editingStaff.id === currentStaffId);

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof StaffFormData, string>> = {};

    if (!isEdit) {
      const cleanUser = form.username.trim();
      if (!/^[a-zA-Z0-9._-]{3,50}$/.test(cleanUser)) {
        nextErrors.username =
          'Username harus 3-50 karakter (huruf, angka, titik, garis bawah, atau tanda hubung).';
      }
      if (form.password.length < 6) {
        nextErrors.password = 'Kata sandi awal minimal harus 6 karakter.';
      }
    }

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Nama lengkap minimal harus 2 karakter.';
    }

    if (!form.email.trim() || !form.email.includes('@')) {
      nextErrors.email = 'Masukkan alamat email resmi yang valid.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit(e);
  };

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <Button type="button" variant="outline" onClick={onClose}>
        Batal
      </Button>
      <Button type="submit" form={formId} disabled={isLoading}>
        {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Daftarkan Akun Staf'}
      </Button>
    </div>
  );

  return (
    <FullscreenWorkspace
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={isEdit ? 'Sunting Akses Staf' : 'Registrasi Staf Baru'}
      title={isEdit ? `Edit Akun: ${editingStaff?.username}` : 'Tambah Akun Staf Operasional'}
      subtitle={
        isEdit
          ? 'Perbarui identitas tampilan, alamat email, atau tingkat wewenang peran staf.'
          : 'Buat kredensial baru untuk Petugas Gate, Administrator Konser, atau Super Admin.'
      }
      maxWidthClass="max-w-2xl"
      backLabel="Kembali"
      theme="auto"
      footer={footer}
    >
      <form id={formId} onSubmit={validateAndSubmit} className="space-y-6">
        <Card className="p-5 sm:p-8 space-y-5">
          {!isEdit && (
            <TextInputField
              theme="auto"
              label="Username Login"
              required
              placeholder="cth: petugas_gate_timur"
              value={form.username}
              error={errors.username}
              hint="Digunakan staf saat masuk melalui portal operasional (huruf kecil, tanpa spasi)."
              onValueChange={(v) => onFormChange({ ...form, username: v.toLowerCase() })}
              className="font-mono"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInputField
              theme="auto"
              label="Nama Lengkap Staf"
              required
              placeholder="cth: Nadia Kusuma"
              value={form.name}
              error={errors.name}
              onValueChange={(v) => onFormChange({ ...form, name: v })}
            />

            <TextInputField
              theme="auto"
              label="Email Resmi"
              required
              type="email"
              placeholder="nadia@symphoniatic.id"
              value={form.email}
              error={errors.email}
              onValueChange={(v) => onFormChange({ ...form, email: v })}
            />
          </div>

          {!isEdit && (
            <TextInputField
              theme="auto"
              label="Kata Sandi Awal"
              required
              type="password"
              placeholder="Minimal 6 karakter"
              value={form.password}
              error={errors.password}
              hint="Disarankan menggabungkan huruf dan angka; kata sandi disimpan dalam bentuk hash bcrypt."
              onValueChange={(v) => onFormChange({ ...form, password: v })}
            />
          )}

          <FormField
            theme="auto"
            label="Tingkat Peran & Wewenang (RBAC)"
            htmlFor={roleSelectId}
            required
            hint={
              isEditingSelf
                ? 'Anda tidak dapat menurunkan peran akun Anda sendiri yang sedang aktif.'
                : ROLE_DESCRIPTIONS[form.role]
            }
          >
            <Select
              value={form.role}
              disabled={isEditingSelf}
              onValueChange={(val) => onFormChange({ ...form, role: val as AdminRole })}
            >
              <SelectTrigger id={roleSelectId} aria-label="Pilih peran staf" className="min-h-[44px]">
                <SelectValue placeholder="Pilih Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PETUGAS">PETUGAS (Scanner Gate &amp; Cek Order)</SelectItem>
                <SelectItem value="ADMIN">ADMIN (Operasional Konser, Promo &amp; Refund)</SelectItem>
                <SelectItem value="SUPER_ADMIN">SUPER_ADMIN (Kontrol Penuh &amp; Supervisi)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </Card>
      </form>
    </FullscreenWorkspace>
  );
};
