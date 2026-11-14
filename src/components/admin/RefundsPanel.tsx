import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, CreditCard, Copy, Check } from 'lucide-react';
import { formatIDR } from '../landing/data';
import { StatusBadge } from './ui';

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenActionModal = (refund: RefundRecord, action: 'APPROVED' | 'REJECTED') => {
    setSelectedRefund(refund);
    setModalAction(action);
    setAdminNoteInput(
      action === 'APPROVED'
        ? 'Pengajuan refund telah disetujui & dana dikembalikan ke rekening Anda.'
        : 'Pengajuan refund ditolak karena syarat dan ketentuan tidak fulfilled.'
    );
  };

  const handleConfirmAction = () => {
    if (selectedRefund && modalAction) {
      onUpdateStatus(selectedRefund.id, modalAction, adminNoteInput);
      setSelectedRefund(null);
      setModalAction(null);
    }
  };

  const copyAccount = (acc: string, id: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border border-[#272A38] bg-[#14161F] p-4 sm:p-5 rounded-xl shadow-xl flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-3 items-center flex-1 min-w-[240px] flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} strokeWidth={1.5} className="text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode pesanan, email, bank, pemohon..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg pl-9 pr-3 py-2 text-xs font-normal text-white placeholder-[#71717A] outline-none focus:border-white transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-[#0C0D12] border border-[#272A38] rounded-lg px-3 py-2 text-xs font-normal text-white outline-none cursor-pointer focus:border-white"
          >
            <option value="" className="bg-[#14161F]">Semua Status</option>
            <option value="PENDING" className="bg-[#14161F]">PENDING</option>
            <option value="APPROVED" className="bg-[#14161F]">APPROVED</option>
            <option value="REJECTED" className="bg-[#14161F]">REJECTED</option>
          </select>
        </div>
      </div>

      <div className="hidden md:block border border-[#272A38] bg-[#14161F] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full border-collapse text-xs font-normal text-left">
          <thead>
            <tr className="border-b border-[#272A38] bg-[#0C0D12]/50">
              <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Kode Order</th>
              <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Konser & Pemohon</th>
              <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Rekening Transfer</th>
              <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Alasan Refund</th>
              <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Nominal</th>
              <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Status</th>
              <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase text-right">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272A38]">
            {refunds.length > 0 ? (
              refunds.map((rf) => (
                <tr key={rf.id} className="hover:bg-[#0C0D12]/40 transition-colors">
                  <td className="px-5 py-4 font-mono text-white font-semibold">{rf.orderCode}</td>
                  <td className="px-5 py-4">
                    <span className="text-[#F4F4F6] block font-medium">{rf.eventTitle || '-'}</span>
                    <span className="text-[11px] text-[#A1A1AA] block mt-0.5">{rf.userName} ({rf.userEmail})</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#F4F4F6] font-mono font-medium">{rf.bankName} - {rf.accountNumber}</span>
                      <button
                        onClick={() => copyAccount(rf.accountNumber, rf.id)}
                        className="p-1 text-[#A1A1AA] hover:text-white bg-transparent border-none cursor-pointer"
                        title="Salin No Rekening"
                      >
                        {copiedId === rf.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <span className="text-[11px] text-[#A1A1AA] block mt-0.5">a.n. {rf.accountHolder}</span>
                  </td>
                  <td className="px-5 py-4 text-[#A1A1AA] max-w-[200px] truncate" title={rf.reason}>
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
                          onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                          className="px-3 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded cursor-pointer transition-colors"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                          className="px-3 py-1 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded cursor-pointer transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#64748B]">Diproses</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#94A3B8] text-xs font-normal">
                  Tidak ada permohonan refund yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden space-y-4">
        {refunds.length > 0 ? (
          refunds.map((rf) => (
            <div key={rf.id} className="border border-[#272A38] bg-[#14161F] p-4 space-y-3 rounded-xl shadow-md">
              <div className="flex justify-between items-center border-b border-[#272A38] pb-2">
                <span className="text-xs font-mono font-semibold text-white">{rf.orderCode}</span>
                <StatusBadge status={rf.status} />
              </div>

              <div>
                <h4 className="text-xs font-medium text-[#F4F4F6] m-0">{rf.eventTitle || 'Konser'}</h4>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5 m-0">{rf.userName} &bull; {rf.userEmail}</p>
              </div>

              <div className="border border-[#272A38] bg-[#0C0D12] rounded-lg p-3 text-xs">
                <span className="text-[9px] uppercase tracking-wider text-[#71717A] block mb-1">Rekening Tujuan:</span>
                <div className="flex justify-between items-center text-[#F4F4F6] font-mono">
                  <span>{rf.bankName} - {rf.accountNumber}</span>
                  <button
                    onClick={() => copyAccount(rf.accountNumber, rf.id)}
                    className="p-1 text-[#A1A1AA] hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    {copiedId === rf.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <span className="text-[11px] text-[#A1A1AA] block mt-0.5">a.n. {rf.accountHolder}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#A1A1AA]">
                <span>Nominal: <strong className="text-white font-mono font-semibold">{formatIDR(rf.refundAmount)}</strong></span>
              </div>

              {rf.status === 'PENDING' && (
                <div className="pt-2 border-t border-[#272A38] flex gap-2">
                  <button
                    onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                    className="flex-1 py-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg cursor-pointer hover:bg-emerald-500/20 transition-colors"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                    className="flex-1 py-2 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg cursor-pointer hover:bg-rose-500/20 transition-colors"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-[#94A3B8] text-xs font-normal border border-[#272A38] bg-[#14161F] rounded-xl">
            Tidak ada permohonan refund tiket.
          </div>
        )}
      </div>

      {selectedRefund && modalAction && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14161F] border border-[#272A38] rounded-2xl p-6 max-w-[480px] w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-[#F4F4F6] m-0">
              Konfirmasi {modalAction === 'APPROVED' ? 'Persetujuan' : 'Penolakan'} Refund
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed m-0">
              Anda akan memproses permohonan refund untuk Kode Pesanan <strong className="text-white font-mono">{selectedRefund.orderCode}</strong> sebesar <strong className="text-white font-mono">{formatIDR(selectedRefund.refundAmount)}</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Catatan Admin (Dikirim via Email / Status System):</label>
              <textarea
                rows={3}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full bg-[#0C0D12] border border-[#272A38] rounded-lg p-3 text-xs text-white outline-none resize-none font-normal focus:border-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedRefund(null)}
                className="px-4 py-2 text-xs text-[#94A3B8] hover:text-[#F4F4F6] bg-transparent border border-[#272A38] rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer border transition-colors ${
                  modalAction === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                Konfirmasi {modalAction === 'APPROVED' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
