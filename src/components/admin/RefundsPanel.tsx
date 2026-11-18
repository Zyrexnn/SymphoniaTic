import React, { useState, useId } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { formatIDR } from '../landing/data';
import { StatusBadge } from './ui';
import { FullscreenWorkspace } from '@/components/ui/fullscreen-sheet';
import { fieldInputBase, TextAreaField } from '@/components/ui/form-controls';

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
      <div className="border border-[#272A38] bg-[#14161F] p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} strokeWidth={1.7} className="text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            aria-label="Cari kode pesanan, email, bank, atau pemohon"
            placeholder="Cari kode pesanan, email, bank, pemohon..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${fieldInputBase} pl-10`}
          />
        </div>
        <select
          aria-label="Filter status refund"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className={`${fieldInputBase} sm:w-48`}
        >
          <option value="" className="bg-[#14161F]">Semua Status</option>
          <option value="PENDING" className="bg-[#14161F]">PENDING</option>
          <option value="APPROVED" className="bg-[#14161F]">APPROVED</option>
          <option value="REJECTED" className="bg-[#14161F]">REJECTED</option>
        </select>
      </div>

      {isLoading && refunds.length === 0 ? (
        <div className="border border-[#272A38] bg-[#14161F] rounded-xl p-6 space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-[#1D202D] rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="hidden md:block border border-[#272A38] bg-[#14161F] rounded-xl overflow-x-auto">
            <table className="w-full border-collapse text-xs font-normal text-left">
              <thead>
                <tr className="border-b border-[#272A38] bg-[#0C0D12]">
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Kode Order</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Konser &amp; Pemohon</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Rekening Transfer</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Alasan Refund</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Nominal</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272A38]">
                {refunds.length > 0 ? (
                  refunds.map((rf) => (
                    <tr key={rf.id} className="hover:bg-[#0C0D12]/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-white font-semibold">{rf.orderCode}</td>
                      <td className="px-5 py-4">
                        <span className="text-[#F4F4F6] block font-medium text-sm">{rf.eventTitle || '-'}</span>
                        <span className="text-xs text-[#A1A1AA] block mt-0.5">{rf.userName} ({rf.userEmail})</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#F4F4F6] font-mono font-medium">{rf.bankName} - {rf.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyAccount(rf.accountNumber, rf.id)}
                            aria-label={`Salin nomor rekening ${rf.accountNumber}`}
                            className="h-8 w-8 inline-flex items-center justify-center text-[#A1A1AA] hover:text-white bg-transparent border border-transparent hover:border-[#3E4357] rounded"
                          >
                            {copiedId === rf.id ? <Check size={13} className="text-emerald-400" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                          </button>
                        </div>
                        <span className="text-xs text-[#A1A1AA] block mt-0.5">a.n. {rf.accountHolder}</span>
                      </td>
                      <td className="px-5 py-4 text-[#E4E4E7] max-w-[220px] truncate" title={rf.reason}>
                        {rf.reason || '-'}
                      </td>
                      <td className="px-5 py-4 font-mono text-white font-semibold">{formatIDR(rf.refundAmount)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={rf.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {rf.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                              className="min-h-[38px] px-3 py-1.5 text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 rounded-lg transition-colors"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                              className="min-h-[38px] px-3 py-1.5 text-xs font-medium bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 rounded-lg transition-colors"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#94A3B8]">Diproses</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#A1A1AA] text-sm">
                      {search || statusFilter
                        ? 'Tidak ada permohonan refund yang cocok dengan filter.'
                        : 'Belum ada permohonan refund tiket.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden space-y-4">
            {refunds.length > 0 ? (
              refunds.map((rf) => (
                <div key={rf.id} className="border border-[#272A38] bg-[#14161F] p-4 space-y-3 rounded-xl">
                  <div className="flex justify-between items-center gap-2 border-b border-[#272A38] pb-2.5">
                    <span className="text-xs font-mono font-semibold text-white">{rf.orderCode}</span>
                    <StatusBadge status={rf.status} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#F4F4F6] m-0">{rf.eventTitle || 'Konser'}</h3>
                    <p className="text-xs text-[#A1A1AA] mt-0.5 m-0">{rf.userName} &middot; {rf.userEmail}</p>
                  </div>

                  <div className="border border-[#272A38] bg-[#0C0D12] rounded-lg p-3 text-xs space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#94A3B8] block">Rekening Tujuan</span>
                    <div className="flex justify-between items-center text-[#F4F4F6] font-mono">
                      <span>{rf.bankName} - {rf.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyAccount(rf.accountNumber, rf.id)}
                        aria-label={`Salin nomor rekening ${rf.accountNumber}`}
                        className="h-9 w-9 inline-flex items-center justify-center text-[#A1A1AA] hover:text-white rounded"
                      >
                        {copiedId === rf.id ? <Check size={14} className="text-emerald-400" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                      </button>
                    </div>
                    <span className="text-xs text-[#A1A1AA] block">a.n. {rf.accountHolder}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-[#A1A1AA]">
                    <span>Nominal: <strong className="text-white font-mono font-semibold">{formatIDR(rf.refundAmount)}</strong></span>
                  </div>

                  {rf.status === 'PENDING' && (
                    <div className="pt-2 border-t border-[#272A38] flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                        className="flex-1 min-h-[44px] py-2 text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 rounded-lg hover:bg-emerald-500/25 transition-colors"
                      >
                        Setujui
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                        className="flex-1 min-h-[44px] py-2 text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/35 rounded-lg hover:bg-rose-500/25 transition-colors"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 text-[#A1A1AA] text-sm border border-[#272A38] bg-[#14161F] rounded-xl">
                {search || statusFilter
                  ? 'Tidak ada permohonan refund yang cocok.'
                  : 'Belum ada permohonan refund tiket.'}
              </div>
            )}
          </div>
        </>
      )}

      <FullscreenWorkspace
        isOpen={Boolean(selectedRefund && modalAction)}
        onClose={handleCloseAction}
        eyebrow="Tinjauan Permohonan Refund"
        title={modalAction === 'APPROVED' ? 'Konfirmasi Persetujuan Refund' : 'Konfirmasi Penolakan Refund'}
        subtitle={selectedRefund ? `Kode Pesanan ${selectedRefund.orderCode}` : undefined}
        maxWidthClass="max-w-2xl"
        backLabel="Kembali"
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseAction}
              className="min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#E4E4E7] hover:text-white bg-[#0C0D12] border border-[#3E4357] rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              form={reviewFormId}
              className={`min-h-[44px] px-6 py-2.5 text-sm font-semibold rounded-lg border transition-colors ${
                modalAction === 'APPROVED'
                  ? 'bg-white text-[#0C0D12] border-white hover:bg-neutral-200'
                  : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500'
              }`}
            >
              {modalAction === 'APPROVED' ? 'Konfirmasi Setujui Refund' : 'Konfirmasi Tolak Refund'}
            </button>
          </div>
        }
      >
        {selectedRefund && modalAction && (
          <form id={reviewFormId} onSubmit={handleConfirmAction} className="space-y-6">
            <div className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-[#94A3B8] block">Kode Pesanan</span>
                  <span className="font-mono text-white font-semibold">{selectedRefund.orderCode}</span>
                </div>
                <div>
                  <span className="text-xs text-[#94A3B8] block">Nominal Pengembalian</span>
                  <span className="font-mono text-white font-semibold">{formatIDR(selectedRefund.refundAmount)}</span>
                </div>
                <div>
                  <span className="text-xs text-[#94A3B8] block">Pemohon</span>
                  <span className="text-white">{selectedRefund.userName || '-'} ({selectedRefund.userEmail})</span>
                </div>
                <div>
                  <span className="text-xs text-[#94A3B8] block">Rekening Transfer</span>
                  <span className="font-mono text-white">
                    {selectedRefund.bankName} - {selectedRefund.accountNumber} (a.n. {selectedRefund.accountHolder})
                  </span>
                </div>
              </div>

              {selectedRefund.reason && (
                <div className="pt-3 border-t border-[#272A38]">
                  <span className="text-xs text-[#94A3B8] block mb-1">Alasan Pemohon</span>
                  <p className="text-sm text-[#E4E4E7] bg-[#0C0D12] border border-[#272A38] rounded-lg p-3.5 m-0 leading-relaxed">
                    {selectedRefund.reason}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#272A38] bg-[#14161F] p-5 sm:p-6">
              <TextAreaField
                label="Catatan Admin untuk Pemohon"
                required
                rows={4}
                value={adminNoteInput}
                onValueChange={setAdminNoteInput}
                hint="Catatan ini dikirimkan melalui email notifikasi serta tampil di status refund pemohon."
              />
            </div>
          </form>
        )}
      </FullscreenWorkspace>
    </div>
  );
};
