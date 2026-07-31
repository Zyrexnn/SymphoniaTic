import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

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
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUpdateStatus: (refundId: string, status: string, adminNote: string) => void;
}

export const RefundsPanel: React.FC<RefundsPanelProps> = ({
  refunds,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onUpdateStatus,
}) => {
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleOpenActionModal = (refund: RefundRecord, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRefund(refund);
    setModalAction(action);
    setAdminNoteInput(action === 'APPROVED' ? 'Pengajuan refund telah disetujui & dana dikembalikan.' : 'Pengajuan refund ditolak karena syarat dan ketentuan tidak terpenuhi.');
  };

  const handleConfirmAction = () => {
    if (selectedRefund && modalAction) {
      onUpdateStatus(selectedRefund.id, modalAction, adminNoteInput);
      setSelectedRefund(null);
      setModalAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter Bar */}
      <div className="border border-white/10 bg-[#171717] p-5 flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-2 items-center flex-1 min-w-[200px] flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} strokeWidth={1} className="text-[#9a9a9a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari Kode Pesanan, Email, Bank, Nama..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent border border-white/[0.1] pl-8 pr-2.5 py-2 text-[13px] font-light text-white outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-transparent border border-white/[0.1] px-2.5 py-2 text-[13px] font-light text-white cursor-pointer"
          >
            <option value="" className="bg-[#171717] text-white">Semua Status</option>
            <option value="PENDING" className="bg-[#171717] text-white">PENDING</option>
            <option value="APPROVED" className="bg-[#171717] text-white">APPROVED</option>
            <option value="REJECTED" className="bg-[#171717] text-white">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/10 bg-[#171717] overflow-auto">
        <table className="w-full border-collapse text-[13px] font-light">
          <thead>
            <tr className="border-b border-white/10">
              {['Kode Pesanan', 'Konser & Pemegang', 'Rekening Tujuan Transfer', 'Alasan Refund', 'Nominal', 'Status', 'Aksi Admin'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-light text-[#9a9a9a] tracking-wider uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {refunds.length > 0 ? (
              refunds.map((rf) => (
                <tr key={rf.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[#9a9a9a] font-mono font-medium">{rf.orderCode}</td>
                  <td className="px-4 py-3">
                    <span className="text-white block font-medium">{rf.eventTitle || '-'}</span>
                    <span className="text-[11px] text-[#9a9a9a] block">{rf.userName} ({rf.userEmail})</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-amber-300 font-medium block">{rf.bankName} - {rf.accountNumber}</span>
                    <span className="text-[11px] text-[#9a9a9a] block">a.n. {rf.accountHolder}</span>
                  </td>
                  <td className="px-4 py-3 text-[#9a9a9a] max-w-[200px] truncate" title={rf.reason}>
                    {rf.reason || '-'}
                  </td>
                  <td className="px-4 py-3 text-white font-mono font-medium">{formatIDR(rf.refundAmount)}</td>
                  <td className="px-4 py-3">
                    {rf.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
                        <Clock size={12} />
                        <span>PENDING</span>
                      </span>
                    )}
                    {rf.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                        <CheckCircle size={12} />
                        <span>APPROVED</span>
                      </span>
                    )}
                    {rf.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 border border-red-500/20">
                        <XCircle size={12} />
                        <span>REJECTED</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {rf.status === 'PENDING' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                          className="px-2.5 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                          className="px-2.5 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 cursor-pointer"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#6a6a6a]">Selesai Diproses</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#9a9a9a] text-xs">
                  Tidak ada permohonan refund tiket saat ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selectedRefund && modalAction && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/20 p-6 max-w-[480px] w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-light text-white m-0">
              Konfirmasi {modalAction === 'APPROVED' ? 'Persetujuan' : 'Penolakan'} Refund Tiket
            </h3>
            <p className="text-xs text-[#9a9a9a] leading-relaxed">
              Anda akan memproses refund untuk Kode Pesanan <strong className="text-amber-400 font-mono">{selectedRefund.orderCode}</strong> sebesar <strong className="text-white font-mono">{formatIDR(selectedRefund.refundAmount)}</strong>.
            </p>

            <div>
              <label className="block text-xs text-[#9a9a9a] mb-1.5">Catatan Tambahan untuk Pembeli (Email Notifikasi):</label>
              <textarea
                rows={3}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/15 p-2.5 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRefund(null)}
                className="px-4 py-2 text-xs text-[#9a9a9a] hover:text-white bg-transparent border border-white/10 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-xs text-slate-950 font-medium cursor-pointer ${
                  modalAction === 'APPROVED' ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-red-400 hover:bg-red-300'
                }`}
              >
                Konfirmasi {modalAction === 'APPROVED' ? 'Setujui Refund' : 'Tolak Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
