import React, { useState, useId } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { formatIDR } from '../landing/data';
import { StatusBadge } from './ui';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { TextAreaField } from '@/components/ui/form-controls';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

export interface RefundRecord {
  id: string;
  orderId: string;
  orderCode: string;
  userEmail: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  reason: string;
  refundAmount: number;
  status: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  eventTitle?: string;
  categoryName?: string;
  quantity?: number;
  userName?: string;
}

interface RefundsPanelProps {
  refunds: RefundRecord[];
  isLoading?: boolean;
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUpdateStatus: (refundId: string, status: string, adminNote: string) => void;
}

export const RefundsPanel: React.FC<RefundsPanelProps> = ({
  refunds,
  isLoading,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onUpdateStatus,
}) => {
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const reviewFormId = useId();

  const handleOpenActionModal = (refund: RefundRecord, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRefund(refund);
    setModalAction(action);
    setAdminNoteInput(
      action === 'APPROVED'
        ? 'Pengajuan refund telah disetujui dan dana dikembalikan ke rekening Anda.'
        : 'Pengajuan refund ditolak karena tidak memenuhi syarat dan ketentuan.'
    );
  };

  const handleCloseAction = () => {
    setSelectedRefund(null);
    setModalAction(null);
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRefund && modalAction) {
      onUpdateStatus(selectedRefund.id, modalAction, adminNoteInput);
      handleCloseAction();
    }
  };

  const copyAccount = (acc: string, id: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
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
              aria-label="Cari kode pesanan, email, bank, atau pemohon"
              placeholder="Cari kode pesanan, email, bank, pemohon..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter || 'ALL'}
            onValueChange={(val) => onStatusFilterChange(val === 'ALL' ? '' : val)}
          >
            <SelectTrigger aria-label="Filter status refund" className="sm:w-48">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
              <SelectItem value="REJECTED">REJECTED</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && refunds.length === 0 ? (
        <Card className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Kode Order</TableHead>
                  <TableHead>Konser &amp; Pemohon</TableHead>
                  <TableHead>Rekening Transfer</TableHead>
                  <TableHead>Alasan Refund</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.length > 0 ? (
                  refunds.map((rf) => (
                    <TableRow key={rf.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {rf.orderCode}
                      </TableCell>
                      <TableCell>
                        <span className="block font-medium text-sm text-foreground">
                          {rf.eventTitle || '-'}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {rf.userName} ({rf.userEmail})
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-medium text-foreground">
                            {rf.bankName} - {rf.accountNumber}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => copyAccount(rf.accountNumber, rf.id)}
                            aria-label={`Salin nomor rekening ${rf.accountNumber}`}
                          >
                            {copiedId === rf.id ? (
                              <Check size={13} className="text-[#1F6E43] dark:text-emerald-400" aria-hidden="true" />
                            ) : (
                              <Copy size={13} aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          a.n. {rf.accountHolder}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-foreground max-w-[220px] truncate" title={rf.reason}>
                        {rf.reason || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold tabular-nums">
                        {formatIDR(rf.refundAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={rf.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {rf.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                              className="border-[#1F6E43]/35 bg-[#1F6E43]/10 text-[#1F6E43] hover:bg-[#1F6E43]/20 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300"
                            >
                              Setujui
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                              className="border-[#B91C1C]/35 bg-[#B91C1C]/10 text-[#B91C1C] hover:bg-[#B91C1C]/20 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-300"
                            >
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Diproses</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      {search || statusFilter
                        ? 'Tidak ada permohonan refund yang cocok dengan filter.'
                        : 'Belum ada permohonan refund tiket.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="block md:hidden space-y-4">
            {refunds.length > 0 ? (
              refunds.map((rf) => (
                <Card key={rf.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-center gap-2 border-b border-border pb-2.5">
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {rf.orderCode}
                    </span>
                    <StatusBadge status={rf.status} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground m-0">
                      {rf.eventTitle || 'Konser'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 m-0">
                      {rf.userName} &middot; {rf.userEmail}
                    </p>
                  </div>

                  <div className="border border-border bg-background rounded-lg p-3 text-xs space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
                      Rekening Tujuan
                    </span>
                    <div className="flex justify-between items-center text-foreground font-mono">
                      <span>
                        {rf.bankName} - {rf.accountNumber}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => copyAccount(rf.accountNumber, rf.id)}
                        aria-label={`Salin nomor rekening ${rf.accountNumber}`}
                      >
                        {copiedId === rf.id ? (
                          <Check size={14} className="text-[#1F6E43] dark:text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Copy size={14} aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground block">
                      a.n. {rf.accountHolder}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>
                      Nominal:{' '}
                      <strong className="text-foreground font-mono font-semibold tabular-nums">
                        {formatIDR(rf.refundAmount)}
                      </strong>
                    </span>
                  </div>

                  {rf.status === 'PENDING' && (
                    <div className="pt-2 border-t border-border flex gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                        className="flex-1 border-[#1F6E43]/35 bg-[#1F6E43]/10 text-[#1F6E43] hover:bg-[#1F6E43]/20 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        Setujui
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                        className="flex-1 border-[#B91C1C]/35 bg-[#B91C1C]/10 text-[#B91C1C] hover:bg-[#B91C1C]/20 dark:border-rose-500/35 dark:bg-rose-500/15 dark:text-rose-300"
                      >
                        Tolak
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <Card className="text-center py-10 px-4 text-muted-foreground text-sm">
                {search || statusFilter
                  ? 'Tidak ada permohonan refund yang cocok.'
                  : 'Belum ada permohonan refund tiket.'}
              </Card>
            )}
          </div>
        </>
      )}

      <FullscreenWorkspace
        isOpen={Boolean(selectedRefund && modalAction)}
        onClose={handleCloseAction}
        eyebrow="Tinjauan Permohonan Refund"
        title={
          modalAction === 'APPROVED'
            ? 'Konfirmasi Persetujuan Refund'
            : 'Konfirmasi Penolakan Refund'
        }
        subtitle={selectedRefund ? `Kode Pesanan ${selectedRefund.orderCode}` : undefined}
        maxWidthClass="max-w-2xl"
        backLabel="Kembali"
        theme="auto"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCloseAction}>
              Batal
            </Button>
            <Button
              type="submit"
              form={reviewFormId}
              variant={modalAction === 'APPROVED' ? 'default' : 'destructive'}
            >
              {modalAction === 'APPROVED'
                ? 'Konfirmasi Setujui Refund'
                : 'Konfirmasi Tolak Refund'}
            </Button>
          </div>
        }
      >
        {selectedRefund && modalAction && (
          <form id={reviewFormId} onSubmit={handleConfirmAction} className="space-y-6">
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Kode Pesanan</span>
                  <span className="font-mono text-foreground font-semibold">
                    {selectedRefund.orderCode}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Nominal Pengembalian</span>
                  <span className="font-mono text-foreground font-semibold tabular-nums">
                    {formatIDR(selectedRefund.refundAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Pemohon</span>
                  <span className="text-foreground">
                    {selectedRefund.userName || '-'} ({selectedRefund.userEmail})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Rekening Transfer</span>
                  <span className="font-mono text-foreground">
                    {selectedRefund.bankName} - {selectedRefund.accountNumber} (a.n.{' '}
                    {selectedRefund.accountHolder})
                  </span>
                </div>
              </div>

              {selectedRefund.reason && (
                <div className="pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground block mb-1.5">
                    Alasan Pemohon
                  </span>
                  <p className="text-sm text-foreground bg-background border border-border rounded-lg p-3.5 m-0 leading-relaxed">
                    {selectedRefund.reason}
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-5 sm:p-6">
              <TextAreaField
                theme="auto"
                label="Catatan Admin untuk Pemohon"
                required
                rows={4}
                value={adminNoteInput}
                onValueChange={setAdminNoteInput}
                hint="Catatan ini dikirimkan melalui email notifikasi serta tampil di status refund pemohon."
              />
            </Card>
          </form>
        )}
      </FullscreenWorkspace>
    </div>
  );
};
