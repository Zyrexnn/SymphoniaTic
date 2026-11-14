import React from 'react';
import { Search, Download, User, Ticket, Calendar, QrCode } from 'lucide-react';
import type { OrderRecord } from '../landing/data';
import { formatIDR } from '../landing/data';
import { StatusBadge } from './ui';

interface OrdersPanelProps {
  orders: OrderRecord[];
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onExportCSV: () => void;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({
  orders, search, statusFilter, onSearchChange, onStatusFilterChange,
  onUpdateStatus, onExportCSV,
}) => (
  <div className="flex flex-col gap-6 pb-12">
    <div className="border border-[#272A38] bg-[#14161F] p-4 sm:p-5 rounded-xl shadow-xl flex justify-between items-center gap-4 flex-wrap">
      <div className="flex gap-3 items-center flex-1 min-w-[240px] flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} strokeWidth={1.5} className="text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode pesanan, nama, email..."
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
          <option value="ISSUED" className="bg-[#14161F]">ISSUED</option>
          <option value="CHECKED_IN" className="bg-[#14161F]">CHECKED_IN</option>
          <option value="REFUNDED" className="bg-[#14161F]">REFUNDED</option>
          <option value="CANCELLED" className="bg-[#14161F]">CANCELLED</option>
        </select>
      </div>
      <button
        onClick={onExportCSV}
        className="px-4 py-2 text-xs font-medium text-white bg-[#0C0D12] hover:bg-[#1D202D] border border-[#272A38] hover:border-white/40 rounded-lg transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap active:scale-95 shadow-sm"
      >
        <Download size={14} strokeWidth={1.5} />
        <span>Ekspor CSV</span>
      </button>
    </div>

    <div className="hidden md:block border border-[#272A38] bg-[#14161F] rounded-xl overflow-hidden shadow-xl">
      <table className="w-full border-collapse text-xs font-normal text-left">
        <thead>
          <tr className="border-b border-[#272A38] bg-[#0C0D12]/50">
            <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Kode Order</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Konser & Kategori</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Pemegang Tiket</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Jumlah</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Total Bayar</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase">Status</th>
            <th className="px-5 py-3.5 text-[10px] font-semibold text-[#94A3B8] tracking-widest uppercase text-right">Update Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#272A38]">
          {orders.length > 0 ? (
            orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-[#0C0D12]/40 transition-colors">
                <td className="px-5 py-4 font-mono text-white font-semibold">{ord.orderCode}</td>
                <td className="px-5 py-4">
                  <span className="text-[#F4F4F6] block font-medium">{ord.eventTitle}</span>
                  <span className="text-[11px] text-[#A1A1AA] block mt-0.5">{ord.categoryName}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-[#F4F4F6] block font-medium">{ord.userName}</span>
                  <span className="text-[11px] text-[#A1A1AA] block mt-0.5">{ord.userEmail}</span>
                </td>
                <td className="px-5 py-4 text-[#A1A1AA]">{ord.quantity}x Tiket</td>
                <td className="px-5 py-4 font-mono text-white font-semibold">{formatIDR(ord.totalPrice)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={ord.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <select
                    value={ord.status}
                    onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                    className="bg-[#0C0D12] border border-[#272A38] rounded px-2.5 py-1 text-xs text-white outline-none cursor-pointer focus:border-white"
                  >
                    <option value="ISSUED" className="bg-[#14161F]">ISSUED</option>
                    <option value="CHECKED_IN" className="bg-[#14161F]">CHECKED_IN</option>
                    <option value="REFUNDED" className="bg-[#14161F]">REFUNDED</option>
                    <option value="CANCELLED" className="bg-[#14161F]">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-12 text-[#A1A1AA] text-xs font-normal">
                Tidak ada data pesanan yang cocok dengan kriteria pencarian.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="block md:hidden space-y-4">
      {orders.length > 0 ? (
        orders.map((ord) => (
          <div key={ord.id} className="border border-[#272A38] bg-[#14161F] p-4 space-y-3 rounded-xl shadow-md">
            <div className="flex justify-between items-center border-b border-[#272A38] pb-2">
              <span className="text-xs font-mono font-semibold text-white">{ord.orderCode}</span>
              <StatusBadge status={ord.status} />
            </div>

            <div>
              <h4 className="text-xs font-medium text-[#F4F4F6] m-0">{ord.eventTitle}</h4>
              <p className="text-[11px] text-[#A1A1AA] mt-0.5 m-0">{ord.categoryName} &bull; {ord.quantity}x Tiket</p>
            </div>

            <div className="flex justify-between items-center text-xs text-[#A1A1AA] pt-1">
              <div>
                <span className="text-[#F4F4F6] block font-medium">{ord.userName}</span>
                <span className="text-[10px] text-[#71717A]">{ord.userEmail}</span>
              </div>
              <span className="font-mono text-xs text-white font-semibold">{formatIDR(ord.totalPrice)}</span>
            </div>

            <div className="pt-2 border-t border-[#272A38] flex justify-between items-center">
              <span className="text-[10px] uppercase text-[#94A3B8] font-medium">Ubah Status:</span>
              <select
                value={ord.status}
                onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                className="bg-[#0C0D12] border border-[#272A38] rounded px-2 py-1 text-xs text-[#F4F4F6] outline-none cursor-pointer"
              >
                <option value="ISSUED" className="bg-[#14161F]">ISSUED</option>
                <option value="CHECKED_IN" className="bg-[#14161F]">CHECKED_IN</option>
                <option value="REFUNDED" className="bg-[#14161F]">REFUNDED</option>
                <option value="CANCELLED" className="bg-[#14161F]">CANCELLED</option>
              </select>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 text-[#94A3B8] text-xs font-normal border border-[#272A38] bg-[#14161F] rounded-xl">
          Tidak ada data pesanan yang cocok.
        </div>
      )}
    </div>
  </div>
);
