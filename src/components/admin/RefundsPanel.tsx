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
      {/* Top Filter Bar */}
      <div className="border border-white/[0.08] bg-[#1a1a1a]/90 p-4 sm:p-5 backdrop-blur-md flex justify-between items-center gap-4 flex-wrap">
        <div className="flex gap-3 items-center flex-1 min-w-[240px] flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} strokeWidth={1.25} className="text-[#9a9a9a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode pesanan, email, bank, pemohon..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 pl-9 pr-3 py-2 text-xs font-light text-white outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none cursor-pointer"
          >
            <option value="" className="bg-[#171717]">Semua Status</option>
            <option value="PENDING" className="bg-[#171717]">PENDING</option>
            <option value="APPROVED" className="bg-[#171717]">APPROVED</option>
            <option value="REJECTED" className="bg-[#171717]">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border border-white/[0.08] bg-[#1a1a1a] overflow-hidden shadow-xl">
        <table className="w-full border-collapse text-xs font-light text-left">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Kode Order</th>
              <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Konser & Pemohon</th>
              <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Rekening Transfer</th>
              <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Alasan Refund</th>
              <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Nominal</th>
              <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Status</th>
              <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase text-right">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {refunds.length > 0 ? (
              refunds.map((rf) => (
                <tr key={rf.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 font-mono text-white font-normal">{rf.orderCode}</td>
                  <td className="px-5 py-4">
                    <span className="text-white block font-normal">{rf.eventTitle || '-'}</span>
                    <span className="text-[11px] text-[#9a9a9a] block mt-0.5">{rf.userName} ({rf.userEmail})</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-mono font-normal">{rf.bankName} - {rf.accountNumber}</span>
                      <button
                        onClick={() => copyAccount(rf.accountNumber, rf.id)}
                        className="p-1 text-[#9a9a9a] hover:text-white bg-transparent border-none cursor-pointer"
                        title="Salin No Rekening"
                      >
                        {copiedId === rf.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <span className="text-[11px] text-[#9a9a9a] block mt-0.5">a.n. {rf.accountHolder}</span>
                  </td>
                  <td className="px-5 py-4 text-[#9a9a9a] max-w-[200px] truncate" title={rf.reason}>
                    {rf.reason || '-'}
                  </td>
                  <td className="px-5 py-4 font-mono text-white font-normal">{formatIDR(rf.refundAmount)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={rf.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {rf.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                          className="px-3 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-colors"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                          className="px-3 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 cursor-pointer transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#7a7a7a]">Diproses</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#9a9a9a] text-xs font-light">
                  Tidak ada permohonan refund yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {refunds.length > 0 ? (
          refunds.map((rf) => (
            <div key={rf.id} className="border border-white/[0.08] bg-[#1a1a1a] p-4 space-y-3 shadow-md">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-2">
                <span className="text-xs font-mono font-normal text-white">{rf.orderCode}</span>
                <StatusBadge status={rf.status} />
              </div>

              <div>
                <h4 className="text-xs font-light text-white font-normal m-0">{rf.eventTitle || 'Konser'}</h4>
                <p className="text-[11px] text-[#9a9a9a] mt-0.5 m-0">{rf.userName} &bull; {rf.userEmail}</p>
              </div>

              <div className="border border-white/[0.05] bg-[#141414] p-3 text-xs">
                <span className="text-[9px] uppercase tracking-wider text-[#9a9a9a] block mb-1">Rekening Tujuan:</span>
                <div className="flex justify-between items-center text-white font-mono">
                  <span>{rf.bankName} - {rf.accountNumber}</span>
                  <button
                    onClick={() => copyAccount(rf.accountNumber, rf.id)}
                    className="p-1 text-[#9a9a9a] hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    {copiedId === rf.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <span className="text-[11px] text-[#9a9a9a] block mt-0.5">a.n. {rf.accountHolder}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-[#9a9a9a]">
                <span>Nominal: <strong className="text-white font-mono">{formatIDR(rf.refundAmount)}</strong></span>
              </div>

              {rf.status === 'PENDING' && (
                <div className="pt-2 border-t border-white/[0.08] flex gap-2">
                  <button
                    onClick={() => handleOpenActionModal(rf, 'APPROVED')}
                    className="flex-1 py-2 text-xs font-light bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(rf, 'REJECTED')}
                    className="flex-1 py-2 text-xs font-light bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-pointer"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-[#9a9a9a] text-xs font-light border border-white/[0.08] bg-[#1a1a1a]">
            Tidak ada permohonan refund tiket.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedRefund && modalAction && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-white/20 p-6 max-w-[480px] w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-light text-white m-0">
              Konfirmasi {modalAction === 'APPROVED' ? 'Persetujuan' : 'Penolakan'} Refund
            </h3>
            <p className="text-xs text-[#9a9a9a] leading-relaxed m-0">
              Anda akan memproses permohonan refund untuk Kode Pesanan <strong className="text-white font-mono">{selectedRefund.orderCode}</strong> sebesar <strong className="text-white font-mono">{formatIDR(selectedRefund.refundAmount)}</strong>.
            </p>

            <div>
              <label className="block text-xs text-[#9a9a9a] mb-1.5">Catatan Admin (Dikirim via Email / Status System):</label>
              <textarea
                rows={3}
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full bg-[#141414] border border-white/15 p-3 text-xs text-white outline-none resize-none font-light"
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
                className={`px-4 py-2 text-xs font-light cursor-pointer border ${
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
