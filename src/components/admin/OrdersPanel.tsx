import React from 'react';
import { Search, Download, CheckCircle2, Lock } from 'lucide-react';
import type { AdminRole, OrderRecord } from '../landing/data';
import { formatIDR } from '../landing/data';
import { StatusBadge } from './ui';
import { fieldInputBase } from '@/components/ui/form-controls';

interface OrdersPanelProps {
  orders: OrderRecord[];
  role?: AdminRole;
  isLoading?: boolean;
  checkingInCode?: string | null;
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onManualCheckIn?: (order: OrderRecord) => void;
  onExportCSV: () => void;
}

const isCheckInEligible = (status: string): boolean => {
  const normalized = (status || '').toUpperCase().trim();
  return normalized === 'ISSUED' || normalized === 'VERIFIED' || normalized === 'REMINDED';
};

export const OrdersPanel: React.FC<OrdersPanelProps> = ({
  orders, role = 'ADMIN', isLoading, checkingInCode, search, statusFilter,
  onSearchChange, onStatusFilterChange, onUpdateStatus, onManualCheckIn, onExportCSV,
}) => {
  const isPetugas = role === 'PETUGAS';

  return (
  <div className="flex flex-col gap-6 pb-8">
    <div className="border border-[#272A38] bg-[#14161F] p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} strokeWidth={1.7} className="text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            aria-label="Cari kode pesanan, nama, atau email"
            placeholder="Cari kode pesanan, nama, email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${fieldInputBase} pl-10`}
          />
        </div>
        <select
          aria-label="Filter status pesanan"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className={`${fieldInputBase} sm:w-48`}
        >
          <option value="" className="bg-[#14161F]">Semua Status</option>
          <option value="ISSUED" className="bg-[#14161F]">ISSUED</option>
          <option value="CHECKED_IN" className="bg-[#14161F]">CHECKED_IN</option>
          <option value="REFUND_REQUESTED" className="bg-[#14161F]">REFUND_REQUESTED</option>
          <option value="REFUNDED" className="bg-[#14161F]">REFUNDED</option>
          <option value="CANCELLED" className="bg-[#14161F]">CANCELLED</option>
        </select>
      </div>
      {!isPetugas && (
        <button
          type="button"
          onClick={onExportCSV}
          className="min-h-[46px] px-4 py-2.5 text-sm font-medium text-white bg-[#0C0D12] hover:bg-[#1D202D] border border-[#3E4357] hover:border-white/60 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Download size={15} strokeWidth={1.7} aria-hidden="true" />
          <span>Ekspor CSV</span>
        </button>
      )}
    </div>

    {isLoading && orders.length === 0 ? (
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
                <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Konser &amp; Kategori</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Pemegang Tiket</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Jumlah</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Total Bayar</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-[#A1A1AA] tracking-wider uppercase text-right">
                  {isPetugas ? 'Aksi Gate' : 'Aksi & Status'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272A38]">
              {orders.length > 0 ? (
                orders.map((ord) => {
                  const canCheckIn = !!onManualCheckIn && isCheckInEligible(ord.status);
                  const isChecking = checkingInCode === ord.orderCode;

                  return (
                    <tr key={ord.id} className="hover:bg-[#0C0D12]/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-white font-semibold">{ord.orderCode}</td>
                      <td className="px-5 py-4">
                        <span className="text-[#F4F4F6] block font-medium text-sm">{ord.eventTitle}</span>
                        <span className="text-xs text-[#A1A1AA] block mt-0.5">{ord.categoryName}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[#F4F4F6] block font-medium">{ord.userName}</span>
                        <span className="text-xs text-[#A1A1AA] block mt-0.5">{ord.userEmail}</span>
                      </td>
                      <td className="px-5 py-4 text-[#E4E4E7]">{ord.quantity}x Tiket</td>
                      <td className="px-5 py-4 font-mono text-white font-semibold">{formatIDR(ord.totalPrice)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={ord.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {canCheckIn && (
                            <button
                              type="button"
                              onClick={() => onManualCheckIn(ord)}
                              disabled={isChecking}
                              aria-label={`Check-in manual tiket ${ord.orderCode}`}
                              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} aria-hidden="true" />
                              <span>{isChecking ? 'Memproses...' : 'Check-in Manual'}</span>
                            </button>
                          )}

                          {isPetugas ? (
                            !canCheckIn && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
                                <Lock size={12} aria-hidden="true" />
                                <span>{ord.status.toUpperCase() === 'CHECKED_IN' ? 'Sudah Masuk' : 'Read-Only'}</span>
                              </span>
                            )
                          ) : (
                            <select
                              aria-label={`Ubah status pesanan ${ord.orderCode}`}
                              value={ord.status}
                              onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                              className="min-h-[40px] bg-[#0C0D12] border border-[#3E4357] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-white"
                            >
                              <option value="ISSUED" className="bg-[#14161F]">ISSUED</option>
                              <option value="CHECKED_IN" className="bg-[#14161F]">CHECKED_IN</option>
                              <option value="REFUND_REQUESTED" className="bg-[#14161F]">REFUND_REQUESTED</option>
                              <option value="REFUNDED" className="bg-[#14161F]">REFUNDED</option>
                              <option value="CANCELLED" className="bg-[#14161F]">CANCELLED</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#A1A1AA] text-sm">
                    {search || statusFilter
                      ? 'Tidak ada pesanan yang cocok dengan filter pencarian.'
                      : 'Belum ada pesanan tiket yang masuk.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden space-y-4">
          {orders.length > 0 ? (
            orders.map((ord) => {
              const canCheckIn = !!onManualCheckIn && isCheckInEligible(ord.status);
              const isChecking = checkingInCode === ord.orderCode;

              return (
                <div key={ord.id} className="border border-[#272A38] bg-[#14161F] p-4 space-y-3 rounded-xl">
                  <div className="flex justify-between items-center gap-2 border-b border-[#272A38] pb-2.5">
                    <span className="text-xs font-mono font-semibold text-white">{ord.orderCode}</span>
                    <StatusBadge status={ord.status} />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#F4F4F6] m-0">{ord.eventTitle}</h3>
                    <p className="text-xs text-[#A1A1AA] mt-0.5 m-0">{ord.categoryName} &middot; {ord.quantity}x Tiket</p>
                  </div>

                  <div className="flex justify-between items-center gap-3 text-xs text-[#A1A1AA] pt-1">
                    <div className="min-w-0">
                      <span className="text-[#F4F4F6] block font-medium truncate">{ord.userName}</span>
                      <span className="text-xs text-[#94A3B8] block truncate">{ord.userEmail}</span>
                    </div>
                    <span className="font-mono text-sm text-white font-semibold shrink-0">{formatIDR(ord.totalPrice)}</span>
                  </div>

                  <div className="pt-3 border-t border-[#272A38] flex flex-wrap justify-between items-center gap-3">
                    {canCheckIn && (
                      <button
                        type="button"
                        onClick={() => onManualCheckIn(ord)}
                        disabled={isChecking}
                        aria-label={`Check-in manual tiket ${ord.orderCode}`}
                        className="min-h-[44px] flex-1 px-4 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={15} aria-hidden="true" />
                        <span>{isChecking ? 'Memproses...' : 'Check-in Manual'}</span>
                      </button>
                    )}

                    {isPetugas ? (
                      !canCheckIn && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <Lock size={13} aria-hidden="true" />
                          <span>
                            {ord.status.toUpperCase() === 'CHECKED_IN'
                              ? 'Tiket sudah masuk gate'
                              : 'Status read-only untuk petugas gate'}
                          </span>
                        </span>
                      )
                    ) : (
                      <div className="flex items-center justify-between gap-2 flex-1">
                        <label htmlFor={`mobile-status-${ord.id}`} className="text-xs text-[#A1A1AA] font-medium shrink-0">
                          Status:
                        </label>
                        <select
                          id={`mobile-status-${ord.id}`}
                          value={ord.status}
                          onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                          className="min-h-[44px] bg-[#0C0D12] border border-[#3E4357] rounded-lg px-3 py-2 text-xs text-[#F4F4F6] outline-none focus:border-white"
                        >
                          <option value="ISSUED" className="bg-[#14161F]">ISSUED</option>
                          <option value="CHECKED_IN" className="bg-[#14161F]">CHECKED_IN</option>
                          <option value="REFUND_REQUESTED" className="bg-[#14161F]">REFUND_REQUESTED</option>
                          <option value="REFUNDED" className="bg-[#14161F]">REFUNDED</option>
                          <option value="CANCELLED" className="bg-[#14161F]">CANCELLED</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 px-4 text-[#A1A1AA] text-sm border border-[#272A38] bg-[#14161F] rounded-xl">
              {search || statusFilter
                ? 'Tidak ada data pesanan yang cocok dengan filter.'
                : 'Belum ada pesanan tiket yang masuk.'}
            </div>
          )}
        </div>
      </>
    )}
  </div>
  );
};
