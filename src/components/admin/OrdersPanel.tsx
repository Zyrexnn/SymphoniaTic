import React from 'react';
import { Search, Download } from 'lucide-react';
import type { OrderRecord } from '../landing/data';
import { formatIDR } from '../landing/data';

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
  <div className="flex flex-col gap-6">
    <div className="border border-white/10 bg-[#171717] p-5 flex justify-between items-center gap-4 flex-wrap">
      <div className="flex gap-2 items-center flex-1 min-w-[200px] flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} strokeWidth={1} className="text-[#9a9a9a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari Kode Pesanan, Nama, Email..."
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
          <option value="VERIFIED" className="bg-[#171717] text-white">VERIFIED</option>
          <option value="CHECKED_IN" className="bg-[#171717] text-white">CHECKED_IN</option>
          <option value="CANCELLED" className="bg-[#171717] text-white">CANCELLED</option>
        </select>
      </div>
      <button
        onClick={onExportCSV}
        className="px-4 py-2 text-[13px] font-light text-white border border-white bg-transparent cursor-pointer flex items-center gap-1.5 whitespace-nowrap hover:opacity-60"
      >
        <Download size={14} strokeWidth={1} />
        <span>Ekspor Laporan CSV</span>
      </button>
    </div>

    <div className="border border-white/10 bg-[#171717] overflow-auto">
      <table className="w-full border-collapse text-[13px] font-light">
        <thead>
          <tr className="border-b border-white/10">
            {['Kode Pesanan', 'Konser & Kategori', 'Pemegang Tiket', 'Jumlah', 'Total Bayar', 'Status', 'Aksi Update Status'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-light text-[#9a9a9a] tracking-wider uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((ord) => (
              <tr key={ord.id} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 text-[#9a9a9a] font-mono">{ord.orderCode}</td>
                <td className="px-4 py-3">
                  <span className="text-white block">{ord.eventTitle}</span>
                  <span className="text-[11px] text-[#9a9a9a] block">{ord.categoryName}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-white block">{ord.userName}</span>
                  <span className="text-[11px] text-[#9a9a9a] block">{ord.userEmail}</span>
                </td>
                <td className="px-4 py-3 text-[#9a9a9a]">{ord.quantity}x Tiket</td>
                <td className="px-4 py-3 text-white">{formatIDR(ord.totalPrice)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-light text-[#9a9a9a]">{ord.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={ord.status}
                    onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                    className="bg-transparent border border-white/[0.1] px-2 py-1.5 text-xs font-light text-white cursor-pointer"
                  >
                    <option value="VERIFIED" className="bg-[#171717] text-white">VERIFIED</option>
                    <option value="CHECKED_IN" className="bg-[#171717] text-white">CHECKED_IN</option>
                    <option value="CANCELLED" className="bg-[#171717] text-white">CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-12 text-[#9a9a9a] text-xs">
                Tidak ada data pesanan yang cocok dengan kriteria pencarian.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
