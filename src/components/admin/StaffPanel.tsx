import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Power, KeyRound, Users, ShieldCheck } from 'lucide-react';
import type { AdminRole, StaffMember } from '../landing/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TextInputField } from '@/components/ui/form-controls';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StaffPanelProps {
  staffList: StaffMember[];
  currentStaffId: string;
  isLoading?: boolean;
  onAddStaff: () => void;
  onEditStaff: (staff: StaffMember) => void;
  onToggleStatus: (staff: StaffMember) => void;
  onResetPassword: (staffId: string, newPassword: string) => Promise<boolean>;
  onDeleteStaff: (staff: StaffMember) => void;
}

function getRoleBadgeVariant(role: AdminRole): 'default' | 'dark' | 'secondary' {
  if (role === 'SUPER_ADMIN') return 'default';
  if (role === 'ADMIN') return 'dark';
  return 'secondary';
}

function formatDateID(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const StaffPanel: React.FC<StaffPanelProps> = ({
  staffList,
  currentStaffId,
  isLoading,
  onAddStaff,
  onEditStaff,
  onToggleStatus,
  onResetPassword,
  onDeleteStaff,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const stats = useMemo(() => {
    let activeCount = 0;
    let superAdminCount = 0;
    let adminCount = 0;
    let petugasCount = 0;
    for (const s of staffList) {
      if (s.isActive) activeCount++;
      if (s.role === 'SUPER_ADMIN') superAdminCount++;
      else if (s.role === 'ADMIN') adminCount++;
      else if (s.role === 'PETUGAS') petugasCount++;
    }
    return {
      total: staffList.length,
      activeCount,
      superAdminCount,
      adminCount,
      petugasCount,
    };
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffList.filter((s) => {
      const matchRole = roleFilter === 'ALL' || s.role === roleFilter;
      const matchQuery =
        !q ||
        s.username.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [staffList, roleFilter, search]);

  const handleOpenResetModal = (staff: StaffMember) => {
    setResetTarget(staff);
    setNewPasswordInput('');
    setResetError('');
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    if (newPasswordInput.length < 6) {
      setResetError('Kata sandi baru minimal harus 6 karakter.');
      return;
    }
    setIsResetting(true);
    setResetError('');
    try {
      const ok = await onResetPassword(resetTarget.id, newPasswordInput);
      if (ok) {
        setResetTarget(null);
        setNewPasswordInput('');
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card>
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-card-foreground tracking-tight m-0">
              Manajemen Akun Staf &amp; Kontrol Akses (RBAC)
            </h2>
            <p className="text-xs text-muted-foreground mt-1 m-0 leading-relaxed">
              Kelola akun Petugas Gate, Administrator Operasional, dan Super Admin secara terpusat dengan jejak audit.
            </p>
          </div>
          <Button type="button" onClick={onAddStaff} className="shrink-0">
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            <span>Tambah Staf Baru</span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Total Akun Staf
          </span>
          <span className="font-display text-3xl font-extrabold text-foreground tabular-nums block mt-1">
            {stats.total}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Status Akun Aktif
          </span>
          <span className="font-display text-3xl font-extrabold text-[#156E3F] dark:text-[#D4FF2A] tabular-nums block mt-1">
            {stats.activeCount}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Komposisi Peran
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono tabular-nums">
            <span className="px-2 py-0.5 border border-border bg-background font-semibold">
              SA: {stats.superAdminCount}
            </span>
            <span className="px-2 py-0.5 border border-border bg-background font-semibold">
              ADM: {stats.adminCount}
            </span>
            <span className="px-2 py-0.5 border border-border bg-background font-semibold">
              PTG: {stats.petugasCount}
            </span>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              strokeWidth={1.7}
              className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="text"
              aria-label="Cari username, nama, atau email staf"
              placeholder="Cari username, nama lengkap, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger aria-label="Filter peran staf" className="sm:w-52">
              <SelectValue placeholder="Semua Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Peran</SelectItem>
              <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
              <SelectItem value="PETUGAS">PETUGAS</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && staffList.length === 0 ? (
        <Card className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      ) : filteredStaff.length === 0 ? (
        <Card className="border-dashed border-border-strong">
          <CardContent className="p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-none border border-border bg-background flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground m-0">
              {staffList.length === 0 ? 'Belum Ada Akun Staf' : 'Staf Tidak Ditemukan'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-5 max-w-md">
              {staffList.length === 0
                ? 'Tambahkan akun administrator atau petugas gate baru untuk membagi tugas operasional konser.'
                : 'Tidak ada akun staf yang cocok dengan kata kunci pencarian atau filter peran saat ini.'}
            </p>
            {staffList.length === 0 && (
              <Button type="button" onClick={onAddStaff}>
                <Plus size={16} aria-hidden="true" />
                <span>Tambah Staf Pertama</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Username</TableHead>
                  <TableHead>Nama &amp; Email</TableHead>
                  <TableHead>Peran (RBAC)</TableHead>
                  <TableHead>Status Akun</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead className="text-right">Aksi Super Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => {
                  const isSelf = staff.id === currentStaffId;
                  return (
                    <TableRow key={staff.id}>
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>@{staff.username}</span>
                          {isSelf && (
                            <Badge variant="outline" className="text-[10px]">
                              Anda
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="block font-medium text-sm text-foreground">{staff.name}</span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{staff.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(staff.role)} className="font-mono text-[10px]">
                          <ShieldCheck size={11} aria-hidden="true" />
                          <span>{staff.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={staff.isActive ? 'success' : 'destructive'} className="font-mono text-[10px]">
                          {staff.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground tabular-nums">
                        {formatDateID(staff.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onEditStaff(staff)}
                            title="Edit Staf & Peran"
                            aria-label={`Edit akun ${staff.username}`}
                          >
                            <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => handleOpenResetModal(staff)}
                            title="Reset Kata Sandi"
                            aria-label={`Reset kata sandi ${staff.username}`}
                          >
                            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            disabled={isSelf}
                            onClick={() => onToggleStatus(staff)}
                            title={
                              isSelf
                                ? 'Tidak dapat menonaktifkan akun Anda sendiri'
                                : staff.isActive
                                ? 'Nonaktifkan Akun'
                                : 'Aktifkan Akun'
                            }
                            aria-label={
                              staff.isActive
                                ? `Nonaktifkan ${staff.username}`
                                : `Aktifkan ${staff.username}`
                            }
                          >
                            <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            disabled={isSelf}
                            onClick={() => onDeleteStaff(staff)}
                            title={isSelf ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus Staf'}
                            aria-label={`Hapus ${staff.username}`}
                            className="text-[#C81E1E] hover:bg-[#C81E1E] hover:text-white hover:border-[#C81E1E]"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredStaff.map((staff) => {
              const isSelf = staff.id === currentStaffId;
              return (
                <Card key={staff.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-foreground truncate">
                          @{staff.username}
                        </span>
                        {isSelf && (
                          <Badge variant="outline" className="text-[10px]">
                            Anda
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-0.5 mb-0 truncate">
                        {staff.name}
                      </p>
                      <p className="text-xs text-muted-foreground m-0 truncate">{staff.email}</p>
                    </div>
                    <Badge variant={staff.isActive ? 'success' : 'destructive'} className="font-mono text-[10px] shrink-0">
                      {staff.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant={getRoleBadgeVariant(staff.role)} className="font-mono text-[10px]">
                      {staff.role}
                    </Badge>
                    <span className="font-mono text-muted-foreground tabular-nums">
                      Terdaftar {formatDateID(staff.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onEditStaff(staff)}
                      className="min-h-[44px]"
                    >
                      <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenResetModal(staff)}
                      className="min-h-[44px]"
                    >
                      <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Reset Sandi</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isSelf}
                      onClick={() => onToggleStatus(staff)}
                      className="min-h-[44px]"
                    >
                      <Power className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{staff.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isSelf}
                      onClick={() => onDeleteStaff(staff)}
                      className="min-h-[44px] text-[#C81E1E]"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Hapus</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Dialog
        open={Boolean(resetTarget)}
        onOpenChange={(open) => {
          if (!open) setResetTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Kata Sandi Staf</DialogTitle>
            <DialogDescription>
              Tetapkan kata sandi baru untuk akun <strong>@{resetTarget?.username}</strong> ({resetTarget?.name}).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmResetPassword} className="space-y-4">
            <TextInputField
              theme="auto"
              label="Kata Sandi Baru"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={newPasswordInput}
              error={resetError}
              onValueChange={setNewPasswordInput}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>
                Batal
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
