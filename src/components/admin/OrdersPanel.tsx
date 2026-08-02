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
    {/* Filter & Action Bar */}
    <div className="border border-white/[0.08] bg-[#1a1a1a]/90 p-4 sm:p-5 backdrop-blur-md flex justify-between items-center gap-4 flex-wrap">
      <div className="flex gap-3 items-center flex-1 min-w-[240px] flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} strokeWidth={1.25} className="text-[#9a9a9a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode pesanan, nama, email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 pl-9 pr-3 py-2 text-xs font-light text-white placeholder-[#7a7a7a] outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="bg-[#141414] border border-white/10 px-3 py-2 text-xs font-light text-white outline-none cursor-pointer"
        >
          <option value="" className="bg-[#171717]">Semua Status</option>
          <option value="ISSUED" className="bg-[#171717]">ISSUED</option>
          <option value="CHECKED_IN" className="bg-[#171717]">CHECKED_IN</option>
          <option value="REFUNDED" className="bg-[#171717]">REFUNDED</option>
          <option value="CANCELLED" className="bg-[#171717]">CANCELLED</option>
        </select>
      </div>
      <button
        onClick={onExportCSV}
        className="px-4 py-2 text-xs font-light text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap active:scale-95"
      >
        <Download size={14} strokeWidth={1.25} />
        <span>Ekspor CSV</span>
      </button>
    </div>

    {/* Desktop View: Styled Table */}
    <div className="hidden md:block border border-white/[0.08] bg-[#1a1a1a] overflow-hidden shadow-xl">
      <table className="w-full border-collapse text-xs font-light text-left">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Kode Order</th>
            <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Konser & Kategori</th>
            <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Pemegang Tiket</th>
            <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Jumlah</th>
            <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Total Bayar</th>
            <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase">Status</th>
            <th className="px-5 py-3.5 text-[10px] font-light text-[#9a9a9a] tracking-widest uppercase text-right">Update Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {orders.length > 0 ? (
            orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 font-mono text-white font-normal">{ord.orderCode}</td>
                <td className="px-5 py-4">
                  <span className="text-white block font-normal">{ord.eventTitle}</span>
                  <span className="text-[11px] text-[#9a9a9a] block mt-0.5">{ord.categoryName}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-white block">{ord.userName}</span>
                  <span className="text-[11px] text-[#9a9a9a] block mt-0.5">{ord.userEmail}</span>
                </td>
                <td className="px-5 py-4 text-[#9a9a9a]">{ord.quantity}x Tiket</td>
                <td className="px-5 py-4 font-mono text-white font-normal">{formatIDR(ord.totalPrice)}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={ord.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <select
                    value={ord.status}
                    onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                    className="bg-[#141414] border border-white/10 px-2.5 py-1 text-xs font-light text-white outline-none cursor-pointer"
                  >
                    <option value="ISSUED" className="bg-[#171717]">ISSUED</option>
                    <option value="CHECKED_IN" className="bg-[#171717]">CHECKED_IN</option>
                    <option value="REFUNDED" className="bg-[#171717]">REFUNDED</option>
                    <option value="CANCELLED" className="bg-[#171717]">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-12 text-[#9a9a9a] text-xs font-light">
                Tidak ada data pesanan yang cocok dengan kriteria pencarian.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Mobile View: Cards Grid */}
    <div className="block md:hidden space-y-4">
      {orders.length > 0 ? (
        orders.map((ord) => (
          <div key={ord.id} className="border border-white/[0.08] bg-[#1a1a1a] p-4 space-y-3 shadow-md">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-2">
              <span className="text-xs font-mono font-normal text-white">{ord.orderCode}</span>
              <StatusBadge status={ord.status} />
            </div>

            <div>
              <h4 className="text-xs font-light text-white font-normal m-0">{ord.eventTitle}</h4>
              <p className="text-[11px] text-[#9a9a9a] mt-0.5 m-0">{ord.categoryName} &bull; {ord.quantity}x Tiket</p>
            </div>

            <div className="flex justify-between items-center text-xs text-[#9a9a9a] pt-1">
              <div>
                <span className="text-white block">{ord.userName}</span>
                <span className="text-[10px] text-[#9a9a9a]">{ord.userEmail}</span>
              </div>
              <span className="font-mono text-xs text-white font-normal">{formatIDR(ord.totalPrice)}</span>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-between items-center">
              <span className="text-[10px] uppercase text-[#9a9a9a]">Ubah Status:</span>
              <select
                value={ord.status}
                onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                className="bg-[#141414] border border-white/10 px-2 py-1 text-xs font-light text-white outline-none cursor-pointer"
              >
                <option value="ISSUED" className="bg-[#171717]">ISSUED</option>
                <option value="CHECKED_IN" className="bg-[#171717]">CHECKED_IN</option>
                <option value="REFUNDED" className="bg-[#171717]">REFUNDED</option>
                <option value="CANCELLED" className="bg-[#171717]">CANCELLED</option>
              </select>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10 text-[#9a9a9a] text-xs font-light border border-white/[0.08] bg-[#1a1a1a]">
          Tidak ada data pesanan yang cocok.
        </div>
      )}
    </div>
  </div>
);
